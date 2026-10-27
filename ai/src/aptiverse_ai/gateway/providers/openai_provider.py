"""OpenAI models through the official SDK's Responses API.

Requests are written once in the Anthropic message shape (the gateway's lingua franca) and translated
here: system blocks become `instructions`, tool_use and tool_result blocks become function_call and
function_call_output items. OpenAI caches long prefixes automatically, so cache breakpoints are ignored;
its `input_tokens` includes cached tokens, which are split out so cost is not double counted.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

import openai
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

_RETRYABLE_STATUS = frozenset({408, 409, 429, 500, 502, 503, 504})
_EFFORT = {"low": "low", "medium": "medium", "high": "high", "xhigh": "high", "max": "high"}


def _input_items(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for message in messages:
        role = message["role"]
        content = message["content"]
        if isinstance(content, str):
            items.append({"role": role, "content": content})
            continue
        texts: list[str] = []
        for block in content:
            kind = block.get("type")
            if kind == "text":
                texts.append(block["text"])
            elif kind == "tool_use":
                items.append(
                    {
                        "type": "function_call",
                        "call_id": block["id"],
                        "name": block["name"],
                        "arguments": json.dumps(block["input"]),
                    }
                )
            elif kind == "tool_result":
                result = block.get("content", "")
                if isinstance(result, list):
                    result = "".join(part.get("text", "") for part in result)
                items.append({"type": "function_call_output", "call_id": block["tool_use_id"], "output": str(result)})
        if texts:
            items.append({"role": role, "content": "\n".join(texts)})
    return items


def build_params(request: ModelRequest, model: str) -> dict[str, Any]:
    params: dict[str, Any] = {
        "model": model,
        "input": _input_items(request.messages),
        "max_output_tokens": request.max_output_tokens,
        "store": False,  # nothing about students is kept on the provider side
    }
    if request.system:
        params["instructions"] = "\n\n".join(b.text for b in request.system)
    if request.tools:
        params["tools"] = [
            {
                "type": "function",
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t["input_schema"],
                "strict": False,
            }
            for t in request.tools
        ]
    if request.effort:
        params["reasoning"] = {"effort": _EFFORT[request.effort]}
    if request.user_id_hash:
        params["safety_identifier"] = request.user_id_hash
    return params


def to_completion(provider: str, model: str, request: ModelRequest, response: Any) -> Completion:
    texts: list[str] = []
    tool_uses: list[ToolUse] = []
    raw: list[dict[str, Any]] = []
    for item in response.output:
        if item.type == "message":
            for part in item.content:
                if part.type == "refusal":
                    raise Refused(None)
                if part.type == "output_text":
                    texts.append(part.text)
                    raw.append({"type": "text", "text": part.text})
        elif item.type == "function_call":
            args = json.loads(item.arguments or "{}")
            tool_uses.append(ToolUse(id=item.call_id, name=item.name, input=args))
            raw.append({"type": "tool_use", "id": item.call_id, "name": item.name, "input": args})
    usage = response.usage
    cached = (usage.input_tokens_details.cached_tokens or 0) if usage and usage.input_tokens_details else 0
    incomplete = getattr(response, "incomplete_details", None)
    stop = "tool_use" if tool_uses else ("max_tokens" if incomplete else "end_turn")
    return Completion(
        text="".join(texts),
        stop_reason=stop,
        usage=Usage(
            provider=provider,
            model=model,
            tier=request.tier,
            input_tokens=(usage.input_tokens - cached) if usage else 0,
            output_tokens=usage.output_tokens if usage else 0,
            cache_read_input_tokens=cached,
        ),
        tool_uses=tool_uses,
        raw_content=raw,
    )


def map_error(provider: str, exc: Exception) -> ProviderError:
    if isinstance(exc, openai.APIStatusError):
        header = exc.response.headers.get("retry-after")
        retry_after = float(header) if header and header.replace(".", "", 1).isdigit() else None
        return ProviderError(
            provider,
            f"status {exc.status_code}",
            retryable=exc.status_code in _RETRYABLE_STATUS,
            retry_after=retry_after,
        )
    if isinstance(exc, openai.APIConnectionError):
        return ProviderError(provider, type(exc).__name__, retryable=True)
    return ProviderError(provider, type(exc).__name__, retryable=False)


class OpenAIProvider:
    def __init__(self, client: openai.AsyncOpenAI | Any, name: str = "openai"):
        self.name = name
        self._client = client

    @classmethod
    def create(cls, api_key: str, *, connect_timeout: float, timeout: float) -> OpenAIProvider:
        client = openai.AsyncOpenAI(
            api_key=api_key, max_retries=0, timeout=openai.Timeout(timeout, connect=connect_timeout)
        )
        return cls(client)

    async def verify_models(self, models: list[str]) -> list[str]:
        """Returns configured model ids the account cannot see, so boot can fail loudly."""
        missing: list[str] = []
        for model in models:
            try:
                await self._client.models.retrieve(model)
            except openai.NotFoundError:
                missing.append(model)
        return missing

    async def complete(self, request: ModelRequest, model: str) -> Completion:
        try:
            response = await self._client.responses.create(**build_params(request, model))
        except openai.OpenAIError as exc:
            raise map_error(self.name, exc) from exc
        return to_completion(self.name, model, request, response)

    async def stream(self, request: ModelRequest, model: str) -> AsyncIterator[StreamEvent]:
        try:
            async with self._client.responses.stream(**build_params(request, model)) as stream:
                async for event in stream:
                    if event.type == "response.output_text.delta":
                        yield TextDelta(event.delta)
                response = await stream.get_final_response()
        except openai.OpenAIError as exc:
            raise map_error(self.name, exc) from exc
        yield StreamDone(to_completion(self.name, model, request, response))

    async def parse[T: BaseModel](
        self, request: ModelRequest, model: str, schema: type[T]
    ) -> tuple[T | None, Completion, str | None]:
        params = build_params(request, model)
        params.pop("tools", None)
        try:
            response = await self._client.responses.parse(**params, text_format=schema)
        except ValidationError as exc:
            empty = Completion(
                text="", stop_reason=None, usage=Usage(provider=self.name, model=model, tier=request.tier)
            )
            return None, empty, str(exc)
        except openai.OpenAIError as exc:
            raise map_error(self.name, exc) from exc
        completion = to_completion(self.name, model, request, response)
        parsed = response.output_parsed
        if parsed is None:
            return None, completion, "no parsed output"
        return parsed, completion, None

    async def count_tokens(self, request: ModelRequest, model: str) -> int:
        chars = sum(len(b.text) for b in request.system) + len(json.dumps(request.messages))
        return chars // 4

    async def aclose(self) -> None:
        await self._client.close()
