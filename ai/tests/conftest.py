from __future__ import annotations

import asyncio
import os
import sys
from collections.abc import AsyncGenerator, Iterator
from pathlib import Path

import psycopg
import pytest
from psycopg.rows import DictRow, dict_row
from psycopg_pool import AsyncConnectionPool

from aptiverse_ai.db import Pool, configure_connection

if sys.platform == "win32":
    # psycopg's async mode cannot run on the Proactor loop that Windows uses by default.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # pyright: ignore[reportDeprecated]

ROOT = Path(__file__).resolve().parent.parent
APP_PASSWORD = "app-test-password"
DIMENSIONS = 384


def _migrate(url: str) -> None:
    from alembic import command
    from alembic.config import Config

    os.environ["AI__EMBEDDINGS__DIMENSIONS"] = str(DIMENSIONS)
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "src" / "aptiverse_ai" / "migrations"))
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")


@pytest.fixture(scope="session")
def postgres_urls() -> Iterator[tuple[str, str]]:
    """Starts pgvector Postgres, migrates as the owner, and returns (owner_url, app_url).

    The app URL logs in as `aptiverse_ai`, a plain role with DML only: no superuser, no BYPASSRLS. Tests
    that check row-level security must use it, because a superuser skips every policy."""
    from testcontainers.community.postgres import PostgresContainer

    with PostgresContainer("pgvector/pgvector:pg17", driver=None) as pg:
        owner = pg.get_connection_url()
        _migrate(owner)
        with psycopg.connect(owner, autocommit=True) as conn:
            conn.execute(f"create role aptiverse_ai login password '{APP_PASSWORD}'")
            conn.execute("grant usage on schema rag to aptiverse_ai")
            conn.execute("grant select, insert, update, delete on all tables in schema rag to aptiverse_ai")
        host, port = pg.get_container_host_ip(), pg.get_exposed_port(5432)
        app = f"postgresql://aptiverse_ai:{APP_PASSWORD}@{host}:{port}/{pg.dbname}"
        yield owner, app


@pytest.fixture
async def app_pool(postgres_urls: tuple[str, str]) -> AsyncGenerator[Pool]:
    owner, app = postgres_urls
    with psycopg.connect(owner, autocommit=True) as conn:
        conn.execute("truncate rag.documents, rag.private_documents cascade")
    pool: Pool = AsyncConnectionPool(
        app,
        connection_class=psycopg.AsyncConnection[DictRow],
        min_size=1,
        max_size=4,
        configure=configure_connection,
        kwargs={"row_factory": dict_row},
        open=False,
    )
    await pool.open()
    yield pool
    await pool.close()
