from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field
from pydantic import field_validator

# --- USER MODELS ---
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    first_name: str
    last_name: str

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    is_active: bool = Field(default=True)
    role: str = Field(default="employer")  # "employer" or "employee"
    employee_id: Optional[int] = Field(default=None, foreign_key="employee.id")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    is_active: bool
    role: str = "employer"
    employee_id: Optional[int] = None

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: Optional[str] = None


# --- DOCUMENT MODELS ---
class DocumentBase(SQLModel):
    filename: str
    original_name: str
    document_type: str = Field(default="Other")
    employee_id: int = Field(foreign_key="employee.id")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class Document(DocumentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class DocumentRead(DocumentBase):
    id: int
    employee_name: Optional[str] = None  # To be populated when joining

# --- DEPARTMENT MODELS ---
class DepartmentBase(SQLModel):
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None

class Department(DepartmentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentRead(DepartmentBase):
    id: int


# --- EMPLOYEE MODELS ---
class EmployeeBase(SQLModel):
    first_name: str
    last_name: str
    email: str = Field(unique=True, index=True)
    gitlab_id: Optional[str] = None
    phone: Optional[str] = None
    role: str
    department: str
    location: str = Field(default="Remote")
    hire_date: Optional[datetime] = None
    status: str = Field(default="active")
    salary: float = Field(default=0.0)
    performance_score: float = Field(default=4.0)
    manager_name: Optional[str] = None
    cv_filename: Optional[str] = None
    profile_image_filename: Optional[str] = None

    @field_validator("salary", mode="before")
    @classmethod
    def parse_salary(cls, v):
        if v == "" or v is None:
            return 0.0
        try:
            return float(v)
        except ValueError:
            return 0.0

    @field_validator("hire_date", mode="before")
    @classmethod
    def parse_hire_date(cls, v):
        if v == "" or v is None:
            return None
        # Handle simple date strings (like "2026-07-15")
        if isinstance(v, str):
            try:
                # Add time component if missing
                if len(v) == 10:
                    return datetime.strptime(v, "%Y-%m-%d")
                return datetime.fromisoformat(v)
            except ValueError:
                return None
        return v

class Employee(EmployeeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    skills_str: str = Field(default="")

class EmployeeCreate(EmployeeBase):
    skills: List[str] = []

class EmployeeUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    gitlab_id: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    hire_date: Optional[datetime] = None
    status: Optional[str] = None
    salary: Optional[float] = None
    performance_score: Optional[float] = None
    manager_name: Optional[str] = None
    skills: Optional[List[str]] = None

    @field_validator("salary", mode="before")
    @classmethod
    def parse_salary(cls, v):
        if v == "" or v is None:
            return None
        try:
            return float(v)
        except ValueError:
            return None

    @field_validator("hire_date", mode="before")
    @classmethod
    def parse_hire_date(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            try:
                if len(v) == 10:
                    return datetime.strptime(v, "%Y-%m-%d")
                return datetime.fromisoformat(v)
            except ValueError:
                return None
        return v

class EmployeeSelfUpdate(SQLModel):
    """Limited fields an employee can update about themselves."""
    phone: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None

class EmployeeRead(EmployeeBase):
    id: int
    skills: List[str] = []

class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    type: str = Field(default="employee")

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(index=True)
    date: str = Field(index=True)  # Store date as string "YYYY-MM-DD"
    status: str  # present, absent, late
    project_name: Optional[str] = None
    current_task: Optional[str] = None

class UserSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(unique=True, index=True)
    two_factor_enabled: bool = Field(default=True)
    notif_email: bool = Field(default=True)
    notif_push: bool = Field(default=False)
    notif_sms: bool = Field(default=True)
    ai_neural: bool = Field(default=False)
    ai_predictive: bool = Field(default=True)


# --- PROJECT MODELS ---
class ProjectBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    status: str = Field(default="active")  # active, planning, completed, on_hold
    client_name: Optional[str] = Field(default="Internal")
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    budget: float = Field(default=0.0)

    @field_validator("budget", mode="before")
    @classmethod
    def parse_budget(cls, v):
        if v == "" or v is None:
            return 0.0
        try:
            return float(v)
        except ValueError:
            return 0.0

class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", index=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    role_in_project: str = Field(default="Team Member")
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    client_name: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    budget: Optional[float] = None

class ProjectMemberAdd(SQLModel):
    employee_id: int
    role_in_project: str = Field(default="Team Member")

class ProjectMemberRead(SQLModel):
    id: int
    project_id: int
    employee_id: int
    employee_name: str
    employee_email: str
    employee_role: str
    department: str
    role_in_project: str
class ProjectRead(ProjectBase):
    id: int
    created_at: datetime
    members_count: int = 0
    members: List[ProjectMemberRead] = []

# --- LEAVE REQUEST MODELS ---
class LeaveRequestBase(SQLModel):
    leave_type: str = Field(default="vacation")  # vacation, sick, casual, remote
    start_date: str = Field(index=True)  # YYYY-MM-DD
    end_date: str = Field(index=True)    # YYYY-MM-DD
    reason: Optional[str] = None

class LeaveRequest(LeaveRequestBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    status: str = Field(default="pending", index=True)  # pending, approved, rejected
    reviewer_note: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestStatusUpdate(SQLModel):
    status: str  # approved, rejected
    reviewer_note: Optional[str] = None

class LeaveRequestRead(LeaveRequestBase):
    id: int
    employee_id: int
    employee_name: str
    employee_email: str
    department: str
    status: str
    reviewer_note: Optional[str] = None
    created_at: datetime


# --- SALARY MODELS ---
class SalaryRecordBase(SQLModel):
    employee_id: int = Field(foreign_key="employee.id", index=True)
    month: str
    year: int
    amount: float
    pf_deduction: float = Field(default=0.0)
    tds_deduction: float = Field(default=0.0)
    status: str = Field(default="processed")
    payment_date: datetime = Field(default_factory=datetime.utcnow)

class SalaryRecord(SalaryRecordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class SalaryRecordCreate(SQLModel):
    employee_id: int
    month: str
    year: int
    amount: Optional[float] = None
    pf_deduction: Optional[float] = None
    tds_deduction: Optional[float] = None

class SalaryRecordRead(SalaryRecordBase):
    id: int
    employee_name: str
    employee_email: str
    department: str

class SalaryRecordUpdate(SQLModel):
    amount: Optional[float] = None
    pf_deduction: Optional[float] = None
    tds_deduction: Optional[float] = None
    status: Optional[str] = None
    month: Optional[str] = None
    year: Optional[int] = None

class BulkPayrollProcessCreate(SQLModel):
    month: str
    year: int
