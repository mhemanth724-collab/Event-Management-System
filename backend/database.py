
import mysql.connector
from config import DB_CONFIG


def get_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)

        if conn.is_connected():
            return conn

    except mysql.connector.Error as err:
        print("Database Connection Error:", err)
        raise
