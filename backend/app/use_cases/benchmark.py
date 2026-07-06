"""
app/use_cases/benchmark.py
Benchmark use case:
  - Load test set from docs/testset/testset.json
  - For each question: run RAG with configured strategy/model
  - Evaluate each answer
  - Aggregate and save results to Evaluations table
"""
from __future__ import annotations
import json
import logging
import os
import time
import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.domain.schemas import ChatRequest
from app.repositories.mysql_repo import ExperimentRepository, EvaluationRepository
from app.use_cases.chat import run_chat
from app.use_cases.evaluation import compute_scores

logger = logging.getLogger(__name__)

TESTSET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "doc", "testset.json"
)


def load_testset(path: str = TESTSET_PATH) -> List[Dict[str, Any]]:
    """Load the testset JSON file."""
    try:
        abs_path = os.path.abspath(path)
        with open(abs_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Support both list and {"questions": [...]} format
        if isinstance(data, list):
            return data
        return data.get("questions", data.get("items", []))
    except FileNotFoundError:
        logger.warning(f"[Benchmark] testset.json not found at {abs_path}")
        return []


async def run_benchmark(
    experiment_id: int,
    db: Session,
    max_questions: int = 20,
    document_ids: Optional[List[int]] = None,
) -> Dict[str, Any]:
    """
    Run benchmark for a given experiment configuration.
    Returns aggregate scores.
    """
    exp_repo = ExperimentRepository(db)
    eval_repo = EvaluationRepository(db)

    experiment = exp_repo.get_by_id(experiment_id)
    if not experiment:
        raise ValueError(f"Experiment {experiment_id} not found")

    # Mark running
    exp_repo.update_status(experiment_id, "running")

    testset = load_testset()
    if not testset:
        exp_repo.update_status(experiment_id, "failed")
        raise ValueError("Test set is empty or not found")

    questions_to_run = testset[:max_questions]
    all_scores = []

    logger.info(
        f"[Benchmark] Running experiment {experiment_id} "
        f"({experiment.chunking_strategy} / {experiment.embedding_model}) "
        f"on {len(questions_to_run)} questions"
    )

    for item in questions_to_run:
        question_text = item.get("question") or item.get("noi_dung", "")
        ground_truth = item.get("ground_truth") or item.get("dap_an_chuan", "")

        if not question_text:
            continue

        try:
            chat_req = ChatRequest(
                question=question_text,
                session_id=f"benchmark_{experiment_id}",
                ai_model=experiment.ai_model,
                embedding_model=experiment.embedding_model,
                chunking_strategy=experiment.chunking_strategy,
                top_k=5,
                document_ids=document_ids,
            )

            response = await run_chat(chat_req, db)

            # Extract context texts for evaluation
            contexts = [s.content for s in response.sources]

            scores = compute_scores(
                question=question_text,
                answer=response.answer,
                contexts=contexts,
                ground_truth=ground_truth or None,
                response_time=response.response_time,
            )

            # Save evaluation record
            eval_repo.create(
                experiment_id=experiment_id,
                answer_id=response.answer_id,
                accuracy=scores["accuracy"],
                relevancy=scores["relevancy"],
                faithfulness=scores["faithfulness"],
                latency=scores["latency"],
                overall_score=scores["overall_score"],
            )

            all_scores.append(scores)
            logger.info(f"  Q: {question_text[:50]}... → overall={scores['overall_score']}")

        except Exception as e:
            logger.error(f"[Benchmark] Question failed: {e}\n{traceback.format_exc()}")
            continue

    # Aggregate
    if not all_scores:
        exp_repo.update_status(experiment_id, "failed")
        raise RuntimeError("No questions were successfully evaluated")

    def avg(key):
        vals = [s[key] for s in all_scores if s.get(key) is not None]
        return round(sum(vals) / len(vals), 4) if vals else 0.0

    summary = {
        "experiment_id": experiment_id,
        "questions_evaluated": len(all_scores),
        "avg_accuracy": avg("accuracy"),
        "avg_relevancy": avg("relevancy"),
        "avg_faithfulness": avg("faithfulness"),
        "avg_latency_ms": avg("latency"),
        "avg_overall": avg("overall_score"),
    }

    exp_repo.update_status(experiment_id, "completed", completed_at=datetime.utcnow())
    logger.info(f"[Benchmark] Experiment {experiment_id} completed: {summary}")

    return summary
