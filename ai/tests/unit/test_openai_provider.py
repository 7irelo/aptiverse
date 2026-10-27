from __future__ import annotations

from types import SimpleNamespace
from typing import Any

import pytest

from aptiverse_ai.gateway.errors import Refused
from aptiverse_ai.gateway.gateway import ModelGateway, Route
from aptiverse_ai.gateway.prices import PriceTable
from aptiverse_ai.gateway.providers.fake import FakeProvider, FakeReply
from aptiverse_ai.gateway.providers.openai_provider import build_params, to_completion
from aptiverse_ai.gateway.resilience import CircuitBreaker, SpendGuard, TierLimiter
from aptiverse_ai.gateway.types import ModelRequest, SystemBlock
from aptiverse_ai.settings import TierModels


def _req(**kw: Any) -> ModelRequest:
    return ModelRequest(
        use_case="t", tier="standard", messages=kw.pop("messages", [{"role": "user", "content": "q"}]), **kw
    )


def test_system_blocks_become_instructions_and_tools_become_functions() -> None:
    params = build_params(
        _req(
            system=[SystemBlock("one", cache=True), SystemBlock("two")],
            tools=[
                {
                    "name": "search",
                    "description": "find",
                    "input_schema": {"type": "object", "properties": {}},
                }
            ],
            effort="xhigh",
        ),
        "gpt-6.1-terra",
    )
    assert params["instructions"] == "one\n\ntwo"
    assert params["tools"][0] == {
        "type": "function",
        "name": "search",
        "description": "find",
        "parameters": {"type": "object", "properties": {}},
        "strict": False,
    }
    assert params["reasoning"] == {"effort": "high"}
    assert params["store"] is False
    for banned in ("temperature", "top_p", "tool_choice"):
        assert banned not in params


def test_tool_use_and_tool_result_blocks_translate_to_function_items() -> None:
    messages = [
        {"role": "user", "content": "solve"},
        {
            "role": "assistant",
            "content": [
                {"type": "text", "text": "checking"},
                {"type": "tool_use", "id": "c1", "name": "sympy", "input": {"x": 1}},
            ],
        },
        {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "c1", "content": "2"}]},
    ]
    items = build_params(_req(messages=messages), "m")["input"]
    assert {"type": "function_call", "call_id": "c1", "name": "sympy", "arguments": '{"x": 1}'} in items
    assert {"type": "function_call_output", "call_id": "c1", "output": "2"} in items
    assert {"role": "assistant", "content": "checking"} in items


def _response(output: list[Any], input_tokens: int = 1000, cached: int = 400, output_tokens: int = 50) -> Any:
    return SimpleNamespace(
        output=output,
        incomplete_details=None,
        usage=SimpleNamespace(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            input_tokens_details=SimpleNamespace(cached_tokens=cached),
        ),
    )


def test_cached_tokens_are_split_out_of_input_tokens() -> None:
    msg = SimpleNamespace(type="message", content=[SimpleNamespace(type="output_text", text="hi")])
    completion = to_completion("openai", "gpt-6.1-terra", _req(), _response([msg]))
    assert completion.text == "hi"
    assert completion.usage.input_tokens == 600
    assert completion.usage.cache_read_input_tokens == 400


def test_function_calls_become_tool_uses() -> None:
    call = SimpleNamespace(type="function_call", call_id="c9", name="search", arguments='{"q": "photosynthesis"}')
    completion = to_completion("openai", "m", _req(), _response([call]))
    assert completion.stop_reason == "tool_use"
    assert completion.tool_uses[0].input == {"q": "photosynthesis"}


def test_refusal_raises() -> None:
    msg = SimpleNamespace(type="message", content=[SimpleNamespace(type="refusal", refusal="no")])
    with pytest.raises(Refused):
        to_completion("openai", "m", _req(), _response([msg]))


async def test_use_case_preference_routes_judging_to_the_other_model_family() -> None:
    anthropic = FakeProvider("anthropic", responder=lambda r, m: FakeReply(text="a"))
    openai = FakeProvider("openai", responder=lambda r, m: FakeReply(text="o"))
    models = TierModels(fast="fake-fast", standard="fake-standard", deep="fake-deep")
    g = ModelGateway(
        [
            Route(anthropic, models, CircuitBreaker(5, 30, 60)),
            Route(openai, models, CircuitBreaker(5, 30, 60)),
        ],
        PriceTable.load(),
        limiter=TierLimiter({"fast": 4, "standard": 4, "deep": 4}, 1),
        spend=SpendGuard(10_000_000),
        preferences={"judge": ["openai", "anthropic"]},
    )
    judged = await g.complete(
        ModelRequest(use_case="judge.level", tier="standard", messages=[{"role": "user", "content": "x"}])
    )
    generated = await g.complete(
        ModelRequest(use_case="practice.generate", tier="standard", messages=[{"role": "user", "content": "x"}])
    )
    assert judged.usage.provider == "openai"
    assert generated.usage.provider == "anthropic"


def test_openai_prices_are_loaded() -> None:
    prices = PriceTable.load()
    assert (
        prices.cost_micros("gpt-6.1-terra", input_tokens=1_000_000, output_tokens=0, cache_read=1_000_000) == 1_050_000
    )
