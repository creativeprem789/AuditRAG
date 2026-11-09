# AuditRAG Backend

A FastAPI backend that uses a **Retrieval-Augmented Generation (RAG)** pipeline to audit documents against a rulebook. It ingests documents into a Qdrant vector store, embeds them via Hugging Face, and uses Groq + Cohere to deliver a structured JSON compliance verdict.

---

## 📁 Folder Structure

```
backend/
├── .env                   # Environment variables (API keys, DB URLs) — never committed
├── .gitignore             # Git exclusions (venv, __pycache__, .env, etc.)
├── requirements.txt       # All Python dependencies
├── main.py                # App entry point — creates the FastAPI app, registers middleware & routes
│
├── api/
│   ├── __init__.py        # Marks api/ as a Python package
│   └── routes.py          # All HTTP route definitions (e.g. POST /api/v1/audit)
│
├── services/
│   ├── __init__.py        # Marks services/ as a Python package
│   ├── ai_pipeline.py     # Groq LLM + Cohere reranker — executes the compliance audit query
│   ├── qdrant_client.py   # Qdrant vector store client — ingests and retrieves document chunks
│   └── parser.py          # Document parsing logic (LlamaParse integration)
│
└── database/
    ├── __init__.py        # Marks database/ as a Python package
    ├── db_setup.py        # SQLAlchemy engine and session factory setup
    └── models.py          # ORM table definitions (audit jobs, results, etc.)
```

---

## 🧩 Module Descriptions

### `main.py`
The FastAPI application entry point. Loads environment variables from `.env` using `python-dotenv`, configures CORS middleware, and mounts the API router. Run this file to start the server.

```bash
python main.py
# or
uvicorn main:app --reload
```

---

### `api/routes.py`
Defines all REST API endpoints using `APIRouter`. Currently exposes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check — confirms the server is awake |
| `POST` | `/api/v1/audit` | Accepts a file upload + optional claim, runs the full audit pipeline |

---

### `services/ai_pipeline.py`
The core RAG audit engine:
- Connects to the existing Qdrant `rulebook` collection
- Fetches the top 20 semantically similar rule chunks via Hugging Face BGE-M3 embeddings
- Reranks them down to the top 4 using **Cohere Rerank**
- Passes the compressed context to the **Groq LLM** with a strict JSON auditor prompt
- Returns a structured verdict: `status`, `confidence_score`, `violated_rule_section`, `explanation`

---

### `services/qdrant_client.py`
Handles document ingestion into Qdrant:
- Accepts a list of `LlamaIndex Document` objects
- Chunks them using `MarkdownNodeParser` → `SentenceSplitter` (1024 tokens, 200 overlap)
- Embeds each chunk via the **Hugging Face Inference API** (BAAI/bge-m3, serverless — no local download)
- Stores vectors in the specified Qdrant cloud collection

---

### `services/parser.py`
Handles raw file parsing (PDF, DOCX, etc.) via **LlamaParse**:
- Converts uploaded files into structured `LlamaIndex Document` objects
- Preserves document metadata (filename, page number) for traceability

---

### `database/db_setup.py`
Configures the SQLAlchemy async engine and session factory using the `MYSQL_URL` from `.env`. Provides a dependency-injectable `get_db()` session for use in routes.

---

### `database/models.py`
Defines SQLAlchemy ORM models for persisting audit state:
- **AuditJob** — tracks each upload (job ID, filename, status, timestamp)
- **AuditResult** — stores the final JSON verdict linked to a job

---

## 🔑 Environment Variables (`.env`)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq Cloud API key for LLM inference |
| `HF_TOKEN` | Hugging Face token for serverless embeddings (BGE-M3) |
| `COHERE_API_KEY` | Cohere API key for reranking |
| `LLAMA_CLOUD_API_KEY` | LlamaParse API key for document parsing |
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Qdrant Cloud JWT API key |
| `MYSQL_URL` | SQLAlchemy-compatible MySQL connection string |

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/creativeprem789/AuditRag_backend.git
cd AuditRag_backend/backend

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Add your API keys
cp .env.example .env       # then fill in your keys

# 5. Run the server
python main.py
```

Server will be live at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Framework | FastAPI + Uvicorn |
| Vector Store | Qdrant Cloud |
| Embeddings | Hugging Face Inference API (BAAI/bge-m3) |
| LLM | Groq Cloud |
| Reranker | Cohere Rerank |
| RAG Orchestration | LlamaIndex |
| Document Parsing | LlamaParse |
| Database ORM | SQLAlchemy + PyMySQL |
| Env Management | python-dotenv |

