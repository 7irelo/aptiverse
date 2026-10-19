# Progress module

| | |
|---|---|
| ID range | `BE-PRG-01` to `BE-PRG-15` (original), `BE-PRG-16` to `BE-PRG-49` (splits and additions), `BE-PRG-50` to `BE-PRG-68` (production readiness), `BE-PRG-69` to `BE-PRG-71` (added) |
| Schema | `progress` |
| Projects | `src/Modules/Progress/Aptiverse.Progress`, `src/Modules/Progress/Aptiverse.Progress.Contracts`, `tests/Aptiverse.Progress.UnitTests` |
| Phase | 7 |
| Consumes | `Aptiverse.Practice.Contracts` (`PracticeAttemptGraded`, `IPracticeSummary`, `IActiveAttemptLookup`), `Aptiverse.Wellbeing.Contracts` (`ICheckinStatus`), `Aptiverse.Academics.Contracts` (`AssessmentGraded`, `AssessmentSubmitted`, `IStudyUnitLookup`, `IPredictedResult`), `Aptiverse.Identity.Contracts` (`AccountDeletionRequested`) |
| Publishes | `GoalCreated`, `GoalAchieved`, `GoalMilestoneReached`, `GoalAbandoned`, `GoalExpired`, `AchievementAwarded`, `MasteryUpdated`; implements `IMasterySnapshot`, `IProgressSummary`, `IGoalLookup` (deferred with pledges, decision 6) |
| Depends on | BE-SK-22, BE-SK-23, BE-PRA-17, BE-ACA-37, BE-ACA-42 (needs an `IPredictedResult` contract, see open question 3), BE-ACA-20 |
| Status | Not started (0 of 71 tasks; 6 deferred by decision 6: BE-PRG-25, 31, 48, 49, 65, 70) |

## Responsibilities and out of scope

Responsible for:

- Goals and milestones that are verifiable from real work only: practice tests completed, beat your practice score, mastery threshold, assessments submitted, reach an assessment mark. Goals can be linked to an upcoming assessment. The baseline rule applies to every goal. Goals near their due date with too little progress show as `at_risk` (old GoalEvaluator rule).
- Evidence: every change in goal progress points at the event that caused it.
- Achievement definitions awarded only from integration events. No points in v1 (decision 6: neither pledges nor points; revisit after launch). In the old app (43f9faa) points were real: paid on improvement over baseline and spent on short-term AI and practice quota top-ups; those tasks are kept below as deferred.
- The `topic_mastery` projection (recency-weighted per-topic accuracy, bands 50, 70, 85, an "early read" flag under 5 answers, null when there is no evidence), designed so the Phase 12 BKT model can write into it.
- Read models for the dashboard, analytics, journey, and goal pages.

Out of scope:

- Wellbeing or habit goals (check-in streaks, practice streaks, sleep): out of v1, and old custom and streak goals are dropped (decision 20).
- Free-text "custom" goals without criteria (old `custom` kind): not migrated as active goals (see old data mapping).
- Pledges, points and rewards: not in v1 (decision 6). The deferred pledge read model and points tasks below are kept for when rewards are revisited after launch.
- Career standing and APS (Academics, BE-CAR).

## Decisions recorded here

1. **Baseline rule on every goal** (decision 21). A threshold target at or below the measured baseline is refused with `goal.target_not_above_baseline`. Count goals (tests completed, assessments submitted) count from creation, so their baseline is 0 by construction.
2. **No pledge data on goal pages in v1** (decision 6). If pledges return, they reach goal pages through a Progress read model (`goal_pledges_view`) fed by Family events, not by the web calling Family; that design is kept, deferred.
3. **No points in v1** (decision 6). No endpoint returns a points total, balance or rank, and no points are written.
4. **Count goals count from goal creation** (decision 20). The old app counted all past work, which let a goal be "achieved" the moment it was created.
5. **Goal types in v1** (decision 20): practice tests completed, practice score, mastery threshold, assessment mark, assessments submitted. No custom or streak goals.

## Data model

Schema `progress`. Every table: `id uuid` PK (Guid v7), `created_at`, `updated_at`, `deleted_at`, `xmin`, except append-only tables (insert-only, never soft-deleted).

### goals

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, status, due_at)` |
| study_unit_id | uuid | no | index; no FK (Academics) |
| title | varchar(120) | no | |
| description | varchar(500) | yes | |
| criteria_type | varchar(32) | no | check `in ('practice_tests_completed','practice_score_best','mastery_threshold','assessments_submitted','assessment_mark_threshold')` |
| topic | varchar(80) | yes | required for `mastery_threshold` at topic level; null means whole unit |
| assessment_id | uuid | yes | optional link to an upcoming assessment for any goal (shown on the goal and the assessment); for `assessment_mark_threshold` it narrows the evidence to that assessment, otherwise any assessment graded in the unit after creation counts |
| target_value | numeric(6,2) | no | count goals: integer 1 to 100; threshold goals: percent 1 to 100 |
| baseline_value | numeric(6,2) | yes | null when no evidence existed at creation |
| baseline_captured_at | timestamptz | no | |
| current_value | numeric(6,2) | yes | null until evidence exists (never zero by default for thresholds; count goals start at 0) |
| status | varchar(16) | no | check `in ('active','at_risk','achieved','expired','abandoned')`; `at_risk` is recomputed on every evaluation and daily (BE-PRG-46) |
| due_at | timestamptz | no | check `due_at > created_at` |
| achieved_at | timestamptz | yes | |
| locked_at | timestamptz | yes | set when the goal is achieved (a pledge would also set it if pledges return, decision 6) |
| sort_order | int | no | |

Partial unique `(user_id, criteria_type, study_unit_id, coalesce(topic,''), coalesce(assessment_id, '00000000-0000-0000-0000-000000000000')) where status in ('active','at_risk') and deleted_at is null` backs `goal.duplicate_active`.

Measurement per type (ported from the old GoalEvaluator, with v1 changes noted):

| Type | Current value | Baseline |
|---|---|---|
| `practice_tests_completed` | submitted attempts in the unit since creation (old: all time) | 0 |
| `practice_score_best` ("beat your practice score") | best attempt score percent in the unit since creation (best, not average) | best score in the last 60 days, null when none |
| `mastery_threshold` | topic or unit mastery score percent (Progress projection) | current mastery, null when no evidence |
| `assessments_submitted` | assessments submitted in the unit since creation | 0 |
| `assessment_mark_threshold` ("reach an assessment mark") | best graded mark percent (linked assessment only, when linked) since creation | latest graded mark in the unit, null when none |

At-risk rule (old `IsAtRisk`): not achieved and either past due, or within 7 days of due with `progress < 100 - (daysLeft / 7 * 40)`.

### milestones

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| goal_id | uuid | no | FK cascade; unique `(goal_id, position)` |
| position | int | no | 1 to 5 |
| title | varchar(120) | no | |
| threshold_value | numeric(6,2) | no | strictly increasing by position, below the goal target |
| reached_at | timestamptz | yes | |

### goal_evidence (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| goal_id | uuid | no | FK, index `(goal_id, occurred_at)` |
| source_type | varchar(24) | no | check `in ('practice_attempt','assessment_submitted','assessment_graded','mastery_update','regrade')` |
| source_id | uuid | no | unique `(goal_id, source_type, source_id)` (replay-safe) |
| value_after | numeric(6,2) | no | goal current value after this evidence |
| summary | varchar(200) | no | for example "Practice test, 78%" |
| occurred_at | timestamptz | no | event time, not processing time |

### goal_pledges_view (projection; deferred: decision 6, not in v1)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| goal_id | uuid | no | FK, index |
| pledge_id | uuid | no | unique |
| sponsor_display_name | varchar(80) | no | |
| amount_cents | bigint | no | |
| currency | char(3) | no | |
| status | varchar(16) | no | check `in ('pledged','earned','paid','cancelled')` |
| status_changed_at | timestamptz | no | last applied event time (out-of-order guard) |

### points_ledger (append-only, internal; deferred: decision 6, not in v1)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index |
| points | int | no | check `points <> 0` |
| reason | varchar(24) | no | check `in ('achievement','goal_achieved','milestone','reversal','redeem')` (`redeem` only if quota top-ups return) |
| source_type | varchar(24) | no | |
| source_id | uuid | no | unique `(user_id, reason, source_type, source_id)` |
| occurred_at | timestamptz | no | |

### achievement_definitions (seed)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| code | varchar(48) | no | unique (for example `first_practice_test`, `five_tests_in_unit`, `first_assessment_logged`, `topic_secure`, `goal_achieved_first`) |
| title | varchar(80) | no | plain, factual wording |
| description | varchar(200) | no | |
| trigger_event | varchar(48) | no | check against the known event names |
| rule | jsonb | no | small declarative rule (`{ "count": 5, "scope": "unit" }`), evaluated in code |
| points | int | no | internal; unused in v1 (decision 6), kept so a later points ledger needs no seed change |
| is_active | boolean | no | |

### achievements_awarded

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique `(user_id, definition_id)` |
| definition_id | uuid | no | FK, index |
| awarded_at | timestamptz | no | |
| source_type | varchar(24) | no | |
| source_id | uuid | no | |

### mastery_observations (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, study_unit_id, topic, observed_at)` |
| study_unit_id | uuid | no | |
| topic | varchar(80) | no | normalised (trimmed, case-folded key plus display form) |
| source_type | varchar(24) | no | check `in ('practice_attempt','regrade')` |
| source_id | uuid | no | unique `(source_type, source_id, topic)` |
| questions_total | int | no | check `> 0` |
| questions_correct | int | no | check `between 0 and questions_total` |
| superseded_by_id | uuid | yes | FK self, index; set by a regrade |
| observed_at | timestamptz | no | attempt submission time |

### topic_mastery (projection)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique `(user_id, study_unit_id, topic, model)` |
| study_unit_id | uuid | no | index `(user_id, study_unit_id)` |
| topic | varchar(80) | no | |
| model | varchar(32) | no | check `in ('recency_weighted_v1','bkt_v1')`; v1 writes only the first |
| score | numeric(5,4) | yes | 0 to 1; null when no evidence |
| band | varchar(16) | yes | check `in ('emerging','developing','secure','mastered')`; null with null score |
| evidence_questions | int | no | |
| early_read | boolean | no | true when `evidence_questions < 5` |
| previous_score | numeric(5,4) | yes | for trend |
| last_evidence_at | timestamptz | yes | |

Bands: `emerging` below 0.50, `developing` 0.50 to 0.6999, `secure` 0.70 to 0.8499, `mastered` 0.85 and above.

### activity_days (projection)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique `(user_id, day)` |
| day | date | no | in `Africa/Johannesburg` |
| practice_seconds | int | no | |
| attempts_graded | int | no | |
| assessments_logged | int | no | |

### journey_events (append-only projection)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, occurred_at desc)` |
| kind | varchar(32) | no | check `in ('practice_completed','assessment_graded','goal_created','goal_achieved','milestone_reached','achievement_awarded','topic_band_up')` |
| title | varchar(160) | no | |
| link | varchar(200) | yes | app-relative path |
| source_type | varchar(24) | no | |
| source_id | uuid | no | unique `(user_id, kind, source_type, source_id)` |
| occurred_at | timestamptz | no | |

## Contracts

```
public interface IMasterySnapshot
{
    Task<IReadOnlyList<TopicMasteryView>> GetWeakestTopicsAsync(Guid userId, int take, CancellationToken ct);
    Task<IReadOnlyList<TopicMasteryView>> GetForUnitAsync(Guid userId, Guid studyUnitId, CancellationToken ct);
}
public sealed record TopicMasteryView(Guid StudyUnitId, string Topic, decimal? Score, string? Band, bool EarlyRead, DateTimeOffset? LastEvidenceAt);

public interface IProgressSummary
{
    Task<ProgressSummary> GetAsync(Guid userId, CancellationToken ct);
    Task<IReadOnlyList<SharedGoalView>> GetActiveGoalsAsync(Guid userId, int take, CancellationToken ct);
}
public sealed record SharedGoalView(Guid GoalId, string Title, string CriteriaKind, decimal? ProgressPct, bool Verified, DateTimeOffset DueAt);
public sealed record ProgressSummary(int ActiveGoals, int GoalsAchievedLast30Days, IReadOnlyList<TopicMasteryView> Strongest,
    IReadOnlyList<TopicMasteryView> Weakest, DateTimeOffset? LastActivityAt);

public interface IGoalLookup
{
    Task<GoalLookupResult?> GetAsync(Guid goalId, Guid studentUserId, CancellationToken ct);
}
public sealed record GoalLookupResult(Guid GoalId, Guid StudentUserId, string Title, string Status, DateTimeOffset DueAt);

public sealed record GoalCreated(Guid GoalId, Guid UserId, string CriteriaType, DateTimeOffset DueAt, DateTimeOffset OccurredAt);
public sealed record GoalAchieved(Guid GoalId, Guid UserId, string Title, DateTimeOffset AchievedAt, IReadOnlyList<Guid> EvidenceIds);
public sealed record GoalMilestoneReached(Guid GoalId, Guid UserId, int Position, string Title, DateTimeOffset OccurredAt);
public sealed record GoalAbandoned(Guid GoalId, Guid UserId, DateTimeOffset OccurredAt);
public sealed record GoalExpired(Guid GoalId, Guid UserId, DateTimeOffset OccurredAt);
public sealed record AchievementAwarded(Guid UserId, string Code, string Title, DateTimeOffset AwardedAt);
public sealed record MasteryUpdated(Guid UserId, Guid StudyUnitId, string Topic, decimal? Score, string? Band, string? PreviousBand, DateTimeOffset OccurredAt);
```

## Error codes

Stable strings in the ProblemDetails `code` extension (contract test BE-PRG-40).

| Code | HTTP | Meaning |
|---|---|---|
| `goal.duplicate_active` | 409 | An active goal with the same criteria, unit and topic exists |
| `goal.target_not_above_baseline` | 409 | Threshold target at or below the measured baseline (`baseline` extension) |
| `goal.locked` | 409 | Criteria, target or due date cannot change: the goal is achieved |
| `goal.has_paid_pledge` | 409 | Deferred (decision 6). Cannot delete: a pledge is earned or paid |
| `goal.not_found` | 404 | Unknown or not owned |
| `goal.study_unit_not_found` | 404 | Unit not owned by the student |
| `goal.assessment_not_found` | 404 | Assessment not owned or not in the unit |
| `goal.version_mismatch` | 412 | `If-Match` does not match the current version |
| `goal.if_match_required` | 428 | Update or delete without `If-Match` |
| `goal.invalid_milestones` | 400 | Milestones not increasing or not below target |
| `goal.milestone_not_found` | 404 | Unknown milestone on this goal |
| `goal.milestone_limit` | 409 | At most 5 milestones |
| `goal.reorder_mismatch` | 400 | Reorder list does not contain exactly the caller's ids |
| `progress.unit_not_found` | 404 | Mastery for a unit the user does not own |

## Foundation tasks

- [ ] **BE-PRG-01** Module projects, `progress` schema, `ProgressDbContext`, design-time factory, architecture test registration
- [ ] **BE-PRG-32** Permission constants `progress.goals.manage`, `progress.read` (student); parents read only through Family contracts
- [ ] **BE-PRG-02** `goals` and `milestones` entities, criteria type constants, partial unique index, migration
- [ ] **BE-PRG-16** `goal_evidence` append-only entity and the `GoalEvaluator` (pure): given a goal and a new observation, returns the new value, milestones reached, and achieved or not
- [ ] **BE-PRG-03** Baseline rule (pure `BaselineCalculator` plus enforcement in create and update): threshold baselines from current mastery (topic or unit) or the latest mark for the assessment; target at or below baseline refused; applies to every goal (decision 1)
- [ ] **BE-PRG-07** `achievement_definitions` entity and `achievements_awarded` (unique key makes awards replay-safe). The points ledger part moved to BE-PRG-70 (deferred, decision 6)
- [ ] **BE-PRG-70** `points_ledger` append-only entity and `PointsPoster` (unique key makes awards replay-safe); split from BE-PRG-07 *(deferred: decision 6, not in v1)*
- [ ] **BE-PRG-33** Achievement definitions seed: a short, factual list (no streak shaming, no "legendary" wording), reviewed against the de-gamified principle
- [ ] **BE-PRG-24** `mastery_observations` entity and ingestion from `PracticeAttemptGraded.Topics` (one row per topic, replay-safe)
- [ ] **BE-PRG-10** `topic_mastery` projection: recency-weighted accuracy `score = sum(w * correct) / sum(w * total)` with `w = 0.5 ^ (age_days / 30)` over non-superseded observations; bands 50, 70, 85; `early_read` under 5 questions; null with no evidence; recomputed per touched topic; publishes `MasteryUpdated` when the band changes; schema has `model` for BKT later
- [ ] **BE-PRG-34** `activity_days` projection from `PracticeAttemptGraded` (seconds on task) and `AssessmentGraded`
- [ ] **BE-PRG-35** `journey_events` projection from Practice, Academics and Progress events
- [ ] **BE-PRG-25** `goal_pledges_view` projection from Family `PledgeCreated` and `PledgeStatusChanged` (out-of-order guard on `status_changed_at`); attaching a pledge sets `goals.locked_at` *(deferred: decision 6, not in v1)*
- [ ] **BE-PRG-29** `IMasterySnapshot` implementation (used by AiTutor context and Family)
- [ ] **BE-PRG-30** `IProgressSummary` implementation (used by Family overview)
- [ ] **BE-PRG-71** `IProgressSummary.GetActiveGoalsAsync` for the parent Goals tab (Family BE-FAM-07 `goals` block, v1): active goals only, newest due first, `take` 1 to 20, `ProgressPct` null when there is no evidence yet (never zero), no reward or pledge fields (decision 6); one indexed query; unit test that abandoned and expired goals are excluded
- [ ] **BE-PRG-31** `IGoalLookup` implementation (used by Family to validate pledges) *(deferred: decision 6, not in v1)*

## Slices

Group `/progress`, tag `Progress`. Every read and write filters by `user_id = current user`; not owned returns 404.

### BE-PRG-19  GET /progress/goals/baseline

| | |
|---|---|
| Operation id | `getGoalBaseline` |
| Permission | `progress.goals.manage` |
| Entitlement | `goals.basic` (free) |
| Rate limit | `default` |
| Idempotency | safe (no writes) |
| Metric | `aptiverse.progress.goals.baseline_lookups` (counter, tag `criteria_type`) |
| Log fields | `UserId`, `CriteriaType`, `StudyUnitId`, `HasBaseline` |

Request (query): `criteriaType`, `studyUnitId`, `topic` (optional), `assessmentId` (optional). This is the baseline lookup the goal form calls as the student picks options (old `GET /api/goals/baseline`).

Response `200 GoalPreview`: `baselineValue` (nullable), `baselineSource` ("mastery in Algebra, early read", "latest mark", "counts from today"), `minimumTarget` (baseline plus 1, or 1), `earlyRead`.

- [ ] **BE-PRG-19** Baseline lookup for the goal form
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (shares `BaselineCalculator`)
  - [ ] Unit tests: each criteria type
  - [ ] Integration tests: with and without evidence

### BE-PRG-04  POST /progress/goals

| | |
|---|---|
| Operation id | `createGoal` |
| Permission | `progress.goals.manage` |
| Entitlement | `goals.basic`; more than 3 active goals needs `goals.unlimited` (`403 billing.feature_required`) |
| Rate limit | `default` |
| Idempotency | required `Idempotency-Key`; replay returns the original `201` body |
| Metric | `aptiverse.progress.goals.created` (counter, tags `criteria_type`, `stage`) |
| Log fields | `UserId`, `GoalId`, `CriteriaType`, `StudyUnitId`, `Target`, `Baseline` |

Request:

| Field | Rules |
|---|---|
| `title` | 3 to 120 chars |
| `description` | optional, max 500 |
| `criteriaType` | one of the five types |
| `studyUnitId` | owned, active unit |
| `topic` | optional, max 80; only for `mastery_threshold` |
| `assessmentId` | optional for every type; must belong to the unit, be upcoming (not graded) and due before or on `dueAt` |
| `targetValue` | count types: integer 1 to 100; score, mark and mastery types: 1 to 100 percent |
| `dueAt` | at least 1 day and at most 1 year ahead |
| `milestones` | 0 to 5, strictly increasing thresholds below target |

Response `201 GoalView` with `ETag` header (the `xmin` version).

Failures: `400`; `403 billing.feature_required`; `404 goal.study_unit_not_found`; `404 goal.assessment_not_found`; `409 goal.duplicate_active`; `409 goal.target_not_above_baseline`.

Events: `GoalCreated`.

- [ ] **BE-PRG-04** `POST /progress/goals` (original CRUD task, create part)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (baseline captured inside the transaction; unique violation mapped to `goal.duplicate_active`)
  - [ ] Unit tests: validator matrix, active goal cap
  - [ ] Integration tests: happy, baseline refused, duplicate active, idempotent replay, unit not owned 404

### BE-PRG-20  GET /progress/goals

| | |
|---|---|
| Operation id | `listGoals` |
| Permission | `progress.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.progress.goals.list.duration` |
| Log fields | `UserId`, `Status`, `ResultCount` |

Request: `status` optional (`active`, `achieved`, `expired`, `abandoned`), `studyUnitId` optional, `page`, `pageSize` 1 to 50.

Response `PagedResult<GoalSummary>`: `id`, `title`, `criteriaType`, `studyUnitId`, `topic`, `targetValue`, `baselineValue`, `currentValue` (null when no evidence), `progressPercent` (null when `currentValue` is null), `status`, `dueAt`, `locked`. No `pledge` field in v1 (decision 6).

- [ ] **BE-PRG-20** `GET /progress/goals`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (single query)
  - [ ] Unit tests: progress percent null handling
  - [ ] Integration tests: filters, own only

### BE-PRG-05  GET /progress/goals/{id}

| | |
|---|---|
| Operation id | `getGoal` |
| Permission | `progress.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read; `ETag` returned |
| Metric | `aptiverse.progress.goals.get.duration` |
| Log fields | `UserId`, `GoalId`, `EvidenceCount` |

Response `200 GoalView`: summary fields plus `description`, `milestones[]` (`position`, `title`, `thresholdValue`, `reachedAt`), `evidence[]` (`summary`, `valueAfter`, `occurredAt`, `link` to the attempt or assessment), `baselineCapturedAt`, `achievedAt`.

- [ ] **BE-PRG-05** `GET /progress/goals/{id}` with evidence list
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: evidence link building
  - [ ] Integration tests: happy, another user's goal 404

### BE-PRG-17  PATCH /progress/goals/{id}

| | |
|---|---|
| Operation id | `updateGoal` |
| Permission | `progress.goals.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | required `Idempotency-Key`; required `If-Match` with the `ETag` |
| Metric | `aptiverse.progress.goals.updated` (counter, tag `locked`) |
| Log fields | `UserId`, `GoalId`, `ChangedFields`, `Locked` |

Request (all optional): `title`, `description`, `targetValue`, `dueAt`, `milestones`, `sortOrder`. On a locked goal only `title`, `description` and `sortOrder` may change. A new `targetValue` is re-checked against a freshly computed baseline.

Response `200 GoalView` with new `ETag`.

Failures: `400`; `404`; `409 goal.locked`; `409 goal.target_not_above_baseline`; `412 goal.version_mismatch`; `428 goal.if_match_required`; `409` when the goal is not `active` (`goal.locked`).

- [ ] **BE-PRG-17** `PATCH /progress/goals/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (`If-Match` compared to `xmin`; `DbUpdateConcurrencyException` also mapped to 412)
  - [ ] Unit tests: locked field rules
  - [ ] Integration tests: happy, locked 409, stale ETag 412, missing If-Match 428

### BE-PRG-18  DELETE /progress/goals/{id}

| | |
|---|---|
| Operation id | `abandonGoal` |
| Permission | `progress.goals.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | required `If-Match`; deleting an abandoned goal returns `204` |
| Metric | `aptiverse.progress.goals.abandoned` (counter) |
| Log fields | `UserId`, `GoalId` |

Behaviour: active goals become `abandoned` (kept for history; soft delete only on achieved, expired or abandoned goals the student removes from the list). Publishes `GoalAbandoned`.

Failures: `404`; `412`; `428`.

- [ ] **BE-PRG-18** `DELETE /progress/goals/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: active becomes abandoned, finished goals soft-deleted
  - [ ] Integration tests: happy, wrong `If-Match` 412, idempotent

### BE-PRG-41  POST /progress/goals/{id}/milestones

Permission `progress.goals.manage`; rate limit `progress-goals-write`; required `Idempotency-Key`; metric `aptiverse.progress.milestones.created`; log fields `UserId`, `GoalId`, `MilestoneId`. Request `title` 3 to 120, `thresholdValue` above the previous milestone and below the target, `position` optional (appended when absent). Allowed on locked goals (milestones never change what a pledge pays for). Response `201 MilestoneView`. Failures `404`, `409 goal.milestone_limit`, `400 goal.invalid_milestones`, `409 goal.locked` when the goal is achieved.

- [ ] **BE-PRG-41** Add a milestone
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (immediately evaluated: a milestone already passed is marked reached with the current evidence)
  - [ ] Unit tests: threshold ordering
  - [ ] Integration tests: happy, sixth milestone 409, 404

### BE-PRG-42  PATCH /progress/goals/{id}/milestones/{milestoneId}

Permission `progress.goals.manage`; `If-Match` required; metric `aptiverse.progress.milestones.updated`. Request `title`, `thresholdValue` (same rules; a reached milestone's threshold cannot change). Failures `404 goal.milestone_not_found`, `400`, `412`, `428`.

- [ ] **BE-PRG-42** Edit a milestone
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: reached milestone guard
  - [ ] Integration tests: happy, stale ETag 412

### BE-PRG-43  DELETE /progress/goals/{id}/milestones/{milestoneId}

Permission `progress.goals.manage`; idempotent `204`; metric `aptiverse.progress.milestones.deleted`. Remaining positions are compacted.

- [ ] **BE-PRG-43** Delete a milestone
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: position compaction
  - [ ] Integration tests: happy, idempotent

### BE-PRG-44  PATCH /progress/goals/{id}/milestones/order

Permission `progress.goals.manage`; request `milestoneIds` (exactly the goal's milestones, in the new order); thresholds must still increase in the new order (`400 goal.invalid_milestones`), otherwise `400 goal.reorder_mismatch`; metric `aptiverse.progress.milestones.reordered`.

- [ ] **BE-PRG-44** Reorder milestones
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: mismatch detection
  - [ ] Integration tests: happy, missing id 400

### BE-PRG-45  PATCH /progress/goals/reorder

Permission `progress.goals.manage`; request `goalIds` (the caller's active and at-risk goals in display order); sets `sort_order`; idempotent; metric `aptiverse.progress.goals.reordered`; failures `400 goal.reorder_mismatch`.

- [ ] **BE-PRG-45** Reorder goals
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: mismatch detection
  - [ ] Integration tests: happy, another user's id 400

### BE-PRG-49  POST /progress/rewards/{code}/redeem (deferred: decision 6, not in v1)

Only if points for quota top-ups return after launch. Permission `progress.goals.manage`; required `Idempotency-Key`; metric `aptiverse.progress.rewards.redeemed` (tag `code`); log fields `UserId`, `RewardCode`, `PointsSpent`. Rewards catalog in code (old `RewardCatalog`: `deep_ai_10`, `deep_ai_30`, `quick_ai_100`, `practice_15`, `practice_40`, each with bonus, days and point cost). Debits the points ledger (negative row `reason = 'redeem'`, balance cannot go below zero, checked under a per-user advisory lock) and sends `GrantQuota(userId, quotaKey, bonus, expiresAt, sourceId)` to Billing (BE-BIL-63) through the outbox in the same transaction. Also `GET /progress/rewards` (catalog plus balance) in the same task. Failures `409 progress.insufficient_points`, `404 progress.reward_not_found`.

- [ ] **BE-PRG-49** Rewards catalog and redeem for quota top-ups *(deferred: decision 6, not in v1)*
  - [ ] Endpoints
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: balance never negative under concurrency
  - [ ] Integration tests: happy, insufficient points 409, idempotent replay, Billing grant created once

### BE-PRG-09  GET /progress/achievements

| | |
|---|---|
| Operation id | `listAchievements` |
| Permission | `progress.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.progress.achievements.list.duration` |
| Log fields | `UserId`, `AwardedCount` |

Response `200 AchievementsView`: `awarded[]` (`code`, `title`, `description`, `awardedAt`), `available[]` (`code`, `title`, `description`), and `activity` (`activeDaysLast28` count, `currentRunDays`, `longestRunDays`): run lengths are shown neutrally; there is no "streak lost" state, no penalty, and no points total (decision 3 here; decision 6 in DECISIONS.md keeps points out of v1).

- [ ] **BE-PRG-09** `GET /progress/achievements` with activity run
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (runs computed from `activity_days`)
  - [ ] Unit tests: run calculation across SAST midnight
  - [ ] Integration tests: none awarded, some awarded, JSON has no points field

### BE-PRG-11  GET /progress/mastery

| | |
|---|---|
| Operation id | `getMastery` |
| Permission | `progress.read` |
| Entitlement | `mastery.snapshot` (free); `trend` requires `mastery.predictions` (paid) and is null otherwise |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.progress.mastery.get.duration` |
| Log fields | `UserId`, `StudyUnitId`, `TopicCount`, `NoEvidenceCount` |

Request: `studyUnitId` optional (all units when absent).

Response `200 MasteryView`: `units[]` of `{ studyUnitId, name, score (nullable), band (nullable), earlyRead, topics[] { topic, score, band, earlyRead, evidenceQuestions, lastEvidenceAt, trend ("up", "down", "steady" or null) } }`. Topics from the unit's registry with no evidence appear with `score = null`. Unit score is the question-weighted mean of topics with evidence, null when none.

- [ ] **BE-PRG-11** `GET /progress/mastery`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: unit aggregation, trend thresholds (change of at least 0.05)
  - [ ] Integration tests: no evidence returns nulls, early read flag, unit not owned 404

### BE-PRG-12  GET /progress/analytics

| | |
|---|---|
| Operation id | `getAnalytics` |
| Permission | `progress.read` |
| Entitlement | `mastery.predictions` for the projection block; the rest free |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.progress.analytics.get.duration` |
| Log fields | `UserId`, `RangeDays` |

Request: `rangeDays` in `7|28|90` (default 28).

Response `200 AnalyticsView`: `timeOnTaskMinutes[]` per day (from `activity_days`), `totalMinutes`, `strengths[]` (top 3 secure or mastered topics with at least 5 questions), `gaps[]` (bottom 3 with evidence), `projection` (from `IPredictedResult`: high school predicted percentage per subject and APS hint; tertiary GPA projection) or null when no marks, never zero.

- [ ] **BE-PRG-12** `GET /progress/analytics`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: strengths and gaps selection excludes early reads
  - [ ] Integration tests: empty user returns nulls and empty lists, stage variants

### BE-PRG-13  GET /progress/dashboard

| | |
|---|---|
| Operation id | `getDashboard` |
| Permission | `progress.read` |
| Entitlement | none (paid blocks return `locked: true` instead of data) |
| Rate limit | `default` |
| Idempotency | safe read; `HybridCache` 30 s per user, invalidated by this module's own events |
| Metric | `aptiverse.progress.dashboard.get.duration` |
| Log fields | `UserId`, `CacheHit` |

Response `200 DashboardView`: `activeAttempt` (`{ attemptId, testTitle, deadlineAt, remainingSeconds }` from `IActiveAttemptLookup`, or null), `checkedInToday` (bool from Wellbeing `ICheckinStatus`; only whether a check-in exists, never its content), `nextAssessments` (from Academics contract, top 3), `activeGoals` (top 3 with progress), `weakestTopics` (3), `recentPractice` (`IPracticeSummary` last 7 days), `activityLast7Days`, `recommendedPractice` link. Every numeric field is nullable and null means "no marks yet".

- [ ] **BE-PRG-13** `GET /progress/dashboard`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (parallel contract calls with a 300 ms budget each; a slow block returns `unavailable: true` rather than failing the page)
  - [ ] Unit tests: null propagation
  - [ ] Integration tests: brand new student (all nulls), populated student

### BE-PRG-14  GET /progress/journey

| | |
|---|---|
| Operation id | `getJourney` |
| Permission | `progress.read` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.progress.journey.get.duration` |
| Log fields | `UserId`, `ResultCount` |

Request: `before` cursor (timestamp plus id), `take` 1 to 50, `kinds` optional filter.

Response `200 JourneyPage`: `events[]` (`kind`, `title`, `link`, `occurredAt`), `nextCursor`.

- [ ] **BE-PRG-14** `GET /progress/journey`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (keyset pagination)
  - [ ] Unit tests: cursor encoding
  - [ ] Integration tests: empty, paged, filter

## Background work

- [ ] **BE-PRG-06** `PracticeAttemptGraded` handler for goals: counts toward `practice_tests_completed` goals in the unit (attempts submitted after goal creation only); writes evidence; applies milestones and achievement; publishes `GoalMilestoneReached` and `GoalAchieved`
- [ ] **BE-PRG-21** `AssessmentSubmitted` and `AssessmentGraded` handlers for `assessments_submitted` and `assessment_mark_threshold` goals
- [ ] **BE-PRG-22** `MasteryUpdated` (internal) handler for `mastery_threshold` goals: achieved when the score reaches the target and the topic has at least 5 questions of evidence (no achievement on an early read)
- [ ] **BE-PRG-46** At-risk evaluation (pure, old `IsAtRisk` rule) applied on every evaluation, plus a daily scheduled refresh at 06:00 SAST so a goal turns `at_risk` without new evidence
- [ ] **BE-PRG-47** Achievement notification: on `GoalAchieved` and `GoalMilestoneReached` publish `NotifyUser` ("Goal achieved: <title>", verified from your own work, link to the goal) after commit; no points wording (decision 6)
- [ ] **BE-PRG-48** Points on improvement (old live behaviour): on achievement of `practice_score_best` and `mastery_threshold` goals, points = old `PointsFor` formula (gain over baseline: 12 per point for the first 20, then 5 per point, times a difficulty multiplier, 1.5 for the hardest difficulty), written to `points_ledger` with `reason = 'goal_achieved'`; property tests that no gain means no points *(deferred: decision 6, not in v1)*
- [ ] **BE-PRG-23** `ExpireGoal` scheduled message at `due_at`: active goals become `expired`; publishes `GoalExpired`
- [ ] **BE-PRG-08** Achievement award handlers: each definition evaluated only from integration events (`PracticeAttemptGraded`, `AssessmentGraded`, `GoalAchieved`, `MasteryUpdated`); award row plus `AchievementAwarded` in one transaction (no points row in v1, decision 6); replay-safe
- [ ] **BE-PRG-26** Regrade correction: `PracticeAttemptGraded` with the `Regrade` flag supersedes the old observations, recomputes mastery, and re-evaluates goals (a goal already achieved stays achieved; evidence row `regrade` notes the change)
- [ ] **BE-PRG-27** `AccountDeletionRequested` handler: hard-deletes the user's projections and ledgers after 30 days (soft-deleted immediately); publishes nothing
- [ ] **BE-PRG-28** Data export contributor (BE-IDN-37): goals, evidence, achievements, mastery
- [ ] **BE-PRG-36** Mastery decay refresh: a daily scheduled message recomputes scores for topics whose last evidence is older than 7 days (recency weights change with time), batched
- [ ] **BE-PRG-37** Projection rebuild command (`dotnet run -- progress:rebuild --user <id>|--all`): replays observations into `topic_mastery` and evidence into goals, for bug fixes and the BKT switch

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Tampering: self-reported progress | Goals | No endpoint accepts progress values; evidence comes only from events | BE-PRG-16 |
| Tampering: gaming a goal | Create, update | Baseline rule on every goal; locked once achieved; mastery goals need 5 questions | BE-PRG-03, BE-PRG-22 |
| Tampering: replayed events inflating progress | Handlers | Unique keys on evidence, observations, awards | BE-PRG-55 |
| Information disclosure: other students' progress | All reads | Ownership filter; parents only through Family contracts with consent | BE-PRG-50 |
| Repudiation | Goal achievement | Evidence list with source ids | BE-PRG-05 |
| Denial of service | Dashboard fan-out | Per-call budgets, cache | BE-PRG-13 |
| Elevation | Paid analytics blocks | Entitlement checks server-side | BE-PRG-11, BE-PRG-12 |

- [ ] **BE-PRG-50** Threat model in the README; authorisation matrix test per endpoint (anonymous, parent, other student, owner)

### Input limits, rate limits, idempotency, concurrency

- [ ] **BE-PRG-51** Body caps 4 KB; field limits as above; tests
- [ ] **BE-PRG-52** Rate limits: `default` policy; goal create 30 per hour per user (`progress-goals-write`); test
- [ ] **BE-PRG-53** `Idempotency-Key` on create and update; `If-Match` on update and delete returning 412 and 428; event handlers serialise per goal through `xmin` retries (3 attempts) so concurrent evidence never loses an increment; concurrency test with 20 parallel graded events

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `goals.*`, `goal_evidence` | Personal information (a possibly minor student's academic performance) | Life of the account; deleted 30 days after account deletion |
| `topic_mastery`, `mastery_observations` | Personal information (performance profile, an automated assessment) | As above |
| achievements | Personal information | As above |

- [ ] **BE-PRG-54** Classification in the README and POPIA inventory; deletion and export tests; the mastery projection is described in the privacy policy as an automated estimate that never makes decisions about the student (POPIA section 71)

### Audit, observability

- [ ] **BE-PRG-55** Replay test: each consumed event delivered 10 times produces one evidence row, one observation per topic and one award (the points row check joins BE-PRG-70 if points return)
- [ ] **BE-PRG-56** Trace spans: `progress.goal.evaluate`, `progress.mastery.recompute`, `progress.dashboard.block` (attribute `block`)
- [ ] **BE-PRG-57** Metrics on meter `Aptiverse.Progress`: `aptiverse.progress.event_lag_seconds` (histogram, event occurred to projected), `aptiverse.progress.goals.achieved` (counter, tag `criteria_type`), `aptiverse.progress.mastery.recomputed` (counter), `aptiverse.progress.dashboard.block_timeouts` (counter, tag `block`), `aptiverse.progress.baseline_refusals` (counter)
- [ ] **BE-PRG-58** Alerts: event lag p95 above 2 minutes for 10 minutes; dashboard block timeouts above 5% over 15 minutes; any handler dead-lettered
- [ ] **BE-PRG-59** Audit: projection rebuild runs are written to the security event log (actor, scope)

### Performance budgets

- [ ] **BE-PRG-60** Budgets: dashboard p95 under 300 ms (cached under 50 ms); mastery p95 under 200 ms with 50 topics across 8 units; goal list p95 under 150 ms; mastery recompute per topic under 20 ms with 500 observations; `EXPLAIN` on every read query

### Migration safety and SLO

- [ ] **BE-PRG-61** Projections are rebuildable, so projection schema changes may drop and rebuild (with the rebuild command) instead of data migrations; goal and evidence tables follow expand and contract with rollback notes
- [ ] **BE-PRG-62** SLOs: read endpoints inside the platform p95 SLO; event to projection within 2 minutes for 99%

### Correctness tests

- [ ] **BE-PRG-15** Test: missing evidence returns null, never zero, on mastery, analytics, dashboard, goals (`currentValue` and `progressPercent`) and `IMasterySnapshot`
- [ ] **BE-PRG-38** Baseline rule tests: threshold target equal to baseline refused, one above accepted, no-evidence baseline accepted, update re-checks baseline, count goals ignore pre-creation attempts
- [ ] **BE-PRG-39** Property-based tests (FsCheck): mastery score always within 0 to 1 or null; adding a correct observation never lowers the score; band boundaries exact at 0.50, 0.70, 0.85
- [ ] **BE-PRG-63** Determinism test: rebuilding projections from observations gives identical `topic_mastery` rows
- [ ] **BE-PRG-64** Dashboard number trace test (Phase 7 exit gate): every numeric field in `DashboardView` maps to a tested query (a test enumerates the record's properties and fails if one lacks a named test)
- [ ] **BE-PRG-65** Out-of-order events: a pledge `paid` event arriving before `created` still ends in `paid` *(deferred: decision 6, not in v1)*
- [ ] **BE-PRG-66** Seed for local dev: a student with goals in each criteria type, mastery across bands, early reads and no-evidence topics
- [ ] **BE-PRG-67** BKT readiness: a test writes `bkt_v1` rows and the API keeps reading `recency_weighted_v1` until a config switch flips
- [ ] **BE-PRG-68** k6 dashboard scenario at 10x peak (HRD-10)
- [ ] **BE-PRG-40** Error code contract test (every `Error` constant in the error code table)

## Old data mapping

| Old (43f9faa) | New | Notes (feeds MIG-12) |
|---|---|---|
| `goals.goals` (`long Id`, `StudentId`, `SubjectId`, `Kind` custom, practice_tests, practice_score, topic_mastery, assessment_mark, checkin_streak, practice_streak; `TargetValue`, `CurrentValue`, `BaselineValue`, `AssessmentId`, `AchievedDifficulty`, `Status`, `DueDate`, `RewardPoints`; baseline enforced only for the rewarded kinds practice_score and topic_mastery) | `progress.goals` | `practice_tests` to `practice_tests_completed`; `topic_mastery` to `mastery_threshold`; `assessment_mark` to `assessment_mark_threshold` (with `AssessmentId` mapped); `practice_score` to `practice_score_best`; `custom`, `checkin_streak`, `practice_streak` migrated as `abandoned` history only (decision 20); `BaselineValue` copied (null where the old kind had none); `CurrentValue` copied with an evidence row `source_type = 'regrade'` summary "Migrated"; `AchievedDifficulty` dropped |
| `goals.goal_milestones` | `progress.milestones` | Only for migrated active goals with numeric thresholds; free-text milestones dropped |
| `goals.points_transactions`, `goals.student_points` (`TotalPoints`, `AvailablePoints`, `UsedPoints`, `Level`, `CurrentRank`) | none in v1 (decision 6) | Not migrated. Exported to the migration archive (MIG-44) with per-user `AvailablePoints`, so balances can be honoured if rewards return; level and rank dropped |
| `goals.rewards`, `goals.student_rewards`, `goals.reward_features` | none | Older reward store, superseded by quota grants in the old app |
| `entitlements.quota_grants` (points spent on bonus quota) | none in v1 (decision 6) | Archived with the points data (MIG-45); see Billing mapping |
| `goals.goal_allowances` | none | Created at `dc457d3` and dropped by the `GoalBaselineAndQuotaGrants` migration before `43f9faa`; nothing to migrate |
| `goals.growth_trackings` | none | Dropped |
| `mastery.topic_masteries` (`MasteryLevel` double per `StudentSubjectId`, `TopicId`) | not migrated | Rebuilt from migrated practice attempts by the rebuild command so every score has evidence |
| `mastery.knowledge_gaps`, `mastery.student_subject_analytics` | none | Derived data, rebuilt |

## Tests

- Unit: goal evaluator, baseline calculator, mastery formula and bands, activity runs, achievement rules.
- Integration: every slice happy, validation, forbidden, not found, idempotency and ETag paths; each event handler with replay; regrade correction; expiry.
- Property-based: BE-PRG-39.

## Contracts requested by other modules

- [ ] **BE-PRG-69** Publish `GoalDeleted` (goal id, student id, linked target requirement id) through the outbox when a goal is deleted, so Careers can unlink the requirement without deleting the target

## Open questions

1. Decided (21): the baseline rule applies to every goal.
2. Decided (20): `assessment_mark_threshold` is in v1. The mark is self-entered, which is acceptable because no reward hangs on it (decision 6).
3. `IPredictedResult` is not yet a named Academics contract (BE-ACA-42 is a pure function). Academics needs to expose it for analytics and Family.
4. Active goal cap on the free plan: assumed 3 (`goals.basic`), matching the old free feature keys; confirm.
5. Should achieving a mastery goal require the score to hold for more than one attempt (to avoid a lucky test)? The 5-question minimum is the v1 guard.
6. Decided (6): neither pledges nor points in v1. BE-PRG-25, 31, 48, 49, 65 and 70 are deferred, as are the Family pledge tasks and Billing BE-BIL-60 and 63 to 65.
7. Decided (20): old custom and streak goals are dropped; their history is kept as abandoned goals.
8. Decided (20): count goals count from creation.
