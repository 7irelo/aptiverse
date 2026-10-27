"""Tool interface for the tutor agent.

Tools are narrow and typed, return short results the model can act on, and say whether their output is
untrusted (student-supplied content). Authorisation is never decided here: data tools call the `aptiverse`
MCP server with the student's own delegated token, so a tool can never see more than the student can.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol


@dataclass(slots=True)
class ToolResult:
    text: str
    is_error: bool = False
    untrusted: bool = False
    citations: list[dict[str, Any]] = field(default_factory=list)
    needs_confirmation: bool = False


@dataclass(frozen=True, slots=True)
class ToolContext:
    user_id: str
    stage: str
    allow_private_notes: bool
    confirmed: dict[str, Any] | None = None  # a write action the student confirmed in the UI
    mcp_token: str | None = field(default=None, repr=False)  # the student's delegated token, minted per turn by .NET


class Tool(Protocol):
    name: str
    description: str
    input_schema: dict[str, Any]
    writes: bool

    async def call(self, args: dict[str, Any], ctx: ToolContext) -> ToolResult: ...


def definition(tool: Tool) -> dict[str, Any]:
    return {"name": tool.name, "description": tool.description, "input_schema": tool.input_schema}
