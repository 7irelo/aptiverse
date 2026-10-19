# Mastery

| | |
|---|---|
| ID | `PG-STU-MASTERY` |
| Route | `/dashboard/progress/mastery` (optional `?unit=<unitId>` opens one unit) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free (confirm against `plan_features`, BE-BIL-02) |
| Depends on | BE-PRG-10, BE-PRG-11, BE-PRG-15, BE-ACA-15, BE-ACA-19, BE-PRA-04, UI-04, UI-05, UI-11, UI-21, UI-22, UI-24, UI-27, UI-33, PG-STU-ANALYTICS-08 (Progress layout and tabs) |
| Old app reference | `web/src/app/(app)/dashboard/mastery/page.tsx` and `MasteryCharts.tsx` at 43f9faa (lazy chart chunk, momentum quadrant, per-topic trend delta); `api/Controllers/MasteryController.cs` `GET /api/mastery/topic-mastery` at 43f9faa |
| Status | Not started (backend not started; no route, loader or components exist) |

`PG-STU-MASTERY-05` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

Shows, per subject or course and per topic, how well the student is answering right now. Mastery is recency-weighted accuracy over practice answers (BE-PRG-10): recent answers count more than old ones. Topics with no answers say "No evidence yet", never 0%. Later the Python BKT model writes into the same projection; the page reads one field and does not care which model produced it.

## User stories

- As a student, I want to see every unit I study with an overall mastery figure, so I can compare them at a glance.
- As a student, I want to open a unit and see each topic's mastery, so I know exactly which topic to practise.
- As a student, I want to see how my mastery moved over the term, so I can tell if my practice is working.
- As a student, I want topics I have never practised to say so plainly, so I am not told I am failing something I have not started.
- As a student, I want a one-tap "Practise this topic" from a weak topic.

## Layout

### Mobile (360px)

Single column, `px-4`, `gap-6`:

1. Progress `PageHeader` and `ProgressTabs` (from the layout), "Mastery" active. Page h1 "Mastery", description "How well you're answering, topic by topic. Recent answers count more."
2. `MasteryLegend`: one line of four bands as `Badge`s with text (Not started, Building, Developing, Secure). Collapsible "What these mean" link opens a `Sheet`.
3. `UnitMasteryList`: one `Card` per unit, full width. Each card: unit name, `ProgressRing` (48px) with the percent or a dashed empty ring for no evidence, band label, "{n} topics practised of {total}", chevron. The whole card is a link that sets `?unit=<id>`.
4. When `?unit` is set, the list is replaced by `UnitMasteryDetail`:
   1. Back link "All {units}" (`min-h-11`).
   2. Unit h2, overall percent, band, evidence line "From {answers} answers, last practised {relative date}".
   3. `MasteryTrendCard`: text summary first, then area chart of weekly mastery for the current term (height 160px).
   4. `TopicMasteryList`: rows sorted weakest first, then "No evidence yet" topics last. Row: topic name, bar (`ProgressBar`), percent or "No evidence yet", answer count, "Practise" button (44px).

### Desktop (1440px)

Two-pane master and detail inside `PageShell`:

- Left (4 of 12 columns): `MasteryLegend` and `UnitMasteryList` as a compact list, selected unit highlighted with `aria-current="true"`.
- Right (8 of 12): `UnitMasteryDetail` for the selected unit (first unit with evidence when no `?unit`). Trend card on top with the text summary in a 1/3 column and the chart in 2/3 (height 240px); topic list below as a `DataTable` with columns Topic, Mastery, Band, Answers, Last practised, action.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/progress/mastery/page.tsx` | server | Reads `searchParams.unit`; `generateMetadata` title "Mastery" or "{unit} mastery" |
| Loading | `web/src/app/(app)/dashboard/progress/mastery/loading.tsx` | server | List skeleton (4 cards) |
| Error | `web/src/app/(app)/dashboard/progress/mastery/error.tsx` | client | `PageError` with retry |
| Not found | `web/src/app/(app)/dashboard/progress/mastery/not-found.tsx` | server | When `?unit` is not one of the student's units |
| MasteryLegend | `web/src/features/progress/components/mastery-legend.tsx` | server | Bands from `mastery-bands.ts`; "What these mean" uses `Sheet` (`web/src/components/ui/sheet.tsx`) via a small client trigger |
| UnitMasteryList | `web/src/features/progress/components/unit-mastery-list.tsx` | server | `Card`, `ProgressRing` (`web/src/components/common/progress-ring.tsx`) |
| UnitMasteryDetail | `web/src/features/progress/components/unit-mastery-detail.tsx` | server | Composes trend and topics |
| MasteryTrendCard | `web/src/features/progress/components/mastery-trend-card.tsx` | server | Server text summary plus lazy `MasteryTrendChart` |
| MasteryTrendChart | `web/src/features/progress/components/mastery-trend-chart.tsx` | client | UI-27 `AreaChart`, y axis 0 to 100, faint grid, latest point emphasised, null weeks as gaps |
| TopicMasteryList | `web/src/features/progress/components/topic-mastery-list.tsx` | server | `DataTable` with mobile card fallback; uses `Progress` (`web/src/components/ui/progress.tsx`) |
| PractiseTopicButton | `web/src/features/progress/components/practise-topic-button.tsx` | server | Link to `/dashboard/practice?unit=<id>&topic=<id>`, which opens the practice generate sheet preselected (PG-STU-PRACTICE, BE-PRA-04) |
| Bands | `web/src/features/progress/lib/mastery-bands.ts` | shared | `bandFor(value: number \| null, evidenceCount: number)`; unit tested |
| Trend summary | `web/src/features/progress/lib/summaries.ts` | shared | `masteryTrendSummary(points)` added to the shared file |
| Loader | `web/src/features/progress/server/get-mastery.ts` | server | `"use cache"`, tag `progress:mastery:<userId>` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/progress/mastery` (BE-PRG-11) | GET | `units[]`: `unitId`, `unitName`, `kind` (`caps_subject` or `tertiary_course`), `mastery` (0 to 100 or null), `evidenceCount`, `topicsPractised`, `topicsTotal`, `lastPractisedAt` (or null) | `progress:mastery:<userId>` |
| `/progress/mastery?unitId=<id>` (BE-PRG-11) | GET | `unit` as above; `topics[]`: `topicId`, `topicName`, `mastery` (or null), `evidenceCount`, `lastPractisedAt`; `trend[]`: `weekStart`, `mastery` (or null); `term`: `startsOn`, `endsOn`; `model` (`recency_weighted` now, `bkt` later) | `progress:mastery:<userId>:<unitId>` |

Rules:

- `mastery` is null when `evidenceCount` is 0 (BE-PRG-15). The UI also treats fewer than 5 answers as an "early read" and labels it, but still shows the number.
- Topics come from the emergent registry (BE-ACA-19); a topic with no answers still appears, with null mastery.
- Tags are invalidated when a practice attempt is graded (the results page calls `updateTag("progress:mastery:<userId>")`; the API handler for `PracticeAttemptGraded` updates the projection before results are returned, so the next read is fresh).
- `cacheLife("minutes")`.

Mutations: none on this page.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Card skeletons; "Loading your mastery" for screen readers |
| No units | `units` empty | `EmptyState`, `Target` icon. Title "No {units} yet". Body "Add a {unit} and practise it to see your mastery here." Button "Add {units}" to `/dashboard/subjects` |
| No evidence anywhere | Units exist, all `mastery` null | Above the list: "No evidence yet. Mastery comes from practice answers, so finish one practice test to see your first numbers." Button "Start practising" to `/dashboard/practice`. Each unit card shows the dashed ring and "No evidence yet" |
| Unit with no evidence | Selected unit `mastery` null | Detail shows "No evidence yet for {unit}." Button "Practise {unit}". Trend chart not rendered; topic list still lists topics with "No evidence yet" |
| Early read | `evidenceCount` 1 to 4 | `Badge` "Early read" next to the percent, tooltip "Based on fewer than 5 answers, so this can move a lot." |
| Trend with one point | Only one week has a value | No chart. Text "One week of practice so far. Your trend appears after your second week." |
| Error | Loader failed | "We couldn't load your mastery. Check your connection and try again." Button "Try again" |
| Not found | `?unit` not owned or unknown | "We couldn't find that {unit}. It may have been removed." Link "See all {units}" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |
| Populated | Data present | As laid out |

## Stage variants

| Element | High school | University |
|---|---|---|
| Unit noun | subject, subjects | course, courses |
| Back link | "All subjects" | "All courses" |
| Term range | School term from the CAPS calendar for the student's year | Semester from the course's start date and duration (BE-ACA-14) |
| Forbidden words | course, GPA | SBA, APS, matric, Grade, CAPS |

## Interactions and edge cases

- Bands (`mastery-bands.ts`): null is "Not started"; under 50 "Building" (terracotta, needs work); 50 to 69 "Developing"; 70 to 84 "Secure"; 85 and above "Strong" (forest). The band text is always shown; colour only reinforces it.
- Sort: units by name; topics weakest first, ties by fewest answers, then null topics alphabetically.
- `?unit` with a soft-deleted (unenrolled) unit returns not found, not stale data.
- A unit with 40 or more topics: topic list paginates at 20 with "Show more" (button, not infinite scroll).
- Trend y axis is fixed 0 to 100 so small changes are not exaggerated.
- Trend summary: "Up {n} points since {first week}" or "Down {n} points since {first week}" or "About the same as {first week}" (change under 3 points). Never "great job" language.
- Selecting a unit updates the URL with `router.replace` semantics via a link, so back returns to the list on mobile.
- The `model` field is not shown to students; the method note says "Recent answers count more than older ones."

## Copy

- h1: "Mastery"
- Description: "How well you're answering, topic by topic. Recent answers count more."
- Legend sheet title: "What these mean"; body lists each band with its range.
- Evidence line: "From {answers} answers, last practised {relative date}."
- Topic row action: "Practise"
- No evidence label: "No evidence yet"

## Acceptance criteria

1. Given a topic with zero answers, when the unit detail renders, then the row shows "No evidence yet", the bar is empty and no "0%" text exists in the row.
2. Given a topic with 3 answers at 67%, when it renders, then the row shows "67%" with an "Early read" badge.
3. Given a unit list where every unit has null mastery, when the page loads, then the "No evidence yet" banner with "Start practising" shows above the list.
4. Given `?unit=<id>` for a unit the student does not own, when the page loads, then the not-found state renders and the API returned 404.
5. Given trend data with 6 weekly points, when the chart renders, then the latest point is emphasised, nulls are gaps, the y axis spans 0 to 100, and a text summary sits beside it.
6. Given a weak topic, when the student taps "Practise", then they land on the practice generate flow with unit and topic preselected.
7. Given a university student, when the page renders, then no SBA, APS, matric, Grade or CAPS wording appears.
8. Given 360px width, when the detail view is open, then there is no horizontal scroll and every row action is at least 44px tall.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-PRG-11 checks the `unitId` belongs to the caller and returns 404 (not 403) otherwise, so unit ids cannot be probed | PG-STU-MASTERY-Q16 |
| Security | Practice links carry only unit and topic ids, never names or marks | PG-STU-MASTERY-Q16 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; trend chart lazy-loaded only when a unit is open; list view ships no chart code | PG-STU-MASTERY-Q17 |
| Resilience | Detail fetch failure keeps the unit list usable with an inline error; slow network shows skeleton within 100ms via Suspense | PG-STU-MASTERY-Q18 |
| Observability | Sentry route tag; events `mastery_unit_opened` (props: `stage`, `has_evidence`) and `mastery_practise_clicked` (props: `band`); trace propagation to BE-PRG-11 | PG-STU-MASTERY-Q19 |
| Accessibility | WCAG 2.2 AA; rings and bars have `aria-valuenow` or "No evidence yet" as text; chart has text summary and data table; band never by colour alone | PG-STU-MASTERY-Q20 |
| Privacy and POPIA | No topic names or mastery values in analytics props or logs; minors' learning data stays in af-south-1 | PG-STU-MASTERY-Q21 |
| Rollout | Flag `progress-pages`; rollback by flag; BKT switch later is a backend change behind its own flag with no UI change | PG-STU-MASTERY-Q22 |
| Monitoring | Grafana "BE-PRG-11 p95 and 5xx"; alert at 5xx over 2% for 10 minutes; projection lag metric (time from `PracticeAttemptGraded` to projection updated) alert when p95 over 60s | PG-STU-MASTERY-Q23 |

## Build tasks

- [ ] **PG-STU-MASTERY-01** Per-unit mastery overview: `UnitMasteryList` cards with ring, band and topic counts
- [ ] **PG-STU-MASTERY-02** Per-topic drilldown: `UnitMasteryDetail` and `TopicMasteryList` with sort rules
- [ ] **PG-STU-MASTERY-03** Trend chart over the term: `MasteryTrendChart` area chart, lazy-loaded
- [ ] **PG-STU-MASTERY-04** "No evidence yet" display (never zero) on rings, bars, rows and banners
- [ ] **PG-STU-MASTERY-06** Loader `get-mastery.ts` for list and unit detail, zod-validated, cached with user and unit tags
- [ ] **PG-STU-MASTERY-07** `mastery-bands.ts` band function and `MasteryLegend` with "What these mean" sheet
- [ ] **PG-STU-MASTERY-08** "Early read" badge for 1 to 4 answers
- [ ] **PG-STU-MASTERY-09** Trend text summary function and single-point state
- [ ] **PG-STU-MASTERY-10** Desktop master and detail layout with selected unit state from `?unit`
- [ ] **PG-STU-MASTERY-11** `PractiseTopicButton` deep link into practice generation
- [ ] **PG-STU-MASTERY-12** `not-found.tsx` for unknown or unowned `?unit`
- [ ] **PG-STU-MASTERY-13** Topic list pagination at 20 with "Show more"
- [ ] **PG-STU-MASTERY-14** Stage variants: nouns and term range
- [ ] **PG-STU-MASTERY-15** Redirect `/dashboard/mastery` to `/dashboard/progress/mastery` (308)
- [ ] **PG-STU-MASTERY-16** Per-topic change since first practice (old `trend`: latest attempt's topic score minus the first), shown as "Up 12 since you started" with a Lucide arrow and text; null when only one attempt
- [ ] **PG-STU-MASTERY-17** "Needs attention" filter: topics under 50 and falling (the old momentum quadrant's weak and slipping corner) as a list, not a scatter chart
- [ ] **PG-STU-MASTERY-18** Chart skeleton with reserved height so the lazy chunk causes no layout shift (CLS under 0.1)
- [ ] **PG-STU-MASTERY-19** Unit names resolved through the units list; raw practice keys never render (old app bug), with a test

## Quality tasks

- [ ] **PG-STU-MASTERY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-MASTERY-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-MASTERY-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-MASTERY-Q04** Empty state with one clear next action
- [ ] **PG-STU-MASTERY-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-MASTERY-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-MASTERY-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-MASTERY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-MASTERY-Q09** Layout at 1440px
- [ ] **PG-STU-MASTERY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-MASTERY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-MASTERY-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-MASTERY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-MASTERY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-MASTERY-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-MASTERY-Q16** Integration test with BE-PRG-11: another student's `unitId` returns 404; Playwright asserts the not-found state
- [ ] **PG-STU-MASTERY-Q17** Lighthouse CI mobile budget; build output confirms the chart chunk loads only on the detail view
- [ ] **PG-STU-MASTERY-Q18** Detail error boundary keeps the list usable; Playwright test with the unit detail call returning 500
- [ ] **PG-STU-MASTERY-Q19** Sentry route tag and the two named events through the consent-gated tracker
- [ ] **PG-STU-MASTERY-Q20** Screen reader pass on rings, bars and the chart summary
- [ ] **PG-STU-MASTERY-Q21** Analytics and log payload review for topic names and values
- [ ] **PG-STU-MASTERY-Q22** `progress-pages` flag check on this route
- [ ] **PG-STU-MASTERY-Q23** Grafana panel and alerts for BE-PRG-11 and projection lag

## Tests

Unit (Vitest):

- `mastery-bands.test.ts`: "null is Not started", "49 is Building", "50 is Developing", "85 is Strong", "fewer than 5 answers flags early read".
- `summaries.test.ts`: "trend up names the points gained", "change under 3 points reads about the same", "single point returns the one week copy", "nulls are skipped, not counted as zero".
- `topic-mastery-list.test.tsx`: "sorts weakest first and no-evidence topics last", "renders No evidence yet instead of 0%".

Playwright (`web/e2e/student/progress-mastery.spec.ts`):

- "mastery: list shows rings and bands for each unit"
- "mastery: opening a unit shows trend summary and topics weakest first"
- "mastery: no evidence anywhere shows the start practising banner"
- "mastery: unowned unit id shows not found"
- "mastery: practise button opens practice with topic preselected"
- "mastery: university wording has no school terms"
- "mastery: axe clean light and dark at 360 and 1440"

## Open questions

- Band thresholds (50, 70, 85) and the early-read cut-off (5 answers) are proposals; confirm, and decide whether the API returns the band so parent views match exactly.
- Should graded assessment marks feed mastery, or only practice answers? This spec assumes practice answers only (mastery) and leaves assessment marks to the projection on the Overview tab.
- Where does the term range for high-school students come from (a school calendar seed in Academics)? Not in BE-ACA yet.
- The old page drew a radar per unit and a mastery versus change scatter. This spec replaces both with lists and one area chart for clarity on mobile; confirm nothing is lost.
