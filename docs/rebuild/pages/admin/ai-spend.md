# AI spend

| | |
|---|---|
| ID | `PG-ADM-AI` |
| Route | `/admin/ai-spend` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific (spend can be split by high school and university) |
| Entitlement | none; permission `ai.spend.read` (proposed) |
| Depends on | BE-ADM-08, BE-AI-07 (`ai_usage` rows: model, tokens, cache hits, cost, prompt version), BE-AI-08 (quota refunds), BE-AI-37 (cost per generated test), OBS-07 (Grafana spend dashboard), UI-27 (charts), PG-ADM-DASH-04 to 13 |
| Old app reference | new |
| Status | Not started. Chart wrappers exist in `web/src/components/common/charts.tsx` |

## Purpose

Answer "what is AI costing" without SQL: total spend for a period, how it splits by feature (practice generation, grading, tutor standard, tutor deep, help bot) and by model, how it trends day by day, how well prompt caching is working, and which accounts use the most. Numbers come only from stored `ai_usage` rows. Spend is shown against the monthly budget agreed in decision 9 when one is set.

## User stories

- As an admin, I see this month's AI spend so far, the projection to month end, and the budget line.
- As an admin, I see spend per day, stacked by feature, and switch the range (7 days, 30 days, this month, last month).
- As an admin, I see spend by model and the cache hit rate, so I know whether prompt caching is saving money.
- As an admin, I see the top 20 accounts by spend, with their plan, so I can spot abuse or a plan that is priced too low.
- As an admin, I see cost per generated practice test so pricing decisions are grounded.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "AI spend", description "From recorded Anthropic usage. Times in SAST."
2. Range selector: segmented links "7 days", "30 days", "This month", "Last month" (wraps to two rows at 360px; each 44px).
3. Summary cards, single column: Spend in range; Projected month end (only for "This month"); Budget used (percentage of monthly budget, with ProgressBar); Cache hit rate; Cost per practice test.
4. "Spend per day" chart: stacked bar by feature, 180px tall, with a text summary under it ("Highest day 14 Oct: US$41.20, mostly tutor deep.").
5. "By feature" list: feature, spend, share, requests. Cards.
6. "By model" list: model id, spend, input tokens, output tokens, cache reads. Cards.
7. "Top accounts" list (top 20): masked name, plan, spend, requests, link to user drawer.

### Desktop (1440px)

- Range selector in `PageHeader` actions.
- Row 1: five `StatCard`s across.
- Row 2: chart spans 8 columns; "By feature" donut plus legend table spans 4 columns.
- Row 3: "By model" table (6 columns) and "Top accounts" table (6 columns).

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/ai-spend/page.tsx` | server | `PermissionGate ai.spend.read`, parses `range` |
| Loading and error | `web/src/app/(app)/admin/ai-spend/loading.tsx`, `error.tsx` | server, client | |
| Range links | `web/src/features/admin/ai-spend/components/range-links.tsx` | server | `?range=7d|30d|month|last_month` |
| Summary cards | `web/src/features/admin/ai-spend/components/spend-summary.tsx` | server | |
| Daily chart | `web/src/features/admin/ai-spend/components/daily-spend-chart.tsx` | client | `BarChart` stacked; token colours per feature; text summary slot |
| Feature breakdown | `web/src/features/admin/ai-spend/components/feature-breakdown.tsx` | server shell, client donut | `DonutChart` plus `DataTable` |
| Model table | `web/src/features/admin/ai-spend/components/model-table.tsx` | server | |
| Top accounts | `web/src/features/admin/ai-spend/components/top-accounts.tsx` | server | Links to `/admin/users?user=<id>` |
| Loader | `web/src/features/admin/ai-spend/server/get-ai-spend.ts` | server | `"use cache"`, `cacheLife({ revalidate: 900 })`, `cacheTag("admin-ai-spend")` |
| Feature labels | `web/src/features/admin/ai-spend/lib/feature-labels.ts` | shared | Maps API keys to labels |
| Projection | `web/src/features/admin/ai-spend/lib/projection.ts` | shared | Display check only; projection comes from the API |

## Data

| Endpoint | BE ID | Method | Fields used | Cache |
|---|---|---|---|---|
| `/admin/ai-spend?from=&to=&tz=Africa/Johannesburg` | BE-ADM-08 | GET | `currency` (as stored, expected `USD`), `totalCents`, `requestCount`, `projectedMonthEndCents` (null unless current month), `monthlyBudgetCents` (null if not set), `cacheHitRate` (0 to 1, null if no requests), `costPerPracticeTestCents` (BE-AI-37, null if none generated), `daily[]` { `date`, `byFeature` { `practice_generate`, `grade`, `tutor_standard`, `tutor_deep`, `help` } }, `byFeature[]` { `feature`, `costCents`, `requests` }, `byModel[]` { `model`, `costCents`, `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheWriteTokens` }, `topAccounts[]` (20) { `userId`, `displayName`, `planName`, `costCents`, `requests` }, `asOf` | `admin-ai-spend`, 900s |

Mutations: none.

Rules:
- Spend includes reserved-then-refunded quota correctly: refunded reservations (BE-AI-08) cost nothing; only confirmed calls with recorded token usage count, plus failed calls that Anthropic still billed.
- Days with no usage come back as zero rows from the API (a genuine zero, because usage is recorded for every call). Before the first ever usage row, the whole page is in the "no usage yet" state rather than showing zeros.

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Card and chart skeletons |
| Populated | Data | As in Layout |
| No usage yet | `requestCount` 0 and no rows ever | Title "No AI usage recorded yet", description "Spend appears once students use practice generation, grading or the tutor." |
| No usage in range | `requestCount` 0 in range but rows exist elsewhere | "No AI usage in this period." with link "Show last 30 days" |
| Budget not set | `monthlyBudgetCents` null | Budget card: "No monthly budget set. Set it in Settings." link to `/admin/settings` |
| Over budget | Spend over budget | Budget card in error zone: "Over budget by {amount}. Check top accounts and the tutor deep mode share." |
| Projection over budget | Projection over budget | Attention zone: "On track to pass the budget by {date}." |
| Cache rate null | No requests | "No data yet" |
| Error | Load fails | "We could not load AI spend. Try again. If the AI module is down, check System health." |
| Forbidden | No `ai.spend.read` | "You do not have access to AI spend. Ask another admin to grant ai.spend.read." |

## Stage variants

- Not stage-specific in v1. Optional split by stage is an open question (BE-ADM-08 would need `byStage`).

## Interactions and edge cases

- Range "This month" and "Last month" use SAST month boundaries; the API receives `tz` and returns `asOf`.
- Currency (decision 55): USD as billed (`US$12.34` via `formatMoney(cents, "USD")`), with a smaller ZAR estimate line under totals ("About R228 at R18.50 to the dollar, rate from {date}") when BE-ADM-08 returns `zarEstimateCents`, `usdZarRate` and `rateAsOf`; the web never converts. Without a rate the ZAR line is omitted.
- Top accounts: an account with a deleted user shows "Deleted account" and no link.
- A new model id appears in `byModel` automatically; unknown feature keys render the raw key in monospace rather than being dropped.
- Chart colours come from chart tokens; feature order fixed: Practice generation, Grading, Tutor standard, Tutor deep, Help bot.
- Very small spends under one cent show "under 1c".

## Copy

- h1 "AI spend"; description "From recorded Anthropic usage. Times in SAST."
- Range labels "7 days", "30 days", "This month", "Last month"
- Card labels "Spend", "Projected month end", "Budget used", "Cache hit rate", "Cost per practice test"
- Feature labels "Practice generation", "Grading", "Tutor (standard)", "Tutor (deep)", "Help bot"
- Section headings "Spend per day", "By feature", "By model", "Top accounts"
- Chart summary template: "Highest day {date}: {amount}, mostly {feature}."

## Acceptance criteria

- Given usage rows in the last 30 days, when the admin selects "30 days", then the total equals `totalCents` from BE-ADM-08 and the daily bars sum to the same total.
- Given the current month and a budget, when spend is 80 percent of budget, then the Budget used card shows 80 percent with a ProgressBar and accessible text "80 percent of the monthly budget used".
- Given no budget, when the page renders, then the budget card links to Settings and no percentage shows.
- Given no usage rows ever, when the page renders, then the empty state shows and no "US$0.00" appears.
- Given a top account row, when clicked, then the users drawer opens for that user.
- Given a 360px viewport, when the chart renders, then it fits the width and its text summary is present.

## Production readiness

Security
- `ai.spend.read` enforced by BE-ADM-08. Response contains no prompt or message content, only aggregates and account names.

Performance
- BE-ADM-08 aggregates from a daily rollup (needs confirming: a `ai_usage_daily` projection or a materialised view refreshed hourly) so a 30 day query does not scan raw rows. Budget p95 under 500ms.
- Web cache 15 minutes; the chart is the only client island with Recharts, loaded with `next/dynamic` to keep route JS under 120 KB gzip.

Resilience
- If the spend endpoint fails, the error state offers retry; cached data is served while revalidating.

Observability
- Loader errors to Sentry with `page:ai-spend`. Grafana OBS-07 remains the source for finer analysis; page links to it.

Accessibility (WCAG 2.2 AA)
- Chart has a text summary and the "By feature" table carries the same numbers, so no data is chart-only.
- Feature colours are distinguishable and each series is also labelled in the legend table.

Privacy and POPIA
- Top accounts show display name and plan only; drawer access is logged there. No conversation content.

Rollout
- Under `ADMIN_CONSOLE`; read-only, rollback by switch.

Monitoring
- Budget alarms are HRD-52 (AWS and Anthropic). The page mirrors them; it is not the alert.
- Alert if `costPerPracticeTestCents` rises over 50 percent week on week (prompt regression signal).

Tasks
- [ ] **PG-ADM-AI-12** Confirm daily rollup source and query budget with the BE-ADM-08 owner; record in this file
- [ ] **PG-ADM-AI-13** Lazy-load the chart island and check route JS budget
- [ ] **PG-ADM-AI-14** Grafana alert on cost per practice test jump; link OBS-07 dashboard from the page

## Build tasks

- [ ] **PG-ADM-AI-01** Spend over time, by feature and model (umbrella; delivered by 05 to 09)
- [ ] **PG-ADM-AI-02** Top users by spend (umbrella; delivered by 10)
- [ ] **PG-ADM-AI-03** Add AI spend to the admin nav (Operations section, icon `sparkles`, permission `ai.spend.read`, after Billing)
- [ ] **PG-ADM-AI-04** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-AI-05** Route files, `range-links.tsx` and range parsing with SAST boundaries
- [ ] **PG-ADM-AI-06** `get-ai-spend.ts` loader with cache tag and zod parse
- [ ] **PG-ADM-AI-07** `spend-summary.tsx` cards including budget and projection states
- [ ] **PG-ADM-AI-08** `daily-spend-chart.tsx` stacked by feature with text summary
- [ ] **PG-ADM-AI-09** `feature-breakdown.tsx` and `model-table.tsx`
- [ ] **PG-ADM-AI-10** `top-accounts.tsx` with drawer links and deleted account handling
- [ ] **PG-ADM-AI-11** Empty, no usage in range, error and forbidden states

## Quality tasks

- [ ] **PG-ADM-AI-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-AI-Q02** Server loader in `src/features/admin/ai-spend/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-AI-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (none)
- [ ] **PG-ADM-AI-Q04** Empty state with one clear next action
- [ ] **PG-ADM-AI-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-AI-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-AI-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-AI-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-AI-Q09** Layout at 1440px
- [ ] **PG-ADM-AI-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-AI-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-AI-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-AI-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-AI-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-AI-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/ai-spend/lib/feature-labels.test.ts`: "maps known keys", "falls back to raw key"
- `features/admin/ai-spend/components/spend-summary.test.tsx`: "budget not set links to settings", "over budget uses error copy", "no usage renders no zero"
- `features/admin/ai-spend/components/daily-spend-chart.test.tsx`: "text summary names highest day"

Playwright (`web/tests/e2e/admin/ai-spend.spec.ts`)
- "30 day range totals match daily bars"
- "this month shows projection and budget"
- "no usage shows empty state"
- "top account opens user drawer"
- "admin without ai.spend.read is forbidden"
- "ai spend page has no axe violations in light and dark"

## Open questions

- Decided (55): USD as billed with a ZAR estimate. BE-ADM-08 needs the estimate fields and a rate source (request to the backend owner).
- Where is the monthly budget stored? Proposed in `settings.md` (needs new BE task), mirroring the HRD-52 ceiling.
- Split by stage (high school vs university) is useful for pricing but needs `byStage` in BE-ADM-08.
- The original single-file backlog lists `/admin/ai`; this file keeps `/admin/ai-spend`.
