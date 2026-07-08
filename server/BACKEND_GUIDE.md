# LegalEye Backend Development Guide

This guide will walk you through building a professional FastAPI backend for LegalEye. Your current folder structure is excellent and follows industry best practices.

## 1. Understanding the Structure
- **`main.py`**: The entry point. This is what you run to start the server.
- **`app/core/`**: System-wide settings and security (API keys, DB URLs).
- **`app/api/endpoints/`**: Your actual "business logic" (Auth, Chat, Documents).
- **`app/db/`**: Database connection and session management.
- **`app/models/`**: Database tables (User, Document, Message).
- **`app/services/`**: Complex logic (AI processing, PDF parsing).

---

## Step 1: Core Configuration (`app/core/config.py`)
This file handles your environment variables. It ensures that if a required key (like `OPENAI_API_KEY`) is missing, the app won't start, preventing crashes later.

**Paste this into `app/core/config.py`:**
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "LegalEye AI"
    API_V1_STR: str = "/api/v1"
    
    # These will be read from your .env file
    DATABASE_URL: str = "sqlite:///./legal_eye.db"
    SECRET_KEY: str = "your-secret-key-for-jwt"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
```

---

## Step 2: Define your First API Router (`app/api/endpoints/auth.py`)
Endpoints are grouped into "Routers". This keeps your `main.py` clean.

**Paste this into `app/api/endpoints/auth.py`:**
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "active", "message": "LegalEye Auth System is running"}
```

---

## Step 3: Connect the Routers (`app/api/__init__.py`)
This file gathers all your different endpoints (auth, chat, docs) into one main router.

**Paste this into `app/api/__init__.py`:**
```python
from fastapi import APIRouter
from app.api.endpoints import auth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
```

---

## Step 4: The Entry Point (`main.py`)
This is the "brain" of your application. It initializes FastAPI and connects everything.

**Paste this into `main.py`:**
```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to LegalEye AI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
```

---

## Step 5: Running the Server
1. Ensure your `venv` is activated.
2. Run the server:
   ```powershell
   python main.py
   ```
3. Open your browser to `http://localhost:8001/docs`. You will see the **Swagger UI** where you can test your API!

---

## Next Steps
- **Database**: Implement `app/db/session.py` to connect to PostgreSQL or SQLite.
- **Models**: Define your `User` and `Document` models in `app/models/`.
- **AI Logic**: Add your LLM integration in `app/services/ai.py`.
