"""Idempotent upserts into the analytics projection tables.

Every analytics row carries computed_at + model_version so outputs are
reproducible and a bad run can simply be recomputed. Phase-4 builder agents add
a typed upsert per target table; this module owns the conventions.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import get_settings


def stamp() -> dict[str, object]:
    """Common audit columns for every analytics write."""
    return {
        "computed_at": datetime.now(timezone.utc),
        "model_version": get_settings().model_version,
    }
