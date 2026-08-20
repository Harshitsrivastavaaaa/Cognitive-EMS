from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import UserSettings
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    two_factor_enabled: Optional[bool] = None
    notif_email: Optional[bool] = None
    notif_push: Optional[bool] = None
    notif_sms: Optional[bool] = None
    ai_neural: Optional[bool] = None
    ai_predictive: Optional[bool] = None

@router.get("")
def get_settings(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    settings = session.exec(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    ).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        session.add(settings)
        session.commit()
        session.refresh(settings)
    
    return {
        "two_factor_enabled": settings.two_factor_enabled,
        "notif_email": settings.notif_email,
        "notif_push": settings.notif_push,
        "notif_sms": settings.notif_sms,
        "ai_neural": settings.ai_neural,
        "ai_predictive": settings.ai_predictive,
    }

@router.put("")
def update_settings(
    payload: SettingsUpdate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    settings = session.exec(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    ).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        session.add(settings)
        session.commit()
        session.refresh(settings)
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(settings, key, value)
    
    session.add(settings)
    session.commit()
    session.refresh(settings)
    
    return {
        "two_factor_enabled": settings.two_factor_enabled,
        "notif_email": settings.notif_email,
        "notif_push": settings.notif_push,
        "notif_sms": settings.notif_sms,
        "ai_neural": settings.ai_neural,
        "ai_predictive": settings.ai_predictive,
    }
