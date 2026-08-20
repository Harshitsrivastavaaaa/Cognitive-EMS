from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import Employee, Attendance, Activity
from app.routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/attendance", tags=["attendance"])

class AttendanceRecordIn(BaseModel):
    employee_id: int
    status: str  # present, absent, late
    project_name: Optional[str] = None
    current_task: Optional[str] = None

class AttendanceBatchIn(BaseModel):
    date: str
    records: List[AttendanceRecordIn]

@router.get("")
def get_attendance_list(
    date: str,
    department: Optional[str] = None,
    project_id: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    # Fetch employees
    emp_query = select(Employee)
    if department:
        emp_query = emp_query.where(Employee.department == department)
    
    if project_id:
        from app.models import ProjectMember
        emp_query = emp_query.where(
            Employee.id.in_(
                select(ProjectMember.employee_id).where(ProjectMember.project_id == project_id)
            )
        )
        
    employees = session.exec(emp_query).all()
    
    # Fetch existing attendance records for the given date
    att_records = session.exec(
        select(Attendance).where(Attendance.date == date)
    ).all()
    att_map = {rec.employee_id: rec for rec in att_records}
    
    # Calculate statistics for each employee
    year_prefix = date[:4]
    month_prefix = date[:7]
    employee_ids = [emp.id for emp in employees]
    
    all_atts = []
    if employee_ids:
        all_atts = session.exec(
            select(Attendance).where(
                Attendance.employee_id.in_(employee_ids),
                Attendance.date.like(f"{year_prefix}%")
            )
        ).all()
        
    from collections import defaultdict
    emp_att_year = defaultdict(list)
    for att in all_atts:
        emp_att_year[att.employee_id].append(att)
        
    # Merge datasets
    results = []
    for emp in employees:
        emp_records = emp_att_year[emp.id]
        emp_hire_date_str = emp.hire_date.strftime("%Y-%m-%d") if emp.hire_date else None
        
        # Check if requested date is prior to employee's day of joining
        is_pre_joining = bool(emp_hire_date_str and date < emp_hire_date_str)
        
        # Filter valid records starting strictly on or after joining date
        valid_year_records = [r for r in emp_records if not emp_hire_date_str or r.date >= emp_hire_date_str]
        
        # Calculate Year Stats
        year_total = len(valid_year_records)
        year_present = sum(1 for r in valid_year_records if r.status in ["present", "late"])
        pct_year = round((year_present / year_total * 100), 1) if year_total > 0 else 100.0
        
        # Calculate Month Stats
        month_records = [r for r in valid_year_records if r.date.startswith(month_prefix)]
        month_total = len(month_records)
        month_present = sum(1 for r in month_records if r.status in ["present", "late"])
        pct_month = round((month_present / month_total * 100), 1) if month_total > 0 else 100.0
        
        emp_att_record = att_map.get(emp.id)
        status_val = "pre_joining" if is_pre_joining else (emp_att_record.status if emp_att_record else "present")
        
        results.append({
            "employee_id": emp.id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "department": emp.department,
            "role": emp.role,
            "hire_date": emp_hire_date_str,
            "status": status_val,
            "project_name": emp_att_record.project_name if emp_att_record else "",
            "current_task": emp_att_record.current_task if emp_att_record else "",
            "attendance_rate_month": pct_month,
            "attendance_rate_year": pct_year
        })
    return results

@router.post("/batch")
def mark_attendance_batch(
    payload: AttendanceBatchIn,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    for record in payload.records:
        existing = session.exec(
            select(Attendance).where(
                Attendance.employee_id == record.employee_id,
                Attendance.date == payload.date
            )
        ).first()
        
        if existing:
            existing.status = record.status
            if record.project_name is not None:
                existing.project_name = record.project_name
            if record.current_task is not None:
                existing.current_task = record.current_task
            session.add(existing)
        else:
            new_record = Attendance(
                employee_id=record.employee_id,
                date=payload.date,
                status=record.status,
                project_name=record.project_name,
                current_task=record.current_task
            )
            session.add(new_record)
            
    # Log system activity
    activity = Activity(
        description=f"Batch Attendance saved for {payload.date}",
        type="system"
    )
    session.add(activity)
    
    session.commit()
    return {"detail": "Attendance records saved successfully"}

@router.get("/employee/{employee_id}")
def get_employee_attendance(
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    
    records = session.exec(
        select(Attendance)
        .where(Attendance.employee_id == employee_id)
        .order_by(Attendance.date.desc())
    ).all()
    
    return [
        {
            "id": r.id,
            "date": r.date,
            "status": r.status,
            "project_name": r.project_name,
            "current_task": r.current_task
        }
        for r in records
    ]

