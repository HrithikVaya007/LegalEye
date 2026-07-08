from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
