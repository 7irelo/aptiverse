"""Alembic environment. Migrations are plain SQL; run as a one-off task (`aptiverse-ai migrate`), never at startup."""

from __future__ import annotations

import os

from alembic import context
from sqlalchemy import create_engine, pool

config = context.config


def _url() -> str:
    url = config.get_main_option("sqlalchemy.url") or os.environ.get("AI__DATABASE__URL", "")
    if not url:
        raise RuntimeError("AI__DATABASE__URL is not set")
    # psycopg 3 driver for SQLAlchemy.
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


def run_migrations_online() -> None:
    engine = create_engine(_url(), poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            version_table="alembic_version",
            version_table_schema="rag",
            transaction_per_migration=True,
        )
        connection.exec_driver_sql("create schema if not exists rag")
        connection.commit()
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
