# Local compose stack

| | |
|---|---|
| ID range | INF-24, INF-152 to INF-157 |
| Phase | 1 |
| Depends on | none (api and web repos depend on its exact ports and credentials) |
| Code path | `infra/local/compose.yml`, `infra/local/README.md` |
| Status | INF-24 partial: Postgres 17, Mailpit and MinIO with bucket init are done; there is no seed step. An api service profile for E2E and a reset helper are open. |

## Purpose

Backing services for running the api and web on a laptop and in CI E2E, with fixed, documented values so all three repos agree. Nothing here is used by any cloud environment.

## Scope

- Services: `postgres` (`postgres:17-alpine`, host 5433, db, user and password `aptiverse`, `pg_stat_statements` preloaded, healthcheck), `mailpit` (`axllent/mailpit:v1.31.6`, SMTP 1025, UI 8025), `minio` (`pgsty/minio` pinned release, API 9000, console 9001, user `aptiverse`, secret `aptiverse-local`), `minio-init` (`pgsty/mc`, creates private bucket `aptiverse-uploads`, exits 0).
- Volumes: `pgdata`, `miniodata`.
- Contract: the values in `infra/CLAUDE.md` "Local dev stack"; change only together with the api and web repos.
- Seeding: the api has a `seed` command (`dotnet run --project src/Aptiverse.Host -- seed`, `SeedCommand.cs`); local data for ARC-32 comes from that, not from SQL in this repo.

## Tasks

- [ ] **INF-24** `local/`: compose with Postgres 17, Mailpit, MinIO, seed script. *(partial: `infra/local/compose.yml` has Postgres 17, Mailpit, MinIO and bucket init; no seed step)*
- [ ] **INF-152** Seed step: document in `infra/local/README.md` the order `compose up`, api `migrate`, api `seed`, and add an optional `seed` profile service that runs the api image with `migrate` then `seed` against the compose Postgres, so a fresh clone gets the ARC-32 data set with one command. (split from INF-24)
- [ ] **INF-153** `api` profile: an opt-in compose service running a given api image tag (env `API_IMAGE`) on port 5100 with the local connection string, Mailpit SMTP or an SES stub, and MinIO S3 settings, used by web E2E in CI against a real api (CI-23 in `ci/web-pipeline.md`).
- [x] **INF-154** Health checks on every long-running service so `docker compose up --wait` blocks until ready. *(`healthcheck` blocks in `infra/local/compose.yml`)*
- [ ] **INF-155** Reset helper: `infra/local/reset.sh` (or a `just` recipe, ARC-30) that runs `down -v`, `up --wait`, migrate and seed, printing the Mailpit and MinIO URLs.
- [x] **INF-156** Local images are pinned and updated by Renovate's docker-compose manager. *(pinned tags in `compose.yml`; `docker-compose` group in `infra/renovate.json`)*
- [ ] **INF-157** Parity notes: record in the README where local differs from cloud (MinIO path-style addressing and static keys versus S3 with task roles, Mailpit SMTP versus SESv2 API, no TLS to Postgres locally) so code paths for both are tested; consider LocalStack SES only if the SESv2 path needs local coverage.

## Verification

- `docker compose -f infra/local/compose.yml up -d --wait` returns with all services healthy; `minio-init` exited 0.
- `psql postgresql://aptiverse:aptiverse@localhost:5433/aptiverse -c 'select 1'` works; `http://localhost:8025` shows Mailpit; `http://localhost:9001` shows the `aptiverse-uploads` bucket.
- After INF-152: a fresh `down -v` then the documented seed command yields one high school student, one university student, one parent, one admin and the CAPS catalog (ARC-32).

## Open questions

- MinIO's community image source (`pgsty`) is a third-party build since upstream stopped publishing; acceptable long term, or switch to LocalStack S3?
