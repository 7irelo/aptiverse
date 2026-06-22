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

    # Feature flag: insights.risk_scores does not exist in .NET yet. The At-Risk
    # sink stays a no-op until a .NET migration creates the table and this flips.
    enable_risk_scores: bool = False

    # Feature flag: diary theme embeddings. The fast VADER-only path always runs;
    # the heavy sentence-transformers theme path is opt-in (it pulls torch). Off by
    # default so the service runs with only light deps installed.
    enable_diary_embeddings: bool = False
    # sentence-transformers model used when embeddings are enabled. Small + local.
    diary_embedding_model: str = "all-MiniLM-L6-v2"


@lru_cache
def get_settings() -> Settings:
    return Settings()
