import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from app.config import settings

BCRYPT_ROUNDS = 12

def _password_bytes(password: str) -> bytes:
    # bcrypt only uses the first 72 bytes; bcrypt>=5 raises instead of truncating
    return password.encode('utf-8')[:72]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            _password_bytes(plain_password),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def needs_rehash(hashed_password: str) -> bool:
    parts = hashed_password.split("$") if hashed_password else []
    return len(parts) >= 4 and parts[2].isdigit() and int(parts[2]) < BCRYPT_ROUNDS

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(_password_bytes(password), salt)
    return hashed.decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
