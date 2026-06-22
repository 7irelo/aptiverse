"""Subject-Analytics Aggregator → mastery.student_subject_analytics.

Inputs : audit log, calendar, practice, mood.
Method : feature engineering / aggregation (polars) — study-time-of-day,
         consistency, engagement, resource usage, psychosocial proxies.
Weight : medium. Cadence: nightly.

One analytics row is emitted per (student_subject_id, topic_id) natural key.
This aggregator is subject-level rather than topic-level, so it writes a single
subject-wide row per enrolment using the sentinel ``topic_id = 0`` (the wide
table keys on (student_subject_id, topic_id); 0 marks "whole subject"). The
heavier per-topic mastery numbers are owned by the mastery / gaps services.

The aggregated feature columns map onto the verbatim
mastery.student_subject_analytics columns (from
ApplicationDbContextModelSnapshot.cs):

    study-time-of-day : morning_percentage, afternoon_percentage,
                        evening_percentage, preferred_days, session_length
    consistency       : consistency, attendance_rate, classes_attended,
                        total_classes, participation_rate
    engagement        : forum_activity, questions_asked, group_study,
                        practice_problems, interest_level, importance,
                        workload_this_week
    resource usage    : resource_downloads, video_tutorials, textbook_usage,
                        online_platforms
    psychosocial      : motivation_level, stress_level, sleep_quality, alignment

All heavy ML libraries (torch/sentence-transformers/pyBKT/lightgbm) are kept out
of this module entirely; the aggregation is pure-polars / pure-Python so the
package imports with only light deps. Should any heavy lib ever be needed here,
import it INSIDE compute(), never at module top-level.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Sequence
from typing import Any

from app.core.logging import get_logger
from app.data import signals, sinks
from app.services.base import AnalyticsService

log = get_logger(__name__)

#: Subject-wide sentinel for the topic_id half of the natural key.
_SUBJECT_WIDE_TOPIC_ID = 0

#: Days of the week in the order datetime.weekday() returns (Mon..Sun).
_WEEKDAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


def _rows(frame: Any) -> list[dict[str, Any]]:
    """Normalise a signals helper return value to a list[dict].

    signals._to_frame yields a polars DataFrame when polars is installed and a
    list[dict] otherwise. Accept both so this service runs on a light install.
    """
    if frame is None:
        return []
    # polars DataFrame -> list[dict]; .to_dicts() is the cheap path.
    to_dicts = getattr(frame, "to_dicts", None)
    if callable(to_dicts):
        return to_dicts()
    if isinstance(frame, Sequence):
        return [dict(r) for r in frame]
    return []


def _hour(value: Any) -> int | None:
    """Best-effort hour-of-day from a datetime/aware-datetime/str column."""
    if value is None:
        return None
    hour = getattr(value, "hour", None)
    if hour is not None:
        return int(hour)
    return None


def _weekday(value: Any) -> int | None:
    wd = getattr(value, "weekday", None)
    if callable(wd):
        return int(wd())
    return None


def _clamp_pct(x: float) -> int:
    return int(max(0, min(100, round(x))))


def _scale01(x: float) -> float:
    return float(max(0.0, min(1.0, x)))


class SubjectAnalyticsService(AnalyticsService):
    name = "subject_analytics"
    weight = "medium"

    async def compute(self, user_id: str | None) -> int:
        # --- enrolments: the (student_id text) -> (student_subject_id bigint) map.
        enrolments = _rows(await signals.student_subjects(user_id))
        if not enrolments:
            log.info("subject_analytics.no_enrolments", scope=user_id or "ALL")
            return 0

        # student_id (canonical text) -> list of student_subject ids.
        subj_by_student: dict[str, list[int]] = defaultdict(list)
        for e in enrolments:
            sid = e.get("student_id")
            ssid = e.get("id")
            if sid is None or ssid is None:
                continue
            subj_by_student[str(sid)].append(int(ssid))

        # --- raw signals (canonical-text-keyed sources are filtered by user_id;
        # bigint-keyed calendar is read whole and bucketed below).
        audit = _rows(await signals.audit_logs(user_id))
        attempts = _rows(await signals.practice_attempts(user_id))
        summaries = _rows(await signals.attempt_score_summaries(user_id))
        cal = _rows(await signals.calendar_events(user_id))
        mood = _rows(await signals.mood_trackings(user_id))

        # Index audit/practice by canonical student id (text).
        audit_by_student: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for a in audit:
            audit_by_student[str(a.get("user_id"))].append(a)

        attempts_by_student: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for at in attempts:
            attempts_by_student[str(at.get("student_id"))].append(at)

        summary_by_student: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for s in summaries:
            summary_by_student[str(s.get("student_id"))].append(s)

        # calendar + mood are bigint legacy-id keyed (Phase-2 unification pending).
        # Index by the numeric student_id; matched per-student when the canonical
        # id parses as that int (see signals._maybe_int).
        cal_by_legacy: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for c in cal:
            lid = c.get("student_id")
            if lid is not None:
                cal_by_legacy[int(lid)].append(c)

        mood_by_legacy: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for m in mood:
            lid = m.get("student_id")
            if lid is not None:
                mood_by_legacy[int(lid)].append(m)

        out_rows: list[dict[str, Any]] = []
        for student_id, ssids in subj_by_student.items():
            legacy = _maybe_legacy(student_id)
            features = self._features_for_student(
                student_id=student_id,
                audit=audit_by_student.get(student_id, []),
                attempts=attempts_by_student.get(student_id, []),
                summaries=summary_by_student.get(student_id, []),
                cal=cal_by_legacy.get(legacy, []) if legacy is not None else [],
                mood=mood_by_legacy.get(legacy, []) if legacy is not None else [],
            )
            # one subject-wide row per enrolment for this student.
            for ssid in ssids:
                row = dict(features)
                row["student_subject_id"] = ssid
                row["topic_id"] = _SUBJECT_WIDE_TOPIC_ID
                out_rows.append(row)

        written = await sinks.upsert_student_subject_analytics(out_rows)
        log.info(
            "subject_analytics.done",
            scope=user_id or "ALL",
            students=len(subj_by_student),
            rows=written,
        )
        return written

    # ------------------------------------------------------------------ #
    # feature engineering — one student's signals -> one feature dict
    # ------------------------------------------------------------------ #
    def _features_for_student(
        self,
        *,
        student_id: str,
        audit: list[dict[str, Any]],
        attempts: list[dict[str, Any]],
        summaries: list[dict[str, Any]],
        cal: list[dict[str, Any]],
        mood: list[dict[str, Any]],
    ) -> dict[str, Any]:
        tod = self._study_time_of_day(attempts, cal, audit)
        consistency = self._consistency(attempts, cal, audit)
        engagement = self._engagement(audit, attempts, summaries, cal)
        resources = self._resource_usage(audit)
        psych = self._psychosocial(mood)
        attendance = self._attendance(cal)

        feats: dict[str, Any] = {}
        feats.update(tod)
        feats.update(consistency)
        feats.update(engagement)
        feats.update(resources)
        feats.update(psych)
        feats.update(attendance)
        return feats

    # ---- study-time-of-day -------------------------------------------- #
    def _study_time_of_day(
        self,
        attempts: list[dict[str, Any]],
        cal: list[dict[str, Any]],
        audit: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """morning/afternoon/evening % split, preferred day, mean session length.

        Buckets: morning 05:00-11:59, afternoon 12:00-16:59, evening 17:00-04:59.
        Activity timestamps come from practice attempt starts, calendar study
        events, and audit log entries — whichever exist.
        """
        hours: list[int] = []
        weekdays: list[int] = []

        for a in attempts:
            h = _hour(a.get("started_at"))
            if h is not None:
                hours.append(h)
            wd = _weekday(a.get("started_at"))
            if wd is not None:
                weekdays.append(wd)
        for c in cal:
            h = _hour(c.get("start_time"))
            if h is not None:
                hours.append(h)
            wd = _weekday(c.get("start_time"))
            if wd is not None:
                weekdays.append(wd)
        for ev in audit:
            h = _hour(ev.get("created_at"))
            if h is not None:
                hours.append(h)

        total = len(hours)
        if total:
            morning = sum(1 for h in hours if 5 <= h < 12)
            afternoon = sum(1 for h in hours if 12 <= h < 17)
            evening = total - morning - afternoon
            morning_pct = _clamp_pct(100 * morning / total)
            afternoon_pct = _clamp_pct(100 * afternoon / total)
            # keep the three buckets summing to 100.
            evening_pct = max(0, 100 - morning_pct - afternoon_pct)
            _ = evening
        else:
            morning_pct = afternoon_pct = evening_pct = 0

        if weekdays:
            counts = [weekdays.count(i) for i in range(7)]
            best = max(range(7), key=lambda i: counts[i])
            preferred_days = _WEEKDAYS[best]
        else:
            preferred_days = ""

        # mean session length in minutes: prefer calendar event duration, else
        # mean practice attempt span (started_at -> submitted_at).
        durations: list[float] = []
        for c in cal:
            start, end = c.get("start_time"), c.get("end_time")
            mins = _minutes_between(start, end)
            if mins is not None and mins > 0:
                durations.append(mins)
        if not durations:
            for a in attempts:
                mins = _minutes_between(a.get("started_at"), a.get("submitted_at"))
                if mins is not None and mins > 0:
                    durations.append(mins)
        session_length = int(round(sum(durations) / len(durations))) if durations else 0

        return {
            "morning_percentage": morning_pct,
            "afternoon_percentage": afternoon_pct,
            "evening_percentage": evening_pct,
            "preferred_days": preferred_days,
            "session_length": session_length,
        }

    # ---- consistency / participation ---------------------------------- #
    def _consistency(
        self,
        attempts: list[dict[str, Any]],
        cal: list[dict[str, Any]],
        audit: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """0-100 consistency = fraction of distinct active days over the span of
        observed activity. A student active most days in their window scores high.
        """
        days: set[Any] = set()
        first = last = None
        for src, key in (
            (attempts, "started_at"),
            (cal, "start_time"),
            (audit, "created_at"),
        ):
            for r in src:
                ts = r.get(key)
                d = getattr(ts, "date", None)
                if callable(d):
                    day = d()
                    days.add(day)
                    if first is None or ts < first:
                        first = ts
                    if last is None or ts > last:
                        last = ts

        if first is not None and last is not None:
            span_days = (last.date() - first.date()).days + 1
        else:
            span_days = 0

        consistency = _clamp_pct(100 * len(days) / span_days) if span_days > 0 else 0

        # participation_rate: distinct active days normalised to a 30-day window.
        participation_rate = _clamp_pct(100 * len(days) / 30)

        return {
            "consistency": consistency,
            "participation_rate": participation_rate,
        }

    # ---- engagement ---------------------------------------------------- #
    def _engagement(
        self,
        audit: list[dict[str, Any]],
        attempts: list[dict[str, Any]],
        summaries: list[dict[str, Any]],
        cal: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Counts of engaged behaviours from the audit log + practice volume.

        Audit entity_type / action gives a coarse behaviour signal; practice
        attempts count toward problems worked; mood/interest is proxied below.
        """
        practice_problems = 0
        for s in summaries:
            tq = s.get("total_questions")
            if tq is not None:
                practice_problems += int(tq)
        if not practice_problems:
            practice_problems = len(attempts)

        forum_activity = 0
        questions_asked = 0
        group_study = 0
        for ev in audit:
            entity = str(ev.get("entity_type") or "").lower()
            if "forum" in entity or "discussion" in entity or "comment" in entity:
                forum_activity += 1
            if "question" in entity or "ask" in entity:
                questions_asked += 1
            if "group" in entity or "study_group" in entity:
                group_study += 1

        # interest_level (0..1): activity density relative to a soft cap of 50
        # total engaged actions; importance mirrors scheduled study load.
        total_actions = len(audit) + len(attempts)
        interest_level = _scale01(total_actions / 50.0)

        scheduled = len(cal)
        importance = _clamp_pct(100 * _scale01(scheduled / 20.0))

        # workload_this_week (0..1): scheduled events as a fraction of a 14-event
        # busy week, plus open practice attempts.
        open_attempts = sum(
            1
            for a in attempts
            if str(a.get("status") or "").lower() not in ("submitted", "completed", "graded")
        )
        workload_this_week = _scale01((scheduled + open_attempts) / 14.0)

        return {
            "forum_activity": forum_activity,
            "questions_asked": questions_asked,
            "group_study": group_study,
            "practice_problems": practice_problems,
            "interest_level": interest_level,
            "importance": importance,
            "workload_this_week": workload_this_week,
        }

    # ---- resource usage ------------------------------------------------ #
    def _resource_usage(self, audit: list[dict[str, Any]]) -> dict[str, Any]:
        """Resource-touch counts derived from audit entity types."""
        resource_downloads = 0
        video_tutorials = 0
        textbook_usage = 0
        online_platforms = 0
        for ev in audit:
            entity = str(ev.get("entity_type") or "").lower()
            if "download" in entity or "file" in entity or "resource" in entity:
                resource_downloads += 1
            if "video" in entity or "tutorial" in entity:
                video_tutorials += 1
            if "textbook" in entity or "book" in entity or "reading" in entity:
                textbook_usage += 1
            if "platform" in entity or "tool" in entity or "app" in entity:
                online_platforms += 1
        return {
            "resource_downloads": resource_downloads,
            "video_tutorials": video_tutorials,
            "textbook_usage": textbook_usage,
            "online_platforms": online_platforms,
        }

    # ---- psychosocial proxies ----------------------------------------- #
    def _psychosocial(self, mood: list[dict[str, Any]]) -> dict[str, Any]:
        """motivation_level / stress_level / sleep_quality (0..1) + alignment.

        Derived from wellbeing.mood_trackings means. Source scores are assumed on
        a 0..10 scale (mood_score, stress_level, sleep_quality); normalised to
        0..1 here. Missing data -> neutral 0.5 / "unknown".
        """
        def _mean(key: str) -> float | None:
            vals = [r.get(key) for r in mood if r.get(key) is not None]
            if not vals:
                return None
            return sum(float(v) for v in vals) / len(vals)

        mood_score = _mean("mood_score")
        energy = _mean("energy_level")
        stress = _mean("stress_level")
        sleep = _mean("sleep_quality")

        # motivation ~ blend of mood + energy.
        motivation_parts = [v for v in (mood_score, energy) if v is not None]
        motivation_level = (
            _scale01((sum(motivation_parts) / len(motivation_parts)) / 10.0)
            if motivation_parts
            else 0.5
        )
        stress_level = _scale01(stress / 10.0) if stress is not None else 0.5
        sleep_quality = _scale01(sleep / 10.0) if sleep is not None else 0.5

        if not mood:
            alignment = "unknown"
        elif motivation_level >= 0.66 and stress_level <= 0.5:
            alignment = "strong"
        elif motivation_level >= 0.4:
            alignment = "moderate"
        else:
            alignment = "weak"

        return {
            "motivation_level": motivation_level,
            "stress_level": stress_level,
            "sleep_quality": sleep_quality,
            "alignment": alignment,
        }

    # ---- attendance ---------------------------------------------------- #
    def _attendance(self, cal: list[dict[str, Any]]) -> dict[str, Any]:
        """attendance_rate (0..1) + classes_attended / total_classes from the
        calendar. A class event counts as attended unless its status marks it
        cancelled / missed / no-show.
        """
        class_events = [
            c
            for c in cal
            if "class" in str(c.get("event_type") or "").lower()
            or "lesson" in str(c.get("event_type") or "").lower()
        ]
        total_classes = len(class_events)
        missed_states = {"cancelled", "canceled", "missed", "no_show", "noshow", "absent"}
        classes_attended = sum(
            1
            for c in class_events
            if str(c.get("status") or "").lower() not in missed_states
        )
        attendance_rate = (
            _scale01(classes_attended / total_classes) if total_classes > 0 else 0.0
        )
        return {
            "attendance_rate": attendance_rate,
            "classes_attended": classes_attended,
            "total_classes": total_classes,
        }


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def _maybe_legacy(user_id: str | None) -> int | None:
    """Parse a canonical text id into the legacy numeric student id, mirroring
    signals._maybe_int so calendar/mood (bigint-keyed) match the same students."""
    if user_id is None:
        return None
    try:
        return int(user_id)
    except (TypeError, ValueError):
        return None


def _minutes_between(start: Any, end: Any) -> float | None:
    """Minutes between two datetime-like values, or None if not computable."""
    if start is None or end is None:
        return None
    try:
        delta = end - start
    except TypeError:
        return None
    total = getattr(delta, "total_seconds", None)
    if not callable(total):
        return None
    return total() / 60.0
