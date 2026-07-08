from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class SearchResult(BaseModel):
    id: Optional[str] = None
    title: str
    document: str
    page: int
    score: float  # relevance score
    excerpt: str

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
