"""Price table in USD micros per million tokens. Pure arithmetic, tested to the micro."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml

_DEFAULT_TABLE = Path(__file__).with_name("prices.yaml")


@dataclass(frozen=True, slots=True)
class ModelPrice:
    input: int
    output: int
    cache_write: int
    cache_read: int
    batch_discount_percent: int = 50


class UnknownModelPrice(KeyError):
    pass


class PriceTable:
    def __init__(self, prices: dict[str, ModelPrice]):
        self._prices = prices

    @classmethod
    def load(cls, path: Path = _DEFAULT_TABLE) -> PriceTable:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
        return cls({model: ModelPrice(**values) for model, values in raw["models"].items()})

    def __contains__(self, model: str) -> bool:
        return self._normalise(model) in self._prices

    def require(self, models: list[str]) -> None:
        missing = [m for m in models if m not in self]
        if missing:
            raise UnknownModelPrice(f"no price for {', '.join(missing)}")

    def cost_micros(
        self,
        model: str,
        *,
        input_tokens: int,
        output_tokens: int,
        cache_read: int = 0,
        cache_write: int = 0,
        batch: bool = False,
    ) -> int:
        key = self._normalise(model)
        if key not in self._prices:
            raise UnknownModelPrice(model)
        p = self._prices[key]
        # Integer maths on token-micros, rounded once at the end, so totals never drift.
        token_micros = (
            input_tokens * p.input + output_tokens * p.output + cache_read * p.cache_read + cache_write * p.cache_write
        )
        cost = (token_micros + 500_000) // 1_000_000
        if batch:
            cost = (cost * (100 - p.batch_discount_percent) + 50) // 100
        return cost

    @staticmethod
    def _normalise(model: str) -> str:
        # Bedrock ids carry a provider prefix; prices are keyed by the base model id.
        return model.removeprefix("anthropic.").removeprefix("us.").removeprefix("eu.")
