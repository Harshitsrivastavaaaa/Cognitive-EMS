import sqlite3

conn = sqlite3.connect('employees.db')
cursor = conn.cursor()

try:
    cursor.execute('ALTER TABLE salaryrecord ADD COLUMN pf_deduction FLOAT DEFAULT 0.0')
    print("Added pf_deduction column")
except Exception as e:
    print(e)

try:
    cursor.execute('ALTER TABLE salaryrecord ADD COLUMN tds_deduction FLOAT DEFAULT 0.0')
    print("Added tds_deduction column")
except Exception as e:
    print(e)

conn.commit()
conn.close()
