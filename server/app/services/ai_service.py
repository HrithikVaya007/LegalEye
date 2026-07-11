import logging
from typing import List
from fastembed import TextEmbedding
from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------------------------------------------------------------------------
# Groq LLM client (for chat completions)
# ---------------------------------------------------------------------------
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# ---------------------------------------------------------------------------
# Local FastEmbed Config
# ---------------------------------------------------------------------------
# We use sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 which
# outputs 384-dimensional vectors, matching your current Qdrant database.
# It runs 100% locally using ONNX runtime, requiring no HuggingFace network
# requests at runtime and using under ~200MB memory (well within Railway's limits).
# ---------------------------------------------------------------------------
try:
    # Attempt to use /workspace/.fastembed_cache as cached directory (for Docker/Railway)
    embedding_model = TextEmbedding(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        cache_dir="/workspace/.fastembed_cache"
    )
    logger.info("Initializing fastembed model using /workspace/.fastembed_cache")
except Exception as e:
    logger.warning(f"Could not initialize with /workspace/.fastembed_cache: {e}. Falling back to default cache.")
    # Fallback for local development if /workspace is not writable
    embedding_model = TextEmbedding(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

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


def generate_embedding(text: str, prefix: str = "query") -> List[float]:
    """
    Generate a 384-dimensional multilingual embedding for *text* locally.
    """
    embeddings = list(embedding_model.embed([text]))
    return embeddings[0].tolist()


def generate_embeddings_batch(texts: List[str], prefix: str = "query") -> List[List[float]]:
    """
    Batch-encode a list of texts locally via FastEmbed.
    """
    if not texts:
        return []
    embeddings = list(embedding_model.embed(texts))
    return [e.tolist() for e in embeddings]


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