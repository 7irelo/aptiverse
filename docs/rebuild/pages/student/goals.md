# Goals

| | |
|---|---|
| ID | `PG-STU-GOALS-LIST` |
| Route | `/dashboard/goals` (optional `?new=1` opens the create sheet, with optional prefill `type`, `unit`, `topic`, `target`; `?view=completed` shows completed and archived) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-PRG-02, BE-PRG-03, BE-PRG-04, BE-PRG-06, BE-PRG-11 (baseline hint), BE-ACA-15, BE-ACA-19, UI-02, UI-03, UI-05, UI-06, UI-07, UI-10, UI-22, UI-24, UI-33, FE-25, PG-ADM-DASH-13 (`web/src/lib/format/money.ts`, `web/src/lib/format/datetime.ts`) |
| Old app reference | `web/src/app/(app)/dashboard/goals/page.tsx` at 43f9faa; `api/Controllers/GoalsController.cs` (`GET /api/goals/baseline`, create rules, reorder), `api/Services/Goals/GoalEvaluator.cs` and `Goals.Domain/Models/Goals/Goal.cs` (kinds, baseline, at-risk rule, points) at 43f9faa |
| Status | Not started (backend not started; no route, loader or components exist). 1 deferred by decision 6: PG-STU-GOALS-LIST-04 |

`PG-STU-GOALS-LIST-05` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

Goals the student sets that the app can check from real work: finish N practice tests, reach a mastery level in a topic or unit, or submit N assessments. Progress moves only when the evidence arrives (BE-PRG-06). A goal whose target is at or below where the student already is gets refused, so a goal always means new work (the baseline rule, BE-PRG-03).

## User stories

- As a student, I want to set a goal tied to real work, so finishing it means something.
- As a student, I want to see my active goals with honest progress, so I know what is left.
- As a student, I want to be told clearly when a target is too low, with the number I am already at, so I can set a better one.
- As a student, I want to look back at goals I have completed.

## Layout

### Mobile (360px)

Single column, `px-4`, `gap-4`:

1. `PageHeader`: h1 "Goals", description "Goals the app can check from your real work." Primary action "New goal" (`Plus` icon) as a full-width button under the description.
2. `Tabs` (link tabs): "Active ({n})", "Completed ({n})". Archived goals sit under Completed with an "Archived" badge.
3. `GoalList`: one `GoalCard` per goal. Card: criteria icon, title, unit name, `ProgressBar` with "{current} of {target}" (counts) or "{current}% of {target}%" (mastery), deadline line ("Due 30 Nov" or "No deadline"), status badge for expired. Whole card links to `/dashboard/goals/{id}`.
4. Create sheet (`ResponsiveDialog`, bottom sheet on mobile) when "New goal" is pressed or `?new=1`.

Create sheet, top to bottom:

1. Title "New goal".
2. "What will you do?" radio cards (`RadioGroup`, each 56px): "Finish practice tests", "Reach a mastery level", "Submit assessments".
3. "Which {unit}?" `SelectField`: required for mastery, optional ("Any {unit}") for the two count types.
4. "Which topic?" `SelectField`, only for mastery, optional ("Whole {unit}").
5. "Target" number input: count types 1 to 50; mastery 1 to 100 with `%` suffix. Live hint under the field for mastery: "You're at {baseline}% now." or "No evidence yet, so any target works."
6. "Deadline" date picker (UI-13), optional, must be today or later.
7. "Title" text field, prefilled from the choices ("Reach 75% in Algebra"), editable, max 80 characters.
8. Inline error area for the baseline refusal.
9. Footer: "Cancel" (secondary), "Create goal" (primary, loading state).

### Desktop (1440px)

`PageShell`:

- Header with "New goal" button aligned right.
- Tabs under the header.
- `GoalList` as a 3-column card grid.
- Create form in a centred `Dialog` (max width 560px) instead of a sheet.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/goals/page.tsx` | server | Reads `searchParams.view`, `searchParams.new`; `generateMetadata` title "Goals" |
| Loading | `web/src/app/(app)/dashboard/goals/loading.tsx` | server | 3 card skeletons |
| Error | `web/src/app/(app)/dashboard/goals/error.tsx` | client | `PageError` with retry |
| GoalTabs | `web/src/features/goals/components/goal-tabs.tsx` | server | Link tabs with counts, `aria-current` |
| GoalList | `web/src/features/goals/components/goal-list.tsx` | server | Grid of `GoalCard` |
| GoalCard | `web/src/features/goals/components/goal-card.tsx` | server | `Card`, `Progress`, `Badge` |
| GoalProgress | `web/src/features/goals/components/goal-progress.tsx` | server | Shared with goal detail; formats counts versus percent |
| PledgeChip | `web/src/features/goals/components/pledge-chip.tsx` | server | Deferred (decision 6): not built in v1 |
| NewGoalButton | `web/src/features/goals/components/new-goal-button.tsx` | client | Opens the sheet and sets `?new=1` with `router.replace` |
| CreateGoalSheet | `web/src/features/goals/components/create-goal-sheet.tsx` | client | `ResponsiveDialog` (UI-07); react-hook-form with the generated zod schema via `useZodForm` (`web/src/components/common/form-fields.tsx`) |
| CriteriaPicker | `web/src/features/goals/components/criteria-picker.tsx` | client | Radio cards |
| BaselineHint | `web/src/features/goals/components/baseline-hint.tsx` | client | Reads mastery for the chosen unit or topic through the generated hook (BE-PRG-11 via BFF) |
| Title builder | `web/src/features/goals/lib/goal-title.ts` | shared | `defaultTitle(criteria, unitName, topicName)`; unit tested |
| Error mapping | `web/src/features/goals/lib/goal-errors.ts` | shared | Maps ProblemDetails `type` codes to field errors and copy |
| Loader | `web/src/features/goals/server/get-goals.ts` | server | `"use cache"`, tag `goals:<userId>` |
| Units loader | `web/src/features/academics/server/get-units.ts` | server | Shared with Subjects (PG-STU-UNITS) |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/progress/goals?status=active` and `?status=done` (BE-PRG-04) | GET | `items[]`: `id`, `title`, `criteria` (`type`, `target`, `unitId`, `unitName`, `topicId`, `topicName`), `baseline` (or null), `current` (int or null), `status` (`active`, `completed`, `archived`, `expired`), `deadline` (date or null), `completedAt`; `counts.active`, `counts.done` | `goals:<userId>` |
| `/academics/units` (BE-ACA-15) | GET | `id`, `name`, `kind` | `academics:units:<userId>` |
| `/academics/units/{id}/topics` (BE-ACA-19) | GET | `id`, `name` (client, when a unit is chosen for mastery) | client query cache |
| `/progress/mastery?unitId=` (BE-PRG-11) | GET | `unit.mastery`, `topics[].mastery` for the baseline hint (client) | client query cache |

Mutations:

| Endpoint (BE ID) | Method | Request | Responses | After success |
|---|---|---|---|---|
| `/progress/goals` (BE-PRG-04, BE-PRG-03) | POST via `/api/bff` | `title`, `criteria.type`, `criteria.target`, `unitId` (or null), `topicId` (or null), `deadline` (or null); header `Idempotency-Key` (UUID made when the sheet opens) | 201 goal; 400 validation; 409 `goal.target_at_or_below_baseline` with `baseline` in extensions; 409 `goal.duplicate_active` (same criteria already active); 404 unit or topic not owned | `updateTag("goals:<userId>")`, toast "Goal created", close sheet, navigate to `/dashboard/goals/{id}` |

Rules:

- `current` is null for mastery goals with no evidence; the bar shows "No evidence yet". Count goals start at 0 because they count from creation, which is a real zero. (The old app counted all submitted attempts ever, so a new "5 tests" goal could open at 3 of 5; this spec counts from creation so a goal always means new work. See open questions.)
- Baseline is computed by the server at creation and stored. The live hint is a convenience; the server is the authority.
- There is no `pledge` field in v1 (decision 6: no pledges); no chip renders.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Card skeletons; "Loading your goals" |
| No goals at all | Both counts 0 | `EmptyState`, `Flag` icon. Title "No goals yet". Body "Set a goal the app can check, like finishing 5 practice tests or reaching 70% in a topic." Button "Set your first goal" opens the sheet |
| No units | Units count 0 (sheet opened) | Sheet body replaced by "Add a {unit} first so your goal has something to measure." Button "Add {units}" to `/dashboard/subjects` |
| Active empty, completed exists | Active 0 | "No active goals. Set a new one when you're ready." Button "New goal" |
| Completed empty | Done 0 | "Completed goals will show here." No button |
| Creating | Submit pending | "Create goal" shows spinner and "Creating", disabled; fields read-only |
| Baseline refused | 409 `goal.target_at_or_below_baseline` | Error on the Target field: "You're already at {baseline}% in {topic or unit}. Set a target above {baseline}% so this goal measures new work." |
| Duplicate | 409 `goal.duplicate_active` | Form error: "You already have this goal running." Link "Open it" to the existing goal |
| Validation | 400 | Field errors from the zod schema and ProblemDetails `errors`, for example "Pick a target between 1 and 100." |
| Create failed | 5xx or network | Form error: "We couldn't save your goal. Your choices are still here, so try again." |
| Error | Loader failed | "We couldn't load your goals. Check your connection and try again." Button "Try again" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |
| Populated | Goals present | As laid out |

## Stage variants

| Element | High school | University |
|---|---|---|
| Unit field label | "Which subject?" | "Which course?" |
| "Any" option | "Any subject" | "Any course" |
| Assessments wording | "Submit assessments" (tasks, tests and projects) | "Submit assessments" (assignments, tests and projects) |
| Forbidden words | module, GPA | SBA, APS, matric, Grade |

## Interactions and edge cases

- Expired goals (deadline passed, not complete) stay under Active with an "Expired" `Badge` and the line "Deadline passed on {date}"; the student can edit the deadline on the detail page or archive.
- Sorting: active by deadline soonest first, then no-deadline by created date; completed by `completedAt` newest first.
- Changing the criteria type in the sheet resets target and topic, keeps unit, and regenerates the title only if the student has not edited it.
- Target input accepts whole numbers only; pasting "75%" is parsed to 75.
- Mastery target with no evidence (baseline null): allowed; the goal stores a null baseline and the hint says so.
- Double press on "Create goal": the button disables on first press and the `Idempotency-Key` makes a replayed request return the same goal.
- Closing the sheet with unsaved changes asks "Discard this goal?" via `ConfirmDialog`.
- `?new=1` on load opens the sheet; closing removes the parameter.
- A goal on a unit the student later removed shows "{unit} removed" and progress freezes.

## Copy

- h1: "Goals"
- Description: "Goals the app can check from your real work."
- Primary action: "New goal"
- Criteria labels: "Finish practice tests", "Reach a mastery level", "Submit assessments"
- Default titles: "Finish {n} practice tests", "Finish {n} practice tests in {unit}", "Reach {n}% in {topic}", "Reach {n}% in {unit}", "Submit {n} assessments in {unit}"
- Baseline hint: "You're at {baseline}% now." / "No evidence yet, so any target works."
- Toast: "Goal created"

## Acceptance criteria

1. Given a student at 64% mastery in Algebra, when they create "Reach a mastery level" in Algebra with target 60, then the API returns 409 and the Target field shows "You're already at 64% in Algebra. Set a target above 64% so this goal measures new work."
2. Given the same student enters 75, when they submit, then a goal is created, a "Goal created" toast shows and they land on the goal detail page.
3. Given a mastery goal on a topic with no answers, when it renders in the list, then its progress shows "No evidence yet" and not "0%".
4. Given a count goal created today, when it renders, then progress shows "0 of 5 practice tests".
5. Given the student double-taps "Create goal", when requests complete, then exactly one goal exists.
6. Given any goal, when it renders, then no pledge chip, points or reward element exists (decision 6).
7. Removed: covered by 6.
8. Given no units, when the student opens the sheet, then it shows the "Add a subject first" message instead of the form.
9. Given 360px, when the sheet is open, then it is a bottom sheet with no horizontal scroll and the footer buttons stay visible above the keyboard.
10. Given a university student, when the sheet renders, then labels say "course" and no school wording appears.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | POST goes through the BFF (no token in the browser; CSRF covered by same-origin BFF with the session cookie `SameSite=Lax` and an `Origin` check); API checks unit and topic ownership and returns 404 for others | PG-STU-GOALS-LIST-Q16 |
| Security | Baseline computed only on the server from the caller's own mastery; client never sends a baseline | PG-STU-GOALS-LIST-Q17 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; the create sheet (form, date picker) is code-split and loaded on first open | PG-STU-GOALS-LIST-Q18 |
| Resilience | Idempotent create (`Idempotency-Key`); button disabled while pending; form state kept on failure; topic and baseline lookups failing do not block submit (hint shows "We couldn't check your current level") | PG-STU-GOALS-LIST-Q19 |
| Observability | Sentry route tag; events `goal_create_opened`, `goal_created` (props: `criteria_type`, `has_deadline`), `goal_baseline_refused` (props: `criteria_type`); trace propagation through the BFF | PG-STU-GOALS-LIST-Q20 |
| Accessibility | WCAG 2.2 AA; radio cards are a real `radiogroup`; errors linked with `aria-describedby` and announced; focus returns to "New goal" on close | PG-STU-GOALS-LIST-Q21 |
| Privacy and POPIA | No unit names in analytics props; goal titles are free text and never logged | PG-STU-GOALS-LIST-Q22 |
| Rollout | Flag `goals`; rollback by flag | PG-STU-GOALS-LIST-Q23 |
| Monitoring | Grafana "BE-PRG-04 POST success rate and 409 rate"; alert when POST 5xx over 2% for 10 minutes; dashboard panel for goal progress handler lag (event to `current` updated) | PG-STU-GOALS-LIST-Q24 |

## Build tasks

- [ ] **PG-STU-GOALS-LIST-01** Active and completed lists with progress: `GoalTabs`, `GoalList`, `GoalCard`, `GoalProgress`
- [ ] **PG-STU-GOALS-LIST-02** Create goal sheet: criteria type, target, linked unit (`CreateGoalSheet` shell, `CriteriaPicker`, unit field)
- [ ] **PG-STU-GOALS-LIST-03** Baseline refusal message: map 409 `goal.target_at_or_below_baseline` to the Target field error
- [ ] **PG-STU-GOALS-LIST-04** Parent pledge indicator: `PledgeChip` behind `goal-pledges` *(deferred: decision 6, not in v1)*
- [ ] **PG-STU-GOALS-LIST-06** Loader `get-goals.ts` for both tabs with counts, zod-validated, cached with user tag
- [ ] **PG-STU-GOALS-LIST-07** Topic field for mastery goals (BE-ACA-19 via generated hook)
- [ ] **PG-STU-GOALS-LIST-08** Target and deadline fields with validation from the generated zod schema
- [ ] **PG-STU-GOALS-LIST-09** `BaselineHint` live hint for mastery goals
- [ ] **PG-STU-GOALS-LIST-10** `goal-title.ts` default title builder and "edited" tracking
- [ ] **PG-STU-GOALS-LIST-11** Create mutation through the BFF with `Idempotency-Key`, pending state, toast and redirect
- [ ] **PG-STU-GOALS-LIST-12** `goal-errors.ts`: duplicate, validation and failure mapping
- [ ] **PG-STU-GOALS-LIST-13** Empty states (no goals, no units, empty tabs)
- [ ] **PG-STU-GOALS-LIST-14** Expired badge and sort rules
- [ ] **PG-STU-GOALS-LIST-15** `?new=1` deep link and discard confirmation
- [ ] **PG-STU-GOALS-LIST-16** Stage variants for labels
- [ ] **PG-STU-GOALS-LIST-17** Prefill the create sheet from query parameters (`type`, `unit`, `topic`, `target`) for deep links from Careers and Mastery; invalid or unowned values are ignored
- [ ] **PG-STU-GOALS-LIST-18** "Beat your practice score" criteria type (old `practice_score`: best score on a submitted practice test, optionally scoped to a unit), with its baseline hint; needs BE-PRG-02 to add the type
- [ ] **PG-STU-GOALS-LIST-19** "Reach a mark in an assessment" criteria type (old `assessment_mark`: best logged mark) shown with the note "You type this mark in yourself, so it's tracked from what you enter"; needs BE-PRG-02 to add the type
- [ ] **PG-STU-GOALS-LIST-20** Baseline lookup before submit through a dedicated endpoint (old `GET /api/goals/baseline?kind&unit&topic&target` returning `baseline`, `minimumTarget`; the old `rewarded` flag is dropped, decision 6): debounced 400ms, failure stays silent and never blocks the form; replaces the BE-PRG-11 read in `BaselineHint`
- [ ] **PG-STU-GOALS-LIST-21** At-risk status: badge "At risk" (terracotta, with text) from the server status, using the old rule (inside the last 7 days, progress below 100 minus days left over 7 times 40; past due counts); at-risk goals sort first within Active
- [ ] **PG-STU-GOALS-LIST-22** Status wording: "Verified" (checked by the app) for completed measurable goals; there is no self-marked "completed" in v1 because custom goals are not carried over
- [ ] **PG-STU-GOALS-LIST-23** Link a goal to an upcoming assessment (old `AssessmentId`): optional "Preparing for" select of the student's scheduled assessments in the chosen unit; card line "For your {assessment} on {date}"
- [ ] **PG-STU-GOALS-LIST-24** Reorder active goals (old drag-to-rank, `PATCH /api/goals/reorder`): "Reorder" mode with up and down buttons per card (no drag-only control), optimistic order with revert and toast "Couldn't save the order" on failure; needs a BE-PRG-04 reorder slice
- [ ] **PG-STU-GOALS-LIST-25** Goal achieved notification (old evaluator enqueued "Goal achieved: {title}"): deep link to the goal detail page; consumes BE-NTF-10

## Quality tasks

- [ ] **PG-STU-GOALS-LIST-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-GOALS-LIST-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-GOALS-LIST-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-GOALS-LIST-Q04** Empty state with one clear next action
- [ ] **PG-STU-GOALS-LIST-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-GOALS-LIST-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-GOALS-LIST-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-STU-GOALS-LIST-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-GOALS-LIST-Q09** Layout at 1440px
- [ ] **PG-STU-GOALS-LIST-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-GOALS-LIST-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-GOALS-LIST-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-GOALS-LIST-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-GOALS-LIST-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-GOALS-LIST-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-GOALS-LIST-Q16** Integration tests with BE-PRG-04: another student's unit id returns 404; BFF rejects a cross-origin POST
- [ ] **PG-STU-GOALS-LIST-Q17** Contract check: the generated request type has no baseline field, and no request or response type has pledge or points fields
- [ ] **PG-STU-GOALS-LIST-Q18** Lighthouse CI mobile budget; sheet chunk loads on first open only
- [ ] **PG-STU-GOALS-LIST-Q19** Double-submit and replay test (one goal created); failure keeps form state
- [ ] **PG-STU-GOALS-LIST-Q20** Sentry tag and the three named events
- [ ] **PG-STU-GOALS-LIST-Q21** Screen reader and keyboard pass on the sheet (radio group, error announcement, focus return)
- [ ] **PG-STU-GOALS-LIST-Q22** Log and analytics review: no goal titles, amounts or unit names
- [ ] **PG-STU-GOALS-LIST-Q23** `goals` flag wired; rollback drill
- [ ] **PG-STU-GOALS-LIST-Q24** Grafana panels and alerts for goal create and progress handler lag

## Tests

Unit (Vitest):

- `goal-title.test.ts`: "builds count title with unit", "builds mastery title with topic", "keeps an edited title when criteria change".
- `goal-errors.test.ts`: "maps baseline 409 to the target field with the baseline value", "maps duplicate 409 to a form error with a link".
- `goal-progress.test.tsx`: "mastery with null current reads No evidence yet", "count goal shows 0 of 5".
- `create-goal-sheet.test.tsx`: "topic field shows only for mastery", "submit disabled while pending".

Playwright (`web/e2e/student/goals.spec.ts`):

- "goals: list shows active goals with real progress"
- "goals: create a practice test goal and land on detail"
- "goals: baseline refusal shows the current level"
- "goals: double tap creates one goal"
- "goals: no goals shows the first goal empty state"
- "goals: no units blocks the sheet with add units"
- "goals: no pledge or points element renders"
- "goals: axe clean light and dark at 360 and 1440, sheet open and closed"

## Open questions

- Decided (21): the baseline rule applies to every goal, not only the old rewarded kinds. Count goals have no baseline either way.
- `Idempotency-Key` and `goal.duplicate_active` are not yet in BE-PRG-04; add them to the slice.
- Decided (20): wellbeing and habit goals are not in v1.
- Obsolete: no pledge data in v1 (decision 6).
- Decided (20): `custom`, check-in streak and practice streak goals are dropped.
- Decided (20): count goals count from goal creation.
- Decided (6): neither pledges nor points in v1; PG-STU-GOALS-LIST-04 is deferred.
- The old evaluator recomputed goals on every read as a safety net on top of event hooks. Recommend BE-PRG-06 keeps a read-time or scheduled reconcile so a missed event never leaves a goal stale.
