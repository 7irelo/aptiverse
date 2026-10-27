from __future__ import annotations

import asyncio

import pytest
from pydantic import BaseModel

from aptiverse_ai.gateway.errors import (
    AllProvidersUnavailable,
    Busy,
    LowConfidence,
    ProviderError,
    SchemaInvalid,
    SpendCeilingReached,
)
from aptiverse_ai.gateway.gateway import ModelGateway, Route
from aptiverse_ai.gateway.prices import PriceTable, UnknownModelPrice
from aptiverse_ai.gateway.providers.anthropic_provider import build_params
from aptiverse_ai.gateway.providers.fake import FakeProvider, FakeReply
from aptiverse_ai.gateway.resilience import CircuitBreaker, SpendGuard, TierLimiter
from aptiverse_ai.gateway.types import ModelRequest, StreamDone, SystemBlock, TextDelta
from aptiverse_ai.settings import Tier, TierModels

FAKE_MODELS = TierModels(fast="fake-fast", standard="fake-standard", deep="fake-deep")


async def _no_sleep(_: float) -> None:
    return None


def gateway(*providers: FakeProvider, ceiling_usd: float = 100.0, retries: int = 1) -> ModelGateway:
    return ModelGateway(
        [Route(p, FAKE_MODELS, CircuitBreaker(2, 30, 60)) for p in providers],
        PriceTable.load(),
        limiter=TierLimiter({"fast": 2, "standard": 2, "deep": 1}, max_wait=0.05),
        spend=SpendGuard(int(ceiling_usd * 1_000_000)),
        max_retries=retries,
        sleep=_no_sleep,
    )


def request(tier: Tier = "standard", *, interactive: bool = True) -> ModelRequest:
    return ModelRequest(
        use_case="test", tier=tier, messages=[{"role": "user", "content": "hi"}], interactive=interactive
    )


class Answer(BaseModel):
    value: int
    confidence: float = 1.0


def retryable() -> ProviderError:
    return ProviderError("fake", "overloaded", retryable=True)


async def test_complete_records_cost_from_the_price_table() -> None:
    p = FakeProvider(script=[FakeReply(text="ok", input_tokens=1_000_000, output_tokens=100_000)])
    result = await gateway(p).complete(request())
    # 1M input at $2 plus 100k output at $10 per million is $3.00
    assert result.usage.cost_usd_micros == 3_000_000
    assert result.usage.model == "fake-standard"


async def test_retryable_error_is_retried_then_succeeds() -> None:
    p = FakeProvider(script=[FakeReply(error=retryable()), FakeReply(text="ok")])
    g = gateway(p)
    assert (await g.complete(request())).text == "ok"
    assert g.stats.retries == 1


async def test_fails_over_to_second_provider_when_first_exhausts_retries() -> None:
    first = FakeProvider("first", script=[FakeReply(error=retryable()), FakeReply(error=retryable())])
    second = FakeProvider("second", script=[FakeReply(text="from second")])
    g = gateway(first, second)
    result = await g.complete(request())
    assert result.text == "from second"
    assert result.usage.provider == "second"
    assert g.stats.failovers == 1


async def test_non_retryable_error_is_not_failed_over() -> None:
    first = FakeProvider("first", script=[FakeReply(error=ProviderError("first", "bad", retryable=False))])
    second = FakeProvider("second", script=[FakeReply(text="never")])
    with pytest.raises(ProviderError):
        await gateway(first, second).complete(request())
    assert second.calls == []


async def test_all_providers_down_raises_unavailable() -> None:
    p = FakeProvider(script=[FakeReply(error=retryable())] * 2)
    with pytest.raises(AllProvidersUnavailable):
        await gateway(p).complete(request())


async def test_open_breaker_skips_the_provider() -> None:
    first = FakeProvider("first", script=[FakeReply(error=retryable())] * 4)
    second = FakeProvider("second", responder=lambda r, m: FakeReply(text="ok"))
    g = gateway(first, second)
    await g.complete(request())
    await g.complete(request())  # the second exhausted call opens the first breaker (threshold 2)
    calls_before = len(first.calls)
    await g.complete(request())
    assert len(first.calls) == calls_before


async def test_stream_fails_over_before_first_token() -> None:
    first = FakeProvider("first", script=[FakeReply(error=retryable())])
    second = FakeProvider("second", script=[FakeReply(text="hello there world")])
    events = [e async for e in gateway(first, second).stream(request())]
    assert "".join(e.text for e in events if isinstance(e, TextDelta)) == "hello there world"
    done = events[-1]
    assert isinstance(done, StreamDone)
    assert done.completion.usage.cost_usd_micros > 0


async def test_stream_does_not_fail_over_after_first_token() -> None:
    first = FakeProvider("first", script=[FakeReply(text="one two three four", fail_mid_stream=True)])
    second = FakeProvider("second", script=[FakeReply(text="never")])
    received: list[str] = []

    async def consume() -> None:
        async for event in gateway(first, second).stream(request()):
            if isinstance(event, TextDelta):
                received.append(event.text)

    with pytest.raises(ProviderError):
        await consume()
    assert received
    assert second.calls == []


async def test_structured_repairs_once_with_the_validation_errors() -> None:
    p = FakeProvider(script=[FakeReply(text='{"value": "not a number"}'), FakeReply(parsed={"value": 4})])
    result = await gateway(p).structured(request(), Answer)
    assert result.value.value == 4
    assert result.attempts == 2
    assert not result.escalated
    assert "validation_errors" in p.calls[1][0].messages[-1]["content"]


async def test_structured_escalates_one_tier_after_repair_fails() -> None:
    bad = FakeReply(text="nope")
    p = FakeProvider(script=[bad, bad, FakeReply(parsed={"value": 1})])
    result = await gateway(p).structured(request("fast"), Answer)
    assert result.escalated
    assert result.tier == "standard"
    assert [m for _, m in p.calls] == ["fake-fast", "fake-fast", "fake-standard"]
    assert len(result.usage.calls) == 3


async def test_structured_gives_up_after_escalation() -> None:
    p = FakeProvider(responder=lambda r, m: FakeReply(text="nope"))
    with pytest.raises(SchemaInvalid):
        await gateway(p).structured(request("deep"), Answer)
    assert len(p.calls) == 2  # deep has nowhere to escalate


async def test_low_confidence_escalates_without_repair() -> None:
    p = FakeProvider(
        script=[
            FakeReply(parsed={"value": 1, "confidence": 0.2}),
            FakeReply(parsed={"value": 2, "confidence": 0.9}),
        ]
    )
    result = await gateway(p).structured(request("fast"), Answer, confidence=lambda a: a.confidence, min_confidence=0.6)
    assert result.value.value == 2
    assert result.escalated


async def test_low_confidence_without_escalation_raises() -> None:
    p = FakeProvider(responder=lambda r, m: FakeReply(parsed={"value": 1, "confidence": 0.1}))
    with pytest.raises(LowConfidence):
        await gateway(p).structured(
            request(), Answer, escalate=False, confidence=lambda a: a.confidence, min_confidence=0.6
        )


async def test_spend_ceiling_degrades_interactive_to_fast_and_stops_offline() -> None:
    p = FakeProvider(responder=lambda r, m: FakeReply(text="ok", input_tokens=1_000_000))
    g = gateway(p, ceiling_usd=1.0)
    await g.complete(request("standard"))  # $2 spent, over the $1 ceiling
    degraded = await g.complete(request("deep"))
    assert degraded.usage.model == "fake-fast"
    with pytest.raises(SpendCeilingReached):
        await g.complete(request("standard", interactive=False))


async def test_interactive_caller_gets_busy_instead_of_waiting_forever() -> None:
    p = FakeProvider(responder=lambda r, m: FakeReply(text="ok", delay=0.3))
    g = gateway(p)
    with pytest.raises(Busy):
        await asyncio.gather(g.complete(request("deep")), g.complete(request("deep")))


def test_price_table_cost_is_exact_and_rounds_once() -> None:
    prices = PriceTable.load()
    assert prices.cost_micros("claude-sonnet-5-5", input_tokens=1, output_tokens=1) == 12
    assert prices.cost_micros("claude-opus-5-5", input_tokens=0, output_tokens=0, cache_read=1_000_000) == 200_000
    assert prices.cost_micros("anthropic.claude-haiku-5-5", input_tokens=1_000_000, output_tokens=0) == 100_000
    assert prices.cost_micros("claude-sonnet-5-5", input_tokens=1_000_000, output_tokens=0, batch=True) == 1_000_000
    with pytest.raises(UnknownModelPrice):
        prices.cost_micros("unknown-model", input_tokens=1, output_tokens=1)


def test_unpriced_model_fails_construction() -> None:
    with pytest.raises(UnknownModelPrice):
        ModelGateway(
            [
                Route(
                    FakeProvider(),
                    TierModels(fast="mystery", standard="fake-standard", deep="fake-deep"),
                    CircuitBreaker(1, 1, 1),
                )
            ],
            PriceTable.load(),
            limiter=TierLimiter({"fast": 1, "standard": 1, "deep": 1}, 1),
            spend=SpendGuard(1),
        )


def test_request_never_carries_sampling_parameters_or_forced_tool_choice() -> None:
    params = build_params(
        ModelRequest(
            use_case="t",
            tier="standard",
            messages=[{"role": "user", "content": "x"}],
            system=[SystemBlock("stable", cache=True), SystemBlock("volatile")],
            tools=[{"name": "t", "input_schema": {"type": "object"}}],
            effort="low",
        ),
        "claude-sonnet-5-5",
    )
    for banned in ("temperature", "top_p", "top_k", "tool_choice"):
        assert banned not in params
    assert params["system"][0]["cache_control"] == {"type": "ephemeral"}
    assert "cache_control" not in params["system"][1]
    assert params["output_config"] == {"effort": "low"}


def test_breaker_opens_then_half_opens_for_one_probe() -> None:
    now = [0.0]
    b = CircuitBreaker(2, window=30, cooldown=60, clock=lambda: now[0])
    b.record_failure()
    b.record_failure()
    assert b.state == "open"
    assert not b.allow()
    now[0] = 61
    assert b.allow()
    assert not b.allow()
    b.record_success()
    assert b.state == "closed"


async def test_permanent_provider_error_fails_over_without_retrying() -> None:
    no_credit = ProviderError("first", "status 429 insufficient_quota", retryable=False, failover=True)
    first = FakeProvider("first", script=[FakeReply(error=no_credit)])
    second = FakeProvider("second", script=[FakeReply(text="served")])
    g = gateway(first, second, retries=2)
    result = await g.complete(request())
    assert result.usage.provider == "second"
    assert len(first.calls) == 1
    assert g.stats.retries == 0
