from pydantic import field_validator
from pydantic_settings import BaseSettings

from typing import List, Optional

# Key that was previously published in .env.example; never accept it.
_LEAKED_SECRET_KEYS = {
    "9f0b5402324707bb37517c5b6bb17f8a7095b5e7d5cf2a2559595861ab3decd2",
}

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/hash_hrms"
    SUPER_ADMIN_EMAIL: Optional[str] = None
    SUPER_ADMIN_PASSWORD: Optional[str] = None
    APPROVAL_ADMIN_EMAIL: Optional[str] = None
    APPROVAL_ADMIN_PASSWORD: Optional[str] = None
    # Enables the passwordless demo login endpoints. Never enable in production.
    DEMO_MODE: bool = False
    # Comma-separated list of origins allowed to call the API
    CORS_ORIGINS: str = "http://localhost:5173"

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if len(value) < 32 or value in _LEAKED_SECRET_KEYS:
            raise ValueError(
                "SECRET_KEY must be a private random value of at least 32 characters. "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        return value

    @property
    def get_database_url(self) -> str:
        url = self.DATABASE_URL
        if url and url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
