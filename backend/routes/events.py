from flask import Blueprint, request, jsonify
from database import get_connection
from middleware.auth_middleware import token_required
import mysql.connector

events = Blueprint("events", __name__)


# -------------------------
# Test Route
# -------------------------
@events.route("/events", methods=["GET"])
def test():
    return "Events Route Working Successfully"


# -------------------------
# Add Event API (Protected)
# -------------------------
@events.route("/events/add", methods=["POST"])
@token_required
def add_event():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": False,
                "message": "No data received"
            }), 400

        event_name = data.get("event_name")
        description = data.get("description")
        category = data.get("category")
        event_date = data.get("event_date")
        event_time = data.get("event_time")
        venue = data.get("venue")
        ticket_price = data.get("ticket_price")
        available_seats = data.get("available_seats")

        if not event_name or not category or not event_date:
            return jsonify({
                "status": False,
                "message": "Event Name, Category and Date are required"
            }), 400

        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO events
        (event_name, description, category, event_date,
        event_time, venue, ticket_price, available_seats)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(sql, (
            event_name,
            description,
            category,
            event_date,
            event_time,
            venue,
            ticket_price,
            available_seats
        ))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "Event Added Successfully"
        }), 201

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


# -------------------------
# View All Events API
# -------------------------
@events.route("/events/all", methods=["GET"])
def get_all_events():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM events")
        events_list = cursor.fetchall()

        for event in events_list:

            if event.get("event_date"):
                event["event_date"] = str(event["event_date"])

            if event.get("event_time"):
                event["event_time"] = str(event["event_time"])

            if event.get("created_at"):
                event["created_at"] = str(event["created_at"])

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
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

# -------------------------
# View Single Event API
# -------------------------
@events.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM events WHERE id=%s",
            (event_id,)
        )

        event = cursor.fetchone()

        if not event:
            cursor.close()
            conn.close()

            return jsonify({
                "status": False,
                "message": "Event Not Found"
            }), 404

        # Convert Date & Time
        if event.get("event_date"):
            event["event_date"] = str(event["event_date"])

        if event.get("event_time"):
            event["event_time"] = str(event["event_time"])

        if event.get("created_at"):
            event["created_at"] = str(event["created_at"])

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "event": event
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


# -------------------------
# Update Event API (Protected)
# -------------------------
@events.route("/events/update/<int:event_id>", methods=["PUT"])
@token_required
def update_event(event_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": False,
                "message": "No data received"
            }), 400

        event_name = data.get("event_name")
        description = data.get("description")
        category = data.get("category")
        event_date = data.get("event_date")
        event_time = data.get("event_time")
        venue = data.get("venue")
        ticket_price = data.get("ticket_price")
        available_seats = data.get("available_seats")

        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE events
        SET
            event_name=%s,
            description=%s,
            category=%s,
            event_date=%s,
            event_time=%s,
            venue=%s,
            ticket_price=%s,
            available_seats=%s
        WHERE id=%s
        """

        cursor.execute(sql, (
            event_name,
            description,
            category,
            event_date,
            event_time,
            venue,
            ticket_price,
            available_seats,
            event_id
        ))

        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()

            return jsonify({
                "status": False,
                "message": "Event Not Found"
            }), 404

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "Event Updated Successfully"
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


# -------------------------
# Delete Event API (Protected)
# -------------------------
@events.route("/events/delete/<int:event_id>", methods=["DELETE"])
@token_required
def delete_event(event_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM events WHERE id=%s",
            (event_id,)
        )

        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()

            return jsonify({
                "status": False,
                "message": "Event Not Found"
            }), 404

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "Event Deleted Successfully"
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