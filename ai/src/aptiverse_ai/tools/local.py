"""Tools that run inside the ai service: curriculum search and the maths checker."""

from __future__ import annotations

from typing import Any

from aptiverse_ai.retrieval.search import Filters, HybridRetriever
from aptiverse_ai.safety.untrusted import wrap
from aptiverse_ai.tools import mathcheck
from aptiverse_ai.tools.base import ToolContext, ToolResult


class SearchCurriculum:
    name = "search_curriculum"
    description = (
        "Search the South African curriculum (CAPS documents, past exam papers and memos, open textbooks) and, "
        "for university students who uploaded them, their own lecture notes. Use it before explaining a concept "
        "so the explanation matches the curriculum, and cite what you used. Returns up to 6 passages."
    )
    input_schema: dict[str, Any] = {  # noqa: RUF012 - read-only schema, satisfies the Tool protocol
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "What to look up, in plain words", "maxLength": 300},
            "subject": {"type": "string", "description": "Catalog subject key, for example life_sciences"},
            "grade": {"type": "integer", "minimum": 8, "maximum": 12},
        },
        "required": ["query"],
        "additionalProperties": False,
    }
    writes = False

    def __init__(self, retriever: HybridRetriever):
        self._retriever = retriever

    async def call(self, args: dict[str, Any], ctx: ToolContext) -> ToolResult:
        query = str(args.get("query", ""))[:300].strip()
        if not query:
            return ToolResult("query is required", is_error=True)
        grade = args.get("grade") if isinstance(args.get("grade"), int) else None
        hits = await self._retriever.search(
            query,
            Filters(subject=args.get("subject") or None, grade=grade),
            top_k=6,
            user_id=ctx.user_id,
            include_private=ctx.allow_private_notes,
        )
        if not hits:
            return ToolResult("No matching curriculum passages found.")
        blocks = []
        for i, h in enumerate(hits, start=1):
            tag = "student_notes" if h.private else "retrieved_source"
            blocks.append(wrap(tag, h.text, ref=f"S{i}", title=h.title, section=" > ".join(h.heading_path)))
        return ToolResult(
            "\n".join(blocks),
            untrusted=any(h.private for h in hits),
            citations=[{"ref": f"S{i}", **h.citation()} for i, h in enumerate(hits, start=1)],
        )


class CheckMath:
    name = "check_math"
    description = (
        "Check maths exactly instead of guessing. mode 'equivalent' compares two expressions or equations "
        "(use it to check a student's step or your own working); mode 'solve' solves an equation for a variable. "
        "Use plain syntax like 2x^2 + 3x - 5 = 0 or LaTeX like \\frac{1}{2}."
    )
    input_schema: dict[str, Any] = {  # noqa: RUF012 - read-only schema, satisfies the Tool protocol
        "type": "object",
        "properties": {
            "mode": {"type": "string", "enum": ["equivalent", "solve"]},
            "a": {"type": "string", "maxLength": 300},
            "b": {"type": "string", "maxLength": 300},
            "variable": {"type": "string", "pattern": "^[a-z]$"},
        },
        "required": ["mode", "a"],
        "additionalProperties": False,
    }
    writes = False

    async def call(self, args: dict[str, Any], ctx: ToolContext) -> ToolResult:
        mode, a = args.get("mode"), str(args.get("a", ""))
        if mode == "equivalent":
            check = mathcheck.equivalent(a, str(args.get("b", "")))
            verdict = {True: "equivalent", False: "not equivalent", None: "could not decide"}[check.result]
            return ToolResult(f"{verdict} ({check.detail})", is_error=check.result is None)
        if mode == "solve":
            solved = mathcheck.solve(a, str(args.get("variable") or "x"))
            if isinstance(solved, list):
                return ToolResult("solutions: " + (", ".join(solved) or "none"))
            return ToolResult(solved.detail, is_error=True)
        return ToolResult("mode must be 'equivalent' or 'solve'", is_error=True)
