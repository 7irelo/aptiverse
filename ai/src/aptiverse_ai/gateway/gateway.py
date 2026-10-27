"""The model gateway: every model call goes through here.

It owns tier to model routing, provider failover, retries, the circuit breakers, concurrency limits,
the spend guard, cost accounting, structured-output repair and tier escalation, and the GenAI spans.
"""

from __future__ import annotations

import asyncio
import random
import time
from collections.abc import AsyncIterator, Awaitable, Callable
from dataclasses import dataclass, field, replace
from typing import Any

import structlog
from opentelemetry import metrics, trace
from pydantic import BaseModel

from aptiverse_ai.gateway.errors import (
    AllProvidersUnavailable,
    ContextTooLarge,
    LowConfidence,
    ProviderError,
    SchemaInvalid,
    SpendCeilingReached,
)
from aptiverse_ai.gateway.prices import PriceTable
from aptiverse_ai.gateway.providers.base import Provider
from aptiverse_ai.gateway.resilience import CircuitBreaker, SpendGuard, TierLimiter
from aptiverse_ai.gateway.types import (
    Completion,
    ModelRequest,
    StreamDone,
    StreamEvent,
    TextDelta,
    Usage,
    UsageReport,
)
from aptiverse_ai.settings import GatewaySettings, Tier, TierModels

log = structlog.get_logger()
_tracer = trace.get_tracer("aptiverse.ai.gateway")
_meter = metrics.get_meter("aptiverse.ai.gateway")
_tokens = _meter.create_counter("aptiverse_ai_tokens_total", unit="{token}")
_cost = _meter.create_counter("aptiverse_ai_cost_usd_micros_total", unit="usd_micros")
_latency = _meter.create_histogram("aptiverse_ai_latency_seconds", unit="s")
_failovers = _meter.create_counter("aptiverse_ai_failover_total")
_queue_wait = _meter.create_histogram("aptiverse_ai_queue_wait_seconds", unit="s")

_GEN_AI_SYSTEM = {"anthropic": "anthropic", "openai": "openai", "bedrock": "aws.bedrock"}
_NEXT_TIER: dict[Tier, Tier | None] = {"fast": "standard", "standard": "deep", "deep": None}

Sleep = Callable[[float], Awaitable[None]]


@dataclass(slots=True)
class Route:
    provider: Provider
    models: TierModels
    breaker: CircuitBreaker


@dataclass(slots=True)
class StructuredResult[T: BaseModel]:
    value: T
    usage: UsageReport
    attempts: int
    escalated: bool
    tier: Tier


@dataclass(slots=True)
class GatewayStats:
    failovers: int = 0
    retries: int = 0
    escalations: int = 0
    repairs: int = 0
    extra: dict[str, int] = field(default_factory=dict)


class ModelGateway:
    def __init__(
        self,
        routes: list[Route],
        prices: PriceTable,
        *,
        limiter: TierLimiter,
        spend: SpendGuard,
        max_retries: int = 2,
        sleep: Sleep = asyncio.sleep,
        context_limit_tokens: int = 900_000,
        preferences: dict[str, list[str]] | None = None,
    ):
        if not routes:
            raise ValueError("at least one route is required")
        for route in routes:
            prices.require([route.models.fast, route.models.standard, route.models.deep])
        self._routes = routes
        self._prices = prices
        self._limiter = limiter
        self.spend = spend
        self._max_retries = max_retries
        self._sleep = sleep
        self._context_limit = context_limit_tokens
        self._preferences = preferences or {}
        self.stats = GatewayStats()

    @classmethod
    def from_settings(
        cls, settings: GatewaySettings, providers: dict[str, Provider], prices: PriceTable
    ) -> ModelGateway:
        routes: list[Route] = []
        catalog = {
            "anthropic": settings.anthropic_models,
            "openai": settings.openai_models,
            "bedrock": settings.bedrock_models,
            "fake": TierModels(fast="fake-fast", standard="fake-standard", deep="fake-deep"),
        }
        for name in settings.providers:
            models = catalog[name]
            routes.append(
                Route(
                    provider=providers[name],
                    models=models,
                    breaker=CircuitBreaker(
                        settings.breaker_failures,
                        settings.breaker_window_seconds,
                        settings.breaker_cooldown_seconds,
                    ),
                )
            )
        return cls(
            routes,
            prices,
            limiter=TierLimiter(settings.concurrency_per_tier, settings.max_queue_wait_seconds),
            spend=SpendGuard(int(settings.daily_spend_ceiling_usd * 1_000_000)),
            max_retries=settings.max_retries,
            preferences={k: list(v) for k, v in settings.use_case_providers.items()},
        )

    @property
    def routes(self) -> list[Route]:
        return self._routes

    # ---- public API -------------------------------------------------------------------------

    async def complete(self, request: ModelRequest) -> Completion:
        request = self._apply_spend_policy(request)
        async with self._limiter.slot(request.tier, interactive=request.interactive):
            _queue_wait.record(self._limiter.last_wait_seconds, {"tier": request.tier})
            return await self._with_failover(request, lambda route, model: route.provider.complete(request, model))

    async def stream(self, request: ModelRequest) -> AsyncIterator[StreamEvent]:
        """Streams text. Failover happens only before the first token; after that an error ends the stream."""
        request = self._apply_spend_policy(request)
        async with self._limiter.slot(request.tier, interactive=request.interactive):
            last_error: ProviderError | None = None
            for index, route in enumerate(self.routes_for(request.use_case)):
                if not route.breaker.allow():
                    continue
                if index > 0:
                    self._note_failover(request, route)
                model = route.models.for_tier(request.tier)
                started = time.monotonic()
                first_token = True
                with _tracer.start_as_current_span(f"chat {model}") as span:
                    self._span_request(span, request, route, model, streaming=True)
                    try:
                        async for event in route.provider.stream(request, model):
                            if isinstance(event, TextDelta):
                                if first_token:
                                    span.set_attribute("aptiverse.ttft_seconds", time.monotonic() - started)
                                    first_token = False
                                yield event
                            else:
                                completion = self._finish(event.completion, request, route, started, span)
                                yield StreamDone(completion)
                        return
                    except ProviderError as exc:
                        route.breaker.record_failure()
                        span.set_attribute("error.type", exc.code)
                        if not first_token or not exc.failover:
                            raise
                        last_error = exc
            log.warning("all_providers_unavailable", use_case=request.use_case, error=str(last_error))
            raise AllProvidersUnavailable()

    async def structured[T: BaseModel](
        self,
        request: ModelRequest,
        schema: type[T],
        *,
        escalate: bool = True,
        confidence: Callable[[T], float] | None = None,
        min_confidence: float = 0.0,
    ) -> StructuredResult[T]:
        """Structured output with one repair attempt per tier, then one tier escalation."""
        request = self._apply_spend_policy(request)
        usage = UsageReport()
        attempts = 0
        tier: Tier = request.tier
        escalated = False
        last_errors = ""
        last_confidence = 0.0
        while True:
            current = replace(request, tier=tier)
            for repair in range(2):
                attempts += 1
                if repair:
                    self.stats.repairs += 1
                    current = _with_repair(current, last_errors)
                async with self._limiter.slot(tier, interactive=current.interactive):
                    value, completion = await self._with_failover(
                        current, lambda route, model, c=current: self._parse_call(route, model, c, schema)
                    )
                usage.add(completion.usage)
                if value is None:
                    last_errors = completion.text or "invalid output"
                    continue
                if confidence is not None and (score := confidence(value)) < min_confidence:
                    last_confidence = score
                    last_errors = f"confidence {score:.2f} below {min_confidence:.2f}"
                    break  # low confidence is not fixed by repair; escalate instead
                return StructuredResult(value, usage, attempts, escalated, tier)
            next_tier = _NEXT_TIER[tier]
            if not escalate or escalated or next_tier is None:
                if last_errors.startswith("confidence"):
                    raise LowConfidence(last_confidence)
                raise SchemaInvalid(last_errors)
            self.stats.escalations += 1
            log.info("tier_escalation", use_case=request.use_case, from_tier=tier, to_tier=next_tier)
            tier = next_tier
            escalated = True

    async def count_tokens(self, request: ModelRequest) -> int:
        route = next((r for r in self._routes if r.breaker.allow()), self._routes[0])
        return await route.provider.count_tokens(request, route.models.for_tier(request.tier))

    async def ensure_fits(self, request: ModelRequest, limit: int | None = None) -> int:
        tokens = await self.count_tokens(request)
        ceiling = limit or self._context_limit
        if tokens + request.max_output_tokens > ceiling:
            raise ContextTooLarge(tokens, ceiling)
        return tokens

    def routes_for(self, use_case: str) -> list[Route]:
        """Routes in the order this use case prefers, then the rest as a fallback. `judge.level` falls back
        to the `judge` preference."""
        preferred = self._preferences.get(use_case) or self._preferences.get(use_case.split(".", 1)[0]) or []
        rank = {name: i for i, name in enumerate(preferred)}
        return sorted(self._routes, key=lambda r: rank.get(r.provider.name, len(rank)))

    def cost(self, usage: Usage) -> int:
        return self._prices.cost_micros(
            usage.model,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            cache_read=usage.cache_read_input_tokens,
            cache_write=usage.cache_creation_input_tokens,
            batch=usage.batch,
        )

    async def aclose(self) -> None:
        for route in self._routes:
            await route.provider.aclose()

    # ---- internals ----------------------------------------------------------------------------

    async def _parse_call[T: BaseModel](self, route: Route, model: str, request: ModelRequest, schema: type[T]) -> Any:
        value, completion, errors = await route.provider.parse(request, model, schema)
        if value is None:
            completion.text = errors or "invalid output"
        return value, completion

    def _apply_spend_policy(self, request: ModelRequest) -> ModelRequest:
        if not self.spend.exhausted():
            return request
        if not request.interactive:
            raise SpendCeilingReached()
        if request.tier != "fast":
            log.warning("spend_ceiling_degrade", use_case=request.use_case, from_tier=request.tier)
            return replace(request, tier="fast", effort=None)
        return request

    async def _with_failover(self, request: ModelRequest, call: Callable[[Route, str], Awaitable[Any]]) -> Any:
        last_error: ProviderError | None = None
        tried = 0
        for route in self.routes_for(request.use_case):
            if not route.breaker.allow():
                continue
            if tried:
                self._note_failover(request, route)
            tried += 1
            model = route.models.for_tier(request.tier)
            for attempt in range(self._max_retries + 1):
                started = time.monotonic()
                with _tracer.start_as_current_span(f"chat {model}") as span:
                    self._span_request(span, request, route, model, streaming=False)
                    try:
                        result = await call(route, model)
                    except ProviderError as exc:
                        span.set_attribute("error.type", exc.code)
                        if not exc.retryable:
                            if not exc.failover:
                                raise
                            last_error = exc
                            route.breaker.record_failure()
                            break
                        last_error = exc
                        if attempt < self._max_retries:
                            self.stats.retries += 1
                            await self._sleep(_backoff(attempt, exc.retry_after))
                            continue
                        route.breaker.record_failure()
                        break
                    completion: Completion = result[1] if isinstance(result, tuple) else result
                    self._finish(completion, request, route, started, span)
                    return result
        log.warning("all_providers_unavailable", use_case=request.use_case, error=str(last_error))
        raise AllProvidersUnavailable()

    def _finish(
        self, completion: Completion, request: ModelRequest, route: Route, started: float, span: Any
    ) -> Completion:
        route.breaker.record_success()
        completion.usage.cost_usd_micros = self.cost(completion.usage)
        self.spend.record(completion.usage.cost_usd_micros)
        elapsed = time.monotonic() - started
        u = completion.usage
        attrs = {"use_case": request.use_case, "tier": request.tier, "model": u.model}
        _tokens.add(u.input_tokens, {**attrs, "kind": "input"})
        _tokens.add(u.output_tokens, {**attrs, "kind": "output"})
        _tokens.add(u.cache_read_input_tokens, {**attrs, "kind": "cache_read"})
        _cost.add(u.cost_usd_micros, attrs)
        _latency.record(elapsed, {**attrs, "phase": "total"})
        span.set_attribute("gen_ai.usage.input_tokens", u.input_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", u.output_tokens)
        span.set_attribute("gen_ai.response.finish_reasons", [completion.stop_reason or "unknown"])
        span.set_attribute("aptiverse.cache_read_input_tokens", u.cache_read_input_tokens)
        span.set_attribute("aptiverse.cost_usd_micros", u.cost_usd_micros)
        return completion

    def _span_request(self, span: Any, request: ModelRequest, route: Route, model: str, *, streaming: bool) -> None:
        span.set_attribute("gen_ai.operation.name", "chat")
        span.set_attribute("gen_ai.system", _GEN_AI_SYSTEM.get(route.provider.name, route.provider.name))
        span.set_attribute("gen_ai.request.model", model)
        span.set_attribute("gen_ai.request.max_tokens", request.max_output_tokens)
        span.set_attribute("aptiverse.provider", route.provider.name)
        span.set_attribute("aptiverse.use_case", request.use_case)
        span.set_attribute("aptiverse.tier", request.tier)
        span.set_attribute("aptiverse.streaming", streaming)
        if request.prompt_id:
            span.set_attribute("aptiverse.prompt_id", request.prompt_id)
            span.set_attribute("aptiverse.prompt_version", request.prompt_version or 0)

    def _note_failover(self, request: ModelRequest, route: Route) -> None:
        self.stats.failovers += 1
        _failovers.add(1, {"use_case": request.use_case, "to": route.provider.name})
        log.warning("provider_failover", use_case=request.use_case, to=route.provider.name)


def _backoff(attempt: int, retry_after: float | None) -> float:
    if retry_after is not None:
        return min(retry_after, 10.0)
    return min(0.5 * (2**attempt), 8.0) * (0.5 + random.random() / 2)  # noqa: S311 - jitter, not security


def _with_repair(request: ModelRequest, errors: str) -> ModelRequest:
    note = (
        "Your previous output did not match the required schema. Fix these errors and return the full, "
        f"corrected output only.\n<validation_errors>\n{errors[:4000]}\n</validation_errors>"
    )
    return replace(request, messages=[*request.messages, {"role": "user", "content": note}])
