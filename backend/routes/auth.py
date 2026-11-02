from flask import Blueprint, request, jsonify
from database import get_connection
from utils.jwt_helper import generate_token
import bcrypt
import mysql.connector

auth = Blueprint("auth", __name__)


# =====================================================
# TEST ROUTE
# =====================================================

@auth.route("/auth", methods=["GET"])
def test():
    return jsonify({
        "status": True,
        "message": "Auth Route Working Successfully"
    })


# =====================================================
# REGISTER API
# =====================================================

@auth.route("/register", methods=["POST"])
def register():

    try:

        data = request.get_json()

        # -------------------------
        # Check Data
        # -------------------------

        if not data:
            return jsonify({
                "status": False,
                "message": "No data received"
            }), 400

        # -------------------------
        # Get User Data
        # -------------------------

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        mobile = data.get("mobile")

        # -------------------------
        # Validation
        # -------------------------

        if not name or not email or not password or not mobile:
            return jsonify({
                "status": False,
                "message": "All fields are required"
            }), 400

        # -------------------------
        # Database Connection
        # -------------------------

        conn = get_connection()
        cursor = conn.cursor()

        # -------------------------
        # Check Email
        # -------------------------

        cursor.execute(
            "SELECT id FROM users WHERE email=%s",
            (email,)
        )

        user = cursor.fetchone()

        if user:

            cursor.close()
            conn.close()

            return jsonify({
                "status": False,
                "message": "Email already exists"
            }), 409

        # -------------------------
        # Password Hashing
        # -------------------------

        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # -------------------------
        # Insert User
        # -------------------------

        sql = """
        INSERT INTO users
        (name, email, password, mobile, role)
        VALUES
        (%s, %s, %s, %s, %s)
        """

        cursor.execute(
            sql,
            (
                name,
                email,
                hashed_password,
                mobile,
                "user"
            )
        )

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "status": True,
            "message": "User Registered Successfully"
        }), 201

    # -------------------------
    # MySQL Error
    # -------------------------

    except mysql.connector.Error as err:

        return jsonify({
            "status": False,
            "message": str(err)
        }), 500

    # -------------------------
    # General Error
    # -------------------------

    except Exception as e:

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500
# =====================================================
# LOGIN API
# =====================================================

@auth.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        # -------------------------
        # Check Data
        # -------------------------

        if not data:
            return jsonify({
                "status": False,
                "message": "No data received"
            }), 400

        # -------------------------
        # Get Login Data
        # -------------------------

        email = data.get("email")
        password = data.get("password")

        # -------------------------
        # Validation
        # -------------------------

        if not email or not password:
            return jsonify({
                "status": False,
                "message": "Email and Password are required"
            }), 400

        # -------------------------
        # Database Connection
        # -------------------------

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # -------------------------
        # Find User
        # -------------------------

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                password,
                mobile,
                role
            FROM users
            WHERE email=%s
            """,
            (email,)
        )

        user = cursor.fetchone()

        # -------------------------
        # User Not Found
        # -------------------------

        if not user:

            cursor.close()
            conn.close()

            return jsonify({
                "status": False,
                "message": "User Not Found"
            }), 404

        # -------------------------
        # Password Check
        # -------------------------

        match = bcrypt.checkpw(
            password.encode("utf-8"),
            user["password"].encode("utf-8")
        )

        # -------------------------
        # Invalid Password
        # -------------------------

        if not match:

            cursor.close()
            conn.close()

            return jsonify({
                "status": False,
                "message": "Invalid Password"
            }), 401

        # -------------------------
        # Generate JWT Token
        # -------------------------

        token = generate_token(
            user["id"],
            user["email"],
            user["role"]
        )

        cursor.close()
        conn.close()

        # -------------------------
        # Login Success
        # -------------------------

        return jsonify({
            "status": True,
            "message": "Login Successful",

            "token": token,

            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }

        }), 200

    # -------------------------
    # MySQL Error
    # -------------------------

    except mysql.connector.Error as err:

        return jsonify({
            "status": False,
            "message": str(err)
        }), 500

    # -------------------------
    # General Error
    # -------------------------

    except Exception as e:

        return jsonify({
            "status": False,
            "message": str(e)
        }), 500