import logging
import uuid
import os
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType
)
from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

_client_instance = None

def get_client() -> QdrantClient:
    global _client_instance
    if _client_instance is not None:
        return _client_instance

    _qdrant_url = getattr(settings, "QDRANT_URL", None)
    _qdrant_api_key = getattr(settings, "QDRANT_API_KEY", None)

    is_vercel = os.environ.get("VERCEL") == "1" or os.environ.get("VERCEL_ENV") is not None
    is_localhost = not _qdrant_url or "localhost" in _qdrant_url or "127.0.0.1" in _qdrant_url

    if is_vercel and is_localhost:
        logger.info("Running on Vercel without external QDRANT_URL. Using in-memory Qdrant client.")
        _client_instance = QdrantClient(location=":memory:")
        return _client_instance

    try:
        if _qdrant_url and _qdrant_url != ":memory:":
            client = QdrantClient(
                url=_qdrant_url,
                api_key=_qdrant_api_key if _qdrant_api_key else None,
                timeout=15.0
            )
            # Test connection to ensure host is reachable
            client.get_collections()
            _client_instance = client
            logger.info(f"Connected to Qdrant server at {_qdrant_url}")
        else:
            logger.info("Using in-memory Qdrant client.")
            _client_instance = QdrantClient(location=":memory:")
    except Exception as e:
        logger.warning(
            f"Could not connect to Qdrant server at {_qdrant_url}: {e}. "
            "Falling back to in-memory Qdrant client."
        )
        _client_instance = QdrantClient(location=":memory:")

    return _client_instance


def create_collection(vector_size=384):
    global _client_instance
    try:
        q_client = get_client()
        try:
            collections = q_client.get_collections().collections
        except Exception as conn_err:
            logger.warning(f"Qdrant connection check failed: {conn_err}. Re-initializing with in-memory Qdrant.")
            _client_instance = QdrantClient(location=":memory:")
            q_client = _client_instance
            collections = q_client.get_collections().collections

        existing = [collection.name for collection in collections]

        if "legaleye" not in existing:
            q_client.create_collection(
                collection_name="legaleye",
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE
                )
            )
        
        try:
            q_client.create_payload_index(
                collection_name="legaleye",
                field_name="user_id",
                field_schema=PayloadSchemaType.KEYWORD
            )
            logger.info("Payload index for user_id verified/created in Qdrant.")
        except Exception as idx_err:
            logger.warning(f"Did not recreate user_id index: {idx_err}")
    except Exception as e:
        logger.error(f"Error creating collection: {e}. Defaulting to in-memory.")
        _client_instance = QdrantClient(location=":memory:")
        _client_instance.create_collection(
            collection_name="legaleye",
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )


def store_chunks(chunks, user_id: str):
    if not chunks:
        return
    try:
        q_client = get_client()
        first_embedding = chunks[0].get("embedding")
        vector_size = len(first_embedding) if first_embedding else 384

        create_collection(vector_size=vector_size)
        points = []

        for chunk in chunks:
            chunk_id = chunk.get("id")
            
            if isinstance(chunk_id, int):
                point_id = chunk_id
            elif isinstance(chunk_id, str):
                try:
                    uuid.UUID(chunk_id)
                    point_id = chunk_id
                except ValueError:
                    point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk_id))
            else:
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

        q_client.upsert(
            collection_name="legaleye",
            points=points
        )
    except Exception as e:
        logger.error(f"Error storing chunks: {e}")
        # Try fallback to in-memory Qdrant
        try:
            global _client_instance
            _client_instance = QdrantClient(location=":memory:")
            create_collection(vector_size=vector_size)
            _client_instance.upsert(collection_name="legaleye", points=points)
            logger.info("Successfully stored chunks in in-memory Qdrant fallback.")
        except Exception as mem_err:
            logger.error(f"Failed to store chunks in memory fallback: {mem_err}")
            raise mem_err


def semantic_search(
    query_embedding,
    user_id: str,
    limit=5
):
    try:
        q_client = get_client()
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
        
        response = q_client.query_points(
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
        q_client = get_client()
        q_client.delete(
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