"""Deterministic, scriptable provider for tests, fixtures and local runs without a key."""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel, ValidationError

from aptiverse_ai.gateway.errors import ProviderError, Refused
from aptiverse_ai.gateway.types import (
    Completion,
    ModelRequest,
    StreamDone,
    StreamEvent,
    TextDelta,
    ToolUse,
    Usage,
)


@dataclass(slots=True)
class FakeReply:
    text: str = ""
    parsed: dict[str, Any] | BaseModel | None = None
    tool_uses: list[ToolUse] = field(default_factory=list)
    error: ProviderError | None = None
    refuse: bool = False
    delay: float = 0.0
    fail_mid_stream: bool = False
    stop_reason: str = "end_turn"
    input_tokens: int = 100
    output_tokens: int = 50
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 0


Responder = Callable[[ModelRequest, str], FakeReply]


class FakeProvider:
    def __init__(
        self, name: str = "fake", *, script: list[FakeReply] | None = None, responder: Responder | None = None
    ):
        self.name = name
        self.script = list(script or [])
        self.responder = responder
        self.calls: list[tuple[ModelRequest, str]] = []

    def _next(self, request: ModelRequest, model: str) -> FakeReply:
        self.calls.append((request, model))
        if self.script:
            return self.script.pop(0)
        if self.responder:
            return self.responder(request, model)
        last = request.messages[-1]["content"] if request.messages else ""
        text = last if isinstance(last, str) else json.dumps(last)[:200]
        return FakeReply(text=f"echo: {text}")

    def _completion(self, request: ModelRequest, model: str, reply: FakeReply, text: str | None = None) -> Completion:
        if reply.refuse:
            raise Refused("test")
        if reply.text:
            body = reply.text
        elif isinstance(reply.parsed, BaseModel):
            body = reply.parsed.model_dump_json()
        elif reply.parsed is not None:
            body = json.dumps(reply.parsed)
        else:
            body = ""
        return Completion(
            text=text if text is not None else body,
            stop_reason="tool_use" if reply.tool_uses else reply.stop_reason,
            usage=Usage(
                provider=self.name,
                model=model,
                tier=request.tier,
                input_tokens=reply.input_tokens,
                output_tokens=reply.output_tokens,
                cache_read_input_tokens=reply.cache_read_input_tokens,
                cache_creation_input_tokens=reply.cache_creation_input_tokens,
            ),
            tool_uses=list(reply.tool_uses),
            raw_content=(
                ([{"type": "text", "text": body}] if body else [])
                + [{"type": "tool_use", "id": t.id, "name": t.name, "input": t.input} for t in reply.tool_uses]
            ),
        )

    async def complete(self, request: ModelRequest, model: str) -> Completion:
        reply = self._next(request, model)
        if reply.delay:
            await asyncio.sleep(reply.delay)
        if reply.error:
            raise reply.error
        return self._completion(request, model, reply)

    async def stream(self, request: ModelRequest, model: str) -> AsyncIterator[StreamEvent]:
        reply = self._next(request, model)
        if reply.delay:
            await asyncio.sleep(reply.delay)
        if reply.error:
            raise reply.error
        completion = self._completion(request, model, reply)
        words = completion.text.split(" ")
        for i, word in enumerate(words):
            if reply.fail_mid_stream and i == max(1, len(words) // 2):
                raise ProviderError(self.name, "stream broke", retryable=True)
            yield TextDelta(word if i == 0 else f" {word}")
            await asyncio.sleep(0)
        yield StreamDone(completion)

    async def parse[T: BaseModel](
        self, request: ModelRequest, model: str, schema: type[T]
    ) -> tuple[T | None, Completion, str | None]:
        reply = self._next(request, model)
        if reply.delay:
            await asyncio.sleep(reply.delay)
        if reply.error:
            raise reply.error
        completion = self._completion(request, model, reply)
        try:
            if isinstance(reply.parsed, schema):
                return reply.parsed, completion, None
            data: Any = (
                (reply.parsed.model_dump() if isinstance(reply.parsed, BaseModel) else reply.parsed)
                if reply.parsed is not None
                else json.loads(reply.text)
            )
            return schema.model_validate(data), completion, None
        except (ValidationError, json.JSONDecodeError) as exc:
            return None, completion, str(exc)

    async def count_tokens(self, request: ModelRequest, model: str) -> int:
        chars = sum(len(b.text) for b in request.system) + len(json.dumps(request.messages))
        return chars // 4

    async def aclose(self) -> None:
        return None
