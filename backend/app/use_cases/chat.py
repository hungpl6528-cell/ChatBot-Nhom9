"""
app/use_cases/chat.py
RAG Chat pipeline:
  1. Embed the user question
  2. Retrieve top-k similar chunks from ChromaDB
  3. Build context-enriched prompt
  4. Call LLM (GPT-4o-mini)
  5. Save question & answer to MySQL
"""
from __future__ import annotations
import json
import time
import logging
from typing import Optional, List

from sqlalchemy.orm import Session
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings
from app.domain.schemas import ChatRequest, ChatResponse, ContextSource
from app.repositories.mysql_repo import QuestionRepository, AnswerRepository
from app.repositories.vector_repo import VectorRepository
from app.use_cases.ingestion import get_embedding_model

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Bạn là trợ lý học tập thông minh, hỗ trợ sinh viên giải đáp câu hỏi dựa trên tài liệu học tập.

Quy tắc trả lời:
1. Chỉ trả lời dựa trên CONTEXT được cung cấp bên dưới.
2. Nếu không tìm thấy thông tin trong context, hãy nói rõ: "Tôi không tìm thấy thông tin này trong tài liệu."
3. Trả lời bằng tiếng Việt, rõ ràng và có cấu trúc.
4. Không bịa đặt thông tin ngoài context.

CONTEXT:
{context}
"""


def build_context(sources: List[ContextSource]) -> str:
    """Build context string from retrieved chunks."""
    parts = []
    for i, src in enumerate(sources, 1):
        parts.append(f"[Nguồn {i} — {src.source_file}]\n{src.content}")
    return "\n\n---\n\n".join(parts)


async def run_chat(request: ChatRequest, db: Session) -> ChatResponse:
    """Execute full RAG chat pipeline."""
    start = time.time()

    q_repo = QuestionRepository(db)
    a_repo = AnswerRepository(db)
    vector_repo = VectorRepository()

    # 1. Save question
    question = q_repo.create(
        noi_dung=request.question,
        session_id=request.session_id,
        user_id=request.user_id,
    )

    try:
        # 2. Embed the question
        embedder = get_embedding_model(request.embedding_model)
        query_embedding = embedder.embed_query(request.question)

        # 3. Build where filter for document IDs
        where_filter = None
        if request.document_ids:
            where_filter = {"document_id": {"$in": request.document_ids}}

        # 4. Query ChromaDB
        results = vector_repo.query(
            query_embedding=query_embedding,
            embedding_model=request.embedding_model,
            top_k=request.top_k,
            where=where_filter,
        )

        # 5. Parse results into ContextSource objects
        sources: List[ContextSource] = []
        if results["ids"] and results["ids"][0]:
            for chunk_id, doc_text, meta, dist in zip(
                results["ids"][0],
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                sources.append(
                    ContextSource(
                        chunk_id=chunk_id,
                        content=doc_text,
                        source_file=meta.get("filename", "unknown"),
                        page=meta.get("page"),
                        score=round(1 - dist, 4),  # cosine similarity
                    )
                )

        # 6. Build prompt
        context_str = build_context(sources) if sources else "Không có tài liệu nào được tìm thấy."
        system_msg = SYSTEM_PROMPT.format(context=context_str)

        # 7. Call LLM
        llm = ChatGoogleGenerativeAI(
            model=request.ai_model,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
            max_tokens=1500,
        )
        messages = [
            SystemMessage(content=system_msg),
            HumanMessage(content=request.question),
        ]
        
        response = llm.invoke(messages)
        answer_text = response.content or ""

        elapsed = time.time() - start

        # 8. Save answer to MySQL
        answer = a_repo.create(
            noi_dung=answer_text,
            response_time=round(elapsed, 3),
            question_id=question.id,
            model_used=request.ai_model,
            embedding_model=request.embedding_model,
            chunking_strategy=request.chunking_strategy,
            context_sources=json.dumps(
                [s.model_dump() for s in sources], ensure_ascii=False
            ),
        )

        return ChatResponse(
            answer_id=answer.id,
            question_id=question.id,
            answer=answer_text,
            response_time=round(elapsed, 3),
            sources=sources,
            model_used=request.ai_model,
            embedding_model=request.embedding_model,
            chunking_strategy=request.chunking_strategy,
        )

    except Exception as e:
        logger.error(f"[Chat] Error: {e}")
        elapsed = time.time() - start
        # Save error answer
        a_repo.create(
            noi_dung=f"[Error] {str(e)}",
            response_time=round(elapsed, 3),
            question_id=question.id,
        )
        raise
