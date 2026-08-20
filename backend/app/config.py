from pydantic_settings import BaseSettings

from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/hash_hrms"
    SUPER_ADMIN_EMAIL: Optional[str] = None
    SUPER_ADMIN_PASSWORD: Optional[str] = None
    APPROVAL_ADMIN_EMAIL: Optional[str] = None
    APPROVAL_ADMIN_PASSWORD: Optional[str] = None

    @property
    def get_database_url(self) -> str:
        url = self.DATABASE_URL
        if url and url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = ".env"

settings = Settings()

