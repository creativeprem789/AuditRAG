# AuditRAG

AuditRAG is an automated regulatory compliance and audit verification platform powered by Retrieval-Augmented Generation (RAG).

## Repository Architecture

This repository maintains separate branches for development prior to unified production deployment:

- **[`frontend`](https://github.com/creativeprem789/AuditRAG/tree/frontend)**: Next.js 14 / React application featuring an interactive PDF viewer, violation explorer, critic feed, and audit telemetry.
- **[`backend`](https://github.com/creativeprem789/AuditRAG/tree/backend)**: FastAPI backend powered by LlamaIndex, Qdrant vector database, Cohere reranking & embeddings, and LLM compliance auditor agents.

---
*The `frontend` and `backend` branches are isolated during development and will be merged into `main` upon final production deployment.*
