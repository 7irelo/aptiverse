from __future__ import annotations

from aptiverse_ai.problems import AppError


class GatewayError(AppError):
    status = 502


class ProviderError(GatewayError):
    """A provider failed. `retryable` errors may be retried or failed over before the first token."""

    def __init__(self, provider: str, detail: str, *, retryable: bool, retry_after: float | None = None):
        super().__init__("ai.provider_error", detail)
        self.provider = provider
        self.retryable = retryable
        self.retry_after = retry_after


class AllProvidersUnavailable(GatewayError):
    status = 503

    def __init__(self) -> None:
        super().__init__("ai.unavailable", "The AI service is unavailable right now. Try again shortly.")


class Busy(GatewayError):
    status = 503

    def __init__(self, retry_after: int = 5) -> None:
        super().__init__(
            "ai.busy", "The AI service is busy. Try again shortly.", headers={"Retry-After": str(retry_after)}
        )


class SchemaInvalid(GatewayError):
    status = 502

    def __init__(self, errors: str) -> None:
        super().__init__("ai.schema_invalid", "The model returned output that does not match the schema.")
        self.errors = errors


class LowConfidence(GatewayError):
    def __init__(self, confidence: float) -> None:
        super().__init__("ai.low_confidence", f"Model confidence {confidence:.2f} is below the threshold.")
        self.confidence = confidence


class Refused(GatewayError):
    status = 422

    def __init__(self, category: str | None) -> None:
        super().__init__("ai.refused", "The model declined this request.")
        self.category = category


class ContextTooLarge(GatewayError):
    status = 413

    def __init__(self, tokens: int, limit: int) -> None:
        super().__init__("ai.context_too_large", f"The request is {tokens} tokens; the limit is {limit}.")


class SpendCeilingReached(GatewayError):
    status = 503

    def __init__(self) -> None:
        super().__init__("ai.spend_ceiling", "The daily AI budget is used up. Try again tomorrow.")
