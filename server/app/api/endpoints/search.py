from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.ai_service import generate_embedding
from app.services.vector_store import semantic_search
from app.api.deps import get_current_user

router = APIRouter()


class SearchRequest(BaseModel):
    query: str

@router.post("/")
async def search_document(
    data: SearchRequest,
    current_user: dict = Depends(get_current_user)
):
    query_embedding = generate_embedding(
        data.query
    )

    results = semantic_search(
        query_embedding,
        user_id=current_user["_id"]
    )

    formatted_results = []

    for result in results:
        formatted_results.append({
            "score": result.score,
            "text": result.payload.get("text", ""),
            "page": result.payload.get("page", 1),
            "document": result.payload.get("document_name", "unknown"),
            "language": result.payload.get("language", "unknown")
        })

    return {
        "query": data.query,
        "results": formatted_results
    }