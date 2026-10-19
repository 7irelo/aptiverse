# Journey

| | |
|---|---|
| ID | `PG-STU-JOURNEY` |
| Route | `/dashboard/progress/journey` (optional `?type=<eventType>` filter, `?cursor=<opaque>` for older items) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-PRG-14, BE-PRG-06, BE-PRG-08, BE-PRA-17, BE-ACA-37, BE-CAR-03, UI-05, UI-11, UI-21, UI-22, UI-33, PG-STU-ANALYTICS-08 (Progress layout and tabs), PG-ADM-DASH-13 (`web/src/lib/format/datetime.ts`) |
| Old app reference | `web/src/app/(app)/dashboard/journey/page.tsx` at 43f9faa (assessment-centred: graded marks in order, the student's own predicted mark against the real one, upcoming due dates, reached goals as landmarks, goals still in progress) |
| Status | Not started (backend not started; no route, loader or components exist) |

`PG-STU-JOURNEY-03` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

A plain timeline of the real things the student has done on Aptiverse: practice tests finished, assessment marks logged, goals completed, achievements earned, units added and career targets set. Every item links to its source. Nothing is invented and nothing is inferred. Wellbeing check-ins and diary entries are never part of the journey, so this page is safe to show on a shared screen.

## User stories

- As a student, I want to scroll back through what I have done this term, so I can see the work I have put in.
- As a student, I want to filter to one kind of event (for example only marks), so I can find something quickly.
- As a student, I want each item to open the thing it refers to, so I can review it.
- As a new student, I want to be told how the journey fills up, instead of a blank page.

## Layout

### Mobile (360px)

Single column, `px-4`:

1. Progress header and tabs (from the layout), "Journey" active. h1 "Journey", description "Everything you've done here, newest first."
2. `JourneyFilters`: horizontally scrollable chip row (`ToggleGroup` style, single select): All, Practice, Marks, Goals, Achievements, Units, Careers. Each chip `min-h-11`. Selected chip has `aria-pressed="true"`.
3. `JourneyTimeline`: grouped by month, each group with an h2 "October 2026" and a vertical list. Item: Lucide icon in a 32px circle (icon per type), one-line title, secondary line (unit name and detail), time on the right ("Tue 14:05"). Whole item is a link.
4. "Show older" button (full width, 44px) at the end when `nextCursor` exists.
5. End marker when no more items: "That's everything since you joined on {date}."

### Desktop (1440px)

Inside `PageShell` at a reading width (max 768px, centred):

- Filters as a wrapped chip row, not scrolling.
- Timeline with a thin vertical rule on the left joining the icons; the date column moves to the left of the rule ("14 Oct").
- No right rail; the page stays a single readable column.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/progress/journey/page.tsx` | server | Reads `searchParams.type`, `searchParams.cursor`; validates `type` against the enum, invalid falls back to All |
| Loading | `web/src/app/(app)/dashboard/progress/journey/loading.tsx` | server | 6 row skeletons |
| Error | `web/src/app/(app)/dashboard/progress/journey/error.tsx` | client | `PageError` with retry |
| JourneyFilters | `web/src/features/progress/components/journey-filters.tsx` | server | Chips are links (`?type=`), so the filter works without JS and is shareable to the student's own devices |
| JourneyTimeline | `web/src/features/progress/components/journey-timeline.tsx` | server | Groups with `groupByMonth` |
| JourneyItem | `web/src/features/progress/components/journey-item.tsx` | server | Icon and copy from `journey-events.ts` |
| ShowOlderButton | `web/src/features/progress/components/show-older-button.tsx` | client | Uses generated TanStack infinite query through `/api/bff` to append pages without a full navigation; falls back to a `?cursor=` link without JS |
| Event registry | `web/src/features/progress/lib/journey-events.ts` | shared | Map of event type to Lucide icon, title template and href builder; unknown types are dropped and reported to Sentry |
| Grouping | `web/src/features/progress/lib/group-by-month.ts` | shared | Groups in `Africa/Johannesburg` time; unit tested |
| Loader | `web/src/features/progress/server/get-journey.ts` | server | First page only, `"use cache"`, tag `progress:journey:<userId>` |
| Date format | `web/src/lib/format/datetime.ts` | shared | From PG-ADM-DASH-13 |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/progress/journey?type=&cursor=&limit=30` (BE-PRG-14) | GET | `items[]`: `id`, `type` (`practice_completed`, `assessment_marked`, `goal_completed`, `goal_created`, `achievement_earned`, `unit_added`, `target_added`), `occurredAt`, `unitId` (or null), `unitName` (or null), `subjectRef` (`{ kind, id }` of the linked record), `detail` (type-specific: `scorePercent`, `markPercent`, `goalTitle`, `achievementName`, `institution`); `nextCursor` (or null); `joinedAt` | `progress:journey:<userId>` |

Event to link mapping (in `journey-events.ts`):

| Type | Icon | Title | Link |
|---|---|---|---|
| `practice_completed` | `ClipboardCheck` | "Finished a practice test: {scorePercent}%" | `/dashboard/practice/{id}` (results view) |
| `assessment_marked` | `FileCheck` | "Logged a mark: {markPercent}%" | `/dashboard/assessments/{id}` |
| `goal_created` | `Flag` | "Set a goal: {goalTitle}" | `/dashboard/goals/{id}` |
| `goal_completed` | `FlagTriangleRight` | "Completed a goal: {goalTitle}" | `/dashboard/goals/{id}` |
| `achievement_earned` | `Award` | "Earned: {achievementName}" | `/dashboard/progress/achievements#{id}` |
| `unit_added` | `BookOpen` | "Added {unitName}" | `/dashboard/subjects/{id}` |
| `target_added` | `Compass` | "Added a target: {institution}" | `/dashboard/careers?target={id}` |

Rules:

- The journey is read-only and built from integration events the Progress module already consumes; the API never returns wellbeing or diary events (enforced in BE-PRG-14 and tested).
- A linked record that was deleted still shows in the journey without a link, with the secondary line "No longer available".
- Cache life `cacheLife("minutes")`; later pages are not cached on the server (client query cache only).

Mutations: none.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Row skeletons; "Loading your journey" |
| Empty (no events at all) | `items` empty, no filter | `EmptyState`, `Route` icon. Title "Your journey starts here". Body "Finish a practice test or log a mark and it appears here." Button "Start practising" to `/dashboard/practice` |
| Empty (filtered) | `items` empty with a filter | "Nothing here yet for {filter label}." Link "Show everything" to `?type=` cleared |
| Loading older | "Show older" pressed | Button shows spinner and "Loading", `aria-busy="true"`, disabled |
| Older failed | Next page failed | Inline under the list: "We couldn't load older items." Button "Try again". Loaded items stay |
| Error | First page failed | "We couldn't load your journey. Check your connection and try again." Button "Try again" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |
| Populated | Items present | As laid out; end marker when `nextCursor` is null |

## Stage variants

| Element | High school | University |
|---|---|---|
| `unit_added` title | "Added {subject}" | "Added {course}" |
| Filter "Units" label | "Subjects" | "Courses" |
| `target_added` detail | Institution and programme | Institution and programme, plus stage ("Honours") for progression targets |
| Forbidden words | course, GPA | SBA, APS, matric, Grade |

## Interactions and edge cases

- Month grouping uses the student's time zone (`Africa/Johannesburg` default); an event at 23:30 UTC on 31 October shows in November.
- Items within the current week show weekday and time ("Tue 14:05"); older items show date ("14 Oct").
- Duplicate events (outbox redelivery) are deduplicated by `id` when appending pages client-side.
- An unknown `type` from a newer API is skipped, and one Sentry warning per type per session is sent.
- Filter change resets the cursor.
- Very active students: limit 30 per page; "Show older" appends, the page never auto-loads on scroll (no infinite scroll trap for keyboard users).
- Focus after "Show older": moves to the first newly loaded item.

## Copy

- h1: "Journey"
- Description: "Everything you've done here, newest first."
- Filter labels: "All", "Practice", "Marks", "Goals", "Achievements", "Subjects" or "Courses", "Careers"
- End marker: "That's everything since you joined on {date}."
- Deleted source: "No longer available"

## Acceptance criteria

1. Given a student with 45 events, when they open Journey, then 30 items render grouped by month newest first and a "Show older" button is visible.
2. Given they press "Show older", when the next page loads, then 15 more items append, focus moves to the first new item and the end marker shows.
3. Given `?type=assessment_marked`, when the page loads, then only mark events render and the "Marks" chip has `aria-pressed="true"`.
4. Given an invalid `?type=foo`, when the page loads, then All is used and no error is shown.
5. Given the student has wellbeing check-ins and diary entries, when the journey loads, then none of them appear (API contract test and E2E assertion).
6. Given an assessment that has since been deleted, when its event renders, then it has no link and says "No longer available".
7. Given no events, when the page loads, then the "Your journey starts here" empty state renders with one button.
8. Given the older-page request fails, when the student presses "Show older", then loaded items remain and an inline retry appears.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-PRG-14 scopes by the caller only; cursor is opaque and signed (or encodes only time and id), so it cannot be edited to read another user's stream | PG-STU-JOURNEY-Q16 |
| Privacy and POPIA | Wellbeing and diary events are excluded at the API and by an allowlist of types in `journey-events.ts`; a test fails if a wellbeing type is ever added to the registry | PG-STU-JOURNEY-Q17 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; no chart library on this route; first page server-rendered | PG-STU-JOURNEY-Q18 |
| Resilience | "Show older" disabled while pending (double-click safe); appended pages deduped by id; older-page failure is non-destructive | PG-STU-JOURNEY-Q19 |
| Observability | Sentry route tag; warning on unknown event type; events `journey_filter_changed` (props: `type`) and `journey_show_older` (props: `page`); trace propagation | PG-STU-JOURNEY-Q20 |
| Accessibility | WCAG 2.2 AA; timeline is a list of links with month headings; icons `aria-hidden`; chip row is a labelled group | PG-STU-JOURNEY-Q21 |
| Rollout | Flag `progress-pages`; rollback by flag | PG-STU-JOURNEY-Q22 |
| Monitoring | Grafana "BE-PRG-14 p95 and 5xx"; alert at 5xx over 2% for 10 minutes; Sentry alert on the unknown event type warning exceeding 50 per hour (contract drift) | PG-STU-JOURNEY-Q23 |

## Build tasks

- [ ] **PG-STU-JOURNEY-01** Timeline of real events: `JourneyTimeline` and `JourneyItem` with month groups and links
- [ ] **PG-STU-JOURNEY-02** Filter by type: `JourneyFilters` link chips with `?type=`
- [ ] **PG-STU-JOURNEY-04** Loader `get-journey.ts` (first page), zod-validated, cached with user tag
- [ ] **PG-STU-JOURNEY-05** `journey-events.ts` registry: icon, title template and href per type, unknown types dropped
- [ ] **PG-STU-JOURNEY-06** `group-by-month.ts` in the student's time zone, with unit tests
- [ ] **PG-STU-JOURNEY-07** `ShowOlderButton` with infinite query through the BFF, dedupe by id, focus management, no-JS cursor fallback
- [ ] **PG-STU-JOURNEY-08** Empty, filtered-empty, older-failed states and the end marker
- [ ] **PG-STU-JOURNEY-09** Deleted-source rendering ("No longer available", no link)
- [ ] **PG-STU-JOURNEY-10** Stage variants for unit labels and target detail
- [ ] **PG-STU-JOURNEY-11** Redirect `/dashboard/journey` to `/dashboard/progress/journey` (308)
- [ ] **PG-STU-JOURNEY-12** "Coming up" section above the timeline: next 5 assessments with honest day countdowns ("Due today", "Due in 3 days", "Due 14 Nov" past 14 days, "Was due 2 Nov" in terracotta with the words) and active goals still in progress, linking to each
- [ ] **PG-STU-JOURNEY-13** Own-call comparison on `assessment_marked` items when the student logged a predicted mark (BE-ACA-30): "You expected 60%, you got 68%"; plus a summary line "Your own calls were within 5 points on 4 of 6 marks" only when at least 3 pairs exist
- [ ] **PG-STU-JOURNEY-14** Section-level degradation: if goals or mastery data fail, the timeline of marks still renders (old app rule: assessments are the spine, the rest enriches)

## Quality tasks

- [ ] **PG-STU-JOURNEY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-JOURNEY-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-JOURNEY-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-JOURNEY-Q04** Empty state with one clear next action
- [ ] **PG-STU-JOURNEY-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-JOURNEY-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-JOURNEY-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-JOURNEY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-JOURNEY-Q09** Layout at 1440px
- [ ] **PG-STU-JOURNEY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-JOURNEY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-JOURNEY-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-JOURNEY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-JOURNEY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-JOURNEY-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-JOURNEY-Q16** Integration test with BE-PRG-14: tampered cursor returns 400 and never another user's items
- [ ] **PG-STU-JOURNEY-Q17** Registry allowlist test that rejects wellbeing or diary types; E2E asserts no check-in appears
- [ ] **PG-STU-JOURNEY-Q18** Lighthouse CI mobile budget for the route
- [ ] **PG-STU-JOURNEY-Q19** Double-press and dedupe test on "Show older"
- [ ] **PG-STU-JOURNEY-Q20** Sentry tag, unknown-type warning and the two named events
- [ ] **PG-STU-JOURNEY-Q21** Screen reader pass on the timeline and filter group
- [ ] **PG-STU-JOURNEY-Q22** `progress-pages` flag check on this route
- [ ] **PG-STU-JOURNEY-Q23** Grafana panel and alerts for BE-PRG-14 and contract drift

## Tests

Unit (Vitest):

- `group-by-month.test.ts`: "23:30 UTC on 31 October groups into November in SAST", "groups newest month first".
- `journey-events.test.ts`: "every type has an icon, title and href", "unknown type returns null", "registry contains no wellbeing or diary types".
- `show-older-button.test.tsx`: "is disabled while loading", "dedupes items by id".

Playwright (`web/e2e/student/progress-journey.spec.ts`):

- "journey: populated timeline groups by month"
- "journey: show older appends and moves focus"
- "journey: filter to marks shows only marks"
- "journey: no events shows the empty state"
- "journey: older page failure keeps items and offers retry"
- "journey: check-ins and diary entries never appear"
- "journey: axe clean light and dark at 360 and 1440"

## Open questions

- Should `goal_created` and `target_added` appear, or only outcomes (completed, earned, marked)? This spec includes them because they are real actions.
- Does BE-PRG-14 need to store its own event rows, or read across Practice and Academics contracts at query time? A stored projection is assumed for paging.
- Does BE-ACA-30 keep a student-entered predicted mark per assessment? The old app had one and the journey compared it to the real mark; BE-PRG-14 needs `detail.predictedPercent` for PG-STU-JOURNEY-13.
