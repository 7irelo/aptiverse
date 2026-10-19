# Data migration ETL

| | |
|---|---|
| ID range | `MIG-01` to `MIG-25` (original), `MIG-26` to `MIG-73` (split and enterprise additions), `MIG-74` (under-18 affiliates) |
| Phase | 11 (tooling can start once the target module schemas exist, from Phase 4 onward) |
| Depends on | ARC-15 (migration ADR), ARC-22 (entity inventory, `phase-0/specs-and-inventories.md`), FIX-02 and FIX-13 (`phase-0/live-app-fixes.md`), every backend module's "Old data mapping" section, `infra/storage.md`, `launch/disaster-recovery.md` |
| Code path | `api/tools/Migrator` (does not exist yet) |
| Status | Not started. 0 of 74 tasks done. Nothing in `api/` references the old schema. |

## Purpose

Move every live user, record and money balance from the old single `ApplicationDbContext` database into the new per-module schemas, with Guid v7 ids, normalised study units and append-only ledgers, so that the Phase 11 cutover (`launch/cutover.md`) is a rehearsed, timed, reconciled run rather than a one-off script. No dual-writing: the old app goes read-only, the ETL runs once, reconciliation proves it, DNS switches.

## Scope

- **Tool:** a .NET console app in `api/tools/Migrator` that references the new module projects (and their `DbContext`s) so writes go through the real EF models and configurations. It reads the old database with plain Npgsql (no old EF model is copied).
- **Source:** a restored snapshot of the old production RDS (Postgres 16, `db.t3.micro`), never the live instance. Restores follow `infra/docs/runbooks/restore-rds.md` into an isolated environment.
- **Target:** an empty new database built by the `migrate` command of the API image (`host/Aptiverse.Host.dll migrate`), so the schema is exactly what production will run.
- **Uploads:** files recovered from the EC2 `assessment_uploads` volume into the env uploads bucket (`infra/storage.md`).
- **Out of scope:** dropped domains (marketplace, booking with fees, study groups, feature flags, moderation, workspace drafts, the old outbox). They are archived, not migrated (MIG-58).

### Source schema reference

The full old schema is at commit `43f9faa` (the last tree of the old app before the org repo layout replaced it): 47 migrations in `api/Migrations/` (latest `20260723130000_AddAffiliateProgramme`) and a model snapshot with 124 tables, matching `REBUILD_PLAN.md`. The older reference commit `f223ca7` named in CONVENTIONS.md holds only 36 migrations and lacks `identity.user_consents`, `academic_planning.admission_targets` and `admission_requirements`, the whole `affiliates` schema, `entitlements.quota_grants`, `practice.practice_generation_jobs`, `booking.tutor_listings` and `tutor_proposals`, and `study_groups.study_group_tasks`. Use `git show 43f9faa:api/Migrations/ApplicationDbContextModelSnapshot.cs` for table names. Note that `goals.goal_allowances` exists at `f223ca7` but not at `43f9faa`, so whether allowances hold live rows must be confirmed. Schemas at `43f9faa`: `identity`, `auth`, `academic_planning`, `affiliates`, `a_i`, `audit`, `booking`, `calendar`, `entitlements`, `events`, `feature_flags`, `goals`, `insights`, `marketplace`, `mastery`, `moderation`, `notifications`, `practice`, `sales`, `study_groups`, `support`, `wellbeing`, `workspace`. Production may run either version, so the production database stays the source of truth and MIG-26 captures its real schema before any mapping is final.

## Tasks

### Tooling and source capture

- [ ] **MIG-26** Capture the real source schema: restore the latest old-prod snapshot into the isolated rehearsal env, export `__EFMigrationsHistory` and `pg_dump --schema-only`, and commit the table list (no data) to `api/tools/Migrator/source-schema/`. Diff it against the `43f9faa` snapshot (and `f223ca7` if production is older) and against ARC-22; every table must have a disposition (migrate, recompute, archive, drop).
- [ ] **MIG-01** `tools/Migrator` console app referencing the new module EF models (project, `Program.cs` with `run <group>`, `verify <group>`, `report` commands, options validated on start, connection strings from Secrets Manager or environment only).
- [ ] **MIG-02** Old to new id lookup table (string and long to Guid v7): `migration.id_map(entity, old_id text, new_id uuid, migrated_at)` with a unique index on `(entity, old_id)`, written in the same transaction as the target rows.
- [ ] **MIG-59** Idempotent, resumable batches: each group runs in keyed batches (by old primary key), records a checkpoint row per batch, and a re-run skips completed batches and upserts by `id_map`, so a crash mid-run never duplicates rows.
- [ ] **MIG-60** Run mode for rehearsals and cutover: package the Migrator as a container and run it as a one-off ECS task in the target env (same network path as production), with logs to CloudWatch; no laptop runs against production data.
- [ ] **MIG-61** Structured run report: per group, rows read, written, skipped, rejected (with reason codes), duration, and checksum; written as JSON plus Markdown to an encrypted S3 prefix and attached to the rehearsal record.
- [ ] **MIG-62** Timing budget per group: record durations from each rehearsal, set a budget per group, and fail the run report if the total exceeds the cutover window agreed in `launch/cutover.md`.
- [ ] **MIG-58** Archive of dropped domains: export marketplace, booking, study groups, feature flags, moderation, workspace drafts and `events.outbox_messages` to an encrypted, access-logged archive with a retention date from `launch/retention-schedule.md`; then they are excluded from the ETL.

### Users and Identity (MIG-03)

| Old tables | New home | Id mapping | Transforms |
|---|---|---|---|
| `identity.users`, `identity.roles`, `identity.user_roles`, `identity.user_claims`, `identity.user_logins`, `identity.user_tokens`, `identity.role_claims`; `auth.students`, `auth.parents`, `auth.admins`, `auth.superusers`, `auth.teachers`, `auth.student_admins`, `auth.student_teachers` | `identity` schema (users, roles, logins, onboarding profile) | `identity.users.Id` (string) to Guid v7; `auth.*` long ids to the same user's Guid | Roles collapse to `student`, `parent`, `admin` (`superuser` becomes `admin`); tokens and refresh tokens are not migrated, everyone signs in again |

- [ ] **MIG-03** Map users and Identity (password hashes carried over): users, normalised email, email confirmed flag, lockout fields reset, security stamp regenerated.
- [ ] **MIG-27** Password hash compatibility: prove with a unit test that Identity 10's `PasswordHasher` verifies hashes produced by the old app (format marker byte, iteration count) and rehashes on next sign-in; document the fallback (forced reset email) if any format fails.
- [ ] **MIG-28** Role mapping table and rules: one documented mapping old role to new role, a reject report for users with no v1 role (teachers, school admins, tutors) and the decision on whether those accounts migrate as role-less users or are archived.
- [ ] **MIG-29** Google sign-in links: migrate `identity.user_logins` for the Google provider so OAuth users keep signing in; verify the Google client id is the same or plan re-linking.
- [ ] **MIG-30** Student profile into onboarding fields: education level (high school or tertiary), grade or year of study, curriculum (NSC or IEB), school or institution; students missing these get `onboarding_completed = false` so the new onboarding asks once.
- [ ] **MIG-31** Duplicate and quality checks: case-insensitive email duplicates, users with no email, unconfirmed accounts older than a cut-off; produce a report and a decision per category before rehearsal 1.

### Consent (MIG-04)

- [ ] **MIG-04** Map consent rows unchanged: document version, timestamp, source, IP and user agent copied byte for byte into `identity.user_consents`.
- [ ] **MIG-32** Confirm `identity.user_consents` (added by `20260722120524_AddUserConsents` at `43f9faa`, absent at `f223ca7`) exists in the live schema. If it does not exist, record the decision: re-collect consent at first sign-in on the new app, with copy approved under `launch/popia.md`.
- [ ] **MIG-64** Consent integrity check: row counts and a hash over `(user, document, version, accepted_at)` match between source and target exactly.

### Parent links (MIG-05)

| Old tables | New home | Transforms |
|---|---|---|
| `auth.parent_links`, `auth.student_parents` (long ids) | `family` schema | Merge the two sources, dedupe by (parent, student), keep the earliest link date and the consent state |

- [ ] **MIG-05** Map parent links into `family` with Guid user references.
- [ ] **MIG-33** Dedupe and conflict report for links present in both `parent_links` and `student_parents`, and for links pointing at deleted users.

### Study units (MIG-06)

| Old tables | New home | Transforms |
|---|---|---|
| `academic_planning.curricula`, `curriculum_subjects`, `subjects`, `institutions`, `courses`; duplicate subject tables in `goals`, `practice`, `insights`, `mastery` | `academics.study_units` (`kind` = `caps_subject` or `tertiary_course`), institutions | CAPS subjects map onto the freshly seeded catalog; tertiary courses become study units scoped to an institution with year of study and level |

- [ ] **MIG-06** Map study units (normalise subjects and courses into `study_units`).
- [ ] **MIG-34** CAPS subject mapping table: old subject id or name to seeded catalog code, reviewed by hand once, committed as data; unmapped subjects fail the run.
- [ ] **MIG-35** Tertiary courses: map `courses` and `institutions` to study units with institution, year of study and duration; flag courses with no institution.

### Enrolments and topics (MIG-07)

- [ ] **MIG-07** Map enrolments and topics (`academic_planning.student_subjects`, `student_courses`, `academic_planning.topics`, `practice.topics`, the `student_subject_topics` tables in `insights` and `mastery`).
- [ ] **MIG-36** Topic dedupe per study unit (case and whitespace normalised), keeping the emergent registry rule of one topic name per unit.
- [ ] **MIG-37** One path per student: enforce high school xor tertiary; students enrolled in both get an exception report and a decision (keep the path matching their profile education level).

### Assessments and uploads metadata (MIG-08)

- [ ] **MIG-08** Map assessments and uploads metadata (`academic_planning.assessments`, assessment tasks, `assessment_uploads`).
- [ ] **MIG-38** Lifecycle mapping: old status values to `scheduled`, `in_progress`, `submitted`, `graded`; unknown values fail the run.
- [ ] **MIG-39** Upload metadata keys rewritten to S3 object keys (`uploads/<user>/<assessment>/<file id>`), size and content type carried, and rows whose file did not survive marked `file_missing` (feeds MIG-19).

### Calendar (MIG-09)

- [ ] **MIG-09** Map calendar events (`calendar.calendar_events`); `calendar.calendar_syncs` disposition decided in MIG-26.
- [ ] **MIG-40** Future reminders (`calendar.reminders`, assessment-due reminder state) re-created as Wolverine scheduled messages after load; past reminders are not migrated.

### Practice (MIG-10)

- [ ] **MIG-10** Map practice tests, questions, attempts (`practice.practice_tests`, `generated_tests`, `practice_attempts`, `practice_attempt_items`, `answer_submissions`, `attempt_score_summaries`).
- [ ] **MIG-41** Content format flag: mark legacy ASCII-math content so the web renders it through the ASCII-math bridge (`frontend/components/math-text.md`); LaTeX content passes through.
- [ ] **MIG-42** In-progress attempts at cutover: rule decided and applied (auto-submit with recorded `focus_loss_count`, or void with a note to the student); no attempt is left half open. Queued or running rows in `practice.practice_generation_jobs` are not migrated: they are marked failed in the report and the student can regenerate.

### AI conversations (MIG-11)

- [ ] **MIG-11** Map AI conversations and messages: `a_i.tutor_conversations.Messages` (a JSON string) split into conversation and message rows in the `ai` schema, with role, content and timestamp.
- [ ] **MIG-43** Message parsing guard: malformed JSON rows go to the reject report, never truncated silently; character limits from the new model applied with a recorded count of truncated rows (expected zero).

### Goals, milestones, points, achievements (MIG-12)

Decision 6: no pledges, points or quota top-ups in v1. Goals, milestones and achievements migrate; points, rewards and quota grants do not. They are archived so balances can be honoured if rewards return after launch. Users with unspent points see nothing in the new app (no balance, no rewards page); their points and any unexpired quota grants simply stop applying at cutover, which is a comms item for the cutover announcement.

- [ ] **MIG-12** Map goals, milestones and achievements (`goals.goals`, `goal_milestones`); `growth_trackings` dropped; `points_transactions`, `student_points`, `rewards`, `reward_features`, `student_rewards` are archived, not mapped (MIG-44, decision 6).
- [ ] **MIG-44** Points archive (decision 6: points are not in v1): export `points_transactions`, `student_points` (with per-user `AvailablePoints`), `rewards`, `reward_features` and `student_rewards` to the encrypted, access-logged archive used by MIG-58, keyed by the new user id, with a retention date from `launch/retention-schedule.md`; prove in the archive that the per-student sum of `points_transactions` equals `student_points` and record mismatches, so balances could be honoured exactly if rewards return. Nothing is written to `progress.points_ledger`.
- [ ] **MIG-45** Allowances and quota grants (decision 6: not in v1): `goals.goal_allowances` was dropped before `43f9faa`, so archive it under MIG-58 only if MIG-26 finds it in the live schema; export `entitlements.quota_grants` (all rows, with `ExpiresAt`) to the same archive as MIG-44. Neither is migrated into Family or Billing.
- [ ] **MIG-46** Mastery and insights (`mastery.*`, `insights.*`): recompute projections from migrated attempts rather than copying old aggregates; record the decision and the recompute job duration.

### Admission targets (MIG-13)

- [ ] **MIG-13** Map admission targets and requirements (only what the student entered; standing is recomputed from marks).
- [ ] **MIG-47** Confirm `academic_planning.admission_targets` and `admission_requirements` (added by `20260715140908_AddAdmissionTargets` at `43f9faa`) exist in the live schema; if absent, close MIG-13 as not applicable with a note.

### Wellbeing and diary (MIG-14)

- [ ] **MIG-14** Map wellbeing entries and diary (re-encrypt if key scheme changes): `wellbeing.diary_entries`, `diary_goals`, `mood_trackings`.
- [ ] **MIG-48** Encryption check: determine whether old diary content is encrypted at the application level; if yes, decrypt with the old key and re-encrypt with the new key inside the Migrator process only (no plaintext on disk or in logs); if no, encrypt on load if the new model requires it.
- [ ] **MIG-49** Sharing defaults: every migrated entry is private unless the old data holds an explicit share flag; no entry becomes visible to a parent by migration.

### Notifications and preferences (MIG-15)

- [ ] **MIG-15** Map notifications and preferences (`notifications.notifications`, the preference columns from `AddNotificationPreferences`, `AddStudyGroupEmailReminderPref`, `AddAssessmentDueEmailPref`).
- [ ] **MIG-50** Notification window: migrate unread notifications and the last 90 days only (or the window set in `launch/retention-schedule.md`); study group preferences dropped with the study groups domain.

### Billing (MIG-16)

| Old tables | New home | Transforms |
|---|---|---|
| `entitlements.plans`, `plan_features`, `plan_quotas`, `subscriptions`, `subscription_members`, `feature_usages`; payment and invoice tables per MIG-26 | `billing` schema | Integer cents plus currency; Paystack subscription and customer codes carried; state mapped onto the new state machine |

- [ ] **MIG-16** Map plans, subscriptions (existing Paystack codes, no re-charge), invoices, payments.
- [ ] **MIG-51** Plan code map: old `PlanCode` to new plan seed codes and Paystack plan codes, reviewed against the Paystack inventory (ARC-23).
- [ ] **MIG-52** Subscription state mapping: old `Status`, `ValidUntil`, `RenewalFailureCount` onto `trialing`, `active`, `past_due`, `cancelled`, `scheduled downgrade`; every combination covered by a unit test.
- [ ] **MIG-53** No re-charge guard: carry `PaystackSubscriptionCode`, `PaystackCustomerCode`, next payment date and email token where present; the new Billing module must not create a Paystack subscription for a migrated record (integration test with a mocked Paystack client).
- [ ] **MIG-54** Payments and invoices: migrate from the live tables found in MIG-26, or backfill from the Paystack transactions API if the old DB holds none; amounts in cents, currency `ZAR`.
- [ ] **MIG-55** Usage meters (`feature_usages`): migrate only the current period's usage so quotas stay fair after cutover; older usage archived. `entitlements.quota_grants` are not migrated (archived under MIG-45, decision 6), so bonus quota from points ends at cutover.

### Affiliates (MIG-17)

- [ ] **MIG-17** Map affiliates, commission ledger, holds, payouts, under these rules (decisions 3b, 3c): every old affiliate becomes an `active` (or `suspended`, as before) profile through automatic enrolment with no `applications` rows; each referral keeps the old `SignedUpAt` as `attributed_at` and gets `attribution_expires_at` 12 calendar months after it, so referrals older than 12 months import already expired (BE-AFF-84, count reported); old `PayoutOnboardingStatus` maps `NotStarted` to `not_submitted`, `Submitted` to `in_review`, `Approved` to `confirmed`, `Rejected` to `needs_fixing`; the terms snapshot is the decided old terms with `attribution_months = 12` and re-acceptance pending (BE-AFF-85).
- [ ] **MIG-74** Under-18 affiliates at cutover (decision 31: affiliates must be 18 or older): an old affiliate whose date of birth is known and under 18, or a student affiliate with no date of birth, imports with the profile `suspended` (reason `age_review`), code inactive and no new attribution; the balance owed and holds carry over exactly and are held, never forfeited. Each case is listed in the rehearsal report for manual review by the owner: pay once the person turns 18 and passes the payout-details review, or pay earlier only if the Information Officer and an accountant confirm it is lawful (for example to the account holder with parental consent). Students without a date of birth set it through `PATCH /me/profile` (BE-IDN-90); if it shows 18 or older the profile can be reinstated by an admin (BE-AFF-22).
- [ ] **MIG-56** Confirm the `affiliates` schema (`affiliates`, `referrals`, `referral_fraud_signals`, `commission_entries`, `commission_entry_events`, `affiliate_payouts`, `affiliate_payout_items`, `payment_fingerprints`, `device_fingerprints`, from `20260723130000_AddAffiliateProgramme` at `43f9faa`) exists in the live schema, with row counts (ARC-24); decision 3 keeps affiliates in v1, so MIG-17 runs; if the schema is absent from production (no live affiliates), close MIG-17 and MIG-21's commission part as not applicable.
- [ ] **MIG-57** Ledger continuity: open holds keep their release dates (re-scheduled as Wolverine messages), unpaid balances and payout history carry exactly, and the per-affiliate balance matches to the cent before and after.

### Support, enquiries and audit (MIG-18)

- [ ] **MIG-18** Map support tickets, contact and school enquiries, audit trail (`support.support_tickets`, `support_messages`, `support_categories`, `sales.contact_enquiries`, `sales.school_enquiries`, `audit.audit_logs`, `audit.audit_actions`).
- [ ] **MIG-63** Audit trail as read-only history: imported into the `admin` schema flagged `source = legacy`, never editable, retained per `launch/retention-schedule.md`.

### Uploads (MIG-19)

- [ ] **MIG-19** Uploads from EC2 volume into S3, keys rewritten.
- [ ] **MIG-65** Inventory the surviving files on the EC2 host (depends FIX-02): list with size and SHA-256, matched against `assessment_uploads` rows.
- [ ] **MIG-66** Copy with integrity: upload with SSE-KMS and a `x-amz-checksum-sha256`, verify magic bytes against the allowlist, and record per-file result; files failing the check are quarantined, not served.

### Reconciliation

- [ ] **MIG-20** Reconciliation: counts per entity (source vs target, minus documented rejects), as an automated `verify` command.
- [ ] **MIG-21** Reconciliation: money sums to the cent (payments, commissions, payouts).
- [ ] **MIG-22** Reconciliation: per-user spot checks.
- [ ] **MIG-67** Referential integrity after load: every FK inside each module resolves, every cross-module id reference resolves through `id_map`, zero orphans.
- [ ] **MIG-68** Spot-check script: 25 random users per role plus every paying subscriber and every affiliate with a balance, comparing a rendered summary (profile, units, attempts count, subscription, balance) from old and new.
- [ ] **MIG-69** Reconciliation report artefact: one report per run combining MIG-20, MIG-21, MIG-22, MIG-64 and MIG-67, archived with the run report (MIG-61); cutover proceeds only on a 100% pass.

### Rehearsals

- [ ] **MIG-70** Isolated rehearsal environment: a dedicated, encrypted environment (separate VPC or account), access limited to named people, restored snapshot destroyed within 48 hours of each rehearsal, with the destruction logged. Production PII never lands on a laptop.
- [ ] **MIG-23** Rehearsal 1 against restored snapshot.
- [ ] **MIG-24** Rehearsal 2.
- [ ] **MIG-25** Rehearsal 3 (timed, matches cutover window).
- [ ] **MIG-71** Anonymised staging dataset: from a rehearsal target, run an anonymiser (names, emails, phone numbers, diary content, IPs replaced; money and structure kept) and load it into staging so staging carries realistic, anonymised data (environments requirement). Document the anonymisation rules and test that no source email survives.
- [ ] **MIG-72** Rollback plan: documented point of no return, steps to abandon the run (old app back to read-write, DNS unchanged), and the data deltas to replay if rollback happens after users wrote to the new app; reviewed in the go/no-go (`launch/cutover.md`).
- [ ] **MIG-73** Sign-off record: data owner approvals per entity group (users, billing, affiliates, wellbeing), the three rehearsal reports, and the final reconciliation report, stored with the cutover record.

## Verification

- `dotnet run --project tools/Migrator -- run all` on a restored snapshot completes with zero unhandled rejects; a second run immediately after writes zero new rows (idempotency).
- `dotnet run --project tools/Migrator -- verify all` reports 100% on counts, money sums, consent hashes and referential integrity.
- Rehearsal 3 total duration is inside the cutover window with at least 30% headroom.
- A migrated student, parent and admin can sign in with their old password on staging (rehearsal target), and a migrated subscriber is not charged by any webhook or job during a 24 hour soak.
- `rg -i "@" staging-dump.sql` style check on the anonymised staging data finds no real email domain from the source.

## Open questions

- Which old version does production run: the 47-migration tree at `43f9faa` or the 36-migration tree at `f223ca7`? MIG-26 answers it from `__EFMigrationsHistory`. CONVENTIONS.md should name `43f9faa` as the old app reference for schema work.
- Decided (61): teacher and tutor accounts migrate as students or parents where possible; the rest are hidden until Phase 12 (MIG-28).
- Is diary content encrypted at the application level today (MIG-48)?
- Decided (33): rehearsal environments and backups stay in af-south-1; a second region only after a POPIA opinion (`launch/disaster-recovery.md`).
- Decided (3, 6): affiliates ship in v1 (MIG-17 runs); allowances, points and quota grants do not (archived under MIG-44 and MIG-45).
