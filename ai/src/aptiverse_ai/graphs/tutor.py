"""The tutor: the one place where an agent (the model choosing tools) is the right design, and still bounded.

guard -> route -> agent <-> tools -> end

- guard: distress phrasing gets the support reply straight away, with no model call and nothing stored.
- route: the fast tier classifies intent and graded work; that sets the allowed tools and the hint-only rule.
- agent: streams the reply; when it asks for tools, `tools` runs them and hands results back.
- limits: at most 6 tool calls and 45 seconds per turn, repeated identical calls refused; when a limit is
  hit the agent must answer with what it has.
- least capability: once a turn has seen untrusted content (a student's own notes), write tools are removed.

Stateless per turn: .NET sends the history window and summary and stores the reply, so the conversation has
one source of truth that the student can see, export and delete.
"""

from __future__ import annotations

import asyncio
import json
import time
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any, Literal, TypedDict

import structlog
from langgraph.config import get_stream_writer
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from aptiverse_ai.gateway import ModelGateway, PromptRegistry
from aptiverse_ai.gateway.types import TextDelta, ToolUse, UsageReport
from aptiverse_ai.safety.checks import SUPPORT_REPLY, mentions_distress
from aptiverse_ai.safety.untrusted import looks_like_injection, wrap
from aptiverse_ai.tools.base import Tool, ToolContext, ToolResult, definition

log = structlog.get_logger()
MAX_TOOL_CALLS = 6
TURN_BUDGET_SECONDS = 45.0

Intent = Literal["explain", "solve", "quiz_me", "progress", "study_help", "off_topic"]


class StudentContext(BaseModel):
    """Built server-side by .NET from the student's own records; never from client fields."""

    stage: Literal["high_school", "university"]
    level: str = Field(max_length=80)
    curriculum: str = Field(default="caps", max_length=20)
    subjects: list[str] = Field(default_factory=list, max_length=20)
    weakest_topics: list[str] = Field(default_factory=list, max_length=10)
    open_assessments: list[str] = Field(default_factory=list, max_length=20)

    def describe(self) -> str:
        parts = [f"{self.stage.replace('_', ' ')}, {self.level}, curriculum {self.curriculum.upper()}"]
        if self.subjects:
            parts.append("subjects: " + ", ".join(self.subjects))
        if self.weakest_topics:
            parts.append("weakest topics from their results: " + ", ".join(self.weakest_topics))
        return "; ".join(parts)


class HistoryTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=12000)


class TutorTurnRequest(BaseModel):
    conversation_id: str = Field(max_length=64)
    mode: Literal["standard", "deep"] = "standard"
    message: str = Field(min_length=1, max_length=4000)
    history: list[HistoryTurn] = Field(default_factory=list, max_length=40)
    summary: str | None = Field(default=None, max_length=2000)
    context: StudentContext
    allow_private_notes: bool = False
    confirmed_action: dict[str, Any] | None = None


class RouteDecision(BaseModel):
    intent: Intent
    graded_work: bool
    language: Literal["english", "afrikaans", "other"] = "english"


_TOOLS_BY_INTENT: dict[str, set[str]] = {
    "explain": {"search_curriculum", "check_math"},
    "solve": {"search_curriculum", "check_math", "get_attempt_mistakes"},
    "quiz_me": {"search_curriculum", "create_practice_quiz", "get_topic_mastery"},
    "progress": {"get_topic_mastery", "list_upcoming_assessments", "get_attempt_mistakes"},
    "study_help": {"list_upcoming_assessments", "get_topic_mastery"},
    "off_topic": set(),
}


class TutorState(TypedDict, total=False):
    request: dict[str, Any]
    route: dict[str, Any]
    messages: list[dict[str, Any]]
    pending: list[dict[str, Any]]
    calls: list[str]
    untrusted: bool
    citations: list[dict[str, Any]]
    usage: list[dict[str, Any]]
    started: float
    final: str
    force_answer: bool


@dataclass(slots=True)
class TutorDeps:
    gateway: ModelGateway
    prompts: PromptRegistry
    tools: dict[str, Tool] = field(default_factory=dict)


def _route_rules(route: RouteDecision, ctx: StudentContext) -> str:
    rules = [f"intent {route.intent}"]
    if route.graded_work:
        rules.append("this is graded work: hints and checking only, never the final answer")
    if route.language == "afrikaans":
        rules.append("reply in Afrikaans")
    if route.intent == "off_topic":
        rules.append("politely steer back to their studies in one or two sentences")
    if route.intent == "quiz_me":
        rules.append(
            "call create_practice_quiz now with the subject and topics the student named (ask only if they named "
            "neither); it returns a proposal the student confirms, so nothing is created without them"
        )
    return "; ".join(rules)


def build_graph(deps: TutorDeps) -> Any:
    async def guard(state: TutorState) -> dict[str, Any]:
        req = TutorTurnRequest.model_validate(state["request"])
        if mentions_distress(req.message):
            writer = get_stream_writer()
            writer({"type": "token", "text": SUPPORT_REPLY})
            writer({"type": "done", "route": "support", "usage": [], "cost_usd_micros": 0, "citations": []})
            return {"final": SUPPORT_REPLY, "route": {"intent": "support"}}
        return {"started": time.monotonic(), "calls": [], "citations": [], "usage": [], "untrusted": False}

    async def route(state: TutorState) -> dict[str, Any]:
        req = TutorTurnRequest.model_validate(state["request"])
        rendered = deps.prompts.render(
            "tutor-route",
            open_assessments=", ".join(req.context.open_assessments) or "(none)",
            message=wrap("student_message", req.message),
        )
        try:
            result = await deps.gateway.structured(rendered.request(), RouteDecision, escalate=False)
            decision, usage = result.value, [u.model_dump() for u in result.usage.calls]
        except Exception as exc:  # routing is an optimisation; on failure fall back to the safest useful route
            log.warning("tutor_route_failed", error=type(exc).__name__)
            decision, usage = RouteDecision(intent="explain", graded_work=True), []
        lowered = req.message.lower()
        if any(title.lower() in lowered for title in req.context.open_assessments if len(title) > 4):
            decision.graded_work = True
        if req.confirmed_action and req.confirmed_action.get("tool") == "create_practice_quiz":
            decision.intent = "quiz_me"
        get_stream_writer()({"type": "route", "intent": decision.intent, "graded_work": decision.graded_work})
        history = [{"role": t.role, "content": t.content} for t in req.history]
        user = wrap("student_message", req.message)
        if req.confirmed_action:
            user += "\nThe student confirmed this action: " + json.dumps(req.confirmed_action)[:1000]
        return {
            "route": decision.model_dump(),
            "usage": state["usage"] + usage,
            "messages": [*history, {"role": "user", "content": user}],
        }

    def allowed_tools(state: TutorState) -> list[Tool]:
        if state.get("force_answer"):
            return []
        names = _TOOLS_BY_INTENT.get(state["route"]["intent"], set())
        tools = [deps.tools[n] for n in sorted(names) if n in deps.tools]
        if state.get("untrusted"):
            tools = [t for t in tools if not t.writes]
        return tools

    async def agent(state: TutorState) -> dict[str, Any]:
        req = TutorTurnRequest.model_validate(state["request"])
        decision = RouteDecision.model_validate(state["route"])
        writer = get_stream_writer()
        rendered = deps.prompts.render(
            "tutor",
            student_context=req.context.describe(),
            route_rules=_route_rules(decision, req.context),
            summary=req.summary or "(start of conversation)",
            message="",
        )
        tools = allowed_tools(state)
        request = rendered.request(user_id_hash=None)
        request.messages = list(state["messages"])
        request.tools = [definition(t) for t in tools] or None
        if req.mode == "deep":
            request.tier, request.effort, request.use_case = "deep", "medium", "tutor.deep"
        completion = None
        async for event in deps.gateway.stream(request):
            if isinstance(event, TextDelta):
                writer({"type": "token", "text": event.text})
            else:
                completion = event.completion
        assert completion is not None
        usage = [*state["usage"], completion.usage.model_dump()]
        if completion.tool_uses and tools:
            return {
                "usage": usage,
                "messages": [*state["messages"], {"role": "assistant", "content": completion.raw_content}],
                "pending": [{"id": t.id, "name": t.name, "input": t.input} for t in completion.tool_uses],
            }
        total = UsageReport.model_validate({"calls": usage})
        writer(
            {
                "type": "done",
                "route": decision.intent,
                "usage": usage,
                "cost_usd_micros": total.cost_usd_micros,
                "citations": state.get("citations", []),
                "tool_calls": state.get("calls", []),
            }
        )
        return {"usage": usage, "final": completion.text, "pending": []}

    def after_agent(state: TutorState) -> str:
        return "tools" if state.get("pending") else END

    async def run_tools(state: TutorState) -> dict[str, Any]:
        req = TutorTurnRequest.model_validate(state["request"])
        writer = get_stream_writer()
        ctx = ToolContext(
            user_id=str(state["request"]["user_id"]),
            stage=req.context.stage,
            allow_private_notes=req.allow_private_notes and req.context.stage == "university",
            confirmed=req.confirmed_action,
            mcp_token=state["request"].get("mcp_token"),
        )
        calls = list(state.get("calls", []))
        seen = {c for c in calls}
        over_time = time.monotonic() - state["started"] > TURN_BUDGET_SECONDS
        names = {t.name for t in allowed_tools(state)}

        async def one(use: ToolUse) -> tuple[ToolUse, ToolResult]:
            signature = f"{use.name}:{json.dumps(use.input, sort_keys=True)}"
            if use.name not in names:
                return use, ToolResult(f"{use.name} is not available for this question.", is_error=True)
            if signature in seen:
                return use, ToolResult("You already made this exact call; use the earlier result.", is_error=True)
            seen.add(signature)
            try:
                return use, await asyncio.wait_for(deps.tools[use.name].call(use.input, ctx), timeout=10.0)
            except TimeoutError:
                return use, ToolResult(f"{use.name} timed out.", is_error=True)

        uses = [ToolUse(**p) for p in state["pending"]]
        budget_left = MAX_TOOL_CALLS - len(calls)
        results = await asyncio.gather(*(one(u) for u in uses[: max(budget_left, 0)]))
        refused = [
            (u, ToolResult("Tool budget for this turn is used up; answer with what you have.", is_error=True))
            for u in uses[max(budget_left, 0) :]
        ]
        blocks: list[dict[str, Any]] = []
        citations = list(state.get("citations", []))
        untrusted = bool(state.get("untrusted"))
        for use, result in [*results, *refused]:
            calls.append(f"{use.name}:{json.dumps(use.input, sort_keys=True)}")
            writer({"type": "tool_call", "name": use.name, "ok": not result.is_error})
            if result.needs_confirmation:
                writer({"type": "confirm", **json.loads(result.text)["proposal"]})
            if result.citations:
                citations.extend(result.citations)
                for c in result.citations:
                    writer({"type": "citation", **c})
            untrusted = untrusted or result.untrusted or looks_like_injection(result.text)
            blocks.append(
                {
                    "type": "tool_result",
                    "tool_use_id": use.id,
                    "content": wrap("tool_result", result.text, tool=use.name),
                    "is_error": result.is_error,
                }
            )
        force = over_time or len(calls) >= MAX_TOOL_CALLS
        return {
            "messages": [*state["messages"], {"role": "user", "content": blocks}],
            "calls": calls,
            "citations": citations,
            "untrusted": untrusted,
            "pending": [],
            "force_answer": force,
        }

    graph = StateGraph(TutorState)
    graph.add_node("guard", guard)
    graph.add_node("route", route)
    graph.add_node("agent", agent)
    graph.add_node("tools", run_tools)
    graph.add_edge(START, "guard")
    graph.add_conditional_edges("guard", lambda s: END if s.get("final") else "route", ["route", END])
    graph.add_edge("route", "agent")
    graph.add_conditional_edges("agent", after_agent, ["tools", END])
    graph.add_edge("tools", "agent")
    return graph.compile()


async def turn(
    graph: Any, request: TutorTurnRequest, user_id: str, mcp_token: str | None = None
) -> AsyncIterator[dict[str, Any]]:
    """Streams events: route, token, tool_call, citation, confirm, done."""
    state = {"request": {**request.model_dump(), "user_id": user_id, "mcp_token": mcp_token}}
    async for event in graph.astream(state, stream_mode="custom"):
        yield event
