"""
app/api/v1/reports.py
Dashboard & reports API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.domain.database import get_db
from app.domain.schemas import DashboardStats, ReportResponse, ExperimentComparisonItem
from app.repositories.mysql_repo import (
    DocumentRepository, QuestionRepository,
    AnswerRepository, EvaluationRepository
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """KPI tổng quan cho dashboard."""
    doc_count = DocumentRepository(db).count()
    q_count = QuestionRepository(db).count()
    avg_rt = AnswerRepository(db).avg_response_time()
    avg_acc, avg_rel, avg_faith = EvaluationRepository(db).avg_scores()

    return DashboardStats(
        total_documents=doc_count,
        total_questions=q_count,
        avg_response_time=avg_rt,
        avg_accuracy=avg_acc,
        avg_relevancy=avg_rel,
        avg_faithfulness=avg_faith,
    )


@router.get("/comparison", response_model=list)
def get_comparison(db: Session = Depends(get_db)):
    """So sánh hiệu năng giữa các thử nghiệm — dùng cho biểu đồ."""
    rows = EvaluationRepository(db).comparison_by_experiment()
    result = []
    for row in rows:
        result.append({
            "experiment_id": row[0],
            "ten_thu_nghiem": row[1],
            "chunking_strategy": row[2],
            "embedding_model": row[3],
            "avg_accuracy": round(float(row[4] or 0), 4),
            "avg_relevancy": round(float(row[5] or 0), 4),
            "avg_faithfulness": round(float(row[6] or 0), 4),
            "avg_latency": round(float(row[7] or 0), 2),
            "avg_overall": round(float(row[8] or 0), 4),
        })
    return result


@router.get("/full", response_model=ReportResponse)
def get_full_report(db: Session = Depends(get_db)):
    """Báo cáo đầy đủ: stats + comparison."""
    stats = get_dashboard_stats(db)
    comparison_raw = get_comparison(db)
    comparisons = [ExperimentComparisonItem(**item) for item in comparison_raw]
    return ReportResponse(stats=stats, comparisons=comparisons)
