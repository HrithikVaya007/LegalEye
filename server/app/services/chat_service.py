from app.services.ai_service import (
    generate_embedding,
    generate_response
)

from app.services.vector_store import (
    semantic_search
)


def process_chat(
    question: str,
    user_id: str
):
    query_embedding = generate_embedding(question)

    results = semantic_search(
        query_embedding,
        user_id=user_id,
        limit=3
    )

    if not results:
        return {
            "answer": (
                "No relevant reference material was found in your library "
                "matching this query. Please ensure you have uploaded "
                "documents related to this topic."
            ),
            "citations": []
        }

    context = "\n\n".join(
        [
            result.payload.get("text", "")
            for result in results
        ]
    )

    prompt = f"""You are LegalEye, an expert AI legal assistant specialised in
analysing legal documents written in ANY language.

════════════════════════════════════════
LANGUAGE RULES  (STRICTLY ENFORCED)
════════════════════════════════════════
1. Detect the script/language of the Question below automatically.
2. Reply ENTIRELY in that same language and script — do NOT mix languages.
   • English question   → English answer
   • Hindi question (Devanagari)  → full Hindi answer in Devanagari script
   • Gujarati question  → full Gujarati answer in Gujarati script
   • Arabic question    → full Arabic answer in Arabic script (RTL)
   • French / Spanish / Portuguese / German / any other language → reply in
     that exact language
3. Legal terminology may be kept in the original document language only when
   there is no accurate translation; in that case, add a brief explanation
   in the reply language.
4. Never answer in English when the question is in another language.

════════════════════════════════════════
CONTENT RULES
════════════════════════════════════════
• Answer ONLY from the Context provided below.
• If the answer is not contained in the Context, say so clearly and briefly
  in the same language as the Question — do not fabricate information.
• Cite specific clauses, sections, or page numbers when possible.
• Keep your response concise and legally precise.

════════════════════════════════════════
Context (extracted from uploaded documents):
════════════════════════════════════════
{context}

════════════════════════════════════════
Question:
════════════════════════════════════════
{question}
"""

    answer = generate_response(prompt)

    citations = []

    for result in results:
        text = result.payload.get("text", "").strip()
        doc_name = result.payload.get("document_name", "Unknown Document")
        page = result.payload.get("page", 1)
        lang = result.payload.get("language", "unknown")

        citations.append(
            {
                "docName": doc_name,
                "page": page,
                "language": lang,
                "excerpt": text[:180] + "..." if len(text) > 180 else text
            }
        )

    return {
        "answer": answer,
        "citations": citations
    }