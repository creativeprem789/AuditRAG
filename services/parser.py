import os
import tempfile
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from llama_cloud import AsyncLlamaCloud
from llama_index.core.schema import Document


# Load .env from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


async def parse_pdf_to_documents(
    file_bytes: bytes,
    document_name: str
) -> List[Document]:

    if not file_bytes:
        raise ValueError("The uploaded PDF is empty.")

    api_key = os.getenv("LLAMA_CLOUD_API_KEY")

    if not api_key:
        raise ValueError("LLAMA_CLOUD_API_KEY is missing from .env")

    client = AsyncLlamaCloud(api_key=api_key)

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        uploaded_file = await client.files.create(
            file=temp_path,
            purpose="parse"
        )

        result = await client.parsing.parse(
            file_id=uploaded_file.id,
            tier="cost_effective",
            version="latest",
            expand=["markdown"]
        )

        if not result.markdown or not result.markdown.pages:
            raise ValueError("LlamaParse returned no Markdown pages.")

        documents = []

        for page in result.markdown.pages:
            page_text = page.markdown

            if not page_text:
                continue

            page_number = page.page_number

            documents.append(
                Document(
                    text=page_text,
                    metadata={
                        "document_name": document_name,
                        "page_number": page_number
                    }
                )
            )

        if not documents:
            raise ValueError("No usable page content was returned.")

        return documents

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
