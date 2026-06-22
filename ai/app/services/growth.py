"""Growth-Tracking Computer → goals.growth_trackings.

Inputs : goal progress, assessment trend, mood trend.
Method : rolling deltas / EWMA across academic, study-habit, emotional, overall.
Weight : light. Cadence: nightly.

Four growth dimensions, each a normalized 0..100 score:

* academic     — EWMA of the recent assessment / practice mark trend, plus the
                 short-vs-long rolling delta (is the student trending up?).
* study_habit  — goal-progress momentum: how much closer the student's goals
                 moved over the window, blended with completion rate.
* emotional    — EWMA of the mood-score trend (wellbeing.mood_trackings),
                 rescaled from the 1..10 check-in scale onto 0..100.
* overall      — weighted blend of the three above.

Everything here is light arithmetic over polars / list[dict] frames returned by
``app.data.signals`` — there are NO heavy ML imports in this module (the growth
service is the "light, nightly" tier). If a heavy method is ever added it MUST be
imported lazily inside the function that uses it, per the package convention.

Identity note (see app/data/signals.py): the canonical student id is the *text*
``identity.users.Id``. After Phase-2 *every* source and the ``goals.growth_trackings``
SINK key on that single text id — goals, assessments, practice AND
``wellbeing.mood_trackings`` are all text now. This service therefore groups every
source by the text id and emits output rows keyed on the text canonical id (the
sink upserts on the UNIQUE (student_id, tracking_date)).
"""

from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from datetime import UTC, datetime
from typing import Any

from app.core.logging import get_logger
from app.data import signals
from app.data.sinks import upsert_growth_trackings
from app.services.base import AnalyticsService

log = get_logger(__name__)

# EWMA smoothing factor (higher = weight recent points more). The trend uses a
# short vs long rolling mean to derive a delta; the level uses this EWMA.
_EWMA_ALPHA = 0.4
# Short / long rolling windows (in number of points) for the trend delta.
_SHORT_WINDOW = 3
_LONG_WINDOW = 8
# Overall = weighted blend of the three dimensions.
_WEIGHTS = {"academic": 0.45, "study_habit": 0.30, "emotional": 0.25}
# Below this many signal points a dimension is treated as "no signal" (50 = the
# neutral midpoint) so a brand-new student doesn't read as crashing or soaring.
_NEUTRAL = 50.0


class GrowthTrackingService(AnalyticsService):
    name = "growth"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        # Read the three signal sources. After Phase-2 all four are keyed by the
        # canonical text id (identity.users.Id), so the optional user_id filter
        # binds as text uniformly inside signals.*.
        goals_rows = _records(await signals.goals(user_id))
        assessments_rows = _records(await signals.assessments(user_id))
        practice_rows = _records(await signals.attempt_score_summaries(user_id))
        mood_rows = _records(await signals.mood_trackings(user_id))

        # Group every source by the canonical text student id.
        goals_by = _group(goals_rows, "student_id")
        assess_by = _group(assessments_rows, "student_id")
        practice_by = _group(practice_rows, "student_id")
        mood_by = _group(mood_rows, "student_id")

        # The set of students to emit a row for: the union of the text ids seen
        # across all sources (restricted to the requested user_id when given).
        candidate_ids = _candidate_student_ids(
            goals_by, assess_by, practice_by, mood_by, user_id
        )
        if not candidate_ids:
            log.info("growth.no_students", scope=user_id or "ALL")
            return 0

        tracking_date = datetime.now(UTC)
        out: list[dict[str, Any]] = []

        for sid in candidate_ids:
            academic = _academic_growth(
                assess_by.get(sid, []), practice_by.get(sid, [])
            )
            study_habit = _study_habit_growth(goals_by.get(sid, []))
            emotional = _emotional_growth(mood_by.get(sid, []))

            overall = (
                _WEIGHTS["academic"] * academic
                + _WEIGHTS["study_habit"] * study_habit
                + _WEIGHTS["emotional"] * emotional
            )

            factors, improvements = _narrative(academic, study_habit, emotional)

            out.append(
                {
                    "student_id": sid,
                    "tracking_date": tracking_date,
                    "academic_growth": round(academic, 2),
                    "study_habit_growth": round(study_habit, 2),
                    "emotional_growth": round(emotional, 2),
                    "overall_growth": round(overall, 2),
                    "growth_factors": factors,
                    "areas_for_improvement": improvements,
                }
            )

        written = await upsert_growth_trackings(out)
        log.info("growth.upserted", scope=user_id or "ALL", rows=written)
        return written


# --------------------------------------------------------------------------- #
# dimension computations
# --------------------------------------------------------------------------- #
def _academic_growth(
    assessments: list[Mapping[str, Any]], practice: list[Mapping[str, Any]]
) -> float:
    """EWMA mark level + short-vs-long trend delta, on 0..100.

    Marks come from two places: ``assessments.predicted_mark`` (ordered by
    due_date) and ``attempt_score_summaries.score_percent`` (ordered by attempt).
    Both are already percentages; we merge them in chronological-ish order and
    treat the sequence as the academic signal.
    """
    series: list[float] = []
    # Assessments are returned ordered by due_date (signals.assessments).
    for r in assessments:
        mark = _num(r.get("predicted_mark"))
        if mark is not None:
            series.append(_clamp01_100(mark))
    # Practice summaries ordered by attempt_id (signals.attempt_score_summaries).
    for r in practice:
        pct = _num(r.get("score_percent"))
        if pct is not None:
            series.append(_clamp01_100(pct))

    return _level_plus_trend(series)


def _study_habit_growth(goals: list[Mapping[str, Any]]) -> float:
    """Goal-progress momentum + completion rate, on 0..100.

    ``goals.progress`` is an int 0..100. signals.goals LEFT JOINs milestones, so a
    single goal can appear on several rows; we dedupe by goal id first. The score
    blends mean current progress with the share of goals already completed.
    """
    by_goal: dict[Any, Mapping[str, Any]] = {}
    for r in goals:
        gid = r.get("id")
        if gid not in by_goal:
            by_goal[gid] = r
    distinct = list(by_goal.values())
    if not distinct:
        return _NEUTRAL

    progresses = [
        _clamp01_100(_num(g.get("progress")) or 0.0) for g in distinct
    ]
    mean_progress = sum(progresses) / len(progresses)

    completed = sum(
        1
        for g in distinct
        if str(g.get("status", "")).lower() in {"completed", "complete", "done", "achieved"}
        or (_num(g.get("progress")) or 0.0) >= 100.0
    )
    completion_rate = 100.0 * completed / len(distinct)

    # Momentum-leaning blend: most weight on how far goals have progressed, a
    # smaller boost for outright completions.
    return _clamp01_100(0.7 * mean_progress + 0.3 * completion_rate)


def _emotional_growth(moods: list[Mapping[str, Any]]) -> float:
    """EWMA mood level + trend delta, on 0..100.

    ``mood_trackings.mood_score`` is an int check-in on a 1..10 scale (rows are
    ordered by tracked_at). We rescale to 0..100 then apply the same
    level+trend treatment as academic.
    """
    series: list[float] = []
    for r in moods:
        score = _num(r.get("mood_score"))
        if score is None:
            continue
        # 1..10 → 0..100. Guard scores already given on a 0..100 scale.
        scaled = score * 10.0 if score <= 10.0 else score
        series.append(_clamp01_100(scaled))

    return _level_plus_trend(series)


# --------------------------------------------------------------------------- #
# rolling-stat helpers (EWMA + short/long delta)
# --------------------------------------------------------------------------- #
def _level_plus_trend(series: Sequence[float]) -> float:
    """Combine an EWMA *level* with a short-vs-long rolling *delta* into 0..100.

    The level is where the student currently sits; the delta nudges it up/down to
    reward an improving trajectory and penalise a declining one. With no signal we
    return the neutral midpoint so a student with no data is neither rewarded nor
    penalised.
    """
    if not series:
        return _NEUTRAL

    level = _ewma(series, _EWMA_ALPHA)
    delta = _trend_delta(series)
    # delta is a raw points difference (already on the 0..100 scale); damp it so a
    # single noisy jump can't swing the dimension wildly, then add to the level.
    return _clamp01_100(level + 0.5 * delta)


def _ewma(series: Sequence[float], alpha: float) -> float:
    """Exponentially-weighted moving average, most-recent point weighted most."""
    it = iter(series)
    avg = next(it)
    for x in it:
        avg = alpha * x + (1.0 - alpha) * avg
    return avg


def _trend_delta(series: Sequence[float]) -> float:
    """short-window mean minus long-window mean (points on the 0..100 scale).

    Positive ⇒ recent points are above the longer baseline ⇒ improving. Uses the
    last ``_SHORT_WINDOW`` vs the last ``_LONG_WINDOW`` points; degrades to a
    first-vs-last comparison when there are too few points for two windows.
    """
    n = len(series)
    if n < 2:
        return 0.0
    short = series[-min(_SHORT_WINDOW, n):]
    long_ = series[-min(_LONG_WINDOW, n):]
    short_mean = sum(short) / len(short)
    long_mean = sum(long_) / len(long_)
    return short_mean - long_mean


# --------------------------------------------------------------------------- #
# narrative (human-readable factors / improvements; deterministic, no LLM)
# --------------------------------------------------------------------------- #
def _narrative(
    academic: float, study_habit: float, emotional: float
) -> tuple[str, str]:
    """Pick the strongest dimension(s) as growth factors and the weakest as areas
    for improvement. Plain English, deterministic, reviewable."""
    labels = {
        "academic": "Academic performance",
        "study_habit": "Study habits and goal progress",
        "emotional": "Emotional wellbeing",
    }
    scores = {"academic": academic, "study_habit": study_habit, "emotional": emotional}

    strong = [labels[k] for k, v in scores.items() if v >= 65.0]
    weak = [labels[k] for k, v in scores.items() if v < 45.0]

    factors = "; ".join(strong) if strong else "Steady progress across all areas"
    improvements = (
        "; ".join(weak) if weak else "No critical areas; maintain current routine"
    )
    return factors, improvements


# --------------------------------------------------------------------------- #
# frame / grouping helpers (work on polars DataFrame OR list[dict] fallback)
# --------------------------------------------------------------------------- #
def _records(frame: Any) -> list[Mapping[str, Any]]:
    """Normalize a signals return value to a list of row mappings.

    signals._to_frame returns a polars DataFrame when polars is installed, else a
    plain list[dict]. We support both without importing polars at module load.
    """
    if frame is None:
        return []
    if isinstance(frame, list):
        return frame
    # polars DataFrame: .to_dicts() yields list[dict]. Empty frame → no rows.
    to_dicts = getattr(frame, "to_dicts", None)
    if callable(to_dicts):
        return to_dicts()
    # Unknown shape: be permissive and return nothing rather than crash.
    return []


def _group(
    rows: list[Mapping[str, Any]], key: str
) -> dict[str, list[Mapping[str, Any]]]:
    """Group rows by a (text) key column, preserving row order within each group.

    The key is stringified so every source groups on the canonical text student
    id regardless of the driver's Python type for the column.
    """
    out: dict[str, list[Mapping[str, Any]]] = {}
    for r in rows:
        raw = r.get(key)
        if raw is None:
            continue
        out.setdefault(str(raw), []).append(r)
    return out


def _candidate_student_ids(
    goals_by: Mapping[str, Any],
    assess_by: Mapping[str, Any],
    practice_by: Mapping[str, Any],
    mood_by: Mapping[str, Any],
    user_id: str | None,
) -> list[str]:
    """The canonical text student ids to emit growth rows for.

    The output table (goals.growth_trackings.student_id) is the text canonical id
    after Phase-2, so candidates are simply the union of the text ids visible
    across all four sources. When a single ``user_id`` is requested we restrict
    to it.
    """
    ids: set[str] = set()
    for keymap in (goals_by, assess_by, practice_by, mood_by):
        ids.update(keymap)

    if user_id is not None:
        ids &= {str(user_id)}

    return sorted(ids)


def _num(value: Any) -> float | None:
    """Coerce a DB numeric (int / Decimal / float / numeric str) to float."""
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return f


def _clamp01_100(value: float) -> float:
    return max(0.0, min(100.0, value))
