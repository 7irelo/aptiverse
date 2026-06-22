"""Base class every analytics service implements.

Contract: read raw signals → compute → idempotently upsert a projection table,
stamping computed_at + model_version. Safe to re-run; safe to run per-student
(event-driven) or over all students (scheduled / backfill).
"""

from __future__ import annotations

import abc
import time

from app.core.logging import get_logger

log = get_logger(__name__)


class AnalyticsService(abc.ABC):
    #: stable key used in the registry, /trigger/{name}, and job logs.
    name: str
    #: "light" | "medium" | "heavy" — drives scheduling/provisioning.
    weight: str = "light"

    async def run(self, user_id: str | None = None) -> dict[str, object]:
        started = time.perf_counter()
        scope = user_id or "ALL"
        log.info("service.start", service=self.name, scope=scope)
        rows = await self.compute(user_id=user_id)
        elapsed = round(time.perf_counter() - started, 3)
        log.info("service.done", service=self.name, scope=scope, rows=rows, seconds=elapsed)
        return {"rows_written": rows, "seconds": elapsed, "scope": scope}

    @abc.abstractmethod
    async def compute(self, user_id: str | None) -> int:
        """Do the work; return number of analytics rows written. Implemented by
        the per-service builder agents in Phase 4."""
        raise NotImplementedError
