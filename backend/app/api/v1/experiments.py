"""
app/api/v1/experiments.py
Experiment management and benchmark execution endpoints
"""
import asyncio
from typing import List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.domain.database import get_db
from app.domain.schemas import ExperimentCreate, ExperimentResponse, EvaluationResponse
from app.domain import models
from app.core.security import get_current_user_optional
from app.repositories.mysql_repo import ExperimentRepository, EvaluationRepository
from app.use_cases.benchmark import run_benchmark

router = APIRouter(prefix="/experiments", tags=["Experiments"])


@router.post("/", response_model=ExperimentResponse, status_code=201)
def create_experiment(
    payload: ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_optional),
):
    """Tạo cấu hình thử nghiệm mới."""
    repo = ExperimentRepository(db)
    user_id = current_user.id if current_user else payload.user_id
    exp = repo.create(
        ten_thu_nghiem=payload.ten_thu_nghiem,
        mo_ta=payload.mo_ta,
        chunking_strategy=payload.chunking_strategy,
        embedding_model=payload.embedding_model,
        ai_model=payload.ai_model,
        user_id=user_id,
    )
    return exp


@router.get("/", response_model=List[ExperimentResponse])
def list_experiments(db: Session = Depends(get_db)):
    """Danh sách tất cả thử nghiệm."""
    return ExperimentRepository(db).list_all()


@router.get("/{exp_id}", response_model=ExperimentResponse)
def get_experiment(exp_id: int, db: Session = Depends(get_db)):
    """Chi tiết một thử nghiệm."""
    exp = ExperimentRepository(db).get_by_id(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Thử nghiệm không tồn tại")
    return exp


@router.post("/{exp_id}/run", response_model=dict)
async def run_experiment(
    exp_id: int,
    background_tasks: BackgroundTasks,
    max_questions: int = 20,
    db: Session = Depends(get_db),
):
    """
    Khởi chạy benchmark cho thử nghiệm (chạy background).
    Returns immediately with experiment status.
    """
    exp = ExperimentRepository(db).get_by_id(exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Thử nghiệm không tồn tại")
    if exp.trang_thai == "running":
        raise HTTPException(status_code=409, detail="Thử nghiệm đang chạy")

    background_tasks.add_task(_run_benchmark_task, exp_id, max_questions)
    return {
        "message": f"Bắt đầu chạy thử nghiệm '{exp.ten_thu_nghiem}'",
        "experiment_id": exp_id,
        "status": "running",
    }


async def _run_benchmark_task(exp_id: int, max_questions: int):
    """Background task wrapper — creates its own DB session."""
    from app.domain.database import SessionLocal
    db = SessionLocal()
    try:
        await run_benchmark(exp_id, db, max_questions=max_questions)
    except Exception as e:
        from app.repositories.mysql_repo import ExperimentRepository
        ExperimentRepository(db).update_status(exp_id, "failed")
    finally:
        db.close()


@router.get("/{exp_id}/evaluations", response_model=List[EvaluationResponse])
def get_evaluations(exp_id: int, db: Session = Depends(get_db)):
    """Kết quả đánh giá của một thử nghiệm."""
    return EvaluationRepository(db).get_by_experiment(exp_id)
