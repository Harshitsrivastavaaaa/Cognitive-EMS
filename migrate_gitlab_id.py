import sqlite3
import os

DB_PATH = os.path.join("backend", "employees.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE employee ADD COLUMN gitlab_id VARCHAR;")
        conn.commit()
        print("Successfully added gitlab_id to employee table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column gitlab_id already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
