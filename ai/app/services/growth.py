"""Growth-Tracking Computer → goals.growth_trackings.

Inputs : goal progress, assessment trend, mood trend.
Method : rolling deltas / EWMA across academic, study-habit, emotional, overall.
Weight : light. Cadence: nightly.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class GrowthTrackingService(AnalyticsService):
    name = "growth"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
