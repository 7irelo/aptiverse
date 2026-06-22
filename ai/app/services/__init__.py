"""Service registry.

Each analytics service registers here so the worker, scheduler, and /trigger
endpoint can find it by name. Phase-4 builder agents implement the .compute()
bodies; the registry wiring stays here.

Cadence/weight (see ARCHITECTURE.md §5):
    light   — grade_distribution, growth, tips, diary_nlp(fast path)
    medium  — subject_analytics, gaps
    heavy   — mastery, at_risk
    llm     — chatbot (not an AnalyticsService; lives in chatbot.py)
"""

from __future__ import annotations

from app.services.at_risk import AtRiskPredictorService
from app.services.base import AnalyticsService
from app.services.diary_nlp import DiaryNlpService
from app.services.gaps import KnowledgeGapService
from app.services.grade_distribution import GradeDistributionService
from app.services.growth import GrowthTrackingService
from app.services.mastery import MasteryEstimatorService
from app.services.subject_analytics import SubjectAnalyticsService
from app.services.tips import ImprovementTipsService

REGISTRY: dict[str, AnalyticsService] = {
    s.name: s
    for s in (
        GradeDistributionService(),
        GrowthTrackingService(),
        ImprovementTipsService(),
        SubjectAnalyticsService(),
        KnowledgeGapService(),
        MasteryEstimatorService(),
        AtRiskPredictorService(),
        DiaryNlpService(),
    )
}

__all__ = ["REGISTRY", "AnalyticsService"]
