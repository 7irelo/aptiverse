from __future__ import annotations

import logging
import sys

import structlog
from opentelemetry import trace
from structlog.typing import EventDict, WrappedLogger

# Keys that may carry prompt or completion text. Dropped at info level so content never reaches CloudWatch.
_CONTENT_KEYS = frozenset({"prompt", "completion", "content", "text", "messages", "answer", "question"})


def _add_trace(_: WrappedLogger, __: str, event: EventDict) -> EventDict:
    ctx = trace.get_current_span().get_span_context()
    if ctx.is_valid:
        event["trace_id"] = format(ctx.trace_id, "032x")
        event["span_id"] = format(ctx.span_id, "016x")
    return event


def _drop_content(_: WrappedLogger, method: str, event: EventDict) -> EventDict:
    if method != "debug":
        for key in _CONTENT_KEYS.intersection(event):
            event[key] = "[redacted]"
    return event


def configure(*, json_output: bool = True, level: int = logging.INFO) -> None:
    renderer: structlog.typing.Processor = (
        structlog.processors.JSONRenderer() if json_output else structlog.dev.ConsoleRenderer()
    )
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            _add_trace,
            _drop_content,
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(level),
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        cache_logger_on_first_use=True,
    )
