# config.py - all app settings in one place

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # Database
    DATABASE_URL: str = "mysql+pymysql://root:1234@localhost:3306/halleyx_db"

    # App
    APP_NAME: str = "Halleyx Dashboard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Allowed CORS origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    class Config:
        env_file = ".env"


settings = Settings()