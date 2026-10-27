"""Grading as a LangGraph workflow: one branch per answer, in parallel, then aggregate.

Code marks what code can (multiple choice, numeric and algebraic answers via SymPy). Written answers go to
a model marker whose evidence quotes are verified against the answer and whose total is computed here,
never trusted from the model. Answers worth 6 marks or more are marked twice by different model families
(memo order shuffled); a disagreement over one mark goes to the deep tier, and anything still uncertain is
marked provisional for human review.
"""

from __future__ import annotations

import asyncio
import operator
import random
import re
from dataclasses import dataclass
from typing import Annotated, Any, Literal, TypedDict

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from pydantic import BaseModel, Field

from aptiverse_ai.gateway import ModelGateway, PromptRegistry, UsageReport
from aptiverse_ai.safety.untrusted import wrap
from aptiverse_ai.tools import mathcheck

DOUBLE_MARK_FROM = 6
REVIEW_CONFIDENCE = 0.6


class AnswerItem(BaseModel):
    question_id: str = Field(max_length=64)
    type: Literal["mcq", "short", "numeric", "long", "flashcard", "essay"]
    stem: str = Field(max_length=4000)
    marks: int = Field(ge=1, le=50)
    memo: str = Field(max_length=6000)
    answer: str = Field(default="", max_length=2000)
    student_answer: str = Field(default="", max_length=20000)


class GradeRequest(BaseModel):
    attempt_id: str = Field(max_length=64)
    level: str = Field(max_length=80)
    subject: str = Field(max_length=80)
    answers: list[AnswerItem] = Field(min_length=1, max_length=100)


class MarkedPoint(BaseModel):
    memo_point: str
    awarded: bool
    evidence_quote: str = ""


class MarkResult(BaseModel):
    points: list[MarkedPoint]
    feedback: str = Field(max_length=1500)
    confidence: float = Field(ge=0, le=1)


class GradedAnswer(BaseModel):
    question_id: str
    awarded: int
    max_marks: int
    method: Literal["deterministic", "model", "double", "escalated", "blank"]
    needs_review: bool
    confidence: float
    feedback: str
    points: list[MarkedPoint] = Field(default_factory=list)


class GradingState(TypedDict, total=False):
    request: dict[str, Any]
    graded: Annotated[list[dict[str, Any]], operator.add]
    usage: Annotated[list[dict[str, Any]], operator.add]
    result: dict[str, Any]


@dataclass(slots=True)
class GradingDeps:
    gateway: ModelGateway
    prompts: PromptRegistry
    seed: int | None = None


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def verify_evidence(result: MarkResult, student_answer: str) -> tuple[list[MarkedPoint], int, float]:
    """Drops awarded points whose quote is not in the answer. Returns points, awarded count, confidence."""
    answer = _norm(student_answer)
    fabricated = 0
    points: list[MarkedPoint] = []
    for p in result.points:
        if p.awarded and (not p.evidence_quote.strip() or _norm(p.evidence_quote) not in answer):
            fabricated += 1
            points.append(MarkedPoint(memo_point=p.memo_point, awarded=False, evidence_quote=""))
        else:
            points.append(p)
    confidence = max(0.0, result.confidence - 0.3 * fabricated)
    return points, sum(1 for p in points if p.awarded), confidence


def mark_deterministic(item: AnswerItem) -> GradedAnswer | None:
    given = item.student_answer.strip()
    if not given:
        return GradedAnswer(
            question_id=item.question_id,
            awarded=0,
            max_marks=item.marks,
            method="blank",
            needs_review=False,
            confidence=1.0,
            feedback="No answer was given.",
        )
    if item.type == "mcq":
        correct = given.upper()[:1] == item.answer.strip().upper()[:1]
        return GradedAnswer(
            question_id=item.question_id,
            awarded=item.marks if correct else 0,
            max_marks=item.marks,
            method="deterministic",
            needs_review=False,
            confidence=1.0,
            feedback="Correct." if correct else f"The correct option is {item.answer.strip()[:1]}.",
        )
    if item.type == "numeric":
        a, b = mathcheck.to_number(given), mathcheck.to_number(item.answer)
        if a is not None and b is not None:
            ok = mathcheck.numeric_equal(a, b)
        else:
            ok = mathcheck.equivalent(given, item.answer).result
        if ok is None:
            return None  # cannot decide in code: let the model mark the working
        # A correct final answer earns full marks; a wrong one goes to the model to award method marks.
        if ok:
            return GradedAnswer(
                question_id=item.question_id,
                awarded=item.marks,
                max_marks=item.marks,
                method="deterministic",
                needs_review=False,
                confidence=1.0,
                feedback="Correct.",
            )
        return None
    return None


def build_graph(deps: GradingDeps, checkpointer: Any = None) -> Any:
    rng = random.Random(deps.seed)  # noqa: S311 - memo shuffling, not security

    def fan_out(state: GradingState) -> list[Send]:
        req = GradeRequest.model_validate(state["request"])
        return [Send("grade_one", {"request": state["request"], "item": a.model_dump()}) for a in req.answers]

    async def model_mark(
        req: GradeRequest, item: AnswerItem, *, use_case: str, tier: str | None, shuffle: bool
    ) -> tuple[GradedAnswer, UsageReport]:
        memo_points = [line.strip() for line in item.memo.splitlines() if line.strip()]
        if shuffle:
            memo_points = memo_points[:]
            rng.shuffle(memo_points)
        rendered = deps.prompts.render(
            "grade-written",
            level=req.level,
            subject=req.subject,
            question=item.stem,
            marks=str(item.marks),
            memo_points="\n".join(f"- {p}" for p in memo_points),
            student_answer=wrap("student_message", item.student_answer),
        )
        overrides: dict[str, Any] = {"interactive": False, "use_case": use_case}
        if tier:
            overrides["tier"] = tier
        result = await deps.gateway.structured(rendered.request(**overrides), MarkResult, escalate=False)
        points, awarded, confidence = verify_evidence(result.value, item.student_answer)
        return (
            GradedAnswer(
                question_id=item.question_id,
                awarded=min(awarded, item.marks),
                max_marks=item.marks,
                method="model",
                needs_review=confidence < REVIEW_CONFIDENCE,
                confidence=confidence,
                feedback=result.value.feedback,
                points=points,
            ),
            result.usage,
        )

    async def grade_one(task: dict[str, Any]) -> dict[str, Any]:
        req = GradeRequest.model_validate(task["request"])
        item = AnswerItem.model_validate(task["item"])
        decided = mark_deterministic(item)
        if decided is not None:
            return {"graded": [decided.model_dump()], "usage": []}
        usage = UsageReport()
        if item.marks < DOUBLE_MARK_FROM:
            graded, used = await model_mark(req, item, use_case="grade.written", tier=None, shuffle=False)
            usage.add(used)
            return {"graded": [graded.model_dump()], "usage": [u.model_dump() for u in usage.calls]}
        (first, u1), (second, u2) = await asyncio.gather(
            model_mark(req, item, use_case="grade.written", tier=None, shuffle=False),
            model_mark(req, item, use_case="grade.second_marker", tier=None, shuffle=True),
        )
        usage.add(u1)
        usage.add(u2)
        if abs(first.awarded - second.awarded) <= 1:
            final = first.model_copy(
                update={
                    "awarded": min(first.awarded, second.awarded),  # agree within a mark: the lower mark, never inflate
                    "method": "double",
                    "confidence": min(first.confidence, second.confidence),
                    "needs_review": first.needs_review or second.needs_review,
                }
            )
        else:
            third, u3 = await model_mark(req, item, use_case="grade.written", tier="deep", shuffle=True)
            usage.add(u3)
            close = min(abs(third.awarded - first.awarded), abs(third.awarded - second.awarded)) <= 1
            final = third.model_copy(update={"method": "escalated", "needs_review": third.needs_review or not close})
        return {"graded": [final.model_dump()], "usage": [u.model_dump() for u in usage.calls]}

    async def aggregate(state: GradingState) -> dict[str, Any]:
        req = GradeRequest.model_validate(state["request"])
        order = {a.question_id: i for i, a in enumerate(req.answers)}
        graded = sorted(state.get("graded", []), key=lambda g: order[g["question_id"]])
        return {
            "result": {
                "attempt_id": req.attempt_id,
                "answers": graded,
                "awarded": sum(g["awarded"] for g in graded),
                "max_marks": sum(g["max_marks"] for g in graded),
                "needs_review": any(g["needs_review"] for g in graded),
            }
        }

    graph = StateGraph(GradingState)
    graph.add_node("grade_one", grade_one)  # type: ignore[arg-type]
    graph.add_node("aggregate", aggregate)
    graph.add_conditional_edges(START, fan_out, ["grade_one"])
    graph.add_edge("grade_one", "aggregate")
    graph.add_edge("aggregate", END)
    return graph.compile(checkpointer=checkpointer)


async def grade(graph: Any, request: GradeRequest) -> dict[str, Any]:
    config = {"configurable": {"thread_id": f"grading:{request.attempt_id}"}}
    snapshot = await graph.aget_state(config) if graph.checkpointer else None
    if snapshot and snapshot.values.get("result"):
        return snapshot.values
    return await graph.ainvoke({"request": request.model_dump(), "graded": [], "usage": []}, config)
