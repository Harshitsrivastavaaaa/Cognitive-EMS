import os
import re
from fastapi import HTTPException, UploadFile

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".txt", ".xlsx", ".csv"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}


def safe_filename(name: str) -> str:
    """Strip any directory components and unusual characters from a client-supplied filename."""
    name = re.split(r"[\\/]", name or "")[-1]
    name = re.sub(r"[^A-Za-z0-9._ -]", "_", name).strip(" .")
    return name or "file"


def checked_extension(filename: str, allowed: set) -> str:
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type '{ext or 'none'}' is not allowed.")
    return ext


def save_upload(file: UploadFile, path: str, max_bytes: int = MAX_UPLOAD_BYTES) -> None:
    """Stream an upload to disk, rejecting files larger than max_bytes."""
    written = 0
    try:
        with open(path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(status_code=413, detail="File is too large (max 10 MB).")
                buffer.write(chunk)
    except HTTPException:
        os.remove(path)
        raise
