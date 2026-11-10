import os
import json
from pathlib import Path
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Load .env variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

def check_qdrant():
    """
    Connects to Qdrant (checking http://localhost:6333 first, with fallback to QDRANT_URL from .env),
    scrolls the 'uploaded_docs' collection, and prints total points and character length of the first chunk.
    """
    url = "http://localhost:6333"
    api_key = None

    # Connect to Qdrant
    try:
        client = QdrantClient(url=url, timeout=5.0)
        # Test connection
        _ = client.get_collections()
        print(f"Connected successfully to local Qdrant at: {url}")
    except Exception as e:
        print(f"Could not connect to {url} ({e}).")
        fallback_url = os.getenv("QDRANT_URL")
        fallback_key = os.getenv("QDRANT_API_KEY")
        print(f"Falling back to cloud QDRANT_URL from .env: {fallback_url}")
        url = fallback_url
        api_key = fallback_key
        client = QdrantClient(url=url, api_key=api_key, timeout=120.0)

    collection_name = "uploaded_docs"

    try:
        collection_info = client.get_collection(collection_name)
        total_points = collection_info.points_count
        print(f"\n==========================================")
        print(f"Collection: '{collection_name}'")
        print(f"Total points: {total_points}")
        print(f"==========================================")

        # Scroll points to inspect the chunks
        records, _ = client.scroll(
            collection_name=collection_name,
            limit=10,
            with_payload=True
        )

        if records:
            first_point = records[0]
            payload = first_point.payload or {}

            # Extract chunk text
            node_content_str = payload.get("_node_content")
            chunk_text = ""
            if node_content_str:
                try:
                    node_data = json.loads(node_content_str)
                    chunk_text = node_data.get("text", "")
                except Exception:
                    chunk_text = str(node_content_str)
            else:
                chunk_text = payload.get("text", "")

            print(f"First chunk ID: {first_point.id}")
            print(f"First chunk character length: {len(chunk_text)}")
            print(f"Document name: {payload.get('document_name', 'Unknown')}")
            print(f"Page number: {payload.get('page_number', 'Unknown')}")
            print(f"\nFirst chunk snippet (first 250 chars):")
            print(f"------------------------------------------")
            print(chunk_text[:250])
            print(f"------------------------------------------")
        else:
            print("No records found in 'uploaded_docs' collection.")

    except Exception as e:
        print(f"Error accessing collection '{collection_name}': {e}")

if __name__ == "__main__":
    check_qdrant()
