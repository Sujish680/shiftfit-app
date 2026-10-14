"""
ShiftFit — Database connection test.
Verifies that all four ShiftFit tables exist in the public schema.

Usage:
    cd backend
    .venv/bin/python test_database_connection.py
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("ERROR: DATABASE_URL is not set.", file=sys.stderr)
    print("Create backend/.env with your Supabase Session Pooler connection string.", file=sys.stderr)
    sys.exit(1)

try:
    import psycopg
except ImportError:
    print("ERROR: psycopg is not installed. Run: pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

EXPECTED_TABLES = ["assessments", "classes", "study_blocks", "work_shifts"]

try:
    conn = psycopg.connect(database_url)
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_name = ANY(%s)
                ORDER BY table_name
                """,
                (EXPECTED_TABLES,),
            )
            found_tables = [row[0] for row in cur.fetchall()]
    conn.close()
except Exception as e:
    print(f"ERROR: Database connection failed: {e}", file=sys.stderr)
    sys.exit(1)

if found_tables == EXPECTED_TABLES:
    print(f"Database connection successful — verified tables: {', '.join(found_tables)}")
else:
    missing = set(EXPECTED_TABLES) - set(found_tables)
    print(f"ERROR: Missing tables: {', '.join(sorted(missing))}", file=sys.stderr)
    print(f"Found: {', '.join(found_tables) if found_tables else 'none'}", file=sys.stderr)
    sys.exit(1)