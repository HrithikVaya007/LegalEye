from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    PROJECT_NAME: str ="LegalEye AI"

    API_V1_STR: str = "/api/v1"
    

    #These will be read from your .env file
    MONGODB_URI:str ="mongodb://localhost:27017/legaleye"
    DATABASE_NAME:str ="legaleye"
    JWT_SECRET: str = "your-secret-key-for-jwt"
    JWT_ALGORITHM:str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:str ="60"
    PORT: int = 8000
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    GROQ_API_KEY: str
    GOOGLE_CLIENT_ID: str = "482308799962-f9aon8484ggsmim47d6u2gi320nqabdo.apps.googleusercontent.com"

@lru_cache()
def get_settings():
    return Settings()

settings=get_settings()