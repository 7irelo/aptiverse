# Dashboard

| | |
|---|---|
| ID | `PG-STU-DASH` |
| Route | `/dashboard` |
| Phase | 7 (interim Phase 4 version behind a flag, see PG-STU-DASH-13) |
| Roles | student |
| Stages | high school, university |
| Entitlement | free (the tutor shortcut card respects `ai-tutor`) |
| Depends on | BE-PRG-13, BE-PRG-04, BE-PRG-14, BE-ACA-15, BE-ACA-33, BE-PRA-20, BE-WEL-03, BE-PRG-09, BE-IDN-28; FE-07, FE-24, FE-27, FE-63, UI-04, UI-11, UI-22, UI-24, UI-32, UI-33, SHL-03 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/page.tsx`, `f223ca7:DESIGN_BRIEF.md` section 9 |
| Status | Placeholder only: `web/src/app/(app)/dashboard/page.tsx` renders `PageContainer` plus `PageState` ("Your dashboard is on its way") with a static `metadata` title. No loader, no cards. 2 quality tasks partial, everything else not started. Backend not started. |

## Purpose

The calm morning view. In one glance a student sees what to do today, how they are doing in each subject or course, what is due soon, and one honest next step. Every number traces to a tested query; missing evidence reads "No marks yet", never 0.

## User stories

- As a high-school student, I open the app and see my most urgent task for today so I do not have to hunt for it.
- As a student, I see my predicted result per subject (high school) or my weighted average per course (university), built only from marks I logged and practice I did.
- As a student, I see assessments due in the next 14 days, with overdue ones first.
- As a student with a test in progress, I can get straight back to it before my time runs out.
- As a new student with no subjects yet, I am told exactly what to set up first.
- As a student, I can reach the AI tutor in one tap, or I see clearly that it is part of a paid plan.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` greeting ("Good morning, Thandi"), date line in Africa/Johannesburg ("Monday 19 October"); context chips under it, each only when the data exists: "Grade 11" and "NSC" (high school) or the institution short name such as "UCT" (university), plus the plan name linking to `/dashboard/billing`.
1a. Quick actions row: "Check in" (wellbeing), "Set a goal" (goals), "Start practice" (practice), each a 44px link button.
2. Active attempt banner (only when an attempt is live): test title, time left, "Resume test" button.
3. Today's focus card: one item chosen by the focus rule (PG-STU-DASH-12), one primary action.
4. Progress summary card: up to 4 unit rows (name, predicted or average, trend arrow), "See all" link to `/dashboard/progress`.
5. Next best action card: recommended drill (unit, topic, reason), "Start drill" button.
6. Upcoming deadlines card: up to 5 rows grouped Overdue, Today, This week, Later; "All assessments" link.
7. Wellbeing nudge card: check-in prompt or "You checked in today", link to `/dashboard/wellbeing`.
8. Recent achievements card: last 3 achievements plus "Active on N of the last 7 days" (no loss copy).
9. AI tutor shortcut card.
10. Active goals card (up to 3 goals with evidence-based progress, "All goals" link).
11. Recent activity card (last 5 real events: practice submitted, mark logged, goal milestone, check-in), "See your journey" link.

Single column, 16px gutters, 16px gap between cards, every action at least 44px tall.

### Desktop (1440px)

`PageShell width="wide"`, 12-column grid:

- Row 1: active attempt banner, full width (when present).
- Row 2: Today's focus (8 columns), AI tutor shortcut (4 columns).
- Row 3: Progress summary (8 columns), Upcoming deadlines (4 columns).
- Row 4: Next best action (4), Wellbeing nudge (4), Recent achievements (4).

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/page.tsx` | server | `PageShell`, one `Suspense` per card group, `generateMetadata` |
| Loading | `web/src/app/(app)/dashboard/loading.tsx` | server | `PageLoading cards={6}` |
| Error | `web/src/app/(app)/dashboard/error.tsx` | client | `PageError` with `retry` |
| Loader | `web/src/features/dashboard/server/get-dashboard.ts` | server | one call to BE-PRG-13, zod-validated, tag `progress:dashboard:<userId>` |
| Interim loader | `web/src/features/dashboard/server/get-dashboard-interim.ts` | server | Phase 4 to 6: BE-ACA-15 and BE-ACA-33 in parallel |
| View model | `web/src/features/dashboard/lib/to-dashboard-view.ts` | shared | maps API to card props, keeps `null` as `null` |
| Focus rule | `web/src/features/dashboard/lib/pick-todays-focus.ts` | shared | pure, SAST day boundaries |
| Greeting | `web/src/features/dashboard/components/dashboard-greeting.tsx` | server | time of day from SAST hour |
| Active attempt banner | `web/src/features/dashboard/components/active-attempt-banner.tsx` | client | countdown via `useServerClock` from `web/src/features/practice/hooks/use-server-clock.ts` |
| Today's focus | `web/src/features/dashboard/components/todays-focus-card.tsx` | server | `Card`, one `Button` link |
| Progress summary | `web/src/features/dashboard/components/progress-summary-card.tsx` | server | `components/ui/progress.tsx`, stage wording via `getStage()` (UI-33) |
| Next best action | `web/src/features/dashboard/components/next-action-card.tsx` | server | links to `/dashboard/practice?unit=..&topic=..&source=recommended` |
| Deadlines | `web/src/features/dashboard/components/deadlines-card.tsx` | server | dates via `web/src/lib/format/date.ts` |
| Wellbeing nudge | `web/src/features/dashboard/components/wellbeing-nudge-card.tsx` | server | magenta zone tokens |
| Achievements | `web/src/features/dashboard/components/achievements-card.tsx` | server | amber only for earned items |
| Tutor shortcut | `web/src/features/dashboard/components/tutor-shortcut-card.tsx` | server | compact `UpgradeGate` when no `ai-tutor` |
| Card boundary | `web/src/features/dashboard/components/card-boundary.tsx` | client | per-card error boundary with retry, reports to Sentry |
| First run | `web/src/features/dashboard/components/first-run-empty.tsx` | server | `EmptyState`, one action |
| Shared kit | `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/common/empty-state.tsx`, `components/shell/page-shell.tsx`, `components/shell/page-states.tsx`, `components/shell/page-error.tsx` | | reuse, never fork |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/progress/dashboard` (BE-PRG-13) | GET | `focus { kind, title, href, dueAt? }`; `units[] { id, name, kind, level, predictedPercent or null, averagePercent or null, trend or null, evidenceCount }`; `recommended { unitId, unitName, topicId, topicName, reason } or null`; `deadlines[] { id, title, unitName, type, dueAt, state }`; `wellbeing { checkedInToday }`; `achievements { recent[] { id, title, earnedAt }, activeDaysLast7 }`; `activeAttempt { attemptId, testId, title, deadlineAt or null, serverNow } or null` | user-scoped (see Production readiness), tag `progress:dashboard:<userId>`, revalidate 60 s |
| `/me` (BE-IDN-28) | GET | `firstName`, `educationLevel`, `entitlements[]` | via session helper (FE-24) |
| Interim: `/academics/units` (BE-ACA-15) | GET | `id`, `name`, `kind`, `level` | tag `academics:units:<userId>` |
| Interim: `/academics/assessments?from=&to=` (BE-ACA-33) | GET | `id`, `title`, `unitName`, `type`, `dueAt`, `state` | tag `academics:assessments:<userId>` |

Field names are the expected contract; the generated client is the source of truth once BE-PRG-13 ships.

Mutations: none on this page. Pages that change the underlying data (practice submit, assessment mark, wellbeing check-in) call `revalidateTag("progress:dashboard:<userId>")` on success.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | skeleton cards, screen reader text "Loading your dashboard" |
| First run | `units` is empty | title "Let's set up what you study"; body HS "Add your subjects and we'll build your dashboard around them." / uni "Add your courses and we'll build your dashboard around them."; action "Add subjects" / "Add courses" to `/dashboard/subjects` |
| Error (page) | loader throws | `PageError` defaults: "We could not load this page" / "This is on our side, not yours. Check your connection and try again in a moment." |
| Error (one card) | one card fails to render | "This card did not load." button "Try again" |
| Forbidden | non-student role reaches the route | proxy redirects by role (FE-27); fallback `PageForbidden` |
| No evidence (unit row) | `predictedPercent` and `averagePercent` null | "No marks yet" in muted text, no bar |
| No recommendation | `recommended` null | "Do a practice test and we'll suggest what to work on next." action "Go to practice" |
| No deadlines | empty list | "Nothing due in the next two weeks." action "Add an assessment" |
| No achievements | empty | "Achievements show up here as you practise and log marks." |
| Upgrade (tutor card) | no `ai-tutor` | "The AI tutor is part of Student Pro." action "See plans" |
| Populated | data present | cards as laid out |

## Stage variants

| Block | High school | University |
|---|---|---|
| Progress summary title | "Predicted results" | "Course averages" |
| Unit noun | subject | course |
| Value | predicted percent per subject plus NSC achievement level (1 to 7) when a percent exists | weighted average percent per course; no NSC level, no APS |
| Deadline types | "SBA task", "Test", "Exam" | "Assignment", "Test", "Exam" |
| First-run action | "Add subjects" | "Add courses" |

## Interactions and edge cases

- Greeting by SAST hour: 05:00 to 11:59 "Good morning", 12:00 to 16:59 "Good afternoon", otherwise "Good evening". Computed on the server in Africa/Johannesburg, so a student abroad still sees SAST until a user time-zone setting exists.
- "Today", "Tomorrow" and overdue are computed against SAST midnight, never the browser clock.
- Banner countdown corrects client clock skew with `serverNow`; at 0 it switches to "Time is up. Your test was submitted." and links to results.
- Achievements never show "streak lost" or any broken-streak state.
- A unit removed after the cache filled links to a 404 that offers "Back to subjects".
- Trend arrows only show with 2 or more evidence points.

## Copy

- Greeting: "Good morning, {firstName}"
- Focus: "Overdue: {title}", "Due today: {title}", "Due tomorrow: {title}", "Recommended: practise {topic}", "Check in: how are you feeling today?"
- Banner: "You have a test in progress", "{mm:ss} left", "Resume test"
- Achievements footer: "Active on {n} of the last 7 days"
- Tutor card: "Stuck on something? Ask the AI tutor." button "Open tutor"

## Acceptance criteria

- Given a high-school student with two subjects and a logged mark in one, when they open `/dashboard`, then the marked subject shows its predicted percent, the other shows "No marks yet", and no 0% appears anywhere.
- Given a university student, when they open `/dashboard`, then the summary title reads "Course averages" and no NSC level, APS or SBA wording renders.
- Given a student with no study units, when they open `/dashboard`, then only the first-run empty state renders with one stage-aware action.
- Given an assessment due 20 October at 08:00 SAST and a browser set to America/New_York, when the dashboard renders at 19 October 23:30 SAST (17:30 in New York), then the row shows "Tomorrow", not "Today".
- Given an active timed attempt, when the dashboard renders, then the banner shows time left within 1 second of the server deadline and "Resume test" opens `/dashboard/practice/{testId}`.
- Given the achievements card throws, when the dashboard renders, then only that card shows "This card did not load." with retry.
- Given a student without `ai-tutor`, when the dashboard renders, then the tutor card shows the plan note linking to `/dashboard/billing`.

## Production readiness

- Security: the loader sends only the session token; BE-PRG-13 scopes to the caller. No user id in the URL. User-scoped data is never cached with the shared `"use cache"` directive, because a shared cache entry would serve one student's dashboard to another; use `"use cache: private"` or an uncached read with a user-keyed tag.
- Performance: LCP element is the greeting `h1`, streamed first; cards stream inside `Suspense`. Route JS under 60 KB gzip (only banner and card boundary are client). One API round trip in Phase 7; loader p95 under 300 ms.
- Resilience: per-card error boundary so a partial failure degrades one card; loader timeout 4 s through the shared fetcher, then page error with retry. No mutations here.
- Observability: Sentry captures page and card boundary errors tagged `page:dashboard` and `card:<name>`; `traceparent` propagated loader to API (FE-07). Analytics `dashboard_viewed { stage, hasUnits }`, `dashboard_card_clicked { card }`, consent-gated (FE-63).
- Accessibility (WCAG 2.2 AA): one `h1`, each card an `h2`; trend arrows have text ("up 4 points since last week"); banner countdown announces at 5 and 1 minutes only.
- Privacy and POPIA: many students are minors; analytics carry no names, marks or mood values. The wellbeing card shows only whether the student checked in.
- Rollout: interim dashboard behind `dashboard.interim`; Phase 7 version behind `dashboard.v2`, internal accounts first, then everyone. Rollback: flip the flag, or Vercel instant rollback.
- Monitoring: Sentry alert when `page:dashboard` errors exceed 2% of sessions over 15 minutes; Grafana panel for BE-PRG-13 p95 and 5xx rate.

## Build tasks

- [ ] **PG-STU-DASH-01** Server loader `features/dashboard/server/get-dashboard.ts`: one call to BE-PRG-13, generated client, zod parse, tag `progress:dashboard:<userId>`
- [ ] **PG-STU-DASH-02** Greeting (SAST time of day, first name) and today's focus card
- [ ] **PG-STU-DASH-03** Progress summary card (high school: predicted percent and NSC level per subject; university: weighted average per course); null renders "No marks yet"
- [ ] **PG-STU-DASH-04** Next best action card (recommended drill from BE-PRA-20 via the dashboard read), deep link into the practice generate sheet
- [ ] **PG-STU-DASH-05** Upcoming deadlines card (14 days, grouped Overdue, Today, This week, Later)
- [ ] **PG-STU-DASH-06** Wellbeing nudge card (checked in today or prompt, link to wellbeing)
- [ ] **PG-STU-DASH-07** Recent achievements card with "active days in the last 7" (de-gamified: no streak-loss copy)
- [ ] **PG-STU-DASH-08** AI tutor shortcut card with compact upgrade variant
- [ ] **PG-STU-DASH-09** First-run empty state (no units yet) with one stage-aware action
- [ ] **PG-STU-DASH-10** Stage variants verified (no SBA, APS or NSC level for university; no course wording for high school)
- [ ] **PG-STU-DASH-11** View model mapper `to-dashboard-view.ts`: preserves null, computes trend visibility (2 or more evidence points)
- [ ] **PG-STU-DASH-12** Focus rule `pick-todays-focus.ts`: overdue, due today, due tomorrow, recommended drill, check-in; SAST day boundaries
- [ ] **PG-STU-DASH-13** Interim loader `get-dashboard-interim.ts` (Phase 4 to 6) from BE-ACA-15 and BE-ACA-33 behind `dashboard.interim`; cards without data are omitted, never faked
- [ ] **PG-STU-DASH-14** Active attempt banner with server-corrected countdown and "Resume test"
- [ ] **PG-STU-DASH-15** Per-card error boundary `card-boundary.tsx` with retry and Sentry tag
- [ ] **PG-STU-DASH-16** Desktop 12-column grid arrangement at `lg:` and up
- [ ] **PG-STU-DASH-17** Replace the placeholder `page.tsx` with `PageShell`, `Suspense` per card group and `generateMetadata`
- [ ] **PG-STU-DASH-18** Verify user-scoped loaders never use shared `"use cache"`; unit test asserts the user scope
- [ ] **PG-STU-DASH-19** Analytics `dashboard_viewed` and `dashboard_card_clicked` through the consent-gated tracker, no personal data in properties
- [ ] **PG-STU-DASH-20** Flags `dashboard.interim` and `dashboard.v2` in `web/src/lib/flags.ts`; rollback steps written in the PR
- [ ] **PG-STU-DASH-21** Sentry alert rule and Grafana panel for dashboard errors and BE-PRG-13 latency
- [ ] **PG-STU-DASH-22** Route JS budget (60 KB gzip) recorded in the Lighthouse CI budget file
- [ ] **PG-STU-DASH-23** Context chips under the greeting (grade and curriculum for high school, institution short name for university, plan name linking to billing), rendered only when the value exists (from 43f9faa context rail)
- [ ] **PG-STU-DASH-24** Quick actions row: check in, set a goal, start practice (from 43f9faa)
- [ ] **PG-STU-DASH-25** Active goals card from BE-PRG-04 (up to 3, progress from verified evidence only, empty copy "Set a goal you can measure, like finishing three practice tests this week.")
- [ ] **PG-STU-DASH-26** Recent activity card from BE-PRG-14 (last 5 real events, SAST relative times, empty copy "Your recent work shows up here.")
- [ ] **PG-STU-DASH-27** Weakest topics line in the progress summary (up to 2 topics with evidence, from the dashboard read), linking to the practice prefill; the 43f9faa dashboard showed predicted marks with weakest topics together

## Quality tasks

- [ ] **PG-STU-DASH-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`) *(partial: placeholder `page.tsx` exists as a Server Component; root `app/loading.tsx` and `app/error.tsx` are inherited; segment `loading.tsx` and `error.tsx` missing)*
- [ ] **PG-STU-DASH-Q02** Server loader in `src/features/dashboard/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-DASH-Q03** No client mutations here; confirm other pages revalidate `progress:dashboard:<userId>` after theirs
- [ ] **PG-STU-DASH-Q04** Empty state with one clear next action (first run)
- [ ] **PG-STU-DASH-Q05** Error state copy at page and card level: what went wrong and how to fix it
- [ ] **PG-STU-DASH-Q06** Forbidden state for non-students; upgrade state on the tutor card
- [ ] **PG-STU-DASH-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-DASH-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-STU-DASH-Q09** Layout at 1440px matches the grid above
- [ ] **PG-STU-DASH-Q10** Light and dark both correct (OS-driven); magenta, amber and terracotta zones only where specified
- [ ] **PG-STU-DASH-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-DASH-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-DASH-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-DASH-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome: populated, first run, partial failure, error
- [ ] **PG-STU-DASH-Q15** `generateMetadata` title "Dashboard"; nav entry active on exact match only *(partial: static `metadata` title "Dashboard" exists; `generateMetadata` and active-state check missing)*

## Tests

Unit (Vitest):
- `pick-todays-focus.test.ts`: "overdue beats due today", "due today uses SAST midnight", "falls back to recommended drill", "falls back to check-in", "returns null when nothing applies"
- `to-dashboard-view.test.ts`: "null predicted stays null", "trend hidden with fewer than 2 evidence points", "university units never get an NSC level"
- `dashboard-greeting.test.tsx`: "greets by SAST hour at 04:59, 05:00, 12:00 and 17:00"
- `deadlines-card.test.tsx`: "groups into Overdue, Today, This week, Later", "caps at 5 rows"

Playwright (`web/e2e/student/dashboard.spec.ts`):
- "high-school student sees predicted results and No marks yet"
- "university student sees course averages without NSC wording"
- "new student sees the first-run empty state"
- "active attempt banner resumes the test"
- "one failing card does not break the page"
- "tutor card shows the upgrade note without entitlement"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- BE-PRG-13 must include `activeAttempt` (with `serverNow`) and `wellbeing.checkedInToday`; otherwise the dashboard needs two extra reads.
- Confirm `"use cache: private"` behaviour in Next 16 docs; if unsuitable the loader stays uncached.
- Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84), no third-party flag service. `web/src/lib/format/date.ts` is FE-82.
- Decided (2): v1 stages are high school and university only; UI-33 must drop its primary stage (owner: `frontend/components/stage-gate.md`).
- BE-PRG-13 should also return `goals[]`, `recentActivity[]`, `weakestTopics[]`, the institution short name and the plan name, so PG-STU-DASH-23 to 27 stay a single read. Otherwise they need BE-PRG-04 and BE-PRG-14 reads in parallel.
- The 43f9faa dashboard sent students without an academic profile to onboarding from the page. In the rebuild that redirect belongs to `proxy.ts` (FE-27), not the page.
