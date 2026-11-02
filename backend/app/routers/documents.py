import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models import Document, DocumentRead, Employee, User
from .auth import get_current_user, require_employer
from ..file_utils import safe_filename, checked_extension, save_upload, DOCUMENT_EXTENSIONS

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "vault")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[DocumentRead])
def get_all_documents(session: Session = Depends(get_session), current_user: User = Depends(require_employer)):
    documents = session.exec(select(Document)).all()
    # Populate employee_name for each document
    doc_reads = []
    for doc in documents:
        doc_read = DocumentRead.model_validate(doc)
        employee = session.get(Employee, doc.employee_id)
        if employee:
            doc_read.employee_name = f"{employee.first_name} {employee.last_name}"
        else:
            doc_read.employee_name = "Unknown"
        doc_reads.append(doc_read)
    return doc_reads

@router.get("/employee/{employee_id}", response_model=List[DocumentRead])
def get_employee_documents(
    employee_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    documents = session.exec(select(Document).where(Document.employee_id == employee_id)).all()
    employee = session.get(Employee, employee_id)
    employee_name = f"{employee.first_name} {employee.last_name}" if employee else "Unknown"
    
    doc_reads = []
    for doc in documents:
        doc_read = DocumentRead.model_validate(doc)
        doc_read.employee_name = employee_name
        doc_reads.append(doc_read)
    return doc_reads

@router.post("/upload", response_model=DocumentRead)
def upload_document(
    employee_id: int = Form(...),
    document_type: str = Form("Other"),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    original_name = safe_filename(file.filename)
    ext = checked_extension(original_name, DOCUMENT_EXTENSIONS)
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    save_upload(file, file_path)

    new_doc = Document(
        filename=unique_filename,
        original_name=original_name,
        document_type=document_type,
        employee_id=employee_id
    )
    session.add(new_doc)
    session.commit()
    session.refresh(new_doc)
    
    doc_read = DocumentRead.model_validate(new_doc)
    doc_read.employee_name = f"{employee.first_name} {employee.last_name}"
    return doc_read

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    doc = session.get(Document, document_id)
    # Employees may only download their own documents; 404 avoids revealing other IDs
    if not doc or (current_user.role != "employer" and doc.employee_id != current_user.employee_id):
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = os.path.join(UPLOAD_DIR, doc.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File on disk not found")

    return FileResponse(file_path, filename=doc.original_name)

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = os.path.join(UPLOAD_DIR, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    session.delete(doc)
    session.commit()
    return {"detail": "Document deleted successfully"}
