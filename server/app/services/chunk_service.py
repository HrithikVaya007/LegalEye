import re
from typing import List


# Sentence-boundary pattern that handles:
#   • Latin / European scripts  (.  !  ?)
#   • Devanagari (Hindi / Sanskrit / Marathi) and Gujarati  (।  ॥)
#   • Arabic / Urdu full-stop  (۔)
#   • CJK sentence enders  (。！？…)
#   • Korean / Japanese variants
_SENTENCE_END = re.compile(
    r'(?<=[.!?।॥۔。！？…])\s+'  # after common sentence-enders
    r'|(?<=\n)\s*\n'             # blank-line paragraph break
)


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[str]:
    """
    Split *text* into overlapping chunks that respect sentence / paragraph
    boundaries for all Unicode scripts.

    Strategy
    --------
    1. Split on sentence-ending punctuation (works for Latin, Devanagari,
       Arabic, CJK, etc.).
    2. Accumulate sentences until the chunk reaches *chunk_size* characters.
    3. When a sentence is itself longer than *chunk_size* (e.g. a table row
       or a very long line), fall back to character-level splitting with
       *overlap* so we never produce empty chunks.
    4. Carry the last *overlap* characters from the previous chunk forward
       so cross-boundary context is preserved.
    """
    if not text or not text.strip():
        return []

    sentences = [s.strip() for s in _SENTENCE_END.split(text) if s.strip()]

    # If the splitter found nothing useful, treat the whole text as one unit
    if not sentences:
        sentences = [text.strip()]

    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for sentence in sentences:
        sentence_len = len(sentence)

        # Single sentence is already larger than one chunk → split it hard
        if sentence_len > chunk_size:
            # Flush whatever is accumulated first
            if current:
                chunks.append(" ".join(current))
                current, current_len = [], 0

            start = 0
            while start < sentence_len:
                end = start + chunk_size
                piece = sentence[start:end]
                chunks.append(piece)
                start += chunk_size - overlap
            continue

        # Would this sentence overflow the current chunk?
        if current_len + sentence_len + 1 > chunk_size and current:
            chunk_text_str = " ".join(current)
            chunks.append(chunk_text_str)

            # Carry-over: keep the tail of the previous chunk for context
            carry = chunk_text_str[-overlap:] if overlap else ""
            current = [carry, sentence] if carry else [sentence]
            current_len = len(carry) + sentence_len + (1 if carry else 0)
        else:
            current.append(sentence)
            current_len += sentence_len + 1  # +1 for joining space

    # Flush remaining sentences
    if current:
        chunks.append(" ".join(current))

    return [c for c in chunks if c.strip()]