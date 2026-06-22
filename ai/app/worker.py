"""Arq worker — runs analytics services on-demand (events / manual trigger).

Start with:  arq app.worker.WorkerSettings
"""

from __future__ import annotations

from arq.connections import RedisSettings

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.services import REGISTRY

log = get_logger(__name__)


async def run_service(ctx: dict, service: str, user_id: str | None = None) -> dict:
    if service not in REGISTRY:
        log.error("unknown_service", service=service)
        return {"error": "unknown service"}
    return await REGISTRY[service].run(user_id=user_id)


async def startup(ctx: dict) -> None:
    configure_logging()
    log.info("worker.startup", services=sorted(REGISTRY))


class WorkerSettings:
    functions = [run_service]
    on_startup = startup

    @staticmethod
    def redis_settings() -> RedisSettings:
        return RedisSettings.from_dsn(get_settings().redis_url)
