from __future__ import annotations

import os
from typing import Any, TypedDict

import pytest
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import END, START, StateGraph
from psycopg import AsyncConnection

from aptiverse_ai.cli import _purge_checkpoints  # pyright: ignore[reportPrivateUsage]

pytestmark = pytest.mark.integration


class S(TypedDict):
    n: int


async def inc(s: S) -> dict[str, Any]:
    return {"n": s["n"] + 1}


async def test_purge_removes_old_checkpoint_threads(
    postgres_urls: tuple[str, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    owner, _ = postgres_urls
    async with await AsyncConnection.connect(owner, autocommit=True) as conn:
        await conn.execute("create schema if not exists graph")
    async with await AsyncConnection.connect(
        owner, autocommit=True, prepare_threshold=0, options="-c search_path=graph"
    ) as conn:
        saver = AsyncPostgresSaver(conn)  # pyright: ignore[reportArgumentType]
        await saver.setup()
        g = StateGraph(S)
        g.add_node("inc", inc)  # type: ignore[arg-type]  # LangGraph overloads do not narrow a TypedDict input
        g.add_edge(START, "inc")
        g.add_edge("inc", END)
        graph = g.compile(checkpointer=saver)
        await graph.ainvoke({"n": 1}, {"configurable": {"thread_id": "generation:old"}})
    monkeypatch.setenv("AI__DATABASE__URL", owner)
    for key in [k for k in os.environ if k.startswith("AI__DATABASE__") and k != "AI__DATABASE__URL"]:
        monkeypatch.delenv(key)
    assert await _purge_checkpoints(days=30) == 0  # fresh threads are kept
    assert await _purge_checkpoints(days=0) == 1
    async with await AsyncConnection.connect(owner) as conn:
        row = await (await conn.execute("select count(*) from graph.checkpoints")).fetchone()
    assert row == (0,)
