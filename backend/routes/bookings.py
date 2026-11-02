from flask import Blueprint, request, jsonify
from database import get_connection
from middleware.auth_middleware import token_required
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

import mysql.connector
import razorpay
from decimal import Decimal
from datetime import datetime


bookings = Blueprint("bookings", __name__)


# ============================================================
# RAZORPAY CLIENT
# ============================================================

razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)


# ============================================================
# TEST ROUTE
# GET /bookings
# ============================================================

@bookings.route("/bookings", methods=["GET"])
def test():

    return jsonify({
        "status": True,
        "message": "Bookings Route Working Successfully"
    }), 200


# ============================================================
# CREATE RAZORPAY ORDER
# POST /bookings/create-order
# ============================================================

@bookings.route("/bookings/create-order", methods=["POST"])
@token_required
def create_order():

    conn = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": False,
                "message": "No data received"
            }), 400


        # ----------------------------------------------------
        # GET USER FROM JWT
        # ----------------------------------------------------

        user_id = request.user.get("user_id")

        if not user_id:

            return jsonify({
                "status": False,
                "message": "Invalid user information in token"
            }), 401


        # ----------------------------------------------------
        # REQUEST DATA
        # ----------------------------------------------------

        event_id = data.get("event_id")
        tickets = data.get("tickets")


        if not event_id or not tickets:

            return jsonify({
                "status": False,
                "message": "Event ID and Tickets are required"
            }), 400


        # ----------------------------------------------------
        # VALIDATE TICKETS
        # ----------------------------------------------------

        try:

            tickets = int(tickets)

        except (TypeError, ValueError):

            return jsonify({
                "status": False,
                "message": "Tickets must be a valid number"
            }), 400


        if tickets <= 0:

            return jsonify({
                "status": False,
                "message": "Tickets must be greater than 0"
            }), 400


        # ----------------------------------------------------
        # DATABASE CONNECTION
        # ----------------------------------------------------

        conn = get_connection()

        cursor = conn.cursor(dictionary=True)

        conn.start_transaction()


        # ----------------------------------------------------
        # LOCK EVENT ROW
        # Prevent Overbooking
        # ----------------------------------------------------

        cursor.execute("""
            SELECT
                id,
                event_name,
                ticket_price,
                available_seats
            FROM events
            WHERE id=%s
            FOR UPDATE
        """, (event_id,))


        event = cursor.fetchone()


        if not event:

            conn.rollback()

            return jsonify({
                "status": False,
                "message": "Event Not Found"
            }), 404


        # ----------------------------------------------------
        # CHECK SEATS
        # ----------------------------------------------------

        available_seats = int(
            event["available_seats"]
        )


        if available_seats < tickets:

            conn.rollback()

            return jsonify({
                "status": False,
                "message": "Not Enough Seats Available",
                "available_seats": available_seats
            }), 400


        # ----------------------------------------------------
        # CALCULATE TOTAL
        # ----------------------------------------------------

        ticket_price = Decimal(
            str(event["ticket_price"])
        )


        total_amount = ticket_price * tickets


        # Razorpay uses PAISA
        razorpay_amount = int(
            total_amount * 100
        )


        # ----------------------------------------------------
        # CREATE RAZORPAY ORDER
        # ----------------------------------------------------

        receipt = f"event_{event_id}_{user_id}_{int(datetime.now().timestamp())}"


        razorpay_order = razorpay_client.order.create({

            "amount": razorpay_amount,

            "currency": "INR",

            "receipt": receipt,

            "notes": {
                "user_id": str(user_id),
                "event_id": str(event_id),
                "tickets": str(tickets)
            }

        })


        razorpay_order_id = razorpay_order["id"]


        # ----------------------------------------------------
        # CREATE PENDING BOOKING
        # ----------------------------------------------------

        cursor.execute("""
            INSERT INTO bookings
            (
                user_id,
                event_id,
                tickets,
                total_amount,
                status,
                payment_status,
                razorpay_order_id
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """, (
            user_id,
            event_id,
            tickets,
            total_amount,
            "Payment Pending",
            "Pending",
            razorpay_order_id
        ))


        booking_id = cursor.lastrowid


        # ----------------------------------------------------
        # RESERVE SEATS
        # ----------------------------------------------------

        cursor.execute("""
            UPDATE events
            SET available_seats =
                available_seats - %s
            WHERE id=%s
        """, (
            tickets,
            event_id
        ))


        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        conn.commit()


        return jsonify({

            "status": True,

            "message": "Razorpay Order Created Successfully",

            "booking_id": booking_id,

            "order_id": razorpay_order_id,

            "amount": razorpay_amount,

            "currency": "INR",

            "key_id": RAZORPAY_KEY_ID,

            "event": {
                "id": event["id"],
                "name": event["event_name"],
                "tickets": tickets,
                "ticket_price": float(ticket_price),
                "total_amount": float(total_amount)
            }

        }), 201


    except razorpay.errors.BadRequestError as err:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": "Razorpay Order Creation Failed",
            "error": str(err)
        }), 400


    except mysql.connector.Error as err:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": str(err)
        }), 500


    except Exception as e:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ============================================================
# VERIFY RAZORPAY PAYMENT
# POST /bookings/verify-payment
# ============================================================

@bookings.route("/bookings/verify-payment", methods=["POST"])
@token_required
def verify_payment():

    conn = None
    cursor = None

    try:

        data = request.get_json()


        if not data:

            return jsonify({
                "status": False,
                "message": "No payment data received"
            }), 400


        # ----------------------------------------------------
        # GET USER FROM JWT
        # ----------------------------------------------------

        user_id = request.user.get("user_id")


        if not user_id:

            return jsonify({
                "status": False,
                "message": "Invalid user information in token"
            }), 401


        # ----------------------------------------------------
        # PAYMENT DATA
        # ----------------------------------------------------

        razorpay_order_id = data.get(
            "razorpay_order_id"
        )

        razorpay_payment_id = data.get(
            "razorpay_payment_id"
        )

        razorpay_signature = data.get(
            "razorpay_signature"
        )


        if not razorpay_order_id:
            return jsonify({
                "status": False,
                "message": "Razorpay Order ID is required"
            }), 400


        if not razorpay_payment_id:
            return jsonify({
                "status": False,
                "message": "Razorpay Payment ID is required"
            }), 400


        if not razorpay_signature:
            return jsonify({
                "status": False,
                "message": "Razorpay Signature is required"
            }), 400


        # ----------------------------------------------------
        # VERIFY SIGNATURE
        # ----------------------------------------------------

        try:

            razorpay_client.utility.verify_payment_signature({

                "razorpay_order_id":
                    razorpay_order_id,

                "razorpay_payment_id":
                    razorpay_payment_id,

                "razorpay_signature":
                    razorpay_signature

            })

        except razorpay.errors.SignatureVerificationError:

            return jsonify({
                "status": False,
                "message": "Payment Signature Verification Failed"
            }), 400


        # ----------------------------------------------------
        # DATABASE
        # ----------------------------------------------------

        conn = get_connection()

        cursor = conn.cursor(dictionary=True)

        conn.start_transaction()


        # ----------------------------------------------------
        # GET PENDING BOOKING
        # Only logged-in user's booking
        # ----------------------------------------------------

        cursor.execute("""
            SELECT
                id,
                user_id,
                event_id,
                tickets,
                total_amount,
                payment_status,
                status
            FROM bookings
            WHERE razorpay_order_id=%s
            AND user_id=%s
            FOR UPDATE
        """, (
            razorpay_order_id,
            user_id
        ))


        booking = cursor.fetchone()


        if not booking:

            conn.rollback()

            return jsonify({
                "status": False,
                "message": "Booking Not Found"
            }), 404


        # ----------------------------------------------------
        # PREVENT DUPLICATE VERIFICATION
        # ----------------------------------------------------

        if booking["payment_status"] == "Paid":

            conn.rollback()

            return jsonify({
                "status": True,
                "message": "Payment Already Verified",
                "booking_id": booking["id"]
            }), 200


        # ----------------------------------------------------
        # UPDATE PAYMENT
        # ----------------------------------------------------

        cursor.execute("""
            UPDATE bookings
            SET
                payment_status=%s,
                status=%s,
                razorpay_payment_id=%s,
                razorpay_signature=%s,
                paid_at=%s
            WHERE id=%s
            AND user_id=%s
        """, (
            "Paid",
            "Booked",
            razorpay_payment_id,
            razorpay_signature,
            datetime.now(),
            booking["id"],
            user_id
        ))


        conn.commit()


        return jsonify({

            "status": True,

            "message": "Payment Verified Successfully",

            "booking_id": booking["id"],

            "payment_status": "Paid",

            "booking_status": "Booked",

            "payment_id":
                razorpay_payment_id

        }), 200


    except mysql.connector.Error as err:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": str(err)
        }), 500


    except Exception as e:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ============================================================
# GET USER BOOKINGS
# GET /bookings/user/<user_id>
# ============================================================

@bookings.route(
    "/bookings/user/<int:user_id>",
    methods=["GET"]
)
@token_required
def get_user_bookings(user_id):

    conn = None
    cursor = None

    try:

        logged_user_id = request.user.get("user_id")


        if not logged_user_id:

            return jsonify({
                "status": False,
                "message": "Invalid user information in token"
            }), 401


        # ----------------------------------------------------
        # SECURITY
        # ----------------------------------------------------

        if int(logged_user_id) != int(user_id):

            return jsonify({
                "status": False,
                "message":
                    "You can only view your own bookings"
            }), 403


        conn = get_connection()

        cursor = conn.cursor(dictionary=True)


        cursor.execute("""
            SELECT
                b.id,
                b.user_id,
                b.event_id,
                e.event_name,
                e.event_date,
                e.event_time,
                e.venue,
                b.tickets,
                b.total_amount,
                b.booking_date,
                b.status,
                b.payment_status,
                b.razorpay_order_id,
                b.razorpay_payment_id,
                b.paid_at
            FROM bookings b
            JOIN events e
                ON b.event_id = e.id
            WHERE b.user_id=%s
            ORDER BY b.booking_date DESC
        """, (
            logged_user_id,
        ))


        bookings_list = cursor.fetchall()


        # ----------------------------------------------------
        # JSON SAFE VALUES
        # ----------------------------------------------------

        for booking in bookings_list:

            if booking.get("event_date"):

                booking["event_date"] = str(
                    booking["event_date"]
                )


            if booking.get("event_time"):

                booking["event_time"] = str(
                    booking["event_time"]
                )


            if booking.get("booking_date"):

                booking["booking_date"] = str(
                    booking["booking_date"]
                )


            if booking.get("paid_at"):

                booking["paid_at"] = str(
                    booking["paid_at"]
                )


            if booking.get("total_amount") is not None:

                booking["total_amount"] = float(
                    booking["total_amount"]
                )


        return jsonify({

            "status": True,

            "bookings": bookings_list

        }), 200


    except mysql.connector.Error as err:

        return jsonify({
            "status": False,
            "message": str(err)
        }), 500


    except Exception as e:

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# ============================================================
# CANCEL BOOKING
# DELETE /bookings/cancel/<booking_id>
# ============================================================

@bookings.route(
    "/bookings/cancel/<int:booking_id>",
    methods=["DELETE"]
)
@token_required
def cancel_booking(booking_id):

    conn = None
    cursor = None

    try:

        user_id = request.user.get("user_id")


        if not user_id:

            return jsonify({
                "status": False,
                "message":
                    "Invalid user information in token"
            }), 401


        conn = get_connection()

        cursor = conn.cursor(dictionary=True)

        conn.start_transaction()


        # ----------------------------------------------------
        # GET USER BOOKING
        # ----------------------------------------------------

        cursor.execute("""
            SELECT
                id,
                user_id,
                event_id,
                tickets,
                payment_status,
                status
            FROM bookings
            WHERE id=%s
            AND user_id=%s
            FOR UPDATE
        """, (
            booking_id,
            user_id
        ))


        booking = cursor.fetchone()


        if not booking:

            conn.rollback()

            return jsonify({
                "status": False,
                "message":
                    "Booking Not Found or Access Denied"
            }), 404


        # ----------------------------------------------------
        # RESTORE SEATS
        # ----------------------------------------------------

        cursor.execute("""
            UPDATE events
            SET available_seats =
                available_seats + %s
            WHERE id=%s
        """, (
            booking["tickets"],
            booking["event_id"]
        ))


        # ----------------------------------------------------
        # DELETE BOOKING
        # ----------------------------------------------------

        cursor.execute("""
            DELETE FROM bookings
            WHERE id=%s
            AND user_id=%s
        """, (
            booking_id,
            user_id
        ))


        conn.commit()


        return jsonify({

            "status": True,

            "message":
                "Booking Cancelled Successfully",

            "booking_id": booking_id

        }), 200


    except mysql.connector.Error as err:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": str(err)
        }), 500


    except Exception as e:

        if conn:
            conn.rollback()

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500


    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()