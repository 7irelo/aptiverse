"""Grade-Distribution Builder → insights.grade_distributions.

Inputs : assessment marks, practice scores.
Method : histogram / bucketing (polars).
Weight : light. Cadence: every 15 min + on event.

Phase-4 builder agent implements compute(). Stub returns 0 so the skeleton runs.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class GradeDistributionService(AnalyticsService):
    name = "grade_distribution"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
