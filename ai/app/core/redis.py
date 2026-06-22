"""Shared async Redis client.

Single lazily-created connection pool, mirroring the engine pattern in
``app.core.db``. The same Redis instance backs the Arq queue and the outbox
pub/sub (see ``app.events.consumer`` / ``app.worker``); this helper gives the
non-queue code paths (e.g. the chatbot's per-user daily quota) one place to get
a connection without re-parsing the DSN everywhere.
"""

from __future__ import annotations

from redis.asyncio import Redis

from app.core.config import get_settings

_redis: Redis | None = None


def get_redis() -> Redis:
    """Return the process-wide async Redis client (created on first use)."""
    global _redis
    if _redis is None:
        _redis = Redis.from_url(get_settings().redis_url, decode_responses=True)
    return _redis
