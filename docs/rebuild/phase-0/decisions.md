# Phase 0 decisions (ADRs)

| | |
|---|---|
| ID range | `ARC-01` to `ARC-19`, `ARC-40` to `ARC-44` |
| Phase | 0 |
| Owner repo | api (`api/docs/adr/`), index linked from web and infra READMEs |
| Depends on | nothing (this is the first gate) |
| Status | 5 done (ARC-02, ARC-06, ARC-08, ARC-16, ARC-43), 2 partial (ARC-05, ARC-10), rest not started |

## Purpose

Record every expensive-to-change choice from section 2 of `REBUILD_PLAN.md` as a short ADR, so a new contributor (human or AI) can learn why the system looks the way it does without reading chat history. The Phase 0 exit gate requires decisions signed off.

## Scope

- Location: ADRs already live in `api/docs/adr/` (not `docs/adr/` as the original single-file backlog proposed). Keep that location; `api/CLAUDE.md` points at it. web and infra READMEs link to the index.
- Numbering: the six accepted ADRs use their own sequence (0001 to 0006), which differs from the numbers the original single-file backlog proposed. Task IDs stay as written; each task names the ADR file that satisfies it. New ADRs take the next free number (0007 onwards).
- Existing files:
  - `0001-modular-monolith-with-module-projects.md`
  - `0002-minimal-apis-and-vertical-slices.md`
  - `0003-wolverine-transactional-outbox.md`
  - `0004-guid-v7-identifiers.md`
  - `0005-generated-openapi-contract.md`
  - `0006-three-repository-layout.md`
- Format of every ADR: title, Status (Proposed, Accepted, Superseded by NNNN), Date, Context, Decision, Consequences, and a "Revisit when" line.

## Tasks

### Template and index

- [ ] **ARC-01** ADR template (`api/docs/adr/0000-template.md`) and `api/docs/adr/README.md` index listing every ADR with status and date
- [ ] **ARC-40** Link the ADR index from `web/README.md` and `infra/README.md` (split from ARC-01)
- [ ] **ARC-41** Add a "Docs updated (ADR if a decision changed)" line to each repo's PR template (split from ARC-01; template itself is in `phase-0/change-management.md`)

### Decisions from section 2

- [x] **ARC-02** ADR: repository layout (three org repos plus contract flow) (done: `0006-three-repository-layout.md`)
- [ ] **ARC-03** ADR: v1 product scope (roles student, parent, admin; high school and university stages only; features in and out, including the deferrals from decisions 6 and 8; what moves to Phase 12)
- [ ] **ARC-04** ADR: affiliates in v1 (decided: yes, automatic enrolment, old terms with attribution capped at 12 months)
- [ ] **ARC-05** ADR: backend stack (.NET 10, EF Core 10, Identity 10, Minimal APIs, TypedResults, no AutoMapper, no MediatR) *(partial: 0001 and 0002 cover module structure, Minimal APIs and TypedResults; EF Core 10, Identity 10 and the AutoMapper and MediatR bans are not recorded in one ADR)*
- [x] **ARC-06** ADR: messaging (Wolverine on Postgres, outbox, scheduled messages) (done: `0003-wolverine-transactional-outbox.md`)
- [ ] **ARC-07** ADR: frontend stack (Next 16, React 19, Tailwind v4, shadcn/Radix, Lucide, Orval, OS-only colour scheme)
- [x] **ARC-08** ADR: API contract (build-time OpenAPI, Orval, drift check, Scalar as the one docs UI) (done: `0005-generated-openapi-contract.md`)
- [ ] **ARC-09** ADR: auth (Pattern B, ES256 15 min, JWKS, hashed rotating refresh with family revocation, Auth.js v5 BFF, browser never holds a token)
- [ ] **ARC-10** ADR: ids (Guid v7 everywhere) and money (integer cents plus currency) *(partial: ids in `0004-guid-v7-identifiers.md`; money rule only in `api/CLAUDE.md`, no ADR)*
- [ ] **ARC-42** ADR: money as integer minor units plus ISO currency code, display `R1 234`, rounding rule (banker's or half up), ledger rows append-only (split from ARC-10)
- [ ] **ARC-11** ADR: hosting (Vercel `cpt1`, AWS af-south-1, SES eu-west-1 SESv2, Zoho inbound, Cloudflare Full strict)
- [ ] **ARC-12** ADR: compute (ECS Fargate ARM64, one image, `api`, `worker` and `migrate` roles, no NAT in dev)
- [ ] **ARC-13** ADR: AI (Anthropic SDK only, config-driven models, no `temperature`, prompt files, evals, quota reserve and refund)
- [ ] **ARC-14** ADR: observability (OTel to Grafana Cloud, Sentry, Vercel Analytics and Speed Insights, log retention per env)
- [ ] **ARC-15** ADR: data migration (clean schema, ETL in `tools/Migrator`, rehearsals, single cutover, no dual-write)
- [x] **ARC-16** Record answers to open decisions 6 to 10 (allowances, diary NLP, Meta tracking, budgets, user counts) (done: every decision accepted at its default on 2026-10-19, recorded in `docs/rebuild/DECISIONS.md` and `REBUILD_PLAN.md` section 7; budget amounts and user counts are facts owed in DECISIONS.md section F)
- [x] **ARC-43** Write each answer from ARC-16 into `docs/rebuild/DECISIONS.md` and remove the `[decision: N]` tag from tasks it settles (split from ARC-16) (done: tags removed; tasks ruled out of v1 carry `*(deferred: decision N, not in v1)*`)

### Enterprise decisions (added)

- [ ] **ARC-17** ADR: deployment strategy. Rolling ECS deploy (min healthy 100, max 200) gated on `/health/ready`, deployment circuit breaker with automatic rollback, post-deploy smoke test; blue-green with CodeDeploy rejected for v1 with the reason recorded. Migrations follow expand and contract: a release only adds (columns nullable or defaulted, new tables), the drop ships at least one release later, and every migration must run against the previous image
- [ ] **ARC-18** ADR: feature flags for risky releases. Options: typed options in config per environment, or a small `admin.feature_flags` table with an admin toggle. Record which, the naming rule, default-off for new risky paths (payments, AI generation, migrations behind new code paths), and the rule that a flag is deleted within two releases of full rollout
- [ ] **ARC-19** ADR: disaster recovery targets per tier. Proposed: prod RDS RPO 5 minutes (PITR) and RTO 1 hour, prod S3 uploads RPO 24 hours and RTO 4 hours, staging and dev best effort. Includes in-region backup copies (a second af-south-1 account, decision 33; eu-west-1 only after a POPIA opinion) and the quarterly restore drill. Implementation tasks live in `infra/database.md`, `infra/storage.md` and `launch/` DR files
- [ ] **ARC-44** ADR: environments and promotion. dev, staging (anonymised prod copy), prod (tag plus manual approval); one image built once and promoted by digest, never rebuilt per environment

## Verification

- `ls api/docs/adr/` shows the template, README index and one file per task above marked done.
- Every ADR has Status `Accepted` and a date, and the README index lists it.
- `grep -rn "decision: " docs/rebuild` returns nothing; deferred work shows as `deferred: decision N`.
- A reviewer who has not seen the plan can answer "why Wolverine, why three repos, why no blue-green" from the ADRs alone.

## Open questions

- ARC-17: is ECS rolling with circuit breaker enough for prod, or is a canary step (one task first) wanted before launch?
- ARC-18: config flags need a redeploy to flip; is that acceptable for the payments kill switch, or does that one need the table?
- ARC-19: are the proposed RPO and RTO numbers acceptable to the business? They decide the cost of cross-region copies.
- The ECR layout (one repository per environment, `aptiverse-<env>/api`) conflicts with "build once, promote by digest" in ARC-44; the ADR must pick a shared repository or a cross-environment copy step (see `infra/ecr.md`).
