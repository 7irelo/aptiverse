"""Smoke tests for the skeleton: app imports, registry is wired, health responds."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.services import REGISTRY

EXPECTED = {
    "grade_distribution",
    "growth",
    "tips",
    "subject_analytics",
    "gaps",
    "mastery",
    "at_risk",
    "diary_nlp",
}


def test_registry_complete() -> None:
    assert set(REGISTRY) == EXPECTED


def test_health() -> None:
    client = TestClient(app)
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert set(body["services"]) == EXPECTED


def test_trigger_unknown_service() -> None:
    client = TestClient(app)
    resp = client.post("/trigger/nope", json={})
    assert resp.status_code == 404
