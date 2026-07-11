import logging
import time
from typing import List

import numpy as np
import requests
from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------------------------
# Groq LLM client (for chat completions)
# ---------------------------------------------------------------------------
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# ---------------------------------------------------------------------------
# HuggingFace Inference API Config
# ---------------------------------------------------------------------------
HF_EMBEDDING_MODEL = "intfloat/multilingual-e5-small"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_EMBEDDING_MODEL}"

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


def _call_hf_inference_api(payload: dict) -> list:
    """
    Directly query the HuggingFace Inference API via requests to bypass task-checking.
    Includes handling and retries for model cold starts.
    """
    headers = {}
    if settings.HUGGINGFACE_API_TOKEN:
        headers["Authorization"] = f"Bearer {settings.HUGGINGFACE_API_TOKEN}"

    for attempt in range(6):
        try:
            response = requests.post(
                HF_API_URL,
                headers=headers,
                json=payload,
                timeout=45
            )
            res_json = response.json()

            # Handle model loading / cold start
            if isinstance(res_json, dict) and "error" in res_json:
                error_msg = res_json.get("error", "")
                if "currently loading" in error_msg or "estimated_time" in res_json:
                    wait_time = min(float(res_json.get("estimated_time", 5)), 10.0)
                    logger.info(f"HuggingFace model is currently loading. Waiting {wait_time}s (attempt {attempt+1}/6)...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise ValueError(f"HuggingFace API error: {error_msg}")

            if response.status_code != 200:
                raise ValueError(f"HuggingFace API returned status {response.status_code}: {res_json}")

            return res_json
        except Exception as e:
            if attempt == 5:
                logger.error(f"Failed to fetch embeddings from HuggingFace after 6 attempts: {e}")
                raise e
            logger.warning(f"HF API request failed (attempt {attempt+1}/6): {e}")
            time.sleep(2.0)

    raise ValueError("Failed to retrieve embeddings from HuggingFace: Max retries exceeded.")


def _flatten_to_1d(data) -> List[float]:
    """Recursively flatten nested list structure down to a 1D list of floats."""
    if not isinstance(data, list):
        return [float(data)]
    if len(data) > 0 and isinstance(data[0], list):
        return _flatten_to_1d(data[0])
    return [float(x) for x in data]


def _flatten_to_2d(data, expected_count: int) -> List[List[float]]:
    """Flatten nested list structure down to a list of lists of floats."""
    if not isinstance(data, list):
        raise ValueError("Invalid response format from HuggingFace API")

    if expected_count == 1:
        return [_flatten_to_1d(data)]

    # If HuggingFace returns a 3D list like [[[...], [...]]], unwrap the outer dimension if it has length 1
    if len(data) == 1 and isinstance(data[0], list) and len(data[0]) > 0 and isinstance(data[0][0], list):
        return _flatten_to_2d(data[0], expected_count)

    result = []
    for item in data:
        result.append(_flatten_to_1d(item))
    return result


def generate_embedding(text: str, prefix: str = "query") -> List[float]:
    """
    Generate a 384-dimensional multilingual embedding for *text* via the
    HuggingFace Inference API.
    """
    prefixed_text = f"{prefix}: {text}"
    raw = _call_hf_inference_api({"inputs": prefixed_text})
    return _flatten_to_1d(raw)


def generate_embeddings_batch(texts: List[str], prefix: str = "query") -> List[List[float]]:
    """
    Batch-encode a list of texts via a single HuggingFace Inference API call.
    """
    if not texts:
        return []
    prefixed = [f"{prefix}: {t}" for t in texts]
    raw = _call_hf_inference_api({"inputs": prefixed})
    return _flatten_to_2d(raw, len(texts))


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