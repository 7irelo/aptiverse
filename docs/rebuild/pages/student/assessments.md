# Assessments

| | |
|---|---|
| ID | `PG-STU-ASMT-LIST` |
| Route | `/dashboard/assessments` |
| Phase | 4 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-15, BE-ACA-33, BE-ACA-42; PG-STU-CAL (month grid component); UI-05, UI-06, UI-13, UI-22, UI-26, UI-33, SHL-04, SHL-05 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/assessments/page.tsx`, `f223ca7:DESIGN_BRIEF.md` section 9 ("Assessments and assignments") |
| Status | Not started. No nav entry yet in `web/src/components/shell/nav-config.ts`. Backend (Academics) not started. |

## Purpose

Every assessment the student has logged, in time order, so nothing is missed. High-school students track SBA tasks and their Programme of Assessment; university students track assignments, tests and exams. The page also shows how logged marks add up toward a predicted result (high school) or a course average (university).

## User stories

- As a student, I see overdue and upcoming assessments first, then finished ones.
- As a student, I filter by subject or course and by state.
- As a student, I switch to a month view to see busy weeks.
- As a high-school student, I see how much of each subject's SBA weight is already marked and what my predicted result is.
- As a university student, I see my current weighted average per course.
- As a student, I add a new assessment in one tap.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` "Assessments"; description by stage; primary "Add assessment" (full width).
2. Toolbar: view `Tabs` ("List", "Month"); filter button opening a sheet (unit select, state checkboxes); active filter chips with clear buttons.
3. Weighting summary (collapsed `Accordion`, `h2` "Predicted results" HS or "Course averages" uni): per unit row with marked weight ("40% of SBA marked") and value or "No marks yet".
4. List view: groups with `h2` headings "Overdue", "This week", "Next week", "Later", "Done"; each row a link card: title, unit, type badge, due label, state badge, mark or "No mark yet". "Done" shows 10 then "Show more".
5. Month view (when selected): month grid with dots per day; tapping a day lists that day's assessments below the grid.

### Desktop (1440px)

`PageShell width="wide"`. Toolbar inline: tabs left, filters as inline selects right (no sheet). Two columns: list or month (8 columns), weighting summary expanded as a sticky side card (4 columns). List rows become a `DataTable` with columns Title, Unit, Type, Due, State, Mark; sortable by Due.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/assessments/page.tsx` | server | reads `searchParams` (`view`, `unit`, `state`, `month`) |
| Loading | `web/src/app/(app)/dashboard/assessments/loading.tsx` | server | list skeleton |
| Error | `web/src/app/(app)/dashboard/assessments/error.tsx` | client | `PageError` |
| Loader | `web/src/features/assessments/server/get-assessments.ts` | server | BE-ACA-33, shared with unit detail and calendar |
| Weighting loader | `web/src/features/assessments/server/get-weighting-summary.ts` | server | from BE-ACA-15 unit summaries |
| SAST date helpers | `web/src/lib/format/date.ts` | shared | `toSast`, `startOfSastDay`, `startOfSastWeek` (Monday), `formatDueLabel`, `sastDateTimeToUtc` using `@date-fns/tz` |
| Grouping | `web/src/features/assessments/lib/group-assessments.ts` | shared | pure, SAST weeks |
| Assessment row | `web/src/features/assessments/components/assessment-row.tsx` | server | card on mobile, used by unit detail and dashboard |
| List | `web/src/features/assessments/components/assessment-list.tsx` | server | groups and "Show more" link (`?doneLimit=`) |
| Table | `web/src/features/assessments/components/assessment-table.tsx` | client | `DataTable` with mobile card fallback |
| Toolbar | `web/src/features/assessments/components/assessments-toolbar.tsx` | client | `Tabs`, updates URL with `router.replace` |
| Filter sheet | `web/src/features/assessments/components/assessment-filters-sheet.tsx` | client | `Sheet`, `Select`, checkboxes |
| Month view | `web/src/features/assessments/components/assessments-month.tsx` | client | uses `web/src/features/calendar/components/month-grid.tsx` |
| Weighting summary | `web/src/features/assessments/components/weighting-summary.tsx` | server | `Accordion` on mobile |
| State badge | `web/src/features/assessments/components/assessment-state-badge.tsx` | server | colour plus text, never colour alone |
| Type labels | `web/src/features/assessments/lib/assessment-types.ts` | shared | per stage |
| Nav entry | `web/src/components/shell/nav-config.ts` | shared | new item "Assessments", icon `clipboard-list` (add to `nav-icons.ts`) |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/assessments?unitId=&state=&from=&to=&page=&pageSize=` (BE-ACA-33) | GET | `items[] { id, title, unitId, unitName, type, weightPercent, dueAt, state, markPercent or null }`, `page`, `total` | user-scoped, tag `academics:assessments:<userId>` |
| `/academics/units` (BE-ACA-15) | GET | `items[] { id, name, kind, assessmentSummary { markedWeightPercent, totalWeightPercent, predictedPercent or null, averagePercent or null } }` | tag `academics:units:<userId>` |

Predicted and average values come from BE-ACA-42 on the server; the web never recomputes them.

Mutations: none here (create, edit, transition and mark live on the other assessment pages, which revalidate `academics:assessments:<userId>`).

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | skeleton rows |
| Empty | no assessments at all | title "No assessments yet"; body HS "Add your SBA tasks, tests and exams so nothing sneaks up on you." / uni "Add your assignments, tests and exams so nothing sneaks up on you."; action "Add assessment" |
| Empty (no units) | student has no units | title "Add your {nouns} first"; body "Assessments belong to a {noun}."; action "Add {nouns}" to `/dashboard/subjects` |
| Filtered empty | filters match nothing | "No assessments match these filters." action "Clear filters" |
| Error | loader fails | `PageError` defaults |
| Forbidden | non-student | proxy redirect; fallback `PageForbidden` |
| No evidence | `markPercent` null | "No mark yet"; summary value "No marks yet" |
| Populated | data | groups or month grid |

## Stage variants

| Item | High school | University |
|---|---|---|
| Description | "Your SBA tasks, tests and exams." | "Your assignments, tests and exams." |
| Types (43f9faa lists) | Test, Essay, Investigation, Practical, Exam, Project, Oral | Assignment, Class test, Test, Tutorial, Lab report, Practical, Midterm, Exam, Essay, Project, Presentation |
| Add button | "Add SBA" | "Add assessment" |
| Weight hint | "% of the SBA mark" | "% of the course mark" |
| Summary title | "Predicted results" (with NSC level) | "Course averages" (no NSC level) |
| Term or semester | "Term 3" label on rows when known | "Semester 2" label when known |

## Interactions and edge cases

- All grouping uses SAST: weeks start Monday 00:00 Africa/Johannesburg. "Overdue" means `dueAt` before now, state is `scheduled` or `in_progress`, and no mark is logged (43f9faa checks both, because state and mark can drift); graded or submitted items never show as overdue.
- Overview tiles (43f9faa): "Overdue", "Due in 7 days", "Awaiting mark" (submitted, no mark), "Marked". Each is a count over real rows; only the Overdue tile uses the attention colour, and only when it is above 0.
- Attention rail (43f9faa): open items due within 7 days or overdue, overdue first then soonest; hidden when empty.
- Mark column wording: a mark, or "Awaiting" (submitted, no mark) or "Not submitted" (still open), never a dash.
- Row quick action "Mark as submitted" only on rows in `scheduled` or `in_progress` (calls BE-ACA-36); the label is a verb phrase so it never reads as a state.
- Search box filters by title within the current filters.
- Filters live in the URL so a filtered view can be bookmarked and the back button works; invalid values are ignored, not errors.
- Month view navigates with "Previous month" and "Next month" buttons and `?month=2026-10`; the loader fetches only that month's range.
- "Done" pagination uses BE-SK-08 paging; other groups load fully (bounded by the API max page size of 100).
- The `month` view on a 360px screen shows dots only; counts appear in the day list.
- A row for an assessment in a removed unit still shows, with unit name "Removed {noun}".

## Copy

- Due labels: "Overdue by 2 days", "Due today, 14:00", "Due tomorrow", "Due Fri 24 Oct", "Due 3 Nov"
- State badges: "Scheduled", "In progress", "Submitted", "Marked"
- Summary row HS: "{marked}% of SBA marked, predicted {value}% (level {n})"; uni: "{marked}% of course marked, average {value}%"

## Acceptance criteria

- Given the clock fixed at Wednesday 15 October 2026 10:00 SAST and four assessments (scheduled, due Tue 14 Oct; scheduled, due Wed 15 Oct 14:00; scheduled, due Mon 20 Oct; graded, due Thu 9 Oct), when the list renders, then Overdue holds the 14 Oct one, This week the 15 Oct one, Next week the 20 Oct one, and Done the graded one.
- Given a filter `unit=X&state=scheduled` in the URL, when the page loads, then only matching rows render and a chip "X" and "Scheduled" can each be cleared.
- Given a university student, when the page renders, then no "SBA" text appears and the summary title is "Course averages".
- Given no assessments and at least one unit, when the page renders, then the empty state shows one "Add assessment" action.
- Given the student nav, when signed in as a student, then "Assessments" appears in the Learn section and is active on `/dashboard/assessments` and its child routes.
- Given a due time of 23:30 SAST, when viewed from a browser in UTC, then the label shows the SAST time and SAST day.

## Production readiness

- Security: BE-ACA-33 filters by the caller only; the web passes no user id. Filter parameters are validated with a zod schema before use and never interpolated into HTML.
- Performance: list is server-rendered and streamed; toolbar, filter sheet and month view are client islands, with the month view dynamically imported. Route JS under 90 KB gzip. API calls bounded by a date range and page size.
- Resilience: filter changes use `router.replace` with transitions so the old list stays visible with a pending indicator; loader timeout 4 s; weighting summary has its own boundary.
- Observability: analytics `assessments_viewed { view }`, `assessments_filtered { hasUnit, stateCount }`, `assessments_month_navigated`. Sentry tag `page:assessments`. Traces to BE-ACA-33.
- Accessibility (WCAG 2.2 AA): state badges carry text; month grid is a `table` with day buttons labelled "Friday 24 October, 2 assessments"; group headings are `h2`.
- Privacy and POPIA: marks are academic personal information of possible minors; never sent to analytics.
- Rollout: Phase 4 behind `academics.assessments` flag, nav entry gated by the same flag. Rollback: flag off hides the nav item and route.
- Monitoring: Grafana panel for BE-ACA-33 p95 and 5xx; alert when p95 exceeds 500 ms for 10 minutes.

## Build tasks

- [ ] **PG-STU-ASMT-LIST-01** List view grouped by due date (Overdue, This week, Next week, Later, Done)
- [ ] **PG-STU-ASMT-LIST-02** Month view toggle (reuses the calendar month grid)
- [ ] **PG-STU-ASMT-LIST-03** Filters (unit, state): mobile sheet, desktop inline selects, URL-synced chips
- [ ] **PG-STU-ASMT-LIST-04** Stage wording (SBA and Programme of Assessment vs assignments, tests and exams) via `assessment-types.ts`
- [ ] **PG-STU-ASMT-LIST-05** Weighting toward final result summary (marked weight and predicted or average per unit, from BE-ACA-15)
- [ ] **PG-STU-ASMT-LIST-06** Add "Assessments" to the student nav in `nav-config.ts` with a `clipboard-list` icon in `nav-icons.ts`
- [ ] **PG-STU-ASMT-LIST-07** Use the shared Africa/Johannesburg date helpers from `web/src/lib/format/date.ts` (owned by FE-82, which absorbs the planned `lib/format/date.ts`) for due dates and grouping
- [ ] **PG-STU-ASMT-LIST-08** Loader `get-assessments.ts` (BE-ACA-33) with zod-validated filter params and tag
- [ ] **PG-STU-ASMT-LIST-09** Grouping helper `group-assessments.ts` with SAST week boundaries and unit tests
- [ ] **PG-STU-ASMT-LIST-10** Assessment row component and state badge (shared with dashboard and unit detail)
- [ ] **PG-STU-ASMT-LIST-11** Desktop `DataTable` with sort by due and mobile card fallback
- [ ] **PG-STU-ASMT-LIST-12** "Done" group paging with "Show more"
- [ ] **PG-STU-ASMT-LIST-13** Empty, no-units and filtered-empty states
- [ ] **PG-STU-ASMT-LIST-14** Analytics events listed above
- [ ] **PG-STU-ASMT-LIST-15** Flag `academics.assessments` gating route and nav entry; rollback note
- [ ] **PG-STU-ASMT-LIST-16** Grafana panel and latency alert for BE-ACA-33
- [ ] **PG-STU-ASMT-LIST-17** Dynamic import of the month view; route JS budget 90 KB gzip
- [ ] **PG-STU-ASMT-LIST-18** Overview tiles (Overdue, Due in 7 days, Awaiting mark, Marked) with attention colour only on a non-zero Overdue (from 43f9faa)
- [ ] **PG-STU-ASMT-LIST-19** Attention rail: open items due within 7 days or overdue, sorted overdue first
- [ ] **PG-STU-ASMT-LIST-20** "Grouped by {noun}" view alongside List and Month, each group showing the server's weighted term or course mark (never a client-side mean, the 43f9faa bug)
- [ ] **PG-STU-ASMT-LIST-21** Mark column wording "Awaiting" and "Not submitted" instead of an empty mark
- [ ] **PG-STU-ASMT-LIST-22** Row quick action "Mark as submitted" with pending state and `version` (BE-ACA-36)
- [ ] **PG-STU-ASMT-LIST-23** Title search within filters, URL-synced as `q`
- [ ] **PG-STU-ASMT-LIST-24** Overdue rule shared helper `is-open.ts` (open state and no mark) used by list, dashboard, calendar and detail, with unit tests
- [ ] **PG-STU-ASMT-LIST-25** Stage-specific type lists from 43f9faa in `assessment-types.ts` and the "Add SBA" or "Add assessment" label

## Quality tasks

- [ ] **PG-STU-ASMT-LIST-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`)
- [ ] **PG-STU-ASMT-LIST-Q02** Server loaders in `src/features/assessments/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-ASMT-LIST-Q03** No mutations here; confirm the other assessment pages revalidate the list tag
- [ ] **PG-STU-ASMT-LIST-Q04** Empty state with one clear next action
- [ ] **PG-STU-ASMT-LIST-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-ASMT-LIST-Q06** Forbidden state (no upgrade state: free page)
- [ ] **PG-STU-ASMT-LIST-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-ASMT-LIST-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); table collapses to cards
- [ ] **PG-STU-ASMT-LIST-Q09** Layout at 1440px
- [ ] **PG-STU-ASMT-LIST-Q10** Light and dark both correct (OS-driven); overdue uses terracotta, never rose
- [ ] **PG-STU-ASMT-LIST-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-ASMT-LIST-Q12** axe: zero violations in light and dark, both views
- [ ] **PG-STU-ASMT-LIST-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order, month grid arrow keys
- [ ] **PG-STU-ASMT-LIST-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-ASMT-LIST-Q15** `generateMetadata` title "Assessments"; nav entry active on all `/dashboard/assessments` routes

## Tests

Unit (Vitest):
- `sast.test.ts`: "start of week is Monday in SAST", "23:30 SAST stays the same day from a UTC browser", "formatDueLabel overdue, today, tomorrow, weekday, date", "sastDateTimeToUtc round trips"
- `group-assessments.test.ts`: "graded never overdue", "Sunday 23:59 SAST is this week", "Monday 00:00 SAST is next week", "done sorted newest first"
- `assessment-types.test.ts`: "university list has no SBA task"
- `weighting-summary.test.tsx`: "null predicted shows No marks yet", "university row has no NSC level"

Playwright (`web/e2e/student/assessments.spec.ts`):
- "list groups overdue, this week and done"
- "filters sync to the URL and clear"
- "month view shows a day's assessments"
- "university wording has no SBA"
- "nav shows Assessments and marks it active"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- BE-ACA-15 must expose `assessmentSummary` (marked weight, predicted or average) or a dedicated weighting endpoint is needed; BE-ACA-42 is only the pure function.
- Term and semester labels need term dates (see PG-STU-CAL open questions); rows omit the label until a source exists.
- Should the nav item live under "Learn" (this file) or "Account" next to Calendar?
- BE-ACA-30 must accept the union of both type lists (43f9faa once rejected the tertiary types with a 400); the client decides which subset to offer.
