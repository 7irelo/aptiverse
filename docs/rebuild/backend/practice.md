# Practice module

| | |
|---|---|
| ID range | `BE-PRA-01` to `BE-PRA-21` (original), `BE-PRA-22` to `BE-PRA-46` (splits and additions), `BE-PRA-50` to `BE-PRA-72` (production readiness) |
| Schema | `practice` |
| Projects | `src/Modules/Practice/Aptiverse.Practice`, `src/Modules/Practice/Aptiverse.Practice.Contracts`, `tests/Aptiverse.Practice.UnitTests` |
| Phase | 5 |
| Consumes | `Aptiverse.AiTutor.Contracts` (`IQuestionGenerator`, `IGrader`), `Aptiverse.Academics.Contracts` (`IStudyUnitLookup`), `Aptiverse.Billing.Contracts` (`IUsageMeter`, `IEntitlements`), `Aptiverse.Identity.Contracts` (`AccountDeletionRequested`), `Aptiverse.Notifications.Contracts` (`NotifyUser`) |
| Publishes | `PracticeTestGenerated`, `PracticeTestGenerationFailed`, `PracticeAttemptStarted`, `PracticeAttemptSubmitted`, `PracticeAttemptGraded`; implements `IActiveAttemptLookup`, `IPracticeSummary` |
| Depends on | BE-SK-22, BE-SK-23, BE-SK-26, BE-SK-27, BE-SK-28, BE-ACA-20, BE-AI-09, BE-AI-10, BE-BIL-04 (fake meter until Phase 6) |
| Status | Not started (0 of 69 tasks) |

## Responsibilities and out of scope

Responsible for:

- Practice tests generated per assessment (the study unit and its level are derived from the assessment), in formats that depend on the stage, stored with their questions.
- Generation jobs as Wolverine messages with retries, status polling, quota reserve and confirm or refund.
- LaTeX validation of generated questions and the ASCII-math bridge for legacy content.
- Attempt integrity: one attempt per test, one active attempt per student, server-authoritative timing, `focus_loss_count`, pause for untimed tests only, auto-submit at the deadline by scheduled message.
- Grading: objective questions locally, written answers through `IGrader`, explanations, per-topic accuracy.
- Publishing results for Progress, and answering "does this student have an active attempt" for AiTutor.

Out of scope:

- Model calls and prompts (AiTutor).
- Mastery projections and goals (Progress consumes `PracticeAttemptGraded`).
- Past papers as files (Academics, BE-ACA-60 to 62).
- Printing to PDF: the web app renders the branded paper from BE-PRA-19 data.

## Data model

Schema `practice`. Every table: `id uuid` PK (Guid v7), `created_at`, `updated_at`, `deleted_at`, `xmin`.

### tests

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| user_id | uuid | no | index `(user_id, created_at desc)` filtered `deleted_at is null` |
| study_unit_id | uuid | no | index; no FK (Academics schema) |
| level_snapshot | varchar(40) | no | the unit's level at generation time (for example `grade_12`, `year_1`) |
| stage_snapshot | varchar(16) | no | check `in ('high_school','tertiary')` |
| title | varchar(160) | no | |
| format | varchar(16) | no | check `format in ('mcq','short_answer','structured','essay','flashcards','reading','exam_paper')`; `reading` only for high-school units |
| passage | text | yes | reading comprehension passage (max 8000 chars), `reading` only |
| mode | varchar(16) | no | check `mode in ('timed','untimed')`; `exam_paper` is always timed, `flashcards` always untimed |
| duration_minutes | int | yes | required when timed; check `duration_minutes between 5 and 180`; for `exam_paper` equals `total_marks` (a minute per mark) |
| status | varchar(16) | no | check `status in ('generating','ready','failed','archived')`; index `(user_id, status)` |
| source | varchar(16) | no | check `source in ('ai','legacy')` |
| topics | text[] | no | requested topics, each max 80 chars, max 8 entries |
| question_count | int | no | check `between 0 and 40` |
| difficulty | varchar(16) | no | check `in ('foundation','core','stretch')`; relative to the unit's level |
| focus_on_weakest | boolean | no | topics were chosen by the server from the weakest topics |
| assessment_id | uuid | no | the assessment the test was generated for (no FK, Academics); index |
| total_marks | int | no | check `>= 0` |
| generation_job_id | uuid | yes | FK `generation_jobs.id`, index |
| model | varchar(100) | yes | |
| prompt_version | int | yes | |

### questions

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| test_id | uuid | no | FK `tests.id` cascade; unique `(test_id, position)` |
| position | int | no | check `>= 1` |
| kind | varchar(16) | no | check `kind in ('mcq','numeric','short','written','essay','flashcard')` |
| stem | text | no | check `char_length(stem) <= 4000` |
| options | jsonb | yes | array of strings, required for `mcq` (2 to 6 options, each max 500 chars) |
| answer_index | int | yes | required for `mcq`; never returned before grading |
| expected_answer | text | yes | required for non-mcq; max 2000 |
| acceptable_answers | jsonb | no | array of strings, default `[]` |
| numeric_tolerance | numeric(12,6) | yes | `numeric` only |
| explanation | text | no | max 4000 |
| topic | varchar(80) | no | index `(test_id, topic)` |
| marks | int | no | check `between 1 and 20` |
| section | varchar(40) | yes | paper section label (for example "Section A") |
| math_format | varchar(16) | no | check `in ('latex','ascii_legacy')` |
| latex_valid | boolean | no | false only for legacy rows not yet bridged |

### generation_jobs

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| user_id | uuid | no | index `(user_id, status)` |
| test_id | uuid | no | FK `tests.id`, unique |
| status | varchar(16) | no | check `in ('queued','running','succeeded','failed')`; partial unique `(user_id) where status in ('queued','running')` (one active generation per student) |
| attempts_made | int | no | check `between 0 and 5` |
| claimed_at | timestamptz | yes | claim semantics: a running job with a claim older than 5 minutes is reclaimable |
| finished_at | timestamptz | yes | |
| last_error_code | varchar(64) | yes | |
| quota_reservation_id | uuid | no | Billing reservation, no FK |
| request | jsonb | no | `{ assessmentId, studyUnitId, format, topics[], mode, difficulty, questionCount, paperMarks }` (free-form AI payload is allowed jsonb per 3.4) |

### attempts

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| test_id | uuid | no | FK `tests.id`; unique `(test_id)` (one attempt per test, ever, including soft-deleted) |
| user_id | uuid | no | partial unique `(user_id) where status in ('in_progress','paused')` (one active attempt per student); index `(user_id, created_at desc)` |
| status | varchar(20) | no | check `in ('in_progress','paused','submitted','grading','graded')` |
| started_at | timestamptz | no | server clock only |
| deadline_at | timestamptz | yes | timed only; `started_at + duration` (timed attempts cannot pause, so the deadline never moves) |
| paused_at | timestamptz | yes | |
| pause_count | int | no | check `>= 0` |
| paused_seconds_total | int | no | check `>= 0`; untimed only, excluded from seconds on task |
| submitted_at | timestamptz | yes | |
| submit_source | varchar(16) | yes | check `in ('student','deadline')` |
| focus_loss_count | int | no | check `>= 0` |
| last_focus_loss_at | timestamptz | yes | |
| score_marks | int | yes | null until graded |
| max_marks | int | no | |
| score_percent | numeric(5,2) | yes | null until graded |
| partially_graded | boolean | no | true when some answers are "not marked yet" |
| examiner_feedback | text | yes | overall feedback on a marked paper, max 3000 |
| graded_at | timestamptz | yes | |

### answers

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| attempt_id | uuid | no | FK `attempts.id` cascade; unique `(attempt_id, question_id)` |
| question_id | uuid | no | FK `questions.id`, index |
| selected_index | int | yes | mcq |
| text_answer | text | yes | max 5000 chars |
| revision | int | no | incremented per save; client sends the last seen revision |
| saved_at | timestamptz | no | server clock |
| is_correct | boolean | yes | null until graded |
| awarded_marks | int | yes | null until graded; check `>= 0` |
| feedback | text | yes | max 2000 |
| graded_by | varchar(8) | yes | check `in ('auto','ai','pending')` |
| needs_review | boolean | no | default false |
| self_rating | varchar(12) | yes | flashcards only: check `in ('knew','unsure','did_not_know')`; flashcards are never scored |

### attempt_topic_scores

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| attempt_id | uuid | no | FK `attempts.id` cascade; unique `(attempt_id, topic)` |
| topic | varchar(80) | no | |
| questions_total | int | no | |
| questions_correct | int | no | |
| marks_available | int | no | excludes pending written answers |
| marks_awarded | int | no | |

## Contracts

```
public interface IActiveAttemptLookup
{
    Task<ActiveAttempt?> GetActiveAttemptAsync(Guid userId, CancellationToken ct);
}
public sealed record ActiveAttempt(Guid AttemptId, Guid TestId, DateTimeOffset? DeadlineAt, bool Paused);

public interface IPracticeSummary
{
    Task<PracticeSummary> GetAsync(Guid userId, DateTimeOffset since, CancellationToken ct);
}
public sealed record PracticeSummary(int TestsCompleted, decimal? AverageScorePercent, int MinutesOnTask,
    DateTimeOffset? LastCompletedAt);

public sealed record PracticeTestGenerated(Guid TestId, Guid UserId, Guid StudyUnitId, int QuestionCount, DateTimeOffset OccurredAt);
public sealed record PracticeTestGenerationFailed(Guid TestId, Guid UserId, string ErrorCode, DateTimeOffset OccurredAt);
public sealed record PracticeAttemptStarted(Guid AttemptId, Guid TestId, Guid UserId, string Mode, DateTimeOffset? DeadlineAt, DateTimeOffset OccurredAt);
public sealed record PracticeAttemptSubmitted(Guid AttemptId, Guid UserId, string SubmitSource, int FocusLossCount, DateTimeOffset OccurredAt);
public sealed record PracticeAttemptGraded(Guid AttemptId, Guid TestId, Guid UserId, Guid StudyUnitId,
    int ScoreMarks, int MaxMarks, decimal ScorePercent, bool PartiallyGraded, int SecondsOnTask,
    IReadOnlyList<TopicAccuracy> Topics, DateTimeOffset SubmittedAt, DateTimeOffset OccurredAt);
public sealed record TopicAccuracy(string Topic, int QuestionsTotal, int QuestionsCorrect, int MarksAvailable, int MarksAwarded);
```

Internal messages (not in Contracts, never cross modules): `RunGenerationJob(JobId)`, `AutoSubmitAttempt(AttemptId, DeadlineAt)`, `GradeWrittenAnswers(AttemptId)`.

## Foundation tasks

- [ ] **BE-PRA-01** Module projects, `practice` schema, `PracticeDbContext`, design-time factory, registration in architecture tests
- [ ] **BE-PRA-22** Permission constants `practice.generate`, `practice.take`, `practice.read`; role map: student gets all three
- [ ] **BE-PRA-23** `PracticeOptions` (`ValidateOnStart`): default question count (10), max (40), network grace seconds after the deadline for in-flight answers (10), untimed idle hours before the tutor block lifts (24), job reclaim minutes (5), max generation attempts (3)
- [ ] **BE-PRA-02** `tests`, `questions`, `attempts`, `answers`, `attempt_topic_scores` entities, configurations, check constraints via `CheckConstraints.In`, partial unique indexes, migration
- [ ] **BE-PRA-03** `generation_jobs` table and `RunGenerationJob` Wolverine message on a durable local queue with retry policy (3 attempts, backoff 10 s, 60 s, 300 s); claim semantics ported (status `running` plus `claimed_at`, reclaim after timeout, `xmin` guards double claim)
- [ ] **BE-PRA-29** `RunGenerationJobHandler`: loads the unit through `IStudyUnitLookup`, calls `IQuestionGenerator`, validates LaTeX (BE-PRA-06), stores questions and totals, sets test `ready`, confirms the reservation, publishes `PracticeTestGenerated`; on final failure sets `failed`, refunds, publishes `PracticeTestGenerationFailed`
- [ ] **BE-PRA-06** LaTeX validator (pure): paired `$` and `$$` delimiters, balanced braces, command allowlist matching KaTeX's supported functions, no `\href`, `\url`, `\includegraphics` or `\html*`; invalid questions are regenerated once through the AI retry path, then dropped (test fails if fewer than 80% of requested questions survive)
- [ ] **BE-PRA-26** ASCII-math bridge (pure port of the old web converter): `x^2`, `sqrt(x)`, `a/b`, `pi`, `>=` to LaTeX; used by MIG-10 for legacy questions and at read time for rows with `math_format = 'ascii_legacy'`; table-driven unit tests from old content samples
- [ ] **BE-PRA-15** Grading orchestration and objective grading (pure): mcq exact index, numeric within tolerance, short answers normalised (case, whitespace, unicode minus, trailing units) against expected plus acceptable answers; explanations attached; computes `attempt_topic_scores`
- [ ] **BE-PRA-24** Written grading via `IGrader`: `GradeWrittenAnswers` message, retried 3 times; part marks and examiner feedback per answer plus overall `examiner_feedback`; on final failure the answers are `graded_by = 'pending'` and shown as "not marked yet" (never zero), `partially_graded = true`
- [ ] **BE-PRA-43** Essay feedback quota: each essay answer reserves `practice.essay_feedback` (1) at submit, confirmed on marking, refunded on failure; when exhausted the essay is "not marked yet" with reason `quota` and the student can request marking later (BE-PRA-44)
- [ ] **BE-PRA-44** `POST /practice/attempts/{id}/answers/{questionId}/mark`: retry marking for a not-marked-yet answer (reserves quota again, idempotent per answer, `409 practice.already_marked`)
- [ ] **BE-PRA-45** Flashcards: attempts on `flashcards` tests store `self_rating` per card, are never scored, publish no `PracticeAttemptGraded` mastery data (self-ratings are not evidence), and have no focus-loss or timer rules
- [ ] **BE-PRA-17** Publish `PracticeAttemptGraded` through the outbox in the same transaction that writes the final grade (once per attempt, guarded by status transition `grading` to `graded`)
- [ ] **BE-PRA-18** `IActiveAttemptLookup` implementation (single indexed query on the partial unique index; paused counts as active)
- [ ] **BE-PRA-34** `IPracticeSummary` implementation for Family and Progress dashboards (null average when no graded attempts)
- [ ] **BE-PRA-32** `PracticeTestGenerated` and `PracticeTestGenerationFailed` handlers publishing `NotifyUser` (in-app "Your practice test is ready" with link `/dashboard/practice/{id}`)

## Slices

Group `/practice`, tag `Practice`. Ownership: every test and attempt query filters by `user_id = current user`; not owned returns 404.

### BE-PRA-04  POST /practice/tests/generate

| | |
|---|---|
| Operation id | `generatePracticeTest` |
| Permission | `practice.generate` |
| Entitlement | feature `ai_practice`; quota `practice.generate` (1 per test) |
| Rate limit | `ai` group, policy `practice-generate` (5 per minute per user) |
| Idempotency | required `Idempotency-Key`; replay returns the same `202` body and never reserves twice |
| Metric | `aptiverse.practice.generation.requested` (counter, tags `mode`, `stage`) |
| Log fields | `UserId`, `TestId`, `JobId`, `StudyUnitId`, `TopicCount`, `QuestionCount`, `Mode`, `ReservationId` |

Request:

| Field | Rules |
|---|---|
| `assessmentId` | required uuid; an upcoming assessment of the student; the study unit, its level and stage are derived from it (old app behaviour: generation is per assessment) |
| `format` | `mcq`, `short_answer`, `structured`, `essay`, `flashcards`, `reading` (high-school units only, `400 practice.format_not_available`), `exam_paper` |
| `topics` | 0 to 8 strings (at least 1 unless `focusOnWeakest`; defaults to the assessment's topics), each 1 to 80 chars, trimmed, no markup; unknown topics allowed (emergent registry) |
| `mode` | `timed` or `untimed`; forced `timed` for `exam_paper` and `untimed` for `flashcards` |
| `difficulty` | `foundation`, `core` or `stretch`; default `core` (always relative to the unit's level, so a first-year course never gets high-school questions) |
| `focusOnWeakest` | bool, default false; when true the server picks up to 3 weakest topics in the unit from `attempt_topic_scores` (falls back to unpractised registry topics when there is no evidence) |
| `durationMinutes` | required when timed and not `exam_paper`, 5 to 180; null otherwise |
| `questionCount` | 5 to 40, default 10; not used for `exam_paper` |
| `paperMarks` | `exam_paper` only: 30 to 150; the paper is sized by marks and timed at a minute per mark |

Rules: one active generation per student (`409 practice.generation_in_progress` with `jobId`, so another device can recover it via BE-PRA-42). Failed generations are always refunded (the old app never refunded them).

Response `202 GenerationAccepted`: `testId`, `jobId`, `status: "queued"`, `statusUrl`.

Failures: `400` validation; `400 practice.format_not_available`; `403 practice.feature_required`; `404 practice.assessment_not_found`; `409 practice.generation_in_progress`; `429 practice.quota_exhausted` (with `resetsAt`); `429` rate limit; `503 practice.quota_unavailable` (fails closed).

Events: none at request time (`PracticeTestGenerated` later).

- [ ] **BE-PRA-04** `POST /practice/tests/generate`
  - [ ] Endpoint with `RequirePermission`, `RequireFeature("ai_practice")`, `WithValidation`
  - [ ] `GeneratePracticeTestRequest`, `GenerationAccepted`
  - [ ] Validator (rules above, cross-field mode and duration)
  - [ ] Handler: reserve quota, insert test (`generating`) and job (`queued`), publish `RunGenerationJob` through the outbox, one transaction for the rows
  - [ ] Unit tests: validator matrix, refund when the outbox write fails
  - [ ] Integration tests: happy per format, reading on a tertiary unit 400, exam paper duration equals marks, second concurrent generation 409, feature missing 403, unknown assessment 404, quota exhausted 429, idempotent replay, failed job refunds

### BE-PRA-05  GET /practice/tests/{id}/status

| | |
|---|---|
| Operation id | `getPracticeTestStatus` |
| Permission | `practice.read` |
| Entitlement | none |
| Rate limit | `default` (polling every 2 s is within limits) |
| Idempotency | safe read |
| Metric | `aptiverse.practice.generation.status_polls` (counter) |
| Log fields | `UserId`, `TestId`, `Status` |

Response `200 GenerationStatus`: `testId`, `status` (`queued`, `running`, `ready`, `failed`), `attemptsMade`, `errorCode` (when failed: `practice.generation_failed`, `practice.generation_invalid_output`), `readyAt`. Includes `Cache-Control: no-store`.

Failures: `404`.

- [ ] **BE-PRA-05** `GET /practice/tests/{id}/status`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (maps job and test status to one public status)
  - [ ] Unit tests: status mapping table
  - [ ] Integration tests: each status, 404 for another user

### BE-PRA-42  GET /practice/generations/active

| | |
|---|---|
| Operation id | `getActiveGeneration` |
| Permission | `practice.generate` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: no-store` |
| Metric | `aptiverse.practice.generation.active_reads` (counter, tag `hasActive`) |
| Log fields | `UserId`, `JobId` |

Cross-device recovery: returns `200 { jobId, testId, assessmentId, format, status, startedAt }` for the student's queued or running generation, or `204`.

- [ ] **BE-PRA-42** Active generation read
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (empty)
  - [ ] Handler
  - [ ] Unit tests: none beyond mapping
  - [ ] Integration tests: none 204, queued, running

### BE-PRA-07  GET /practice/tests

| | |
|---|---|
| Operation id | `listPracticeTests` |
| Permission | `practice.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.practice.tests.list.duration` |
| Log fields | `UserId`, `Filter`, `ResultCount` |

Request (query): `studyUnitId` optional, `status` optional (`ready`, `generating`, `failed`), `attempted` optional bool, `page`, `pageSize` 1 to 50.

Response `200 PagedResult<PracticeTestSummary>`: `id`, `title`, `studyUnitId`, `mode`, `durationMinutes`, `questionCount`, `status`, `createdAt`, `latestAttempt` (`attemptId`, `status`, `scorePercent` nullable, `submittedAt`) or null.

- [ ] **BE-PRA-07** `GET /practice/tests`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (single query with left join to attempts, no N+1)
  - [ ] Unit tests: filter composition
  - [ ] Integration tests: filters, paging, another user's tests excluded

### BE-PRA-08  GET /practice/tests/{id}

| | |
|---|---|
| Operation id | `getPracticeTest` |
| Permission | `practice.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.practice.tests.get.duration` |
| Log fields | `UserId`, `TestId` |

Response `200 PracticeTestInstructions`: `id`, `title`, `studyUnitId`, `mode`, `durationMinutes`, `questionCount`, `totalMarks`, `topics`, `difficulty`, `pauseAllowed` (true only for untimed), `status`, `serverNow`, `attempt` (null, or `{ attemptId, status }`), and `activeAttempt` (the full `AttemptState` of BE-PRA-09 with questions, saved answers, `remainingSeconds` and `serverNow`, only while this test's attempt is `in_progress` or `paused`, so a reload of the runner recovers from one call). Before an attempt exists, and after submission, it never includes stems, options, answers or explanations (results come from BE-PRA-16).

Failures: `404`; `409 practice.test_not_ready` is not an error here (status is returned).

- [ ] **BE-PRA-08** `GET /practice/tests/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: response has no answer fields (reflection test on the record); `activeAttempt` only while active
  - [ ] Integration tests: happy, 404 for another user, JSON contains no `answerIndex` or `expectedAnswer`, reload during an attempt returns saved answers and `serverNow`

### BE-PRA-28  DELETE /practice/tests/{id}

| | |
|---|---|
| Operation id | `archivePracticeTest` |
| Permission | `practice.generate` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | second delete returns `204` |
| Metric | `aptiverse.practice.tests.archived` (counter) |
| Log fields | `UserId`, `TestId`, `HadAttempt` |

Rules: a test with an attempt is archived (status `archived`, still visible in history and results); a test without an attempt is soft-deleted. No quota refund.

Failures: `404`; `409 practice.attempt_active` when the test's attempt is in progress or paused.

- [ ] **BE-PRA-28** `DELETE /practice/tests/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: archive versus delete branch
  - [ ] Integration tests: happy both branches, active attempt 409, 404

### BE-PRA-09  POST /practice/tests/{id}/attempts

| | |
|---|---|
| Operation id | `startPracticeAttempt` |
| Permission | `practice.take` |
| Entitlement | none (charged at generation) |
| Rate limit | `default` |
| Idempotency | the unique `(test_id)` index makes a second start return `409 practice.attempt_exists` with the existing attempt id in the problem extensions; a retried start by the same client within 10 s with the same `Idempotency-Key` returns the original `201` |
| Metric | `aptiverse.practice.attempts.started` (counter, tags `mode`, `stage`) |
| Log fields | `UserId`, `TestId`, `AttemptId`, `Mode`, `DeadlineAt` |

Request: empty body. Any client time field is ignored by design.

Behaviour: `started_at = IClock.UtcNow`; `deadline_at = started_at + duration` when timed; schedules `AutoSubmitAttempt(attemptId, deadlineAt)` at `deadline_at + grace`; publishes `PracticeAttemptStarted`.

Response `201 AttemptState` (shared with BE-PRA-27): `attemptId`, `status`, `startedAt`, `deadlineAt`, `serverNow`, `remainingSeconds` (null for untimed), `paused`, `pausedSecondsTotal`, `focusLossCount`, `questions[]` (`id`, `position`, `kind`, `stem`, `options`, `marks`, `topic`, `section`, `mathFormat`), `answers[]` (`questionId`, `selectedIndex`, `textAnswer`, `revision`).

Failures: `404`; `409 practice.test_not_ready`; `409 practice.attempt_exists`; `409 practice.other_attempt_active` (partial unique index on user, with the active attempt id); `409 practice.test_archived`.

- [ ] **BE-PRA-09** `POST /practice/tests/{id}/attempts`
  - [ ] Endpoint
  - [ ] Records (`AttemptState` shared type)
  - [ ] Validator (route id)
  - [ ] Handler (insert, schedule message, publish event, one transaction; unique violations mapped to the 409 codes, never a 500)
  - [ ] Unit tests: deadline maths from a fake clock
  - [ ] Integration tests: happy, second start 409, other active attempt 409, not ready 409, scheduled message persisted in `wolverine` tables

### BE-PRA-27  GET /practice/attempts/{id}

| | |
|---|---|
| Operation id | `getPracticeAttempt` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.practice.attempts.get.duration` |
| Log fields | `UserId`, `AttemptId`, `Status`, `RemainingSeconds` |

Response `200 AttemptState` while active (used to resume after reload, with `serverNow` so the client clock is never trusted); once submitted or graded returns `200 AttemptState` with `status` and `resultsUrl` and no stems (results come from BE-PRA-16).

Failures: `404`.

- [ ] **BE-PRA-27** `GET /practice/attempts/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (remaining time computed server-side)
  - [ ] Unit tests: remaining time for timed, paused state for untimed
  - [ ] Integration tests: active, submitted, 404

### BE-PRA-10  PUT /practice/attempts/{id}/answers/{questionId}

| | |
|---|---|
| Operation id | `saveAttemptAnswer` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `practice-autosave` (120 per minute per user) |
| Idempotency | PUT with `revision`: saving revision n when the stored revision is n returns `200` with no change; stale revision returns `409` |
| Metric | `aptiverse.practice.answers.saved` (counter, tag `kind`), `aptiverse.practice.answers.rejected_late` (counter) |
| Log fields | `UserId`, `AttemptId`, `QuestionId`, `Revision`, `Outcome` (never answer text) |

Request: `selectedIndex` int (mcq, within options range) or `textAnswer` string max 5000 (non-mcq), exactly one set; `baseRevision` int >= 0.

Rules: attempt must be `in_progress` (not paused); `now <= deadline_at + grace` for timed; question must belong to the attempt's test.

Response `200 SavedAnswer`: `questionId`, `revision`, `savedAt`.

Failures: `400`; `404` (attempt or question); `409 practice.attempt_not_active`; `409 practice.attempt_paused`; `409 practice.deadline_passed`; `409 practice.revision_conflict` (with current revision).

- [ ] **BE-PRA-10** `PUT /practice/attempts/{id}/answers/{questionId}`
  - [ ] Endpoint (body cap 8 KB)
  - [ ] Records
  - [ ] Validator (exactly one answer field, kind-specific rules checked in handler)
  - [ ] Handler (upsert on unique `(attempt_id, question_id)`)
  - [ ] Unit tests: deadline boundary at grace, revision logic
  - [ ] Integration tests: happy, late save 409, paused 409, question from another test 404, revision conflict

### BE-PRA-11  POST /practice/attempts/{id}/focus-loss

| | |
|---|---|
| Operation id | `reportFocusLoss` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `practice-focus` (30 per minute per user); events within 2 s of the previous one are coalesced server-side |
| Idempotency | not idempotent by design; coalescing prevents bursts double counting |
| Metric | `aptiverse.practice.focus_loss` (counter, tag `mode`) |
| Log fields | `UserId`, `AttemptId`, `FocusLossCount` |

Request: `kind` in `visibility_hidden|window_blur` (informational).

Response `200 { focusLossCount }`. Count is shown on results and passed in `PracticeAttemptSubmitted`; it never auto-fails an attempt (no punitive behaviour, de-gamified principle).

Failures: `404`; `409 practice.attempt_not_active`.

- [ ] **BE-PRA-11** `POST /practice/attempts/{id}/focus-loss`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (atomic `update ... set focus_loss_count = focus_loss_count + 1` with coalescing on `last_focus_loss_at`)
  - [ ] Unit tests: coalescing window
  - [ ] Integration tests: increments, coalesces, rejected after submit

### BE-PRA-12  POST /practice/attempts/{id}/pause

| | |
|---|---|
| Operation id | `pausePracticeAttempt` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | pausing a paused attempt returns `200` with the current state |
| Metric | `aptiverse.practice.attempts.paused` (counter) |
| Log fields | `UserId`, `AttemptId`, `PauseCount` |

Rules: untimed tests only (timed tests run under exam conditions and cannot pause, which keeps the deadline fixed). Sets `paused_at` and increments `pause_count`. While paused, saves are refused, the tutor block stays on, and paused time is excluded from seconds on task.

Response `200 AttemptState`.

Failures: `404`; `409 practice.pause_not_allowed` (timed test); `409 practice.attempt_not_active`.

- [ ] **BE-PRA-12** `POST /practice/attempts/{id}/pause`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: rules matrix
  - [ ] Integration tests: happy on untimed, timed 409, idempotent second pause, save while paused 409

### BE-PRA-25  POST /practice/attempts/{id}/resume

| | |
|---|---|
| Operation id | `resumePracticeAttempt` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | resuming an in-progress attempt returns `200` |
| Metric | `aptiverse.practice.attempts.resumed` (counter) |
| Log fields | `UserId`, `AttemptId`, `PausedSeconds` |

Behaviour: adds the paused duration to `paused_seconds_total` and clears `paused_at`. Untimed tests have no deadline, so nothing is rescheduled.

Response `200 AttemptState`.

- [ ] **BE-PRA-25** `POST /practice/attempts/{id}/resume`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: paused seconds accounting
  - [ ] Integration tests: happy, idempotent, seconds on task excludes the pause

### BE-PRA-13  POST /practice/attempts/{id}/submit

| | |
|---|---|
| Operation id | `submitPracticeAttempt` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | submitting a submitted attempt returns `200` with the current status (no second grading) |
| Metric | `aptiverse.practice.attempts.submitted` (counter, tag `source`), `aptiverse.practice.attempt.seconds_on_task` (histogram) |
| Log fields | `UserId`, `AttemptId`, `SubmitSource`, `AnsweredCount`, `FocusLossCount` |

Rules: attempt `in_progress` or `paused`; for timed attempts `now <= deadline_at + grace` (grace is a 10 second network allowance for in-flight requests), otherwise `409 practice.deadline_passed` (the auto-submit owns it). Transition to `submitted`, run objective grading inline, then `grading` and enqueue `GradeWrittenAnswers` when written answers exist, otherwise straight to `graded`.

Response `200 SubmitResult`: `attemptId`, `status` (`grading` or `graded`), `resultsUrl`.

Events: `PracticeAttemptSubmitted`; `PracticeAttemptGraded` when no written answers.

- [ ] **BE-PRA-13** `POST /practice/attempts/{id}/submit`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (status guard with `xmin`; concurrent submit and auto-submit produce exactly one transition)
  - [ ] Unit tests: transition table
  - [ ] Integration tests: happy objective-only, with written answers, late 409, double submit idempotent

### BE-PRA-16  GET /practice/attempts/{id}/results

| | |
|---|---|
| Operation id | `getPracticeAttemptResults` |
| Permission | `practice.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.practice.results.get.duration` |
| Log fields | `UserId`, `AttemptId`, `Status` |

Response `200 AttemptResults` (a marked paper): `attemptId`, `testId`, `status`, `scoreMarks` (null while any answer is not marked yet), `maxMarks`, `scorePercent` (null likewise, never zero), `markedMarks` (marks available on the marked part), `partiallyGraded`, `examinerFeedback`, `submittedAt`, `submitSource`, `secondsOnTask`, `focusLossCount`, `topics[]` (accuracy per topic), `questions[]` with `stem`, `options`, `yourAnswer`, `correctAnswer`, `isCorrect`, `awardedMarks` (part marks allowed, null with `markingStatus: "not_marked_yet"` when marking failed or the essay feedback quota was exhausted), `marks`, `explanation`, `feedback` (examiner-style), `markingStatus` (`marked`, `not_marked_yet`, `self_rated` for flashcards). Answer keys (`correctAnswer`, `explanation`, memo) are never sent before submission.

Failures: `404`; `409 practice.results_not_ready` while `in_progress` or `paused` (answers never leak before submission).

- [ ] **BE-PRA-16** `GET /practice/attempts/{id}/results`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: pending written answers rendering
  - [ ] Integration tests: graded, grading, in-progress 409, 404

### BE-PRA-19  GET /practice/tests/{id}/print

| | |
|---|---|
| Operation id | `getPracticeTestPrint` |
| Permission | `practice.read` |
| Entitlement | feature `practice.print` (decide in open question 3; free by default) |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.practice.print.requests` (counter, tag `withMemo`) |
| Log fields | `UserId`, `TestId`, `WithMemo` |

Request (query): `withMemo` bool, default false. Decision: the blank paper is printable only after the test's attempt is submitted (stems are never exposed before an attempt starts, and printing during an attempt would let a student work offline past the timer); the memo only after grading.

Response `200 PrintablePaper`: header (`title`, unit name, level label, `totalMarks`, `durationMinutes`, student display name from the session claims), `questions[]` with marks, and `memo[]` when allowed.

Failures: `404`; `409 practice.print_locked` (no submitted attempt yet); `409 practice.memo_locked` (memo before grading).

- [ ] **BE-PRA-19** `GET /practice/tests/{id}/print`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: print and memo lock rules
  - [ ] Integration tests: before attempt 409, after submit OK, memo after grading, memo locked 409

### BE-PRA-20  GET /practice/recommended

| | |
|---|---|
| Operation id | `getRecommendedPractice` |
| Permission | `practice.read` |
| Entitlement | none (generation itself is gated) |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.practice.recommended.served` (counter, tag `hasEvidence`) |
| Log fields | `UserId`, `RecommendationCount` |

Response `200 RecommendedPractice`: `items[]` of `{ studyUnitId, topic, reason ("lowest accuracy in last 30 days", "not practised yet"), accuracyPercent (nullable), lastPractisedAt (nullable) }`, max 5. Uses this module's `attempt_topic_scores` (recency-weighted); when there is no evidence, returns topics from `IStudyUnitLookup` with `accuracyPercent = null`, never zero.

- [ ] **BE-PRA-20** `GET /practice/recommended`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: ranking, null for no evidence
  - [ ] Integration tests: no evidence, with evidence

### BE-PRA-40  GET /practice/attempts/active

| | |
|---|---|
| Operation id | `getActivePracticeAttempt` |
| Permission | `practice.take` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: no-store` |
| Metric | `aptiverse.practice.attempts.active_reads` (counter, tag `hasActive`) |
| Log fields | `UserId`, `AttemptId` |

HTTP read of the same fact `IActiveAttemptLookup` gives AiTutor, for the shell banner ("You have a test in progress") and the dashboard. Response `200 ActiveAttemptView`: `attemptId`, `testId`, `testTitle`, `mode`, `deadlineAt`, `remainingSeconds`, `paused`, `serverNow`; or `204` when none.

- [ ] **BE-PRA-40** `GET /practice/attempts/active`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (empty)
  - [ ] Handler (reuses the lookup query)
  - [ ] Unit tests: remaining time
  - [ ] Integration tests: none 204, active, paused untimed

## Error codes

Stable strings in the ProblemDetails `code` extension; the runner switches on them (contract test BE-PRA-41).

| Code | HTTP | Meaning |
|---|---|---|
| `practice.feature_required` | 403 | No `ai_practice` entitlement |
| `practice.quota_exhausted` | 429 | Generation quota used (`resetsAt`) |
| `practice.quota_unavailable` | 503 | Meter unreadable; fails closed |
| `practice.study_unit_not_found` | 404 | Unit not owned |
| `practice.test_not_ready` | 409 | Still generating or failed |
| `practice.test_archived` | 409 | Archived test cannot be started |
| `practice.attempt_exists` | 409 | One attempt per test (`attemptId` extension) |
| `practice.other_attempt_active` | 409 | Another test is in progress (`attemptId` extension) |
| `practice.attempt_active` | 409 | Cannot archive during an attempt |
| `practice.attempt_not_active` | 409 | Attempt already submitted |
| `practice.attempt_paused` | 409 | Resume before saving |
| `practice.pause_not_allowed` | 409 | Timed tests cannot pause |
| `practice.deadline_passed` | 409 | Past deadline plus 10 s grace; auto-submit owns it |
| `practice.revision_conflict` | 409 | Stale autosave revision (`currentRevision`) |
| `practice.results_not_ready` | 409 | Attempt not submitted |
| `practice.print_locked` / `practice.memo_locked` | 409 | Print before submission, memo before grading |
| `practice.generation_in_progress` | 409 | One active generation per student (`jobId`) |
| `practice.format_not_available` | 400 | Format not available for the stage (reading is high school only) |
| `practice.assessment_not_found` | 404 | Assessment not owned or not upcoming |
| `practice.already_marked` | 409 | Marking retry on a marked answer |
| `practice.concurrency_conflict` | 409 | `xmin` mismatch |

## Background work

- [ ] **BE-PRA-14** `AutoSubmitAttempt` scheduled message: if the attempt is `in_progress` and `deadline_at` matches the message, submit with `submit_source = 'deadline'` using answers saved up to the deadline; timed attempts cannot pause; stale or already submitted messages are no-ops; handler is idempotent
- [ ] **BE-PRA-30** Time-on-task accounting (pure): `seconds_on_task = submitted_at - started_at - paused_seconds_total`, capped at the duration for timed tests; used in `PracticeAttemptGraded` and `IPracticeSummary`
- [ ] **BE-PRA-31** Job reclaim safety net: on Worker start and every 10 minutes (scheduled message chain, not a loop), jobs `running` with `claimed_at` older than the reclaim window are requeued; jobs at max attempts are failed and refunded
- [ ] **BE-PRA-33** `AccountDeletionRequested` handler: soft-deletes the user's tests, attempts and answers, hard purge after 30 days via a scheduled message
- [ ] **BE-PRA-35** Data export contributor for BE-IDN-37 (tests, attempts, answers, scores as JSON)
- [ ] **BE-PRA-39** Abandoned untimed attempts: untimed attempts with no save for 14 days stay `in_progress` but stop counting as active for the tutor block after 24 hours idle (see open question 2)

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Spoofing | All endpoints | JWT, permissions, ownership filters | BE-PRA-50 |
| Tampering: client clock | Start, save, submit | Server clock only; client time fields ignored; deadline from DB | BE-PRA-37 |
| Tampering: second attempt or parallel attempts | Start | Unique `(test_id)` and partial unique `(user_id)` active index | BE-PRA-21, BE-PRA-38 |
| Tampering: late answers | Save, submit | Deadline plus grace enforced in the handler; tests at the boundary | BE-PRA-36 |
| Information disclosure: answers before submission | Get test, attempt state, print | Answer fields absent from pre-submission records (reflection test); memo lock | BE-PRA-08, BE-PRA-19, BE-PRA-51 |
| Information disclosure: tutor help during an attempt | AiTutor | `IActiveAttemptLookup` checked server-side by AiTutor | BE-PRA-18, BE-AI-20 |
| Repudiation | Submissions | `submit_source`, `submitted_at`, `focus_loss_count` stored; events in outbox | BE-PRA-13 |
| Denial of service: generation spam | Generate | Quota fails closed, rate limit, idempotency key | BE-PRA-04, BE-PRA-53 |
| Denial of service: autosave floods | Save | 120/min limit, 8 KB body cap | BE-PRA-52 |
| Elevation | Generate without entitlement | `RequireFeature` plus quota | BE-PRA-04 |

- [ ] **BE-PRA-50** Threat model committed in the module README; authorisation matrix test per endpoint (anonymous 401, parent 403, other student 404, owner OK)
- [ ] **BE-PRA-51** Contract test: OpenAPI schemas for `PracticeTestInstructions` and `AttemptState` contain no `answerIndex`, `expectedAnswer`, `acceptableAnswers` or `explanation`

### Input limits and rate limits

- [ ] **BE-PRA-52** Body caps (generate 4 KB, answer 8 KB, others 1 KB), field limits as in the data model, all tested
- [ ] **BE-PRA-53** Rate-limit policies `practice-generate` 5/min, `practice-autosave` 120/min, `practice-focus` 30/min, all per user and from config; integration test trips each

### Idempotency and concurrency

- [ ] **BE-PRA-54** `Idempotency-Key` on generate and start; `xmin` on attempts so submit versus auto-submit versus pause races resolve to one transition; `DbUpdateConcurrencyException` maps to `409 practice.concurrency_conflict`; parallel test fires 20 concurrent submits and auto-submit and asserts one `PracticeAttemptGraded`

### Resilience

- [ ] **BE-PRA-55** Generation and grading never call the model on the request path; Wolverine retries with backoff; the AI circuit open state leaves jobs queued (not failed) until max attempts; the status endpoint shows `queued` with a "taking longer than usual" flag after 60 s

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `answers.text_answer` | Personal information (student work, possibly a minor) | Life of the account; deleted 30 days after account deletion |
| `attempts.focus_loss_count`, timings | Personal information (behavioural) | As above |
| `tests`, `questions` | Generated content linked to a user | As above |
| `attempt_topic_scores` | Personal information (performance) | As above; Progress keeps its own projection |

- [ ] **BE-PRA-56** Classification in the README and POPIA inventory; deletion and export coverage tests (BE-PRA-33, BE-PRA-35) assert no rows remain after purge

### Audit

- [ ] **BE-PRA-57** Integrity audit trail: attempt state transitions written to the structured log with `AttemptId`, `From`, `To`, `Source`; no separate table (events in the outbox are the durable record)

### Observability

- [ ] **BE-PRA-58** Trace spans: `practice.generate.request`, `practice.job.run` (links to the AI span), `practice.attempt.submit`, `practice.grade.objective`, `practice.grade.written`
- [ ] **BE-PRA-59** Metrics on meter `Aptiverse.Practice`: `aptiverse.practice.generation.duration` (histogram, request to ready), `aptiverse.practice.generation.failures` (counter, tag `code`), `aptiverse.practice.queue.depth` (observable gauge of queued jobs), `aptiverse.practice.autosubmit.lag_seconds` (histogram, fire time minus deadline), `aptiverse.practice.grading.duration` (histogram), `aptiverse.practice.grading.pending_review` (counter)
- [ ] **BE-PRA-60** Alerts: generation failure rate above 10% over 30 min; queue depth above 50 for 10 min; auto-submit lag p95 above 60 s (Worker or scheduler stalled); grading pending review above 5% of written answers per day

### Performance budgets

- [ ] **BE-PRA-61** Budgets: save answer p95 under 80 ms; start p95 under 200 ms; list p95 under 150 ms; results p95 under 250 ms; generation request to ready p95 under 60 s for 10 questions; `EXPLAIN ANALYZE` on list, active-attempt lookup and results with 1 000 attempts per user; indexes listed in the data model verified

### Migration safety

- [ ] **BE-PRA-62** Expand and contract for any change to `attempts` (it holds live in-progress rows during deploys); a deploy never changes deadline semantics for attempts already started (tested with a migration test that starts an attempt, applies the next migration, and submits)

### SLO contribution

- [ ] **BE-PRA-63** SLOs: attempt endpoints (start, save, submit) availability 99.9% and inside the platform p95 500 ms SLO; auto-submit within 60 s of deadline for 99% of attempts; generation success 95% (excluding provider outages)

### Integrity tests

- [ ] **BE-PRA-21** Integration test: second attempt on the same test refused (`409 practice.attempt_exists`)
- [ ] **BE-PRA-36** Integration test: save and submit after deadline plus grace refused; auto-submit grades only answers saved before the deadline
- [ ] **BE-PRA-37** Integration test: timer is server-authoritative (fake clock advanced; client-supplied times in the body are ignored; remaining time from the server matches)
- [ ] **BE-PRA-38** Integration test: a second test cannot be started while another attempt is active; the tutor block returns the active attempt through `IActiveAttemptLookup`
- [ ] **BE-PRA-64** Integration test: auto-submit message survives a Worker restart (message persisted, fires after restart)
- [ ] **BE-PRA-65** Property-based test (FsCheck): for any sequence of saves and time advances on a timed attempt, `deadline_at - started_at` equals the duration and no save after deadline plus grace is accepted; for any pause and resume sequence on an untimed attempt, seconds on task equals elapsed minus paused time
- [ ] **BE-PRA-66** Property-based test: objective grading score equals the sum of per-topic marks and never exceeds max marks
- [ ] **BE-PRA-67** k6 scenario (HRD-10): 500 concurrent attempts autosaving every 10 s at 10x peak
- [ ] **BE-PRA-68** Runbook note: how to regrade an attempt (admin-only command message, audited) if a grading bug is found
- [ ] **BE-PRA-69** Admin regrade command `RegradeAttempt` (internal message triggered from Admin via a Contracts command), republishes `PracticeAttemptGraded` with a `Regrade` flag so Progress can correct its projection
- [ ] **BE-PRA-70** Config review: no secrets in this module; options validated on start
- [ ] **BE-PRA-71** Accessibility contract: `AttemptState` carries question `position` and `marks` so the runner can announce them; no server-side change later needed
- [ ] **BE-PRA-46** Old-data note test: migrated legacy failed generations get no refund rows (refunds start with the rebuild); new failed generations always refund (integration test)
- [ ] **BE-PRA-41** Error code contract test: every `Error` constant appears in the error code table
- [ ] **BE-PRA-72** Load-safe scheduling: verify Wolverine scheduled message volume (one per active timed attempt) in a 10x peak test

## Old data mapping

| Old (43f9faa) | New | Notes (feeds MIG-10) |
|---|---|---|
| `practice.practice_tests` (`long Id`, `OwnerStudentId`, `SubjectId` string, `Format`, `Topics` list, `Difficulty`, `DurationMinutes`, `aligned_sba` (assessment id), `Questions` jsonb of `PracticeQuestion` with `Marks`, `Section`, `MarkingMemo`) | `practice.tests` plus `practice.questions` | New Guid v7 ids with lookup; `aligned_sba` mapped to `assessment_id`; `MarkingMemo` becomes `expected_answer` for written questions; `Section` and `Marks` copied; `SubjectId` mapped to the student's `study_unit_id`; `Questions` exploded into rows; `Kind` `mc` to `mcq`; `Back` dropped; `math_format = 'ascii_legacy'` where the bridge detects ASCII math, else `latex`; `source = 'legacy'`; tests without an owner (catalog tests) are dropped or attached to no user (see open question 4) |
| `practice.practice_generation_jobs` (`StudentId`, `Status` queued, running, succeeded, failed; `AssessmentId`, `SubjectId`, `Format`, `Difficulty`, `QuestionCount`, `TotalMarks`, `Topics`, `ClaimedAt`, `Attempts`) | `practice.generation_jobs` | Only finished jobs referenced by tests are migrated; in-flight jobs are not; `Difficulty` and `AssessmentId` copied onto the test |
| `practice.practice_attempts` (`Status` InProgress, Submitted, Abandoned; `FocusLossCount`; `Score`) | `practice.attempts` | InProgress at cutover become `graded` via auto-submit before migration (cutover rule), Abandoned become `submitted` with `submit_source = 'deadline'`; `deadline_at` null for legacy |
| `practice.answer_submissions` and `practice.practice_attempt_items` | `practice.answers` | Items carry correctness; merged on `(AttemptId, QuestionId)` |
| `practice.attempt_score_summaries` (`PerTopic` jsonb) | `practice.attempt_topic_scores` | One row per topic |

## Tests

- Unit: validators; LaTeX validator; ASCII bridge table; objective grading; deadline maths; status mapping; recommendation ranking.
- Integration: every slice happy, validation, forbidden, not found; integrity tests BE-PRA-21, 36, 37, 38, 64; generation job success, retry and final failure with refund.
- Property-based: BE-PRA-65, BE-PRA-66.
- E2E (web): PG-STU-RUNNER-12 covers the integrity rules on mobile.

## Open questions

1. Decided (17): pause is allowed for untimed tests only; timed tests never pause; 10 second network grace after the deadline.
2. Untimed attempts left open forever would block the tutor forever. Proposed rule: an untimed attempt idle for 24 hours stops blocking (BE-PRA-39). Alternative: untimed attempts auto-submit after 24 hours idle.
3. Is printing (and the memo) free or a paid feature? Old feature keys do not include it.
4. Old catalog tests without an owner: migrate as shared templates or drop? The rebuild has no shared test catalog.
5. Written answers that fail AI grading are excluded from the score and flagged; is a manual review path for the student (self-mark) wanted?
6. Should generating a new test be allowed while an attempt is active? Assumed yes (answers are hidden until attempted).
7. Decided (16): all five formats ship in v1 (quiz, exam paper, reading for high school, flashcards, essay); essay feedback has its own quota key `practice.essay_feedback` (BE-PRA-43, BE-PRA-44). Essay marking must still meet the eval bar (essays in BE-AI-52) before launch.
8. Decided (15): generation is per assessment with the unit derived from it (BE-PRA-04). A revision path keyed by `studyUnitId` for students with no upcoming assessment is a post-launch candidate, not v1.
