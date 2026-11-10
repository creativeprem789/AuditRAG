import os
from pathlib import Path
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

        # Read uploaded bytes and save temporarily for parsing
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        temp_file_path = temp_dir / f"{job_id}_{file.filename}"

        file_bytes = await file.read()
        with open(temp_file_path, "wb") as f:
            f.write(file_bytes)

        documents = []
        try:
            # Parse PDF using LlamaParse
            from services.parser import parse_pdf_to_documents
            documents = await parse_pdf_to_documents(str(temp_file_path), file.filename)
            print(f"[{job_id}] LlamaParse extracted {len(documents)} page(s) from {file.filename}")
        except Exception as parse_error:
            print(f"[{job_id}] LlamaParse fallback triggered: {parse_error}")
            try:
                from pypdf import PdfReader
                reader = PdfReader(str(temp_file_path))
                for page_idx, page in enumerate(reader.pages):
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        documents.append(
                            Document(
                                text=page_text,
                                metadata={"document_name": file.filename, "page_number": page_idx + 1}
                            )
                        )
                print(f"[{job_id}] PyPDF fallback extracted {len(documents)} page(s) from {file.filename}")
            except Exception as fallback_error:
                print(f"[{job_id}] Fallback parsing error: {fallback_error}")

        if not documents:
            documents = [
                Document(
                    text=f"Uploaded document {file.filename}.",
                    metadata={"document_name": file.filename, "page_number": 1}
                )
            ]

        # Ingest through the chunking pipeline (SentenceSplitter: chunk_size=512, chunk_overlap=50)
        ingestion_result = await ingest_documents_to_qdrant(
            documents=documents,
            collection_name="uploaded_docs"
        )
        print(f"[{job_id}] Ingestion complete: {ingestion_result['chunks_inserted']} chunks inserted.")

        # Clean up temp file
        if temp_file_path.exists():
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

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
