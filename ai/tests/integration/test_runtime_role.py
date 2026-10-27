from __future__ import annotations

import psycopg
import pytest
from psycopg import AsyncConnection, errors

from aptiverse_ai.cli import ensure_runtime_role

pytestmark = pytest.mark.integration


async def test_runtime_role_gets_dml_but_not_ddl_or_rls_bypass(postgres_urls: tuple[str, str]) -> None:
    owner, app = postgres_urls
    async with await AsyncConnection.connect(owner, autocommit=True) as conn:
        await conn.execute("create schema if not exists graph")
        await ensure_runtime_role(conn, "ai_runtime_test", "pw-runtime-1")
        await ensure_runtime_role(conn, "ai_runtime_test", "pw-runtime-2")  # idempotent, rotates the password
        row = await (
            await conn.execute("select rolbypassrls, rolsuper from pg_roles where rolname = 'ai_runtime_test'")
        ).fetchone()
        assert row == (False, False)
    runtime = app.replace("aptiverse_ai:app-test-password", "ai_runtime_test:pw-runtime-2")
    with psycopg.connect(runtime, autocommit=True) as conn:
        conn.execute("select count(*) from rag.documents")
        with pytest.raises(errors.InsufficientPrivilege):
            conn.execute("create table rag.evil (id int)")
        with pytest.raises(errors.InsufficientPrivilege):
            conn.execute("drop table rag.chunks")


async def test_runtime_role_name_is_validated(postgres_urls: tuple[str, str]) -> None:
    owner, _ = postgres_urls
    async with await AsyncConnection.connect(owner, autocommit=True) as conn:
        with pytest.raises(ValueError, match="identifier"):
            await ensure_runtime_role(conn, "bad; drop table x", "pw")
