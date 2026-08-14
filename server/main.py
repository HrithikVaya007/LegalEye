import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import api_router
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Middleware to fix Vercel rewrite paths so FastAPI routes requests correctly
@app.middleware("http")
async def fix_vercel_path(request: Request, call_next):
    path_param = request.query_params.get("path")
    if path_param:
        request.scope["path"] = path_param
    else:
        forwarded_uri = request.headers.get("x-forwarded-uri") or request.headers.get("x-matched-path")
        if forwarded_uri:
            clean_path = forwarded_uri.split("?")[0]
            request.scope["path"] = clean_path if clean_path else "/"
        elif request.url.path in ["/api/index", "/api/index.py", "/main.py"]:
            request.scope["path"] = "/"

    return await call_next(request)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router (all sub-routers are mounted inside api_router)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Main FastAPI application entrypoint for LegalEye AI backend
@app.get("/")
async def root():
    return {"message": "Welcome to LegalEye AI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
