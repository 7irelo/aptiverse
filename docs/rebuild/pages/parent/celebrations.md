# Celebrations

| | |
|---|---|
| ID | `PG-PAR-CELEB` |
| Route | `/parent/celebrations` (`?child={studentId}` filters to one child) |
| Phase | 8 |
| Roles | parent |
| Stages | high school, university (per item, vocabulary follows the child) |
| Entitlement | free |
| Depends on | BE-FAM-06, BE-FAM-09, BE-PRG-08 (achievement events), BE-PRG-06 (goal progress), BE-ACA-37 (`AssessmentGraded`), FE-24, PG-PAR-WELL-05 (`ChildSelector`), PG-CMN-NOTIF-03 (`lib/format/date.ts`) |
| Old app reference | `43f9faa:web/src/app/(app)/parent/celebrations/page.tsx` (hardcoded rows with emoji; nothing is reused) |
| Status | Not started (0 of 32 tasks) |

## Purpose

A positive feed of real milestones across a parent's children: improved marks, finished goals, mastery reached, practice milestones and consistent study weeks. Every item comes from a real integration event; nothing is invented, inflated or ranked between siblings. It gives a parent something specific to praise.

## User stories

- As a parent, I see what my children actually achieved this week so I can say "well done" about something specific.
- As a parent of two, I see both children's celebrations together or filter to one.
- As a parent, I never see siblings compared or ranked, and I never see a "streak lost" message.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Celebrations", description "Real milestones your children have reached."
2. `ChildSelector` with an extra first option "All children" (hidden with one child).
3. Feed grouped by week ("This week", "Last week", then "Week of 6 Oct"), newest first. Each item:
   - Lucide icon by kind in an amber surface circle (amber is reserved for earned achievements), `aria-hidden`.
   - Line 1: "{firstName}" (only in "All children" view) and the celebration sentence.
   - Line 2: unit name when present and the date ("Tue 14 Oct").
4. "Show older" button (44px) loading the next page by cursor.

### Desktop (1440px)

- Feed centred at max width 720px for readability; selector as tabs above.
- Right rail at `xl` (280px): per-child count for the last 30 days ("Thandi: 4 celebrations"), listed alphabetically, not sorted by count (no ranking).

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/parent/celebrations/page.tsx` | server | `requireRole("parent")` |
| Loading | `web/src/app/(app)/parent/celebrations/loading.tsx` | server | list skeleton |
| Error | `web/src/app/(app)/parent/celebrations/error.tsx` | client | `PageState` retry; Sentry tag `PG-PAR-CELEB` |
| CelebrationsFeed | `web/src/features/family/components/celebrations-feed.tsx` | server | grouping by week, first page server-rendered |
| CelebrationItem | `web/src/features/family/components/celebration-item.tsx` | server | icon, sentence, meta; reused by PG-PAR-CHILD and the dashboard rail |
| ShowOlderButton | `web/src/features/family/components/show-older-celebrations.tsx` | client | TanStack infinite query through BFF for page 2 onward |
| Kind map | `web/src/features/family/lib/celebration-kinds.ts` | shared | kind to Lucide icon and stage-aware sentence template |
| Week grouping | `web/src/features/family/lib/group-by-week.ts` | shared | Africa/Johannesburg weeks, pure |
| Loader | `web/src/features/family/server/get-family-celebrations.ts` | server | merges per-child calls when "All children" (see Data) |
| ChildSelector | `web/src/features/family/components/child-selector.tsx` | client | from PG-PAR-WELL-05, with `includeAll` prop |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/family/children` (BE-FAM-06) | GET | `studentId`, `displayName`, `stage`, `sharing.celebrations` | none shared |
| `/family/children/{id}/celebrations?cursor=&limit=20` (BE-FAM-09) | GET | `items[]` (`id`, `kind`, `occurredAt`, `params` (`unitName`, `fromPct`, `toPct`, `goalTitle`, `topicName`, `count`, `achievementName`)), `nextCursor` | none shared |

Kinds (closed set, string enum from the API): `mark_improved`, `goal_completed`, `mastery_reached`, `practice_milestone`, `consistent_week`, `achievement_earned`, `assessment_submitted_on_time`.

"All children" merges per-child pages by `occurredAt`. With up to 4 children the loader fetches page 1 for each in parallel. A family-wide endpoint (`GET /family/celebrations`) would be simpler and is raised as an open question.

### Mutations

None.

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | first render or filter change | "Loading celebrations" | skeleton |
| No children | no links | Title "No children linked yet". Body "Celebrations appear here once your child accepts your invite." | "Invite a child" |
| Empty | no items for the selection | Title "No celebrations yet". Body "They appear when {firstName} reaches a real milestone, like an improved mark or a finished goal." (All children: "when your children reach a real milestone") | none |
| Not shared | `sharing.celebrations` false for the selected child | Title "{firstName} has not shared celebrations". Body "Students choose what their parents see." | none |
| Error | load fails | Title "We could not load celebrations". Body "Check your connection and try again." | "Try again" |
| Show older error | page 2 fails | Inline "Could not load older celebrations." | "Try again" |
| End of feed | `nextCursor` null | "That is everything from the last 12 months." | none |
| Forbidden | non-parent | proxy redirect | |

## Stage variants

- `mark_improved`: high school "{firstName}'s {unitName} mark went up from {fromPct}% to {toPct}%." University: "{firstName}'s {unitName} course mark went up from {fromPct}% to {toPct}%."
- `assessment_submitted_on_time`: high school may say "SBA task" when `params.type` is SBA; university says "assignment".
- Other kinds are stage-neutral.

## Interactions and edge cases

- Consistency, not streaks: the old "streaks" idea becomes `consistent_week` ("studied on 4 days this week"), a positive-only event. No "streak lost" or "missed a day" item ever exists.
- A celebration about a unit the student later deleted keeps its sentence but has no link.
- Student turns off celebration sharing: their items vanish on next load; "All children" omits them silently, with one line "{firstName} has not shared celebrations." under the selector.
- Refunded or reversed events (for example a mark corrected downward): the API removes the celebration (BE-FAM-09 reads current projections); the feed never shows a contradiction.
- Large families: page size 20 per child; merged view shows the newest 20 overall, then "Show older".
- Duplicate guarding: items keyed by `id`; infinite query de-duplicates.
- Sharing within the family (DESIGN_BRIEF idea) is out of scope for v1; no share buttons.

## Copy

- h1 "Celebrations"; description "Real milestones your children have reached."
- Selector first option "All children".
- Sentences:
  - goal_completed: "{firstName} finished the goal \"{goalTitle}\"."
  - mastery_reached: "{firstName} reached strong mastery in {topicName}."
  - practice_milestone: "{firstName} completed {count} practice tests in {unitName}."
  - consistent_week: "{firstName} studied on {count} days this week."
  - achievement_earned: "{firstName} earned \"{achievementName}\"."
- "Show older"; end line "That is everything from the last 12 months."

## Acceptance criteria

- AC-01 Given two children with events, when "All children" is selected, then items from both appear newest first with first names, grouped by week.
- AC-02 Given a child filter, when selected, then only that child's items show and names are omitted.
- AC-03 Given no events, when the page renders, then the empty copy shows and nothing is fabricated.
- AC-04 Given a child with celebrations not shared, when selected, then the not-shared copy shows and no items for that child exist in the payload.
- AC-05 Given more than 20 items, when "Show older" is pressed, then the next page appends with no duplicates and focus moves to the first new item.
- AC-06 Given any item, when rendered, then the icon is Lucide, there is no emoji, and no sibling comparison or ranking appears.
- AC-07 Given a university child's mark improvement, when rendered, then the sentence says "course mark" and never "Grade" or "SBA".

## Production readiness

### Security
- [ ] Per-child calls use only ids from the parent's own BE-FAM-06 result; `?child=` values not in that set are ignored. API enforces link scope (BE-FAM-13). PG-PAR-CELEB-Q16.
- [ ] BFF route for "Show older" passes through only the cursor and child id; the API re-checks the link on every page. PG-PAR-CELEB-Q16.

### Privacy and POPIA
- [ ] Only celebration kinds in the closed enum render; unknown kinds are dropped and reported as a contract warning, so a new backend event cannot leak private detail by accident. PG-PAR-CELEB-Q17.
- [ ] Feed limited to the last 12 months (data minimisation), enforced by the API. PG-PAR-CELEB-Q17.

### Performance
- [ ] First page server-rendered; infinite query code only loads with the button; route JS under 150 KB gzip; LCP under 2.5 s mobile. PG-PAR-CELEB-Q18.

### Resilience
- [ ] In "All children", one child's failed call drops that child with an inline note, not the whole feed. PG-PAR-CELEB-10.

### Observability
- [ ] Analytics: `parent_celebrations_viewed` (props `filter`: all or single, `itemCount` bucket), `parent_celebrations_show_older`. No names or kinds tied to a person. PG-PAR-CELEB-Q19.
- [ ] Sentry boundary tagged `PG-PAR-CELEB`; unknown-kind warnings sent as Sentry breadcrumbs without params. PG-PAR-CELEB-Q19.

### Accessibility
- [ ] WCAG 2.2 AA: feed is a list with week headings (h2); "Show older" announces "{n} more celebrations loaded" via a polite live region. PG-PAR-CELEB-Q20.

### Rollout
- [ ] Behind `flags.parentTrack`. PG-PAR-CELEB-Q21.

### Monitoring and alerts
- [ ] Alert on BE-FAM-09 5xx above 1% in 15 minutes; weekly count of unknown-kind warnings (should be zero). PG-PAR-CELEB-Q22.

## Build tasks

- [ ] **PG-PAR-CELEB-01** Feed of streaks, achievements, improvements (streaks reframed as positive-only `consistent_week`; feed composition in `celebrations-feed.tsx`)
- [ ] **PG-PAR-CELEB-02** `get-family-celebrations.ts` loader: per-child parallel fetch and merge by `occurredAt`
- [ ] **PG-PAR-CELEB-03** `celebration-kinds.ts`: kind to Lucide icon and stage-aware sentence, unknown kinds dropped
- [ ] **PG-PAR-CELEB-04** `CelebrationItem` presentation (amber surface icon, sentence, unit and date)
- [ ] **PG-PAR-CELEB-05** `group-by-week.ts` (Africa/Johannesburg weeks, labels "This week", "Last week", "Week of {date}")
- [ ] **PG-PAR-CELEB-06** Child filter with "All children" option (reuse `ChildSelector`)
- [ ] **PG-PAR-CELEB-07** "Show older" infinite query through BFF with de-duplication and focus management
- [ ] **PG-PAR-CELEB-08** Empty, not-shared, no-children and end-of-feed states
- [ ] **PG-PAR-CELEB-09** Desktop layout with per-child 30-day count rail (alphabetical)
- [ ] **PG-PAR-CELEB-10** Per-child failure isolation in the merged view

## Quality tasks

- [ ] **PG-PAR-CELEB-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-PAR-CELEB-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-PAR-CELEB-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (none; the paging query uses the BFF)
- [ ] **PG-PAR-CELEB-Q04** Empty state with one clear next action
- [ ] **PG-PAR-CELEB-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-PAR-CELEB-Q06** Forbidden state (no upgrade state: the page is free, decision 13)
- [ ] **PG-PAR-CELEB-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-PAR-CELEB-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-PAR-CELEB-Q09** Layout at 1440px
- [ ] **PG-PAR-CELEB-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-PAR-CELEB-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-PAR-CELEB-Q12** axe: zero violations in light and dark
- [ ] **PG-PAR-CELEB-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-PAR-CELEB-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-PAR-CELEB-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-PAR-CELEB-Q16** Security: child ids restricted to the parent's own links; cross-family E2E on the paging BFF call
- [ ] **PG-PAR-CELEB-Q17** Privacy: closed kind enum with unknown-kind drop; 12-month window verified
- [ ] **PG-PAR-CELEB-Q18** Performance: server-rendered first page, LCP and JS budget measured
- [ ] **PG-PAR-CELEB-Q19** Observability: two analytics events without PII, Sentry tags and unknown-kind breadcrumbs
- [ ] **PG-PAR-CELEB-Q20** WCAG 2.2 AA: list semantics, week headings, live region on load more
- [ ] **PG-PAR-CELEB-Q21** Rollout: `flags.parentTrack` gate
- [ ] **PG-PAR-CELEB-Q22** Monitoring: BE-FAM-09 5xx alert and unknown-kind weekly count

## Tests

### Unit (Vitest)
- `features/family/lib/celebration-kinds.test.ts`: every kind has an icon and both stage sentences; unknown kind returns null.
- `features/family/lib/group-by-week.test.ts`: JHB week boundaries across Sunday midnight UTC.
- `features/family/server/get-family-celebrations.test.ts`: merge order, one child failing.
- `features/family/components/celebration-item.test.tsx`: name shown only in all-children mode.

### Playwright (`web/tests/e2e/parent/celebrations.spec.ts`)
- `all children feed merges and groups by week`
- `filter to one child`
- `empty state is honest`
- `celebrations not shared hides child items`
- `show older appends without duplicates`
- `cross-family child id is ignored` (security)
- axe light and dark at 360 and 1440

## Open questions

- Add a family-wide `GET /family/celebrations` to avoid one call per child?
- Exact celebration kinds and thresholds (for example what counts as "strong mastery", how many days make a `consistent_week`) belong in the Progress and Family backend specs.
- Decided (20 and the de-gamified rule): no streak goals or streak language; celebrations use positive-only consistency (`consistent_week`) as this file does.
