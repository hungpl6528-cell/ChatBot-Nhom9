"""
app/api/v1/chat.py
Chat sandbox API endpoints — RAG pipeline with streaming support
"""
from typing import List, Optional
import json
import asyncio
import time

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.domain.database import get_db
from app.domain.schemas import ChatRequest, ChatResponse
from app.domain import models
from app.core.security import get_current_user_optional
from app.repositories.mysql_repo import QuestionRepository, AnswerRepository
from app.use_cases.chat import run_chat
from app.use_cases.ingestion import get_embedding_model
from app.repositories.vector_repo import VectorRepository
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    RAG Chat endpoint.
    Gửi câu hỏi → lấy ngữ cảnh từ ChromaDB → gọi LLM → trả lời.
    """
    # Attach authenticated user id if available
    if current_user and not payload.user_id:
        payload = payload.model_copy(update={"user_id": current_user.id})

    try:
        return await run_chat(payload, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions", response_model=list)
def get_sessions(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    """
    Lấy danh sách các phiên chat (sessions).
    Nếu đã xác thực, lọc theo user hiện tại.
    """
    uid = user_id
    if current_user and uid is None:
        uid = current_user.id

    q_repo = QuestionRepository(db)
    return q_repo.get_sessions_by_user(user_id=uid)


@router.get("/history/{session_id}", response_model=list)
def get_history(session_id: str, db: Session = Depends(get_db)):
    """
    Lấy lịch sử chat của một session — trả về danh sách {question, answers}.
    """
    q_repo = QuestionRepository(db)
    questions = q_repo.get_by_session(session_id)
    result = []
    for q in questions:
        result.append({
            "id": q.id,
            "question": q.noi_dung_cau_hoi,
            "created_at": q.created_at.isoformat(),
            "answers": [
                {
                    "id": a.id,
                    "answer": a.noi_dung_tra_loi,
                    "response_time": a.response_time,
                    "model_used": a.model_used,
                    "created_at": a.created_at.isoformat(),
                }
                for a in q.answers
            ],
        })
    return result


@router.delete("/sessions/{session_id}", response_model=dict)
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
):
    """
    Xóa toàn bộ lịch sử chat của một session.
    """
    q_repo = QuestionRepository(db)
    questions = q_repo.get_by_session(session_id)
    if not questions:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    for q in questions:
        db.delete(q)
    db.commit()
    return {"message": f"Đã xóa session {session_id}", "deleted": len(questions)}
