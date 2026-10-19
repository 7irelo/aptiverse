# Practice hub

| | |
|---|---|
| ID | `PG-STU-PRACTICE` |
| Route | `/dashboard/practice` (`?unit=&topic=&source=` opens the generate sheet prefilled; `?job=` resumes a generation) |
| Phase | 5 |
| Roles | student |
| Stages | high school, university |
| Entitlement | `practice-tests` (monthly generation quota; the list of existing tests is always visible) |
| Depends on | BE-PRA-04, BE-PRA-05, BE-PRA-07, BE-PRA-18, BE-PRA-20, BE-ACA-15, BE-ACA-19, BE-AI-08, BE-AI-09, BE-BIL-04, BE-BIL-05; FE-25, UI-01 to UI-07, UI-22, UI-32 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/practice/page.tsx` (generate dialog: practising-for assessment, format, difficulty, count or paper length, weakest topics), `43f9faa:web/src/lib/hooks/usePracticeGeneration.ts` (job recovery), `43f9faa:api/Controllers/PracticeController.cs` (generation rules) |
| Status | Not started. Nav entry "Practice" exists in `nav-config.ts`. Backend (Practice, AiTutor) not started. |

## Purpose

Where practice starts. The student accepts the recommended drill or generates a test for a unit and topics at the right level, waits a short, honest moment while it is generated, and finds all their tests with results. Generation is the product's main AI cost, so quota is shown plainly and every failure refunds it.

## User stories

- As a student, I start the recommended drill in one tap.
- As a Grade 10 student, I generate 10 multiple-choice questions on Algebra at core difficulty, timed.
- As a second-year student, I generate short-answer questions for a course and they are pitched at second-year level, not school level.
- As a student, I can leave the page while a test is generating and come back to it.
- As a student, I see how many generations I have left this month, and what happens when I run out.
- As a student, I see my past tests with their scores, and tests I have not started yet.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` "Practice"; description "Generate a test at your level, or pick up where you left off."; primary "New practice test" (full width).
2. Active attempt banner (only when an attempt is live): "You have a test in progress", time left, "Resume test".
3. Generation progress card (only while a job is running): unit, topics, status line, progress indicator, "We'll keep generating if you leave this page."
4. Recommended drill card: unit, topic, reason ("Your weakest topic, 42% over 3 tests"), "Start drill" (opens the generate sheet prefilled with recommended settings).
5. Quota line: "7 of 10 practice tests left this month. Resets 1 November." (or "Unlimited on your plan.")
6. My tests (`h2`): filter chips (All, Not started, Completed) and unit select; test cards with title, unit, format, difficulty, question count, timed or untimed, and state (Not started, In progress, Completed with score, Generating, Failed); 10 per page with "Show more".

Generate sheet (`ResponsiveDialog`): unit, topics (multi-select, optional), format, difficulty, number of questions, timed toggle with duration, "Focus on my weakest topics" switch, summary line, "Generate test".

### Desktop (1440px)

`PageShell width="wide"`. Header with action on the right. Top row: recommended drill (8 columns), quota card (4 columns). Generation progress card full width when running. My tests as a 3-column card grid with filters inline.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/practice/page.tsx` | server | parallel loaders, `Suspense` per section |
| Loading, error | `.../practice/loading.tsx`, `error.tsx` | mixed | `PageLoading`, `PageError` |
| Tests loader | `web/src/features/practice/server/get-tests.ts` | server | BE-PRA-07, tag `practice:tests:<userId>` |
| Recommended loader | `web/src/features/practice/server/get-recommended.ts` | server | BE-PRA-20 |
| Quota loader | `web/src/features/practice/server/get-practice-quota.ts` | server | usage meter read (see open questions) |
| Active attempt loader | `web/src/features/practice/server/get-active-attempt.ts` | server | active attempt summary |
| Recommended card | `web/src/features/practice/components/recommended-drill-card.tsx` | server | |
| Quota line | `web/src/features/practice/components/quota-line.tsx` | server | |
| Test card | `web/src/features/practice/components/test-card.tsx` | server | link to `/dashboard/practice/{id}` |
| Tests list | `web/src/features/practice/components/tests-list.tsx` | server | filters via `searchParams` |
| Generate sheet | `web/src/features/practice/components/generate-test-sheet.tsx` | client | `ResponsiveDialog`, `useZodForm` |
| Topic picker | `web/src/features/practice/components/topic-multi-select.tsx` | client | loads BE-ACA-19 for the chosen unit via generated query hook |
| Generate schema | `web/src/features/practice/lib/generate-test-schema.ts` | shared | generated zod plus refinements |
| Generate hook | `web/src/features/practice/hooks/use-generate-test.ts` | client | BE-PRA-04 with idempotency key |
| Status hook | `web/src/features/practice/hooks/use-generation-status.ts` | client | polls BE-PRA-05 with backoff |
| Progress card | `web/src/features/practice/components/generation-progress-card.tsx` | client | uses the status hook |
| Prefill parser | `web/src/features/practice/lib/parse-prefill.ts` | shared | validates `unit`, `topic`, `source` |
| Active attempt banner | `web/src/features/dashboard/components/active-attempt-banner.tsx` | client | shared with the dashboard |
| Upgrade gate | `web/src/components/shell/page-states.tsx` (`UpgradeGate`) | server | inside the sheet when quota is 0 |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/practice/tests?state=&unitId=&page=` (BE-PRA-07) | GET | `items[] { id, title, unitId, unitName, format, difficulty, questionCount, mode, durationMinutes, status (generating, ready, failed), createdAt, latestAttempt { id, state (active, submitted, graded), scorePercent or null, submittedAt } or null }`, `total` | user-scoped, tag `practice:tests:<userId>` |
| `/practice/recommended` (BE-PRA-20) | GET | `unitId, unitName, topicId, topicName, reason, evidence { percent, attempts }, suggested { format, difficulty, questionCount }` or 204 | user-scoped, tag `practice:recommended:<userId>` |
| `/academics/units` (BE-ACA-15) | GET | `items[] { id, name, kind, level }` | tag `academics:units:<userId>` |
| `/academics/units/{id}/topics` (BE-ACA-19) | GET (client query) | `items[] { id, name }` | TanStack Query, 5 minutes |
| Practice quota (BE-BIL-04, read endpoint to confirm) | GET | `limit or null (unlimited), used, resetsAt` | user-scoped, no cache |
| Active attempt (BE-PRA-18 exposed over HTTP, to confirm) | GET | `attemptId, testId, title, deadlineAt or null, serverNow` | no cache |

Mutation:

| Endpoint (BE ID) | Method | Request | Response | Failures |
|---|---|---|---|---|
| `/practice/tests/generate` (BE-PRA-04), `Idempotency-Key` | POST | `{ assessmentId (required; the unit is read from it server-side), topicIds[] (up to 6), format (multiple_choice, short_answer, reading, exam, flashcards, essay), difficulty (foundation, core, challenge), questionCount (5, 8, 10, 12, 15; clamped 3 to 15; not used by exam or essay), totalMarks (exam only: 30, 50, 100, 150; clamped 20 to 150), mode (timed, untimed), durationMinutes (timed only, 5 to 180; exam is a minute a mark), focusWeakest }` | 202 `{ testId, jobId }`; when a job is already queued or running for this student, 202 with that existing job (no second charge) | 402 quota exhausted (`resetsAt`), 409 active attempt, 404 assessment not owned, 429 rate limit, 503 AI unavailable |
| `/practice/generations/active` (43f9faa endpoint, to add to BE-PRA) | GET | | 200 job or 204 | used to recover an in-flight job on any device |
| `/practice/tests/{id}/status` (BE-PRA-05) | GET (poll) | | `{ status (queued, generating, ready, failed), progress 0 to 100 or null, failureCode or null, quotaRefunded }` | |

On `ready`: revalidate `practice:tests:<userId>`, toast "Your test is ready" with "Open test", and the card becomes "Not started". The level sent to the generator comes from the unit on the server (BE-ACA-20), never from the client.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | skeletons for each section |
| Empty (no tests) | no tests yet | title "No practice tests yet"; body "Generate one for any {noun} and topic. It takes about a minute."; action "New practice test" |
| No units | no study units | title "Add your {nouns} first"; body "Practice tests are built from your {nouns} and topics."; action "Add {nouns}" |
| No recommendation | 204 | card hidden; empty-state copy on desktop slot "Do a practice test and we'll suggest what to work on next." |
| Queued or generating | job running | "Writing your questions... This usually takes under a minute." progress bar when `progress` known, indeterminate otherwise |
| Taking long | over 90 seconds | "Still working on it. You can leave this page; we'll keep going." |
| Ready | job done | toast "Your test is ready" action "Open test" |
| Generation failed | `failed` | "We could not generate this test. Your quota was not used. Try again, or pick different topics." button "Try again" (same settings) |
| Quota exhausted | quota 0 or 402 | inside sheet: `UpgradeGate` "You've used this month's practice tests. They reset on {date}. Student Pro gives you more." actions "See plans", "Close" |
| Active attempt | 409 on generate | "Finish your current test before starting a new one." action "Resume test" |
| Rate limited | 429 | "You're generating tests quickly. Wait a minute and try again." |
| Error | loader fails | `PageError` defaults |
| No evidence (test card) | not started | "Not started" (never "0%") |
| Populated | tests | as laid out |

## Stage variants

| Item | High school | University |
|---|---|---|
| Unit label | "Subject" | "Course" |
| Difficulty labels | "Foundation: recall and basics", "Core: standard exam level", "Challenge: multi-step, top marks" | "Foundation: key concepts", "Core: typical exam level for {studyLevel}", "Challenge: beyond the exam" |
| Level line in summary | "Pitched at Grade {grade} {curriculum}" | "Pitched at {studyLevel} level" (for example "Pitched at Second year level") |
| Reading comprehension format | offered for language subjects | offered for all courses |

## Interactions and edge cases

- Prefill: `?unit=&topic=` opens the sheet with those values when they belong to the student (checked against loaded units and topics); unknown ids are dropped silently. `source=recommended` uses the recommended `suggested` settings.
- Duration default when timed: 1.5 minutes per multiple-choice question, 3 per short-answer, 4 per reading question, rounded up to 5 minutes; editable within 5 to 180.
- "Focus on my weakest topics" disables the topic picker and lets the server choose; disabled with a hint when there is no evidence yet ("Available after your first test.").
- Generation resumes after reload, navigation or on another device: `jobId` is kept in the URL (`?job=`) and in localStorage (`aptiverse.practice.generation`, try/catch), and when neither has it the page asks `GET /practice/generations/active` (43f9faa pattern), so a student can close the tab and pick the test up on their phone.
- Practice is always for an assessment (43f9faa rule, enforced server-side): the sheet's first field is "Practising for", listing the student's assessments grouped "Upcoming" then "Already written"; the unit comes from the chosen assessment and is never picked separately, so a test cannot drift onto a unit the student does not take.
- Formats offered by stage (43f9faa): high school gets multiple choice, short answer, reading, flashcards, essay, exam paper; university gets the same without reading. The chosen assessment's type orders the list (test: multiple choice, short answer, exam, flashcards; exam: exam, multiple choice, short answer, flashcards; essay: essay, short answer, flashcards; investigation and project: short answer, essay, flashcards); switching assessment never leaves an unlisted format selected.
- Exam paper format: sized by marks, not questions ("30 marks, about half an hour", "50 marks, about an hour", "100 marks, about two hours", "150 marks, a full three-hour paper"), timed at a minute a mark, one attempt.
- Flashcards and essay are not scored attempts: no timer, no one-attempt rule, retake any time.
- Polling: 1 s, 2 s, 3 s, then every 5 s; stops at a terminal status, when the tab is hidden for over 5 minutes (resumes on focus), or after 5 minutes with "This is taking longer than usual. We'll notify you when it's ready." (relies on BE-NTF-10).
- Double tap on "Generate test" sends one request (disabled while pending, one idempotency key per sheet session).
- Generation is refused while an attempt is live (409) to keep integrity simple.
- Quota display counts only successful generations; failed jobs are refunded (BE-AI-08) and the line updates after the failure.

## Copy

- Sheet title: "New practice test"; submit "Generate test"
- Summary line: "{n} {format} questions on {topics or 'all topics'}, {difficulty}, {timed for m minutes or untimed}."
- Format help: "Multiple choice: four options, one correct, marked instantly." / "Short answer: type a brief answer, marked with feedback." / "Reading: a passage with questions about it."
- Quota: "{left} of {limit} practice tests left this month. Resets {d MMMM}."

## Acceptance criteria

- Given a Grade 10 student, when they generate 10 multiple-choice core questions on one topic, then a test card shows "Generating", then "Not started" when the job is ready, and the toast offers "Open test".
- Given generation fails, when the status becomes `failed`, then the failure copy shows, the quota line is unchanged, and "Try again" resubmits the same settings.
- Given a quota of 0, when the student opens the sheet, then the upgrade gate shows the reset date and no generate request can be sent.
- Given a job in progress, when the student reloads the page, then the progress card resumes from `?job=`.
- Given an active attempt, when the student taps "Generate test", then the 409 copy with "Resume test" shows.
- Given `?unit=` for a unit the student does not own, when the page loads, then the sheet opens without a preselected unit.
- Given a university student, when the sheet renders, then the level line reads "Pitched at {studyLevel} level" and no Grade or NQF wording appears.

## Production readiness

- Security: BE-PRA-04 checks unit and topic ownership and derives level server-side, so a tampered request cannot request another student's unit or a different level. Generation is in the `ai` rate-limit group (BE-SK-26). Prefill parameters are validated and never echoed into HTML unescaped.
- Performance: page server-rendered; the generate sheet and topic picker are dynamically imported on open. Route JS under 100 KB gzip. Polling uses small GETs with backoff and stops when hidden, to protect mobile data.
- Resilience: idempotent generate; quota reserve, confirm or refund (BE-AI-08) so failures never cost the student; polling survives reload; Anthropic outage surfaces as `failed` with the refund copy, never a hung spinner (5-minute cap).
- Observability: analytics `practice_generate_opened { source }`, `practice_generate_submitted { format, difficulty, questionCount, mode, focusWeakest }`, `practice_generate_ready { seconds }`, `practice_generate_failed { failureCode }`, `practice_quota_blocked`. Sentry tag `page:practice`; job id attached as a tag for correlation with API traces.
- Accessibility (WCAG 2.2 AA): progress card uses `role="status"` with polite announcements at start, ready and failure only; topic multi-select is a list of checkboxes, not a custom combobox, at 360px.
- Privacy and POPIA: analytics carry settings only, never unit names or topic names typed by tertiary students.
- Rollout: behind `practice.hub`, internal accounts first, then 10%, 50%, 100% while watching generation failure rate and cost per test (BE-AI-37). Rollback: flag off shows the existing tests list only, without generation.
- Monitoring: Grafana panels for generation success rate, p50 and p95 time to ready, failures by `failureCode`, refunds, and cost per test; alert when failure rate exceeds 5% over 15 minutes or p95 time to ready exceeds 120 seconds.

## Build tasks

- [ ] **PG-STU-PRACTICE-01** Recommended drill card (BE-PRA-20) with "Start drill" prefilling the sheet
- [ ] **PG-STU-PRACTICE-02** Generate test sheet (practising for an assessment, which sets the unit; topics, format, difficulty, count or paper length, timed or untimed with duration, focus weakest)
- [ ] **PG-STU-PRACTICE-03** Generation progress card (status, progress, taking-long copy) driven by the status hook
- [ ] **PG-STU-PRACTICE-04** My tests list with latest attempt result, filters and paging
- [ ] **PG-STU-PRACTICE-05** Quota line and upgrade gate in the sheet when quota is 0
- [ ] **PG-STU-PRACTICE-06** Page composition and loaders (tests, recommended, quota, active attempt) with tags
- [ ] **PG-STU-PRACTICE-07** Test card component with every state (generating, failed, not started, in progress, completed with score)
- [ ] **PG-STU-PRACTICE-08** Generate schema `generate-test-schema.ts` with duration defaults and unit tests
- [ ] **PG-STU-PRACTICE-09** Topic multi-select loading BE-ACA-19 per unit, disabled when "focus weakest" is on
- [ ] **PG-STU-PRACTICE-10** Generate hook with idempotency key, double-submit guard and 402, 404, 409, 429 handling
- [ ] **PG-STU-PRACTICE-11** `use-generation-status` polling hook (backoff, hidden-tab pause, 5-minute cap, reload resume via `?job=`) with unit tests
- [ ] **PG-STU-PRACTICE-12** Generation failure state with refund copy and "Try again" with the same settings
- [ ] **PG-STU-PRACTICE-13** Prefill from `?unit=&topic=&source=` via `parse-prefill.ts`, ownership-checked
- [ ] **PG-STU-PRACTICE-14** Active attempt banner and 409 handling
- [ ] **PG-STU-PRACTICE-15** Stage-aware difficulty labels and level line
- [ ] **PG-STU-PRACTICE-16** Empty and no-units states
- [ ] **PG-STU-PRACTICE-17** Analytics events listed above
- [ ] **PG-STU-PRACTICE-18** Flag `practice.hub` with staged rollout plan and rollback note
- [ ] **PG-STU-PRACTICE-19** Grafana generation panels and alerts (failure rate, time to ready, cost per test)
- [ ] **PG-STU-PRACTICE-20** Dynamic import of the sheet; route JS budget 100 KB gzip
- [ ] **PG-STU-PRACTICE-21** "Practising for" assessment select (required, grouped Upcoming and Already written, shows unit and due label); generation disabled with no assessments, empty copy "Practice is always built for one of your assessments. Log one first." action "Add an assessment" (43f9faa rule)
- [ ] **PG-STU-PRACTICE-22** Format list by stage (reading for high school only) ordered by the chosen assessment's type; an unlisted format is reset on assessment change
- [ ] **PG-STU-PRACTICE-23** Exam paper option: paper length select (30, 50, 100, 150 marks), helper "You get one attempt, timed at a minute a mark.", question count hidden
- [ ] **PG-STU-PRACTICE-24** Flashcards and essay options with their help text ("Flip cards and rate yourself. Not scored, retake anytime." / "A prompt with marking criteria. Write it and get feedback.")
- [ ] **PG-STU-PRACTICE-25** One generation in flight: while a job is queued or running the sheet's submit is disabled with "You already have a test being written."
- [ ] **PG-STU-PRACTICE-26** Cross-device recovery: localStorage job id plus `GET /practice/generations/active` on load (replaces the sessionStorage-only approach)
- [ ] **PG-STU-PRACTICE-27** Phase copy: "Your test is queued" vs "Writing your test"; exam "Setting a full paper: sections, marks and a marking memo. Usually a minute or two."; honest timeout after 4 minutes "This is taking longer than it should. It is still running on our side, so check back in a few minutes and the test will be in your list."
- [ ] **PG-STU-PRACTICE-28** AI unavailable state (503): "Practice generation is not available right now. Try again later." with no quota used
- [ ] **PG-STU-PRACTICE-29** Delete a test from its card (confirm, owner only, shared seeded tests have no delete, attempts removed with it); needs a BE slice (43f9faa `DELETE /api/practice/tests/{id}`)
- [ ] **PG-STU-PRACTICE-30** Test card shows "for {assessment title}" and a format-specific action: "Sit the paper" (exam), "Start" (scored, not started), "Study" (flashcards), "Write" (essay), "View result" (completed)
- [ ] **PG-STU-PRACTICE-31** Prefill from `?assessment=` (from assessment detail), ownership-checked, alongside `?unit=&topic=`
- [ ] **PG-STU-PRACTICE-32** "Open test" on the ready toast navigates before dismissing the banner (43f9faa bug: dismissing first unmounted the link and went nowhere)

## Quality tasks

- [ ] **PG-STU-PRACTICE-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`)
- [ ] **PG-STU-PRACTICE-Q02** Server loaders in `src/features/practice/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-PRACTICE-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending and failure states
- [ ] **PG-STU-PRACTICE-Q04** Empty state with one clear next action
- [ ] **PG-STU-PRACTICE-Q05** Error copy for each failure code (quota, active attempt, rate limit, generation failure)
- [ ] **PG-STU-PRACTICE-Q06** Forbidden state and upgrade state (quota exhausted, plan without `practice-tests`)
- [ ] **PG-STU-PRACTICE-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-PRACTICE-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); sheet scrolls with the keyboard open
- [ ] **PG-STU-PRACTICE-Q09** Layout at 1440px
- [ ] **PG-STU-PRACTICE-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-PRACTICE-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-PRACTICE-Q12** axe: zero violations in light and dark, sheet open
- [ ] **PG-STU-PRACTICE-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-PRACTICE-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty, generating, failed and quota states
- [ ] **PG-STU-PRACTICE-Q15** `generateMetadata` title "Practice"; nav entry active on hub and runner

## Tests

Unit (Vitest):
- `generate-test-schema.test.ts`: "duration required only when timed", "duration default 15 for 10 MCQ", "count must be one of the options", "topics ignored when focusWeakest"
- `use-generation-status.test.ts`: "backs off 1, 2, 3, then 5 seconds", "stops at ready", "stops at failed", "pauses when hidden over 5 minutes", "gives up after 5 minutes"
- `parse-prefill.test.ts`: "drops unknown unit", "keeps owned unit and topic", "recommended source applies suggested settings"
- `test-card.test.tsx`: "not started never shows 0%", "completed shows score", "failed shows Try again"

Playwright (`web/e2e/student/practice-hub.spec.ts`, API mocked through the BFF in CI):
- "student generates a test and opens it when ready"
- "generation failure refunds quota and retries"
- "quota exhausted shows upgrade gate"
- "generation resumes after reload"
- "active attempt blocks a new generation"
- "university student sees study level wording"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- Decided (15): practice is generated per assessment (`assessmentId` required, unit read from it server-side), with `format`, `difficulty`, `questionCount`, `totalMarks`, topics, `durationMinutes` and `focusWeakest` as this file sends them. BE-PRA-04 must say "assessment" rather than "unit" (backend owner).
- Decided (16): all five formats are in v1 (quiz, exam paper, reading for high school, flashcards, essay); essay feedback has its own quota.
- 43f9faa charged the quota at queue time with no refund on failure; REBUILD_PLAN 3.5 requires reserve, confirm or refund, so this file promises a refund. The backend must implement it before the copy ships.
- 43f9faa ran one generation at a time per student and returned the existing job on a second request; BE-PRA-04 should keep that rule.
- No read endpoint exists for practice quota (BE-BIL-04 is the meter). Add `GET /billing/usage` or put quota in `/me`.
- No HTTP endpoint exposes the active attempt (BE-PRA-18 is an internal contract). Add `GET /practice/attempts/active` for the hub, dashboard and tutor.
- Exact free-plan quota and entitlement key names (`practice-tests`) come from BE-BIL-02.
