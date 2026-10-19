# Wellbeing module

| | |
|---|---|
| ID range | `BE-WEL-01` to `BE-WEL-09` (original), `BE-WEL-10` to `BE-WEL-29` (splits and additions), `BE-WEL-40` to `BE-WEL-60` (production readiness) |
| Schema | `wellbeing` |
| Projects | `src/Modules/Wellbeing/Aptiverse.Wellbeing`, `src/Modules/Wellbeing/Aptiverse.Wellbeing.Contracts`, `tests/Aptiverse.Wellbeing.UnitTests` |
| Phase | 7 |
| Consumes | `Aptiverse.Family.Contracts` (`IFamilySharingSettings`), `Aptiverse.Identity.Contracts` (`AccountDeletionRequested`), `Aptiverse.Notifications.Contracts` (`NotifyUser`, `INotificationPreferences`) |
| Publishes | `CheckinRecorded` (no content); implements `ISharedWellbeingTrend`, `ICheckinStatus` |
| Depends on | BE-SK-17 (needs a hard-delete opt-out, see BE-WEL-12), BE-SK-23, shared `IFieldEncryptor` and KMS key (platform backlog), BE-FAM-11 (sharing flags), BE-NTF-06 |
| Status | Not started (0 of 49 tasks) |

## Responsibilities and out of scope

Responsible for:

- Mood check-ins (mood and stress on a 1 to 5 scale, an optional private note).
- The diary: entries encrypted at rest with a per-user key, never shown to parents, never sent to the AI, hard-deleted on request.
- Aggregate weekly trends, and the only parent-facing read (`ISharedWellbeingTrend`) which returns weekly aggregates and only when the student has shared them in Family.
- Gentle check-in reminders as scheduled messages, respecting notification preferences.
- Static South African support resources.

Out of scope:

- Diary NLP, sentiment or AI insights (decision 7: none in v1). The old sentiment columns are dropped.
- Sharing flags: owned by Family (decision 1 below).
- Counsellor directory or bookings (old `counsellors` endpoint): not in v1.
- Any crisis detection on diary text.

## Decisions recorded here

1. **Family owns the parent sharing flags.** BE-WEL-06 keeps its meaning (what aggregate trend a linked parent can see) but is implemented as Wellbeing reading `IFamilySharingSettings` from Family, which owns the per-link privacy settings (BE-FAM-11). Wellbeing stores no copy. Decision to confirm.
2. **Hard delete for diary entries and check-in notes**, a deliberate exception to the soft-delete default. Reason (POPIA): a diary and mood notes are a child's health-related special personal information (section 26, section 32 for health); POPIA section 14 requires destroying records once no longer needed and section 24 lets the data subject request deletion. A soft-deleted diary entry is still held, so deleting means the row is gone (and on account deletion the user's key is destroyed, so backups become unreadable after their retention window).
3. **Encrypted at rest, not end-to-end.** Diary content and notes are encrypted with a per-user data key wrapped by a KMS key. The server can decrypt to show the student their own diary. No copy, page or API ever promises end-to-end encryption until the key design (BE-WEL-04, open question 1) is settled. User-facing wording: "Your diary is encrypted at rest and never shown to parents."
4. **Trend points need at least 3 check-ins in a week.** Weeks with fewer return `null` values with `insufficient: true`, for the student view and the parent view alike.

## Data model

Schema `wellbeing`. Every table: `id uuid` PK (Guid v7), `created_at`, `updated_at`, `xmin`. `deleted_at` exists on the base entity, but `mood_entries` and `diary_entries` are hard-deleted (decision 2) and never have it set.

### user_keys

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique |
| wrapped_data_key | bytea | no | AES-256 data key encrypted by the KMS key (`GenerateDataKey`) |
| kms_key_id | varchar(200) | no | KMS key ARN or alias version |
| destroyed_at | timestamptz | yes | set on account deletion; `wrapped_data_key` overwritten with zero bytes (crypto-shredding) |

### mood_entries

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, recorded_at desc)` |
| recorded_at | timestamptz | no | server time of the check-in |
| local_date | date | no | in `Africa/Johannesburg`; unique `(user_id, local_date, slot)` |
| slot | smallint | no | check `between 1 and 3` (up to 3 check-ins a day) |
| mood | smallint | no | check `between 1 and 5` |
| stress | smallint | no | check `between 1 and 5` |
| tags | text[] | no | subset of `school`, `sleep`, `friends`, `family`, `health`, `other`; max 3 |
| note_ciphertext | bytea | yes | AES-256-GCM with the user's data key; plaintext max 500 chars |
| note_nonce | bytea | yes | 12 bytes |

### diary_entries

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, entry_date desc)` |
| entry_date | date | no | the day the entry is about (student-chosen, not in the future) |
| title_ciphertext | bytea | yes | plaintext max 120 chars |
| content_ciphertext | bytea | no | plaintext max 20 000 chars |
| nonce | bytea | no | per row; title and content use derived nonces |
| mood_tag | smallint | yes | check `between 1 and 5`; plain, not encrypted, so it can colour the list (open question 3) |
| word_count | int | no | stored plain for the list view |
| key_version | int | no | for re-encryption |

### reminder_settings

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique |
| enabled | boolean | no | default false (opt-in, gentle) |
| local_time | time | no | default 19:00 |
| days | smallint | no | bitmask Monday to Sunday |
| next_scheduled_at | timestamptz | yes | the pending scheduled message time (stale-message guard) |

## Contracts

```
public interface ISharedWellbeingTrend
{
    // Returns null when the student has not shared the trend with this parent (checked via IFamilySharingSettings).
    Task<SharedTrend?> GetForParentAsync(Guid parentUserId, Guid studentUserId, int weeks, CancellationToken ct);
}
public sealed record SharedTrend(IReadOnlyList<WeeklyPoint> Weeks, decimal? MoodAvg8w); // MoodAvg8w: mean mood over the last 8 sufficient weeks, null when none
public sealed record WeeklyPoint(DateOnly WeekStart, int CheckinCount, decimal? AverageMood, decimal? AverageStress, bool Insufficient);

public interface ICheckinStatus
{
    Task<bool> HasCheckedInTodayAsync(Guid userId, CancellationToken ct);
}

public sealed record CheckinRecorded(Guid UserId, DateOnly LocalDate, DateTimeOffset OccurredAt); // no mood values, no note
```

Consumed: `IFamilySharingSettings.GetAsync(Guid parentUserId, Guid studentUserId)` returning the link's flags (`ShareWellbeingTrend` bool) or null when not linked.

## Error codes

Stable strings in the ProblemDetails `code` extension (contract test BE-WEL-29).

| Code | HTTP | Meaning |
|---|---|---|
| `wellbeing.checkin_limit` | 409 | Already 3 check-ins today |
| `wellbeing.entry_not_found` | 404 | Unknown or not owned (diary or check-in) |
| `wellbeing.future_date` | 400 | Diary date in the future |
| `wellbeing.key_unavailable` | 503 | KMS unreachable; content cannot be read or written (fails closed, never stores plaintext) |
| `wellbeing.concurrency_conflict` | 409 | `xmin` mismatch on a diary update |

## Foundation tasks

- [ ] **BE-WEL-01** Module projects, `wellbeing` schema, `WellbeingDbContext`, design-time factory, architecture test registration
- [ ] **BE-WEL-10** Permission constants `wellbeing.manage` (student only); no parent or admin permission can read wellbeing tables
- [ ] **BE-WEL-02** `mood_entries` entity (mood, stress, tags, encrypted note), configuration, migration
- [ ] **BE-WEL-11** `user_keys` and the per-user key service: create a data key on first write via KMS `GenerateDataKey`, cache the unwrapped key in memory for 5 minutes per user, never log it; crypto-shred on deletion
- [ ] **BE-WEL-04** `diary_entries` entity and encryption handling: AES-256-GCM with the user's data key, unique nonce per row, associated data = row id plus user id (so ciphertext cannot be moved between rows or users), key version for rotation
- [ ] **BE-WEL-12** Hard-delete opt-out: entities marked `IHardDelete` bypass the soft-delete conversion in `AuditableEntityInterceptor` (SharedKernel change, coordinated with the platform backlog); architecture test that only `MoodEntry` and `DiaryEntry` carry the marker
- [ ] **BE-WEL-13** `ICheckinStatus` implementation (for the Progress dashboard): boolean only
- [ ] **BE-WEL-09** `ISharedWellbeingTrend` implementation: checks `IFamilySharingSettings` first (null or not shared returns null), then weekly aggregates with the 3 check-in rule; never notes, never daily values, never diary data
- [ ] **BE-WEL-06** Sharing settings applied: the trend read honours Family's per-link flag (decision 1); a unit test proves every path that reaches wellbeing data from a parent context goes through this check
- [ ] **BE-WEL-21** `reminder_settings` entity

## Slices

Group `/wellbeing`, tag `Wellbeing`. Every endpoint requires `wellbeing.manage` and filters by `user_id = current user`. Parents have no route into this group.

### BE-WEL-03  POST /wellbeing/checkins

| | |
|---|---|
| Operation id | `recordCheckin` |
| Permission | `wellbeing.manage` |
| Entitlement | `wellbeing.basic` (free) |
| Rate limit | `wellbeing-write` (20 per hour per user) |
| Idempotency | optional `Idempotency-Key`; the daily slot cap (3) bounds duplicates |
| Metric | `aptiverse.wellbeing.checkins.recorded` (counter, tag `hasNote`) |
| Log fields | `UserId`, `CheckinId`, `HasNote` (never mood, stress, tags or note) |

Request: `mood` 1 to 5; `stress` 1 to 5; `tags` 0 to 3 from the allowed set; `note` optional, max 500 chars, trimmed.

Response `201 CheckinView`: `id`, `recordedAt`, `mood`, `stress`, `tags`, `note`.

Failures: `400`; `409 wellbeing.checkin_limit`; `503 wellbeing.key_unavailable` (only when a note is present).

Events: `CheckinRecorded` (no values; Progress uses `ICheckinStatus` instead of the event for the dashboard).

- [ ] **BE-WEL-03** `POST /wellbeing/checkins` (original task, POST half)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (slot assignment under the unique index)
  - [ ] Unit tests: local date across SAST midnight
  - [ ] Integration tests: happy, fourth check-in 409, note stored encrypted (raw column is not the plaintext)

### BE-WEL-14  GET /wellbeing/checkins

| | |
|---|---|
| Operation id | `listCheckins` |
| Permission | `wellbeing.manage` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: private, no-store` |
| Metric | `aptiverse.wellbeing.checkins.list.duration` |
| Log fields | `UserId`, `Weeks` |

Request: `weeks` 1 to 26 (default 1), `includeEntries` bool (default true for 1 week).

Response `200 CheckinsView`: `weeks[]` of `WeeklyPoint` (decision 4), `today` (`checkedIn`, `slotsLeft`), and `entries[]` for the range (`id`, `recordedAt`, `mood`, `stress`, `tags`, `note`).

- [ ] **BE-WEL-14** `GET /wellbeing/checkins` week trend
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (aggregates in SQL; notes decrypted only for the returned page)
  - [ ] Unit tests: 3 check-in rule, week boundaries (Monday start, SAST)
  - [ ] Integration tests: empty, insufficient week, full week

### BE-WEL-15  DELETE /wellbeing/checkins/{id}

| | |
|---|---|
| Operation id | `deleteCheckin` |
| Permission | `wellbeing.manage` |
| Entitlement | none |
| Rate limit | `wellbeing-write` |
| Idempotency | deleting a missing entry returns `204` |
| Metric | `aptiverse.wellbeing.checkins.deleted` (counter) |
| Log fields | `UserId`, `CheckinId` |

Hard delete (decision 2). Query `noteOnly=true` clears only the note ciphertext and keeps the scores.

- [ ] **BE-WEL-15** Delete a check-in or its note
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: note-only branch
  - [ ] Integration tests: row gone from the table (not soft-deleted), another user's id 204 without effect

### BE-WEL-05  POST /wellbeing/diary

| | |
|---|---|
| Operation id | `createDiaryEntry` |
| Permission | `wellbeing.manage` |
| Entitlement | `diary` (free) |
| Rate limit | `wellbeing-write` |
| Idempotency | required `Idempotency-Key` (a flaky mobile connection must not create duplicates) |
| Metric | `aptiverse.wellbeing.diary.created` (counter), `aptiverse.wellbeing.diary.words` (histogram, bucketed) |
| Log fields | `UserId`, `EntryId`, `WordCount` (never title or content) |

Request: `entryDate` (today or earlier, not before 2 years ago), `title` optional max 120, `content` 1 to 20 000 chars, `moodTag` optional 1 to 5.

Response `201 DiaryEntryView`: `id`, `entryDate`, `title`, `content`, `moodTag`, `wordCount`, `createdAt`, `updatedAt`, plus `ETag`.

Failures: `400`; `400 wellbeing.future_date`; `503 wellbeing.key_unavailable`.

- [ ] **BE-WEL-05** `POST /wellbeing/diary` (original CRUD task, create part)
  - [ ] Endpoint (body cap 96 KB)
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: encrypt and decrypt round trip, associated data mismatch fails
  - [ ] Integration tests: happy, KMS down returns 503 and stores nothing, idempotent replay

### BE-WEL-17  GET /wellbeing/diary

| | |
|---|---|
| Operation id | `listDiaryEntries` |
| Permission | `wellbeing.manage` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: private, no-store` |
| Metric | `aptiverse.wellbeing.diary.list.duration` |
| Log fields | `UserId`, `ResultCount` |

Request: `before` cursor (`entryDate` plus id), `take` 1 to 50, `month` optional `yyyy-MM`.

Response `200 DiaryPage`: `entries[]` of `{ id, entryDate, title, excerpt (first 160 chars of content), moodTag, wordCount }`, `nextCursor`. Titles and excerpts are decrypted server-side for the owner only.

- [ ] **BE-WEL-17** `GET /wellbeing/diary`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (one key unwrap per request)
  - [ ] Unit tests: excerpt does not split a surrogate pair
  - [ ] Integration tests: paging, month filter, own only

### BE-WEL-18  GET /wellbeing/diary/{id}

Permission `wellbeing.manage`; rate limit `default`; `Cache-Control: private, no-store`; metric `aptiverse.wellbeing.diary.get.duration`; log fields `UserId`, `EntryId`. Response `200 DiaryEntryView` with `ETag`. `404 wellbeing.entry_not_found` for missing or not owned.

- [ ] **BE-WEL-18** `GET /wellbeing/diary/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: none beyond mapping
  - [ ] Integration tests: own, another user's 404

### BE-WEL-19  PATCH /wellbeing/diary/{id}

Permission `wellbeing.manage`; rate limit `wellbeing-write`; required `If-Match` (`412` on mismatch, `428` when missing); metric `aptiverse.wellbeing.diary.updated`; log fields `UserId`, `EntryId`, `WordCount`. Request: any of `entryDate`, `title`, `content`, `moodTag` with the create rules. Re-encrypts with a fresh nonce. Response `200 DiaryEntryView` with new `ETag`.

- [ ] **BE-WEL-19** `PATCH /wellbeing/diary/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: nonce changes on every update
  - [ ] Integration tests: happy, stale ETag 412, missing If-Match 428, 404

### BE-WEL-20  DELETE /wellbeing/diary/{id}

Permission `wellbeing.manage`; rate limit `wellbeing-write`; idempotent `204`; metric `aptiverse.wellbeing.diary.deleted`; log fields `UserId`, `EntryId`. Hard delete (decision 2); no undo. The UI confirms first.

- [ ] **BE-WEL-20** `DELETE /wellbeing/diary/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: hard delete path used
  - [ ] Integration tests: row gone (raw SQL check), idempotent, another user's id no effect

### BE-WEL-22  GET /wellbeing/summary

Permission `wellbeing.manage`; rate limit `default`; metric `aptiverse.wellbeing.summary.get.duration`; log fields `UserId`. Response `200 WellbeingSummary`: `today` (`checkedIn`, `slotsLeft`), `thisWeek` (`WeeklyPoint`), `diaryEntriesThisMonth` (count), `reminders` (`enabled`, `localTime`), `sharedWithParents` (list of linked parents with whether the trend is shared, read from `IFamilySharingSettings`, so the student always sees what is shared).

- [ ] **BE-WEL-22** Wellbeing summary for the student page
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: shared list mapping
  - [ ] Integration tests: no data, shared with one parent

### BE-WEL-23  GET /wellbeing/shared-preview

Permission `wellbeing.manage`; rate limit `default`; metric `aptiverse.wellbeing.shared_preview.reads`. Response `200 SharedTrend` exactly as a linked parent would see it (via the same `ISharedWellbeingTrend` code path with the student's own links), or `sharedWith: []` when nothing is shared. Lets the student verify the parent view.

- [ ] **BE-WEL-23** "What my parent sees" preview
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: identical output to the parent path
  - [ ] Integration tests: shared and not shared

### BE-WEL-24  GET and PUT /wellbeing/reminders

Permission `wellbeing.manage`; rate limit `default`; PUT idempotent; metric `aptiverse.wellbeing.reminders.updated` (tag `enabled`); log fields `UserId`, `Enabled`. Request: `enabled` bool, `localTime` `HH:mm` between 06:00 and 21:30 (no late-night nudges for minors), `days` array of weekday names (at least one when enabled). Saving reschedules the next reminder (BE-WEL-07).

- [ ] **BE-WEL-24** Reminder settings
  - [ ] Endpoints
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: next occurrence calculation in SAST
  - [ ] Integration tests: enable, disable cancels (stale guard), time window validation

### BE-WEL-08  GET /wellbeing/support-resources

| | |
|---|---|
| Operation id | `listSupportResources` |
| Permission | anonymous (people in crisis may not be signed in) |
| Entitlement | none |
| Rate limit | `default` (IP) |
| Idempotency | safe read; `Cache-Control: public, max-age=3600` |
| Metric | `aptiverse.wellbeing.support_resources.served` |
| Log fields | none beyond the request |

Response `200 SupportResources`: `items[]` of `{ name, description, phone, sms, whatsapp, url, hours, audience ("everyone", "under 18") }` from a versioned data file in the module (SADAG, Childline, Lifeline and others), plus `emergencyNumber` (10111 police, 10177 ambulance, 112 from a cell phone) and `lastVerifiedAt`.

- [ ] **BE-WEL-08** Support resources (static content)
  - [ ] Endpoint (`AllowAnonymous`)
  - [ ] Records
  - [ ] Validator (empty)
  - [ ] Handler reading the embedded data file
  - [ ] Unit tests: data file schema
  - [ ] Integration tests: anonymous OK
- [ ] **BE-WEL-25** Every number and link in the support data file verified by a human against the organisation's own site, with `lastVerifiedAt`; repeated quarterly (task in the runbook)

## Background work

- [ ] **BE-WEL-07** Gentle check-in reminders: `SendCheckinReminder(userId, scheduledFor)` scheduled message at the next enabled day and time; skipped when the user already checked in today, when notification preferences disable the `wellbeing_reminder` type or channel, or when `scheduledFor` no longer matches `next_scheduled_at`; then schedules the next one; copy is neutral ("A moment to check in, if you like"), never guilt-based
- [ ] **BE-WEL-26** `AccountDeletionRequested` handler: hard-deletes `mood_entries`, `diary_entries`, `reminder_settings`, then crypto-shreds `user_keys` (immediately, not after 30 days, because the content is special personal information)
- [ ] **BE-WEL-27** Data export contributor (BE-IDN-37): decrypts and returns the user's check-ins and diary as JSON to the user's own export only; the export job runs in the Worker and the file is encrypted in S3 with a short-lived link
- [ ] **BE-WEL-28** Key rotation job: re-wraps data keys when the KMS key rotates (`kms_key_id` changes) and re-encrypts rows with an old `key_version`, in batches

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Information disclosure: parent reads a diary | Any parent path | No parent permission on `/wellbeing`; only `ISharedWellbeingTrend` (aggregates) crosses the boundary; architecture test that no Contracts type carries diary or note text | BE-WEL-40 |
| Information disclosure: admin or support reads a diary | Admin module, DB access | Encrypted at rest; no admin endpoint; DB access to plaintext requires KMS decrypt permission held only by the app role; KMS access is logged (CloudTrail) | BE-WEL-41 |
| Information disclosure: logs, traces, errors | Everywhere | Log sink test; no content in spans; ProblemDetails never echo input | BE-WEL-42 |
| Information disclosure: AI | AiTutor | Wellbeing exposes no content contract; architecture test that AiTutor does not reference `Aptiverse.Wellbeing.Contracts` | BE-WEL-43 |
| Tampering: ciphertext swap between rows | Diary | AES-GCM associated data binds row id and user id | BE-WEL-04 |
| Spoofing | All | JWT, permission, ownership | BE-WEL-40 |
| Repudiation | Deletions | Deletion is intentionally untracked beyond a count metric (no content kept); account-level deletion recorded by Identity | BE-WEL-26 |
| Denial of service: KMS outage | Writes and reads of content | Fails closed with `503 wellbeing.key_unavailable`; scores without notes still save | BE-WEL-46 |

- [ ] **BE-WEL-40** Threat model in the README; authorisation matrix test per endpoint (anonymous, parent, admin, other student, owner); a parent token gets 403 on every `/wellbeing` route except support resources
- [ ] **BE-WEL-41** IAM: only the API and Worker task roles have `kms:Decrypt` on the wellbeing key; infra task cross-referenced; CloudTrail data events on the key enabled
- [ ] **BE-WEL-42** Log and trace sink test: no request body fields from this module appear in logs, spans or Sentry events; Sentry `beforeSend` scrubs `/wellbeing` bodies
- [ ] **BE-WEL-43** Architecture tests: no Contracts record exposes `Content`, `Title` or `Note`; AiTutor and Admin do not reference Wellbeing Contracts

### Input limits, rate limits, idempotency, concurrency

- [ ] **BE-WEL-44** Body caps (diary 96 KB, others 4 KB), field limits as above, Unicode normalisation (NFC) before length checks; tests
- [ ] **BE-WEL-45** Rate-limit policy `wellbeing-write` 20 per hour per user (diary and check-ins), from config; test
- [ ] **BE-WEL-46** Idempotency key on diary create; `If-Match` on diary update; check-in slot uniqueness handles double taps; KMS outage chaos test

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `diary_entries.*_ciphertext` | Special personal information (health, mental state) of a possible minor | Until the student deletes it (hard delete) or the account is deleted (immediate crypto-shred) |
| `mood_entries.mood`, `stress`, `tags` | Special personal information (health) | Same |
| `mood_entries.note_ciphertext` | Special personal information | Same; can be cleared on its own |
| `reminder_settings` | Personal information | Deleted with the account |
| `user_keys` | Key material | Destroyed on account deletion |

- [ ] **BE-WEL-47** Classification in the README and the POPIA processing inventory; legal basis recorded as consent (section 27(1)(a)) with the parental consent flow for under-18s (BE-FAM-14); privacy notice wording reviewed: "encrypted at rest and never shown to parents", never "end-to-end"
- [ ] **BE-WEL-48** Backup policy note: RDS snapshots keep deleted rows until snapshot expiry; crypto-shredding makes them unreadable for deleted accounts; for single-entry deletions the snapshot retention window (7 days, HRD) is disclosed in the privacy policy

### Audit

- [ ] **BE-WEL-49** Audit events: key destroyed (user id, time), key rotation runs, export generated containing wellbeing data (no content)

### Observability

- [ ] **BE-WEL-50** Trace spans: `wellbeing.key.unwrap` (attribute `cache_hit`), `wellbeing.encrypt`, `wellbeing.decrypt`, `wellbeing.trend.compute`; no content attributes
- [ ] **BE-WEL-51** Metrics on meter `Aptiverse.Wellbeing`: `aptiverse.wellbeing.kms.calls` (counter, tag `operation`), `aptiverse.wellbeing.kms.errors` (counter), `aptiverse.wellbeing.reminders.sent` (counter), `aptiverse.wellbeing.reminders.skipped` (counter, tag `reason`), `aptiverse.wellbeing.decrypt_failures` (counter)
- [ ] **BE-WEL-52** Alerts: any decrypt failure (data corruption or key mismatch); KMS error rate above 1% over 10 minutes; reminder lag p95 above 15 minutes

### Performance budgets

- [ ] **BE-WEL-53** Budgets: check-in write p95 under 120 ms (KMS cached); diary list p95 under 200 ms for 50 entries; trend p95 under 100 ms for 26 weeks; KMS calls at most one per user per 5 minutes per instance; `EXPLAIN` on the trend aggregate

### Migration safety and SLO

- [ ] **BE-WEL-54** Expand and contract; encryption format changes are versioned (`key_version`) and migrated by the rotation job, never by an in-place SQL rewrite; rollback keeps the old key versions readable
- [ ] **BE-WEL-55** SLOs: check-in and diary availability 99.5% (KMS outages included in the budget); inside the platform p95 SLO

### Further tests

- [ ] **BE-WEL-56** Parent exfiltration test suite: a parent linked with sharing on, sharing off, and an unlinked parent each try every Family and Wellbeing route; only weekly aggregates with the 3 check-in rule are ever returned
- [ ] **BE-WEL-57** Crypto-shredding test: after account deletion, raw ciphertext still in a restored copy cannot be decrypted (key gone)
- [ ] **BE-WEL-58** Property-based test: weekly aggregation never returns a value for a week with fewer than 3 check-ins, and averages stay within 1 to 5
- [ ] **BE-WEL-59** Copy review of reminder and support-resource text by a human (tone, no guilt, correct numbers)
- [ ] **BE-WEL-60** Local dev: a local KMS substitute (static key from `appsettings.Development.json` pointing at the compose stack only), boot fails if it is used outside Development

## Old data mapping

| Old (43f9faa) | New | Notes (feeds MIG-14) |
|---|---|---|
| `wellbeing.mood_trackings` (`StudentId`, `Mood` string, `MoodScore` int, `EnergyLevel`, `StressLevel` strings, `SleepQuality`, `SleepHours`, `Triggers`, `CopingStrategies`, `Notes`, `TrackedAt`) | `wellbeing.mood_entries` | `MoodScore` mapped onto 1 to 5 (scale confirmed in MIG-14), `StressLevel` string mapped onto 1 to 5, `Notes` encrypted into `note_ciphertext`; energy, sleep, triggers and coping fields dropped (minimisation); more than 3 entries on a day keep the latest 3 |
| `wellbeing.diary_entries` (`Title`, `Content` plain text, `Mood`, `MoodIntensity`, `EntryType`, `Tags`, `IsPrivate`, `EntryDate`, `SentimentAnalysis`, `SentimentScore`, `KeyThemes`, `AiInsights`, `NeedsFollowUp`, `FollowUpAction`) | `wellbeing.diary_entries` | Title and content encrypted with the user's new data key during ETL; `MoodIntensity` to `mood_tag`; all sentiment and AI columns dropped and not copied anywhere (decision 7); `IsPrivate` dropped (every entry is private) |
| `wellbeing.diary_goals` | none | Not in v1 (habit goals are out) |
| Old endpoints `GET /wellbeing/counsellors`, `GET /wellbeing/summary` | `GET /wellbeing/summary` (BE-WEL-22); counsellors dropped | |

The ETL must never write decrypted diary text to logs or intermediate files; it encrypts in memory row by row.

## Tests

- Unit: encryption round trip and tamper detection, slot assignment, week aggregation with the 3 check-in rule, reminder scheduling, support data schema.
- Integration: every slice happy, validation, forbidden, not found; hard delete verified with raw SQL; KMS outage; parent exfiltration suite (BE-WEL-56).
- Property-based: BE-WEL-58.

## Contracts requested by other modules

- [ ] **BE-WEL-61** Impersonation privacy: every diary and check-in-note read checks the impersonation claim and returns 403 `wellbeing.private_during_impersonation` with no content; integration test with an impersonation token

## Open questions

1. Decided (36): server-held per-user keys (BE-WEL-04); copy says "encrypted at rest and never shown to parents" and never claims end-to-end. A passphrase-derived key is not planned.
2. Decided (DECISIONS.md E): Family owns the parent sharing flags and Wellbeing reads them (decision 1 above stands).
3. `mood_tag` on diary entries is stored unencrypted so the list can show it; encrypt it too and decrypt per page?
4. Should the reminder window (06:00 to 21:30) differ for adult university students?
5. Should a check-in with a very low mood show support resources inline? Recommended yes (no storage, no notification), but needs the same safeguarding review as BE-AI-43.
