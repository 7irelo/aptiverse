# Local development

| | |
|---|---|
| ID range | `ARC-30` to `ARC-39` |
| Phase | 1 |
| Owner repo | infra (`infra/local/compose.yml`), api (`seed` command), web |
| Depends on | `infra/local-compose.md` (compose stack), BE Identity and Academics seeders for full seed data |
| Status | 0 done, 3 partial (ARC-32, ARC-34, ARC-36), rest not started |

## Purpose

A teammate clones the three repos side by side and has the api, worker and web running against seeded data in under 15 minutes, with one command per repo (Phase 1 exit gate).

## Scope

- Backing services: `infra/local/compose.yml` (Postgres 17 on host 5433, Mailpit SMTP 1025 and UI 8025, MinIO 9000 and 9001 with the `aptiverse-uploads` bucket created by `minio-init`). Values documented in `infra/local/README.md`; api and web depend on them.
- api: `scripts/migrate.sh`, `dotnet run --project src/Aptiverse.Host -- seed` (idempotent `IDataSeeder`), Host on `http://localhost:5100` (the value in `web/.env.example`).
- web: `npm run dev` with `API_INTERNAL_URL=http://localhost:5100`; dev tools (mock session, gallery) on by default in `next dev` (`web/src/lib/dev-tools.ts`). E2E runs against `web/e2e/mock-api.mjs`, not a real api.
- Files to add: `justfile` (or `Makefile`) in each repo, `docs/dev-setup.md` in infra (linked from api and web READMEs).

## Tasks

- [ ] **ARC-30** `just dev` in `infra`: start compose, wait for healthy, print connection values
- [ ] **ARC-33** `just dev` in `api`: migrate, seed, run Host and Worker together (split from ARC-30)
- [ ] **ARC-34** `just dev` in `web`: install if needed, copy `.env.example` to `.env.local` when missing, `next dev` (split from ARC-30) *(partial: `npm run dev` exists; no wrapper or env bootstrap)*
- [ ] **ARC-35** `just reset` in infra: `docker compose down -v` then up and re-seed, with a confirmation prompt (split from ARC-30)
- [ ] **ARC-31** `docs/dev-setup.md` with a 15-minute clone-to-running target: prerequisites (Docker, .NET SDK from `api/global.json`, Node 24, just), side-by-side checkout, the three commands, troubleshooting (port 5433 in use, MinIO init exit 0 is expected)
- [ ] **ARC-36** Time the dev-setup doc on a clean machine or fresh container and record the result (split from ARC-31) *(partial: infra README and local README document compose, but no end-to-end doc)*
- [ ] **ARC-32** Seed data: one student per stage (high school Grade 11 CAPS NSC, university first year), one parent linked to the high-school student, one admin *(partial: api has the `seed` command and `IDataSeeder`; no user seeders yet because Identity endpoints are not built)*
- [ ] **ARC-37** Seed the CAPS catalog from data files through the same seeder, idempotent on re-run (split from ARC-32; depends on the Academics module in `backend/`)
- [ ] **ARC-38** Seed credentials documented in `docs/dev-setup.md` and refused outside Development (the seeder exits non-zero if `ASPNETCORE_ENVIRONMENT` is not Development unless `--allow-non-dev` is passed for staging fixtures) (split from ARC-32)
- [ ] **ARC-39** Paystack and webhook local loop: document Paystack CLI or Postman webhook forwarding to localhost so billing works locally without the "verify on return" workaround

## Verification

- On a clean machine: clone three repos, run `just dev` in infra, api and web; sign in as each seeded user at `http://localhost:3000` within 15 minutes.
- `just dev` in api run twice in a row creates no duplicate rows (`select count(*) from identity.users` unchanged).
- Mailpit UI shows the verification email after registering a new user locally.

## Open questions

- just or make? just needs an install on Windows; make is awkward on Windows too. Pick one for all three repos.
- Should the web E2E suite also have a mode against the real local api (CI-23 wants a compose stack)?
