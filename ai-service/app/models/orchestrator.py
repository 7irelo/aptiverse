import logging
from typing import Any, Optional

from app.models.diary_model import analyze_diary
from app.models.recommender import generate_report
from app.models.test_gen_model import generate_test

logger = logging.getLogger(__name__)


async def run_all_models(
    student_id: str,
    diary_text: Optional[str] = None,
    scores: Optional[dict[str, list[float]]] = None,
    goal_progress: Optional[dict] = None,
    test_subject: Optional[str] = None,
) -> dict[str, Any]:
    """Run all available AI models for a student and return an aggregated result.

    Each sub-model is executed independently so a failure in one does not
    block the others.  Results are keyed by model name.
    """
    results: dict[str, Any] = {"student_id": student_id}
    errors: list[str] = []

    # ── Diary emotion analysis ────────────────────────────────────────
    diary_emotions = None
    if diary_text:
        try:
            diary_emotions = analyze_diary(diary_text)
            results["diary"] = {"emotions": diary_emotions}
        except Exception as exc:
            logger.warning("diary model failed: %s", exc)
            errors.append(f"diary: {exc}")

    # ── Performance report ────────────────────────────────────────────
    if scores or diary_emotions or goal_progress:
        try:
            report = generate_report(
                scores=scores,
                diary_emotions=diary_emotions,
                goal_progress=goal_progress,
            )
            results["report"] = report
        except Exception as exc:
            logger.warning("recommender model failed: %s", exc)
            errors.append(f"report: {exc}")

    # ── Practice test generation ──────────────────────────────────────
    if test_subject:
        try:
            test = generate_test(subject=test_subject)
            results["practice_test"] = test
        except Exception as exc:
            logger.warning("test_gen model failed: %s", exc)
            errors.append(f"test_gen: {exc}")

    # ── Summary ───────────────────────────────────────────────────────
    models_run = [k for k in results if k != "student_id"]
    results["models_run"] = models_run
    results["models_count"] = len(models_run)

    if errors:
        results["errors"] = errors

    return results
