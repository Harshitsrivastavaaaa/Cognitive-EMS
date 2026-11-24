import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import Session

from app.database import get_session
from app.models import CompanyProfile, CompanyProfileUpdate, User
from app.routers.auth import require_employer
from app.file_utils import checked_extension, save_upload

router = APIRouter(prefix="/company", tags=["company"])

BRANDING_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "branding")
os.makedirs(BRANDING_DIR, exist_ok=True)

# Raster formats only: the logo is drawn into generated PDFs, and SVG uploads could carry scripts
LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
LOGO_MEDIA_TYPES = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
MAX_LOGO_BYTES = 2 * 1024 * 1024


def _get_profile(session: Session) -> CompanyProfile:
    profile = session.get(CompanyProfile, 1)
    if not profile:
        profile = CompanyProfile(id=1)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    return profile


def _profile_response(profile: CompanyProfile) -> dict:
    return {
        "company_name": profile.company_name,
        "tagline": profile.tagline,
        "address": profile.address,
        "email": profile.email,
        "phone": profile.phone,
        "website": profile.website,
        "has_logo": bool(profile.logo_filename),
        # Changes whenever the profile or logo changes, so clients can bust caches
        "version": int(profile.updated_at.timestamp()),
    }


def _looks_like_image(path: str, ext: str) -> bool:
    with open(path, "rb") as f:
        head = f.read(12)
    if ext == ".png":
        return head.startswith(b"\x89PNG\r\n\x1a\n")
    if ext in (".jpg", ".jpeg"):
        return head.startswith(b"\xff\xd8\xff")
    if ext == ".webp":
        return head[:4] == b"RIFF" and head[8:12] == b"WEBP"
    return False


def _remove_logo_file(profile: CompanyProfile) -> None:
    if profile.logo_filename:
        path = os.path.join(BRANDING_DIR, profile.logo_filename)
        if os.path.exists(path):
            os.remove(path)
        profile.logo_filename = None


# Public: the login page and generated documents show the company branding
@router.get("")
def get_company_profile(session: Session = Depends(get_session)):
    return _profile_response(_get_profile(session))


@router.put("")
def update_company_profile(
    payload: CompanyProfileUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    profile = _get_profile(session)
    for key, value in payload.model_dump().items():
        setattr(profile, key, value)
    profile.updated_at = datetime.utcnow()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_response(profile)


@router.get("/logo")
def get_company_logo(session: Session = Depends(get_session)):
    profile = _get_profile(session)
    if not profile.logo_filename:
        raise HTTPException(status_code=404, detail="No custom logo uploaded")
    path = os.path.join(BRANDING_DIR, profile.logo_filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Logo file not found")
    ext = os.path.splitext(profile.logo_filename)[1].lower()
    return FileResponse(path, media_type=LOGO_MEDIA_TYPES.get(ext, "application/octet-stream"),
                        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "no-cache"})


@router.post("/logo")
def upload_company_logo(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    ext = checked_extension(file.filename, LOGO_EXTENSIONS)
    filename = f"logo-{uuid.uuid4().hex}{ext}"
    path = os.path.join(BRANDING_DIR, filename)
    save_upload(file, path, max_bytes=MAX_LOGO_BYTES)
    if not _looks_like_image(path, ext):
        os.remove(path)
        raise HTTPException(status_code=400, detail="File is not a valid PNG, JPEG or WebP image.")

    profile = _get_profile(session)
    _remove_logo_file(profile)
    profile.logo_filename = filename
    profile.updated_at = datetime.utcnow()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_response(profile)


@router.delete("/logo")
def delete_company_logo(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_employer)
):
    profile = _get_profile(session)
    _remove_logo_file(profile)
    profile.updated_at = datetime.utcnow()
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_response(profile)
