"""Circuit breaker, per-tier concurrency limiter and the daily spend guard."""

from __future__ import annotations

import asyncio
import time
from collections import deque
from collections.abc import AsyncGenerator, Callable
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Literal

from aptiverse_ai.gateway.errors import Busy

Clock = Callable[[], float]
BreakerState = Literal["closed", "open", "half_open"]


class CircuitBreaker:
    """Opens after `failures` errors inside `window` seconds; lets one probe through after `cooldown`."""

    def __init__(self, failures: int, window: float, cooldown: float, clock: Clock = time.monotonic):
        self._threshold = failures
        self._window = window
        self._cooldown = cooldown
        self._clock = clock
        self._errors: deque[float] = deque()
        self._opened_at: float | None = None
        self._probing = False

    @property
    def state(self) -> BreakerState:
        if self._opened_at is None:
            return "closed"
        if self._clock() - self._opened_at >= self._cooldown:
            return "half_open"
        return "open"

    def allow(self) -> bool:
        state = self.state
        if state == "closed":
            return True
        if state == "half_open" and not self._probing:
            self._probing = True
            return True
        return False

    def record_success(self) -> None:
        self._errors.clear()
        self._opened_at = None
        self._probing = False

    def record_failure(self) -> None:
        now = self._clock()
        if self.state == "half_open":
            self._opened_at = now
            self._probing = False
            return
        self._errors.append(now)
        while self._errors and now - self._errors[0] > self._window:
            self._errors.popleft()
        if len(self._errors) >= self._threshold:
            self._opened_at = now


class TierLimiter:
    """Bounds concurrent calls per tier. A caller waiting longer than `max_wait` gets `Busy` instead of hanging."""

    def __init__(self, limits: dict[str, int], max_wait: float):
        self._semaphores = {tier: asyncio.Semaphore(n) for tier, n in limits.items()}
        self._max_wait = max_wait
        self.last_wait_seconds = 0.0

    @asynccontextmanager
    async def slot(self, tier: str, *, interactive: bool) -> AsyncGenerator[None]:
        semaphore = self._semaphores[tier]
        started = time.monotonic()
        # Offline work waits as long as it needs; interactive callers are told to come back.
        timeout = self._max_wait if interactive else None
        try:
            await asyncio.wait_for(semaphore.acquire(), timeout=timeout)
        except TimeoutError as exc:
            raise Busy() from exc
        self.last_wait_seconds = time.monotonic() - started
        try:
            yield
        finally:
            semaphore.release()


@dataclass(slots=True)
class SpendGuard:
    """Tracks today's spend in this process. At 80% it warns; at 100% interactive calls drop to the
    fast tier and offline work stops. The persistent total lives in .NET `ai_usage`; this is the brake."""

    ceiling_usd_micros: int
    today: str = field(default_factory=lambda: datetime.now(UTC).date().isoformat())
    spent_usd_micros: int = 0

    def record(self, cost_usd_micros: int) -> None:
        self._roll()
        self.spent_usd_micros += cost_usd_micros

    @property
    def ratio(self) -> float:
        self._roll()
        if self.ceiling_usd_micros <= 0:
            return 0.0
        return self.spent_usd_micros / self.ceiling_usd_micros

    def exhausted(self) -> bool:
        return self.ratio >= 1.0

    def _roll(self) -> None:
        now = datetime.now(UTC).date().isoformat()
        if now != self.today:
            self.today = now
            self.spent_usd_micros = 0
