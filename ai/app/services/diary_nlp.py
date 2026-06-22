"""Diary NLP → diary_entries AI fields + pgvector embeddings.

Inputs : diary_entries.content.
Method : VADER lexicon sentiment (fast path) + sentence-transformers embeddings
         for theme clustering. LOCAL ONLY — no student diary text leaves the box
         (this replaces the previous Claude path; OpenAI is chatbot-only).
Weight : light (sentiment) → heavy (embeddings). Cadence: on write (event).
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.services.base import AnalyticsService

log = get_logger(__name__)


class DiaryNlpService(AnalyticsService):
    name = "diary_nlp"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        log.warning("not_implemented", service=self.name)
        return 0
