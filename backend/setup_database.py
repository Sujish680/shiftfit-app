"""
ShiftFit — Database setup script.
Reads backend/sql/setup.sql and executes it against the Supabase PostgreSQL
database using the DATABASE_URL environment variable.

Usage:
    cd backend
    .venv/bin/python setup_database.py

Safe to run repeatedly (SQL uses IF NOT EXISTS and DO-block policy guards).
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory (same directory as this script)
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("ERROR: DATABASE_URL is not set.", file=sys.stderr)
    print("Create backend/.env with your Supabase Session Pooler connection string.", file=sys.stderr)
    sys.exit(1)

# Read the SQL setup file
sql_path = Path(__file__).parent / "sql" / "setup.sql"
if not sql_path.exists():
    print(f"ERROR: SQL file not found at {sql_path}", file=sys.stderr)
    sys.exit(1)

sql = sql_path.read_text(encoding="utf-8")

try:
    import psycopg
except ImportError:
    print("ERROR: psycopg is not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

try:
    conn = psycopg.connect(database_url)
    with conn:
        with conn.cursor() as cur:
            cur.execute(sql)
    conn.close()
except Exception as e:
    print(f"ERROR: Database connection or execution failed: {e}", file=sys.stderr)
    sys.exit(1)

print("Database initialization completed successfully.")