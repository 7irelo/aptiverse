# Careers and admission targets (inside Academics)

| | |
|---|---|
| ID range | `BE-CAR-01` to `BE-CAR-06` (original), `BE-CAR-07` to `BE-CAR-19` (splits and additions), `BE-CAR-30` to `BE-CAR-45` (production readiness) |
| Schema | `academics` (same module and DbContext as `academics.md`) |
| Projects | `src/Modules/Academics/Aptiverse.Academics` (`Features/Careers/*`, `Features/Targets/*`), `Aptiverse.Academics.Contracts`, `tests/Aptiverse.Academics.UnitTests` |
| Phase | 7 |
| Consumes | Academics internals (`study_units`, `enrolments`, `catalog_subjects`, `IAssessmentEvidence` and `UnitWeighting` from BE-ACA-42), `Aptiverse.Identity.Contracts` (`IUserProfileLookup`, `UserErased`), `Aptiverse.Progress.Contracts` (`GoalDeleted`, optional, to clear `goal_id`) |
| Publishes | `AdmissionTargetCreated`, `AdmissionTargetArchived`, `AdmissionRequirementGoalLinked`; implements `IAdmissionTargetsLookup` (Family overview, Progress journey) |
| Depends on | BE-ACA-10, BE-ACA-11, BE-ACA-29, BE-ACA-42, BE-ACA-72, BE-SK-45 |
| Status | Not started (0 of 35 tasks) |

## Responsibilities and out of scope

Responsible for:

- Admission and progression targets in the student's own words and numbers, with per-subject or per-module minimum requirements and where the student found them.
- Standing per requirement and per target computed only from measured marks (null when there is no evidence, never zero).
- An APS estimate on the common NSC scale, clearly labelled as an estimate with the scale used and per-subject points, never used to call a target clear or short.
- A careers reference list with search, for inspiration and for linking a target to a career.

Out of scope, by design (carried over from the old `AdmissionTarget` model at 43f9faa):

- Any catalogue of institution or programme requirements. We never assert a requirement; the student researches and enters it. Institution and programme stay free text.
- Salaries, "match scores" or any number we cannot measure (the old `CareersController` DTO had `averageSalary` and `matchScore`; both are dropped).
- Institution-specific APS formulas (open question 1).
- The reach engine and what-if panel arithmetic (ported to the web, `features/career`); the API supplies evidence, the web does presentation maths.
- Bursaries (permanently out).

Careers and targets are free for everyone (no entitlement), as in the old app: a student who cannot pay most needs to know how far they are from their goal.

## Data model

Schema `academics`. Platform columns on every table unless noted.

### careers (reference, BE-CAR-01)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| slug | varchar(64) | no | unique filtered `deleted_at IS NULL` |
| title | varchar(120) | no | trigram index for search |
| field | varchar(48) | no | check over the field list in the data file (`health`, `engineering`, `it`, `education`, `law`, `finance`, `natural_sciences`, `social_sciences`, `arts_design`, `trades`, `agriculture`, `public_service`, `business`, `hospitality`) |
| summary | varchar(500) | no | plain description, no claims about pay or demand |
| typical_study_paths | varchar(500) | yes | "Degree in ..., or a diploma in ..." free text |
| typical_subjects | jsonb | no | array of catalog subject slugs commonly required (validated against `catalog_subjects` by the seeder); not a requirement statement |
| source_ref | varchar(200) | no | data source citation (open question 2) |
| is_active | boolean | no | |

### admission_targets

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, status)` |
| institution | varchar(160) | no | free text as typed |
| programme | varchar(160) | no | free text as typed |
| kind | varchar(16) | no | check `kind IN ('admission','progression')` |
| stage | varchar(16) | yes | check `stage IS NULL OR stage IN ('next_year','honours','masters','phd')`; check `kind = 'progression' OR stage IS NULL` |
| overall_unit | varchar(8) | yes | check `overall_unit IS NULL OR overall_unit IN ('aps','average')` |
| overall_required | smallint | yes | check: when `aps` between 0 and 60, when `average` between 0 and 100; null iff `overall_unit` null |
| deadline_on | date | yes | application or decision deadline |
| source_note | varchar(500) | yes | "UCT prospectus 2027 p.14" |
| status | varchar(16) | no | check `status IN ('active','archived')` |
| career_id | uuid | yes | FK `careers.id` restrict; index |
| display_order | smallint | no | |

Max 10 active targets per user (validator).

### target_requirements

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| target_id | uuid | no | FK `admission_targets.id` restrict; index |
| catalog_subject_id | uuid | yes | FK `catalog_subjects.id` restrict; index; for high school requirements (grade independent, so a Grade 11 requirement still applies in Grade 12) |
| study_unit_id | uuid | yes | FK `study_units.id` restrict; index; for tertiary requirements (a specific course or module) |
| minimum_percent | smallint | no | check `minimum_percent BETWEEN 0 AND 100` |
| goal_id | uuid | yes | Progress goal created from this requirement; no FK (other module); cleared on `GoalDeleted` |
| check | | | exactly one of `catalog_subject_id`, `study_unit_id` |
| unique | | | `(target_id, catalog_subject_id)` and `(target_id, study_unit_id)` each filtered not null and `deleted_at IS NULL` |

Max 30 requirements per target (the old controller's `MaxRequirements`).

## Contracts

```
public interface IAdmissionTargetsLookup   // Family overview (consent-scoped there), Progress journey
{
    Task<IReadOnlyList<TargetStandingSummary>> GetActiveAsync(Guid userId, CancellationToken ct);
}
public sealed record TargetStandingSummary(Guid TargetId, string Institution, string Programme, string Kind,
    int RequirementCount, int RequirementsMet, int RequirementsShort, int RequirementsWithoutEvidence, DateOnly? DeadlineOn);

public sealed record AdmissionTargetCreated(Guid UserId, Guid TargetId, string Kind, DateTimeOffset OccurredAt);
public sealed record AdmissionTargetArchived(Guid UserId, Guid TargetId, DateTimeOffset OccurredAt);
public sealed record AdmissionRequirementGoalLinked(Guid UserId, Guid TargetId, Guid RequirementId, Guid GoalId, DateTimeOffset OccurredAt);
```

Event payloads never carry institution or programme text (they can identify a minor's plans); consumers read details through the lookup.

## Foundation tasks

- [ ] **BE-CAR-01** `careers` reference list seed: table, `Data/careers/careers.json` with JSON Schema, loaded by the Academics reference seeder (BE-ACA-04); initial list of about 150 careers across the fields above, each with a cited source (open question 2)
- [ ] **BE-CAR-02** `admission_targets` and `target_requirements` (student-entered only): entities, configurations, check constraints, migration (part of the Academics migration set)
- [ ] **BE-CAR-16** Requirement resolution rules: high school students attach requirements to catalog subjects (must be a subject in their curriculum); tertiary students attach to study units they are or were enrolled in; a requirement on a subject the student does not take is allowed (they may plan to add it) and shows `noEvidence`
- [ ] **BE-CAR-04** Standing per unit from measured marks (null when no evidence): `TargetStanding.Compute(target, requirements, evidence)` (pure, unit tested). For each requirement: `measuredPercent` = the current weighted percent of the matching enrolment (BE-ACA-42; for a catalog subject, the enrolment in the student's current grade, else the most recent grade with graded evidence), `predictedPercent`, `gap = minimumPercent - measuredPercent` (null without evidence), `status` = `met` (measured at or above minimum), `short`, or `no_evidence`. For the target: counts per status; overall `average` requirement compared with the weighted mean of measured percents over the required units (or all active units when no requirements), `met` or `short` or `no_evidence`; overall `aps` requirement is never compared (`status = not_assessed`), only reported next to the estimate (BE-CAR-06). Nothing is ever rounded to make a target look met
- [ ] **BE-CAR-06** APS calculation (pure, unit tested, high school only), returning an estimate, never a verdict: `ApsEstimator.Estimate(subjectPercents, scale)` on the common NSC scale `nsc_7_level_best_6_excluding_lo` (achievement levels 80 to 100 = 7, 70 to 79 = 6, 60 to 69 = 5, 50 to 59 = 4, 40 to 49 = 3, 30 to 39 = 2, 0 to 29 = 1; best six subjects excluding Life Orientation). Output: `{ scale: { id, label, description }, basis: current|predicted, estimate (int or null), maxPossible: 42, complete (bool: at least six non-LO subjects have evidence), subjects: [ { subjectId, name, percent, points, counted, excludedReason } ], warning }` with the fixed warning copy "This is an estimate on the common NSC scale. Universities calculate APS in their own ways. Check the prospectus for the programme you want." The estimate is null when no subject has evidence; partial evidence returns the partial sum with `complete: false`. Unit tests: boundaries at every level edge (79.99 to 6, 80 to 7), LO excluded, fewer than six subjects, ties for the sixth subject. Tertiary students get `403 careers.aps_high_school_only`
- [ ] **BE-CAR-15** Publish `AdmissionTargetCreated`, `AdmissionTargetArchived`, `AdmissionRequirementGoalLinked` through the outbox; implement `IAdmissionTargetsLookup`
- [ ] **BE-CAR-17** `GoalDeleted` handler (when Progress publishes it): clear `goal_id` on matching requirements (the old app treated a dangling goal id as "not generated"; this keeps the column truthful)
- [ ] **BE-CAR-18** POPIA: targets and requirements included in the Academics exporter and eraser (BE-ACA-73); classify `institution`, `programme`, `source_note` as free text about a possible minor's plans

## Slices

Group `/academics`, tag `Academics`. Ownership: every target and requirement query filters `user_id = current user`; other users' ids return 404.

### BE-CAR-03  POST /academics/targets

| | |
|---|---|
| Operation id | `createAdmissionTarget` |
| Permission | `academics.manage` |
| Entitlement | free (never gated) |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key` |
| Metric | `aptiverse.careers.targets.created` (counter, tags `kind`, `overall_unit`, `stage_level=high_school|tertiary`) |
| Log fields | `UserId`, `TargetId`, `Kind`, `RequirementCount` (never institution or programme text) |

Request `CreateTargetRequest`:

| Field | Rules |
|---|---|
| institution | required, 2 to 160, trimmed, no control characters |
| programme | required, 2 to 160 |
| kind | required; high school students may only use `admission`; tertiary may use either |
| stage | required when `progression`, else must be null |
| overallUnit | optional `aps` or `average`; `aps` only for high school |
| overallRequired | required iff `overallUnit`; APS 0 to 60, average 0 to 100 |
| deadlineOn | optional date, today to 3 years ahead |
| sourceNote | optional, max 500 |
| careerId | optional, active career |
| requirements | optional 0 to 30 `{ subjectId or studyUnitId, minimumPercent 0 to 100 }`, unique per subject or unit |

Response `201 TargetView` (all fields, requirements with names resolved, and the standing block from BE-CAR-04).

Failures: `400`; `403 careers.not_a_student`; `404 careers.subject_not_found`, `careers.unit_not_found`, `careers.career_not_found`; `409 careers.too_many_targets` (10 active).

Events: `AdmissionTargetCreated`.

- [ ] **BE-CAR-03** `POST /academics/targets`
  - [ ] Endpoint (`RequirePermission`, `WithValidation`, `WithIdempotency`)
  - [ ] `CreateTargetRequest`, `TargetView`, `RequirementView` records
  - [ ] Validator (stage-aware rules from `IUserProfileLookup`)
  - [ ] Handler
  - [ ] Unit tests: APS rejected for tertiary; progression without stage rejected
  - [ ] Integration tests: happy for both stages; parent 403; replay with the same key

### BE-CAR-07  GET /academics/targets

| | |
|---|---|
| Operation id | `listAdmissionTargets` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.careers.targets.list.duration` (histogram) |
| Log fields | `UserId`, `Status`, `ResultCount` |

Request (query): `status` `active` (default), `archived` or `all`. Response `200 TargetSummary[] { id, institution, programme, kind, stage, overallUnit, overallRequired, deadlineOn, status, careerId, requirementCount, standing: { met, short, noEvidence, overallStatus } }` ordered by `display_order`, then deadline.

- [ ] **BE-CAR-07** `GET /academics/targets` (split from BE-CAR-03)
  - [ ] Endpoint, request and response records, validator, handler (one evidence read for all targets)
  - [ ] Integration tests: archived filter; other user's targets absent

### BE-CAR-08  GET /academics/targets/{id}

| | |
|---|---|
| Operation id | `getAdmissionTarget` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read; `ETag` from `xmin` |
| Metric | `aptiverse.careers.targets.get.duration` |
| Log fields | `UserId`, `TargetId` |

Response `200 TargetView` with full standing per requirement (BE-CAR-04) and, for high school APS targets, the APS estimate block (BE-CAR-06) next to `overallRequired` with `overallStatus = not_assessed`. Failures `404 careers.target_not_found`.

- [ ] **BE-CAR-08** `GET /academics/targets/{id}` (split from BE-CAR-03)
  - [ ] Endpoint, response records, handler
  - [ ] Integration tests: other user 404; APS target shows estimate and `not_assessed`

### BE-CAR-09  PATCH /academics/targets/{id}

| | |
|---|---|
| Operation id | `updateAdmissionTarget` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | PATCH; `If-Match` honoured |
| Metric | `aptiverse.careers.targets.updated` (counter, tag `archived`) |
| Log fields | `UserId`, `TargetId`, `ChangedFields` |

Request `UpdateTargetRequest`: any of the create fields except `requirements`, plus `status` (`active` or `archived`; reactivating respects the 10 active cap) and `displayOrder`. Archiving publishes `AdmissionTargetArchived`. Response `200 TargetView`. Failures `400`, `404`, `409 careers.too_many_targets`, `409 concurrency_conflict`.

- [ ] **BE-CAR-09** `PATCH /academics/targets/{id}` (split from BE-CAR-03)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: archive then reactivate; stale version 409

### BE-CAR-10  DELETE /academics/targets/{id}

| | |
|---|---|
| Operation id | `deleteAdmissionTarget` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.careers.targets.deleted` (counter) |
| Log fields | `UserId`, `TargetId` |

Soft deletes the target and its requirements (archive is the recommended path in the UI; delete removes history). Linked goals are left alone (Progress owns them). Response `204`.

- [ ] **BE-CAR-10** `DELETE /academics/targets/{id}` (split from BE-CAR-03)
  - [ ] Endpoint, handler, integration test (other user 404)

### BE-CAR-11  PUT /academics/targets/{id}/requirements

| | |
|---|---|
| Operation id | `replaceTargetRequirements` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | PUT replaces the set; idempotent |
| Metric | `aptiverse.careers.requirements.replaced` (counter), `aptiverse.careers.requirements.count` (histogram) |
| Log fields | `UserId`, `TargetId`, `RequirementCount` |

Request `ReplaceRequirementsRequest`: `requirements` 0 to 30 as in create, optionally carrying an existing `id` to keep its `goal_id`. Rows not listed are soft deleted. Response `200 TargetView`.

- [ ] **BE-CAR-11** replace the requirement set of a target
  - [ ] Endpoint, request record, validator, handler (diff by id, then by subject or unit)
  - [ ] Unit tests: goal link preserved when the requirement is kept
  - [ ] Integration tests: duplicates 400; 31 requirements 400

### BE-CAR-12  PATCH /academics/targets/{id}/requirements/{requirementId}

| | |
|---|---|
| Operation id | `updateTargetRequirement` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | PATCH |
| Metric | `aptiverse.careers.requirements.goal_linked` (counter) |
| Log fields | `UserId`, `TargetId`, `RequirementId`, `GoalLinked` |

Request: `minimumPercent` optional; `goalId` optional uuid or null (link or unlink the Progress goal generated from this requirement, as the old `PATCH requirements/{requirementId}`); the goal's ownership is checked through `Aptiverse.Progress.Contracts` (`IGoalOwnership.IsOwnedByAsync`) when available, else accepted and cleared later if it never existed. Publishes `AdmissionRequirementGoalLinked` on link. Response `200 RequirementView`.

- [ ] **BE-CAR-12** update one requirement (minimum or goal link)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: other user's goal id rejected with 404 when the Progress contract exists

### BE-CAR-13  GET /academics/targets/standing

| | |
|---|---|
| Operation id | `getAdmissionTargetsStanding` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: no-store` |
| Metric | `aptiverse.careers.standing.get.duration` (histogram), `aptiverse.careers.standing.no_evidence_ratio` (histogram, share of requirements without evidence) |
| Log fields | `UserId`, `TargetCount`, `RequirementCount`, `NoEvidenceCount` |

Request (query): `targetId` optional (one target), `basis` `current` (default) or `predicted`. Response `200`:

```
{
  basis,
  evidenceAsOf,                              // latest graded_at across the student's assessments, null when none
  targets: [ {
    targetId, institution, programme, kind, overallUnit, overallRequired,
    overall: { status: met|short|no_evidence|not_assessed, measuredPercent | null, gap | null },
    requirements: [ { requirementId, subjectId | null, studyUnitId | null, name, minimumPercent,
                      measuredPercent | null, predictedPercent | null, gap | null,
                      status: met|short|no_evidence, gradedCount, lastGradedAt | null, goalId | null } ],
    counts: { met, short, noEvidence }
  } ],
  aps: { ...BE-CAR-06 estimate... } | null      // high school only
}
```

`measuredPercent` and `gap` are null whenever there is no graded evidence; the API never substitutes 0. This is the route the original BE-CAR-04 lacked; BE-CAR-04 stays the computation task.

- [ ] **BE-CAR-13** `GET /academics/targets/standing` (route for BE-CAR-04)
  - [ ] Endpoint, request and response records, validator, handler (one `IAssessmentEvidence` call, then BE-CAR-04 and BE-CAR-06 in memory)
  - [ ] Unit tests: null propagation; predicted basis
  - [ ] Integration tests: student with no marks gets `no_evidence` everywhere and `aps.estimate = null`; after logging a mark the matching requirement turns `met` or `short`

### BE-CAR-14  GET /academics/aps-estimate

| | |
|---|---|
| Operation id | `getApsEstimate` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.careers.aps.estimates` (counter, tags `complete`, `basis`) |
| Log fields | `UserId`, `Complete`, `Basis` (never the estimate value) |

Request (query): `basis` `current` or `predicted`; optional `whatIf` list of `{ subjectId, percent }` (max 12, 0 to 100) to recompute with hypothetical marks for the what-if panel without storing anything. Response `200` BE-CAR-06 output. Failures `403 careers.aps_high_school_only`.

- [ ] **BE-CAR-14** standalone APS estimate endpoint (estimate, scale, per-subject points, warning)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: tertiary 403; what-if does not persist

### BE-CAR-05  GET /academics/careers

| | |
|---|---|
| Operation id | `searchCareers` |
| Permission | authenticated (any role; parents browse with their child) |
| Entitlement | free |
| Rate limit | `default`; `Cache-Control: private, max-age=3600` |
| Idempotency | safe read |
| Metric | `aptiverse.careers.search.duration`, `aptiverse.careers.search.zero_results` (counter) |
| Log fields | `UserId`, `QueryLength`, `Field`, `ResultCount` (never the query text, which can be personal) |

Request (query) `SearchCareersRequest`: `q` optional 2 to 60; `field` optional known field; `subjectId` optional (careers whose typical subjects include it); `page`, `pageSize` max 50. Response `200 PagedResult<CareerView> { id, slug, title, field, summary, typicalSubjects: [ { subjectId, name } ] }` ranked by trigram similarity then title.

- [ ] **BE-CAR-05** `GET /academics/careers` (search)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: search, field filter, subject filter

### BE-CAR-19  GET /academics/careers/{slug}

| | |
|---|---|
| Operation id | `getCareer` |
| Permission | authenticated (any role) |
| Rate limit | `default`; `Cache-Control: private, max-age=3600` |
| Idempotency | safe read |
| Metric | `aptiverse.careers.get.duration` |
| Log fields | `UserId`, `CareerSlug` |

Response `200 CareerView` plus `typicalStudyPaths` and `sourceRef`. Failures `404 careers.career_not_found` for inactive or unknown slugs.

- [ ] **BE-CAR-19** `GET /academics/careers/{slug}` (split from BE-CAR-05)
  - [ ] Endpoint, response record, handler
  - [ ] Integration tests: inactive 404

## Background work

| Message | Trigger | Handler |
|---|---|---|
| `GoalDeleted` (Progress) | Progress outbox | BE-CAR-17 |
| `UserErased` (Identity) | Identity outbox | BE-ACA-73 covers targets |
| `TargetDeadlineReminder` | scheduled 14 days and 2 days before `deadline_on` (opt-in through `academics_reminders` preferences) | sends `NotifyUser` "Your application deadline for <programme> is in 14 days" (BE-CAR-30 decides wording review) |

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | none beyond the access token | standard auth | |
| Tampering | linking another user's goal; editing another user's target | user filter; goal ownership check through Progress contract | BE-CAR-12, BE-CAR-31 |
| Repudiation | low risk (user-owned planning data) | timestamps and `xmin` | |
| Information disclosure | a minor's study plans leaking to parents or logs | Family reads only counts through `IAdmissionTargetsLookup` and only with consent; logs never carry institution, programme or query text | BE-CAR-35 |
| Denial of service | huge requirement sets, what-if spam | 30 requirements, 10 active targets, 12 what-if subjects | BE-CAR-32 |
| Elevation of privilege | parents writing targets | `academics.manage` only for students and admins | BE-CAR-31 |
| Misinformation (product risk) | presenting an APS estimate as an admission verdict | estimate block always carries scale and warning; APS never yields met or short | BE-CAR-06, BE-CAR-30 |

- [ ] **BE-CAR-30** Threat and claims note in `api/docs/security/threat-model-academics.md` (careers section): the no-fabrication rules above, reviewed against the claims ledger (HRD-43) before launch, including every copy string returned by the API (APS warning, deadline reminder)

### Authorisation and ownership tests

- [ ] **BE-CAR-31** Integration: other users' target and requirement ids return 404 on every slice; parent and admin-free roles get 403 on writes; careers search works for students and parents

### Input limits

- [ ] **BE-CAR-32** Limits enforced and tested: text fields 160 and 500, 10 active targets, 30 requirements, what-if 12 entries, search query 60 chars, request bodies under 16 KB

### Rate limits

- [ ] **BE-CAR-33** All slices under `default`; what-if recomputation is pure and cheap, so no separate policy

### Idempotency and concurrency

- [ ] **BE-CAR-34** `Idempotency-Key` on create; PUT requirements idempotent; concurrent PATCH with a stale version returns 409 (BE-SK-43); unique indexes stop duplicate requirements under races (BE-SK-44 maps 23505 to 409 `careers.duplicate_requirement`)

### Resilience

- [ ] **BE-CAR-36** Progress contract calls (goal ownership) degrade: when Progress is not registered or times out (500 ms), linking is accepted and verified later by BE-CAR-17; no outbound HTTP in this area

### Data retention and POPIA

- [ ] **BE-CAR-35** Classification and retention: targets and requirements are personal information about possible minors (education plans); kept for the life of the account, soft-deleted rows purged after 30 days, included in export and erased on `UserErased` (BE-CAR-18); Family sees counts only, gated by the student's privacy settings (BE-FAM-11)

### Audit

- [ ] **BE-CAR-37** Admin changes to the careers reference list (through the data file and seeder) are reviewed in PRs; no runtime admin CRUD in v1; student actions not audited (user-owned)

### Observability

- [ ] **BE-CAR-38** Metrics as listed per slice; alerts: **standing endpoint p95 above 300 ms for 10 min**, **5xx on target writes above 1 percent for 10 min**; dashboard panel for the share of requirements with no evidence (product signal that students need to log marks)
- [ ] **BE-CAR-39** Spans `Academics.TargetStanding`, `Academics.ApsEstimate` with attributes `aptiverse.targets.count`, `aptiverse.requirements.count`

### Performance budgets

- [ ] **BE-CAR-40** p95: targets list under 100 ms, standing under 150 ms for 10 targets with 30 requirements each, APS estimate under 30 ms, careers search under 60 ms; query plans checked for `(user_id, status)` and the careers trigram index (BE-SK-83)

### Migration safety

- [ ] **BE-CAR-41** Tables ship additive in the Academics migration set; the old `admission_requirements.unit_id` string keys are resolved during ETL, never stored as strings in the new schema; widening check lists uses `NOT VALID` then `VALIDATE`

### SLO contribution

- [ ] **BE-CAR-42** Careers and targets follow the platform availability SLO; correctness SLI: zero instances of a non-null `measuredPercent` without graded evidence (asserted by a nightly consistency query that logs and alerts on any hit)

### Load and failure tests

- [ ] **BE-CAR-43** Property-based unit tests (FsCheck or hand-rolled generators) for BE-CAR-04 and BE-CAR-06: no evidence never yields a number; adding a graded mark never changes the status of an unrelated requirement; APS estimate is monotonic in each subject's percent
- [ ] **BE-CAR-44** k6 (HRD-10): standing endpoint at 20 rps with seeded students holding 10 targets each
- [ ] **BE-CAR-45** Golden fixtures shared with the web reach engine: a JSON fixture set (inputs and expected standing) used by both the API unit tests and the web `features/career` tests so both sides agree on met, short and no evidence

## Old data mapping

Source: `academic_planning.admission_targets` and `academic_planning.admission_requirements` at `43f9faa` (migration `20260715140908_AddAdmissionTargets`, model `api/Modules/AcademicPlanning/Aptiverse.Api.Domain/Models/AcademicPlanning/AdmissionTarget.cs`, controller `api/Controllers/AdmissionTargetsController.cs`). Feeds MIG-13.

| Old table.column | New | Transform |
|---|---|---|
| `admission_targets.id` (bigint) | `admission_targets.id` | new Guid v7, lookup kept |
| `student_id` (text) | `user_id` | MIG user lookup |
| `institution`, `programme` | same | truncated to 160 (old limit `MaxNameLength = 160`, so no truncation expected) |
| `kind`, `stage`, `overall_unit`, `overall_required`, `status` | same | values identical (`admission`/`progression`, `next_year`/`honours`/`masters`/`phd`, `aps`/`average`, `active`/`archived`) |
| `deadline` (timestamptz) | `deadline_on` | date in SAST |
| `source_note` | same | max 500 (old `MaxNoteLength = 500`) |
| `admission_requirements.admission_target_id` | `target_id` | lookup |
| `admission_requirements.unit_id` (subject slug such as `math`, or course practice key such as `uct:calculus-i`) | `catalog_subject_id` or `study_unit_id` | slug to the catalog subject; practice key to the shared tertiary unit from MIG-06; unresolvable keys reported and skipped |
| `minimum_percent` | same | |
| `goal_id` (bigint) | `goal_id` | through the Progress goal lookup from MIG-12; null when the goal was deleted |
| careers | none | the old `CareersController` returned an empty list; BE-CAR-01 seeds fresh data |

## Tests

- Unit: BE-CAR-04 standing (met, short, no evidence, overall average, APS never assessed), BE-CAR-06 APS levels and selection, validators per stage, BE-CAR-43 properties, BE-CAR-45 shared fixtures.
- Integration: every slice's happy, validation, forbidden and not found cases; BE-CAR-31; standing after a mark is logged through BE-ACA-37.

## Open questions

1. Decided (18): v1 shows only the common NSC estimate with a clear warning and never marks a target met or short on APS alone; named institution scales are revisited after launch. Background: universities count six or seven subjects, include or halve Life Orientation, use different point tables (some go to 8 points for 90 percent and above) or their own scales. v1 shows only the common NSC estimate with a warning and never marks a target clear or short on APS. Should a later version let the student choose a named institution scale (data maintained per year), or stay with the single common scale?
2. Careers reference data source: candidates are the DHET "Occupations in High Demand" list, SAQA occupational descriptors, or a hand-written list. Licensing and update cadence decide; every row cites its source.
3. Should parents be able to see a child's targets (counts only, as proposed through Family consent) or the full target text with explicit consent?
4. Deadline reminders: opt-in under `academics_reminders` (proposed) or a separate category?
5. Should the average comparison for an `average` target use only required units (proposed when requirements exist) or every active unit?
