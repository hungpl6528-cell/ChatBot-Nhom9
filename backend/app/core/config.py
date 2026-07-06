"""
app/core/config.py
Centralized settings using pydantic-settings
"""
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Google Gemini
    GEMINI_API_KEY: str = Field(..., env="GEMINI_API_KEY")

    # MySQL
    DB_HOST: str = Field(default="localhost", env="DB_HOST")
    DB_PORT: int = Field(default=3306, env="DB_PORT")
    DB_USER: str = Field(default="root", env="DB_USER")
    DB_PASSWORD: str = Field(default="", env="DB_PASSWORD")
    DB_NAME: str = Field(default="chatbot_nhom9", env="DB_NAME")

    # ChromaDB
    CHROMA_PATH: str = Field(default="./chroma_db", env="CHROMA_PATH")

    # JWT
    SECRET_KEY: str = Field(default="changeme-in-production", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # App
    APP_ENV: str = Field(default="development", env="APP_ENV")
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        env="CORS_ORIGINS"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
