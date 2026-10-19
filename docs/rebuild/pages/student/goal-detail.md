# Goal detail

| | |
|---|---|
| ID | `PG-STU-GOALS-DETAIL` |
| Route | `/dashboard/goals/[id]` (optional `?edit=1` opens the edit sheet) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-PRG-03, BE-PRG-04, BE-PRG-05, BE-PRG-06, BE-PRG-15, UI-04, UI-05, UI-07, UI-10, UI-13, UI-24, UI-25, UI-27, UI-33, FE-25, PG-STU-GOALS-LIST (shared `GoalProgress`, `goal-errors.ts`), PG-ADM-DASH-13 (`web/src/lib/format/money.ts`, `web/src/lib/format/datetime.ts`) |
| Old app reference | `web/src/app/(app)/dashboard/goals/[id]/page.tsx` at 43f9faa (milestones with ordering, target stat card, due chip); `GoalMilestone.cs`, `GET /api/goals/{id}/milestones` and `PATCH .../milestones/order` at 43f9faa |
| Status | Not started (backend not started; no route, loader or components exist). 1 deferred by decision 6: PG-STU-GOALS-DETAIL-11 |

`PG-STU-GOALS-DETAIL-04` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

One goal in full: what it asks for, where the student started (baseline), where they are now, and the list of real records that moved it (practice attempts, assessments). The student can edit what is safe to edit, archive the goal, and, when it is complete, see a calm completion banner in the amber achievement zone.

## User stories

- As a student, I want to see exactly which practice tests or assessments counted toward my goal, so I trust the number.
- As a student, I want to see where I started and where I am now, so I can see the change.
- As a student, I want to change the deadline or title, or raise the target, without losing my progress.
- As a student, I want to archive a goal I no longer care about.
- As a student, I want a clear, calm sign when I complete a goal.

## Layout

### Mobile (360px)

Single column, `px-4`, `gap-6`:

1. Back link "All goals" (`min-h-11`).
2. `CompletionBanner` (only when completed): amber surface, `FlagTriangleRight` icon, "Goal complete", "You finished this on {date}." No animation.
3. `PageHeader`: h1 goal title; description is the criteria sentence ("Reach 75% in Algebra (Mathematics)"). Actions in a `DropdownMenu` (`MoreVertical` trigger, 44px): "Edit goal", "Archive goal" (or "Restore goal" when archived).
4. `GoalSummaryCard`: `ProgressRing` (72px) with current value, "Started at {baseline}" and "Target {target}", deadline line, status badge.
5. (Removed: `PledgeCard` is deferred with decision 6; no pledge block in v1.)
6. `GoalTrendCard` (mastery goals only, with at least 2 points): text summary first, then area chart of the goal's measured value since creation with a dashed target line (height 160px).
7. `EvidenceList`: h2 "What counted" with rows newest first. Row: icon (practice or assessment), record title, unit, date, contribution ("+1 test", "Mastery now 71%"), link to the record.
8. Edit sheet (`ResponsiveDialog`) and archive `ConfirmDialog` as overlays.

### Desktop (1440px)

`PageShell`, 12 columns:

- Back link and header full width, actions as visible buttons ("Edit goal", "Archive goal") instead of the menu.
- Left column (5 of 12): `CompletionBanner`, `GoalSummaryCard`.
- Right column (7 of 12): `GoalTrendCard` (summary 1/3, chart 2/3, height 220px) then `EvidenceList` as a `DataTable` (Record, Unit, Date, Contribution).

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/goals/[id]/page.tsx` | server | `generateMetadata` title from goal title ("Goal: {title}" is not used; title alone) |
| Loading | `web/src/app/(app)/dashboard/goals/[id]/loading.tsx` | server | Summary and list skeletons |
| Error | `web/src/app/(app)/dashboard/goals/[id]/error.tsx` | client | `PageError` with retry |
| Not found | `web/src/app/(app)/dashboard/goals/[id]/not-found.tsx` | server | Unknown or other user's goal |
| CompletionBanner | `web/src/features/goals/components/completion-banner.tsx` | server | `bg-achievement text-achievement-foreground`; amber only here on this page |
| GoalSummaryCard | `web/src/features/goals/components/goal-summary-card.tsx` | server | `ProgressRing`, `GoalProgress` |
| PledgeCard | `web/src/features/goals/components/pledge-card.tsx` | server | Deferred (decision 6): not built in v1 |
| GoalTrendCard | `web/src/features/goals/components/goal-trend-card.tsx` | server | Text summary plus lazy `GoalTrendChart` |
| GoalTrendChart | `web/src/features/goals/components/goal-trend-chart.tsx` | client | UI-27 `AreaChart` with a reference line at the target |
| EvidenceList | `web/src/features/goals/components/evidence-list.tsx` | server | `DataTable` with mobile card fallback |
| GoalActions | `web/src/features/goals/components/goal-actions.tsx` | client | `DropdownMenu` on mobile, buttons on desktop |
| EditGoalSheet | `web/src/features/goals/components/edit-goal-sheet.tsx` | client | `ResponsiveDialog`, `useZodForm` with the generated PATCH schema |
| ArchiveGoalDialog | `web/src/features/goals/components/archive-goal-dialog.tsx` | client | `ConfirmDialog` (`web/src/components/common/confirm-dialog.tsx`) |
| Evidence registry | `web/src/features/goals/lib/evidence.ts` | shared | Evidence kind to icon, label and href; unit tested |
| Loader | `web/src/features/goals/server/get-goal.ts` | server | `"use cache"`, tag `goals:<userId>:<goalId>` and `goals:<userId>` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/progress/goals/{id}` (BE-PRG-05) | GET | `id`, `title`, `criteria` (`type`, `target`, `unitId`, `unitName`, `topicId`, `topicName`), `baseline`, `current`, `status`, `deadline`, `createdAt`, `completedAt`, `archivedAt`, `editable` (`{ title, deadline, target }` booleans), `trend[]` (`at`, `value`), `evidence[]` (`id`, `kind`: `practice_attempt` or `assessment`, `recordId`, `title`, `unitName`, `occurredAt`, `contribution`: `{ countDelta }` or `{ masteryAfter }`, `available` boolean) | `goals:<userId>:<goalId>` |

Mutations:

| Endpoint (BE ID) | Method | Request | Responses | After success |
|---|---|---|---|---|
| `/progress/goals/{id}` (BE-PRG-04) | PATCH via `/api/bff` | Any of `title`, `deadline`, `target`; header `If-Match` with the goal's version (xmin) | 200 goal; 400 validation; 409 `goal.target_at_or_below_baseline`; 409 `goal.locked` (completed goals cannot change target); 412 version mismatch | `updateTag` both tags; toast "Goal updated"; close sheet |
| `/progress/goals/{id}` (BE-PRG-04) | DELETE via `/api/bff` (archives, soft delete) | none | 204 | `updateTag`; toast "Goal archived" with an "Undo" action for 10 seconds; stay on page in archived state |
| `/progress/goals/{id}` (BE-PRG-04) | PATCH `{ status: "active" }` via `/api/bff` (restore and undo) | `status` | 200; 409 `goal.duplicate_active` | `updateTag`; toast "Goal restored" |

Rules:

- `editable.target` is false when the goal is completed; the target field is then read-only with the reason.
- Target can only be raised above the stored baseline; lowering below it is refused by BE-PRG-03.
- Criteria type, unit and topic cannot be changed after creation (the evidence would stop matching). The edit sheet shows them as read-only text.
- Evidence rows whose source was deleted have `available: false` and render without a link.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Skeletons; "Loading this goal" |
| No evidence yet | `evidence` empty | "Nothing has counted yet. {next action}." Next action by type: "Finish a practice test in {unit}" with button "Start practising"; "Practise {topic}" for mastery; "Submit an assessment in {unit}" with button "Go to assessments" |
| No evidence for mastery value | `current` null | Ring shows "No evidence yet"; summary "Started with no evidence. Practise {topic} to get your first number." |
| Trend too short | Fewer than 2 points | No chart; "Your trend appears after your second practice in {topic}." |
| Completed | `status` completed | `CompletionBanner`; edit limited to title; archive still allowed |
| Archived | `status` archived | Muted header badge "Archived"; banner "This goal is archived and no longer tracks new work." Button "Restore goal" |
| Expired | `status` expired | Badge "Expired"; line "The deadline passed on {date}. Change the deadline to keep going, or archive it." Buttons "Change deadline", "Archive goal" |
| Saving | PATCH pending | Sheet submit shows "Saving", disabled |
| Version conflict | 412 | Sheet error: "This goal changed somewhere else. We've loaded the latest version; check it and save again." Form resets to fresh data |
| Locked target | 409 `goal.locked` | Field note: "The target is fixed because you have completed this goal." |
| Baseline refused | 409 baseline | Same copy as the list page |
| Error | Loader failed | "We couldn't load this goal. Check your connection and try again." Button "Try again" |
| Not found | 404 | "We couldn't find that goal. It may have been removed." Link "See all goals" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |

## Stage variants

| Element | High school | University |
|---|---|---|
| Criteria sentence unit | "(Mathematics)" subject name | "(MAM1000W Mathematics)" course name as the student entered it |
| Evidence assessment label | "Assessment" (task, test, project) | "Assessment" (assignment, test, project) |
| Forbidden words | module, GPA | SBA, APS, matric, Grade |

## Interactions and edge cases

- Completion is set by the server when evidence crosses the target; the page never marks a goal complete.
- The banner shows every time the completed goal is opened; there is no one-off celebration overlay and no confetti. `prefers-reduced-motion` is irrelevant because nothing moves.
- Undo after archive restores the goal; if the 10 seconds pass, the "Restore goal" button remains on the page.
- Raising the target on an active count goal keeps existing evidence; the ring recalculates.
- Deadline in the past is rejected client-side ("Pick today or a later date.") and server-side.
- Evidence list longer than 20 rows: "Show all {n}" expands in place.
- Opening a goal id that belongs to another student returns 404 from the API and renders not-found (never 403, so ids cannot be probed).

## Copy

- Back link: "All goals"
- Completion banner: "Goal complete" / "You finished this on {date}."
- Summary: "Started at {baseline}" / "Target {target}"
- Evidence heading: "What counted"
- Contributions: "+1 test", "+1 assessment", "Mastery now {n}%"
- Archive dialog: title "Archive this goal?", body "It stops tracking new work. You can restore it later.", confirm "Archive goal", cancel "Keep it"
- Toasts: "Goal updated", "Goal archived" (action "Undo"), "Goal restored"

## Acceptance criteria

1. Given an active count goal with 3 evidence rows, when the page loads, then "What counted" lists 3 rows newest first, each linking to its practice result or assessment.
2. Given a completed goal, when the page loads, then the amber banner reads "Goal complete" with the completion date and no animation runs.
3. Given a mastery goal with baseline 64 and the student edits the target to 60, when they save, then the field shows the baseline refusal message and nothing changes.
4. Given a completed goal, when the edit sheet opens, then the target field is read-only with "The target is fixed because you have completed this goal."
5. Given the goal changed in another tab, when the student saves, then the 412 copy shows and the form reloads the latest values.
6. Given the student archives a goal, when they press "Undo" within 10 seconds, then the goal returns to active.
7. Given a goal id belonging to another student, when it is requested, then the not-found state renders.
8. Given an evidence row whose assessment was deleted, when it renders, then it has no link and says "No longer available".
9. Given a mastery goal with 1 trend point, when it renders, then no chart shows and the trend message appears.
10. Given 360px, when actions are opened, then the menu items are at least 44px tall and keyboard reachable.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-PRG-05 and PATCH and DELETE enforce ownership server-side and return 404 for other users' ids; mutations only through the BFF with the `Origin` check | PG-STU-GOALS-DETAIL-Q16 |
| Security | Server refuses target changes on completed goals regardless of what the UI sends | PG-STU-GOALS-DETAIL-Q17 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; chart and edit sheet are lazy chunks | PG-STU-GOALS-DETAIL-Q18 |
| Resilience | Optimistic concurrency with `If-Match` and the 412 flow; archive and restore buttons disabled while pending; undo is a real request, not a client trick | PG-STU-GOALS-DETAIL-Q19 |
| Observability | Sentry route tag (id stripped: `route=/dashboard/goals/[id]`); events `goal_edited` (props: `fields_changed`), `goal_archived`, `goal_restored`, `goal_completed_viewed`; trace propagation | PG-STU-GOALS-DETAIL-Q20 |
| Accessibility | WCAG 2.2 AA; ring has text equivalent; chart has summary and data table; toasts with actions are reachable by keyboard and stay at least 10 seconds | PG-STU-GOALS-DETAIL-Q21 |
| Privacy and POPIA | Goal ids in URLs are Guid v7 (not PII); titles and evidence titles never sent to analytics or logs | PG-STU-GOALS-DETAIL-Q22 |
| Rollout | Flag `goals`; rollback by flag | PG-STU-GOALS-DETAIL-Q23 |
| Monitoring | Grafana "BE-PRG-05 p95 and 5xx", "PATCH 412 rate" (a spike means a concurrency bug); alert on 5xx over 2% for 10 minutes | PG-STU-GOALS-DETAIL-Q24 |

## Build tasks

- [ ] **PG-STU-GOALS-DETAIL-01** Progress and evidence list (links to attempts and assessments): `GoalSummaryCard` and `EvidenceList`
- [ ] **PG-STU-GOALS-DETAIL-02** Edit, archive: `GoalActions` entry points (sheet and dialog wiring)
- [ ] **PG-STU-GOALS-DETAIL-03** Completion celebration (achievement zone): `CompletionBanner`, static, amber only
- [ ] **PG-STU-GOALS-DETAIL-05** Loader `get-goal.ts`, zod-validated, cached with goal and list tags; `not-found.tsx`
- [ ] **PG-STU-GOALS-DETAIL-06** `evidence.ts` registry and unavailable-source rows
- [ ] **PG-STU-GOALS-DETAIL-07** `EditGoalSheet`: title, deadline, target with read-only criteria and lock reasons
- [ ] **PG-STU-GOALS-DETAIL-08** PATCH through the BFF with `If-Match`, 412 reload flow and baseline refusal mapping
- [ ] **PG-STU-GOALS-DETAIL-09** `ArchiveGoalDialog`, DELETE through the BFF, undo toast and restore
- [ ] **PG-STU-GOALS-DETAIL-10** `GoalTrendChart` area chart with target line, lazy-loaded, and trend summary
- [ ] **PG-STU-GOALS-DETAIL-11** `PledgeCard` with pledged and paid states *(deferred: decision 6, not in v1)*
- [ ] **PG-STU-GOALS-DETAIL-12** Expired and archived states with their actions
- [ ] **PG-STU-GOALS-DETAIL-13** No-evidence state with the per-type next action
- [ ] **PG-STU-GOALS-DETAIL-14** Desktop two-column layout and visible action buttons
- [ ] **PG-STU-GOALS-DETAIL-15** Milestones section (BE-PRG-02 has a `milestones` table): 3 to 5 steps with title and done state, empty copy "Break this goal into 3 to 5 steps so progress feels real on the way."; milestones are the student's own checklist and never move the verified progress
- [ ] **PG-STU-GOALS-DETAIL-16** Add, rename, tick and remove a milestone through the BFF, each with a pending state; remove is an icon button with `aria-label="Remove milestone"`
- [ ] **PG-STU-GOALS-DETAIL-17** Reorder milestones with up and down buttons (old drag order, `PATCH .../milestones/order`), optimistic with revert and toast on failure
- [ ] **PG-STU-GOALS-DETAIL-18** Linked assessment line when the goal is preparing for one: "For your {assessment} on {date}" linking to the assessment
- [ ] **PG-STU-GOALS-DETAIL-19** At-risk banner (terracotta, text first): "{days} days left and {progress}% done. A practice test in {unit} today would help." with a practice link

## Quality tasks

- [ ] **PG-STU-GOALS-DETAIL-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-GOALS-DETAIL-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-GOALS-DETAIL-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-GOALS-DETAIL-Q04** Empty state with one clear next action
- [ ] **PG-STU-GOALS-DETAIL-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-GOALS-DETAIL-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-GOALS-DETAIL-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-STU-GOALS-DETAIL-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-GOALS-DETAIL-Q09** Layout at 1440px
- [ ] **PG-STU-GOALS-DETAIL-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-GOALS-DETAIL-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-GOALS-DETAIL-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-GOALS-DETAIL-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-GOALS-DETAIL-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-GOALS-DETAIL-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-GOALS-DETAIL-Q16** Integration tests: GET, PATCH and DELETE on another student's goal return 404
- [ ] **PG-STU-GOALS-DETAIL-Q17** Integration tests: target change on a completed goal refused server-side
- [ ] **PG-STU-GOALS-DETAIL-Q18** Lighthouse CI mobile budget; chart and sheet chunks lazy
- [ ] **PG-STU-GOALS-DETAIL-Q19** Playwright: concurrent edit gives the 412 flow; double-press archive sends one request
- [ ] **PG-STU-GOALS-DETAIL-Q20** Sentry route tag without the id and the four named events
- [ ] **PG-STU-GOALS-DETAIL-Q21** Screen reader pass on ring, chart summary and undo toast
- [ ] **PG-STU-GOALS-DETAIL-Q22** Log and analytics review for titles and evidence names
- [ ] **PG-STU-GOALS-DETAIL-Q23** Flag `goals` checked on this route
- [ ] **PG-STU-GOALS-DETAIL-Q24** Grafana panels and alerts for BE-PRG-05 and PATCH 412 rate

## Tests

Unit (Vitest):

- `evidence.test.ts`: "practice evidence links to the results view", "unavailable evidence has no href".
- `edit-goal-sheet.test.tsx`: "criteria are read-only", "target is read-only when completed with the reason", "past deadline is rejected".
- `completion-banner.test.tsx`: "uses the achievement token and has no animation classes".

Playwright (`web/e2e/student/goal-detail.spec.ts`):

- "goal detail: evidence rows link to their records"
- "goal detail: completed goal shows the amber banner"
- "goal detail: lowering target below baseline is refused"
- "goal detail: version conflict reloads and asks to save again"
- "goal detail: archive and undo"
- "goal detail: another student's goal shows not found"
- "goal detail: axe clean light and dark at 360 and 1440"

## Open questions

- `If-Match` with `xmin` and the error code `goal.locked` are not yet in BE-PRG-04 and BE-PRG-05; add them to the slices (`goal.has_paid_pledge` is deferred with decision 6).
- Should a completed goal notify the student (BE-NTF-10) and the linked parent (celebrations)? Assumed yes for the parent through Family, scoped by privacy settings.
- Obsolete: no pledges in v1 (decision 6).
- Milestone endpoints are not listed as slices in BE-PRG-04 or BE-PRG-05; add them.
- Decided (6): milestones carry no points; there are no points in v1.
