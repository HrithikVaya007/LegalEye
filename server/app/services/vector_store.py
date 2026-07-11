import logging
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)
from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Initialize Qdrant Client with remote settings first.
# If the connection fails or if no remote URL is configured,
# fall back to an in-memory client for local development/testing.
_qdrant_url = settings.QDRANT_URL
_qdrant_api_key = settings.QDRANT_API_KEY if hasattr(settings, "QDRANT_API_KEY") else None

try:
    if _qdrant_url and _qdrant_url != ":memory:":
        client = QdrantClient(
            url=_qdrant_url,
            api_key=_qdrant_api_key if _qdrant_api_key else None,
            timeout=60.0
        )
        # Test connection by listing collections
        client.get_collections()
        logger.info(f"Connected to Qdrant server at {_qdrant_url}")
    else:
        logger.info("No remote Qdrant URL configured. Using in-memory Qdrant client.")
        client = QdrantClient(location=":memory:")
except Exception as e:
    logger.warning(
        f"Could not connect to Qdrant server at {_qdrant_url}: {e}. "
        "Falling back to in-memory Qdrant client."
    )
    client = QdrantClient(location=":memory:")


def create_collection(vector_size=384):
    try:
        collections = client.get_collections().collections
        existing = [collection.name for collection in collections]

        if "legaleye" not in existing:
            client.create_collection(
                collection_name="legaleye",
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE
                )
            )
    except Exception as e:
        logger.error(f"Error creating collection: {e}")
        raise e


def store_chunks(chunks, user_id: str):
    if not chunks:
        return
    try:
        # Dynamically determine vector size from the first chunk
        first_embedding = chunks[0].get("embedding")
        vector_size = len(first_embedding) if first_embedding else 384

        create_collection(vector_size=vector_size)
        points = []

        for chunk in chunks:
            chunk_id = chunk.get("id")
            
            # Ensure the point ID is a valid Qdrant ID (either int or valid UUID string)
            if isinstance(chunk_id, int):
                point_id = chunk_id
            elif isinstance(chunk_id, str):
                try:
                    uuid.UUID(chunk_id)
                    point_id = chunk_id
                except ValueError:
                    # Not a valid UUID string, generate a deterministic UUID based on the string
                    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk_id))
            else:
                # If ID is missing or of another type, generate a random UUID
                point_id = str(uuid.uuid4())

            points.append(
                PointStruct(
                    id=point_id,
                    vector=chunk.get("embedding", [0.0] * vector_size),
                    payload={
                        "text": chunk.get("text", ""),
                        "page": chunk.get("page", 1),
                        "document_name": chunk.get("document_name", "unknown"),
                        "language": chunk.get("language", "unknown"),
                        "user_id": user_id
                    }
                )
            )

        client.upsert(
            collection_name="legaleye",
            points=points
        )
    except Exception as e:
        logger.error(f"Error storing chunks: {e}")
        raise e


def semantic_search(
    query_embedding,
    user_id: str,
    limit=5
):
    try:
        vector_size = len(query_embedding) if query_embedding else 384
        create_collection(vector_size=vector_size)
        
        user_filter = Filter(
            must=[
                FieldCondition(
                    key="user_id",
                    match=MatchValue(value=user_id)
                )
            ]
        )
        
        response = client.query_points(
            collection_name="legaleye",
            query=query_embedding,
            query_filter=user_filter,
            limit=limit
        )
        return response.points
    except Exception as e:
        logger.error(f"Error searching vector store: {e}")
        return []


def delete_document_vectors(document_name: str, user_id: str):
    try:
        client.delete(
            collection_name="legaleye",
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_name",
                        match=MatchValue(value=document_name)
                    ),
                    FieldCondition(
                        key="user_id",
                        match=MatchValue(value=user_id)
                    )
                ]
            )
        )
        logger.info(f"Deleted vectors for document {document_name} and user {user_id}")
    except Exception as e:
        logger.error(f"Error deleting vectors: {e}")
        raise e