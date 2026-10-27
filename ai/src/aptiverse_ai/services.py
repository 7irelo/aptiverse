"""Composition: builds the retriever, graphs, tools, checkpointer and results publisher once at startup."""

from __future__ import annotations

import asyncio
import json
from collections.abc import Coroutine
from dataclasses import dataclass, field
from typing import Any, Protocol

import structlog
from fastapi import FastAPI
from psycopg import AsyncConnection
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from aptiverse_ai.graphs import grading, tutor
from aptiverse_ai.graphs.generation import graph as generation
from aptiverse_ai.retrieval.embeddings import Embedder, build_embedder
from aptiverse_ai.retrieval.ingest import Ingestor
from aptiverse_ai.retrieval.search import (
    CrossEncoderReranker,
    HybridRetriever,
    LexicalOverlapReranker,
    NoReranker,
    Reranker,
)
from aptiverse_ai.settings import Settings
from aptiverse_ai.tools.base import Tool
from aptiverse_ai.tools.local import CheckMath, SearchCurriculum

log = structlog.get_logger()


class ResultsPublisher(Protocol):
    async def publish(self, message: dict[str, Any]) -> None: ...


class SqsPublisher:
    """Long-run results go to SQS for the .NET Worker (Wolverine). The job id is the deduplication key."""

    def __init__(self, queue_url: str):
        import boto3

        self._queue_url = queue_url
        self._client: Any = boto3.client("sqs")

    async def publish(self, message: dict[str, Any]) -> None:
        body = json.dumps(message, default=str)
        await asyncio.to_thread(self._client.send_message, QueueUrl=self._queue_url, MessageBody=body)


@dataclass(slots=True)
class MemoryPublisher:
    messages: list[dict[str, Any]] = field(default_factory=list)

    async def publish(self, message: dict[str, Any]) -> None:
        self.messages.append(message)


class TaskRunner:
    """Background graph runs, at most one per key. Durability comes from the checkpointer: if this process
    dies, .NET retries the idempotent start call and the run resumes from its last checkpoint."""

    def __init__(self) -> None:
        self._tasks: dict[str, asyncio.Task[None]] = {}

    def start(self, key: str, coro: Coroutine[Any, Any, None]) -> bool:
        if key in self._tasks and not self._tasks[key].done():
            coro.close()
            return False
        task = asyncio.create_task(coro, name=key)
        self._tasks[key] = task
        task.add_done_callback(lambda _: self._tasks.pop(key, None))
        return True

    def running(self, key: str) -> bool:
        return key in self._tasks and not self._tasks[key].done()

    async def drain(self, timeout: float) -> None:
        if self._tasks:
            await asyncio.wait(list(self._tasks.values()), timeout=timeout)


@dataclass(slots=True)
class Services:
    embedder: Embedder
    retriever: HybridRetriever
    ingestor: Ingestor
    generation_graph: Any
    grading_graph: Any
    tutor_graph: Any
    publisher: ResultsPublisher
    runner: TaskRunner
    checkpoint_pool: AsyncConnectionPool[Any] | None = None

    async def aclose(self) -> None:
        await self.runner.drain(timeout=20.0)
        await self.embedder.aclose()
        if self.checkpoint_pool is not None:
            await self.checkpoint_pool.close()


def _reranker(settings: Settings) -> Reranker:
    if settings.rerank.provider == "cross-encoder":
        return CrossEncoderReranker(settings.rerank.model)
    if settings.rerank.provider == "none":
        return NoReranker()
    return LexicalOverlapReranker()


def checkpoint_pool(url: str) -> AsyncConnectionPool[Any]:
    # The LangGraph saver needs autocommit and no prepared statements; its tables live in the graph schema.
    return AsyncConnectionPool(
        url,
        connection_class=AsyncConnection,
        min_size=1,
        max_size=4,
        open=False,
        kwargs={"autocommit": True, "prepare_threshold": 0, "row_factory": dict_row, "options": "-c search_path=graph"},
    )


def build_services(app: FastAPI, settings: Settings, extras: dict[str, Any]) -> Services:
    embedder: Embedder = extras.get("embedder") or build_embedder(settings.embeddings)
    retriever = HybridRetriever(app.state.pool, embedder, _reranker(settings), candidates=settings.rerank.candidates)
    register = extras.get("register") or {}
    ingestor = Ingestor(app.state.pool, embedder, register)
    tools: dict[str, Tool] = {"search_curriculum": SearchCurriculum(retriever), "check_math": CheckMath()}
    if "mcp_tools" in extras:
        tools.update(extras["mcp_tools"])
    elif settings.aptiverse_mcp_url:
        from aptiverse_ai.tools.mcp_tools import pinned_tools

        tools.update(pinned_tools(settings.aptiverse_mcp_url))

    cp_pool = None
    checkpointer = extras.get("checkpointer")
    if checkpointer is None:
        from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

        cp_pool = checkpoint_pool(settings.database.dsn())
        checkpointer = AsyncPostgresSaver(conn=cp_pool)  # pyright: ignore[reportArgumentType]

    gateway, prompts = app.state.gateway, app.state.prompts
    publisher: ResultsPublisher = extras.get("publisher") or (
        SqsPublisher(settings.results_queue_url) if settings.results_queue_url else MemoryPublisher()
    )
    services = Services(
        embedder=embedder,
        retriever=retriever,
        ingestor=ingestor,
        generation_graph=generation.build_graph(
            generation.GenerationDeps(gateway=gateway, prompts=prompts, embedder=embedder, retriever=retriever),
            checkpointer,
        ),
        grading_graph=grading.build_graph(grading.GradingDeps(gateway=gateway, prompts=prompts), checkpointer),
        tutor_graph=tutor.build_graph(tutor.TutorDeps(gateway=gateway, prompts=prompts, tools=tools)),
        publisher=publisher,
        runner=TaskRunner(),
        checkpoint_pool=cp_pool,
    )
    if cp_pool is not None:
        asyncio.get_event_loop().create_task(cp_pool.open())
    return services
