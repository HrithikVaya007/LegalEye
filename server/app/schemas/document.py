from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    status: str = "uploaded"
    chunks: int = 0

class DocumentCreate(DocumentBase):
    path: str

class DocumentInDB(DocumentBase):
    id: str = Field(alias="_id")
    path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentResponse(DocumentBase):
    id: str
    path: str

class DocumentUploadResponse(BaseModel):
    message: str
    filename: str
    chunks: int

class AnalyzeRequest(BaseModel):
    title: str
    text: str

