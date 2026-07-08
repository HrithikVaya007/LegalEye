import logging
from typing import List
from app.core.config import settings
from groq import Groq

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer

client = Groq(
    api_key=settings.GROQ_API_KEY
)

# ---------------------------------------------------------------------------
# Embedding model
# ---------------------------------------------------------------------------
# paraphrase-multilingual-MiniLM-L12-v2:
#   • Supports 50+ languages including Hindi, Gujarati, Arabic, Chinese,
#     Japanese, Korean, French, Spanish, Portuguese, German, Russian, etc.
#   • Outputs 384-dimensional vectors — matches the existing Qdrant collection.
#   • A single model handles all languages; no per-language switching needed.
# ---------------------------------------------------------------------------
model = SentenceTransformer(
    "paraphrase-multilingual-MiniLM-L12-v2"
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


def generate_embedding(text: str) -> List[float]:
    """
    Generate a 384-dimensional multilingual embedding for *text*.
    Works for any language / script supported by the model.
    """
    embedding = model.encode(text)
    return embedding.tolist()


def generate_response(prompt: str) -> str:
    """
    Send *prompt* to the LLM and return the generated text.

    A persistent system message ensures the model stays in multilingual mode
    regardless of the language detected in the prompt.
    """
    response = client.chat.completions.create(
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