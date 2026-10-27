"""Claude through the official Anthropic SDK: the first-party API, or Bedrock through the Mantle client.

Both clients expose the same `messages` surface, so one class serves both. Sampling parameters
(temperature, top_p, top_k) are deliberately not part of the request: current models reject them.
Forced tool choice is also never sent (it is a 400 on the current Sonnet and Opus); structured output
goes through `messages.parse` with a Pydantic schema instead.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

import anthropic
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

_RETRYABLE_STATUS = frozenset({408, 409, 429, 500, 502, 503, 504, 529})


def build_params(request: ModelRequest, model: str) -> dict[str, Any]:
    params: dict[str, Any] = {
        "model": model,
        "max_tokens": request.max_output_tokens,
        "messages": request.messages,
    }
    if request.system:
        params["system"] = [
            {"type": "text", "text": b.text, **({"cache_control": {"type": "ephemeral"}} if b.cache else {})}
            for b in request.system
        ]
    if request.tools:
        params["tools"] = request.tools
    if request.effort:
        params["output_config"] = {"effort": request.effort}
    if request.user_id_hash:
        params["metadata"] = {"user_id": request.user_id_hash}
    return params


def _usage(provider: str, model: str, request: ModelRequest, raw: Any) -> Usage:
    u = raw.usage
    return Usage(
        provider=provider,
        model=model,
        tier=request.tier,
        input_tokens=u.input_tokens or 0,
        output_tokens=u.output_tokens or 0,
        cache_read_input_tokens=getattr(u, "cache_read_input_tokens", 0) or 0,
        cache_creation_input_tokens=getattr(u, "cache_creation_input_tokens", 0) or 0,
    )


def to_completion(provider: str, model: str, request: ModelRequest, message: Any) -> Completion:
    if message.stop_reason == "refusal":
        details = getattr(message, "stop_details", None)
        raise Refused(getattr(details, "category", None))
    texts: list[str] = []
    tool_uses: list[ToolUse] = []
    raw: list[dict[str, Any]] = []
    for block in message.content:
        raw.append(block.model_dump(mode="json", exclude_none=True))
        if block.type == "text":
            texts.append(block.text)
        elif block.type == "tool_use":
            tool_uses.append(ToolUse(id=block.id, name=block.name, input=dict(block.input)))
    return Completion(
        text="".join(texts),
        stop_reason=message.stop_reason,
        usage=_usage(provider, model, request, message),
        tool_uses=tool_uses,
        raw_content=raw,
    )


def map_error(provider: str, exc: Exception) -> ProviderError:
    if isinstance(exc, anthropic.APIStatusError):
        retry_after: float | None = None
        header = exc.response.headers.get("retry-after")
        if header:
            try:
                retry_after = float(header)
            except ValueError:
                retry_after = None
        return ProviderError(
            provider,
            f"status {exc.status_code}",
            retryable=exc.status_code in _RETRYABLE_STATUS,
            retry_after=retry_after,
        )
    if isinstance(exc, anthropic.APIConnectionError):  # includes APITimeoutError
        return ProviderError(provider, type(exc).__name__, retryable=True)
    return ProviderError(provider, type(exc).__name__, retryable=False)


class AnthropicProvider:
    def __init__(self, name: str, client: anthropic.AsyncAnthropic | Any):
        self.name = name
        self._client = client

    @classmethod
    def first_party(cls, api_key: str, *, connect_timeout: float, timeout: float) -> AnthropicProvider:
        client = anthropic.AsyncAnthropic(
            api_key=api_key,
            max_retries=0,  # the gateway retries and fails over; SDK retries would double count
            timeout=anthropic.Timeout(timeout, connect=connect_timeout),
        )
        return cls("anthropic", client)

    @classmethod
    def bedrock(cls, region: str, *, connect_timeout: float, timeout: float) -> AnthropicProvider:
        from anthropic.lib.bedrock._mantle import AsyncAnthropicBedrockMantle

        client = AsyncAnthropicBedrockMantle(
            aws_region=region,
            max_retries=0,
            timeout=anthropic.Timeout(timeout, connect=connect_timeout),
        )
        return cls("bedrock", client)

    async def complete(self, request: ModelRequest, model: str) -> Completion:
        try:
            message = await self._client.messages.create(**build_params(request, model))
        except anthropic.AnthropicError as exc:
            raise map_error(self.name, exc) from exc
        return to_completion(self.name, model, request, message)

    async def stream(self, request: ModelRequest, model: str) -> AsyncIterator[StreamEvent]:
        try:
            async with self._client.messages.stream(**build_params(request, model)) as stream:
                async for text in stream.text_stream:
                    yield TextDelta(text)
                message = await stream.get_final_message()
        except anthropic.AnthropicError as exc:
            raise map_error(self.name, exc) from exc
        yield StreamDone(to_completion(self.name, model, request, message))

    async def parse[T: BaseModel](
        self, request: ModelRequest, model: str, schema: type[T]
    ) -> tuple[T | None, Completion, str | None]:
        try:
            message = await self._client.messages.parse(**build_params(request, model), output_format=schema)
        except ValidationError as exc:
            # The SDK validated and failed; there is no message to cost, so report a zero-usage completion.
            empty = Completion(
                text="", stop_reason=None, usage=Usage(provider=self.name, model=model, tier=request.tier)
            )
            return None, empty, str(exc)
        except anthropic.AnthropicError as exc:
            raise map_error(self.name, exc) from exc
        completion = to_completion(self.name, model, request, message)
        parsed = message.parsed_output
        if parsed is None:
            return None, completion, "no parsed output"
        return parsed, completion, None

    async def count_tokens(self, request: ModelRequest, model: str) -> int:
        params = build_params(request, model)
        params.pop("max_tokens", None)
        params.pop("metadata", None)
        try:
            result = await self._client.messages.count_tokens(**params)
        except anthropic.AnthropicError as exc:
            raise map_error(self.name, exc) from exc
        return int(result.input_tokens)

    async def aclose(self) -> None:
        await self._client.close()
