"""
app/domain/models.py
SQLAlchemy ORM Models — ánh xạ từ ERD & dtb.sql
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Enum,
    DateTime, ForeignKey, Boolean, func
)
from sqlalchemy.orm import relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────────
# 1. USERS
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ten = Column(String(100), nullable=False, comment="Tên người dùng")
    email = Column(String(255), nullable=False, unique=True, index=True)
    mat_khau = Column(String(255), nullable=False, comment="Bcrypt hash")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="user")
    experiments = relationship("Experiment", back_populates="user")


# ─────────────────────────────────────────────
# 2. DOCUMENTS
# ─────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ten_file = Column(String(255), nullable=False, comment="Tên file gốc")
    mon_hoc = Column(String(255), nullable=True, comment="Môn học / chủ đề")
    trang_thai = Column(
        Enum("pending", "processing", "ready", "error"),
        default="pending",
        nullable=False,
        index=True
    )
    so_chunks = Column(Integer, default=0, comment="Số chunks đã tạo")
    embedding_model = Column(String(100), nullable=True, comment="Model embedding đã dùng")
    ngay_upload = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="documents")


# ─────────────────────────────────────────────
# 3. QUESTIONS
# ─────────────────────────────────────────────
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    noi_dung_cau_hoi = Column(Text, nullable=False, comment="Nội dung câu hỏi")
    session_id = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# 4. ANSWERS
# ─────────────────────────────────────────────
class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    noi_dung_tra_loi = Column(Text, nullable=False, comment="Nội dung trả lời của LLM")
    response_time = Column(Float, default=0.0, comment="Thời gian phản hồi (giây)")
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    model_used = Column(String(100), nullable=True, comment="LLM model đã dùng")
    embedding_model = Column(String(100), nullable=True)
    chunking_strategy = Column(String(50), nullable=True)
    context_sources = Column(Text, nullable=True, comment="JSON danh sách nguồn trích dẫn")
    created_at = Column(DateTime, default=func.now())

    # Relationships
    question = relationship("Question", back_populates="answers")
    evaluations = relationship("Evaluation", back_populates="answer", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# 5. EXPERIMENTS
# ─────────────────────────────────────────────
class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ten_thu_nghiem = Column(String(255), nullable=False, comment="Tên thử nghiệm")
    mo_ta = Column(Text, nullable=True)
    chunking_strategy = Column(
        Enum("fixed-size", "semantic", "recursive"),
        nullable=False,
        comment="Chiến lược chunking"
    )
    embedding_model = Column(String(100), nullable=False)
    ai_model = Column(String(100), default="gpt-4o-mini")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    trang_thai = Column(
        Enum("pending", "running", "completed", "failed"),
        default="pending",
        nullable=False
    )
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="experiments")
    evaluations = relationship("Evaluation", back_populates="experiment", cascade="all, delete-orphan")


# ─────────────────────────────────────────────
# 6. EVALUATIONS
# ─────────────────────────────────────────────
class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id", ondelete="CASCADE"), nullable=True)
    accuracy = Column(Float, nullable=True, comment="Độ chính xác 0-1")
    relevancy = Column(Float, nullable=True, comment="Độ liên quan 0-1")
    faithfulness = Column(Float, nullable=True, comment="Độ trung thực 0-1")
    latency = Column(Float, nullable=True, comment="Độ trễ ms")
    overall_score = Column(Float, nullable=True, comment="Điểm tổng hợp")
    created_at = Column(DateTime, default=func.now())

    # Relationships
    experiment = relationship("Experiment", back_populates="evaluations")
    answer = relationship("Answer", back_populates="evaluations")
