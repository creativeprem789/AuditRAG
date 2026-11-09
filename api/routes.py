from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import uuid

from services.qdrant_client import ingest_documents_to_qdrant
from services.ai_pipeline import execute_audit_query
from llama_index.core.schema import Document

router = APIRouter()

@router.post("/audit")
async def run_audit(
    file: UploadFile = File(...),
    claim: Optional[str] = Form(None)
):
    try:
        job_id = str(uuid.uuid4())
        print(f"[{job_id}] Started Processing: {file.filename}")

        # MOCK: placeholder documents until parser.py is implemented
        mock_text = f"The uploaded architecture {file.filename} uses AES-128 encryption."
        mock_documents = [
            Document(
                text=mock_text,
                metadata={"document_name": file.filename, "page_number": 1}
            )
        ]

        ingestion_result = await ingest_documents_to_qdrant(
            documents=mock_documents,
            collection_name="uploaded_docs"
        )
        print(f"[{job_id}] Ingestion complete: {ingestion_result['chunks_inserted']} chunks inserted.")

        if not claim:
            claim = "Does this architecture meet data encryption standards?"

        final_report = await execute_audit_query(
            claim=claim,
            collection_name="rulebook"
        )

        return {
            "job_id": job_id,
            "report": final_report
        }

    except Exception as e:
        print(f"Error in /audit route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
