"""HTTP API used only by the .NET API (never the internet). Every route needs the service token and the
scope for that use; .NET owns user rate limits, quotas and entitlements before it calls here."""

from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from typing import Annotated, Any, Literal

import structlog
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from aptiverse_ai.auth import Caller, current_caller
from aptiverse_ai.gateway import ModelGateway, PromptRegistry, UsageReport
from aptiverse_ai.graphs import grading, tutor
from aptiverse_ai.graphs.generation import graph as generation
from aptiverse_ai.graphs.generation.schemas import GenerationRequest
from aptiverse_ai.problems import Conflict, NotFound
from aptiverse_ai.retrieval.chunking import normalise
from aptiverse_ai.retrieval.search import Filters
from aptiverse_ai.safety.untrusted import wrap
from aptiverse_ai.services import Services

log = structlog.get_logger()


def scoped(scope: str):  # type: ignore[no-untyped-def]
    async def dependency(caller: Annotated[Caller, Depends(current_caller)]) -> Caller:
        if not caller.has_scope(scope):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        return caller

    return Depends(dependency)


def services(request: Request) -> Services:
    return request.app.state.services


ServicesDep = Annotated[Services, Depends(services)]
router = APIRouter(prefix="/v1")


# ---- retrieval ---------------------------------------------------------------------------------


class RetrieveRequest(BaseModel):
    query: str = Field(min_length=2, max_length=300)
    subject: str | None = Field(default=None, max_length=60)
    grade: int | None = Field(default=None, ge=8, le=12)
    top_k: int = Field(default=8, ge=1, le=20)
    include_private: bool = False


@router.post("/retrieve", operation_id="retrieve")
async def retrieve(body: RetrieveRequest, svc: ServicesDep, caller: Caller = scoped("ai.retrieve")) -> dict[str, Any]:
    hits = await svc.retriever.search(
        body.query,
        Filters(subject=body.subject, grade=body.grade),
        top_k=body.top_k,
        user_id=caller.user_id,
        include_private=body.include_private,
    )
    return {"hits": [{**h.citation(), "text": h.text if h.display_rule != "index_only" else None} for h in hits]}


# ---- generation --------------------------------------------------------------------------------


class GenerationStatus(BaseModel):
    job_id: str
    status: Literal["running", "review", "completed", "failed", "not_found"]
    result: dict[str, Any] | None = None
    review: dict[str, Any] | None = None
    usage: dict[str, Any] | None = None


async def _status(svc: Services, job_id: str, user_id: str) -> GenerationStatus:
    snapshot = await svc.generation_graph.aget_state(generation.config_for(job_id))
    values = snapshot.values if snapshot else {}
    if not values:
        return GenerationStatus(job_id=job_id, status="running" if svc.runner.running(f"gen:{job_id}") else "not_found")
    if values.get("request", {}).get("_owner") not in (None, user_id):
        raise NotFound("generation.not_found", "No such generation job.")  # never reveal other users' jobs
    usage = UsageReport.model_validate({"calls": values.get("usage", [])}).summary()
    if values.get("result"):
        return GenerationStatus(job_id=job_id, status="completed", result=values["result"], usage=usage)
    interrupts = [i.value for task in snapshot.tasks for i in task.interrupts] if snapshot.tasks else []
    if interrupts:
        return GenerationStatus(job_id=job_id, status="review", review=interrupts[0], usage=usage)
    return GenerationStatus(
        job_id=job_id, status="running" if svc.runner.running(f"gen:{job_id}") else "failed", usage=usage
    )


async def _run_generation(svc: Services, request: GenerationRequest, owner: str) -> None:
    try:
        state = await generation.run(svc.generation_graph, request, owner)
        status_value = "review" if state.get("__interrupt__") else "completed"
        message: dict[str, Any] = {"type": "generation", "job_id": request.job_id, "status": status_value}
        if status_value == "completed":
            message["result"] = state["result"]
            message["usage"] = UsageReport.model_validate({"calls": state.get("usage", [])}).summary()
        await svc.publisher.publish(message)
    except Exception as exc:  # a failed run is reported so .NET refunds the reservation
        log.exception("generation_failed", job_id=request.job_id, error_type=type(exc).__name__)
        await svc.publisher.publish(
            {"type": "generation", "job_id": request.job_id, "status": "failed", "reason": type(exc).__name__}
        )


@router.post("/generations", status_code=202, operation_id="startGeneration")
async def start_generation(
    body: GenerationRequest, svc: ServicesDep, caller: Caller = scoped("ai.generate")
) -> GenerationStatus:
    current = await _status(svc, body.job_id, caller.user_id)
    if current.status in ("completed", "review"):
        return current
    svc.runner.start(f"gen:{body.job_id}", _run_generation(svc, body, caller.user_id))
    return GenerationStatus(job_id=body.job_id, status="running")


@router.get("/generations/{job_id}", operation_id="getGeneration")
async def get_generation(job_id: str, svc: ServicesDep, caller: Caller = scoped("ai.generate")) -> GenerationStatus:
    result = await _status(svc, job_id, caller.user_id)
    if result.status == "not_found":
        raise NotFound("generation.not_found", "No such generation job.")
    return result


class ReviewDecision(BaseModel):
    action: Literal["approve", "drop", "edit"]
    question: dict[str, Any] | None = None


@router.post("/generations/{job_id}/review", operation_id="reviewGeneration")
async def review_generation(
    job_id: str, decisions: dict[str, ReviewDecision], svc: ServicesDep, caller: Caller = scoped("ai.review")
) -> GenerationStatus:
    snapshot = await svc.generation_graph.aget_state(generation.config_for(job_id))
    if not snapshot or not snapshot.values:
        raise NotFound("generation.not_found", "No such generation job.")
    if not snapshot.tasks or not any(t.interrupts for t in snapshot.tasks):
        raise Conflict("generation.not_in_review", "This job is not waiting for review.")
    state = await generation.resume_review(
        svc.generation_graph, job_id, {k: v.model_dump() for k, v in decisions.items()}
    )
    await svc.publisher.publish(
        {
            "type": "generation",
            "job_id": job_id,
            "status": "completed",
            "result": state["result"],
            "usage": UsageReport.model_validate({"calls": state.get("usage", [])}).summary(),
            "reviewed_by": caller.user_id,
        }
    )
    return GenerationStatus(job_id=job_id, status="completed", result=state["result"])


# ---- grading -----------------------------------------------------------------------------------


@router.post("/grade", operation_id="grade")
async def grade(body: grading.GradeRequest, svc: ServicesDep, caller: Caller = scoped("ai.grade")) -> dict[str, Any]:
    state = await grading.grade(svc.grading_graph, body)
    return {**state["result"], "usage": UsageReport.model_validate({"calls": state.get("usage", [])}).summary()}


# ---- tutor -------------------------------------------------------------------------------------


@router.post("/tutor/turn", operation_id="tutorTurn")
async def tutor_turn(
    body: tutor.TutorTurnRequest, svc: ServicesDep, caller: Caller = scoped("ai.tutor")
) -> EventSourceResponse:
    async def events() -> AsyncGenerator[dict[str, str]]:
        try:
            async for event in tutor.turn(svc.tutor_graph, body, caller.user_id, caller.mcp_token):
                yield {"event": event["type"], "data": json.dumps(event, default=str)}
        except Exception as exc:  # the stream ends with a typed error so .NET can refund unused quota
            log.exception("tutor_turn_failed", error_type=type(exc).__name__)
            code = getattr(exc, "code", "ai.turn_failed")
            yield {"event": "error", "data": json.dumps({"type": "error", "code": code})}

    return EventSourceResponse(events(), ping=15)


class SummariseRequest(BaseModel):
    previous_summary: str | None = Field(default=None, max_length=2000)
    turns: list[tutor.HistoryTurn] = Field(min_length=1, max_length=60)


@router.post("/tutor/summarise", operation_id="summariseConversation")
async def summarise(body: SummariseRequest, request: Request, caller: Caller = scoped("ai.tutor")) -> dict[str, Any]:
    prompts: PromptRegistry = request.app.state.prompts
    gateway: ModelGateway = request.app.state.gateway
    rendered = prompts.render(
        "summarise",
        previous_summary=body.previous_summary or "(none)",
        turns=wrap("student_message", "\n".join(f"{t.role}: {t.content}" for t in body.turns)),
    )
    completion = await gateway.complete(rendered.request(interactive=False))
    return {"summary": completion.text.strip()[:2000], "usage": UsageReport(calls=[completion.usage]).summary()}


# ---- students' notes ---------------------------------------------------------------------------


class NoteBody(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=400_000)


@router.put("/notes/{note_id}", operation_id="putNote")
async def put_note(
    note_id: str, body: NoteBody, svc: ServicesDep, caller: Caller = scoped("ai.notes")
) -> dict[str, Any]:
    pages = [normalise(p) for p in body.text.split("\f")]
    result = await svc.ingestor.ingest_private_note(caller.user_id, note_id, body.title, pages)
    return {"note_id": note_id, "chunks": result.chunks}


@router.delete("/notes/{note_id}", status_code=204, operation_id="deleteNote")
async def delete_note(note_id: str, svc: ServicesDep, caller: Caller = scoped("ai.notes")) -> None:
    await svc.ingestor.delete_private_note(caller.user_id, note_id)


@router.delete("/users/me/data", status_code=204, operation_id="deleteMyData")
async def delete_my_data(svc: ServicesDep, caller: Caller = scoped("ai.notes")) -> None:
    """Called by .NET when an account is deleted: removes the user's notes and embeddings."""
    await svc.ingestor.delete_user(caller.user_id)


def register(app: FastAPI) -> None:
    app.include_router(router)
