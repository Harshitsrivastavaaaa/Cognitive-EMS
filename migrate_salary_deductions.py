import sqlite3

def migrate():
    conn = sqlite3.connect('backend/employees.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE salaryrecord ADD COLUMN pf_deduction FLOAT DEFAULT 0.0;")
        print("Added pf_deduction column.")
    except sqlite3.OperationalError as e:
        print(f"Error adding pf_deduction (maybe already exists?): {e}")

    try:
        cursor.execute("ALTER TABLE salaryrecord ADD COLUMN tds_deduction FLOAT DEFAULT 0.0;")
        print("Added tds_deduction column.")
    except sqlite3.OperationalError as e:
        print(f"Error adding tds_deduction (maybe already exists?): {e}")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
