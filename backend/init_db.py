"""
Database Initialization Script
Creates the users table in Neon PostgreSQL database
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """Initialize the database with users table"""

    # Connect to Neon PostgreSQL
    conn = psycopg2.connect(os.getenv("NEON_DB_URL"))
    cursor = conn.cursor()

    print("Creating users table...")

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """)

    conn.commit()
    print("[OK] Users table created successfully")

    cursor.close()
    conn.close()
    print("[OK] Database initialized")

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        print(f"[ERROR] Failed to initialize database: {e}")
