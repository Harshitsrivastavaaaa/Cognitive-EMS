from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models import Department, DepartmentCreate, DepartmentRead
from .auth import get_current_user

router = APIRouter(
    prefix="/departments",
    tags=["departments"]
)

@router.get("/", response_model=List[DepartmentRead])
def read_departments(session: Session = Depends(get_session)):
    departments = session.exec(select(Department)).all()
    return departments

@router.post("/", response_model=DepartmentRead)
def create_department(
    *,
    session: Session = Depends(get_session),
    department_in: DepartmentCreate
):
    # Check if department already exists
    existing = session.exec(select(Department).where(Department.name == department_in.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    department = Department.model_validate(department_in)
    session.add(department)
    session.commit()
    session.refresh(department)
    return department

@router.delete("/{department_id}")
def delete_department(
    *,
    session: Session = Depends(get_session),
    department_id: int
):
    department = session.get(Department, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    session.delete(department)
    session.commit()
    return {"ok": True}
