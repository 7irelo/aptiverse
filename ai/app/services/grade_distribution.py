"""Grade-Distribution Builder → insights.grade_distributions.

Inputs : graded assessment marks + submitted practice scores, read via signals
         and resolved to the owning academic_planning.student_subjects.id.
Method : bucket each 0-100 mark into a South-African achievement-level band and
         histogram per (student_subject_id, band) with polars + numpy.
Weight : light / CPU. Cadence: every 15 min + on event.

A "grade" in insights.grade_distributions.grade is a free-text band label (see
the GradeDistribution entity). We use the NSC/CAPS 7-level achievement scale,
which is what schools recognise and what the rest of the product speaks:

    Level 7  80-100  Outstanding
    Level 6  70-79   Meritorious
    Level 5  60-69   Substantial
    Level 4  50-59   Adequate
    Level 3  40-49   Moderate
    Level 2  30-39   Elementary
    Level 1   0-29   Not achieved

Both assessment marks and practice scores feed the same histogram so the band
counts reflect a student's whole body of work in a subject. The write is
idempotent: re-running replaces the count for every (student_subject_id, band).
Heavy ML libs are never imported here — this is a light polars/numpy builder.
"""

from __future__ import annotations

from typing import Any

from app.core.logging import get_logger
from app.data import signals
from app.data.sinks import upsert_grade_distributions
from app.services.base import AnalyticsService

log = get_logger(__name__)

# NSC/CAPS 7-level achievement scale. Ordered low→high so numpy.digitize maps a
# 0-100 mark to its band index. ``bins`` are the lower edges above Level 1.
_BAND_LABELS = (
    "Level 1 (0-29) Not achieved",
    "Level 2 (30-39) Elementary",
    "Level 3 (40-49) Moderate",
    "Level 4 (50-59) Adequate",
    "Level 5 (60-69) Substantial",
    "Level 6 (70-79) Meritorious",
    "Level 7 (80-100) Outstanding",
)
_BAND_EDGES = (30, 40, 50, 60, 70, 80)  # len == len(_BAND_LABELS) - 1


class GradeDistributionService(AnalyticsService):
    name = "grade_distribution"
    weight = "light"

    async def compute(self, user_id: str | None) -> int:
        # numpy is a light dep but kept local to match the project's lazy-import
        # convention (module imports with only the minimal deps installed).
        import numpy as np

        # Both sources already resolve to student_subjects.id and expose a
        # 0-100 ``mark`` column (see signals docstrings).
        marks = await self._collect_marks(user_id)
        if not marks:
            log.info("grade_distribution.no_marks", scope=user_id or "ALL")
            return 0

        ssids = np.fromiter((m["student_subject_id"] for m in marks), dtype=np.int64)
        values = np.fromiter((m["mark"] for m in marks), dtype=np.float64)

        # Clamp to the valid 0-100 range, then bucket into a band index.
        values = np.clip(values, 0.0, 100.0)
        band_idx = np.digitize(values, _BAND_EDGES, right=False)

        # Count per (student_subject_id, band). Build the rows the sink expects;
        # the sink stamps computed_at/model_version and upserts idempotently.
        rows = self._histogram(ssids, band_idx)
        if not rows:
            return 0

        written = await upsert_grade_distributions(rows)
        log.info(
            "grade_distribution.upserted",
            scope=user_id or "ALL",
            student_subjects=len({r["student_subject_id"] for r in rows}),
            buckets=len(rows),
            rows=written,
        )
        return written

    async def _collect_marks(self, user_id: str | None) -> list[dict[str, Any]]:
        """Read assessment + practice marks (already resolved to
        student_subject_id) and normalize to plain ``{student_subject_id, mark}``
        dicts. Tolerates either the polars or list[dict] return shape from
        signals so the service runs with or without polars installed."""
        rows: list[dict[str, Any]] = []
        for fetch in (signals.assessment_subject_marks, signals.practice_subject_marks):
            rows.extend(self._as_dicts(await fetch(user_id)))
        # Drop anything missing the key or the mark (e.g. unjoined rows).
        clean: list[dict[str, Any]] = []
        for r in rows:
            ssid = r.get("student_subject_id")
            mark = r.get("mark")
            if ssid is None or mark is None:
                continue
            clean.append({"student_subject_id": int(ssid), "mark": float(mark)})
        return clean

    @staticmethod
    def _as_dicts(frame: Any) -> list[dict[str, Any]]:
        """Normalize a signals result (polars DataFrame or list[dict]) to a list
        of row dicts."""
        if frame is None:
            return []
        if isinstance(frame, list):
            return frame
        # polars DataFrame
        to_dicts = getattr(frame, "to_dicts", None)
        if callable(to_dicts):
            return to_dicts()
        return list(frame)

    @staticmethod
    def _histogram(ssids: Any, band_idx: Any) -> list[dict[str, Any]]:
        """Count marks per (student_subject_id, band) and emit one sink row per
        non-empty bucket. Every band a student-subject has at least one mark in
        is written so stale higher/lower bands from a prior run are not implied;
        the sink upserts on (student_subject_id, grade)."""
        import numpy as np

        if ssids.size == 0:
            return []

        # Composite key = (student_subject_id, band_idx). np.unique with counts
        # gives the histogram in one pass.
        pairs = np.stack((ssids, band_idx.astype(np.int64)), axis=1)
        uniq, counts = np.unique(pairs, axis=0, return_counts=True)

        rows: list[dict[str, Any]] = []
        for (ssid, band), count in zip(uniq, counts, strict=True):
            rows.append(
                {
                    "student_subject_id": int(ssid),
                    "grade": _BAND_LABELS[int(band)],
                    "count": int(count),
                }
            )
        return rows
