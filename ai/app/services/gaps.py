"""Knowledge-Gap Detector → mastery.knowledge_gaps.

Inputs : low topic mastery (mastery.topic_masteries) + wrong-answer concepts in
         practice items (practice.practice_attempt_items joined to
         practice.practice_attempts).
Method : per (student_subject, topic) blend a low-mastery signal and a practice
         error-rate signal into a single 0..1 gap score, then rate severity by
         1-D clustering (KMeans over the gap scores) with a threshold fallback.
         Track the most-recent practice timestamp per topic as last_tested.
Weight : medium. Cadence: nightly (after mastery).

Runs AFTER the Mastery Estimator: it reads the mastery levels that service has
already written and overlays fresh practice errors on top.

Schema (verbatim from the EF migrations / ApplicationDbContextModelSnapshot.cs):
    academic_planning.student_subjects(id bigint, student_id text)
        - student_id is the canonical identity.users.Id.
    mastery.topic_masteries(student_subject_id bigint, topic_id text,
        topic_id1 bigint, mastery_level double)
        - topic_id is the practice topic LABEL; topic_id1 is the bigint FK to
          student_subject_topics.
    practice.practice_attempts(id bigint, student_id text, status text,
        submitted_at timestamptz)
    practice.practice_attempt_items(attempt_id bigint, topic text,
        is_correct bool)
    mastery.knowledge_gaps(student_subject_id bigint, topic_id bigint,
        concept text, severity text, last_tested timestamptz)
        - topic_id here is the bigint FK; we source it from
          topic_masteries.topic_id1 for the matching (subject, topic label).

NOTE: heavy/optional ML imports (numpy, scikit-learn) are imported INSIDE
compute() so this module imports with only light deps installed.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import text

from app.core.db import session_scope
from app.core.logging import get_logger
from app.data.sinks import upsert_knowledge_gaps
from app.services.base import AnalyticsService

log = get_logger(__name__)

# Mastery at/below this is treated as a (partial) gap signal on its own.
LOW_MASTERY_THRESHOLD = 0.6
# A topic with at least this practice error rate is a gap signal.
HIGH_ERROR_THRESHOLD = 0.4
# Need at least this many practice items on a topic to trust its error rate.
MIN_ITEMS_FOR_ERROR = 3
# A combined gap score below this is not surfaced as a gap at all.
GAP_SCORE_FLOOR = 0.35
# Relative weight of the practice-error signal vs the low-mastery signal.
ERROR_WEIGHT = 0.5

_SEVERITIES = ("low", "medium", "high")


class KnowledgeGapService(AnalyticsService):
    name = "gaps"
    weight = "medium"

    async def compute(self, user_id: str | None) -> int:
        # Lazy ML imports — keep module import light.
        import numpy as np

        mastery_rows = await _load_low_mastery(user_id)
        error_rows = await _load_practice_errors(user_id)

        if not mastery_rows and not error_rows:
            log.info("gaps.no_signal", scope=user_id or "ALL")
            return 0

        # --- index practice errors by (student_subject_id, topic label) ------
        # student_subject_id is resolved from the student_id + topic label via
        # the topic_masteries rows (which carry both the subject and the label),
        # so a topic only becomes a gap when it appears in mastery too. We also
        # carry the bigint topic_id1 (the knowledge_gaps FK) from there.
        errors_by_topic: dict[tuple[str, str], dict[str, Any]] = {}
        for r in error_rows:
            errors_by_topic[(r["student_id"], _norm(r["topic"]))] = r

        # --- build one candidate per (student_subject, topic) -----------------
        candidates: list[dict[str, Any]] = []
        for m in mastery_rows:
            label = _norm(m["topic_id"])
            mastery = float(m["mastery_level"])
            err = errors_by_topic.get((m["student_id"], label))

            error_rate = 0.0
            last_tested: datetime | None = None
            if err and err["total"] >= MIN_ITEMS_FOR_ERROR:
                error_rate = err["wrong"] / err["total"]
                last_tested = err["last_tested"]

            has_low_mastery = mastery <= LOW_MASTERY_THRESHOLD
            has_high_error = error_rate >= HIGH_ERROR_THRESHOLD
            if not (has_low_mastery or has_high_error):
                continue

            # Gap score in 0..1: high when mastery is low and/or errors are high.
            mastery_gap = 1.0 - mastery
            gap_score = (1.0 - ERROR_WEIGHT) * mastery_gap + ERROR_WEIGHT * error_rate
            if gap_score < GAP_SCORE_FLOOR:
                continue

            candidates.append(
                {
                    "student_subject_id": m["student_subject_id"],
                    "topic_id": m["topic_id1"],  # bigint FK for knowledge_gaps
                    "concept": str(m["topic_id"]),  # human-readable topic label
                    "gap_score": gap_score,
                    "last_tested": last_tested,
                }
            )

        if not candidates:
            log.info("gaps.no_candidates", scope=user_id or "ALL")
            return 0

        severities = _rate_severity(np, [c["gap_score"] for c in candidates])
        now = datetime.now(UTC)

        rows = [
            {
                "student_subject_id": c["student_subject_id"],
                "topic_id": c["topic_id"],
                "concept": c["concept"],
                "severity": sev,
                "last_tested": c["last_tested"] or now,
            }
            for c, sev in zip(candidates, severities, strict=True)
        ]

        written = await upsert_knowledge_gaps(rows)
        log.info(
            "gaps.written",
            scope=user_id or "ALL",
            candidates=len(candidates),
            rows=written,
        )
        return written


def _norm(topic: object) -> str:
    return str(topic).strip().lower()


def _rate_severity(np_mod: Any, scores: list[float]) -> list[str]:
    """Map gap scores → low|medium|high.

    Uses 1-D KMeans (k=3) so the cut-points adapt to the cohort's distribution,
    which is more robust than fixed thresholds when a student's gaps cluster
    tightly. Falls back to fixed thresholds when there are too few points to
    cluster meaningfully or sklearn is unavailable.
    """
    n = len(scores)
    distinct = len(set(scores))
    if n < 3 or distinct < 3:
        return [_threshold_severity(s) for s in scores]

    try:
        from sklearn.cluster import KMeans
    except ImportError:
        return [_threshold_severity(s) for s in scores]

    arr = np_mod.asarray(scores, dtype="float64").reshape(-1, 1)
    k = min(3, distinct)
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(arr)
    # Order clusters by centre so cluster rank → severity rank.
    centres = km.cluster_centers_.ravel()
    order = {cluster: rank for rank, cluster in enumerate(np_mod.argsort(centres))}
    # Map each cluster's rank into the severity scale (low..high).
    return [_SEVERITIES[_scale_rank(order[c], k)] for c in km.labels_]


def _scale_rank(rank: int, k: int) -> int:
    """Scale a 0..k-1 cluster rank onto the 0..2 severity index."""
    if k <= 1:
        return len(_SEVERITIES) - 1
    return round(rank * (len(_SEVERITIES) - 1) / (k - 1))


def _threshold_severity(score: float) -> str:
    if score >= 0.7:
        return "high"
    if score >= 0.5:
        return "medium"
    return "low"


# --------------------------------------------------------------------------- #
# raw-signal reads
# --------------------------------------------------------------------------- #
async def _load_low_mastery(user_id: str | None) -> list[dict[str, Any]]:
    """topic_masteries joined to academic_planning.student_subjects so we have
    the canonical student_id (text) alongside the subject id, the topic label
    (topic_id, text) and the bigint topic FK (topic_id1)."""
    sql = """
        SELECT tm.student_subject_id      AS student_subject_id,
               tm.topic_id                AS topic_id,
               tm.topic_id1               AS topic_id1,
               tm.mastery_level           AS mastery_level,
               ss.student_id              AS student_id
        FROM mastery.topic_masteries tm
        JOIN academic_planning.student_subjects ss
          ON ss.id = tm.student_subject_id
        WHERE (:user_id IS NULL OR ss.student_id = :user_id)
    """
    async with session_scope() as s:
        result = await s.execute(text(sql), {"user_id": user_id})
        return [dict(r) for r in result.mappings().all()]


async def _load_practice_errors(user_id: str | None) -> list[dict[str, Any]]:
    """Per (student_id, topic label): total items, wrong items, and the most
    recent attempt timestamp. Only completed/submitted attempts count."""
    sql = """
        SELECT pa.student_id                                       AS student_id,
               pai.topic                                           AS topic,
               COUNT(*)                                            AS total,
               COUNT(*) FILTER (WHERE pai.is_correct = false)      AS wrong,
               MAX(COALESCE(pa.submitted_at, pa.started_at))       AS last_tested
        FROM practice.practice_attempt_items pai
        JOIN practice.practice_attempts pa
          ON pa.id = pai.attempt_id
        WHERE pa.submitted_at IS NOT NULL
          AND (:user_id IS NULL OR pa.student_id = :user_id)
        GROUP BY pa.student_id, pai.topic
    """
    async with session_scope() as s:
        result = await s.execute(text(sql), {"user_id": user_id})
        return [dict(r) for r in result.mappings().all()]
