"""Ingestion: parse, chunk, embed and store, idempotent on the document checksum.

A source without an entry in the licence register is refused. New documents land inactive; they go live
only after the retrieval eval passes with them included (AI-64)."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import structlog
from pydantic import BaseModel, Field

from aptiverse_ai.db import Pool, as_user
from aptiverse_ai.retrieval.chunking import Chunk, chunk_exam_paper, chunk_structured
from aptiverse_ai.retrieval.embeddings import Embedder

log = structlog.get_logger()

DocType = Literal["caps", "exam_paper", "memo", "exam_guideline", "textbook", "other"]


class SourceEntry(BaseModel):
    """One row of the licence register (`corpus/sources.yaml`)."""

    key: str
    title: str
    source: str
    url: str | None = None
    licence: str
    display_rule: Literal["display", "cite", "index_only"]
    doc_type: DocType
    subject: str | None = None
    grade: int | None = Field(default=None, ge=1, le=12)
    curriculum: str | None = "caps"
    year: int | None = None
    topic_ids: list[str] = Field(default_factory=list)
    checked_on: str


class UnregisteredSource(ValueError):
    pass


@dataclass(slots=True)
class IngestResult:
    document_id: str
    chunks: int
    skipped: bool


def read_pdf(path: Path) -> list[str]:
    import pymupdf

    with pymupdf.open(path) as doc:
        return [str(page.get_text("text")) for page in doc]


def chunk_for(entry: SourceEntry, pages: list[str]) -> list[Chunk]:
    if entry.doc_type in ("exam_paper", "memo"):
        return chunk_exam_paper(pages, title=entry.title)
    return chunk_structured(pages, title=entry.title)


def checksum(pages: list[str]) -> str:
    return hashlib.sha256("\f".join(pages).encode()).hexdigest()


class Ingestor:
    def __init__(self, pool: Pool, embedder: Embedder, register: dict[str, SourceEntry]):
        self._pool = pool
        self._embedder = embedder
        self._register = register

    async def ingest_pages(self, key: str, pages: list[str], *, activate: bool = False) -> IngestResult:
        entry = self._register.get(key)
        if entry is None:
            raise UnregisteredSource(f"{key} is not in the licence register")
        digest = checksum(pages)
        async with self._pool.connection() as conn:
            existing = await (
                await conn.execute("select id::text as id from rag.documents where checksum = %s", [digest])
            ).fetchone()
        if existing:
            return IngestResult(existing["id"], 0, skipped=True)
        chunks = chunk_for(entry, pages)
        vectors = await self._embedder.embed([f"{' > '.join(c.heading_path)}\n{c.text}" for c in chunks])
        async with self._pool.connection() as conn, conn.transaction():
            row = await (
                await conn.execute(
                    """insert into rag.documents (source, title, url, licence, display_rule, subject, grade, curriculum,
                                                 doc_type, year, checksum, active)
                       values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) returning id::text as id""",
                    [
                        entry.source,
                        entry.title,
                        entry.url,
                        entry.licence,
                        entry.display_rule,
                        entry.subject,
                        entry.grade,
                        entry.curriculum,
                        entry.doc_type,
                        entry.year,
                        digest,
                        activate,
                    ],
                )
            ).fetchone()
            assert row is not None
            async with conn.cursor() as cur:
                await cur.executemany(
                    """insert into rag.chunks (document_id, ordinal, heading_path, text, token_count, topic_ids, page,
                                               marks, has_figure, subject, grade, doc_type, embedding, embedding_model)
                       values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector, %s)""",
                    [
                        [
                            row["id"],
                            c.ordinal,
                            c.heading_path,
                            c.text,
                            c.token_estimate,
                            entry.topic_ids,
                            c.page,
                            c.marks,
                            c.has_figure,
                            entry.subject,
                            entry.grade,
                            entry.doc_type,
                            v,
                            self._embedder.model,
                        ]
                        for c, v in zip(chunks, vectors, strict=True)
                    ],
                )
        log.info("document_ingested", key=key, chunks=len(chunks), active=activate)
        return IngestResult(row["id"], len(chunks), skipped=False)

    async def activate(self, document_id: str) -> None:
        async with self._pool.connection() as conn:
            await conn.execute("update rag.documents set active = true where id = %s", [document_id])

    async def ingest_private_note(self, user_id: str, note_id: str, title: str, pages: list[str]) -> IngestResult:
        """A student's own notes. Stored under row-level security; replaces an earlier version of the note."""
        digest = checksum(pages)
        chunks = chunk_structured(pages, title=title)
        vectors = await self._embedder.embed([f"{' > '.join(c.heading_path)}\n{c.text}" for c in chunks])
        async with as_user(self._pool, user_id) as conn:
            await conn.execute("delete from rag.private_documents where note_id = %s", [note_id])
            row = await (
                await conn.execute(
                    "insert into rag.private_documents (user_id, note_id, title, checksum) values (%s, %s, %s, %s) "
                    "returning id::text as id",
                    [user_id, note_id, title, digest],
                )
            ).fetchone()
            assert row is not None
            async with conn.cursor() as cur:
                await cur.executemany(
                    """insert into rag.private_chunks (document_id, user_id, ordinal, heading_path, text, token_count,
                                                       page, embedding, embedding_model)
                       values (%s, %s, %s, %s, %s, %s, %s, %s::vector, %s)""",
                    [
                        [
                            row["id"],
                            user_id,
                            c.ordinal,
                            c.heading_path,
                            c.text,
                            c.token_estimate,
                            c.page,
                            v,
                            self._embedder.model,
                        ]
                        for c, v in zip(chunks, vectors, strict=True)
                    ],
                )
        return IngestResult(row["id"], len(chunks), skipped=False)

    async def delete_private_note(self, user_id: str, note_id: str) -> int:
        async with as_user(self._pool, user_id) as conn:
            cur = await conn.execute("delete from rag.private_documents where note_id = %s", [note_id])
            return cur.rowcount

    async def delete_user(self, user_id: str) -> int:
        async with as_user(self._pool, user_id) as conn:
            cur = await conn.execute("delete from rag.private_documents")
            return cur.rowcount
