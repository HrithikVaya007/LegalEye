import logging
import time
import requests
from typing import List
from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------------------------
# Groq LLM client (for chat completions)
# ---------------------------------------------------------------------------
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# ---------------------------------------------------------------------------
# Hugging Face Inference API Config
# ---------------------------------------------------------------------------
# We use sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 which
# outputs 384-dimensional vectors, matching the existing Qdrant database.
# Instead of running locally with fastembed (which requires ~500MB+ RAM),
# we call the free HuggingFace Inference API remotely.
# ---------------------------------------------------------------------------
_HF_API_URLS = [
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5",
    "https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5"
]

# Maximum retries for HF API (model may need to warm up on first call)
_MAX_RETRIES = 3
_RETRY_DELAY = 5  # seconds


def _mean_pool(token_embeddings: list) -> List[float]:
    """Mean-pool token-level embeddings into a single sentence embedding."""
    if not token_embeddings:
        return []
    num_tokens = len(token_embeddings)
    dim = len(token_embeddings[0])
    pooled = [0.0] * dim
    for token_emb in token_embeddings:
        for i in range(dim):
            pooled[i] += token_emb[i]
    return [x / num_tokens for x in pooled]


def _get_hf_headers():
    token = getattr(settings, "HUGGINGFACE_API_TOKEN", "") or ""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _call_hf_api(inputs):
    """
    Call the HuggingFace Inference API with automatic retry logic.
    The model may be cold-starting on the first request, returning a
    'loading' status — we retry after a short delay in that case.
    """
    headers = _get_hf_headers()
    last_exception = None

    for api_url in _HF_API_URLS:
        for attempt in range(_MAX_RETRIES):
            try:
                response = requests.post(
                    api_url,
                    headers=headers,
                    json={"inputs": inputs, "options": {"wait_for_model": True}},
                    timeout=60
                )

                if response.status_code == 503:
                    # Model is loading — wait and retry
                    wait_time = response.json().get("estimated_time", _RETRY_DELAY) if response.headers.get("content-type", "").startswith("application/json") else _RETRY_DELAY
                    logger.warning(
                        f"HF model is loading (attempt {attempt + 1}/{_MAX_RETRIES}). "
                        f"Retrying in {wait_time:.0f}s..."
                    )
                    time.sleep(min(wait_time, 15))
                    continue

                if response.status_code != 200:
                    logger.error(f"HF API returned status {response.status_code} for {api_url}: {response.text}")

                response.raise_for_status()
                return response.json()
            except Exception as e:
                last_exception = e
                logger.warning(f"Attempt {attempt + 1} for {api_url} failed: {e}")
                time.sleep(1)

    raise RuntimeError(f"HuggingFace Inference API failed: {last_exception}")


def _parse_embedding(result) -> List[float]:
    """
    Parse the HF API response into a flat 384-dim embedding vector.
    The API may return:
      - 1D list (sentence embedding)        -> use directly
      - 2D list (token embeddings)           -> mean-pool
      - 3D list (batch of token embeddings)  -> mean-pool first item
    """
    if not result:
        return [0.0] * 384

    if isinstance(result[0], float):
        # Already a 1D sentence embedding
        return result
    elif isinstance(result[0], list):
        if isinstance(result[0][0], float):
            # 2D: list of token embeddings -> mean pool
            return _mean_pool(result)
        elif isinstance(result[0][0], list):
            # 3D: batch -> mean pool first item
            return _mean_pool(result[0])

    return [0.0] * 384


def generate_embedding(text: str, prefix: str = "query") -> List[float]:
    """
    Generate a 384-dimensional multilingual embedding for *text*
    using the HuggingFace Inference API.
    """
    result = _call_hf_api(text)
    return _parse_embedding(result)


def generate_embeddings_batch(texts: List[str], prefix: str = "query") -> List[List[float]]:
    """
    Batch-encode a list of texts via the HuggingFace Inference API.
    """
    if not texts:
        return []

    # HF API supports batch inputs as a list of strings
    results = _call_hf_api(texts)

    embeddings = []
    for result in results:
        embeddings.append(_parse_embedding(result))

    return embeddings


# ---------------------------------------------------------------------------
# LLM configuration
# ---------------------------------------------------------------------------
_LLM_MODEL = "llama-3.3-70b-versatile"

_SYSTEM_MESSAGE = (
    "You are LegalEye, an expert multilingual AI legal assistant. "
    "You can read and reason about legal documents written in any language. "
    "Always reply in the SAME language as the user's question, using the "
    "correct script (e.g. Devanagari for Hindi, Arabic script for Arabic, "
    "Gujarati script for Gujarati, etc.). "
    "Never translate the question; answer it directly in the original language."
)


def generate_response(prompt: str) -> str:
    """
    Send *prompt* to the LLM and return the generated text.
    """
    response = groq_client.chat.completions.create(
        model=_LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": _SYSTEM_MESSAGE
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content