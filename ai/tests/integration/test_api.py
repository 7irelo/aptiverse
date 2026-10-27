from __future__ import annotations

import asyncio
import json
import time
import uuid
from collections.abc import AsyncGenerator
from typing import Any

import httpx
import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from jwt.algorithms import ECAlgorithm
from langgraph.checkpoint.memory import InMemorySaver

from aptiverse_ai.app import Overrides, create_app
from aptiverse_ai.db import Pool
from aptiverse_ai.gateway.gateway import ModelGateway, Route
from aptiverse_ai.gateway.prices import PriceTable
from aptiverse_ai.gateway.providers.fake import FakeProvider, FakeReply
from aptiverse_ai.gateway.resilience import CircuitBreaker, SpendGuard, TierLimiter
from aptiverse_ai.gateway.types import ModelRequest
from aptiverse_ai.retrieval.embeddings import HashEmbedder
from aptiverse_ai.services import MemoryPublisher
from aptiverse_ai.settings import AuthSettings, DatabaseSettings, GatewaySettings, Settings, TierModels

pytestmark = pytest.mark.integration

KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())
KID = "test-key"
ISSUER = "https://api.test"
ALL_SCOPES = "ai.retrieve ai.generate ai.grade ai.tutor ai.notes"


def token(sub: str, scope: str = ALL_SCOPES, *, aud: str = "aptiverse-ai", key: Any = KEY, ttl: int = 60) -> str:
    now = int(time.time())
    claims = {"sub": sub, "aud": aud, "iss": ISSUER, "iat": now, "exp": now + ttl, "scope": scope, "rid": "r1"}
    return jwt.encode(claims, key, algorithm="ES256", headers={"kid": KID})


def responder(request: ModelRequest, model: str) -> FakeReply:
    if request.use_case == "practice.generate":
        return FakeReply(
            parsed={
                "name": "Quiz",
                "questions": [
                    {
                        "id": "s1-q1",
                        "type": "numeric",
                        "topic": "t",
                        "cognitive_level": "routine",
                        "marks": 2,
                        "stem": "Solve $x + 1 = 3$.",
                        "answer": "2",
                        "memo": "x = 3 - 1\nx = 2",
                    }
                ],
            }
        )
    if request.use_case == "judge.level":
        return FakeReply(parsed={"verdicts": [{"question_id": "s1-q1", "appropriate": True, "reason": "ok"}]})
    if request.use_case == "grade.written":
        return FakeReply(
            parsed={
                "points": [{"memo_point": "a", "awarded": True, "evidence_quote": "light"}],
                "feedback": "ok",
                "confidence": 0.9,
            }
        )
    if request.use_case == "tutor.route":
        return FakeReply(parsed={"intent": "explain", "graded_work": False, "language": "english"})
    return FakeReply(text="Photosynthesis makes glucose.")


@pytest.fixture
async def client(app_pool: Pool) -> AsyncGenerator[tuple[httpx.AsyncClient, MemoryPublisher]]:
    jwk = json.loads(ECAlgorithm.to_jwk(KEY.public_key()))
    settings = Settings(
        environment="test",
        auth=AuthSettings(jwks_url="https://api.test/.well-known/jwks.json", issuer=ISSUER),
        gateway=GatewaySettings(providers=["fake"]),
        database=DatabaseSettings(url="postgresql://unused"),  # pyright: ignore[reportArgumentType]
    )
    provider = FakeProvider(responder=responder)
    gateway = ModelGateway(
        [
            Route(
                provider,
                TierModels(fast="fake-fast", standard="fake-standard", deep="fake-deep"),
                CircuitBreaker(5, 30, 60),
            )
        ],
        PriceTable.load(),
        limiter=TierLimiter({"fast": 8, "standard": 8, "deep": 8}, 5),
        spend=SpendGuard(10**9),
    )
    publisher = MemoryPublisher()
    app = create_app(
        settings,
        Overrides(
            gateway=gateway,
            pool=app_pool,
            jwks={"keys": [{**jwk, "kid": KID}]},
            extras={"checkpointer": InMemorySaver(), "publisher": publisher, "embedder": HashEmbedder(384)},
        ),
    )
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://ai") as http:
            yield http, publisher


def auth(sub: str, **kw: Any) -> dict[str, str]:
    return {"Authorization": f"Bearer {token(sub, **kw)}"}


async def test_health_endpoints(client: tuple[httpx.AsyncClient, MemoryPublisher]) -> None:
    http, _ = client
    assert (await http.get("/health/live")).status_code == 200
    assert (await http.get("/health/ready")).json()["postgres"] == "up"


@pytest.mark.parametrize(
    "headers",
    [
        {},
        {"Authorization": "Bearer not-a-jwt"},
        {"Authorization": f"Bearer {token('u', aud='someone-else')}"},
        {"Authorization": f"Bearer {token('u', key=OTHER_KEY)}"},
        {"Authorization": f"Bearer {token('u', ttl=-120)}"},
    ],
)
async def test_bad_or_missing_tokens_are_rejected(
    client: tuple[httpx.AsyncClient, MemoryPublisher], headers: dict[str, str]
) -> None:
    http, _ = client
    response = await http.post("/v1/retrieve", json={"query": "photosynthesis"}, headers=headers)
    assert response.status_code == 401
    assert "traceId" in response.json()


async def test_missing_scope_is_forbidden(client: tuple[httpx.AsyncClient, MemoryPublisher]) -> None:
    http, _ = client
    response = await http.post("/v1/grade", json={}, headers=auth("u", scope="ai.retrieve"))
    assert response.status_code == 403


async def test_generation_runs_publishes_and_hides_jobs_from_other_users(
    client: tuple[httpx.AsyncClient, MemoryPublisher],
) -> None:
    http, publisher = client
    job = str(uuid.uuid4())
    body = {
        "job_id": job,
        "stage": "high_school",
        "level": "Grade 10",
        "subject": "Mathematics",
        "subject_key": "mathematics",
        "grade": 10,
        "format": "quiz",
        "topics": ["equations"],
    }
    started = await http.post("/v1/generations", json=body, headers=auth("alice"))
    assert started.status_code == 202
    status: dict[str, Any] = {}
    for _ in range(50):
        status = (await http.get(f"/v1/generations/{job}", headers=auth("alice"))).json()
        if status["status"] == "completed":
            break
        await asyncio.sleep(0.1)
    assert status["status"] == "completed"
    assert status["usage"]["cost_usd_micros"] > 0
    assert publisher.messages[-1]["status"] == "completed"
    assert (await http.get(f"/v1/generations/{job}", headers=auth("bob"))).status_code == 404
    again = await http.post("/v1/generations", json=body, headers=auth("alice"))
    assert again.json()["status"] == "completed"


async def test_grade_and_tutor_stream(client: tuple[httpx.AsyncClient, MemoryPublisher]) -> None:
    http, _ = client
    graded = await http.post(
        "/v1/grade",
        headers=auth("u"),
        json={
            "attempt_id": "a1",
            "level": "Grade 11",
            "subject": "Life Sciences",
            "answers": [
                {
                    "question_id": "q1",
                    "type": "short",
                    "stem": "Name the energy source.",
                    "marks": 1,
                    "memo": "light",
                    "student_answer": "light",
                }
            ],
        },
    )
    assert graded.json()["awarded"] == 1
    turn = {
        "conversation_id": "c1",
        "message": "What is photosynthesis?",
        "context": {"stage": "high_school", "level": "Grade 11"},
    }
    async with http.stream("POST", "/v1/tutor/turn", json=turn, headers=auth("u")) as response:
        body = "".join([chunk async for chunk in response.aiter_text()])
    assert "event: token" in body
    assert "event: done" in body


async def test_notes_are_private_to_their_owner(client: tuple[httpx.AsyncClient, MemoryPublisher]) -> None:
    http, _ = client
    alice, bob = str(uuid.uuid4()), str(uuid.uuid4())
    note = await http.put(
        f"/v1/notes/{uuid.uuid4()}",
        headers=auth(alice),
        json={"title": "CSC101 week 3", "text": "Binary search halves the search interval each step."},
    )
    assert note.status_code == 200
    mine = await http.post(
        "/v1/retrieve", headers=auth(alice), json={"query": "binary search interval", "include_private": True}
    )
    theirs = await http.post(
        "/v1/retrieve", headers=auth(bob), json={"query": "binary search interval", "include_private": True}
    )
    assert any(h["private"] for h in mine.json()["hits"])
    assert not any(h["private"] for h in theirs.json()["hits"])
    assert (await http.delete("/v1/users/me/data", headers=auth(alice))).status_code == 204
    after = await http.post(
        "/v1/retrieve", headers=auth(alice), json={"query": "binary search interval", "include_private": True}
    )
    assert not any(h["private"] for h in after.json()["hits"])
