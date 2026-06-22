"""Typed settings, loaded from environment / .env (AI_ prefix)."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AI_", env_file=".env", extra="ignore")

    # Database (same Postgres as the .NET API; +asyncpg driver).
    database_url: str = "postgresql+asyncpg://aptiverse_admin:CHANGE_ME@localhost:5432/aptiverse"

    # Redis: shared with the API for cache, the Arq queue, and outbox pub/sub.
    redis_url: str = "redis://localhost:6379/1"

    # OpenAI — the ONLY paid LLM dependency, used exclusively by the chatbot.
    openai_api_key: str = "CHANGE_ME"
    openai_model: str = "gpt-4o"

    env: str = "development"
    log_level: str = "INFO"

    # Channel the .NET transactional outbox publishes recompute events on.
    outbox_channel: str = "aptiverse.events"

    # Stamped onto every analytics row so outputs are reproducible / auditable.
    model_version: str = "2026.06.0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
