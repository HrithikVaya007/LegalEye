from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Citation(BaseModel):
    docName: str
    page: int
    excerpt: str
    language: Optional[str] = None  # BCP-47 code, e.g. 'en', 'hi', 'ar'

class ChatMessage(BaseModel):
    role: str  # 'user' or 'ai'
    content: str
    citations: Optional[List[Citation]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    role: str = "ai"
    content: str
    citations: List[Citation]
    conversation_id: Optional[str] = None
