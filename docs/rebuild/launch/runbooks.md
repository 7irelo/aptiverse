# Runbooks

| | |
|---|---|
| ID range | `HRD-01` to `HRD-07`, `HRD-64` to `HRD-79` |
| Phase | 9 (exit gate HRD-07), maintained through 10 and after launch |
| Depends on | `infra/database.md`, `infra/service.md`, `infra/secrets.md`, `infra/monitoring.md`, `observability/telemetry.md`, `launch/incident-management.md`, `launch/disaster-recovery.md` |
| Status | 3 done (restore, rotate, roll back exist in `infra/docs/runbooks/`), 0 partial, 1 unverified, 19 not started. No drill has been run. |

## Purpose

Every predictable failure has a written, tested procedure that one person can follow at 2am without prior context. A runbook is not done until it has an owner, a trigger, exact commands, a verification step and a recorded drill.

## Scope

- Location: `infra/docs/runbooks/` in the infra repo (the plan said `docs/runbooks/`; the three existing runbooks already live in infra, which owns every deploy definition, so infra is the home). Business runbooks that are not infra (Paystack incident, affiliate payout run) live in the same folder so there is one index.
- Index file: `infra/docs/runbooks/README.md` with the table below.
- Template: `infra/docs/runbooks/_template.md`.
- Systems covered: AWS af-south-1 (RDS, ECS, ALB, S3, Secrets Manager), SES eu-west-1, Cloudflare, Vercel, Paystack, Anthropic, Grafana Cloud, Sentry.

### Runbook index (target state)

| Runbook | File | Trigger | Owner | Last drill |
|---|---|---|---|---|
| Restore RDS (PITR or snapshot) | `restore-rds.md` | data loss, corruption, DR drill | infra owner | never |
| Rotate a secret | `rotate-secret.md` | schedule, leak, staff change | infra owner | never |
| Roll back an ECS deploy | `rollback-ecs-deploy.md` | failed or bad release | api owner | never |
| Paystack incident | `paystack-incident.md` | webhook failures, double charges, Paystack outage, reconciliation drift | billing owner | never |
| Anthropic outage | `anthropic-outage.md` | Anthropic 5xx or 529, latency spike, quota exhaustion | ai owner | never |
| Affiliate payout run | `affiliate-payout-run.md` | monthly payout schedule | finance owner | never |
| SES bounce or complaint spike | `ses-reputation.md` | bounce rate over 2% or complaint rate over 0.05% | notifications owner | never |
| Cloudflare or DNS outage | `cloudflare-dns-outage.md` | api or app unreachable at the edge | infra owner | never |
| RDS storage full | `rds-storage-full.md` | free storage alarm | infra owner | never |
| ECS tasks crash looping | `ecs-crash-loop.md` | unhealthy target alarm, circuit breaker rollback | api owner | never |
| Credential leak | `credential-leak.md` | gitleaks hit, provider alert, suspected exposure | security owner | never |
| Vercel outage | `vercel-outage.md` | web unreachable, Vercel status incident | web owner | never |
| Regional af-south-1 outage | `region-outage.md` | AWS regional event | infra owner | never |
| Restore drill record | `drills/YYYY-QN.md` | quarterly | infra owner | never |

## Tasks

### Existing runbooks
- [x] **HRD-01** Restore from backup runbook (`infra/docs/runbooks/restore-rds.md`: PITR and snapshot restore to a new instance, verify, partial or full recovery)
- [x] **HRD-02** Rotate a secret runbook (`infra/docs/runbooks/rotate-secret.md`: RDS managed password, app secrets, JWT key overlap via JWKS, leak handling)
- [x] **HRD-03** Roll back a deploy runbook (`infra/docs/runbooks/rollback-ecs-deploy.md`: automatic circuit breaker, manual SSM image tag reset, migrations note)
- [ ] **HRD-64** Add the runbook template `_template.md`: title, owner, severity it maps to, trigger and alarm names, prerequisites (roles, tools), numbered steps with exact commands, verification, rollback of the procedure itself, comms, last drill date and drill log link
- [ ] **HRD-65** Add `infra/docs/runbooks/README.md` index with the table above, and a header block (owner, last tested, linked alarm) on each of the three existing runbooks
- [ ] **HRD-66** Record in `REBUILD_PLAN.md` follow-up notes and this file that runbooks live in `infra/docs/runbooks/`, not `docs/runbooks/`, and update any link in the backlog that points at the old path
- [ ] **HRD-67** Extend `restore-rds.md` with the cross-region restore path (copied snapshot in the DR region, see `launch/disaster-recovery.md`) and the Terraform state reconciliation steps as copy-paste commands
- [ ] **HRD-68** Extend `rollback-ecs-deploy.md` with web rollback (Vercel instant rollback to the previous production deployment) and the rule that a rollback past an expand and contract migration boundary is forbidden

### New runbooks
- [ ] **HRD-04** Paystack incident runbook: webhook delivery failing (check `billing.paystack_events` inbox, replay from Paystack dashboard, idempotency guarantees), Paystack API outage (checkout disabled banner, no retries that could double charge), reconciliation drift (run reconciliation job on demand, compare totals), refund errors (audited admin action)
- [ ] **HRD-05** Anthropic outage runbook: detect via error rate and latency on the AiTutor module, quota refunds are automatic, switch to configured fallback model id by config change only, show the "tutor is resting" state, communicate, confirm spend did not spike on retries
- [ ] **HRD-06** Affiliate payout run runbook: freeze window, generate batch, review flagged referrals, export CSV, pay through the bank, mark paid, reconcile ledger sum to the cent, never during cutover week
- [ ] **HRD-69** SES bounce or complaint spike runbook: read the configuration set reputation metrics, check the suppression list, pause the offending email type through config, contact AWS if sending is paused, verify DKIM and SPF
- [ ] **HRD-70** Cloudflare or DNS outage runbook: confirm with Cloudflare status, check record state against Terraform (`infra/dns.md`), grey-cloud fallback decision (only with ALB still restricted), TTL notes, comms
- [ ] **HRD-71** RDS storage full runbook: confirm autoscaling ceiling (`max_allocated_storage`), raise it in a reviewed Terraform PR, find bloat with `pg_stat_statements` and table sizes, vacuum guidance, never delete data to free space without a backup
- [ ] **HRD-72** ECS tasks crash looping runbook: read stopped task reasons, check `/health/ready` dependencies (DB, outbox), missing secret keys, config validation failures from `ValidateOnStart`, roll back per HRD-03
- [ ] **HRD-73** Credential leak runbook: revoke at provider first, rotate per HRD-02, CloudTrail and provider audit log review, purge from git history if committed, breach assessment per `launch/breach-notification.md`
- [ ] **HRD-74** Vercel outage runbook: confirm with Vercel status, roll back to the previous deployment if the cause is ours, static maintenance page option through Cloudflare, API stays up for mobile clients later
- [ ] **HRD-75** Regional af-south-1 outage runbook: decision criteria to fail over versus wait, restore from cross-region snapshot copy into the DR region, point Cloudflare at the DR ALB, data residency note for POPIA (temporary processing outside af-south-1 must be recorded), fail back steps

### Drills
- [ ] **HRD-07** Restore drill under one hour (exit gate): restore staging RDS to a point in time into a new instance, verify row counts against a known checkpoint, record start and end times in `infra/docs/runbooks/drills/` *(unverified: needs a human run against AWS; no drill recorded)*
- [ ] **HRD-76** Rollback drill: ship a deliberately broken image to dev, confirm automatic rollback, then run the manual SSM rollback, record times (pairs with CI-15)
- [ ] **HRD-77** Secret rotation drill: rotate the Sentry DSN and the JWT signing key in staging end to end with no user sign-outs beyond the documented overlap
- [ ] **HRD-78** Tabletop exercise for the Paystack incident and credential leak runbooks with written findings
- [ ] **HRD-79** Schedule: every runbook drilled at least once before go-live (HRD-63) and the restore drill repeated quarterly (calendar in `launch/disaster-recovery.md`)

## Verification

- Every row in the index has an owner, a linked alarm or trigger and a non-empty "last drill" date before HRD-63 can go green.
- A person who did not write a runbook follows it during the drill without asking questions; any question becomes an edit.
- Commands in runbooks are copy-paste correct for the current resource names (`aptiverse-<env>`, `/aptiverse/<env>/api/image-tag`).
- No runbook prints or pastes a secret value.

## Open questions

- Who besides the founder holds the backup on-call role and AWS break-glass access?
- Decided (33): no second-region failover in v1; the documented answer is restore in af-south-1 within RTO, with a second region only after a POPIA opinion (see `launch/disaster-recovery.md`).
- Decided (3): affiliates are in v1, so the affiliate payout runbook is required for launch.
