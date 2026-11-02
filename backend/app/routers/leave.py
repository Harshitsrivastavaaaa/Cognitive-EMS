from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Employee, LeaveRequest, LeaveRequestCreate, LeaveRequestStatusUpdate, Activity
from app.routers.auth import get_current_user, require_employer

router = APIRouter(prefix="/leave", tags=["leave"])


@router.post("", response_model=dict)
def submit_leave_request(
    payload: LeaveRequestCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Employee submits a leave / PTO request."""
    employee_id = current_user.employee_id
    if not employee_id and current_user.role == "employee":
        emp = session.exec(select(Employee).where(Employee.email == current_user.email)).first()
        if emp:
            employee_id = emp.id

    if not employee_id:
        # Fallback for employer testing or demo
        first_emp = session.exec(select(Employee)).first()
        if first_emp:
            employee_id = first_emp.id
        else:
            raise HTTPException(status_code=400, detail="No linked employee record found for leave request.")

    leave_req = LeaveRequest(
        employee_id=employee_id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status="pending"
    )
    session.add(leave_req)

    # Activity log
    emp = session.get(Employee, employee_id)
    emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Employee"
    session.add(Activity(
        description=f"{emp_name} requested {payload.leave_type.capitalize()} leave ({payload.start_date} to {payload.end_date})",
        type="leave"
    ))
    session.commit()
    session.refresh(leave_req)

    return {
        "id": leave_req.id,
        "employee_id": leave_req.employee_id,
        "leave_type": leave_req.leave_type,
        "start_date": leave_req.start_date,
        "end_date": leave_req.end_date,
        "reason": leave_req.reason,
        "status": leave_req.status,
        "created_at": leave_req.created_at.isoformat()
    }


@router.get("/mine")
def get_my_leave_requests(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Fetch logged-in employee's leave requests."""
    employee_id = current_user.employee_id
    if not employee_id:
        emp = session.exec(select(Employee).where(Employee.email == current_user.email)).first()
        if emp:
            employee_id = emp.id

    if not employee_id:
        return []

    requests = session.exec(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == employee_id)
        .order_by(LeaveRequest.created_at.desc())
    ).all()

    return [
        {
            "id": r.id,
            "leave_type": r.leave_type,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "reason": r.reason,
            "status": r.status,
            "reviewer_note": r.reviewer_note,
            "created_at": r.created_at.isoformat()
        }
        for r in requests
    ]


@router.get("")
def get_all_leave_requests(
    status_filter: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    """Fetch all leave requests for employer review."""
    query = select(LeaveRequest)
    if status_filter:
        query = query.where(LeaveRequest.status == status_filter)

    requests = session.exec(query.order_by(LeaveRequest.created_at.desc())).all()

    # Pre-fetch employees for mapping
    employees = {e.id: e for e in session.exec(select(Employee)).all()}

    results = []
    for r in requests:
        emp = employees.get(r.employee_id)
        results.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            "employee_email": emp.email if emp else "",
            "department": emp.department if emp else "",
            "leave_type": r.leave_type,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "reason": r.reason,
            "status": r.status,
            "reviewer_note": r.reviewer_note,
            "created_at": r.created_at.isoformat()
        })
    return results


@router.put("/{leave_id}/status")
def update_leave_status(
    leave_id: int,
    payload: LeaveRequestStatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    """Employer approves or rejects a leave request."""
    leave_req = session.get(LeaveRequest, leave_id)
    if not leave_req:
        raise HTTPException(status_code=404, detail="Leave request not found")

    leave_req.status = payload.status
    if payload.reviewer_note is not None:
        leave_req.reviewer_note = payload.reviewer_note

    session.add(leave_req)

    # Activity log
    emp = session.get(Employee, leave_req.employee_id)
    emp_name = f"{emp.first_name} {emp.last_name}" if emp else "Employee"
    session.add(Activity(
        description=f"Leave request for {emp_name} was {payload.status}",
        type="leave"
    ))

    session.commit()
    session.refresh(leave_req)
    return {"detail": f"Leave request {payload.status} successfully", "id": leave_id, "status": leave_req.status}
