"""Improvement-Tips Generator → insights.improvement_tips.

Inputs : knowledge gaps, study patterns, goal gaps.
Method : RULES + retrieval over a curated, curriculum-aligned tip/resource bank
         (embedding similarity). No LLM — deterministic and reviewable.
Weight : light. Cadence: nightly.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class ImprovementTipsService(AnalyticsService):
    name = "tips"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
