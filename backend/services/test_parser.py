import asyncio
from pathlib import Path

from services.parser import parse_pdf_to_documents


async def main():
    pdf_path = Path("sample.pdf")

    file_bytes = pdf_path.read_bytes()

    documents = await parse_pdf_to_documents(
        file_bytes=file_bytes,
        document_name=pdf_path.name
    )

    print("Parsing successful!")
    print("Total documents:", len(documents))

    print("\n--- FINAL VALIDATION ---")

    for doc in documents:
        print(
            f"Page {doc.metadata['page_number']}: "
            f"{len(doc.text)} characters"
        )

    print(
        "All documents have page metadata:",
        all("page_number" in doc.metadata for doc in documents)
    )

    print(
        "All documents have filename metadata:",
        all("document_name" in doc.metadata for doc in documents)
    )


if __name__ == "__main__":
    asyncio.run(main())