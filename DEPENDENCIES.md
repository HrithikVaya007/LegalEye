# Project Dependencies & Import Guide 📦

This document serves as the master reference for all libraries and critical import statements required for the **LegalEye AI** project.

---

## 🛠️ Backend (FastAPI)

### Core Infrastructure
**Requirements:** `fastapi`, `uvicorn`, `python-dotenv`, `pydantic-settings`

**In `main.py`:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings
```

### Database (MongoDB)
**Requirements:** `motor`

**In `app/db/mongodb.py`:**
```python
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
```

### Document Processing
**Requirements:** `PyMuPDF` (fitz)

**In `app/services/document_service.py`:**
```python
import fitz  # PyMuPDF
import uuid
from typing import List, Dict
```

### Vector Search & Embeddings
**Requirements:** `qdrant-client`, `sentence-transformers`

**In `app/services/vector_store.py`:**
```python
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
```

### AI & LLM Service
**Requirements:** `openai`

**In `app/services/ai_service.py`:**
```python
import logging
from typing import List, Dict, Optional
from openai import OpenAI
from app.core.config import settings
```

### Authentication & Security
**Requirements:** `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`

**In `app/core/security.py`:**
```python
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
```

---

## 🎨 Frontend (React)

### Core UI & Animation
**Dependencies:** `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`

**Usage Example:**
```javascript
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Search, MessageSquare } from 'lucide-react';
```

### Navigation & Routing
**Dependencies:** `react-router-dom`

**In `App.jsx`:**
```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
```

### State & API
**Dependencies:** `axios`, `lucide-react` (for loaders)

**Usage Example:**
```javascript
import axios from 'axios';
import { Loader2 } from 'lucide-react';
```

### Data Visualization
**Dependencies:** `recharts`

**In `Dashboard.jsx`:**
```javascript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
```

---

## 🚀 Environment Setup

### Backend
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `.\venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`

### Frontend
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
