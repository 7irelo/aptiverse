# Admin module

| | |
|---|---|
| ID range | `BE-ADM-01` to `BE-ADM-13` (original), `BE-ADM-14` to `BE-ADM-46` (splits and additions), `BE-ADM-60` to `BE-ADM-79` (production readiness) |
| Schema | `admin` (audit trail, impersonation records, platform settings, metric projections, exports, access log; no copies of other modules' tables) |
| Projects | `src/Modules/Admin/Aptiverse.Admin`, `src/Modules/Admin/Aptiverse.Admin.Contracts`, `tests/Aptiverse.Admin.UnitTests` |
| Phase | 9 (audit trail and settings contract pulled forward to Phase 2 and 6 where other modules need them) |
| Consumes | `Aptiverse.Identity.Contracts` (`IUserDirectory`, `IIdentityAdminCommands`, `UserRegistered`, `UserOnboarded`, `UserErased`), `Aptiverse.Billing.Contracts` (admin billing queries and commands, `PaymentSucceeded`, `PaymentFailed`, `SubscriptionRenewed`, `RefundIssued`), `Aptiverse.AiTutor.Contracts` (`IAiSpendReport`, `AiUsageRecorded`), `Aptiverse.Support.Contracts` (`ISupportAdminQueries`), `Aptiverse.Academics.Contracts` (`IInstitutionCatalog`, learning events), `Aptiverse.Practice.Contracts` (`PracticeAttemptGraded`), `Aptiverse.Affiliates.Contracts` (admin queries and commands) |
| Publishes | `ImpersonationStarted`, `ImpersonationEnded`, `PlatformSettingChanged`; implements `IPlatformSettings` (read by every module for runtime pauses) and consumes `AdminActionRecorded` from every module |
| Depends on | BE-IDN-61, BE-IDN-69 (step-up), BE-IDN-68, BE-SK-45, BE-SK-58, BE-SK-61, BE-BIL-05 and the Billing admin contract (other backend file), BE-AI-57 |
| Status | Not started (0 of 65 tasks). No Admin project exists |

## Responsibilities and out of scope

Responsible for:

- Admin read models: overview metrics, attention list, users list and detail drawer, subscriptions, payments, invoices, reconciliation, AI spend, schools and enquiries (delegating to the owning modules through contracts).
- Support actions on accounts (resend verification, revoke sessions, unlock), the roles editor with its rails, impersonation (time-boxed, read-only, audited, visible to the target).
- The platform audit trail (port of the old `IAuditTrail`, including failed attempts on sensitive actions), its viewer and export.
- Platform settings with runtime pauses (refunds, AI generation, payout runs), contacts and budget figures.
- Operations views: system health, outbox depth, dead letters with replay and discard, live activity stream.

Out of scope:

- Owning business data: Admin never writes another module's tables. Refunds, subscription actions, payouts and affiliate decisions run in Billing and Affiliates through their contracts; Admin adds step-up, settings checks and audit around them.
- A separate admin identity system (admins are Identity accounts with the `admin` role).
- Grafana dashboards and alert rules (OBS).

## Data model

Schema `admin`. Platform columns on every table unless marked append-only.

### audit_entries (append-only, BE-ADM-30)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| occurred_at | timestamptz | no | index `(occurred_at desc, id desc)` for the viewer cursor |
| actor_user_id | uuid | yes | null for system actors; index `(actor_user_id, occurred_at desc)` |
| actor_email | varchar(256) | yes | stored for the "actor email" filter (admins only; erased users replaced by `erased`) |
| actor_kind | varchar(16) | no | check `actor_kind IN ('admin','user','system','impersonator')` |
| source_module | varchar(32) | no | `admin`, `billing`, `identity`, `support`, `academics`, `affiliates` |
| action | varchar(64) | no | dotted verb, for example `user.roles_changed`, `billing.refund_requested`; index |
| category | varchar(24) | no | check over `users`, `billing`, `content`, `support`, `affiliates`, `system`, `settings`, `impersonation`, `security` |
| severity | varchar(16) | no | check `severity IN ('info','warning','critical')`; index `(category, severity, occurred_at desc)` |
| outcome | varchar(16) | no | check `outcome IN ('succeeded','failed','denied')` (failed attempts on sensitive actions are recorded, as in the old app) |
| entity_type | varchar(48) | yes | index `(entity_type, entity_id)` |
| entity_id | varchar(64) | yes | |
| subject_user_id | uuid | yes | the person the action concerns (for the user drawer's last 10 entries); index `(subject_user_id, occurred_at desc)` |
| reason | varchar(500) | yes | required for sensitive actions (refund, roles, impersonation, replay) |
| before_summary | jsonb | yes | redacted field summary, max 8 KB, never secrets, card numbers or payout account numbers |
| after_summary | jsonb | yes | same rules |
| error_code | varchar(64) | yes | for failed outcomes |
| trace_id | varchar(64) | yes | links to traces |
| ip_address | varchar(64) | yes | |
| user_agent | varchar(512) | yes | |
| impersonation_id | uuid | yes | FK `impersonation_sessions.id` restrict; index; set when the actor was impersonating |
| dedupe_key | uuid | no | unique; from the publishing module so redelivery never doubles a row |

No updates, no soft delete; retention by partition drop (BE-ADM-71).

### impersonation_sessions (BE-ADM-10)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| admin_user_id | uuid | no | index `(admin_user_id, started_at desc)` |
| target_user_id | uuid | no | index `(target_user_id, started_at desc)` |
| reason | varchar(500) | no | 10 to 500 chars |
| started_at | timestamptz | no | |
| expires_at | timestamptz | no | check `expires_at <= started_at + interval '30 minutes'` |
| ended_at | timestamptz | yes | |
| end_reason | varchar(16) | yes | check `end_reason IN ('admin_ended','expired','admin_signed_out','target_erased')` |
| identity_session_id | uuid | no | the Identity session issued for the impersonation (`auth_method = impersonation`); unique |
| admin_session_id | uuid | no | the admin's own session (revoking it ends the impersonation) |
| check | | | `admin_user_id <> target_user_id`; partial unique `(admin_user_id)` filtered `ended_at IS NULL` (one live impersonation per admin) |

### platform_settings (BE-ADM-37)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| key | varchar(64) | no | unique; check over the registered keys below |
| value | jsonb | no | validated against the key's schema in code |
| updated_by_user_id | uuid | yes | |
| note | varchar(500) | yes | why it changed |

Keys (defaults in code when no row exists):

| Key | Type | Default | Read by |
|---|---|---|---|
| `contacts.support_inbox` | email | `support@aptiverse.co.za` | Support (BE-SUP-12) |
| `contacts.contact_form_to` | email | support inbox | Support |
| `contacts.safeguarding_leads` | email list (1 to 5) | none (required in Production before launch) | Support (BE-SUP-23) |
| `pause.refunds` | `{ paused: bool, message }` | not paused | Billing refunds, Admin BE-ADM-07 |
| `pause.ai_generation` | `{ paused: bool, message }` | not paused | Practice generation, AiTutor |
| `pause.payout_runs` | `{ paused: bool, message }` | not paused | Affiliates payout batches |
| `pause.signups` | `{ paused: bool, message }` | not paused | Identity register (emergency only) |
| `ai.monthly_budget` | `{ amountMicros, currency: "USD" }` | none | Admin AI spend page, alert threshold (HRD-52) |
| `approvals.refund_threshold_cents` | int or null | null (second approval off) | BE-ADM-40 |
| `approvals.payout_threshold_cents` | int or null | null | BE-ADM-40 |
| `ai.usd_zar_rate` | object `{ rate, asOf }` | `{ rate: 18.50, asOf: <seed date> }` | BE-ADM-08 |
| `banner.maintenance` | `{ enabled, message, startsAt, endsAt }` | disabled | web shell through `/me` or a public endpoint (open question 6) |

Every change is audited with before and after values (category `settings`).

### daily_metrics (projection, BE-ADM-14)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| metric_date | date | no | SAST date; unique `(metric_date, metric_key, dimension)` |
| metric_key | varchar(48) | no | `signups`, `onboarded`, `active_students`, `payments_succeeded`, `payments_failed`, `revenue_cents`, `refunds_cents`, `ai_cost_usd_micros` |
| dimension | varchar(48) | no | `all`, a role, a stage, a plan code |
| value | bigint | no | |

Upserted by event handlers; rebuildable from source modules by a backfill command (BE-ADM-14).

### user_activity_days (projection, BE-ADM-14)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique `(user_id, activity_date)` |
| activity_date | date | no | index for "active in last 7 or 30 days" counts |
| kinds | varchar(64) | no | comma set of `practice`, `assessment`, `tutor`, `goal` |

Upserted on learning events (open question 4 on the active definition); deleted on `UserErased`; rows older than 400 days purged.

### activity_events (append-only, BE-ADM-39)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| occurred_at | timestamptz | no | index `(occurred_at desc)` |
| actor_label | varchar(80) | no | masked ("Student in Grade 11", "Parent", "Admin L. D."), never a full name or email |
| action | varchar(48) | no | `signed_up`, `onboarded`, `payment_succeeded`, `practice_completed`, `assessment_graded`, `ticket_opened` |
| summary | varchar(200) | no | |
| module | varchar(32) | no | |

Kept 7 days.

### audit_exports (BE-ADM-26)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| requested_by_user_id | uuid | no | index |
| filters | jsonb | no | the viewer filters used |
| reason | varchar(500) | no | |
| status | varchar(16) | no | check `status IN ('queued','running','ready','failed','expired')` |
| row_count | integer | yes | max 100 000 per export |
| s3_key | varchar(512) | yes | exports bucket, SSE-KMS, CSV |
| expires_at | timestamptz | yes | ready plus 24 h |

### admin_access_log (append-only, BE-ADM-42)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| admin_user_id | uuid | no | index `(admin_user_id, occurred_at desc)` |
| occurred_at | timestamptz | no | |
| operation_id | varchar(64) | no | for example `getAdminAttention`, `getContactEnquiry`, `revealPayoutDetails` |
| subject_user_ids | uuid[] | no | users whose personal data was returned; GIN index for "who looked at me" queries |
| fields_revealed | varchar(200) | yes | for example `email_full` |

### approval_requests (optional, BE-ADM-40)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| kind | varchar(16) | no | check `kind IN ('refund','payout_batch')` |
| requested_by_user_id | uuid | no | |
| payload | jsonb | no | the exact command to run (amount, reference) |
| amount_cents | bigint | no | |
| status | varchar(16) | no | check `status IN ('pending','approved','rejected','expired','executed','failed')` |
| decided_by_user_id | uuid | yes | check `decided_by_user_id <> requested_by_user_id` |
| decided_at | timestamptz | yes | |
| expires_at | timestamptz | no | requested plus 24 h |

## Contracts

`Aptiverse.Admin.Contracts`:

```
// Every module publishes this through its outbox for admin or sensitive actions (port of IAuditTrail)
public sealed record AdminActionRecorded(Guid DedupeKey, DateTimeOffset OccurredAt, Guid? ActorUserId, string ActorKind,
    string SourceModule, string Action, string Category, string Severity, string Outcome,
    string? EntityType, string? EntityId, Guid? SubjectUserId, string? Reason,
    IReadOnlyDictionary<string, string?>? Before, IReadOnlyDictionary<string, string?>? After,
    string? ErrorCode, string? TraceId, string? IpAddress, string? UserAgent, Guid? ImpersonationId);

public sealed record ImpersonationStarted(Guid ImpersonationId, Guid AdminUserId, Guid TargetUserId, Guid IdentitySessionId, DateTimeOffset ExpiresAt, DateTimeOffset OccurredAt);
public sealed record ImpersonationEnded(Guid ImpersonationId, Guid TargetUserId, string EndReason, DateTimeOffset OccurredAt);
public sealed record PlatformSettingChanged(string Key, DateTimeOffset OccurredAt);

public interface IPlatformSettings      // cached 30 s, evicted on PlatformSettingChanged
{
    Task<PauseState> GetPauseAsync(string pauseKey, CancellationToken ct);           // "pause.refunds", "pause.ai_generation", ...
    Task<T?> GetAsync<T>(string key, CancellationToken ct);
}
public sealed record PauseState(bool Paused, string? Message);
```

Consumed contract shapes (owned elsewhere; listed so dependencies are explicit; the Billing and Affiliates files define them):

- Billing: `IBillingAdminQueries` (subscriptions, payments, invoices, reconciliation runs and items, Paystack status, balance, transactions, settlements, customer lookup, "pays for" and "member of" per user, failed payments list, MRR at list price) and `IBillingAdminCommands` (refund, subscription action, resend invoice, resolve drift item, run reconciliation, plan sync).
- Affiliates: `IAffiliatesAdminQueries` and `IAffiliatesAdminCommands` (profile suspend and reinstate, payout-details review, flagged referral clear or block, payout batch generate, export, mark paid, cancel, commission reversal, adjustment entry, payout details reveal; there is no application decision, enrolment is automatic, decision 3b).
- AiTutor: `IAiSpendReport.GetAsync(from, to)` (exists in ai-tutor.md, BE-AI-57).
- Identity: `IUserDirectory`, `IIdentityAdminCommands` (identity.md).
- Support: `ISupportAdminQueries` (support.md).

## Foundation tasks

- [ ] **BE-ADM-01** Module, `admin` schema (read models only): projects, `AdminDbContext`, design-time factory
- [ ] **BE-ADM-44** `AdminModule` registration, add to `Aptiverse.slnx`, Host, Worker, Dockerfile, `ArchitectureTests/Modules.cs`; migrations for the tables above; every admin route under group `/admin` with tag `Admin`
- [ ] **BE-ADM-45** Admin permission catalogue (feeds BE-IDN-65; names follow the admin page specs): `admin.dashboard.read`, `users.read`, `users.support`, `users.impersonate`, `roles.manage` (named admins only, BE-ADM-33; decision 28), `billing.admin` (read), `billing.refund`, `billing.subscriptions.manage`, `ai.spend.read`, `support.manage` (pages call it `support.tickets.manage`; `support.manage` is the one name, decision 9b), `content.manage` (absorbs `support.faqs.manage`, decision 9b), `affiliates.manage` (profiles, suspend and reinstate, terms, flagged referrals, reversals and adjustments), `affiliates.payouts.manage` (payout-details review, payout batches, CSV export, mark paid), `system.read`, `system.operate`, `settings.manage`, `audit.read`, `audit.export`; v1 grants all of them to `admin` except `roles.manage`, which is granted only to named admins
- [ ] **BE-ADM-30** Audit trail (port of `IAuditTrail`, 43f9faa `Services/Audit/AuditTrail.cs`): `audit_entries` table, `AdminActionRecordedHandler` (public Wolverine handler, idempotent on `dedupe_key`), an internal `AuditWriter` for Admin's own actions that writes in the same transaction as the action, and a helper in each consuming module that publishes `AdminActionRecorded` for failures too (refund attempts that Paystack rejects are recorded with `outcome = failed`)
- [ ] **BE-ADM-14** Metric projections: `daily_metrics` and `user_activity_days` handlers on `UserRegistered`, `UserOnboarded`, `PaymentSucceeded`, `PaymentFailed`, `RefundIssued`, `AiUsageRecorded`, `PracticeAttemptGraded`, `AssessmentCreated`, `AssessmentGraded`; idempotent upserts keyed by event dedupe; a `backfill-admin-metrics` JasperFx command rebuilds a date range from source contracts
- [ ] **BE-ADM-37** Platform settings store: `platform_settings` table, key registry with JSON schemas, `IPlatformSettings` implementation (HybridCache 30 s, evicted on `PlatformSettingChanged` in-process), and the runtime pause checks wired in the owning modules (Billing refunds, Practice generation and AiTutor, Affiliates payout runs, Identity register) returning `503` ProblemDetails `code = "<area>.paused"` with the configured message
- [ ] **BE-ADM-42** Admin access log: `admin_access_log` writer used by every endpoint that returns another user's contact details or sensitive data (attention list, user detail, full email reveal, payout details reveal); the user's own export (BE-IDN-37) includes "admin views of my data" from it
- [ ] **BE-ADM-43** POPIA for admin data: `IPersonalDataExporter` (audit entries where the user is subject, impersonation sessions targeting them, access log entries naming them) and `IPersonalDataEraser` on `UserErased` (audit entries keep ids for legal accountability but `actor_email` is replaced with `erased` and IP and user agent nulled; activity rows and activity days deleted; impersonations kept with target id only)
- [ ] **BE-ADM-28** Impersonation read-only and privacy enforcement (SharedKernel endpoint filter, registered globally): an impersonation access token carries `act` (admin id) and `imp` (impersonation id) claims; any non-GET request with such a token returns `403` `impersonation_read_only` and is audited (exceptions: `POST /admin/impersonations/{id}/end` and `POST /auth/logout`); endpoints marked `.PrivateDuringImpersonation()` (diary content, mood notes, tutor conversations and messages; owned by Wellbeing and AiTutor in the other backend file) return `403` `impersonation_private`; an architecture test lists every endpoint carrying the marker so the privacy set is reviewed
- [ ] **BE-ADM-29** Impersonation expiry and visibility: the access token `exp` never exceeds the impersonation `expires_at` and refresh is refused for impersonation sessions (token level); `ImpersonationExpiry` scheduled message revokes the Identity session at `expires_at` (API level); `/me.impersonation.expiresAt` drives the countdown banner (UI level); Identity writes `impersonation_started` and `impersonation_ended` security events on the target so they appear in the target's security history (BE-IDN-68)
- [ ] **BE-ADM-40** Second-admin approval above R2 000 (decision 54): built but off (threshold null) until there are two admins; when `approvals.refund_threshold_cents` or `approvals.payout_threshold_cents` is set, refunds and payout mark-paid above it create an `approval_requests` row instead of executing; another admin approves (step-up required) and the stored command executes; requester cannot approve; expires after 24 h; every step audited
- [ ] **BE-ADM-46** Approval endpoints for BE-ADM-40 (live only while a threshold is set; with thresholds null they return `404 admin.approvals_disabled`): `GET /admin/approvals?status=pending` (permission `billing.refund` or `affiliates.payouts.manage` matching `kind`), `POST /admin/approvals/{id}/approve` and `POST /admin/approvals/{id}/reject` (`reason` 10 to 500), both step-up and `Idempotency-Key`. Approve runs the stored command in the same transaction that moves the row to `approved` then `executed` (or `failed` with the provider error); `409 admin.approval_self` when the requester tries to decide, `409 admin.approval_not_pending` when expired or decided. Nothing reaches Billing (BE-BIL-57) or Affiliates until approval, so their statuses do not change; the admin payment and payout views show "Waiting for a second admin" from the `approval_requests` row (`pendingApprovalId` joined into BE-ADM-07 and the affiliate batch view). A notification goes to every other holder of the permission. Integration tests: below threshold executes directly; above threshold returns `202` and executes only after a second admin approves; requester approve refused; expiry after 24 h leaves nothing charged

## Slices

All routes under `/admin`, tag `Admin`. Every slice requires an admin permission; there is no ownership filter (admins see platform data), so authorisation tests focus on permission and step-up. Responses never include password hashes, tokens, full card numbers or payout account numbers.

### BE-ADM-02  GET /admin/metrics

| | |
|---|---|
| Operation id | `getAdminMetrics` |
| Permission | `admin.dashboard.read` |
| Rate limit | `default` |
| Idempotency | safe read; cached 60 s |
| Metric | `aptiverse.admin.metrics.get.duration` (histogram) |
| Log fields | `AdminUserId`, `RangeDays`, `CacheHit` |

Request (query): `range` `7d`, `30d` (default) or `90d`. Response `200`:

`{ asOf, accounts: { total, byRole: { student, parent, admin }, byStage: { high_school, tertiary, not_onboarded } }, signups: { total, series[] }, activeStudents: { last7d, last30d, definition }, paying: { liveSubscriptions, pastDue, cancelled, mrrListPriceCents, currency: "ZAR", mrrNote }, aiSpend: { monthToDateUsdMicros, budgetUsdMicros | null }, operations: { outboxPending, oldestPendingSeconds, deadLetters, auditEventsLast24h }, support: { awaitingSupport, safeguardingOpen }, schools: { enquiriesTotal, enquiriesUncontacted } }`

Every figure is a real count (as the old `AdminController.GetOverview`): MRR is the list price of the plan behind each live subscription with annual plans divided by 12, discounts and failed renewals not modelled, and `mrrNote` says so. Counts come from contracts (Identity accounts, Billing subscriptions and MRR, AiTutor spend, Support counts) and the projections; a failing source returns that block as `null` with `degraded: [source]`, never zeros.

- [ ] **BE-ADM-02** `GET /admin/metrics` (signups, active, paying, AI spend; real counts)
  - [ ] Endpoint, request and response records, validator, handler (parallel contract calls with 1 s budget each)
  - [ ] Unit tests: MRR annual division (from Billing fixture); degraded block is null not zero
  - [ ] Integration tests: counts match seeded data; student 403

### BE-ADM-34  GET /admin/attention

| | |
|---|---|
| Operation id | `getAdminAttention` |
| Permission | `admin.dashboard.read` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.admin.attention.items` (histogram, tag `kind`) |
| Log fields | `AdminUserId`, `Kind`, `ResultCount` |

Request (query): `kind` `stuck` or `failed_payments`; `limit` 1 to 25 (default 10). Stuck users (from `IUserDirectory` and projections): `email_unverified_24h`, `onboarding_incomplete_48h`, `locked_out`, `bounced_email` (Notifications deliverability), `no_activity_14d_after_onboarding`. Failed payments from `IBillingAdminQueries.ListFailedPaymentsAsync`. Response items carry minimised fields (`userId`, `displayName`, `emailMasked`, `role`, `stage`, `reason`, `since`) or (`paymentId`, `userId`, `displayName`, `amountCents`, `currency`, `failureReason`, `attemptedAt`, `subscriptionState`) plus `total`. Each call writes one `admin_access_log` row listing the returned user ids.

- [ ] **BE-ADM-34** dashboard attention list (stuck users, failed payments)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: each reason appears for seeded fixtures; access log row written

### BE-ADM-39  GET /admin/activity and GET /admin/activity/stream

| | |
|---|---|
| Operation id | `listAdminActivity`, `streamAdminActivity` |
| Permission | `admin.dashboard.read` |
| Rate limit | `default`; at most 3 concurrent streams per admin |
| Idempotency | safe |
| Metric | `aptiverse.admin.activity.streams` (gauge), `aptiverse.admin.activity.events` (counter, tag `action`) |
| Log fields | `AdminUserId`, `StreamId` |

`GET /admin/activity?take=30` returns the latest `activity_events`. The SSE stream (`text/event-stream`, heartbeat every 25 s) pushes new events. Fan-out across API instances uses Postgres `LISTEN/NOTIFY` on channel `admin_activity` (the handler that inserts the row issues `NOTIFY`), so no connection polls the database (the old Insights SSE polled every 5 s per connection and streamed to teachers; this replaces it and is admin only, FIX-07). Event payloads carry masked labels only.

- [ ] **BE-ADM-39** platform live activity for admins (list and SSE)
  - [ ] Activity projection handlers, `activity_events` table, LISTEN/NOTIFY broadcaster hosted service
  - [ ] Endpoints, response records, handlers
  - [ ] Integration tests: an event published reaches an open stream within 2 s; student 403

### BE-ADM-03  GET /admin/users

| | |
|---|---|
| Operation id | `adminListUsers` |
| Permission | `users.read` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.admin.users.list.duration` |
| Log fields | `AdminUserId`, `FilterKeys`, `ResultCount` (never the search text) |

Request (query) `AdminListUsersRequest`: `q` 2 to 80 (name or email), `role`, `stage` (`high_school`, `tertiary`, `not_onboarded`), `emailConfirmed`, `locked`, `plan` (plan code through Billing), `createdFrom`, `createdTo`, `sort` (`created_desc` default, `last_seen_desc`, `name`), `page`, `pageSize` max 100. Response `PagedResult<AdminUserRow>` (`IUserDirectory.SearchAsync` plus plan codes from Billing in one batch call).

- [ ] **BE-ADM-03** `GET /admin/users` (search, filters)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: filters; parent 403

### BE-ADM-15  GET /admin/users/{id}

| | |
|---|---|
| Operation id | `adminGetUser` |
| Permission | `users.read` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.admin.users.get.duration` |
| Log fields | `AdminUserId`, `SubjectUserId` |

Response `200 AdminUserDrawer`: Identity detail (`IUserDirectory.GetAdminDetailAsync`: profile, roles, stage, onboarding, sessions count, recent security events, consents, deletion request), billing relationships (`paysFor[]`: subscriptions the user pays for with plan, status and member count; `memberOf[]`: subscriptions that cover the user and who pays), affiliate profile status, open support tickets count, the last 10 `audit_entries` where the user is subject or actor, and impersonation history (last 5). Writes an access log row. Failures `404`.

- [ ] **BE-ADM-15** user detail for the drawer (split from BE-ADM-03)
  - [ ] Endpoint, response records, handler (parallel contract calls, partial `degraded` list)
  - [ ] Integration tests: pays for versus member of for a parent and a covered child

### BE-ADM-04  POST /admin/users/{id}/resend-verification

| | |
|---|---|
| Operation id | `adminResendVerification` |
| Permission | `users.support` |
| Rate limit | `default` (5 per hour per subject) |
| Idempotency | repeated calls within 5 min return 202 without a new email |
| Metric | `aptiverse.admin.support_actions` (counter, tag `action=resend_verification`, `outcome`) |
| Log fields | `AdminUserId`, `SubjectUserId`, `Outcome` |

Request `SupportActionRequest`: `reason` 10 to 500. Calls `IIdentityAdminCommands.ResendVerificationAsync`. Response `202 { auditEventId }`. Failures `404`, `409 identity.email_already_verified`. Audited with outcome (including failures).

- [ ] **BE-ADM-04** resend verification (split from the original three support actions)
  - [ ] Endpoint, request record, validator, handler; integration tests (email captured, audit row)

### BE-ADM-16  POST /admin/users/{id}/revoke-sessions

| | |
|---|---|
| Operation id | `adminRevokeUserSessions` |
| Permission | `users.support` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.admin.support_actions` (tag `action=revoke_sessions`) |
| Log fields | `AdminUserId`, `SubjectUserId`, `Revoked` |

Request: `reason` 10 to 500. Response `200 { revoked, auditEventId }`. Cannot target yourself (`400 admin.self_action`).

- [ ] **BE-ADM-16** revoke all sessions of a user
  - [ ] Endpoint, request record, validator, handler; integration tests (target's refresh fails)

### BE-ADM-17  POST /admin/users/{id}/unlock

| | |
|---|---|
| Operation id | `adminUnlockUser` |
| Permission | `users.support` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.admin.support_actions` (tag `action=unlock`) |
| Log fields | `AdminUserId`, `SubjectUserId` |

Request: `reason`. Clears `lockout_end` and `access_failed_count` and resets the per-email limiter window. Response `200 { auditEventId }`.

- [ ] **BE-ADM-17** unlock an account
  - [ ] Endpoint, request record, validator, handler; integration test (login works after unlock)

### BE-ADM-33  GET /admin/roles and PUT /admin/users/{id}/roles

| | |
|---|---|
| Operation id | `adminListAssignableRoles`, `adminSetUserRoles` |
| Permission | `users.read` for GET; `roles.manage` for PUT plus step-up (BE-IDN-69) |
| Rate limit | `default` |
| Idempotency | PUT sets the full role set; unchanged set returns 204 |
| Metric | `aptiverse.admin.roles.changes` (counter, tags `privileged`, `outcome`) |
| Log fields | `AdminUserId`, `SubjectUserId`, `Added`, `Removed`, `Outcome` |

GET returns `{ name, label, privileged }` for assignable roles so the UI never offers a role the server rejects. PUT request: `roles` (full set) and `reason` 10 to 500. Rails ported from the old `AdminController.SetUserRoles`: (1) you cannot change your own roles (`400 admin.self_role_change`); (2) granting or removing `admin` or the `roles.manage` permission needs `roles.manage` (`403 admin.roles_manage_required`); (3) editing an account that already holds `admin` or `roles.manage` needs `roles.manage`; (4) the last holder of `roles.manage` cannot lose it (`409 admin.last_roles_manager`). v1 assignable set: the `admin` role and the `roles.manage` permission (decision 28); `student` and `parent` are chosen at sign-up and not edited here; affiliate is a profile, not a role (BE-IDN-19), and enrolment is automatic with payout-details review as the only gate (decision 3b, BE-AFF-03), so it is never edited here. Every attempt is audited, privileged changes at `warning`, denials included. Changing roles revokes the subject's sessions so new claims apply.

- [ ] **BE-ADM-33** roles editor with rails
  - [ ] `IIdentityAdminCommands.SetRolesAsync` and assignable roles query in Identity
  - [ ] Endpoints, request and response records, validator, handler
  - [ ] Unit tests: each rail
  - [ ] Integration tests: self change 400; plain admin granting admin 403; last `roles.manage` holder 409; audit rows for denials

### BE-ADM-05  GET /admin/subscriptions

| | |
|---|---|
| Operation id | `adminListSubscriptions` |
| Permission | `billing.admin` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.admin.billing.subscriptions.list.duration` |
| Log fields | `AdminUserId`, `Filters`, `ResultCount` |

Request: `status`, `planCode`, `q` (owner email or name), `cursor`, `limit` max 100. Response rows: subscription id, owner (name, masked email), plan, interval, status, list price, last charge, next charge, card brand and last four, renewal attempts, member count (`IBillingAdminQueries`).

- [ ] **BE-ADM-05** `GET /admin/subscriptions`
  - [ ] Endpoint, request and response records, validator, handler, integration test

### BE-ADM-18  GET /admin/payments

| | |
|---|---|
| Operation id | `adminListPayments` |
| Permission | `billing.admin` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.admin.billing.payments.list.duration` |
| Log fields | `AdminUserId`, `Filters`, `ResultCount` |

Request: `status`, `from`, `to`, `q` (reference or email), `cursor`, `limit`. Rows: payment id, Paystack reference, user, amount in cents and currency, status, failure reason, paid at, refunded cents.

- [ ] **BE-ADM-18** `GET /admin/payments` (split from BE-ADM-05)
  - [ ] Endpoint, records, validator, handler, integration test

### BE-ADM-19  GET /admin/invoices, GET /admin/invoices/{id}/pdf, POST /admin/invoices/{id}/resend

| | |
|---|---|
| Operation id | `adminListInvoices`, `adminGetInvoicePdf`, `adminResendInvoice` |
| Permission | `billing.admin` |
| Rate limit | `default`; resend 5 per hour per invoice |
| Idempotency | reads safe; resend not idempotent (deduped within 10 min) |
| Metric | `aptiverse.admin.billing.invoices.resent` (counter) |
| Log fields | `AdminUserId`, `InvoiceId` |

List filters `q`, `status`, `month`, `cursor`; rows `{ id, number, customerName, issuedAt, subtotalCents, vatCents, totalCents, status }`. PDF returns a 60 s presigned URL (reuses the BE-BIL-18 renderer). Resend takes `reason` and returns `{ auditEventId, sentTo (masked) }`.

- [ ] **BE-ADM-19** admin invoices list, PDF and resend
  - [ ] Endpoints, records, validators, handlers (through `IBillingAdminQueries` and commands), integration tests

### BE-ADM-24  GET /admin/billing/reconciliation/runs/latest and GET /admin/billing/reconciliation/items

| | |
|---|---|
| Operation id | `adminGetLatestReconciliationRun`, `adminListReconciliationItems` |
| Permission | `billing.admin` |
| Rate limit | `default` |
| Idempotency | safe reads |
| Metric | `aptiverse.admin.billing.reconciliation.reads` (counter) |
| Log fields | `AdminUserId` |

Run: `{ runId, startedAt, finishedAt, status, checkedCount, openItems }`. Items: `status` filter, cursor; rows `{ id, type (missing_in_aptiverse, missing_in_paystack, amount_mismatch, status_mismatch, refund_mismatch), reference, aptiverseValue, paystackValue, detectedAt, status }` (read side of BE-BIL-22).

- [ ] **BE-ADM-24** reconciliation reads
  - [ ] Endpoints, records, validator, handlers, integration tests

### BE-ADM-25  POST /admin/billing/reconciliation/items/{id}/resolve and POST /admin/billing/reconciliation/runs

| | |
|---|---|
| Operation id | `adminResolveReconciliationItem`, `adminRunReconciliation` |
| Permission | `billing.admin` for resolve; `system.operate` for run now |
| Rate limit | run now 1 per 10 min |
| Idempotency | resolve idempotent (409 if already resolved with a different resolution); run returns `409` while a run is in progress |
| Metric | `aptiverse.admin.billing.reconciliation.actions` (counter, tag `action`) |
| Log fields | `AdminUserId`, `ItemId` or `RunId` |

Resolve body: `resolution` (`fixed_in_aptiverse`, `fixed_in_paystack`, `expected`, `wont_fix`), `note` 10 to 500. Run body: `reason`. Both audited.

- [ ] **BE-ADM-25** reconciliation actions
  - [ ] Endpoints, request records, validators, handlers, integration tests

### BE-ADM-06  GET /admin/paystack/status and GET /admin/paystack/balance

| | |
|---|---|
| Operation id | `adminGetPaystackStatus`, `adminGetPaystackBalance` |
| Permission | `billing.admin` |
| Rate limit | `default` (balance cached 60 s; Paystack has its own limits) |
| Idempotency | safe reads |
| Metric | `aptiverse.admin.paystack.calls` (counter, tags `endpoint`, `outcome`) |
| Log fields | `AdminUserId`, `Endpoint`, `Outcome` |

Status: key mode (test or live), webhook inbox lag, last webhook received, API reachability and latency. Balance: available and pending per currency in cents. Paystack failures return `503 admin.paystack_unavailable` with the cached value if under 10 min old.

- [ ] **BE-ADM-06** Paystack cockpit: status and balance (transactions, settlements and customer lookup split to BE-ADM-20 to 22)
  - [ ] Endpoints, records, handlers, integration tests with a Paystack fake

### BE-ADM-20  GET /admin/paystack/transactions

| | |
|---|---|
| Operation id | `adminListPaystackTransactions` |
| Permission | `billing.admin` |
| Rate limit | `default` |
| Idempotency | safe |
| Metric | `aptiverse.admin.paystack.calls` (tag `endpoint=transactions`) |
| Log fields | `AdminUserId`, `Page` |

Query: `status`, `from`, `to`, `page` (Paystack paging), `perPage` max 100. Rows mapped to cents and local payment ids when known.

- [ ] **BE-ADM-20** Paystack transactions
  - [ ] Endpoint, records, validator, handler, integration test

### BE-ADM-21  GET /admin/paystack/settlements

| | |
|---|---|
| Operation id | `adminListPaystackSettlements` |
| Permission | `billing.admin` |
| Rate limit | `default` |
| Idempotency | safe |
| Metric | `aptiverse.admin.paystack.calls` (tag `endpoint=settlements`) |
| Log fields | `AdminUserId` |

- [ ] **BE-ADM-21** Paystack settlements
  - [ ] Endpoint, records, validator, handler, integration test

### BE-ADM-22  GET /admin/paystack/customer

| | |
|---|---|
| Operation id | `adminLookupPaystackCustomer` |
| Permission | `billing.admin` |
| Rate limit | `default` |
| Idempotency | safe |
| Metric | `aptiverse.admin.paystack.calls` (tag `endpoint=customer`) |
| Log fields | `AdminUserId` (never the email searched) |

Query: `email` or `customerCode` (exactly one). Returns the Paystack customer, their subscriptions and authorisations (brand, last four, expiry), linked Aptiverse user if any. Access logged.

- [ ] **BE-ADM-22** Paystack customer lookup
  - [ ] Endpoint, records, validator, handler, integration test

### BE-ADM-07  POST /admin/billing/refunds

| | |
|---|---|
| Operation id | `adminRefundPayment` |
| Permission | `billing.refund` plus step-up (BE-IDN-69) |
| Rate limit | `default` (10 per hour per admin) |
| Idempotency | `Idempotency-Key` required; Billing also dedupes on the payment reference and amount |
| Metric | `aptiverse.admin.refunds` (counter, tags `outcome`, `approval_required`), `aptiverse.admin.refunds.amount_cents` (histogram) |
| Log fields | `AdminUserId`, `PaymentId`, `AmountCents`, `Outcome` |

Request: `paymentId`, `amountCents` (1 to the refundable remainder), `reason` 10 to 500, `customerNote` optional. Checks `pause.refunds` (`503 billing.refunds_paused`), then the approval threshold (BE-ADM-40, returns `202 { approvalRequestId }`), else calls `IBillingAdminCommands.RefundAsync`. Response `200 { refundId, status, auditEventId }`. Paystack rejection returns `422 billing.refund_rejected` and is audited with `outcome = failed` (old behaviour kept).

- [ ] **BE-ADM-07** refund action, audited including failures (subscription actions split to BE-ADM-23)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: no step-up 403; paused 503; Paystack failure audited; replay with the same key returns the first result

### BE-ADM-23  POST /admin/billing/subscriptions/{code}/actions

| | |
|---|---|
| Operation id | `adminSubscriptionAction` |
| Permission | `billing.subscriptions.manage` plus step-up |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key`; repeating the same action on a subscription already in the target state returns 200 |
| Metric | `aptiverse.admin.subscription_actions` (counter, tags `action`, `outcome`) |
| Log fields | `AdminUserId`, `SubscriptionCode`, `Action`, `Outcome` |

Body: `action` (`enable`, `disable`, `cancel_at_period_end`, `cancel_now`, `send_update_card_link`), `reason`. Through Billing commands; audited including failures.

- [ ] **BE-ADM-23** subscription actions (split from BE-ADM-07)
  - [ ] Endpoint, request record, validator, handler, integration tests

### BE-ADM-08  GET /admin/ai-spend

| | |
|---|---|
| Operation id | `adminGetAiSpend` |
| Permission | `ai.spend.read` |
| Rate limit | `default`; cached 5 min |
| Idempotency | safe read |
| Metric | `aptiverse.admin.ai_spend.get.duration` |
| Log fields | `AdminUserId`, `From`, `To` |

Query: `from`, `to` (max 366 days), `groupBy` (`day`, `use_case`, `model`). Response from `IAiSpendReport`: totals in USD micros as stored (Anthropic bills in USD), plus `zarEstimateCents` on every total and series point, `zarRate` (ZAR per USD, decimal) and `zarRateAsOf` (date), cost per generated test, budget from `ai.monthly_budget` with month-to-date percentage (decision 55). The rate comes from the platform setting `ai.usd_zar_rate` (`{ rate, asOf }`, edited on the admin settings page, BE-ADM-37); no live FX feed in v1. If `asOf` is older than 45 days the response carries `zarRateStale: true` and the page says so. ZAR figures are labelled estimates and never feed billing.

- [ ] **BE-ADM-08** `GET /admin/ai-spend`
  - [ ] Endpoint, records, validator, handler, integration test with a fake report
  - [ ] `ai.usd_zar_rate` setting registered in the BE-ADM-37 key registry (schema: rate 1 to 100, `asOf` date); unit test for the ZAR estimate rounding (half up to whole cents) and the stale flag

### BE-ADM-09  GET /admin/audit and GET /admin/audit/actions

| | |
|---|---|
| Operation id | `adminListAudit`, `adminListAuditActions` |
| Permission | `audit.read` |
| Rate limit | `default` |
| Idempotency | safe reads |
| Metric | `aptiverse.admin.audit.list.duration` |
| Log fields | `AdminUserId`, `FilterKeys`, `ResultCount` |

Query: `category`, `severity` (repeatable), `outcome`, `action`, `entityType`, `entityId`, `actorEmail` (exact or prefix, 3 to 256), `subjectUserId`, `from`, `to` (max 400 days), `includeSecurityEvents` (merges Identity security events through `IIdentityAdminCommands.ListSecurityEventsAsync`), `cursor`, `limit` max 100. Rows show redacted before and after summaries. `GET /admin/audit/actions` returns the distinct recorded actions with counts (for the filter dropdown), cached 10 min.

- [ ] **BE-ADM-09** `GET /admin/audit` viewer with filters (severity, category, entity type, actor email, distinct actions)
  - [ ] Endpoints, records, validator, handlers (keyset over `(occurred_at desc, id desc)`)
  - [ ] Integration tests: each filter; security events merged in time order

### BE-ADM-26  POST /admin/audit/export and GET /admin/audit/export/{id}

| | |
|---|---|
| Operation id | `adminRequestAuditExport`, `adminGetAuditExport` |
| Permission | `audit.export` plus step-up |
| Rate limit | `exports` (3 per day per admin) |
| Idempotency | an identical pending export is returned |
| Metric | `aptiverse.admin.audit.exports` (counter, tag `outcome`), `aptiverse.admin.audit.export.rows` (histogram) |
| Log fields | `AdminUserId`, `ExportId`, `RowCount` |

POST body: the viewer filters plus `reason` 10 to 500; response `202 { exportId }`. A `BuildAuditExport` message writes CSV (UTF-8, ISO timestamps, redacted summaries) to the exports bucket. GET returns status and a 60 s presigned URL when ready. The export itself is audited.

- [ ] **BE-ADM-26** audit log export
  - [ ] Endpoints, records, validators, handlers, export message handler
  - [ ] Integration tests: export row count matches filters; no step-up 403

### BE-ADM-10  POST /admin/impersonations

| | |
|---|---|
| Operation id | `adminStartImpersonation` |
| Permission | `users.impersonate` plus step-up |
| Rate limit | `default` (10 per day per admin) |
| Idempotency | one live impersonation per admin (`409 admin.impersonation_active`) |
| Metric | `aptiverse.admin.impersonations.started` (counter), `aptiverse.admin.impersonations.duration` (histogram, s) |
| Log fields | `AdminUserId`, `TargetUserId`, `ImpersonationId`, `DurationMinutes` |

Body: `targetUserId`, `reason` 10 to 500, `durationMinutes` 5 to 30 (default 15). Refused for admins as targets (`403 admin.cannot_impersonate_admin`) and for erased or deletion-pending accounts. Calls `IIdentityAdminCommands.StartImpersonationAsync` which issues a separate session (`auth_method = impersonation`, `impersonator_user_id` set) and an access token with `act` and `imp` claims and no refresh token. Response `201 { impersonationId, accessToken, expiresAt }` (the BFF stores it in a separate impersonation cookie and restores the admin session on end). Publishes `ImpersonationStarted`; audited at `warning`; target security history shows it (BE-ADM-29).

- [ ] **BE-ADM-10** impersonation start: time-boxed, audited, banner flag in `/me`
  - [ ] `impersonation_sessions` table, endpoint, request record, validator, handler
  - [ ] Integration tests: no step-up 403; second start 409; token rejected after expiry; write request 403 `impersonation_read_only`; diary read 403 `impersonation_private` (with the Wellbeing fake endpoint marker)

### BE-ADM-27  POST /admin/impersonations/{id}/end

| | |
|---|---|
| Operation id | `adminEndImpersonation` |
| Permission | the impersonating admin (impersonation token or the admin's own session) |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.admin.impersonations.ended` (counter, tag `end_reason`) |
| Log fields | `AdminUserId`, `ImpersonationId`, `EndReason` |

Revokes the impersonation session, sets `ended_at`, publishes `ImpersonationEnded`, audits. Also triggered by expiry (scheduled message) and by the admin's own session ending.

- [ ] **BE-ADM-27** impersonation end and auto-expiry
  - [ ] Endpoint, handler, `ImpersonationExpiry` scheduled handler, integration tests

### BE-ADM-11  Schools, institutions, school enquiries read

The enquiry endpoints live in Support (`GET /support/admin/school-enquiries`, `PATCH /support/admin/school-enquiries/{id}` for status changes including undoing "contacted", status counts, BE-SUP-27; contact enquiries BE-SUP-25). Admin adds:

| | |
|---|---|
| Operation id | `adminListInstitutions`, `adminSchoolsOverview` |
| Permission | `support.manage` for enquiries data, `content.manage` for institutions |
| Rate limit | `default` |
| Metric | `aptiverse.admin.schools.get.duration` |
| Log fields | `AdminUserId` |

`GET /admin/schools/overview` returns counts per enquiry status (from `ISupportAdminQueries`) and the number of students per institution and per school name (aggregates from `IUserDirectory`, no names of students). Institution edits are BE-ACA-71. There is no `school` entity in v1 (the role is reserved).

- [ ] **BE-ADM-11** schools and institutions overview (enquiry list and status changes delegated to BE-SUP-27)
  - [ ] Endpoint, records, handler, integration test

### BE-ADM-12  Affiliate admin read surface

One owner per command: every affiliate admin command (profile suspend and reinstate, payout-details review, flagged referrals clear or block, payout batch generate, export, mark paid, cancel, commission reversal, adjustment entries, payout details reveal) is owned by the Affiliates module under `/affiliates/admin/*` (BE-AFF tasks in the other backend file), gated by `affiliates.manage` or `affiliates.payouts.manage` plus step-up. Enrolment is automatic (decision 3b), so there is no application queue. BE-ADM-12 is only the admin read surface: owed totals and pending counts on the dashboard and user drawer (through `IAffiliatesAdminQueries`) with links to those Affiliates routes, plus the shared concerns Admin provides to them: `pause.payout_runs` through `IPlatformSettings`, the approval threshold (BE-ADM-40), audit ingestion (`AdminActionRecorded`) and access logging.

- [ ] **BE-ADM-12** Affiliate admin read surface (suspend and reinstate, payout-details review, flagged referrals, payout batches and reversals are commands owned by BE-AFF under `/affiliates/admin`)
  - [ ] Dashboard and drawer figures from `IAffiliatesAdminQueries` (owed, held, payout details awaiting review, flagged referrals, referrals whose 12-month attribution ends in the next 30 days)
  - [ ] Confirm with the Affiliates file that its admin commands publish `AdminActionRecorded`, check `pause.payout_runs` and BE-ADM-40, require step-up for payout actions and write `admin_access_log` on payout details reveal (`fields_revealed = payout_details`)
  - [ ] Integration test: dashboard affiliate block degrades to null when Affiliates is unavailable

### BE-ADM-31  Affiliate adjustment entries (owned by Affiliates, `POST /affiliates/admin/{id}/adjustments`)

| | |
|---|---|
| Operation id | `addAffiliateAdjustment` (Affiliates module) |
| Permission | `affiliates.payouts.manage` plus step-up |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key` required |
| Metric | `aptiverse.admin.affiliates.adjustments` (counter, tag `direction`) |
| Log fields | `AdminUserId`, `AffiliateId`, `AmountCents` |

Body: `amountCents` (non-zero, positive credit or negative debit, absolute value up to R50 000), `reason` 10 to 500, `relatedCommissionEntryId` optional. Appends an adjustment row to the commission ledger through `IAffiliatesAdminCommands.AddAdjustmentAsync` (the ledger stays append-only; this covers reversals after a payout was already made, which the page spec needs). Audited at `warning`. The ledger entry type must be added in the Affiliates file (cross-file dependency).

- [ ] **BE-ADM-31** affiliate adjustment entries: requirement handed to the Affiliates file (the endpoint, ledger entry type and tests live there); this task closes when the BE-AFF task exists and the admin page links to it
  - [ ] Spec above agreed with the Affiliates owner
  - [ ] Admin audit and approval threshold integration verified

### BE-ADM-13  POST /admin/billing/plan-sync

| | |
|---|---|
| Operation id | `adminSyncPlans` |
| Permission | `system.operate` plus step-up |
| Rate limit | 1 per 10 min |
| Idempotency | a running sync returns `409 admin.plan_sync_running` |
| Metric | `aptiverse.admin.plan_sync` (counter, tag `outcome`) |
| Log fields | `AdminUserId`, `SyncId`, `Created`, `Updated` |

Body `reason`. Triggers `IBillingAdminCommands.SyncPlansAsync` (BE-BIL-07) as a queued message; response `202 { syncId }`; result visible on the system page and in the audit.

- [ ] **BE-ADM-13** plan sync trigger
  - [ ] Endpoint, request record, validator, handler, integration test

### BE-ADM-32  GET /admin/system

| | |
|---|---|
| Operation id | `adminGetSystem` |
| Permission | `system.read` |
| Rate limit | `default` (cached 10 s) |
| Idempotency | safe |
| Metric | `aptiverse.admin.system.get.duration` |
| Log fields | `AdminUserId` |

Response: `checkedAt`; `dependencies[]` `{ key (api, worker, database, outbox, paystack, anthropic, ses, s3), status (ok, degraded, down, unknown), latencyMs, message }`; database reachability and latency (`SELECT 1` timed, as the old `GetSystem`); outbox counts (pending, processed in the last 24 h, oldest pending age) and dead letters from the Wolverine tables; host info (environment, image tag and git sha, .NET version, server time UTC, uptime, instance id); worker heartbeat (leader node and last durability agent run); the last 20 outbox envelopes `{ id, messageType, occurredAt, processedAt | null }`. External dependency checks reuse each client's health probe with a 2 s timeout.

- [ ] **BE-ADM-32** system page data (health, outbox, host, recent envelopes)
  - [ ] Endpoint, records, handler (read-only queries on `wolverine` tables through a dedicated read connection)
  - [ ] Integration tests: database latency reported; envelope list after an event

### BE-ADM-35  GET /admin/system/dead-letters and GET /admin/system/dead-letters/{id}

| | |
|---|---|
| Operation id | `adminListDeadLetters`, `adminGetDeadLetter` |
| Permission | `system.read` |
| Rate limit | `default` |
| Idempotency | safe |
| Metric | `aptiverse.admin.dead_letters.reads` (counter) |
| Log fields | `AdminUserId`, `DeadLetterId` |

List: cursor; rows `{ id, messageType, errorSummary, failedAt, attempts }`. Detail adds `exceptionType`, `stackSummary` (top frames, no messages that could hold PII), `payloadRedacted` (JSON with string values longer than 4 characters masked except ids and enum-like fields), `correlationId`.

- [ ] **BE-ADM-35** dead-letter list and detail
  - [ ] Endpoints, records, handlers (payload redactor unit tested), integration test

### BE-ADM-36  POST /admin/system/dead-letters/{id}/replay and /discard

| | |
|---|---|
| Operation id | `adminReplayDeadLetter`, `adminDiscardDeadLetter` |
| Permission | `system.operate` plus step-up |
| Rate limit | `default` (30 per hour per admin) |
| Idempotency | replay of an already replayed envelope returns `409 admin.dead_letter_gone` |
| Metric | `aptiverse.admin.dead_letters.actions` (counter, tags `action`, `message_type`) |
| Log fields | `AdminUserId`, `DeadLetterId`, `MessageType`, `Action` |

Body `reason` 10 to 500. Replay re-enqueues through Wolverine's dead-letter replay API (BE-SK-61); discard deletes it. Response `{ auditEventId, requeued }`. Audited.

- [ ] **BE-ADM-36** dead-letter replay and discard
  - [ ] Endpoints, request records, validators, handlers, integration tests (a failing handler's message replays after the fault is removed)

### BE-ADM-38  GET /admin/settings and PUT /admin/settings/{key}

| | |
|---|---|
| Operation id | `adminGetPlatformSettings`, `adminUpdatePlatformSetting` |
| Permission | `settings.manage`; pauses and approval thresholds also need step-up |
| Rate limit | `default` |
| Idempotency | PUT sets the value; `If-Match` honoured |
| Metric | `aptiverse.admin.settings.changes` (counter, tag `key`) |
| Log fields | `AdminUserId`, `Key` (never the value for contact keys) |

This is the platform settings page. Personal settings of the admin (profile, password, notifications, sessions) stay on the shared settings page backed by `/me/*` and `/notifications/preferences`. GET returns every registered key with its value or default, `updatedAt`, `updatedBy`, plus read-only `legal` versions (from Identity `GET /legal/versions`) and `team`. PUT body: `value` (validated against the key schema), `note` 10 to 500. Publishes `PlatformSettingChanged`, audited with before and after.

`GET /admin/team` (same slice) lists admins `{ userId, name, emailMasked, permissions[], rolesManager, lastActiveAt }` and doubles as the assignable admins list for ticket assignment.

- [ ] **BE-ADM-38** platform settings page and team list (personal settings stay on `/me`)
  - [ ] Endpoints, records, validators (per-key schema), handlers
  - [ ] Integration tests: pause refunds then refund returns 503; unknown key 404; no step-up on a pause 403

## Background work

| Message | Trigger | Handler |
|---|---|---|
| `AdminActionRecorded` | every module | BE-ADM-30 |
| Learning and billing events | other modules | BE-ADM-14 projections, BE-ADM-39 activity |
| `ImpersonationExpiry` | scheduled at `expires_at` | BE-ADM-27 |
| `BuildAuditExport` | BE-ADM-26 | writes CSV |
| `ExpireAuditExports` | daily | marks expired, S3 lifecycle deletes |
| `ExpireApprovalRequests` | hourly | BE-ADM-40 |
| `PurgeAdminProjections` | daily | activity events older than 7 days, activity days older than 400 days |
| `UserErased` | Identity | BE-ADM-43 |

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | a stolen admin session used for refunds or impersonation | step-up within 5 min for every sensitive action; admin sessions shorter (open question 7) | BE-IDN-69, BE-ADM-61 |
| Tampering | editing audit history; changing settings silently | append-only `audit_entries` (no update path, DB role without UPDATE or DELETE on the table, BE-ADM-62); every setting change audited | BE-ADM-30 |
| Repudiation | "I did not refund that" | audit with actor, reason, trace id, IP and outcome, failures included | BE-ADM-30 |
| Information disclosure | bulk PII browsing by admins; payloads in dead letters | minimised lists, masked emails, access log, redacted payloads, export needs step-up and reason | BE-ADM-42, BE-ADM-35 |
| Denial of service | heavy admin queries on production tables; SSE connection floods | keyset paging, caps, 3 streams per admin, LISTEN/NOTIFY instead of polling | BE-ADM-39 |
| Elevation of privilege | plain admin granting admin; impersonation used to write | roles rails on the `roles.manage` permission; read-only impersonation enforced server-side | BE-ADM-33, BE-ADM-28 |

- [ ] **BE-ADM-60** Write `api/docs/security/threat-model-admin.md` from the table, including the impersonation and step-up flows and the BFF cookie handling for impersonation tokens

### Authorisation and ownership tests

- [ ] **BE-ADM-61** Integration matrix: every `/admin/*` route returns 403 for students and parents, 403 for an admin missing the specific permission (test principal with a reduced permission set), and 403 `identity.step_up_required` for sensitive routes without recent step-up; impersonation tokens get 403 on every non-GET admin route
- [ ] **BE-ADM-62** Database role hardening: the application role has INSERT and SELECT only on `admin.audit_entries` and `admin.admin_access_log` (no UPDATE or DELETE); retention runs through a separate maintenance role that drops partitions (INF and migration script)

### Input limits

- [ ] **BE-ADM-63** Limits: reasons 10 to 500, search queries 80, list page sizes 100, audit range 400 days, exports 100 000 rows, setting values 4 KB, request bodies under 16 KB

### Rate limits

- [ ] **BE-ADM-64** Admin routes under `default` with per-action caps listed per slice (refunds 10 per hour per admin, impersonation 10 per day, exports 3 per day, plan sync and reconciliation 1 per 10 min, dead-letter actions 30 per hour)

### Idempotency and concurrency

- [ ] **BE-ADM-65** `Idempotency-Key` required on refunds, subscription actions, adjustments and impersonation start; setting updates use `If-Match`; tests for replays and stale versions (409); two admins starting impersonation of the same target both allowed but each audited

### Resilience

- [ ] **BE-ADM-66** Contract calls to other modules have 1 s budgets and partial responses (`degraded[]`); Paystack calls go through Billing's resilient client; the system page never fails because one dependency is down (status `down` for that row)

### Data retention and POPIA

- [ ] **BE-ADM-67** Classification: audit summaries may contain contact data (redacted at write), `actor_email` and IPs (contact, network), access log subject ids (identifier). Retention: audit entries 5 years (financial and safeguarding accountability), access log 2 years, impersonation records 5 years, activity events 7 days, projections 400 days, exports 24 h; export and erasure via BE-ADM-43

### Audit

- [ ] **BE-ADM-68** Audit coverage test: a list of sensitive operation ids (refund, subscription action, roles, impersonation start and end, unlock, revoke sessions, resend verification, settings change, export, dead-letter replay and discard, adjustment, payout actions, past paper and catalog changes, ticket safeguarding) is asserted to produce an audit row on success and on failure

### Observability

- [ ] **BE-ADM-69** Metrics as listed per slice plus `aptiverse.admin.audit.entries` (counter, tags `category`, `severity`, `outcome`); alerts: **any `critical` audit entry** (notify), **refund failures above 3 in 1 h**, **impersonation sessions above 5 in 1 h**, **audit handler dead letters above 0** (audit must not be lost), **admin 5xx above 2 percent for 10 min**
- [ ] **BE-ADM-70** Spans `Admin.<UseCase>` with child spans per contract call; attribute `aptiverse.admin.degraded` listing failed sources

### Performance budgets

- [ ] **BE-ADM-71** p95: metrics under 600 ms uncached and 30 ms cached, users list under 200 ms, user drawer under 400 ms, audit viewer under 200 ms over 5 million rows (monthly range partitions on `occurred_at`, created ahead by a scheduled job), system page under 300 ms; query plans checked (BE-SK-83)

### Migration safety

- [ ] **BE-ADM-72** `audit_entries` created partitioned by month from the first migration (retrofitting partitions later rewrites the table); new categories and keys added with `NOT VALID` then `VALIDATE`; projections are rebuildable, so their schema changes may drop and backfill (documented per migration)

### SLO contribution

- [ ] **BE-ADM-73** Admin is not user-facing: availability target 99 percent, but audit ingestion completeness is 100 percent (alerted via dead letters and a nightly count reconciliation between `AdminActionRecorded` published counters and rows)

### Load and failure tests

- [ ] **BE-ADM-74** Seed 5 million audit rows in a staging copy and verify the viewer and export budgets
- [ ] **BE-ADM-75** Failure drill: Billing contract throwing; metrics, drawer and attention list return partial data with `degraded` and no 500
- [ ] **BE-ADM-76** Impersonation end to end (with FE): banner shows countdown, write attempt blocked, diary private placeholder, expiry ends the session at the API, target sees the entries in security history
- [ ] **BE-ADM-77** Restore drill support (HRD-07): the system page shows database reachability and outbox state during and after the restore
- [ ] **BE-ADM-78** Runbook `api/docs/runbooks/admin-operations.md`: pausing refunds or AI generation, replaying dead letters, running reconciliation, impersonation etiquette
- [ ] **BE-ADM-79** `roles.manage` recovery runbook: what to do if no holder remains (seed command `grant-roles-manage --email` guarded by environment and audited)

## Old data mapping

Source: `audit.*` at `43f9faa` (`audit_logs`, `audit_actions`), `api/Controllers/AdminController.cs`, `AdminPaystackController.cs`, `AuditController.cs`, `InsightsController.cs`. Feeds MIG-18.

| Old table.column | New | Transform |
|---|---|---|
| `audit.audit_logs` (`action_id`, `user_id`, `user_email`, `user_role`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `correlation_id`, `service_name`, `created_at`) | `audit_entries` | `action` from `audit_actions.name` normalised to dotted lowercase (`User.RolesChanged` to `user.roles_changed`), `category` and `severity` from `audit_actions` mapped to the new lists, `outcome = succeeded` unless the action name marks a failure, `actor_kind` from role, `old_values` and `new_values` re-redacted into summaries (max 8 KB), `source_module = migration`, `dedupe_key` new Guid; rows older than 5 years not migrated; security-type actions (login, password) go to Identity `security_events` instead (identity.md) |
| `audit.audit_actions` | dropped | fixed category and severity lists in code |
| `identity` Superuser role holders | `admin` role plus the `roles.manage` permission (BE-ADM-33, decision 28) | the Superuser role itself is not carried over |
| `insights.*` live activity | not migrated | replaced by `activity_events` going forward |
| Old admin overview figures | none | computed live from new sources |

## Tests

- Unit: roles rails, MRR presentation, payload redactor, settings key schemas, approval rules, partial-response assembly.
- Integration: every slice's happy, validation, forbidden (role and missing permission), step-up and not found cases; BE-ADM-61, BE-ADM-65, BE-ADM-68.
- E2E with web: BE-ADM-76.

## Open questions

1. Decided (9b, 28): the catalogue below is adopted and v1 has one `admin` role holding everything except `roles.manage`; a support-agent subset waits for Phase 12. Background: the admin page specs propose `admin.dashboard.read`, `system.read`, `system.operate`, `settings.manage`, `audit.export`, `billing.refund`, `billing.subscriptions.manage`, `support.tickets.manage`, `affiliates.payouts.manage`, `schools.read`. This file adopts them except `support.tickets.manage` (kept as `support.manage`, which also covers enquiries) and `schools.read` (folded into `support.manage`). A "support agent" subset (users.read, users.support, support.manage) can be added later without renaming anything.
2. Decided (28): no `superuser` role; a `roles.manage` permission granted to named admins, with the rails (no self-edit, last holder cannot lose it) on the permission (BE-ADM-33, BE-ADM-45).
3. Decided (54): second-admin approval above R2 000, built but off (threshold null) until there are two admins (BE-ADM-40).
4. "Active student" definition: any authenticated request in 7 days, or a learning action (practice, assessment, tutor message)? Proposed: learning action (projection `user_activity_days`).
5. Decided (55): USD as billed, with a ZAR estimate at a configured rate shown with its date.
6. Maintenance banner: served through `/me` (signed-in only) or a public endpoint for the marketing site too?
7. Admin session lifetime: shorter absolute session (8 h) and refresh window for admin accounts than for students (30 days)?
8. Decided (DECISIONS.md E, 3b): affiliate is a profile, not a role, and enrolment is automatic, so the roles editor assigns only `admin` and `roles.manage`. (Earlier note: the page revision said "only affiliate and admin assignable in v1".)
