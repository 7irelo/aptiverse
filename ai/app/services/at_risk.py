"""At-Risk Predictor → insights.risk_scores (new table).

Inputs : full feature vector — marks, engagement, mood, mastery.
Method : LightGBM classifier; SHAP values for human-readable reasons.
         Train weekly, infer nightly.
Weight : heavy. Cadence: nightly infer / weekly train.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class AtRiskPredictorService(AnalyticsService):
    name = "at_risk"
    weight = "heavy"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
