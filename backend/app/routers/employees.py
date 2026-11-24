from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, or_
from app.database import get_session
from app.models import Employee, EmployeeCreate, EmployeeRead, EmployeeUpdate, Activity, User
from app.routers.auth import get_current_user, require_employer

router = APIRouter(prefix="/employees", tags=["employees"])

def to_employee_read(emp: Employee) -> EmployeeRead:
    skills = [s.strip() for s in emp.skills_str.split(",") if s.strip()] if emp.skills_str else []
    return EmployeeRead(
        id=emp.id,
        first_name=emp.first_name,
        last_name=emp.last_name,
        email=emp.email,
        phone=emp.phone,
        role=emp.role,
        department=emp.department,
        location=emp.location,
        hire_date=emp.hire_date,
        status=emp.status,
        salary=emp.salary,
        performance_score=emp.performance_score,
        manager_name=emp.manager_name,
        cv_filename=emp.cv_filename,
        skills=skills
    )

@router.get("", response_model=List[EmployeeRead])
def list_employees(
    department: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    query = select(Employee)
    
    if department:
        query = query.where(Employee.department == department)
        
    if status:
        query = query.where(Employee.status == status)
        
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Employee.first_name.like(search_filter),
                Employee.last_name.like(search_filter),
                Employee.email.like(search_filter),
                Employee.role.like(search_filter)
            )
        )
        
    employees = session.exec(query.offset(offset).limit(limit)).all()
    return [to_employee_read(emp) for emp in employees]

@router.get("/departments")
def get_unique_departments(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    from app.models import Department
    all_depts = session.exec(select(Department)).all()
    if all_depts:
        return [{"name": d.name} for d in all_depts]
        
    results = session.exec(select(Employee.department).distinct()).all()
    if not results:
        return []
    return [{"name": dept} for dept in results if dept]

@router.get("/export/excel")
def export_employees(
    department: Optional[str] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    query = select(Employee)
    
    if department:
        query = query.where(Employee.department == department)
        
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Employee.first_name.like(search_filter),
                Employee.last_name.like(search_filter),
                Employee.email.like(search_filter),
                Employee.role.like(search_filter)
            )
        )
        
    employees = session.exec(query).all()
    
    import openpyxl
    from openpyxl.utils import get_column_letter
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Employees"
    
    headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Role", "Department", "Location", "Status", "Hire Date", "Salary", "Performance", "Manager"]
    ws.append(headers)
    
    for emp in employees:
        row = [
            emp.id,
            emp.first_name,
            emp.last_name,
            emp.email,
            emp.phone,
            emp.role,
            emp.department,
            emp.location,
            emp.status,
            emp.hire_date.strftime("%Y-%m-%d") if emp.hire_date else "",
            emp.salary,
            emp.performance_score,
            emp.manager_name
        ]
        ws.append(row)
        
    for col in range(1, len(headers) + 1):
        ws.column_dimensions[get_column_letter(col)].width = 15
        
    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="employees_export.xlsx"',
        'Access-Control-Expose-Headers': 'Content-Disposition'
    }
    
    return StreamingResponse(stream, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    emp = session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return to_employee_read(emp)

@router.post("", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    # Check if email exists
    existing = session.exec(select(Employee).where(Employee.email == emp_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee email already exists")
        
    skills_str = ",".join(emp_in.skills) if emp_in.skills else ""
    emp = Employee(
        first_name=emp_in.first_name,
        last_name=emp_in.last_name,
        email=emp_in.email,
        phone=emp_in.phone,
        role=emp_in.role,
        department=emp_in.department,
        location=emp_in.location,
        hire_date=emp_in.hire_date,
        status=emp_in.status,
        salary=emp_in.salary,
        performance_score=emp_in.performance_score,
        manager_name=emp_in.manager_name,
        skills_str=skills_str
    )
    
    session.add(emp)
    
    # Log Activity
    activity = Activity(
        description=f"New Entry added: {emp.first_name} {emp.last_name}",
        type="employee"
    )
    session.add(activity)
    
    session.commit()
    session.refresh(emp)
    return to_employee_read(emp)

@router.put("/{employee_id}", response_model=EmployeeRead)
def update_employee(
    employee_id: int,
    emp_in: EmployeeUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    emp = session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    update_data = emp_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if key == "skills":
            emp.skills_str = ",".join(value) if value else ""
        else:
            setattr(emp, key, value)
            
    session.add(emp)
    
    # Log Activity
    activity = Activity(
        description=f"Record Updated: {emp.first_name} {emp.last_name}",
        type="employee"
    )
    session.add(activity)
    
    session.commit()
    session.refresh(emp)
    return to_employee_read(emp)

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    emp = session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    session.delete(emp)
    
    # Log Activity
    activity = Activity(
        description=f"Record Deleted: {emp.first_name} {emp.last_name}",
        type="employee"
    )
    session.add(activity)
    
    session.commit()
    return {"detail": "Employee deleted successfully"}

import os
from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from app.file_utils import safe_filename, checked_extension, save_upload, DOCUMENT_EXTENSIONS

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{employee_id}/cv")
def upload_cv(
    employee_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    emp = session.get(Employee, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    original_name = safe_filename(file.filename)
    checked_extension(original_name, DOCUMENT_EXTENSIONS)
    filename = f"cv_{employee_id}_{original_name}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    save_upload(file, file_path)

    emp.cv_filename = filename
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return {"detail": "CV uploaded successfully", "cv_filename": filename}

@router.get("/{employee_id}/cv")
def download_cv(
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Employees may only download their own CV
    if current_user.role != "employer" and current_user.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Not allowed to access this CV")

    emp = session.get(Employee, employee_id)
    if not emp or not emp.cv_filename:
        raise HTTPException(status_code=404, detail="CV not found")
        
    file_path = os.path.join(UPLOAD_DIR, emp.cv_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CV file not found on disk")
        
    original_filename = emp.cv_filename.replace(f"cv_{employee_id}_", "")
    return FileResponse(
        path=file_path,
        filename=original_filename,
        media_type="application/octet-stream"
    )

@router.post("/import-employees")
def import_employees(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    import openpyxl
    import csv
    import json
    from io import BytesIO, StringIO
    from datetime import datetime
    import uuid
    
    contents = file.file.read()
    filename = file.filename.lower()
    
    extracted_data = []
    
    # Helper to find a matching key in a dictionary (case-insensitive, substring)
    def find_key(row_dict, keywords):
        for k in row_dict.keys():
            if not k: continue
            k_lower = str(k).lower()
            for kw in keywords:
                if kw in k_lower:
                    return k
        return None

    try:
        if filename.endswith('.json'):
            data = json.loads(contents.decode('utf-8'))
            if isinstance(data, list):
                extracted_data = data
            else:
                raise ValueError("JSON root must be a list of objects")
                
        elif filename.endswith('.csv'):
            csv_file = StringIO(contents.decode('utf-8'))
            reader = csv.DictReader(csv_file)
            if reader.fieldnames:
                for row in reader:
                    extracted_data.append(dict(row))
            else:
                raise ValueError("Empty CSV")
                
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            wb = openpyxl.load_workbook(filename=BytesIO(contents), data_only=True)
            sheet = wb.active
            
            headers = []
            header_row_idx = None
            
            for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
                # Try to find header row by looking for "name", "first name", "email", or "role"
                has_header = False
                for cell_value in row:
                    if isinstance(cell_value, str):
                        val = cell_value.strip().lower()
                        if "name" in val or "email" in val or "role" in val or "department" in val:
                            has_header = True
                            break
                if has_header:
                    headers = [str(c).strip() if c else f"col_{i}" for i, c in enumerate(row)]
                    header_row_idx = row_idx
                    break
                    
            if header_row_idx is None:
                raise ValueError("Could not detect header row in Excel file (make sure columns have headers like 'Name' or 'Email')")
                
            for row in sheet.iter_rows(min_row=header_row_idx + 1, values_only=True):
                row_dict = {}
                for idx, col_name in enumerate(headers):
                    if idx < len(row):
                        row_dict[col_name] = row[idx]
                extracted_data.append(row_dict)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .xlsx, .csv, or .json")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid file: {str(e)}")
        
    added_count = 0
    
    for item in extracted_data:
        # Field mappings
        def get_val(keywords, default=""):
            k = find_key(item, keywords)
            return str(item[k]).strip() if k and item[k] is not None else default

        name = get_val(["name"])
        first_name = get_val(["first_name", "firstname", "first name"])
        last_name = get_val(["last_name", "lastname", "last name"])
        
        if not first_name and name:
            parts = name.split(" ", 1)
            first_name = parts[0]
            if len(parts) > 1 and not last_name:
                last_name = parts[1]
                
        if not first_name:
            continue # First name is required
            
        email = get_val(["email"])
        if not email:
            email_base = f"{first_name.lower()}.{last_name.lower() or 'employee'}"
            email = f"{email_base}@cognitiveems.com"
            
        # Deduplicate email
        existing = session.exec(select(Employee).where(Employee.email == email)).first()
        if existing:
            email = f"{email.split('@')[0]}.{str(uuid.uuid4())[:4]}@cognitiveems.com"
            
        phone = get_val(["phone", "mobile", "contact"])
        role = get_val(["role", "designation", "title"], "Employee")
        department = get_val(["department", "dept"], "General")
        location = get_val(["location", "city", "office"], "Remote")
        
        hire_date_str = get_val(["hire_date", "hiredate", "join date", "joined"])
        hire_date = datetime.now()
        if hire_date_str:
            try:
                # Try simple format parsing
                if len(hire_date_str) >= 10:
                    hire_date = datetime.strptime(hire_date_str[:10], "%Y-%m-%d")
            except:
                pass
                
        status = get_val(["status"], "active").lower()
        
        salary_str = get_val(["salary", "pay"])
        salary = 0.0
        if salary_str:
            try:
                salary = float(salary_str.replace(",", "").replace("$", ""))
            except:
                pass
                
        perf_str = get_val(["performance", "score", "rating"])
        performance_score = 4.0
        if perf_str:
            try:
                performance_score = float(perf_str)
            except:
                pass
                
        manager_name = get_val(["manager", "supervisor"])
        skills_str = get_val(["skills"])

        emp = Employee(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone if phone else None,
            role=role,
            department=department,
            location=location,
            hire_date=hire_date,
            status=status,
            salary=salary,
            performance_score=performance_score,
            manager_name=manager_name if manager_name else None,
            skills_str=skills_str
        )
        session.add(emp)
        added_count += 1
        
    if added_count > 0:
        activity = Activity(
            description=f"Imported {added_count} employees from file",
            type="employee"
        )
        session.add(activity)
        session.commit()
    
    return {"detail": f"Successfully imported {added_count} employees"}

@router.post("/sync-github")
async def sync_to_github(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    import httpx
    import base64
    import json
    from app.config import settings

    if not settings.GITHUB_TOKEN or not settings.GITHUB_OWNER or not settings.GITHUB_REPO:
        raise HTTPException(
            status_code=400, 
            detail="GitHub synchronization is not configured. Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO environment variables."
        )
        
    employees = session.exec(select(Employee)).all()
    
    # Serialize to JSON properly
    employees_json = json.dumps(
        [json.loads(to_employee_read(emp).model_dump_json()) for emp in employees], 
        indent=2
    )
    
    file_path = "data/employees.json"
    url = f"https://api.github.com/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}/contents/{file_path}"
    
    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    async with httpx.AsyncClient() as client:
        # Step 1: Check if file exists to get the SHA
        get_resp = await client.get(url, headers=headers)
        sha = None
        if get_resp.status_code == 200:
            sha = get_resp.json().get("sha")
            
        # Step 2: Push the file
        content_b64 = base64.b64encode(employees_json.encode('utf-8')).decode('utf-8')
        
        data = {
            "message": "Auto-sync: Update employee data from application",
            "content": content_b64,
        }
        if sha:
            data["sha"] = sha
            
        put_resp = await client.put(url, headers=headers, json=data)
        
        if put_resp.status_code in (200, 201):
            # Log Activity
            activity = Activity(
                description="Successfully synced employee data to GitHub repository",
                type="system"
            )
            session.add(activity)
            session.commit()
            return {"detail": "Successfully synced to GitHub repository"}
        else:
            raise HTTPException(status_code=500, detail=f"GitHub API Error: {put_resp.text}")

