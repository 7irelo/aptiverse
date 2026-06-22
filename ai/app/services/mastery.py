"""Mastery Estimator → mastery.topic_masteries.

Inputs : per-topic practice attempt correctness, assessment results.
Method : Bayesian Knowledge Tracing (pyBKT) / IRT per (student, topic).
         Psychometric standard — explainable to schools, unlike an opaque LLM.
Weight : heavy. Cadence: nightly + on practice-submit event.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class MasteryEstimatorService(AnalyticsService):
    name = "mastery"
    weight = "heavy"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
