# LegalEye AI Deployment Map & Architecture Guide 🚀

This document maps out the system architecture, network paths, infrastructure requirements, and step-by-step deployment strategies for the **LegalEye AI** application in a production environment.

---

## 📐 System Architecture Map

Below is the logical data flow and infrastructure topology of LegalEye AI when deployed.

```mermaid
graph TD
    %% Clients
    subgraph Client-Side [Client Tier]
        User([User Browser])
        ReactApp[React SPA / Vite App]
        User -->|Interacts with| ReactApp
    end

    %% Routing / Load Balancer
    subgraph Gateway-Tier [Ingress & Routing]
        Nginx[Reverse Proxy / SSL / Nginx]
        ReactApp -->|HTTP/HTTPS requests| Nginx
    end

    %% Application Server
    subgraph Server-Tier [Application Tier]
        FastAPI[FastAPI / Uvicorn Server]
        Nginx -->|Proxy pass API requests| FastAPI
        FastAPI -->|Extracts PDF text| PyMuPDF[PyMuPDF Service]
    end

    %% Databases & External Services
    subgraph DB-Tier [Database Tier]
        MongoAtlas[(MongoDB Atlas)]
        QdrantDB[(Qdrant Vector DB)]
    end

    subgraph External-Services [External Services]
        Groq[Groq API Cloud]
        GoogleAuth[Google OAuth 2.0]
    end

    %% Connections
    FastAPI -->|Read/Write Data| MongoAtlas
    FastAPI -->|Store & Query Embeddings| QdrantDB
    FastAPI -->|Chat Completions| Groq
    ReactApp -->|Authentication| GoogleAuth
```

---

## 🛠️ Infrastructure Requirements

The application consists of a decouple architecture which can be deployed using managed cloud providers or a single self-hosted Virtual Private Server (VPS).

| Component | Technology | Recommended Production Choice | Alternative (Self-Hosted) |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite, Tailwind V4) | Vercel / Netlify / AWS S3 + CloudFront | Nginx Container |
| **Backend** | FastAPI (Python) | Render / Railway / AWS ECS | Docker Container (Uvicorn) |
| **Database** | MongoDB | MongoDB Atlas (Shared or Dedicated) | MongoDB Docker Image |
| **Vector DB** | Qdrant | Qdrant Cloud (Managed) | Qdrant Docker Image with Volume |
| **AI LLM API** | Groq Client | Managed API Key | Local LLM (Ollama - Not recommended for prod) |
| **Authentication** | Google OAuth | Google Cloud Console OAuth 2.0 Credentials | - |

---

## 🔑 Environment Variables Reference

Ensure these variables are properly configured in the environments of your production hosting providers.

### 1. Server Environment Variables (`server/.env`)
These secrets should be injected into the backend container runtime.

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | Connection URI for the MongoDB Database | `mongodb+srv://<user>:<password>@legaleye.xxxx.mongodb.net/` |
| `DATABASE_NAME` | The MongoDB database name | `legaleye` |
| `JWT_SECRET` | Secret key used to sign Auth tokens | *(Use a secure 64-char string)* |
| `JWT_ALGORITHM` | Encryption algorithm for token signatures | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifespan | `60` (minutes) |
| `PORT` | Local network port the server listens on | `8001` (Render/Railway automatically binds `PORT`) |
| `QDRANT_URL` | URL of the production Qdrant service | `https://xxxx-xxxx.eu-west.aws.qdrant.tech:6333` |
| `QDRANT_API_KEY` | API Key for authorization with Qdrant | *(Required for Qdrant Cloud)* |
| `GROQ_API_KEY` | API Key to execute Groq LLM queries | `gsk_xxxxxxxxxxxxxxxxxxxxx` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Console | `xxxxxxxx-xxxxxxxx.apps.googleusercontent.com` |

### 2. Client Environment Variables (`client/.env.production`)
Variables compiled into the frontend client build.

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | The production URL of the deployed FastAPI backend | `https://api.legaleye.yourdomain.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (must match backend) | `xxxxxxxx-xxxxxxxx.apps.googleusercontent.com` |

---

## ⚠️ Critical Production Readiness Checklist

Before deploying, there are several code-level improvements required to transition the codebase from a local development state to production-ready:

### 1. Centralize and Parameterize `API_URL` (Frontend)
Currently, frontend pages (e.g., [AuthContext.jsx](file:///c:/LegalEye/client/src/context/AuthContext.jsx#L17), [UploadPage.jsx](file:///c:/LegalEye/client/src/pages/UploadPage.jsx#L24), etc.) hardcode `http://localhost:8001/api/v1` locally.
* **Fix**: Create a central API utility file (e.g., `client/src/utils/api.js`) and load the base URL from the environment:
  ```javascript
  export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
  ```
  Then import `API_URL` from this single source of truth across all views.

### 2. Ephemeral Storage Resolution for Uploads
* **Problem**: When storing uploads in the local folder `server/uploads/` on platforms like Render or inside stateless Docker containers, **files will be deleted** whenever the container restarts or redeploys.
* **Fix**: Integrate a cloud storage client (e.g., `boto3` for AWS S3) in `document_service.py` to store uploaded PDFs, or configure a **Persistent Volume** mount on your hosting provider mapped to `/server/uploads`.

### 3. Restrict CORS Middleware
* **Problem**: In [main.py](file:///c:/LegalEye/server/main.py#L26), the CORS configuration is set to open access (`allow_origins=["*"]`).
* **Fix**: Restrict allowed origins to your production frontend URL:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://legaleye.yourdomain.com"],
      allow_credentials=True,
      allow_methods=["GET", "POST", "PUT", "DELETE"],
      allow_headers=["*"],
  )
  ```

### 4. Vector Database In-Memory Fallback Warning
* **Problem**: In [vector_store.py](file:///c:/LegalEye/server/app/services/vector_store.py#L34), if connection to the `QDRANT_URL` fails, it falls back to an **in-memory database** (`location=":memory:"`). 
* **Danger**: If your production server loses connection to Qdrant temporarily, it will start silently storing new embeddings in-memory. When the server restarts, all that data will be lost!
* **Fix**: Remove the in-memory fallback for production mode, and instead raise a connection error so the request fails cleanly and prompts a retry.

---

## 🚀 Deployment Strategy A: Managed Serverless Cloud (Easiest)

This approach uses fully-managed SaaS/PaaS backends, requiring no server maintenance.

### 1. Database & Vector DB Services
1. **MongoDB Atlas**:
   - Create a free or shared cluster.
   - Go to **Network Access** and whitelist the IP address of your application server (or allow `0.0.0.0/0` if hosting on platforms with dynamic IPs like Render).
   - Copy the Connection String.
2. **Qdrant Cloud**:
   - Create a free-tier cluster in Qdrant Cloud.
   - Note down the cluster URL and generate an API key.

### 2. Backend Deployment (Render or Railway)
1. Link your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Choose **Web Service** and specify the server environment details:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` (set root directory to `server` or configure base path).
3. Inject the production Environment Variables (see [Server Environment Variables](#1-server-environment-variables-serverenv)).

### 3. Frontend Deployment (Vercel or Netlify)
1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** of the project to `client`.
3. Select the **Vite** framework preset.
4. Add the frontend Environment Variables:
   - `VITE_API_URL`: Your backend Web Service domain (e.g. `https://legaleye-api.onrender.com/api/v1`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
5. Click **Deploy**. Vercel will automatically build the React assets and serve them globally via their edge CDN.

---

## 🐳 Deployment Strategy B: Self-Hosted Docker Compose (Recommended for VPS)

If you own a Virtual Private Server (VPS) like AWS EC2, DigitalOcean Droplet, or Linode, Docker Compose allows you to deploy the entire stack using a single setup command.

### 1. Backend Dockerfile (`server/Dockerfile`)
Create this file inside the `server/` directory:
```dockerfile
FROM python:3.11-slim

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONTONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /workspace

# Install system dependencies needed for PyMuPDF compilation if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port and start FastAPI server
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### 2. Frontend Dockerfile (`client/Dockerfile`)
Create this file inside the `client/` directory for a high-performance multi-stage build:
```dockerfile
# Stage 1: Build the React Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pass build variables
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# Stage 2: Serve the Static Files via Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

*Note: For the SPA router to work, create `client/nginx.conf` containing:*
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Docker Compose Configuration (`docker-compose.yml`)
Create this master orchestration file in the project root:
```yaml
version: '3.8'

services:
  # 1. Reverse Proxy (Nginx / HTTPS)
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx_prod.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - client
      - server

  # 2. Frontend Client
  client:
    build:
      context: ./client
      args:
        - VITE_API_URL=https://legaleye.yourdomain.com/api/v1
        - VITE_GOOGLE_CLIENT_ID=your-google-client-id
    expose:
      - "80"
    restart: unless-stopped

  # 3. Backend API
  server:
    build: ./server
    expose:
      - "8001"
    environment:
      - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legaleye
      - DATABASE_NAME=legaleye
      - JWT_SECRET=your-jwt-production-secret-key
      - JWT_ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
      - QDRANT_URL=http://qdrant:6333
      - GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
      - GOOGLE_CLIENT_ID=your-google-client-id
    volumes:
      - uploads_volume:/workspace/uploads
    depends_on:
      - qdrant
    restart: unless-stopped

  # 4. Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    expose:
      - "6333"
    volumes:
      - qdrant_volume:/qdrant/storage
    restart: unless-stopped

volumes:
  uploads_volume:
  qdrant_volume:
```

### 4. Running the Stack
Log into your VPS, clone the repo, update the environment variables in `docker-compose.yml`, and execute:
```bash
docker-compose up -d --build
```
This runs the client, backend, local Qdrant server, and an Nginx ingress gateway completely detached in the background with automatic restarts on reboot.
