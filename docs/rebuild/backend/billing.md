# Billing module

| | |
|---|---|
| ID range | `BE-BIL-01` to `BE-BIL-25` (original), `BE-BIL-26` to `BE-BIL-67` (splits and additions), `BE-BIL-70` to `BE-BIL-100` (production readiness) |
| Schema | `billing` |
| Projects | `src/Modules/Billing/Aptiverse.Billing`, `src/Modules/Billing/Aptiverse.Billing.Contracts`, `tests/Aptiverse.Billing.UnitTests` |
| Phase | 6 |
| Consumes | `Aptiverse.Identity.Contracts` (`UserRegistered`, `AccountDeletionRequested`, `IUserProfileLookup`, `IMarketingConsentLookup`, only for the deferred BE-BIL-24), `Aptiverse.Family.Contracts` (`IFamilyLinkLookup`, for seats), `Aptiverse.Notifications.Contracts` (`NotifyUser`, email template commands) |
| Publishes | `PaymentSucceeded`, `PaymentFailed`, `SubscriptionRenewed`, `SubscriptionStatusChanged`, `RefundIssued`, `DisputeOpened`, `SeatAssigned`, `SeatRemoved`, `CheckoutStarted`; implements `IUsageMeter`, `IEntitlements`, `IOneOffCheckout` (deferred, decision 6), `IPaystackCockpit`, `IBillingAdminQueries`, `IssueRefund` command handler |
| Depends on | BE-SK-13, BE-SK-22, BE-SK-23, BE-SK-24, BE-SK-25, BE-SK-26, BE-SK-28, BE-IDN-28 (entitlements in `/me`), BE-NTF-03 (templates) |
| Status | Not started (0 of 99 tasks; 6 deferred: BE-BIL-24, 59, 60, 63, 64, 65) |

## Responsibilities and out of scope

Responsible for:

- The plan catalog (features, quotas, prices in cents, VAT) as seed data, and syncing plans to Paystack as an explicit admin action.
- Checkout, verify on return, the Paystack webhook inbox with exactly-once processing, the subscription state machine, seats for parent plans.
- Entitlements: the resolver behind `.RequireFeature()` and `/me`.
- Usage metering for quotas: reserve, confirm, refund, expiry. Fails closed.
- Invoices (VAT-compliant numbering), receipts, refunds, disputes.
- Nightly reconciliation against the Paystack API, with a drift report.
- Publishing money events that Affiliates and Family consume.

Out of scope:

- Commission maths (Affiliates reacts to `PaymentSucceeded`, `SubscriptionRenewed`, `RefundIssued`).
- Admin screens (Admin module reads through `IBillingAdminQueries` and `IPaystackCockpit`).
- Email rendering (Notifications owns templates; Billing publishes the data).
- Tutor commission, bookings, course selling, marketplace: none in v1.

## Data model

Schema `billing`. Every table: `id uuid` PK (Guid v7), `created_at`, `updated_at`, `deleted_at`, `xmin`, except append-only tables (marked), which are insert-only and never soft-deleted. Money is `bigint` cents plus `currency char(3)` (always `ZAR` in v1, check constraint).

### plans

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| code | varchar(40) | no | unique (for example `free`, `student.pro`, `parent.2`) |
| name | varchar(80) | no | |
| description | varchar(400) | no | |
| kind | varchar(16) | no | check `in ('free','paid','custom')` |
| audience | varchar(16) | no | check `in ('student','parent')` |
| max_seats | int | no | check `between 1 and 10` |
| is_public | boolean | no | listed on pricing |
| sort_order | int | no | |
| is_active | boolean | no | inactive plans keep existing subscriptions but cannot be bought |

### plan_prices

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| plan_id | uuid | no | FK `plans.id`, index; partial unique `(plan_id, interval) where is_active` |
| interval | varchar(16) | no | check `in ('monthly','annual')` |
| amount_cents | bigint | no | check `> 0`; VAT inclusive |
| currency | char(3) | no | check `= 'ZAR'` |
| paystack_plan_code | varchar(40) | yes | unique; null until synced |
| paystack_synced_at | timestamptz | yes | |
| is_active | boolean | no | a price change creates a new row; old rows stay for existing subscriptions |

### plan_features

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| plan_id | uuid | no | FK, unique `(plan_id, feature_key)` |
| feature_key | varchar(60) | no | index; keys listed in `FeatureKeys` constants |
| label | varchar(80) | no | display label for pricing |
| is_live | boolean | no | false while the feature is sold but not yet shipped |

### plan_quotas

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| plan_id | uuid | no | FK, unique `(plan_id, quota_key)` |
| quota_key | varchar(40) | no | `ai.quick`, `ai.deep`, `ai.help` (help bot, its own quota), `practice.generate`, `practice.essay_feedback` |
| per_period | int | no | check `per_period >= -1`; `-1` unlimited, `0` disabled |
| pooled | boolean | no | default false; when true the meter is per subscription and shared by seats (not used in v1: each covered child gets the covered plan's own quotas, as in the old coverage model; see open question 13) |

### paystack_customers

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique |
| customer_code | varchar(40) | no | unique |
| email | varchar(256) | no | billing email at creation |

### payment_methods

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index |
| authorization_code_encrypted | bytea | no | AES-256-GCM via `IFieldEncryptor`, key id below |
| encryption_key_id | varchar(64) | no | |
| card_signature_hash | char(64) | yes | SHA-256 of Paystack's card `signature` plus pepper; used for fraud fingerprints; index |
| brand | varchar(20) | yes | |
| last4 | char(4) | yes | |
| exp_month | smallint | yes | check `between 1 and 12` |
| exp_year | smallint | yes | |
| bank | varchar(60) | yes | |
| reusable | boolean | no | |
| is_default | boolean | no | partial unique `(user_id) where is_default and deleted_at is null` |

### checkout_sessions

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, status)` |
| purpose | varchar(20) | no | check `in ('subscription','upgrade','one_off')` |
| plan_price_id | uuid | yes | FK, index; required for subscription and upgrade |
| subscription_id | uuid | yes | FK, index |
| reference | varchar(64) | no | unique; generated server-side (`apt_<guid v7 hex>`) |
| access_code | varchar(64) | yes | |
| authorization_url | varchar(500) | yes | |
| amount_cents | bigint | no | check `> 0` |
| currency | char(3) | no | |
| status | varchar(16) | no | check `in ('open','paid','abandoned','failed')` |
| expires_at | timestamptz | no | created plus 24 h |
| correlation_type | varchar(32) | yes | for `one_off`; no v1 caller (pledges deferred, decision 6), kept so the column exists when one-off payments return |
| correlation_id | uuid | yes | index |

### subscriptions

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| owner_user_id | uuid | no | partial unique `(owner_user_id, audience) where status in ('trialing','active','past_due','cancelling')`; index |
| audience | varchar(16) | no | copied from plan |
| plan_id | uuid | no | FK, index |
| plan_price_id | uuid | yes | FK, index; null for trials |
| status | varchar(16) | no | check `in ('incomplete','trialing','active','past_due','cancelling','paused','cancelled','expired')`; index; `trialing` is unreachable in v1 (no trial, decision 51) and kept only so migrated rows and a later trial need no schema change |
| comped | boolean | no | admin-granted free subscription with no Paystack objects |
| comp_ends_at | timestamptz | yes | required when comped |
| comp_reason | varchar(200) | yes | |
| interval | varchar(16) | yes | |
| current_period_start | timestamptz | yes | |
| current_period_end | timestamptz | yes | index (period-end scheduler and reconciliation) |
| trial_ends_at | timestamptz | yes | |
| past_due_since | timestamptz | yes | |
| renewal_failure_count | int | no | check `>= 0` |
| pending_plan_price_id | uuid | yes | FK, index; a scheduled downgrade |
| pending_change_at | timestamptz | yes | equals `current_period_end` when set |
| cancelled_at | timestamptz | yes | |
| ended_at | timestamptz | yes | |
| paystack_subscription_code | varchar(40) | yes | unique |
| paystack_email_token_encrypted | bytea | yes | required by Paystack enable and disable |
| encryption_key_id | varchar(64) | yes | |
| payment_method_id | uuid | yes | FK, index |

### subscription_transitions (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| subscription_id | uuid | no | FK, index `(subscription_id, occurred_at)` |
| from_status | varchar(16) | yes | |
| to_status | varchar(16) | no | |
| transition | varchar(8) | no | transition id `T01` to `T18` from the state machine |
| trigger_type | varchar(16) | no | check `in ('webhook','user','scheduler','admin','reconciliation')` |
| trigger_ref | varchar(100) | yes | paystack event id, user id or job id |
| occurred_at | timestamptz | no | |

### seats

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| subscription_id | uuid | no | FK, partial unique `(subscription_id, user_id) where removed_at is null` |
| user_id | uuid | no | index |
| role | varchar(8) | no | check `in ('owner','member')` |
| covered_plan_id | uuid | yes | FK `plans.id`, index; for parent plans, the student plan this child is covered on (`student.pro` only in v1; `student.max` is seeded inactive, decision 12); the child's entitlements and quotas come from this plan |
| assigned_by_user_id | uuid | no | |
| removed_at | timestamptz | yes | |

### invoices

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| number | varchar(20) | no | unique, gapless per year (`APT-2026-000123`), from `invoice_sequences` |
| user_id | uuid | no | index `(user_id, issued_at desc)` |
| subscription_id | uuid | yes | FK, index |
| status | varchar(20) | no | check `in ('paid','refunded','partially_refunded','void')` |
| is_tax_invoice | boolean | no | true only when VAT registered |
| period_start | timestamptz | yes | |
| period_end | timestamptz | yes | |
| subtotal_cents | bigint | no | excl. VAT |
| vat_cents | bigint | no | check `>= 0` |
| total_cents | bigint | no | check `total_cents = subtotal_cents + vat_cents` |
| vat_rate_bps | int | no | 1500 when registered, else 0 |
| currency | char(3) | no | |
| billing_name | varchar(120) | no | snapshot |
| billing_email | varchar(256) | no | snapshot |
| issued_at | timestamptz | no | |
| pdf_s3_key | varchar(300) | yes | |

### invoice_lines

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| invoice_id | uuid | no | FK cascade, index |
| description | varchar(200) | no | |
| quantity | int | no | check `> 0` |
| unit_amount_cents | bigint | no | VAT inclusive |
| amount_cents | bigint | no | check `amount_cents = quantity * unit_amount_cents` |

### invoice_sequences

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| year | int | no | unique |
| next_value | int | no | incremented under `select ... for update` |

### payments

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index `(user_id, paid_at desc)` |
| invoice_id | uuid | yes | FK, index |
| subscription_id | uuid | yes | FK, index |
| checkout_session_id | uuid | yes | FK, index |
| paystack_reference | varchar(100) | no | unique |
| paystack_transaction_id | bigint | no | unique |
| amount_cents | bigint | no | check `> 0` |
| fees_cents | bigint | yes | Paystack fees |
| currency | char(3) | no | |
| status | varchar(16) | no | check `in ('succeeded','failed','reversed')` |
| channel | varchar(20) | yes | `card`, `eft`, and so on |
| purpose | varchar(20) | no | `subscription`, `renewal`, `upgrade`, `one_off` |
| card_signature_hash | char(64) | yes | index |
| paid_at | timestamptz | no | |

### refunds

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| payment_id | uuid | no | FK, index |
| amount_cents | bigint | no | check `> 0`; sum per payment must not exceed payment amount (handler plus test) |
| reason | varchar(200) | no | |
| status | varchar(16) | no | check `in ('pending','processed','failed')` |
| paystack_refund_id | bigint | yes | unique |
| requested_by_user_id | uuid | no | admin id |
| processed_at | timestamptz | yes | |

### disputes

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| payment_id | uuid | no | FK, index |
| paystack_dispute_id | bigint | no | unique |
| status | varchar(20) | no | check `in ('open','awaiting_merchant','resolved_won','resolved_lost')` |
| amount_cents | bigint | no | |
| due_at | timestamptz | yes | |

### paystack_events (inbox)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| dedupe_key | char(64) | no | unique; see BE-BIL-11 |
| event_type | varchar(60) | no | index |
| object_ref | varchar(100) | yes | reference, subscription code or dispute id; index |
| payload | jsonb | no | raw body as received |
| body_sha256 | char(64) | no | |
| source | varchar(16) | no | check `in ('webhook','reconciliation')` |
| status | varchar(16) | no | check `in ('pending','processing','processed','ignored','failed')`; index `(status, received_at)` |
| attempts | int | no | |
| received_at | timestamptz | no | |
| processed_at | timestamptz | yes | |
| last_error_code | varchar(64) | yes | |

### usage_meters

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| subject_type | varchar(16) | no | check `in ('user','subscription')` |
| subject_id | uuid | no | |
| quota_key | varchar(40) | no | |
| period_start | timestamptz | no | unique `(subject_type, subject_id, quota_key, period_start)` |
| period_end | timestamptz | no | |
| used | int | no | check `used >= 0` |
| reserved | int | no | check `reserved >= 0` |

### usage_reservations

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| meter_id | uuid | no | FK, index |
| user_id | uuid | no | index |
| amount | int | no | check `> 0` |
| status | varchar(16) | no | check `in ('reserved','confirmed','refunded','expired')`; index `(status, expires_at)` |
| confirmed_amount | int | yes | |
| correlation | varchar(100) | no | for example `conversation:<id>` |
| expires_at | timestamptz | no | created plus 15 min |
| resolved_at | timestamptz | yes | |

### feature_usage (append-only ledger)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| meter_id | uuid | no | FK, index |
| reservation_id | uuid | yes | FK, index |
| user_id | uuid | no | index `(user_id, occurred_at)` |
| quota_key | varchar(40) | no | |
| delta_used | int | no | positive on confirm, negative on admin correction |
| kind | varchar(16) | no | check `in ('confirm','refund','expire','admin_adjust')` |
| occurred_at | timestamptz | no | |

Invariant (tested): for every meter, `used = sum(delta_used)` over its ledger rows.

### reconciliation_runs and reconciliation_drifts

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| runs: window_from, window_to | timestamptz | no | |
| runs: status | varchar(16) | no | check `in ('running','succeeded','failed')` |
| runs: checked_count, drift_count | int | no | |
| drifts: run_id | uuid | no | FK, index |
| drifts: kind | varchar(40) | no | check `in ('missing_local_payment','missing_remote_payment','amount_mismatch','status_mismatch','subscription_status_mismatch','unprocessed_event')` |
| drifts: paystack_ref | varchar(100) | yes | index |
| drifts: local_id | uuid | yes | |
| drifts: expected, actual | varchar(200) | yes | |
| drifts: resolved_at | timestamptz | yes | |
| drifts: resolution | varchar(200) | yes | |

## Subscription state machine

| Id | From | To | Trigger |
|---|---|---|---|
| T01 | (none) | incomplete | checkout started |
| T02 | incomplete | active | `charge.success` for the session reference, amount verified |
| T03 | incomplete | expired | checkout session expiry (24 h) |
| T04 | (none) | trialing | trial started (BE-BIL-59) |
| T05 | trialing | active | checkout paid during or at the end of trial |
| T06 | trialing | expired | trial end with no payment |
| T07 | active | active | renewal `charge.success` (period extended, `SubscriptionRenewed`) |
| T08 | active | past_due | `invoice.payment_failed` or failed renewal charge |
| T09 | past_due | active | successful retry charge |
| T10 | past_due | cancelled | grace period (7 days) exhausted, or `subscription.disable` |
| T11 | active | cancelling | user cancel or `subscription.not_renew` |
| T12 | cancelling | active | user resume before period end |
| T13 | cancelling | cancelled | period end reached |
| T14 | active | active (downgrade scheduled) | downgrade requested: `pending_plan_price_id` set |
| T15 | active (downgrade scheduled) | active | period end: pending plan applied, new Paystack subscription created |
| T16 | active (downgrade scheduled) | active | scheduled change cancelled |
| T17 | active | active (upgraded) | upgrade paid: new plan, new period starts now |
| T18 | cancelled | expired | data retention marker after 90 days (no entitlement change) |
| T19 | active | paused | billing paused at Paystack (disable); entitled until period end, then not entitled but resumable |
| T20 | paused | active | billing resumed at Paystack (enable, or a new subscription with the stored authorization when the period has ended) |
| T21 | (none) | active (comped) | admin comp; ends by scheduled message at `comp_ends_at` (to `expired`) |

Entitled statuses: `trialing`, `active` (including comped), `past_due` (during grace), `cancelling`, and `paused` until `current_period_end`.

Children's cover: seats on a parent plan carry the child's cover. Cancelling or pausing the parent plan never ends a child's cover by itself (old behaviour at 43f9faa, where cover lived on separate per-child subscriptions); see open question 15 for who pays once the parent plan has ended. Every transition writes `subscription_transitions` and publishes `SubscriptionStatusChanged` when the status value changes.

## Error codes

Every expected failure returns RFC 9457 ProblemDetails with a stable `code` extension. The web app switches on these strings, so they are part of the contract: renaming one is a breaking change, and a test (BE-BIL-99) asserts the list below matches the `Error` constants in the module.

| Code | HTTP | Meaning |
|---|---|---|
| `billing.feature_required` | 403 | Endpoint needs a feature the user lacks (`feature` extension names it) |
| `billing.quota_exhausted` | 429 | Quota used up (`quotaKey`, `resetsAt` extensions) |
| `billing.quota_unavailable` | 503 | Meter could not be read; fails closed |
| `billing.plan_not_found` | 404 | Unknown, inactive or non-public plan |
| `billing.plan_not_synced` | 409 | Price has no Paystack plan code yet |
| `billing.already_subscribed` | 409 | An entitled subscription exists for the audience |
| `billing.payer_must_be_adult` | 403 | Under-18 tried to pay (if open question 9 says so) |
| `billing.checkout_unavailable` | 503 | Paystack unreachable or circuit open at checkout |
| `billing.provider_error` | 502 | Paystack returned an error |
| `billing.provider_unavailable` | 503 | Paystack unreachable on a non-checkout action |
| `billing.checkout_not_found` | 404 | Reference not owned or unknown |
| `billing.no_active_subscription` | 409 | Action needs an entitled subscription |
| `billing.not_an_upgrade` / `billing.not_a_downgrade` | 409 | Wrong direction for the action |
| `billing.change_pending` | 409 | Cancel the scheduled change first |
| `billing.cannot_resume` | 409 | Not cancelling, or period already ended |
| `billing.trial_used` | 409 | One trial per user |
| `billing.not_linked` | 403 | Seat target is not a linked child |
| `billing.no_free_seats` | 409 | Plan seat limit reached |
| `billing.illegal_transition` | 409 | State machine refused the transition |
| `billing.concurrency_conflict` | 409 | `xmin` mismatch |
| `billing.webhook_bad_signature` | 401 | Webhook HMAC mismatch |

## Contracts

```
public interface IUsageMeter
{
    Task<Result<UsageReservation>> ReserveAsync(Guid userId, string quotaKey, int amount, string correlation, CancellationToken ct);
    Task<Result> ConfirmAsync(Guid reservationId, int actualAmount, CancellationToken ct);
    Task<Result> RefundAsync(Guid reservationId, string reason, CancellationToken ct);
    Task<UsageSnapshot> GetAsync(Guid userId, string quotaKey, CancellationToken ct);
}
public sealed record UsageReservation(Guid ReservationId, int Remaining, DateTimeOffset ResetsAt);
public sealed record UsageSnapshot(string QuotaKey, int Used, int Reserved, int? Limit, bool Unlimited, DateTimeOffset ResetsAt);

public interface IEntitlements
{
    Task<bool> HasFeatureAsync(Guid userId, string featureKey, CancellationToken ct);
    Task<EntitlementSet> GetAsync(Guid userId, CancellationToken ct);
}
public sealed record EntitlementSet(IReadOnlyList<string> Features, IReadOnlyList<string> PlanCodes, string? SubscriptionStatus);

public interface IOneOffCheckout   // deferred: decision 6, not in v1
{
    Task<Result<OneOffCheckoutStarted>> StartAsync(Guid userId, long amountCents, string description,
        string correlationType, Guid correlationId, Uri callbackUrl, CancellationToken ct);
}

public interface IBillingAdminQueries { /* paged subscriptions, payments, refunds, drifts for BE-ADM-05 */ }
public interface IPaystackCockpit { /* balance, transactions, settlements, customer lookup for BE-ADM-06 */ }
public sealed record IssueRefund(Guid PaymentId, long AmountCents, string Reason, Guid AdminUserId);

public sealed record PaymentSucceeded(Guid PaymentId, Guid UserId, Guid? SubscriptionId, string? PlanCode,
    long AmountCents, long VatCents, string Currency, string Purpose, bool IsFirstPaymentForUser,
    string? CardSignatureHash, string? CorrelationType, Guid? CorrelationId, DateTimeOffset PaidAt);
public sealed record PaymentFailed(Guid UserId, Guid? SubscriptionId, string Reason, DateTimeOffset OccurredAt);
public sealed record SubscriptionRenewed(Guid SubscriptionId, Guid UserId, Guid PaymentId, string PlanCode,
    long AmountCents, DateTimeOffset PeriodStart, DateTimeOffset PeriodEnd);
public sealed record SubscriptionStatusChanged(Guid SubscriptionId, Guid OwnerUserId, string PlanCode,
    string? FromStatus, string ToStatus, string Transition, DateTimeOffset OccurredAt);
public sealed record RefundIssued(Guid RefundId, Guid PaymentId, Guid UserId, long AmountCents, bool IsFullRefund,
    DateTimeOffset ProcessedAt);
public sealed record DisputeOpened(Guid PaymentId, Guid UserId, long AmountCents, DateTimeOffset OccurredAt);
public sealed record SeatAssigned(Guid SubscriptionId, Guid UserId, DateTimeOffset OccurredAt);
public sealed record SeatRemoved(Guid SubscriptionId, Guid UserId, DateTimeOffset OccurredAt);
public sealed record CheckoutStarted(Guid CheckoutSessionId, Guid UserId, string PlanCode, long AmountCents, string? ReferralCode, DateTimeOffset OccurredAt);
```

## Foundation tasks

- [ ] **BE-BIL-01** Module projects, `billing` schema, `BillingDbContext`, design-time factory, architecture test registration
- [ ] **BE-BIL-26** Permission constants `billing.manage` (own subscription; student and parent), `billing.admin` (admin: plan sync, refunds, drift resolution)
- [ ] **BE-BIL-02** `plans`, `plan_features`, `plan_quotas` entities and idempotent `IDataSeeder` (Free, Student Pro, Parent 1 to 4 children; Student Max seeded inactive per decision 12; tutor and school plans not seeded in v1)
- [ ] **BE-BIL-27** `plan_prices` entity and seed (cents, VAT inclusive, monthly and annual), price change creates a new row
- [ ] **BE-BIL-03** `subscriptions`, `subscription_transitions`, `seats` entities, configurations, partial unique indexes
- [ ] **BE-BIL-28** `invoices`, `invoice_lines`, `invoice_sequences`, `payments`, `refunds`, `disputes` entities with the check constraints above
- [ ] **BE-BIL-29** `paystack_customers`, `payment_methods` (encrypted authorization code via `IFieldEncryptor`, peppered card signature hash)
- [ ] **BE-BIL-30** `checkout_sessions` entity
- [ ] **BE-BIL-04** `usage_meters`, `usage_reservations`, `feature_usage` entities; `IUsageMeter.ReserveAsync` as one atomic `update ... set reserved = reserved + @n where ... and (limit < 0 or used + reserved + @n <= limit) returning`; no row means exhausted; any exception propagates (fail closed)
- [ ] **BE-BIL-31** `ConfirmAsync` and `RefundAsync`: one transaction moving `reserved` to `used` (or releasing it) plus the ledger row; idempotent on already resolved reservations
- [ ] **BE-BIL-32** Meter subject resolution: per user by default (a covered child gets the covered plan's quotas on their own meter); pooled plans (none in v1) use the subscription as subject; limit resolution takes the best of all entitled plans (unlimited wins), period = calendar month in `Africa/Johannesburg`
- [ ] **BE-BIL-05** `IEntitlements` resolver: free plan features plus every entitled subscription the user owns or holds a seat on; `HybridCache` 60 s per user, invalidated by tag on `SubscriptionStatusChanged`, `SeatAssigned`, `SeatRemoved`
- [ ] **BE-BIL-33** Back `.RequireFeature()` (BE-SK-28) and `/me` entitlements (BE-IDN-28) with `IEntitlements`; returns `403` with code `billing.feature_required` and `feature` extension so the web shows the upgrade state
- [ ] **BE-BIL-06** Paystack client (internal) on the resilience pipeline: typed calls for transaction initialize and verify, charge authorization, subscription create, fetch, enable, disable and manage link, plan create and update, refund create, customer create, transaction list, settlement list, balance; secret from Secrets Manager; 10 s timeout, retries only on idempotent GETs and on POSTs that carry our own reference
- [ ] **BE-BIL-36** Paystack fake (WireMock.Net) with recorded responses and signed webhook generator for integration tests and local dev
- [ ] **BE-BIL-13** Subscription state machine: a pure `SubscriptionStateMachine` with the transition table above, guards, and side-effect descriptors; illegal transitions return `Error.Conflict("billing.illegal_transition")`
- [ ] **BE-BIL-42** One test per transition T01 to T18, plus a test that every pair not in the table is refused
- [ ] **BE-BIL-51** VAT and invoice maths (pure): VAT inclusive split `vat = round_half_even(total * rate / (10000 + rate))`, gapless invoice numbering under row lock, `is_tax_invoice` from config `Billing:Vat:Registered`; supplier VAT number and address from config on every tax invoice
- [ ] **BE-BIL-12** Inbox processor framework: `ProcessPaystackEvent(eventId)` Wolverine message; claims the row (`pending` to `processing` with `xmin`), dispatches by `event_type`, marks `processed` in the same transaction as the handler's writes and outbox events; unknown types become `ignored`; failures retry 5 times then `failed` and alert
- [ ] **BE-BIL-37** Inbox handler `charge.success`: verify the transaction through the API (status, amount, currency, reference), match a checkout session or a subscription renewal, create `payments` row (unique reference), invoice, apply T02, T05, T07, T09 or T17, publish `PaymentSucceeded` (and `SubscriptionRenewed` on renewal)
- [ ] **BE-BIL-38** Inbox handlers `subscription.create`, `subscription.enable`, `subscription.not_renew`, `subscription.disable`: store subscription code and email token, apply T11 or T10
- [ ] **BE-BIL-39** Inbox handlers `invoice.create`, `invoice.update`, `invoice.payment_failed`: apply T08, increment `renewal_failure_count`, publish `PaymentFailed`
- [ ] **BE-BIL-40** Inbox handlers `refund.processed`, `refund.failed`, `refund.pending`: update `refunds`, invoice status, publish `RefundIssued` on processed
- [ ] **BE-BIL-41** Inbox handlers `charge.dispute.create`, `charge.dispute.remind`, `charge.dispute.resolve`: `disputes` rows, publish `DisputeOpened` (Affiliates holds commission), admin notification
- [ ] **BE-BIL-23** Publish `PaymentSucceeded`, `SubscriptionRenewed`, `RefundIssued` (and the other contract events) only through `IDbContextOutbox<BillingDbContext>`; architecture test asserts no direct `IMessageBus.PublishAsync` in the module
- [ ] **BE-BIL-60** `IOneOffCheckout` implementation for Family allowance pledges: checkout session purpose `one_off`, no subscription, `PaymentSucceeded` carries the correlation *(deferred: decision 6, not in v1)*
- [ ] **BE-BIL-63** `quota_grants` table (`user_id`, `quota_key`, `bonus`, `source_type`, `source_id` unique, `granted_at`, `expires_at`) and the `GrantQuota` command handler sent by Progress (BE-PRG-49) for points-funded quota top-ups (the old live behaviour) *(deferred: decision 6, not in v1)*
- [ ] **BE-BIL-64** Limit resolution adds unexpired grants to the plan limit for the matching quota key (unlimited still wins); `GET /billing/usage` shows `bonus` and `bonusExpiresAt` *(deferred: decision 6, not in v1)*
- [ ] **BE-BIL-65** Grant expiry needs no job (expiry is evaluated at read); a test proves an expired grant stops counting at the boundary *(deferred: decision 6, not in v1)*
- [ ] **BE-BIL-61** `IPaystackCockpit` and `IBillingAdminQueries` implementations for Admin (BE-ADM-05, BE-ADM-06), read-only, paged
- [ ] **BE-BIL-57** `IssueRefund` command handler (sent by Admin BE-ADM-07): validates the remaining refundable amount, creates `refunds` row `pending`, calls Paystack refund with our reference, records the outcome; audit event on success and failure

## Slices

Group `/billing`, tag `Billing`. All authenticated slices filter by `owner_user_id = current user` (or seat membership where stated).

### BE-BIL-08  GET /billing/plans

| | |
|---|---|
| Operation id | `listPlans` |
| Permission | anonymous |
| Entitlement | none |
| Rate limit | `default` (IP partition) |
| Idempotency | safe read; `HybridCache` 10 min, `Cache-Control: public, max-age=300` |
| Metric | `aptiverse.billing.plans.list.duration` |
| Log fields | `Audience`, `CacheHit` |

Request (query): `audience` optional `student|parent`.

Response `200 PlanCatalog`: `vatInclusive` (catalog-level flag from config `Billing:Vat:PricesIncludeVat`), `paystackMode` (`test` or `live`, from the configured key prefix, for UI banners), `plans[]` of `{ code, name, description, kind, audience, maxSeats, prices[] { interval, amountCents, currency, vatInclusive }, features[] { key, label, isLive }, quotas[] { quotaKey, perPeriod, pooled } }`, only `is_public and is_active`. `isLive` is false for a feature that is sold on the plan but not yet built (pricing shows it as "coming soon"); it comes from a `plan_features.is_live` column so it can be flipped without a deploy.

- [ ] **BE-BIL-08** `GET /billing/plans`
  - [ ] Endpoint (`AllowAnonymous`)
  - [ ] Records
  - [ ] Validator (audience)
  - [ ] Handler (cached)
  - [ ] Unit tests: inactive and non-public plans excluded
  - [ ] Integration tests: anonymous OK, audience filter

### BE-BIL-50  GET /billing/usage

| | |
|---|---|
| Operation id | `getMyUsage` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.billing.usage.get.duration` |
| Log fields | `UserId` |

Response `200 UsageSummary`: `items[]` of `{ quotaKey, used, limit (null when unlimited), unlimited, resetsAt, pooled }` for every quota key (`practice.generate`, `practice.essay_feedback`, `ai.quick`, `ai.deep`, `ai.help`), so the practice and tutor pages can show the remaining allowance. The same list is included in `/me` (BE-IDN-28) as `quotas` for the shell; the tutor page uses the combined `GET /ai/access` (BE-AI-47).

- [ ] **BE-BIL-50** `GET /billing/usage`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (no params; empty validator)
  - [ ] Handler
  - [ ] Unit tests: unlimited and disabled rendering
  - [ ] Integration tests: free user, pooled seat user

### BE-BIL-09  POST /billing/checkout

| | |
|---|---|
| Operation id | `startCheckout` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `billing-checkout` (5 per minute per user) |
| Idempotency | required `Idempotency-Key`; additionally an `open` session for the same user and price within 30 minutes is reused (no duplicate Paystack transaction) |
| Metric | `aptiverse.billing.checkout.started` (counter, tags `plan`, `interval`) |
| Log fields | `UserId`, `CheckoutSessionId`, `Reference`, `PlanCode`, `Interval`, `AmountCents` |

Request: `planCode` (existing, public, active, paid, audience matches the user's role), `interval` `monthly|annual`, `referralCode` optional (pattern `^[A-Z0-9]{6,16}$`; carried in `CheckoutStarted` so Affiliates can attribute a buyer who arrived with a code but never claimed it; Affiliates applies its normal eligibility rules). The email comes from the session (Identity), never the body; the callback URL comes from config (`Billing:CallbackUrl`), never the body (open redirect guard).

Behaviour: ensure Paystack customer, create subscription `incomplete` (T01) unless one is entitled already, create checkout session, initialise transaction with our `reference`, `plan` code and amount, publish `CheckoutStarted`.

Response `201 CheckoutStartedResponse`: `checkoutSessionId`, `reference`, `authorizationUrl`, `expiresAt`.

Failures: `400`; `403 billing.payer_must_be_adult` (when open question 9 resolves that under-18s cannot pay; the student is offered "ask a parent" instead); `404 billing.plan_not_found`; `409 billing.already_subscribed` (entitled subscription for the audience exists; use change); `409 billing.plan_not_synced` (price has no Paystack code); `502 billing.provider_error`; `503 billing.checkout_unavailable` (Paystack unreachable or circuit open; the UI shows a retry message).

- [ ] **BE-BIL-09** `POST /billing/checkout`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: session reuse window, amount from price row only
  - [ ] Integration tests (Paystack fake): happy, already subscribed 409, not synced 409, provider 5xx maps to 502

### BE-BIL-10  POST /billing/checkout/verify

| | |
|---|---|
| Operation id | `verifyCheckout` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `billing-verify` (20 per minute per user) |
| Idempotency | naturally idempotent; it enqueues the same inbox path as the webhook |
| Metric | `aptiverse.billing.checkout.verified` (counter, tag `outcome`) |
| Log fields | `UserId`, `Reference`, `Outcome` |

Request: `reference` 1 to 64 chars, must belong to a checkout session of the current user.

Behaviour: calls Paystack verify; when successful, writes a synthetic inbox row (`source = 'reconciliation'`, dedupe key identical to the webhook's `charge.success` key) and processes it synchronously through the same handler, so verify and webhook can never both apply. Returns the resulting state.

Response `200 CheckoutStatus`: `status` (`paid`, `pending`, `failed`, `abandoned`), `subscriptionStatus`, `planCode`.

Failures: `404 billing.checkout_not_found`; `502`; `503`.

- [ ] **BE-BIL-10** `POST /billing/checkout/verify`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: shared dedupe key with webhook
  - [ ] Integration tests: verify then webhook applies once; webhook then verify applies once; another user's reference 404

### BE-BIL-11  POST /billing/webhooks/paystack

| | |
|---|---|
| Operation id | `receivePaystackWebhook` |
| Permission | anonymous; authenticated by signature |
| Entitlement | none |
| Rate limit | `webhooks` group, own partition `paystack` (600 per minute), never shared with user traffic |
| Idempotency | unique `dedupe_key`; duplicates return `200` and change nothing |
| Metric | `aptiverse.billing.webhook.received` (counter, tags `event_type`, `outcome` = `accepted`, `duplicate`, `bad_signature`), `aptiverse.billing.webhook.processing_lag_seconds` (histogram, receipt to processed) |
| Log fields | `EventType`, `DedupeKey`, `ObjectRef`, `Outcome`, `BodyBytes` (never the payload) |

Request: raw body (max 64 KB, read once with buffering), header `x-paystack-signature`.

Rules:

1. Compute HMAC-SHA512 of the raw bytes with the Paystack secret key; compare in constant time (`CryptographicOperations.FixedTimeEquals`). Mismatch returns `401` and stores nothing.
2. Optional defence in depth: source IP in the configured Paystack IP allowlist, read from `CF-Connecting-IP` only when the request came through Cloudflare (trusted proxy).
3. Paystack sends no event id. `dedupe_key = sha256(event + ":" + data.id + ":" + (data.status or "") + ":" + (data.reference or data.subscription_code or data.invoice_code or ""))`; for `subscription.*` events where `data.id` repeats, the key also includes `data.next_payment_date`.
4. `insert ... on conflict (dedupe_key) do nothing`; publish `ProcessPaystackEvent` through the outbox in the same transaction; return `200` within 1 s.

Response `200` empty.

Failures: `401 billing.webhook_bad_signature`; `413` body too large; `400` unparseable JSON (logged, not stored).

- [ ] **BE-BIL-11** `POST /billing/webhooks/paystack`
  - [ ] Endpoint (no auth, no antiforgery, raw body binding, excluded from the validation filter but with a validator on the parsed envelope)
  - [ ] Records (`PaystackEnvelope` with `event`, `data`)
  - [ ] Validator (event name present, max lengths)
  - [ ] Handler (signature, dedupe key, insert, outbox)
  - [ ] Unit tests: signature (valid, invalid, wrong key, tampered byte), dedupe key per event type
  - [ ] Integration tests: valid accepted, bad signature 401, duplicate no-op, oversized 413

### BE-BIL-14  GET /billing/subscription

| | |
|---|---|
| Operation id | `getMySubscription` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.billing.subscription.get.duration` |
| Log fields | `UserId`, `SubscriptionId`, `Status` |

Response `200 SubscriptionView`: `paystackMode` (`test` or `live`), `subscription` (null when on Free) with `id`, `planCode`, `planName`, `status`, `interval`, `amountCents`, `currentPeriodEnd`, `trialEndsAt`, `cancelAtPeriodEnd` (status `cancelling`), `pendingChange` (`planCode`, `effectiveAt`) or null, `paymentMethod` (`brand`, `last4`, `expMonth`, `expYear`) or null, `seats` (`used`, `max`), and `coveredBy` (when the user is a seat member: owner display name and plan; no billing details of the owner).

- [ ] **BE-BIL-14** `GET /billing/subscription`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: seat member view hides owner billing data
  - [ ] Integration tests: free, active, cancelling, seat member

### BE-BIL-15  POST /billing/subscription/upgrade

| | |
|---|---|
| Operation id | `upgradeSubscription` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `billing-checkout` |
| Idempotency | required `Idempotency-Key` |
| Metric | `aptiverse.billing.subscription.upgrade_requested` (counter, tags `from`, `to`) |
| Log fields | `UserId`, `SubscriptionId`, `FromPlan`, `ToPlan`, `CheckoutSessionId` |

Request: `planCode`, `interval`; the target price must be higher than the current price (otherwise use downgrade).

Behaviour (upgrade now): a checkout session with purpose `upgrade` for the full new price (no proration in v1, see open question 2); on `charge.success` T17 applies: the old Paystack subscription is disabled, a new one is created on the new plan code with `start_date` one interval from now using the new authorization; seats carry over up to the new plan's max.

Response `201 CheckoutStartedResponse`.

Failures: `400`; `404`; `409 billing.not_an_upgrade`; `409 billing.no_active_subscription`; `409 billing.change_pending` (cancel the scheduled change first); `502`; `503`.

- [ ] **BE-BIL-15** Upgrade now (original "change" task, upgrade half)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: price comparison across intervals (annual per month)
  - [ ] Integration tests: happy through webhook, not an upgrade 409, change pending 409

### BE-BIL-43  POST /billing/subscription/downgrade

| | |
|---|---|
| Operation id | `scheduleDowngrade` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | same target twice returns `200` unchanged |
| Metric | `aptiverse.billing.subscription.downgrade_scheduled` (counter) |
| Log fields | `UserId`, `SubscriptionId`, `ToPlan`, `EffectiveAt` |

Request: `planCode` (lower price, or `free`), `interval`.

Behaviour: T14 sets `pending_plan_price_id` and `pending_change_at = current_period_end`; schedules `ApplyScheduledChange(subscriptionId, pendingChangeAt)`. Downgrading to Free is the same as cancel (redirects to T11). Seat overflow: if the new plan has fewer seats than assigned, the response lists the seats that will be removed at the change date unless the owner removes some first.

Response `200 SubscriptionView`.

Failures: `409 billing.not_a_downgrade`; `409 billing.no_active_subscription`.

- [ ] **BE-BIL-43** Downgrade at period end
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: seat overflow calculation
  - [ ] Integration tests: happy, scheduled message persisted, not a downgrade 409

### BE-BIL-44  DELETE /billing/subscription/pending-change

| | |
|---|---|
| Operation id | `cancelScheduledChange` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | no pending change returns `200` |
| Metric | `aptiverse.billing.subscription.change_cancelled` (counter) |
| Log fields | `UserId`, `SubscriptionId` |

Behaviour: T16 clears the pending fields; the scheduled message becomes stale (handler checks `pending_change_at`).

- [ ] **BE-BIL-44** Cancel a scheduled change
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: stale message detection
  - [ ] Integration tests: happy, idempotent

### BE-BIL-16  POST /billing/subscription/cancel

| | |
|---|---|
| Operation id | `cancelSubscription` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | cancelling a `cancelling` subscription returns `200` |
| Metric | `aptiverse.billing.subscription.cancel_requested` (counter, tag `plan`) |
| Log fields | `UserId`, `SubscriptionId`, `CurrentPeriodEnd` |

Request: `reason` optional enum (`too_expensive`, `not_using`, `missing_feature`, `other`) and `comment` max 500; retention-free: no offers, no extra steps.

Behaviour: Paystack `subscription/disable` (code plus decrypted email token), T11, access continues to `current_period_end`; schedules `EndSubscriptionAtPeriodEnd`. Trialing subscriptions go to T06 immediately at trial end.

Failures: `409 billing.no_active_subscription`; `502` (state unchanged, retry safe); `503`.

- [ ] **BE-BIL-16** Cancel at period end
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: trialing branch
  - [ ] Integration tests: happy, idempotent, provider error leaves state unchanged

### BE-BIL-45  POST /billing/subscription/resume

| | |
|---|---|
| Operation id | `resumeSubscription` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | resuming an active subscription returns `200` |
| Metric | `aptiverse.billing.subscription.resumed` (counter) |
| Log fields | `UserId`, `SubscriptionId` |

Behaviour: only while `cancelling` and before period end; Paystack `subscription/enable`; T12.

Failures: `409 billing.cannot_resume` (period ended or not cancelling); `502`; `503`.

- [ ] **BE-BIL-45** Resume before period end
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: guard
  - [ ] Integration tests: happy, after period end 409

### BE-BIL-66  POST /billing/subscription/pause and POST /billing/subscription/unpause

| | |
|---|---|
| Operation id | `pauseBilling`, `unpauseBilling` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | pausing a paused subscription (or unpausing an active one) returns `200` |
| Metric | `aptiverse.billing.subscription.paused` and `.unpaused` (counters) |
| Log fields | `UserId`, `SubscriptionId`, `CurrentPeriodEnd` |

Pause disables billing at Paystack (T19) without ending the subscription: access continues to the period end, then stops, and the subscription stays resumable. Unpause (T20) enables the Paystack subscription while still inside the period, or creates a new one with the stored authorization (charging now) after it. Children's cover on a paused parent plan continues (see the state machine note). Failures `409 billing.no_active_subscription`, `409 billing.cannot_resume` (no reusable authorization: the response says to check out again), `502`, `503 billing.provider_unavailable`.

- [ ] **BE-BIL-66** Pause or resume billing at Paystack
  - [ ] Endpoints
  - [ ] Records
  - [ ] Validators
  - [ ] Handlers
  - [ ] Unit tests: inside versus after the period
  - [ ] Integration tests: pause, unpause inside period, unpause after period charges once, provider error leaves state unchanged

### BE-BIL-67  POST /billing/admin/comps

Permission `billing.admin`; request `userId`, `planCode`, `endsAt` (1 day to 12 months ahead), `reason` 10 to 200; required `Idempotency-Key`; metric `aptiverse.billing.comps.granted`; log fields `AdminUserId`, `UserId`, `PlanCode`, `EndsAt`. Creates a comped subscription (T21) with no Paystack objects, schedules its end, audits the action. `DELETE /billing/admin/comps/{subscriptionId}` ends it early. Comped subscriptions are excluded from revenue metrics and reconciliation.

- [ ] **BE-BIL-67** Comped subscriptions (grant and end)
  - [ ] Endpoints
  - [ ] Records
  - [ ] Validators
  - [ ] Handlers
  - [ ] Unit tests: end scheduling
  - [ ] Integration tests: grant, end early, user already subscribed 409, non-admin 403

### BE-BIL-17  POST /billing/payment-method

| | |
|---|---|
| Operation id | `getPaymentMethodUpdateLink` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `billing-checkout` |
| Idempotency | each call returns a fresh short-lived link (safe to repeat) |
| Metric | `aptiverse.billing.payment_method.link_issued` (counter) |
| Log fields | `UserId`, `SubscriptionId` |

Response `200 { url, expiresAt }` from Paystack `subscription/:code/manage/link`. The new card arrives through `subscription.*` or `charge.success` webhooks and updates `payment_methods`.

Failures: `409 billing.no_active_subscription`; `502`; `503`.

- [ ] **BE-BIL-17** Update card link
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: none beyond mapping
  - [ ] Integration tests: happy, no subscription 409

### BE-BIL-18  GET /billing/invoices

| | |
|---|---|
| Operation id | `listMyInvoices` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.billing.invoices.list.duration` |
| Log fields | `UserId`, `ResultCount` |

Request: `page`, `pageSize` 1 to 50.

Response `200 PagedResult<InvoiceSummary>`: `id`, `number`, `issuedAt`, `totalCents`, `vatCents`, `currency`, `status`, `isTaxInvoice`, `periodStart`, `periodEnd`.

- [ ] **BE-BIL-18** `GET /billing/invoices`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: paging
  - [ ] Integration tests: own only

### BE-BIL-46  GET /billing/invoices/{id}/pdf

| | |
|---|---|
| Operation id | `getInvoicePdf` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.billing.invoice_pdf.served` (counter, tag `generated` = first render or cached) |
| Log fields | `UserId`, `InvoiceId` |

Response `200 { url, expiresAt }`: presigned GET (5 min) to the PDF in S3; rendered on first request (QuestPDF, community licence check in open questions) and stored at `invoices/{yyyy}/{invoiceId}.pdf`. PDF shows "Tax invoice" only when VAT registered, supplier name, address and VAT number, invoice number, date, lines, VAT at 15% and totals as `R1 234,00`.

Failures: `404`.

- [ ] **BE-BIL-46** Invoice PDF
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler plus `InvoicePdfRenderer`
  - [ ] Unit tests: snapshot of rendered text for a VAT and a non-VAT invoice
  - [ ] Integration tests: own invoice, another user's 404

### BE-BIL-48  GET /billing/seats

| | |
|---|---|
| Operation id | `listSeats` |
| Permission | `billing.manage` |
| Entitlement | parent plan |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.billing.seats.list.duration` |
| Log fields | `UserId`, `SubscriptionId`, `SeatCount` |

Response `200 SeatList`: `max`, `seats[]` of `{ userId, displayName, role, coveredPlanCode, assignedAt }`, `eligibleChildren[]` (linked children without a seat, from `IFamilyLinkLookup`).

- [ ] **BE-BIL-48** `GET /billing/seats`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: eligibility list
  - [ ] Integration tests: owner only, non-owner 404

### BE-BIL-19  POST /billing/seats (per-child cover)

| | |
|---|---|
| Operation id | `assignSeat` |
| Permission | `billing.manage` |
| Entitlement | parent plan with free seats |
| Rate limit | `default` |
| Idempotency | assigning an already seated child returns `200` |
| Metric | `aptiverse.billing.seats.assigned` (counter) |
| Log fields | `UserId`, `SubscriptionId`, `SeatUserId` |

Request: `studentUserId` uuid; must be an active family link of the owner (`IFamilyLinkLookup.IsLinkedAsync`) with student-side consent; `coveredPlanCode` `student.pro` (the only value in v1; `student.max` is not in v1, decision 12). Assigning an already seated child with a different `coveredPlanCode` changes that child's tier (per-child assignment).

Response `201 SeatView`. Events: `SeatAssigned` (invalidates the child's entitlement cache).

This is the per-child cover plan endpoint: a child can be covered only when the parent holds a paid parent plan with a free place; otherwise `409`.

Failures: `403 billing.not_linked`; `409 billing.no_free_seats`; `409 billing.no_active_subscription` (no paid parent plan).

- [ ] **BE-BIL-19** Assign a seat (original task, POST half)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (seat count under row lock on the subscription)
  - [ ] Unit tests: seat limit
  - [ ] Integration tests: happy, not linked 403, full 409, parallel assigns never exceed max

### BE-BIL-47  DELETE /billing/seats/{userId}

| | |
|---|---|
| Operation id | `removeSeat` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | removing a removed seat returns `204` |
| Metric | `aptiverse.billing.seats.removed` (counter, tag `source` = `owner`, `unlink`, `downgrade`) |
| Log fields | `UserId`, `SubscriptionId`, `SeatUserId`, `Source` |

Behaviour: sets `removed_at`, publishes `SeatRemoved`. The owner seat cannot be removed. Also triggered internally when Family publishes `FamilyLinkRemoved`.

- [ ] **BE-BIL-47** Remove a seat
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler plus `FamilyLinkRemoved` handler
  - [ ] Unit tests: owner seat guard
  - [ ] Integration tests: happy, owner seat 409, unlink removes seat

### BE-BIL-59  POST /billing/trial

| | |
|---|---|
| Operation id | `startTrial` |
| Permission | `billing.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | one trial per user ever (unique index on a `trials_used` flag row); repeat returns `409` |
| Metric | `aptiverse.billing.trial.started` (counter, tag `plan`) |
| Log fields | `UserId`, `SubscriptionId`, `PlanCode`, `TrialEndsAt` |

Request: `planCode` (only plans with `trial_days > 0` in config). No card captured. T04; schedules `EndTrial` at `trial_ends_at`.

Failures: `409 billing.trial_used`; `409 billing.already_subscribed`; `404`.

- [ ] **BE-BIL-59** No-card trial *(deferred: decision 51, no free trial in v1; the `trialing` state and T04 to T06 stay in the state machine unused)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: one per user
  - [ ] Integration tests: happy, second trial 409

### BE-BIL-07  POST /billing/admin/plans/sync

| | |
|---|---|
| Operation id | `syncPlansToPaystack` |
| Permission | `billing.admin` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | idempotent by design: creates missing Paystack plans, updates names, never changes the amount of an existing Paystack plan (a price change is a new plan code) |
| Metric | `aptiverse.billing.plan_sync.runs` (counter, tag `outcome`) |
| Log fields | `AdminUserId`, `Created`, `Updated`, `Unchanged`, `Failed` |

Request: `dryRun` bool (default true).

Response `200 PlanSyncReport`: per price `{ planCode, interval, action ("create", "update", "none"), paystackPlanCode, error }`. Also runnable as `dotnet run --project src/Aptiverse.Host -- billing:sync-plans` for pipelines. Never runs on boot.

- [ ] **BE-BIL-07** Plan sync as admin action and pipeline command
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: diff logic (amount change never mutates)
  - [ ] Integration tests: dry run, real run against the fake, non-admin 403

### BE-BIL-49  GET /billing/admin/reconciliation and POST /billing/admin/reconciliation/drifts/{id}/resolve

| | |
|---|---|
| Operation id | `listReconciliationRuns`, `resolveDrift` |
| Permission | `billing.admin` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | resolve is idempotent (already resolved returns `200`) |
| Metric | `aptiverse.billing.drift.resolved` (counter, tag `kind`) |
| Log fields | `AdminUserId`, `DriftId`, `Kind`, `Resolution` |

Resolve request: `resolution` 1 to 200 chars, `action` in `note_only|reprocess_event|import_payment`. `reprocess_event` reinserts the Paystack object as an inbox row via the normal path.

- [ ] **BE-BIL-49** Drift report read and resolve
  - [ ] Endpoints
  - [ ] Records
  - [ ] Validators
  - [ ] Handlers
  - [ ] Unit tests: action mapping
  - [ ] Integration tests: list, resolve, non-admin 403

## Background work

- [ ] **BE-BIL-53** Period-end scheduled messages: `EndSubscriptionAtPeriodEnd` (T13), `ApplyScheduledChange` (T15: create the new Paystack subscription with the stored authorization and `start_date` at period end, disable the old), `EndTrial` (T06); each handler checks the stored timestamp matches (stale messages are no-ops)
- [ ] **BE-BIL-54** Dunning: on T08 schedule `PastDueCheck` at +3 and +7 days; at +7 days with no success apply T10 and disable at Paystack
- [ ] **BE-BIL-55** `ExpireCheckoutSession` at `expires_at`: session `abandoned`; subscription T03 when still `incomplete`
- [ ] **BE-BIL-35** `ExpireUsageReservations`: scheduled every 5 minutes (self-rescheduling message), reservations past `expires_at` become `expired` and release `reserved`; ledger row `expire`
- [ ] **BE-BIL-22** Nightly reconciliation job (02:00 SAST): lists Paystack transactions for the last 3 days and active subscriptions, compares against `payments` and `subscriptions`, writes `reconciliation_runs` and drift rows
- [ ] **BE-BIL-62** Inbox sweeper: `pending` rows older than 5 minutes (missed outbox delivery) are re-enqueued; `failed` rows raise an alert
- [ ] **BE-BIL-20** Failed payment and renewal reminder emails (non-alarming copy) via Notifications on `PaymentFailed` and 3 days before annual renewals
- [ ] **BE-BIL-21** Invoice and receipt emails with VAT shown, PDF link, on `PaymentSucceeded`
- [ ] **BE-BIL-24** Meta CAPI conversion handler on `PaymentSucceeded`: only when the user gave marketing consent and is 18 or older (`IMarketingConsentLookup`), hashed email, `event_id = payment id` for pixel dedupe, separate queue, failures never affect billing *(deferred: decision 8, not in v1)*
- [ ] **BE-BIL-56** `AccountDeletionRequested` handler: cancel any subscription at Paystack (T11 then T13 at period end, or immediate on request), remove seats, retain invoices and payments for 5 years (tax record retention) with name and email replaced by a pseudonym after the account is gone
- [ ] **BE-BIL-58** `UserRegistered` handler: none needed for Free (free plan is implicit); documented decision so nobody adds a free subscription row
- [ ] **BE-BIL-34** Data export contributor (BE-IDN-37): subscriptions, invoices, payments of the user

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Spoofing: forged webhook | `/billing/webhooks/paystack` | HMAC-SHA512 over raw bytes, constant-time compare, optional IP allowlist, secret rotation procedure | BE-BIL-11, BE-BIL-70 |
| Tampering: replayed webhook | Webhook | Dedupe key unique index; processing marks the row in the same transaction; replay ten times test | BE-BIL-25 |
| Tampering: amount manipulation | Checkout, verify | Amount only from `plan_prices`; `charge.success` re-verified through the API and compared to the session amount and currency | BE-BIL-37, BE-BIL-71 |
| Tampering: open redirect via callback | Checkout | Callback URL from config only | BE-BIL-09 |
| Repudiation | Money changes | `subscription_transitions`, inbox rows kept 5 years, admin actions audited including failures | BE-BIL-78 |
| Information disclosure: card data | Payment methods | No PAN ever touches us (Paystack hosted checkout); authorization code and email token encrypted; card signature peppered hash | BE-BIL-29 |
| Information disclosure: other users' invoices | Invoices, PDFs | Ownership filter returns 404; presigned URLs 5 min | BE-BIL-72 |
| Denial of service: webhook flood | Webhook | Own rate-limit partition; cheap path (verify, insert, 200) | BE-BIL-11 |
| Denial of service: quota bypass when DB slow | `IUsageMeter` | Fails closed; no in-memory fallback | BE-BIL-04 |
| Elevation: feature access without paying | `.RequireFeature()` | Entitlements from DB only; client never asserts a plan | BE-BIL-05 |

- [ ] **BE-BIL-70** Threat model in the module README; webhook secret rotation runbook (Paystack has one secret per account: rotate in dashboard, update Secrets Manager, verify with a test event)
- [ ] **BE-BIL-71** Test: a valid signed `charge.success` whose amount differs from the session is stored, not applied, and raises `amount_mismatch` drift plus an alert
- [ ] **BE-BIL-72** Authorisation matrix test per endpoint (anonymous, student, parent, other user, admin)

### Input limits and rate limits

- [ ] **BE-BIL-73** Body caps (webhook 64 KB, others 2 KB), field limits, enum validation; tests
- [ ] **BE-BIL-74** Rate-limit policies `billing-checkout` 5/min/user, `billing-verify` 20/min/user, `paystack` webhook partition 600/min; integration tests trip user policies and prove the webhook partition is unaffected by user traffic

### Idempotency and concurrency

- [ ] **BE-BIL-75** `Idempotency-Key` on checkout, upgrade, trial; unique business keys (`paystack_reference`, `paystack_transaction_id`, `paystack_refund_id`, `dedupe_key`); `xmin` on subscriptions with `409 billing.concurrency_conflict`; test: webhook and verify racing on the same reference apply once
- [ ] **BE-BIL-76** Seat assignment and usage reservation under concurrency: 50 parallel reservations against a limit of 10 confirm exactly 10

### Resilience

- [ ] **BE-BIL-77** Paystack outage behaviour: checkout returns `503 billing.checkout_unavailable` with `Retry-After`; webhooks keep being accepted (no outbound call on that path); entitlements unaffected; scheduled changes retry with backoff and alert after 3 failures; chaos test with the fake returning 500 and timeouts

### Audit

- [ ] **BE-BIL-78** Audit events for: plan sync (dry run and real), refund requested, refund outcome, drift resolved, subscription changed by admin, webhook signature failures (aggregated count, not per request)

### Money correctness

- [ ] **BE-BIL-79** Property-based tests (FsCheck): VAT split always sums to the total; invoice line sums equal invoice totals; refunds per payment never exceed the payment
- [ ] **BE-BIL-80** Ledger invariant test: `usage_meters.used` equals the sum of `feature_usage.delta_used` after any random sequence of reserve, confirm, refund, expire
- [ ] **BE-BIL-81** Reconciliation acceptance: staging run reports zero drift for a week of sandbox traffic (Phase 6 exit gate)
- [ ] **BE-BIL-25** Test: the same webhook replayed 10 times (and verify called 10 times) produces one payment, one invoice, one transition and one `PaymentSucceeded`
- [ ] **BE-BIL-82** Test: out-of-order webhooks (`subscription.create` before `charge.success`, `invoice.update` after `charge.success`) converge to the right state

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `invoices.billing_name`, `billing_email` | Personal information | 5 years (tax records), pseudonymised after account deletion |
| `payment_methods.*` | Personal information (financial, tokenised) | Deleted when the subscription ends plus 90 days |
| `paystack_events.payload` | Personal information (email, card last4) | 5 years, then deleted |
| `payments`, `refunds` | Financial records | 5 years |
| `usage_*`, `feature_usage` | Operational | 24 months |

- [ ] **BE-BIL-83** Classification in the README and the POPIA inventory; retention purge jobs for each row class; deletion test

### Observability

- [ ] **BE-BIL-84** Trace spans: `billing.webhook.receive`, `billing.inbox.process` (attributes `event_type`, `dedupe_key`), `billing.paystack.call` (`operation`, `status_code`), `billing.usage.reserve`
- [ ] **BE-BIL-85** Metrics on meter `Aptiverse.Billing`: `aptiverse.billing.webhook.processing_lag_seconds`, `aptiverse.billing.inbox.pending` (observable gauge), `aptiverse.billing.inbox.failed` (observable gauge), `aptiverse.billing.payments.succeeded_cents` (counter), `aptiverse.billing.refunds.cents` (counter), `aptiverse.billing.subscriptions.by_status` (observable gauge), `aptiverse.billing.reconciliation.drift_count` (gauge per run), `aptiverse.billing.usage.reservations_expired` (counter), `aptiverse.billing.paystack.errors` (counter, tag `operation`)
- [ ] **BE-BIL-86** Alerts: any inbox row `failed`; pending rows older than 10 minutes; webhook processing lag p95 above 60 s; reconciliation drift count above 0; Paystack error rate above 5% over 15 min; bad-signature spikes above 20 per hour; expired reservations above 2% of reservations per hour (callers not resolving)

### Performance budgets

- [ ] **BE-BIL-87** Budgets: webhook p95 under 150 ms; `IUsageMeter.ReserveAsync` p95 under 20 ms; entitlements check p95 under 5 ms cached and 30 ms uncached; plans list p95 under 50 ms; `EXPLAIN` checked for reserve update, entitlements query and invoice list

### Migration safety

- [ ] **BE-BIL-88** Expand and contract for subscriptions and money tables; no migration rewrites money columns in place; each money migration ships with a reconciliation query run before and after in the pipeline; rollback plan documented per migration
- [ ] **BE-BIL-89** Cutover continuity checks (with MIG-16): existing Paystack subscription codes mapped, no subscription re-created, first renewal after cutover produces exactly one payment

### SLO contribution

- [ ] **BE-BIL-90** SLOs: webhook acceptance 99.95% (non-5xx for valid signatures); inbox processed within 5 minutes for 99.9% of events; checkout start availability 99.5% excluding Paystack outages; entitlement checks inside the platform p95 SLO

### Further tests and operations

- [ ] **BE-BIL-91** k6 webhook scenario (HRD-10): 100 events per second with 30% duplicates, zero double processing
- [ ] **BE-BIL-92** Contract tests of the Paystack client against recorded sandbox responses (refreshed monthly)
- [ ] **BE-BIL-93** Runbook contribution `docs/runbooks/paystack-incident.md` (HRD-04): inbox replay, drift resolution, manual refund
- [ ] **BE-BIL-94** Local dev: Paystack CLI or Postman webhook forwarding documented, so webhooks reach localhost and the "verify on /welcome" workaround is gone
- [ ] **BE-BIL-95** Secrets: Paystack secret key only from Secrets Manager (no Meta CAPI token in v1, decision 8), test and live keys never mixed (boot fails if environment is prod and the key starts with `sk_test_`)
- [ ] **BE-BIL-96** Encryption key rotation for `payment_methods` and email tokens: re-encrypt job keyed by `encryption_key_id`
- [ ] **BE-BIL-97** Feature key and quota key constants shared through `Aptiverse.Billing.Contracts.FeatureKeys` so other modules never use string literals; architecture test
- [ ] **BE-BIL-99** Error code contract test: every `Error` constant in the module appears in the error code table and in the OpenAPI problem examples; a removed or renamed code fails CI
- [ ] **BE-BIL-100** `paystackMode` derived once at boot from the key prefix (`sk_test_` or `sk_live_`) and exposed on plans and subscription responses for the test-mode banner
- [ ] **BE-BIL-98** Pricing display contract: amounts always cents in the API; formatting `R1 234` is the web's job (test that no response contains a decimal money field)

## Old data mapping

| Old (43f9faa) | New | Notes (feeds MIG-16) |
|---|---|---|
| `entitlements.plans` (`Code` PK, `MonthlyPriceZar`, `AnnualPriceZar` decimal, `MaxMembers`, `Kind`, `CommissionPercent`, `PaystackPlanCodeMonthly`, `PaystackPlanCodeAnnual`) | `billing.plans` plus two `billing.plan_prices` rows | Rand decimals times 100 to cents; Paystack plan codes kept so live subscriptions keep billing; tutor and school plans migrated inactive only if a subscription references them; `CommissionPercent` dropped |
| `entitlements.plan_features` | `billing.plan_features` | Keys renamed where the rebuild uses new names (mapping table in the MIG task) |
| `entitlements.plan_quotas` (`ai.quick`, `ai.deep`, `whatsapp`, `practice.generate`) | `billing.plan_quotas` | `ai.quick` and `ai.deep` kept verbatim, `whatsapp` dropped; pooled true on `parent.2` to `parent.4` |
| `entitlements.subscriptions` (`Status` incomplete, active, trialing, past_due, cancelled; Paystack codes; card fields; `PendingPlanCode`) | `billing.subscriptions` plus `payment_methods` plus one `subscription_transitions` row (`trigger_type = 'admin'`, `transition = 'MIG'`) | `cancelled` with `ValidUntil` in the future becomes `cancelling`; authorization code encrypted at import; email token fetched from Paystack during migration |
| `entitlements.subscription_members` | `billing.seats` | `Role` owner or member kept |
| Parent coverage subscriptions (one `student.pro` or `student.max` subscription per parent and child, owned by the parent, with the child as its single member; `ParentCoverageService`) | `billing.seats` on the parent's `parent.*` subscription with `covered_plan_id` | Each coverage subscription collapses into one seat; capacity is the parent plan's `max_seats`; no Paystack objects change (coverage subscriptions had no Paystack code) |
| `entitlements.quota_grants` (points-funded bonus quota with `RewardCode`, `GoalId`, `PointsSpent`, `ExpiresAt`; live behaviour at 43f9faa) | none in v1 (decision 6: no quota top-ups) | Not migrated as live grants. Rows are exported to the migration archive with the rest of the points data (MIG-45) so they can be honoured if rewards return; grants still unexpired at cutover simply lapse (cutover comms item) |
| `entitlements.feature_usages` | `billing.usage_meters` (current month only) | Older months dropped |
| No payments or invoices tables existed | `payments` imported from the Paystack transaction list API; invoices not back-filled (open question 5) | |

## Tests

- Unit: state machine (one test per transition), VAT and invoice maths, dedupe key, signature verification, plan sync diff, seat overflow, entitlement resolution (union, unlimited wins, grace).
- Integration (Paystack fake): every slice happy, validation, forbidden, not found; webhook replay; out-of-order webhooks; verify versus webhook race; quota concurrency; reconciliation drift detection; scheduled period-end changes.
- Property-based: BE-BIL-79, BE-BIL-80.

## Contracts requested by other modules

- [ ] **BE-BIL-101** `IBillingAdminCommands` contract in `Aptiverse.Billing.Contracts` for the Admin module: refund (full or partial, by payment id or Paystack reference), pause or resume billing at Paystack, undo a scheduled downgrade, set subscription state; every command takes the acting admin id and a reason, is idempotent, and audits success and failure
- [ ] **BE-BIL-102** Integration test: Admin calls every `IBillingAdminCommands` method through the contract only (architecture test forbids Admin touching Billing internals)

## Open questions

1. Decided (51): no free trial in v1. BE-BIL-59 is deferred; the `trialing` state stays in the state machine unused.
2. Decided (52): Paystack default. An upgrade charges the full new price now and starts a new period with no credit.
3. Decided (50): prices shown VAT-inclusive; registration status is a fact owed (DECISIONS.md section F). `Billing:Vat:Registered` config decides tax invoices until then.
4. QuestPDF community licence applies below USD 1M revenue; confirm, or render invoice PDFs another way.
5. Should historic invoices be back-filled from Paystack transactions at migration, or only post-cutover invoices exist?
6. Seats need `IFamilyLinkLookup` from Family (Phase 8) while Billing is Phase 6. Ship seats with Phase 8, or accept seat assignment by verified email until Family lands?
7. Paystack webhooks carry no event id; the composite dedupe key is a judgement call (see BE-BIL-11). Validate against a month of real webhook logs before launch.
8. Quota periods: calendar month in SAST (old behaviour) or the subscription's billing period?
9. Decided (31): under-18s pay only with parental consent. Checkout refuses an under-18 payer without a recorded parental consent (`billing.payer_must_be_adult`) and routes them to a parent plan; date of birth comes from Identity (decision 30).
10. Decided (50): prices are VAT-inclusive; `vatInclusive` stays exposed for the pricing page.
11. Decided (12): `student.max` is not in v1. Seed it inactive (BE-BIL-02); `coveredPlanCode` accepts only `student.pro` in v1.
12. Decided (12): annual billing is in v1, alongside monthly.
13. Parent coverage: the old app (43f9faa) gave each covered child their own `student.pro` or `student.max` subscription and quotas, while the older seed text spoke of a "shared AI pool". This backlog follows the coverage model (per-child seats with their own quotas). Confirm.
14. Decided (13): parent insights are free. Do not seed a `parent_insights` feature key on parent plans; Family must not gate parent reads with `.RequireFeature`.
15. Decided (53): children keep cover until the end of the parent's paid period, then a 14-day grace, then they drop to Free with a notice.
