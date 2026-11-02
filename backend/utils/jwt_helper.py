import jwt
import datetime
from flask import current_app


# =====================================================
# Generate JWT Token
# =====================================================

def generate_token(user_id, email, role):

    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.datetime.utcnow()
        + datetime.timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return token


# =====================================================
# Verify JWT Token
# =====================================================

def verify_token(token):

    try:

        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )

        return payload

    except jwt.ExpiredSignatureError:

        return None

    except jwt.InvalidTokenError:

        return None