from flask import Flask, jsonify
from flask_cors import CORS

from config import SECRET_KEY
from routes.auth import auth
from routes.events import events
from routes.bookings import bookings
from routes.admin import admin


app = Flask(__name__)


# =========================================================
# App Configuration
# =========================================================

app.config["SECRET_KEY"] = SECRET_KEY


# =========================================================
# CORS Configuration
# =========================================================

CORS(
    app,
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)


# =========================================================
# Register Blueprints
# =========================================================

app.register_blueprint(auth)
app.register_blueprint(events)
app.register_blueprint(bookings)
app.register_blueprint(admin)


# =========================================================
# Home Route
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": True,
        "message": "Event Management System API Running Successfully 🚀"
    })


# =========================================================
# Health Check
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "OK",
        "server": "Running"
    })


# =========================================================
# Run Application
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )