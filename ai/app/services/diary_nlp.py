"""Diary NLP → diary_entries AI fields + pgvector embeddings.

Inputs : wellbeing.diary_entries.content.
Method : VADER lexicon sentiment (fast path) + sentence-transformers embeddings
         for theme clustering. LOCAL ONLY — no student diary text leaves the box
         (this replaces the previous Claude path; OpenAI is chatbot-only).
Weight : light (sentiment) → heavy (embeddings). Cadence: on write (event).

Write-back target is the SAME row, not a projection table — this enriches
wellbeing.diary_entries in place, so we UPDATE rather than go through
app.data.sinks. Columns written (verbatim from ApplicationDbContextModelSnapshot):
    sentiment_analysis (text), sentiment_score (double precision),
    key_themes (text), ai_insights (text).

Student scoping: the compute() ``user_id`` is the canonical identity.users.Id
(text). diary_entries.student_id is a bigint that references wellbeing.students.id,
and wellbeing.students.user_id is that canonical text id — so per-student runs join
through wellbeing.students.

HEAVY ML IMPORTS ARE LAZY: vaderSentiment, sentence-transformers and torch are all
imported INSIDE the functions that use them so this module imports with only light
deps installed. The VADER-only path needs neither sentence-transformers nor torch;
the theme/embedding path is gated behind AI_ENABLE_DIARY_EMBEDDINGS.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from typing import Any

from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import session_scope
from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)

# Tiny English stop-word set for the VADER-only theme fallback (no model needed).
# Kept inline so the fast path has zero ML dependencies.
_STOP_WORDS = frozenset(
    """a about above after again against all am an and any are arent as at be because been
    before being below between both but by cant cannot could couldnt did didnt do does doesnt
    doing dont down during each few for from further had hadnt has hasnt have havent having he
    her here hers herself him himself his how i if in into is isnt it its itself just me more
    most my myself no nor not now of off on once only or other our ours ourselves out over own
    same she should shouldnt so some such than that the their theirs them themselves then there
    these they this those through to too under until up very was wasnt we were werent what when
    where which while who whom why with wont would wouldnt you your yours yourself yourselves
    im ive id ill youre youve weve theyre cant dont really feel felt feeling get got really very
    today day really thing things lot bit""".split()
)

_WORD_RE = re.compile(r"[a-zA-Z][a-zA-Z'\-]+")


# --------------------------------------------------------------------------- #
# sentiment — VADER fast path (lazy import; no torch)
# --------------------------------------------------------------------------- #
def _score_sentiment(content: str) -> tuple[float, str, dict[str, float]]:
    """VADER compound sentiment for one diary entry.

    Returns (compound_score in [-1, 1], label, raw_polarity_dict). vaderSentiment
    is imported lazily so the package imports without it; it is a pure-Python
    lexicon analyzer (no torch / no model download).
    """
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(content or "")
    compound = float(scores["compound"])
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return compound, label, scores


def _needs_follow_up(compound: float, scores: dict[str, float]) -> bool:
    """Flag strongly negative entries for human follow-up (cheap heuristic)."""
    return compound <= -0.6 or float(scores.get("neg", 0.0)) >= 0.5


# --------------------------------------------------------------------------- #
# themes — fast lexical fallback (no ML) used by the VADER-only path
# --------------------------------------------------------------------------- #
def _lexical_themes(content: str, top_n: int = 5) -> list[str]:
    """Cheap keyword themes: most frequent non-stop-word tokens. Pure Python,
    used when embeddings are disabled so the light path still fills key_themes."""
    words = [w.lower() for w in _WORD_RE.findall(content or "")]
    words = [w for w in words if w not in _STOP_WORDS and len(w) > 2]
    if not words:
        return []
    return [w for w, _ in Counter(words).most_common(top_n)]


# --------------------------------------------------------------------------- #
# themes — sentence-transformers embeddings (lazy, heavy, optional)
# --------------------------------------------------------------------------- #
def _embedding_themes(contents: list[str]) -> list[list[float]]:
    """Encode entries to embeddings with sentence-transformers (LAZY import).

    Imported INSIDE the function so torch / sentence-transformers are only loaded
    when AI_ENABLE_DIARY_EMBEDDINGS is on. Returns one vector per input. Runs fully
    local — the model is cached on the box; no text leaves it.
    """
    from sentence_transformers import SentenceTransformer  # noqa: PLC0415 (intentional lazy)

    model_name = get_settings().diary_embedding_model
    model = SentenceTransformer(model_name)
    vectors = model.encode(contents, normalize_embeddings=True, convert_to_numpy=True)
    return [v.tolist() for v in vectors]


# --------------------------------------------------------------------------- #
# read raw signals
# --------------------------------------------------------------------------- #
async def _fetch_entries(user_id: str | None) -> list[dict[str, Any]]:
    """Load diary rows needing NLP. Per-student joins through wellbeing.students
    (its user_id is the canonical identity.users.Id). For a backfill (user_id is
    None) we process every entry with non-empty content."""
    params: dict[str, Any] = {}
    sql = (
        "SELECT d.id AS id, d.content AS content "
        'FROM "wellbeing"."diary_entries" AS d '
    )
    where = ["d.content IS NOT NULL", "length(btrim(d.content)) > 0"]
    if user_id is not None:
        sql += 'JOIN "wellbeing"."students" AS s ON s.id = d.student_id '
        where.append("s.user_id = :user_id")
        params["user_id"] = user_id
    sql += "WHERE " + " AND ".join(where)

    async with session_scope() as session:
        result = await session.execute(text(sql), params)
        return [dict(row) for row in result.mappings().all()]


# --------------------------------------------------------------------------- #
# write-back (same row — UPDATE, not a projection upsert)
# --------------------------------------------------------------------------- #
async def _write_back(rows: list[dict[str, Any]]) -> int:
    """UPDATE wellbeing.diary_entries with the computed AI fields. ``rows`` carry
    id + sentiment_analysis + sentiment_score + key_themes + ai_insights and are
    written in one batched statement. Idempotent: re-running recomputes in place."""
    if not rows:
        return 0
    sql = (
        'UPDATE "wellbeing"."diary_entries" SET '
        '"sentiment_analysis" = :sentiment_analysis, '
        '"sentiment_score" = :sentiment_score, '
        '"key_themes" = :key_themes, '
        '"ai_insights" = :ai_insights, '
        '"updated_at" = now() '
        "WHERE id = :id"
    )
    async with session_scope() as session:
        await session.execute(text(sql), rows)
    return len(rows)


class DiaryNlpService(AnalyticsService):
    name = "diary_nlp"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        entries = await _fetch_entries(user_id)
        if not entries:
            log.info("diary_nlp.no_entries", scope=user_id or "ALL")
            return 0

        settings = get_settings()
        use_embeddings = bool(getattr(settings, "enable_diary_embeddings", False))
        model_version = settings.model_version

        # --- heavy theme path (optional, lazy torch) --------------------------
        # Compute embeddings up front for the whole batch when enabled; on any
        # ImportError (torch/sentence-transformers not installed) we degrade to
        # the lexical VADER-only theme fallback so the service never hard-fails.
        embeddings: list[list[float]] | None = None
        if use_embeddings:
            try:
                embeddings = _embedding_themes([e["content"] for e in entries])
            except ImportError as exc:
                log.warning(
                    "diary_nlp.embeddings_unavailable",
                    error=str(exc),
                    hint="install sentence-transformers + torch, or unset "
                    "AI_ENABLE_DIARY_EMBEDDINGS to use the VADER-only path",
                )
                embeddings = None

        method = "vader+embeddings" if embeddings is not None else "vader"
        payload: list[dict[str, Any]] = []
        for idx, entry in enumerate(entries):
            content = entry["content"]
            compound, label, raw = _score_sentiment(content)
            themes = _lexical_themes(content)

            sentiment_analysis = json.dumps(
                {
                    "label": label,
                    "compound": round(compound, 4),
                    "pos": round(float(raw.get("pos", 0.0)), 4),
                    "neu": round(float(raw.get("neu", 0.0)), 4),
                    "neg": round(float(raw.get("neg", 0.0)), 4),
                    "method": method,
                    "model_version": model_version,
                },
                ensure_ascii=False,
            )

            ai_insights: dict[str, Any] = {
                "summary_label": label,
                "needs_follow_up": _needs_follow_up(compound, raw),
                "method": method,
                "model_version": model_version,
            }
            if embeddings is not None:
                # Theme embedding lives next to the row's insights so the
                # heavy theme-clustering job can consume it without re-encoding.
                ai_insights["theme_embedding"] = embeddings[idx]

            payload.append(
                {
                    "id": entry["id"],
                    "sentiment_analysis": sentiment_analysis,
                    "sentiment_score": compound,
                    "key_themes": json.dumps(themes, ensure_ascii=False),
                    "ai_insights": json.dumps(ai_insights, ensure_ascii=False),
                }
            )

        written = await _write_back(payload)
        log.info(
            "diary_nlp.done",
            scope=user_id or "ALL",
            entries=len(entries),
            method=method,
            rows=written,
        )
        return written
