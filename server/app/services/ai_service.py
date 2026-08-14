import logging
import time
import requests
import hashlib
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
_HF_API_URLS = [
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    "https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5",
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5"
]

_MAX_RETRIES = 2
_RETRY_DELAY = 2


def _generate_fallback_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Fallback deterministic embedding generator (384-dim) if external HF API is unreachable.
    Uses SHA-256 token hashing with L2 normalization to produce a valid 384-dim unit vector.
    """
    vec = [0.0] * dim
    words = text.lower().split()
    if not words:
        return vec
    for word in words:
        h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        val = 1.0 if (h % 2 == 0) else -1.0
        vec[idx] += val
    norm = sum(x * x for x in vec) ** 0.5
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


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
                    timeout=15
                )

                if response.status_code == 503:
                    wait_time = _RETRY_DELAY
                    logger.warning(
                        f"HF model is loading (attempt {attempt + 1}/{_MAX_RETRIES}). "
                        f"Retrying in {wait_time}s..."
                    )
                    time.sleep(wait_time)
                    continue

                if response.status_code != 200:
                    logger.warning(f"HF API status {response.status_code} for {api_url}: {response.text[:100]}")
                    continue

                return response.json()
            except Exception as e:
                last_exception = e
                logger.warning(f"Attempt {attempt + 1} for {api_url} failed: {e}")
                time.sleep(1)

    raise RuntimeError(f"HuggingFace Inference API failed: {last_exception}")


def _parse_embedding(result) -> List[float]:
    """
    Parse HF API response into a flat 384-dim embedding vector.
    """
    if not result:
        return [0.0] * 384

    if isinstance(result, list) and len(result) > 0:
        if isinstance(result[0], float):
            return result
        elif isinstance(result[0], list):
            if isinstance(result[0][0], float):
                return _mean_pool(result)
            elif isinstance(result[0][0], list):
                return _mean_pool(result[0])

    return [0.0] * 384


def generate_embedding(text: str, prefix: str = "query") -> List[float]:
    """
    Generate a 384-dimensional embedding for text.
    """
    try:
        result = _call_hf_api(text)
        emb = _parse_embedding(result)
        if any(emb):
            return emb
    except Exception as e:
        logger.warning(f"Single embedding failed: {e}. Using fallback generator.")

    return _generate_fallback_embedding(text)


def generate_embeddings_batch(texts: List[str], prefix: str = "query") -> List[List[float]]:
    """
    Batch-encode a list of texts with automatic fallback to local token-hashing.
    """
    if not texts:
        return []

    try:
        results = _call_hf_api(texts)
        if isinstance(results, list) and len(results) == len(texts):
            embeddings = []
            for result in results:
                embeddings.append(_parse_embedding(result))
            return embeddings
    except Exception as e:
        logger.warning(f"Batch embedding failed via HF API: {e}. Using fallback generator.")

    return [_generate_fallback_embedding(text) for text in texts]


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
    Send prompt to the LLM and return the generated text.
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