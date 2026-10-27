"""Postgres access with psycopg 3. The `aptiverse_ai` role owns only the `rag` and `graph` schemas."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any, LiteralString, cast

from pgvector.psycopg import register_vector_async
from psycopg import AsyncConnection
from psycopg.rows import DictRow, dict_row
from psycopg_pool import AsyncConnectionPool

from aptiverse_ai.settings import DatabaseSettings

type Conn = AsyncConnection[DictRow]
type Pool = AsyncConnectionPool[AsyncConnection[DictRow]]


def sql(text: str) -> LiteralString:
    """Marks SQL assembled in this codebase from fixed fragments (column lists, WHERE clauses built from a
    known set of filters) as safe to execute. Values are never formatted in; they always go as parameters."""
    return cast(LiteralString, text)


async def configure_connection(conn: AsyncConnection[Any]) -> None:
    await register_vector_async(conn)


def create_pool(settings: DatabaseSettings) -> Pool:
    return AsyncConnectionPool(
        settings.url.get_secret_value(),
        connection_class=AsyncConnection[DictRow],
        min_size=settings.pool_min,
        max_size=settings.pool_max,
        configure=configure_connection,
        open=False,
        kwargs={"autocommit": False, "row_factory": dict_row},
    )


@asynccontextmanager
async def as_user(pool: Pool, user_id: str) -> AsyncGenerator[Conn]:
    """A transaction with `app.user_id` set, so row-level security limits private rows to this user.
    `set_config(..., true)` scopes the setting to the transaction; it never leaks to the next borrower."""
    async with pool.connection() as conn, conn.transaction():
        await conn.execute("select set_config('app.user_id', %s, true)", (user_id,))
        yield conn
