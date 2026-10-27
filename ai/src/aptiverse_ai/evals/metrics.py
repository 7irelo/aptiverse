"""Evaluation metrics, written out so they are tied to our labels and easy to audit.

Retrieval: recall@k, MRR, nDCG@k with graded relevance. Agreement: Cohen's kappa (judge vs human labels),
quadratic weighted kappa and MAE (marker vs teacher). Classification: precision, recall, F1. Calibration:
Brier score. Agents: tool-call precision and recall plus order constraints. Uncertainty: bootstrap CIs.
"""

from __future__ import annotations

import math
import random
from collections import Counter
from collections.abc import Callable, Hashable, Sequence
from dataclasses import dataclass


def recall_at_k(ranked: Sequence[str], relevant: set[str], k: int) -> float:
    if not relevant:
        return 1.0
    return len(set(ranked[:k]) & relevant) / len(relevant)


def reciprocal_rank(ranked: Sequence[str], relevant: set[str]) -> float:
    for i, doc in enumerate(ranked, start=1):
        if doc in relevant:
            return 1.0 / i
    return 0.0


def ndcg_at_k(ranked: Sequence[str], grades: dict[str, int], k: int) -> float:
    """nDCG with gain 2^grade - 1. `grades` maps relevant ids to 1 (partly) .. 3 (exactly what was asked)."""

    def dcg(gains: Sequence[int]) -> float:
        return sum((2**g - 1) / math.log2(i + 2) for i, g in enumerate(gains))

    actual = dcg([grades.get(doc, 0) for doc in ranked[:k]])
    ideal = dcg(sorted(grades.values(), reverse=True)[:k])
    return actual / ideal if ideal else 1.0


def cohen_kappa[L: Hashable](a: Sequence[L], b: Sequence[L]) -> float:
    if len(a) != len(b) or not a:
        raise ValueError("label lists must be the same non-zero length")
    n = len(a)
    observed = sum(1 for x, y in zip(a, b, strict=True) if x == y) / n
    ca, cb = Counter(a), Counter(b)
    expected = sum(ca[label] * cb[label] for label in set(ca) | set(cb)) / (n * n)
    if expected == 1.0:
        return 1.0
    return (observed - expected) / (1 - expected)


def quadratic_weighted_kappa(a: Sequence[int], b: Sequence[int], min_rating: int, max_rating: int) -> float:
    """Agreement on an ordinal scale (marks), penalising big disagreements more than small ones."""
    if len(a) != len(b) or not a:
        raise ValueError("rating lists must be the same non-zero length")
    size = max_rating - min_rating + 1
    observed = [[0.0] * size for _ in range(size)]
    for x, y in zip(a, b, strict=True):
        observed[x - min_rating][y - min_rating] += 1
    n = len(a)
    hist_a = [sum(row) for row in observed]
    hist_b = [sum(observed[i][j] for i in range(size)) for j in range(size)]
    num = den = 0.0
    for i in range(size):
        for j in range(size):
            weight = ((i - j) ** 2) / ((size - 1) ** 2) if size > 1 else 0.0
            expected = hist_a[i] * hist_b[j] / n
            num += weight * observed[i][j]
            den += weight * expected
    return 1.0 - num / den if den else 1.0


def mean_absolute_error(a: Sequence[float], b: Sequence[float]) -> float:
    return sum(abs(x - y) for x, y in zip(a, b, strict=True)) / len(a)


def agreement_within(a: Sequence[float], b: Sequence[float], tolerance: float) -> float:
    return sum(1 for x, y in zip(a, b, strict=True) if abs(x - y) <= tolerance) / len(a)


@dataclass(frozen=True, slots=True)
class PRF:
    precision: float
    recall: float
    f1: float


def precision_recall_f1(predicted: set[str], expected: set[str]) -> PRF:
    tp = len(predicted & expected)
    precision = tp / len(predicted) if predicted else (1.0 if not expected else 0.0)
    recall = tp / len(expected) if expected else 1.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return PRF(precision, recall, f1)


def macro_f1[L: Hashable](predicted: Sequence[L], expected: Sequence[L]) -> float:
    labels = set(expected) | set(predicted)
    scores = []
    for label in labels:
        p = {i for i, x in enumerate(predicted) if x == label}
        e = {i for i, x in enumerate(expected) if x == label}
        tp = len(p & e)
        prec = tp / len(p) if p else 0.0
        rec = tp / len(e) if e else 0.0
        scores.append(2 * prec * rec / (prec + rec) if prec + rec else 0.0)
    return sum(scores) / len(scores) if scores else 0.0


def brier_score(probabilities: Sequence[float], outcomes: Sequence[int]) -> float:
    return sum((p - o) ** 2 for p, o in zip(probabilities, outcomes, strict=True)) / len(probabilities)


@dataclass(frozen=True, slots=True)
class TrajectoryScore:
    tool_precision: float
    tool_recall: float
    forbidden_calls: int
    order_ok: bool
    steps: int

    @property
    def passed(self) -> bool:
        return self.tool_recall == 1.0 and self.forbidden_calls == 0 and self.order_ok


def score_trajectory(
    calls: Sequence[str],
    *,
    expected: set[str],
    forbidden: set[str] = frozenset(),  # type: ignore[assignment]
    order: Sequence[tuple[str, str]] = (),
) -> TrajectoryScore:
    """`order` pairs (a, b) mean the first call of a must come before the first call of b."""
    prf = precision_recall_f1(set(calls), expected)
    first = {name: calls.index(name) for name in set(calls)}
    order_ok = all(a in first and b in first and first[a] < first[b] for a, b in order)
    return TrajectoryScore(
        tool_precision=prf.precision,
        tool_recall=prf.recall,
        forbidden_calls=sum(1 for c in calls if c in forbidden),
        order_ok=order_ok,
        steps=len(calls),
    )


@dataclass(frozen=True, slots=True)
class Interval:
    point: float
    low: float
    high: float

    def excludes(self, value: float) -> bool:
        return value < self.low or value > self.high

    def __str__(self) -> str:
        return f"{self.point:.3f} [{self.low:.3f}, {self.high:.3f}]"


def bootstrap_ci[T](
    items: Sequence[T],
    statistic: Callable[[Sequence[T]], float],
    *,
    resamples: int = 2000,
    confidence: float = 0.95,
    seed: int = 7,
) -> Interval:
    """Percentile bootstrap. A change is called a regression only when its interval excludes the baseline."""
    if not items:
        raise ValueError("no items")
    rng = random.Random(seed)  # noqa: S311 - resampling, not security
    n = len(items)
    stats = sorted(statistic([items[rng.randrange(n)] for _ in range(n)]) for _ in range(resamples))
    alpha = (1 - confidence) / 2
    low = stats[int(alpha * resamples)]
    high = stats[min(resamples - 1, int((1 - alpha) * resamples))]
    return Interval(statistic(items), low, high)
