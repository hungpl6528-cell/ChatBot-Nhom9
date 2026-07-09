"""
app/domain/schemas.py
Pydantic v2 Schemas — Validation & Serialization
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ─────────────────────────────────────────────
# USER SCHEMAS
# ─────────────────────────────────────────────
class UserCreate(BaseModel):
    ten: str = Field(..., min_length=2, max_length=100, example="Nguyễn Văn A")
    email: EmailStr
    mat_khau: str = Field(..., min_length=6, max_length=72, example="password123")


class UserLogin(BaseModel):
    email: EmailStr
    mat_khau: str = Field(..., max_length=72)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ten: str
    email: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─────────────────────────────────────────────
# DOCUMENT SCHEMAS
# ─────────────────────────────────────────────
class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    ten_file: str
    mon_hoc: Optional[str] = None
    trang_thai: str
    so_chunks: int = 0
    embedding_model: Optional[str] = None
    ngay_upload: datetime


class DocumentListResponse(BaseModel):
    total: int
    items: List[DocumentResponse]


# ─────────────────────────────────────────────
# CHAT SCHEMAS
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000, example="Định nghĩa của RAG là gì?")
    session_id: str = Field(..., example="session_abc123")
    user_id: Optional[int] = None
    ai_model: str = Field(default="gemini-2.5-flash", example="gemini-2.5-flash")
    embedding_model: str = Field(
        default="models/gemini-embedding-2",
        example="models/gemini-embedding-2"
    )
    chunking_strategy: str = Field(default="recursive", example="recursive")
    top_k: int = Field(default=5, ge=1, le=20)
    document_ids: Optional[List[int]] = None  # Lọc theo tài liệu cụ thể


class ContextSource(BaseModel):
    chunk_id: str
    content: str
    source_file: str
    page: Optional[int] = None
    score: float


class ChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    answer_id: int
    question_id: int
    answer: str
    response_time: float
    sources: List[ContextSource] = []
    model_used: str
    embedding_model: str
    chunking_strategy: str


# ─────────────────────────────────────────────
# QUESTION / ANSWER SCHEMAS
# ─────────────────────────────────────────────
class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    noi_dung_cau_hoi: str
    session_id: str
    created_at: datetime


class AnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    noi_dung_tra_loi: str
    response_time: float
    question_id: int
    model_used: Optional[str]
    embedding_model: Optional[str]
    chunking_strategy: Optional[str]
    created_at: datetime


# ─────────────────────────────────────────────
# EXPERIMENT SCHEMAS
# ─────────────────────────────────────────────
class ExperimentCreate(BaseModel):
    ten_thu_nghiem: str = Field(..., min_length=2, max_length=255)
    mo_ta: Optional[str] = None
    chunking_strategy: Literal["fixed-size", "semantic", "recursive"] = "recursive"
    embedding_model: Literal[
        "models/gemini-embedding-2",
        "models/text-embedding-004",
        "multilingual-e5-base",
        "BAAI/bge-m3"
    ] = "models/gemini-embedding-2"
    ai_model: str = Field(default="gemini-2.5-flash")
    user_id: Optional[int] = None


class ExperimentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ten_thu_nghiem: str
    mo_ta: Optional[str]
    chunking_strategy: str
    embedding_model: str
    ai_model: str
    trang_thai: str
    created_at: datetime
    completed_at: Optional[datetime] = None


# ─────────────────────────────────────────────
# EVALUATION SCHEMAS
# ─────────────────────────────────────────────
class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    experiment_id: int
    answer_id: Optional[int]
    accuracy: Optional[float]
    relevancy: Optional[float]
    faithfulness: Optional[float]
    latency: Optional[float]
    overall_score: Optional[float]
    created_at: datetime


# ─────────────────────────────────────────────
# REPORT / DASHBOARD SCHEMAS
# ─────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_documents: int
    total_questions: int
    avg_response_time: float
    avg_accuracy: float
    avg_relevancy: float
    avg_faithfulness: float


class ExperimentComparisonItem(BaseModel):
    experiment_id: int
    ten_thu_nghiem: str
    chunking_strategy: str
    embedding_model: str
    avg_accuracy: Optional[float]
    avg_relevancy: Optional[float]
    avg_faithfulness: Optional[float]
    avg_latency: Optional[float]
    avg_overall: Optional[float]


class ReportResponse(BaseModel):
    stats: DashboardStats
    comparisons: List[ExperimentComparisonItem]
