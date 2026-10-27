from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import BaseModel, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Tier = Literal["fast", "standard", "deep"]
ProviderName = Literal["anthropic", "openai", "bedrock", "fake"]

# Which provider each use case tries first. The defaults are starting points chosen per job, and the
# eval suite (evals/thresholds.yaml) has the final say: a route only changes when a run shows it wins.
#   - generation, grading and tutoring: Claude (strong long-form writing, LaTeX and tool use)
#   - judge and grade.second_marker: a different model family from the one that produced the output,
#     so a judge does not favour its own family and two markers do not share the same blind spots
DEFAULT_USE_CASE_PROVIDERS: dict[str, list[str]] = {
    "judge": ["openai", "anthropic"],
    "grade.second_marker": ["openai", "anthropic"],
}


class TierModels(BaseModel):
    """Model id per tier for one provider. Code never names a model; it names a tier."""

    fast: str
    standard: str
    deep: str

    def for_tier(self, tier: Tier) -> str:
        return getattr(self, tier)


class AuthSettings(BaseModel):
    jwks_url: str
    issuer: str
    audience: str = "aptiverse-ai"
    leeway_seconds: int = 5


class GatewaySettings(BaseModel):
    providers: list[ProviderName] = Field(default_factory=lambda: ["anthropic"])
    anthropic_api_key: SecretStr | None = None
    anthropic_models: TierModels = TierModels(
        fast="claude-haiku-5-5", standard="claude-sonnet-5-5", deep="claude-opus-5-5"
    )
    openai_api_key: SecretStr | None = None
    # Checked against the OpenAI models endpoint at boot (verify_models), since ids change often.
    openai_models: TierModels = TierModels(fast="gpt-6-luna", standard="gpt-6.1-terra", deep="gpt-6-astra")
    use_case_providers: dict[str, list[ProviderName]] = Field(
        default_factory=lambda: {k: list(v) for k, v in DEFAULT_USE_CASE_PROVIDERS.items()}  # type: ignore[misc]
    )
    bedrock_region: str | None = None
    bedrock_models: TierModels = TierModels(
        fast="anthropic.claude-haiku-5-5",
        standard="anthropic.claude-sonnet-5-5",
        deep="anthropic.claude-opus-5-5",
    )
    connect_timeout_seconds: float = 3.0
    request_timeout_seconds: float = 120.0
    max_retries: int = 2
    breaker_failures: int = 5
    breaker_window_seconds: float = 30.0
    breaker_cooldown_seconds: float = 60.0
    concurrency_per_tier: dict[str, int] = Field(default_factory=lambda: {"fast": 32, "standard": 16, "deep": 4})
    max_queue_wait_seconds: float = 5.0
    daily_spend_ceiling_usd: float = 25.0
    prompts_dir: str | None = None

    @model_validator(mode="after")
    def _providers_configured(self) -> GatewaySettings:
        if not self.providers:
            raise ValueError("at least one provider is required")
        if "anthropic" in self.providers and self.anthropic_api_key is None:
            raise ValueError("gateway.anthropic_api_key is required when the anthropic provider is enabled")
        if "openai" in self.providers and self.openai_api_key is None:
            raise ValueError("gateway.openai_api_key is required when the openai provider is enabled")
        if "bedrock" in self.providers and not self.bedrock_region:
            raise ValueError("gateway.bedrock_region is required when the bedrock provider is enabled")
        return self


class DatabaseSettings(BaseModel):
    url: SecretStr
    pool_min: int = 1
    pool_max: int = 10


class EmbeddingSettings(BaseModel):
    # Anthropic has no embedding model. OpenAI text-embedding-3-large (shortened to 1024 dimensions, which
    # keeps the pgvector HNSW index small) is the default candidate; bge-m3 runs locally as the comparison.
    # "hash" is a deterministic offline embedder for tests only.
    provider: Literal["hash", "openai", "sentence-transformers"] = "hash"
    model: str = "hash-384"
    dimensions: int = 384
    openai_api_key: SecretStr | None = None


class RerankSettings(BaseModel):
    provider: Literal["none", "lexical-overlap", "cross-encoder"] = "lexical-overlap"
    model: str = "BAAI/bge-reranker-v2-m3"
    candidates: int = 50
    top_k: int = 8


class TelemetrySettings(BaseModel):
    otlp_endpoint: str | None = None
    service_name: str = "aptiverse-ai"
    langfuse_host: str | None = None
    langfuse_public_key: SecretStr | None = None
    langfuse_secret_key: SecretStr | None = None
    capture_content: bool = False


class Settings(BaseSettings):
    """All configuration, validated at boot. A missing required value stops the service starting."""

    model_config = SettingsConfigDict(env_prefix="AI__", env_nested_delimiter="__", extra="ignore")

    environment: Literal["development", "test", "staging", "production"] = "development"
    auth: AuthSettings
    gateway: GatewaySettings
    database: DatabaseSettings
    embeddings: EmbeddingSettings = EmbeddingSettings()
    rerank: RerankSettings = RerankSettings()
    telemetry: TelemetrySettings = TelemetrySettings()
    results_queue_url: str | None = None
    aptiverse_mcp_url: str | None = None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # pyright: ignore[reportCallIssue]
