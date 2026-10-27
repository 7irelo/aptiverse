from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

from pydantic import BaseModel, Field

from aptiverse_ai.settings import Tier

Effort = Literal["low", "medium", "high", "xhigh", "max"]


class Usage(BaseModel):
    """Tokens and cost of one model call. Returned to .NET so it confirms quota with real numbers."""

    provider: str
    model: str
    tier: Tier
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 0
    cost_usd_micros: int = 0
    batch: bool = False


class UsageReport(BaseModel):
    calls: list[Usage] = Field(default_factory=list)

    @property
    def cost_usd_micros(self) -> int:
        return sum(c.cost_usd_micros for c in self.calls)

    def add(self, usage: Usage | UsageReport) -> None:
        if isinstance(usage, UsageReport):
            self.calls.extend(usage.calls)
        else:
            self.calls.append(usage)

    def summary(self) -> dict[str, Any]:
        return {
            "calls": len(self.calls),
            "input_tokens": sum(c.input_tokens for c in self.calls),
            "output_tokens": sum(c.output_tokens for c in self.calls),
            "cache_read_input_tokens": sum(c.cache_read_input_tokens for c in self.calls),
            "cache_creation_input_tokens": sum(c.cache_creation_input_tokens for c in self.calls),
            "cost_usd_micros": self.cost_usd_micros,
        }


@dataclass(frozen=True, slots=True)
class SystemBlock:
    """A system prompt block. `cache` marks the end of a stable prefix (a cache breakpoint)."""

    text: str
    cache: bool = False


@dataclass(slots=True)
class ModelRequest:
    use_case: str
    tier: Tier
    messages: list[dict[str, Any]]
    system: list[SystemBlock] = field(default_factory=list)
    max_output_tokens: int = 4096
    tools: list[dict[str, Any]] | None = None
    effort: Effort | None = None
    prompt_id: str | None = None
    prompt_version: int | None = None
    user_id_hash: str | None = None
    # Interactive calls wait less in the queue and are never shed in favour of offline work.
    interactive: bool = True


@dataclass(slots=True)
class ToolUse:
    id: str
    name: str
    input: dict[str, Any]


@dataclass(slots=True)
class Completion:
    text: str
    stop_reason: str | None
    usage: Usage
    tool_uses: list[ToolUse] = field(default_factory=list)
    raw_content: list[dict[str, Any]] = field(default_factory=list)


@dataclass(slots=True)
class TextDelta:
    text: str


@dataclass(slots=True)
class StreamDone:
    completion: Completion


StreamEvent = TextDelta | StreamDone
