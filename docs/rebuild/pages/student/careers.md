# Career and university planner

| | |
|---|---|
| ID | `PG-STU-CAREER` |
| Route | `/dashboard/careers` (optional `?target=<id>` opens one plan; `?new=1` opens the add dialog) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free (free for everyone, per the plan) |
| Depends on | BE-CAR-01, BE-CAR-02, BE-CAR-03, BE-CAR-04, BE-CAR-05, BE-CAR-06, BE-ACA-06, BE-ACA-15, FE-60, UI-02, UI-03, UI-05, UI-07, UI-09, UI-10, UI-13, UI-22, UI-25, UI-33, FE-25, PG-STU-GOALS-LIST (create sheet prefill) |
| Old app reference | At 43f9faa: `web/src/app/(app)/dashboard/career/page.tsx` (triaged plans, subject-choice warning, what-if across all plans), `career/targets/[id]/page.tsx` (verdict, weakest topics per gap, bulk goal generation), `web/src/lib/targets/reach.ts`, `web/src/lib/api/targets.ts`, `web/src/components/career/TargetDialog.tsx`, `WhatIfPanel.tsx`, `ReachChip.tsx`, `api/Controllers/AdmissionTargetsController.cs`, `AcademicPlanning/AdmissionTarget.cs`. The "87% match" page at f223ca7 was fake and is not a reference |
| Status | Not started (backend not started; FE-60 reach engine not ported yet) |

`PG-STU-CAREER-08` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

The student writes down the plans they are aiming for (an institution, a programme and the minimums they researched), and the page shows how far their real marks are from each plan. Every number is either something the student entered (the requirement) or something measured from their own work (the standing). Nothing is predicted, scored or guessed. Where there is no evidence, the page says "No marks yet". High-school students plan admission to a first degree or diploma; university students plan progression (next year, honours, masters, PhD). A what-if panel lets them try numbers without saving anything.

## User stories

- As a Grade 11 student, I want to add the programmes I am applying for with the minimums from the prospectus, so I can see which ones I am on track for.
- As a student with several plans, I want them sorted from closest to furthest, so five worries become one clear list.
- As a student, I want each requirement to show my current mark and the gap, so I know which subject to work on.
- As a student taking Mathematical Literacy, I want to be told plainly if a plan needs Mathematics, while there is still time to act.
- As a student, I want to try "what if I get 65 in Physical Sciences" without changing my real record.
- As a high-school student, I want to see an APS estimate from my marks, clearly labelled as an estimate.
- As a university student, I want to plan honours or masters entry against my course marks, with no school wording.
- As a student, I want to turn a gap into a goal in one step.

## Layout

### Mobile (360px)

List view (no `?target`), single column, `px-4`, `gap-4`:

1. `PageHeader`: h1 "Careers", description HS: "Plans for after school, checked against your real marks." Uni: "Plans for your next step, checked against your real marks." Primary action "Add a plan" (full width).
2. `ApsPanel` (HS only, collapsed card): "Your APS estimate: {n}" or "APS estimate: needs marks in {k} more subjects", with "How this is worked out" link opening a `Sheet`.
3. `TargetList`: triaged `TargetCard`s, closest first. Card: institution (bold), programme, stage chip for uni ("Honours"), `ReachChip` ("On track", "4 short", "Subject missing", "No marks yet", "Add subject minimums"), deadline countdown ("Applications close in 23 days") when set. Whole card is a link to `?target=<id>`.
4. Archived plans collapsed under "Archived ({n})" disclosure.

Plan view (`?target=<id>`), replaces the list:

1. Back link "All plans".
2. h2 institution and programme; `ReachChip`; source note in muted text ("From: UCT prospectus 2027, p.14"); actions menu (`MoreVertical`): "Edit plan", "Archive plan".
3. `SubjectChoiceAlert` (only for `substituted` or `not_enrolled`): terracotta warning card with the copy in the Copy section.
4. `RequirementList`: one row per requirement: unit name, "Needs {min}%", standing ("Your mark {n}%" with source label "from marks" or "from practice"), status chip, gap ("{n} short"). Rows for short requirements have "Make this a goal" (44px).
5. `OverallRow`: "Overall average needed {n}%, yours {m}% from {k} {units}" or for APS "APS needed {n}, your estimate {m}".
6. `WhatIfPanel`: collapsed disclosure "Try different marks". Opened: one slider plus number input per required enrolled unit (0 to 100), a "What if" badge on every changed standing in the list above, "Reset" button. Copy under the title: "Pretend numbers. Nothing here is saved."

### Desktop (1440px)

`PageShell`, 12 columns, master and detail:

- Left (5 of 12): header with "Add a plan", `ApsPanel` (HS), `TargetList` with the selected plan highlighted (`aria-current="true"`).
- Right (7 of 12): plan view for the selected plan (first in triage order when no `?target`). `RequirementList` becomes a `DataTable` (Subject or Course, Needs, Your mark, Source, Status, Gap, action). `WhatIfPanel` open by default beside the table on widths over 1280px (table 4 of 7, panel 3 of 7).

Add and edit dialog (`ResponsiveDialog`): bottom sheet on mobile, centred dialog (max 640px) on desktop. Fields top to bottom:

1. HS: no kind choice (admission). Uni: "Progressing to" select: "Next year of my degree", "Honours", "Masters", "PhD".
2. "Career (optional)": combobox searching the careers list (BE-CAR-05); picking one fills a suggested programme only if the programme is empty.
3. "Institution" text (required, max 120), placeholder "University of Cape Town".
4. "Programme" text (required, max 120), placeholder HS "BSc Computer Science", uni "MSc Applied Mathematics".
5. "Overall requirement (optional)": "Measured as" select (HS: "APS" or "Average"; uni: "Average" only) and "They require" number (APS 1 to 60, average 1 to 100).
6. "Subject minimums" (HS) or "Course minimums" (uni): repeatable rows of unit select plus "Min %" (1 to 100) and a remove button (`aria-label="Remove this minimum"`); "Add a minimum" button. HS unit options come from the CAPS catalog for the student's curriculum (including subjects they do not take); uni options are the student's own courses.
7. "Application deadline (optional)" date.
8. "Where you found this (optional)" text, max 200, placeholder "UCT prospectus 2027, p.14", hint "Requirements change. Future you will want the source."
9. Footer "Cancel", "Save plan".

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/careers/page.tsx` | server | Reads `searchParams.target`, `searchParams.new`; `generateMetadata` title "Careers" or "{programme}, {institution}" |
| Loading | `web/src/app/(app)/dashboard/careers/loading.tsx` | server | List and detail skeletons |
| Error | `web/src/app/(app)/dashboard/careers/error.tsx` | client | `PageError` with retry |
| Not found | `web/src/app/(app)/dashboard/careers/not-found.tsx` | server | Unknown or other user's `?target` |
| Reach engine | `web/src/features/career/lib/reach.ts` | shared | FE-60 port: `reachFor`, `triage`, `reachLabel`, `goalCandidates`, `nameForUnit`, `stageLabel`; pure, unit tested |
| APS display helpers | `web/src/features/career/lib/aps.ts` | shared | Formatting only; the calculation is BE-CAR-06 |
| Careers view | `web/src/features/career/components/careers-view.tsx` | client | Holds what-if overrides state and runs `reachFor` on server-provided data; renders list and plan view |
| TargetList | `web/src/features/career/components/target-list.tsx` | client | Triaged cards, archived disclosure |
| TargetCard | `web/src/features/career/components/target-card.tsx` | client | `Card` link, `ReachChip`, deadline countdown |
| ReachChip | `web/src/features/career/components/reach-chip.tsx` | client | `Badge` with icon and text per status; forest for clear, terracotta for short and blocked, neutral for unknown |
| PlanView | `web/src/features/career/components/plan-view.tsx` | client | Header, alert, requirements, overall, what-if |
| SubjectChoiceAlert | `web/src/features/career/components/subject-choice-alert.tsx` | client | `role="alert"` only on first render after a change; otherwise a static region |
| RequirementList | `web/src/features/career/components/requirement-list.tsx` | client | `DataTable` with mobile card fallback |
| OverallRow | `web/src/features/career/components/overall-row.tsx` | client | Average or APS comparison |
| WhatIfPanel | `web/src/features/career/components/what-if-panel.tsx` | client | Slider plus number input per unit; never calls the API |
| ApsPanel | `web/src/features/career/components/aps-panel.tsx` | server | HS only, from BE-CAR-06 output; method sheet via a small client trigger |
| TargetDialog | `web/src/features/career/components/target-dialog.tsx` | client | `ResponsiveDialog`, `useZodForm` with the generated create and update schemas, `useFieldArray` for minimums |
| CareerCombobox | `web/src/features/career/components/career-combobox.tsx` | client | `Popover` plus list, debounced 250ms search through the generated hook |
| ArchiveTargetDialog | `web/src/features/career/components/archive-target-dialog.tsx` | client | `ConfirmDialog` |
| Loaders | `web/src/features/career/server/get-targets.ts`, `get-standing.ts`, `get-catalog.ts` | server | Parallel reads, zod-validated; targets and standing cached per user; catalog cached globally |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/academics/targets` (BE-CAR-03) | GET | `items[]`: `id`, `kind` (`admission` or `progression`), `stage` (`next_year`, `honours`, `masters`, `phd` or null), `institution`, `programme`, `careerId` (or null), `overallUnit` (`aps`, `average` or null), `overallRequired` (or null), `deadline` (or null), `sourceNote` (or null), `status` (`active` or `archived`), `version`, `requirements[]` (`id`, `unitRef`, `minimumPercent`, `goalId` or null) | `careers:targets:<userId>` |
| `/academics/targets/standing` (BE-CAR-04) | GET | `units[]`: `unitRef`, `unitId`, `name`, `currentMark` (or null, from graded assessments), `markedCount`, `practiceMastery` (or null); `aps` (HS only, BE-CAR-06): `value` (or null), `countedSubjects`, `missingSubjects`, `method` | `careers:standing:<userId>` |
| `/academics/catalog` (BE-ACA-06) | GET | `id`, `name`, `category` (needed for the mathematics either/or check) | `academics:catalog:<curriculum>:<grade>` |
| `/academics/careers?q=` (BE-CAR-05) | GET | `id`, `name`, `field`, `suggestedProgramme` (client, debounced) | client query cache |

Mutations (all through `/api/bff` with generated hooks):

| Endpoint (BE ID) | Method | Request | Responses | After success |
|---|---|---|---|---|
| `/academics/targets` (BE-CAR-03) | POST | `kind`, `stage`, `institution`, `programme`, `careerId`, `overallUnit`, `overallRequired`, `deadline`, `sourceNote`, `requirements[]` (`unitRef`, `minimumPercent`); `Idempotency-Key` | 201; 400 validation; 422 `target.aps_not_for_tertiary` | `updateTag("careers:targets:<userId>")`, toast "Plan saved", open `?target=<new id>` |
| `/academics/targets/{id}` (BE-CAR-03) | PATCH | changed fields; `requirements` reconciled by unit (a row whose unit survives the edit keeps its id and `goalId`, only removed units lose their link, as in the old controller); `If-Match` version | 200; 404; 412 | `updateTag`, toast "Plan updated" |
| `/academics/targets/{id}` (BE-CAR-03) | PATCH `{ status }` | `archived` or `active` | 200 | `updateTag`, toast "Plan archived" with "Undo" |
| `/academics/targets/{id}` (BE-CAR-03) | DELETE | none | 204 | `updateTag`, toast "Plan deleted", back to list (only offered for archived plans, with `ConfirmDialog`: "The plan and its requirements go. Any goals you made from it stay, because the work is still worth doing."); goals generated from the plan are never deleted |
| `/academics/targets/{id}/requirements/{requirementId}` (BE-CAR-03) | PATCH | `goalId` (or null to unlink) | 200; 404 | Records which goal a requirement produced, so generation is idempotent; called right after the goal POST succeeds |

Rules (from the reach engine, kept exactly):

- Standing source order: graded mark first, practice mastery second (labelled "from practice"), what-if override above both while the panel is open (labelled "What if"). A practice figure is never presented as a mark.
- No evidence: `standing` null, status "No marks yet", gap null. Never 0.
- A required subject the student does not take: "Not taking this"; in the mathematics category with another maths subject enrolled: "Taking {other} instead". Both make the plan "Subject missing" and sort after short plans.
- A plan's reach is its worst gap, never an average of gaps.
- A plan with no measured requirements is "No marks yet", never "On track".
- Overall average uses graded marks only (plus what-if overrides), and shows how many units counted.
- APS: the required number is what the student entered. The estimate is BE-CAR-06 output, shown with its method and a warning that institutions count differently. The engine does not compare an estimate to a requirement as if it were exact: the overall row shows both numbers and the words "estimate" and "check with your source".

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Skeletons; "Loading your plans" |
| No plans | `items` empty | `EmptyState`, `Compass` icon. HS title "Where do you want to study?" body "Add a programme you're thinking about, with the minimums from the prospectus. We'll check them against your marks." Uni title "What's your next step?" body "Add the honours, masters or next-year requirements you're aiming for. We'll check them against your marks." Button "Add a plan" |
| No units | Units count 0 | Above the list: "Add your {units} so we can check your plans against real marks." Button "Add {units}". Plans still listed with "No marks yet" |
| No marks yet (plan) | All requirements unknown | Plan view banner: "No marks yet for this plan. Log assessment marks in {units} and your standing appears here." Button "Log a mark" |
| Add subject minimums | Only an overall requirement | "This plan has no {unit} minimums yet, so there's nothing to measure. Add the minimums from your source." Button "Edit plan" |
| APS needs marks | `aps.value` null | "APS estimate: needs marks in {k} more subjects." |
| Saving | Mutation pending | Submit "Saving", disabled |
| Validation | 400 | Field errors: "Name the institution you're aiming at.", "Name the programme you're aiming at.", "Pick a {unit} for every minimum you've entered.", "Every minimum has to be a whole number from 1 to 100.", "Enter the number you researched, or clear the overall requirement." |
| Save failed | 5xx or network | "That didn't save. Your plan is still here, so try again." |
| Version conflict | 412 | "This plan changed somewhere else. We've loaded the latest version; check it and save again." |
| Careers search failed | BE-CAR-05 error | Combobox note: "Career search isn't working right now. You can still type the programme." |
| Error | Loader failed | "We couldn't load your plans. Check your connection and try again." Button "Try again" |
| Not found | `?target` unknown or not owned | "We couldn't find that plan." Link "See all plans" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |

## Stage variants

| Element | High school | University |
|---|---|---|
| Kind | Admission only, no kind field | Progression; "Progressing to" field required |
| Overall measure | APS or average | Average only; APS option absent and refused by the API |
| `ApsPanel` | Shown | Not rendered |
| Minimum rows | CAPS catalog subjects, including ones not taken | The student's own courses |
| Subject choice check | Mathematics either/or check active | Not applicable (no catalog either/or for courses) |
| Description and empty state | "after school" wording | "next step" wording, postgraduate stages |
| Forbidden words | course, GPA | SBA, APS, matric, Grade, CAPS |

## Interactions and edge cases

- Triage order: clear, short (smallest worst gap first), subject missing, no marks yet, no requirements.
- What-if overrides live in component state only; leaving the page or pressing "Reset" clears them. They never reach the API, analytics or logs.
- What-if on a "Not taking this" requirement is not offered (marks cannot fix enrolment); the row says "Marks can't fix this one."
- Deadline countdown: "Applications close in {n} days", "Applications close today", "Applications closed on {date}" (muted, plan stays).
- "Make this a goal" opens `/dashboard/goals?new=1&type=mastery_threshold&unit=<unitId>&target=<minimum>`; once a goal exists for that requirement the button becomes "View goal". A dangling `goalId` (goal deleted) shows the button again.
- Duplicate unit in two minimum rows: client error "You've added {unit} twice."
- Institution and programme are free text (no institution catalog); they are shown as typed, trimmed.
- Archived plans are excluded from triage and from the dashboard card.
- Selecting a career only suggests a programme; it never adds requirements (the app stores only what the student entered).
- Desktop: selecting a plan updates `?target` and keeps scroll position in the list.

## Copy

- h1: "Careers"
- Primary action: "Add a plan"
- Reach chips: "On track", "{n} short", "Subject missing", "{n} subjects missing", "No marks yet", "Add subject minimums" (HS) or "Add course minimums" (uni), "No requirements yet"
- Requirement statuses: "Clear", "{n} short", "No marks yet", "Not taking this", "Taking {other} instead"
- Source labels: "from marks", "from practice", "What if"
- Subject choice alert: "This plan asks for {required}, and you're taking {other}. Most programmes that ask for {required} don't accept {other}. Talk to your school about it as soon as you can." For not taking: "This plan asks for {required}, and you're not taking it. Check with your school whether you can still add it."
- APS method sheet: "We use the common 7-point scale on your best six subjects, leaving out Life Orientation, from marks you've logged. Many institutions count differently, so always check their own rules."
- What-if intro: "Pretend numbers. Nothing here is saved."
- Toasts: "Plan saved", "Plan updated", "Plan archived" (action "Undo"), "Plan deleted"

## Acceptance criteria

1. Given three plans (one clear, one 4 short, one needing Mathematics while the student takes Mathematical Literacy), when the list loads, then the order is clear, 4 short, subject missing, and the chips read "On track", "4 short", "Subject missing".
2. Given a requirement for a subject with no graded marks and no practice, when the plan view renders, then the row reads "No marks yet" and contains no "0%".
3. Given a subject with practice mastery 68 and no graded mark, when it renders, then the standing reads "68%" with "from practice".
4. Given a plan with no measured requirements, when it renders, then its chip is never "On track".
5. Given the student sets Physical Sciences to 65 in the what-if panel, when the list re-sorts, then the changed rows show "What if", and no network request is sent (asserted in Playwright).
6. Given the student leaves and returns, when the page loads, then no what-if values remain.
7. Given a high-school student with marks in 4 subjects, when the APS panel renders, then it reads "APS estimate: needs marks in 2 more subjects."
8. Given a university student, when the add dialog renders, then "Progressing to" is required, the overall measure offers "Average" only, and no APS panel or wording appears anywhere.
9. Given a POST with `overallUnit: "aps"` from a tertiary account, when it reaches the API, then it is refused with 422.
10. Given a short requirement, when the student presses "Make this a goal", then the goal sheet opens with type, unit and target prefilled.
11. Given `?target=<id>` of another student, when the page loads, then the not-found state renders.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-CAR-03 and BE-CAR-04 scope to the caller; `?target` ids of others return 404; mutations through the BFF with the `Origin` check; free text fields are rendered as text (no HTML) | PG-STU-CAREER-Q16 |
| Security | `unitRef` values are validated server-side against the catalog or the student's own units, so a crafted request cannot reference another student's course | PG-STU-CAREER-Q17 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip including the reach engine; dialog, combobox and what-if panel are lazy chunks; three loaders run in parallel | PG-STU-CAREER-Q18 |
| Resilience | Partial data: standing failure still lists plans with "No marks yet" and a banner "We couldn't load your marks right now"; careers search failure never blocks saving; idempotent create; `If-Match` on edit; buttons disabled while pending | PG-STU-CAREER-Q19 |
| Observability | Sentry route tag; events `career_plan_created` (props: `stage`, `has_overall`, `requirement_count`), `career_whatif_opened`, `career_goal_from_gap`; no institution, programme or marks in props; trace propagation | PG-STU-CAREER-Q20 |
| Accessibility | WCAG 2.2 AA; sliders have a paired number input and `aria-valuetext` ("65 percent"); status chips carry text; the subject choice alert is announced once | PG-STU-CAREER-Q21 |
| Privacy and POPIA | Plans of minors are personal information; what-if values never leave the browser; career plans are not shared with parents unless the Family privacy settings say so | PG-STU-CAREER-Q22 |
| Rollout | Flag `careers`; reach engine changes ship with the FE-60 unit suite green; rollback by flag or revert | PG-STU-CAREER-Q23 |
| Monitoring | Grafana "BE-CAR-03 and BE-CAR-04 p95 and 5xx"; alert on 5xx over 2% for 10 minutes; Sentry alert on reach engine exceptions (any) | PG-STU-CAREER-Q24 |

## Build tasks

- [ ] **PG-STU-CAREER-01** Targets list: `TargetList` and `TargetCard` with triage order from `triage`
- [ ] **PG-STU-CAREER-02** Add target dialog (career search, requirements): `TargetDialog` shell with institution, programme and deadline fields
- [ ] **PG-STU-CAREER-03** Reach view: standing per requirement from measured marks (`RequirementList` with source labels)
- [ ] **PG-STU-CAREER-04** What-if panel: `WhatIfPanel` with client-only overrides and reset
- [ ] **PG-STU-CAREER-05** APS panel (HS only): `ApsPanel` from BE-CAR-06 output with the method sheet
- [ ] **PG-STU-CAREER-06** Postgraduate framing (uni): "Progressing to" stages, average-only overall, next-step copy
- [ ] **PG-STU-CAREER-07** Stage hiding rule *(retired, no work: the stage it hid is not in v1, which serves high school and university only per CONVENTIONS. Replaced by PG-STU-CAREER-21)*
- [ ] **PG-STU-CAREER-09** Loaders for targets, standing and catalog in parallel, zod-validated, with cache tags
- [ ] **PG-STU-CAREER-10** `CareersView` client container running `reachFor` and holding what-if state (depends on FE-60)
- [ ] **PG-STU-CAREER-11** `ReachChip` statuses and `reachLabel` copy
- [ ] **PG-STU-CAREER-12** `SubjectChoiceAlert` for substituted and not-enrolled requirements
- [ ] **PG-STU-CAREER-13** `OverallRow` for average and APS, with counted-units line and estimate wording
- [ ] **PG-STU-CAREER-14** Minimum rows in `TargetDialog` (`useFieldArray`, catalog or own courses, duplicate check)
- [ ] **PG-STU-CAREER-15** Overall requirement fields with stage rules
- [ ] **PG-STU-CAREER-16** `CareerCombobox` with debounced search and failure note
- [ ] **PG-STU-CAREER-17** Create mutation (idempotent) and edit mutation (`If-Match`, 412 flow)
- [ ] **PG-STU-CAREER-18** Archive, undo, restore and delete-archived flows
- [ ] **PG-STU-CAREER-19** "Make this a goal" deep link and "View goal" state
- [ ] **PG-STU-CAREER-20** Plan view at 360px with `?target`, back link and `not-found.tsx`
- [ ] **PG-STU-CAREER-21** Stage guard: page renders for both stages; a student with no stage set is sent to finish onboarding
- [ ] **PG-STU-CAREER-22** Deadline countdown and closed state
- [ ] **PG-STU-CAREER-23** Empty, no-units, no-marks and add-minimums states
- [ ] **PG-STU-CAREER-24** Desktop master and detail layout with the table and side what-if panel
- [ ] **PG-STU-CAREER-25** Redirect `/dashboard/career` to `/dashboard/careers` (308)
- [ ] **PG-STU-CAREER-26** Server limits mirrored in the dialog (old controller): institution and programme max 160 characters, source note max 500, at most 30 minimums with "That's more than 30 requirements. Trim it to the ones that gate your place."; APS bound loose (1 to 100), not asserted
- [ ] **PG-STU-CAREER-27** "Make {n} goals" bulk action on a plan: creates one goal per gap candidate through POST /progress/goals one at a time, links each with the requirement PATCH, and shows a result sheet where baseline refusals read as good news ("You're already past {min}% in {unit}, so there's nothing to prove there"), never as an error
- [ ] **PG-STU-CAREER-28** Goal state on each requirement row: "Goal {n}%" or "Goal verified" from the linked goal; a dangling link (goal deleted) unlinks through the requirement PATCH and offers "Make this a goal" again
- [ ] **PG-STU-CAREER-29** Weakest three topics under each short requirement, from mastery (BE-PRG-11) for that unit, each linking to practice
- [ ] **PG-STU-CAREER-30** Verdict band at the top of the plan view: one sentence per status ("Your biggest gap is {n}. That's the number that decides this application, so close it first.", "Everything measured is clear, but {k} still have no marks.", "This plan needs a {unit} you aren't taking. Marks can't fix that.") with met and not-met counts and the deadline
- [ ] **PG-STU-CAREER-31** List-level subject-choice warning above all plans (old page): one card summarising every blocking requirement across active plans, with "If your enrolment has changed, update whichever half is out of date."
- [ ] **PG-STU-CAREER-32** List-level what-if (old page): sliders only for units an active plan depends on and the student is enrolled in, re-sorting the whole triage list ("If I land 55 in Maths instead of 70, which plans still work?")
- [ ] **PG-STU-CAREER-33** Nearest open deadline in the header ("Nearest deadline: Wits, in 23 days"); closed deadlines never count as nearest
- [ ] **PG-STU-CAREER-34** Stage-dependent UI waits for the profile to resolve (key off the loaded profile, never a default), so the wrong cohort's fields never flash on first paint
- [ ] **PG-STU-CAREER-35** Kind switch rule on edit: changing progression to admission clears the stage (the server re-validates the pair)

## Quality tasks

- [ ] **PG-STU-CAREER-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-CAREER-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-CAREER-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-CAREER-Q04** Empty state with one clear next action
- [ ] **PG-STU-CAREER-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-CAREER-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-CAREER-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-CAREER-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-CAREER-Q09** Layout at 1440px
- [ ] **PG-STU-CAREER-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-CAREER-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-CAREER-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-CAREER-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-CAREER-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-CAREER-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-CAREER-Q16** Integration tests: another student's target id returns 404 on GET, PATCH and DELETE; BFF rejects cross-origin writes
- [ ] **PG-STU-CAREER-Q17** Integration test: `unitRef` pointing at another student's course is refused
- [ ] **PG-STU-CAREER-Q18** Lighthouse CI mobile budget; lazy chunks confirmed in build output
- [ ] **PG-STU-CAREER-Q19** Partial-data and failure tests (standing 500, careers search 500, double submit)
- [ ] **PG-STU-CAREER-Q20** Sentry tag and the three named events with prop review
- [ ] **PG-STU-CAREER-Q21** Screen reader and keyboard pass on sliders, chips and the alert
- [ ] **PG-STU-CAREER-Q22** Network assertion that what-if never sends a request; privacy review with PG-PAR-CHILD
- [ ] **PG-STU-CAREER-Q23** `careers` flag wired; rollback drill
- [ ] **PG-STU-CAREER-Q24** Grafana panels and alerts for BE-CAR-03 and BE-CAR-04; Sentry alert on reach engine errors

## Tests

Unit (Vitest, `web/src/features/career/lib/reach.test.ts`, from FE-60):

- "no evidence is unknown, never zero"
- "graded mark outranks practice mastery"
- "practice standing is labelled practice"
- "what-if override outranks both and is labelled what_if"
- "maths literacy enrolled with maths required is substituted"
- "not enrolled without a substitute is not_enrolled"
- "plan with nothing measured is unknown, not clear"
- "worst gap defines the reach"
- "triage sorts clear, short by gap, blocked, unknown, empty"
- "overall average uses graded marks only and counts units"
- "goal candidates skip requirements with a live goal"

Component (Vitest):

- `target-dialog.test.tsx`: "tertiary hides APS", "duplicate unit rows show an error", "progression stage required for tertiary".
- `what-if-panel.test.tsx`: "reset clears overrides", "not taking rows offer no slider".

Playwright (`web/e2e/student/careers.spec.ts`):

- "careers: high school plans triage with chips"
- "careers: subject choice alert for maths literacy"
- "careers: no marks yet never shows zero"
- "careers: what-if changes standings without network calls"
- "careers: university progression plan has no APS anywhere"
- "careers: add plan, edit with conflict, archive and undo"
- "careers: make this a goal prefills the goal sheet"
- "careers: another student's plan shows not found"
- "careers: axe clean light and dark at 360 and 1440"

## Open questions

- Decided (18): show an APS estimate on the common NSC scale with a clear warning, and never mark a plan clear or short on APS alone. BE-CAR-06 stays.
- FE-60 originally pointed at `f223ca7:web/src/lib/targets/reach.ts`, which does not exist at f223ca7; the file is at `43f9faa`. Check FE-60 cites 43f9faa.
- BE-CAR-04 has no route in the backlog; this spec assumes `GET /academics/targets/standing` returning standing per unit plus the APS estimate.
- Decided (20): v1 goal types are fixed (practice count, practice score, mastery threshold, assessment mark, assessments submitted) with no custom goals, so a subject mark minimum maps to a mastery threshold goal, as assumed, and the goal sheet says so.
- Is there still a separate plan detail route (`/dashboard/careers/[id]`, as at `43f9faa`)? This spec uses `?target=` within one page.
- The old `/api/careers` was a stub that returned an empty list. BE-CAR-01 must seed a real careers list, or the career combobox should be dropped from v1.
- Bulk goal generation (PG-STU-CAREER-27) creates goals one by one through the goals endpoint so the baseline rule lives in one place, as the old app did. Confirm, versus a bulk endpoint in Progress.
