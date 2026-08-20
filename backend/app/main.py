from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import create_db_and_tables, engine
from app.routers import auth, employees, dashboard, attendance, settings, projects, leave, salary, departments, documents
from app.routers import employee_portal
from contextlib import asynccontextmanager
from datetime import datetime
from sqlmodel import Session, select
from app.models import Employee, Activity, Project, ProjectMember, User
from app.auth_utils import get_password_hash


def _migrate_user_table():
    """Add new columns to existing User table if missing (SQLite ALTER TABLE)."""
    import sqlite3
    from app.config import settings as cfg
    db_url = cfg.get_database_url
    if not db_url.startswith("sqlite"):
        return
    db_path = db_url.replace("sqlite:///", "")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(user)")
    columns = [row[1] for row in cursor.fetchall()]
    if "role" not in columns:
        cursor.execute("ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'employer'")
    if "employee_id" not in columns:
        cursor.execute("ALTER TABLE user ADD COLUMN employee_id INTEGER")
        
    cursor.execute("PRAGMA table_info(employee)")
    emp_columns = [row[1] for row in cursor.fetchall()]
    if "profile_image_filename" not in emp_columns:
        cursor.execute("ALTER TABLE employee ADD COLUMN profile_image_filename TEXT")
        
    conn.commit()
    conn.close()


def seed_database():
    with Session(engine) as session:
        # System startup initialized cleanly with empty employee database
        pass

        # Seed projects if none exist
        project_exists = session.exec(select(Project)).first()
        if not project_exists:
            emp_list = session.exec(select(Employee)).all()
            emp_dict = {f"{e.first_name} {e.last_name}": e.id for e in emp_list}

            p1 = Project(
                name="Hash# HRMS v2.0 Platform",
                description="Next-gen AI powered employee management & intelligence suite with real-time telemetry.",
                status="active",
                client_name="Internal Innovation Lab",
                start_date="2026-06-01",
                due_date="2026-12-31",
                budget=250000.0
            )
            p2 = Project(
                name="Cloud Core Infrastructure Audit",
                description="Security review, microservices containerization, and zero-trust protocol implementation.",
                status="planning",
                client_name="Akiyam Systems Security",
                start_date="2026-08-01",
                due_date="2026-11-15",
                budget=120000.0
            )
            p3 = Project(
                name="Mobile Workforce App",
                description="Cross-platform iOS & Android employee portal for clock-ins, leave tracking, and task logs.",
                status="active",
                client_name="Global Enterprise Clients",
                start_date="2026-04-15",
                due_date="2026-09-30",
                budget=180000.0
            )

            session.add(p1)
            session.add(p2)
            session.add(p3)
            session.commit()
            session.refresh(p1)
            session.refresh(p2)
            session.refresh(p3)

            # Assign members
            if "Harshit Srivastava" in emp_dict:
                session.add(ProjectMember(project_id=p1.id, employee_id=emp_dict["Harshit Srivastava"], role_in_project="Lead System Architect"))
                session.add(ProjectMember(project_id=p2.id, employee_id=emp_dict["Harshit Srivastava"], role_in_project="Security Advisor"))
            if "Sarah Jenkins" in emp_dict:
                session.add(ProjectMember(project_id=p1.id, employee_id=emp_dict["Sarah Jenkins"], role_in_project="Lead Product Designer"))
                session.add(ProjectMember(project_id=p3.id, employee_id=emp_dict["Sarah Jenkins"], role_in_project="UX Designer"))
            if "Alex Rivera" in emp_dict:
                session.add(ProjectMember(project_id=p1.id, employee_id=emp_dict["Alex Rivera"], role_in_project="Backend Lead"))
                session.add(ProjectMember(project_id=p3.id, employee_id=emp_dict["Alex Rivera"], role_in_project="API Architect"))
            
            session.commit()

        # Seed demo employee user account (sarah.j@hash.in / employee123)
        sarah_emp = session.exec(select(Employee).where(Employee.email == "sarah.j@hash.in")).first()
        if sarah_emp:
            existing_user = session.exec(select(User).where(User.email == "sarah.j@hash.in")).first()
            if not existing_user:
                demo_employee_user = User(
                    email="sarah.j@hash.in",
                    password_hash=get_password_hash("employee123"),
                    first_name="Sarah",
                    last_name="Jenkins",
                    role="employee",
                    employee_id=sarah_emp.id
                )
                session.add(demo_employee_user)
                session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    _migrate_user_table()
    # seed_database()
    yield

app = FastAPI(
    title="Hash# Employee Management API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/api/v1/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(employees.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(employee_portal.router, prefix="/api/v1")
app.include_router(leave.router, prefix="/api/v1")
app.include_router(salary.router, prefix="/api/v1")
app.include_router(departments.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Hash# Employee Management Service Node Online"}
