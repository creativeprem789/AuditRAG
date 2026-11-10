import os
import json
import asyncio
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

# Ensure .env is loaded whenever this service is imported directly or indirectly
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type

from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.prompts import PromptTemplate
from llama_index.llms.gemini import Gemini
from llama_index.postprocessor.cohere_rerank import CohereRerank
from llama_index.embeddings.cohere import CohereEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# Global LlamaIndex Settings
Settings.llm = Gemini(
    model="models/gemini-2.0-flash",
    api_key=os.getenv("GEMINI_API_KEY"),
    timeout=120.0
)
Settings.embed_model = CohereEmbedding(
    cohere_api_key=os.getenv("COHERE_API_KEY"),
    model_name="embed-english-v3.0"
)
Settings.chunk_size = 512
Settings.chunk_overlap = 50

def init_settings():
    """Lazily configure LLM and embedding settings if not already set."""
    if Settings.llm is None or not isinstance(Settings.llm, Gemini):
        Settings.llm = Gemini(
            model="models/gemini-2.0-flash",
            api_key=os.getenv("GEMINI_API_KEY"),
            timeout=120.0
        )
    if Settings.embed_model is None or not isinstance(Settings.embed_model, CohereEmbedding):
        Settings.embed_model = CohereEmbedding(
            cohere_api_key=os.getenv("COHERE_API_KEY"),
            model_name="embed-english-v3.0"
        )

# 3. The Critic Agent Prompt (Enforces strict JSON)
AUDITOR_SYSTEM_PROMPT = """
You are an elite, merciless compliance auditor. Evaluate the TARGET CLAIM strictly against the RETRIEVED RULES.
Do not use outside knowledge. If the rules lack context, state "Insufficient regulatory context."

TARGET CLAIM: {query_str}

RETRIEVED RULES:
{context_str}

Respond ONLY in valid JSON format matching this schema:
{
  "status": "violation" | "compliant" | "insufficient_data",
  "confidence_score": 0.0 to 1.0,
  "violated_rule_section": "String of the section cited, or null",
  "explanation": "A concise, 2-sentence explanation of the ruling."
}
"""
prompt_template = PromptTemplate(AUDITOR_SYSTEM_PROMPT)

# 4. Resilience Strategy: Exponential Backoff with Jitter
@retry(
    retry=retry_if_exception_type(Exception),
    wait=wait_random_exponential(multiplier=1.5, max=20),
    stop=stop_after_attempt(4),
    reraise=True
)
def _execute_with_retries(query_engine, claim: str):
    """Wraps the actual LLM API call to catch and retry transient errors."""
    print(f"Evaluating claim: '{claim[:50]}...'")
    response = query_engine.query(claim)
    return response.response

# 5. The Main Exported Function
async def execute_audit_query(claim: str, collection_name: str = "rulebook") -> Dict[str, Any]:
    """
    Connects to Qdrant, fetches 20 chunks, reranks them to the top 4 using Cohere, 
    and passes them to the Groq Critic Agent for a final JSON verdict.
    """
    try:
        init_settings()
        cohere_api_key = os.getenv("COHERE_API_KEY")

        # A. Connect to the existing Qdrant vectors
        client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
        vector_store = QdrantVectorStore(client=client, collection_name=collection_name)
        index = VectorStoreIndex.from_vector_store(vector_store)

        # B. Configure the Cohere Reranker
        # It takes the top 20 fuzzy matches and uses AI to compress them down to the 4 most accurate.
        cohere_rerank = CohereRerank(api_key=cohere_api_key, top_n=4)

        # C. Build the Query Engine
        query_engine = index.as_query_engine(
            similarity_top_k=20, # Fetch a wide net initially
            node_postprocessors=[cohere_rerank], # Apply the reranker filter
            text_qa_template=prompt_template, # Force the JSON prompt
            response_mode="compact"
        )

        # D. Execute with Tenacity Retries (off-thread to not block the async event loop)
        raw_json_string = await asyncio.to_thread(_execute_with_retries, query_engine, claim)
        
        # E. Parse and return safely
        try:
            return json.loads(raw_json_string)
        except json.JSONDecodeError:
            # Fallback if the LLM hallucinates markdown backticks around the JSON
            clean_str = raw_json_string.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_str)

    except Exception as e:
        print(f"Audit Pipeline Failed: {str(e)}")
        raise e
