from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, or_
from app.database import get_session
from app.models import (
    Project, ProjectCreate, ProjectUpdate, ProjectRead,
    ProjectMember, ProjectMemberAdd, ProjectMemberRead,
    Employee, Activity
)
from app.routers.auth import get_current_user, require_employer

router = APIRouter(prefix="/projects", tags=["projects"], dependencies=[Depends(require_employer)])

def build_project_read(project: Project, session: Session) -> ProjectRead:
    members_raw = session.exec(
        select(ProjectMember, Employee)
        .where(ProjectMember.project_id == project.id)
        .where(ProjectMember.employee_id == Employee.id)
    ).all()

    members = []
    for pm, emp in members_raw:
        members.append(
            ProjectMemberRead(
                id=pm.id,
                project_id=pm.project_id,
                employee_id=emp.id,
                employee_name=f"{emp.first_name} {emp.last_name}",
                employee_email=emp.email,
                employee_role=emp.role,
                department=emp.department,
                role_in_project=pm.role_in_project,
                assigned_at=pm.assigned_at
            )
        )

    return ProjectRead(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        client_name=project.client_name,
        start_date=project.start_date,
        due_date=project.due_date,
        budget=project.budget,
        created_at=project.created_at,
        members_count=len(members),
        members=members
    )

@router.get("", response_model=List[ProjectRead])
def list_projects(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    query = select(Project)
    if status_filter and status_filter.lower() != "all":
        query = query.where(Project.status == status_filter.lower())
    if search:
        s = f"%{search}%"
        query = query.where(or_(Project.name.like(s), Project.client_name.like(s), Project.description.like(s)))

    projects = session.exec(query.order_by(Project.created_at.desc())).all()
    return [build_project_read(p, session) for p in projects]

@router.get("/employee/{employee_id}", response_model=List[ProjectRead])
def get_employee_projects(
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    memberships = session.exec(
        select(ProjectMember).where(ProjectMember.employee_id == employee_id)
    ).all()
    project_ids = [m.project_id for m in memberships]
    if not project_ids:
        return []
    projects = session.exec(select(Project).where(Project.id.in_(project_ids))).all()
    return [build_project_read(p, session) for p in projects]

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return build_project_read(project, session)

@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    project = Project.model_validate(project_data)
    session.add(project)
    session.commit()
    session.refresh(project)

    activity = Activity(
        description=f"Created new project '{project.name}'",
        type="project"
    )
    session.add(activity)
    session.commit()

    return build_project_read(project, session)

@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_dict = project_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(project, key, value)

    session.add(project)
    session.commit()
    session.refresh(project)

    activity = Activity(
        description=f"Updated project details for '{project.name}'",
        type="project"
    )
    session.add(activity)
    session.commit()

    return build_project_read(project, session)

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete project members
    members = session.exec(select(ProjectMember).where(ProjectMember.project_id == project_id)).all()
    for m in members:
        session.delete(m)

    session.delete(project)
    
    activity = Activity(
        description=f"Deleted project '{project.name}'",
        type="project"
    )
    session.add(activity)
    session.commit()

    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/members", response_model=ProjectRead)
def add_project_member(
    project_id: int,
    member_data: ProjectMemberAdd,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    employee = session.get(Employee, member_data.employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = session.exec(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .where(ProjectMember.employee_id == member_data.employee_id)
    ).first()

    if existing:
        existing.role_in_project = member_data.role_in_project
        session.add(existing)
    else:
        pm = ProjectMember(
            project_id=project_id,
            employee_id=member_data.employee_id,
            role_in_project=member_data.role_in_project
        )
        session.add(pm)

    activity = Activity(
        description=f"Assigned {employee.first_name} {employee.last_name} to project '{project.name}' as {member_data.role_in_project}",
        type="project"
    )
    session.add(activity)
    session.commit()

    return build_project_read(project, session)

@router.delete("/{project_id}/members/{employee_id}", response_model=ProjectRead)
def remove_project_member(
    project_id: int,
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing = session.exec(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .where(ProjectMember.employee_id == employee_id)
    ).first()

    if existing:
        session.delete(existing)
        activity = Activity(
            description=f"Removed employee from project '{project.name}'",
            type="project"
        )
        session.add(activity)
        session.commit()

    return build_project_read(project, session)
