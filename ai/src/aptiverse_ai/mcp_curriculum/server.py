"""The `curriculum` MCP server: read-only search over public South African curriculum content.

It holds no user data, so it can be published. It is not mounted inside the internal ai service (the tutor
calls search directly); it runs standalone over stdio for local clients or Streamable HTTP for hosting.
Every result carries its source and licence, and sources registered as index-only return a reference
instead of their text.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from typing import Annotated, Any

from mcp.server.mcpserver import MCPServer
from pydantic import Field

from aptiverse_ai.db import Pool, create_pool, sql
from aptiverse_ai.retrieval.embeddings import Embedder, build_embedder
from aptiverse_ai.retrieval.search import Filters, Hit, HybridRetriever, LexicalOverlapReranker

INSTRUCTIONS = (
    "Search South African school curriculum content: CAPS policy documents, NSC exam papers and memos, and "
    "open textbooks. Use search_curriculum for explanations, get_topic_outline to see what a subject covers "
    "in a grade, and find_past_paper_questions for exam-style practice. Cite the source and page you used."
)


def _render(hit: Hit, index: int) -> dict[str, Any]:
    body: dict[str, Any] = {
        "ref": f"S{index}",
        "title": hit.title,
        "section": " > ".join(hit.heading_path),
        "page": hit.page,
        "licence": hit.licence,
    }
    if hit.display_rule == "index_only":
        body["text"] = None
        body["note"] = "This source may be cited but not reproduced; open the original document."
    else:
        body["text"] = hit.text
    return body


def build_server(pool: Pool, embedder: Embedder) -> MCPServer:
    retriever = HybridRetriever(pool, embedder, LexicalOverlapReranker(), candidates=40)
    server = MCPServer(
        name="aptiverse-curriculum", title="South African curriculum search", instructions=INSTRUCTIONS, version="1.0.0"
    )

    @server.tool(
        annotations=None,
        description=(
            "Search curriculum documents, exam papers and textbooks. "
            "Returns up to 8 passages with source, page and licence."
        ),
    )
    async def search_curriculum(  # pyright: ignore[reportUnusedFunction]
        query: Annotated[str, Field(min_length=2, max_length=300, description="What to look up")],
        subject: Annotated[
            str | None, Field(max_length=60, description="Subject key, for example life_sciences")
        ] = None,
        grade: Annotated[int | None, Field(ge=8, le=12)] = None,
        limit: Annotated[int, Field(ge=1, le=8)] = 6,
    ) -> list[dict[str, Any]]:
        hits = await retriever.search(query, Filters(subject=subject, grade=grade), top_k=limit)
        return [_render(h, i) for i, h in enumerate(hits, start=1)]

    @server.tool(description="List the topic headings a CAPS subject covers in a grade, in document order.")
    async def get_topic_outline(  # pyright: ignore[reportUnusedFunction]
        subject: Annotated[str, Field(max_length=60)],
        grade: Annotated[int, Field(ge=8, le=12)],
    ) -> list[str]:
        async with pool.connection() as conn:
            rows = await (
                await conn.execute(
                    sql(
                        "select c.heading_path, min(c.ordinal) as first from rag.chunks c "
                        "join rag.documents d on d.id = c.document_id "
                        "where d.active and c.doc_type = 'caps' and c.subject = %s and c.grade = %s "
                        "group by c.heading_path order by first limit 300"
                    ),
                    [subject, grade],
                )
            ).fetchall()
        return [" > ".join(r["heading_path"][1:]) for r in rows if len(r["heading_path"]) > 1]

    @server.tool(
        description="Find exam-style questions on a topic from NSC past papers, with their memo where available."
    )
    async def find_past_paper_questions(  # pyright: ignore[reportUnusedFunction]
        topic: Annotated[str, Field(min_length=2, max_length=200)],
        subject: Annotated[str | None, Field(max_length=60)] = None,
        grade: Annotated[int | None, Field(ge=10, le=12)] = None,
    ) -> list[dict[str, Any]]:
        hits = await retriever.search(
            topic, Filters(subject=subject, grade=grade, doc_types=("exam_paper", "memo")), top_k=8
        )
        return [_render(h, i) for i, h in enumerate(hits, start=1)]

    return server


async def _main(argv: list[str]) -> None:
    from aptiverse_ai.settings import DatabaseSettings, EmbeddingSettings

    parser = argparse.ArgumentParser(prog="aptiverse-curriculum-mcp")
    parser.add_argument("--transport", choices=["stdio", "http"], default="stdio")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args(argv)
    import os

    prefix = "AI__DATABASE__"
    db = DatabaseSettings.model_validate(
        {k[len(prefix) :].lower(): v for k, v in os.environ.items() if k.startswith(prefix)}
    )
    pool = create_pool(db)
    await pool.open()
    embedder = build_embedder(EmbeddingSettings.model_validate_json(os.environ.get("AI__EMBEDDINGS", "{}")))
    server = build_server(pool, embedder)
    try:
        if args.transport == "stdio":
            await server.run_stdio_async()
        else:
            import uvicorn

            app = server.streamable_http_app(stateless_http=True, json_response=True, host=args.host)
            await uvicorn.Server(uvicorn.Config(app, host=args.host, port=args.port)).serve()
    finally:
        await pool.close()


def main() -> None:
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # pyright: ignore[reportDeprecated]
    asyncio.run(_main(sys.argv[1:]))


if __name__ == "__main__":
    main()
