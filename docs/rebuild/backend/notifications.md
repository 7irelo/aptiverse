# Notifications module

| | |
|---|---|
| ID range | `BE-NTF-01` to `BE-NTF-11` (original), `BE-NTF-12` to `BE-NTF-31` (splits and additions), `BE-NTF-40` to `BE-NTF-58` (production readiness) |
| Schema | `notifications` |
| Projects | `src/Modules/Notifications/Aptiverse.Notifications`, `src/Modules/Notifications/Aptiverse.Notifications.Contracts`, `tests/Aptiverse.Notifications.UnitTests` |
| Phase | 2 (core), templates added by later phases |
| Consumes | `Aptiverse.Identity.Contracts` (events listed under Background work; `IUserDirectory` for addresses at send time), every module's `NotifyUser` and `SendTemplatedEmail` commands |
| Publishes | none required; implements `INotificationPreferences` (query) |
| Depends on | BE-SK-22, BE-SK-24, BE-SK-45, BE-SK-58, BE-IDN-42, INF-17 (SESv2 identity, DKIM, task role send permission), local compose Mailpit (infra `local/compose.yml`) |
| Status | Partial. 0 done, 1 partial, 1 unverified, 48 not started (50 tasks). Only `Aptiverse.Notifications.Contracts` exists, holding the `NotifyUser` command; it is not in `Aptiverse.slnx` and nothing references it |

## Responsibilities and out of scope

Responsible for:

- In-app notification feed with read state, unread counts and preferences per category and channel.
- Transactional email through SESv2 (Mailpit locally), behind the Wolverine outbox, with retries, suppression handling and a delivery log.
- Email templates (Scriban) with one branded layout, plain-text alternative, and one-click unsubscribe for non-mandatory categories.
- Reacting to Identity events (verification, reset, security notices) and to generic `NotifyUser` and `SendTemplatedEmail` commands from any module.

Out of scope:

- Deciding when something happens (modules schedule their own reminders and send a command when due).
- Push and SMS (not in v1; the old `push_notifications` preference is dropped).
- Marketing campaigns and newsletters (outside the app; product update emails only with the `marketing_email` consent).
- Inbound mail (Zoho).

## Data model

Schema `notifications`. Platform columns on every table (`id`, `created_at`, `updated_at`, `deleted_at`, `xmin`) unless marked append-only. `user_id` columns reference Identity users by id only (no cross-schema FK).

### notifications

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, created_at desc, id desc)` filtered `deleted_at IS NULL` (feed and keyset cursor) |
| category | varchar(32) | no | check over the category list below |
| title | varchar(120) | no | |
| body | varchar(500) | no | plain text, no HTML |
| link | varchar(512) | yes | app-relative path; check `link IS NULL OR link LIKE '/%'` and not `//` (no open redirects) |
| dedupe_key | uuid | yes | from the command; unique `(user_id, dedupe_key)` filtered `dedupe_key IS NOT NULL` so a redelivered command never doubles a row |
| read_at | timestamptz | yes | partial index `(user_id)` filtered `read_at IS NULL AND deleted_at IS NULL` for unread counts |
| expires_at | timestamptz | no | created plus 180 days; index for purge |

Categories (string enum `NotificationCategories.All`, check constraint): `security`, `account`, `academics_reminders`, `practice`, `progress`, `wellbeing_reminders`, `family`, `billing`, `affiliates`, `support`, `product_updates`.

### notification_preferences

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique `(user_id, category, channel)` filtered `deleted_at IS NULL` |
| category | varchar(32) | no | check over categories |
| channel | varchar(16) | no | check `channel IN ('in_app','email')` |
| enabled | boolean | no | |

Rows exist only for overrides; defaults live in code (`PreferenceDefaults`): every category on for in-app; email on for `security`, `account`, `billing`, `family`, `support`, `academics_reminders`; off for `practice`, `progress`, `wellbeing_reminders`, `affiliates`; `product_updates` email follows the `marketing_email` consent in Identity and is off by default. Mandatory pairs (`security` and `account` email, `billing` email for receipts) cannot be disabled: writes are rejected (BE-NTF-20).

### email_deliveries (append-only status log)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | yes | null for non-user recipients (support inbox, anonymous contact form submitter); index `(user_id, created_at desc)` |
| to_address_hash | char(64) | no | SHA-256 of the lowercased address with a server pepper; index |
| to_address_masked | varchar(64) | no | `t***@g***.com`, for admin troubleshooting without exposing the address |
| template_key | varchar(64) | no | for example `identity.verify_email` |
| category | varchar(32) | no | check over categories plus `internal` |
| dedupe_key | uuid | no | unique: the same logical email is sent at most once |
| status | varchar(16) | no | check `status IN ('queued','sent','delivered','bounced','complained','failed','suppressed')` |
| provider_message_id | varchar(128) | yes | SES message id; unique filtered not null |
| attempts | smallint | no | check `attempts >= 0` |
| last_error_code | varchar(64) | yes | provider error code only, never the message body |
| sent_at | timestamptz | yes | |
| status_changed_at | timestamptz | no | |

Status changes update the row (not strictly append-only; no soft delete). Bodies are never stored.

### email_suppressions

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| address_hash | char(64) | no | unique filtered `deleted_at IS NULL` |
| reason | varchar(16) | no | check `reason IN ('bounce','complaint','unsubscribe_all')` |
| source | varchar(16) | no | check `source IN ('ses','user','admin')` |
| detail | varchar(200) | yes | bounce type and subtype only |

Mandatory categories still send to `unsubscribe_all` addresses; `bounce` and `complaint` suppress everything (SES reputation), and the account shows "We cannot reach your email address" through `/me` (BE-NTF-31).

## Contracts

`Aptiverse.Notifications.Contracts`:

```
// exists (NotifyUser.cs)
public sealed record NotifyUser(Guid UserId, string Category, string Title, string Body, string? Link);

// planned change (BE-NTF-10): optional dedupe key so redelivery never doubles a row
public sealed record NotifyUser(Guid UserId, string Category, string Title, string Body, string? Link, Guid? DedupeKey = null);

// planned (BE-NTF-12)
public sealed record SendTemplatedEmail(
    Guid DedupeKey,
    string TemplateKey,                 // must exist in the template registry, checked at startup for every key referenced in Contracts
    string Category,                    // drives preferences and unsubscribe
    Guid? UserId,                       // address resolved at send time through IUserDirectory (skipped if erased or unverified when the template requires it)
    string? ToAddress,                  // only for non-user recipients: support inbox, contact form acknowledgement
    string? ToName,
    IReadOnlyDictionary<string, string> Model);

public static class NotificationCategories { Security, Account, AcademicsReminders, Practice, Progress, WellbeingReminders, Family, Billing, Affiliates, Support, ProductUpdates; All }
public static class EmailTemplates { /* constants for every template key, see BE-NTF-04, 16, 17 */ }

// planned (BE-NTF-25)
public interface INotificationPreferences
{
    Task<bool> IsEnabledAsync(Guid userId, string category, string channel, CancellationToken ct);
}
```

## Foundation tasks

- [ ] **BE-NTF-01** Module, `notifications` schema. *(partial: only the Contracts project with `NotifyUser` exists; not in the solution)*
- [ ] **BE-NTF-26** `NotificationsModule` registration (`AddNotificationsModule`, `MapNotificationsEndpoints`), `NotificationsDbContext`, design-time factory, add to `Aptiverse.slnx`, Host, Worker, Dockerfile and `ArchitectureTests/Modules.cs`; `InitialCreate` migration for the four tables
- [ ] **BE-NTF-05** `notifications` table (type, payload, deep link, read at): entity, configuration with the indexes and checks above
- [ ] **BE-NTF-06** `notification_preferences` table (per type, per channel), plus `PreferenceDefaults` and the mandatory-pair rule
- [ ] **BE-NTF-15** `email_deliveries` table and `DeliveryLog` writer (masked address, peppered hash, no bodies)
- [ ] **BE-NTF-14** `email_suppressions` table and `POST /notifications/webhooks/ses` (SNS HTTPS subscription for SES bounce and complaint events: verify the SNS message signature and `TopicArn`, confirm subscriptions, `webhooks` rate-limit group, idempotent by SNS `MessageId`); hard bounces and complaints insert suppressions and mark deliveries
- [ ] **BE-NTF-02** SESv2 email sender behind the outbox (retries, no in-memory queue): `IEmailTransport` with `SesEmailTransport` (`AWSSDK.SimpleEmailV2`, region `eu-west-1`, configuration set name from options, `List-Unsubscribe` and `List-Unsubscribe-Post` headers for non-mandatory categories, plain text and HTML parts); task role credentials only, no access keys
- [ ] **BE-NTF-13** `SmtpEmailTransport` (MailKit, already referenced centrally) for Development and Testing pointed at Mailpit; transport chosen by `Email:Transport` (`ses` or `smtp`), validated on start (`ses` required in Staging and Production)
- [ ] **BE-NTF-12** `SendTemplatedEmail` Wolverine handler: resolve the address (`IUserDirectory` for user recipients, skip erased users), check suppressions and preferences, render, send through `IEmailTransport`, write `email_deliveries`; durable local queue with retry policy (5 s, 30 s, 2 min, 10 min, 1 h) on throttling and 5xx, then dead letter; idempotent on `dedupe_key`
- [ ] **BE-NTF-03** Template engine (Scriban), base branded layout: templates as embedded resources `Templates/<key>.html.sbn` and `<key>.txt.sbn` plus `<key>.subject.sbn`, one `layout.html.sbn` with the Graphite and Citron tokens inlined (system font stack, no web fonts, 600 px max width, dark-mode safe colours), registry loaded and parsed at startup (boot fails on a missing part or a parse error), model keys validated against a per-template schema
- [ ] **BE-NTF-04** Templates: verify email, reset password, welcome (student and parent variants; parent copy points to adding a child)
- [ ] **BE-NTF-16** Security and account templates: password changed (with "this was not me" path to reset), account locked, email change confirmation and old-address notice, deletion request received (with the cooling-off date and cancel link), data export ready (link expires in 7 days), sign-in from a new device (optional, off until decided)
- [ ] **BE-NTF-17** Reminder templates used by Academics (BE-ACA-53): assessment due tomorrow, study session starting in N minutes; copy is calm and specific, no streak or guilt language
- [ ] **BE-NTF-18** Template snapshot tests: render every template with its sample model, compare HTML and text snapshots, and lint the output (no emojis, no em or en dashes, no `{{` left unrendered, every link absolute `https://` to the app domain, subject under 78 characters)
- [ ] **BE-NTF-10** Handler: integration events to in-app notification rows (generic): `NotifyUserHandler` inserts a row when the in-app preference allows it (mandatory categories always), idempotent on `(user_id, dedupe_key)`; contract change to add `DedupeKey` (BE-NTF-01 Contracts already has the four-field record)
- [ ] **BE-NTF-21** Identity event handlers (public Wolverine handlers taking Contracts messages): `UserRegistered` to welcome email plus in-app "Finish setting up"; `EmailVerificationRequested` to verify email; `PasswordResetRequested` to reset email; `PasswordChanged` to security notice; `AccountLockedOut`, `EmailChanged`, `AccountDeletionRequested`, `PersonalDataExportReady` to their templates; each uses the event id or a deterministic Guid v5 of `(event type, user id, occurred at)` as dedupe key
- [ ] **BE-NTF-25** `INotificationPreferences` implementation (cached 60 s per user and category, evicted on preference writes) for modules that decide whether to schedule reminders (Academics, Wellbeing)
- [ ] **BE-NTF-27** POPIA handlers: `IPersonalDataExporter` (notifications of the last 180 days, preferences, delivery log with masked addresses) and `IPersonalDataEraser` (delete notifications and preferences, null `user_id` on deliveries, keep suppressions as hashes) wired to `UserErased`
- [ ] **BE-NTF-31** Deliverability state for `/me` and settings: `IEmailDeliverability.GetAsync(userId)` returns `ok`, `bounced` or `complained` from suppressions so the settings page can ask the user to fix their address
- [ ] **BE-NTF-11** Mailpit locally, SES in staging (exit check): register in local compose sends to Mailpit; register in staging delivers to a real inbox through SES with DKIM pass. *(unverified: needs the local compose stack and the staging SES identity, INF-17)*

## Slices

Group `/notifications`, tag `Notifications`. Ownership: every query filters `user_id = current user`; another user's notification id returns 404.

### BE-NTF-07  GET /notifications

| | |
|---|---|
| Operation id | `listNotifications` |
| Permission | `notifications.read` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: no-store` |
| Metric | `aptiverse.notifications.list.duration` (histogram, ms) |
| Log fields | `UserId`, `Limit`, `ResultCount`, `UnreadOnly` |

Request (query) `ListNotificationsRequest`: `cursor` optional opaque (BE-SK-58); `limit` 1 to 50, default 20; `unreadOnly` bool default false; `category` optional, must be a known category.

Response `200 { items: NotificationView[], nextCursor, unreadCount, latestCreatedAt }`, `NotificationView { id, category, title, body, link, createdAt, readAt }`, newest first. `latestCreatedAt` is the newest item's timestamp, which the client sends back as `upTo` when marking all read (BE-NTF-19).

Failures: `400` (bad cursor `paging.cursor_invalid`, unknown category), `401`, `403`.

- [ ] **BE-NTF-07** `GET /notifications` (paged, unread count)
  - [ ] Endpoint
  - [ ] `ListNotificationsRequest`, `NotificationView`, `NotificationFeed` records
  - [ ] Validator
  - [ ] Handler (keyset query on `(user_id, created_at desc, id desc)`; unread count from the partial index)
  - [ ] Unit tests: cursor continuity across equal timestamps
  - [ ] Integration tests: happy, validation, forbidden (no permission), other users' rows never returned

### BE-NTF-22  GET /notifications/unread-count

| | |
|---|---|
| Operation id | `getUnreadNotificationCount` |
| Permission | `notifications.read` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.notifications.unread_count.duration` |
| Log fields | `UserId` |

Response `200 { unreadCount }` (capped at 99 for display is a UI concern; the API returns the real number up to 1000 and `1000` above). Used by the shell bell on every page load, so it must stay index-only.

- [ ] **BE-NTF-22** `GET /notifications/unread-count`
  - [ ] Endpoint, response record, handler (count over the partial index, cap 1000)
  - [ ] Integration tests: count changes after read and read-all

### BE-NTF-08  POST /notifications/{id}/read

| | |
|---|---|
| Operation id | `markNotificationRead` |
| Permission | `notifications.read` |
| Rate limit | `default` |
| Idempotency | idempotent: an already read item returns 204 and keeps the first `read_at` |
| Metric | `aptiverse.notifications.marked_read` (counter, tag `mode=single`) |
| Log fields | `UserId`, `NotificationId` |

Route `id` uuid. Response `204`. Failures `404 notifications.not_found` (missing or another user's).

- [ ] **BE-NTF-08** `POST /notifications/{id}/read`
  - [ ] Endpoint, handler (`ExecuteUpdateAsync` with user filter)
  - [ ] Integration tests: other user's id 404; idempotent

### BE-NTF-19  POST /notifications/read-all

| | |
|---|---|
| Operation id | `markAllNotificationsRead` |
| Permission | `notifications.read` |
| Rate limit | `default` |
| Idempotency | idempotent for the same `upTo` |
| Metric | `aptiverse.notifications.marked_read` (counter, tag `mode=all`), value is the number of rows |
| Log fields | `UserId`, `UpTo`, `Marked` |

Request `MarkAllReadRequest`: `upTo` required, a timestamp with offset (the `latestCreatedAt` the user saw) or `upToId` uuid (the newest id the user saw), exactly one; `upTo` may not be in the future by more than 60 s; optional `category`. Only unread rows with `created_at <= upTo` (or id ordering at or before `upToId`) are marked, so a notification that arrived after the user looked stays unread. Response `200 { marked }`.

Failures: `400` (neither or both, future timestamp, unknown category).

- [ ] **BE-NTF-19** `POST /notifications/read-all` with `upTo` (split from BE-NTF-08)
  - [ ] Endpoint, request and response records, validator, handler (one `ExecuteUpdateAsync`)
  - [ ] Unit tests: boundary at equal timestamps uses id tiebreak
  - [ ] Integration tests: a notification created after `upTo` remains unread

### BE-NTF-09  GET /notifications/preferences

| | |
|---|---|
| Operation id | `getNotificationPreferences` |
| Permission | `notifications.read` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.notifications.preferences.read.duration` |
| Log fields | `UserId` |

Response `200 { categories: [ { category, label, description, inApp: { enabled, locked }, email: { enabled, locked } } ], emailDeliverability }`: every category merged with defaults; `locked` true for mandatory pairs and for `product_updates` email when there is no marketing consent (the UI links to consent instead). Categories that do not apply to the role are omitted (`family` only for parents and students with links, `affiliates` only with an affiliate profile).

- [ ] **BE-NTF-09** `GET /notifications/preferences`
  - [ ] Endpoint, response records, handler (defaults merge)
  - [ ] Unit tests: defaults per role; locked flags
  - [ ] Integration tests: student and parent shapes

### BE-NTF-20  PUT /notifications/preferences

| | |
|---|---|
| Operation id | `updateNotificationPreferences` |
| Permission | `notifications.read` |
| Rate limit | `default` |
| Idempotency | PUT of the listed pairs, idempotent |
| Metric | `aptiverse.notifications.preferences.updated` (counter, tags `category`, `channel`, `enabled`) |
| Log fields | `UserId`, `ChangedPairs` |

Request `UpdatePreferencesRequest`: `changes` array of 1 to 30 `{ category, channel, enabled }`, unique per `(category, channel)`. Response `200` same shape as GET.

Failures: `400`; `409 notifications.preference_locked` when a change targets a mandatory pair; `409 concurrency_conflict`.

- [ ] **BE-NTF-20** `PUT /notifications/preferences` (split from BE-NTF-09)
  - [ ] Endpoint, request record, validator, handler (upsert override rows; delete a row when it equals the default)
  - [ ] Unit tests: mandatory pair rejected
  - [ ] Integration tests: change persists; reminder emails stop (handler consults preferences)

### BE-NTF-23  POST /notifications/unsubscribe

| | |
|---|---|
| Operation id | `unsubscribeFromEmail` |
| Permission | anonymous (allowlisted; the signed token is the credential) |
| Rate limit | `public-forms` |
| Idempotency | idempotent |
| Metric | `aptiverse.notifications.unsubscribes` (counter, tags `category`, `via=one_click|page`) |
| Log fields | `UserId`, `Category` |

Request `UnsubscribeRequest`: `token` required, max 512; the token is an HMAC-SHA256 signed payload `(userId, category, issuedAt)` valid 90 days, key from Secrets Manager. Also accepts RFC 8058 one-click `List-Unsubscribe=One-Click` form posts. Turns the category's email preference off (never a mandatory pair). Response `204`. Failures `400 notifications.unsubscribe_token_invalid`.

- [ ] **BE-NTF-23** one-click unsubscribe
  - [ ] Endpoint (JSON and form content types), request record, validator, handler
  - [ ] Token signer with key rotation (current plus previous key)
  - [ ] Unit tests: tampered, expired, mandatory category
  - [ ] Integration tests: one-click form post works without a session

## Background work

| Message | Trigger | Handler | Notes |
|---|---|---|---|
| `SendTemplatedEmail` | any module (outbox) | BE-NTF-12 | retries then dead letter |
| `NotifyUser` | any module (outbox) | BE-NTF-10 | |
| Identity events | Identity outbox | BE-NTF-21 | |
| `PurgeExpiredNotifications` | scheduled daily 03:00 SAST | BE-NTF-24 | |
| `PurgeDeliveryLog` | scheduled weekly | BE-NTF-24 | deliveries older than 13 months |

- [ ] **BE-NTF-24** Retention jobs: delete notifications past `expires_at` (180 days) and read notifications older than 90 days; delete `email_deliveries` older than 13 months; batches of 1000 with a metric per run

Replaces the old in-memory `Data/Email/EmailQueue.cs` (bounded `Channel` with `DropOldest`) and its polling sender.

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | forged SNS bounce callbacks, forged unsubscribe tokens | SNS signature and topic check; HMAC tokens | BE-NTF-14, BE-NTF-23 |
| Tampering | phishing links injected into notification bodies by a module bug | links must be app-relative; bodies plain text; email links built from `Email:AppBaseUrl` only | BE-NTF-05, BE-NTF-18 |
| Repudiation | "I never got the reset email" | `email_deliveries` with provider message id and status | BE-NTF-15 |
| Information disclosure | email addresses in logs, reset links in logs, another user's feed | addresses masked or hashed, URLs with tokens never logged, user filter on every query | BE-NTF-46 |
| Denial of service | email flood from a loop (reputation damage), SES throttling | dedupe keys, per-recipient send cap (BE-NTF-44), retry with backoff | BE-NTF-12 |
| Elevation of privilege | marking another user's notifications | user filter, 404 | BE-NTF-41 |

- [ ] **BE-NTF-40** Write `api/docs/security/threat-model-notifications.md` from the table, including SES sandbox exit, DKIM, SPF and DMARC alignment owned by INF-17

### Authorisation and ownership tests

- [ ] **BE-NTF-41** Integration: every slice with another user's notification id or cursor returns 404 or an empty page; anonymous 401 except unsubscribe and the SES webhook

### Input limits

- [ ] **BE-NTF-42** Limits: command titles 120, bodies 500, links 512 (handler truncates with a warning metric rather than failing a business flow); preferences PUT max 30 changes; template models max 32 keys and 2 KB per value; SES webhook body max 256 KB

### Rate limits

- [ ] **BE-NTF-43** Feed and count under `default`; unsubscribe under `public-forms`; SES webhook under `webhooks` (own partition, never shares a user bucket)
- [ ] **BE-NTF-44** Per-recipient email cap: at most 20 non-mandatory emails per user per day and 5 per template per hour, enforced in BE-NTF-12 with `suppressed` status and a metric; mandatory security emails bypass but are still deduped

### Idempotency and concurrency

- [ ] **BE-NTF-45** Tests: the same `NotifyUser` delivered twice creates one row; the same `SendTemplatedEmail` delivered twice sends once (dedupe on `email_deliveries.dedupe_key` checked before the provider call and enforced by the unique index); preference PUT with a stale row returns 409

### Resilience

- [ ] **BE-NTF-47** SES client through `AddAptiverseHttpClient` settings (5 s attempt timeout, retries on throttling `TooManyRequestsException` and 5xx honouring backoff, breaker at 50 percent over 60 s); when the breaker is open, messages stay in the durable queue (no loss) and the ready probe stays healthy (email is not a readiness dependency)

### Data retention and POPIA

- [ ] **BE-NTF-46** Classify columns (BE-SK-59): `title`, `body` free text (may contain names of children for parents), `to_address_*` contact (hashed or masked), `link` behavioural; retention per BE-NTF-24; export and erasure per BE-NTF-27; minors: no marketing emails to users with `isMinor = true` regardless of consent (checked in BE-NTF-12 through `IUserProfileLookup`)

### Audit

- [ ] **BE-NTF-48** Delivery log is the audit trail for transactional mail; preference changes write no audit rows (user-owned settings) but are logged at Information with category and channel only

### Observability

- [ ] **BE-NTF-49** Metrics: `aptiverse.notifications.emails.sent` (counter, tags `template`, `category`), `aptiverse.notifications.emails.failed` (counter, tag `error_code`), `aptiverse.notifications.emails.suppressed` (counter, tag `reason`), `aptiverse.notifications.emails.bounced` and `.complained` (counters), `aptiverse.notifications.email.send.duration` (histogram), `aptiverse.notifications.created` (counter, tag `category`); log fields on send: `DeliveryId`, `TemplateKey`, `Category`, `UserId`, `ProviderMessageId`, `Attempt` (never the address)
- [ ] **BE-NTF-50** Alerts: **verify or reset email failure ratio above 5 percent for 10 min** (sign-ups break), **bounce rate above 4 percent or complaint rate above 0.08 percent over 24 h** (SES reputation thresholds), **SendTemplatedEmail dead letters above 0**, **oldest queued email older than 10 min**
- [ ] **BE-NTF-51** Spans: `Notifications.SendEmail` with attributes `aptiverse.email.template`, `aptiverse.email.category`, `aptiverse.email.attempt`; SES call as a child HTTP span

### Performance budgets

- [ ] **BE-NTF-52** p95: list under 80 ms, unread count under 20 ms (index-only), mark read under 40 ms, preferences under 60 ms; verify and reset emails delivered to SES within 30 s of the triggering request at p95; query plans checked for the feed and the unread partial index (BE-SK-83)

### Migration safety

- [ ] **BE-NTF-53** Initial migration additive; adding a category later is an expand step (widen the check constraint with `NOT VALID` then `VALIDATE`); removing a category requires a data migration that rewrites rows first

### SLO contribution

- [ ] **BE-NTF-54** SLIs: transactional email delivery success (sent or delivered over attempted, excluding suppressed) 99 percent daily; verify and reset latency to SES p95 under 30 s; feed availability follows the platform SLO

### Load and failure tests

- [ ] **BE-NTF-28** Integration: an Identity event flows through the outbox to a captured email (fake transport) with the right template and dedupe
- [ ] **BE-NTF-29** Integration: preference off suppresses reminder email and in-app row for non-mandatory categories; mandatory still delivered
- [ ] **BE-NTF-30** Integration: SES webhook with a valid signed SNS bounce notification inserts a suppression; an unsigned body returns 401
- [ ] **BE-NTF-55** Failure drill: SES returns throttling for 5 min in staging (fault injection); queued emails send after recovery with no duplicates
- [ ] **BE-NTF-56** Load: 500 `NotifyUser` per second for 2 min through the outbox; feed p95 holds; no dead letters
- [ ] **BE-NTF-57** Template rendering performance: render each template 1000 times under 2 ms p95 (compiled Scriban templates cached at startup)
- [ ] **BE-NTF-58** Runbook `api/docs/runbooks/email-incident.md`: SES suspension, bounce spike, replaying dead-lettered emails

## Old data mapping

Source: `notifications.notifications` and the preference columns on `identity.users` at `43f9faa` (migrations `20260513113410_AddNotifications`, `20260708111751_AddNotificationPreferences`, `20260708114932_AddAssessmentDueEmailPref`). Feeds MIG-15.

| Old | New | Transform |
|---|---|---|
| `notifications.notifications.id` (bigint) | `notifications.id` | new Guid v7 |
| `user_id` (text) | `user_id` | through the MIG user lookup |
| `kind` | `category` | mapping table: assessment and calendar kinds to `academics_reminders`, goal and achievement kinds to `progress`, practice kinds to `practice`, parent link kinds to `family`, payment kinds to `billing`, study group and tutor kinds dropped (features not in v1), unknown kinds to `account` |
| `title`, `body` | `title`, `body` | truncated to 120 and 500 |
| `action_href` | `link` | kept only if it starts with `/` and the route exists in the new app's redirect map; else null |
| `read` (bool), `time` | `read_at`, `created_at` | `read_at = time` when read |
| rows older than 180 days | not migrated | retention |
| `users.email_notifications` | `notification_preferences` | false writes email off overrides for every non-mandatory category |
| `users.assessment_due_reminders`, `assessment_due_email_reminders` | `academics_reminders` in_app and email overrides | |
| `users.wellbeing_checkin_reminders` | `wellbeing_reminders` email override | |
| `users.weekly_study_summary` | `progress` email override | |
| `users.study_group_email_reminders`, `push_notifications` | dropped | study groups and push not in v1 |
| old email queue contents | not migrated | in-memory, lost on restart by design of the old app |

## Tests

- Unit: preference defaults and locks, cursor paging, template registry load failures, token signer, dedupe key derivation, per-recipient caps.
- Integration: BE-NTF-28 to BE-NTF-30, BE-NTF-41, BE-NTF-45, plus each slice's happy, validation, forbidden and not found cases.
- Snapshot: BE-NTF-18 for every template.

## Open questions

1. Is a "new sign-in from an unknown device" email wanted in v1 (BE-NTF-16 lists it as optional)? It adds noise for students who switch phones often.
2. Should parents receive email copies of their child's reminders, or only in-app family notifications? Proposed: only family-category items the student's privacy settings allow (Family owns the rule).
3. Weekly progress summary email: in v1 or later? The old app had `weekly_study_summary`; the preference maps over but no template exists yet.
4. Notification retention of 180 days: confirm, or keep longer for the progress journey (Progress keeps its own timeline, so 180 days is assumed safe).
5. Should notifications for minors to parents be gated by Family consent here or upstream? Proposed: upstream (the publishing module decides), Notifications only applies channel preferences.
