from functools import wraps
from flask import request, jsonify
from utils.jwt_helper import verify_token


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        # Get Authorization Header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "status": False,
                "message": "Token is missing"
            }), 401

        # Check Bearer Token
        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != "Bearer":
            return jsonify({
                "status": False,
                "message": "Invalid Token Format"
            }), 401

        token = parts[1]

        # Verify Token
        payload = verify_token(token)

        if not payload:
            return jsonify({
                "status": False,
                "message": "Invalid or Expired Token"
            }), 401

        # Store User Information
        request.user = payload

        return f(*args, **kwargs)

    return decorated


# =====================================================
# ADMIN ONLY DECORATOR
# =====================================================

def admin_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        # First verify token
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "status": False,
                "message": "Token is missing"
            }), 401

        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != "Bearer":
            return jsonify({
                "status": False,
                "message": "Invalid Token Format"
            }), 401

        token = parts[1]

        # Verify JWT
        payload = verify_token(token)

        if not payload:
            return jsonify({
                "status": False,
                "message": "Invalid or Expired Token"
            }), 401

        # Check Role
        if payload.get("role") != "admin":
            return jsonify({
                "status": False,
                "message": "Admin Access Required"
            }), 403

        # Store user information
        request.user = payload

        return f(*args, **kwargs)

    return decorated