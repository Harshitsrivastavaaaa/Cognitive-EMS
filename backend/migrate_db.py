"""
Cognitive EMS - Database Migration Utility

This script connects to an existing SQLite database (employees.db)
and copies all existing tables and records into your target database (e.g. PostgreSQL).

Usage:
    cd backend
    python migrate_db.py
"""

import sys
import os
import sqlite3
from datetime import datetime

# Ensure app package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import engine, create_db_and_tables
from sqlmodel import Session
from app.models import (
    User, Employee, Department, Document, Activity, Attendance,
    UserSettings, Project, ProjectMember, LeaveRequest, SalaryRecord
)

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "employees.db")

def migrate_data():
    pg_url = settings.get_database_url
    if pg_url.startswith("sqlite"):
        print("[!] ERROR: Your DATABASE_URL in .env is currently set to SQLite.")
        print("    Please set DATABASE_URL to your PostgreSQL connection string in backend/.env before running this migration.")
        sys.exit(1)

    if not os.path.exists(SQLITE_PATH):
        print(f"[!] Warning: SQLite database file not found at '{SQLITE_PATH}'. Nothing to migrate.")
        print("[*] Initializing fresh tables in target database...")
        create_db_and_tables()
        print("[✓] Tables created successfully.")
        return

    print(f"[*] Connecting to SQLite database: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    print("[*] Creating target tables...")
    create_db_and_tables()

    with Session(engine) as pg_session:
        def copy_table(model_cls, table_name, datetime_fields=None, int_fields=None, float_fields=None):
            datetime_fields = datetime_fields or []
            int_fields = int_fields or []
            float_fields = float_fields or []

            try:
                sqlite_cursor.execute(f"SELECT * FROM {table_name}")
                rows = sqlite_cursor.fetchall()
            except sqlite3.OperationalError:
                print(f"  [-] Table '{table_name}' does not exist in SQLite, skipping.")
                return

            if not rows:
                print(f"  [-] Table '{table_name}' in SQLite is empty.")
                return

            count = 0
            for row in rows:
                row_dict = dict(row)
                
                # Parse datetime strings into datetime objects if needed
                for dt_field in datetime_fields:
                    val = row_dict.get(dt_field)
                    if isinstance(val, str) and val:
                        try:
                            if len(val) == 10:
                                row_dict[dt_field] = datetime.strptime(val, "%Y-%m-%d")
                            else:
                                row_dict[dt_field] = datetime.fromisoformat(val.replace("Z", "+00:00"))
                        except ValueError:
                            row_dict[dt_field] = None

                # Clean numeric fields
                for fld in float_fields:
                    val = row_dict.get(fld)
                    if val is not None:
                        try:
                            row_dict[fld] = float(val)
                        except (ValueError, TypeError):
                            row_dict[fld] = 0.0

                for fld in int_fields:
                    val = row_dict.get(fld)
                    if val is not None:
                        try:
                            row_dict[fld] = int(val)
                        except (ValueError, TypeError):
                            row_dict[fld] = None

                # Filter row_dict to match model attributes only
                valid_keys = set(model_cls.__fields__.keys())
                filtered_dict = {k: v for k, v in row_dict.items() if k in valid_keys}

                try:
                    obj = model_cls(**filtered_dict)
                    pg_session.merge(obj)
                    count += 1
                except Exception as e:
                    print(f"  [!] Warning: Failed to insert row into {table_name}: {e}")

            pg_session.commit()
            print(f"  [✓] Migrated {count} records into '{table_name}' table.")

        print("[*] Migrating tables...")
        copy_table(Department, "department")
        copy_table(Employee, "employee", datetime_fields=["hire_date"], float_fields=["salary", "performance_score"])
        copy_table(User, "user", int_fields=["employee_id"])
        copy_table(Document, "document", datetime_fields=["uploaded_at"], int_fields=["employee_id"])
        copy_table(Activity, "activity", datetime_fields=["timestamp"])
        copy_table(Attendance, "attendance", int_fields=["employee_id"])
        copy_table(UserSettings, "usersettings", int_fields=["user_id"])
        copy_table(Project, "project", datetime_fields=["created_at"], float_fields=["budget"])
        copy_table(ProjectMember, "projectmember", datetime_fields=["assigned_at"], int_fields=["project_id", "employee_id"])
        copy_table(LeaveRequest, "leaverequest", datetime_fields=["created_at"], int_fields=["employee_id"])
        copy_table(SalaryRecord, "salaryrecord", datetime_fields=["payment_date"], int_fields=["employee_id", "year"], float_fields=["amount", "pf_deduction", "tds_deduction"])

    sqlite_conn.close()
    print("\n[✓] Data migration complete! Your target database is up to date.")

if __name__ == "__main__":
    migrate_data()
