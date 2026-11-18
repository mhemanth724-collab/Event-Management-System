import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "event_management"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "ssl_ca": os.path.join(
        os.path.dirname(__file__),
        "certs",
        "isrgrootx1.pem"
    ),
    "ssl_verify_cert": True
}

SECRET_KEY = os.getenv("SECRET_KEY", "local-development-only-change-this")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

print("DATABASE HOST:", DB_CONFIG["host"])
print("DATABASE PORT:", DB_CONFIG["port"])