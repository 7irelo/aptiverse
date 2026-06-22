"""Outbox event consumer.

Subscribes to the Redis channel the .NET transactional outbox publishes on
(e.g. "practice.attempt.submitted" → recompute mastery for that student) and
enqueues the matching analytics service onto the Arq queue.

Start with:  python -m app.events.consumer
"""

from __future__ import annotations

import asyncio
import json

from arq import create_pool
from arq.connections import RedisSettings
from redis.asyncio import Redis

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger

log = get_logger(__name__)

# Map outbox event types → the analytics service to recompute.
EVENT_ROUTES: dict[str, str] = {
    "practice.attempt.submitted": "mastery",
    "assessment.graded": "grade_distribution",
    "diary.entry.created": "diary_nlp",
    "mood.tracked": "subject_analytics",
    "goal.progress.changed": "growth",
}


async def main() -> None:
    configure_logging()
    settings = get_settings()
    redis = Redis.from_url(settings.redis_url)
    arq = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    pubsub = redis.pubsub()
    await pubsub.subscribe(settings.outbox_channel)
    log.info("consumer.subscribed", channel=settings.outbox_channel)

    async for msg in pubsub.listen():
        if msg.get("type") != "message":
            continue
        try:
            evt = json.loads(msg["data"])
            service = EVENT_ROUTES.get(evt.get("type"))
            if service:
                await arq.enqueue_job("run_service", service, evt.get("userId"))
                log.info("event.routed", type=evt.get("type"), service=service)
        except Exception:
            log.exception("event.handle_failed")


if __name__ == "__main__":
    asyncio.run(main())
