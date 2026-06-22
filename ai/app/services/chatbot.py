"""Chatbot — the ONLY LLM surface, on OpenAI (ChatGPT).

Retrieval-augmented over the student's OWN analytics (mastery, gaps, tips). Only
the user's question plus a BOUNDED, REDACTED context is sent to OpenAI — never a
raw PII dump.

What goes to OpenAI:
    * the student's question, verbatim
    * a small, bounded summary of the student's OWN computed analytics:
        - top knowledge gaps   (concept + severity)            — mastery.knowledge_gaps
        - weakest topics       (topic label + mastery 0..1)    — mastery.topic_masteries
        - improvement tips     (tip text + priority)           — insights.improvement_tips

What NEVER goes to OpenAI:
    * names, emails, ids, diary content, mood notes, free-text PII
    * raw rows of any kind — only the computed signals above, capped in count and
      truncated in length.

Schema (verbatim from the committed EF migrations /
ApplicationDbContextModelSnapshot.cs — snake_case throughout):
    academic_planning.student_subjects(id bigint, student_id text, grade int)
        - student_id is the canonical identity.users."Id". This is the ONLY table
          that maps a (bigint) student_subject_id back to the canonical user id,
          so every analytics read joins through it and filters on student_id.
    mastery.topic_masteries(student_subject_id bigint, topic_id text,
        topic_id1 bigint, mastery_level double, updated_at timestamptz)
        - topic_id is the human-readable topic LABEL (safe to surface).
    mastery.knowledge_gaps(student_subject_id bigint, topic_id bigint,
        concept text, severity text, last_tested timestamptz, updated_at)
    insights.improvement_tips(student_subject_id bigint,
        student_subject_topic_id bigint, tip text, priority int, updated_at)

Analytics rows carry computed_at/model_version once the .NET side adds those
columns (see app/data/sinks.py stamp()); we order on updated_at, which exists
today, so the context is always the freshest computed signal.

Per-user daily quota:
    A simple counter in Redis (app.core.redis) keyed per user + UTC day, with a
    same-day TTL. When the cap is hit we return a friendly message and do NOT
    call OpenAI, so a runaway client can never burn the paid quota.

Heavy ML imports (torch/sentence-transformers/pyBKT/lightgbm) are NOT used here,
and nothing heavy is imported at module top-level so the package imports with
only light deps installed.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from openai import AsyncOpenAI
from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import session_scope
from app.core.logging import get_logger
from app.core.redis import get_redis

log = get_logger(__name__)

_SYSTEM = (
    "You are Aptiverse's study companion for South African NSC/IEB students. "
    "Be concise, encouraging, and curriculum-aware. Use the student's own "
    "analytics context when provided. Never invent marks or progress."
)

# --------------------------------------------------------------------------- #
# bounds — keep the context small and the question + analytics the ONLY payload
# --------------------------------------------------------------------------- #
MAX_GAPS = 5
MAX_TOPICS = 5
MAX_TIPS = 5
#: hard cap on any single free-text field we forward (tips/concepts/labels).
MAX_TEXT_LEN = 200

# --------------------------------------------------------------------------- #
# per-user daily quota
# --------------------------------------------------------------------------- #
DAILY_QUOTA = 50
_QUOTA_MESSAGE = (
    "You've reached today's chat limit. Your progress is saved — come back "
    "tomorrow and we'll pick up right where we left off."
)


def _clip(value: Any) -> str:
    """Coerce a DB value to a bounded, single-line string for the LLM context."""
    s = "" if value is None else str(value)
    s = s.replace("\n", " ").replace("\r", " ").strip()
    if len(s) > MAX_TEXT_LEN:
        s = s[: MAX_TEXT_LEN - 1].rstrip() + "…"
    return s


# --------------------------------------------------------------------------- #
# quota
# --------------------------------------------------------------------------- #
async def _check_and_increment_quota(user_id: str) -> bool:
    """Increment today's per-user chat counter; return True if WITHIN quota.

    Keyed ``ai:chat:quota:{user_id}:{YYYY-MM-DD}`` (UTC). The first increment of
    the day sets a 24h TTL so the key self-expires. Fails OPEN: if Redis is
    unavailable we log and allow the call rather than hard-blocking the student.
    """
    day = datetime.now(UTC).strftime("%Y-%m-%d")
    key = f"ai:chat:quota:{user_id}:{day}"
    try:
        redis = get_redis()
        count = await redis.incr(key)
        if count == 1:
            # first hit today — expire at ~end of the rolling day
            await redis.expire(key, 60 * 60 * 24)
        if count > DAILY_QUOTA:
            log.info("chat.quota_exceeded", user_id=user_id, count=count, cap=DAILY_QUOTA)
            return False
        return True
    except Exception:
        # Redis down / misconfigured: don't punish the student for our outage.
        log.exception("chat.quota_check_failed", user_id=user_id)
        return True


# --------------------------------------------------------------------------- #
# retrieval — bounded, redacted, the student's OWN computed analytics only
# --------------------------------------------------------------------------- #
async def _fetch_context(user_id: str) -> dict[str, list[dict[str, Any]]]:
    """Read the student's own mastery/gaps/tips, joined through
    academic_planning.student_subjects so we filter on the canonical (text)
    student id. Returns small, capped lists of computed signals — no PII."""

    gaps_sql = text(
        """
        SELECT kg.concept   AS concept,
               kg.severity  AS severity
        FROM mastery.knowledge_gaps kg
        JOIN academic_planning.student_subjects ss
          ON ss.id = kg.student_subject_id
        WHERE ss.student_id = :uid
        ORDER BY CASE kg.severity
                     WHEN 'high'   THEN 0
                     WHEN 'medium' THEN 1
                     WHEN 'low'    THEN 2
                     ELSE 3
                 END,
                 kg.updated_at DESC
        LIMIT :lim
        """
    )

    # Weakest topics first (lowest mastery_level). topic_id is the readable label.
    topics_sql = text(
        """
        SELECT tm.topic_id      AS topic,
               tm.mastery_level AS mastery_level
        FROM mastery.topic_masteries tm
        JOIN academic_planning.student_subjects ss
          ON ss.id = tm.student_subject_id
        WHERE ss.student_id = :uid
        ORDER BY tm.mastery_level ASC, tm.updated_at DESC
        LIMIT :lim
        """
    )

    tips_sql = text(
        """
        SELECT it.tip      AS tip,
               it.priority AS priority
        FROM insights.improvement_tips it
        JOIN academic_planning.student_subjects ss
          ON ss.id = it.student_subject_id
        WHERE ss.student_id = :uid
        ORDER BY it.priority DESC, it.updated_at DESC
        LIMIT :lim
        """
    )

    async with session_scope() as s:
        gaps = (await s.execute(gaps_sql, {"uid": user_id, "lim": MAX_GAPS})).mappings().all()
        topics = (await s.execute(topics_sql, {"uid": user_id, "lim": MAX_TOPICS})).mappings().all()
        tips = (await s.execute(tips_sql, {"uid": user_id, "lim": MAX_TIPS})).mappings().all()

    return {
        "gaps": [
            {"concept": _clip(r["concept"]), "severity": _clip(r["severity"])}
            for r in gaps
        ],
        "topics": [
            {"topic": _clip(r["topic"]), "mastery": round(float(r["mastery_level"]), 2)}
            for r in topics
        ],
        "tips": [
            {"tip": _clip(r["tip"]), "priority": int(r["priority"])}
            for r in tips
        ],
    }


def _render_context(ctx: dict[str, list[dict[str, Any]]]) -> str:
    """Render the bounded analytics into a compact, human-readable block.

    Returns "" when the student has no computed analytics yet, so the system
    prompt stays clean and the model is not fed an empty scaffold.
    """
    lines: list[str] = []

    if ctx["topics"]:
        lines.append("Weakest topics (mastery 0-1, lower = weaker):")
        lines += [f"- {t['topic']}: {t['mastery']:.2f}" for t in ctx["topics"]]

    if ctx["gaps"]:
        lines.append("Knowledge gaps (concept — severity):")
        lines += [f"- {g['concept']} — {g['severity']}" for g in ctx["gaps"]]

    if ctx["tips"]:
        lines.append("Suggested focus (improvement tips, highest priority first):")
        lines += [f"- {t['tip']}" for t in ctx["tips"]]

    if not lines:
        return ""

    return (
        "\n\nHere is the student's own recent analytics. Ground your reply in it; "
        "do not mention data the student did not ask about unless it is helpful:\n"
        + "\n".join(lines)
    )


# --------------------------------------------------------------------------- #
# entry point
# --------------------------------------------------------------------------- #
async def answer(user_id: str, message: str) -> str:
    settings = get_settings()

    # 1) Per-user daily quota — never call the paid API past the cap.
    if not await _check_and_increment_quota(user_id):
        return _QUOTA_MESSAGE

    # 2) Retrieve a bounded, redacted context for THIS user (no raw PII).
    try:
        ctx = await _fetch_context(user_id)
        context = _render_context(ctx)
    except Exception:
        # Analytics is best-effort: a retrieval failure must not break chat.
        log.exception("chat.context_fetch_failed", user_id=user_id)
        context = ""

    log.info(
        "chat.answer",
        user_id=user_id,
        has_context=bool(context),
        context_chars=len(context),
    )

    # 3) Only the question + bounded analytics context reaches OpenAI.
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": _SYSTEM + context},
            {"role": "user", "content": message},
        ],
    )
    return resp.choices[0].message.content or ""
