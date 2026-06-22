"""Improvement-Tips Generator → insights.improvement_tips.

Inputs : knowledge gaps (mastery.knowledge_gaps) + study patterns
         (mastery.student_subject_analytics).
Method : RULES + retrieval over a curated, curriculum-aligned tip/resource bank.
         For each detected gap we retrieve the best-matching curriculum tip by
         semantic similarity against the bank; study-pattern rules add targeted
         habit tips. No LLM — deterministic, reviewable, curriculum-aligned.

         Similarity uses sentence-transformers embeddings ONLY via a lazy import
         (so torch is never required to import this package). When embeddings are
         unavailable we fall back to a pure-Python lexical (token-overlap)
         scorer, so the service runs on a minimal install with identical shape.
Weight : light. Cadence: nightly (after gaps + subject_analytics).

Output natural key (insights.improvement_tips):
    (student_subject_id bigint, student_subject_topic_id bigint).
A knowledge_gap's ``topic_id`` FKs the SAME student_subject_topics.id that
improvement_tips.student_subject_topic_id points at, so a gap on
(student_subject_id, topic_id) maps straight onto a tip's natural key.
"""

from __future__ import annotations

import math
import re
from typing import Any

from app.core.logging import get_logger
from app.data import signals
from app.data.sinks import upsert_improvement_tips
from app.services.base import AnalyticsService

log = get_logger(__name__)

# Hard cap so a single student never floods the table; the highest-priority
# tips survive (priority is the .NET column, higher == more urgent here).
MAX_TIPS_PER_STUDENT = 12

# Severity → numeric weight. knowledge_gaps.severity is free text; we tolerate
# the common spellings and default unknown values to "medium".
_SEVERITY_WEIGHT = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "moderate": 2,
    "low": 1,
}


# --------------------------------------------------------------------------- #
# Curated, curriculum-aligned tip bank.
#
# Each entry is a reviewable, study-skill / curriculum tip. ``keywords`` drive
# the lexical fallback; ``text`` is what gets embedded for the semantic path and
# is also the tip stored. Keep these concrete and actionable — they are shown to
# students verbatim. This is intentionally small and hand-curated (no LLM).
# --------------------------------------------------------------------------- #
TIP_BANK: list[dict[str, Any]] = [
    {
        "id": "algebra_basics",
        "keywords": ["algebra", "equation", "variable", "expression", "solve", "factor"],
        "text": (
            "Rebuild algebra fundamentals: practise isolating the variable on simple "
            "linear equations before moving to multi-step problems, and check each "
            "step by substituting your answer back in."
        ),
    },
    {
        "id": "fractions_ratios",
        "keywords": ["fraction", "ratio", "proportion", "percentage", "decimal", "rate"],
        "text": (
            "Strengthen fractions and ratios: convert between fractions, decimals and "
            "percentages daily, and use a common denominator before adding or "
            "comparing fractions."
        ),
    },
    {
        "id": "geometry_proofs",
        "keywords": ["geometry", "angle", "triangle", "theorem", "proof", "circle", "shape"],
        "text": (
            "For geometry, draw and label every diagram first, list the given facts, "
            "then work backwards from what you must prove — citing one theorem per step."
        ),
    },
    {
        "id": "functions_graphs",
        "keywords": ["function", "graph", "gradient", "slope", "intercept", "parabola", "linear"],
        "text": (
            "Practise sketching functions by hand: plot the intercepts and turning "
            "point first, then describe how changing each parameter shifts the graph."
        ),
    },
    {
        "id": "calculus_rates",
        "keywords": [
            "calculus", "derivative", "differentiate", "integral", "rate of change", "limit",
        ],
        "text": (
            "Master differentiation rules one at a time (power, product, chain) and "
            "always state what the derivative represents — a rate of change — before "
            "computing it."
        ),
    },
    {
        "id": "reading_comprehension",
        "keywords": ["reading", "comprehension", "passage", "inference", "context", "vocabulary"],
        "text": (
            "Improve comprehension by annotating each paragraph with a one-line summary, "
            "then answer questions from your notes rather than re-scanning the passage."
        ),
    },
    {
        "id": "essay_structure",
        "keywords": [
            "essay", "writing", "argument", "paragraph", "thesis", "structure", "composition",
        ],
        "text": (
            "Plan essays with a clear thesis and one idea per paragraph (point, "
            "evidence, explanation). Write the introduction last, once your argument "
            "is settled."
        ),
    },
    {
        "id": "scientific_method",
        "keywords": ["experiment", "hypothesis", "variable", "method", "observation", "science"],
        "text": (
            "For science practicals, write the aim, hypothesis, and controlled "
            "variables before the experiment, and link every conclusion back to the "
            "data you recorded."
        ),
    },
    {
        "id": "chemistry_equations",
        "keywords": [
            "chemistry", "reaction", "balance", "mole", "compound", "stoichiometry", "acid",
        ],
        "text": (
            "In chemistry, balance every equation before any calculation and carry "
            "units through mole conversions so unit errors surface early."
        ),
    },
    {
        "id": "physics_forces",
        "keywords": ["physics", "force", "motion", "energy", "newton", "momentum", "velocity"],
        "text": (
            "For physics problems, draw a free-body diagram, list known and unknown "
            "quantities with units, and pick the equation that connects them before "
            "substituting numbers."
        ),
    },
    {
        "id": "memorisation_recall",
        "keywords": [
            "memorise", "recall", "definition", "terminology", "formula", "fact", "vocabulary",
        ],
        "text": (
            "Use spaced active recall: write the question on one side of a flashcard "
            "and test yourself daily, re-reviewing missed cards sooner than mastered "
            "ones."
        ),
    },
    {
        "id": "problem_solving_steps",
        "keywords": [
            "problem", "word problem", "application", "multi-step", "reasoning", "strategy",
        ],
        "text": (
            "Break multi-step problems into a written plan: identify what is asked, "
            "what is given, and the sequence of steps — then solve one step at a time."
        ),
    },
    # ----- study-habit / wellbeing tips, selected by RULES on study patterns --- #
    {
        "id": "habit_consistency",
        "keywords": ["consistency", "routine", "schedule", "regular", "habit", "spacing"],
        "text": (
            "Study this topic in short, regular sessions (25–30 minutes) on a fixed "
            "schedule rather than cramming — consistent spacing beats long one-off "
            "sessions for retention."
        ),
    },
    {
        "id": "habit_session_length",
        "keywords": ["session", "focus", "break", "pomodoro", "fatigue", "attention"],
        "text": (
            "Keep study sessions focused and bounded: work in 25-minute blocks with "
            "5-minute breaks so attention and accuracy stay high on this topic."
        ),
    },
    {
        "id": "habit_attendance",
        "keywords": ["attendance", "class", "lesson", "miss", "catch up", "notes"],
        "text": (
            "Attend every class for this subject and review the lesson notes within 24 "
            "hours; missed lessons are the most common cause of widening gaps."
        ),
    },
    {
        "id": "habit_practice_volume",
        "keywords": ["practice", "exercises", "drill", "repetition", "questions", "quantity"],
        "text": (
            "Increase deliberate practice on this topic: complete a few extra past-paper "
            "questions each day and review every mistake, not just the score."
        ),
    },
    {
        "id": "wellbeing_stress",
        "keywords": ["stress", "anxiety", "overwhelm", "pressure", "calm", "wellbeing"],
        "text": (
            "High study stress is hurting this topic — split it into smaller goals, and "
            "use a brief breathing or grounding routine before tackling hard questions."
        ),
    },
    {
        "id": "wellbeing_sleep",
        "keywords": ["sleep", "rest", "tired", "energy", "fatigue", "recovery"],
        "text": (
            "Protect sleep before assessments: memory consolidates overnight, so a "
            "consistent 7–9 hours does more for this topic than late-night cramming."
        ),
    },
    {
        "id": "motivation_goals",
        "keywords": ["motivation", "goal", "engagement", "interest", "reward", "milestone"],
        "text": (
            "Reconnect this topic to a concrete goal and set a small reward per "
            "milestone; low motivation, not low ability, is often what stalls progress."
        ),
    },
]

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokens(text: str) -> set[str]:
    return set(_TOKEN_RE.findall(text.lower()))


# --------------------------------------------------------------------------- #
# Retrieval: embeddings (lazy) with a deterministic lexical fallback.
# --------------------------------------------------------------------------- #
def _build_retriever(bank: list[dict[str, Any]]) -> Any:
    """Return a callable query(text) -> (index, score) over ``bank``.

    Tries to build a sentence-transformers embedding index; the heavy import
    (sentence-transformers → torch) happens HERE, never at module top-level, so
    the package imports on a minimal install. On any failure (lib missing, no
    model, offline) we fall back to a pure-Python token-overlap (Jaccard)
    scorer that needs no third-party deps and is fully deterministic.
    """
    bank_texts = [f"{e['text']} {' '.join(e['keywords'])}" for e in bank]

    try:  # --- semantic path: lazy heavy import -----------------------------
        from sentence_transformers import SentenceTransformer  # noqa: PLC0415

        model = SentenceTransformer("all-MiniLM-L6-v2")
        bank_emb = model.encode(bank_texts, normalize_embeddings=True)

        def query(text: str) -> tuple[int, float]:
            q = model.encode([text], normalize_embeddings=True)[0]
            # cosine == dot product on normalized vectors
            best_i, best_s = 0, -1.0
            for i, vec in enumerate(bank_emb):
                s = float(sum(a * b for a, b in zip(q, vec, strict=False)))
                if s > best_s:
                    best_i, best_s = i, s
            return best_i, best_s

        log.info("tips.retriever", mode="embeddings", model="all-MiniLM-L6-v2")
        return query
    except Exception as exc:  # ImportError, model download failure, etc.
        log.info("tips.retriever", mode="lexical_fallback", reason=str(exc))

    # --- fallback path: token-overlap, no heavy deps ------------------------
    bank_tokens = [_tokens(t) for t in bank_texts]

    def query(text: str) -> tuple[int, float]:
        qt = _tokens(text)
        if not qt:
            return 0, 0.0
        best_i, best_s = 0, -1.0
        for i, bt in enumerate(bank_tokens):
            inter = len(qt & bt)
            if inter == 0:
                s = 0.0
            else:
                # Jaccard-like overlap, biased toward recall of query tokens.
                s = inter / math.sqrt(len(qt) * len(bt))
            if s > best_s:
                best_i, best_s = i, s
        return best_i, best_s

    return query


# --------------------------------------------------------------------------- #
# Study-pattern RULES → tip-bank ids. Each rule inspects one analytics row and,
# if it fires, recommends a specific bank tip. Thresholds are deliberately
# conservative and reviewable.
# --------------------------------------------------------------------------- #
def _pattern_tip_ids(row: dict[str, Any]) -> list[str]:
    ids: list[str] = []

    def num(key: str) -> float | None:
        v = row.get(key)
        try:
            return float(v) if v is not None else None
        except (TypeError, ValueError):
            return None

    attendance = num("attendance_rate")      # 0..1 or 0..100 tolerated below
    if attendance is not None:
        rate = attendance / 100.0 if attendance > 1.0 else attendance
        if rate < 0.85:
            ids.append("habit_attendance")

    consistency = num("consistency")          # int score (higher == better)
    if consistency is not None and consistency < 50:
        ids.append("habit_consistency")

    session = num("session_length")           # minutes
    if session is not None and session > 60:
        ids.append("habit_session_length")

    practice = num("practice_problems")
    if practice is not None and practice < 5:
        ids.append("habit_practice_volume")

    stress = num("stress_level")              # 0..1 or 0..10 tolerated
    if stress is not None:
        s = stress / 10.0 if stress > 1.0 else stress
        if s > 0.6:
            ids.append("wellbeing_stress")

    sleep = num("sleep_quality")              # 0..1 or 0..10; higher == better
    if sleep is not None:
        sq = sleep / 10.0 if sleep > 1.0 else sleep
        if sq < 0.5:
            ids.append("wellbeing_sleep")

    motivation = num("motivation_level")      # 0..1 or 0..10; higher == better
    if motivation is not None:
        m = motivation / 10.0 if motivation > 1.0 else motivation
        if m < 0.4:
            ids.append("motivation_goals")

    return ids


def _as_rows(frame: Any) -> list[dict[str, Any]]:
    """signals.* returns a polars DataFrame OR a list[dict] fallback. Normalize
    to list[dict] without importing polars at module top-level."""
    if frame is None:
        return []
    if isinstance(frame, list):
        return [dict(r) for r in frame]
    to_dicts = getattr(frame, "to_dicts", None)  # polars.DataFrame
    if callable(to_dicts):
        return to_dicts()
    return list(frame)


class ImprovementTipsService(AnalyticsService):
    name = "tips"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        gaps = _as_rows(await signals.knowledge_gaps(user_id))
        patterns = _as_rows(await signals.student_subject_analytics(user_id))

        if not gaps and not patterns:
            log.info("tips.no_inputs", scope=user_id or "ALL")
            return 0

        retriever = _build_retriever(TIP_BANK)
        bank_by_id = {e["id"]: e for e in TIP_BANK}

        # Index study patterns by (student_subject_id, topic_id) so we can attach
        # habit tips to the matching topic.
        patterns_by_key: dict[tuple[int, int], dict[str, Any]] = {}
        for p in patterns:
            ssid = p.get("student_subject_id")
            tid = p.get("topic_id")
            if ssid is None or tid is None:
                continue
            patterns_by_key[(int(ssid), int(tid))] = p

        # candidate[(ssid, topic_id)] -> dict(tip text -> priority). We dedupe on
        # tip text per natural key and keep the highest priority seen.
        candidates: dict[tuple[int, int], dict[str, int]] = {}

        def add(ssid: int, topic_id: int, tip_text: str, priority: int) -> None:
            key = (ssid, topic_id)
            bucket = candidates.setdefault(key, {})
            if tip_text not in bucket or priority > bucket[tip_text]:
                bucket[tip_text] = priority

        # ---- 1) retrieval tips from knowledge gaps --------------------------
        for g in gaps:
            ssid = g.get("student_subject_id")
            topic_id = g.get("topic_id")
            if ssid is None or topic_id is None:
                continue
            ssid, topic_id = int(ssid), int(topic_id)

            concept = (g.get("concept") or "").strip()
            severity = str(g.get("severity") or "medium").lower()
            sev_w = _SEVERITY_WEIGHT.get(severity, 2)

            best_i, score = retriever(concept or "general study skills")
            tip_text = TIP_BANK[best_i]["text"]
            # Priority: severity dominates, similarity breaks ties (0..9 band).
            priority = sev_w * 100 + int(round(max(0.0, min(score, 1.0)) * 9))
            add(ssid, topic_id, tip_text, priority)

            # Attach habit/wellbeing rule tips for this exact topic's patterns.
            prow = patterns_by_key.get((ssid, topic_id))
            if prow is not None:
                for pid in _pattern_tip_ids(prow):
                    # Habit tips rank just below the severity band of the gap so
                    # the curriculum tip leads, habits follow.
                    add(ssid, topic_id, bank_by_id[pid]["text"], sev_w * 100 - 10)

        # ---- 2) study-pattern tips even where no gap was detected -----------
        gap_keys = {
            (int(g["student_subject_id"]), int(g["topic_id"]))
            for g in gaps
            if g.get("student_subject_id") is not None and g.get("topic_id") is not None
        }
        for (ssid, topic_id), prow in patterns_by_key.items():
            if (ssid, topic_id) in gap_keys:
                continue  # already handled with gap context above
            for pid in _pattern_tip_ids(prow):
                # No gap → medium-band priority so genuine gaps still outrank.
                add(ssid, topic_id, bank_by_id[pid]["text"], 150)

        if not candidates:
            log.info("tips.no_candidates", scope=user_id or "ALL")
            return 0

        # ---- 3) flatten, cap per student_subject, build rows ----------------
        # We cap per student_subject_id (the unit a student sees per subject).
        per_subject: dict[int, list[dict[str, Any]]] = {}
        for (ssid, topic_id), bucket in candidates.items():
            for tip_text, priority in bucket.items():
                per_subject.setdefault(ssid, []).append(
                    {
                        "student_subject_id": ssid,
                        "student_subject_topic_id": topic_id,
                        "tip": tip_text,
                        "priority": priority,
                    }
                )

        out_rows: list[dict[str, Any]] = []
        for _ssid, rows in per_subject.items():
            rows.sort(key=lambda r: r["priority"], reverse=True)
            out_rows.extend(rows[:MAX_TIPS_PER_STUDENT])

        written = await upsert_improvement_tips(out_rows)
        log.info(
            "tips.written",
            scope=user_id or "ALL",
            gaps=len(gaps),
            patterns=len(patterns),
            rows=written,
        )
        return written
