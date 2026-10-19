# Analytics

| | |
|---|---|
| ID | `PG-STU-ANALYTICS` |
| Route | `/dashboard/progress` (also the Progress hub: tabs for Overview, Mastery, Journey, Achievements) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free (confirm against `plan_features`, BE-BIL-02) |
| Depends on | BE-PRG-12, BE-PRG-15, BE-ACA-42, BE-PRA-20, BE-ACA-15, UI-20, UI-21, UI-22, UI-23, UI-27, UI-33, SHL-04, SHL-05, FE-24, FE-25, FE-63, OBS-04 |
| Old app reference | `web/src/app/(app)/dashboard/analytics/page.tsx` at 43f9faa (per-unit story cards, finished units split out, period predictions with confidence); `api/Controllers/MasteryController.cs` `GET /api/mastery/predictions` at 43f9faa; merges old `analytics` and `reports` |
| Status | Not started (backend not started; no route, loader or components exist) |

`PG-STU-ANALYTICS-07` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

The student's own honest read of how they are doing: a projected result built only from marks they have logged, which units are strong and which need work, how much practice they have actually done, and one plain next step. It is also the landing tab of the Progress area, so it hosts the shared tab bar that links Mastery, Journey and Achievements.

## User stories

- As a high-school student, I want to see my predicted final mark per subject from the assessments I have logged, so I know where I stand before exams.
- As a university student, I want a GPA-style projection across my courses from my marked work, so I know if I am on track for the year.
- As a student, I want to see my strongest and weakest units, so I know where to spend my next study hour.
- As a student, I want to see how much time I spent practising each week, so I can tell if I am putting in steady work.
- As a student, I want one specific suggestion for what to do next, so I do not have to work it out myself.
- As a student with no marks yet, I want the page to tell me what to log, instead of showing zeros.

## Layout

### Mobile (360px)

Single column, `px-4`, blocks separated by `gap-6`, top to bottom:

1. `PageHeader`: h1 "Progress", description "Built only from marks you've logged and practice you've done."
2. `ProgressTabs`: horizontally scrollable link tabs (Overview, Mastery, Journey, Achievements), sticky under the top bar, each tab `min-h-11`.
3. `NextStepCard`: one sentence and one button (full width).
4. `ProjectionCard`: projected result headline (HS: average predicted mark across subjects; uni: projected weighted average), evidence line, then per-unit rows as stacked cards (unit name, projected mark or "No marks yet", count of marked assessments).
5. `StrengthsGapsCard`: two short lists, "Going well" (up to 3) and "Needs work" (up to 3), each row a link to the unit's mastery view.
6. `TimeOnTaskCard`: text summary first (two sentences), then an area chart of minutes per week for the last 8 weeks, chart height 160px.
7. Footnote: "How we work these out" disclosure (accordion) explaining the sources.

### Desktop (1440px)

`PageShell` max width, 12-column grid, `gap-6`:

- Row 1: `PageHeader` full width; `ProgressTabs` under it, not sticky.
- Row 2: `ProjectionCard` spans 8 columns (per-unit rows become a `DataTable` with columns Unit, Projected, Marked assessments, Last mark date); `NextStepCard` spans 4 columns, top aligned.
- Row 3: `TimeOnTaskCard` spans 8 columns with the text summary in a left column (4 of 8) and the chart in the right (chart height 220px); `StrengthsGapsCard` spans 4 columns.
- Row 4: method disclosure, full width.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Progress layout | `web/src/app/(app)/dashboard/progress/layout.tsx` | server | Renders `ProgressTabs` above `children` for all four Progress routes |
| Route page | `web/src/app/(app)/dashboard/progress/page.tsx` | server | `generateMetadata` title "Progress"; Suspense boundaries per card |
| Loading | `web/src/app/(app)/dashboard/progress/loading.tsx` | server | Skeleton matching the card order (uses `Skeleton`, UI-11) |
| Error | `web/src/app/(app)/dashboard/progress/error.tsx` | client | `PageError` from `web/src/components/shell/page-error.tsx`, receives `{ error, retry }` |
| ProgressTabs | `web/src/features/progress/components/progress-tabs.tsx` | client | Link tabs (not Radix tabs: each is a route), active by `usePathname`, `aria-current="page"` |
| NextStepCard | `web/src/features/progress/components/next-step-card.tsx` | server | Uses `Card` (`web/src/components/ui/card.tsx`) and `Button` |
| ProjectionCard | `web/src/features/progress/components/projection-card.tsx` | server | Uses `StatCard` (`web/src/components/common/stat-card.tsx`) and `DataTable` (`web/src/components/common/data-table.tsx`) with mobile card fallback |
| StrengthsGapsCard | `web/src/features/progress/components/strengths-gaps-card.tsx` | server | Rows link to `/dashboard/progress/mastery?unit=<id>` |
| TimeOnTaskCard | `web/src/features/progress/components/time-on-task-card.tsx` | server | Renders text summary on the server, mounts `TimeOnTaskChart` lazily |
| TimeOnTaskChart | `web/src/features/progress/components/time-on-task-chart.tsx` | client | Area chart from `web/src/components/common/charts.tsx` (UI-27 `AreaChart`), loaded with `next/dynamic` from a client wrapper |
| Method disclosure | `web/src/features/progress/components/method-note.tsx` | client | `Accordion` from `web/src/components/ui/accordion.tsx` |
| Summary helpers | `web/src/features/progress/lib/summaries.ts` | shared | Pure functions that turn data into the text summaries; unit tested |
| Format helpers | `web/src/features/progress/lib/format.ts` | shared | `formatPercent(null)` returns "No marks yet"; minutes to "3 h 20 min" |
| Loader | `web/src/features/progress/server/get-analytics.ts` | server | Generated client, zod-validated, `"use cache"` keyed by user id |
| Next step loader | `web/src/features/progress/server/get-recommended.ts` | server | BE-PRA-20, falls back to rule in `summaries.ts` when it fails |
| Redirects | `web/next.config.ts` `redirects()` | config | Old routes to `/dashboard/progress` (308) |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/progress/analytics` (BE-PRG-12) | GET | `stage` (`high_school` or `tertiary`), `projection.overall` (number or null), `projection.method` (`predicted_mark` or `weighted_average`), `projection.units[]`: `unitId`, `unitName`, `projected` (number or null), `markedCount`, `lastMarkedAt`; `strengths[]` and `gaps[]`: `unitId`, `unitName`, `accuracy` (number or null), `evidenceCount`; `timeOnTask.weeks[]`: `weekStart` (date), `minutes` (int or null); `timeOnTask.totalMinutes`; `generatedAt` | `progress:analytics:<userId>` |
| `/practice/recommended` (BE-PRA-20) | GET | `unitId`, `unitName`, `topicId`, `topicName`, `reason` (`weakest_topic` or `not_started`), `href` | `practice:recommended:<userId>` |
| `/academics/units` (BE-ACA-15) | GET | `count` only, to tell "no units" from "no marks" | `academics:units:<userId>` |

Rules for the data:

- `projected`, `overall`, `accuracy` and `minutes` are null when there is no evidence (BE-PRG-15). The UI never coerces null to 0.
- A week with no practice returns `minutes: 0` only if the student had at least one unit enrolled that week; otherwise null. The chart shows 0 as a point on the axis and null as a gap.
- Cache life: `cacheLife("minutes")`. Tag `progress:analytics:<userId>` is invalidated by `updateTag` from any client mutation that logs a mark or submits a practice attempt (assessment mark and practice submit pages call it through their server actions or the BFF revalidation hook).

Mutations: none on this page.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Loader pending | Skeletons in card order; screen reader text "Loading your progress" |
| No units | `/academics/units` count is 0 | `EmptyState` with `ChartLine` icon. Title "Nothing to measure yet". Body HS: "Add your subjects and we'll start tracking your progress." Uni: "Add your courses and we'll start tracking your progress." Button "Add subjects" or "Add courses" to `/dashboard/subjects` |
| No marks yet | Units exist, every `projected` is null | `ProjectionCard` headline "No marks yet". Body: "Log a mark for any assessment and your projected result appears here." Button "Log a mark" to `/dashboard/assessments` |
| No practice yet | `timeOnTask.totalMinutes` is null | `TimeOnTaskCard` body: "No practice time yet. Finish a practice test and it shows up here." Button "Start practising" to `/dashboard/practice`. No chart rendered |
| Too little for strengths | `strengths` and `gaps` both empty | "We need a few more answers before we can tell what's going well. Try a short practice test." |
| Partial | Some cards loaded, one failed | Failed card shows inline error: "We couldn't load this part. Your other numbers are fine." Button "Try again" (re-renders that Suspense boundary) |
| Error | Whole loader failed | `PageError` title "We couldn't load your progress". Body "This is on our side, not yours. Check your connection and try again." Button "Try again" |
| Forbidden | Signed-in user is not a student | `PageForbidden` title "This page is for students". Body "Progress belongs to a student account. If you're a parent, your view is on your dashboard." Link "Go to my dashboard" |
| Upgrade | Not applicable while free | Not rendered |
| Populated | Data present | As laid out above |

## Stage variants

| Element | High school | University |
|---|---|---|
| Projection label | "Predicted final mark" per subject; headline "Average predicted mark" | "Projected mark" per course; headline "Projected weighted average" |
| Method note | "Uses your logged assessment marks with the CAPS weighting for each subject (school-based assessment and exam)." | "Uses your logged marks weighted by each assessment's weight in the course." |
| Unit noun | subject, subjects | course, courses |
| Forbidden words | none | SBA, APS, matric, Grade, CAPS |
| Forbidden words (HS) | course, GPA, credits | |
| Next step wording | "Practise {topic} in {subject}" | "Practise {topic} in {course}" |

## Interactions and edge cases

- One unit with marks, others without: headline average uses only units with marks and the evidence line says "From 1 of 6 subjects with marks." Never averages a null.
- A unit with marks but a weight total under 100%: projection is labelled "Early estimate" with a `Badge` and the evidence line "Based on 25% of the year's weighting."
- A projected value is always shown as a whole number with `%` and `tabular-nums`; no decimals.
- Time on task counts server-timed practice only (BE-PRA-09 start to submit, paused time excluded). The method note says so.
- `generatedAt` older than 24 hours (stale projection job): show "Last updated {relative time}" under the header in muted text.
- Recommended drill endpoint fails or returns nothing: fall back to the weakest gap unit ("Review {unit}") or, with no gaps, "Start a practice test".
- Student switches stage in settings: tag invalidated by the profile mutation; page renders the new stage on next load.
- Very long unit names wrap; never truncate without a `title` attribute.
- Redirects: `/dashboard/analytics`, `/dashboard/reports` go to `/dashboard/progress` with 308.

## Copy

- h1: "Progress"
- Description: "Built only from marks you've logged and practice you've done."
- Tabs: "Overview", "Mastery", "Journey", "Achievements"
- Projection evidence line: "From {n} of {total} {units} with marks."
- Strengths heading: "Going well"; gaps heading: "Needs work"
- Time summary (populated): "You practised {total} in the last 8 weeks. Your busiest week was {week} with {busiest}." When the latest week is the busiest: "This week is your busiest so far."
- Time summary (latest week is 0): "No practice yet this week."
- Method disclosure title: "How we work these out"
- Next step card title: "What to do next"

## Acceptance criteria

1. Given a high-school student with marks in 2 of 6 subjects, when they open `/dashboard/progress`, then the headline shows the mean of the 2 projected marks and the line "From 2 of 6 subjects with marks", and the 4 other subjects show "No marks yet".
2. Given a student with units and no marks, when the page loads, then no "0%" appears anywhere and the projection card shows "No marks yet" with a "Log a mark" link.
3. Given a student with no units, when the page loads, then only the "Nothing to measure yet" empty state renders with one button.
4. Given a university student, when the page renders, then none of the words SBA, APS, matric, Grade or CAPS appear in the DOM text.
5. Given time-on-task data for 8 weeks, when the chart renders, then a text summary with the total and busiest week is visible beside it and the latest point is emphasised.
6. Given the analytics endpoint returns 500, when the page loads, then the error state shows "We couldn't load your progress" with a working "Try again" button.
7. Given the recommended endpoint fails but analytics succeeds, when the page loads, then the next step card still shows a fallback suggestion and the rest of the page is populated.
8. Given a parent session, when they request `/dashboard/progress`, then they are routed to the parent area or shown the forbidden state, and no student data is fetched.
9. Given a request to `/dashboard/reports`, when it resolves, then the response is a 308 to `/dashboard/progress`.
10. Given the student is on `/dashboard/progress/mastery`, when the tab bar renders, then "Mastery" has `aria-current="page"` and the sidebar "Progress" item is active.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-PRG-12 reads only the caller's user id from the token (`ICurrentUser`); there is no user id parameter in the route or query. Loader never forwards a client-supplied id | PG-STU-ANALYTICS-Q16 |
| Security | `"use cache"` entries are keyed by user id and the tag includes it; no shared cache entry can hold another student's numbers | PG-STU-ANALYTICS-Q17 |
| Performance | LCP under 2.5s on Pixel 7 profile; JS for this route under 150 KB gzip with the chart chunk loaded after first paint | PG-STU-ANALYTICS-Q18 |
| Resilience | Each card has its own Suspense and error boundary, so one failing source never blanks the page; the loader times out at 5s and shows the card error | PG-STU-ANALYTICS-Q19 |
| Observability | Sentry boundary tags `route=/dashboard/progress`; analytics events `progress_viewed` (props: `stage`, `has_marks`) and `progress_next_step_clicked` (props: `reason`); W3C `traceparent` forwarded from loader to API | PG-STU-ANALYTICS-Q20 |
| Accessibility | WCAG 2.2 AA: chart has a visible text summary plus the hidden data table from `charts.tsx`; status never by colour alone ("Needs work" carries a text label and icon) | PG-STU-ANALYTICS-Q21 |
| Privacy and POPIA | Analytics event props hold no marks, unit names or ids; academic records of minors stay in af-south-1 and are not sent to any third party | PG-STU-ANALYTICS-Q22 |
| Rollout | Behind flag `progress-pages` (also gates Mastery, Journey, Achievements); off returns `notFound()` and hides the nav item; rollback is flipping the flag | PG-STU-ANALYTICS-Q23 |
| Monitoring | Grafana panel "BE-PRG-12 p95 and 5xx"; alert when 5xx rate is over 2% for 10 minutes or p95 over 800ms for 15 minutes; Sentry issue alert on more than 10 events in 10 minutes tagged with this route | PG-STU-ANALYTICS-Q24 |

## Build tasks

- [ ] **PG-STU-ANALYTICS-01** Predicted result (HS) or GPA projection (uni): `ProjectionCard` headline and evidence line
- [ ] **PG-STU-ANALYTICS-02** Strengths and gaps by unit: `StrengthsGapsCard` with links to mastery
- [ ] **PG-STU-ANALYTICS-03** Time on task: `TimeOnTaskCard` shell and server text summary
- [ ] **PG-STU-ANALYTICS-04** Plain-language "what to do next": `NextStepCard` from BE-PRA-20
- [ ] **PG-STU-ANALYTICS-05** Text summary alongside every chart: `summaries.ts` pure functions with unit tests
- [ ] **PG-STU-ANALYTICS-06** Redirect `/dashboard/reports` to `/dashboard/progress` (308) in `next.config.ts`
- [ ] **PG-STU-ANALYTICS-08** Progress layout and `ProgressTabs` link tabs shared by the four Progress routes
- [ ] **PG-STU-ANALYTICS-09** Loader `get-analytics.ts`: generated client, zod parse, `"use cache"`, `cacheTag("progress:analytics:<userId>")`
- [ ] **PG-STU-ANALYTICS-10** Per-unit projection rows: `DataTable` on desktop, stacked cards at 360px, "No marks yet" for null
- [ ] **PG-STU-ANALYTICS-11** "Early estimate" badge when the weighting covered is under 100%
- [ ] **PG-STU-ANALYTICS-12** `TimeOnTaskChart` client area chart (8 weeks, null as gap, latest point emphasised), lazy-loaded
- [ ] **PG-STU-ANALYTICS-13** Next step fallback rule when BE-PRA-20 fails or is empty
- [ ] **PG-STU-ANALYTICS-14** Stage variants: labels, method note and unit nouns from `getStage` (UI-33)
- [ ] **PG-STU-ANALYTICS-15** No-units, no-marks and no-practice states with the exact copy above
- [ ] **PG-STU-ANALYTICS-16** Per-card Suspense and inline card error with retry (partial state)
- [ ] **PG-STU-ANALYTICS-17** "How we work these out" disclosure
- [ ] **PG-STU-ANALYTICS-18** Redirect `/dashboard/analytics` to `/dashboard/progress` (308)
- [ ] **PG-STU-ANALYTICS-19** Stale data line when `generatedAt` is older than 24 hours
- [ ] **PG-STU-ANALYTICS-20** Per-unit story card (old app pattern): one card per unit joining projection, mastery and graded marks, weakest first, so the unit in trouble is read first
- [ ] **PG-STU-ANALYTICS-21** Finished units split out under a collapsed "Finished" section: tertiary courses past their duration or marked finished (BE-ACA-14), high-school subjects enrolled at a grade below the current one
- [ ] **PG-STU-ANALYTICS-22** Projection confidence line from BE-PRG-12 `confidence` (0 to 1, grows with evidence, as in the old predictions endpoint): "Low confidence: based on 1 mark" and so on; never shown as a percentage
- [ ] **PG-STU-ANALYTICS-23** Period wording: "this term" for high school, "this semester" for university, on every period label (old app field names said Term for both; the rebuild names the period by stage)
- [ ] **PG-STU-ANALYTICS-24** Unit names always resolved through the units list; a raw practice key or slug (for example `uct:calculus-i`) never renders, with a test (old app bug)

## Quality tasks

- [ ] **PG-STU-ANALYTICS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-ANALYTICS-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-ANALYTICS-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-ANALYTICS-Q04** Empty state with one clear next action
- [ ] **PG-STU-ANALYTICS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-ANALYTICS-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-ANALYTICS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-ANALYTICS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-ANALYTICS-Q09** Layout at 1440px
- [ ] **PG-STU-ANALYTICS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-ANALYTICS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-ANALYTICS-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-ANALYTICS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-ANALYTICS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-ANALYTICS-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-ANALYTICS-Q16** Integration test (API side, with BE-PRG-12): student A's token never returns student B's projection; loader has no user id input
- [ ] **PG-STU-ANALYTICS-Q17** Cache key review: every `"use cache"` function on this route takes the user id as an argument and tags with it; test that two sessions get different results
- [ ] **PG-STU-ANALYTICS-Q18** Lighthouse CI mobile budget for this route (LCP under 2.5s, JS under 150 KB gzip); chart chunk confirmed split in the build output
- [ ] **PG-STU-ANALYTICS-Q19** Loader timeout (5s) and per-card error boundaries; Playwright test with the recommended endpoint returning 500
- [ ] **PG-STU-ANALYTICS-Q20** Sentry route tag and the two named analytics events through the consent-gated tracker (FE-63); trace id visible end to end in Grafana for one page load
- [ ] **PG-STU-ANALYTICS-Q21** Screen reader pass (VoiceOver iOS, TalkBack) on the chart summary and data table
- [ ] **PG-STU-ANALYTICS-Q22** Event payload review: no marks, unit names or ids in analytics props; documented in the data processing inventory (HRD-31)
- [ ] **PG-STU-ANALYTICS-Q23** `progress-pages` flag wired (page, layout, nav item); rollback drill in staging
- [ ] **PG-STU-ANALYTICS-Q24** Grafana panel and alert rules for BE-PRG-12; Sentry issue alert for the route

## Tests

Unit (Vitest):

- `summaries.test.ts`: "time summary names the busiest week", "time summary says this week is busiest when the latest week leads", "time summary with all nulls returns the no practice copy", "projection evidence line counts only units with marks".
- `format.test.ts`: "formatPercent returns No marks yet for null", "formatPercent never returns 0% for null", "minutes format as hours and minutes".
- `progress-tabs.test.tsx`: "marks the current tab with aria-current".
- `next-step-card.test.tsx`: "falls back to the weakest gap when recommended is empty".

Playwright (`web/e2e/student/progress.spec.ts`, Pixel 7, iPhone 14, desktop Chrome):

- "progress: high school populated shows predicted marks and text summary"
- "progress: university shows projected weighted average and no school wording"
- "progress: units but no marks shows No marks yet and never 0%"
- "progress: no units shows the add subjects empty state"
- "progress: analytics 500 shows error and retry recovers"
- "progress: recommended 500 keeps the rest of the page"
- "progress: reports and analytics redirect to progress"
- "progress: axe clean light and dark at 360 and 1440"

## Open questions

- Does BE-PRG-12 return the per-unit projection, or does the page combine BE-ACA-42 output itself? This spec assumes the endpoint returns it.
- `charts.tsx` currently exports `BarChart`, `LineChart` and `DonutChart` only. UI-27 needs an `AreaChart` with an emphasised latest point before this page can be built.
- Is analytics free on every plan, or is deeper analytics a paid feature?
- Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84), no third-party flag service. `progress-pages` is one of those flags.
- The old analytics page also showed a 7-day mood average beside academic stats. This spec keeps wellbeing off academic pages; confirm.
- The old prediction blended graded marks with practice mastery and the recent mark trend, capped, with a confidence score. BE-ACA-42 and BE-PRG-12 should state whether the rebuild keeps that blend or uses graded marks only (this spec assumes graded marks only plus a confidence value).
