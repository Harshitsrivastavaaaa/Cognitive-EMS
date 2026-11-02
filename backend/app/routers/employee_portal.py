from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlmodel import Session, select
from app.database import get_session
from app.models import (
    User, Employee, Attendance, Activity,
    ProjectMember, Project, EmployeeSelfUpdate,
    Document, DocumentRead
)
from app.routers.auth import get_current_user
from app.file_utils import checked_extension, save_upload, IMAGE_EXTENSIONS
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import uuid

router = APIRouter(prefix="/portal", tags=["employee-portal"])

UPLOAD_PROFILE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "profiles")
os.makedirs(UPLOAD_PROFILE_DIR, exist_ok=True)


def _require_employee(current_user: User, session: Session):
    """Verify the user is an employee and return their Employee record."""
    if current_user.role != "employee" or not current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to employees."
        )
    employee = session.get(Employee, current_user.employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee record not found."
        )
    return employee


# --- Profile Endpoints ---

@router.get("/me")
def get_my_profile(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)
    skills = [s.strip() for s in employee.skills_str.split(",") if s.strip()] if employee.skills_str else []
    return {
        "id": employee.id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "phone": employee.phone,
        "role": employee.role,
        "department": employee.department,
        "location": employee.location,
        "hire_date": employee.hire_date.isoformat() if employee.hire_date else None,
        "status": employee.status,
        "salary": employee.salary,
        "performance_score": employee.performance_score,
        "manager_name": employee.manager_name,
        "skills": skills,
        "cv_filename": employee.cv_filename,
        "profile_image_filename": employee.profile_image_filename
    }


@router.get("/documents")
def get_my_documents(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)
    documents = session.exec(select(Document).where(Document.employee_id == employee.id)).all()
    employee_name = f"{employee.first_name} {employee.last_name}"
    
    doc_reads = []
    for doc in documents:
        doc_read = DocumentRead.model_validate(doc)
        doc_read.employee_name = employee_name
        doc_reads.append(doc_read)
    return doc_reads


@router.post("/me/image")
def upload_profile_image(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)
    
    # Generate unique filename
    ext = checked_extension(file.filename, IMAGE_EXTENSIONS)
    unique_filename = f"emp_{employee.id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_PROFILE_DIR, unique_filename)

    save_upload(file, file_path, max_bytes=5 * 1024 * 1024)

    employee.profile_image_filename = f"profiles/{unique_filename}"
    session.add(employee)
    
    activity = Activity(
        description=f"{employee.first_name} {employee.last_name} updated their profile picture.",
        type="employee"
    )
    session.add(activity)
    session.commit()
    
    return {"detail": "Profile image uploaded successfully", "profile_image_filename": employee.profile_image_filename}


@router.put("/me")
def update_my_profile(
    payload: EmployeeSelfUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)

    if payload.phone is not None:
        employee.phone = payload.phone
    if payload.location is not None:
        employee.location = payload.location
    if payload.skills is not None:
        employee.skills_str = ", ".join(payload.skills)

    session.add(employee)
    session.commit()
    session.refresh(employee)

    skills = [s.strip() for s in employee.skills_str.split(",") if s.strip()] if employee.skills_str else []
    return {
        "id": employee.id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "phone": employee.phone,
        "role": employee.role,
        "department": employee.department,
        "location": employee.location,
        "hire_date": employee.hire_date.isoformat() if employee.hire_date else None,
        "status": employee.status,
        "skills": skills,
        "profile_image_filename": employee.profile_image_filename,
    }


# --- Attendance Endpoints ---

class SelfAttendanceIn(BaseModel):
    status: str = "present"  # present or late
    project_name: Optional[str] = None
    current_task: Optional[str] = None


@router.post("/attendance")
def mark_my_attendance(
    payload: SelfAttendanceIn,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)
    today = datetime.utcnow().strftime("%Y-%m-%d")

    existing = session.exec(
        select(Attendance).where(
            Attendance.employee_id == employee.id,
            Attendance.date == today
        )
    ).first()

    if existing:
        existing.status = payload.status
        if payload.project_name is not None:
            existing.project_name = payload.project_name
        if payload.current_task is not None:
            existing.current_task = payload.current_task
        session.add(existing)
    else:
        new_record = Attendance(
            employee_id=employee.id,
            date=today,
            status=payload.status,
            project_name=payload.project_name,
            current_task=payload.current_task
        )
        session.add(new_record)

    activity = Activity(
        description=f"{employee.first_name} {employee.last_name} marked attendance as {payload.status}",
        type="attendance"
    )
    session.add(activity)
    session.commit()

    return {"detail": "Attendance marked successfully", "date": today, "status": payload.status}


@router.get("/attendance")
def get_my_attendance(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)

    now = datetime.utcnow()
    today_dt = now.date()
    today = today_dt.strftime("%Y-%m-%d")
    month_start_dt = today_dt.replace(day=1)

    hire_date_dt = employee.hire_date.date() if employee.hire_date and hasattr(employee.hire_date, 'date') else (employee.hire_date if employee.hire_date else None)
    emp_hire_date_str = hire_date_dt.strftime("%Y-%m-%d") if hire_date_dt else None

    # Effective month start for this employee
    # If hire_date is in the future, the employee is still active (they're logged in),
    # so use today as the start date for counting.
    if hire_date_dt and hire_date_dt > today_dt:
        # Future hire date — still allow today
        effective_start = today_dt
    elif hire_date_dt and hire_date_dt > month_start_dt:
        # Joined this month — start from hire date
        effective_start = hire_date_dt
    else:
        # Joined before this month — start from 1st of month
        effective_start = month_start_dt

    total_month = max((today_dt - effective_start).days + 1, 1)

    records = session.exec(
        select(Attendance)
        .where(Attendance.employee_id == employee.id)
        .order_by(Attendance.date.desc())
    ).all()

    # Filter records starting strictly on or after employee's joining date
    valid_records = [r for r in records if not emp_hire_date_str or r.date >= emp_hire_date_str]

    month_prefix = today[:7]
    present_month = sum(1 for r in valid_records if r.date.startswith(month_prefix) and r.status in ["present", "late"])
    rate = round((present_month / total_month * 100), 1) if total_month > 0 else 100.0

    today_record = next((r for r in records if r.date == today), None)

    return {
        "hire_date": emp_hire_date_str,
        "today": {
            "date": today,
            "marked": today_record is not None,
            "status": today_record.status if today_record else None,
            "project_name": today_record.project_name if today_record else None,
            "current_task": today_record.current_task if today_record else None,
        },
        "monthly_rate": rate,
        "total_days_this_month": total_month,
        "present_days_this_month": present_month,
        "history": [
            {
                "id": r.id,
                "date": r.date,
                "status": r.status,
                "project_name": r.project_name,
                "current_task": r.current_task,
            }
            for r in valid_records
        ]
    }


# --- Projects Endpoints ---

@router.get("/projects")
def get_my_projects(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    employee = _require_employee(current_user, session)

    query = (
        select(ProjectMember, Project)
        .join(Project, ProjectMember.project_id == Project.id)
        .where(ProjectMember.employee_id == employee.id)
    )
    pairs = session.exec(query).all()

    if not pairs:
        return []

    project_ids = [p.id for _, p in pairs]
    all_memberships = session.exec(
        select(ProjectMember.project_id).where(ProjectMember.project_id.in_(project_ids))
    ).all()
    
    counts = {}
    for pid in all_memberships:
        counts[pid] = counts.get(pid, 0) + 1

    results = []
    for mem, project in pairs:
        results.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "client_name": project.client_name,
            "start_date": project.start_date,
            "due_date": project.due_date,
            "budget": project.budget,
            "role_in_project": mem.role_in_project,
            "assigned_at": mem.assigned_at.isoformat() if mem.assigned_at else None,
            "members_count": counts.get(project.id, 1),
        })

    return results
