import logging
from typing import List

import numpy as np
from groq import Groq
from huggingface_hub import InferenceClient

from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------------------------
# Groq LLM client (for chat completions)
# ---------------------------------------------------------------------------
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# ---------------------------------------------------------------------------
# HuggingFace Inference API client (for embeddings)
# ---------------------------------------------------------------------------
# Using the cloud Inference API instead of a local SentenceTransformer model.
# This eliminates the ~500MB RAM + PyTorch requirement on Railway.
# The model intfloat/multilingual-e5-small runs on HuggingFace's servers.
# ---------------------------------------------------------------------------
HF_EMBEDDING_MODEL = "intfloat/multilingual-e5-small"

hf_client = InferenceClient(
    api_key=settings.HUGGINGFACE_API_TOKEN or None
)

# ---------------------------------------------------------------------------
# LLM configuration
# ---------------------------------------------------------------------------
# llama-3.3-70b-versatile is natively multilingual and can read / reason /
# respond in 30+ languages out of the box.
_LLM_MODEL = "llama-3.3-70b-versatile"

# A lightweight system message that primes every request for multilingual use.
_SYSTEM_MESSAGE = (
    "You are LegalEye, an expert multilingual AI legal assistant. "
    "You can read and reason about legal documents written in any language. "
    "Always reply in the SAME language as the user's question, using the "
    "correct script (e.g. Devanagari for Hindi, Arabic script for Arabic, "
    "Gujarati script for Gujarati, etc.). "
    "Never translate the question; answer it directly in the original language."
)


def _normalize_embedding(raw) -> List[float]:
    """
    Normalize the HuggingFace Inference API response to a flat list of floats.
    The API can return:
      - np.ndarray of shape (384,)       ← single text
      - np.ndarray of shape (1, 384)     ← single text wrapped in batch dim
      - list of floats                   ← single text as plain list
    """
    arr = np.array(raw, dtype=np.float32)
    if arr.ndim == 2:
        arr = arr[0]   # unwrap batch dimension
    return arr.tolist()


def generate_embedding(text: str, prefix: str = "query") -> List[float]:
    """
    Generate a 384-dimensional multilingual embedding for *text* via the
    HuggingFace Inference API.

    intfloat/multilingual-e5-small requires task-specific prefixes:
      • prefix="query"   (default) — for user questions / search queries
      • prefix="passage"           — for document chunks at index time
    """
    prefixed_text = f"{prefix}: {text}"
    raw = hf_client.feature_extraction(prefixed_text, model=HF_EMBEDDING_MODEL)
    return _normalize_embedding(raw)


def generate_embeddings_batch(texts: List[str], prefix: str = "query") -> List[List[float]]:
    """
    Batch-encode a list of texts via a single HuggingFace Inference API call.
    Returns a list of 384-dimensional embedding vectors.
    """
    prefixed = [f"{prefix}: {t}" for t in texts]
    raw = hf_client.feature_extraction(prefixed, model=HF_EMBEDDING_MODEL)
    arr = np.array(raw, dtype=np.float32)
    # arr shape: (n_texts, 384)
    if arr.ndim == 1:
        # Single item returned as flat array — wrap it
        arr = arr.reshape(1, -1)
    return arr.tolist()


def generate_response(prompt: str) -> str:
    """
    Send *prompt* to the LLM and return the generated text.

    A persistent system message ensures the model stays in multilingual mode
    regardless of the language detected in the prompt.
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