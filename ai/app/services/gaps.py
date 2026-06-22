"""Knowledge-Gap Detector → mastery.knowledge_gaps.

Inputs : low topic mastery, wrong-answer concepts.
Method : thresholds + clustering over mastery scores and error topics; rate
         severity; track last-tested timestamp.
Weight : medium. Cadence: nightly (after mastery).
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class KnowledgeGapService(AnalyticsService):
    name = "gaps"
    weight = "medium"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
