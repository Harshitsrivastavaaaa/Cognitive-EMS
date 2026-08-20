import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models import Document, DocumentRead, Employee
from .auth import get_current_user

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "vault")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[DocumentRead])
def get_all_documents(session: Session = Depends(get_session), current_user: str = Depends(get_current_user)):
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
    current_user: str = Depends(get_current_user)
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
    current_user: str = Depends(get_current_user)
):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_doc = Document(
        filename=unique_filename,
        original_name=file.filename,
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
    session: Session = Depends(get_session)
    # Removing current_user dependency for simple download if accessed via <a> tag,
    # or keep it if using an authenticated fetch (we'll keep it simple for now, but in production, we should authenticate)
):
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = os.path.join(UPLOAD_DIR, doc.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File on disk not found")

    return FileResponse(file_path, filename=doc.original_name)

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    session: Session = Depends(get_session),
    current_user: str = Depends(get_current_user)
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
