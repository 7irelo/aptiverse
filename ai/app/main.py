"""FastAPI control surface.

Deliberately thin: health, a manual job trigger (ops/backfill), and the chatbot
proxy. The real work happens in the Arq worker (app/worker.py) and the scheduler
(app/scheduler.py). Analytics services never expose HTTP — they read signals and
write projection tables.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.core.logging import configure_logging, get_logger
from app.services import REGISTRY

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    log.info("ai.startup", services=sorted(REGISTRY))
    yield
    log.info("ai.shutdown")


app = FastAPI(title="Aptiverse AI", version="0.1.0", lifespan=lifespan)


@app.get("/health")
async def health() -> dict[str, object]:
    return {"status": "ok", "services": sorted(REGISTRY)}


class TriggerRequest(BaseModel):
    user_id: str | None = None  # None => batch over all students (backfill)


@app.post("/trigger/{service}")
async def trigger(service: str, body: TriggerRequest) -> dict[str, object]:
    """Manually run an analytics service (ops / backfill). Normally these run on
    a schedule or via outbox events, not HTTP."""
    if service not in REGISTRY:
        raise HTTPException(404, f"unknown service: {service}")
    result = await REGISTRY[service].run(user_id=body.user_id)
    return {"service": service, "result": result}


class ChatRequest(BaseModel):
    user_id: str
    message: str


@app.post("/chat")
async def chat(body: ChatRequest) -> dict[str, str]:
    """The one LLM surface. Implemented by app/services/chatbot.py against OpenAI."""
    from app.services.chatbot import answer

    reply = await answer(user_id=body.user_id, message=body.message)
    return {"reply": reply}
