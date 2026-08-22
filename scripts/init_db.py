"""Create the chat_history table in Neon Postgres.

Reads NEON_DATABASE_URL from the repo-root .env, connects, and creates the
table if it does not already exist. Safe to re-run.

Usage (from the repo root):
    backend/.venv/Scripts/python.exe scripts/init_db.py
"""

import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from os import getenv

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = REPO_ROOT / ".env"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS chat_history (
    id            SERIAL PRIMARY KEY,
    session_id    TEXT NOT NULL,
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    source_chunks JSONB,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
"""


def main() -> int:
    if not ENV_PATH.exists():
        print(f"ERROR: no .env found at {ENV_PATH}", file=sys.stderr)
        return 1

    load_dotenv(ENV_PATH)
    database_url = getenv("NEON_DATABASE_URL")
    if not database_url:
        print("ERROR: NEON_DATABASE_URL is not set in .env", file=sys.stderr)
        return 1

    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(CREATE_TABLE_SQL)
            conn.commit()

            cur.execute(
                """
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'chat_history'
                ORDER BY ordinal_position;
                """
            )
            columns = cur.fetchall()

    if not columns:
        print("ERROR: chat_history was not found after creation", file=sys.stderr)
        return 1

    print("chat_history table exists with columns:")
    for name, data_type, nullable, default in columns:
        null_note = "NULL" if nullable == "YES" else "NOT NULL"
        default_note = f" DEFAULT {default}" if default else ""
        print(f"  {name:<14} {data_type:<26} {null_note}{default_note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
