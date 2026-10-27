from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Protocol

from pydantic import BaseModel

from aptiverse_ai.gateway.types import Completion, ModelRequest, StreamEvent


class Provider(Protocol):
    """One way of reaching a model family. The gateway owns retries, failover, cost and tracing;
    a provider only translates a request and maps its errors to `ProviderError`."""

    name: str

    async def complete(self, request: ModelRequest, model: str) -> Completion: ...

    def stream(self, request: ModelRequest, model: str) -> AsyncIterator[StreamEvent]: ...

    async def parse[T: BaseModel](
        self, request: ModelRequest, model: str, schema: type[T]
    ) -> tuple[T | None, Completion, str | None]:
        """Returns the parsed object (or None) plus the completion and, on failure, the validation errors."""
        ...

    async def count_tokens(self, request: ModelRequest, model: str) -> int: ...

    async def aclose(self) -> None: ...
