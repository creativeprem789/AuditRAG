from pathlib import Path
from dotenv import load_dotenv

# Load .env before any service or route modules initialize their clients
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

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

