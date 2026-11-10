from pathlib import Path
import os
from dotenv import load_dotenv

# Load .env before any service or route modules initialize their clients
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.llms.gemini import Gemini

# LLM Redundancy: Groq with Gemini fallback (defaults to high-throughput openai/gpt-oss-120b)
groq_api_key = os.getenv("GROQ_API_KEY")
if groq_api_key and groq_api_key.strip():
    groq_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    Settings.llm = Groq(model=groq_model, api_key=groq_api_key)
else:
    Settings.llm = Gemini(model="models/gemini-3.8-flash", api_key=os.getenv("GEMINI_API_KEY"), timeout=120.0)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as audit_router

app = FastAPI(title="AuditRAG API", version="1.0")

# Permissive CORS Policy for Vercel production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the routes from api/routes.py
app.include_router(audit_router, prefix="/api/v1")

@app.get("/ping")
async def keep_alive():
    return {"status": "awake"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

