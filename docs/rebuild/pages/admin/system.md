# System health

| | |
|---|---|
| ID | `PG-ADM-SYSTEM` |
| Route | `/admin/system`, dead letter drawer at `?message=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific |
| Entitlement | none; permissions `system.read` (view), `system.operate` (replay or discard dead letters, plan sync) (proposed) |
| Depends on | Shell and component kit (see `../../frontend/` and `../../frontend/components/`), BE-SK-14 (`/health/ready`), BE-SK-22 and 23 (Wolverine outbox and scheduled messages), BE-ADM-13 (plan sync trigger), BE-BIL-07, BE-BIL-11 (webhook inbox), OBS-02 (Grafana), PG-ADM-DASH-04 to 13; needs new BE tasks for the system read and dead letter actions (see Data) |
| Old app reference | `43f9faa:web/src/app/(app)/admin/system/page.tsx` (real host status: database reachability and latency, outbox pending, processed and oldest pending, environment, runtime, uptime, server time, last 20 outbox events, refresh every 15 seconds) and `43f9faa:api/Controllers/AdminController.cs` (`GetSystem`) |
| Status | Not started |

## Purpose

A first-look operations screen for when something feels wrong: are the API, worker, database and outbox healthy; are Paystack, Anthropic and SES reachable; how deep is the outbox; which background messages failed and why; when did each scheduled job last run. It also hosts the plan sync trigger. Deep metrics stay in Grafana; this page links to it.

## User stories

- As an admin, I see a green, amber or red status for each dependency with a plain sentence, so I know where to look.
- As an admin, I see outbox depth and the oldest pending message age, so I know whether events are flowing.
- As an operator, I see failed (dead letter) messages, open one, and replay or discard it with a reason.
- As an operator, I see when nightly jobs (reconciliation, hold releases, digests) last ran and whether they succeeded.
- As an operator, I trigger a plan sync to Paystack after plan seed changes, and see the result.
- As an admin, I see which API and web versions are deployed.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "System health", description "Live checks of Aptiverse and the services it depends on.", "Checked 14:05" plus "Check again" button.
2. Overall banner: "All systems working" or "{n} problems need attention".
3. Dependency list as cards: API, Worker, Database, Outbox, Paystack, Anthropic, Email (SES), Storage (S3). Each: status icon and word, one sentence, latency.
4. Outbox card: "Pending messages 12", "Oldest waiting 40 seconds", "Webhook inbox backlog 0".
5. Scheduled jobs list: job name, last run, outcome, next run.
6. Failed messages list (dead letters): message type, error summary, failed at, attempts; "Open" opens the drawer.
7. Plan sync card: last sync time and result, "Sync plans to Paystack" button.
8. Versions: "API 2026.10.18-3f2a1c", "Web 2026.10.18-9be0d4", links "Open Grafana", "Open Sentry".

### Desktop (1440px)

- Row 1: overall banner full width.
- Row 2: dependency grid, 4 columns by 2 rows of cards.
- Row 3: Outbox (4 columns), Scheduled jobs table (8 columns).
- Row 4: Failed messages `DataTable` (8 columns), Plan sync and Versions stacked (4 columns).

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/system/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | `PermissionGate system.read` |
| Drawer slot | `web/src/app/(app)/admin/system/@drawer/page.tsx`, `default.tsx` | server | |
| Overall banner | `web/src/features/admin/system/components/overall-status.tsx` | server | |
| Dependency card | `web/src/features/admin/system/components/dependency-card.tsx` | server | Text plus icon (`circle-check`, `triangle-alert`, `circle-x`) |
| Outbox card | `web/src/features/admin/system/components/outbox-card.tsx` | server | |
| Jobs table | `web/src/features/admin/system/components/scheduled-jobs.tsx` | server | |
| Dead letters table | `web/src/features/admin/system/components/dead-letters-table.tsx` | server | |
| Dead letter drawer | `web/src/features/admin/system/components/dead-letter-body.tsx` | server | Error, stack summary (no PII), payload with redaction |
| Dead letter actions | `web/src/features/admin/system/components/dead-letter-actions.tsx` | client | Replay, Discard via `action-reason-dialog` |
| Plan sync card | `web/src/features/admin/system/components/plan-sync-card.tsx` | client | Trigger plus result |
| Versions | `web/src/features/admin/system/components/versions.tsx` | server | Web version from build env `NEXT_PUBLIC_BUILD_SHA` (server-read) |
| Check again | `web/src/features/admin/system/components/check-again-button.tsx` | client | `router.refresh()`, limited to once per 10 seconds |
| Loader | `web/src/features/admin/system/server/get-system-status.ts` | server | Uncached (`cache: "no-store"`); 5s timeout |

## Data

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/system` | needs new BE task (Admin) built on BE-SK-14 checks | GET | `checkedAt`, `dependencies[]` { `key` (`api`, `worker`, `database`, `outbox`, `paystack`, `anthropic`, `ses`, `s3`), `status` (`ok`, `degraded`, `down`, `unknown`), `message`, `latencyMs` }, `outbox` { `pending`, `oldestPendingSeconds`, `webhookInboxBacklog` }, `jobs[]` { `key`, `label`, `lastRunAt`, `lastOutcome` (`succeeded`, `failed`, `never`), `nextRunAt` }, `deadLetterCount`, `versions` { `api`, `worker` }, `planSync` { `lastRunAt`, `outcome`, `summary` }; carried from the old `AdminSystemDto`: `database` { `ok`, `latencyMs` }, `outbox.processed`, `outbox.oldestPendingAt`, `host` { `environment`, `runtime`, `uptimeSeconds`, `serverTimeUtc` } |
| `/admin/system/outbox?take=20` | needs new BE task (replaces the old outbox messages read) | GET | `items[]` { `id`, `messageType`, `occurredAt`, `processedAt` or null } |
| `/admin/system/dead-letters?cursor=` | needs new BE task (Wolverine dead letter read) | GET | `items[]` { `id`, `messageType`, `errorSummary`, `failedAt`, `attempts` } |
| `/admin/system/dead-letters/{id}` | needs new BE task | GET | Fields above plus `exceptionType`, `stackSummary`, `payloadRedacted`, `correlationId` |

Mutations (BFF, `Idempotency-Key`, reason required, `system.operate`)

| Action | Endpoint | BE ID | Request | Response |
|---|---|---|---|---|
| Replay dead letter | `POST /admin/system/dead-letters/{id}/replay` | needs new BE task | `reason` | `auditEventId`, `requeued` |
| Discard dead letter | `POST /admin/system/dead-letters/{id}/discard` | needs new BE task | `reason` | `auditEventId` |
| Plan sync | `POST /admin/plans/sync` | BE-ADM-13 (runs BE-BIL-07) | `reason`, `dryRun` | `auditEventId`, `created`, `updated`, `unchanged`, `errors[]` |

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Card skeletons |
| All ok | Every dependency ok | Banner "All systems working." |
| Problems | Any degraded or down | Banner "{n} problems need attention." Cards show messages, e.g. "Paystack responded slowly (2.4s). Payments may be delayed.", "Anthropic is not responding. Tutor and practice generation will fail until it returns." |
| Unknown | A check timed out | Card "Unknown: the check did not answer in time." |
| Outbox backed up | `oldestPendingSeconds` over 300 | Outbox card attention: "Messages are waiting longer than 5 minutes. Check the worker." |
| Job failed | `lastOutcome` failed | Row "Failed at {time}." with link "See failed messages" |
| Job never ran | `never` | "Has not run yet." |
| No dead letters | Count 0 | "No failed messages." |
| Replay done | 200 | Toast "Message sent again. Audit ref {id}." |
| Plan sync dry run | Dry run result | "Dry run: {created} to create, {updated} to update, {unchanged} unchanged. Nothing was sent." plus "Sync now" |
| Plan sync done | Result | "Synced: {created} created, {updated} updated." Errors list if any: "{plan}: {error}" |
| Plan sync failed | 503 Paystack | "Paystack is not responding. No plans were changed." |
| API down | System call fails entirely | `PageState` error: "We could not reach the Aptiverse API. If this persists, check Grafana and the Roll back a deploy runbook." with links |
| Forbidden | No `system.read` | "You do not have access to system health. Ask another admin to grant system.read." |

## Stage variants

- Not stage-specific.

## Interactions and edge cases

- The page is server-rendered on every request (no cache). "Check again" refreshes at most once per 10 seconds to avoid hammering third parties; the API itself caches third-party checks for 30 seconds.
- Plan sync is always a dry run first; "Sync now" appears only after a dry run in the same session and uses the same reason.
- Replaying a message for a handler that is not idempotent is dangerous; the drawer shows "Handlers are built to run more than once safely. If this one charges money or sends email, check the audit log before replaying." Billing and email messages show a stronger warning.
- Dead letter payloads are redacted server-side (emails, tokens, names). The browser never receives raw payloads.
- When the API is entirely down, this page cannot render data; the error state links to external tools (Grafana, Sentry, AWS console) and runbooks HRD-03, HRD-04, HRD-05.

### Carried over from the old app (43f9faa)

- Database card reads "Reachable, 12 ms" or "Unreachable", from a real round trip.
- Outbox card also shows "Processed {n}" and "Oldest pending {date, time} ({relative})", or "Nothing waiting".
- Host panel: Environment, Runtime (for example ".NET 10.0"), Uptime ("3 days, 4 hours"), Server time (UTC, with seconds).
- Recent events: the last 20 outbox messages with type, time and a "processed" or "pending" badge. Empty copy: "No events published yet. Modules write events to the outbox and the worker delivers them. Nothing has been published on this database."
- The page refreshes itself every 15 seconds while the tab is visible (the old page polled at the same rate), pausing when hidden. "Check again" stays for an immediate refresh.


## Copy

- h1 "System health"; description "Live checks of Aptiverse and the services it depends on."
- Dependency labels "API", "Worker", "Database", "Outbox", "Paystack", "Anthropic", "Email (SES)", "Storage (S3)"
- Status words "Working", "Slow", "Down", "Unknown"
- Outbox labels "Pending messages", "Oldest waiting", "Webhook inbox backlog"
- Plan sync: title "Paystack plans", buttons "Check what would change", "Sync now"
- Dead letter actions "Send again", "Discard"; dialog titles "Send this message again", "Discard this message"

## Acceptance criteria

- Given every dependency ok, when the page loads, then the banner reads "All systems working." and eight cards show "Working".
- Given Anthropic down, when the page loads, then its card reads "Down" with the tutor sentence and the banner counts 1 problem.
- Given 3 dead letters, when an operator replays one with a reason, then one request is sent with an `Idempotency-Key`, the toast shows the audit ref and the list refreshes to 2.
- Given plan sync, when the operator clicks "Check what would change", then a dry run result shows and no plans change at Paystack; "Sync now" then runs the real sync.
- Given the API is unreachable, when the page loads, then the error state shows external links and runbooks.
- Given an admin without `system.operate`, when the page renders, then replay, discard and sync controls are absent.

## Production readiness

Security
- `system.read` and `system.operate` enforced server-side. Dead letter payloads redacted on the server. Versions show build ids, never secrets or hostnames of internal resources.
- Replay, discard and sync audited with reason, including failures.

Performance
- One aggregate call; third-party checks cached 30s in the API; budget p95 under 800ms (bounded by check timeouts of 2s each run in parallel).

Resilience
- Each dependency check has its own timeout; one hung check shows "Unknown" without blocking others.
- Actions idempotent per key; double-click guard.

Observability
- Page links to Grafana dashboards (OBS-02) and Sentry projects. Audit events `admin.system.replay`, `.discard`, `admin.plans.sync`.

Accessibility (WCAG 2.2 AA)
- Status by icon plus word; not colour alone. "Check again" result announced politely ("Checked at 14:06").

Privacy and POPIA
- No personal data on this page; redaction enforced server-side for dead letter payloads.

Rollout
- Under `ADMIN_CONSOLE`; actions under `ADMIN_WRITE_ACTIONS`.

Monitoring
- This page is not an alerting system. Alerts live in Grafana (HRD-51): outbox oldest message over 5 minutes, dead letters over 0 for billing messages, any dependency down for 5 minutes.

Tasks
- [ ] **PG-ADM-SYSTEM-13** Per-check timeout rendering (Unknown) and Check again throttle
- [ ] **PG-ADM-SYSTEM-14** Billing and email replay warnings in the dead letter drawer
- [ ] **PG-ADM-SYSTEM-15** Grafana alerts for outbox age, billing dead letters and dependency down; link from page
- [ ] **PG-ADM-SYSTEM-16** Request new BE tasks: `/admin/system` aggregate, dead letter read, replay and discard (coordinator)

## Build tasks

- [ ] **PG-ADM-SYSTEM-01** Health checks, outbox depth, failed jobs (umbrella; delivered by 05 to 10)
- [ ] **PG-ADM-SYSTEM-02** Plan sync trigger (BE-ADM-13) (umbrella; delivered by 11)
- [ ] **PG-ADM-SYSTEM-03** Add System to the admin nav (icon `activity`, permission `system.read`)
- [ ] **PG-ADM-SYSTEM-04** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-SYSTEM-05** Route files and `get-system-status.ts` loader (no-store, timeout)
- [ ] **PG-ADM-SYSTEM-06** `overall-status.tsx` and `dependency-card.tsx` with all status messages
- [ ] **PG-ADM-SYSTEM-07** `outbox-card.tsx` with backed-up state
- [ ] **PG-ADM-SYSTEM-08** `scheduled-jobs.tsx` with failed and never ran states
- [ ] **PG-ADM-SYSTEM-09** `dead-letters-table.tsx` and drawer body with redacted payload
- [ ] **PG-ADM-SYSTEM-10** Replay and Discard actions
- [ ] **PG-ADM-SYSTEM-11** `plan-sync-card.tsx` with dry run then sync, result and error list
- [ ] **PG-ADM-SYSTEM-12** `versions.tsx` and external links; API-down error state with runbooks
- [ ] **PG-ADM-SYSTEM-17** Host panel: environment, runtime, uptime, server time (UTC)
- [ ] **PG-ADM-SYSTEM-18** Database latency wording and outbox processed and oldest pending fields
- [ ] **PG-ADM-SYSTEM-19** `recent-outbox-events.tsx`: last 20 messages with processed or pending badge, empty copy
- [ ] **PG-ADM-SYSTEM-20** `auto-refresh.tsx` client island: `router.refresh()` every 15 seconds while visible, paused when hidden
- [ ] **PG-ADM-SYSTEM-21** Request the extra `/admin/system` fields and the outbox read as new BE tasks (coordinator)

## Quality tasks

- [ ] **PG-ADM-SYSTEM-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-SYSTEM-Q02** Server loader in `src/features/admin/system/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-SYSTEM-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-ADM-SYSTEM-Q04** Empty state with one clear next action
- [ ] **PG-ADM-SYSTEM-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-SYSTEM-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-SYSTEM-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-SYSTEM-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-SYSTEM-Q09** Layout at 1440px
- [ ] **PG-ADM-SYSTEM-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-SYSTEM-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-SYSTEM-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-SYSTEM-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-SYSTEM-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-SYSTEM-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/system/components/dependency-card.test.tsx`: "down shows impact sentence", "unknown on timeout", "status has text not only colour"
- `features/admin/system/components/auto-refresh.test.tsx`: "refreshes every 15 seconds while visible", "pauses when hidden"
- `features/admin/system/lib/format-uptime.test.ts`: "formats days and hours", "under a minute"
- `features/admin/system/components/plan-sync-card.test.tsx`: "sync now hidden until dry run", "lists per-plan errors"

Playwright (`web/tests/e2e/admin/system.spec.ts`)
- "all ok shows working banner"
- "recent outbox events list shows pending badge"
- "host panel shows environment and uptime"
- "anthropic down counted as a problem"
- "replay dead letter with reason"
- "plan sync dry run then sync"
- "api unreachable shows runbook links"
- "system page has no axe violations in light and dark"

## Open questions

- Should operators see Wolverine dead letters at all from the web, or only through Grafana and a CLI? Replay from a web button is convenient but powerful.
- Build id source for the API: an `/admin/system` field from assembly metadata, or the ECS task definition tag?
