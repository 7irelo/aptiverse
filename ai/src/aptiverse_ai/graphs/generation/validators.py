"""Deterministic question checks. They run before any model judge because they are free, exact and never
drift; a judge is used only for what code cannot decide (level appropriateness)."""

from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass

from aptiverse_ai.graphs.generation.schemas import Question
from aptiverse_ai.tools import mathcheck

_DOLLAR = re.compile(r"(?<!\\)\$")
_COMMAND = re.compile(r"\\([A-Za-z]+)")
# The KaTeX commands we expect in school maths; an unknown command usually means a typo that will not render.
_KNOWN_COMMANDS = frozenset(
    [
        "frac",
        "sqrt",
        "times",
        "div",
        "cdot",
        "pm",
        "mp",
        "leq",
        "geq",
        "neq",
        "le",
        "ge",
        "approx",
        "infty",
        "pi",
        "theta",
        "alpha",
        "beta",
        "gamma",
        "delta",
        "Delta",
        "lambda",
        "mu",
        "sigma",
        "omega",
        "Omega",
        "circ",
        "angle",
        "triangle",
        "parallel",
        "perp",
        "sin",
        "cos",
        "tan",
        "log",
        "ln",
        "exp",
        "lim",
        "sum",
        "int",
        "vec",
        "overline",
        "underline",
        "left",
        "right",
        "text",
        "mathrm",
        "mathbf",
        "quad",
        "qquad",
        "degree",
        "in",
        "notin",
        "subset",
        "cup",
        "cap",
        "emptyset",
        "rightarrow",
        "leftarrow",
        "Rightarrow",
        "therefore",
        "because",
        "hat",
        "bar",
        "dot",
        "ddot",
        "prime",
        "ldots",
        "cdots",
        "dots",
        "binom",
    ]
)


@dataclass(frozen=True, slots=True)
class Issue:
    question_id: str
    code: str
    detail: str

    def __str__(self) -> str:
        return f"{self.code}: {self.detail}"


def latex_issues(q: Question) -> list[Issue]:
    issues: list[Issue] = []
    for field_name in ("stem", "answer", "memo", "explanation"):
        text: str = getattr(q, field_name)
        if len(_DOLLAR.findall(text)) % 2:
            issues.append(Issue(q.id, "latex.unbalanced_dollars", f"{field_name} has an odd number of $"))
        if text.count("{") != text.count("}"):
            issues.append(Issue(q.id, "latex.unbalanced_braces", f"{field_name} has unbalanced braces"))
        unknown = {c for c in _COMMAND.findall(text) if c not in _KNOWN_COMMANDS}
        if unknown:
            issues.append(Issue(q.id, "latex.unknown_command", f"{field_name}: {sorted(unknown)[:3]}"))
    return issues


def mcq_issues(q: Question) -> list[Issue]:
    if q.type != "mcq":
        return []
    issues: list[Issue] = []
    correct = [o for o in q.options if o.correct]
    if len(correct) != 1:
        issues.append(Issue(q.id, "mcq.correct_count", f"{len(correct)} options marked correct, need exactly 1"))
    texts = [re.sub(r"\s+", " ", o.text.strip().lower()) for o in q.options]
    if len(set(texts)) != len(texts):
        issues.append(Issue(q.id, "mcq.duplicate_options", "two options have the same text"))
    labels = [o.label for o in q.options]
    if labels != [chr(ord("A") + i) for i in range(len(labels))]:
        issues.append(Issue(q.id, "mcq.labels", "options must be labelled A, B, C... in order"))
    return issues


def numeric_issues(q: Question) -> tuple[list[Issue], bool]:
    """Returns issues and whether the answer was machine-checked. Unparseable answers are 'unchecked'
    (sampled for human review), never passed silently."""
    if q.type != "numeric":
        return [], False
    value = mathcheck.to_number(q.answer)
    if value is None:
        return [], False
    if math.isnan(value) or math.isinf(value):
        return [Issue(q.id, "numeric.not_finite", "answer is not a finite number")], True
    memo_numbers = [
        n for n in (mathcheck.to_number(t) for t in re.findall(r"-?\d+(?:\.\d+)?", q.memo)) if n is not None
    ]
    if memo_numbers and not any(mathcheck.numeric_equal(value, n) for n in memo_numbers):
        return [Issue(q.id, "numeric.memo_mismatch", "the final answer does not appear in the memo working")], True
    return [], True


def marks_issues(q: Question) -> list[Issue]:
    points = [line for line in q.memo.splitlines() if line.strip()]
    if q.type in ("short", "long", "numeric") and q.marks > 1 and len(points) < min(q.marks, 2):
        return [Issue(q.id, "memo.too_thin", f"{q.marks} marks but only {len(points)} memo point(s)")]
    return []


def answer_position_issues(questions: list[Question]) -> list[Issue]:
    positions = Counter(next((o.label for o in q.options if o.correct), "?") for q in questions if q.type == "mcq")
    total = sum(positions.values())
    if total >= 5 and positions.most_common(1)[0][1] / total > 0.6:
        label = positions.most_common(1)[0][0]
        return [Issue("*", "mcq.answer_position", f"{label} is correct in most questions; vary the position")]
    return []


def duplicate_issues(
    questions: list[Question],
    vectors: list[list[float]],
    *,
    threshold: float = 0.92,
    avoid: list[list[float]] | None = None,
) -> list[Issue]:
    def cos(a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b, strict=True))
        na = math.sqrt(sum(x * x for x in a)) or 1.0
        nb = math.sqrt(sum(y * y for y in b)) or 1.0
        return dot / (na * nb)

    issues: list[Issue] = []
    for i, q in enumerate(questions):
        for j in range(i):
            if cos(vectors[i], vectors[j]) >= threshold:
                issues.append(Issue(q.id, "duplicate.within_test", f"too similar to {questions[j].id}"))
                break
        for prev in avoid or []:
            if cos(vectors[i], prev) >= threshold:
                issues.append(Issue(q.id, "duplicate.recent", "too similar to a question the student saw recently"))
                break
    return issues


def check(q: Question) -> tuple[list[Issue], bool]:
    numeric, checked = numeric_issues(q)
    return [*latex_issues(q), *mcq_issues(q), *marks_issues(q), *numeric], checked
