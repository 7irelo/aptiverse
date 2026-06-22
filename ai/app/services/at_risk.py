"""At-Risk Predictor → insights.risk_scores (new table).

Inputs : full feature vector — marks, engagement, mood, mastery.
Method : LightGBM classifier; SHAP values for human-readable reasons.
         Train weekly, infer nightly.
Weight : heavy. Cadence: nightly infer / weekly train.

Design notes
------------
* HEAVY ML IMPORTS ARE LAZY. ``lightgbm`` / ``shap`` are imported INSIDE the
  estimator helpers, never at module top-level, so this module imports on a
  minimal install. The sklearn fallback (LogisticRegression) is also imported
  lazily; if neither is present we degrade to a transparent hand-weighted
  scorer so a nightly run never hard-fails on a missing optional dep.
* TRAIN-WEEKLY / INFER-NIGHTLY are collapsed into ONE path here: there is no
  labelled at-risk outcome table to train against yet, so each run fits a small
  model on a HEURISTIC label derived from the same feature vector (a weak/proxy
  label: low marks + low engagement + poor mood + low mastery) and then infers.
  This keeps the wiring honest — swap the proxy label for a real outcome join
  when one lands, and the train/infer split can move to two entrypoints.
* The output is persisted through the GUARDED ``upsert_risk_scores`` sink, which
  is a no-op (logs + returns 0) until the ``insights.risk_scores`` .NET
  migration lands and ``AI_ENABLE_RISK_SCORES`` is flipped on. When the sink is
  unavailable we still log the computed scores so the run is observable.
"""

from __future__ import annotations

import json
import math
from collections.abc import Mapping, Sequence
from typing import Any

from app.core.logging import get_logger
from app.data import signals
from app.data.sinks import upsert_risk_scores
from app.services.base import AnalyticsService

log = get_logger(__name__)

# Ordered feature names — the model and the SHAP-style reasons share this order.
FEATURES: tuple[str, ...] = (
    "avg_mark",          # mean predicted mark across logged assessments (0..100)
    "overdue_ratio",     # share of assessments past due but not graded (0..1)
    "practice_score",    # mean practice score_percent (0..100)
    "engagement_events", # count of audit-log actions (activity proxy)
    "mood_score",        # mean mood_score (0..~10)
    "sleep_hours",       # mean self-reported sleep hours
    "mastery_level",     # mean topic mastery (0..1)
)

# Human-readable phrasing for a feature pushing a student TOWARD risk.
_REASON_TEXT: dict[str, str] = {
    "avg_mark": "Low average marks",
    "overdue_ratio": "Overdue / ungraded assessments piling up",
    "practice_score": "Weak practice-test performance",
    "engagement_events": "Low platform engagement",
    "mood_score": "Low self-reported mood",
    "sleep_hours": "Poor sleep",
    "mastery_level": "Low topic mastery",
}

_LEVELS = ("low", "medium", "high")


# --------------------------------------------------------------------------- #
# frame helpers — signals.* return a polars DataFrame OR a list[dict] fallback
# --------------------------------------------------------------------------- #
def _rows(frame: Any) -> list[dict[str, Any]]:
    """Normalize a signals frame (polars DataFrame or list[dict]) to list[dict]."""
    if frame is None:
        return []
    if isinstance(frame, list):
        return [dict(r) for r in frame]
    # polars DataFrame
    to_dicts = getattr(frame, "to_dicts", None)
    if callable(to_dicts):
        return to_dicts()
    if isinstance(frame, Sequence):
        return [dict(r) for r in frame]
    return []


def _num(value: Any) -> float | None:
    """Coerce a DB value to float, treating None / non-numeric as missing."""
    if value is None:
        return None
    try:
        f = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return f


def _mean(values: list[float]) -> float | None:
    return sum(values) / len(values) if values else None


# --------------------------------------------------------------------------- #
# feature engineering
# --------------------------------------------------------------------------- #
async def _build_feature_vectors(
    user_id: str | None,
) -> dict[str, dict[str, float | None]]:
    """Assemble a per-student feature dict keyed by canonical student id.

    Reads marks (assessments), practice scores, engagement (audit logs), mood
    (mood_trackings), and mastery (topic_masteries) via the signals helpers.
    Missing signals stay ``None`` so the estimator can impute them rather than
    silently treating "no data" as "great".
    """
    assessments = _rows(await signals.assessments(user_id))
    summaries = _rows(await signals.attempt_score_summaries(user_id))
    audit = _rows(await signals.audit_logs(user_id))
    moods = _rows(await signals.mood_trackings(user_id))
    masteries = _rows(await signals.topic_masteries(user_id))

    # marks + overdue, keyed on the canonical (text) student id.
    marks: dict[str, list[float]] = {}
    overdue_total: dict[str, int] = {}
    overdue_hit: dict[str, int] = {}
    for r in assessments:
        sid = str(r.get("student_id"))
        pm = _num(r.get("predicted_mark"))
        if pm is not None:
            marks.setdefault(sid, []).append(pm)
        overdue_total[sid] = overdue_total.get(sid, 0) + 1
        if str(r.get("status")) != "graded":
            overdue_hit[sid] = overdue_hit.get(sid, 0) + 1

    practice: dict[str, list[float]] = {}
    for r in summaries:
        sid = str(r.get("student_id"))
        sp = _num(r.get("score_percent"))
        if sp is not None:
            practice.setdefault(sid, []).append(sp)

    engagement: dict[str, int] = {}
    for r in audit:
        sid = str(r.get("user_id"))
        engagement[sid] = engagement.get(sid, 0) + 1

    mastery: dict[str, list[float]] = {}
    for r in masteries:
        sid = str(r.get("student_id"))
        ml = _num(r.get("mastery_level"))
        if ml is not None:
            mastery.setdefault(sid, []).append(ml)

    # mood/diary key on the LEGACY bigint student_id; the signals layer cannot
    # join them to the canonical id yet (Phase-2). We aggregate them by the
    # bigint id and attach when that id equals the canonical id verbatim (the
    # case the signals layer already filters on for a numeric user_id).
    mood_score: dict[str, list[float]] = {}
    sleep: dict[str, list[float]] = {}
    for r in moods:
        sid = str(r.get("student_id"))
        ms = _num(r.get("mood_score"))
        if ms is not None:
            mood_score.setdefault(sid, []).append(ms)
        sh = _num(r.get("sleep_hours"))
        if sh is not None:
            sleep.setdefault(sid, []).append(sh)

    # Universe of students: everyone who appears in any canonical-id signal,
    # plus the explicit target when scoped to one student.
    ids: set[str] = set()
    ids.update(marks, overdue_total, practice, engagement, mastery)
    if user_id is not None:
        ids.add(str(user_id))

    vectors: dict[str, dict[str, float | None]] = {}
    for sid in ids:
        total = overdue_total.get(sid, 0)
        hit = overdue_hit.get(sid, 0)
        vectors[sid] = {
            "avg_mark": _mean(marks.get(sid, [])),
            "overdue_ratio": (hit / total) if total else None,
            "practice_score": _mean(practice.get(sid, [])),
            "engagement_events": float(engagement.get(sid, 0)),
            "mood_score": _mean(mood_score.get(sid, [])),
            "sleep_hours": _mean(sleep.get(sid, [])),
            "mastery_level": _mean(mastery.get(sid, [])),
        }
    return vectors


# Sensible imputation defaults (neutral-ish midpoints) so a missing signal does
# not by itself flip a student to high risk.
_IMPUTE: dict[str, float] = {
    "avg_mark": 60.0,
    "overdue_ratio": 0.0,
    "practice_score": 60.0,
    "engagement_events": 0.0,
    "mood_score": 5.0,
    "sleep_hours": 7.0,
    "mastery_level": 0.5,
}

# Direction each feature pushes risk: -1 => higher value lowers risk (marks,
# mood, mastery, sleep, practice, engagement); +1 => higher value raises risk
# (overdue_ratio). Used for the proxy label and the transparent fallback.
_DIRECTION: dict[str, float] = {
    "avg_mark": -1.0,
    "overdue_ratio": 1.0,
    "practice_score": -1.0,
    "engagement_events": -1.0,
    "mood_score": -1.0,
    "sleep_hours": -1.0,
    "mastery_level": -1.0,
}

# Per-feature normalizers → roughly 0..1 "badness" contribution.
def _badness(name: str, value: float) -> float:
    if name == "avg_mark" or name == "practice_score":
        return max(0.0, min(1.0, (60.0 - value) / 60.0))
    if name == "overdue_ratio":
        return max(0.0, min(1.0, value))
    if name == "engagement_events":
        # 0 events = max badness, decaying; ~10+ events ≈ fine.
        return max(0.0, min(1.0, 1.0 - value / 10.0))
    if name == "mood_score":
        return max(0.0, min(1.0, (5.0 - value) / 5.0))
    if name == "sleep_hours":
        return max(0.0, min(1.0, (7.0 - value) / 7.0))
    if name == "mastery_level":
        return max(0.0, min(1.0, 1.0 - value))
    return 0.0


def _impute_matrix(
    vectors: Mapping[str, Mapping[str, float | None]],
) -> tuple[list[str], list[list[float]]]:
    """Return (student_ids, X) with missing features imputed."""
    sids = list(vectors)
    X: list[list[float]] = []
    for sid in sids:
        row = vectors[sid]
        X.append([
            float(row[f]) if row[f] is not None else _IMPUTE[f]
            for f in FEATURES
        ])
    return sids, X


def _proxy_labels(X: list[list[float]]) -> list[int]:
    """Weak/proxy at-risk label: 1 when the mean per-feature badness > 0.5.

    There is no labelled outcome table yet, so the (single) train path fits on
    this heuristic. Replace with a real outcome join when available.
    """
    labels: list[int] = []
    for row in X:
        bad = _mean([_badness(f, row[i]) for i, f in enumerate(FEATURES)]) or 0.0
        labels.append(1 if bad > 0.5 else 0)
    return labels


def _level(score: float) -> str:
    if score >= 0.66:
        return "high"
    if score >= 0.33:
        return "medium"
    return "low"


# --------------------------------------------------------------------------- #
# estimators (HEAVY IMPORTS LAZY — inside the function that uses them)
# --------------------------------------------------------------------------- #
def _fit_infer(
    X: list[list[float]], y: list[int]
) -> tuple[list[float], list[list[tuple[str, float]]], str]:
    """Train on (X, y) and infer P(at-risk) + per-row SHAP-style contributions.

    Tries LightGBM (+ SHAP) first, then sklearn LogisticRegression, then a
    transparent hand-weighted fallback. Returns (scores, reasons, backend).
    ``reasons`` is a per-row list of (feature, signed_contribution), positive =
    pushed toward risk, already sorted by magnitude descending.
    """
    # Need both classes present for a supervised fit; otherwise go transparent.
    if y and len(set(y)) >= 2:
        try:
            return _fit_infer_lightgbm(X, y)
        except Exception as exc:  # ImportError or any training error
            log.info("at_risk.lightgbm_unavailable", error=str(exc))
        try:
            return _fit_infer_sklearn(X, y)
        except Exception as exc:
            log.info("at_risk.sklearn_unavailable", error=str(exc))
    return _infer_transparent(X)


def _fit_infer_lightgbm(
    X: list[list[float]], y: list[int]
) -> tuple[list[float], list[list[tuple[str, float]]], str]:
    import lightgbm as lgb  # LAZY heavy import
    import numpy as np

    arr = np.asarray(X, dtype=float)
    clf = lgb.LGBMClassifier(
        n_estimators=100,
        num_leaves=15,
        min_child_samples=5,
        learning_rate=0.1,
        verbose=-1,
    )
    clf.fit(arr, np.asarray(y, dtype=int))
    proba = clf.predict_proba(arr)[:, 1]

    reasons: list[list[tuple[str, float]]]
    try:
        import shap  # LAZY heavy import

        explainer = shap.TreeExplainer(clf)
        sv = explainer.shap_values(arr)
        # Binary classifier may return a list [neg, pos]; take the positive class.
        if isinstance(sv, list):
            sv = sv[-1]
        reasons = [_rank_contribs(row) for row in np.asarray(sv)]
    except Exception as exc:
        log.info("at_risk.shap_unavailable", error=str(exc))
        # Fall back to gain-weighted feature importances as a global proxy.
        imp = np.asarray(clf.feature_importances_, dtype=float)
        reasons = [_rank_contribs(imp) for _ in X]

    return [float(p) for p in proba], reasons, "lightgbm"


def _fit_infer_sklearn(
    X: list[list[float]], y: list[int]
) -> tuple[list[float], list[list[tuple[str, float]]], str]:
    import numpy as np  # LAZY (light, but keep it out of module import)
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler

    arr = np.asarray(X, dtype=float)
    scaler = StandardScaler()
    arr_s = scaler.fit_transform(arr)
    clf = LogisticRegression(max_iter=1000)
    clf.fit(arr_s, np.asarray(y, dtype=int))
    proba = clf.predict_proba(arr_s)[:, 1]

    # Linear SHAP-style attribution: coef_j * (x_j - mean_j) on standardized X.
    coef = clf.coef_[0]
    contribs = arr_s * coef  # broadcast per row
    reasons = [_rank_contribs(np.asarray(row)) for row in contribs]
    return [float(p) for p in proba], reasons, "sklearn"


def _infer_transparent(
    X: list[list[float]],
) -> tuple[list[float], list[list[tuple[str, float]]], str]:
    """No ML deps / single-class data: deterministic hand-weighted scorer.

    Score = mean per-feature badness. Reasons = each feature's badness signed by
    its risk direction, so the output shape matches the ML paths exactly.
    """
    scores: list[float] = []
    reasons: list[list[tuple[str, float]]] = []
    for row in X:
        contribs = [_badness(f, row[i]) for i, f in enumerate(FEATURES)]
        scores.append(_mean(contribs) or 0.0)
        reasons.append(_rank_contribs(contribs))
    return scores, reasons, "heuristic"


def _rank_contribs(values: Any) -> list[tuple[str, float]]:
    """Pair contributions with FEATURES and sort by absolute magnitude desc."""
    paired = [(FEATURES[i], float(values[i])) for i in range(len(FEATURES))]
    paired.sort(key=lambda kv: abs(kv[1]), reverse=True)
    return paired


def _top_reasons(contribs: list[tuple[str, float]], k: int = 3) -> list[dict[str, Any]]:
    """Top-k features pushing a student TOWARD risk, as JSON-ready dicts."""
    out: list[dict[str, Any]] = []
    for feature, contrib in contribs:
        if contrib <= 0:
            continue
        out.append({
            "feature": feature,
            "label": _REASON_TEXT.get(feature, feature),
            "contribution": round(contrib, 4),
        })
        if len(out) >= k:
            break
    return out


class AtRiskPredictorService(AnalyticsService):
    name = "at_risk"
    weight = "heavy"

    async def compute(self, user_id: str | None) -> int:
        vectors = await _build_feature_vectors(user_id)
        if not vectors:
            log.info("at_risk.no_students", scope=user_id or "ALL")
            return 0

        sids, X = _impute_matrix(vectors)
        y = _proxy_labels(X)
        scores, reasons, backend = _fit_infer(X, y)

        rows: list[dict[str, Any]] = []
        for sid, score, row_reasons in zip(sids, scores, reasons, strict=True):
            top = _top_reasons(row_reasons)
            rows.append({
                "student_id": sid,
                "risk_level": _level(score),
                "risk_score": round(float(score), 4),
                "reasons": json.dumps(top),
            })

        log.info(
            "at_risk.scored",
            scope=user_id or "ALL",
            backend=backend,
            students=len(rows),
            high=sum(1 for r in rows if r["risk_level"] == "high"),
        )

        # GUARDED sink: no-op (logs + returns 0) until the insights.risk_scores
        # .NET migration lands and AI_ENABLE_RISK_SCORES is on. Either way we
        # have already logged the scores above, so the run stays observable.
        written = await upsert_risk_scores(rows)
        if written == 0:
            log.warning(
                "at_risk.not_persisted",
                reason="insights.risk_scores sink unavailable (flag off / table not migrated)",
                computed=len(rows),
            )
        return written
