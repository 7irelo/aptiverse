"""Read raw student signals from the shared Postgres.

This is the ONE place that normalizes the mixed string/long student-id situation
until Phase-2 unification lands. Every service reads through these helpers so the
id handling and the exact (schema, table, column) names stay in a single,
testable spot.

ALL table/column names below are taken verbatim from the committed EF migrations
+ ApplicationDbContextModelSnapshot.cs. snake_case throughout. The canonical
student identity is ``identity.users."Id"`` (text). A subtlety worth knowing:

* ``practice.practice_attempts.student_id``      -> text   (== canonical user id)
* ``academic_planning.assessments.student_id``   -> text   (== canonical user id)
* ``goals.goals.student_id``                     -> text   (== canonical user id)
* ``audit.audit_logs.user_id``                   -> text   (== canonical user id)
* ``wellbeing.mood_trackings.student_id``        -> bigint (legacy numeric id)
* ``wellbeing.diary_entries.student_id``          -> bigint (legacy numeric id)
* ``goals.growth_trackings.student_id``          -> bigint (legacy numeric id)
* ``calendar.calendar_events.student_id``        -> bigint (legacy numeric id)

So a ``user_id`` filter is bound as text for the first group and is intentionally
NOT applied to the bigint group (Phase-2 unification will reconcile them); for the
bigint tables a ``user_id`` filter is treated as the numeric student id when it
parses as an int, otherwise it is ignored and all rows are returned. Callers get a
polars DataFrame; if polars is not installed they get a list[dict] fallback so the
package still imports with only light deps.

Each helper accepts an optional ``user_id`` (None = all students).
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

from sqlalchemy import text

from app.core.db import session_scope


# --------------------------------------------------------------------------- #
# internals
# --------------------------------------------------------------------------- #
def _to_frame(rows: Sequence[Mapping[str, Any]]) -> Any:
    """Return a polars DataFrame when polars is available, else a list[dict].

    polars is a light dep but we still degrade gracefully so this module imports
    on a minimal install. Heavy ML libs are never imported here.
    """
    data = [dict(r) for r in rows]
    try:
        import polars as pl  # local import: keep module import light
    except ImportError:
        return data
    if not data:
        return pl.DataFrame()
    return pl.DataFrame(data)


async def _fetch(sql: str, params: dict[str, Any]) -> list[Mapping[str, Any]]:
    async with session_scope() as s:
        result = await s.execute(text(sql), params)
        return list(result.mappings().all())


def _maybe_int(user_id: str | None) -> int | None:
    """Parse a canonical (text) id into the legacy numeric student id, if it is
    numeric. Used for the bigint student_id tables. Returns None when the id is
    absent or non-numeric (caller then reads all rows)."""
    if user_id is None:
        return None
    try:
        return int(user_id)
    except (TypeError, ValueError):
        return None


# --------------------------------------------------------------------------- #
# identity
# --------------------------------------------------------------------------- #
async def all_student_ids() -> list[str]:
    """Canonical student identity = identity.users.Id (string)."""
    rows = await _fetch('SELECT "Id" AS id FROM identity.users', {})
    return [str(r["id"]) for r in rows]


# --------------------------------------------------------------------------- #
# academic_planning.assessments  (student_id = text == canonical)
# --------------------------------------------------------------------------- #
async def assessments(user_id: str | None = None) -> Any:
    """Assessment marks/type/status/weight per student.

    Columns: id, student_id (text), subject_id (text canonical subject slug,
    matches the Subject catalog Id), title, type, status, weight, actual_mark,
    predicted_mark, due_date, tasks (jsonb SBA breakdown), created_at,
    updated_at. ``actual_mark`` is the realized 0-100 result the school returned
    (null until graded); ``predicted_mark`` is what the student/model expects.
    """
    sql = (
        "SELECT id, student_id, subject_id, title, type, status, weight, "
        "actual_mark, predicted_mark, due_date, tasks, created_at, updated_at "
        "FROM academic_planning.assessments"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY due_date"
    return _to_frame(await _fetch(sql, params))


async def assessment_subject_marks(user_id: str | None = None) -> Any:
    """Graded assessment marks resolved to the owning ``student_subjects.id``.

    ``insights.grade_distributions`` is keyed by ``student_subject_id`` (bigint,
    FK to ``academic_planning.student_subjects.id``), but an assessment only
    carries a text ``subject_id`` *slug*. This helper walks the catalog chain to
    attach the bigint student-subject id so the grade-distribution builder can
    bucket marks per (student, subject):

        assessments.subject_id (slug) == curriculum_subjects.subject_id (slug)
        student_subjects.curriculum_subject_id == curriculum_subjects.id
        student_subjects.student_id            == assessments.student_id

    Only graded rows are returned (``actual_mark IS NOT NULL``) — a grade band is
    only meaningful for a realized mark. Columns: student_subject_id (bigint),
    student_id (text), subject_id (slug), assessment_id, mark (int 0-100),
    weight, due_date.
    """
    sql = (
        "SELECT ss.id AS student_subject_id, a.student_id, a.subject_id, "
        "a.id AS assessment_id, a.actual_mark AS mark, a.weight, a.due_date "
        "FROM academic_planning.assessments a "
        "JOIN academic_planning.curriculum_subjects cs "
        "  ON cs.subject_id = a.subject_id "
        "JOIN academic_planning.student_subjects ss "
        "  ON ss.curriculum_subject_id = cs.id "
        " AND ss.student_id = a.student_id "
        "WHERE a.actual_mark IS NOT NULL"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " AND a.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY ss.id, a.due_date"
    return _to_frame(await _fetch(sql, params))


async def practice_subject_marks(user_id: str | None = None) -> Any:
    """Submitted practice-attempt scores resolved to ``student_subjects.id``.

    Mirrors :func:`assessment_subject_marks` for the practice side so practice
    performance can be folded into the same per-(student,subject) histogram.
    ``practice.practice_tests`` carries the canonical subject slug; we join it to
    the catalog chain exactly as for assessments:

        practice_attempts.test_id == practice_tests.id
        practice_tests.subject_id (slug) == curriculum_subjects.subject_id (slug)
        student_subjects.curriculum_subject_id == curriculum_subjects.id
        student_subjects.student_id            == practice_attempts.student_id

    Only attempts with a non-null score are returned. Columns:
    student_subject_id (bigint), student_id (text), subject_id (slug),
    attempt_id, mark (int 0-100), submitted_at.
    """
    sql = (
        "SELECT ss.id AS student_subject_id, pa.student_id, pt.subject_id, "
        "pa.id AS attempt_id, pa.score AS mark, pa.submitted_at "
        "FROM practice.practice_attempts pa "
        "JOIN practice.practice_tests pt ON pt.id = pa.test_id "
        "JOIN academic_planning.curriculum_subjects cs "
        "  ON cs.subject_id = pt.subject_id "
        "JOIN academic_planning.student_subjects ss "
        "  ON ss.curriculum_subject_id = cs.id "
        " AND ss.student_id = pa.student_id "
        "WHERE pa.score IS NOT NULL"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " AND pa.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY ss.id, pa.submitted_at"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# academic_planning.student_subjects  (student_id = text == canonical)
# Maps the canonical student id -> the bigint student_subject_id that the
# mastery.* projection tables key on.
# --------------------------------------------------------------------------- #
async def student_subjects(user_id: str | None = None) -> Any:
    """Enrolment rows linking a student to a subject.

    academic_planning.student_subjects: id (bigint == student_subject_id),
    student_id (text canonical), curriculum_subject_id (bigint), grade (int),
    teacher (text), created_at, updated_at.
    """
    sql = (
        "SELECT id, student_id, curriculum_subject_id, grade, teacher, "
        "created_at, updated_at "
        "FROM academic_planning.student_subjects"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY id"
    return _to_frame(await _fetch(sql, params))


async def student_subject_slug_map(user_id: str | None = None) -> Any:
    """Resolve each (student, subject slug) to the bigint ``student_subjects.id``.

    The bridge the mastery / gap projections need: practice tests and assessments
    only carry a text subject *slug* (``subject_id``), but the projection tables
    key on ``student_subject_id`` (bigint). This walks the catalog chain once so a
    caller can look topics up by (student_id, subject_id slug):

        curriculum_subjects.subject_id (slug) == practice_tests/assessments.subject_id
        student_subjects.curriculum_subject_id == curriculum_subjects.id

    Columns: student_subject_id (bigint), student_id (text), subject_id (slug),
    curriculum_subject_id (bigint).
    """
    sql = (
        "SELECT ss.id AS student_subject_id, ss.student_id, "
        "cs.subject_id AS subject_id, ss.curriculum_subject_id "
        "FROM academic_planning.student_subjects ss "
        "JOIN academic_planning.curriculum_subjects cs "
        "  ON cs.id = ss.curriculum_subject_id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE ss.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY ss.id"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# practice.* (practice_attempts.student_id = text == canonical)
# --------------------------------------------------------------------------- #
async def practice_attempts(user_id: str | None = None) -> Any:
    """Practice attempts: per-attempt score/status/timing.

    practice.practice_attempts: id, test_id, student_id (text), status, score,
    started_at, submitted_at, created_at, updated_at.
    """
    sql = (
        "SELECT id, test_id, student_id, status, score, started_at, "
        "submitted_at, created_at, updated_at "
        "FROM practice.practice_attempts"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY started_at"
    return _to_frame(await _fetch(sql, params))


async def practice_attempt_items(user_id: str | None = None) -> Any:
    """Per-question correctness + time, joined to the owning attempt so we can
    filter by the canonical student id.

    practice.practice_attempt_items: id, attempt_id, question_id, topic,
    is_correct, given_answer_idx, correct_answer_idx, time_ms,
    answer_submission_id. Joined columns: student_id, test_id (from the attempt)
    and subject_id (text, from the owning practice_tests row) so a topic can be
    attributed to the right subject enrolment.
    """
    sql = (
        "SELECT i.id, i.attempt_id, a.student_id, a.test_id, t.subject_id, "
        "i.question_id, i.topic, i.is_correct, i.given_answer_idx, "
        "i.correct_answer_idx, i.time_ms, i.answer_submission_id, i.created_at "
        "FROM practice.practice_attempt_items i "
        "JOIN practice.practice_attempts a ON a.id = i.attempt_id "
        "LEFT JOIN practice.practice_tests t ON t.id = a.test_id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE a.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY i.attempt_id, i.id"
    return _to_frame(await _fetch(sql, params))


async def attempt_score_summaries(user_id: str | None = None) -> Any:
    """Per-attempt rollups including per-topic correctness (jsonb) and timing.

    practice.attempt_score_summaries: id, attempt_id, total_questions,
    correct_count, incorrect_count, unanswered_count, score_percent,
    total_time_ms, per_topic (jsonb). Joined: student_id, test_id (from attempt).
    """
    sql = (
        "SELECT s.id, s.attempt_id, a.student_id, a.test_id, s.total_questions, "
        "s.correct_count, s.incorrect_count, s.unanswered_count, "
        "s.score_percent, s.total_time_ms, s.per_topic, s.created_at, "
        "s.updated_at "
        "FROM practice.attempt_score_summaries s "
        "JOIN practice.practice_attempts a ON a.id = s.attempt_id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE a.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY s.attempt_id"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# wellbeing.* (student_id = bigint -> legacy numeric id)
# --------------------------------------------------------------------------- #
async def mood_trackings(user_id: str | None = None) -> Any:
    """Mood check-ins.

    wellbeing.mood_trackings: id, student_id (bigint), mood, mood_score,
    energy_level, stress_level, sleep_quality, sleep_hours, coping_strategies,
    triggers, notes, tracked_at. NOTE student_id is a bigint legacy id; a text
    canonical user_id is only applied when it parses as an int.
    """
    sql = (
        "SELECT id, student_id, mood, mood_score, energy_level, stress_level, "
        "sleep_quality, sleep_hours, coping_strategies, triggers, notes, "
        "tracked_at, created_at, updated_at "
        "FROM wellbeing.mood_trackings"
    )
    params: dict[str, Any] = {}
    sid = _maybe_int(user_id)
    if sid is not None:
        sql += " WHERE student_id = :sid"
        params["sid"] = sid
    sql += " ORDER BY tracked_at"
    return _to_frame(await _fetch(sql, params))


async def diary_entries(user_id: str | None = None) -> Any:
    """Diary entries with their content + existing AI-derived fields.

    wellbeing.diary_entries: id, student_id (bigint), title, content,
    entry_type, entry_date, mood, mood_intensity, is_private, tags, key_themes,
    sentiment_analysis, sentiment_score, ai_insights, needs_follow_up,
    follow_up_action. NOTE student_id is bigint legacy id (see mood_trackings).
    """
    sql = (
        "SELECT id, student_id, title, content, entry_type, entry_date, mood, "
        "mood_intensity, is_private, tags, key_themes, sentiment_analysis, "
        "sentiment_score, ai_insights, needs_follow_up, follow_up_action, "
        "created_at, updated_at "
        "FROM wellbeing.diary_entries"
    )
    params: dict[str, Any] = {}
    sid = _maybe_int(user_id)
    if sid is not None:
        sql += " WHERE student_id = :sid"
        params["sid"] = sid
    sql += " ORDER BY entry_date"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# goals.* (goals.student_id = text == canonical; milestones via goal_id)
# --------------------------------------------------------------------------- #
async def goals(user_id: str | None = None) -> Any:
    """Goals with their milestones (LEFT JOIN goal_milestones).

    goals.goals: id, student_id (text), subject_id, title, description,
    category, target, status, progress, due_date, reward, reward_id.
    goals.goal_milestones: id, goal_id, title, description, priority,
    reward_points, is_completed, completed_at. Milestone columns are prefixed
    ``milestone_`` so a flat frame keeps both. Goals with no milestone still
    appear (milestone_id is null).
    """
    sql = (
        "SELECT g.id, g.student_id, g.subject_id, g.title, g.description, "
        "g.category, g.target, g.status, g.progress, g.due_date, g.reward, "
        "g.reward_id, g.created_at, g.updated_at, "
        "m.id AS milestone_id, m.title AS milestone_title, "
        "m.description AS milestone_description, m.priority AS milestone_priority, "
        "m.reward_points AS milestone_reward_points, "
        "m.is_completed AS milestone_is_completed, "
        "m.completed_at AS milestone_completed_at "
        "FROM goals.goals g "
        "LEFT JOIN goals.goal_milestones m ON m.goal_id = g.id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE g.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY g.id, m.priority"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# mastery.topic_masteries  (keyed on student_subject_id -> academic_planning.
# student_subjects.id, whose student_id IS the canonical text user id)
# --------------------------------------------------------------------------- #
async def topic_masteries(user_id: str | None = None) -> Any:
    """Per-topic mastery levels, resolved to the canonical student id.

    mastery.topic_masteries: id, student_subject_id (bigint), topic_id (text),
    mastery_level (double), created_at, updated_at. It keys on
    student_subject_id which FKs academic_planning.student_subjects.id; that
    table carries student_id (text == canonical user id), so we JOIN through it
    and expose ``student_id`` on each row. Filtering by a (text) user_id is
    therefore exact, unlike the bigint wellbeing tables.
    """
    sql = (
        "SELECT tm.id, tm.student_subject_id, ss.student_id, tm.topic_id, "
        "tm.mastery_level, tm.created_at, tm.updated_at "
        "FROM mastery.topic_masteries tm "
        "JOIN academic_planning.student_subjects ss "
        "ON ss.id = tm.student_subject_id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE ss.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY ss.student_id, tm.student_subject_id, tm.topic_id"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# mastery.knowledge_gaps  (keyed on student_subject_id -> academic_planning.
# student_subjects.id, whose student_id IS the canonical text user id)
# --------------------------------------------------------------------------- #
async def knowledge_gaps(user_id: str | None = None) -> Any:
    """Detected knowledge gaps, resolved to the canonical student id.

    mastery.knowledge_gaps: id, student_subject_id (bigint), topic_id (bigint),
    concept (text), severity (text: low|medium|high|critical), last_tested
    (timestamptz), created_at, updated_at. Keys on student_subject_id which FKs
    academic_planning.student_subjects.id, carrying student_id (text == canonical
    user id), so we JOIN through it and expose ``student_id`` per row. Filtering
    by a (text) user_id is therefore exact.
    """
    sql = (
        "SELECT kg.id, kg.student_subject_id, ss.student_id, kg.topic_id, "
        "kg.concept, kg.severity, kg.last_tested, kg.created_at, kg.updated_at "
        "FROM mastery.knowledge_gaps kg "
        "JOIN academic_planning.student_subjects ss "
        "ON ss.id = kg.student_subject_id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE ss.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY ss.student_id, kg.student_subject_id, kg.topic_id"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# mastery.student_subject_analytics  (study patterns; keyed on
# student_subject_id -> academic_planning.student_subjects.id == canonical id)
# --------------------------------------------------------------------------- #
async def student_subject_analytics(user_id: str | None = None) -> Any:
    """Per-(student_subject, topic) study patterns, resolved to canonical id.

    mastery.student_subject_analytics: id, student_subject_id (bigint),
    topic_id (bigint), plus the wide study-pattern columns: attendance_rate,
    motivation_level, stress_level, sleep_quality, workload_this_week,
    consistency, session_length, morning/afternoon/evening_percentage,
    participation_rate, practice_problems, interest_level, etc. Joined through
    academic_planning.student_subjects to expose ``student_id`` (text canonical).
    """
    sql = (
        "SELECT a.id, a.student_subject_id, ss.student_id, a.topic_id, "
        "a.attendance_rate, a.motivation_level, a.stress_level, a.sleep_quality, "
        "a.workload_this_week, a.consistency, a.session_length, "
        "a.morning_percentage, a.afternoon_percentage, a.evening_percentage, "
        "a.participation_rate, a.practice_problems, a.interest_level, "
        "a.created_at, a.updated_at "
        "FROM mastery.student_subject_analytics a "
        "JOIN academic_planning.student_subjects ss "
        "ON ss.id = a.student_subject_id"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE ss.student_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY ss.student_id, a.student_subject_id, a.topic_id"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# calendar.calendar_events (student_id = bigint -> legacy numeric id)
# --------------------------------------------------------------------------- #
async def calendar_events(user_id: str | None = None) -> Any:
    """Calendar events (study sessions, deadlines, etc.).

    calendar.calendar_events: id, student_id (bigint), title, description,
    event_type, start_time, end_time, is_all_day, location, recurrence_rule,
    status, related_entity_type, related_entity_id. NOTE student_id is bigint
    legacy id (see mood_trackings).
    """
    sql = (
        "SELECT id, student_id, title, description, event_type, start_time, "
        "end_time, is_all_day, location, recurrence_rule, status, "
        "related_entity_type, related_entity_id, created_at, updated_at "
        "FROM calendar.calendar_events"
    )
    params: dict[str, Any] = {}
    sid = _maybe_int(user_id)
    if sid is not None:
        sql += " WHERE student_id = :sid"
        params["sid"] = sid
    sql += " ORDER BY start_time"
    return _to_frame(await _fetch(sql, params))


# --------------------------------------------------------------------------- #
# audit.audit_logs (user_id = text == canonical) — engagement signal
# --------------------------------------------------------------------------- #
async def audit_logs(user_id: str | None = None) -> Any:
    """Engagement signal: who did what, when.

    audit.audit_logs: id, action_id, user_id (text), user_email, user_role,
    entity_type, entity_id, old_values, new_values, ip_address, user_agent,
    service_name, correlation_id, created_at.
    """
    sql = (
        "SELECT id, action_id, user_id, user_email, user_role, entity_type, "
        "entity_id, service_name, correlation_id, created_at "
        "FROM audit.audit_logs"
    )
    params: dict[str, Any] = {}
    if user_id is not None:
        sql += " WHERE user_id = :uid"
        params["uid"] = user_id
    sql += " ORDER BY created_at"
    return _to_frame(await _fetch(sql, params))
