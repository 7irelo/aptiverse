# Achievements

| | |
|---|---|
| ID | `PG-STU-REWARDS` |
| Route | `/dashboard/progress/achievements` |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-PRG-07, BE-PRG-08, BE-PRG-09, BE-PRG-15, UI-04, UI-05, UI-11, UI-21, UI-22, UI-24, UI-33, PG-STU-ANALYTICS-08 (Progress layout and tabs), PG-ADM-DASH-13 (`web/src/lib/format/datetime.ts`) |
| Old app reference | `web/src/app/(app)/dashboard/rewards/page.tsx` at 43f9faa (points balance, level and rank, practice and check-in streaks, a reward catalogue that spends points on time-boxed quota top-ups, achievements, points ledger); `api/Controllers/GoalsController.cs` `GET /api/goals/achievements`, `points/me`, `points/ledger`, `rewards`, `rewards/{code}/redeem` and `Entitlements/.../RewardCatalog.cs`, `QuotaGrant.cs` at 43f9faa. De-gamified in the rebuild |
| Status | Not started (backend not started; no route, loader or components exist). 1 deferred by decision 6: PG-STU-REWARDS-14 |

`PG-STU-REWARDS-05` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

A quiet record of real milestones: the first practice test finished, ten practice tests, a topic reaching Secure, every assessment in a term logged, a goal completed. Earned ones use the amber achievement zone, which is used nowhere else for decoration. Unearned ones show exactly what earns them and, only where the server counts it, how far along the student is. There are no points totals, no levels, no leaderboards, no confetti and no streak-shaming. The activity view shows weeks the student practised, not a streak to protect.

## User stories

- As a student, I want to see the milestones I have earned and when, so I can see real progress.
- As a student, I want to know exactly what earns each milestone I have not reached, so the criteria are clear and fair.
- As a student, I want to see which weeks I practised over the last term, without being punished for a missed week.
- As a student who has earned nothing yet, I want a clear first milestone to aim for.

## Layout

### Mobile (360px)

Single column, `px-4`, `gap-6`:

1. Progress header and tabs (layout), "Achievements" active. h1 "Achievements", description "Milestones you've reached through real work."
2. `ActivityWeeksCard`: title "Weeks you practised", text summary first ("You practised in 7 of the last 12 weeks."), then a 12-cell row of week squares (filled for a week with at least one finished practice test, outlined for none), labels for the first and last week. No streak counter, no flame.
3. `EarnedSection`: h2 "Earned ({n})", list of `AchievementCard`s, newest first. Card: amber icon tile (`bg-achievement text-achievement-foreground`), name, one-line criteria, "Earned {date}".
4. `UnearnedSection`: h2 "Still to earn ({n})", cards in neutral graphite: outlined icon, name, criteria sentence, and either a real count ("3 of 10 practice tests") with a `ProgressBar`, or no progress element at all when the server sends none.

### Desktop (1440px)

`PageShell`, 12 columns:

- Row 1: `ActivityWeeksCard` spans 12, week row widens to show 26 weeks with month labels.
- Row 2: `EarnedSection` as a 3-column card grid (spans 12).
- Row 3: `UnearnedSection` as a 3-column card grid.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/progress/achievements/page.tsx` | server | `generateMetadata` title "Achievements" |
| Loading | `web/src/app/(app)/dashboard/progress/achievements/loading.tsx` | server | Week row and 6 card skeletons |
| Error | `web/src/app/(app)/dashboard/progress/achievements/error.tsx` | client | `PageError` with retry |
| ActivityWeeksCard | `web/src/features/progress/components/activity-weeks-card.tsx` | server | Pure CSS grid of cells, no chart library; each cell has an accessible label |
| EarnedSection | `web/src/features/progress/components/earned-section.tsx` | server | Grid of `AchievementCard` |
| UnearnedSection | `web/src/features/progress/components/unearned-section.tsx` | server | Grid of `AchievementCard` in neutral variant |
| AchievementCard | `web/src/features/progress/components/achievement-card.tsx` | server | `Card`; `variant: "earned" \| "unearned"`; anchor id equals achievement id so journey links can jump to it |
| Achievement icons | `web/src/features/progress/lib/achievement-icons.ts` | shared | Maps API icon keys to Lucide icons (`Award`, `Medal`, `Target`, `BookCheck`, `CalendarCheck`, `FlagTriangleRight`); unknown key falls back to `Award` |
| Weeks summary | `web/src/features/progress/lib/summaries.ts` | shared | `activityWeeksSummary(weeks)` |
| Loader | `web/src/features/progress/server/get-achievements.ts` | server | `"use cache"`, tag `progress:achievements:<userId>` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/progress/achievements` (BE-PRG-09) | GET | `earned[]`: `id`, `key`, `name`, `criteria` (sentence), `iconKey`, `earnedAt`, `sourceRef` (or null); `unearned[]`: `id`, `key`, `name`, `criteria`, `iconKey`, `progress` (`{ current: int, target: int }` or null); `activity.weeks[]`: `weekStart`, `practised` (boolean or null before the student joined); `activity.windowWeeks` | `progress:achievements:<userId>` |

Rules:

- Awards come only from integration events (BE-PRG-08). The page never computes an award.
- `progress` is present only for count-based criteria the server measures (practice tests finished, assessments logged). Criteria the server cannot count (a topic reaching Secure) return null, and the card shows no bar. This is the "no fake progress" rule.
- Weeks before the account existed return `practised: null` and render as blank, not as missed.
- There are no points in v1 (decision 6): no balance, ledger or rewards catalogue on this page. The points ledger is deferred (BE-PRG-70).
- `cacheLife("minutes")`; tag invalidated by the same results and mark flows that invalidate progress.

Mutations: none.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Skeletons; "Loading your achievements" |
| Nothing earned yet | `earned` empty | Earned section shows: "Nothing earned yet. Your first one comes with your first finished practice test." Button "Start practising" to `/dashboard/practice`. Unearned list still renders |
| No practice weeks | All `practised` false or null | Weeks card summary: "No practice weeks yet. Each week you finish a practice test fills a square." |
| All earned | `unearned` empty | Unearned section replaced by "You've earned every milestone we have right now." |
| Error | Loader failed | "We couldn't load your achievements. Check your connection and try again." Button "Try again" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |
| Populated | Data present | As laid out |

## Stage variants

| Element | High school | University |
|---|---|---|
| Unit wording in criteria | "subject" | "course" |
| Term milestone name | "Logged every assessment this term" | "Logged every assessment this semester" |
| Forbidden words | module, GPA | SBA, APS, matric, Grade |

Criteria sentences come from the API per stage; the page does not rewrite them, but the stage-wording E2E check covers them.

## Interactions and edge cases

- Amber is used only for earned cards and nothing else on the page (the weeks card uses the neutral ink and `bg-primary` for filled cells).
- No motion when a new achievement appears; at most a static "New" `Badge` for achievements earned in the last 7 days.
- A milestone that was earned then invalidated (a practice attempt voided by admin) disappears from earned on the next read; the journey item keeps showing "No longer available".
- Weeks summary never says "streak", "lost" or "broken". If the latest week has no practice: "No practice yet this week." Nothing else.
- Unknown `iconKey` falls back to `Award`.
- `progress.current` greater than `target` (race before award lands) renders as full bar with "{target} of {target}".
- Journey links to `#<id>` scroll to and focus the card.

## Copy

- h1: "Achievements"
- Description: "Milestones you've reached through real work."
- Weeks card title: "Weeks you practised"
- Weeks summary: "You practised in {n} of the last {window} weeks."
- Earned heading: "Earned ({n})"; unearned heading: "Still to earn ({n})"
- Earned line: "Earned {date}"
- Count line: "{current} of {target} {noun}"

## Acceptance criteria

1. Given 2 earned and 8 unearned achievements, when the page loads, then 2 amber cards render under "Earned (2)" newest first and 8 neutral cards under "Still to earn (8)".
2. Given an unearned achievement with `progress: null`, when its card renders, then there is no progress bar or percentage.
3. Given an unearned achievement with `progress: { current: 3, target: 10 }`, when it renders, then "3 of 10 practice tests" and a bar at 30% appear.
4. Given a student who joined 5 weeks ago, when the weeks card renders, then the 7 earlier cells are blank (not outlined as missed) and the summary counts only weeks since joining.
5. Given the latest week has no practice, when the summary renders, then it reads "No practice yet this week." and contains none of "streak", "lost", "broken".
6. Given the page renders, then the amber achievement token is used only on earned cards (visual snapshot and a DOM check for the class).
7. Given the endpoint fails, when the page loads, then the error state with retry renders.
8. Given a journey link to `#<id>`, when the page loads, then that card is scrolled into view and focused.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-PRG-09 scoped to the caller; achievements cannot be awarded through any client call (no POST exists); award handlers are idempotent on event id | PG-STU-REWARDS-Q16 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; route is fully server-rendered with no client components except shared shell | PG-STU-REWARDS-Q17 |
| Resilience | Partial data: if `activity` is missing, the weeks card shows its own inline error and the lists still render | PG-STU-REWARDS-Q18 |
| Observability | Sentry route tag; event `achievements_viewed` (props: `earned_count` bucketed as 0, 1 to 5, 6 plus); trace propagation | PG-STU-REWARDS-Q19 |
| Accessibility | WCAG 2.2 AA; each week cell has a label ("Week of 6 Oct: practised"); earned state stated in text, not only amber; contrast of `achievement-foreground` on `achievement` checked in both schemes | PG-STU-REWARDS-Q20 |
| Privacy and POPIA | Achievements are shown to linked parents only through the Family celebrations contract and the student's privacy settings, never by this endpoint | PG-STU-REWARDS-Q21 |
| Rollout | Flag `progress-pages`; achievement definitions are seed data, so a bad definition is fixed by a seed change without a web deploy | PG-STU-REWARDS-Q22 |
| Monitoring | Grafana "BE-PRG-09 p95 and 5xx" and "achievement award handler failures" (Wolverine dead letters); alert on any dead letter in the award queue | PG-STU-REWARDS-Q23 |

## Build tasks

- [ ] **PG-STU-REWARDS-01** Earned achievements (achievement colour only): `EarnedSection` and earned `AchievementCard`
- [ ] **PG-STU-REWARDS-02** Streak view, built as the "Weeks you practised" activity card (no streak counter, no shaming)
- [ ] **PG-STU-REWARDS-03** Criteria for unearned ones, no fake progress: unearned card with a bar only when `progress` is sent
- [ ] **PG-STU-REWARDS-04** Redirect `/dashboard/rewards` to `/dashboard/progress/achievements` (308)
- [ ] **PG-STU-REWARDS-06** Loader `get-achievements.ts`, zod-validated, cached with user tag
- [ ] **PG-STU-REWARDS-07** `achievement-icons.ts` icon map with fallback
- [ ] **PG-STU-REWARDS-08** `activityWeeksSummary` text function and pre-join blank cells
- [ ] **PG-STU-REWARDS-09** Nothing-earned, no-weeks and all-earned states
- [ ] **PG-STU-REWARDS-10** "New" badge for the last 7 days and anchor focus from journey links
- [ ] **PG-STU-REWARDS-11** Desktop 3-column grids and 26-week row
- [ ] **PG-STU-REWARDS-12** Seed the achievement catalogue from the old derived list (Off the mark: first practice test; Putting in the reps: 10; Serious about this: 50; Proven once: first verified goal; Proven again: 5 verified goals; Nailed it: 90% or better on a practice test; Seven straight and Thirty straight reworded around practised weeks, without a consecutive-day rule); the old "Checking in" mood-streak achievement is dropped so wellbeing never feeds achievements. Hand to BE-PRG-08
- [ ] **PG-STU-REWARDS-13** Server-sent `progress` for every count-based achievement (the old endpoint derived progress for all of them on read); the page still renders no bar when `progress` is null
- [ ] **PG-STU-REWARDS-14** Rewards section: points balance, a points ledger and the quota top-up catalogue (redeem through the BFF, affordability decided server-side, active grants with expiry) *(deferred: decision 6, not in v1; nothing renders in its place)*

## Quality tasks

- [ ] **PG-STU-REWARDS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-REWARDS-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-REWARDS-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-REWARDS-Q04** Empty state with one clear next action
- [ ] **PG-STU-REWARDS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-REWARDS-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-REWARDS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-STU-REWARDS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-REWARDS-Q09** Layout at 1440px
- [ ] **PG-STU-REWARDS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-REWARDS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-REWARDS-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-REWARDS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-REWARDS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-REWARDS-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-REWARDS-Q16** Integration test with BE-PRG-08 and 09: replaying an event awards once; another user's token sees nothing of this user
- [ ] **PG-STU-REWARDS-Q17** Lighthouse CI mobile budget; confirm no client chart code on the route
- [ ] **PG-STU-REWARDS-Q18** Partial-data rendering when `activity` is absent
- [ ] **PG-STU-REWARDS-Q19** Sentry tag and the bucketed `achievements_viewed` event
- [ ] **PG-STU-REWARDS-Q20** Screen reader pass on week cells and earned state; amber contrast check
- [ ] **PG-STU-REWARDS-Q21** Confirm with PG-PAR-CELEB that parent visibility goes through Family and privacy settings only
- [ ] **PG-STU-REWARDS-Q22** `progress-pages` flag check on this route
- [ ] **PG-STU-REWARDS-Q23** Grafana panels and dead-letter alert for award handlers

## Tests

Unit (Vitest):

- `summaries.test.ts`: "weeks summary counts only weeks since joining", "weeks summary never contains streak, lost or broken", "latest week empty reads no practice yet this week".
- `achievement-card.test.tsx`: "earned uses the achievement token", "unearned with null progress renders no bar", "current over target clamps to full".
- `achievement-icons.test.ts`: "unknown key falls back to Award".

Playwright (`web/e2e/student/progress-achievements.spec.ts`):

- "achievements: earned and unearned lists render with counts"
- "achievements: nothing earned shows the first milestone prompt"
- "achievements: unearned without server progress has no bar"
- "achievements: rewards redirects to achievements"
- "achievements: error state retries"
- "achievements: axe clean light and dark at 360 and 1440"

## Open questions

- Decided (6): no points in v1, so nothing reads a points ledger; it is deferred (BE-PRG-70).
- The achievement catalogue (names, criteria, stage variants) needs a seed list signed off before BE-PRG-08 starts.
- DESIGN_BRIEF asks for a "streak view". This spec reads that as practised weeks with no counter; confirm.
- Decided (6): the old points-for-quota scheme (RewardCatalog, QuotaGrant) is not in v1; PG-STU-REWARDS-14 is deferred and revisited after launch.
