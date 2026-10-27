from aptiverse_ai.gateway.gateway import ModelGateway, Route, StructuredResult
from aptiverse_ai.gateway.prices import PriceTable
from aptiverse_ai.gateway.prompts import PromptRegistry
from aptiverse_ai.gateway.providers.base import Provider
from aptiverse_ai.gateway.types import Completion, ModelRequest, SystemBlock, Usage, UsageReport
from aptiverse_ai.settings import GatewaySettings


def build_gateway(settings: GatewaySettings, prices: PriceTable | None = None) -> ModelGateway:
    """Wires the configured providers in priority order."""
    from aptiverse_ai.gateway.providers.anthropic_provider import AnthropicProvider
    from aptiverse_ai.gateway.providers.fake import FakeProvider

    providers: dict[str, Provider] = {}
    for name in settings.providers:
        if name == "anthropic":
            assert settings.anthropic_api_key is not None  # enforced by GatewaySettings validation
            providers[name] = AnthropicProvider.first_party(
                settings.anthropic_api_key.get_secret_value(),
                connect_timeout=settings.connect_timeout_seconds,
                timeout=settings.request_timeout_seconds,
            )
        elif name == "openai":
            from aptiverse_ai.gateway.providers.openai_provider import OpenAIProvider

            assert settings.openai_api_key is not None
            providers[name] = OpenAIProvider.create(
                settings.openai_api_key.get_secret_value(),
                connect_timeout=settings.connect_timeout_seconds,
                timeout=settings.request_timeout_seconds,
            )
        elif name == "bedrock":
            assert settings.bedrock_region is not None
            providers[name] = AnthropicProvider.bedrock(
                settings.bedrock_region,
                connect_timeout=settings.connect_timeout_seconds,
                timeout=settings.request_timeout_seconds,
            )
        else:
            providers[name] = FakeProvider()
    return ModelGateway.from_settings(settings, providers, prices or PriceTable.load())


__all__ = [
    "Completion",
    "ModelGateway",
    "ModelRequest",
    "PriceTable",
    "PromptRegistry",
    "Route",
    "StructuredResult",
    "SystemBlock",
    "Usage",
    "UsageReport",
    "build_gateway",
]
