import os
import asyncio
from services.parser import parse_pdf_to_documents
from services.qdrant_client import ingest_documents_to_qdrant

async def seed_rulebook():
    pdf_files = [
        "knowledge_base/DPDP_Act_2023.pdf",
        "knowledge_base/PCI_DSS_Trimmed.pdf"
    ]

    all_documents = []

    for pdf_path in pdf_files:
        if not os.path.exists(pdf_path):
            print(f"❌ Error: Could not find {pdf_path}. Check the folder and filename.")
            return

        filename = os.path.basename(pdf_path)
        print(f"\n📄 Parsing {filename}...")
        
        # We now pass the path directly to LlamaParse
        documents = await parse_pdf_to_documents(pdf_path, filename)
        all_documents.extend(documents)
        print(f"✅ Extracted {len(documents)} pages from {filename}.")
        
        # Brief pause to respect rate limits
        await asyncio.sleep(5)

    print(f"\n🚀 Ingesting {len(all_documents)} total pages into Qdrant 'rulebook' collection...")
    
    result = await ingest_documents_to_qdrant(all_documents, "rulebook")
    
    print("\n🎉 Database Seeded Successfully!")
    print(f"Total vector chunks inserted: {result.get('chunks_inserted', 'Unknown')}")

if __name__ == "__main__":
    asyncio.run(seed_rulebook())