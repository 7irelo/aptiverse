"""`aptiverse-ai serve | migrate | ingest | eval`.

migrate runs as a one-off ECS task with the migration role (it creates schemas and the LangGraph checkpoint
tables); the long-running service never migrates at startup.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _selector_loop() -> None:
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # pyright: ignore[reportDeprecated]


def serve(args: argparse.Namespace) -> None:
    import uvicorn

    from aptiverse_ai.app import create_app

    uvicorn.run(
        create_app(),
        host=args.host,
        port=args.port,
        proxy_headers=False,  # internal only; never trust forwarded headers
        server_header=False,
        timeout_graceful_shutdown=20,
        loop="asyncio",
    )


async def _migrate() -> None:
    from alembic import command
    from alembic.config import Config
    from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
    from psycopg import AsyncConnection

    from aptiverse_ai.settings import DatabaseSettings

    db = DatabaseSettings.model_validate(_database_env())
    url = db.dsn()
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("sqlalchemy.url", _sqlalchemy_url(url))
    cfg.set_main_option("script_location", str(ROOT / "src" / "aptiverse_ai" / "migrations"))
    await asyncio.to_thread(command.upgrade, cfg, "head")
    async with await AsyncConnection.connect(url, autocommit=True) as conn:
        await conn.execute("create schema if not exists graph")
        if db.runtime_username and db.runtime_password:
            await ensure_runtime_role(conn, db.runtime_username, db.runtime_password.get_secret_value())
    async with await AsyncConnection.connect(
        url, autocommit=True, prepare_threshold=0, options="-c search_path=graph"
    ) as conn:
        await AsyncPostgresSaver(conn).setup()  # pyright: ignore[reportArgumentType]
    async with await AsyncConnection.connect(url, autocommit=True) as conn:
        if db.runtime_username:
            # Default privileges cover tables created later; this covers the checkpoint tables just created.
            await _grant_graph(conn, db.runtime_username)
    print("migrations applied: rag schema, graph checkpoint tables and runtime role grants")


def _database_env() -> dict[str, str]:
    prefix = "AI__DATABASE__"
    return {k[len(prefix) :].lower(): v for k, v in os.environ.items() if k.startswith(prefix)}


def _sqlalchemy_url(conninfo: str) -> str:
    from psycopg.conninfo import conninfo_to_dict
    from sqlalchemy.engine import URL

    if conninfo.startswith("postgresql://"):
        return conninfo
    parts = conninfo_to_dict(conninfo)
    url = URL.create(
        "postgresql+psycopg",
        username=str(parts.get("user")),
        password=str(parts.get("password")),
        host=str(parts.get("host")),
        port=int(str(parts.get("port", 5432))),
        database=str(parts.get("dbname")),
        query={"sslmode": str(parts.get("sslmode", "require"))},
    )
    return url.render_as_string(hide_password=False)


async def ensure_runtime_role(conn: object, role: str, password: str) -> None:
    """Creates or updates the ai runtime role: login, DML on rag and graph, no DDL, no BYPASSRLS. Identifiers
    and the password go through format(%I, %L) on the server, never through Python string formatting."""
    import re

    from psycopg import AsyncConnection

    assert isinstance(conn, AsyncConnection)
    if not re.fullmatch(r"[a-z_][a-z0-9_]{0,62}", role):
        raise ValueError("runtime role name must be a plain lower-case identifier")
    current = await (await conn.execute("select current_user")).fetchone()
    if current and current[0] == role:
        raise ValueError("the runtime role must differ from the migration login")
    exists = await (await conn.execute("select 1 from pg_roles where rolname = %s", [role])).fetchone()
    verb = "alter" if exists else "create"
    statement = await (
        await conn.execute(
            "select format('"
            + verb
            + " role %%I with login nosuperuser nocreatedb nocreaterole nobypassrls password %%L', %s::text, %s::text)",
            [role, password],
        )
    ).fetchone()
    assert statement is not None
    await conn.execute(statement[0])
    for schema in ("rag", "graph"):
        for template in (
            "grant usage on schema %I to %I",
            "grant select, insert, update, delete on all tables in schema %I to %I",
            "grant usage, select on all sequences in schema %I to %I",
            "alter default privileges in schema %I grant select, insert, update, delete on tables to %I",
            "alter default privileges in schema %I grant usage, select on sequences to %I",
        ):
            row = await (
                await conn.execute("select format(%s, %s::text, %s::text)", [template, schema, role])
            ).fetchone()
            assert row is not None
            await conn.execute(row[0])


async def _grant_graph(conn: object, role: str) -> None:
    from psycopg import AsyncConnection

    assert isinstance(conn, AsyncConnection)
    row = await (
        await conn.execute(
            "select format('grant select, insert, update, delete on all tables in schema graph to %%I', %s::text)",
            [role],
        )
    ).fetchone()
    assert row is not None
    await conn.execute(row[0])


async def _ingest(args: argparse.Namespace) -> None:
    import yaml

    from aptiverse_ai.db import create_pool
    from aptiverse_ai.retrieval.embeddings import build_embedder
    from aptiverse_ai.retrieval.ingest import Ingestor, SourceEntry, read_pdf
    from aptiverse_ai.settings import get_settings

    settings = get_settings()
    raw = yaml.safe_load(await asyncio.to_thread(Path(args.register).read_text, encoding="utf-8"))
    register = {s["key"]: SourceEntry.model_validate(s) for s in raw["sources"]}
    pool = create_pool(settings.database)
    await pool.open()
    embedder = build_embedder(settings.embeddings)
    try:
        path = Path(args.file)
        if path.suffix.lower() == ".pdf":
            pages = await asyncio.to_thread(read_pdf, path)
        else:
            pages = (await asyncio.to_thread(path.read_text, encoding="utf-8")).split("\f")
        result = await Ingestor(pool, embedder, register).ingest_pages(args.key, pages, activate=args.activate)
        print(json.dumps({"document_id": result.document_id, "chunks": result.chunks, "skipped": result.skipped}))
    finally:
        await embedder.aclose()
        await pool.close()


async def _eval(args: argparse.Namespace) -> int:
    from aptiverse_ai.evals import harness

    reports: list[harness.Report] = []
    failures: list[str] = []
    if args.suite in ("safety_floor", "offline"):
        r = harness.safety_floor()
        reports.append(r)
        failures += harness.check_thresholds(r, "offline")
    if args.suite in ("retrieval", "offline", "grading", "trajectory"):
        from aptiverse_ai.db import create_pool
        from aptiverse_ai.gateway import PromptRegistry, build_gateway
        from aptiverse_ai.retrieval.embeddings import build_embedder
        from aptiverse_ai.retrieval.ingest import Ingestor
        from aptiverse_ai.retrieval.search import HybridRetriever, LexicalOverlapReranker
        from aptiverse_ai.settings import get_settings

        settings = get_settings()
        pool = create_pool(settings.database)
        await pool.open()
        embedder = build_embedder(settings.embeddings)
        retriever = HybridRetriever(pool, embedder, LexicalOverlapReranker())
        try:
            if args.suite in ("retrieval", "offline"):
                for r in await harness.retrieval(retriever, Ingestor(pool, embedder, {})):
                    reports.append(r)
                    if r.suite == "retrieval.hybrid_rerank":
                        failures += harness.check_thresholds(r, "live" if args.live else "offline", key="retrieval")
            if args.suite in ("grading", "trajectory"):
                gateway, prompts = build_gateway(settings.gateway), PromptRegistry.load()
                if args.suite == "grading":
                    from aptiverse_ai.graphs.grading import GradingDeps, build_graph

                    r = await harness.grading_agreement(build_graph(GradingDeps(gateway, prompts)))
                else:
                    r = await harness.trajectories(gateway, prompts, retriever)
                reports.append(r)
                failures += harness.check_thresholds(r, "live")
                await gateway.aclose()
        finally:
            await embedder.aclose()
            await pool.close()
    out = ROOT / "evals" / "reports" / ("live" if args.live else "offline")
    out.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%dT%H%M%S")
    (out / f"{args.suite}-{stamp}.json").write_text(
        json.dumps([r.as_dict() for r in reports], indent=2), encoding="utf-8"
    )
    print("\n\n".join(r.markdown() for r in reports))
    for f in failures:
        print(f"GATE FAILED {f}", file=sys.stderr)
    return 1 if failures else 0


def main() -> None:
    _selector_loop()
    parser = argparse.ArgumentParser(prog="aptiverse-ai")
    sub = parser.add_subparsers(dest="command", required=True)
    s = sub.add_parser("serve")
    s.add_argument("--host", default="0.0.0.0")  # noqa: S104 - container port, reachable only inside the VPC
    s.add_argument("--port", type=int, default=8080)
    sub.add_parser("migrate")
    i = sub.add_parser("ingest")
    i.add_argument("--register", required=True)
    i.add_argument("--key", required=True)
    i.add_argument("--file", required=True)
    i.add_argument("--activate", action="store_true")
    e = sub.add_parser("eval")
    e.add_argument("suite", choices=["offline", "safety_floor", "retrieval", "grading", "trajectory"])
    e.add_argument("--live", action="store_true")
    args = parser.parse_args()
    if args.command == "serve":
        serve(args)
    elif args.command == "migrate":
        asyncio.run(_migrate())
    elif args.command == "ingest":
        asyncio.run(_ingest(args))
    else:
        sys.exit(asyncio.run(_eval(args)))


if __name__ == "__main__":
    main()
