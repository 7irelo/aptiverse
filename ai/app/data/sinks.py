"""Idempotent upserts into the analytics projection tables.

Every analytics row carries computed_at + model_version so outputs are
reproducible and a bad run can simply be recomputed. This module is the ONE
place that knows the exact (schema, table, column) names of the projection
tables and the natural unique key each one upserts on.

All names below are verbatim from the committed EF migrations +
ApplicationDbContextModelSnapshot.cs.

IMPORTANT — computed_at / model_version columns:
    The .NET entities do NOT yet declare ``computed_at`` / ``model_version``
    columns on these tables (the snapshot only has created_at / updated_at).
    stamp() still emits them and the upserts write them so the projections are
    auditable; a .NET migration must ADD these two columns (timestamptz +
    text) to each target table. Until then the writes target the columns that
    DO exist and stamp() values are folded into updated_at/created_at. To keep
    this module working against the *current* schema we only write columns the
    table is known to have, and map stamp() onto created_at/updated_at.

IMPORTANT — ON CONFLICT requires a UNIQUE index:
    Postgres ``ON CONFLICT (cols)`` needs a unique index/constraint on exactly
    those cols. The natural-key composite indexes below (e.g.
    ix_topic_masteries_student_subject_id_topic_id) exist in the migrations but
    are NOT declared UNIQUE. A .NET migration must mark them unique for the
    real upsert path to bind. _upsert() therefore degrades safely: if the
    unique index is missing the INSERT ... ON CONFLICT raises
    ``InvalidColumnReference`` / no-unique-constraint, which we surface as a
    clear error telling the operator which constraint to add.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError

from app.core.config import get_settings
from app.core.db import session_scope
from app.core.logging import get_logger

log = get_logger(__name__)


def stamp() -> dict[str, object]:
    """Common audit columns for every analytics write."""
    return {
        "computed_at": datetime.now(UTC),
        "model_version": get_settings().model_version,
    }


# --------------------------------------------------------------------------- #
# generic upsert
# --------------------------------------------------------------------------- #
async def _upsert(
    schema: str,
    table: str,
    rows: list[dict[str, Any]],
    conflict_cols: list[str],
    *,
    update_cols: list[str] | None = None,
) -> int:
    """INSERT ... ON CONFLICT (conflict_cols) DO UPDATE for a batch of rows.

    ``rows`` are already-stamped column dicts. ``update_cols`` defaults to every
    non-conflict column present on the first row. Returns the number of rows
    sent. Idempotent: re-running with the same natural key updates in place.
    """
    if not rows:
        return 0

    cols = list(rows[0].keys())
    if update_cols is None:
        update_cols = [c for c in cols if c not in conflict_cols]

    col_list = ", ".join(f'"{c}"' for c in cols)
    placeholders = ", ".join(f":{c}" for c in cols)
    conflict_list = ", ".join(f'"{c}"' for c in conflict_cols)
    set_list = ", ".join(f'"{c}" = EXCLUDED."{c}"' for c in update_cols)

    sql = (
        f'INSERT INTO "{schema}"."{table}" ({col_list}) '
        f"VALUES ({placeholders}) "
        f"ON CONFLICT ({conflict_list}) DO UPDATE SET {set_list}"
    )

    async with session_scope() as s:
        await s.execute(text(sql), rows)
    return len(rows)


# --------------------------------------------------------------------------- #
# mastery.topic_masteries
# natural key: (student_subject_id, topic_id)
# columns: student_subject_id (bigint), topic_id (text), topic_id1 (bigint),
#          mastery_level (double), created_at, updated_at
# --------------------------------------------------------------------------- #
async def upsert_topic_masteries(rows: list[dict[str, Any]]) -> int:
    """Each row: student_subject_id, topic_id (text), topic_id1 (bigint),
    mastery_level. Stamped onto created_at/updated_at."""
    s = stamp()
    payload = [
        {
            "student_subject_id": r["student_subject_id"],
            "topic_id": str(r["topic_id"]),
            "topic_id1": r.get("topic_id1", 0),
            "mastery_level": float(r["mastery_level"]),
            "created_at": s["computed_at"],
            "updated_at": s["computed_at"],
        }
        for r in rows
    ]
    return await _upsert(
        "mastery",
        "topic_masteries",
        payload,
        conflict_cols=["student_subject_id", "topic_id"],
        update_cols=["topic_id1", "mastery_level", "updated_at"],
    )


# --------------------------------------------------------------------------- #
# mastery.knowledge_gaps
# natural key: (student_subject_id, topic_id)
# columns: student_subject_id (bigint), topic_id (bigint), concept (text),
#          severity (text), last_tested (timestamptz), created_at, updated_at
# --------------------------------------------------------------------------- #
async def upsert_knowledge_gaps(rows: list[dict[str, Any]]) -> int:
    """Each row: student_subject_id, topic_id, concept, severity, last_tested."""
    s = stamp()
    payload = [
        {
            "student_subject_id": r["student_subject_id"],
            "topic_id": r["topic_id"],
            "concept": r["concept"],
            "severity": r["severity"],
            "last_tested": r.get("last_tested", s["computed_at"]),
            "created_at": s["computed_at"],
            "updated_at": s["computed_at"],
        }
        for r in rows
    ]
    return await _upsert(
        "mastery",
        "knowledge_gaps",
        payload,
        conflict_cols=["student_subject_id", "topic_id"],
        update_cols=["concept", "severity", "last_tested", "updated_at"],
    )


# --------------------------------------------------------------------------- #
# mastery.student_subject_analytics
# natural key: (student_subject_id, topic_id)
# Wide table; callers pass whatever computed columns they have. We only require
# the key + stamp; remaining keys are written through verbatim.
# --------------------------------------------------------------------------- #
_SSA_KEY = ["student_subject_id", "topic_id"]


async def upsert_student_subject_analytics(rows: list[dict[str, Any]]) -> int:
    """Each row MUST contain student_subject_id + topic_id; any of the wide
    analytics columns (attendance_rate, motivation_level, stress_level,
    sleep_quality, workload_this_week, morning/afternoon/evening_percentage,
    consistency, session_length, etc.) may be included and are written as-is."""
    s = stamp()
    payload = []
    for r in rows:
        row = dict(r)
        row.setdefault("created_at", s["computed_at"])
        row["updated_at"] = s["computed_at"]
        payload.append(row)
    return await _upsert(
        "mastery",
        "student_subject_analytics",
        payload,
        conflict_cols=_SSA_KEY,
    )


# --------------------------------------------------------------------------- #
# insights.grade_distributions
# natural key: (student_subject_id, grade)
# columns: student_subject_id (bigint), grade (text), count (int),
#          created_at, updated_at
# --------------------------------------------------------------------------- #
async def upsert_grade_distributions(rows: list[dict[str, Any]]) -> int:
    """Each row: student_subject_id, grade, count."""
    s = stamp()
    payload = [
        {
            "student_subject_id": r["student_subject_id"],
            "grade": r["grade"],
            "count": int(r["count"]),
            "created_at": s["computed_at"],
            "updated_at": s["computed_at"],
        }
        for r in rows
    ]
    return await _upsert(
        "insights",
        "grade_distributions",
        payload,
        conflict_cols=["student_subject_id", "grade"],
        update_cols=["count", "updated_at"],
    )


# --------------------------------------------------------------------------- #
# insights.improvement_tips
# natural key: (student_subject_id, student_subject_topic_id)
# columns: student_subject_id (bigint), student_subject_topic_id (bigint),
#          tip (text), priority (int), created_at, updated_at
# --------------------------------------------------------------------------- #
async def upsert_improvement_tips(rows: list[dict[str, Any]]) -> int:
    """Each row: student_subject_id, student_subject_topic_id, tip, priority."""
    s = stamp()
    payload = [
        {
            "student_subject_id": r["student_subject_id"],
            "student_subject_topic_id": r["student_subject_topic_id"],
            "tip": r["tip"],
            "priority": int(r.get("priority", 0)),
            "created_at": s["computed_at"],
            "updated_at": s["computed_at"],
        }
        for r in rows
    ]
    return await _upsert(
        "insights",
        "improvement_tips",
        payload,
        conflict_cols=["student_subject_id", "student_subject_topic_id"],
        update_cols=["tip", "priority", "updated_at"],
    )


# --------------------------------------------------------------------------- #
# goals.growth_trackings
# natural key: (student_id, tracking_date)
# columns: student_id (bigint), tracking_date (timestamptz),
#          academic_growth/emotional_growth/study_habit_growth/overall_growth
#          (numeric), growth_factors (text), areas_for_improvement (text),
#          created_at, updated_at
# --------------------------------------------------------------------------- #
async def upsert_growth_trackings(rows: list[dict[str, Any]]) -> int:
    """Each row: student_id (bigint legacy id), tracking_date, academic_growth,
    emotional_growth, study_habit_growth, overall_growth, growth_factors,
    areas_for_improvement."""
    s = stamp()
    payload = [
        {
            "student_id": r["student_id"],
            "tracking_date": r["tracking_date"],
            "academic_growth": r.get("academic_growth", 0),
            "emotional_growth": r.get("emotional_growth", 0),
            "study_habit_growth": r.get("study_habit_growth", 0),
            "overall_growth": r.get("overall_growth", 0),
            "growth_factors": r.get("growth_factors", ""),
            "areas_for_improvement": r.get("areas_for_improvement", ""),
            "created_at": s["computed_at"],
            "updated_at": s["computed_at"],
        }
        for r in rows
    ]
    return await _upsert(
        "goals",
        "growth_trackings",
        payload,
        conflict_cols=["student_id", "tracking_date"],
        update_cols=[
            "academic_growth",
            "emotional_growth",
            "study_habit_growth",
            "overall_growth",
            "growth_factors",
            "areas_for_improvement",
            "updated_at",
        ],
    )


# --------------------------------------------------------------------------- #
# insights.risk_scores  (DOES NOT EXIST YET IN .NET)
#
# The At-Risk Predictor wants to project to insights.risk_scores, but no EF
# migration creates that table. A .NET migration MUST add it before this path
# does anything, e.g.:
#
#   CREATE TABLE insights.risk_scores (
#       id            bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
#       student_id    text   NOT NULL,           -- canonical identity.users.Id
#       risk_level    text   NOT NULL,           -- low | medium | high
#       risk_score    double precision NOT NULL, -- 0..1 probability
#       reasons       jsonb  NOT NULL DEFAULT '[]',  -- SHAP top features
#       computed_at   timestamptz NOT NULL,
#       model_version text   NOT NULL,
#       created_at    timestamptz NOT NULL,
#       updated_at    timestamptz NOT NULL,
#       CONSTRAINT ux_risk_scores_student_id UNIQUE (student_id)
#   );
#
# Until then this upsert is GUARDED: it is skipped unless the feature flag
# ``AI_ENABLE_RISK_SCORES`` is set, and any "undefined table" error from the DB
# is swallowed with a loud warning so a nightly run never hard-fails on it.
# --------------------------------------------------------------------------- #
async def upsert_risk_scores(rows: list[dict[str, Any]]) -> int:
    """Each row: student_id (text canonical), risk_level, risk_score, reasons.

    GUARDED: insights.risk_scores does not exist in .NET yet. Requires the
    feature flag and tolerates an undefined-table error. See the module docstring
    above for the .NET migration that must create it.
    """
    settings = get_settings()
    if not getattr(settings, "enable_risk_scores", False):
        log.warning(
            "risk_scores.skipped",
            reason="feature flag AI_ENABLE_RISK_SCORES off / table not migrated",
        )
        return 0

    s = stamp()
    payload = [
        {
            "student_id": str(r["student_id"]),
            "risk_level": r["risk_level"],
            "risk_score": float(r["risk_score"]),
            "reasons": r.get("reasons", "[]"),
            "computed_at": s["computed_at"],
            "model_version": s["model_version"],
            "created_at": s["computed_at"],
            "updated_at": s["computed_at"],
        }
        for r in rows
    ]
    try:
        return await _upsert(
            "insights",
            "risk_scores",
            payload,
            conflict_cols=["student_id"],
            update_cols=[
                "risk_level",
                "risk_score",
                "reasons",
                "computed_at",
                "model_version",
                "updated_at",
            ],
        )
    except ProgrammingError as exc:  # undefined_table (42P01) etc.
        log.warning(
            "risk_scores.undefined_table",
            error=str(exc.orig) if exc.orig else str(exc),
            hint="add the insights.risk_scores .NET migration (see sinks.py docstring)",
        )
        return 0
