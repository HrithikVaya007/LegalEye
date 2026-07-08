# LegalEye Development Roadmap 🚀

Now that the **Authentication System** is fully functional, here is the step-by-step guide to completing the LegalEye AI Assistant.

---

## Phase 2: Document Management (The Foundation)
The core of LegalEye is handling legal documents.
1.  **Backend: File Upload Endpoint**
    - Create `POST /documents/upload` in `app/api/endpoints/documents.py`.
    - Use `python-multipart` to handle file uploads.
    - Store files in the `server/uploads/` directory.
2.  **Backend: PDF Parsing Service**
    - Implement a service in `app/services/pdf_processor.py` using `PyMuPDF` (fitz) to extract text from legal PDFs.
3.  **Frontend: Upload Interface**
    - Update `UploadPage.jsx` with a drag-and-drop zone and a progress bar.
    - Connect it to the backend upload endpoint.

---

## Phase 3: AI & Semantic Search (The Brain)
Turning text into searchable data.
1.  **Backend: Vector Embeddings**
    - Integrate `sentence-transformers` or OpenAI to convert text into vectors.
    - Use **Qdrant** (already in requirements) to store these vectors.
2.  **Backend: Search Endpoint**
    - Create `GET /documents/search` to find relevant document chunks based on a user query.
3.  **Frontend: Search Page**
    - Implement a search bar in `SearchPage.jsx` that shows relevant document snippets.

---

## Phase 4: AI Chat & RAG (The Experience)
The primary way users interact with their data.
1.  **Backend: Chat Endpoint**
    - Create `POST /chat` in `app/api/endpoints/chat.py`.
    - **RAG Logic**: Search vector DB -> Send context to LLM (OpenAI/Claude) -> Return answer.
2.  **Frontend: Advanced Chat UI**
    - Update `ChatPage.jsx` with message bubbles, loading states, and "Citations" (links to the specific page/document the AI used).

---

## Phase 5: Library & Management (The Dashboard)
Managing the stored documents.
1.  **Backend: Document CRUD**
    - Endpoints to list all documents (`GET /documents`) and delete documents (`DELETE /documents/{id}`).
2.  **Frontend: Library Page**
    - Create a professional table in `LibraryPage.jsx` showing document name, upload date, and status (Processed/Failed).

---

## Phase 6: Final Polish & Deployment
1.  **Analytics Dashboard**
    - Show stats on `Dashboard.jsx`: Total documents, AI queries this month, etc.
2.  **Security Hardening**
    - Protect all non-auth routes with a JWT dependency.
3.  **Production Readiness**
    - Setup Docker and environment-based configuration.

---

### Suggested Next Immediate Step:
**Target Phase 2, Step 1**: Implement the **File Upload** backend so you can start populating your database with real legal documents.
