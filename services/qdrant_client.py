import os
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv

# Ensure .env is loaded whenever this service is imported directly or indirectly
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from llama_index.core import Settings
from llama_index.core.schema import Document
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.cohere import CohereEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, AsyncQdrantClient

# Global LlamaIndex chunking settings
Settings.text_splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
Settings.chunk_size = 512
Settings.chunk_overlap = 50

# 1. Initialize the Qdrant Client connections globally
_client = None
_aclient = None

def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"), timeout=60.0)
    return _client

def get_qdrant_aclient() -> AsyncQdrantClient:
    global _aclient
    if _aclient is None:
        _aclient = AsyncQdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"), timeout=60.0)
    return _aclient

async def ingest_documents_to_qdrant(documents: List[Document], collection_name: str) -> Dict[str, any]:
    """
    Takes LlamaIndex Documents, chunks them strictly by Markdown headers and token limits, 
    embeds them via the free Cohere API, and stores them in Qdrant.
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
            aclient=get_qdrant_aclient(),
            collection_name=collection_name
        )

        # 4. Set up the exact Chunking Strategy with SentenceSplitter (512 tokens, 50 overlap)
        splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
        Settings.text_splitter = splitter

        pipeline = IngestionPipeline(
            transformations=[
                splitter,
                embed_model
            ],
            vector_store=vector_store
        )

        # 5. Execute the pipeline asynchronously
        # .arun() handles the network calls to Cohere and Qdrant concurrently
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