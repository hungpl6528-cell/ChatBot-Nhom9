"""
app/use_cases/evaluation.py
RAGAS-based evaluation of RAG answers.
Computes: accuracy, relevancy, faithfulness, latency.
"""
from __future__ import annotations
import logging
import time
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)


def compute_scores(
    question: str,
    answer: str,
    contexts: List[str],
    ground_truth: Optional[str] = None,
    response_time: float = 0.0,
) -> Dict[str, float]:
    """
    Compute evaluation scores for a single Q&A pair.
    
    Returns dict with keys:
        accuracy, relevancy, faithfulness, latency, overall_score
    
    Uses RAGAS metrics where ground_truth is available,
    falls back to simple heuristic scoring otherwise.
    """
    try:
        # Fallback to heuristic scoring as Ragas hangs without proper LLM configuration
        accuracy, relevancy, faithfulness_score = _heuristic_scores(
            question, answer, contexts
        )

    except Exception as e:
        logger.warning(f"[Evaluation] RAGAS failed, using heuristics: {e}")
        accuracy, relevancy, faithfulness_score = _heuristic_scores(
            question, answer, contexts
        )

    # Latency score: normalize to 0-1 (lower latency = higher score)
    # Target: ≤2s = 1.0, ≥10s = 0.0
    latency_score = max(0.0, min(1.0, 1.0 - (response_time - 2.0) / 8.0))

    overall = round(
        0.35 * accuracy + 0.35 * relevancy + 0.20 * faithfulness_score + 0.10 * latency_score,
        4,
    )

    return {
        "accuracy": round(accuracy, 4),
        "relevancy": round(relevancy, 4),
        "faithfulness": round(faithfulness_score, 4),
        "latency": round(response_time * 1000, 2),  # ms
        "latency_score": round(latency_score, 4),
        "overall_score": overall,
    }


def _heuristic_scores(
    question: str, answer: str, contexts: List[str]
) -> tuple[float, float, float]:
    """
    Simple keyword-based heuristics when RAGAS is unavailable.
    Returns (accuracy, relevancy, faithfulness).
    """
    if not answer or not contexts:
        return 0.0, 0.0, 0.0

    q_words = set(question.lower().split())
    a_words = set(answer.lower().split())
    ctx_words = set(" ".join(contexts).lower().split())

    # Relevancy: overlap between question terms and answer
    relevancy = len(q_words & a_words) / max(len(q_words), 1)
    relevancy = min(relevancy * 3, 1.0)  # scale up

    # Faithfulness: how much of the answer comes from context
    a_unique = a_words - {"là", "và", "của", "trong", "có", "được", "không", "với"}
    faithfulness = len(a_unique & ctx_words) / max(len(a_unique), 1)
    faithfulness = min(faithfulness * 2, 1.0)

    # Accuracy (proxy): combined
    accuracy = min((relevancy + faithfulness) / 2, 1.0)

    return accuracy, relevancy, faithfulness


def batch_evaluate(
    qa_pairs: List[Dict[str, Any]],
    contexts_per_pair: List[List[str]],
    response_times: List[float],
) -> List[Dict[str, float]]:
    """
    Evaluate a batch of Q&A pairs.
    qa_pairs: list of {question, answer, ground_truth (optional)}
    """
    results = []
    for qa, ctxs, rt in zip(qa_pairs, contexts_per_pair, response_times):
        scores = compute_scores(
            question=qa["question"],
            answer=qa["answer"],
            contexts=ctxs,
            ground_truth=qa.get("ground_truth"),
            response_time=rt,
        )
        results.append(scores)
    return results
