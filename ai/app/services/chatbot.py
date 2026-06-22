"""Chatbot — the ONLY LLM surface, on OpenAI (ChatGPT).

Retrieval-augmented over the student's OWN analytics (mastery, gaps, tips). Only
the user's question plus a bounded, redacted context is sent to OpenAI — never a
raw PII dump. Phase-4 builder agent implements retrieval + the system prompt.
"""

from __future__ import annotations

from openai import AsyncOpenAI

from app.core.config import get_settings
from app.core.logging import get_logger

log = get_logger(__name__)

_SYSTEM = (
    "You are Aptiverse's study companion for South African NSC/IEB students. "
    "Be concise, encouraging, and curriculum-aware. Use the student's own "
    "analytics context when provided. Never invent marks or progress."
)


async def answer(user_id: str, message: str) -> str:
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key)

    # TODO(phase4): retrieve bounded context for user_id (mastery/gaps/tips),
    # enforce a per-user quota, and redact PII before sending.
    context = ""

    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": _SYSTEM + context},
            {"role": "user", "content": message},
        ],
    )
    return resp.choices[0].message.content or ""
