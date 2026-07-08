from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from app.core.config import settings
from app.db.mongodb import get_database
from app.schemas.user import GoogleAuthRequest, Token, UserResponse
from app.core.security import create_access_token
from datetime import datetime
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

@router.post("/google", response_model=Token)
async def google_auth(payload: GoogleAuthRequest):
    """
    Receives a Google ID token from the frontend,
    verifies it server-side, and returns our own JWT.
    Creates the user in MongoDB if first time signing in.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            payload.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )

    google_sub = id_info["sub"]
    email = id_info.get("email", "")
    full_name = id_info.get("name", "")

    db = get_database()

    # Upsert: find by google_sub, create if not exists
    user = await db.users.find_one({"google_sub": google_sub})

    if not user:
        # Also check if they registered with email before (edge case)
        user = await db.users.find_one({"email": email})

    if not user:
        user = {
            "_id": str(uuid.uuid4()),
            "email": email,
            "full_name": full_name,
            "google_sub": google_sub,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(user)
    else:
        # Update google_sub and name if missing
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"google_sub": google_sub, "full_name": full_name}}
        )
        user["full_name"] = full_name

    access_token_expires = timedelta(minutes=float(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = create_access_token(
        subject=user["_id"], expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "full_name": user.get("full_name", "")
        }
    }

@router.get("/health")
async def health_check():
    return {"status": "active", "message": "LegalEye Auth System is running"}
