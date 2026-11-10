# TODO: Implement Qdrant client service

import os
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv

# Ensure .env is loaded whenever this service is imported directly or indirectly
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from llama_index.core.schema import Document
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import MarkdownNodeParser, SentenceSplitter
from llama_index.embeddings.cohere import CohereEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# 1. Initialize the Qdrant Client connection globally
qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

_client = None

def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        _client = QdrantClient(url=url, api_key=api_key)
    return _client

async def ingest_documents_to_qdrant(documents: List[Document], collection_name: str) -> Dict[str, any]:
    """
    Takes LlamaIndex Documents, chunks them strictly by Markdown headers and token limits, 
    embeds them via the free Hugging Face API, and stores them in Qdrant.
    """
    try:
        # 2. Configure the Serverless Embedding Model (Cohere embed-english-v3.0)
        embed_model = CohereEmbedding(
            cohere_api_key=os.getenv("COHERE_API_KEY"),
            model_name="embed-english-v3.0"
        )

        # 3. Connect to the specific Qdrant Collection ("rulebook" or "uploaded_docs")
        vector_store = QdrantVectorStore(
            client=get_qdrant_client(), 
            collection_name=collection_name
        )

        # 4. Set up the exact Chunking Strategy
        pipeline = IngestionPipeline(
            transformations=[
                MarkdownNodeParser(),
                SentenceSplitter(chunk_size=512, chunk_overlap=50),
                embed_model
            ],
            vector_store=vector_store
        )

        # 5. Execute the pipeline asynchronously
        # .arun() handles the network calls to Hugging Face and Qdrant concurrently
        print(f"Ingesting {len(documents)} documents into '{collection_name}' collection...")
        nodes = await pipeline.arun(documents=documents)
        print(f"Successfully generated and inserted {len(nodes)} vector chunks.")

        return {
            "status": "success",
            "chunks_inserted": len(nodes),
            "collection": collection_name
        }
        
    except Exception as e:
        print(f"Error during Qdrant ingestion: {str(e)}")
        raise e