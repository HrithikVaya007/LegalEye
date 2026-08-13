import asyncio
import logging
import os
import shutil
import tempfile
from typing import List
from datetime import datetime
from bson import ObjectId

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from app.schemas.document import DocumentUploadResponse
from app.db.mongodb import get_database
from app.core.config import settings
from app.api.deps import get_current_user
from app.services.document_service import extract_text
from app.services.ai_service import generate_embeddings_batch
from app.services.vector_store import (
    create_collection,
    store_chunks,
    delete_document_vectors
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # Use the OS temp directory (/tmp on Linux/Vercel) instead of a local
    # 'uploads/' folder. Vercel's filesystem is read-only except for /tmp.
    upload_dir = os.path.join(tempfile.gettempdir(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    # Save uploaded file to the temp directory
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except OSError as e:
        logger.error(f"Failed to write uploaded file to disk: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {e}"
        )

    file_size = os.path.getsize(file_path)

    try:
        # Run CPU-bound text extraction off the async event loop
        chunks = await asyncio.to_thread(extract_text, file_path)

        if chunks:
            # Batch-encode all chunks in one model.encode() call — much faster
            # than encoding one chunk at a time in a loop
            texts = [chunk["text"] for chunk in chunks]
            embeddings = await asyncio.to_thread(
                generate_embeddings_batch, texts, "passage"
            )
            for chunk, embedding in zip(chunks, embeddings):
                chunk["embedding"] = embedding
                chunk["document_name"] = file.filename

            # Run blocking Qdrant upsert off the event loop
            await asyncio.to_thread(
                store_chunks, chunks, str(current_user["_id"])
            )
    except Exception as e:
        logger.error(f"Document processing pipeline failed: {e}")
        # Clean up the temp file on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}"
        )

    document = {
        "filename": file.filename,
        "path": file_path,
        "status": "Indexed" if len(chunks) > 0 else "Error",
        "chunks": len(chunks),
        "size": file_size,
        "created_at": datetime.utcnow(),
        "user_id": current_user["_id"]
    }

    await db.documents.insert_one(document)

    return {
        "message": "Document uploaded successfully",
        "filename": file.filename,
        "chunks": len(chunks)
    }


@router.get("/", response_model=List[dict])
async def list_documents(
    db = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    cursor = db.documents.find({"user_id": current_user["_id"]})
    documents_list = []
    
    async for doc in cursor:
        size_bytes = doc.get("size", 0)
        size_mb = f"{size_bytes / (1024 * 1024):.1f} MB" if size_bytes > 0 else "0.0 MB"
        created_at = doc.get("created_at")
        date_str = created_at.strftime("%Y-%m-%d") if created_at else "Unknown"
        
        # Determine a type from the file name or default
        filename = doc.get("filename", "")
        doc_type = "PDF"
        if "contract" in filename.lower():
            doc_type = "Contract"
        elif "nda" in filename.lower():
            doc_type = "NDA"
        elif "manual" in filename.lower():
            doc_type = "Manual"
        elif "policy" in filename.lower():
            doc_type = "Policy"

        documents_list.append({
            "id": str(doc["_id"]),
            "name": filename,
            "type": doc_type,
            "size": size_mb,
            "date": date_str,
            "status": doc.get("status", "Indexed"),
            "chunks": doc.get("chunks", 0),
            "tags": ["Legal", doc_type] if doc_type != "PDF" else ["Legal"]
        })
        
    return documents_list


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    db = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    try:
        obj_id = ObjectId(doc_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID format"
        )

    doc = await db.documents.find_one({"_id": obj_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # Delete local file if exists
    file_path = doc.get("path")
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Could not delete physical file: {e}")

    # Delete vectors from Qdrant
    delete_document_vectors(doc["filename"], current_user["_id"])

    # Delete record from MongoDB
    await db.documents.delete_one({"_id": obj_id})

    return {"message": "Document deleted successfully"}