from __future__ import annotations

import json

import pytest
from mcp.client.client import Client

from aptiverse_ai.db import Pool
from aptiverse_ai.mcp_curriculum.server import build_server
from aptiverse_ai.retrieval.embeddings import HashEmbedder
from aptiverse_ai.retrieval.ingest import Ingestor, SourceEntry

pytestmark = pytest.mark.integration

REGISTER = {
    "ls": SourceEntry(
        key="ls",
        title="Life Sciences Grade 11",
        source="test",
        licence="CC BY",
        display_rule="display",
        doc_type="caps",
        subject="life_sciences",
        grade=11,
        checked_on="2026-10-27",
    ),
    "paper": SourceEntry(
        key="paper",
        title="LS P1 2024",
        source="DBE",
        licence="DBE terms",
        display_rule="index_only",
        doc_type="exam_paper",
        subject="life_sciences",
        grade=11,
        checked_on="2026-10-27",
    ),
}


async def _seed(pool: Pool) -> None:
    ingestor = Ingestor(pool, HashEmbedder(384), REGISTER)
    for key, text in (
        (
            "ls",
            "TOPIC: PHOTOSYNTHESIS\n1.1 Process\nPlants use light to make glucose.\n"
            "1.2 Rate\nLight intensity limits the rate.",
        ),
        ("paper", "QUESTION 1\n1.1 Describe how light intensity affects photosynthesis. (4)"),
    ):
        result = await ingestor.ingest_pages(key, [text])
        await ingestor.activate(result.document_id)


async def test_tools_are_listed_and_search_returns_licensed_text(app_pool: Pool) -> None:
    await _seed(app_pool)
    async with Client(build_server(app_pool, HashEmbedder(384))) as client:
        tools = {t.name for t in (await client.list_tools()).tools}
        assert tools == {"search_curriculum", "get_topic_outline", "find_past_paper_questions"}
        result = await client.call_tool("search_curriculum", {"query": "light intensity photosynthesis rate"})
        hits = (
            json.loads(getattr(result.content[0], "text", "[]"))
            if result.structured_content is None
            else result.structured_content["result"]
        )
        assert hits
        assert all("licence" in h for h in hits)
        outline = await client.call_tool("get_topic_outline", {"subject": "life_sciences", "grade": 11})
        assert not outline.is_error


async def test_index_only_sources_return_a_reference_not_the_text(app_pool: Pool) -> None:
    await _seed(app_pool)
    async with Client(build_server(app_pool, HashEmbedder(384))) as client:
        result = await client.call_tool(
            "find_past_paper_questions", {"topic": "light intensity", "subject": "life_sciences"}
        )
        hits = (
            result.structured_content["result"]
            if result.structured_content
            else json.loads(getattr(result.content[0], "text", "[]"))
        )
        assert hits
        assert all(h["text"] is None for h in hits)


async def test_input_limits_are_enforced(app_pool: Pool) -> None:
    async with Client(build_server(app_pool, HashEmbedder(384))) as client:
        result = await client.call_tool("search_curriculum", {"query": "x" * 1000})
        assert result.is_error
