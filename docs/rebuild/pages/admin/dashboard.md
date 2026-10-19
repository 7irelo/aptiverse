# Admin dashboard

| | |
|---|---|
| ID | `PG-ADM-DASH` |
| Route | `/admin` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific (counts split by high school and university) |
| Entitlement | none; permission `admin.dashboard.read` (catalogue adopted, decision 9b) |
| Depends on | BE-ADM-01, BE-ADM-02, BE-IDN-28 (permissions in `/me`), BE-BIL-22 (drift count), BE-AFF-07 (owed total), UI-20, UI-21, UI-23, UI-26, SHL-03, SHL-04, FE-24, FE-25; needs new BE task for the attention list (see Data) |
| Old app reference | `43f9faa:web/src/app/(app)/admin/page.tsx` (real counts from `GET /api/admin/overview` in `43f9faa:api/Controllers/AdminController.cs` `GetOverview`, plus a platform live activity feed), `43f9faa:web/src/app/(app)/admin/layout.tsx` (role guard for admin and super_admin), `43f9faa:web/src/app/(app)/admin/[...unmatched]/page.tsx` (unknown admin URLs 404 inside the shell) |
| Status | Not started. Shell pieces it builds on exist: `PageHeader`, `PageState`, `StatCard`, `DataTable`, admin nav in `nav-config.ts` |

This file also owns the shared admin foundation (layout guard, filter bar, pagination, action wrapper, formatters, admin switches) that every other admin page reuses. Those tasks are PG-ADM-DASH-04 to PG-ADM-DASH-13.

## Purpose

The first screen an admin sees. It answers, from real counts only, the four Phase 9 questions at a glance: who paid, who is stuck, what AI is costing, and what we owe affiliates. Every number links to the page that explains it. Nothing on this page is computed in the browser and nothing is a placeholder.

## User stories

- As an admin, I open `/admin` and see today's signups, active students, paying accounts and AI spend for the last 30 days, so I know whether the platform is healthy.
- As an admin, I see a short list of people who are stuck (unverified, onboarding not finished, locked out) so I can help them before they leave.
- As an admin, I see failed payments from the last 7 days so I can follow up before access lapses.
- As an admin, I see the total we owe affiliates and the open reconciliation drift count, so money problems surface before month end.
- As an admin without billing permission, I still see the user and support numbers, and the money tiles tell me I lack access instead of showing zero.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Dashboard", description "Live counts from Aptiverse. Updated every 5 minutes.", "As of 14:05" timestamp under it.
2. Metric grid, 2 columns of `StatCard`: Signups (7 days), Active students (7 days), Paying accounts, AI spend (30 days). Each card is a link with a 44px minimum height.
3. Money row, 1 column: Owed to affiliates (hidden if affiliates are not in v1), Reconciliation drift (open items).
4. "Needs attention" section, h2. Two `Tabs`: "Stuck users" and "Failed payments". Each list shows up to 10 rows as cards, then a "See all" link.
5. Split strip, h2 "Students by stage": two plain counts, "High school" and "University or college".

### Desktop (1440px)

- 12-column grid inside the app shell content area (sidebar left).
- Row 1: four metric cards, 3 columns each.
- Row 2: "Needs attention" spans 8 columns as a `DataTable` with the two tabs; the right 4 columns stack Owed to affiliates, Reconciliation drift and Students by stage.
- "As of" timestamp moves to the right of the h1 inside `PageHeader` actions, next to a "Refresh" button.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/page.tsx` | server | Reads metrics and attention list in parallel inside `<Suspense>` |
| Loading | `web/src/app/(app)/admin/loading.tsx` | server | Skeleton grid matching the 4 cards and a 5-row list |
| Error | `web/src/app/(app)/admin/error.tsx` | client | `PageState` error with retry (`{ error, retry }`) |
| Admin layout guard | `web/src/app/(app)/admin/layout.tsx` | server | `requireRole("admin")`; non-admins get `notFound()` so the admin area is not advertised |
| Metric grid | `web/src/features/admin/dashboard/components/metric-grid.tsx` | server | Four `StatCard` links; null renders "No data yet" |
| Money tiles | `web/src/features/admin/dashboard/components/money-tiles.tsx` | server | Owed to affiliates, reconciliation drift; permission-aware |
| Attention list | `web/src/features/admin/dashboard/components/attention-list.tsx` | server | Tabs as links (`?attention=stuck` or `?attention=payments`), no client state |
| Stage split | `web/src/features/admin/dashboard/components/stage-split.tsx` | server | Two counts, no chart |
| Role chips | `web/src/features/admin/dashboard/components/role-chips.tsx` | server | From `usersByRole` |
| Operations row | `web/src/features/admin/dashboard/components/operations-row.tsx` | server | Enquiries, outbox and audit counts |
| Live activity feed | `web/src/features/admin/dashboard/components/live-activity-feed.tsx` | client | SSE through `/api/bff`; no live region announcements by default |
| Admin catch-all | `web/src/app/(app)/admin/[...unmatched]/page.tsx` | server | `notFound()` |
| Refresh button | `web/src/features/admin/dashboard/components/refresh-button.tsx` | client | Calls `router.refresh()`; disabled while pending |
| Metrics loader | `web/src/features/admin/dashboard/server/get-admin-metrics.ts` | server | `"use cache"`, `cacheLife({ revalidate: 300 })`, `cacheTag("admin-metrics")`, generated zod parse |
| Attention loader | `web/src/features/admin/dashboard/server/get-attention.ts` | server | Not cached (people change state minute to minute) |
| Shared filter bar | `web/src/features/admin/shared/components/admin-filter-bar.tsx` | client | Search plus selects bound to URL search params, 300ms debounce |
| Shared pagination | `web/src/features/admin/shared/components/cursor-pagination.tsx` | client | Previous and Next by cursor, page size 25 or 50 |
| Search params parser | `web/src/features/admin/shared/lib/search-params.ts` | shared | zod schemas that parse and clamp filters per page |
| Admin action helper | `web/src/features/admin/shared/lib/admin-action.ts` | client | Wraps generated mutation hooks: `Idempotency-Key` header, error mapping, audit reference toast |
| Reason dialog | `web/src/features/admin/shared/components/action-reason-dialog.tsx` | client | `ConfirmDialog` plus required reason (10 to 500 characters); single submit |
| Permission gate | `web/src/features/admin/shared/components/permission-gate.tsx` | server | Renders `PageForbidden` or children based on `can(permission)` |
| Upstream banner | `web/src/features/admin/shared/components/upstream-banner.tsx` | server | "Paystack is not responding" style notice with last good time |
| Admin switches | `web/src/features/admin/shared/lib/admin-switches.ts` | server | Reads `ADMIN_WRITE_ACTIONS`, `ADMIN_IMPERSONATION`, `ADMIN_REFUNDS` env switches |
| Money formatter | `web/src/lib/format/money.ts` | shared | `formatMoney(cents, currency)` to `R1 234` or `R1 234.50` |
| Date formatter | `web/src/lib/format/datetime.ts` | shared | `Africa/Johannesburg`, `19 Oct 2026, 14:05`, relative "2 hours ago" |

## Data

| Endpoint | BE ID | Method | Fields used | Cache |
|---|---|---|---|---|
| `/admin/metrics` | BE-ADM-02 | GET | `asOf`, `signups7d`, `signupsPrev7d`, `activeStudents7d`, `activeStudentsPrev7d`, `payingAccounts`, `aiSpend30dCents`, `aiSpendCurrency`, `studentsHighSchool`, `studentsTertiary`, `affiliatesOwedCents` (null when not permitted or not in v1), `reconciliationOpenItems` (null when not permitted) | `admin-metrics`, 300s |
| `/admin/attention?kind=stuck&limit=10` | needs new BE task (extend BE-ADM-02 or new BE-ADM slice) | GET | `items[]`: `userId`, `displayName`, `emailMasked`, `role`, `stage`, `reason` (`email_unverified_24h`, `onboarding_incomplete_48h`, `locked_out`, `deletion_pending`), `since`; `total` | none |
| `/admin/attention?kind=failed_payments&limit=10` | needs new BE task (same slice) | GET | `items[]`: `paymentId`, `userId`, `displayName`, `amountCents`, `currency`, `failureReason`, `attemptedAt`, `subscriptionState`; `total` | none |
| `/me` | BE-IDN-28 | GET | `permissions[]` to decide which tiles render | session |
| `/admin/metrics` (extra fields carried from the old overview) | BE-ADM-02 (add fields; flag) | GET | `usersByRole` { `student`, `parent`, `affiliate`, `admin` }, `subscriptionsLive`, `subscriptionsPastDue`, `subscriptionsCancelled`, `mrrListPriceCents` (list price of each live subscription's plan, annual plans divided by 12, no discounts or failed renewals modelled), `schoolEnquiriesTotal`, `schoolEnquiriesUncontacted`, `outboxPending`, `auditEvents24h` | `admin-metrics`, 300s |
| `/admin/activity?take=30` and `/admin/activity/stream` (SSE) | needs new BE task (replaces the old `GET /api/insights/live-activity` and its SSE stream, admin-only per FIX-07) | GET | `items[]` { `id`, `at`, `actorLabel`, `action`, `summary`, `link` } projected from the audit trail; display names only | none |

Mutations: none on this page. The Refresh button calls `router.refresh()` and does not bust `admin-metrics` early (the 5 minute window is the budget).

Rules:
- Every count is a server count. A field that is null renders "No data yet", never 0.
- Trend arrows only when both current and previous values exist.
- Names in the attention list come back from the API already minimised: display name plus masked email (`th***@gmail.com`). Full details are only in the user drawer, where viewing is logged.

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense fallback | Skeleton cards; screen reader text "Loading dashboard" |
| Populated | Metrics and lists return | As in Layout |
| Metric missing | A field is null | Card value "No data yet", hint "Counts start once there is activity." |
| Attention empty (stuck) | `total` is 0 | Title "Nobody is stuck right now", description "People who have not verified, finished onboarding or who are locked out will show here." |
| Attention empty (payments) | `total` is 0 | Title "No failed payments in the last 7 days", description "Failed Paystack charges will show here." |
| Money tile forbidden | Admin lacks `billing.admin` or `affiliates.manage` | Tile body "You do not have access to billing figures." No number, no link |
| Partial failure | Metrics load, attention list fails | List area shows "We could not load this list. Try again." with a Try again button; metrics stay |
| Error | Metrics call fails | `PageState` error: title "We could not load the dashboard", description "The Aptiverse API did not respond. Try again in a moment. If it keeps happening, check System health.", action "Try again" |
| Forbidden | Signed-in admin lacks `admin.dashboard.read` | `PageForbidden`: "You do not have access to this page. Ask another admin to grant you dashboard access." |
| Not admin | Student or parent opens `/admin` | 404 from layout guard (no hint that the area exists) |

## Stage variants

- Not stage-specific. "Students by stage" splits high school and university or college counts. Stage labels in the attention list read "High school, Grade 11" or "University, Year 2". No primary stage exists.

## Interactions and edge cases

- Clicking Signups opens `/admin/users?sort=created&from=<7 days ago>`; Paying accounts opens `/admin/billing?state=active`; AI spend opens `/admin/ai-spend?range=30d`; Owed to affiliates opens `/admin/affiliates?tab=payouts`; Reconciliation drift opens `/admin/billing/reconciliation`.
- Attention row click opens `/admin/users?user=<id>` (drawer) or `/admin/billing/payments?payment=<id>`.
- Clock skew: "As of" always comes from the API `asOf`, never the browser clock.
- Admin with only `users.read`: metric grid shows user cards; money tiles show the forbidden copy; failed payments tab is hidden.
- Very large counts use thin-space grouping via `formatNumber` (`12 345`).
- Affiliates are in v1 (decision 3), so the affiliate tile always renders for holders of the affiliate permissions.

### Carried over from the old app (43f9faa)

- Accounts by role: a row of chips "Students: 412", "Parents: 96", "Affiliates: 14", "Admins: 3" from `usersByRole`.
- MRR is labelled "MRR at list price" with the hint "annual plans over 12", because that is exactly how it is derived. No revenue, churn or projected figures, as in the old page.
- The live subscriptions card shows the hint "{n} past due" only when past due is above 0.
- Operations row: "School enquiries not yet contacted" (links to `/admin/schools/enquiries?status=new`), "Events waiting in the outbox" (links to `/admin/system`), "Audit entries in the last 24 hours" (links to `/admin/audit`).
- Platform live activity: the last 30 admin and platform events projected from the audit trail, updated over SSE through the BFF (FE-26). The stream pauses when the tab is hidden and resumes with a catch-up read. If it drops, the feed shows "Live updates paused. Showing events up to {time}." with "Reconnect".
- Unknown `/admin/*` URLs render the admin 404 inside the shell (`app/(app)/admin/[...unmatched]/page.tsx`), not the global 404.
- Not carried: the old "Tutor profiles awaiting verification" tile (tutor track is Phase 12).

## Copy

- h1: "Dashboard"
- Description: "Live counts from Aptiverse. Updated every 5 minutes."
- Card labels: "Signups (7 days)", "Active students (7 days)", "Paying accounts", "AI spend (30 days)", "Owed to affiliates", "Reconciliation drift"
- Drift hint: "{n} open items from the last nightly check"
- Stuck reasons: "Email not verified for over a day", "Onboarding not finished after 2 days", "Locked out after failed sign-ins", "Asked for account deletion"
- Payment failure line: "{amount} failed on {date}: {reason}"
- See all: "See all {n}"

## Acceptance criteria

- Given an admin with all permissions, when they open `/admin`, then four metric cards show values that match `GET /admin/metrics` exactly, and "As of" shows the API `asOf` in `Africa/Johannesburg` time.
- Given `aiSpend30dCents` is null, when the page renders, then the AI spend card reads "No data yet" and no "R0" appears anywhere.
- Given the admin lacks `billing.admin`, when the page renders, then the Paying accounts link, failed payments tab and reconciliation tile are not shown and no billing number is in the HTML.
- Given a student session, when it requests `/admin`, then the response is 404.
- Given the attention endpoint returns 500, when the page renders, then metrics still show and the list area shows "We could not load this list. Try again."
- Given 12 stuck users, when the Stuck users tab renders, then 10 rows show and "See all 12" links to the filtered users page.
- Given a 360px viewport, when the page renders, then there is no horizontal scroll and each card is at least 44px tall.
- Given 3 school enquiries not yet contacted, when the page renders, then the operations row shows 3 and links to the enquiries tab filtered to New.
- Given the live activity stream is connected, when another admin unlocks an account, then the feed shows the event within 5 seconds without a reload.
- Given `/admin/does-not-exist`, when an admin requests it, then the admin 404 renders inside the shell.

## Production readiness

Security
- Admin area guarded twice: layout `requireRole("admin")` and every endpoint `.RequirePermission(...)` server-side. The UI hiding a tile is never the control.
- Least privilege: the dashboard reads one aggregate endpoint; it never calls user detail or Paystack endpoints.
- No PII beyond display name and masked email on this page.
- All client calls (none today) would go through `/api/bff`, which carries the session cookie and checks `Origin` (CSRF).

Performance
- `GET /admin/metrics` budget: p95 under 300ms, at most 6 SQL queries, served from the admin read model (BE-ADM-01), cached 300s on the web side.
- Attention list capped at 10 items server-side; `total` from a count query with an index on the reason columns.
- Page JS: only the refresh button and tab links are client code; route JS under 60 KB gzip.

Resilience
- Metrics and attention load in separate Suspense boundaries so one failure does not blank the page.
- If BE-ADM-02 times out (5s fetcher timeout), the error state shows with retry; cached metrics are served while revalidating.

Observability
- Server loaders run inside the request trace; the fetcher propagates `traceparent` to the API (OBS-01).
- Sentry captures loader errors with tag `area:admin`, `page:dashboard`; no PII in breadcrumbs (OBS-06).

Accessibility (WCAG 2.2 AA)
- Cards are links with accessible names that include the value ("Signups in the last 7 days: 142").
- Trend arrows have text alternatives ("up 12 percent on the previous 7 days").
- Focus not obscured by the sticky top bar (2.4.11).

Privacy and POPIA
- Aggregates only, except the attention list (minimised fields). The attention endpoint writes one access log entry per request listing user ids returned (needs new BE task, same slice as the attention list).

Rollout
- Ships behind `ADMIN_CONSOLE` server switch (default off in prod until Phase 9 exit). Rollback: switch off, or Vercel instant rollback (HRD-03).

Monitoring
- Grafana panel "Admin metrics latency" (p95) and alert at p95 over 1s for 10 minutes (HRD-51).
- Sentry alert on any new `area:admin` issue.

Tasks
- [ ] **PG-ADM-DASH-14** Separate Suspense boundaries for metrics, attention and money tiles; partial failure copy
- [ ] **PG-ADM-DASH-15** Fetcher timeout (5s) and `traceparent` propagation verified for admin loaders
- [ ] **PG-ADM-DASH-16** Sentry tags `area:admin`, `page:<id>` set in a shared admin error boundary helper; PII scrub check
- [ ] **PG-ADM-DASH-17** `ADMIN_CONSOLE` switch gates the whole `(app)/admin` segment (layout returns 404 when off)
- [ ] **PG-ADM-DASH-18** Grafana panel and alert for `/admin/metrics` p95; Sentry alert rule for `area:admin`
- [x] **PG-ADM-DASH-19** Request the attention endpoint and its access log as new BE tasks (now in `../../backend/admin.md`)

## Build tasks

- [ ] **PG-ADM-DASH-01** Metric cards from real counts (`metric-grid.tsx`, null renders "No data yet", trend only with both periods)
- [ ] **PG-ADM-DASH-02** Stuck users and failed payments shortlist (`attention-list.tsx`, tabs as links, 10 rows, See all)
- [ ] **PG-ADM-DASH-03** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-DASH-04** Admin layout guard `app/(app)/admin/layout.tsx`: `requireRole("admin")`, 404 otherwise
- [ ] **PG-ADM-DASH-05** `permission-gate.tsx` server component and `PageForbidden` copy for admin pages
- [ ] **PG-ADM-DASH-06** `search-params.ts`: zod parsing, clamping and defaults for admin filters (unit tested)
- [ ] **PG-ADM-DASH-07** `admin-filter-bar.tsx`: search input with debounce, select filters, Clear all, URL-synced
- [ ] **PG-ADM-DASH-08** `cursor-pagination.tsx`: cursor Previous and Next, page size 25 or 50, total when known
- [ ] **PG-ADM-DASH-09** `admin-action.ts`: `Idempotency-Key` per intent, pending lock, error mapping (403, 404, 409, 422, 429, 503), audit reference toast
- [ ] **PG-ADM-DASH-10** `action-reason-dialog.tsx`: required reason, character count, single submit, destructive variant
- [ ] **PG-ADM-DASH-11** `upstream-banner.tsx` for third-party outages with last good time
- [ ] **PG-ADM-DASH-12** `admin-switches.ts` server env switches (`ADMIN_CONSOLE`, `ADMIN_WRITE_ACTIONS`, `ADMIN_IMPERSONATION`, `ADMIN_REFUNDS`) documented in `.env.example`
- [ ] **PG-ADM-DASH-13** `lib/format/money.ts` and `lib/format/datetime.ts` with unit tests (cents, negative refunds, SAST)
- [ ] **PG-ADM-DASH-20** `get-admin-metrics.ts` loader with `"use cache"`, `cacheLife`, `cacheTag("admin-metrics")`, zod parse
- [ ] **PG-ADM-DASH-21** `get-attention.ts` loader (uncached), zod parse, permission-aware kinds
- [ ] **PG-ADM-DASH-22** `money-tiles.tsx` with forbidden and not-in-v1 handling
- [ ] **PG-ADM-DASH-23** `stage-split.tsx` and stage label helper shared with the users page
- [ ] **PG-ADM-DASH-24** `refresh-button.tsx` and "As of" display from `asOf`
- [ ] **PG-ADM-DASH-25** Card link targets with prefilled filters on users, billing, AI spend and affiliates pages
- [ ] **PG-ADM-DASH-26** Accounts by role chip row from `usersByRole` (old app parity)
- [ ] **PG-ADM-DASH-27** "MRR at list price" card with "annual plans over 12" hint, and past due hint on live subscriptions
- [ ] **PG-ADM-DASH-28** Operations row: uncontacted school enquiries, outbox pending, audit entries in 24 hours, each linking to its page
- [ ] **PG-ADM-DASH-29** `live-activity-feed.tsx` client island: server first render, SSE through BFF, pause when hidden, reconnect state
- [ ] **PG-ADM-DASH-30** `app/(app)/admin/[...unmatched]/page.tsx` catch-all that calls `notFound()` inside the admin shell
- [ ] **PG-ADM-DASH-31** Request BE-ADM-02 extra fields and the admin activity read and stream as new BE tasks (coordinator)

## Quality tasks

- [ ] **PG-ADM-DASH-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-DASH-Q02** Server loader in `src/features/admin/dashboard/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-DASH-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (none on this page; confirm none were added)
- [ ] **PG-ADM-DASH-Q04** Empty state with one clear next action
- [ ] **PG-ADM-DASH-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-DASH-Q06** Forbidden state, and upgrade state if the page is entitlement-gated (not gated)
- [ ] **PG-ADM-DASH-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-DASH-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-DASH-Q09** Layout at 1440px
- [ ] **PG-ADM-DASH-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-DASH-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-DASH-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-DASH-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-DASH-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-DASH-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-ADM-DASH-Q16** No literal zero rendered for null metrics (unit test over every card)

## Tests

Unit (Vitest)
- `features/admin/dashboard/components/metric-grid.test.tsx`: "renders No data yet for null values", "hides trend when previous period is null", "builds accessible names with values"
- `features/admin/dashboard/components/money-tiles.test.tsx`: "shows forbidden copy without billing.admin", "affiliate tile hidden without affiliates.manage"
- `features/admin/dashboard/components/live-activity-feed.test.tsx`: "pauses when hidden and catches up", "shows paused copy when stream drops"
- `features/admin/shared/lib/search-params.test.ts`: "clamps page size to 50", "drops unknown filters", "defaults sort"
- `features/admin/shared/lib/admin-action.test.ts`: "reuses idempotency key on retry of same intent", "maps 409 to conflict copy", "blocks second submit while pending"
- `lib/format/money.test.ts`: "formats 123400 ZAR as R1 234", "formats 123450 as R1 234.50", "formats negative refund as minus R50"
- `lib/format/datetime.test.ts`: "renders UTC midnight as 02:00 SAST"

Playwright (`web/tests/e2e/admin/dashboard.spec.ts`)
- "admin sees four metric cards with API values"
- "admin without billing.admin sees no billing figures"
- "student gets 404 on /admin"
- "attention list failure keeps metrics visible"
- "empty attention lists show empty copy"
- "dashboard has no axe violations in light and dark at 360 and 1440"
- "unknown admin url renders admin 404 inside shell"
- "operations row links to enquiries system and audit"

## Open questions

- Decided (9b): adopt the permission catalogue proposed here and in `backend/identity.md` (`admin.dashboard.read`, `users.read`, `users.support`, `users.impersonate`, `billing.admin`, `billing.refund`, `billing.subscriptions.manage`, `ai.spend.read`, `schools.read`, `support.manage`, `affiliates.manage`, `affiliates.payouts.manage`, `content.manage`, `system.read`, `system.operate`, `settings.manage`, `audit.read`, `audit.export`, plus `roles.manage` from decision 28), with `support.faqs.manage` folded into `content.manage`. v1 has a single admin role holding all of them except `roles.manage`, which only named admins hold; a support-agent subset waits until a second team member needs one (BE-SK-27, BE-IDN-07).
- Decided (55): AI spend shows USD as billed, with a ZAR estimate.
- Where should `lib/format/money.ts` live if another area (billing, affiliates) already claims it? This file creates it only if no FE task exists.
- "Active student" definition: any authenticated request in 7 days, or a learning action (practice, assessment, tutor message)? Recommend learning action.
- Decided (28): no Superuser tier. Privileged role changes need the `roles.manage` permission held by named admins, with the old rails applied to it (see `users.md`).
