# Unit detail

| | |
|---|---|
| ID | `PG-STU-UNIT` |
| Route | `/dashboard/subjects/[id]` |
| Phase | 4 (mastery blocks light up in Phase 7) |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-16, BE-ACA-19, BE-ACA-33, BE-ACA-61, BE-PRG-11; PG-STU-UNITS (unit labels, course form sheet); UI-04, UI-05, UI-22, UI-24, UI-27, UI-33 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/subjects/[id]/page.tsx`, `f223ca7:DESIGN_BRIEF.md` section 9 ("Subject detail") |
| Status | Not started. Backend (Academics, Progress) not started. |

## Purpose

Everything about one subject or course on one page: how the student is doing overall, which topics are strong or weak (from real evidence only), what assessments are coming, where to find past papers (high school), and a one-tap way to practise exactly this unit or topic.

## User stories

- As a student, I see my overall standing in this unit, or "No marks yet" if I have not practised or logged a mark.
- As a student, I see topics sorted weakest first so I know what to work on.
- As a student, I tap "Practise this topic" and land in the generate sheet with the unit and topic already chosen.
- As a student, I see this unit's assessments, with the next one due first.
- As a high-school student, I jump to past papers for this subject and my grade.
- As a student, I see how my results in this unit have moved over time, with a text summary.

## Layout

### Mobile (360px)

1. Back link "Subjects" or "Courses" (to `/dashboard/subjects`).
2. Header: `h1` unit name; level chip ("Grade 11, NSC" or "Second year"); overall standing (`ProgressRing` with percent, or "No marks yet"); actions "Practise this" (primary, full width) and overflow (Edit for courses, Remove).
3. Topics section (`h2` "Topics"): rows with topic name, mastery bar or "No marks yet", evidence count ("From 12 questions"), "Practise" button per row. Weakest first, no-evidence topics last. Show 6, then "Show all {n} topics".
4. Progress over time (`h2` "Progress over time"): line chart with text summary under it.
5. Assessments (`h2` "Assessments" HS or "Assessments" uni with types adjusted): next 5 rows, "All assessments for this {noun}" link to `/dashboard/assessments?unit={id}`, "Add assessment" link to `/dashboard/assessments/new?unit={id}`.
6. Resources (`h2`): HS "Past papers" card linking to `/dashboard/past-papers?subject={code}&grade={grade}` with the count of papers; uni section hidden (see open questions).

### Desktop (1440px)

`PageShell width="wide"`. Header full width with actions on the right. Two columns below: left 8 columns (Topics, Progress over time), right 4 columns (Assessments, Resources). The topic list shows all topics without the "Show all" cut.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/subjects/[id]/page.tsx` | server | awaits `params`, parallel loaders, `Suspense` per section |
| Loading | `web/src/app/(app)/dashboard/subjects/[id]/loading.tsx` | server | header plus section skeletons |
| Error | `web/src/app/(app)/dashboard/subjects/[id]/error.tsx` | client | `PageError` |
| Not found | `web/src/app/(app)/dashboard/subjects/[id]/not-found.tsx` | server | `PageState` with back link |
| Unit loader | `web/src/features/academics/server/get-unit.ts` | server | BE-ACA-16; 404 calls `notFound()` |
| Topics loader | `web/src/features/academics/server/get-unit-topics.ts` | server | BE-ACA-19 |
| Mastery loader | `web/src/features/progress/server/get-unit-mastery.ts` | server | BE-PRG-11; returns `null` while the flag is off or Progress is not deployed |
| Unit assessments loader | `web/src/features/academics/server/get-assessments.ts` | server | BE-ACA-33 with `unitId`, shared with the list page |
| Header | `web/src/features/academics/components/unit-header.tsx` | server | `ProgressRing`, `Badge` |
| Topic list | `web/src/features/academics/components/topic-mastery-list.tsx` | server | rows; "Show all" uses a `details` disclosure, no client JS |
| Topic row | `web/src/features/academics/components/topic-mastery-row.tsx` | server | `Progress`, link button |
| Sort helper | `web/src/features/academics/lib/sort-topics.ts` | shared | weakest first, null last, then name |
| Progress chart | `web/src/features/progress/components/unit-progress-chart.tsx` | client | `LineChart` from `components/common/charts.tsx`, text summary slot |
| Chart summary | `web/src/features/progress/lib/summarise-trend.ts` | shared | builds the sentence under the chart |
| Assessments block | `web/src/features/assessments/components/unit-assessments-block.tsx` | server | reuses `assessment-row.tsx` from the list page |
| Resources block | `web/src/features/academics/components/unit-resources-block.tsx` | server | HS only |
| Actions | `web/src/features/academics/components/unit-actions-menu.tsx` | client | shared with PG-STU-UNITS |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/units/{id}` (BE-ACA-16) | GET | `id, kind, name, code, level { grade, curriculum, studyLevel, duration }, progress { percent or null, evidenceCount }, version` | user-scoped, tag `academics:unit:<id>` |
| `/academics/units/{id}/topics` (BE-ACA-19) | GET | `items[] { id, name, questionCount }` | user-scoped, tag `academics:unit:<id>:topics` |
| `/progress/mastery?unitId=` (BE-PRG-11) | GET | `overall { percent or null }`, `topics[] { topicId, percent or null, evidenceCount, trend }`, `series[] { date, percent }` | user-scoped, tag `progress:mastery:<userId>` |
| `/academics/assessments?unitId=&from=today&limit=5` (BE-ACA-33) | GET | `items[] { id, title, type, dueAt, state, markPercent or null }` | tag `academics:assessments:<userId>` |
| `/academics/past-papers?subject=&grade=&limit=0` (BE-ACA-61) | GET | `total` | shared, revalidate 1 day |

Mutations: edit and remove are owned by PG-STU-UNITS components; remove redirects here to `/dashboard/subjects`.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | header and section skeletons |
| Not found | 404 from BE-ACA-16 (also for another student's id) | title "We could not find that {noun}"; body "It may have been removed."; action "Back to {nouns}" |
| Error | loader fails | `PageError` defaults |
| No evidence (overall) | `percent` null | "No marks yet" in the ring position; helper "Practise or log a mark to see how you are doing." |
| No topics yet | topics empty | "Topics appear here as you practise and add assessments for this {noun}." action "Practise this" |
| No evidence (topic) | topic `percent` null | "No marks yet" and no bar |
| Mastery not available | Phase 4 to 6 (mastery loader returns null) | topic rows show names only; chart section hidden |
| No chart data | fewer than 2 points | "Your progress chart appears after two practice tests or marks." |
| No assessments | empty | "No upcoming assessments for this {noun}." action "Add assessment" |
| Populated | data present | as laid out |

## Stage variants

| Item | High school | University |
|---|---|---|
| Level chip | "Grade 11, NSC" or "Grade 12, IEB" | "Second year, One semester" |
| Resources | Past papers card | hidden until course resources exist |
| Overflow menu | Remove | Edit, Remove |
| Back link | "Subjects" | "Courses" |
| Assessment types | SBA task, test, exam | assignment, test, exam |

## Interactions and edge cases

- Topics are emergent: a new unit has none until practice or assessments create them. Never invent a starter topic list.
- "Practise this" links to `/dashboard/practice?unit={id}&source=unit`; topic rows add `&topic={topicId}`. The practice hub opens the generate sheet prefilled (PG-STU-PRACTICE-13). Practice is always built for one of the student's assessments (43f9faa rule, PG-STU-PRACTICE-21), so the sheet preselects this unit's next upcoming assessment; with no assessment for the unit, "Practise this" becomes "Add an assessment to practise" linking to `/dashboard/assessments/new?unit={id}`.
- If the student has an active attempt, "Practise this" goes to the active test instead, with the label "Resume test".
- Ids are Guid v7; an invalid id string triggers `notFound()` before any API call.
- Removing the unit from the overflow menu redirects to `/dashboard/subjects` with toast "{name} removed".
- Chart dates show in SAST, axis labels "12 Oct", tooltips with the exact date and value.

## Copy

- Practise button: "Practise this" / row "Practise"
- Evidence line: "From {n} questions" / "From {n} questions and {m} marks"
- Chart summary examples: "Up from 52% to 61% since 1 September." / "Down from 70% to 64% since 1 September." / "Steady at about 58% since 1 September."
- Past papers card: "{n} past papers for {subject}, Grade {grade}" action "Browse past papers"

## Acceptance criteria

- Given a unit with no practice and no marks, when the page opens, then the header shows "No marks yet" and the topics section shows the empty copy, with no 0% anywhere.
- Given topics with percents 80, null and 45, when the list renders, then the order is 45, 80, null.
- Given another student's unit id, when the page is requested, then the not-found state renders and no unit data is in the HTML.
- Given a topic row, when "Practise" is tapped, then `/dashboard/practice` opens with the generate sheet showing that unit and topic selected.
- Given a university course, when the page renders, then no past papers block and no NSC wording appear.
- Given Phase 4 with the mastery flag off, when the page renders, then topic names show without bars and the chart section is absent.

## Production readiness

- Security: ownership enforced by BE-ACA-16 and BE-ACA-19 (404 for non-owners, never 403, to avoid confirming that an id exists). The page never forwards the raw `id` to any other origin. No personal data in the URL beyond the opaque unit id.
- Performance: four reads run in parallel with `Promise.all` inside separate `Suspense` boundaries so the header (LCP) streams first. Only the chart is client JS; it is dynamically imported below the fold. Route JS under 90 KB gzip.
- Resilience: each section has its own boundary; a mastery failure shows "Progress is not available right now." while topics and assessments still render. Loaders time out at 4 s.
- Observability: analytics `unit_viewed { kind }`, `unit_practise_clicked { scope: unit or topic }`, `unit_past_papers_clicked`. Sentry tag `page:unit-detail`, section tags. Trace propagation to BE-ACA and BE-PRG routes.
- Accessibility (WCAG 2.2 AA): chart has a text summary and a visually hidden data table; bars have `aria-valuenow` or text equivalents; "Show all topics" is a native disclosure.
- Privacy and POPIA: academic data only; analytics carry the unit kind, never its name.
- Rollout: Phase 4 ships header, topics (names), assessments and resources behind `academics.units`; mastery and chart behind `progress.mastery` in Phase 7. Rollback: flags off.
- Monitoring: Grafana panel for BE-ACA-16 404 rate (a spike suggests broken links or enumeration attempts) and BE-PRG-11 p95; Sentry alert on section boundary errors above 1% of views.

## Build tasks

- [ ] **PG-STU-UNIT-01** Header (name, level chip, overall standing ring or "No marks yet", actions)
- [ ] **PG-STU-UNIT-02** Topic breakdown with mastery per topic (bar, evidence count, "No marks yet")
- [ ] **PG-STU-UNIT-03** Assessments block for this unit (next 5, links to filtered list and new form)
- [ ] **PG-STU-UNIT-04** Resources block: past papers card for high school; hidden for university until course resources exist
- [ ] **PG-STU-UNIT-05** "Practise this" action (preselects the unit; switches to "Resume test" during an active attempt)
- [ ] **PG-STU-UNIT-06** Progress over time chart with text summary
- [ ] **PG-STU-UNIT-07** Not-found and forbidden states (non-owner gets not-found)
- [ ] **PG-STU-UNIT-08** Loaders `get-unit.ts` and `get-unit-topics.ts` with tags and `notFound()` on 404
- [ ] **PG-STU-UNIT-09** Mastery loader `get-unit-mastery.ts` returning null when `progress.mastery` is off
- [ ] **PG-STU-UNIT-10** Topic sort helper `sort-topics.ts` (weakest first, null last) with unit tests
- [ ] **PG-STU-UNIT-11** Per-topic "Practise" link with unit and topic query parameters
- [ ] **PG-STU-UNIT-12** Trend summary helper `summarise-trend.ts` and the hidden data table for the chart
- [ ] **PG-STU-UNIT-13** Page composition: parallel loaders, `Suspense` per section, two-column desktop grid
- [ ] **PG-STU-UNIT-14** Section-level error boundaries with contained copy
- [ ] **PG-STU-UNIT-15** Overflow menu wiring (edit course sheet, remove dialog, redirect after remove)
- [ ] **PG-STU-UNIT-16** Analytics events listed above
- [ ] **PG-STU-UNIT-17** Flags `academics.units` and `progress.mastery` checks, rollback note
- [ ] **PG-STU-UNIT-18** Grafana panel for 404 rate and mastery latency; Sentry section alert
- [ ] **PG-STU-UNIT-19** Dynamic import of the chart; route JS budget 90 KB gzip
- [ ] **PG-STU-UNIT-20** Stat tiles under the header: current average, predicted next term ("Weighted projection", server value), upcoming assessments this term, mastery across topics; each null shows "No marks yet" (43f9faa showed a dash for missing values and defaulted mastery to 0%, which this rebuild must not repeat)
- [ ] **PG-STU-UNIT-21** Practice tests block: count plus the 5 latest tests for this unit with score or "Not started"; empty copy "No practice tests yet. Generate one from your weakest topics." (from 43f9faa)
- [ ] **PG-STU-UNIT-22** Teacher or lecturer name in the header when set (PG-STU-UNITS-25)
- [ ] **PG-STU-UNIT-23** "Practise this" falls back to "Add an assessment to practise" when the unit has no assessment, matching the practice-for-an-assessment rule

## Quality tasks

- [ ] **PG-STU-UNIT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`), `not-found.tsx`
- [ ] **PG-STU-UNIT-Q02** Server loaders in `src/features/academics/server/` and `src/features/progress/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-UNIT-Q03** Client mutations (edit, remove) through `/api/bff` with generated TanStack hooks; pending states
- [ ] **PG-STU-UNIT-Q04** Empty states with one clear next action (no topics, no assessments)
- [ ] **PG-STU-UNIT-Q05** Error state copy: page and section level
- [ ] **PG-STU-UNIT-Q06** Forbidden handled as not-found; no upgrade state (free page)
- [ ] **PG-STU-UNIT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-UNIT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-STU-UNIT-Q09** Layout at 1440px (8 and 4 column split)
- [ ] **PG-STU-UNIT-Q10** Light and dark both correct (OS-driven), chart colours from tokens
- [ ] **PG-STU-UNIT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-UNIT-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-UNIT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-UNIT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, no-evidence, not-found and error states
- [ ] **PG-STU-UNIT-Q15** `generateMetadata` title is the unit name (falls back to "Subject" or "Course" on error); nav "Subjects" active

## Tests

Unit (Vitest):
- `sort-topics.test.ts`: "weakest first", "null last", "ties sorted by name"
- `summarise-trend.test.ts`: "up", "down", "steady within 2 points", "fewer than 2 points returns null"
- `unit-header.test.tsx`: "null percent shows No marks yet", "level chip per stage"
- `topic-mastery-row.test.tsx`: "practise link carries unit and topic"

Playwright (`web/e2e/student/unit-detail.spec.ts`):
- "new unit shows No marks yet and no topics copy"
- "topic practise opens prefilled generate sheet"
- "another student's unit id shows not found"
- "university course hides past papers"
- "mastery failure keeps topics and assessments visible"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- Course resources for university courses have no backend task. Either add one (for example `academics.unit_resources` with links the student saves) or drop the block for v1.
- BE-PRG-11 must return `series` per unit for the chart; confirm the shape and the time window (this file assumes the last 90 days).
- Should "Practise this" during an active attempt resume that attempt even if it belongs to another unit? This file says yes, because only one attempt can be live.
- BE-ACA-16 needs `currentAveragePercent`, `predictedNextTermPercent` and `upcomingThisTerm` for PG-STU-UNIT-20; in 43f9faa these came from the mastery predictions endpoint. "This term" needs the term dates source raised in PG-STU-CAL.
