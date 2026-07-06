"""
app/repositories/mysql_repo.py
CRUD operations on MySQL via SQLAlchemy ORM
"""
from __future__ import annotations
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.domain import models
from app.core.security import hash_password


# ─────────────────────────────────────────────
# USER REPOSITORY
# ─────────────────────────────────────────────
class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, ten: str, email: str, mat_khau: str) -> models.User:
        user = models.User(
            ten=ten,
            email=email,
            mat_khau=hash_password(mat_khau),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_email(self, email: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.email == email).first()

    def get_by_id(self, user_id: int) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def list_all(self) -> List[models.User]:
        return self.db.query(models.User).all()


# ─────────────────────────────────────────────
# DOCUMENT REPOSITORY
# ─────────────────────────────────────────────
class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, ten_file: str, mon_hoc: Optional[str] = None) -> models.Document:
        doc = models.Document(user_id=user_id, ten_file=ten_file, mon_hoc=mon_hoc)
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_by_id(self, doc_id: int) -> Optional[models.Document]:
        return self.db.query(models.Document).filter(models.Document.id == doc_id).first()

    def list_by_user(self, user_id: int) -> List[models.Document]:
        return (
            self.db.query(models.Document)
            .filter(models.Document.user_id == user_id)
            .order_by(models.Document.ngay_upload.desc())
            .all()
        )

    def list_all(self) -> List[models.Document]:
        return self.db.query(models.Document).order_by(models.Document.ngay_upload.desc()).all()

    def update_status(
        self,
        doc_id: int,
        trang_thai: str,
        so_chunks: int = 0,
        embedding_model: Optional[str] = None,
    ) -> Optional[models.Document]:
        doc = self.get_by_id(doc_id)
        if doc:
            doc.trang_thai = trang_thai
            doc.so_chunks = so_chunks
            if embedding_model:
                doc.embedding_model = embedding_model
            self.db.commit()
            self.db.refresh(doc)
        return doc

    def delete(self, doc_id: int) -> bool:
        doc = self.get_by_id(doc_id)
        if doc:
            self.db.delete(doc)
            self.db.commit()
            return True
        return False

    def count(self) -> int:
        return self.db.query(func.count(models.Document.id)).scalar() or 0


# ─────────────────────────────────────────────
# QUESTION REPOSITORY
# ─────────────────────────────────────────────
class QuestionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self, noi_dung: str, session_id: str, user_id: Optional[int] = None
    ) -> models.Question:
        q = models.Question(
            noi_dung_cau_hoi=noi_dung,
            session_id=session_id,
            user_id=user_id,
        )
        self.db.add(q)
        self.db.commit()
        self.db.refresh(q)
        return q

    def get_by_session(self, session_id: str) -> List[models.Question]:
        return (
            self.db.query(models.Question)
            .filter(models.Question.session_id == session_id)
            .order_by(models.Question.created_at)
            .all()
        )

    def count(self) -> int:
        return self.db.query(func.count(models.Question.id)).scalar() or 0


# ─────────────────────────────────────────────
# ANSWER REPOSITORY
# ─────────────────────────────────────────────
class AnswerRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        noi_dung: str,
        response_time: float,
        question_id: int,
        model_used: Optional[str] = None,
        embedding_model: Optional[str] = None,
        chunking_strategy: Optional[str] = None,
        context_sources: Optional[str] = None,
    ) -> models.Answer:
        a = models.Answer(
            noi_dung_tra_loi=noi_dung,
            response_time=response_time,
            question_id=question_id,
            model_used=model_used,
            embedding_model=embedding_model,
            chunking_strategy=chunking_strategy,
            context_sources=context_sources,
        )
        self.db.add(a)
        self.db.commit()
        self.db.refresh(a)
        return a

    def avg_response_time(self) -> float:
        result = self.db.query(func.avg(models.Answer.response_time)).scalar()
        return round(float(result), 3) if result else 0.0


# ─────────────────────────────────────────────
# EXPERIMENT REPOSITORY
# ─────────────────────────────────────────────
class ExperimentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        ten_thu_nghiem: str,
        chunking_strategy: str,
        embedding_model: str,
        ai_model: str = "gpt-4o-mini",
        mo_ta: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> models.Experiment:
        exp = models.Experiment(
            ten_thu_nghiem=ten_thu_nghiem,
            mo_ta=mo_ta,
            chunking_strategy=chunking_strategy,
            embedding_model=embedding_model,
            ai_model=ai_model,
            user_id=user_id,
        )
        self.db.add(exp)
        self.db.commit()
        self.db.refresh(exp)
        return exp

    def get_by_id(self, exp_id: int) -> Optional[models.Experiment]:
        return self.db.query(models.Experiment).filter(models.Experiment.id == exp_id).first()

    def list_all(self) -> List[models.Experiment]:
        return (
            self.db.query(models.Experiment)
            .order_by(models.Experiment.created_at.desc())
            .all()
        )

    def update_status(
        self,
        exp_id: int,
        trang_thai: str,
        completed_at=None,
    ) -> Optional[models.Experiment]:
        exp = self.get_by_id(exp_id)
        if exp:
            exp.trang_thai = trang_thai
            if completed_at:
                exp.completed_at = completed_at
            self.db.commit()
            self.db.refresh(exp)
        return exp


# ─────────────────────────────────────────────
# EVALUATION REPOSITORY
# ─────────────────────────────────────────────
class EvaluationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        experiment_id: int,
        answer_id: Optional[int],
        accuracy: Optional[float] = None,
        relevancy: Optional[float] = None,
        faithfulness: Optional[float] = None,
        latency: Optional[float] = None,
        overall_score: Optional[float] = None,
    ) -> models.Evaluation:
        ev = models.Evaluation(
            experiment_id=experiment_id,
            answer_id=answer_id,
            accuracy=accuracy,
            relevancy=relevancy,
            faithfulness=faithfulness,
            latency=latency,
            overall_score=overall_score,
        )
        self.db.add(ev)
        self.db.commit()
        self.db.refresh(ev)
        return ev

    def get_by_experiment(self, experiment_id: int) -> List[models.Evaluation]:
        return (
            self.db.query(models.Evaluation)
            .filter(models.Evaluation.experiment_id == experiment_id)
            .all()
        )

    def avg_scores(self):
        """Returns (avg_accuracy, avg_relevancy, avg_faithfulness) across all evaluations."""
        result = self.db.query(
            func.avg(models.Evaluation.accuracy),
            func.avg(models.Evaluation.relevancy),
            func.avg(models.Evaluation.faithfulness),
        ).first()
        if result:
            return (
                round(float(result[0] or 0), 3),
                round(float(result[1] or 0), 3),
                round(float(result[2] or 0), 3),
            )
        return 0.0, 0.0, 0.0

    def comparison_by_experiment(self) -> list:
        """Group evaluations by experiment for dashboard comparison."""
        rows = (
            self.db.query(
                models.Experiment.id,
                models.Experiment.ten_thu_nghiem,
                models.Experiment.chunking_strategy,
                models.Experiment.embedding_model,
                func.avg(models.Evaluation.accuracy).label("avg_accuracy"),
                func.avg(models.Evaluation.relevancy).label("avg_relevancy"),
                func.avg(models.Evaluation.faithfulness).label("avg_faithfulness"),
                func.avg(models.Evaluation.latency).label("avg_latency"),
                func.avg(models.Evaluation.overall_score).label("avg_overall"),
            )
            .join(models.Evaluation, models.Experiment.id == models.Evaluation.experiment_id)
            .group_by(models.Experiment.id)
            .all()
        )
        return rows
