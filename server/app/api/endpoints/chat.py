from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.chat_service import process_chat
from app.api.deps import get_current_user
from app.db.mongodb import get_database

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


@router.post("/")
async def chat(
    data: ChatRequest,
    db = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    # Log the query to MongoDB for stats
    query_record = {
        "user_id": current_user["_id"],
        "question": data.question,
        "created_at": datetime.utcnow()
    }
    await db.queries.insert_one(query_record)

    response = process_chat(
        data.question,
        user_id=current_user["_id"]
    )

    return response