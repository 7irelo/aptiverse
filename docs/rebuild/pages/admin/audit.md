# Audit log

| | |
|---|---|
| ID | `PG-ADM-AUDIT` |
| Route | `/admin/audit`, event drawer at `?event=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific |
| Entitlement | none; permission `audit.read` (exists in `Permissions.cs`), `audit.export` for CSV (proposed) |
| Depends on | BE-ADM-09, BE-IDN-05 (security events), BE-IDN-39, BE-ADM-04, BE-ADM-07, BE-ADM-10, BE-ADM-12 (event producers), PG-ADM-DASH-04 to 13 |
| Old app reference | `43f9faa:web/src/app/(app)/admin/audit/page.tsx` (real trail, filtered server-side: search, action and severity filters, detail drawer with before and after values) and `43f9faa:api/Controllers/AuditController.cs` (`GET /api/audit/logs` with actor, action, entity type, severity, free text and date filters; `GET /api/audit/actions` offering only recorded actions) |
| Status | Not started. `audit.read` permission constant exists in `api/src/Aptiverse.SharedKernel/Authorization/Permissions.cs` |

## Purpose

One read-only, filterable record of who did what, to whom, when, and whether it worked: admin actions (support actions, refunds, subscription changes, impersonation, payouts, content changes), security events (sign-ins, failed sign-ins, lockouts, password changes, session revokes) and personal data views. Failures and denials are first-class rows. Nothing here can be edited or deleted.

## User stories

- As an admin, I filter by actor, action, outcome, target user and date range to reconstruct an incident.
- As an admin, I paste a trace id or audit ref from a toast and land on that exact event.
- As an admin, I open an event and see its details, including the reason given and the before and after values (redacted where sensitive).
- As a security reviewer, I see every impersonation session and every refund, including failed ones.
- As an admin with export permission, I export a filtered range to CSV, and that export is itself audited.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Audit log", description "Every admin action and security event. Read only. Times in SAST."
2. Search "Audit ref, trace id or user id" (exact match).
3. Quick chips: "Failures only", "Impersonation", "Refunds", "Personal data views".
4. Filters sheet: Actor (admin picker), Action (grouped select), Outcome (Succeeded, Failed, Denied), Target user id, From and To (date and time).
5. Event cards: action label (title), outcome badge, actor name, target (masked), time, short ref.
6. Pagination (cursor, newest first).
7. Event drawer full screen: summary, reason, before and after table, request info (route template, IP masked, user agent short), trace id with copy, "Show related events" link (same trace or same impersonation session).

### Desktop (1440px)

- Filter bar inline; `DataTable` columns: Time, Actor, Action, Target, Outcome, Ref.
- Export button in `PageHeader` actions (only with `audit.export`).
- Drawer 600px.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/audit/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | `PermissionGate audit.read` |
| Drawer slot | `web/src/app/(app)/admin/audit/@drawer/page.tsx`, `default.tsx` | server | |
| Filters | `web/src/features/admin/audit/components/audit-filters.tsx` | client | |
| Table | `web/src/features/admin/audit/components/audit-table.tsx` | server | |
| Outcome badge | `web/src/features/admin/audit/components/outcome-badge.tsx` | server | Succeeded (forest), Failed (rose), Denied (terracotta), with text |
| Action labels | `web/src/features/admin/audit/lib/action-labels.ts` | shared | Maps `admin.refund.request` to "Refund requested"; unknown keys shown raw |
| Event drawer | `web/src/features/admin/audit/components/audit-event-body.tsx` | server | |
| Diff table | `web/src/features/admin/audit/components/change-diff.tsx` | server | Field, before, after; redacted values show "Hidden" |
| Export dialog | `web/src/features/admin/audit/components/export-dialog.tsx` | client | Reason required; max 31 days per export |
| Loaders | `web/src/features/admin/audit/server/list-audit.ts`, `get-audit-event.ts` | server | Uncached |

## Data

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/audit?q=&actorId=&action=&outcome=&targetUserId=&from=&to=&cursor=&limit=` | BE-ADM-09 | GET | `items[]` { `id`, `shortRef`, `occurredAt`, `actor` { `id`, `name`, `type` (`admin`, `user`, `system`) }, `action`, `targetType`, `targetId`, `targetLabelMasked`, `outcome` (`succeeded`, `failed`, `denied`), `severity` (`info`, `warning`, `critical`), `category`, `traceId`, `impersonationSessionId` }, `nextCursor`; extra filters `severity=`, `entityType=`, `actorEmail=` (prefix match on admin actor email, carried from the old free-text search) |
| `/admin/audit/{id}` | BE-ADM-09 | GET | Fields above plus `reason`, `changes[]` { `field`, `before`, `after`, `redacted` }, `errorCode`, `request` { `method`, `routeTemplate`, `ipMasked`, `userAgentShort` }, `source` (`admin`, `security`, `access`) |
| `/admin/audit/actions` | BE-ADM-09 (needs the catalogue endpoint; flag) | GET | `groups[]` { `label`, `actions[]` } for the Action filter |
| `/admin/audit/export` | needs new BE task | POST | Request filters plus `reason`; response `exportId`; then `GET /admin/audit/export/{id}` returns status and presigned URL (60s) |

`q` matches an exact short ref, full event id, trace id or user id. No free-text search over event payloads.

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Row skeletons |
| Populated | Results | As in Layout |
| No matches | Empty with filters | "No events match these filters." action "Clear filters" |
| Ref not found | `q` matches nothing | "No event with that reference. Check the characters, or widen the date range." |
| Empty | No events at all | "No events recorded yet." |
| Redacted value | `redacted` true | "Hidden (sensitive)" |
| Missing field | Null in the event | "Not recorded" |
| Raw value | Before or after is not JSON | Shown as plain text, labelled "Recorded as text" |
| Export preparing | Status pending | "Preparing your export. This can take up to a minute." |
| Export ready | Status ready | Download starts; toast "Export ready. The link works for 60 seconds. This export is in the audit log." |
| Export too large | Range over 31 days | "Export at most 31 days at a time." |
| Error | Load fails | "We could not load the audit log. Try again." |
| Forbidden | No `audit.read` | "You do not have access to the audit log. Ask another admin to grant audit.read." |

## Stage variants

- Not stage-specific.

## Interactions and edge cases

- Default range is the last 7 days; a search by ref ignores the date range.
- Audit refs from toasts across the admin console (PG-ADM-DASH-09) deep link here as `/admin/audit?q=<ref>`, which opens the drawer when exactly one event matches.
- "Show related events" filters by `traceId` or `impersonationSessionId`.
- Time zone: displayed SAST with seconds; filter inputs in SAST, sent as UTC.
- Unknown action keys (new producers) render the raw key rather than breaking.

### Carried over from the old app (43f9faa)

- Severity: every action has a severity (`info`, `warning`, `critical`); money moves and privileged role changes are warning. Severity is a filter and a badge (text plus colour). Category shows as a chip in the drawer ("Payments", "Users").
- Filters also include Entity type (for example "PaystackTransaction", "Subscription", "User") and Actor email (prefix match), because chasing one record by its id or one admin by email is what admins reach for first.
- Date range: "To" includes the whole day picked (sent as the start of the next day, exclusive), which is what a person means by "up to the 12th".
- The Action filter offers only actions that have actually been recorded, so it never offers a choice that returns nothing.
- Drawer fields: When (with seconds), Actor, Actor email, Actor roles, Actor id, Entity, IP address, Service, Correlation id, then Before and After. Any missing field reads "Not recorded". Before and After that are not valid JSON are shown as recorded, not hidden.
- Empty state copy from the old page: "Nothing recorded yet. Entries appear as admins act. An empty trail means no admin action has been taken, not that recording is off."
- Description: "Who did what, when. Append-only: entries are written as admins act and never edited."

- Viewing an event that contains personal data (for example a user's email in `changes`) is itself recorded as an access event.

## Copy

- h1 "Audit log"; description "Every admin action and security event. Read only. Times in SAST."
- Search placeholder "Audit ref, trace id or user id"
- Chips "Failures only", "Impersonation", "Refunds", "Personal data views"
- Outcome labels "Succeeded", "Failed", "Denied"
- Drawer headings "What happened", "Reason given", "Changes", "Request", "Related"
- Export dialog: title "Export audit events", body "Exports the filtered events as CSV. The export is recorded.", reason label "Why do you need this export?", confirm "Prepare export"

## Acceptance criteria

- Given a failed refund, when an admin filters Outcome "Failed" and Action "Refund requested", then the event appears with the Paystack error code in the drawer.
- Given an audit ref from a toast, when pasted into search, then the drawer opens on that event.
- Given an impersonation session, when "Show related events" is used, then start, each request and end events show in order.
- Given an admin without `audit.export`, when the page renders, then no Export button is in the DOM.
- Given an export of 40 days, when requested, then the dialog refuses with the 31 day copy and no request is sent.
- Given any event, when the drawer opens, then no edit or delete control exists.

## Production readiness

Security
- `audit.read` and `audit.export` enforced server-side. The audit store is append-only at the database level (no UPDATE or DELETE grants for the app role on audit tables; BE task to confirm).
- Exports audited with actor, filters, row count and reason.

Performance
- Keyset pagination on `(occurred_at, id)`; indexes on `actor_id`, `target_id`, `action`, `outcome`, `trace_id`. Default 7 day window. Budget p95 under 500ms for filtered queries over 90 days of data.
- Exports generated as a background job, not in the request.

Resilience
- Export job retries; status polling stops after 2 minutes with "Still preparing. Check back in a few minutes."

Observability
- The audit log viewer itself emits `admin.audit.view_event` access events (sampled 100 percent for events containing personal data).

Accessibility (WCAG 2.2 AA)
- Outcome conveyed by text and colour. Diff table has proper headers.

Privacy and POPIA
- Targets masked in the list; details only in the drawer; redaction for secrets, tokens, payout details and diary content at write time (BE side).
- Retention per HRD-35 (proposed 3 years for admin actions, 1 year for security events); viewer shows "Events older than {date} are not kept."

Rollout
- Under `ADMIN_CONSOLE`; read-only; export under `ADMIN_WRITE_ACTIONS`.

Monitoring
- Alert on spikes in Denied outcomes (more than 20 in 10 minutes) as a possible probing signal.
- Alert if no audit events are written for 24 hours in prod (producer broken).

Tasks
- [ ] **PG-ADM-AUDIT-12** Deep link from toast refs (`?q=` opens drawer on single match)
- [ ] **PG-ADM-AUDIT-13** Export job polling with timeout copy
- [ ] **PG-ADM-AUDIT-14** Alerts for Denied spikes and silent audit producers
- [ ] **PG-ADM-AUDIT-15** Request new BE tasks: action catalogue, export job, append-only grants check (coordinator)
- [ ] **PG-ADM-AUDIT-16** Severity filter and badge, category chip
- [ ] **PG-ADM-AUDIT-17** Entity type filter and actor email prefix filter
- [ ] **PG-ADM-AUDIT-18** Whole-day inclusive "To" date handling (unit tested)
- [ ] **PG-ADM-AUDIT-19** Drawer fields with "Not recorded" fallbacks and raw text fallback for non-JSON before and after
- [ ] **PG-ADM-AUDIT-20** Action filter populated only from recorded actions (confirm with BE-ADM-09 owner)
- [ ] **PG-ADM-AUDIT-21** Empty state and description copy from the old page

## Build tasks

- [ ] **PG-ADM-AUDIT-01** Filterable log (actor, action, outcome, date) (umbrella; delivered by 04 to 08)
- [ ] **PG-ADM-AUDIT-02** Add Audit to the admin nav (Account or a new "Oversight" section, icon `scroll-text`, permission `audit.read`)
- [ ] **PG-ADM-AUDIT-03** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-AUDIT-04** Route files and `list-audit.ts` loader
- [ ] **PG-ADM-AUDIT-05** `audit-filters.tsx` with grouped action select and chips
- [ ] **PG-ADM-AUDIT-06** `audit-table.tsx`, `outcome-badge.tsx`, mobile cards
- [ ] **PG-ADM-AUDIT-07** `action-labels.ts` with fallback and tests
- [ ] **PG-ADM-AUDIT-08** Ref, trace and user id search (exact match) and ref not found state
- [ ] **PG-ADM-AUDIT-09** Event drawer with summary, reason and request sections
- [ ] **PG-ADM-AUDIT-10** `change-diff.tsx` with redaction and related events link
- [ ] **PG-ADM-AUDIT-11** Export dialog with 31 day limit and reason

## Quality tasks

- [ ] **PG-ADM-AUDIT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-AUDIT-Q02** Server loader in `src/features/admin/audit/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-AUDIT-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (export only)
- [ ] **PG-ADM-AUDIT-Q04** Empty state with one clear next action
- [ ] **PG-ADM-AUDIT-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-AUDIT-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-AUDIT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-AUDIT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-AUDIT-Q09** Layout at 1440px
- [ ] **PG-ADM-AUDIT-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-AUDIT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-AUDIT-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-AUDIT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-AUDIT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-AUDIT-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/audit/lib/action-labels.test.ts`: "maps known action", "falls back to raw key"
- `features/admin/audit/lib/date-range.test.ts`: "to date includes the whole day", "SAST day boundary sent as UTC"
- `features/admin/audit/components/audit-event-body.test.tsx`: "missing fields read Not recorded", "non-json values shown as text"
- `features/admin/audit/components/change-diff.test.tsx`: "redacted values show Hidden", "renders before and after"
- `features/admin/audit/components/export-dialog.test.tsx`: "refuses range over 31 days", "requires reason"

Playwright (`web/tests/e2e/admin/audit.spec.ts`)
- "failed refund appears under failures filter"
- "severity warning filter shows refunds and role changes"
- "entity type filter narrows to subscriptions"
- "toast ref opens event drawer"
- "impersonation related events in order"
- "no export without audit.export"
- "audit page has no axe violations in light and dark"

## Open questions

- Retention periods for admin actions and security events (feeds HRD-35).
- Nav placement: the admin nav has Operations and Account sections; Audit, System and Schools may fit a new "Oversight" section. Coordinator to decide.
- Is CSV export needed in v1 at all? It is the only way PII leaves the console; recommend deferring unless an auditor asks.
