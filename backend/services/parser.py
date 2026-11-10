import os
import httpx
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from llama_cloud import AsyncLlamaCloud
from llama_index.core.schema import Document

# Load .env from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

async def parse_pdf_to_documents(file_path: str, document_name: str) -> List[Document]:
    api_key = os.getenv("LLAMA_CLOUD_API_KEY")
    
    if not api_key:
        raise ValueError("LLAMA_CLOUD_API_KEY is missing from .env")

    # Initialize the v2 client with a robust 10-minute timeout
    client = AsyncLlamaCloud(
        api_key=api_key, # Reverted back to api_key for the newest SDK
        timeout=httpx.Timeout(600.0)
    )

    print(f"  -> Uploading {document_name} to LlamaCloud (v2 API)...")
    
    # Stream the file securely from disk to prevent 499 Connection Drops
    with open(file_path, "rb") as f:
        uploaded_file = await client.files.create(
            file=(document_name, f, "application/pdf"),
            purpose="parse"
        )

    print(f"  -> Upload successful. Extracting text from {document_name}...")

    # Execute the v2 Parsing job
    result = await client.parsing.parse(
        file_id=uploaded_file.id,
        tier="cost_effective",
        version="latest",
        expand=["markdown"]
    )

    if not result.markdown or not result.markdown.pages:
        raise ValueError("LlamaCloud returned no Markdown pages.")

    documents = []

    for page in result.markdown.pages:
        page_text = page.markdown
        if not page_text:
            continue

        documents.append(
            Document(
                text=page_text,
                metadata={
                    "document_name": document_name,
                    "page_number": page.page_number
                }
            )
        )

    if not documents:
        raise ValueError("No usable page content was returned.")

    return documents