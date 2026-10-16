# Aptiverse API

The Aptiverse backend: a .NET 10 modular monolith with two run roles from one image.

- `src/Aptiverse.Host` serves the HTTP API (Minimal APIs, port 5100 locally).
- `src/Aptiverse.Worker` runs the same modules with no HTTP besides health. It processes the Wolverine outbox, durable queues and scheduled messages.
- `src/Aptiverse.SharedKernel` holds the building blocks: `Entity`, `Result`/`Error`, `IClock`, paging, the module `DbContext` base, the audit interceptor, the validation filter and the shared hosting composition.
- `src/Modules/<Module>/Aptiverse.<Module>` is a module's internal implementation, and `Aptiverse.<Module>.Contracts` is its public surface for other modules.

The rules that keep this shape are in [CLAUDE.md](CLAUDE.md) and the decisions behind them are in [docs/adr](docs/adr).

## Prerequisites

- .NET SDK 10.0.401 (pinned in `global.json`)
- Docker (local Postgres, and Testcontainers for the integration tests)
- Bash (Git Bash on Windows) for the scripts

## Run locally

The local stack lives in the infra repo, checked out next to this one (`../infra`).

```bash
# 1. Postgres 17 on localhost:5433 (db aptiverse, user aptiverse, password aptiverse), plus Mailpit and MinIO
docker compose -f ../infra/local/compose.yml up -d

# 2. Apply every module's migrations and create the Wolverine tables
scripts/migrate.sh

# 3. Seed starter data (idempotent, safe to re-run)
dotnet run --project src/Aptiverse.Host -- seed

# 4. Run the API on http://localhost:5100
dotnet run --project src/Aptiverse.Host

# Optional: run the worker on http://localhost:5101 (health only)
dotnet run --project src/Aptiverse.Worker
```

Then try:

- `GET http://localhost:5100/support/faqs` returns the published FAQs.
- `GET http://localhost:5100/health/ready` checks Postgres.
- `http://localhost:5100/scalar/v1` is the API reference UI (Development only).

`appsettings.Development.json` points at the local compose database only. Every other environment supplies `ConnectionStrings__Aptiverse` (and any other secret) through the environment or Secrets Manager. The app refuses to boot without it.

## Tests

```bash
dotnet test --solution Aptiverse.slnx
```

- `Aptiverse.ArchitectureTests` enforces module boundaries, internal-by-default, a validator per request type, and an index on every foreign key.
- `Aptiverse.<Module>.UnitTests` cover validators and handlers.
- `Aptiverse.IntegrationTests` boot the real API against a throwaway Postgres 17 container. They skip themselves, with a reason, when Docker is not running.

## Formatting and analyzers

Warnings are errors. Before pushing:

```bash
dotnet format Aptiverse.slnx
dotnet build Aptiverse.slnx
```

## API contract

`openapi/v1.json` is generated at build time from the Minimal API endpoints and is committed. The web app generates its client from it. CI rebuilds it and fails if the committed file differs, so after changing an endpoint or a response record:

```bash
dotnet build src/Aptiverse.Host --no-incremental
git add openapi/v1.json
```

## Migrations

The API never migrates at startup.

- Add a migration: `dotnet ef migrations add <Name> --project src/Modules/Support/Aptiverse.Support --startup-project src/Modules/Support/Aptiverse.Support --context SupportDbContext --output-dir Persistence/Migrations` (run `dotnet tool restore` first).
- Local: `scripts/migrate.sh` applies everything.
- Deployed environments: `scripts/migrations-bundle.sh [rid]` builds one self-contained bundle per module (default `linux-arm64`). The pipeline runs each bundle as a one-off ECS task, then `dotnet host/Aptiverse.Host.dll resources setup` from the API image for the Wolverine tables, then the rolling deploy.

Each module owns its Postgres schema and its own `__ef_migrations_history` table inside that schema.

## Container image

```bash
docker build -t aptiverse-api:dev .                       # native arch
docker buildx build --platform linux/arm64 -t aptiverse-api:dev .   # Graviton

docker run -p 8080:8080 -e ConnectionStrings__Aptiverse="..." aptiverse-api:dev                          # API
docker run -e ConnectionStrings__Aptiverse="..." aptiverse-api:dev worker/Aptiverse.Worker.dll           # worker
```

The runtime is the chiselled Ubuntu ASP.NET image: no shell, non-root (uid 1654), listening on 8080.

## Configuration

| Key | Purpose |
|---|---|
| `ConnectionStrings__Aptiverse` | Postgres connection string. Required. |
| `Auth__Issuer`, `Auth__Audience` | JWT validation (placeholder until Phase 2 issues tokens). |
| `Cors__AllowedOrigins__0..n` | Browser origins allowed to call the API. |
| `ForwardedHeaders__KnownProxies__0..n`, `ForwardedHeaders__KnownNetworks__0..n` | Proxies trusted to set `X-Forwarded-*`. None means forwarded headers are ignored. |
| `RateLimiting__PermitLimit`, `RateLimiting__WindowSeconds` | Per caller (user id, else client IP) fixed window. |
| `Messaging__SoloMode`, `Messaging__AutoBuildStorage` | Wolverine single-node mode, and table creation on boot (off by default). |
| `OTEL_EXPORTER_OTLP_ENDPOINT` (+ standard `OTEL_*`) | Enables OTLP export of traces, metrics and logs. |
| `Telemetry__ConsoleExporter` | Console trace exporter (on in Development). |
| `Sentry__Dsn` | Sentry error reporting. Disabled when empty. |

## Commits

Conventional commits: `type(scope): subject`, for example `feat(support): list published faqs`. The body explains why.
