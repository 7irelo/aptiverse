# Academics module (catalog, study units, assessments, calendar, past papers)

| | |
|---|---|
| ID range | `BE-ACA-01` to `BE-ACA-06`, `10` to `20`, `30` to `42`, `50` to `54`, `60` to `62` (original); `07` to `09`, `21` to `29`, `43` to `49`, `55` to `59`, `63` to `76` (splits and additions); `BE-ACA-80` to `BE-ACA-99` (production readiness). Careers and admission targets live in the same module and schema but are tracked in `careers.md` (`BE-CAR-*`) |
| Schema | `academics` |
| Projects | `src/Modules/Academics/Aptiverse.Academics`, `src/Modules/Academics/Aptiverse.Academics.Contracts`, `tests/Aptiverse.Academics.UnitTests`, data files under `src/Modules/Academics/Aptiverse.Academics/Data/` |
| Phase | 4 |
| Consumes | `Aptiverse.Identity.Contracts` (`IUserProfileLookup`, `StudentStageChanged`, `UserErased`), `Aptiverse.Notifications.Contracts` (`SendTemplatedEmail`, `NotifyUser`, `INotificationPreferences`) |
| Publishes | `StudyUnitEnrolled`, `StudyUnitUnenrolled`, `AssessmentCreated`, `AssessmentDueChanged`, `AssessmentSubmitted`, `AssessmentGraded`, `AssessmentMarkRemoved`, `AssessmentDeleted`, `TopicRegistered`; implements `IStudyUnitLookup`, `ITopicRegistry`, `IInstitutionCatalog`, `IAssessmentEvidence`, `IPredictedResult`, `IAssessmentLookup` |
| Depends on | BE-SK-20, BE-SK-24, BE-SK-28, BE-SK-30, BE-SK-45, BE-SK-51, BE-IDN-43, BE-NTF-12, BE-NTF-17, INF-14 (uploads bucket, private, versioned, CORS for presigned PUT from the web origin) |
| Status | Not started (0 of 96 tasks). No Academics project exists in `api/src/Modules` |

All times are stored as `timestamptz` (UTC) and shown in `Africa/Johannesburg` in v1; there is no per-user time zone setting (BE-SK-51 helpers decide day boundaries for due dates, reminders and calendar ranges).

## Responsibilities and out of scope

Responsible for:

- The CAPS subject catalog (curricula, subjects, curriculum mapping), SBA programmes and exemplars, the tertiary institution catalog, and the South African academic calendar (school terms, university semesters).
- Study units (`caps_subject` or `tertiary_course`), enrolment with one gate for both stages, the emergent per-unit topic registry, and per-unit resources.
- Assessments with a lifecycle, marks, checklists, file uploads to S3 and the weighting toward a predicted result or GPA.
- The student calendar (assessment-derived events, study sessions, custom events), reminders as scheduled messages, and a signed ICS feed.
- Past papers: an index of papers per subject, grade, year and paper, either stored in S3 or linked to the official archive.
- Admission targets and careers (see `careers.md`).

Out of scope:

- Practice tests and AI generation (Practice, AiTutor); this module only lends unit context and the topic registry.
- Mastery and analytics projections (Progress), which consume `AssessmentGraded`.
- Parent views (Family reads through `IAssessmentEvidence` and `IStudyUnitLookup`).
- External calendar two-way sync (old `calendar_syncs` dropped; ICS one-way only).

## Data model

Schema `academics`. Platform columns on every table (`id uuid` PK Guid v7, `created_at`, `updated_at`, `deleted_at`, `xmin`) unless noted. `user_id` and `owner_user_id` reference Identity users by id only.

### curricula (reference)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| code | varchar(16) | no | unique; check `code IN ('nsc','ieb')`, the exam body (aligned with `identity.users.curriculum`, decision 29) |
| name | varchar(120) | no | "National Senior Certificate (CAPS)" |
| short_name | varchar(16) | no | |
| description | varchar(500) | yes | |

### catalog_subjects (reference)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| slug | varchar(32) | no | unique filtered `deleted_at IS NULL`; the old subject id (`math`, `physci`, `eng_hl`) kept for continuity |
| code | varchar(8) | no | card code (`MATH`) |
| name | varchar(120) | no | |
| category | varchar(24) | no | check `category IN ('language','mathematics','natural_science','commerce','humanities','services','technical','arts','life_orientation')` |
| language_type | varchar(24) | yes | check `language_type IS NULL OR language_type IN ('home','first_additional','second_additional')` |
| description | varchar(500) | yes | |
| is_active | boolean | no | inactive subjects are hidden from pickers but keep enrolments |

### curriculum_subjects (reference)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| curriculum_id | uuid | no | FK `curricula.id` restrict; unique `(curriculum_id, subject_id)` filtered `deleted_at IS NULL` |
| subject_id | uuid | no | FK `catalog_subjects.id` restrict; index |
| min_grade | smallint | no | check `min_grade BETWEEN 8 AND 12` |
| max_grade | smallint | no | check `max_grade BETWEEN min_grade AND 12` |
| is_compulsory | boolean | no | home language, first additional language, mathematics or maths literacy, life orientation |
| notes | varchar(300) | yes | |

### sba_programme_tasks (reference, BE-ACA-05)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| subject_id | uuid | no | FK `catalog_subjects.id`; index `(subject_id, grade, term, task_number)` unique |
| grade | smallint | no | check `grade BETWEEN 10 AND 12` (FET programmes; Grades 8 and 9 have none in the source) |
| term | smallint | no | check `term BETWEEN 1 AND 4` |
| task_number | smallint | no | check `task_number >= 1` |
| title | varchar(160) | no | normalised as in the old `sbaProgrammes.ts` |
| task_type | varchar(24) | no | check over the 17 `SbaTaskType` values (`test`, `exam`, `investigation`, `project`, `assignment`, `research`, `practical`, `portfolio`, `performance`, `oral`, `presentation`, `case_study`, `essay`, `report`, `pat`, `pet`, `creative_work`) |
| weight_percent | smallint | yes | check `weight_percent BETWEEN 0 AND 100`; null where CAPS does not specify |
| source_ref | varchar(200) | no | CAPS document and section |

### sba_exemplars (reference, BE-ACA-05)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| subject_id | uuid | no | FK; index `(subject_id, grade)` |
| grade | smallint | no | check 10 to 12 |
| letter | varchar(2) | yes | booklet label |
| task_type | varchar(24) | no | same check as above |
| title | varchar(200) | no | exact booklet title |
| topic | varchar(200) | yes | |
| marks | smallint | yes | check `marks > 0` |
| source_url | varchar(512) | no | DBE booklet URL (link out, not stored) |

### institutions (reference, BE-ACA-08)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| slug | varchar(32) | no | unique; old ids (`uct`, `wits`) |
| name | varchar(160) | no | trigram index for search |
| short_name | varchar(24) | yes | |
| type | varchar(32) | no | check `type IN ('university','university_of_technology','comprehensive_university','tvet','private_college')` |
| province | varchar(32) | yes | check over the nine provinces |
| is_active | boolean | no | |

### academic_terms (reference, BE-ACA-68)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| year | smallint | no | unique `(year, kind, scope, sequence)` |
| kind | varchar(16) | no | check `kind IN ('school_term','semester','exam_period','holiday')` |
| scope | varchar(48) | no | `public_schools` (DBE calendar), `ieb`, or an institution slug for semesters |
| sequence | smallint | no | 1 to 4 |
| starts_on | date | no | |
| ends_on | date | no | check `ends_on >= starts_on` |
| label | varchar(80) | no | "Term 2", "Semester 1", "NSC final exams" |
| source_url | varchar(512) | no | gazette or institution page |

### study_units

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| kind | varchar(16) | no | check `kind IN ('caps_subject','tertiary_course')` |
| catalog_subject_id | uuid | yes | FK `catalog_subjects.id` restrict; index; required for `caps_subject` |
| curriculum_code | varchar(16) | yes | check `curriculum_code IS NULL OR curriculum_code IN ('nsc','ieb')` (decision 29); required for `caps_subject` |
| grade | smallint | yes | check `grade IS NULL OR grade BETWEEN 8 AND 12`; required for `caps_subject` |
| institution_id | uuid | yes | FK `institutions.id` restrict; index; tertiary only |
| owner_user_id | uuid | yes | set for private tertiary units (no catalog institution); index |
| name | varchar(160) | no | catalog name for CAPS; student-entered course name for tertiary |
| normalized_key | varchar(200) | no | caps: `<subject slug>:<curriculum>:<grade>`; tertiary: `<institution slug or owner id>:<slugified code or name>:<level>`; unique filtered `deleted_at IS NULL` |
| course_code | varchar(32) | yes | tertiary, optional ("MAM1000W") |
| level | varchar(24) | yes | tertiary: check over `first_year`, `second_year`, `third_year`, `fourth_year`, `honours`, `masters`, `phd` (the old `AllowedLevels`, First year to PhD, no NQF levels); required for `tertiary_course` |
| check | | | `ck_study_units_shape`: caps requires `catalog_subject_id`, `curriculum_code`, `grade` and null `institution_id`, `owner_user_id`, `level`; tertiary requires `level` and exactly one of `institution_id`, `owner_user_id`, and null `catalog_subject_id`, `grade` |

CAPS units are shared reference rows created on first enrolment for `(subject, curriculum, grade)`. Tertiary units are shared per institution (so topics emerge across students of the same course) or private to the owner when the institution is not in the catalog (open question 3).

### enrolments

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, status)` |
| study_unit_id | uuid | no | FK `study_units.id` restrict; index; unique `(user_id, study_unit_id)` filtered `deleted_at IS NULL` |
| status | varchar(16) | no | check `status IN ('active','completed','dropped','stage_mismatch')` |
| teacher_name | varchar(120) | yes | teacher (high school) or lecturer (tertiary) |
| started_on | date | no | default enrolment date |
| duration | varchar(16) | yes | tertiary: check `duration IS NULL OR duration IN ('semester','full_year')` (the old app stored semesters as a number; v1 offers semester or full year) |
| expected_end_on | date | yes | computed: `started_on` plus 6 months for `semester`, 12 months for `full_year` (approximation as in the old app; the explicit finished flag always wins) |
| completed_at | timestamptz | yes | explicit "finished" overrides the computed end |
| display_order | smallint | no | user ordering, default 0 |
| colour_token | varchar(24) | yes | one of the design token names for unit chips; check over the token list |

### topics

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| study_unit_id | uuid | no | FK restrict; unique `(study_unit_id, slug)` filtered `deleted_at IS NULL` (leading column serves the FK) |
| slug | varchar(80) | no | slugified canonical key (the dedupe key, as in the old registry) |
| name | varchar(120) | no | first spelling seen |
| source | varchar(16) | no | check `source IN ('generation','student','admin','migration')` |
| merged_into_topic_id | uuid | yes | self FK, index; admin merges duplicates ("Trig" into "Trigonometry") |

### unit_resources (BE-ACA-21)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| enrolment_id | uuid | no | FK `enrolments.id` restrict; index `(enrolment_id, created_at)` |
| user_id | uuid | no | owner (denormalised for authorisation); index |
| kind | varchar(16) | no | check `kind IN ('link','note')` (files are attached to assessments in v1) |
| title | varchar(160) | no | |
| url | varchar(1024) | yes | `https://` only; required for `link` |
| note | varchar(4000) | yes | required for `note` |

### assessments

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, due_at)`, index `(user_id, state)` |
| enrolment_id | uuid | no | FK `enrolments.id` restrict; index `(enrolment_id, due_at)` |
| title | varchar(160) | no | |
| assessment_type | varchar(24) | no | check over `test`, `essay`, `investigation`, `practical`, `exam`, `project`, `oral`, `assignment`, `class_test`, `tutorial`, `lab_report`, `midterm`, `presentation` (the old union; offered subset per stage is a client concern, the server rejects only unknown values) |
| weight_percent | numeric(5,2) | yes | check `weight_percent BETWEEN 0 AND 100` |
| term | smallint | yes | check `term BETWEEN 1 AND 4`; high school only |
| due_at | timestamptz | no | |
| state | varchar(16) | no | check `state IN ('scheduled','in_progress','submitted','graded')` |
| predicted_percent | numeric(5,2) | yes | check 0 to 100 |
| mark_obtained | numeric(7,2) | yes | check `mark_obtained >= 0` |
| mark_total | numeric(7,2) | yes | check `mark_total > 0`; check `mark_obtained IS NULL OR mark_obtained <= mark_total` |
| percent | numeric(5,2) | yes | stored generated `round(mark_obtained / mark_total * 100, 2)` |
| notes | varchar(2000) | yes | |
| sba_task_id | uuid | yes | FK `sba_programme_tasks.id` restrict; index |
| started_at | timestamptz | yes | |
| submitted_at | timestamptz | yes | |
| graded_at | timestamptz | yes | check `state <> 'graded' OR (graded_at IS NOT NULL AND mark_obtained IS NOT NULL)` |
| reminder_scheduled_for | timestamptz | yes | the pending due reminder time (BE-ACA-53) |

### assessment_tasks (BE-ACA-45)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| assessment_id | uuid | no | FK restrict; index `(assessment_id, sort_order)` |
| label | varchar(160) | no | |
| done | boolean | no | |
| sort_order | smallint | no | 0 to 49 |

Max 50 tasks per assessment (validator).

### assessment_uploads (BE-ACA-43)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| assessment_id | uuid | no | FK restrict; index |
| user_id | uuid | no | owner, denormalised; index `(user_id, created_at)` |
| s3_key | varchar(512) | no | unique; built by `IObjectStorage` (no user-supplied path segments) |
| original_filename | varchar(255) | no | sanitised (no path separators or control characters) |
| content_type | varchar(64) | no | check over the allowlist (as the old app): `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`, `application/pdf`; Word documents are not accepted |
| declared_size_bytes | bigint | no | check `declared_size_bytes BETWEEN 1 AND 10485760` (10 MB) |
| verified_size_bytes | bigint | yes | from S3 HEAD |
| sha256 | char(64) | yes | computed on confirm (streamed) for duplicate detection |
| status | varchar(16) | no | check `status IN ('pending','verified','rejected')` |
| rejected_reason | varchar(32) | yes | `size_mismatch`, `type_mismatch`, `missing`, `malware` |
| expires_at | timestamptz | yes | pending uploads expire after 30 min |
| verified_at | timestamptz | yes | |

Max 10 uploads (pending plus verified) per assessment; per-user storage cap 500 MB (open question 6).

### calendar_events

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, starts_at)` |
| kind | varchar(16) | no | check `kind IN ('assessment','study_session','custom')` |
| title | varchar(160) | no | |
| description | varchar(2000) | yes | |
| location | varchar(200) | yes | |
| starts_at | timestamptz | no | |
| ends_at | timestamptz | no | check `ends_at >= starts_at` and duration at most 14 days |
| all_day | boolean | no | |
| recurrence_rule | varchar(200) | yes | RRULE subset `FREQ=WEEKLY;BYDAY=..;UNTIL=..` or `FREQ=DAILY;UNTIL=..`; UNTIL required and within 1 year |
| assessment_id | uuid | yes | FK `assessments.id` restrict; unique filtered not null and `deleted_at IS NULL` (one derived event per assessment) |
| enrolment_id | uuid | yes | FK restrict; index; optional link for study sessions |
| check | | | `kind = 'assessment'` iff `assessment_id IS NOT NULL` |

### calendar_reminders (BE-ACA-57)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| calendar_event_id | uuid | no | FK restrict; unique `(calendar_event_id, minutes_before)` filtered `deleted_at IS NULL` |
| minutes_before | integer | no | check `minutes_before IN (0, 10, 30, 60, 120, 1440, 2880, 10080)` |
| channel | varchar(16) | no | check `channel IN ('in_app','email')` |
| fire_at | timestamptz | no | index; next occurrence for recurring events |
| sent_at | timestamptz | yes | last fired occurrence |

### calendar_feed_tokens (BE-ACA-54, BE-ACA-58)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique filtered `revoked_at IS NULL AND deleted_at IS NULL` (one live token per user) |
| token_hash | char(64) | no | unique |
| revoked_at | timestamptz | yes | |
| last_fetched_at | timestamptz | yes | |

### past_papers (BE-ACA-60)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| subject_id | uuid | no | FK `catalog_subjects.id` restrict; index `(subject_id, grade, year desc)` |
| exam_body | varchar(8) | no | check `exam_body IN ('nsc','ieb')` |
| grade | smallint | no | check `grade BETWEEN 10 AND 12` |
| year | smallint | no | check `year BETWEEN 2008 AND 2100` |
| session | varchar(16) | no | check `session IN ('november','june','march','supplementary','exemplar')` |
| paper_number | smallint | no | check 1 to 3 |
| language | varchar(16) | no | check `language IN ('english','afrikaans')` (others later) |
| document_kind | varchar(16) | no | check `document_kind IN ('question_paper','memorandum','addendum','answer_book')` |
| storage | varchar(16) | no | check `storage IN ('stored','external')` |
| s3_key | varchar(512) | yes | required when `stored` |
| external_url | varchar(1024) | yes | required when `external`; `https://` and an allowlisted host (`www.education.gov.za`, `www.ieb.co.za`, provincial department hosts) |
| file_size_bytes | bigint | yes | stored only |
| page_count | smallint | yes | |
| source_attribution | varchar(200) | no | "Department of Basic Education, NSC November 2023" |
| licence_basis | varchar(32) | no | check `licence_basis IN ('public_link','permission_granted','public_domain')`; `stored` requires `permission_granted` or `public_domain` (check constraint) |
| is_published | boolean | no | |
| unique | | | `(subject_id, exam_body, grade, year, session, paper_number, language, document_kind)` filtered `deleted_at IS NULL` |
| check | | | `(storage = 'stored' AND s3_key IS NOT NULL AND external_url IS NULL) OR (storage = 'external' AND external_url IS NOT NULL AND s3_key IS NULL)` |

## Contracts

`Aptiverse.Academics.Contracts`:

```
// Query interfaces
public interface IStudyUnitLookup   // AiTutor, Practice, Progress, Family (shape agreed with ai-tutor.md)
{
    Task<IReadOnlyList<StudyUnitContext>> GetForUserAsync(Guid userId, CancellationToken ct);       // active enrolments only
    Task<StudyUnitContext?> GetAsync(Guid unitId, Guid userId, CancellationToken ct);                // null if the user is not enrolled
}
public sealed record StudyUnitContext(Guid StudyUnitId, string Kind, string Name, string Level,     // Level: "grade_11" or "first_year"
    string? Curriculum, IReadOnlyList<string> KnownTopics, Guid EnrolmentId, IReadOnlyList<OpenAssessmentRef> OpenAssessments);
public sealed record OpenAssessmentRef(Guid AssessmentId, string Title, DateTimeOffset DueAt);

public interface ITopicRegistry     // Practice generation tags questions through this
{
    Task<IReadOnlyList<TopicRef>> UpsertAsync(Guid studyUnitId, IReadOnlyList<string> labels, string source, CancellationToken ct);
    Task<IReadOnlyList<TopicRef>> ListAsync(Guid studyUnitId, CancellationToken ct);
}
public sealed record TopicRef(Guid TopicId, string Slug, string Name);

public interface IInstitutionCatalog   // Identity onboarding
{
    Task<bool> ExistsAsync(Guid institutionId, CancellationToken ct);
    Task<InstitutionRef?> GetAsync(Guid institutionId, CancellationToken ct);
}
public sealed record InstitutionRef(Guid Id, string Slug, string Name, string Type);

public interface IPredictedResult      // Progress (analytics, projections) and Family overview (BE-ACA-76)
{
    Task<IReadOnlyList<PredictedUnitResult>> GetForUserAsync(Guid userId, CancellationToken ct);
    Task<PredictedUnitResult?> GetAsync(Guid userId, Guid studyUnitId, CancellationToken ct);
}
public sealed record PredictedUnitResult(Guid StudyUnitId, string Name, string Kind, decimal? CurrentPercent, decimal? PredictedPercent,
    decimal GradedWeightPercent, int GradedCount, int UngradedWithPredictionCount, IReadOnlyList<string> Warnings, DateTimeOffset? AsOf);
    // percents null when no evidence; tertiary projection is on the 0 to 100 scale (no 4.0 GPA conversion in v1)

public interface IAssessmentLookup     // Practice generates practice per assessment; AiTutor honesty guardrail (BE-ACA-75)
{
    Task<AssessmentContext?> GetForUserAsync(Guid userId, Guid assessmentId, CancellationToken ct);
}
public sealed record AssessmentContext(Guid AssessmentId, Guid StudyUnitId, string Title, string Type, string State,
    DateTimeOffset DueAt, IReadOnlyList<string> TaskLabels, IReadOnlyList<TopicRef> UnitTopics);

public interface IAssessmentEvidence   // Careers standing (same module), Progress, Family overview
{
    Task<IReadOnlyList<UnitStanding>> GetStandingAsync(Guid userId, CancellationToken ct);
}
public sealed record UnitStanding(Guid StudyUnitId, string Name, decimal? CurrentPercent, decimal? PredictedPercent,
    decimal GradedWeightPercent, int GradedCount, DateTimeOffset? LastGradedAt);   // percents null when no graded evidence

// Integration events (outbox)
public sealed record StudyUnitEnrolled(Guid UserId, Guid StudyUnitId, Guid EnrolmentId, string Kind, string Name, DateTimeOffset OccurredAt);
public sealed record StudyUnitUnenrolled(Guid UserId, Guid StudyUnitId, Guid EnrolmentId, DateTimeOffset OccurredAt);
public sealed record AssessmentCreated(Guid UserId, Guid AssessmentId, Guid StudyUnitId, string Title, string Type, DateTimeOffset DueAt, DateTimeOffset OccurredAt);
public sealed record AssessmentDueChanged(Guid UserId, Guid AssessmentId, DateTimeOffset DueAt, DateTimeOffset OccurredAt);
public sealed record AssessmentSubmitted(Guid UserId, Guid AssessmentId, Guid StudyUnitId, DateTimeOffset OccurredAt);
public sealed record AssessmentGraded(Guid UserId, Guid AssessmentId, Guid StudyUnitId, string Type, decimal Percent,
    decimal? WeightPercent, decimal? PredictedPercent, DateTimeOffset GradedAt, DateTimeOffset OccurredAt);
public sealed record AssessmentMarkRemoved(Guid UserId, Guid AssessmentId, Guid StudyUnitId, DateTimeOffset OccurredAt);
public sealed record AssessmentDeleted(Guid UserId, Guid AssessmentId, Guid StudyUnitId, bool WasGraded, DateTimeOffset OccurredAt);
public sealed record TopicRegistered(Guid StudyUnitId, Guid TopicId, string Name, DateTimeOffset OccurredAt);
```

## Foundation tasks

### Module

- [ ] **BE-ACA-01** Module projects `Aptiverse.Academics` and `.Contracts`, `academics` schema, `AcademicsDbContext : ModuleDbContext`, design-time factory
- [ ] **BE-ACA-72** `AcademicsModule` registration (`AddAcademicsModule`, `MapAcademicsEndpoints`), add to `Aptiverse.slnx`, Host, Worker, Dockerfile, `ArchitectureTests/Modules.cs`; permission constants `academics.manage`, `past_papers.read`, `content.manage` (BE-IDN-65)
- [ ] **BE-ACA-73** POPIA handlers: `IPersonalDataExporter` (enrolments, assessments with marks and notes, upload metadata with fresh presigned links, calendar events, resources, admission targets) and `IPersonalDataEraser` on `UserErased` (hard delete the user's rows and S3 objects under `academics/<userId>/`; private tertiary units deleted; shared units kept)

### Catalog and reference data

- [ ] **BE-ACA-02** Curricula and CAPS subject catalog tables (`curricula`, `catalog_subjects`, `curriculum_subjects`) with the constraints above
- [ ] **BE-ACA-03** Port `CurriculumCatalogSeeder` (43f9faa `api/Modules/AcademicPlanning/Aptiverse.Api.Infrastructure/Data/CurriculumCatalogSeeder.cs`) to data files `Data/catalog/curricula.json`, `subjects.json`, `curriculum-subjects.json` with a JSON Schema and a test that every slug is unique and every mapping resolves
- [ ] **BE-ACA-04** Idempotent seeder as pipeline step (not on boot): `AcademicsReferenceSeeder : IDataSeeder` upserts by slug or natural key, never deletes, deactivates rows removed from the file, logs inserted, updated and deactivated counts; runs in the `seed` command after `migrate` (CI-12)
- [ ] **BE-ACA-05** SBA programme and exemplar data (port from `web/src/lib/data/sbaProgrammes.ts` and `sbaExemplars.ts` at 43f9faa) to `Data/sba/programmes.json` and `exemplars.json`, loaded by the same seeder into `sba_programme_tasks` and `sba_exemplars`
- [ ] **BE-ACA-08** `institutions` table and `Data/catalog/institutions.json` (public universities, universities of technology, comprehensive universities, public TVET colleges, major private colleges, from the old seeder), seeded by BE-ACA-04
- [ ] **BE-ACA-68** `academic_terms` table and a yearly data file `Data/calendar/<year>.json` (DBE public school terms and NSC exam window, IEB exam window, semester dates for the catalog universities that publish them); seeded by BE-ACA-04; a CI check warns in October when next year's file is missing
- [ ] **BE-ACA-26** `IInstitutionCatalog` implementation (cached 1 h)

### Study units

- [ ] **BE-ACA-10** `study_units` table (`kind` caps_subject or tertiary_course, level, duration) with the shape check constraint and `normalized_key`; duration lives on `enrolments` (per student), recorded here
- [ ] **BE-ACA-11** `enrolments` table, single gate for both paths: `EnrolmentGate.CanEnrol(profile, unit)` (high school student with onboarding complete may enrol only in `caps_subject` units of their curriculum and grade; tertiary only in `tertiary_course`; admins and parents never), unit tested for every combination; the gate is the only enrolment entry point
- [ ] **BE-ACA-12** `topics` emergent per-unit registry: slugify (lowercase, ASCII fold, collapse separators, strip stop words "the", "and", "of"), upsert by `(unit, slug)`, keep first spelling, follow `merged_into_topic_id`
- [ ] **BE-ACA-25** `ITopicRegistry` implementation for Practice (max 20 labels per call, label 2 to 120 chars, returns canonical refs; publishes `TopicRegistered` for new topics)
- [ ] **BE-ACA-75** `IAssessmentLookup` implementation: Practice generates practice per assessment (as the old app) by passing an `assessmentId`; the lookup returns title, type, state, due date, checklist labels and the unit's topics, null for another user's assessment
- [ ] **BE-ACA-76** `IPredictedResult` implementation on top of BE-ACA-42 (predicted result for high school, 0 to 100 projection for tertiary), cached per user for 60 s and evicted on `AssessmentGraded`, `AssessmentMarkRemoved`, `AssessmentDeleted` and assessment edits; consumed by Progress and Family
- [ ] **BE-ACA-20** Contracts query: `IStudyUnitLookup` (level, topics) for Practice and AiTutor; level string `grade_<n>` for CAPS units and the tertiary level value; includes open assessments (title, due) for the AiTutor honesty guardrail
- [ ] **BE-ACA-27** `StudentStageChanged` handler: enrolments whose unit kind no longer matches the stage become `stage_mismatch` (hidden from lists and lookups, never deleted; restored if the student switches back); grade change for a high school student offers re-enrolment in the new grade's units through the UI (no automatic move)
- [ ] **BE-ACA-28** Publish `StudyUnitEnrolled` and `StudyUnitUnenrolled` from BE-ACA-13, 14, 18 through the outbox
- [ ] **BE-ACA-21** `unit_resources` table (links and notes per enrolment for university courses and school subjects)

### Assessments

- [ ] **BE-ACA-30** `assessments` table (type, weight, due, mark, lifecycle state) with the constraints above
- [ ] **BE-ACA-31** Lifecycle state machine (scheduled, in progress, submitted, graded) with tests: allowed transitions `scheduled -> in_progress`, `scheduled -> submitted`, `in_progress -> submitted`, `in_progress -> scheduled` (undo), `submitted -> in_progress` (undo), any non-graded state `-> graded` only through BE-ACA-37 (a mark is required), `graded -> submitted` only through the `remove_mark` transition (clears the mark, publishes `AssessmentMarkRemoved`); every other pair returns `409 academics.invalid_transition`; a test per allowed and per refused pair; timestamps `started_at`, `submitted_at`, `graded_at` set by the machine
- [ ] **BE-ACA-42** Weighting toward predicted result or GPA (pure function, unit tested): `UnitWeighting.Compute(assessments)` returns `currentPercent` (weight-normalised average of graded percents; equal weights when every weight is null; null when nothing is graded), `predictedPercent` (graded percents plus predicted percents for ungraded items, normalised over the weights that have a value; null when there is neither), `gradedWeightPercent`, `weightTotalPercent` and `weightWarnings` (`total_above_100`, `missing_weights`); tertiary GPA projection maps percents to the institution-neutral 0 to 100 scale only (no 4.0 conversion in v1); unit tests with fixtures to two decimals, including all-null and over-100 cases
- [ ] **BE-ACA-45** `assessment_tasks` table and `PUT /academics/assessments/{id}/tasks` (replace the checklist: 0 to 50 items, label 1 to 160, order from array position; `academics.manage`; idempotent PUT; metric `aptiverse.academics.assessment_tasks.updated`)
- [ ] **BE-ACA-46** Assessment integration events (`AssessmentCreated`, `AssessmentDueChanged`, `AssessmentSubmitted`, `AssessmentGraded`, `AssessmentMarkRemoved`, `AssessmentDeleted`) published from the slices in the same transaction
- [ ] **BE-ACA-29** `IAssessmentEvidence` implementation built on BE-ACA-42 (one grouped query per user, null when no evidence, never zero)
- [ ] **BE-ACA-43** `assessment_uploads` table and the upload policy (allowlist, 10 MB, 10 per assessment, 500 MB per user, 30 min pending expiry)
- [ ] **BE-ACA-48** Upload housekeeping (scheduled hourly): mark expired `pending` uploads `rejected` (`missing`) and delete their objects; delete objects of soft-deleted assessments after 30 days; S3 lifecycle aborts incomplete multipart uploads after 1 day (INF-14)
- [ ] **BE-ACA-67** Malware scanning of uploaded files (student uploads, plus the rare admin past paper upload made under written permission, decisions 14 and 40): either Amazon GuardDuty Malware Protection for S3 (tag-based result read in BE-ACA-40) or a ClamAV sidecar; until decided, files are served only with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff` (open question 7)

### Calendar

- [ ] **BE-ACA-50** `calendar_events` table (assessment-derived, study session, custom) with the constraints above
- [ ] **BE-ACA-59** Assessment-derived events: handlers on `AssessmentCreated`, `AssessmentDueChanged` and `AssessmentDeleted` (same module, in-process through the outbox) upsert or delete the `kind = 'assessment'` event (due date as an all-day event when the due time is 23:59 SAST, else a 1 hour block) and reschedule reminders
- [ ] **BE-ACA-57** `calendar_reminders` table and scheduling: each reminder schedules a `CalendarReminderDue(reminderId, fireAt)` Wolverine scheduled message; edits cancel by re-checking `fire_at` and `xmin` when the message fires (stale messages are no-ops)
- [ ] **BE-ACA-53** Reminders as Wolverine scheduled messages (assessment due, study session): `AssessmentDueReminder` scheduled for 18:00 SAST the day before `due_at` (or 2 h before when created later), skipped when the assessment is submitted or graded; `CalendarReminderDue` for event reminders; both check `INotificationPreferences` (`academics_reminders`) and send `NotifyUser` plus `SendTemplatedEmail` (BE-NTF-17) with a dedupe key per occurrence; replaces the old `AssessmentDueReminderService` and calendar reminder polling services

### Past papers

- [ ] **BE-ACA-60** `past_papers` table (subject, grade, year, paper, S3 key) extended with `storage` (`stored` or `external`), `external_url`, `source_attribution` and `licence_basis`. Decision recorded: v1 links out to the official DBE (and IEB) archive, as the old app at 43f9faa did, because of copyright and because hosted copies go stale; every seeded row is `external`. Hosting (`stored`) is the exception, allowed only for a paper with written permission recorded in `licence_basis` (decisions 14 and 40; IEB papers never without it)
- [ ] **BE-ACA-63** Seed real past papers: a curated index file `Data/past-papers/index.json` (subject slug, exam body, grade, year, session, paper, language, kind, external URL, attribution) for NSC November and June papers 2019 onward in English and Afrikaans, built by hand from the DBE archive; all entries `external` with `licence_basis = public_link` until permission to store is confirmed; seeded by BE-ACA-04; a link checker job (BE-ACA-89) reports dead URLs

## Slices

Group `/academics`, tag `Academics`. Ownership: every student read or write filters by `user_id = current user` (or joins through the user's enrolment); another user's ids return 404, never 403. Reference reads are anonymous or any authenticated user as listed.

### BE-ACA-06  GET /academics/catalog

| | |
|---|---|
| Operation id | `getSubjectCatalog` |
| Permission | anonymous (allowlisted; needed during onboarding) |
| Entitlement | free |
| Rate limit | `default`; `Cache-Control: public, max-age=3600` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.catalog.get.duration` (histogram) |
| Log fields | `Curriculum`, `Grade`, `ResultCount` |

Request (query) `GetCatalogRequest`: `curriculum` required (`nsc` or `ieb`, decision 29); `grade` required 8 to 12; `category` optional (known category).

Response `200 { curriculum, grade, subjects: [ { id, slug, code, name, category, languageType, isCompulsory } ] }` ordered by compulsory first, then category, then name; active subjects only.

Failures: `400`.

- [ ] **BE-ACA-06** `GET /academics/catalog` (subjects for curriculum and grade)
  - [ ] Endpoint, request and response records, validator, handler (HybridCache 1 h, evicted by the seeder)
  - [ ] Unit tests: grade range filter, ordering
  - [ ] Integration tests: anonymous 200; invalid grade 400

### BE-ACA-07  GET /academics/sba-programme

| | |
|---|---|
| Operation id | `getSbaProgramme` |
| Permission | `academics.manage` (students; the data is public policy but only useful in the app) |
| Rate limit | `default`; `Cache-Control: private, max-age=3600` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.sba_programme.get.duration` |
| Log fields | `UserId`, `SubjectId`, `Grade` |

Request (query): `subjectId` uuid (catalog subject) or `studyUnitId` uuid (an enrolled CAPS unit), exactly one; `grade` 10 to 12 required with `subjectId`. Response `200 { subject, grade, tasks: [ { id, term, taskNumber, title, taskType, weightPercent, sourceRef, linkedAssessmentId } ], exemplars: [ { title, taskType, letter, topic, marks, sourceUrl } ] }`; `linkedAssessmentId` set when the student created an assessment from the task. Grades 8 and 9 return an empty task list with `available: false`.

Failures: `400`, `404 academics.unit_not_found`.

- [ ] **BE-ACA-07** read SBA programme and exemplars per subject and grade
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Unit tests: linked assessment mapping
  - [ ] Integration tests: by unit and by subject; Grade 9 empty

### BE-ACA-74  GET /academics/courses

| | |
|---|---|
| Operation id | `searchSharedCourses` |
| Permission | `academics.manage` (tertiary students) |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.courses.search.duration` |
| Log fields | `UserId`, `QueryLength`, `ResultCount` |

Request (query): `q` 2 to 60 (name or code), `level` optional, `limit` 1 to 25. Searches shared `tertiary_course` units of the caller's catalog institution only (from the profile), so a student can pick an existing course (shared topics) before creating one with BE-ACA-14. Response `200 CourseOption[] { unitId, name, courseCode, level, enrolledCount (rounded down to the nearest 5, hidden below 5) }`. Students without a catalog institution get an empty list.

- [ ] **BE-ACA-74** search shared institution courses for the course picker
  - [ ] Endpoint, request and response records, validator, handler (trigram on name and code within the institution)
  - [ ] Integration tests: other institutions' courses never returned; count suppressed below 5

### BE-ACA-09  GET /academics/institutions

| | |
|---|---|
| Operation id | `searchInstitutions` |
| Permission | anonymous (allowlisted; onboarding) |
| Rate limit | `default`; cached 1 h |
| Idempotency | safe read |
| Metric | `aptiverse.academics.institutions.search.duration` |
| Log fields | `QueryLength`, `Type`, `ResultCount` |

Request (query): `q` optional 2 to 60 chars; `type` optional; `province` optional; `limit` 1 to 50. Response `200 InstitutionView[] { id, slug, name, shortName, type, province }` ranked by trigram similarity then name.

- [ ] **BE-ACA-09** `GET /academics/institutions`
  - [ ] Endpoint, request and response records, validator, handler (trigram index)
  - [ ] Integration tests: search by short name ("UCT"), type filter

### BE-ACA-69  GET /academics/academic-calendar

| | |
|---|---|
| Operation id | `getAcademicCalendar` |
| Permission | authenticated (any role) |
| Rate limit | `default`; cached 1 day |
| Idempotency | safe read |
| Metric | `aptiverse.academics.academic_calendar.get.duration` |
| Log fields | `UserId`, `Year`, `Scope` |

Request (query): `year` optional (default current year in SAST, range current minus 1 to current plus 1); `scope` optional (defaults from the caller's profile: `public_schools` or `ieb` for high school, the institution slug for tertiary, falling back to none). Response `200 { year, scope, terms: [ { kind, sequence, label, startsOn, endsOn, sourceUrl } ], available }`; `available: false` when no data file covers the year or scope (the UI then shows nothing, never invented dates).

- [ ] **BE-ACA-69** `GET /academics/academic-calendar` (terms, semesters, exam windows)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: high school default scope; missing year returns `available: false`

### BE-ACA-13  POST /academics/units/caps

| | |
|---|---|
| Operation id | `enrolInCapsSubjects` |
| Permission | `academics.manage` |
| Entitlement | free (open question 8 on Free plan unit caps) |
| Rate limit | `default` |
| Idempotency | natural: enrolling in a subject already enrolled returns it unchanged (`alreadyEnrolled: true`); `Idempotency-Key` supported (BE-SK-45) |
| Metric | `aptiverse.academics.enrolments.created` (counter, tags `kind=caps_subject`, `grade`) |
| Log fields | `UserId`, `SubjectCount`, `Grade`, `Curriculum` |

Request `EnrolCapsSubjectsRequest`: `subjectIds` 1 to 12 unique uuids from the catalog for the student's curriculum and grade; optional per-subject `teacherName` (max 120) as `items: [ { subjectId, teacherName } ]`. The grade and curriculum come from the profile (`IUserProfileLookup`), never from the request.

Response `201 { enrolments: UnitSummary[] }` (same item shape as BE-ACA-15).

Failures: `400`; `403 academics.stage_mismatch` (tertiary student, parent, onboarding incomplete); `404 academics.subject_not_found` (not in the curriculum for that grade); `409 academics.too_many_units` (more than 15 active units).

Events: `StudyUnitEnrolled` per new enrolment.

- [ ] **BE-ACA-13** `POST /academics/units/caps` (enrol in CAPS subjects)
  - [ ] Endpoint (`RequirePermission`, `WithValidation`, `WithIdempotency`)
  - [ ] Request and response records
  - [ ] Validator
  - [ ] Handler (gate, find-or-create shared unit by `normalized_key`, enrol, events)
  - [ ] Unit tests: gate matrix; idempotent re-enrol
  - [ ] Integration tests: happy; tertiary student 403; wrong grade 404; replay with the same key

### BE-ACA-14  POST /academics/units/courses

| | |
|---|---|
| Operation id | `createTertiaryCourse` |
| Permission | `academics.manage` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key`; natural key `normalized_key` reuses an existing shared unit |
| Metric | `aptiverse.academics.enrolments.created` (tags `kind=tertiary_course`, `level`, `shared=true|false`) |
| Log fields | `UserId`, `UnitId`, `Level`, `Shared` |

Request `CreateCourseRequest`: `name` 2 to 160; `courseCode` optional 2 to 32 `[A-Za-z0-9 -]`; `level` required (tertiary level values; defaults to the profile `studyLevel` when omitted); `duration` optional `semester` or `full_year`; `startedOn` optional date within the last 6 years and not more than 1 year ahead; `lecturerName` optional max 120. Institution comes from the profile: catalog institution means a shared unit, none means a private unit.

Response `201 UnitSummary`. Failures: `400`; `403 academics.stage_mismatch`; `409 academics.already_enrolled`; `409 academics.too_many_units`. Events: `StudyUnitEnrolled`.

- [ ] **BE-ACA-14** `POST /academics/units/courses` (create tertiary course with year, level, duration)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Unit tests: normalised key collisions ("Calculus I" vs "calculus 1" with the same code); private unit when no institution
  - [ ] Integration tests: two students at one institution share the unit and its topics; high school student 403

### BE-ACA-15  GET /academics/units

| | |
|---|---|
| Operation id | `listMyUnits` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.units.list.duration` (histogram) |
| Log fields | `UserId`, `ResultCount`, `IncludeCompleted` |

Request (query): `status` optional (`active` default, `completed`, `all`).

Response `200 UnitSummary[]`:

`{ enrolmentId, unitId, kind, name, code, level, grade, curriculum, institutionName, teacherName, status, startedOn, expectedEndOn, isFinished, colourToken, displayOrder, nextDue: { assessmentId, title, dueAt } | null, weighting: { currentPercent, predictedPercent, gradedWeightPercent, weightTotalPercent, gradedCount, assessmentCount, warnings[] }, topicCount }`

`weighting` comes from BE-ACA-42; percents are null when nothing is graded ("no marks yet"), never 0. Progress-module mastery is not included (Progress owns it; the dashboard reads `GET /progress/dashboard`).

- [ ] **BE-ACA-15** `GET /academics/units` (mine, with progress and weighting summary per unit)
  - [ ] Endpoint, request and response records, validator, handler (two grouped queries: enrolments with units, assessments aggregated per enrolment; weighting in memory)
  - [ ] Unit tests: null weighting with no graded assessments; finished by duration
  - [ ] Integration tests: only own units; `stage_mismatch` hidden

### BE-ACA-16  GET /academics/units/{id}

| | |
|---|---|
| Operation id | `getMyUnit` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.units.get.duration` |
| Log fields | `UserId`, `EnrolmentId` |

Route `id` is the enrolment id. Response `200 UnitDetail`: `UnitSummary` plus `assessments` (all, ordered by due), `topics` (top 50 by name), `resources`, `sbaProgrammeAvailable` (bool). Failures: `404 academics.unit_not_found`.

- [ ] **BE-ACA-16** `GET /academics/units/{id}`
  - [ ] Endpoint, response records, handler
  - [ ] Integration tests: other user's enrolment 404

### BE-ACA-17  PATCH /academics/units/{id}

| | |
|---|---|
| Operation id | `updateMyUnit` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | PATCH of provided fields; `If-Match` optional (BE-SK-43) |
| Metric | `aptiverse.academics.units.updated` (counter) |
| Log fields | `UserId`, `EnrolmentId`, `ChangedFields` |

Request `UpdateUnitRequest`: `teacherName` (max 120, null clears), `duration` (`semester` or `full_year`, tertiary only), `startedOn`, `completed` (bool; true sets `completed_at` and status `completed`, false reopens), `colourToken` (token list), `displayOrder` (0 to 99). Unit identity (name, code, level, grade) cannot change here: a different course is a new enrolment (shared units must not be renamed by one student). Response `200 UnitSummary`. Failures: `400`, `404`, `409 concurrency_conflict`.

- [ ] **BE-ACA-17** `PATCH /academics/units/{id}`
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: duration on a CAPS unit rejected
  - [ ] Integration tests: complete then reopen; stale version 409

### BE-ACA-18  DELETE /academics/units/{id}

| | |
|---|---|
| Operation id | `unenrolFromUnit` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | idempotent; already removed returns 204 |
| Metric | `aptiverse.academics.enrolments.removed` (counter, tag `kind`) |
| Log fields | `UserId`, `EnrolmentId`, `AssessmentCount` |

Soft deletes the enrolment and cascades a soft delete to its assessments, uploads (objects kept 30 days, BE-ACA-48), calendar events and resources. Query `confirm=true` required when the enrolment has graded assessments (else `409 academics.unit_has_marks` with the count, so the UI can warn). Events: `StudyUnitUnenrolled`, `AssessmentDeleted` per assessment.

- [ ] **BE-ACA-18** `DELETE /academics/units/{id}` (unenrol, soft delete)
  - [ ] Endpoint, request record (query `confirm`), validator, handler
  - [ ] Unit tests: cascade set
  - [ ] Integration tests: graded marks require confirm; events published

### BE-ACA-19  GET /academics/units/{id}/topics

| | |
|---|---|
| Operation id | `listUnitTopics` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.topics.list.duration` |
| Log fields | `UserId`, `EnrolmentId`, `ResultCount` |

Request (query): `q` optional 1 to 60; `limit` 1 to 200 (default 100). Response `200 TopicView[] { id, name, slug }` (merged topics resolved to their target, sorted by name). Topics are shared across students of a shared unit and never reveal who created them.

- [ ] **BE-ACA-19** `GET /academics/units/{id}/topics`
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: merged topics collapse; not enrolled 404

### BE-ACA-22  GET /academics/units/{id}/resources

| | |
|---|---|
| Operation id | `listUnitResources` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.resources.list.duration` |
| Log fields | `UserId`, `EnrolmentId` |

Response `200 ResourceView[] { id, kind, title, url, note, createdAt }`, newest first, max 100 per enrolment.

- [ ] **BE-ACA-22** list unit resources
  - [ ] Endpoint, response record, handler
  - [ ] Integration tests: own only

### BE-ACA-23  POST /academics/units/{id}/resources

| | |
|---|---|
| Operation id | `addUnitResource` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key` |
| Metric | `aptiverse.academics.resources.created` (counter, tag `kind`) |
| Log fields | `UserId`, `EnrolmentId`, `Kind` |

Request `AddResourceRequest`: `kind` (`link` or `note`), `title` 1 to 160, `url` required for link (absolute `https://`, max 1024, no credentials in the URL, no `javascript:` or `data:`), `note` required for note (max 4000). Max 100 per enrolment (`409 academics.too_many_resources`). Response `201 ResourceView`.

- [ ] **BE-ACA-23** add a unit resource (link or note), for university courses and school subjects
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: URL scheme rules
  - [ ] Integration tests: happy; `javascript:` URL 400

### BE-ACA-24  DELETE /academics/units/{id}/resources/{resourceId}

| | |
|---|---|
| Operation id | `deleteUnitResource` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.academics.resources.deleted` (counter) |
| Log fields | `UserId`, `ResourceId` |

Response `204`; other user's resource `404`.

- [ ] **BE-ACA-24** delete a unit resource
  - [ ] Endpoint, handler
  - [ ] Integration tests: other user 404

### BE-ACA-32  POST /academics/assessments

| | |
|---|---|
| Operation id | `createAssessment` |
| Permission | `academics.manage` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key` required by the web client for creates |
| Metric | `aptiverse.academics.assessments.created` (counter, tags `type`, `kind`, `from_sba`) |
| Log fields | `UserId`, `AssessmentId`, `EnrolmentId`, `Type` |

Request `CreateAssessmentRequest`:

| Field | Rules |
|---|---|
| enrolmentId | required, the caller's active enrolment |
| title | required, 2 to 160 |
| type | required, known type |
| weightPercent | optional, 0 to 100, max 2 decimals |
| term | optional 1 to 4; only for CAPS units |
| dueAt | required, timestamp with offset (BE-SK-20), between 5 years ago and 2 years ahead |
| predictedPercent | optional 0 to 100 |
| notes | optional max 2000 |
| sbaTaskId | optional; must belong to the unit's subject and grade; prefills title, type, term and weight when those are omitted |
| tasks | optional 0 to 50 checklist labels |
| reminders | optional, default `[1440]` (minutes before for the derived calendar event) |

Response `201 AssessmentView` (`id`, all fields, `state = scheduled`, `percent`, `tasks`, `uploads: []`, `weightWarnings` for the unit after the insert). Failures: `400`, `404 academics.unit_not_found`, `404 academics.sba_task_not_found`, `409 academics.too_many_assessments` (more than 200 per enrolment). Events: `AssessmentCreated` (drives BE-ACA-59 and Progress).

- [ ] **BE-ACA-32** `POST /academics/assessments`
  - [ ] Endpoint, request and response records, validator, handler (prefill from SBA task, schedule reminder)
  - [ ] Unit tests: SBA prefill; weight warning over 100
  - [ ] Integration tests: happy; other user's enrolment 404; offset-less `dueAt` 400; idempotent replay

### BE-ACA-49  POST /academics/assessments/from-sba

| | |
|---|---|
| Operation id | `createAssessmentsFromSbaProgramme` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | natural: tasks already linked to an assessment are skipped (`skipped` list) |
| Metric | `aptiverse.academics.assessments.created` (tag `from_sba=true`), value is the count |
| Log fields | `UserId`, `EnrolmentId`, `Created`, `Skipped` |

Request: `enrolmentId` (CAPS unit, Grades 10 to 12); `taskIds` 1 to 20 from the programme; `dueDates` map task id to `dueAt` (optional; missing dates default to the last school day of the task's term from BE-ACA-68, or are rejected when no calendar data exists). Response `201 { created: AssessmentView[], skipped: [taskId] }`.

- [ ] **BE-ACA-49** bulk create assessments from the SBA programme
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: second call skips; no calendar data requires explicit dates

### BE-ACA-33  GET /academics/assessments

| | |
|---|---|
| Operation id | `listMyAssessments` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.assessments.list.duration` |
| Log fields | `UserId`, `Filters`, `ResultCount` |

Request (query) `ListAssessmentsRequest`: `enrolmentId` optional; `state` optional, repeatable; `from`, `to` optional dates (SAST day boundaries), range at most 400 days; `type` optional; `sort` `due_asc` (default) or `due_desc`; `page`, `pageSize` (max 100).

Response `200 PagedResult<AssessmentListItem> { id, enrolmentId, unitName, title, type, state, dueAt, weightPercent, percent, predictedPercent, uploadCount, isOverdue }`. `isOverdue` = not submitted or graded and `dueAt` passed.

- [ ] **BE-ACA-33** `GET /academics/assessments` (filters: unit, state, date range)
  - [ ] Endpoint, request and response records, validator, handler (index `(user_id, due_at)`)
  - [ ] Unit tests: SAST day boundary for `to`
  - [ ] Integration tests: each filter; other user's rows absent

### BE-ACA-34  GET /academics/assessments/{id}

| | |
|---|---|
| Operation id | `getMyAssessment` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read; `ETag` from `xmin` |
| Metric | `aptiverse.academics.assessments.get.duration` |
| Log fields | `UserId`, `AssessmentId` |

Response `200 AssessmentView` with `tasks`, `uploads` (verified only, metadata), `sbaTask` (if linked), `allowedTransitions[]` (from BE-ACA-31, so the UI shows only valid actions). Failures `404 academics.assessment_not_found`.

- [ ] **BE-ACA-34** `GET /academics/assessments/{id}`
  - [ ] Endpoint, response records, handler
  - [ ] Integration tests: allowed transitions per state; other user 404

### BE-ACA-35  PATCH /academics/assessments/{id}

| | |
|---|---|
| Operation id | `updateMyAssessment` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | PATCH; `If-Match` honoured |
| Metric | `aptiverse.academics.assessments.updated` (counter) |
| Log fields | `UserId`, `AssessmentId`, `ChangedFields` |

Request `UpdateAssessmentRequest`: `title`, `type`, `weightPercent` (null clears), `term`, `dueAt`, `predictedPercent` (null clears), `notes`; same rules as create. State and marks are not editable here (BE-ACA-36, BE-ACA-37). Moving `dueAt` publishes `AssessmentDueChanged` and reschedules the reminder. Response `200 AssessmentView`. Failures `400`, `404`, `409 concurrency_conflict`.

- [ ] **BE-ACA-35** `PATCH /academics/assessments/{id}`
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: due change reschedules
  - [ ] Integration tests: stale version 409; event on due change only

### BE-ACA-36  POST /academics/assessments/{id}/transition

| | |
|---|---|
| Operation id | `transitionAssessment` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | transitioning to the current state returns 200 unchanged |
| Metric | `aptiverse.academics.assessments.transitions` (counter, tags `from`, `to`) |
| Log fields | `UserId`, `AssessmentId`, `From`, `To` |

Request `TransitionRequest`: `action` one of `start` (to in_progress), `submit` (to submitted), `reopen` (back one step), `remove_mark` (graded to submitted). Response `200 AssessmentView`. Failures `400`, `404`, `409 academics.invalid_transition` (with `allowedTransitions`). Events: `AssessmentSubmitted` on submit, `AssessmentMarkRemoved` on remove_mark.

- [ ] **BE-ACA-36** `POST /academics/assessments/{id}/transition`
  - [ ] Endpoint, request record, validator, handler (delegates to BE-ACA-31)
  - [ ] Integration tests: each action; refused pair 409

### BE-ACA-37  POST /academics/assessments/{id}/mark

| | |
|---|---|
| Operation id | `recordAssessmentMark` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | recording the same mark again returns 200 without a second event (compares values) |
| Metric | `aptiverse.academics.marks.recorded` (counter, tags `type`, `kind`), `aptiverse.academics.marks.percent` (histogram, buckets of 10) |
| Log fields | `UserId`, `AssessmentId`, `PreviousState` (never the mark itself in logs) |

Request `RecordMarkRequest`: `markObtained` 0 to 10000, max 2 decimals; `markTotal` greater than 0 up to 10000, at least `markObtained`; or `percent` 0 to 100 alone (stored as obtained `percent` of total 100); exactly one form. Sets state `graded`, `graded_at`. Changing an existing mark republishes `AssessmentGraded` with the new values (consumers treat the latest event per assessment as truth). Response `200 AssessmentView` with refreshed unit `weighting`.

Failures `400`, `404`. Events: `AssessmentGraded` (Progress goals, mastery, Family celebrations).

- [ ] **BE-ACA-37** `POST /academics/assessments/{id}/mark` (log a mark, publishes `AssessmentGraded`)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: percent form; obtained above total rejected; unchanged mark no event
  - [ ] Integration tests: event delivered through the outbox; weighting updated in BE-ACA-15

### BE-ACA-38  DELETE /academics/assessments/{id}

| | |
|---|---|
| Operation id | `deleteMyAssessment` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.academics.assessments.deleted` (counter, tag `was_graded`) |
| Log fields | `UserId`, `AssessmentId`, `WasGraded` |

Soft deletes the assessment, its tasks, derived calendar event and uploads (objects removed after 30 days); cancels reminders. Response `204`. Event `AssessmentDeleted`.

- [ ] **BE-ACA-38** `DELETE /academics/assessments/{id}`
  - [ ] Endpoint, handler
  - [ ] Integration tests: calendar event gone; event published

### BE-ACA-39  POST /academics/assessments/{id}/uploads

| | |
|---|---|
| Operation id | `createAssessmentUpload` |
| Permission | `academics.manage` |
| Rate limit | `uploads` (20 per hour per user) |
| Idempotency | `Idempotency-Key`; an abandoned pending upload expires after 30 min |
| Metric | `aptiverse.academics.uploads.requested` (counter, tag `content_type`), `aptiverse.academics.uploads.declared_bytes` (histogram) |
| Log fields | `UserId`, `AssessmentId`, `UploadId`, `ContentType`, `DeclaredSizeBytes` |

Request `CreateUploadRequest`: `filename` 1 to 255 (sanitised, extension must match the content type); `contentType` in the allowlist (JPG, PNG, WebP, HEIC or HEIF, PDF; Word is rejected with `400 academics.unsupported_file_type`); `sizeBytes` 1 to 10 485 760. Response `201 { uploadId, uploadUrl, method: "PUT", headers: { "Content-Type", "Content-Length" }, expiresAt }` (presigned PUT, 15 min, exact type and length conditions).

Failures `400`; `404`; `409 academics.too_many_uploads` (10 per assessment); `409 academics.storage_quota_exceeded` (500 MB per user); `503 academics.storage_unavailable`.

- [ ] **BE-ACA-39** `POST /academics/assessments/{id}/uploads` (presigned PUT)
  - [ ] Endpoint, request and response records, validator, handler (`IObjectStorage.PresignPut`, pending row)
  - [ ] Unit tests: extension and type mismatch; quota maths
  - [ ] Integration tests (MinIO Testcontainer): presign then PUT succeeds; wrong length PUT rejected by S3

### BE-ACA-40  POST /academics/uploads/{id}/confirm

| | |
|---|---|
| Operation id | `confirmAssessmentUpload` |
| Permission | `academics.manage` |
| Rate limit | `uploads` |
| Idempotency | confirming a verified upload returns 200 unchanged |
| Metric | `aptiverse.academics.uploads.confirmed` (counter, tag `outcome=verified|size_mismatch|type_mismatch|missing|malware`) |
| Log fields | `UserId`, `UploadId`, `Outcome`, `VerifiedSizeBytes` |

No body. `HeadAsync` checks existence and that the size equals the declared size; `ReadPrefixAsync` reads 16 bytes and checks the magic number for the declared type (PDF `%PDF-`, JPEG `FF D8 FF`, PNG `89 50 4E 47 0D 0A 1A 0A`, WebP `RIFF....WEBP`, HEIC and HEIF `ftyp` box at offset 4 with brand `heic`, `heix`, `mif1` or `msf1`); computes SHA-256 by streaming; on failure marks `rejected`, deletes the object and returns `422 academics.upload_rejected` with the reason. When malware scanning is enabled (BE-ACA-67) the upload stays `pending` until a clean result. Response `200 UploadView { id, filename, contentType, sizeBytes, status, createdAt }`.

- [ ] **BE-ACA-40** `POST /academics/uploads/{id}/confirm` (magic-byte verify)
  - [ ] Endpoint, response record, handler
  - [ ] Unit tests: magic-byte table per type, renamed `.exe` as `.pdf` rejected
  - [ ] Integration tests (MinIO): happy; size mismatch; other user's upload 404

### BE-ACA-47  GET /academics/assessments/{id}/uploads

| | |
|---|---|
| Operation id | `listAssessmentUploads` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.uploads.list.duration` |
| Log fields | `UserId`, `AssessmentId`, `ResultCount` |

Response `200 UploadView[]` (verified only, newest first).

- [ ] **BE-ACA-47** list uploads of an assessment
  - [ ] Endpoint, response record, handler
  - [ ] Integration tests: pending and rejected excluded

### BE-ACA-41  GET /academics/uploads/{id}

| | |
|---|---|
| Operation id | `getAssessmentUploadUrl` |
| Permission | `academics.manage` |
| Rate limit | `uploads` |
| Idempotency | safe; each call returns a fresh URL |
| Metric | `aptiverse.academics.uploads.downloads` (counter) |
| Log fields | `UserId`, `UploadId` |

Response `200 { url, expiresAt }`: presigned GET (5 min) with `response-content-disposition: attachment; filename="<sanitised>"` and the stored content type. Failures `404` (missing, rejected, pending or another user's).

- [ ] **BE-ACA-41** `GET /academics/uploads/{id}` (presigned GET)
  - [ ] Endpoint, response record, handler
  - [ ] Integration tests: other user 404; pending 404

### BE-ACA-44  DELETE /academics/uploads/{id}

| | |
|---|---|
| Operation id | `deleteAssessmentUpload` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.academics.uploads.deleted` (counter) |
| Log fields | `UserId`, `UploadId` |

Soft deletes the row and deletes the S3 object immediately (bucket versioning keeps a non-current version for 7 days for accidental-delete recovery, INF-14). Response `204`.

- [ ] **BE-ACA-44** delete a single assessment upload
  - [ ] Endpoint, handler
  - [ ] Integration tests (MinIO): object gone; other user 404

### BE-ACA-51  GET /academics/calendar

| | |
|---|---|
| Operation id | `getMyCalendar` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.academics.calendar.get.duration` (histogram), `aptiverse.academics.calendar.occurrences` (histogram, count returned) |
| Log fields | `UserId`, `RangeDays`, `ResultCount` |

Request (query) `GetCalendarRequest`: `from`, `to` required dates (SAST), `to >= from`, range at most 92 days; `kinds` optional repeatable. Response `200 { events: [ { id, occurrenceStart, occurrenceEnd, kind, title, description, location, allDay, assessmentId, enrolmentId, unitName, colourToken, recurring, reminders: [minutesBefore] } ], terms: [...] }` with recurring events expanded server-side (max 500 occurrences, else `400 academics.range_too_dense`) and academic terms overlapping the range from BE-ACA-68.

- [ ] **BE-ACA-51** `GET /academics/calendar` (range)
  - [ ] Endpoint, request and response records, validator, handler (RRULE subset expander, pure and unit tested)
  - [ ] Unit tests: weekly expansion with UNTIL; SAST boundaries
  - [ ] Integration tests: range limit 400; only own events

### BE-ACA-52  POST /academics/calendar/events

| | |
|---|---|
| Operation id | `createCalendarEvent` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key` |
| Metric | `aptiverse.academics.calendar.events.created` (counter, tags `kind`, `recurring`) |
| Log fields | `UserId`, `EventId`, `Kind` |

Request `CreateEventRequest`: `kind` `study_session` or `custom` (assessment events are derived only); `title` 1 to 160; `description` max 2000; `location` max 200; `startsAt`, `endsAt` with offsets, `endsAt >= startsAt`, duration at most 14 days, start within 2 years; `allDay` bool; `recurrence` optional `{ frequency: daily|weekly, byDay[] (weekly), until (date, within 1 year) }` converted to the stored RRULE subset; `enrolmentId` optional (own); `reminders` 0 to 3 of the allowed minute values with `channel`. Max 500 future events per user. Response `201 CalendarEventView`. Failures `400`, `404` (enrolment), `409 academics.too_many_events`.

- [ ] **BE-ACA-52** `POST /academics/calendar/events`
  - [ ] Endpoint, request and response records, validator, handler (reminders scheduled)
  - [ ] Unit tests: recurrence conversion
  - [ ] Integration tests: happy; assessment kind 400

### BE-ACA-55  PATCH /academics/calendar/events/{id}

| | |
|---|---|
| Operation id | `updateCalendarEvent` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | PATCH; `If-Match` honoured |
| Metric | `aptiverse.academics.calendar.events.updated` (counter) |
| Log fields | `UserId`, `EventId`, `ChangedFields` |

Same field rules as create (all optional). Assessment-derived events accept only `reminders` (the date follows the assessment; edit the assessment instead: `409 academics.event_derived`). Editing a recurring series edits the whole series in v1 (no per-occurrence exceptions). Reminders rescheduled. Response `200 CalendarEventView`.

- [ ] **BE-ACA-55** `PATCH /academics/calendar/events/{id}` (split from BE-ACA-52)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: derived event date change 409; reminder change allowed

### BE-ACA-56  DELETE /academics/calendar/events/{id}

| | |
|---|---|
| Operation id | `deleteCalendarEvent` |
| Permission | `academics.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.academics.calendar.events.deleted` (counter) |
| Log fields | `UserId`, `EventId` |

Response `204`. Derived assessment events cannot be deleted (`409 academics.event_derived`). Reminders cancelled.

- [ ] **BE-ACA-56** `DELETE /academics/calendar/events/{id}` (split from BE-ACA-52)
  - [ ] Endpoint, handler
  - [ ] Integration tests: derived 409; other user 404

### BE-ACA-54  GET /academics/calendar.ics

| | |
|---|---|
| Operation id | `getCalendarFeed` |
| Permission | anonymous (allowlisted; the signed token is the credential) |
| Rate limit | `exports` (60 per hour per token) |
| Idempotency | safe read; `ETag` over the latest `updated_at` |
| Metric | `aptiverse.academics.calendar.feed.requests` (counter, tag `outcome`) |
| Log fields | `FeedTokenId` (never the token or the user id in access logs; the query string is redacted by BE-SK-78) |

Request (query): `token` required, 43 chars. Response `200 text/calendar` (RFC 5545): events from 30 days ago to 365 days ahead, recurring events as RRULE, assessment events titled "<unit>: <title>", no notes, marks or descriptions (the feed may be stored by third parties). Unknown or revoked token `404` (no detail). Updates `last_fetched_at` at most once per hour.

- [ ] **BE-ACA-54** `GET /academics/calendar.ics` (signed per-user feed for external sync)
  - [ ] Endpoint, request record, validator, handler (hand-written ICS serialiser with line folding and escaping, unit tested)
  - [ ] Unit tests: escaping commas and semicolons, folding at 75 octets, time zone `Africa/Johannesburg` VTIMEZONE block
  - [ ] Integration tests: valid token 200 with events; revoked 404

### BE-ACA-58  POST /academics/calendar/feed-token

| | |
|---|---|
| Operation id | `regenerateCalendarFeedToken` |
| Permission | `academics.manage` |
| Rate limit | `default` (max 10 per day per user) |
| Idempotency | not idempotent by design: each call revokes the previous token |
| Metric | `aptiverse.academics.calendar.feed.tokens_issued` (counter) |
| Log fields | `UserId`, `FeedTokenId` |

No body. Revokes any live token and issues a new one. Response `201 { feedUrl, webcalUrl, createdAt }` (shown once; only the hash is stored). `DELETE /academics/calendar/feed-token` (same slice) revokes without issuing.

- [ ] **BE-ACA-58** regenerate or revoke the calendar ICS link
  - [ ] Endpoints, response record, handlers
  - [ ] Integration tests: old URL 404 after regeneration

### BE-ACA-61  GET /academics/past-papers

| | |
|---|---|
| Operation id | `listPastPapers` |
| Permission | `past_papers.read` |
| Entitlement | free (open question 9) |
| Rate limit | `default`; cached 1 h |
| Idempotency | safe read |
| Metric | `aptiverse.academics.past_papers.list.duration` |
| Log fields | `UserId`, `SubjectId`, `Year`, `ResultCount` |

Request (query) `ListPastPapersRequest`: `subjectId` optional (defaults to the student's enrolled CAPS subjects); `grade` 10 to 12 optional; `year` optional 2008 to current; `session`, `language`, `examBody` optional; `page`, `pageSize` max 100. High school students only (tertiary `403 academics.stage_mismatch`, matching the hidden nav item).

Response `200 PagedResult<PastPaperView> { id, subject, examBody, grade, year, session, paperNumber, language, documentKind, storage, sourceAttribution, fileSizeBytes, memorandumId }` grouped so a question paper carries its memo id.

- [ ] **BE-ACA-61** `GET /academics/past-papers` (filters)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: filters; tertiary 403; unpublished hidden

### BE-ACA-62  GET /academics/past-papers/{id}/download

| | |
|---|---|
| Operation id | `getPastPaperDownload` |
| Permission | `past_papers.read` |
| Rate limit | `default` (60 per hour per user) |
| Idempotency | safe |
| Metric | `aptiverse.academics.past_papers.downloads` (counter, tags `storage`, `exam_body`) |
| Log fields | `UserId`, `PastPaperId`, `Storage` |

Response `200 { url, storage, expiresAt, attribution }`: `stored` returns a 5 minute presigned GET with `attachment` disposition; `external` returns the official archive URL (the UI opens it in a new tab and states the source). Failures `404`.

- [ ] **BE-ACA-62** `GET /academics/past-papers/{id}/download` (presigned GET or external link)
  - [ ] Endpoint, response record, handler
  - [ ] Integration tests: both storage kinds

### BE-ACA-64  POST /academics/admin/past-papers

| | |
|---|---|
| Operation id | `adminCreatePastPaper` |
| Permission | `content.manage`; step-up not required |
| Rate limit | `uploads` |
| Idempotency | natural unique key; duplicate returns 409 |
| Metric | `aptiverse.academics.admin.past_papers.created` (counter, tag `storage`) |
| Log fields | `AdminUserId`, `PastPaperId`, `Storage` |

Request: metadata fields (all columns above) plus either `externalUrl` (allowlisted host; the default and expected path, decision 14) or, as an exception, `upload: { filename, sizeBytes up to 25 MB, contentType application/pdf }` returning a presigned PUT, followed by `POST /academics/admin/past-papers/{id}/confirm` (magic-byte check, malware scan per BE-ACA-67, `licence_basis` must be `written_permission` with a reference to the permission document, else `400 academics.past_paper_permission_required`; decision 40). Created unpublished. Admin action recorded through `AdminActionRecorded` (BE-ADM-30).

- [ ] **BE-ACA-64** admin create past paper (external link by default; stored upload only with written permission)
  - [ ] Endpoints (create, confirm), request records, validators, handlers
  - [ ] Integration tests: stored without permission basis 400; external host not allowlisted 400; student 403

### BE-ACA-65  PATCH /academics/admin/past-papers/{id}

| | |
|---|---|
| Operation id | `adminUpdatePastPaper` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | PATCH; `If-Match` |
| Metric | `aptiverse.academics.admin.past_papers.updated` (counter) |
| Log fields | `AdminUserId`, `PastPaperId`, `ChangedFields` |

Edits metadata and `isPublished`; switching storage kind requires a new upload or URL. Audited.

- [ ] **BE-ACA-65** admin update or publish a past paper
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: publish shows in the student list

### BE-ACA-66  DELETE /academics/admin/past-papers/{id}

| | |
|---|---|
| Operation id | `adminDeletePastPaper` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.academics.admin.past_papers.deleted` (counter) |
| Log fields | `AdminUserId`, `PastPaperId` |

Soft delete; stored object deleted after 30 days. Audited.

- [ ] **BE-ACA-66** admin delete a past paper
  - [ ] Endpoint, handler, integration test

### BE-ACA-70  Admin catalog CRUD: /academics/admin/subjects

| | |
|---|---|
| Operation id | `adminListSubjects`, `adminCreateSubject`, `adminUpdateSubject`, `adminSetCurriculumMapping` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | create by unique slug (409 on duplicate); PUT mapping idempotent |
| Metric | `aptiverse.academics.admin.catalog.changes` (counter, tag `entity`) |
| Log fields | `AdminUserId`, `SubjectId`, `Change` |

`GET /academics/admin/subjects` (includes inactive), `POST` (slug, code, name, category, language type, description), `PATCH /{id}` (name, code, description, `isActive`; slug immutable because units and old data key on it), `PUT /{id}/curricula` (mapping rows with min and max grade, compulsory). Changes made here are overwritten by the seeder only for rows still present in the data file, so admin edits must also be committed to the data file (the admin page shows a reminder; open question 10). Audited.

- [ ] **BE-ACA-70** admin CAPS catalog entries
  - [ ] Endpoints, request records, validators, handlers
  - [ ] Integration tests: deactivate hides from catalog but keeps enrolments; slug change rejected

### BE-ACA-71  Admin institutions: /academics/admin/institutions

| | |
|---|---|
| Operation id | `adminCreateInstitution`, `adminUpdateInstitution` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | unique slug |
| Metric | `aptiverse.academics.admin.catalog.changes` (tag `entity=institution`) |
| Log fields | `AdminUserId`, `InstitutionId`, `Change` |

Create and edit institutions (name, short name, type, province, active). Promoting a private tertiary unit to a shared catalog institution is a separate support script (open question 3). Audited.

- [ ] **BE-ACA-71** admin institutions
  - [ ] Endpoints, request records, validators, handlers, integration tests

## Background work

| Message | Trigger | Handler | Replaces (43f9faa) |
|---|---|---|---|
| `AssessmentDueReminder` | scheduled per assessment | BE-ACA-53 | `AssessmentDueReminderService` (polling) |
| `CalendarReminderDue` | scheduled per reminder occurrence | BE-ACA-53, BE-ACA-57 | calendar reminder polling service |
| `AssessmentCreated`, `AssessmentDueChanged`, `AssessmentDeleted` (own events) | outbox | BE-ACA-59 derived calendar events | |
| `StudentStageChanged` | Identity outbox | BE-ACA-27 | |
| `UserErased` | Identity outbox | BE-ACA-73 | |
| `UploadHousekeeping` | scheduled hourly | BE-ACA-48 | |
| `CheckPastPaperLinks` | scheduled weekly | BE-ACA-89 | |

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | ICS feed token guessing or leakage | 256-bit tokens, hashed, revocable, no PII or marks in the feed | BE-ACA-54, BE-ACA-58 |
| Tampering | renaming a shared unit for everyone; uploading an executable as a PDF; editing another user's assessment | unit identity immutable in PATCH; magic-byte check and malware scan; user filter on every write | BE-ACA-17, BE-ACA-40, BE-ACA-67 |
| Repudiation | "my mark changed" | `updated_at`, `xmin`, `AssessmentGraded` events with values kept by Progress; admin catalog changes audited | BE-ACA-37, BE-ACA-70 |
| Information disclosure | presigned URLs shared, other students discovering who takes a course, notes in the ICS feed | 5 min GET URLs with attachment disposition; topics and shared units never expose users; feed excludes notes | BE-ACA-41, BE-ACA-19, BE-ACA-54 |
| Denial of service | storage abuse, calendar expansion bombs, huge assessments lists | 10 MB, 10 files, 500 MB quota, 92 day range and 500 occurrence cap, 200 assessments per unit | BE-ACA-43, BE-ACA-51 |
| Elevation of privilege | parent or tertiary student enrolling in CAPS units, student calling admin catalog endpoints | `EnrolmentGate`, `content.manage` on admin routes | BE-ACA-11, BE-ACA-70 |

- [ ] **BE-ACA-80** Write `api/docs/security/threat-model-academics.md` from the table, including the S3 bucket policy expectations (private, TLS only, no public ACLs) owned by INF-14

### Authorisation and ownership tests

- [ ] **BE-ACA-81** Integration matrix: for every student slice, a second student's ids (enrolment, assessment, upload, event, resource, feed token) return 404; a parent gets 403 on every `academics.manage` route; admin catalog and past paper admin routes return 403 for students; anonymous access only on catalog, institutions and the ICS feed

### Input limits

- [ ] **BE-ACA-82** Limits enforced and tested: titles 160, notes 2000, resource notes 4000, URLs 1024, checklist 50 items, enrolments 15 active, assessments 200 per enrolment, events 500 future, uploads 10 MB and 10 per assessment and 500 MB per user (admin past papers 25 MB), calendar range 92 days, list ranges 400 days, request bodies under 32 KB

### Rate limits

- [ ] **BE-ACA-83** Groups: student reads and writes `default`; upload presign, confirm and download `uploads` (20 per hour per user for presign, 120 per hour for download); ICS feed and token regeneration `exports`; catalog and institutions anonymous under `default` with CDN-friendly caching

### Idempotency and concurrency

- [ ] **BE-ACA-84** `Idempotency-Key` on every create (`units/caps`, `units/courses`, `assessments`, `assessments/from-sba`, `uploads`, `calendar/events`, `resources`); tests for replay and key reuse with a different body; concurrent PATCH or mark on one assessment with the same version returns 409 for the loser (BE-SK-43); concurrent enrolment of two students into a new shared unit creates one unit (unique `normalized_key` plus retry on 23505)

### Resilience

- [ ] **BE-ACA-85** S3 calls through the resilience pipeline (3 s timeout for presign is local and needs no network; HEAD and range GET 5 s, 2 retries); S3 outage returns `503 academics.storage_unavailable` for upload routes only, everything else keeps working; reminder sends never block request paths (outbox)

### Data retention and POPIA

- [ ] **BE-ACA-86** Classify columns (BE-SK-59): marks, predicted percents and notes are education records of possible minors (personal information, special care); uploads may contain handwriting and names (free text and files); calendar descriptions free text; reference tables `NotPersonal`. Retention: active for the life of the account; soft-deleted student rows purged after 30 days with their objects; uploads of erased users deleted immediately; past papers and reference data kept indefinitely. Export and erasure via BE-ACA-73; minors: no data shared with parents except through Family consent (Family reads via contracts)

### Audit

- [ ] **BE-ACA-87** Admin catalog, institution and past paper changes publish `AdminActionRecorded` (actor, entity, before and after summary) to the Admin audit (BE-ADM-30); student actions are not audited beyond timestamps (user-owned data)

### Observability

- [ ] **BE-ACA-88** Metrics as listed per slice plus `aptiverse.academics.reminders.sent` (counter, tags `kind`, `channel`), `aptiverse.academics.reminders.skipped` (counter, tag `reason=submitted|preference|deleted`), `aptiverse.academics.uploads.rejected` (counter, tag `reason`), `aptiverse.academics.storage.bytes` (gauge per day, total verified bytes); alerts: **upload confirm failure ratio above 10 percent for 30 min**, **reminder dead letters above 0**, **assessment create 5xx above 1 percent for 10 min**, **storage growth above 5 GB per day**
- [ ] **BE-ACA-89** Weekly `CheckPastPaperLinks` job: HEAD every `external_url` (polite, 1 per second, through the resilience pipeline), unpublish links failing twice in a row, report to admins via `NotifyUser` to `content.manage` holders; metric `aptiverse.academics.past_papers.dead_links`
- [ ] **BE-ACA-90** Spans `Academics.<UseCase>` with attributes `aptiverse.unit.kind`, `aptiverse.assessment.state`; S3 calls as child spans

### Performance budgets

- [ ] **BE-ACA-91** p95: units list under 120 ms with 15 units and 200 assessments each, assessment list under 100 ms, calendar range of 92 days under 150 ms with 500 occurrences, catalog under 30 ms (cached), presign under 50 ms, confirm under 800 ms for a 10 MB file (SHA-256 streaming); query plans checked for `(user_id, due_at)`, `(enrolment_id, due_at)`, `(user_id, starts_at)` and the institutions trigram index (BE-SK-83)

### Migration safety

- [ ] **BE-ACA-92** Initial migration additive; enabling `pg_trgm` is done in the migration with `CREATE EXTENSION IF NOT EXISTS` (requires the RDS parameter allowlist, INF); the generated `percent` column is defined in the first migration (adding a stored generated column later rewrites the table); new enum values ship as `NOT VALID` then `VALIDATE` constraint swaps; data file changes are reviewed like migrations (seeder never deletes)
- [ ] **BE-ACA-93** ETL rehearsal checks (MIG-06 to MIG-09, MIG-19): unit normalisation produces no duplicate `normalized_key`, every old assessment maps to an enrolment or is reported, upload rows without a surviving file are listed, not silently dropped

### SLO contribution

- [ ] **BE-ACA-94** SLIs: student academic reads and writes follow the platform 99.5 percent availability and p95 budgets; reminder punctuality (sent within 5 min of `fire_at`) 99 percent; upload confirm success 99 percent of well-formed uploads

### Load and failure tests

- [ ] **BE-ACA-95** k6 (HRD-10): dashboard-style mix (units list, assessments list, calendar month) at 50 rps for 10 min against seeded data (5 000 students, 15 units, 40 assessments each)
- [ ] **BE-ACA-96** Failure drill: MinIO or S3 unavailable for 2 min; upload routes 503, other routes unaffected, no stuck `pending` rows after recovery beyond the 30 min expiry
- [ ] **BE-ACA-97** Reminder correctness test with the test clock (BE-SK-67): create an assessment due tomorrow, run due scheduled handlers, exactly one in-app notification and one email captured; submit the assessment first and nothing is sent
- [ ] **BE-ACA-98** Integration: a high school student and a university student each onboard, add units and assessments, upload a file (MinIO), and the file survives an app restart (Phase 4 exit gate on the API side)
- [ ] **BE-ACA-99** Contract test: `IStudyUnitLookup` output shape matches what AiTutor and Practice expect (shared fixture in `tests/Aptiverse.Testing`)

## Old data mapping

Source: `academic_planning.*` and `calendar.*` at `43f9faa` (`api/Migrations/ApplicationDbContextModelSnapshot.cs`; domain models under `api/Modules/AcademicPlanning/Aptiverse.Api.Domain/Models/AcademicPlanning/`). Feeds MIG-06 to MIG-09 and MIG-19.

| Old table.column | New | Transform |
|---|---|---|
| `academic_planning.curricula` (`nsc`, `ieb`) | `curricula` | `nsc` to code `CAPS`, `ieb` to `IEB` (reference data comes from the new data files; old rows only validate the mapping) |
| `subjects` where `owner_student_id IS NULL` | `catalog_subjects` | `id` slug to `slug`, `code`, `name`, `category`, `language_type`, `description` |
| `subjects` where `owner_student_id IS NOT NULL` | private `study_units` (`tertiary_course`, `owner_user_id`) | name; level from the student's most common course level, else `first_year`; flagged for review |
| `curriculum_subjects` | `curriculum_subjects` | grade range from the new data files |
| `institutions` | `institutions` | slug kept; rows not in the new data file inserted inactive |
| `courses` (`institution_id`, `slug`, `name`, `code`) | shared `study_units` (`tertiary_course`) | one unit per `(institution, slug, level)` actually used by `student_courses` |
| `student_courses` (`course_id`, `lecturer`, `level`, `duration_semesters`, `completed_at`, `created_at`) | `enrolments` | `teacher_name = lecturer`, `duration` = `semester` when `duration_semesters` is 1, `full_year` when 2 or more (values above 2 noted in the rehearsal report), `started_on = created_at` date, `status = completed` when `completed_at` set |
| `student_subjects` (`curriculum_subject_id`, `grade`, `teacher`) | `study_units` (`caps_subject`, find or create by subject, curriculum, grade) plus `enrolments` | curriculum from the user's old `curriculum_id` |
| `topics` (`subject_id` slug or practice key, `slug`, `name`) | `topics` | catalog subject topics copied to every unit of that subject (all grades) with `source = migration`; tertiary practice keys (`uct:calculus-i`) to the matching shared unit (open question 4) |
| `assessments` (`student_id`, `subject_id`, `title`, `type`, `weight`, `due_date`, `status`, `predicted_mark`, `actual_mark`, `notes`, `tasks` jsonb, `due_reminder_sent`) | `assessments`, `assessment_tasks` | `subject_id` resolved to the user's enrolment by slug or practice key (unresolved rows reported); `status` to `state`; `actual_mark` to `mark_obtained` with `mark_total = 100` and `graded_at = updated_at`; `predicted_mark` to `predicted_percent`; `due_date` (stored UTC) kept; `tasks` jsonb items to rows; reminders only rescheduled for future due dates not already sent |
| `assessment_uploads` (`storage_path`, `filename`, `content_type`, `size_bytes`) | `assessment_uploads` plus S3 objects | MIG-19 copies surviving files from the EC2 volume to `academics/<userId>/<assessmentId>/<guid><ext>`; re-verified with magic bytes; `status = verified`; rows whose file was lost on deploys are not migrated and are listed for the support team |
| `calendar.calendar_events` | `calendar_events` | `event_type` mapping (assessment to `assessment` with `assessment_id` from `related_entity_id`, study and study group sessions to `study_session` or dropped for groups, others to `custom`); `recurrence_rule` kept only if it parses into the supported subset, else expanded into single events for the next 3 months; cancelled events not migrated |
| `calendar.reminders` | `calendar_reminders` | future, unsent only; `minutes_before` snapped to the allowed values |
| `calendar.calendar_syncs` | dropped | no external sync in v1 |
| `calendar.students`, `academic_planning` student shadow tables | dropped | |
| past papers | none | the old app stored no papers (linked to the DBE archive); BE-ACA-63 seeds the index |

## Tests

- Unit (`tests/Aptiverse.Academics.UnitTests`): enrolment gate matrix, topic slugify and merge, lifecycle transitions (every pair), weighting maths, RRULE expansion, ICS serialiser, magic-byte table, normalised keys, SBA prefill, SAST day boundaries.
- Integration: every slice's happy, validation, forbidden and not found cases; BE-ACA-81, BE-ACA-84, BE-ACA-96 to BE-ACA-99; MinIO Testcontainer for uploads.
- Data: JSON Schema validation of every data file and seeder idempotency (run twice, no changes the second time).

## Open questions

1. Decided (14, 40): v1 links out to the official DBE archive (BE-ACA-60); a paper is hosted only with written permission, and IEB papers are never hosted without it. The admin upload path (BE-ACA-64) exists for that exception.
2. Decided (29): curriculum is stored as the exam body, `nsc` or `ieb`, matching Identity and the `exam_body` column on past papers.
3. Decided (E): tertiary units are shared per institution (emergent; the first student creates them). Course names typed by students need the admin rename or merge path (BE-ACA-71 and support script).
4. Topics per unit fragment a subject's topics across grades (Grade 10 and Grade 11 Mathematics are different units). Accept, or key CAPS topics on the catalog subject instead?
5. Upload types follow the old app (JPG, PNG, WebP, HEIC or HEIF, PDF; no Word). HEIC needs server-side conversion for in-browser preview (or download only); decide whether v1 converts.
6. Per-user storage cap of 500 MB: confirm, or tie to plan entitlements?
7. Malware scanning for uploads (student files and admin past papers): GuardDuty Malware Protection for S3 (managed, per GB cost) or a ClamAV container? Until decided, downloads are attachment-only.
8. Free plan limits on units or assessments: none assumed (academics free); confirm with Billing plan features.
9. Past papers entitlement: free assumed (the old app linked freely).
10. Catalog edits: should the admin CRUD (BE-ACA-70) be the source of truth instead of the data files? Two sources cause drift; proposed rule: data files win, admin edits are for urgent fixes and must be committed back.
11. University noun: "courses" or "modules" (see navigation.md open question 1); API and data use `tertiary_course`.
12. Academic calendar data: no machine-readable source exists; the yearly data file (BE-ACA-68) is maintained by hand each October. Who owns that task?
