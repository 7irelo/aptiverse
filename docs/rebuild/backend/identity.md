# Identity module

| | |
|---|---|
| ID range | `BE-IDN-01` to `BE-IDN-07`, `BE-IDN-10` to `BE-IDN-14`, `BE-IDN-20` to `BE-IDN-39`, `BE-IDN-50` to `BE-IDN-55` (original); `BE-IDN-08`, `09`, `15` to `19`, `40` to `49`, `56` to `69` (splits and additions); `BE-IDN-70` to `BE-IDN-89` (production readiness); `BE-IDN-90` (age data for accounts without it) |
| Schema | `identity` |
| Projects | `src/Modules/Identity/Aptiverse.Identity`, `src/Modules/Identity/Aptiverse.Identity.Contracts`, `tests/Aptiverse.Identity.UnitTests` (planned; `InternalsVisibleTo` already declared) |
| Phase | 2 |
| Consumes | `Aptiverse.Billing.Contracts` (`IEntitlementResolver`, BE-BIL-05, for `/me` and navigation; empty list until Phase 6), `Aptiverse.Affiliates.Contracts` (`IAffiliateProfileLookup`, affiliate profile status for `/me`; null until BE-AFF lands), `Aptiverse.Academics.Contracts` (`IInstitutionCatalog`), `Aptiverse.Admin.Contracts` (`ImpersonationStarted`/`Ended`, BE-ADM-24) |
| Publishes | `UserRegistered`, `EmailVerificationRequested`, `PasswordResetRequested`, `PasswordChanged`, `AccountDeletionRequested` (all exist in `IdentityEvents.cs`); planned `EmailVerified`, `AccountLockedOut`, `UserOnboarded`, `StudentStageChanged`, `UserProfileUpdated`, `SessionsRevoked`, `PersonalDataExportRequested`, `AccountErasureApproved`, `UserErased`; implements `IUserProfileLookup`, `IUserDirectory`, `IIdentityAdminCommands` |
| Depends on | BE-SK-25, BE-SK-26, BE-SK-27, BE-SK-38, BE-SK-45, BE-SK-60, INF-16 (signing key in Secrets Manager), BE-NTF-04 (emails) |
| Status | Partial. 0 done, 19 partial, 71 not started (90 tasks). Domain, persistence configuration, token, session, signing-key, role-map and auth rate-limit code exists uncommitted; there is no `IdentityModule` class (the DbContext references `IdentityModule.Schema`, so the project does not compile), no migration, no endpoint, and the module is not in the solution, Host, Worker, Dockerfile or architecture tests |

## Responsibilities and out of scope

Responsible for:

- Accounts on ASP.NET Core Identity 10 (password hashing, lockout, security stamp) over the module's own `User` entity (`UserStore`, Guid v7 ids, soft delete, `xmin`).
- Sessions and tokens: 15 minute ES256 access tokens, JWKS, rotating hashed refresh tokens with family revocation, session revocation checked on every request.
- Roles and the single role to permission map; `/me`.
- Registration with versioned consent, email verification, password reset and change, Google sign-in for existing accounts.
- Onboarding (education level, grade or year of study, curriculum, school or institution) and profile settings.
- POPIA: deletion requests, data export orchestration, erasure orchestration across modules.
- Security event audit log (admin readable).
- Navigation endpoint hosting (see `navigation.md`; no own schema).

Out of scope:

- Sending email (Notifications reacts to Identity events).
- Notification preferences (Notifications, BE-NTF-06; see BE-IDN-48).
- Parent and student links and parent consent for minors (Family, BE-FAM-02, BE-FAM-14); Identity only stores the facts Family needs (BE-IDN-62).
- Entitlements (Billing); admin read models and impersonation records (Admin).
- Study units and enrolment (Academics).

## Data model

Schema `identity`. Every table has the platform columns `id uuid` PK (Guid v7), `created_at`, `updated_at`, `deleted_at timestamptz null` and `xmin`, unless marked append-only. Shapes below are verified against `Persistence/Configurations/IdentityConfigurations.cs` and `Domain/*`; rows marked planned are additions.

### users

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| email | varchar(256) | no | as entered, trimmed |
| normalized_email | varchar(256) | no | unique `ix_users_normalized_email` filtered `deleted_at IS NULL` |
| email_confirmed | boolean | no | |
| password_hash | varchar(512) | yes | null for Google-only accounts; Identity v3 format (PBKDF2) so old hashes port |
| security_stamp | varchar(64) | no | rotated on password change and reset |
| lockout_enabled | boolean | no | true on create |
| lockout_end | timestamptz | yes | |
| access_failed_count | integer | no | reset on success and on password replace |
| name | varchar(120) | no | single display name (old `first_name` plus `last_name` joined) |
| phone_number | varchar(32) | yes | optional, E.164 when present (validator) |
| education_level | varchar(16) | yes | check `education_level IS NULL OR education_level IN ('high_school','tertiary')` |
| grade | integer | yes | check `grade IS NULL OR grade BETWEEN 8 AND 12`; only when `high_school` |
| year_of_study | integer | yes | check `year_of_study IS NULL OR year_of_study BETWEEN 1 AND 7`; only when `tertiary` and `study_level` is an undergraduate year; null for postgraduate |
| study_level | varchar(24) | yes | planned (BE-IDN-66): check `study_level IS NULL OR study_level IN ('first_year','second_year','third_year','fourth_year','honours','masters','phd')`; required for tertiary; exactly the old `AllowedLevels` (First year to PhD, no NQF levels), so postgraduate students are representable; fifth and sixth year (for example MBChB) are open question 11 |
| programme | varchar(160) | yes | planned (BE-IDN-66): tertiary only, free text as the student types it ("BSc Computer Science"); never resolved against a list |
| curriculum | varchar(16) | yes | check `curriculum IS NULL OR curriculum IN ('nsc','ieb')`; the exam body, both follow CAPS (decision 29); only when `high_school` |
| institution_name | varchar(200) | yes | school name (high school) or institution name (tertiary) as displayed |
| institution_id | uuid | yes | planned (BE-IDN-02): Academics institution catalog id for tertiary students; no FK (other schema), validated through `IInstitutionCatalog` at write time |
| onboarding_completed_at | timestamptz | yes | set once |
| email_reminders | boolean | no | exists today; removed before first migration (BE-IDN-48) |
| email_progress_summaries | boolean | no | exists today; removed before first migration (BE-IDN-48) |
| email_product_updates | boolean | no | exists today; becomes a `marketing_email` consent row (BE-IDN-48) |
| deletion_requested_at | timestamptz | yes | set by BE-IDN-36 |
| date_of_birth | date | yes | planned (BE-IDN-62): check `date_of_birth BETWEEN '1900-01-01' AND '2100-01-01'`; required for students at onboarding; drives `isMinor` (under 18 on the current Johannesburg date) for Family parental consent (BE-FAM-14) |
| erased_at | timestamptz | yes | planned (BE-IDN-60): set when personal fields are anonymised |
| check (planned) | | | `ck_users_stage_shape`: `education_level IS NULL OR (education_level = 'high_school' AND year_of_study IS NULL AND study_level IS NULL AND programme IS NULL) OR (education_level = 'tertiary' AND grade IS NULL AND curriculum IS NULL)` |
| check (planned) | | | `ck_users_year_matches_level`: `year_of_study IS NULL OR study_level IN ('first_year','second_year','third_year','fourth_year')` |

Roles navigation is auto-included (`AutoInclude`).

### user_roles

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK `users.id` restrict; unique `(user_id, role)` filtered `deleted_at IS NULL` (leading column serves the FK) |
| role | varchar(32) | no | check `role IN ('student','parent','admin')` from `Roles.Active`; affiliate is not a role (BE-IDN-19) |

### user_logins

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index |
| provider | varchar(32) | no | `google` only in v1 |
| provider_key | varchar(256) | no | Google `sub`; unique `(provider, provider_key)` filtered `deleted_at IS NULL` |

### sessions

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index `(user_id, revoked_at)` |
| auth_method | varchar(16) | no | check `auth_method IN ('password','google')`; `impersonation` added by BE-ADM-24 |
| ip_address | varchar(64) | yes | last seen client IP (from forwarded headers) |
| user_agent | varchar(512) | yes | truncated |
| expires_at | timestamptz | no | absolute lifetime (30 days default) |
| last_seen_at | timestamptz | no | touched on refresh |
| revoked_at | timestamptz | yes | |
| revoked_reason | varchar(32) | yes | `logout`, `signed_out_remotely`, `refresh_reuse`, `password_changed`, `password_reset`, `account_linked`; planned check constraint |
| impersonator_user_id | uuid | yes | planned (BE-ADM-24): admin user id when `auth_method = 'impersonation'` |

A session id is the refresh token family id and the access token `sid` claim.

### refresh_tokens

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index |
| session_id | uuid | no | FK `sessions.id` restrict; index (family) |
| token_hash | char(64) | no | SHA-256 hex; unique |
| expires_at | timestamptz | no | min(now plus sliding 7 days, session expiry) |
| consumed_at | timestamptz | yes | set when rotated; presenting a consumed token is reuse |
| revoked_at | timestamptz | yes | |
| replaced_by_token_id | uuid | yes | planned (BE-IDN-03): self FK, index; forensic chain |

Device info (IP, user agent) lives on `sessions`, not on each token (deviation from the original BE-IDN-03 wording, recorded there).

### one_time_tokens

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index `(user_id, purpose)` |
| purpose | varchar(32) | no | check `purpose IN ('email_verification','password_reset')`; `email_change` added by BE-IDN-49 |
| token_hash | char(64) | no | unique |
| expires_at | timestamptz | no | 48 h verification, 60 min reset |
| consumed_at | timestamptz | yes | issuing a new token consumes older unconsumed ones |
| new_email | varchar(256) | yes | planned (BE-IDN-49), only for `email_change` |

### user_consents (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index `(user_id, document_key)` |
| document_key | varchar(32) | no | `terms`, `privacy`; planned `marketing_email`, `parental_consent_notice`; planned check constraint |
| version | varchar(32) | no | from `Legal:TermsVersion` / `Legal:PrivacyVersion` |
| accepted_at | timestamptz | no | |
| source | varchar(32) | no | `register`, `google`, `reconsent`, `migration`; planned check constraint |
| ip_address | varchar(64) | yes | |
| user_agent | varchar(512) | yes | |
| withdrawn_at | timestamptz | yes | planned: only for optional consents (marketing); terms and privacy are never withdrawn, the account is deleted instead |

No updates except `withdrawn_at`; never soft deleted.

### security_events (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | yes | FK restrict; index `(user_id, created_at)` |
| type | varchar(48) | no | check over `SecurityEventTypes.All` (13 values today: `registered`, `login_succeeded`, `login_failed`, `lockout`, `logout`, `session_revoked`, `refresh_reuse_detected`, `email_verified`, `password_changed`, `password_reset_requested`, `password_reset`, `google_linked`, `account_deletion_requested`); planned `email_changed`, `impersonation_started`, `impersonation_ended`, `export_requested`, `account_erased`, `role_changed` |
| email | varchar(256) | yes | attempted email for failed logins (truncated) |
| ip_address | varchar(64) | yes | |
| user_agent | varchar(512) | yes | |
| detail | varchar(500) | yes | never contains secrets or tokens |
| index | | | `created_at` for the admin viewer |

### account_deletion_requests

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index; planned unique filtered `status = 'pending'` |
| reason | varchar(1000) | yes | free text, optional |
| status | varchar(16) | no | `pending` today; planned check `status IN ('pending','approved','completed','cancelled')` |
| decided_at | timestamptz | yes | planned |
| decided_by_user_id | uuid | yes | planned (admin id); no FK to keep erasure simple |
| completed_at | timestamptz | yes | planned |
| scheduled_erasure_at | timestamptz | yes | planned: request plus the cooling-off period (`Auth:DeletionCoolingOffDays`, default 14, open question 9) |
| cancelled_at | timestamptz | yes | planned (BE-IDN-64) |

### data_export_requests (planned, BE-IDN-37)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | FK restrict; index `(user_id, created_at desc)` |
| status | varchar(16) | no | check `status IN ('queued','running','ready','failed','expired')` |
| s3_key | varchar(512) | yes | exports bucket, server-side encrypted |
| ready_at | timestamptz | yes | |
| expires_at | timestamptz | yes | ready plus 7 days; object lifecycle deletes it |
| failure_code | varchar(64) | yes | |

## Contracts

`Aptiverse.Identity.Contracts` (events exist in `IdentityEvents.cs`; interfaces and the rest are planned):

```
// exist
public sealed record UserRegistered(Guid UserId, string Email, string Name, string Role, DateTimeOffset OccurredAt);
public sealed record EmailVerificationRequested(Guid UserId, string Email, string Name, Uri VerificationUrl, DateTimeOffset ExpiresAt, DateTimeOffset OccurredAt);
public sealed record PasswordResetRequested(Guid UserId, string Email, string Name, Uri ResetUrl, DateTimeOffset ExpiresAt, DateTimeOffset OccurredAt);
public sealed record PasswordChanged(Guid UserId, string Email, string Name, bool ViaReset, DateTimeOffset OccurredAt);
public sealed record AccountDeletionRequested(Guid UserId, string Email, string Name, DateTimeOffset OccurredAt);

// planned (BE-IDN-44)
public sealed record EmailVerified(Guid UserId, DateTimeOffset OccurredAt);
public sealed record AccountLockedOut(Guid UserId, string Email, string Name, DateTimeOffset LockedUntil, DateTimeOffset OccurredAt);
public sealed record UserOnboarded(Guid UserId, string Role, string? EducationLevel, int? Grade, int? YearOfStudy, string? StudyLevel, string? Curriculum, Guid? InstitutionId, bool IsMinor, DateTimeOffset OccurredAt);
public sealed record StudentStageChanged(Guid UserId, string EducationLevel, int? Grade, int? YearOfStudy, string? StudyLevel, string? Curriculum, DateTimeOffset OccurredAt);
public sealed record UserProfileUpdated(Guid UserId, string Name, DateTimeOffset OccurredAt);
public sealed record EmailChanged(Guid UserId, string OldEmail, string NewEmail, string Name, DateTimeOffset OccurredAt);
public sealed record SessionsRevoked(Guid UserId, IReadOnlyList<Guid> SessionIds, string Reason, DateTimeOffset OccurredAt);
public sealed record PersonalDataExportRequested(Guid UserId, Guid ExportId, DateTimeOffset OccurredAt);
public sealed record AccountErasureApproved(Guid UserId, Guid RequestId, DateTimeOffset OccurredAt);
public sealed record UserErased(Guid UserId, DateTimeOffset OccurredAt);   // every module handles: anonymise or delete its rows

// planned query interfaces (BE-IDN-42, BE-IDN-43, BE-IDN-61)
public interface IUserProfileLookup   // used by AiTutor, Academics, Progress, Family
{
    Task<UserProfile?> GetAsync(Guid userId, CancellationToken ct);
}
public sealed record UserProfile(Guid UserId, string Name, IReadOnlyList<string> Roles, string? EducationLevel,
    int? Grade, int? YearOfStudy, string? StudyLevel, string? Programme, string? Curriculum, Guid? InstitutionId,
    string? InstitutionName, bool OnboardingCompleted, bool? IsMinor, string AgeBand);

public interface IUserDirectory       // used by Notifications (addresses), Admin (search), Family (invite by email)
{
    Task<UserContact?> GetContactAsync(Guid userId, CancellationToken ct);
    Task<Guid?> FindIdByEmailAsync(string email, CancellationToken ct);
    Task<PagedResult<AdminUserRow>> SearchAsync(AdminUserQuery query, CancellationToken ct);
    Task<AdminUserDetail?> GetAdminDetailAsync(Guid userId, CancellationToken ct);
}
public sealed record UserContact(Guid UserId, string Email, string Name, bool EmailConfirmed, bool Erased);
public sealed record AdminUserQuery(string? Search, string? Role, string? EducationLevel, bool? EmailConfirmed, bool? Locked, DateOnly? CreatedFrom, DateOnly? CreatedTo, PageRequest Page);
public sealed record AdminUserRow(Guid UserId, string Name, string Email, IReadOnlyList<string> Roles, string? EducationLevel, bool EmailConfirmed, bool Locked, DateTimeOffset CreatedAt, DateTimeOffset? LastSeenAt);
public sealed record AdminUserDetail(AdminUserRow Summary, int? Grade, int? YearOfStudy, string? Curriculum, string? InstitutionName,
    DateTimeOffset? OnboardingCompletedAt, int ActiveSessions, IReadOnlyList<SecurityEventView> RecentSecurityEvents, IReadOnlyList<ConsentView> Consents, DateTimeOffset? DeletionRequestedAt);

public interface IIdentityAdminCommands   // used by Admin (BE-ADM-04, BE-ADM-16, BE-ADM-17, BE-ADM-24)
{
    Task<Result> ResendVerificationAsync(Guid userId, Guid adminId, CancellationToken ct);
    Task<Result<int>> RevokeAllSessionsAsync(Guid userId, Guid adminId, CancellationToken ct);
    Task<Result> UnlockAsync(Guid userId, Guid adminId, CancellationToken ct);
    Task<Result<ImpersonationTokens>> StartImpersonationAsync(Guid targetUserId, Guid adminId, Guid adminSessionId, TimeSpan duration, CancellationToken ct);
    Task<Result> EndImpersonationAsync(Guid impersonationSessionId, CancellationToken ct);
    Task<PagedResult<SecurityEventView>> ListSecurityEventsAsync(SecurityEventQuery query, CancellationToken ct);
}
```

## Foundation tasks

### Module and data

- [ ] **BE-IDN-01** Module projects, `identity` schema, Identity 10 on Guid v7 keys. *(partial: `Aptiverse.Identity` and `.Contracts` projects, `IdentityDbContext : ModuleDbContext`, design-time factory and `UserStore` (password, email, security stamp, lockout stores) exist; no `IdentityModule` class, so the project does not compile; `AddIdentityCore<User>` with `PasswordPolicy.Configure` and lockout options is not registered)*
- [ ] **BE-IDN-08** `IdentityModule` registration class: `Schema = "identity"`, `AddIdentityModule` (DbContext, Identity core, `UserStore`, options with `ValidateOnStart` for `AuthOptions` and `LegalOptions`, handlers, validators, Wolverine handler discovery, `HybridCache`), `MapIdentityEndpoints` (`/auth`, `/me`, `/.well-known`); add to `Aptiverse.slnx`, Host, Worker, Dockerfile (BE-SK-53) and `ArchitectureTests/Modules.cs`
- [ ] **BE-IDN-02** `users` profile fields: name, education level, grade or year, curriculum, school or institution. *(partial: columns and check constraints configured; single `institution_name` serves school and institution; no `institution_id`; stage-shape check constraint missing; `Domain/User.cs` curriculum constants are still `CAPS` and `IEB` and must become `nsc` and `ieb` (decision 29); no migration)*
- [ ] **BE-IDN-03** `refresh_tokens` table (hash, family id, expiry, revoked at, replaced by, device info). *(partial: hash, `session_id` as family, expiry, `consumed_at`, `revoked_at` configured; `replaced_by_token_id` missing; device info is on `sessions` by design; no migration)*
- [ ] **BE-IDN-04** `user_consents` table (document, version, timestamp, source, IP, user agent). *(partial: entity and configuration exist; no check constraints on `document_key` and `source`; no `withdrawn_at`; no writer; no migration)*
- [ ] **BE-IDN-05** `security_events` audit table. *(partial: entity, type list, check constraint and indexes configured; no migration)*
- [ ] **BE-IDN-06** Roles seed: `student`, `parent`, `admin` (reserve `tutor`, `teacher`, `school`). *(partial: `SharedKernel/Authorization/Roles.cs` holds student, parent, admin and reserves tutor, teacher, school; roles are constants plus a check constraint, not a table, so there is nothing to seed. Nothing seeds an `affiliate` role: affiliate is a profile (BE-IDN-19), and there is no Superuser role (decision 28, `roles.manage` permission instead))*
- [ ] **BE-IDN-19** Affiliate is a profile, not a role: an affiliate is a student or parent account (18 or older) with an Affiliates profile created by automatic enrolment (BE-AFF-02, decision 3b). No `affiliate` value in `Roles` or the `user_roles` check. `/me` exposes `affiliate: { status: active|suspended } | null` from `IAffiliateProfileLookup`; affiliate endpoints gate on `affiliates.use` (student and parent) plus an active-profile check in the Affiliates handlers
- [ ] **BE-IDN-07** Role to permission map (port `PermissionResolver`). *(partial: `Authentication/RolePermissions.cs` frozen map (student and parent get `account.manage`, `notifications.read`; admin gets all) and `PermissionAuthorizationHandler` exist; not registered; the catalogue in BE-IDN-65 is not yet in `Permissions.cs`)*
- [ ] **BE-IDN-65** Full permission catalogue so web and API agree: add every constant below to `SharedKernel/Authorization/Permissions.cs` and the role map in one change; the build-time OpenAPI document carries the catalogue as an `x-aptiverse-permissions` extension (role to permissions) so the web imports it instead of hand-typing strings in `nav-config.ts`; a test asserts the role map covers every constant and that admin holds all of them. Rows marked "other file" are owned by modules in the other backend half and confirmed there.

    | Permission | Student | Parent | Admin | Gates | Owner |
    |---|---|---|---|---|---|
    | `account.manage` | yes | yes | yes | `/me/*` writes | exists |
    | `notifications.read` | yes | yes | yes | `/notifications/*` | exists |
    | `audit.read` | no | no | yes | security events, admin audit | exists |
    | `support.faqs.manage` | removed | removed | removed | folded into `content.manage` (decision 9b); the constant is deleted in BE-SUP-32 | removed |
    | `academics.manage` | yes | no | yes | units, assessments, calendar, targets | academics.md |
    | `past_papers.read` | yes | no | yes | past paper list and download | academics.md |
    | `support.use` | yes | yes | yes | own tickets | support.md |
    | `support.manage` | no | no | yes | ticket queue, enquiries | support.md |
    | `content.manage` | no | no | yes | FAQs, help articles, past papers, catalog | support.md, academics.md |
    | `users.read` | no | no | yes | admin users list and detail (web nav uses it) | admin.md |
    | `users.support` | no | no | yes | resend verification, revoke sessions, unlock | admin.md |
    | `users.impersonate` | no | no | yes | impersonation | admin.md |
    | `admin.dashboard.read` | no | no | yes | admin metrics, attention list, activity | admin.md |
    | `roles.manage` | no | no | named admins only (not in the admin role map; granted per user, BE-ADM-33) | roles editor; rails: no self-edit, last holder cannot lose it (decision 28) | admin.md |
    | `billing.refund`, `billing.subscriptions.manage` | no | no | yes | refunds, subscription actions (step-up) | admin.md, billing |
    | `system.read`, `system.operate` | no | no | yes | system page; dead-letter replay, plan sync, reconciliation run | admin.md |
    | `settings.manage` | no | no | yes | admin platform settings page | admin.md |
    | `audit.export` | no | no | yes | audit export (step-up) | admin.md |
    | `affiliates.payouts.manage` | no | no | yes | payout-details review, payout batches, CSV export, mark paid (step-up) | admin.md, affiliates |
    | `billing.manage` | yes | yes | yes | own subscription, checkout, invoices (web nav uses it) | other file (billing) |
    | `billing.admin` | no | no | yes | subscriptions, payments, Paystack cockpit, plan sync (web nav uses it) | admin.md, billing |
    | `family.read` | no | yes | yes | parent views of linked children | other file (family) |
    | `family.manage` | yes | yes | yes | invites, accept, unlink, privacy | other file (family) |
    | `affiliates.use` | yes | yes | yes | affiliate area (active profile and 18 or older checked in handler) | other file (affiliates) |
    | `affiliates.manage` | no | no | yes | affiliate profiles, suspend and reinstate, terms, flagged referrals, commission reversals and adjustments | other file (affiliates), admin.md |
    | `ai.chat`, `ai.help`, `ai.spend.read` | chat, help | help | all | tutor and help bot | other file (ai-tutor) |
    | `practice.use`, `progress.read`, `wellbeing.use` | yes | no | yes | adopted with the catalogue (decision 9b) | other file |

- [ ] **BE-IDN-09** `InitialCreate` migration for the `identity` schema after BE-IDN-02 to 05, 48, 62 and 66 settle; review generated SQL (indexes, filtered uniques, checks); enable the skipped `Every_user_reference_is_a_foreign_key` architecture test for this module
- [ ] **BE-IDN-48** Move notification preference columns out of `users` before the first migration: drop `email_reminders` and `email_progress_summaries` (Notifications owns preferences, BE-NTF-06); replace `email_product_updates` with an optional `marketing_email` consent row in `user_consents`
- [ ] **BE-IDN-62** Minor status for POPIA (decision 30): `date_of_birth` captured at onboarding for every student (high school and tertiary; a first-year can be 17), not for parents (parents confirm "I am 18 or older" in their onboarding completion, stored as a consent row `adult_confirmation`). `IsMinor` is computed on read as age under 18 on today's Johannesburg date (BE-SK-51) and exposed in `/me` and `IUserProfileLookup`. Three rules depend on it: affiliate enrolment requires 18 or older (students under 18 cannot enrol, decision 31; parents qualify through their adult confirmation), Family parental consent applies under 18 (BE-FAM-14), and Billing requires an adult payer (a minor can be covered by a parent seat but cannot be the paying customer). `IUserProfileLookup` therefore also exposes `AgeBand` (`under_13`, `13_to_17`, `18_plus`, `unknown`) so modules never see the date itself. The date is classified as personal information (BE-IDN-76), never shown to parents or admins in lists, and only the boolean leaves the module
- [ ] **BE-IDN-66** Align the `User` domain with the onboarding slices: today `User.CompleteOnboarding(level, grade, yearOfStudy, curriculum, institutionName, now)` saves everything in one call. Keep it as the single completion method (used by BE-IDN-33, extended with `studyLevel`, `programme`, `institutionId`, `dateOfBirth`), and add `SetEducationLevel(level)` and `SaveOnboardingDraft(...)` for the optional step saves (BE-IDN-31, BE-IDN-32); add `CompleteParentOnboarding(now)`; change `RequiresOnboarding` to cover students and parents; add `study_level` and `programme` columns; unit tests for each method
- [ ] **BE-IDN-67** Login lockout and per-email limiting give one response shape: `LoginPerEmail` counts failures (not attempts) with the same threshold and window as Identity lockout (5 in 15 min, validated equal at startup), so a locked real account and a hammered unknown email both return `429` ProblemDetails `{ type, title, status: 429, detail: "Too many sign-in attempts. Try again in a few minutes.", code: "identity.too_many_attempts", retryAfterSeconds, traceId }` with a `Retry-After` header (remaining lockout or window); no response ever says "locked"

### Tokens and sessions

- [ ] **BE-IDN-10** ES256 key in Secrets Manager, key id, rotation support. *(partial: `SigningKeys` loads a PEM P-256 key from `Auth:SigningKey`, rejects other curves, derives `kid` from the JWK thumbprint, publishes `PreviousPublicKeys`, uses an ephemeral key only in Development or build-time OpenAPI; not registered; Secrets Manager wiring unverified (INF-16))*
- [ ] **BE-IDN-12** Access token issuer (15 min, permission claims minimal). *(partial: `AccessTokenIssuer` issues `sub`, `email`, `roles`, `sid`, `jti` with `AccessTokenMinutes = 15`; `ConfigureJwtBearerOptions` validates ES256 only with 30 s skew and checks session state; neither is registered; Host still configures a placeholder JwtBearer with no keys)*
- [ ] **BE-IDN-15** Wire authentication in the module: register `SigningKeys`, `AccessTokenIssuer`, `ConfigureJwtBearerOptions`, `PermissionAuthorizationHandler`, permission policies (BE-SK-38); remove the Host placeholder `AddJwtBearer` and the duplicate Host `AuthOptions` class (`Host/Infrastructure/ApiOptions.cs`)
- [ ] **BE-IDN-13** Refresh token issue, hash, store. *(partial: `SessionService.Start` creates the session and first refresh token (256-bit, SHA-256 hashed, sliding 7 days capped by the 30 day session); untested)*
- [ ] **BE-IDN-14** Refresh rotation with reuse detection and family revocation. *(partial: `SessionService.RotateAsync` consumes the presented token, issues the next, treats a consumed token or a lost `xmin` race as reuse, revokes the session and its tokens, writes `refresh_reuse_detected`, evicts the revocation cache; untested)*
- [ ] **BE-IDN-16** Session revocation check: register `HybridCache` and `SessionRevocationCache` (30 s entries, evicted on revoke); metric `aptiverse.identity.session_check.duration` and cache hit ratio; document the 30 s cross-instance window (no L2)
- [ ] **BE-IDN-17** Signing key rotation procedure in `api/docs/runbooks/rotate-signing-key.md`: generate a new P-256 key, move the old public key to `Auth:PreviousPublicKeys`, deploy, keep the old key for at least access token lifetime plus skew (16 min), then remove; unit test that a token signed by a previous key validates and a token signed by an unknown key fails
- [ ] **BE-IDN-18** Scheduled purge (daily `PurgeExpiredIdentityTokens` message): delete refresh tokens expired more than 30 days ago, consumed or expired one-time tokens older than 7 days, revoked or expired sessions older than 90 days (security events keep their own retention)
- [ ] **BE-IDN-40** Register the auth rate limits: `AuthRateLimiting.AddPolicies` (`identity-register` 10 per 10 min, `identity-login` 30 per 5 min, `identity-password-reset` 10 per 15 min, `identity-verification` 5 per 15 min, `identity-refresh` 120 per min, per IP or user) and `EmailRateLimiter` (login 10 per 15 min, reset 3 per 15 min per normalised email) as a singleton. *(partial: both exist uncommitted; unregistered)*
- [ ] **BE-IDN-41** Bootstrap admin seeder: `IDataSeeder` that adds the `admin` role to existing accounts listed in `Auth:BootstrapAdminEmails` (never creates accounts, idempotent, writes `role_changed` security event)

### Contracts

- [ ] **BE-IDN-42** `IUserDirectory` implementation (contact lookup, find by email, admin search with `ILIKE` on `normalized_email` and `name` using a trigram index, admin detail)
- [ ] **BE-IDN-43** `IUserProfileLookup` implementation (cached 60 s per user in HybridCache, evicted on profile or onboarding change)
- [ ] **BE-IDN-44** Planned integration events published through the outbox from the slices that cause them (`EmailVerified`, `AccountLockedOut`, `UserOnboarded`, `StudentStageChanged`, `UserProfileUpdated`, `EmailChanged`, `SessionsRevoked`, `PersonalDataExportRequested`, `AccountErasureApproved`, `UserErased`)
- [ ] **BE-IDN-61** `IIdentityAdminCommands` implementation for Admin; every command writes a security event with the admin id in `detail` and returns `Result` so Admin can audit failures

## Slices

All endpoints: groups `/auth` (anonymous unless noted) and `/me` (authenticated) with tag `Identity`. Token responses use one shape:

`AuthTokens { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, user: MeSummary }`, `MeSummary { id, name, email, emailConfirmed, roles[], onboardingRequired }`.

Ownership: `/me/*` always acts on `ICurrentUser.RequiredUserId`; ids of other users' sessions return 404. Every request DTO is trimmed; emails normalised with `ILookupNormalizer`.

### BE-IDN-11  GET /.well-known/jwks.json

| | |
|---|---|
| Operation id | `getJwks` |
| Permission | anonymous (allowlisted) |
| Entitlement | none |
| Rate limit | `default`; response `Cache-Control: public, max-age=300` |
| Idempotency | safe read |
| Metric | `aptiverse.identity.jwks.requests` (counter) |
| Log fields | none |

Response `200 { keys: [ { kty: "EC", crv: "P-256", x, y, kid, use: "sig", alg: "ES256" } ] }`: current key plus `PreviousPublicKeys`. Never contains `d`.

- [ ] **BE-IDN-11** `GET /.well-known/jwks.json` *(partial: `SigningKeys.Jwks` builds the key set; no endpoint)*
  - [ ] Endpoint
  - [ ] Response record (no request record, so no validator)
  - [ ] Handler (projection of `SigningKeys.Jwks`)
  - [ ] Unit tests: no private parameters serialised; kid equals thumbprint
  - [ ] Integration tests: 200, cache header, two keys during rotation

### BE-IDN-20  POST /auth/register

| | |
|---|---|
| Operation id | `register` |
| Permission | anonymous |
| Entitlement | none |
| Rate limit | `identity-register` (10 per 10 min per IP) |
| Idempotency | natural: unique `normalized_email`; a retry after success returns 409 |
| Metric | `aptiverse.identity.registrations` (counter, tags `role`, `method=password`), `aptiverse.identity.register.duration` (histogram) |
| Log fields | `UserId`, `Role`, `ConsentTermsVersion`, `ConsentPrivacyVersion` (never email or name) |

Request `RegisterRequest`:

| Field | Rules |
|---|---|
| name | required, trimmed 2 to 120 chars, no control characters, not only digits or symbols |
| email | required, max 256, valid address (FluentValidation `EmailAddress` plus a single `@` and a dot in the domain), lowercased domain |
| password | `PasswordPolicy` (verified in `Authentication/PasswordPolicy.cs`): 10 to 128 chars, no composition rules; must not equal the email; optional breached-password check (BE-IDN-78). The OpenAPI schema carries `minLength: 10`, `maxLength: 128` (BE-SK-62) so the generated zod schema enforces the same bounds |
| role | required, one of `Roles.SelfRegistrable` (`student`, `parent`). Affiliates register as a student or parent and then apply (BE-IDN-19) |
| acceptedTermsVersion | required, must equal `Legal:TermsVersion` |
| acceptedPrivacyVersion | required, must equal `Legal:PrivacyVersion` |
| marketingEmails | optional bool, default false; true writes a `marketing_email` consent row |

Response `201 AuthTokens` (auto-login, session `auth_method = password`). `onboardingRequired` is true for students.

Failures (stable codes the UI branches on): `400 validation` (field errors keyed `name`, `email`, `password`, `role`, plus `identity.password_rejected` from Identity validators); `409 identity.email_taken` ("An account with this email already exists. Sign in or reset your password."); `409 identity.consent_outdated` when versions do not match the current ones from `GET /legal/versions`; `429` rate limit with `Retry-After`.

Events (outbox, same transaction): `UserRegistered`, `EmailVerificationRequested` (48 h token). Security event `registered`. Two consent rows (`terms`, `privacy`, source `register`, IP and user agent from `RequestInfo`).

- [ ] **BE-IDN-20** `POST /auth/register`
  - [ ] Endpoint (`AllowAnonymous`, `RequireRateLimiting("identity-register")`, `WithValidation`)
  - [ ] `RegisterRequest`, `AuthTokens`, `MeSummary` records
  - [ ] Validator (rules above, versions from `IOptions<LegalOptions>`)
  - [ ] Handler (create user, role, consents, token issue, session start, events, one `SaveChangesAndFlushMessagesAsync`)
  - [ ] Unit tests: role allowlist rejects `admin`; consent mismatch; consent rows carry IP and user agent
  - [ ] Integration tests: happy path returns usable tokens (calls `/me`), duplicate email 409, admin role 400, rate limit 429, events delivered

### BE-IDN-21  POST /auth/login

| | |
|---|---|
| Operation id | `login` |
| Permission | anonymous |
| Rate limit | `identity-login` (30 per 5 min per IP) plus `EmailRateLimiter.TryAcquireLogin` (10 per 15 min per email) |
| Idempotency | not idempotent (each success starts a session); safe to retry on network failure (extra session is harmless and listed) |
| Metric | `aptiverse.identity.logins` (counter, tags `outcome=success|invalid|locked|rate_limited`, `method`), `aptiverse.identity.lockouts` (counter) |
| Log fields | `UserId` (on success only), `Outcome`, `SessionId` |

Request `LoginRequest`: `email` required max 256; `password` required max 128 (no min length check, so old weak passwords still sign in).

Behaviour: `SignInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true)`; lockout after `MaxFailedAccessAttempts` (5) for `LockoutMinutes` (15). Unknown email runs a dummy hash to equalise timing and counts against the per-email failure window (BE-IDN-67), so locked and unknown accounts look the same. The transition into lockout triggers one `AccountLockedOut` event per window (security email to the owner).

Response `200 AuthTokens`.

Failures: `400 validation`; `401 identity.invalid_credentials` ("The email or password is incorrect."); `429 identity.too_many_attempts` with header `Retry-After: <seconds>` and body extension `retryAfterSeconds` (shape in BE-IDN-67), returned both for a locked account and for the IP or per-email limiters.

Events: `AccountLockedOut` on the transition into lockout. Security events `login_succeeded`, `login_failed` (with attempted email), `lockout`.

- [ ] **BE-IDN-21** `POST /auth/login` with lockout
  - [ ] Endpoint
  - [ ] `LoginRequest` record
  - [ ] Validator
  - [ ] Handler (lockout-aware check, dummy hash for unknown emails, session start)
  - [ ] Unit tests: lockout transition emits one event; unknown email path calls the hasher
  - [ ] Integration tests: happy, wrong password 401, sixth attempt on a real account and on an unknown email both 429 with identical body shape and `Retry-After`, Google-only account (no password) 401

### BE-IDN-22  POST /auth/refresh

| | |
|---|---|
| Operation id | `refreshTokens` |
| Permission | anonymous (the refresh token is the credential) |
| Rate limit | `identity-refresh` (120 per min per IP) |
| Idempotency | not idempotent by design: a second use of the same refresh token is reuse and revokes the family |
| Metric | `aptiverse.identity.refreshes` (counter, tag `outcome=rotated|invalid|reuse`), `aptiverse.identity.refresh_reuse` (counter) |
| Log fields | `SessionId`, `Outcome` |

Request `RefreshRequest`: `refreshToken` required, 43 chars base64url (32 bytes).

Response `200 AuthTokens` with a new refresh token; the old one is consumed.

Failures: `400`; `401 identity.refresh_token_invalid` ("Your session has ended. Please sign in again.") for unknown, expired, revoked, reused, or session ended. Reuse writes `refresh_reuse_detected` and revokes the session.

Note for the BFF: concurrent refreshes from two tabs are reuse. The web BFF serialises refresh per session (FE task); the API stays strict.

- [ ] **BE-IDN-22** `POST /auth/refresh`
  - [ ] Endpoint
  - [ ] `RefreshRequest` record
  - [ ] Validator
  - [ ] Handler (delegates to `SessionService.RotateAsync`, issues access token)
  - [ ] Unit tests: rotation chain, expiry capped at session expiry
  - [ ] Integration tests: happy; reuse revokes family (BE-IDN-50); revoked session 401

### BE-IDN-23  POST /auth/logout

| | |
|---|---|
| Operation id | `logout` |
| Permission | authenticated (any role); session from `sid` claim |
| Rate limit | `default` |
| Idempotency | idempotent: logging out an already revoked session returns 204 |
| Metric | `aptiverse.identity.logouts` (counter) |
| Log fields | `UserId`, `SessionId` |

Request: none (body ignored). Response `204`. Revokes the current session and all its refresh tokens (family), evicts the revocation cache so the access token stops working immediately on this instance and within 30 s elsewhere. Security event `logout`.

- [ ] **BE-IDN-23** `POST /auth/logout` (revoke family)
  - [ ] Endpoint
  - [ ] No request record (no body)
  - [ ] Handler (`SessionService.RevokeAsync`, save, evict)
  - [ ] Unit tests: idempotent second call
  - [ ] Integration tests: access token rejected after logout (BE-IDN-52 style), refresh token rejected

### BE-IDN-24  POST /auth/verify-email

| | |
|---|---|
| Operation id | `verifyEmail` |
| Permission | anonymous |
| Rate limit | `identity-verification` |
| Idempotency | a consumed token returns 400 `identity.token_invalid`; an already verified account using a fresh token returns 204 |
| Metric | `aptiverse.identity.email_verifications` (counter, tag `outcome`) |
| Log fields | `UserId`, `Outcome` |

Request `VerifyEmailRequest`: `token` required, 43 chars base64url. Response `204`. Sets `email_confirmed`, consumes the token. Event `EmailVerified`; security event `email_verified`.

Failures: `400 identity.token_invalid` ("This link is invalid or has expired. Request a new one."). Links issued by the old app before cutover (old `confirm-email?userId=&token=` format and old reset links) are not migrated: the web routes them to the same invalid-link state with a "send a new link" action, and this endpoint simply never finds them (no special casing, no hint that the account exists).

- [ ] **BE-IDN-24** `POST /auth/verify-email` *(partial: `OneTimeTokens.IssueAsync` and `RedeemAsync` exist; no endpoint)*
  - [ ] Endpoint
  - [ ] Request record
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: expired, consumed, wrong purpose
  - [ ] Integration tests: happy, reused link 400

### BE-IDN-45  POST /auth/verify-email/resend

| | |
|---|---|
| Operation id | `resendVerificationEmail` |
| Permission | anonymous or authenticated |
| Rate limit | `identity-verification` plus per-email limiter |
| Idempotency | always 202; repeated calls within 60 s do not issue a new token |
| Metric | `aptiverse.identity.verification_resends` (counter) |
| Log fields | `UserId` (when found) |

Request `ResendVerificationRequest`: `email` optional when authenticated (uses the current user), required otherwise. Response `202` always (no account enumeration). Issues a new token (older ones consumed) and `EmailVerificationRequested` only when the account exists and is unverified.

- [ ] **BE-IDN-45** `POST /auth/verify-email/resend` (split from BE-IDN-24)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: unknown email, verified account, cooldown
  - [ ] Integration tests: identical 202 bodies and similar latency for existing and unknown emails

### BE-IDN-25  POST /auth/forgot-password

| | |
|---|---|
| Operation id | `forgotPassword` |
| Permission | anonymous |
| Rate limit | `identity-password-reset` (10 per 15 min per IP) plus `EmailRateLimiter.TryAcquirePasswordReset` (3 per 15 min per email) |
| Idempotency | always 202; each accepted call issues a new token and consumes older ones |
| Metric | `aptiverse.identity.password_reset_requests` (counter, tag `account_found=true|false` recorded server side only) |
| Log fields | `UserId` (when found) |

Request `ForgotPasswordRequest`: `email` required max 256. Response `202` always. When the account exists (including Google-only accounts, which can then set a password): token 60 min, event `PasswordResetRequested`, security event `password_reset_requested`. Unknown email: no event, same response, constant-time path.

- [ ] **BE-IDN-25** `POST /auth/forgot-password` (no account enumeration) *(partial: token issuing helper and per-email limiter exist)*
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: unknown email produces no outbox message
  - [ ] Integration tests: 202 for both, outbox contains one message for the real account only

### BE-IDN-26  POST /auth/reset-password

| | |
|---|---|
| Operation id | `resetPassword` |
| Permission | anonymous |
| Rate limit | `identity-password-reset` |
| Idempotency | token is single use |
| Metric | `aptiverse.identity.password_resets` (counter, tag `outcome`) |
| Log fields | `UserId`, `Outcome`, `RevokedSessions` |

Request `ResetPasswordRequest`: `token` required 43 chars; `newPassword` per `PasswordPolicy`. Response `204`. Hashes via `PasswordPolicy.HashAsync`, `ReplacePasswordHash` (new security stamp, clears lockout), revokes every session (`password_reset`), confirms the email (possession of the inbox is proven). Events `PasswordChanged(ViaReset: true)`, `SessionsRevoked`. Security event `password_reset`.

Failures: `400 identity.token_invalid` (also for old-format reset links issued before cutover, which land on the invalid-link state); `400 identity.password_rejected` with field errors.

- [ ] **BE-IDN-26** `POST /auth/reset-password` *(partial: `OneTimeTokens`, `PasswordPolicy.HashAsync`, `SessionService.RevokeAllAsync` exist)*
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: sessions revoked; lockout cleared
  - [ ] Integration tests: happy then old refresh token 401; reused token 400

### BE-IDN-27  POST /auth/google

| | |
|---|---|
| Operation id | `signInWithGoogle` |
| Permission | anonymous |
| Rate limit | `identity-login` |
| Idempotency | each success starts a session |
| Metric | `aptiverse.identity.logins` (tag `method=google`), `aptiverse.identity.google.validation_failures` (counter) |
| Log fields | `UserId`, `Outcome`, `Linked` (bool) |

Request `GoogleSignInRequest`: `idToken` required, max 4096 chars. Validation through `GoogleTokenValidator` (signature, issuer, expiry, audience in `Auth:Google:ClientIds`).

Decision: Google sign-in stays invite-only for v1, as in the old app (`OAuthAccountNotFoundException`). Reason: account creation must record role, consent versions and (for students) onboarding facts, which a bare Google token cannot carry; the register page offers "Continue with Google" only after the user has an account. Revisit if sign-up conversion data says otherwise (open question 10). Google never creates an account. If a `user_logins` row matches `sub`, sign in. Else if an account with the Google email exists and Google says `email_verified`, link (`user_logins` row, security event `google_linked`, revoke other sessions with reason `account_linked`) and sign in. Else `404 identity.account_not_found` ("No Aptiverse account uses this Google address. Create an account first.").

Response `200 AuthTokens` (`auth_method = google`).

Failures: `400`; `401 identity.google_token_invalid`; `404 identity.account_not_found`; `409 identity.google_email_unverified`; `503 identity.google_unavailable` when Google certificates cannot be fetched (resilience pipeline).

- [ ] **BE-IDN-27** `POST /auth/google` (token exchange, invite rules) *(partial: `GoogleTokenValidator` exists)*
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests with a fake `IGoogleTokenValidator`: existing link, link by verified email, unverified email, unknown
  - [ ] Integration tests: same four paths through HTTP

### BE-IDN-28  GET /me

| | |
|---|---|
| Operation id | `getMe` |
| Permission | authenticated (any role; no permission so a user with a broken role map can still see who they are) |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: no-store` |
| Metric | `aptiverse.identity.me.duration` (histogram) |
| Log fields | `UserId`, `SessionId` |

Response `200 Me`:

`{ id, name, email, emailConfirmed, pendingEmail, hasPassword, phoneNumber, dateOfBirth, adultConfirmedAt, roles[], primaryRole, permissions[], entitlements[], isMinor, onboarding: { required, completedAt, educationLevel, grade, curriculum, studyLevel, yearOfStudy, programme, institutionId, institutionName, dateOfBirth }, consent: { termsVersion, privacyVersion, reconsentRequired }, affiliate: { status } | null, deletionRequest: { id, requestedAt, scheduledErasureAt } | null, impersonation: { active, impersonatorName, expiresAt } | null, createdAt }`

`pendingEmail` is the target of an unconsumed `email_change` token (BE-IDN-49), else null; `hasPassword` is `password_hash IS NOT NULL` (Google-only accounts see "set a password" instead of "change password"); `isMinor` per BE-IDN-62 (false for parents, null while a migrated student has not given a date of birth); `onboarding.required` is true for students and parents until completed (BE-IDN-66); `dateOfBirth` is returned only to the user themself; `affiliate` from `IAffiliateProfileLookup` (null when no profile or before BE-AFF lands); `deletionRequest` is the pending request, if any (BE-IDN-36, BE-IDN-64). `permissions` from `RolePermissions.For(roles)`; `entitlements` from Billing `IEntitlementResolver` (empty array until BE-BIL-05; never null); `primaryRole` ranks admin over parent over student; `reconsentRequired` when the latest consent version differs from `GET /legal/versions` (BE-IDN-47).

Failures: `401`; `404 identity.user_not_found` if the account was erased mid-session (also revokes the session).

- [ ] **BE-IDN-28** `GET /me` (profile, roles, permissions, entitlements)
  - [ ] Endpoint, response records (no request record)
  - [ ] Handler (one query with roles, latest consents; entitlement call with 500 ms timeout falling back to empty plus a warning log)
  - [ ] Unit tests: primary role ranking; permissions union
  - [ ] Integration tests: student, parent, admin shapes; impersonation block present only during impersonation

### BE-IDN-29  GET /me/sessions

| | |
|---|---|
| Operation id | `listMySessions` |
| Permission | `account.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.identity.sessions.list.duration` |
| Log fields | `UserId`, `ResultCount` |

Response `200 SessionView[]` (active only, max 50, newest `last_seen_at` first): `{ id, authMethod, deviceLabel (parsed from user agent: browser and OS family only), ipAddressMasked (last octet zeroed), createdAt, lastSeenAt, expiresAt, current }`.

- [ ] **BE-IDN-29** `GET /me/sessions`
  - [ ] Endpoint, response record, handler (user agent parsed with a small internal parser, no third-party UA database)
  - [ ] Unit tests: IP masking for IPv4 and IPv6; current flag
  - [ ] Integration tests: lists own sessions only

### BE-IDN-30  DELETE /me/sessions/{id}

| | |
|---|---|
| Operation id | `revokeMySession` |
| Permission | `account.manage` |
| Rate limit | `default` |
| Idempotency | idempotent; already revoked returns 204 |
| Metric | `aptiverse.identity.sessions.revoked` (counter, tag `reason`) |
| Log fields | `UserId`, `SessionId`, `TargetSessionId` |

Route `id` uuid. Response `204`. Another user's session or unknown id returns `404 identity.session_not_found`. Revoking the current session behaves like logout. Security event `session_revoked`; event `SessionsRevoked`.

- [ ] **BE-IDN-30** `DELETE /me/sessions/{id}`
  - [ ] Endpoint, route binding (no body, so no request record), handler
  - [ ] Unit tests: ownership
  - [ ] Integration tests: other user's session 404 (BE-IDN-54), token of revoked session rejected

### BE-IDN-46  POST /me/sessions/revoke-others

| | |
|---|---|
| Operation id | `revokeOtherSessions` |
| Permission | `account.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.identity.sessions.revoked` (tag `reason=signed_out_remotely`) |
| Log fields | `UserId`, `SessionId`, `RevokedCount` |

Response `200 { revoked: int }`. Uses `SessionService.RevokeAllAsync(userId, signed_out_remotely, keep: current sid)`.

- [ ] **BE-IDN-46** `POST /me/sessions/revoke-others` (split from BE-IDN-30)
  - [ ] Endpoint, response record, handler
  - [ ] Integration tests: other sessions' refresh tokens fail, current survives

### Onboarding: why three slices when the domain saves in one call

`User.CompleteOnboarding` (verified in `Domain/User.cs`) takes the whole profile at once, and that stays the only way to complete. The split exists for the mobile flow: the student picks a level on one screen and details on the next, and may close the app in between, so BE-IDN-31 and BE-IDN-32 save a draft (no `onboarding_completed_at`, no events). BE-IDN-33 accepts the full profile in its body and calls the single domain method in one transaction, so a client can also skip the drafts and complete in one request. Parents complete through BE-IDN-33 with a minimal body. The domain additions are BE-IDN-66.

### BE-IDN-31  PUT /me/onboarding/level

| | |
|---|---|
| Operation id | `setEducationLevel` |
| Permission | `account.manage`; role `student` required (handler returns 403 `identity.onboarding_students_only`) |
| Rate limit | `default` |
| Idempotency | PUT, idempotent |
| Metric | `aptiverse.identity.onboarding.step` (counter, tags `step=level`, `level`) |
| Log fields | `UserId`, `EducationLevel` |

Draft save (no completion, no event before onboarding is complete). Request `SetEducationLevelRequest`: `educationLevel` in (`high_school`, `tertiary`). Changing level after completion clears the other stage's fields, sets the profile back to "details needed" for the new stage and publishes `StudentStageChanged` (Academics then flags enrolments of the other kind; never deletes them). Response `200 OnboardingState { educationLevel, grade, curriculum, studyLevel, yearOfStudy, programme, institutionId, institutionName, dateOfBirth, completedAt, missing[] }`.

Failures: `400`; `403`; `409 concurrency_conflict`.

- [ ] **BE-IDN-31** `PUT /me/onboarding/level` (high school or tertiary, draft step)
  - [ ] Endpoint, request record, validator, handler (`User.SetEducationLevel`, BE-IDN-66)
  - [ ] Unit tests: switching clears grade, curriculum or study level and programme
  - [ ] Integration tests: parent gets 403; event published on change after completion only

### BE-IDN-32  PUT /me/onboarding/details

| | |
|---|---|
| Operation id | `saveOnboardingDetails` |
| Permission | `account.manage`, role `student` |
| Rate limit | `default` |
| Idempotency | PUT, idempotent |
| Metric | `aptiverse.identity.onboarding.step` (tag `step=details`) |
| Log fields | `UserId`, `EducationLevel`, `Grade`, `StudyLevel`, `Curriculum` |

Draft save of the details for the stored level; partial values are allowed (every field optional here), rules apply to the values present. Same field rules as the completion body below. Response `200 OnboardingState` with `missing[]` listing what completion still needs.

Failures: `400` (including `identity.level_not_set`), `403`, `404 identity.institution_not_found`.

- [ ] **BE-IDN-32** `PUT /me/onboarding/details` (grade or year, curriculum, school or institution; draft step)
  - [ ] Endpoint, request record, validator (conditional rules by stored level), handler (`User.SaveOnboardingDraft`)
  - [ ] Unit tests: high school with `studyLevel` rejected; tertiary with grade rejected
  - [ ] Integration tests: both stages; unknown institution 404

### BE-IDN-33  POST /me/onboarding/complete

| | |
|---|---|
| Operation id | `completeOnboarding` |
| Permission | `account.manage`; roles `student` or `parent` |
| Rate limit | `default` |
| Idempotency | idempotent; a second call returns 200 with the same `completedAt` (later profile edits go through BE-IDN-31, BE-IDN-32 or BE-IDN-34) |
| Metric | `aptiverse.identity.onboarding.completed` (counter, tags `role`, `level`) |
| Log fields | `UserId`, `Role`, `EducationLevel` |

Request `CompleteOnboardingRequest`. Every field is optional in the body; missing fields fall back to the saved draft, and the merged profile must be complete for the role:

| Field | Student, high school | Student, tertiary | Parent |
|---|---|---|---|
| educationLevel | `high_school` | `tertiary` | must be absent |
| grade | required, 8 to 12 | must be null | absent |
| curriculum | required, `nsc` or `ieb` (decision 29) | must be null | absent |
| studyLevel | must be null | required, one of the `study_level` values; undergraduate years also set `yearOfStudy` 1 to 7, postgraduate levels leave it null | absent |
| programme | must be null | optional, 2 to 160 chars | absent |
| institutionId | must be null | optional uuid, must exist in the Academics catalog (`IInstitutionCatalog.ExistsAsync`) | absent |
| institutionName | required school name, 2 to 200 | required unless `institutionId` given (then defaults to the catalog name) | absent |
| dateOfBirth | required, age 10 to 80 on today's Johannesburg date | required, same bounds | absent |
| adultConfirmed | absent | absent | required `true` (stored as consent row `adult_confirmation`) |

Behaviour: one transaction calls `User.CompleteOnboarding` (students) or `User.CompleteParentOnboarding` (parents), then publishes `UserOnboarded` (with `IsMinor`). Response `200 OnboardingState`.

Failures: `400` field errors; `403 identity.onboarding_not_applicable` (admin); `404 identity.institution_not_found`; `409 identity.onboarding_incomplete` with the missing fields in `errors`.

- [ ] **BE-IDN-33** `POST /me/onboarding/complete` (single-call completion for students and parents)
  - [ ] Endpoint, request record, validator (role and level aware), handler (merges draft and body)
  - [ ] Unit tests: completeness per stage; postgraduate keeps `yearOfStudy` null; parent path
  - [ ] Integration tests: one-call completion without drafts; draft then complete; incomplete 409; `UserOnboarded` published once with `IsMinor`

### BE-IDN-34  PATCH /me/profile

| | |
|---|---|
| Operation id | `updateMyProfile` |
| Permission | `account.manage` |
| Rate limit | `default` |
| Idempotency | PATCH with full-field semantics for provided fields; safe to retry |
| Metric | `aptiverse.identity.profile.updates` (counter) |
| Log fields | `UserId`, `ChangedFields` (names only) |

Request `UpdateProfileRequest`: `name` optional 2 to 120; `phoneNumber` optional, null clears, E.164 `^\+[1-9]\d{7,14}$`. Email changes go through BE-IDN-49. Response `200 Me` subset. Event `UserProfileUpdated` when the name changes. Failures `400`, `409 concurrency_conflict`.

- [ ] **BE-IDN-34** `PATCH /me/profile`
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: null clears phone
  - [ ] Integration tests: happy; validation

### BE-IDN-90  PATCH /me/profile: `dateOfBirth` and `adultConfirmed` (set once)

Extends BE-IDN-34 (same endpoint, operation id `updateMyProfile`) for accounts that lack age data, mainly migrated ones (BE-IDN-62, decision 30). Settings (PG-CMN-SETTINGS-44) and the affiliate pages send users here.

| Field | Who | Rules |
|---|---|---|
| `dateOfBirth` | students | accepted only while `date_of_birth` is null; age 10 to 80 on today's Johannesburg date; once set, a correction goes through support (`users.support`, audited, same handler with `source=support`), so a minor cannot edit their way past the consent or payer rules; `409 identity.date_of_birth_already_set` otherwise |
| `adultConfirmed` | parents | `true` only, accepted only while no `adult_confirmation` consent row exists; stored as that consent row with timestamp, IP and user agent; `409 identity.adult_already_confirmed` on repeat with a different value, `200` on the same value |

Rate limit for these two fields: `identity-verification` (5 per 15 min), applied when either field is present. Metric `aptiverse.identity.age_data.set` (counter, tags `field`, `source=self|support`); log fields `UserId` and field names only, never the date. Writes `date_of_birth_set` or `adult_confirmed` to `security_events`, recomputes `IsMinor` and `AgeBand`, and publishes `UserProfileUpdated` with `AgeBandChanged` so Family (parental consent), Affiliates (18 or older) and Billing (adult payer) re-evaluate. `/me` returns `dateOfBirth` (the user's own value, null when missing) and `adultConfirmedAt` (null when not confirmed) to the account holder only; other modules still see only `IsMinor` and `AgeBand`, and the date never appears in admin lists or parent views.

- [ ] **BE-IDN-90** `PATCH /me/profile` accepts `dateOfBirth` (students, set once when missing) and `adultConfirmed` (parents, one-time); `/me` exposes `dateOfBirth` and `adultConfirmedAt`
  - [ ] Request record and validator extended (role aware: a parent sending `dateOfBirth` or a student sending `adultConfirmed` gets `400`); handler branch; support correction path on the admin user detail reuses it with `source=support`
  - [ ] Unit tests: second self-set refused; age bounds; `AgeBand` recomputed; parent confirmation idempotent
  - [ ] Integration tests: migrated student sets the date and becomes a minor (consent prompt appears); migrated parent confirms 18 or older; `UserProfileUpdated` consumed by Family, Affiliates and Billing; date never in logs

### BE-IDN-49  POST /me/email

| | |
|---|---|
| Operation id | `requestEmailChange` |
| Permission | `account.manage`; verified email required (BE-IDN-38) |
| Rate limit | `identity-verification` |
| Idempotency | a new request supersedes the previous pending change |
| Metric | `aptiverse.identity.email_change` (counter, tag `stage=requested|confirmed`) |
| Log fields | `UserId` |

Request `ChangeEmailRequest`: `newEmail` (email rules), `currentPassword` (required when the account has a password). Response `202`. Sends a confirmation link to the new address (`email_change` token, 48 h) and a notice to the old address; confirmation is `POST /auth/verify-email` with the token (handler branches on purpose), then publishes `EmailChanged` and writes `email_changed`. Failures: `400`, `401 identity.invalid_credentials`, `409 identity.email_taken` (checked again at confirmation).

- [ ] **BE-IDN-49** `POST /me/email` (change email with re-verification)
  - [ ] Endpoint, request record, validator, handler; confirmation branch in BE-IDN-24 handler
  - [ ] Unit tests: taken at confirmation time
  - [ ] Integration tests: full change flow; old address notified

### BE-IDN-35  POST /me/password

| | |
|---|---|
| Operation id | `changeMyPassword` |
| Permission | `account.manage` |
| Rate limit | `identity-login` (shares the brute-force budget) |
| Idempotency | not idempotent (second call with the old password fails) |
| Metric | `aptiverse.identity.password_changes` (counter, tag `outcome`) |
| Log fields | `UserId`, `SessionId`, `RevokedSessions` |

Request `ChangePasswordRequest`: `currentPassword` required when the account has a password (Google-only accounts set a first password without it); `newPassword` per policy, must differ from current. Response `204`. Revokes all other sessions (`password_changed`), keeps the current one, rotates security stamp. Events `PasswordChanged(ViaReset: false)`, `SessionsRevoked`. Failures `400`, `401 identity.invalid_credentials` (wrong current password also counts toward lockout).

- [ ] **BE-IDN-35** `POST /me/password` (change)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: Google-only first password
  - [ ] Integration tests: other sessions revoked, current works

### BE-IDN-47  GET /me/consents and POST /me/consents

| | |
|---|---|
| Operation id | `listMyConsents`, `acceptConsents` |
| Permission | authenticated (accepting must work even when the role map is broken) |
| Rate limit | `default` |
| Idempotency | POST is idempotent per (document, version): an existing row is not duplicated |
| Metric | `aptiverse.identity.consents.accepted` (counter, tags `document`, `source`) |
| Log fields | `UserId`, `Document`, `Version` |

GET response: `ConsentView[] { documentKey, version, acceptedAt, source, withdrawnAt }`. POST request `AcceptConsentsRequest`: `termsVersion` and `privacyVersion` must equal current config; optional `marketingEmails` bool (true accepts, false withdraws `marketing_email`). Response `204`. Source `reconsent`.

- [ ] **BE-IDN-47** consent read and re-accept (needed when legal versions change)
  - [ ] Endpoints, request and response records, validator, handlers
  - [ ] Unit tests: idempotent per version; marketing withdraw sets `withdrawn_at`
  - [ ] Integration tests: `/me` shows `reconsentRequired` after a config version bump and clears after POST

### BE-IDN-36  POST /me/deletion-request

| | |
|---|---|
| Operation id | `requestAccountDeletion` |
| Permission | `account.manage`; verified email or recent password confirmation |
| Rate limit | `default` |
| Idempotency | one pending request per user; a second call returns 200 with the existing request |
| Metric | `aptiverse.identity.deletion_requests` (counter) |
| Log fields | `UserId`, `RequestId` |

Request `RequestDeletionRequest`: `reason` optional max 1000; `currentPassword` required for password accounts (step-up); `confirm` must be the literal `DELETE`. Response `202 { requestId, requestedAt, scheduledErasureAt }` where `scheduledErasureAt` is the request time plus the cooling-off period (`Auth:DeletionCoolingOffDays`, default 14, open question 9). Sets `users.deletion_requested_at`; schedules `ProcessScheduledErasure`. Event `AccountDeletionRequested`; security event `account_deletion_requested`. During the cooling-off period the user can still sign in (to cancel); `/me.deletionRequest` drives the banner. Erasure itself is BE-IDN-60. Failures: `400`, `401 identity.invalid_credentials`.

- [ ] **BE-IDN-36** `POST /me/deletion-request` (POPIA) *(partial: `AccountDeletionRequest` entity, `User.MarkDeletionRequested` and the event exist; no endpoint, no cooling-off schedule)*
  - [ ] Endpoint, request record, validator, handler
  - [ ] Unit tests: one pending per user; schedule time from config
  - [ ] Integration tests: event published; `/me.deletionRequest` populated

### BE-IDN-64  DELETE /me/deletion-request

| | |
|---|---|
| Operation id | `cancelAccountDeletion` |
| Permission | `account.manage` |
| Rate limit | `default` |
| Idempotency | idempotent; no pending request returns 204 |
| Metric | `aptiverse.identity.deletion_requests.cancelled` (counter) |
| Log fields | `UserId`, `RequestId` |

Request: none. Response `204`. Sets the request `status = cancelled`, `cancelled_at`, clears `users.deletion_requested_at`, cancels the scheduled erasure (the handler also re-checks status, so a late-firing message is a no-op). Security event `account_deletion_cancelled` (new type). Failure `409 identity.erasure_in_progress` once erasure started.

- [ ] **BE-IDN-64** `DELETE /me/deletion-request` (cancel within the cooling-off period, split from BE-IDN-36)
  - [ ] Endpoint, handler
  - [ ] Unit tests: cancelled request ignored by the erasure processor
  - [ ] Integration tests: cancel then `/me.deletionRequest` is null; cancel after erasure start 409

### BE-IDN-63  GET /legal/versions

| | |
|---|---|
| Operation id | `getLegalVersions` |
| Permission | anonymous (allowlisted) |
| Rate limit | `default`; `Cache-Control: public, max-age=300` |
| Idempotency | safe read |
| Metric | `aptiverse.identity.legal_versions.requests` (counter) |
| Log fields | none |

Response `200 { termsVersion, privacyVersion, termsUrl, privacyUrl, effectiveFrom }` from `LegalOptions` (extended with URLs and the effective date). The register page reads it to send `acceptedTermsVersion` and `acceptedPrivacyVersion`; the re-consent screen compares it with `/me.consent`.

- [ ] **BE-IDN-63** `GET /legal/versions` (current terms and privacy versions)
  - [ ] Endpoint (group `/legal`, tag `Identity`), response record, handler
  - [ ] `LegalOptions` gains `TermsUrl`, `PrivacyUrl`, `EffectiveFrom` with `ValidateOnStart`
  - [ ] Integration tests: anonymous 200, values match configuration

### BE-IDN-37  POST /me/export and GET /me/export/{id}

| | |
|---|---|
| Operation id | `requestDataExport`, `getDataExport` |
| Permission | `account.manage`; verified email required |
| Rate limit | `exports` (BE-SK-47); at most one export per 24 h per user |
| Idempotency | a queued or running export is returned instead of creating another |
| Metric | `aptiverse.identity.exports` (counter, tag `outcome`), `aptiverse.identity.export.duration` (histogram, s) |
| Log fields | `UserId`, `ExportId`, `Status`, `SectionCount` |

POST response `202 { exportId, status }`. A `BuildPersonalDataExport` Wolverine message calls every module's `IPersonalDataExporter` (BE-SK-60), writes one JSON document (sections per module, ISO dates, no internal ids of other users) to the exports bucket (SSE-KMS), status `ready`, and emails a link (`PersonalDataExportReady` via Notifications). GET returns status and, when ready, a 5 minute presigned URL. Failures: `404` other user's export, `410 identity.export_expired`, `429`.

The original task said `GET /me/export`; the queued design needs a POST to start and a GET by id (recorded here, same task ID).

- [ ] **BE-IDN-37** POPIA data export, queued
  - [ ] Endpoints, request and response records, validator, handlers
  - [ ] `data_export_requests` table and migration
  - [ ] Export builder message handler with per-module timeout and partial-failure status
  - [ ] Unit tests: one export per 24 h
  - [ ] Integration tests: export contains Identity section; other user 404

### BE-IDN-69  POST /auth/step-up

| | |
|---|---|
| Operation id | `stepUpAuthentication` |
| Permission | authenticated (any role) |
| Rate limit | `identity-login` (shares the brute-force budget and lockout) |
| Idempotency | each success refreshes the step-up time |
| Metric | `aptiverse.identity.step_up` (counter, tag `outcome`) |
| Log fields | `UserId`, `SessionId`, `Outcome` |

Request `StepUpRequest`: `password` (password accounts) or `googleIdToken` (Google-only accounts), exactly one. Response `200 { stepUpExpiresAt }`. Sets `sessions.step_up_at` (new column, timestamptz null). A `RequireRecentAuthentication(TimeSpan)` endpoint filter (default 5 min) returns `403 identity.step_up_required` with extension `stepUpUrl: "/auth/step-up"` when the session's `step_up_at` is older; used by admin refunds, payout mark-paid, impersonation start, role changes (BE-ADM-33), account deletion and email change. Impersonation sessions can never step up. Security event `step_up` (new type).

- [ ] **BE-IDN-69** step-up re-authentication for sensitive actions
  - [ ] `sessions.step_up_at` column; `RequireRecentAuthentication` filter in the module, exposed through a Contracts-free endpoint extension registered by Identity
  - [ ] Endpoint, request record, validator (exactly one credential), handler
  - [ ] Unit tests: window maths with `FakeClock`; impersonation session rejected
  - [ ] Integration tests: protected admin action 403 before, 200 after step-up, 403 again after 5 min

### BE-IDN-68  GET /me/security-history

| | |
|---|---|
| Operation id | `listMySecurityHistory` |
| Permission | `account.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.identity.security_history.list.duration` |
| Log fields | `UserId`, `ResultCount` |

Request (query): `cursor` optional (BE-SK-58), `limit` 1 to 50. Response `CursorPage<SecurityHistoryItem> { type, occurredAt, deviceLabel, ipAddressMasked, actor: self|admin|system, detail }`, newest first, for the user's own events of the last 12 months. Impersonation by an admin shows as `impersonation_started` and `impersonation_ended` with `actor = admin` and the admin's display name ("Aptiverse support"), so the target can always see that support viewed the account. Failed logins against the user's email appear with the attempted time only.

- [ ] **BE-IDN-68** `GET /me/security-history` (own security events, including impersonation)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Unit tests: actor mapping; masking
  - [ ] Integration tests: impersonation events visible to the target; other users' events never returned

## Cross-cutting slices

- [ ] **BE-IDN-38** Verified-email requirement policy for sensitive actions: `RequireVerifiedEmail()` endpoint filter reading `email_confirmed` (cached with the profile, BE-IDN-43); denied returns `403 identity.email_unverified` ("Verify your email to do this."); applied to email change, data export and family invites. Decision: it does not gate checkout or deletion, so paid sign-up works before the inbox is checked (Paystack collects and receipts to the email anyway) and a user who lost their inbox can still delete their account with their password
- [ ] **BE-IDN-39** Security event writes (login, failed login, password change, session revoke). *(partial: only `refresh_reuse_detected` is written today, in `SessionService`)*; add a `SecurityEventWriter` used by every slice above so each event type in `SecurityEventTypes.All` has a writer and a test
- [ ] **BE-IDN-60** Account erasure processor: on `AccountErasureApproved` (admin approval or cooling-off expiry, scheduled message at `scheduled_erasure_at`), revoke all sessions, delete logins, consume tokens, anonymise `users` (`email = erased+<id>@invalid.aptiverse`, `name = "Deleted user"`, nulls for phone, date of birth, programme, institution, password hash), set `erased_at`, keep consents and security events (legal basis: evidence), publish `UserErased`; every module's `IPersonalDataEraser` runs from its own `UserErased` handler

## Background work

| Message | Trigger | Handler | Notes |
|---|---|---|---|
| `PurgeExpiredIdentityTokens` | scheduled daily 02:00 SAST | BE-IDN-18 | batches of 1000 |
| `BuildPersonalDataExport` | from BE-IDN-37 | builds export, uploads, publishes `PersonalDataExportReady` | retries 3 then `failed` |
| `ProcessScheduledErasure` | scheduled at `scheduled_erasure_at` per request | BE-IDN-60 | cancelled requests are skipped |
| `ExpireDataExports` | scheduled daily | marks `ready` rows past `expires_at` as `expired` | S3 lifecycle deletes objects |

Replaces old polling: none in Identity (the old `LastWellbeingReminderAt` reminder state moves to Wellbeing).

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | credential stuffing on login, stolen refresh tokens, forged Google tokens | lockout, IP and per-email limits, refresh reuse detection, Google audience check, ES256 only | BE-IDN-21, BE-IDN-40, BE-IDN-14, BE-IDN-27 |
| Tampering | role escalation through register, editing another user's profile | allowlisted roles, `/me` routes never take a user id | BE-IDN-20, BE-IDN-54 |
| Repudiation | disputed logins, password changes, deletions | append-only `security_events` with IP and user agent; consent evidence rows | BE-IDN-39 |
| Information disclosure | account enumeration via register, login, reset, resend; tokens in logs | identical responses and timing for reset and resend; register enumeration accepted with rate limit (open question 1); token redaction | BE-IDN-25, BE-IDN-45, BE-SK-78 |
| Denial of service | password hashing cost under flood, refresh storms | rate limits before hashing, per-email limiter, `identity-refresh` policy | BE-IDN-40 |
| Elevation of privilege | admin self-registration, impersonation abuse | admin only via bootstrap seeder or admin action; impersonation time-boxed and audited (BE-ADM-10) | BE-IDN-41, BE-IDN-19 |

- [ ] **BE-IDN-70** Write `api/docs/security/threat-model-identity.md` from the table above, including token lifetimes, cookie handling in the BFF, and the 30 s revocation window
- [ ] **BE-IDN-55** OWASP ASVS L1 auth checklist (V2 authentication, V3 session management, V4 access control) filled in `api/docs/security/asvs-identity.md` with evidence links to tests

### Authorisation and ownership tests

- [ ] **BE-IDN-54** Integration: cross-user access attempts return 403 or 404 (session ids of another user, export ids, deletion request ids); role tests: parents and admins cannot call the student onboarding steps (BE-IDN-31, BE-IDN-32) and admins cannot complete onboarding; non-admin cannot reach any admin command through HTTP
- [ ] **BE-IDN-71** Integration: every `/me` and `/auth` endpoint in the generated negative suite (BE-SK-71) has its expected anonymous behaviour asserted (allowlisted anonymous routes listed explicitly)

### Input limits

- [ ] **BE-IDN-72** Limits enforced and tested: request bodies under 8 KB (identity endpoints override BE-SK-46 down), names 120, emails 256, passwords 128 (bcrypt-style long password DoS avoided), Google id token 4096, reasons 1000; oversize returns 413 or 400 field errors

### Rate limits

- [ ] **BE-IDN-53** Integration: auth rate limits trip (register, login per IP, login per email, reset per email, verification, refresh) with 429, `Retry-After` and `traceId`; limits read from `Auth:RateLimits` so tests set small values

### Idempotency and concurrency

- [ ] **BE-IDN-73** Concurrency tests: two simultaneous refreshes of one token revoke the family (exercises the `xmin` race path in `SessionService.RotateAsync`); simultaneous onboarding PUTs with a stale version return 409 `concurrency_conflict`; register with the same email twice in parallel yields one 201 and one 409 (unique index plus BE-SK-44)

### Resilience

- [ ] **BE-IDN-74** Google certificate fetch through `AddAptiverseHttpClient` (BE-SK-24) with 5 s timeout and 2 retries; failure maps to 503 `identity.google_unavailable`; password and refresh paths have no outbound dependency
- [ ] **BE-IDN-75** Entitlement lookup in `/me` degrades: Billing failure or timeout (500 ms) returns `entitlements: []` and a `degraded: ["entitlements"]` marker, never a 500

### Data retention and POPIA

- [ ] **BE-IDN-76** Classify every column with BE-SK-59: contact (`email`, `normalized_email`, `phone_number`, `name`), identifier (`provider_key`), education (`education_level`, `grade`, `year_of_study`, `curriculum`, `institution_*`), age (`date_of_birth`, highest sensitivity in this module), network (`ip_address`, `user_agent` on sessions, consents, security events), secret (`password_hash`, `security_stamp`, token hashes, never exported)
- [ ] **BE-IDN-77** Retention: sessions 90 days after end, refresh and one-time tokens per BE-IDN-18, security events 2 years then IP and user agent nulled, consents for the life of the account plus 5 years (evidence), deletion requests 5 years, exports 7 days; scheduled jobs implement each and HRD-35 references them
- [ ] **BE-IDN-56** Export coverage: Identity's `IPersonalDataExporter` returns profile, roles, consents, sessions (masked), security events of the user; erasure covered by BE-IDN-60; test that both run for a seeded user
- [ ] **BE-IDN-78** Breached password screening (optional, recommended by ASVS 2.1.7): k-anonymity range query to Pwned Passwords with 2 s timeout, fail open with a metric; or a local top 100 000 list embedded; decided in open question 2

### Audit

- [ ] **BE-IDN-79** Every security event type has a writer and a test (BE-IDN-39); admin commands record the admin id; the admin audit viewer reads security events through `IIdentityAdminCommands.ListSecurityEventsAsync` (BE-ADM-09)

### Observability

- [ ] **BE-IDN-80** Metrics (names above per slice) plus `aptiverse.identity.active_sessions` (gauge, sampled every 5 min); alerts: **login failure ratio above 30 percent for 10 min**, **refresh reuse above 5 in 10 min**, **lockouts above 20 in 10 min**, **register 5xx above 1 percent for 5 min**, **JWKS or signing key load failure at boot** (crash loop alert)
- [ ] **BE-IDN-81** Spans `Identity.Register`, `Identity.Login`, `Identity.Refresh` with attributes `aptiverse.auth.method`, `aptiverse.auth.outcome` (no email); password hashing time recorded as a child span to watch PBKDF2 cost

### Performance budgets

- [ ] **BE-IDN-82** Budgets (p95): login and register under 400 ms (PBKDF2 at 100 000 iterations dominates; measured on Graviton), refresh under 80 ms, `/me` under 60 ms, session check overhead under 5 ms with cache hit; query plans checked for `normalized_email` lookup, `token_hash` lookup and `(user_id, revoked_at)` session listing (BE-SK-83)

### Migration safety

- [ ] **BE-IDN-83** First migration is additive only; later changes (`replaced_by_token_id`, `date_of_birth`, `study_level`, `programme`, `institution_id`, new check values) ship as expand steps; widening a check constraint is done by drop-and-add inside one migration with `NOT VALID` then `VALIDATE CONSTRAINT` to avoid long locks; rollback notes in each migration
- [ ] **BE-IDN-84** ETL rehearsal (MIG-03) proves old password hashes verify with Identity 10 (`PasswordHasher` v3 compatibility) and that `SecurityStamp` carries over; one rehearsal logs in as 20 sampled users with known test passwords on the restored snapshot

### SLO contribution

- [ ] **BE-IDN-85** Identity SLIs: login success availability (non-5xx on `/auth/login`) 99.9 percent monthly, refresh availability 99.9 percent, p95 targets above; a failing refresh logs every user out, so refresh errors page immediately (OBS alert severity high)

### Load and failure tests

- [ ] **BE-IDN-50** Integration: refresh reuse revokes family
- [ ] **BE-IDN-51** Integration: lockout after N failures (N = `MaxFailedAccessAttempts`, lockout ends after `LockoutMinutes` using `FakeClock`)
- [ ] **BE-IDN-52** Integration: expired access token rejected (issue with a past `IClock`), and a token of a revoked session rejected within the cache window
- [ ] **BE-IDN-57** Integration: forgot and reset password end to end, no enumeration, token single use
- [ ] **BE-IDN-58** Integration: Google sign-in linking rules (fake validator)
- [ ] **BE-IDN-59** Integration: onboarding stage invariant (a student is high school or tertiary, never both; database check constraint rejects a forced bad row)
- [ ] **BE-IDN-86** k6 (with HRD-10): login at 20 rps and refresh at 200 rps for 10 min against staging; p95 within budget, CPU under 70 percent
- [ ] **BE-IDN-87** Failure drill: rotate the signing key in staging with the documented runbook while k6 refreshes run; zero 401s for valid sessions
- [ ] **BE-IDN-88** Failure drill: Billing unavailable, `/me` still returns 200 with empty entitlements (BE-IDN-75)
- [ ] **BE-IDN-89** Security regression suite in CI: JWT `alg=none`, HS256 with the public key as secret, expired, wrong audience, wrong issuer, missing `sid`, all rejected

## Old data mapping

Source: old `identity` and `auth` schemas at `43f9faa` (`api/Migrations/ApplicationDbContextModelSnapshot.cs`, including `identity.user_consents` from `20260722120524_AddUserConsents`). Feeds MIG-02, MIG-03, MIG-04.

| Old table.column | New | Transform |
|---|---|---|
| `identity.users.id` (text) | `users.id` | new Guid v7, old id kept in the MIG lookup table |
| `users.email`, `normalized_email`, `email_confirmed` | same | unchanged; duplicate normalised emails (if any) fail the rehearsal and are resolved by hand |
| `users.password_hash`, `security_stamp` | same | copied as is (Identity v3 hash format) |
| `users.lockout_enabled`, `lockout_end`, `access_failed_count` | same | `lockout_end` cleared at cutover |
| `users.first_name`, `last_name` | `name` | `trim(first || ' ' || last)`, truncated to 120 |
| `users.phone_number` | `phone_number` | kept only if it parses as E.164 (SA numbers starting `0` become `+27`) |
| `users.education_level` | `education_level` | lowercased; `primary` (if present) becomes null and the account is flagged (no primary stage in v1) |
| `users.grade` | `grade` | only when 8 to 12 and high school |
| `users.curriculum_id` (`nsc`, `ieb`) | `curriculum` | copied as is (`nsc`, `ieb`; decision 29) |
| `users.institution_id` (slug), `users.school` | `institution_id`, `institution_name` | slug mapped through the Academics institution lookup; `school` text to `institution_name` for high school |
| year of study | `study_level`, `year_of_study` | not stored on old users; `study_level` taken from the most common `student_courses.level` at 43f9faa (same vocabulary), `year_of_study` derived for undergraduate levels (`first_year` to 1 and so on), else null |
| date of birth | `date_of_birth` | not stored in the old app; null after migration, so `isMinor` is unknown and students are asked on first sign-in (onboarding `missing` includes it) |
| `users.email_notifications`, `push_notifications`, `assessment_due_*`, `study_group_email_reminders`, `wellbeing_checkin_reminders`, `weekly_study_summary` | Notifications `notification_preferences` | see notifications.md |
| `users.two_factor_enabled`, `phone_number_confirmed`, `concurrency_stamp`, `user_name`, `normalized_user_name` | dropped | no 2FA in v1 |
| `identity.roles`, `user_roles` | `user_roles` | `Student` to `student`, `Parent` to `parent`, `Admin` to `admin`, `Superuser` to `admin` plus the `roles.manage` permission (admin.md BE-ADM-33, decision 28); `Affiliate` is not a role (BE-IDN-19): the account keeps its other role and gets an Affiliates profile, affiliate-only accounts per open question 7; `Tutor`, `Teacher`, `SchoolAdmin` not migrated (reserved roles; affected accounts listed for a decision, open question 6) |
| `identity.user_logins` | `user_logins` | `LoginProvider = Google` to `google`, `provider_key` unchanged |
| `identity.user_tokens`, `user_claims`, `role_claims` | dropped | |
| `identity.user_consents` (43f9faa) | `user_consents` | `document_type` to `document_key`, `document_version` to `version`, `accepted_at_utc` to `accepted_at`, source kept, IP and user agent kept (MIG-04 "unchanged") |
| `auth.students`, `parents`, `admins`, `superusers` | dropped | roles carry the meaning |
| `auth.parent_links`, `auth.student_parents` | Family | see BE-FAM (other backlog file) |
| Redis refresh tokens | not migrated | every user signs in again after cutover (announced in CUT) |
| `audit.audit_logs` rows with auth actions | `security_events` (login, password) or Admin `audit_entries` | mapping by `action_id` category, see admin.md |

## Tests

- Unit (`tests/Aptiverse.Identity.UnitTests`): password policy, role permissions, primary role, session rotation and reuse, one-time tokens, signing keys and JWKS, consent idempotency, onboarding rules per stage, erasure anonymisation.
- Integration: BE-IDN-50 to BE-IDN-54, BE-IDN-57 to BE-IDN-59, BE-IDN-73, BE-IDN-89, plus each slice's happy, validation, forbidden and not found cases listed above.
- Contract: `openapi/v1.json` diff reviewed for every token response change (the BFF depends on it).

## Open questions

1. Register enumerates accounts through 409 `identity.email_taken`. Accept (with the strict `identity-register` limit), or switch to "check your email" plus no auto-login? The plan requires auto-login, so 409 is assumed.
2. Breached-password screening: external k-anonymity API (data leaves af-south-1, only a 5 char hash prefix) or an embedded list? BE-IDN-78 is optional until decided.
3. Decided (9b): the catalogue in BE-IDN-65 is adopted, with `support.faqs.manage` folded into `content.manage`, affiliate admin split into `affiliates.manage` and `affiliates.payouts.manage`, and `roles.manage` held by named admins (decision 28).
4. Decided (29): the column stays `curriculum` and stores the exam body, `nsc` or `ieb`; CAPS is the curriculum both follow.
5. Decided (30): full date of birth for every student, adult confirmation for parents (BE-IDN-62); migrated accounts set it once through `PATCH /me/profile` (BE-IDN-90).
6. Decided (61): old accounts that only hold `Tutor`, `Teacher` or `SchoolAdmin` roles migrate as student or parent where the data allows; the rest are migrated disabled and hidden until Phase 12, and listed in the rehearsal report.
7. Decided (61, 3b): affiliate-only accounts (old role `Affiliate` with no student or parent role) migrate as `parent` accounts with onboarding marked complete and an active affiliate profile.
8. Should a student be able to switch education level after onboarding from settings, or only through support? BE-IDN-31 allows it and publishes `StudentStageChanged`.
9. Decided (38): deletion cooling-off is 14 days (`Auth:DeletionCoolingOffDays`), during which the user can sign in and cancel.
10. Google sign-in is invite-only (decision recorded in BE-IDN-27). Revisit after launch if sign-up drop-off at the register form is high; creating accounts from Google would need a follow-up screen for role, consents and date of birth.
11. Study levels follow the old app (First year, Second year, Third year, Fourth year, Honours, Masters, PhD; no NQF levels). Five and six year degrees (MBChB, BVSc) have no level for years 5 and 6; add `fifth_year` and `sixth_year`?
