"""Hybrid retrieval: dense (pgvector HNSW) and lexical (Postgres full-text) legs, fused with reciprocal
rank fusion, then reranked. Each leg is measured on its own in the retrieval eval so a regression can be
pinned to the stage that caused it."""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field
from typing import Any, Protocol

from aptiverse_ai.db import Pool, as_user, sql
from aptiverse_ai.retrieval.embeddings import Embedder

_WORD = re.compile(r"[a-z0-9]+")


@dataclass(frozen=True, slots=True)
class Filters:
    subject: str | None = None
    grade: int | None = None
    doc_types: tuple[str, ...] = ()
    topic_ids: tuple[str, ...] = ()


@dataclass(slots=True)
class Hit:
    chunk_id: str
    text: str
    heading_path: list[str]
    document_id: str
    title: str
    source: str
    licence: str
    display_rule: str
    page: int | None
    private: bool = False
    score: float = 0.0
    ranks: dict[str, int] = field(default_factory=dict)

    def citation(self) -> dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "title": self.title,
            "page": self.page,
            "heading_path": self.heading_path,
            "licence": self.licence,
            "display_rule": self.display_rule,
            "private": self.private,
        }


def rrf(rankings: dict[str, list[str]], *, k: int = 60, weights: dict[str, float] | None = None) -> dict[str, float]:
    """Reciprocal rank fusion: score(d) = sum over legs of weight / (k + rank)."""
    scores: dict[str, float] = {}
    for leg, ids in rankings.items():
        w = (weights or {}).get(leg, 1.0)
        for rank, doc_id in enumerate(ids, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + w / (k + rank)
    return scores


class Reranker(Protocol):
    async def rerank(self, query: str, hits: list[Hit], top_k: int) -> list[Hit]: ...


class NoReranker:
    async def rerank(self, query: str, hits: list[Hit], top_k: int) -> list[Hit]:
        return hits[:top_k]


class LexicalOverlapReranker:
    """A cheap, dependency-free reranker: fused score plus query term coverage in the heading and text.
    The baseline a cross-encoder has to beat in the eval."""

    async def rerank(self, query: str, hits: list[Hit], top_k: int) -> list[Hit]:
        terms = set(_WORD.findall(query.lower()))
        if not terms:
            return hits[:top_k]
        best = max((h.score for h in hits), default=1.0) or 1.0
        for hit in hits:
            heading = set(_WORD.findall(" ".join(hit.heading_path).lower()))
            body = set(_WORD.findall(hit.text.lower()))
            coverage = len(terms & body) / len(terms)
            heading_cov = len(terms & heading) / len(terms)
            hit.score = 0.5 * (hit.score / best) + 0.35 * coverage + 0.15 * heading_cov
        return sorted(hits, key=lambda h: h.score, reverse=True)[:top_k]


class CrossEncoderReranker:
    """A local cross-encoder (bge-reranker-v2-m3 by default). Needs the `local-models` extra."""

    def __init__(self, model: str):
        from sentence_transformers import CrossEncoder  # pyright: ignore[reportMissingImports]

        self._model: Any = CrossEncoder(model, device="cpu")

    async def rerank(self, query: str, hits: list[Hit], top_k: int) -> list[Hit]:
        if not hits:
            return []
        pairs = [(query, f"{' > '.join(h.heading_path)}\n{h.text}") for h in hits]
        scores = await asyncio.to_thread(self._model.predict, pairs)
        for hit, score in zip(hits, scores, strict=True):
            hit.score = float(score)
        return sorted(hits, key=lambda h: h.score, reverse=True)[:top_k]


_PUBLIC_SELECT = """
    select c.id::text as chunk_id, c.text, c.heading_path, c.page, d.id::text as document_id, d.title, d.source,
           d.licence, d.display_rule
    from rag.chunks c join rag.documents d on d.id = c.document_id
"""


def _public_where(filters: Filters) -> tuple[str, list[Any]]:
    clauses = ["d.active"]
    params: list[Any] = []
    if filters.subject:
        clauses.append("c.subject = %s")
        params.append(filters.subject)
    if filters.grade is not None:
        clauses.append("(c.grade = %s or c.grade is null)")
        params.append(filters.grade)
    if filters.doc_types:
        clauses.append("c.doc_type = any(%s)")
        params.append(list(filters.doc_types))
    if filters.topic_ids:
        clauses.append("c.topic_ids && %s")
        params.append(list(filters.topic_ids))
    return " and ".join(clauses), params


def _hit(row: dict[str, Any], *, private: bool = False) -> Hit:
    return Hit(
        chunk_id=row["chunk_id"],
        text=row["text"],
        heading_path=list(row["heading_path"] or []),
        document_id=row["document_id"],
        title=row["title"],
        source=row.get("source", "student notes"),
        licence=row.get("licence", "student's own content"),
        display_rule=row.get("display_rule", "display"),
        page=row["page"],
        private=private,
    )


class HybridRetriever:
    def __init__(
        self,
        pool: Pool,
        embedder: Embedder,
        reranker: Reranker,
        *,
        candidates: int = 50,
        ef_search: int = 80,
        weights: dict[str, float] | None = None,
    ):
        self._pool = pool
        self._embedder = embedder
        self._reranker = reranker
        self._candidates = candidates
        self._ef_search = ef_search
        self._weights = weights or {"dense": 1.0, "lexical": 1.0}

    async def dense(self, vector: list[float], filters: Filters, limit: int) -> list[Hit]:
        where, params = _public_where(filters)
        async with self._pool.connection() as conn, conn.transaction():
            await conn.execute(sql(f"set local hnsw.ef_search = {int(self._ef_search)}"))
            rows = await (
                await conn.execute(
                    sql(
                        f"{_PUBLIC_SELECT} where {where} and c.embedding is not null "
                        "order by c.embedding <=> %s::vector limit %s"
                    ),
                    [*params, vector, limit],
                )
            ).fetchall()
        return [_hit(r) for r in rows]

    async def lexical(self, query: str, filters: Filters, limit: int) -> list[Hit]:
        where, params = _public_where(filters)
        async with self._pool.connection() as conn:
            rows = await (
                await conn.execute(
                    sql(
                        f"{_PUBLIC_SELECT}, websearch_to_tsquery('english', %s) q "
                        f"where {where} and c.tsv @@ q order by ts_rank_cd(c.tsv, q) desc limit %s"
                    ),
                    [query, *params, limit],
                )
            ).fetchall()
        return [_hit(r) for r in rows]

    async def private(self, user_id: str, query: str, vector: list[float], limit: int) -> dict[str, list[Hit]]:
        select = (
            "select c.id::text as chunk_id, c.text, c.heading_path, c.page, d.id::text as document_id, d.title "
            "from rag.private_chunks c join rag.private_documents d on d.id = c.document_id"
        )
        async with as_user(self._pool, user_id) as conn:
            dense = await (
                await conn.execute(sql(f"{select} order by c.embedding <=> %s::vector limit %s"), [vector, limit])
            ).fetchall()
            lexical = await (
                await conn.execute(
                    sql(
                        f"{select}, websearch_to_tsquery('simple', %s) q where c.tsv @@ q "
                        "order by ts_rank_cd(c.tsv, q) desc limit %s"
                    ),
                    [query, limit],
                )
            ).fetchall()
        return {
            "dense": [_hit(r, private=True) for r in dense],
            "lexical": [_hit(r, private=True) for r in lexical],
        }

    async def search(
        self,
        query: str,
        filters: Filters = Filters(),  # noqa: B008 - frozen dataclass, safe default
        *,
        top_k: int = 8,
        user_id: str | None = None,
        include_private: bool = False,
        legs: tuple[str, ...] = ("dense", "lexical"),
        rerank: bool = True,
    ) -> list[Hit]:
        [vector] = await self._embedder.embed([query], kind="query")
        rankings: dict[str, list[str]] = {}
        by_id: dict[str, Hit] = {}
        if "dense" in legs:
            for h in await self.dense(vector, filters, self._candidates):
                by_id.setdefault(h.chunk_id, h).ranks["dense"] = len(rankings.setdefault("dense", [])) + 1
                rankings["dense"].append(h.chunk_id)
        if "lexical" in legs:
            for h in await self.lexical(query, filters, self._candidates):
                by_id.setdefault(h.chunk_id, h).ranks["lexical"] = len(rankings.setdefault("lexical", [])) + 1
                rankings["lexical"].append(h.chunk_id)
        if include_private and user_id:
            for leg, hits in (await self.private(user_id, query, vector, self._candidates)).items():
                key = f"private_{leg}"
                for h in hits:
                    by_id.setdefault(h.chunk_id, h).ranks[key] = len(rankings.setdefault(key, [])) + 1
                    rankings[key].append(h.chunk_id)
        weights = {
            **self._weights,
            "private_dense": self._weights.get("dense", 1.0),
            "private_lexical": self._weights.get("lexical", 1.0),
        }
        fused = rrf(rankings, weights=weights)
        ordered = sorted(fused, key=lambda i: fused[i], reverse=True)[: self._candidates]
        hits = [by_id[i] for i in ordered]
        for h in hits:
            h.score = fused[h.chunk_id]
        if rerank:
            return await self._reranker.rerank(query, hits, top_k)
        return hits[:top_k]
