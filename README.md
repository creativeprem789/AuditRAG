# AuditRAG

AuditRAG is an automated regulatory compliance and audit verification platform powered by Retrieval-Augmented Generation (RAG).

## Architecture

This repository is organized as a unified full-stack monorepo:

```
AuditRAG/
├── frontend/          # Next.js 14 / React Dashboard & Interactive PDF Viewer
│   ├── src/           # Components, Telemetry, PDF Annotator, Fallback Handlers
│   ├── public/        # Statutory Ground Truth PDFs & Assets
│   └── package.json
└── backend/           # FastAPI, LlamaIndex, Qdrant & Cohere Pipeline
    ├── api/           # API Endpoints (/api/v1/audit)
    ├── services/      # RAG Pipeline, Parser, Qdrant Vector Client
    ├── main.py        # Application Entrypoint with CORS & LLM Redundancy
    └── requirements.txt
```

---

## Deployment Guide

### 1. Deploying the Backend (Render / Railway)
- **Repository**: `creativeprem789/AuditRAG`
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Required Environment Variables**:
  - `QDRANT_URL`: URL of your remote Qdrant cluster
  - `QDRANT_API_KEY`: API key for Qdrant
  - `COHERE_API_KEY`: Cohere embedding & reranking API key
  - `LLAMA_CLOUD_API_KEY`: LlamaParse document extraction API key
  - `GROQ_API_KEY`: Groq API key for high-speed inference (uses `openai/gpt-oss-120b` or configurable via `GROQ_MODEL`)
  - `GEMINI_API_KEY`: Google Gemini API key (fallback)

### 2. Deploying the Frontend (Vercel)
- **Repository**: `creativeprem789/AuditRAG`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Framework Preset**: `Next.js`
- **Environment Variables**:
  - `NEXT_PUBLIC_BACKEND_URL`: URL of your deployed backend (e.g. `https://auditrag-backend.onrender.com`)

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## License
MIT License. See [LICENSE](LICENSE) for details.
