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

# Middleware to rewrite Vercel serverless prefix paths (/api/index, /main.py) to actual API routes
@app.middleware("http")
async def fix_vercel_path(request: Request, call_next):
    forwarded_uri = request.headers.get("x-forwarded-uri") or request.headers.get("x-matched-path")
    
    if forwarded_uri and forwarded_uri not in ["/api/index", "/api/index.py", "/main.py"]:
        clean_path = forwarded_uri.split("?")[0]
        request.scope["path"] = clean_path if clean_path else "/"
    else:
        path = request.url.path
        if path in ["/api/index", "/api/index.py", "/main.py"]:
            request.scope["path"] = "/"
        elif path.startswith("/api/index.py/"):
            new_path = path[len("/api/index.py"):]
            request.scope["path"] = new_path if new_path else "/"
        elif path.startswith("/api/index/"):
            new_path = path[len("/api/index"):]
            request.scope["path"] = new_path if new_path else "/"
    
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
@app.get("/main.py")
@app.get("/api/index")
@app.get("/api/index.py")
async def root():
    return {"message": "Welcome to LegalEye AI API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)



