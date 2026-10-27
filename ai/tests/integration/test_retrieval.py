from __future__ import annotations

import uuid

import pytest

from aptiverse_ai.db import Pool
from aptiverse_ai.retrieval.embeddings import HashEmbedder
from aptiverse_ai.retrieval.ingest import Ingestor, SourceEntry, UnregisteredSource
from aptiverse_ai.retrieval.search import Filters, HybridRetriever, LexicalOverlapReranker

pytestmark = pytest.mark.integration

PHOTOSYNTHESIS = """TOPIC: LIFE PROCESSES IN PLANTS
1.1 Photosynthesis
Photosynthesis is the process by which green plants use light energy, carbon dioxide and water
to make glucose and release oxygen. Chlorophyll in the chloroplasts absorbs the light.
1.2 Factors affecting the rate of photosynthesis
Light intensity, carbon dioxide concentration and temperature limit the rate of photosynthesis.
TOPIC: CELLULAR RESPIRATION
2.1 Aerobic respiration
Glucose is broken down with oxygen in the mitochondria to release energy as ATP, carbon dioxide and water.
"""

ALGEBRA = """TOPIC: ALGEBRA
3.1 Quadratic equations
Solve quadratic equations by factorisation, completing the square or the quadratic formula.
The discriminant b^{2} - 4ac tells you how many real roots the equation has.
"""

REGISTER = {
    "ls-g11": SourceEntry(
        key="ls-g11",
        title="Life Sciences Grade 11",
        source="test",
        licence="CC BY",
        display_rule="display",
        doc_type="caps",
        subject="life_sciences",
        grade=11,
        checked_on="2026-10-27",
    ),
    "maths-g11": SourceEntry(
        key="maths-g11",
        title="Mathematics Grade 11",
        source="test",
        licence="CC BY",
        display_rule="display",
        doc_type="caps",
        subject="mathematics",
        grade=11,
        checked_on="2026-10-27",
    ),
}


def retriever(pool: Pool) -> HybridRetriever:
    return HybridRetriever(pool, HashEmbedder(384), LexicalOverlapReranker(), candidates=20)


async def test_ingest_is_idempotent_and_inactive_until_activated(app_pool: Pool) -> None:
    ingestor = Ingestor(app_pool, HashEmbedder(384), REGISTER)
    first = await ingestor.ingest_pages("ls-g11", [PHOTOSYNTHESIS])
    again = await ingestor.ingest_pages("ls-g11", [PHOTOSYNTHESIS])
    assert first.chunks >= 3
    assert again.skipped
    assert again.document_id == first.document_id
    assert await retriever(app_pool).search("photosynthesis light energy") == []
    await ingestor.activate(first.document_id)
    hits = await retriever(app_pool).search("photosynthesis light energy")
    assert hits
    assert "Photosynthesis" in " ".join(hits[0].heading_path)


async def test_unregistered_source_is_refused(app_pool: Pool) -> None:
    with pytest.raises(UnregisteredSource):
        await Ingestor(app_pool, HashEmbedder(384), REGISTER).ingest_pages("unknown", ["text"])


async def test_hybrid_search_ranks_the_right_section_and_filters_by_subject(
    app_pool: Pool,
) -> None:
    ingestor = Ingestor(app_pool, HashEmbedder(384), REGISTER)
    for key, text in (("ls-g11", PHOTOSYNTHESIS), ("maths-g11", ALGEBRA)):
        result = await ingestor.ingest_pages(key, [text])
        await ingestor.activate(result.document_id)
    r = retriever(app_pool)
    hits = await r.search("what limits the rate of photosynthesis", top_k=3)
    assert "Factors affecting the rate of photosynthesis" in hits[0].heading_path[-1]
    maths = await r.search("discriminant real roots", Filters(subject="mathematics"))
    assert maths
    assert all("Mathematics" in h.title for h in maths)
    nothing = await r.search("discriminant real roots", Filters(subject="life_sciences"), top_k=3)
    assert all("Life Sciences" in h.title for h in nothing)


async def test_private_notes_are_isolated_by_row_level_security(app_pool: Pool) -> None:
    ingestor = Ingestor(app_pool, HashEmbedder(384), REGISTER)
    alice, bob = str(uuid.uuid4()), str(uuid.uuid4())
    await ingestor.ingest_private_note(
        alice,
        str(uuid.uuid4()),
        "Alice CSC101 notes",
        ["Recursion: a function that calls itself with a base case."],
    )
    await ingestor.ingest_private_note(
        bob, str(uuid.uuid4()), "Bob ECO101 notes", ["Elasticity of demand measures responsiveness to price."]
    )
    r = retriever(app_pool)
    alice_hits = await r.search("recursion base case", user_id=alice, include_private=True)
    assert any(h.private and "Alice" in h.title for h in alice_hits)
    assert not any("Bob" in h.title for h in alice_hits)
    bob_hits = await r.search("recursion base case", user_id=bob, include_private=True)
    assert not any("Alice" in h.title for h in bob_hits)


async def test_forgetting_the_user_setting_returns_no_private_rows(app_pool: Pool) -> None:
    ingestor = Ingestor(app_pool, HashEmbedder(384), REGISTER)
    await ingestor.ingest_private_note(str(uuid.uuid4()), str(uuid.uuid4()), "notes", ["secret study notes"])
    async with app_pool.connection() as conn:
        rows = await (await conn.execute("select count(*) as n from rag.private_chunks")).fetchone()
    assert rows is not None
    assert rows["n"] == 0


async def test_a_user_cannot_insert_rows_for_someone_else(app_pool: Pool) -> None:
    from psycopg import errors

    from aptiverse_ai.db import as_user

    alice, bob = str(uuid.uuid4()), str(uuid.uuid4())
    with pytest.raises(errors.InsufficientPrivilege):
        async with as_user(app_pool, alice) as conn:
            await conn.execute(
                "insert into rag.private_documents (user_id, note_id, title, checksum) values (%s, %s, 'x', 'x')",
                [bob, str(uuid.uuid4())],
            )


async def test_deleting_a_user_removes_their_notes(app_pool: Pool) -> None:
    ingestor = Ingestor(app_pool, HashEmbedder(384), REGISTER)
    user = str(uuid.uuid4())
    await ingestor.ingest_private_note(user, str(uuid.uuid4()), "n1", ["first note body"])
    await ingestor.ingest_private_note(user, str(uuid.uuid4()), "n2", ["second note body"])
    assert await ingestor.delete_user(user) == 2
    hits = await retriever(app_pool).search("note body", user_id=user, include_private=True)
    assert not any(h.private for h in hits)
