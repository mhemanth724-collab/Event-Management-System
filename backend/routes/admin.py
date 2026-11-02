from flask import Blueprint, jsonify
from database import get_connection
from middleware.auth_middleware import admin_required
import mysql.connector


admin = Blueprint("admin", __name__)


# =========================================================
# Admin Test Route
# =========================================================

@admin.route("/admin", methods=["GET"])
@admin_required
def test():

    return jsonify({
        "status": True,
        "message": "Admin Route Working Successfully"
    }), 200


# =========================================================
# View All Users
# =========================================================

@admin.route("/admin/users", methods=["GET"])
@admin_required
def get_all_users():

    try:

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                name,
                email,
                mobile,
                role
            FROM users
            ORDER BY id DESC
        """)

        users = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "Users Retrieved Successfully",
            "users": users
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


# =========================================================
# View All Events
# =========================================================

@admin.route("/admin/events", methods=["GET"])
@admin_required
def get_all_events():

    try:

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM events
            ORDER BY id DESC
        """)

        events_list = cursor.fetchall()

        # Convert date/time values into strings
        for event in events_list:

            if event.get("event_date"):
                event["event_date"] = str(
                    event["event_date"]
                )

            if event.get("event_time"):
                event["event_time"] = str(
                    event["event_time"]
                )

            # Only convert if column exists
            if event.get("created_at"):
                event["created_at"] = str(
                    event["created_at"]
                )

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "Events Retrieved Successfully",
            "events": events_list
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
# =========================================================
# View All Bookings
# =========================================================

@admin.route("/admin/bookings", methods=["GET"])
@admin_required
def get_all_bookings():

    try:

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM bookings
            ORDER BY id DESC
        """)

        bookings = cursor.fetchall()

        # Convert date/time values into strings
        for booking in bookings:

            if booking.get("booking_date"):
                booking["booking_date"] = str(
                    booking["booking_date"]
                )

            if booking.get("created_at"):
                booking["created_at"] = str(
                    booking["created_at"]
                )

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "Bookings Retrieved Successfully",
            "bookings": bookings
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


# =========================================================
# Admin Dashboard Statistics
# =========================================================

@admin.route("/admin/dashboard", methods=["GET"])
@admin_required
def dashboard_statistics():

    try:

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # -------------------------------------------------
        # 1. Total Users
        # -------------------------------------------------

        cursor.execute("""
            SELECT COUNT(*) AS total_users
            FROM users
        """)

        total_users = cursor.fetchone()["total_users"]


        # -------------------------------------------------
        # 2. Total Events
        # -------------------------------------------------

        cursor.execute("""
            SELECT COUNT(*) AS total_events
            FROM events
        """)

        total_events = cursor.fetchone()["total_events"]


        # -------------------------------------------------
        # 3. Total Bookings
        # -------------------------------------------------

        cursor.execute("""
            SELECT COUNT(*) AS total_bookings
            FROM bookings
        """)

        total_bookings = cursor.fetchone()["total_bookings"]


        # -------------------------------------------------
        # 4. Total Tickets
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                COALESCE(SUM(tickets), 0) AS total_tickets
            FROM bookings
        """)

        total_tickets = cursor.fetchone()["total_tickets"]


        # -------------------------------------------------
        # 5. Total Revenue
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                COALESCE(SUM(total_amount), 0)
                AS total_revenue
            FROM bookings
        """)

        total_revenue = cursor.fetchone()["total_revenue"]


        # -------------------------------------------------
        # 6. Available Seats
        # -------------------------------------------------

        cursor.execute("""
            SELECT
                COALESCE(SUM(available_seats), 0)
                AS available_seats
            FROM events
        """)

        available_seats = cursor.fetchone()["available_seats"]


        cursor.close()
        conn.close()


        # -------------------------------------------------
        # Dashboard Response
        # -------------------------------------------------

        return jsonify({

            "status": True,

            "message":
                "Dashboard Statistics Retrieved Successfully",

            "statistics": {

                "total_users": total_users,

                "total_events": total_events,

                "total_bookings": total_bookings,

                "total_tickets": int(total_tickets),

                "total_revenue": float(total_revenue),

                "available_seats": int(available_seats)

            }

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