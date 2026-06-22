"""Subject-Analytics Aggregator → mastery.student_subject_analytics.

Inputs : audit log, calendar, practice, mood.
Method : feature engineering / aggregation (polars) — study-time-of-day,
         consistency, engagement, resource usage, psychosocial proxies.
Weight : medium. Cadence: nightly.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class SubjectAnalyticsService(AnalyticsService):
    name = "subject_analytics"
    weight = "medium"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
