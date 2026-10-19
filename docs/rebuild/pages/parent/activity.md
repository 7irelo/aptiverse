# Live activity

| | |
|---|---|
| ID | `PG-PAR-ACTIVITY` |
| Route | `/parent/activity` (`?child={studentId}` filters) |
| Phase | 8 |
| Roles | parent |
| Stages | high school, university (per item) |
| Entitlement | free (decision 13: parent insights are free, as at 43f9faa). No `parent-insights` gate in v1 |
| Depends on | BE-FAM-06, BE-FAM-10, BE-FAM-11 (activity sharing flag), FE-24, FE-25, SHL-04, SHL-05, PG-PAR-WELL-05 (`ChildSelector`), PG-PAR-CELEB-05 (grouping helper pattern) |
| Old app reference | new (DESIGN_BRIEF "Live activity"; neither f223ca7 nor 43f9faa has a parent activity page) |
| Status | Not started (0 of 33 tasks) |

## Purpose

A near-real-time feed of a child's meaningful activity (practice completed, assessment submitted or graded, goal progress, wellbeing check-in logged without its value, achievement earned) so a parent can see engagement, respecting the student's activity sharing setting. It shows that something happened, never the content: no answers, no marks breakdowns beyond what academics sharing allows, no check-in values, no chat text, no exact times beyond the hour.

## User stories

- As a parent, I can see that my child practised Maths this evening without seeing their answers.
- As a parent, the feed updates while I have it open, without me refreshing.
- As a parent of two, I can filter to one child.
- As a parent whose child has not shared activity, I see that plainly.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Activity", description "What your children have been working on recently."
2. `ChildSelector` with "All children" (hidden with one child).
3. "Updated {relative time}" line with a small refresh button (44px, icon `refresh-cw` plus visible text "Refresh").
4. "New activity" pill (appears at the top when polling finds new items while the user has scrolled; tapping scrolls to top and reveals them).
5. Feed grouped by day ("Today", "Yesterday", "Mon 13 Oct"): Lucide icon by kind, sentence, unit name, time rounded to the hour ("around 7pm").
6. "Show older" button.

### Desktop (1440px)

- Feed centred at max width 720px; selector as tabs; updated line and refresh button right-aligned in the header row.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/parent/activity/page.tsx` | server | `requireRole("parent")`, entitlement check, first page server-rendered as initial data |
| Loading | `web/src/app/(app)/parent/activity/loading.tsx` | server | list skeleton |
| Error | `web/src/app/(app)/parent/activity/error.tsx` | client | `PageState` retry; Sentry tag `PG-PAR-ACTIVITY` |
| ActivityFeed | `web/src/features/family/components/activity-feed.tsx` | client | TanStack infinite query seeded with server data; polling (see Interactions) |
| ActivityItem | `web/src/features/family/components/activity-item.tsx` | server-compatible | icon, sentence, unit, hour |
| NewActivityPill | `web/src/features/family/components/new-activity-pill.tsx` | client | shows count of unseen items |
| Kind map | `web/src/features/family/lib/activity-kinds.ts` | shared | kind to icon and stage-aware sentence |
| Hour rounding | `web/src/features/family/lib/round-to-hour.ts` | shared | "around 7pm", JHB time |
| Loader | `web/src/features/family/server/get-family-activity.ts` | server | first page per child, merged |
| Query keys | `web/src/features/family/lib/query-keys.ts` | shared | `family.activity(childId or "all")` using the `queryKeys` factory (FE-08) |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/family/children` (BE-FAM-06) | GET | `studentId`, `displayName`, `stage`, `sharing.activity`, `sharing.academics` | none shared |
| `/family/children/{id}/activity?cursor=&since=&limit=30` (BE-FAM-10) | GET | `items[]` (`id`, `kind`, `occurredAtHour` (timestamp truncated to the hour by the API), `params` (`unitName`, `count`, `goalTitle`, `achievementName`, `assessmentType`)), `nextCursor`, `latestId` | none shared; client polling via BFF |

Kinds (closed set): `practice_completed`, `assessment_submitted`, `assessment_graded` (no mark unless `sharing.academics`, then the API adds `markPct`), `goal_progress`, `checkin_logged` (never the value), `achievement_earned`, `study_session_logged`.

### Mutations

None.

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | first render | "Loading activity" | skeleton |
| No children | no links | Title "No children linked yet". Body "Activity appears here once your child accepts your invite and chooses to share it." | "Invite a child" |
| Not shared | `sharing.activity` false for selected child | Title "{firstName} has not shared activity". Body "Students choose what their parents see." | none |
| Empty | no items in the last 30 days | Title "No activity in the last 30 days". Body "When {firstName} practises or submits work, it shows up here." | none |
| Error | first load fails | Title "We could not load activity". Body "Check your connection and try again." | "Try again" |
| Polling error | background refresh fails | Updated line changes to "Could not refresh. Showing activity from {time}." | "Refresh" |
| Offline | `navigator.onLine` false | "You are offline. Activity will refresh when you reconnect." | none |
| Forbidden | non-parent | proxy redirect | |

## Stage variants

- `assessment_submitted`: high school "{firstName} submitted an SBA task in {unitName}." when `assessmentType` is SBA, otherwise "submitted {assessmentType} in {unitName}"; university "{firstName} submitted an assignment in {unitName}."
- `assessment_graded` with mark (academics shared): "{firstName} got {markPct}% for a test in {unitName}." Stage-neutral otherwise.
- Unit wording ("subject" vs "course") only appears inside `unitName` context; sentences avoid both words where possible.

## Interactions and edge cases

- Refresh strategy (resolves the "poll or SSE" question for v1): poll with TanStack `refetchInterval` 60 s while the tab is visible (`refetchIntervalInBackground: false`), using `since={latestId}` so each poll is cheap; stop polling after 30 minutes of no interaction and show "Paused. Refresh to see new activity."; resume on focus. SSE through the BFF (FE-26) is deferred to Phase 12 unless polling load is a problem. Recorded as a decision in the PR.
- New items while scrolled down: held behind the "New activity" pill so the list never jumps (no CLS, WCAG 2.2.2 friendly).
- Exact times are never shown: the API truncates to the hour and the UI says "around 7pm". This avoids minute-level monitoring.
- Student turns off activity sharing: next poll returns 403 for that child; the feed removes their items and shows the not-shared line. Polling for that child stops.
- Unlinked during a session: next poll returns 404; the child disappears from the selector and feed.
- Late-night activity: no judgement copy ("up late") ever.
- Items older than 30 days are not returned (data minimisation).
- Multiple tabs open: each polls independently; acceptable at 60 s. Rate limit group `default` keyed by user.

## Copy

- h1 "Activity"; description "What your children have been working on recently."
- Updated line: "Updated just now", "Updated {n} minutes ago". Paused: "Paused. Refresh to see new activity."
- Pill: "{n} new" (screen reader: "{n} new activity items. Activate to show.")
- Sentences:
  - practice_completed: "{firstName} completed a practice test in {unitName}."
  - goal_progress: "{firstName} made progress on \"{goalTitle}\"."
  - checkin_logged: "{firstName} did a wellbeing check-in."
  - achievement_earned: "{firstName} earned \"{achievementName}\"."
  - study_session_logged: "{firstName} logged a study session for {unitName}."
- Time: "around {hour}" (for example "around 7pm").

## Acceptance criteria

- AC-01 Given an entitled parent and a child sharing activity, when the page opens, then today's items show grouped by day with hour-rounded times.
- AC-02 Given the page is open and visible, when a new activity is created for the child, then within 60 s the item appears (at the top, or behind the pill if scrolled).
- AC-03 Given the tab is hidden, when 5 minutes pass, then no polling requests are made.
- AC-04 Given a `checkin_logged` item, when rendered, then no mood or stress value is in the DOM or payload.
- AC-05 Given academics not shared, when an `assessment_graded` item renders, then no mark appears in DOM or payload.
- AC-06 Given the student turns off activity sharing, when the next poll runs, then that child's items disappear and the not-shared line shows.
- AC-08 Given the parent nav, when signed in as a parent, then "Activity" appears in the sidebar and in the mobile "More" sheet, and is active on `/parent/activity`.
- AC-09 Given 30 minutes without interaction, when the timer elapses, then polling stops and the paused copy shows.

## Production readiness

### Security
- [ ] Polling goes through `/api/bff` with the session cookie; the API re-checks link, consent and sharing on every poll (BE-FAM-13). PG-PAR-ACTIVITY-Q16.
- [ ] Cross-family `?child=` ignored; E2E asserts no foreign data on initial render or poll. PG-PAR-ACTIVITY-Q16.

### Privacy and POPIA
- [ ] Hour truncation done by the API (`occurredAtHour`), not the UI, so precise times never leave the server. PG-PAR-ACTIVITY-Q17.
- [ ] Closed kind enum; unknown kinds dropped. 30-day window enforced server-side. PG-PAR-ACTIVITY-Q17.

### Performance
- [ ] First page server-rendered as initial data; polling payloads use `since` and are under 2 KB when empty; route JS under 150 KB gzip; LCP under 2.5 s mobile. PG-PAR-ACTIVITY-Q18.
- [ ] Polling load estimate documented: 1 request per minute per open tab; alert threshold set accordingly. PG-PAR-ACTIVITY-Q18.

### Resilience
- [ ] Background poll failures never replace the feed with an error; they update the "Updated" line and back off (60 s, 120 s, 240 s, max 5 minutes). PG-PAR-ACTIVITY-08.
- [ ] Offline detection pauses polling and resumes on `online`. PG-PAR-ACTIVITY-08.

### Observability
- [ ] Analytics: `parent_activity_viewed` (props `filter`), `parent_activity_new_pill_clicked`, `parent_activity_manual_refresh`, `parent_activity_paused`. No ids. PG-PAR-ACTIVITY-Q19.
- [ ] Sentry boundary tagged `PG-PAR-ACTIVITY`; poll failures counted as a metric, not each sent as an error event. PG-PAR-ACTIVITY-Q19.

### Accessibility
- [ ] WCAG 2.2 AA: no auto-inserted content shifting focus (pill pattern); polite live region announces new item count only when the user is at the top; pause control available (2.2.2). PG-PAR-ACTIVITY-Q20.

### Rollout
- [ ] Behind `flags.parentTrack` and its own `flags.parentActivity` so polling load can be switched off independently. Rollback: flag off hides the nav item and route. PG-PAR-ACTIVITY-Q21.

### Monitoring and alerts
- [ ] Alert on BE-FAM-10 p95 above 500 ms or 5xx above 1% in 15 minutes; request-rate tile for the activity endpoint to watch polling cost. PG-PAR-ACTIVITY-Q22.

## Build tasks

- [ ] **PG-PAR-ACTIVITY-01** Feed of meaningful events across children (`ActivityFeed` with server-seeded first page, merged by time)
- [ ] **PG-PAR-ACTIVITY-02** Child filter (reuse `ChildSelector` with "All children")
- [ ] **PG-PAR-ACTIVITY-03** Refresh strategy (poll or SSE, decide in spec): decided as visible-tab polling every 60 s with `since`; implement `refetchInterval`, visibility pause and 30-minute idle pause
- [ ] **PG-PAR-ACTIVITY-04** Add Activity to the parent nav (`nav-config.ts` has no entry yet): item `activity`, href `/parent/activity`, icon key `activity` (add to `nav-icons.ts`), not in `primary`
- [ ] **PG-PAR-ACTIVITY-05** `activity-kinds.ts`: kind to Lucide icon and stage-aware sentence; unknown kinds dropped
- [ ] **PG-PAR-ACTIVITY-06** `ActivityItem` with `round-to-hour.ts` ("around 7pm", JHB)
- [ ] **PG-PAR-ACTIVITY-07** `NewActivityPill` holding new items while scrolled, with live region
- [ ] **PG-PAR-ACTIVITY-08** Poll failure handling: backoff, "Updated" line states, offline pause and resume
- [ ] **PG-PAR-ACTIVITY-09** Handle per-child 403 and 404 during polling (remove items, stop polling that child)
- [ ] **PG-PAR-ACTIVITY-10** Not-shared, empty and no-children states (no upgrade state, decision 13)
- [ ] **PG-PAR-ACTIVITY-11** "Show older" paging by cursor

## Quality tasks

- [ ] **PG-PAR-ACTIVITY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-PAR-ACTIVITY-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-PAR-ACTIVITY-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (polling query through BFF)
- [ ] **PG-PAR-ACTIVITY-Q04** Empty state with one clear next action
- [ ] **PG-PAR-ACTIVITY-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-PAR-ACTIVITY-Q06** Forbidden state (no upgrade state: the page is free, decision 13)
- [ ] **PG-PAR-ACTIVITY-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-PAR-ACTIVITY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-PAR-ACTIVITY-Q09** Layout at 1440px
- [ ] **PG-PAR-ACTIVITY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-PAR-ACTIVITY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-PAR-ACTIVITY-Q12** axe: zero violations in light and dark
- [ ] **PG-PAR-ACTIVITY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-PAR-ACTIVITY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-PAR-ACTIVITY-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-PAR-ACTIVITY-Q16** Security: BFF polling with server re-checks; cross-family E2E on initial render and poll
- [ ] **PG-PAR-ACTIVITY-Q17** Privacy: API-side hour truncation, closed kind enum, 30-day window, no check-in values or unshared marks
- [ ] **PG-PAR-ACTIVITY-Q18** Performance: server-seeded first page, small poll payloads, budgets measured, polling load estimate written down
- [ ] **PG-PAR-ACTIVITY-Q19** Observability: four analytics events, Sentry tags, poll failures as a metric
- [ ] **PG-PAR-ACTIVITY-Q20** WCAG 2.2 AA: no layout jumps, pause control, considerate live region
- [ ] **PG-PAR-ACTIVITY-Q21** Rollout: `flags.parentTrack` plus `flags.parentActivity` kill switch
- [ ] **PG-PAR-ACTIVITY-Q22** Monitoring: BE-FAM-10 latency and error alerts, request-rate tile

## Tests

### Unit (Vitest)
- `features/family/lib/activity-kinds.test.ts`: all kinds covered, stage sentences, unknown dropped.
- `features/family/lib/round-to-hour.test.ts`: JHB conversion, midnight and noon wording.
- `features/family/components/activity-feed.test.tsx`: polling pauses when hidden (fake timers and `visibilitychange`), idle pause at 30 minutes, backoff on failure.
- `features/family/components/new-activity-pill.test.tsx`.

### Playwright (`web/tests/e2e/parent/activity.spec.ts`)
- `activity feed shows hour-rounded items`
- `new activity appears within a minute while visible` (mocked API clock)
- `hidden tab does not poll`
- `check-in items carry no values`
- `revoked activity sharing removes child items on next poll`
- `parent on the free plan sees activity`
- `activity nav entry active on route`
- `cross-family child id is ignored` (security)
- axe light and dark at 360 and 1440

## Open questions

- Decided (13): Activity is free, like the rest of the parent insights; no upgrade state and no gating switch in v1.
- Does BE-FAM-11 add a separate `activity` sharing flag, or is activity covered by the academics flag? This file assumes a separate flag.
- Polling now, SSE later: confirm polling cost is acceptable at expected parent numbers.
- Page title "Live activity" in the backlog index vs "Activity" in the UI: the UI drops "Live" because updates are near real time (60 s), not instant.
