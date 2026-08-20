from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.database import get_session
from app.models import SalaryRecord, SalaryRecordRead, SalaryRecordCreate, SalaryRecordUpdate, BulkPayrollProcessCreate, Employee, Activity
from app.routers.auth import get_current_user

router = APIRouter(prefix="/salary", tags=["salary"])

@router.get("", response_model=List[SalaryRecordRead])
def get_salaries(
    month: Optional[str] = None,
    year: Optional[int] = None,
    employee_id: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    query = select(SalaryRecord)
    if current_user.role == "employee":
        query = query.where(SalaryRecord.employee_id == current_user.employee_id)
    else:
        if employee_id:
            query = query.where(SalaryRecord.employee_id == employee_id)
            
    if month:
        query = query.where(SalaryRecord.month == month)
    if year:
        query = query.where(SalaryRecord.year == year)

    records = session.exec(query).all()
        
    result = []
    for record in records:
        employee = session.get(Employee, record.employee_id)
        if employee:
            read_record = SalaryRecordRead(
                **record.model_dump(),
                employee_name=f"{employee.first_name} {employee.last_name}",
                employee_email=employee.email,
                department=employee.department
            )
            result.append(read_record)
            
    return result

@router.post("", response_model=SalaryRecordRead)
def process_payroll(
    data: SalaryRecordCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Not authorized to process payroll")
        
    employee = session.get(Employee, data.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    existing = session.exec(
        select(SalaryRecord).where(
            SalaryRecord.employee_id == data.employee_id,
            SalaryRecord.month == data.month,
            SalaryRecord.year == data.year
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Payroll already processed for this month and year")
        
    amount = data.amount if data.amount is not None else employee.salary
    
    new_record = SalaryRecord(
        employee_id=employee.id,
        month=data.month,
        year=data.year,
        amount=amount,
        pf_deduction=data.pf_deduction if data.pf_deduction is not None else 0.0,
        tds_deduction=data.tds_deduction if data.tds_deduction is not None else 0.0,
        status="processed"
    )
    
    session.add(new_record)
    
    activity = Activity(
        description=f"Payroll processed for {employee.first_name} {employee.last_name} ({data.month} {data.year})",
        type="system"
    )
    session.add(activity)
    
    session.commit()
    session.refresh(new_record)
    
    return SalaryRecordRead(
        **new_record.model_dump(),
        employee_name=f"{employee.first_name} {employee.last_name}",
        employee_email=employee.email,
        department=employee.department
    )

@router.put("/{record_id}", response_model=SalaryRecordRead)
def update_salary(
    record_id: int,
    data: SalaryRecordUpdate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    record = session.get(SalaryRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)
        
    session.add(record)
    
    employee = session.get(Employee, record.employee_id)
    activity = Activity(
        description=f"Salary record updated for {employee.first_name} {employee.last_name} ({record.month} {record.year})",
        type="system"
    )
    session.add(activity)
    
    session.commit()
    session.refresh(record)
    
    return SalaryRecordRead(
        **record.model_dump(),
        employee_name=f"{employee.first_name} {employee.last_name}",
        employee_email=employee.email,
        department=employee.department
    )

@router.delete("/{record_id}")
def delete_salary(
    record_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    record = session.get(SalaryRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    employee = session.get(Employee, record.employee_id)
    
    session.delete(record)
    
    activity = Activity(
        description=f"Salary record deleted for {employee.first_name} {employee.last_name} ({record.month} {record.year})",
        type="system"
    )
    session.add(activity)
    
    session.commit()
    return {"ok": True}

@router.post("/bulk")
def bulk_process_payroll(
    data: BulkPayrollProcessCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Get all active employees
    employees = session.exec(select(Employee).where(Employee.status == "active")).all()
    
    processed_count = 0
    skipped_count = 0
    
    for employee in employees:
        # Check if already processed
        existing = session.exec(
            select(SalaryRecord).where(
                SalaryRecord.employee_id == employee.id,
                SalaryRecord.month == data.month,
                SalaryRecord.year == data.year
            )
        ).first()
        
        if existing:
            skipped_count += 1
            continue
            
        new_record = SalaryRecord(
            employee_id=employee.id,
            month=data.month,
            year=data.year,
            amount=employee.salary,
            pf_deduction=0.0,
            tds_deduction=0.0,
            status="processed"
        )
        session.add(new_record)
        processed_count += 1
        
    activity = Activity(
        description=f"Bulk payroll processed for {data.month} {data.year} ({processed_count} employees)",
        type="system"
    )
    session.add(activity)
    
    session.commit()
    return {"processed": processed_count, "skipped": skipped_count}
