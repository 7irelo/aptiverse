from __future__ import annotations

import json
import re
from typing import Any

from langgraph.checkpoint.memory import InMemorySaver

from aptiverse_ai.gateway import PromptRegistry
from aptiverse_ai.gateway.gateway import ModelGateway, Route
from aptiverse_ai.gateway.prices import PriceTable
from aptiverse_ai.gateway.providers.fake import FakeProvider, FakeReply
from aptiverse_ai.gateway.resilience import CircuitBreaker, SpendGuard, TierLimiter
from aptiverse_ai.gateway.types import ModelRequest
from aptiverse_ai.graphs.generation.graph import GenerationDeps, build_graph, resume_review, run
from aptiverse_ai.graphs.generation.schemas import GenerationRequest
from aptiverse_ai.retrieval.embeddings import HashEmbedder
from aptiverse_ai.settings import TierModels

REQUEST = GenerationRequest(
    job_id="job-1",
    stage="high_school",
    level="Grade 10",
    subject="Mathematics",
    subject_key="mathematics",
    grade=10,
    format="quiz",
    topics=["linear equations"],
)


def mcq(qid: str, correct: str = "B", stem: str = "Which value of x solves $2x + 3 = 7$?") -> dict[str, Any]:
    return {
        "id": qid,
        "type": "mcq",
        "topic": "linear equations",
        "cognitive_level": "routine",
        "marks": 2,
        "stem": stem,
        "options": [
            {"label": lbl, "text": t, "correct": lbl == correct}
            for lbl, t in zip("ABCD", ["1", "2", "3", "5"], strict=True)
        ],
        "answer": correct,
        "memo": "2x = 4\nx = 2",
    }


def numeric(qid: str, answer: str = "4") -> dict[str, Any]:
    return {
        "id": qid,
        "type": "numeric",
        "topic": "linear equations",
        "cognitive_level": "routine",
        "marks": 2,
        "stem": "Solve for $x$: $3x - 5 = 7$.",
        "answer": answer,
        "memo": "3x = 12\nx = 4",
    }


class Script:
    """Responds per use case; `generate` and `repair` can be swapped per test."""

    def __init__(self) -> None:
        self.generate: list[dict[str, Any]] = [mcq("s1-q1"), numeric("s1-q2")]
        self.repair: dict[str, Any] | None = None
        self.inappropriate: set[str] = set()

    def __call__(self, request: ModelRequest, model: str) -> FakeReply:
        if request.use_case == "practice.generate":
            return FakeReply(parsed={"name": "Quiz", "questions": self.generate})
        if request.use_case == "practice.repair":
            qid = re.search(r'"id": "([^"]+)"', request.messages[-1]["content"])
            assert qid
            fixed = self.repair or numeric(qid.group(1))
            return FakeReply(parsed={**fixed, "id": qid.group(1)})
        if request.use_case == "judge.level":
            ids = re.findall(r'"id": "([^"]+)"', request.messages[-1]["content"])
            return FakeReply(
                parsed={
                    "verdicts": [
                        {"question_id": i, "appropriate": i not in self.inappropriate, "reason": "ok"} for i in ids
                    ]
                }
            )
        raise AssertionError(request.use_case)


def deps(script: Script) -> tuple[GenerationDeps, FakeProvider]:
    provider = FakeProvider(responder=script)
    gateway = ModelGateway(
        [
            Route(
                provider,
                TierModels(fast="fake-fast", standard="fake-standard", deep="fake-deep"),
                CircuitBreaker(5, 30, 60),
            )
        ],
        PriceTable.load(),
        limiter=TierLimiter({"fast": 8, "standard": 8, "deep": 8}, 5),
        spend=SpendGuard(100_000_000),
    )
    return GenerationDeps(gateway=gateway, prompts=PromptRegistry.load(), embedder=HashEmbedder(64)), provider


async def test_happy_path_generates_validates_and_assembles() -> None:
    d, provider = deps(Script())
    state = await run(build_graph(d, InMemorySaver()), REQUEST)
    result = state["result"]
    assert [q["id"] for q in result["sections"][0]["questions"]] == ["s1-q1", "s1-q2"]
    assert result["total_marks"] == 4
    assert result["unchecked"] == []
    assert {c[0].use_case for c in provider.calls} == {"practice.generate", "judge.level"}
    assert all(u["cost_usd_micros"] > 0 for u in state["usage"])


async def test_failing_question_is_repaired_then_passes() -> None:
    script = Script()
    script.generate = [mcq("s1-q1"), {**numeric("s1-q2"), "answer": "9"}]  # memo says 4
    d, provider = deps(script)
    state = await run(build_graph(d, InMemorySaver()), REQUEST)
    assert state["repairs"] == {"s1-q2": 1}
    fixed = next(q for q in state["result"]["sections"][0]["questions"] if q["id"] == "s1-q2")
    assert fixed["answer"] == "4"
    repair_calls = [c for c in provider.calls if c[0].use_case == "practice.repair"]
    assert "numeric.memo_mismatch" in repair_calls[0][0].messages[-1]["content"]


async def test_unfixable_question_goes_to_human_review_and_resumes() -> None:
    script = Script()
    script.inappropriate = {"s1-q1"}
    script.repair = mcq("x")  # repairs keep producing the same (judged inappropriate) question
    d, _ = deps(script)
    graph = build_graph(d, InMemorySaver())
    state = await run(graph, REQUEST)
    interrupt = state["__interrupt__"][0].value
    assert interrupt["type"] == "review"
    assert [q["id"] for q in interrupt["questions"]] == ["s1-q1"]
    assert state["repairs"]["s1-q1"] == 2
    final = await resume_review(graph, "job-1", {"s1-q1": {"action": "drop"}})
    assert final["result"]["dropped"] == ["s1-q1"]
    assert [q["id"] for q in final["result"]["sections"][0]["questions"]] == ["s1-q2"]


async def test_second_repair_escalates_to_the_deep_tier() -> None:
    script = Script()
    script.inappropriate = {"s1-q1"}
    script.repair = mcq("x")
    d, provider = deps(script)
    await run(build_graph(d, InMemorySaver()), REQUEST)
    repair_models = [m for r, m in provider.calls if r.use_case == "practice.repair"]
    assert repair_models == ["fake-standard", "fake-deep"]


async def test_a_finished_run_is_returned_not_regenerated() -> None:
    d, provider = deps(Script())
    graph = build_graph(d, InMemorySaver())
    await run(graph, REQUEST)
    calls = len(provider.calls)
    again = await run(graph, REQUEST)
    assert again["result"]["total_marks"] == 4
    assert len(provider.calls) == calls


def test_blueprint_marks_add_up_for_every_format() -> None:
    from aptiverse_ai.graphs.generation import blueprints

    for fmt in ("quiz", "exam_paper", "reading", "flashcards", "essay"):
        req = REQUEST.model_copy(update={"format": fmt, "total_marks": 75, "topics": ["a", "b", "c"]})
        assert sum(p.marks for p in blueprints.plan(req)) == 75, fmt
    assert json.dumps([p.model_dump() for p in blueprints.plan(REQUEST)])
