from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import Any

import httpx
import structlog
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from aptiverse_ai import logging as app_logging
from aptiverse_ai import problems, telemetry
from aptiverse_ai.auth import JwksCache, ServiceTokenVerifier
from aptiverse_ai.db import Pool, create_pool
from aptiverse_ai.gateway import ModelGateway, PromptRegistry, build_gateway
from aptiverse_ai.settings import Settings, get_settings

log = structlog.get_logger()


@dataclass(slots=True)
class Overrides:
    """Test seams: inject a gateway, pool, embedder or JWKS instead of building real ones."""

    gateway: ModelGateway | None = None
    pool: Pool | None = None
    jwks: dict[str, Any] | None = None
    extras: dict[str, Any] = field(default_factory=dict)


def create_app(settings: Settings | None = None, overrides: Overrides | None = None) -> FastAPI:
    settings = settings or get_settings()
    overrides = overrides or Overrides()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
        http = httpx.AsyncClient()
        jwks = JwksCache(settings.auth.jwks_url, http)
        if overrides.jwks:
            jwks.seed(overrides.jwks)
        app.state.verifier = ServiceTokenVerifier(settings.auth, jwks)
        app.state.settings = settings
        app.state.http = http
        app.state.gateway = overrides.gateway or build_gateway(settings.gateway)
        app.state.prompts = PromptRegistry.load()
        pool = overrides.pool or create_pool(settings.database)
        await pool.open(wait=False)
        app.state.pool = pool
        from aptiverse_ai.services import build_services

        app.state.services = build_services(app, settings, overrides.extras)
        log.info("ai_service_started", environment=settings.environment, providers=settings.gateway.providers)
        try:
            yield
        finally:
            await app.state.services.aclose()
            await app.state.gateway.aclose()
            if overrides.pool is None:
                await pool.close()
            await http.aclose()

    app_logging.configure(json_output=settings.environment != "development")
    app = FastAPI(
        title="Aptiverse AI",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None if settings.environment == "production" else "/docs",
        redoc_url=None,
    )
    problems.install(app)
    telemetry.configure(app, settings.telemetry, settings.environment)

    @app.get("/health/live", include_in_schema=False)
    async def live() -> dict[str, str]:  # pyright: ignore[reportUnusedFunction]
        return {"status": "ok"}

    @app.get("/health/ready", include_in_schema=False)
    async def ready() -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        try:
            async with app.state.pool.connection(timeout=2.0) as conn:
                await conn.execute("select 1")
        except Exception:  # any DB failure means not ready
            return JSONResponse({"status": "unavailable", "postgres": "down"}, status_code=503)
        return JSONResponse({"status": "ok", "postgres": "up"})

    from aptiverse_ai.routes import register

    register(app)
    return app
