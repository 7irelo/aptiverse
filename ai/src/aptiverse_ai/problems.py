"""RFC 9457 problem responses. Every error carries a traceId and never an exception message."""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from opentelemetry import trace
from starlette.exceptions import HTTPException as StarletteHTTPException

log = structlog.get_logger()


class AppError(Exception):
    """An expected failure with a stable machine-readable code, mapped to an HTTP status."""

    status: int = 400

    def __init__(self, code: str, detail: str, *, status: int | None = None, headers: dict[str, str] | None = None):
        super().__init__(code)
        self.code = code
        self.detail = detail
        if status is not None:
            self.status = status
        self.headers = headers or {}


class NotFound(AppError):
    status = 404


class Conflict(AppError):
    status = 409


class Unavailable(AppError):
    status = 503


def trace_id() -> str:
    ctx = trace.get_current_span().get_span_context()
    return format(ctx.trace_id, "032x") if ctx.is_valid else "0" * 32


def problem(status: int, title: str, code: str, detail: str | None = None, **extra: Any) -> JSONResponse:
    body: dict[str, Any] = {
        "type": f"https://aptiverse.co.za/problems/{code}",
        "title": title,
        "status": status,
        "code": code,
        "traceId": trace_id(),
    }
    if detail:
        body["detail"] = detail
    body.update(extra)
    return JSONResponse(body, status_code=status, media_type="application/problem+json")


def install(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        response = problem(exc.status, exc.code, exc.code, exc.detail)
        response.headers.update(exc.headers)
        return response

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        errors = [{"loc": list(e["loc"]), "msg": e["msg"]} for e in exc.errors()]
        return problem(400, "validation", "validation", "The request is not valid.", errors=errors)

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        code = {401: "unauthorized", 403: "forbidden", 404: "not_found", 405: "method_not_allowed"}.get(
            exc.status_code, "http_error"
        )
        response = problem(exc.status_code, code, code)
        if exc.headers:
            response.headers.update(exc.headers)
        return response

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        log.exception("unhandled_exception", error_type=type(exc).__name__)
        return problem(500, "internal", "internal", "Something went wrong.")
