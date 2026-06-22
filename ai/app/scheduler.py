"""APScheduler — nightly/periodic batch runs of the analytics services.

Start with:  python -m app.scheduler

Cadence mirrors ARCHITECTURE.md §5/§6:
    every 15 min : grade_distribution
    nightly 02:00: subject_analytics -> mastery -> gaps -> growth -> tips -> at_risk
"""

from __future__ import annotations

import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.logging import configure_logging, get_logger
from app.services import REGISTRY

log = get_logger(__name__)

# Nightly order respects data dependencies (mastery before gaps/tips/at_risk).
NIGHTLY_ORDER = ["subject_analytics", "mastery", "gaps", "growth", "tips", "at_risk"]


async def _run(name: str) -> None:
    await REGISTRY[name].run(user_id=None)


async def _nightly() -> None:
    for name in NIGHTLY_ORDER:
        try:
            await _run(name)
        except Exception:  # one failure shouldn't abort the rest
            log.exception("nightly_job_failed", service=name)


def build_scheduler() -> AsyncIOScheduler:
    sched = AsyncIOScheduler(timezone="Africa/Johannesburg")
    sched.add_job(lambda: asyncio.create_task(_run("grade_distribution")),
                  IntervalTrigger(minutes=15), id="grade_distribution")
    sched.add_job(lambda: asyncio.create_task(_nightly()),
                  CronTrigger(hour=2, minute=0), id="nightly")
    return sched


async def main() -> None:
    configure_logging()
    sched = build_scheduler()
    sched.start()
    log.info("scheduler.started", jobs=[j.id for j in sched.get_jobs()])
    await asyncio.Event().wait()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
