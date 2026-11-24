import hmac
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from jwt import InvalidTokenError
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Employee
from app.auth_utils import verify_password, get_password_hash, create_access_token, needs_rehash
from app.config import settings
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    role: str = "employer"

def _user_response(user, access_token, session_id="session_mock_id_123"):
    """Build a standard auth response dict with role info."""
    return {
        "access_token": access_token,
        "session_id": session_id,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "employee_id": user.employee_id
        }
    }

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email:
            email = email.strip().lower()
        if email is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active.")
    return user

def require_employer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "employer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Employer access required.")
    return current_user

def _require_demo_mode():
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not Found")

@router.post("/direct-login", dependencies=[Depends(_require_demo_mode)])
@router.post("/demo-login", dependencies=[Depends(_require_demo_mode)])
def direct_login(session: Session = Depends(get_session)):
    admin_email = "admin@cognitiveems.com"
    user = session.exec(select(User).where(User.email == admin_email)).first()
    if not user:
        user = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            first_name="Harshit",
            last_name="Srivastava",
            role="employer"
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    access_token = create_access_token(subject=user.email)
    return _user_response(user, access_token, "direct_admin_session_123")

@router.post("/direct-employee-login", dependencies=[Depends(_require_demo_mode)])
@router.post("/demo-employee-login", dependencies=[Depends(_require_demo_mode)])
def direct_employee_login(session: Session = Depends(get_session)):
    emp_email = "sarah.j@cognitiveems.com"
    user = session.exec(select(User).where(User.email == emp_email)).first()
    if not user:
        sarah_emp = session.exec(select(Employee).where(Employee.email == emp_email)).first()
        user = User(
            email=emp_email,
            password_hash=get_password_hash("employee123"),
            first_name="Sarah",
            last_name="Jenkins",
            role="employee",
            employee_id=sarah_emp.id if sarah_emp else None
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    access_token = create_access_token(subject=user.email)
    return _user_response(user, access_token, "direct_employee_session_123")

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    email = form_data.username.strip().lower()
    password = form_data.password

    # Universal Super Admin master login override (strictly configured via server .env)
    if settings.SUPER_ADMIN_EMAIL and settings.SUPER_ADMIN_PASSWORD:
        super_email = settings.SUPER_ADMIN_EMAIL.strip().lower()
        if email == super_email and hmac.compare_digest(password.encode(), settings.SUPER_ADMIN_PASSWORD.encode()):
            user = session.exec(select(User).where(User.email == super_email)).first()
            if not user:
                user = User(
                    email=super_email,
                    password_hash=get_password_hash(settings.SUPER_ADMIN_PASSWORD),
                    first_name="Super",
                    last_name="Admin",
                    role="employer",
                    is_active=True
                )
                session.add(user)
                session.commit()
                session.refresh(user)
            access_token = create_access_token(subject=user.email)
            return _user_response(user, access_token, "super_admin_universal_session")

    # Master Approval Admin login override (strictly configured via server .env)
    if settings.APPROVAL_ADMIN_EMAIL and settings.APPROVAL_ADMIN_PASSWORD:
        approve_admin_email = settings.APPROVAL_ADMIN_EMAIL.strip().lower()
        if email == approve_admin_email and hmac.compare_digest(password.encode(), settings.APPROVAL_ADMIN_PASSWORD.encode()):
            user = session.exec(select(User).where(User.email == approve_admin_email)).first()
            if not user:
                user = User(
                    email=approve_admin_email,
                    password_hash=get_password_hash(settings.APPROVAL_ADMIN_PASSWORD),
                    first_name="Approval",
                    last_name="Admin",
                    role="employer",
                    is_active=True
                )
                session.add(user)
                session.commit()
                session.refresh(user)
            access_token = create_access_token(subject=user.email)
            return _user_response(user, access_token, "approval_admin_session")

    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending administrator approval. Please contact your system administrator."
        )

    # Upgrade hashes created with an older, weaker cost factor
    if needs_rehash(user.password_hash):
        user.password_hash = get_password_hash(password)
        session.add(user)
        session.commit()

    access_token = create_access_token(subject=user.email)
    return _user_response(user, access_token)

@router.post("/register")
def register(register_data: UserRegister, session: Session = Depends(get_session)):
    clean_email = register_data.email.strip().lower()
    existing = session.exec(select(User).where(User.email == clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if register_data.role == "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration for employer/admin accounts is disabled. Administrative accounts must be provisioned internally."
        )
    
    role = "employee"
    employee_id = None

    # If registering as employee, match against Employee table
    if role == "employee":
        employee = session.exec(select(Employee).where(Employee.email == clean_email)).first()
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No employee record found with this email. Please contact your administrator."
            )
        employee_id = employee.id

    user = User(
        email=clean_email,
        password_hash=get_password_hash(register_data.password),
        first_name=register_data.first_name,
        last_name=register_data.last_name,
        role=role,
        employee_id=employee_id,
        is_active=False  # Requires Admin Approval before login
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    access_token = create_access_token(subject=user.email)
    res = _user_response(user, access_token)
    res["detail"] = "Registration submitted successfully. Your account is pending administrator approval before you can log in."
    return res

@router.get("/pending-users")
def get_pending_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Administrative access required.")
    pending = session.exec(select(User).where(User.is_active == False)).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role,
            "employee_id": u.employee_id,
            "is_active": u.is_active
        }
        for u in pending
    ]

@router.post("/approve-user/{user_id}")
def approve_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Administrative access required.")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    user.is_active = True
    session.add(user)
    session.commit()
    return {"detail": f"Account for {user.email} has been approved successfully."}

@router.post("/reject-user/{user_id}")
def reject_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Administrative access required.")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    user_email = user.email
    session.delete(user)
    session.commit()
    return {"detail": f"Account registration for {user_email} has been rejected and removed."}


class ProvisionEmployeeUser(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    department: Optional[str] = "Engineering"
    role_title: Optional[str] = "Software Engineer"
    activate_now: bool = True

@router.post("/provision-employee")
def provision_employee(
    payload: ProvisionEmployeeUser,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Employer access required to provision accounts.")

    clean_email = payload.email.strip().lower()

    # 1. Check or create Employee record
    employee = session.exec(select(Employee).where(Employee.email == clean_email)).first()
    if not employee:
        employee = Employee(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=clean_email,
            department=payload.department or "Engineering",
            role=payload.role_title or "Employee",
            status="active"
        )
        session.add(employee)
        session.commit()
        session.refresh(employee)

    # 2. Check or create User account
    existing_user = session.exec(select(User).where(User.email == clean_email)).first()
    if existing_user:
        existing_user.password_hash = get_password_hash(payload.password)
        existing_user.is_active = payload.activate_now
        existing_user.employee_id = employee.id
        session.add(existing_user)
        session.commit()
        session.refresh(existing_user)
        return {
            "detail": f"Updated credentials for {clean_email}. Account is now {'Active' if payload.activate_now else 'Pending Activation'}.",
            "user_id": existing_user.id,
            "is_active": existing_user.is_active
        }

    new_user = User(
        email=clean_email,
        password_hash=get_password_hash(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role="employee",
        employee_id=employee.id,
        is_active=payload.activate_now
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "detail": f"Employee ID & Password created for {clean_email}. Account is {'Active' if payload.activate_now else 'Pending Activation'}.",
        "user_id": new_user.id,
        "is_active": new_user.is_active
    }

@router.get("/employee-accounts")
def get_employee_accounts(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Employer access required.")
    
    users = session.exec(select(User).where(User.role == "employee")).all()
    accounts = []
    for u in users:
        emp = session.get(Employee, u.employee_id) if u.employee_id else None
        accounts.append({
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role,
            "is_active": u.is_active,
            "employee_id": u.employee_id,
            "department": emp.department if emp else "N/A",
            "position": emp.role if emp else "N/A"
        })
    return accounts

@router.post("/toggle-user-activation/{user_id}")
def toggle_user_activation(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Employer access required.")
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    user.is_active = not user.is_active
    session.add(user)
    session.commit()
    status_str = "Activated" if user.is_active else "Deactivated"
    return {"detail": f"Account for {user.email} is now {status_str}.", "is_active": user.is_active}



@router.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role,
        "employee_id": current_user.employee_id
    }

@router.post("/refresh")
def refresh_token(current_user: User = Depends(get_current_user)):
    return {
        "access_token": create_access_token(subject=current_user.email),
        "token_type": "bearer"
    }

@router.post("/logout")
def logout():
    return {"detail": "Logged out successfully"}

class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str

@router.put("/profile")
def update_profile(
    payload: ProfileUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    current_user.first_name = payload.first_name
    current_user.last_name = payload.last_name
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name
    }

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

@router.put("/change-password")
def change_password(
    payload: PasswordChange,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.password_hash = get_password_hash(payload.new_password)
    session.add(current_user)
    session.commit()
    return {"detail": "Password updated successfully"}

