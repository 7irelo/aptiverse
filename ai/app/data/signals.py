"""Read raw student signals from the shared Postgres.

This is the ONE place that normalizes the mixed string/long student-id situation
until Phase-2 unification lands. Every service reads through these helpers so the
id handling stays in a single, testable spot.

Phase-4 builder agents add concrete query functions (assessments, practice,
mood, diary, goals, calendar, audit) as their services need them.
"""

from __future__ import annotations

from sqlalchemy import text

from app.core.db import session_scope


async def all_student_ids() -> list[str]:
    """Canonical student identity = identity.users.Id (string)."""
    async with session_scope() as s:
        rows = await s.execute(text('SELECT "Id" FROM identity.users'))
        return [r[0] for r in rows.all()]
