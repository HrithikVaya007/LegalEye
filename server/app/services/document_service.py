import fitz
import uuid
import logging

from typing import List, Dict

from app.services.chunk_service import chunk_text

logger = logging.getLogger(__name__)



try:
    from langdetect import detect as _langdetect_detect  # pyrefly: ignore [missing-import]
    from langdetect.lang_detect_exception import LangDetectException  # pyrefly: ignore [missing-import]

    def _detect_language(text: str) -> str:
        """Return a BCP-47 language code (e.g. 'en', 'hi', 'ar', 'zh-cn')."""
        try:
            sample = text[:400]  # fast path – detect on leading 400 chars
            return _langdetect_detect(sample)
        except LangDetectException:
            return "unknown"

except ImportError:
    logger.warning(
        "langdetect is not installed. Language detection will be skipped. "
        "Run `pip install langdetect` to enable it."
    )

    def _detect_language(text: str) -> str:  # type: ignore[misc]
        return "unknown"


def extract_text(
    file_path: str
) -> List[Dict]:
    """
    Extract text from a PDF, split it into overlapping sentence-aware chunks,
    detect the language of each chunk, and return a list of chunk dicts ready
    for embedding and vector-store ingestion.

    Each returned dict contains:
        id            – unique UUID string
        page          – 1-based page number
        text          – chunk text
        language      – BCP-47 language code or 'unknown'
    """
    document = fitz.open(file_path)

    pages = []

    for page_number, page in enumerate(document):
        # sort=True preserves correct reading order for all scripts
        # (Hindi, Gujarati, Arabic, CJK, RTL, etc.)
        text = page.get_text("text", sort=True)

        # Fallback: if standard extraction returns nothing, try raw blocks
        if not text.strip():
            blocks = page.get_text("blocks", sort=True)
            text = "\n".join(b[4] for b in blocks if isinstance(b[4], str)).strip()

        if not text.strip():
            continue

        pages.append({
            "page": page_number + 1,
            "text": text
        })

    all_chunks = []

    for page in pages:
        chunks = chunk_text(page["text"])

        for chunk in chunks:
            detected_lang = _detect_language(chunk)

            all_chunks.append({
                "id": str(uuid.uuid4()),
                "page": page["page"],
                "text": chunk,
                "language": detected_lang
            })

    return all_chunks