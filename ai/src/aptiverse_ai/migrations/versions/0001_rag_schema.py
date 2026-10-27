"""rag schema: public corpus and students' private notes (row-level security).

Revision ID: 0001
"""

from __future__ import annotations

import os

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _dimensions() -> int:
    # The vector width is fixed by the embedding model chosen in the retrieval eval. Changing models means
    # a new column, dual writes and a re-embed (AI-48), never an in-place alter.
    return int(os.environ.get("AI__EMBEDDINGS__DIMENSIONS", "1024"))


def upgrade() -> None:
    dims = _dimensions()
    op.execute("create extension if not exists vector")
    # array_to_string is only STABLE, which a generated column refuses; joining text with a space is immutable.
    op.execute(
        "create function rag.join_path(text[]) returns text language sql immutable parallel safe "
        "as $$ select array_to_string($1, ' ') $$"
    )
    op.execute(
        """
        create table rag.documents (
            id uuid primary key default gen_random_uuid(),
            source text not null,
            title text not null,
            url text,
            licence text not null,
            display_rule text not null check (display_rule in ('display', 'cite', 'index_only')),
            subject text,
            grade smallint check (grade between 1 and 12),
            curriculum text,
            doc_type text not null check (doc_type in ('caps', 'exam_paper', 'memo', 'exam_guideline', 'textbook', 'other')),
            year smallint,
            checksum text not null unique,
            active boolean not null default false,
            created_at timestamptz not null default now()
        )
        """
    )
    op.execute(
        f"""
        create table rag.chunks (
            id uuid primary key default gen_random_uuid(),
            document_id uuid not null references rag.documents(id) on delete cascade,
            ordinal int not null,
            heading_path text[] not null default '{{}}',
            text text not null,
            token_count int not null,
            topic_ids text[] not null default '{{}}',
            page int,
            marks smallint,
            has_figure boolean not null default false,
            subject text,
            grade smallint,
            doc_type text not null,
            embedding vector({dims}),
            embedding_model text,
            tsv tsvector generated always as (
                setweight(to_tsvector('english', rag.join_path(heading_path)), 'A')
                || setweight(to_tsvector('english', text), 'B')
            ) stored,
            unique (document_id, ordinal)
        )
        """
    )
    op.execute(
        "create index chunks_embedding_hnsw on rag.chunks using hnsw (embedding vector_cosine_ops) with (m = 16, ef_construction = 64)"
    )
    op.execute("create index chunks_tsv_gin on rag.chunks using gin (tsv)")
    op.execute("create index chunks_filter on rag.chunks (subject, grade, doc_type)")
    op.execute("create index chunks_document on rag.chunks (document_id)")
    op.execute("create index chunks_topics on rag.chunks using gin (topic_ids)")

    op.execute(
        f"""
        create table rag.private_documents (
            id uuid primary key default gen_random_uuid(),
            user_id uuid not null,
            note_id uuid not null,
            title text not null,
            checksum text not null,
            created_at timestamptz not null default now(),
            unique (user_id, note_id)
        );
        create index private_documents_user on rag.private_documents (user_id);

        create table rag.private_chunks (
            id uuid primary key default gen_random_uuid(),
            document_id uuid not null references rag.private_documents(id) on delete cascade,
            user_id uuid not null,
            ordinal int not null,
            heading_path text[] not null default '{{}}',
            text text not null,
            token_count int not null,
            page int,
            embedding vector({dims}),
            embedding_model text,
            tsv tsvector generated always as (to_tsvector('simple', text)) stored
        );
        create index private_chunks_user on rag.private_chunks (user_id);
        create index private_chunks_document on rag.private_chunks (document_id);
        create index private_chunks_tsv on rag.private_chunks using gin (tsv);
        create index private_chunks_embedding_hnsw on rag.private_chunks using hnsw (embedding vector_cosine_ops);
        """
    )
    # FORCE applies the policy to the table owner too; only a superuser or a BYPASSRLS role escapes it, and the
    # service role has neither. With app.user_id unset, current_setting(..., true) is null and no row matches.
    for table in ("private_documents", "private_chunks"):
        op.execute(f"alter table rag.{table} enable row level security")
        op.execute(f"alter table rag.{table} force row level security")
        op.execute(
            f"""
            create policy {table}_owner on rag.{table}
            using (user_id = nullif(current_setting('app.user_id', true), '')::uuid)
            with check (user_id = nullif(current_setting('app.user_id', true), '')::uuid)
            """
        )


def downgrade() -> None:
    op.execute("drop table if exists rag.private_chunks, rag.private_documents, rag.chunks, rag.documents cascade")
    op.execute("drop function if exists rag.join_path(text[])")
