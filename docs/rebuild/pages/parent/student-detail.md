# Child detail

| | |
|---|---|
| ID | `PG-PAR-CHILD` |
| Route | `/parent/students/[id]` with tabs `?tab=academics` (default), `?tab=wellbeing`, `?tab=celebrations`, `?tab=goals` |
| Phase | 8 |
| Roles | parent |
| Stages | high school, university (one child at a time, vocabulary follows that child) |
| Entitlement | free for every tab (decision 13: parent insights are free, matching the 43f9faa baseline) |
| Depends on | BE-FAM-07, BE-FAM-08, BE-FAM-09, BE-FAM-13, BE-WEL-06, BE-WEL-09, BE-CAR-06 (APS, high school only), UI-06, UI-27, UI-33, FE-24, PG-PAR-DASH-07 (shared mapper), PG-PAR-WELL-07 (shared trend chart) |
| Old app reference | `43f9faa:web/src/app/(app)/parent/students/[studentUserId]/page.tsx` (name, level, upcoming count and up to 5 upcoming assessments; "Can't show this student" state), `43f9faa:api/Controllers/ParentLinksController.cs` (`GET students/{id}/overview`, accepted link required) |
| Status | Not started (0 of 42 tasks; 1 deferred by decision 6: PG-PAR-CHILD-15) |

## Purpose

One child, in depth, framed for a non-expert adult: where they stand in each subject or course, what is coming up, how their shared wellbeing trend looks, and what they have achieved. A clear, permanent boundary message explains that diary entries and private notes are never shown.

## User stories

- As a parent, I see each of my child's subjects or modules with a plain standing, the latest mark and a predicted result where the student has enough marks.
- As a parent, I see the next deadlines so I can offer support at the right time.
- As a parent, I see the wellbeing trend my child shared, with gentle guidance, and nothing more.
- As a parent, I see real celebrations for this child.
- As a parent, I always understand why some things are not visible to me.
- As a parent, if I follow an old link to a child I am no longer linked to, I get a clear, non-alarming message.

## Layout

### Mobile (360px)

1. Back link "Children" (44px) to `/parent/students`.
2. `PageHeader`: h1 "{displayName}", description is the `StageLine` ("Grade 12, NSC" or "3rd year, UCT"). Standing chip under it.
3. `Tabs` (scrollable row, 44px tabs): Academics, Wellbeing, Celebrations, Goals. Tab state in the URL (`?tab=`), so back and forward work and links are shareable inside the family.
4. Academics tab:
   - Summary row of 2 `StatCard`s: "Average" (or "No marks yet") and "Due in the next 14 days" count.
   - High school, Grades 10 to 12 only: an APS `StatCard` ("APS estimate {n}") with a help tooltip; hidden for Grades 8 and 9 and for university.
   - Units list: card per subject or course: name, standing chip, latest mark ("Latest: 72%" or "No marks yet"), predicted result ("Predicted: 70%" or "Not enough marks to predict"), mastery bar (ProgressBar with text) when available, trend icon with text ("Up since last month").
   - Upcoming deadlines list: up to 5 items: title, unit, type, due date ("Due Fri 24 Oct"), state chip (scheduled, submitted). No marks or feedback text from teachers.
5. Wellbeing tab: shared 8-week trend chart (mood and stress as two lines, weekly averages), text summary above the chart, guidance card, support resources link. Not-shared and upsell variants (see States).
6. Celebrations tab: list of the child's real celebrations, newest first, paged by 20.
7. Goals tab: goals the student has chosen to share (`share_goals`), each with verified progress, read from the overview's `goals` block (BE-FAM-07). Read-only; no pledge controls (decision 6).
8. Privacy boundary card (always visible at the bottom of every tab): Lucide `lock` icon, "Diary entries and check-in notes are private to {firstName}. They are encrypted and never shown to parents." Link "What parents can see" to the help article.

### Desktop (1440px)

- Header with name, stage line and chip on the left; back link above.
- Tabs as a horizontal bar under the header.
- Academics: 3 stat cards in a row; units as a `DataTable` (columns: subject or course, standing, latest, predicted, mastery, trend) with card fallback below `md`; deadlines in a right column (360px).
- Wellbeing: chart at 2/3 width, guidance card at 1/3.
- Privacy boundary card spans the full width below the tab content.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/parent/students/[id]/page.tsx` | server | `requireRole("parent")`; validates `id` is a Guid before calling the API; tab content in `<Suspense>` |
| Loading | `web/src/app/(app)/parent/students/[id]/loading.tsx` | server | header plus tab skeleton |
| Error | `web/src/app/(app)/parent/students/[id]/error.tsx` | client | `PageState` retry; Sentry tag `PG-PAR-CHILD` |
| Not found | `web/src/app/(app)/parent/students/[id]/not-found.tsx` | server | not-linked copy (also used for 403 from the API) |
| ChildDetailHeader | `web/src/features/family/components/child-detail-header.tsx` | server | name, `StageLine`, `StandingChip` |
| ChildDetailTabs | `web/src/features/family/components/child-detail-tabs.tsx` | client | shadcn `Tabs` bound to `?tab=` with `router.replace`, scroll position kept |
| AcademicsTab | `web/src/features/family/components/academics-tab.tsx` | server | stat cards, units, deadlines |
| UnitStandingList | `web/src/features/family/components/unit-standing-list.tsx` | server | `DataTable` with card fallback |
| DeadlinesList | `web/src/features/family/components/deadlines-list.tsx` | server | max 5, date via `lib/format/date.ts` |
| ApsCard | `web/src/features/family/components/aps-card.tsx` | server | renders only for high school Grades 10 to 12 with `aps` not null |
| WellbeingTab | `web/src/features/family/components/wellbeing-tab.tsx` | server | wraps the shared trend chart and guidance |
| SharedTrendChart | `web/src/features/family/components/shared-trend-chart.tsx` | client | `LineChart` from `components/common/charts.tsx`, magenta tokens, text summary slot (owned by PG-PAR-WELL-07) |
| CelebrationsTab | `web/src/features/family/components/child-celebrations-tab.tsx` | server | reuses `CelebrationItem` from PG-PAR-CELEB |
| GoalsTab | `web/src/features/family/components/goals-tab.tsx` | server | read-only list from the overview `goals` block |
| PledgeDialog | `web/src/features/family/components/pledge-dialog.tsx` | client | Deferred (decision 6): not built in v1 |
| PrivacyBoundaryCard | `web/src/features/family/components/privacy-boundary-card.tsx` | server | shared with PG-PAR-WELL |
| Loaders | `web/src/features/family/server/get-child-overview.ts`, `get-child-wellbeing.ts`, `get-child-celebrations.ts` | server | only the active tab's loader runs |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/family/children/{id}/overview` (BE-FAM-07) | GET | `displayName`, `stage`, `grade`, `curriculum`, `yearOfStudy`, `institutionName`, `sharing.*`, `standing`, `standingReason`, `averagePct` (nullable), `aps` (nullable, high school Grades 10 to 12), `units[]` (`unitId`, `name`, `kind` (`caps_subject`, `tertiary_course`), `standing`, `latestMarkPct` (nullable), `predictedPct` (nullable), `masteryPct` (nullable), `trend` (`up`, `flat`, `down`, null)), `deadlines[]` (`assessmentId`, `title`, `unitName`, `type`, `dueAt`, `state`), `dueNext14Days` | none shared |
| `/family/children/{id}/wellbeing?window=8w` (BE-FAM-08) | GET | `shared`, `summary`, `points[]` (`weekStart`, `moodAvg` 1 to 5 nullable, `stressAvg` 1 to 5 nullable, `checkinCount`), `minCheckinsPerPoint` | none shared |
| `/family/children/{id}/celebrations?cursor=` (BE-FAM-09) | GET | `items[]` (`id`, `kind`, `occurredAt`, `params`), `nextCursor` | none shared |
| `/wellbeing/support-resources` (BE-WEL-08) | GET | `items[]` (`name`, `phone`, `hours`, `url`) | `"use cache"`, tag `wellbeing:resources` (public, static) |
| Shared goals (BE-FAM-07 `goals` block) | GET | `goals[]` (`goalId`, `title`, `criteriaKind`, `progressPct` or null, `verified`) or `{ shared: false }` | none shared |

The API returns 404 for any child id the parent is not actively linked to (unlinked, never linked, deleted), so the page cannot tell them apart and cannot be used to probe for student ids.

### Mutations

| Endpoint (BE ID) | Method | Request | Notes |
|---|---|---|---|

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | first render or tab switch | "Loading {firstName}'s progress" | skeleton |
| Not linked (404 or 403) | id not linked, unlinked, or malformed | Title "You are not linked to this student". Body "This might be because the link was removed or the address is wrong." | "Back to children" |
| Error | overview fails | Title "We could not load this page". Body "Check your connection and try again." | "Try again" |
| Academics not shared | `sharing.academics` false | Title "{firstName} has not shared academic progress". Body "Students choose what their parents see. You can still see celebrations they share." | none |
| No evidence | `averagePct` null and no unit marks | "No marks yet. Standing and predictions appear once {firstName} logs marks." | none |
| Unit no evidence | unit `latestMarkPct` null | "No marks yet" and "Not enough marks to predict" | none |
| No deadlines | `deadlines` empty | "Nothing due in the next 14 days." | none |
| Wellbeing not shared | `shared` false | Title "{firstName} has not shared their wellbeing trend". Body "That is their choice to make. If you are worried, talking to them directly is the best next step." | link "Support resources" |
| Wellbeing not enough data | every point below `minCheckinsPerPoint` | "Not enough check-ins yet to show a trend." | none |
| Celebrations empty | no items | "No celebrations yet. They appear when {firstName} reaches real milestones, like an improved mark or a finished goal." | none |
| Goals none shared | `goals` block `{ shared: false }` or empty | "{firstName} has not shared any goals." | none |
| Forbidden role | non-parent | proxy redirect | |

## Stage variants

- High school: "Subjects", "Grade {n}", "SBA" in deadline types, predicted result as a percentage per subject, APS card for Grades 10 to 12 (from BE-CAR-06, labelled "APS estimate, based on current marks").
- University: "Courses" (decision 27), the study level (decision 19), deadline types "Assignment", "Test", "Exam", predicted result labelled "Predicted course mark". No APS, Grade, SBA, NSC or matric anywhere.
- `StageLine`, the units column header and deadline type labels all come from one stage-aware copy map in `features/family/lib/stage-copy.ts`.
- A child who has just moved from Grade 12 to university shows only current units (the API returns current enrolments).

## Interactions and edge cases

- Tab switch keeps scroll at the tab bar and does not refetch the header.
- Deep link `?tab=wellbeing` when not entitled lands on the upgrade state inside the tab, never a page-level error.
- Unknown `tab` value falls back to academics.
- Student revokes sharing while the parent is on the tab: the next navigation or refresh shows the not-shared state; nothing from before is cached in a shared cache.
- Unlinked during the session: the next request returns 404 and the not-found boundary renders.
- Malformed id (not a Guid): rendered as not linked without calling the API.
- A unit the student deleted disappears; past celebrations about it keep their text but drop the link.
- Predicted results are never shown when the API returns null; the UI never computes its own prediction.
- Marks are rounded to whole percentages; the API does the rounding.
- Deadlines window (43f9faa rule): upcoming work excludes graded items and includes anything due from yesterday onward, so something due last night that is not yet graded still shows (as "Due yesterday"). The count beside the list is the full count, while the list shows at most 5.
- The old overview answered 403 for a non-linked student; the rebuild answers 404 so ids cannot be probed. Both render the same not-linked state.
- Wellbeing weekly points with fewer check-ins than `minCheckinsPerPoint` (3 assumed) are returned as null by the API and drawn as gaps, so a single check-in can never be read off the chart.
- Seat not covered: a small "Not on your plan" badge in the header links to billing; the page itself still works.

## Copy

- Back link "Children".
- Tabs "Academics", "Wellbeing", "Celebrations", "Goals".
- Stat cards: "Average", "Due in the next 14 days", "APS estimate".
- Unit row: "Latest: {pct}%", "Predicted: {pct}%", "Mastery {pct}%", "Up since last month", "Down since last month", "Steady".
- Privacy boundary: "Diary entries and check-in notes are private to {firstName}. They are encrypted and never shown to parents." Link "What parents can see".
- Wellbeing guidance (summary `lower_than_usual`): "{firstName}'s mood has been lower than usual for two weeks. A relaxed chat, without pressure, often helps more than questions about marks."
- Support resources heading: "If you are worried".

## Acceptance criteria

- AC-01 Given a linked high-school Grade 11 child with marks, when the parent opens the page, then subjects, latest and predicted marks, an APS estimate and deadlines show.
- AC-02 Given a linked university child, when the page renders, then the heading reads "Courses", there is no APS card, and no Grade, SBA or matric text exists in the DOM.
- AC-03 Given a Grade 9 child, when the academics tab renders, then no APS card shows.
- AC-04 Given a child id the parent is not linked to, when the page loads, then the not-linked state shows with "Back to children" and no child data was returned.
- AC-05 Given academic sharing is off, when the academics tab renders, then no unit names or marks are in the DOM or network payload.
- AC-06 Given wellbeing is shared and entitled, when the wellbeing tab opens, then an 8-week chart with a text summary renders and weeks below the check-in minimum show as gaps.
- AC-07 Given wellbeing is not shared, when the tab opens, then the not-shared copy shows and the support resources link works.
- AC-08 Given any tab, when rendered, then the privacy boundary card is visible.
- AC-09 Given `?tab=celebrations`, when the page loads, then the celebrations tab is selected and only its loader ran.
- AC-10 Given a unit with no marks, when rendered, then "No marks yet" shows and no 0% appears.
- AC-11 Given any shared goal, when the Goals tab renders, then it shows verified progress only, with no pledge, amount or reward control (decision 6).

## Production readiness

### Security
- [ ] The API is the authority: 404 for non-linked ids (BE-FAM-13); the page never trusts the URL id beyond passing it through. PG-PAR-CHILD-Q16.
- [ ] Cross-family test: parent B requests parent A's child id and gets the not-linked state; the network payload holds no child fields. PG-PAR-CHILD-Q16.
- [ ] Child names never appear in the `<title>` sent to analytics or in Sentry breadcrumbs; `generateMetadata` uses "Child" in analytics page names. PG-PAR-CHILD-Q17.

### Privacy and POPIA
- [ ] Consent-scoped reads: academics, wellbeing and goals each check their own sharing flag server-side; the UI flags are only for copy. PG-PAR-CHILD-Q18.
- [ ] Wellbeing k-minimum (no point from fewer than 3 check-ins) asserted by a contract test against the API fixture. PG-PAR-CHILD-Q18.
- [ ] No diary, note, chat or answer text in any response used by this page (schema check in the zod parse: unknown keys stripped and logged as a contract warning). PG-PAR-CHILD-Q18.

### Performance
- [ ] Only the active tab's data is fetched; the chart bundle loads only on the wellbeing tab (`next/dynamic`), keeping route JS under 150 KB gzip; LCP under 2.5 s mobile. PG-PAR-CHILD-Q19.

### Resilience
- [ ] A failing celebrations or wellbeing call shows an inline error in that tab while the header and other tabs keep working. PG-PAR-CHILD-17.

### Observability
- [ ] Analytics: `parent_child_viewed` (props `stage`, `tab`), `parent_child_tab_changed` (prop `tab`), `parent_privacy_info_opened`, `parent_support_resources_opened`. No ids. PG-PAR-CHILD-Q20.
- [ ] Sentry boundary tagged `PG-PAR-CHILD`; 404s are not reported as errors. PG-PAR-CHILD-Q20.

### Accessibility
- [ ] WCAG 2.2 AA: tabs follow the Radix tabs pattern; chart has a text summary and a hidden data table; trend icons have text. PG-PAR-CHILD-Q21.

### Rollout
- [ ] Behind `flags.parentTrack`; no separate pledge flag in v1 (decision 6). PG-PAR-CHILD-Q22.

### Monitoring and alerts
- [ ] Alert if BE-FAM-07 returns 5xx above 1% in 15 minutes, and a weekly report of 404 rate on this route (a spike may mean broken links in emails). PG-PAR-CHILD-Q23.

## Build tasks

- [ ] **PG-PAR-CHILD-01** Academics tab (units, mastery, predicted result, deadlines): tab composition in `academics-tab.tsx`
- [ ] **PG-PAR-CHILD-02** Wellbeing tab (shared trend only): composition in `wellbeing-tab.tsx`
- [ ] **PG-PAR-CHILD-03** Celebrations tab (paged list reusing `CelebrationItem`)
- [ ] **PG-PAR-CHILD-04** Goals tab: shared goals list with verified progress from the BE-FAM-07 `goals` block, read-only (pledges deferred, decision 6)
- [ ] **PG-PAR-CHILD-05** Diary privacy boundary message (`PrivacyBoundaryCard`, visible on every tab)
- [ ] **PG-PAR-CHILD-06** Forbidden state for unlinked child (`not-found.tsx`, also for 403 and malformed ids)
- [ ] **PG-PAR-CHILD-07** `ChildDetailHeader` with back link, `StageLine`, `StandingChip`, seat badge
- [ ] **PG-PAR-CHILD-08** `ChildDetailTabs` bound to `?tab=` with fallback for unknown values
- [ ] **PG-PAR-CHILD-09** Academics stat cards (average, due in 14 days) with no-evidence wording
- [ ] **PG-PAR-CHILD-10** `ApsCard` for high school Grades 10 to 12 only
- [ ] **PG-PAR-CHILD-11** `UnitStandingList` (DataTable with card fallback, latest, predicted, mastery bar, trend text)
- [ ] **PG-PAR-CHILD-12** `DeadlinesList` (max 5, stage-aware type labels, JHB dates)
- [ ] **PG-PAR-CHILD-13** `stage-copy.ts` map for units heading, deadline types, predicted labels
- [ ] **PG-PAR-CHILD-14** Wellbeing not-shared, not-enough-data and upgrade variants plus support resources link
- [ ] **PG-PAR-CHILD-15** `PledgeDialog` and pledge create and cancel mutations *(deferred: decision 6, not in v1)*
- [ ] **PG-PAR-CHILD-16** Academics-not-shared variant
- [ ] **PG-PAR-CHILD-17** Per-tab inline error boundaries so one failing tab does not break the page
- [ ] **PG-PAR-CHILD-18** Deadlines rule from 43f9faa: exclude graded, include due from yesterday ("Due yesterday" label), full count beside a 5 item list
- [ ] **PG-PAR-CHILD-19** Wellbeing tab is free (decision 13): no `parent-insights` check and no upgrade state; a test asserts a parent on any plan sees the shared trend

## Quality tasks

- [ ] **PG-PAR-CHILD-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-PAR-CHILD-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-PAR-CHILD-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-PAR-CHILD-Q04** Empty state with one clear next action
- [ ] **PG-PAR-CHILD-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-PAR-CHILD-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-PAR-CHILD-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-PAR-CHILD-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-PAR-CHILD-Q09** Layout at 1440px
- [ ] **PG-PAR-CHILD-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-PAR-CHILD-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-PAR-CHILD-Q12** axe: zero violations in light and dark
- [ ] **PG-PAR-CHILD-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-PAR-CHILD-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-PAR-CHILD-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-PAR-CHILD-Q16** Security: cross-family and unlinked-id E2E with payload assertions
- [ ] **PG-PAR-CHILD-Q17** PII: child names kept out of analytics page names, Sentry breadcrumbs and logs
- [ ] **PG-PAR-CHILD-Q18** Privacy contract checks: sharing flags enforced server-side, k-minimum on wellbeing points, no private text fields
- [ ] **PG-PAR-CHILD-Q19** Performance: per-tab loading, dynamic chart import, LCP and JS budget measured
- [ ] **PG-PAR-CHILD-Q20** Observability: four analytics events, Sentry tags, 404 not reported
- [ ] **PG-PAR-CHILD-Q21** WCAG 2.2 AA: tabs pattern, chart text alternative and data table
- [ ] **PG-PAR-CHILD-Q22** Rollout: `flags.parentTrack` gate
- [ ] **PG-PAR-CHILD-Q23** Monitoring: 5xx alert on BE-FAM-07 and weekly 404 report

## Tests

### Unit (Vitest)
- `features/family/lib/stage-copy.test.ts`: both stages, no cross-vocabulary.
- `features/family/components/aps-card.test.tsx`: shows for Grade 10 to 12 high school only.
- `features/family/components/unit-standing-list.test.tsx`: nulls render as "No marks yet" and "Not enough marks to predict".
- `features/family/components/child-detail-tabs.test.tsx`: unknown tab falls back; URL updates on change.
- `features/family/components/privacy-boundary-card.test.tsx`.

### Playwright (`web/tests/e2e/parent/child-detail.spec.ts`)
- `high-school child shows subjects, APS and deadlines`
- `university child shows modules and no APS`
- `grade 9 child shows no APS`
- `unlinked child id shows not-linked state`
- `other family's child id shows not-linked state` (security)
- `academics not shared hides unit data`
- `wellbeing tab shows shared trend with gaps below minimum`
- `wellbeing tab not shared copy`
- `wellbeing tab is free on every plan`
- `tab deep link loads only that tab`
- `ungraded item due yesterday still listed`
- axe light and dark at 360 and 1440 for each tab

## Open questions

- Decided (6): no pledges in v1. The Goals tab ships as a read-only shared goals list; PG-PAR-CHILD-15 is deferred.
- Minimum check-ins per weekly wellbeing point (3 assumed) must be set in BE-FAM-08 and BE-WEL-09.
- Should APS show to parents at all, or only to the student? This file shows it for Grades 10 to 12 when academics are shared.
- Decided (13): the wellbeing tab is free. PG-PAR-DASH and PG-PAR-WELL must match.
