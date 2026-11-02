import os
from dotenv import load_dotenv

load_dotenv()


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "hemanth",
    "database": "event_management"
}


# ============================================================
# FLASK SECRET KEY
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "EventManagementSystem_SuperSecret_JWT_Key_2026_123456789"
)


# ============================================================
# RAZORPAY CONFIGURATION
# ============================================================

RAZORPAY_KEY_ID = os.getenv(
    "RAZORPAY_KEY_ID"
)

RAZORPAY_KEY_SECRET = os.getenv(
    "RAZORPAY_KEY_SECRET"
)