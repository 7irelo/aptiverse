"""Mastery Estimator → mastery.topic_masteries.

Inputs : per-topic practice attempt-item correctness sequences + graded
         assessment results (academic_planning.assessments).
Method : Bayesian Knowledge Tracing (pyBKT) per (student, topic) over the ordered
         correctness sequence, with a simple EWMA-of-correctness fallback when
         pyBKT is unavailable. The BKT posterior (P(known)) / EWMA is then blended
         with a normalized assessment-mark signal for the same subject enrolment so
         a topic mastery reflects both deliberate practice and graded work.
         Psychometric standard — explainable to schools, unlike an opaque LLM.
Weight : heavy. Cadence: nightly + on practice-submit event.

ID handling (see app/data/signals.py):
    * practice / assessments carry student_id = text == canonical identity.users.Id.
    * mastery.topic_masteries keys on (student_subject_id, topic_id) where
      student_subject_id is the bigint academic_planning.student_subjects.id.
    The bridge from a practice/assessment text subject *slug* to that bigint id is
    the catalog chain curriculum_subjects.subject_id (slug) -> curriculum_subjects.id
    -> student_subjects.curriculum_subject_id, exposed by
    signals.student_subject_slug_map(); assessment marks already resolved to the
    bigint id come from signals.assessment_subject_marks().

HEAVY ML IMPORTS ARE LAZY: pyBKT (and the pandas it needs) are imported INSIDE
_bkt_mastery() so this module imports with only light deps installed. The EWMA
fallback needs no ML at all; the pyBKT path is attempted first and any ImportError
(or any fit/predict failure) degrades cleanly to EWMA without hard-failing the run.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.core.config import get_settings
from app.core.logging import get_logger
from app.data import signals, sinks
from app.services.base import AnalyticsService

log = get_logger(__name__)

# How strongly graded assessment marks pull the practice-derived mastery. Blended
# mastery is (1 - w) * practice_signal + w * assessment_signal when an assessment
# signal exists for the subject enrolment; otherwise it is the practice signal.
_ASSESSMENT_BLEND_WEIGHT = 0.35

# EWMA smoothing factor for the fallback path: weight of the most-recent attempt.
_EWMA_ALPHA = 0.4

# Neutral prior used when a topic has no observations on a given path.
_PRIOR = 0.5


def _clip01(x: float) -> float:
    """Clamp a mastery estimate into the [0, 1] range the column stores."""
    if x < 0.0:
        return 0.0
    if x > 1.0:
        return 1.0
    return float(x)


def _as_bool(value: Any) -> int:
    """Coerce an is_correct cell (bool / 0-1 / "true") to a 0/1 int for BKT."""
    if isinstance(value, bool):
        return 1 if value else 0
    if isinstance(value, (int, float)):
        return 1 if value else 0
    return 1 if str(value).strip().lower() in {"1", "true", "t", "yes", "y"} else 0


def _norm_mark(mark: float) -> float:
    """Normalize a graded mark to 0..1. Marks are 0-100 percentages; tolerate a
    value already expressed in 0..1."""
    return _clip01(mark / 100.0 if mark > 1.0 else mark)


# --------------------------------------------------------------------------- #
# EWMA fallback — no ML deps
# --------------------------------------------------------------------------- #
def _ewma_mastery(sequence: list[int]) -> float:
    """Exponentially-weighted moving average of correctness over an ordered
    attempt sequence. Recent answers dominate, so a student who has started
    getting a topic right recovers their mastery. Empty -> neutral prior."""
    if not sequence:
        return _PRIOR
    est = float(sequence[0])
    for correct in sequence[1:]:
        est = _EWMA_ALPHA * float(correct) + (1.0 - _EWMA_ALPHA) * est
    return _clip01(est)


# --------------------------------------------------------------------------- #
# pyBKT path — LAZY heavy import
# --------------------------------------------------------------------------- #
def _bkt_mastery(sequences: dict[str, list[int]]) -> dict[str, float] | None:
    """Fit Bayesian Knowledge Tracing per topic and return P(known) after the
    last observation for each topic.

    ``sequences`` maps topic -> ordered list of 0/1 correctness. pyBKT (and the
    pandas frame it consumes) are imported INSIDE this function so the package
    imports on a minimal install. Returns None on ImportError so the caller falls
    back to EWMA; any other failure also degrades to None with a warning rather
    than hard-failing the nightly run.
    """
    try:
        import pandas as pd  # noqa: PLC0415 (intentional lazy heavy import)
        from pyBKT.models import Model  # noqa: PLC0415 (intentional lazy heavy import)
    except ImportError as exc:
        log.warning(
            "mastery.pybkt_unavailable",
            error=str(exc),
            hint="install pyBKT for Bayesian Knowledge Tracing; using EWMA fallback",
        )
        return None

    # Long-format frame pyBKT understands: one row per opportunity, with the topic
    # as the skill, the 0/1 correctness, a (single) user id and an ordering column.
    rows: list[dict[str, Any]] = []
    for topic, seq in sequences.items():
        for order, correct in enumerate(seq):
            rows.append(
                {
                    "user_id": "student",
                    "skill_name": topic,
                    "correct": int(correct),
                    "order_id": order,
                }
            )
    if not rows:
        return None

    try:
        frame = pd.DataFrame(rows)
        model = Model(seed=42)
        model.fit(
            data=frame,
            defaults={
                "user_id": "user_id",
                "skill_name": "skill_name",
                "correct": "correct",
                "order_id": "order_id",
            },
        )
        preds = model.predict(data=frame)
    except Exception as exc:  # noqa: BLE001 — never hard-fail the nightly run
        log.warning("mastery.pybkt_failed", error=str(exc), hint="degrading to EWMA")
        return None

    # state_predictions is P(known) of the latent skill at each opportunity; take
    # the last opportunity per topic as the current mastery.
    state_col = (
        "state_predictions"
        if "state_predictions" in getattr(preds, "columns", [])
        else "correct_predictions"
    )
    if state_col not in getattr(preds, "columns", []):
        return None
    out: dict[str, float] = {}
    for topic, group in preds.groupby("skill_name"):
        ordered = group.sort_values("order_id")
        out[str(topic)] = _clip01(float(ordered[state_col].iloc[-1]))
    return out


# --------------------------------------------------------------------------- #
# shaping helpers
# --------------------------------------------------------------------------- #
def _to_dicts(frame: Any) -> list[dict[str, Any]]:
    """Normalize a signals helper result (polars DataFrame or list[dict]) to a
    plain list[dict] so this service carries no hard polars dependency."""
    if frame is None:
        return []
    if isinstance(frame, list):
        return [dict(r) for r in frame]
    to_dicts = getattr(frame, "to_dicts", None)  # polars.DataFrame
    if callable(to_dicts):
        return to_dicts()
    return [dict(r) for r in frame]


def _topic_sequences(
    items: list[dict[str, Any]],
) -> tuple[dict[str, list[int]], dict[str, str | None]]:
    """From one student's ordered attempt-items, build:
      * topic -> ordered 0/1 correctness sequence
      * topic -> the subject slug it was practised under (last seen wins)
    Items arrive ordered by (attempt_id, item id) from signals.practice_attempt_items.
    """
    sequences: dict[str, list[int]] = defaultdict(list)
    topic_subject: dict[str, str | None] = {}
    for it in items:
        topic = it.get("topic")
        if topic is None or str(topic).strip() == "":
            continue
        topic = str(topic)
        sequences[topic].append(_as_bool(it.get("is_correct")))
        subj = it.get("subject_id")
        if subj is not None:
            topic_subject[topic] = str(subj)
        else:
            topic_subject.setdefault(topic, None)
    return dict(sequences), topic_subject


def _compute_one(
    items: list[dict[str, Any]],
    slug_to_ss: dict[str, int],
    assessment_by_ss: dict[int, float],
) -> list[dict[str, Any]]:
    """Estimate per-topic mastery for one student and shape topic_masteries rows.

    ``slug_to_ss`` maps a subject slug -> that student's bigint student_subject_id;
    ``assessment_by_ss`` maps student_subject_id -> normalized 0..1 mark signal.
    Topics whose subject slug has no enrolment are skipped (we never invent a key
    the .NET side cannot resolve).
    """
    sequences, topic_subject = _topic_sequences(items)
    if not sequences:
        return []

    # Practice signal: pyBKT (lazy/heavy) first, EWMA fallback per topic.
    bkt = _bkt_mastery(sequences)

    rows: list[dict[str, Any]] = []
    for topic, seq in sequences.items():
        practice_level = bkt[topic] if (bkt is not None and topic in bkt) else _ewma_mastery(seq)

        slug = topic_subject.get(topic)
        student_subject_id = slug_to_ss.get(slug) if slug is not None else None
        if student_subject_id is None:
            continue

        level = practice_level
        subj_signal = assessment_by_ss.get(student_subject_id)
        if subj_signal is not None:
            level = (1.0 - _ASSESSMENT_BLEND_WEIGHT) * practice_level + (
                _ASSESSMENT_BLEND_WEIGHT * subj_signal
            )

        rows.append(
            {
                "student_subject_id": student_subject_id,
                "topic_id": topic,
                "mastery_level": _clip01(level),
            }
        )
    return rows


def _group_by_student(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Bucket attempt-items by their canonical (text) student_id."""
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in rows:
        sid = r.get("student_id")
        if sid is None:
            continue
        grouped[str(sid)].append(r)
    return dict(grouped)


class MasteryEstimatorService(AnalyticsService):
    name = "mastery"
    weight = "heavy"

    async def compute(self, user_id: str | None) -> int:
        items = _to_dicts(await signals.practice_attempt_items(user_id))
        if not items:
            log.info("mastery.no_items", scope=user_id or "ALL")
            return 0

        # (student, subject slug) -> bigint student_subject_id (the projection key).
        slug_rows = _to_dicts(await signals.student_subject_slug_map(user_id))
        slug_map: dict[str, dict[str, int]] = defaultdict(dict)
        for r in slug_rows:
            sid = r.get("student_id")
            slug = r.get("subject_id")
            ss_id = r.get("student_subject_id")
            if sid is None or slug is None or ss_id is None:
                continue
            slug_map[str(sid)][str(slug)] = int(ss_id)

        # Graded marks already resolved to student_subject_id -> mean 0..1 signal.
        mark_rows = _to_dicts(await signals.assessment_subject_marks(user_id))
        mark_sum: dict[tuple[str, int], float] = defaultdict(float)
        mark_cnt: dict[tuple[str, int], int] = defaultdict(int)
        for r in mark_rows:
            sid = r.get("student_id")
            ss_id = r.get("student_subject_id")
            mark = r.get("mark")
            if sid is None or ss_id is None or mark is None:
                continue
            key = (str(sid), int(ss_id))
            try:
                mark_sum[key] += _norm_mark(float(mark))
            except (TypeError, ValueError):
                continue
            mark_cnt[key] += 1
        assessment_by_student: dict[str, dict[int, float]] = defaultdict(dict)
        for (sid, ss_id), total in mark_sum.items():
            assessment_by_student[sid][ss_id] = total / mark_cnt[(sid, ss_id)]

        by_student = _group_by_student(items)
        all_rows: list[dict[str, Any]] = []
        for student_id, student_items in by_student.items():
            all_rows.extend(
                _compute_one(
                    student_items,
                    slug_map.get(student_id, {}),
                    assessment_by_student.get(student_id, {}),
                )
            )

        if not all_rows:
            log.info(
                "mastery.no_rows",
                scope=user_id or "ALL",
                students=len(by_student),
                hint="practised topics had no resolvable student_subject enrolment",
            )
            return 0

        written = await sinks.upsert_topic_masteries(all_rows)
        log.info(
            "mastery.done",
            scope=user_id or "ALL",
            students=len(by_student),
            topics=len(all_rows),
            rows=written,
            model_version=get_settings().model_version,
        )
        return written
