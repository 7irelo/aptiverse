"""Offline eval gates that run on every pull request: no model calls, no spend."""

from __future__ import annotations

import pytest

from aptiverse_ai.db import Pool
from aptiverse_ai.evals import harness
from aptiverse_ai.retrieval.embeddings import HashEmbedder
from aptiverse_ai.retrieval.ingest import Ingestor
from aptiverse_ai.retrieval.search import HybridRetriever, LexicalOverlapReranker


def test_safety_floor_meets_its_gates() -> None:
    report = harness.safety_floor()
    assert harness.check_thresholds(report, "offline") == []


@pytest.mark.integration
async def test_retrieval_seed_suite_meets_its_gates(app_pool: Pool) -> None:
    embedder = HashEmbedder(384)
    reports = await harness.retrieval(
        HybridRetriever(app_pool, embedder, LexicalOverlapReranker(), candidates=20), Ingestor(app_pool, embedder, {})
    )
    by_name = {r.suite: r for r in reports}
    hybrid = by_name["retrieval.hybrid_rerank"]
    failures = harness.check_thresholds(hybrid, "offline", key="retrieval")
    assert failures == [], "\n" + "\n".join(r.markdown() for r in reports)
    # Fusion should not be worse than the weaker single leg; this catches a broken leg or fusion bug.
    assert hybrid.metrics["mrr"].point >= min(
        by_name["retrieval.dense"].metrics["mrr"].point, by_name["retrieval.lexical"].metrics["mrr"].point
    )


def test_datasets_carry_their_label_source() -> None:
    for name in ("grading", "safety", "trajectory"):
        assert harness.load(name)["label_source"] in ("synthetic", "teacher", "owner")
