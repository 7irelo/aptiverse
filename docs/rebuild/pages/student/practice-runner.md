# Practice runner

| | |
|---|---|
| ID | `PG-STU-RUNNER` |
| Route | `/dashboard/practice/[id]` (runner and results), `/dashboard/practice/[id]/print?variant=blank or marked` (printable paper) |
| Phase | 5 |
| Roles | student |
| Stages | high school, university |
| Entitlement | `practice-tests` is checked at generation; taking and reviewing an existing test is always allowed |
| Depends on | BE-PRA-08, BE-PRA-09, BE-PRA-10, BE-PRA-11, BE-PRA-12, BE-PRA-13, BE-PRA-14, BE-PRA-15, BE-PRA-16, BE-PRA-18, BE-PRA-19, BE-PRA-21, BE-AI-20, BE-PRG-11; FE-25, FE-61, UI-07, UI-24, UI-25, UI-28, UI-30 |
| Old app reference | `43f9faa:web/src/components/practice/PracticeRunner.tsx` (instructions, runner, results, completed, print layer), `43f9faa:web/src/components/practice/MathText.tsx`, `43f9faa:web/src/app/(app)/dashboard/practice/[id]/page.tsx` |
| Status | Not started. `MathText` (`web/src/components/common/math-text.tsx`) and the ASCII-math bridge (`web/src/lib/math/ascii-math.ts`, with tests) already exist and are reused. Backend (Practice) not started. |

## Purpose

Take a practice test under fair, exam-like conditions and get honest, useful feedback. Integrity rules are enforced by the server, and the client is built so a student on a weak phone connection never loses answers:

- One attempt only. Revisiting a finished test shows its results, never a second start.
- An instructions gate the student must acknowledge before the clock starts.
- A server-authoritative countdown; the client only displays it.
- Focus-loss monitoring: leaving the tab or app is counted and reported, not punished.
- Auto-submit at the deadline, by the server even if the phone is offline.
- The AI tutor is blocked server-side for the whole attempt (BE-AI-20), not just hidden.
- Math renders with KaTeX, with the ASCII-math bridge for legacy content.
- A branded, printable paper (blank and marked) after submission.

## User stories

- As a student, I read the rules and the time limit before I start, and nothing starts until I press "Start test".
- As a student, I answer one question at a time, move back and forth, flag questions to revisit, and see how many I have left.
- As a student, my answers save as I go; if my data drops or my phone restarts, I come back to my answers and the right time left.
- As a student, I am told kindly when I leave the test tab, and how many times it was recorded.
- As a student, I review unanswered and flagged questions before I submit.
- As a student, when time runs out my answers are submitted for me.
- As a student, I see my score, how I did per topic, the correct answer and explanation for each question, and what to practise next.
- As a student, I print a branded paper of the test, or of my marked answers, to study offline.

## Layout

The runner has distinct views. Each view is its own component, chosen by the runner state machine (PG-STU-RUNNER-14).

### Mobile (360px)

Instructions view (shell visible):
1. Back link "Practice".
2. `h1` test title; meta line: unit, level, format, difficulty, "{n} questions", "{m} minutes" or "Untimed".
3. Rules list (each with a Lucide icon and a short body): time, one attempt, stay on this tab, autosave, tutor off, pause rule.
4. Checkbox "I understand. I have one attempt at this test." (required).
5. Sticky bottom "Start test" (disabled until checked).

Active view (focus mode: the runner lives in its own `(focus)` route group with no app shell, DECISIONS E):
1. Top bar (sticky, 56px): "Question 3 of 10"; countdown chip ("12:34" or "Untimed"); pause button (only if allowed); "Questions" button opening the navigator sheet.
2. Offline banner (when offline): "You're offline. Your answers are saved on this phone and will sync when you reconnect."
3. Reading passage (reading format): collapsible card "Passage" above the question, expanded by default on the first question of a passage.
4. Question: number and marks ("2 marks"), stem with `MathText`, answer input (MCQ options, short-answer textarea, or math input).
5. "Flag for review" toggle.
6. Bottom bar (sticky): "Previous", "Next"; on the last question "Review answers".

Navigator sheet: grid of question numbers (answered, unanswered, flagged, current), legend, "Review and submit".

Paused view: question hidden; "Test paused"; time left frozen; "Resume test".

Review view: `h1` "Review your answers"; counts ("8 answered, 1 unanswered, 1 flagged"); list of questions with status and "Go to question"; "Submit test" (primary), "Keep working".

Submitting view: "Submitting your answers..." with spinner; never blank.

Time-up view: "Time is up" then "Your answers were submitted." then results.

Grading view: "Marking your answers..." with "Short answers take a little longer." (written answers marked by `IGrader`).

Results view (shell visible again):
1. `h1` "Your results"; test title and unit.
2. Score card: `ProgressRing` with percent, "7 of 10 marks", time taken, "Submitted by you" or "Submitted when time ran out".
3. Integrity note (neutral, only when count over 0): "You left the test tab {n} times."
4. By topic (`h2`): bars per topic with "{correct} of {total}".
5. Mastery change (`h2`, Phase 7, when present): per topic "52% to 58%".
6. Question review (`h2`): accordion per question: status (Correct, Partly correct, Incorrect, Not answered), your answer, correct answer, explanation, grader feedback for written answers.
7. Next steps: "Practise {weakest topic}" (primary), "Print marked paper", "Back to practice".

Completed view (revisiting later): the results view plus a header note "You've already taken this test. Each test has one attempt." and "New test on this topic".

### Desktop (1440px)

- Instructions: `PageShell width="narrow"`, rules in a 2-column grid, "Start test" inline.
- Active: focus mode with a centred 720px question column; the navigator is a permanent left rail (240px) instead of a sheet; for reading format the passage sits in a right column (480px, independently scrollable) next to the question.
- Review: same as mobile in a 720px column.
- Results: `PageShell width="default"`; score card and by-topic side by side (5 and 7 columns); question review full width below.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(focus)/dashboard/practice/[id]/page.tsx` (route group without the shell; the URL is unchanged) | server | loads the test, picks the initial view, renders `RunnerRoot` or the results |
| Loading, error, not found | `.../practice/[id]/loading.tsx`, `error.tsx`, `not-found.tsx` | mixed | error copy never mentions losing answers unless true |
| Test loader | `web/src/features/practice/server/get-test.ts` | server | BE-PRA-08, no cache (attempt state must be live) |
| Results loader | `web/src/features/practice/server/get-results.ts` | server | BE-PRA-16, tag `practice:results:<attemptId>` once graded |
| Initial view rule | `web/src/features/practice/lib/initial-view.ts` | shared | test status and attempt state to view |
| State machine | `web/src/features/practice/lib/runner-machine.ts` | shared | reducer and typed events |
| Runner root | `web/src/features/practice/components/runner-root.tsx` | client | wires machine, hooks and views |
| Focus layout | `web/src/app/(focus)/layout.tsx` | server | minimal layout (wordmark, exit link, no navigation); auth and role checks as in `(app)` |
| Instructions view | `web/src/features/practice/components/instructions-view.tsx` | client | rules from `instructions[]` plus fixed integrity rules |
| Active view | `web/src/features/practice/components/active-view.tsx` | client | top bar, question, bottom bar |
| Top bar | `web/src/features/practice/components/runner-top-bar.tsx` | client | |
| Countdown | `web/src/features/practice/components/countdown.tsx` | client | `role="timer"`, tabular numbers |
| Question view | `web/src/features/practice/components/question-view.tsx` | client | stem through `MathText` |
| MCQ answer | `web/src/features/practice/components/answers/mcq-answer.tsx` | client | radio group |
| Short answer | `web/src/features/practice/components/answers/short-answer.tsx` | client | textarea, 1 000 characters |
| Math answer | `web/src/features/practice/components/answers/math-answer.tsx` | client | MathLive wrapper (UI-30), lazy-loaded |
| Passage pane | `web/src/features/practice/components/passage-pane.tsx` | client | reading format |
| Navigator | `web/src/features/practice/components/question-navigator.tsx` | client | sheet on mobile, rail on desktop |
| Offline banner | `web/src/features/practice/components/offline-banner.tsx` | client | |
| Focus warning | `web/src/features/practice/components/focus-loss-dialog.tsx` | client | |
| Paused view | `web/src/features/practice/components/paused-view.tsx` | client | |
| Review view | `web/src/features/practice/components/review-view.tsx` | client | |
| Submitting view | `web/src/features/practice/components/submitting-view.tsx` | client | includes the failure and retry state |
| Time-up view | `web/src/features/practice/components/time-up-view.tsx` | client | |
| Grading view | `web/src/features/practice/components/grading-view.tsx` | client | |
| Results view | `web/src/features/practice/components/results-view.tsx` | server | renders from BE-PRA-16 data |
| Topic breakdown | `web/src/features/practice/components/topic-breakdown.tsx` | server | bars with text |
| Question review | `web/src/features/practice/components/question-review.tsx` | server | `Accordion`, `MathText` |
| Mastery delta | `web/src/features/practice/components/mastery-delta.tsx` | server | hidden when null |
| Next steps | `web/src/features/practice/components/results-next-steps.tsx` | server | |
| Completed note | `web/src/features/practice/components/completed-note.tsx` | server | |
| Other-tab view | `web/src/features/practice/components/other-tab-view.tsx` | client | |
| Not-ready view | `web/src/features/practice/components/test-not-ready-view.tsx` | server | test still generating or failed |
| Hooks | `web/src/features/practice/hooks/use-start-attempt.ts`, `use-server-clock.ts`, `use-countdown.ts`, `use-low-time-announcer.ts`, `use-answer-store.ts`, `use-autosave.ts`, `use-online-status.ts`, `use-focus-monitor.ts`, `use-focus-loss-reporter.ts`, `use-pause.ts`, `use-submit-attempt.ts`, `use-results.ts`, `use-single-tab-lock.ts`, `use-leave-guard.ts` | client | one hook per file, each with a unit test file beside it |
| Print page | `web/src/app/(focus)/dashboard/practice/[id]/print/page.tsx` | server | BE-PRA-19; refuses before submission |
| Paper | `web/src/features/practice/components/print/printable-paper.tsx` | server | blank and marked variants |
| Paper header and footer | `web/src/features/practice/components/print/paper-header.tsx`, `paper-footer.tsx` | server | wordmark from `components/shell/wordmark.tsx` |
| Print styles | `web/src/features/practice/components/print/print.css` | | `@page` A4, margins, page breaks |
| Print button | `web/src/features/practice/components/print/print-button.tsx` | client | calls `window.print()` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/practice/tests/{id}` (BE-PRA-08) | GET | `id, title, status (generating, ready, failed), unit { id, name, kind, level }, format, difficulty, questionCount, totalMarks, mode, durationMinutes, allowPause, instructions[]`; `attempt { id, state (active, paused, submitted, grading, graded), startedAt, deadlineAt or null, remainingSeconds (when paused), serverNow, focusLossCount, answers[] { questionId, value, clientSeq, savedAt } } or null`; when `attempt.state` is active or paused: `questions[] { id, order, kind (mcq, short, long, math), section (A, B, C or null; exam only), stem, passageId or null, options[] { id, text }, marks }`; `assessment { id, title, type, dueAt, weightPercent } or null`, `passages[] { id, title, body }`. Never includes correct answers. | none |
| `/practice/attempts/{id}/results` (BE-PRA-16) | GET | `state (grading, graded)`, `scorePercent, marksObtained, marksTotal, timeTakenSeconds, submittedBy (student, deadline), focusLossCount`, `topics[] { topicId, name, marksObtained, marksTotal }`, `questions[] { id, order, kind, stem, options, yourAnswer, correctAnswer, outcome (correct, partial, incorrect, unanswered), marksAwarded, marks, explanation, feedback or null }`, `masteryDelta[] { topicId, name, before or null, after } or null` | graded results are immutable: tag `practice:results:<attemptId>`, long revalidate |
| `/practice/tests/{id}/print` (BE-PRA-19) | GET | `title, unit, level, studentName, date, questions[], passages[]`, and for `marked`: `yourAnswer, correctAnswer, marksAwarded, explanation` | none |

Mutations (client, `/api/bff`):

| Endpoint (BE ID) | Method | Request | Response | Failures |
|---|---|---|---|---|
| `/practice/tests/{id}/attempts` (BE-PRA-09), `Idempotency-Key` | POST | `{ acknowledged: true }` | `{ attemptId, startedAt, deadlineAt or null, serverNow, questions[], passages[] }` | 409 already attempted (go to results), 409 another attempt active, 409 test not ready |
| `/practice/attempts/{id}/answers/{questionId}` (BE-PRA-10) | PUT | `{ value, clientSeq, clientSavedAt }` | `{ savedAt, serverNow, deadlineAt }` | 409 attempt not active (submitted or expired), 412 stale `clientSeq` (ignored), 422 invalid value |
| `/practice/attempts/{id}/focus-loss` (BE-PRA-11), `Idempotency-Key` per event | POST | `{ occurredAt, kind (blur, hidden), awayMs or null }` | `{ focusLossCount }` | 409 not active (drop event) |
| `/practice/attempts/{id}/pause`, `/resume` (BE-PRA-12) | POST | none | `{ state, deadlineAt, remainingSeconds, serverNow }` | 403 pause not allowed |
| `/practice/attempts/{id}/submit` (BE-PRA-13), `Idempotency-Key` | POST | `{ lastClientSeq }` | `{ state (grading, graded) }` | 409 already submitted (treated as success) |

Server-side rules the page relies on: the deadline is `startedAt + duration` plus paused time, stored server-side; BE-PRA-14 auto-submits at the deadline with the last saved answers; answers arriving after the deadline (plus the small network grace the backend sets) are refused with 409; BE-AI-20 refuses tutor messages while `attempt.state` is active or paused.

On submit success: revalidate `practice:tests:<userId>`, `progress:dashboard:<userId>`, `progress:mastery:<userId>`.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | skeleton of the instructions view |
| Not found | 404 or not owner | "We could not find that test" / "It may have been removed." / "Back to practice" |
| Not ready | `status` generating | "This test is still being written." action "Back to practice" (progress continues there) |
| Generation failed | `status` failed | "This test could not be generated. Your quota was not used." action "Generate a new test" |
| Instructions | no attempt | rules, checkbox, "Start test" |
| Starting | start pending | button "Starting..." disabled |
| Start failed | network or 5xx | "We could not start the test. Your attempt has not been used. Try again." |
| Active | attempt active | question view |
| Saving indicator | autosave in flight or done | top bar text "Saving..." then "Saved" (polite, not announced every time) |
| Offline | `navigator.onLine` false or requests failing | offline banner copy above |
| Focus loss | student returned to the tab | dialog "You left the test" body "Leaving the test tab is recorded. This has been recorded {n} times. Pause first if you need a break." (pause sentence only when allowed) button "Back to the test" |
| Low time | 5 minutes and 1 minute left | chip turns terracotta; screen reader "5 minutes left" / "1 minute left" |
| Paused | attempt paused | "Test paused. The clock has stopped." button "Resume test" |
| Review | review opened | counts and list |
| Unanswered warning | submit with unanswered | confirm "You have {n} unanswered questions. Submit anyway?" buttons "Submit test" / "Keep working" |
| Submitting | submit pending | "Submitting your answers..." |
| Submit failed | network or 5xx after retries | "We could not submit yet. Your answers are saved. Check your connection and try again." button "Try again"; countdown keeps running; server auto-submits at the deadline regardless |
| Time up | countdown reached 0 | "Time is up. Your answers were submitted." |
| Time up while offline | reconnect after the deadline | "Time ran out while you were offline. Answers saved before {time} were marked." |
| Grading | results `state` grading | "Marking your answers... Short answers take a little longer." |
| Grading slow | over 2 minutes | "Marking is taking longer than usual. We'll send you a notification when your results are ready." |
| Other tab | tab lock held elsewhere | "This test is open in another tab or window. Close it there, or continue here." button "Continue here" |
| Results | graded | results view |
| Completed (revisit) | graded, opened later | results plus "You've already taken this test. Each test has one attempt." |
| No mastery yet | `masteryDelta` null | section hidden (Phase 5) |
| Print refused | print before submission | "You can print this test after you submit it." action "Back to the test" |

## Stage variants

| Item | High school | University |
|---|---|---|
| Meta line level | "Grade 11, NSC" | "Second year" |
| Unit noun | subject | course |
| Paper header | student name, subject, grade, curriculum, date | student name, course, study level, institution, date |
| Next step copy | "Practise {topic} in {subject}" | "Practise {topic} in {course}" |

Question content and difficulty are scaled by the backend from the unit level; the runner renders whatever it receives and never shows level wording from the other stage.

## Interactions and edge cases

- Clock: `use-server-clock` stores `offset = serverNow - Date.now()` and a `performance.now()` anchor at each server response; remaining time is `deadlineAt - (serverNowAtAnchor + (performance.now() - anchor))`, so changing the phone clock or the tab sleeping does not change the countdown. It resyncs on every autosave response, on `visibilitychange` to visible and on reconnect.
- At 0 the client stops input, flushes pending answers once and calls submit; if that fails or the phone is offline, the server's auto-submit (BE-PRA-14) is authoritative and the client shows the time-up view when it next reaches the server.
- Autosave: debounced 800 ms per question after the last change, immediate on "Next", "Previous", navigator jump and `pagehide`. Each answer carries an increasing `clientSeq`; the server keeps the highest. Saves run one at a time per question, in order.
- Local store: every change is written synchronously to localStorage under `aptiverse.attempt.<attemptId>` (answers, `clientSeq`, flags, current question) before the network call. On reload the page merges server answers with local ones, preferring the higher `clientSeq`, then replays unsynced ones. The key is deleted on submit success and on results load.
- Offline: inputs stay usable; saves queue; the banner shows; reconnect replays the queue in order, then resyncs the clock. Failed saves retry with backoff 1 s, 2 s, 4 s, up to 30 s.
- Focus monitor: listens to `visibilitychange` and window `blur`; a blur and a hidden event within 1 second count once; not counted while paused, while a runner dialog is open, or before the attempt starts; the count shown is the server's `focusLossCount`. Reports queue and retry like answers. Leaving is never auto-failed.
- Pause (decision 17): untimed tests can always pause and timed tests never can; the API sends `allowPause` accordingly and the page follows it. Offered only when `allowPause`; pausing hides the question (so pausing cannot be used to look things up while the timer stops), stops focus monitoring and freezes the display at `remainingSeconds`.
- Single tab: a `BroadcastChannel("aptiverse-attempt-<id>")` lock; the second tab shows the other-tab view; "Continue here" takes the lock and the first tab switches to the other-tab view. Both tabs share the same server attempt, so no data is lost either way.
- Leaving: in-app links and the browser back button during an active attempt ask "Leave the test? The timer keeps running and your test is submitted when time runs out." `beforeunload` shows the browser prompt.
- Focus mode hides the shell (and with it the tutor entry and nav). The tutor is also refused by the server, so opening `/dashboard/tutor` in another tab shows the blocked state (PG-STU-TUTOR-08).
- Printing during an active attempt is not offered; the print route refuses before submission (questions must not leave the platform before the attempt is done).
- Math: stems, options, passages, answers and explanations all render through `MathText` with `asciiMath` on, so legacy ASCII-math (`x^2`, `sqrt(x)`) and LaTeX (`\frac{a}{b}`) both render. Math input uses MathLive and sends LaTeX.
- Accessibility of timing: the countdown has `role="timer"` with `aria-live="off"`; announcements happen only at 5 minutes and 1 minute (WCAG 2.2.1 is satisfied by the student having been told the limit up front; untimed mode exists for students who need it).
- A test opened by another student's id returns 404; attempt ids from another student return 404 on every endpoint.

## Copy

- Rules (titles and bodies):
  - "Time": "You have {m} minutes. The clock starts when you press Start test and the test submits itself when time runs out." / untimed: "Work at your own pace."
  - "One attempt": "You can take this test once. Your results stay here afterwards."
  - "Stay on this tab": "Switching tabs or apps is recorded. If you need a break, pause first." (without the last sentence when pause is not allowed)
  - "Saved as you go": "Your answers save automatically, even if your connection drops."
  - "Tutor is off": "The AI tutor is turned off until you submit."
- Acknowledge: "I understand. I have one attempt at this test."
- Buttons: "Start test", "Previous", "Next", "Review answers", "Flag for review", "Submit test", "Keep working", "Resume test", "Back to the test"
- Results: "Your results", "{obtained} of {total} marks", "Time taken: {m} min {s} s", "Submitted by you" / "Submitted when time ran out", "You left the test tab {n} times."
- Outcomes: "Correct", "Partly correct", "Incorrect", "Not answered"
- Paper footer: "Aptiverse practice paper. Page {p} of {n}."

## Acceptance criteria

- Given a ready test with no attempt, when the student opens it, then the instructions view shows, "Start test" is disabled until the checkbox is ticked, and no questions are present in the page HTML or network responses.
- Given the student starts a 15-minute test, when the page is reloaded after 5 minutes, then the countdown shows 10:00 within 1 second and every answer given before the reload is restored.
- Given the device clock is moved forward one hour during an attempt, when the countdown renders, then the remaining time is unchanged.
- Given the network is cut after question 3 and restored after question 6, when connectivity returns before the deadline, then answers 4 to 6 reach the server in order and the results include them.
- Given the network is cut and the deadline passes while offline, when the device reconnects, then the time-up-while-offline copy shows and only answers saved before the deadline are marked.
- Given the student switches to another app twice during the attempt, when they return, then the dialog shows the count from the server and the results show "You left the test tab 2 times."
- Given a submitted test, when the student opens its URL again, then the completed view with results shows and no "Start test" control exists; a direct POST to start returns 409.
- Given an active attempt, when a tutor message is sent from another tab, then the API refuses it and the tutor page shows the blocked state.
- Given the deadline passes with the tab closed, when the student returns, then results show "Submitted when time ran out".
- Given a double tap on "Submit test", when the network is slow, then exactly one submit is processed.
- Given a submitted test, when the student opens the print route with `variant=marked`, then an A4 paper with the Aptiverse wordmark, their name, the unit, SAST date, page numbers and their marked answers prints; before submission the route shows the refusal copy.

## Production readiness

- Security: every endpoint checks attempt ownership server-side. Questions are sent only after start and correct answers only in results, so viewing the page source before or during the attempt reveals nothing. One-attempt, deadline and late-answer rules live in the API (BE-PRA-21 covers them), so a modified client cannot extend time or retry. The tutor block is server-side (BE-AI-20). Answer values are length-limited (1 000 characters, LaTeX 2 000) and rendered through `MathText` (KaTeX with `trust: false`, no raw HTML). Local answer storage holds only this attempt's answers and is cleared on submit.
- Performance: instructions view LCP under 2 s on mid-range Android over 3G; route JS under 150 KB gzip with KaTeX CSS loaded on demand and MathLive (large) loaded only when a math question is shown; autosave payloads are one answer each. Results page server-rendered.
- Resilience: localStorage first, then network; ordered replay with `clientSeq`; idempotent start and submit; focus-loss events idempotent per event key; server auto-submit as the safety net; submit retries 3 times with backoff before showing the manual retry; graceful handling of 409 at every step (already submitted, not active, expired).
- Observability: analytics (no answer content, no question text): `practice_attempt_started { format, mode, questionCount }`, `practice_attempt_paused`, `practice_focus_lost { count }`, `practice_attempt_submitted { by: student or deadline, unansweredCount }`, `practice_autosave_failed { status }`, `practice_offline_recovered { queuedCount }`, `practice_results_viewed { scoreBucket }`, `practice_paper_printed { variant }`. Sentry tag `page:runner`, attempt id as a tag, `beforeSend` scrubs request bodies of answer PUTs. Trace propagation on every BFF call so a failed autosave links to its API span.
- Accessibility (WCAG 2.2 AA): radio groups for MCQ with arrow-key navigation; every input labelled with the question number; focus moves to the question heading on navigation; timer announcements limited; navigator states use text and shape, not colour alone; focus mode keeps a visible focus ring and a skip to "Questions".
- Privacy and POPIA: focus-loss data is an integrity signal visible only to the student (and not to parents unless a later consented feature says so); answers and grader feedback are academic personal information of possible minors and stay out of analytics and logs.
- Rollout: behind `practice.runner`, released with `practice.hub`. Internal accounts, then 10% of students, then everyone, gated on the monitoring below. Rollback: flag off shows "Practice tests are paused for maintenance. Your saved answers are safe." while the server keeps auto-submitting live attempts at their deadlines.
- Monitoring: Grafana panels for autosave success rate, autosave p95 latency, submit success rate, share of attempts submitted by deadline, focus-loss distribution, grading time p95 and grading failures. Alerts: autosave failure over 2% for 10 minutes, submit failure over 1%, auto-submit job lag over 60 seconds, grading p95 over 2 minutes.

## Build tasks

Route and state
- [ ] **PG-STU-RUNNER-13** Route `page.tsx` and loader `get-test.ts` (uncached); `initial-view.ts` maps test status and attempt state to a view, with unit tests
- [ ] **PG-STU-RUNNER-14** State machine `runner-machine.ts` (instructions, starting, active, paused, reviewing, submitting, time-up, grading, results, other-tab) with typed events and unit tests
- [ ] **PG-STU-RUNNER-15** `RunnerRoot` client component wiring the machine, hooks and views
- [ ] **PG-STU-RUNNER-40** Focus mode as the `(focus)` route group (DECISIONS E): `(focus)/layout.tsx` with no shell, auth and role checks shared with `(app)`, exit link back to `/dashboard/practice`
- [ ] **PG-STU-RUNNER-41** Not-ready and generation-failed views for tests opened too early

Views
- [ ] **PG-STU-RUNNER-01** Instructions gate view (meta line, rules, acknowledgement checkbox, "Start test")
- [ ] **PG-STU-RUNNER-03** Question view shell (number, marks, stem through `MathText`, previous and next, flag toggle)
- [ ] **PG-STU-RUNNER-21** MCQ answer component (radio group, keyboard, `MathText` options)
- [ ] **PG-STU-RUNNER-22** Short answer component (textarea, character count, 1 000 limit)
- [ ] **PG-STU-RUNNER-23** Math answer component (MathLive wrapper, lazy-loaded, sends LaTeX)
- [ ] **PG-STU-RUNNER-24** Reading passage pane (collapsible on mobile, side column on desktop)
- [ ] **PG-STU-RUNNER-25** Question navigator (sheet on mobile, rail on desktop; answered, unanswered, flagged states)
- [ ] **PG-STU-RUNNER-06** Pause control and paused view (only when `allowPause`; question hidden while paused)
- [ ] **PG-STU-RUNNER-07** Review before submit view with unanswered warning
- [ ] **PG-STU-RUNNER-33** Submitting view including failure and manual retry state
- [ ] **PG-STU-RUNNER-20** Time-up view and the client-side submit at 0
- [ ] **PG-STU-RUNNER-34** Grading view with slow-grading copy
- [ ] **PG-STU-RUNNER-08** Results summary (score ring, marks, time taken, submitted by, integrity note, by-topic bars)
- [ ] **PG-STU-RUNNER-35** Question review accordion with correct answers, explanations and grader feedback through `MathText` (ASCII-math bridge on)
- [ ] **PG-STU-RUNNER-36** Mastery delta block (hidden when null)
- [ ] **PG-STU-RUNNER-37** Results next steps (practise weakest topic, print marked paper, back to practice)
- [ ] **PG-STU-RUNNER-09** Completed state on revisit (results plus one-attempt note, no start control)
- [ ] **PG-STU-RUNNER-38** Other-tab view with "Continue here"
- [ ] **PG-STU-RUNNER-30** Focus-loss warning dialog showing the server count
- [ ] **PG-STU-RUNNER-27** Offline banner

Hooks
- [ ] **PG-STU-RUNNER-16** `use-start-attempt` (idempotency key, 409 already attempted goes to results, 409 active elsewhere)
- [ ] **PG-STU-RUNNER-17** `use-server-clock` (offset plus `performance.now()` anchor, resync on response, visibility and reconnect)
- [ ] **PG-STU-RUNNER-18** `use-countdown` (remaining from deadline and server clock, paused freeze, fires `onExpire` once)
- [ ] **PG-STU-RUNNER-02** Countdown component (server-authoritative display, `role="timer"`, low-time styling)
- [ ] **PG-STU-RUNNER-19** `use-low-time-announcer` (5 and 1 minute announcements only)
- [ ] **PG-STU-RUNNER-26** `use-answer-store` (synchronous localStorage write, `clientSeq`, flags, current question; cleared on submit)
- [ ] **PG-STU-RUNNER-04** `use-autosave` (800 ms debounce, immediate on navigation and `pagehide`, ordered per question, backoff retry, saved indicator)
- [ ] **PG-STU-RUNNER-28** Reload recovery: merge server and local answers by `clientSeq`, replay unsynced
- [ ] **PG-STU-RUNNER-31** `use-online-status` (online events plus failed-request signal)
- [ ] **PG-STU-RUNNER-05** `use-focus-monitor` (visibility and blur, 1-second collapse, off while paused or a dialog is open)
- [ ] **PG-STU-RUNNER-29** `use-focus-loss-reporter` (queued POSTs with per-event idempotency key and retry)
- [ ] **PG-STU-RUNNER-32** `use-pause` (pause and resume calls, server remaining time)
- [ ] **PG-STU-RUNNER-42** `use-submit-attempt` (flush autosave, idempotency key, 3 retries, 409 already submitted as success, double-tap guard)
- [ ] **PG-STU-RUNNER-43** `use-results` (polls BE-PRA-16 while grading: 2 s, then 5 s, 2-minute cap)
- [ ] **PG-STU-RUNNER-44** `use-single-tab-lock` (BroadcastChannel lock and takeover)
- [ ] **PG-STU-RUNNER-39** `use-leave-guard` (in-app navigation confirm and `beforeunload` during an active attempt)

Integrity and print
- [ ] **PG-STU-RUNNER-10** Tutor hidden during the attempt (focus mode removes entry points) and server block verified against BE-AI-20
- [ ] **PG-STU-RUNNER-11** Printable branded paper route `/dashboard/practice/[id]/print`, refused before submission
- [ ] **PG-STU-RUNNER-45** Paper header and footer (wordmark, student name, unit, level, SAST date, page numbers) and A4 print stylesheet
- [ ] **PG-STU-RUNNER-46** Marked paper variant (your answer, correct answer, marks, explanation)

End to end
- [ ] **PG-STU-RUNNER-12** E2E: one attempt only (revisit shows results; second start refused)
- [ ] **PG-STU-RUNNER-47** E2E: auto-submit at the deadline with the tab open and with the tab closed
- [ ] **PG-STU-RUNNER-48** E2E: focus loss counted and shown in results
- [ ] **PG-STU-RUNNER-49** E2E: offline mid-attempt, before and after the deadline
- [ ] **PG-STU-RUNNER-50** E2E: reload mid-attempt restores answers and time
- [ ] **PG-STU-RUNNER-51** E2E: tutor refused during an active attempt

Production readiness
- [ ] **PG-STU-RUNNER-52** Analytics events listed above, with a test that no event payload contains answer or question text
- [ ] **PG-STU-RUNNER-53** Sentry `beforeSend` scrub for answer bodies and attempt-id tagging
- [ ] **PG-STU-RUNNER-54** Flag `practice.runner`, maintenance copy and staged rollout plan
- [ ] **PG-STU-RUNNER-55** Grafana panels and alerts (autosave, submit, auto-submit lag, grading)
- [ ] **PG-STU-RUNNER-56** Bundle work: lazy MathLive and KaTeX CSS; route JS budget 150 KB gzip in Lighthouse CI

Additions from the 43f9faa review
- [ ] **PG-STU-RUNNER-57** Assessment context header on instructions and results: "Practising for this SBA" (high school) or "Practising for this assessment" (university), the assessment title, unit, type, due chip ("Overdue", "Due today", "Due in {n} days") and weight; tests without an assessment show the test title only
- [ ] **PG-STU-RUNNER-58** Exam paper question view: "Section A/B/C" and "{n} marks" chips instead of the topic chip (the topic is a giveaway on a paper); instructions text for the exam format
- [ ] **PG-STU-RUNNER-59** Long-answer component for exam extended questions (8 to 20 row textarea, placeholder "Write your full answer...", 5 000 characters), treated as typed like short answer everywhere
- [ ] **PG-STU-RUNNER-60** Marked-paper results: marks lead ("14/32 marks") with the percent ring weighted by marks, per-question "{awarded}/{available}" chip, partial credit as its own outcome icon, examiner feedback block per question; the memo itself is never sent to the client
- [ ] **PG-STU-RUNNER-61** Unmarked questions (marker unavailable): show "Not marked yet" and exclude them from the total, never a zero; results copy "Some written answers could not be marked yet. Your answers are saved." (43f9faa rule)
- [ ] **PG-STU-RUNNER-62** Flashcards view: flip card, rate "Got it", "Almost", "Missed", progress through the deck, summary of ratings, retake any time; not an attempt, no timer, no focus monitoring
- [ ] **PG-STU-RUNNER-63** Essay view: prompt and marking criteria, draft textarea with local draft save, "Get feedback" (AI feedback against the criteria, metered on the tutor quota), feedback rendered with `Markdown`; not an attempt
- [ ] **PG-STU-RUNNER-64** Answer key gating check: the questions response carries no correct answer, accepted answers or explanation until this student has a submitted attempt (43f9faa fixed a leak where the key sat in the network tab); flashcard backs are exempt

## Quality tasks

- [ ] **PG-STU-RUNNER-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`), `not-found.tsx`; same for `print/`
- [ ] **PG-STU-RUNNER-Q02** Server loaders in `src/features/practice/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-RUNNER-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending, offline and failure states for each
- [ ] **PG-STU-RUNNER-Q04** No empty state (a test always has questions); not-ready and failed views cover tests without questions
- [ ] **PG-STU-RUNNER-Q05** Error copy for start, autosave, submit, grading and print refusal never blames the student and says whether answers are safe
- [ ] **PG-STU-RUNNER-Q06** Forbidden handled as not-found; no upgrade state inside the runner
- [ ] **PG-STU-RUNNER-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-RUNNER-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); bottom bar stays above the keyboard; long LaTeX scrolls inside its own box
- [ ] **PG-STU-RUNNER-Q09** Layout at 1440px (navigator rail, passage column)
- [ ] **PG-STU-RUNNER-Q10** Light and dark both correct (OS-driven), including KaTeX and the print paper (always light)
- [ ] **PG-STU-RUNNER-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-RUNNER-Q12** axe: zero violations in light and dark for every view
- [ ] **PG-STU-RUNNER-Q13** Keyboard pass: full attempt possible with keyboard only; visible focus; one `h1` per view
- [ ] **PG-STU-RUNNER-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering every view
- [ ] **PG-STU-RUNNER-Q15** `generateMetadata` title is the test title; nav "Practice" active (results view)

## Tests

Unit (Vitest, fake timers where relevant):
- `runner-machine.test.ts`: "cannot reach active without acknowledgement", "expire from active goes to time-up", "submit from paused not allowed", "409 already submitted goes to results"
- `initial-view.test.ts`: "no attempt shows instructions", "active attempt resumes", "graded shows completed", "generating shows not ready"
- `use-server-clock.test.ts`: "device clock change does not alter remaining", "resyncs on response"
- `use-countdown.test.ts`: "fires onExpire once", "freezes while paused"
- `use-low-time-announcer.test.ts`: "announces at 300 and 60 seconds only"
- `use-answer-store.test.ts`: "writes before network", "clientSeq increases", "cleared on submit"
- `use-autosave.test.ts`: "debounces 800 ms", "saves immediately on next", "orders saves per question", "backs off on failure", "stops on 409 not active"
- `recovery.test.ts`: "higher clientSeq wins", "unsynced answers replay in order"
- `use-focus-monitor.test.ts`: "blur plus hidden within 1 second counts once", "ignored while paused", "ignored while a dialog is open"
- `use-focus-loss-reporter.test.ts`: "queues offline and replays", "same event key not sent twice"
- `use-submit-attempt.test.ts`: "flushes autosave first", "double tap sends once", "409 treated as success"
- `use-single-tab-lock.test.ts`: "second tab gets other-tab view", "continue here takes over"
- `mcq-answer.test.tsx`, `math-answer.test.tsx`, `question-review.test.tsx`: "renders LaTeX and ASCII math", "explanation shown for incorrect"

Playwright (`web/e2e/student/practice-runner.spec.ts`, server timing driven by a test clock endpoint in non-prod):
- "instructions gate blocks start until acknowledged"
- "student completes a timed test and sees results"
- "revisit shows completed results and no start"
- "auto-submit at deadline with tab open"
- "auto-submit at deadline with tab closed"
- "focus loss counted and shown"
- "offline then online before deadline keeps all answers" (`context.setOffline`)
- "offline past deadline marks only saved answers"
- "reload mid-attempt restores answers and time"
- "second tab shows other-tab view"
- "tutor refused during attempt"
- "print refused before submission, marked paper after"
- "university test shows study level wording"
- "axe clean for every view in light and dark at 360 and 1440"

## Open questions

- BE-PRA-08 must return `questions`, `passages` and saved `answers` when an attempt is active (for reload recovery), and `serverNow` on every attempt response; confirm, or add `GET /practice/attempts/{id}`.
- Decided (17): untimed tests are pausable, timed tests never; the page follows `allowPause` from the API.
- Decided (17): 10 seconds of network grace after the deadline (BE-PRA-14).
- Blank paper printing before an attempt would leak questions; this file allows printing only after submission. Confirm that offline paper practice (print first, then answer on paper) is not needed in v1.
- Decided (DECISIONS E): focus mode is its own `(focus)` route group without the shell, not an `inert` overlay (PG-STU-RUNNER-40).
- A test clock endpoint for E2E (non-prod only) is needed in the API to make deadline tests fast and deterministic.
- 43f9faa marked short answers on ordinary tests by a normalised string match against the expected and accepted answers, and used an AI examiner (one call per paper, marks clamped to the maximum) only on exam papers. BE-PRA-15 says written answers go through `IGrader`; decide whether ordinary short answers keep the cheap string match.
- 43f9faa counted only full marks as "correct" for per-topic mastery (3 of 5 is "not yet correct"). BE-PRA-17 and BE-PRG-10 should keep that rule or define partial credit.
- 43f9faa reported `focusLossCount` once at submit; this file reports each event (BE-PRA-11). Keep both: per-event for live display, the server total is authoritative.
- Partly decided (16): essay feedback is in v1 with its own quota key. Still open: the BE slice for it (an `IGrader` or tutor call) does not exist yet.
- Delete a test (PG-STU-PRACTICE-29) must also remove its attempts, as 43f9faa did, or mastery keeps reading attempts for a test the student can no longer open.
