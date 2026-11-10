from pathlib import Path
import os
from dotenv import load_dotenv

# Load .env before any service or route modules initialize their clients
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from llama_index.core import Settings
from llama_index.llms.gemini import Gemini

# Global LlamaIndex LLM configuration to use Gemini 3.8 Flash
Settings.llm = Gemini(model="models/gemini-2.0-flash", api_key=os.getenv("GEMINI_API_KEY"), timeout=120.0)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as audit_router

app = FastAPI(title="AuditRAG API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to Vercel URL in production
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

