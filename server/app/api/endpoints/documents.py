import os
import shutil
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
from app.services.ai_service import generate_embedding
from app.services.vector_store import (
    create_collection,
    store_chunks,
    delete_document_vectors
)

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
    
    create_collection()

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(
        upload_dir,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )
    
    file_size = os.path.getsize(file_path)
    
    chunks = extract_text(file_path)

    for chunk in chunks:
        embedding = generate_embedding(chunk["text"])
        chunk["embedding"] = embedding
        chunk["document_name"] = file.filename

    store_chunks(chunks, user_id=current_user["_id"])

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