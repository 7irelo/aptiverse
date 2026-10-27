"""Tools served by the `aptiverse` MCP server (in the .NET API), called with the student's delegated token.

The server enforces scopes, ownership, entitlements and the block during an active attempt; this client
only forwards. Write tools need the student's confirmation first: without it the tool returns a proposal
the UI shows, and nothing is created. Tool names are allowlisted so a changed or poisoned server
description cannot add capabilities.
"""

from __future__ import annotations

import json
from typing import Any

import httpx2
from mcp.client.client import Client
from mcp.client.streamable_http import streamable_http_client

from aptiverse_ai.tools.base import Tool, ToolContext, ToolResult

READ_TOOLS = frozenset({"get_topic_mastery", "list_upcoming_assessments", "get_attempt_mistakes"})
WRITE_TOOLS = frozenset({"create_practice_quiz"})
ALLOWED = READ_TOOLS | WRITE_TOOLS


class McpTool:
    def __init__(self, name: str, description: str, input_schema: dict[str, Any], url: str, timeout: float):
        self.name = name
        self.description = description
        self.input_schema = input_schema
        self.writes = name in WRITE_TOOLS
        self._url = url
        self._timeout = timeout

    async def call(self, args: dict[str, Any], ctx: ToolContext) -> ToolResult:
        if self.writes and not (ctx.confirmed and ctx.confirmed.get("tool") == self.name):
            return ToolResult(
                json.dumps({"proposal": {"tool": self.name, "arguments": args}}),
                needs_confirmation=True,
            )
        if not ctx.mcp_token:
            return ToolResult(f"{self.name} is unavailable (no delegated token for this turn).", is_error=True)
        if self.writes and ctx.confirmed:
            args = dict(ctx.confirmed.get("arguments") or args)
        try:
            result = await call_remote(self._url, ctx.mcp_token, self.name, args, self._timeout)
        except Exception as exc:  # network or protocol failure: tell the model, do not end the turn
            return ToolResult(f"{self.name} is unavailable right now ({type(exc).__name__}).", is_error=True)
        text = "\n".join(getattr(part, "text", "") for part in result.content if getattr(part, "type", "") == "text")
        return ToolResult(text[:6000] or "(no result)", is_error=bool(result.is_error))


async def call_remote(url: str, token: str, name: str, args: dict[str, Any], timeout: float) -> Any:
    async with (
        httpx2.AsyncClient(headers={"Authorization": f"Bearer {token}"}, timeout=timeout) as http,
        Client(streamable_http_client(url, http_client=http), read_timeout_seconds=timeout) as client,
    ):
        return await client.call_tool(name, args)


async def discover(url: str, token: str, *, timeout: float = 5.0) -> list[Tool]:
    """Reads tool schemas once at startup with a service token; per-call tokens are the student's."""
    async with (
        httpx2.AsyncClient(headers={"Authorization": f"Bearer {token}"}, timeout=timeout) as http,
        Client(streamable_http_client(url, http_client=http), read_timeout_seconds=timeout) as client,
    ):
        listed = await client.list_tools()
    return [
        McpTool(t.name, t.description or "", dict(t.input_schema), url, timeout)
        for t in listed.tools
        if t.name in ALLOWED
    ]


_OBJ: dict[str, Any] = {"type": "object", "additionalProperties": False}
PINNED: dict[str, tuple[str, dict[str, Any]]] = {
    "get_topic_mastery": (
        "The student's measured mastery per topic (0 to 1) with the number of answered questions behind each "
        "value. Use before saying anything about their strengths or weak topics.",
        {**_OBJ, "properties": {"subject": {"type": "string", "maxLength": 60}}},
    ),
    "list_upcoming_assessments": (
        "The student's upcoming tests, assignments and exams (title, subject, date). Use for planning help and "
        "to recognise graded work.",
        {**_OBJ, "properties": {"days": {"type": "integer", "minimum": 1, "maximum": 90}}},
    ),
    "get_attempt_mistakes": (
        "Questions the student got wrong in recent practice, with the topic and what was expected. Use to target "
        "explanations at real mistakes.",
        {
            **_OBJ,
            "properties": {
                "subject": {"type": "string", "maxLength": 60},
                "limit": {"type": "integer", "minimum": 1, "maximum": 10},
            },
        },
    ),
    "create_practice_quiz": (
        "Create a short practice quiz for the student on given topics. Needs the student's confirmation first; "
        "without it you get a proposal to show them.",
        {
            **_OBJ,
            "properties": {
                "subject": {"type": "string", "maxLength": 60},
                "topics": {
                    "type": "array",
                    "items": {"type": "string", "maxLength": 120},
                    "minItems": 1,
                    "maxItems": 5,
                },
                "question_count": {"type": "integer", "minimum": 3, "maximum": 10},
            },
            "required": ["subject", "topics"],
        },
    ),
}


def pinned_tools(url: str, *, timeout: float = 5.0) -> dict[str, Tool]:
    """Tool definitions pinned in code (not taken from the server at runtime), so a changed or compromised
    server description cannot widen what the model is told a tool does. The contract test in the .NET Mcp
    module checks the server still matches these names and schemas."""
    return {name: McpTool(name, desc, schema, url, timeout) for name, (desc, schema) in PINNED.items()}
