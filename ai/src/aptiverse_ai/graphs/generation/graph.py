"""Practice generation as a LangGraph workflow (a workflow, not an agent: the steps are known).

plan -> fan out one generate_section per blueprint section (parallel) -> validate
validate -> repair (at most twice per question, escalating a tier once) -> validate
validate -> review (human interrupt for anything still failing) -> assemble
validate -> assemble

The Postgres checkpointer keys runs by the .NET generation job id, so a crashed or retried run resumes
from its last completed step instead of paying for the same sections twice.
"""

from __future__ import annotations

import asyncio
import json
import operator
from dataclasses import dataclass
from typing import Annotated, Any, Literal, TypedDict

import structlog
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, Send, interrupt

from aptiverse_ai.gateway import ModelGateway, PromptRegistry
from aptiverse_ai.graphs.generation import blueprints, validators
from aptiverse_ai.graphs.generation.schemas import (
    GenerationRequest,
    LevelVerdicts,
    Question,
    Section,
    SectionPlan,
)
from aptiverse_ai.retrieval.embeddings import Embedder
from aptiverse_ai.retrieval.search import Filters, HybridRetriever
from aptiverse_ai.safety.untrusted import wrap

log = structlog.get_logger()
MAX_REPAIRS = 2


def _merge(a: dict[str, Any], b: dict[str, Any]) -> dict[str, Any]:
    return {**a, **b}


class GenerationState(TypedDict, total=False):
    request: dict[str, Any]
    plans: list[dict[str, Any]]
    exemplars: dict[str, str]
    questions: Annotated[dict[str, dict[str, Any]], _merge]  # id -> question plus _section/_index
    repairs: Annotated[dict[str, int], _merge]
    issues: dict[str, list[str]]
    unchecked: list[str]
    flagged: dict[str, list[str]]
    decisions: dict[str, Any]
    usage: Annotated[list[dict[str, Any]], operator.add]
    result: dict[str, Any]


class SectionTask(TypedDict):
    request: dict[str, Any]
    plan: dict[str, Any]
    index: int
    exemplars: str


@dataclass(slots=True)
class GenerationDeps:
    gateway: ModelGateway
    prompts: PromptRegistry
    embedder: Embedder
    retriever: HybridRetriever | None = None
    recent_stem_vectors: list[list[float]] | None = None


_LEVEL_RUBRIC = {
    "high_school": (
        "Appropriate: matches the CAPS content and cognitive demand for this grade and topic.\n"
        "Too easy: tests content from an earlier grade or only recall when the plan asks for more.\n"
        "Too hard: needs content from a later grade or university."
    ),
    "university": (
        "Appropriate: matches what a student in this year of this course is expected to handle.\n"
        "Too easy: school-level content or pure recall.\n"
        "Too hard: postgraduate or specialist content outside the course."
    ),
}


def build_graph(deps: GenerationDeps, checkpointer: Any = None) -> Any:
    async def plan(state: GenerationState) -> dict[str, Any]:
        request = GenerationRequest.model_validate(state["request"])
        plans = blueprints.plan(request)
        exemplars: dict[str, str] = {}
        if deps.retriever is not None:
            for p in plans:
                hits = await deps.retriever.search(
                    " ".join(p.topics),
                    Filters(subject=request.subject_key, grade=request.grade, doc_types=("exam_paper", "memo", "caps")),
                    top_k=5,
                )
                exemplars[p.name] = "\n".join(
                    wrap("retrieved_source", h.text, title=h.title, section=" > ".join(h.heading_path)) for h in hits
                )
        return {"plans": [p.model_dump() for p in plans], "exemplars": exemplars}

    def fan_out(state: GenerationState) -> list[Send]:
        return [
            Send(
                "generate_section",
                SectionTask(
                    request=state["request"],
                    plan=p,
                    index=i,
                    exemplars=state.get("exemplars", {}).get(p["name"], "") or "(none available)",
                ),
            )
            for i, p in enumerate(state["plans"])
        ]

    async def generate_section(task: SectionTask) -> dict[str, Any]:
        request = GenerationRequest.model_validate(task["request"])
        p = SectionPlan.model_validate(task["plan"])
        rendered = deps.prompts.render(
            "practice-generate",
            stage=request.stage.replace("_", " "),
            level=request.level,
            subject=request.subject,
            curriculum=request.curriculum.upper(),
            section_name=p.name,
            marks=str(p.marks),
            question_count=str(p.question_count),
            question_types=", ".join(p.question_types),
            cognitive_mix=", ".join(f"{k} {round(v * 100)}%" for k, v in p.cognitive_mix.items()),
            topics=", ".join(p.topics),
            id_prefix=f"s{task['index'] + 1}-q",
            exemplars=task["exemplars"],
            avoid="\n".join(f"- {s[:200]}" for s in request.avoid_question_stems[:30]) or "(none)",
        )
        result = await deps.gateway.structured(rendered.request(interactive=False), Section)
        questions = {
            q.id: {**q.model_dump(), "_section": task["index"], "_index": i}
            for i, q in enumerate(result.value.questions)
        }
        return {"questions": questions, "usage": [u.model_dump() for u in result.usage.calls]}

    async def validate(state: GenerationState) -> dict[str, Any]:
        request = GenerationRequest.model_validate(state["request"])
        items = {qid: Question.model_validate(_strip(q)) for qid, q in state["questions"].items()}
        issues: dict[str, list[str]] = {qid: [] for qid in items}
        unchecked: list[str] = []
        for qid, q in items.items():
            found, checked = validators.check(q)
            issues[qid].extend(str(i) for i in found)
            if q.type == "numeric" and not checked:
                unchecked.append(qid)
        ordered = list(items.values())
        for issue in validators.answer_position_issues(ordered):
            # Position bias is a whole-test problem; attach it to the last MCQ so repair can move one answer.
            last = next((q.id for q in reversed(ordered) if q.type == "mcq"), None)
            if last:
                issues[last].append(str(issue))
        vectors = await deps.embedder.embed([q.stem for q in ordered])
        for issue in validators.duplicate_issues(ordered, vectors, avoid=deps.recent_stem_vectors):
            issues[issue.question_id].append(str(issue))
        usage: list[dict[str, Any]] = []
        # Only questions that passed the free checks are worth a judge call.
        clean = [q for q in ordered if not issues[q.id]]
        if clean:
            rendered = deps.prompts.render(
                "judge-level",
                stage=request.stage.replace("_", " "),
                level=request.level,
                subject=request.subject,
                rubric=_LEVEL_RUBRIC[request.stage],
                questions_json=json.dumps(
                    [{"id": q.id, "topic": q.topic, "stem": q.stem, "marks": q.marks} for q in clean]
                ),
            )
            verdicts = await deps.gateway.structured(rendered.request(interactive=False), LevelVerdicts)
            usage.extend(u.model_dump() for u in verdicts.usage.calls)
            for v in verdicts.value.verdicts:
                if v.question_id in issues and not v.appropriate:
                    issues[v.question_id].append(f"level.inappropriate: {v.reason}")
        failing = {qid: msgs for qid, msgs in issues.items() if msgs}
        flagged = {qid: msgs for qid, msgs in failing.items() if state.get("repairs", {}).get(qid, 0) >= MAX_REPAIRS}
        return {"issues": failing, "unchecked": unchecked, "flagged": flagged, "usage": usage}

    def after_validate(state: GenerationState) -> Literal["repair", "review", "assemble"]:
        issues, repairs = state.get("issues", {}), state.get("repairs", {})
        if any(repairs.get(qid, 0) < MAX_REPAIRS for qid in issues):
            return "repair"
        return "review" if state.get("flagged") else "assemble"

    async def repair(state: GenerationState) -> dict[str, Any]:
        request = GenerationRequest.model_validate(state["request"])
        repairs = dict(state.get("repairs", {}))
        targets = [qid for qid in state["issues"] if repairs.get(qid, 0) < MAX_REPAIRS]

        async def fix(qid: str) -> tuple[str, dict[str, Any] | None, list[dict[str, Any]]]:
            original = state["questions"][qid]
            rendered = deps.prompts.render(
                "practice-repair",
                level=request.level,
                subject=request.subject,
                question_json=json.dumps(_strip(original)),
                issues="\n".join(f"- {m}" for m in state["issues"][qid]),
            )
            # The second repair escalates a tier: the first model already had a go.
            tier = "deep" if repairs.get(qid, 0) >= 1 else rendered.prompt.tier
            try:
                result = await deps.gateway.structured(
                    rendered.request(interactive=False, tier=tier), Question, escalate=False
                )
            except Exception as exc:  # a failed repair leaves the question failing; validate flags it
                log.warning("repair_failed", question_id=qid, error=type(exc).__name__)
                return qid, None, []
            fixed = {
                **result.value.model_dump(),
                "id": qid,
                "_section": original["_section"],
                "_index": original["_index"],
            }
            return qid, fixed, [u.model_dump() for u in result.usage.calls]

        results = await asyncio.gather(*(fix(qid) for qid in targets))
        questions: dict[str, dict[str, Any]] = {}
        usage: list[dict[str, Any]] = []
        for qid, fixed, used in results:
            repairs[qid] = repairs.get(qid, 0) + 1
            usage.extend(used)
            if fixed is not None:
                questions[qid] = fixed
        return {"questions": questions, "repairs": repairs, "usage": usage}

    async def review(state: GenerationState) -> dict[str, Any]:
        flagged = state["flagged"]
        decisions: dict[str, Any] = interrupt(
            {
                "type": "review",
                "questions": [{**_strip(state["questions"][qid]), "issues": msgs} for qid, msgs in flagged.items()],
            }
        )
        updates: dict[str, dict[str, Any]] = {}
        for qid, decision in (decisions or {}).items():
            if qid in flagged and decision.get("action") == "edit":
                edited = Question.model_validate({**decision["question"], "id": qid})
                original = state["questions"][qid]
                updates[qid] = {**edited.model_dump(), "_section": original["_section"], "_index": original["_index"]}
        return {"decisions": decisions or {}, "questions": updates}

    async def assemble(state: GenerationState) -> dict[str, Any]:
        decisions = state.get("decisions", {})
        flagged = state.get("flagged", {})

        def keep(qid: str) -> bool:
            if qid not in flagged:
                return True
            return decisions.get(qid, {}).get("action") in ("approve", "edit")

        plans = [SectionPlan.model_validate(p) for p in state["plans"]]
        sections = []
        for index, p in enumerate(plans):
            qs = sorted(
                (q for qid, q in state["questions"].items() if q["_section"] == index and keep(qid)),
                key=lambda q: q["_index"],
            )
            if qs:
                sections.append({"name": p.name, "questions": [_strip(q) for q in qs]})
        total = sum(q["marks"] for s in sections for q in s["questions"])
        dropped = [qid for qid in flagged if not keep(qid)]
        return {
            "result": {
                "sections": sections,
                "total_marks": total,
                "dropped": dropped,
                "unchecked": state.get("unchecked", []),
            }
        }

    graph = StateGraph(GenerationState)
    graph.add_node("plan", plan)
    graph.add_node("generate_section", generate_section)  # type: ignore[arg-type]
    graph.add_node("validate", validate)
    graph.add_node("repair", repair)
    graph.add_node("review", review)
    graph.add_node("assemble", assemble)
    graph.add_edge(START, "plan")
    graph.add_conditional_edges("plan", fan_out, ["generate_section"])
    graph.add_edge("generate_section", "validate")
    graph.add_conditional_edges("validate", after_validate, ["repair", "review", "assemble"])
    graph.add_edge("repair", "validate")
    graph.add_edge("review", "assemble")
    graph.add_edge("assemble", END)
    return graph.compile(checkpointer=checkpointer)


def _strip(q: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in q.items() if not k.startswith("_")}


def config_for(job_id: str) -> dict[str, Any]:
    return {"configurable": {"thread_id": f"generation:{job_id}"}}


async def run(graph: Any, request: GenerationRequest, owner: str | None = None) -> dict[str, Any]:
    """Starts or resumes a run. Returns the state; `__interrupt__` is present when review is needed.
    `owner` is the requesting user, stored so status reads can refuse other users' jobs."""
    config = config_for(request.job_id)
    snapshot = await graph.aget_state(config)
    if snapshot and snapshot.values.get("result"):
        return snapshot.values
    if snapshot and snapshot.next:
        return await graph.ainvoke(None, config)  # resume after a crash from the last checkpoint
    return await graph.ainvoke({"request": {**request.model_dump(), "_owner": owner}, "usage": []}, config)


async def resume_review(graph: Any, job_id: str, decisions: dict[str, Any]) -> dict[str, Any]:
    return await graph.ainvoke(Command(resume=decisions), config_for(job_id))
