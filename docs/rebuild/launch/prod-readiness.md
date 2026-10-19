# Production readiness and go/no-go

| | |
|---|---|
| ID range | `HRD-60` to `HRD-63`, `HRD-221` to `HRD-238` |
| Phase | 10 |
| Depends on | `infra/env-prod.md`, `ci/api-pipeline.md`, `ci/web-pipeline.md`, `ci/infra-pipeline.md`, `ci/shared-workflows.md`, every other `launch/` file |
| Status | 0 done, 1 partial (prod env stack exists in code with NAT, Multi-AZ, 30-day backups; not applied), 2 unverified, 19 not started |

## Purpose

The last gate before real users: prod infrastructure applied and proven, promotion and deployment safety demonstrated end to end, and a go/no-go checklist where every line is green with evidence.

## Scope

- Prod Terraform stack: `infra/envs/prod` (composition tasks live in `infra/env-prod.md`; HRD-60 is the gate that it is applied and verified).
- Delivery: immutable image promoted from staging to prod by digest, never rebuilt; prod deploy on git tag with manual approval in the GitHub `prod` environment.
- Deployment safety: health-gated rolling deploy with circuit breaker rollback, expand and contract migrations, feature flags for risky releases.
- Checklist file: `docs/go-no-go.md` in the infra repo, one row per item with evidence link and sign-off.

## Tasks

### Prod environment
- [ ] **HRD-60** Compose and apply `prod` Terraform (Multi-AZ, NAT, private subnets) *(partial: `infra/envs/prod` exists with identical `main.tf` and prod defaults: NAT on, Multi-AZ RDS on db.t4g.medium, 30-day backups, 2 to 6 api tasks, 90-day logs, main-branch deploys off; not applied, see `infra/env-prod.md`)*
- [ ] **HRD-221** Prod secrets populated (every name in the `app_secret_names` output) and verified by a task starting cleanly *(unverified: AWS state)*
- [ ] **HRD-222** Prod GitHub environments: `prod` and `global` protected with required reviewers and a wait timer; deployment branch rule limited to tags
- [ ] **HRD-223** Prod Cloudflare: Full (strict) SSL mode, WAF rules, `api` record proxied, origin locked to Cloudflare ranges (verified in `launch/security.md` HRD-106)

### Promotion and deployment safety
- [ ] **HRD-224** Prove promotion: the exact image digest deployed to staging is deployed to prod (compare digests in ECS task definitions); no rebuild between envs
- [ ] **HRD-225** Prove manual approval: a prod deploy waits for an approver in the `prod` environment and is recorded in the deployment history
- [ ] **HRD-226** Prove health gates and automatic rollback in prod: deploy a known-good no-op release and watch `/health/ready` gates; rollback was proven in dev and staging by CI-15
- [ ] **HRD-227** Expand and contract check: every migration since the last prod release is backward compatible with the running version (PR checkbox ticked, reviewer confirmed); destructive steps scheduled for a later release
- [ ] **HRD-228** Feature flags for risky releases: the flag mechanism chosen in Phase 9 (config or small table) exists, and launch-risky features (AI tutor deep mode, affiliate payouts) can be switched off without a deploy (parent allowances are not in v1, decision 6)
- [ ] **HRD-229** Release notes: each prod tag has generated release notes from conventional commits plus a human summary of user-visible changes

### Rehearsal
- [ ] **HRD-61** Dress rehearsal deploy to prod: full pipeline from tag to running tasks, migration task, smoke tests, then rollback to the previous tag, all timed
- [ ] **HRD-230** Smoke test suite against prod (read-only): health, login with a dedicated smoke account per role, one practice read, and a Paystack verify-only call (test-mode payments are not possible against live keys); results recorded
- [ ] **HRD-62** Frygia licence bought and self-hosted (or the documented fallback accepted), font files in `web/src/fonts` loaded with `next/font/local` (FE-12)

### Readiness areas
- [ ] **HRD-231** Support readiness: support inbox, FAQ content live, ticket triage owner, canned replies for login, billing and consent questions
- [ ] **HRD-232** Launch-day comms: announcement email (to migrated users per CUT-01), status page ready, social post, in-app welcome banner copy reviewed
- [ ] **HRD-233** Observability ready: SLO dashboards live for prod, alerts routed and test-fired, Sentry release tracking with source maps for the release tag
- [ ] **HRD-234** Cost ready: prod budget and anomaly alerts live (`launch/cost-controls.md`)
- [ ] **HRD-235** Compliance ready: POPIA items in `launch/popia.md` signed off, privacy notice version live, Information Officer registered
- [ ] **HRD-236** DR ready: cross-region copies running and the latest restore drill inside RTO (`launch/disaster-recovery.md`)
- [ ] **HRD-237** Security ready: `launch/security.md` ASVS L2 auth and payments rows complete, scans clean, pentest HIGH findings closed

### Gate
- [ ] **HRD-238** Write `docs/go-no-go.md` with every item from HRD-60 to HRD-237 plus runbook drills (HRD-79), performance (HRD-11), polish (HRD-40 to HRD-44) and migration rehearsal 3 (MIG-25)
- [ ] **HRD-63** Go/no-go checklist all green, signed by the owner with date *(unverified: human sign-off)*

## Verification

- `docs/go-no-go.md` has no red or empty evidence cell.
- The dress rehearsal log shows tag to healthy tasks and back again, with timings.
- Prod and staging task definitions reference the same image digest for the release under test.

## Open questions

- Decided (66): typed config flags in `web/src/lib/flags.ts` and API options. Note that config flags need a redeploy to flip, so HRD-228's "without a deploy" holds only for flags read from runtime configuration (for example an ECS environment change without a new image).
- Decided (67): the cutover smoke test uses a live R5 transaction refunded immediately.
