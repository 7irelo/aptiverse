# Affiliates module

| | |
|---|---|
| ID range | `BE-AFF-01` to `BE-AFF-16` (original), `BE-AFF-17` to `BE-AFF-49` (splits and additions), `BE-AFF-50` to `BE-AFF-77` (production readiness and later additions), `BE-AFF-78` to `BE-AFF-85` (contracts, decision 3b enrolment and the decision 3c attribution cap) |
| Schema | `affiliates` |
| Projects | `src/Modules/Affiliates/Aptiverse.Affiliates`, `src/Modules/Affiliates/Aptiverse.Affiliates.Contracts`, `tests/Aptiverse.Affiliates.UnitTests` |
| Phase | 6 |
| Consumes | `Aptiverse.Billing.Contracts` (`PaymentSucceeded`, `SubscriptionRenewed`, `RefundIssued`, `DisputeOpened`, `DisputeResolved`), `Aptiverse.Identity.Contracts` (`UserRegistered`, `AccountDeletionRequested`, `IUserProfileLookup` with date of birth), `Aptiverse.Notifications.Contracts` (`NotifyUser`) |
| Publishes | `AffiliateEnrolled`, `AffiliateStatusChanged`, `ReferralAttributed`, `CommissionReleased`, `PayoutBatchPaid`, `PayoutDetailsChanged`; implements `IAffiliateAdminQueries`, `ReverseCommission` and payout batch command handlers |
| Depends on | BE-SK-22, BE-SK-23, BE-SK-27, BE-BIL-23, BE-IDN-02 (date of birth, decision 30), shared `IFieldEncryptor` (platform backlog) |
| Decisions | 3 (in v1), 3b (automatic enrolment), 3c (old terms, attribution capped at 12 months), 31 (no under-18 affiliates), 56 (manual EFT bulk CSV), E (affiliate is a profile; admin commands owned here) |
| Status | Not started: 85 tasks, 3 deferred (BE-AFF-03, BE-AFF-20, BE-AFF-32, decision 3b), 82 in v1 |

## Responsibilities and out of scope

Responsible for:

- The affiliate programme: terms, automatic enrolment of adult accounts (18 or older only, decision 31), status lifecycle (active, suspend, reinstate, close).
- Referral codes and links, attribution claimed at the first authenticated render and capped at 12 months from first touch (decision 3c), fraud signals.
- An append-only, double-entry commission ledger driven only by Billing events: accruals on payment and renewal, holds released on a schedule, reversals on refund as new rows, freezes on disputes.
- Encrypted payout details, payout batches (generate, CSV export, mark paid, cancel), statements and tax-year summaries.

Out of scope:

- Reading Billing tables (never; events only).
- Moving money: v1 pays by bank EFT outside the system; the batch CSV feeds the bank. Paystack Transfers are a later option (open question 6).
- An `affiliate` role: being an affiliate is a profile on an existing student or parent account, not a role (see open question 2 about BE-IDN-06).
- Admin screens (Admin reads through `IAffiliateAdminQueries`, BE-ADM-12).

## Decided: enrolment and terms (decisions 3, 3b, 3c)

- **In v1 (decision 3).** The programme ships in Phase 6.
- **Automatic enrolment (decision 3b), as the old app did.** There is no application step. An adult account (18 or older from `IUserProfileLookup.DateOfBirth`, decision 31) gets an `active` affiliate profile, a code and a snapshot of the current terms the first time it opens `/refer` and accepts the terms (BE-AFF-02). Under-18 accounts never get a profile. The only gate is the payout-details review (BE-AFF-47): commission accrues and releases for every active affiliate, but a payout batch only includes affiliates whose payout details are `confirmed`. Admins can still suspend, reinstate and close. The application tasks (BE-AFF-03, BE-AFF-20, BE-AFF-32) are deferred and the `applications` table is not built.
- **Old terms kept, attribution capped (decision 3c).** 40% of the VAT-exclusive amount of the first 3 monthly payments or the first annual payment, 30-day hold, 7-day claim window after sign-up, first-touch attribution, self-referral blocked, R100.00 minimum payout (BE-AFF-18). Attribution lasts **12 months from first touch**: `referrals.attributed_at` is the click time from the signed cookie (or the claim time when there is none), `attribution_expires_at` is 12 calendar months later, and a payment made at or after that instant earns nothing (BE-AFF-80, BE-AFF-81). The click cookie stays 30 days; it only carries first touch to sign-up. Referrals attributed before cutover keep their original date and are capped from it (BE-AFF-84).

## Data model

Schema `affiliates`. Every table: `id uuid` PK (Guid v7), `created_at`, `updated_at`, `deleted_at`, `xmin`, except append-only tables, which are insert-only, never updated and never soft-deleted (enforced by a trigger that raises on `update` and `delete`, BE-AFF-52).

### terms_versions

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| version | int | no | unique |
| effective_at | timestamptz | no | |
| body_markdown | text | no | |
| commission_rate_bps | int | no | displayed rate, for example 2000 for 20%; check `between 0 and 5000` |
| commissionable_monthly_payments | int | no | how many monthly payments per referral earn commission (old programme: 3); check `between 0 and 24` |
| commissionable_annual_payments | int | no | how many annual payments earn commission (old programme: 1); check `between 0 and 5` |
| hold_days | int | no | check `between 0 and 120` |
| minimum_payout_cents | bigint | no | 10000 (R100.00), old terms (decision 3c) |
| attribution_months | int | no | 12 (decision 3c); check `between 1 and 60` |

### affiliates

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | unique |
| terms_version | int | no | accepted version at enrolment (or at the latest re-acceptance, BE-AFF-72) |
| terms_accepted_at | timestamptz | no | |
| age_confirmed_at | timestamptz | no | date of birth check passed at enrolment |
| enrolled_at | timestamptz | no | |
| status | varchar(16) | no | check `in ('active','suspended','closed')`; index |
| commission_rate_bps | int | no | snapshot from terms at enrolment; changed only by admin with audit |
| commissionable_monthly_payments | int | no | snapshot |
| commissionable_annual_payments | int | no | snapshot |
| hold_days | int | no | snapshot |
| attribution_months | int | no | snapshot (12 under decision 3c) |
| suspended_reason | varchar(500) | yes | |
| status_changed_at | timestamptz | no | |

### affiliate_status_history (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| affiliate_id | uuid | no | FK, index |
| from_status | varchar(16) | yes | |
| to_status | varchar(16) | no | |
| actor_user_id | uuid | no | |
| reason | varchar(500) | yes | |
| occurred_at | timestamptz | no | |

### referral_codes

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| affiliate_id | uuid | no | FK, index |
| code | varchar(16) | no | unique (case-insensitive, `citext` or upper-cased), pattern `^[A-Z0-9]{6,16}$`, no ambiguous characters (0, O, 1, I) |
| is_active | boolean | no | partial unique `(affiliate_id) where is_active` |

### referrals

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| affiliate_id | uuid | no | FK, index `(affiliate_id, created_at desc)` |
| referral_code_id | uuid | no | FK, index |
| referred_user_id | uuid | no | unique (one attribution per user, ever) |
| clicked_at | timestamptz | yes | from the signed attribution cookie |
| claimed_at | timestamptz | no | |
| attributed_at | timestamptz | no | first touch: `coalesce(clicked_at, claimed_at)`; migrated rows use the old `SignedUpAt` (BE-AFF-84) |
| attribution_expires_at | timestamptz | no | `attributed_at` plus the affiliate's `attribution_months` snapshot, calendar months in UTC (29 February plus 12 months is 28 February); index `(attribution_expires_at) where status in ('attributed','converted')` |
| status | varchar(16) | no | check `in ('attributed','converted','flagged','blocked','expired')` |
| first_payment_at | timestamptz | yes | |
| payments_commissioned | int | no | count of payments that accrued commission; eligibility stops at the snapshot limit for the payment interval |
| claim_ip_prefix | varchar(45) | yes | IPv4 /24 or IPv6 /48 only, never the full address |

### payment_fingerprints

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| user_id | uuid | no | index |
| card_signature_hash | char(64) | no | from `PaymentSucceeded`; unique `(user_id, card_signature_hash)`; index on hash |
| first_seen_at | timestamptz | no | |

### fraud_signals (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| referral_id | uuid | no | FK, index |
| kind | varchar(32) | no | check `in ('self_referral_card','shared_card_across_referrals','ip_cluster','rapid_refund','account_deleted_soon','dispute')` |
| severity | varchar(8) | no | check `in ('low','high')` |
| detail | varchar(300) | no | no PII, ids only |
| resolved_by_user_id | uuid | yes | resolution is a new `fraud_signal_resolutions` row, see below |

### fraud_signal_resolutions (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| fraud_signal_id | uuid | no | FK, unique |
| resolution | varchar(16) | no | check `in ('cleared','blocked')` |
| actor_user_id | uuid | no | |
| note | varchar(500) | no | |

### commission_entries (append-only, double-entry)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| affiliate_id | uuid | no | FK, index `(affiliate_id, account)` |
| transaction_id | uuid | no | groups the legs of one posting; index |
| account | varchar(16) | no | check `in ('held','available','in_payout','paid','platform')` |
| amount_cents | bigint | no | signed; check `amount_cents <> 0` |
| currency | char(3) | no | `ZAR` |
| kind | varchar(20) | no | check `in ('accrual','release','reversal','freeze','unfreeze','payout_lock','payout_paid','payout_unlock','adjustment')` |
| source_type | varchar(16) | no | check `in ('payment','renewal','refund','dispute','payout_item','admin')` |
| source_id | uuid | no | the Billing payment, refund or dispute id, payout item id, or admin action id |
| referral_id | uuid | yes | FK, index |
| release_at | timestamptz | yes | on `accrual` held legs |
| actor_user_id | uuid | yes | admin postings |
| note | varchar(300) | yes | |
| occurred_at | timestamptz | no | |

Constraints: unique `(kind, source_type, source_id, account)` so a replayed event can never post twice; a deferred constraint trigger asserts every `transaction_id` sums to zero (BE-AFF-07). Balances are sums per account; no balance column exists anywhere.

### payout_details

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| affiliate_id | uuid | no | FK; partial unique `(affiliate_id) where is_current` |
| is_current | boolean | no | a change inserts a new row and clears the flag on the old one |
| account_holder_encrypted | bytea | no | AES-256-GCM through `IFieldEncryptor` |
| account_number_encrypted | bytea | no | |
| account_number_last4 | char(4) | no | for the masked read |
| legal_name_encrypted | bytea | no | legal first and last name (statements and bank payments) |
| id_type | varchar(16) | no | check `in ('sa_id','passport')` |
| id_number_encrypted | bytea | no | SA ID or passport number; the old app stored this in plain text |
| address_encrypted | bytea | no | postal address as an encrypted JSON blob |
| contact_phone_encrypted | bytea | yes | |
| bank_code | varchar(16) | no | FK-like reference to the static `banks` list (validated in code) |
| branch_code | varchar(10) | no | universal branch code |
| account_type | varchar(16) | no | check `in ('cheque','savings','transmission')` |
| tax_number_encrypted | bytea | yes | SARS income tax reference, optional |
| encryption_key_id | varchar(64) | no | |
| usable_from | timestamptz | no | created plus 48 h cooling period (fraud control) |
| review_status | varchar(16) | no | check `in ('in_review','confirmed','needs_fixing')`; new details start `in_review`; only `confirmed` details are paid |
| review_notes | varchar(500) | yes | what to fix, shown to the affiliate when `needs_fixing` |
| reviewed_by_user_id | uuid | yes | |
| reviewed_at | timestamptz | yes | |

### payout_batches

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| reference | varchar(24) | no | unique (`AFF-2026-10-001`) |
| status | varchar(16) | no | check `in ('draft','exported','paid','cancelled')` |
| total_cents | bigint | no | check `>= 0`; equals the sum of item amounts (test) |
| item_count | int | no | |
| created_by_user_id | uuid | no | |
| exported_at, paid_at, cancelled_at | timestamptz | yes | |

### payout_items

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| batch_id | uuid | no | FK, index |
| affiliate_id | uuid | no | FK, index; partial unique `(affiliate_id) where status in ('pending','exported')` (one open payout per affiliate) |
| payout_details_id | uuid | no | FK (the details snapshot used) |
| amount_cents | bigint | no | check `> 0` |
| status | varchar(16) | no | check `in ('pending','exported','paid','failed','cancelled')` |
| bank_reference | varchar(40) | yes | set at mark paid |
| failure_reason | varchar(200) | yes | |

### banks (seed data)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| code | varchar(16) | no | unique (`absa`, `capitec`, `fnb`, `nedbank`, `standard_bank`, `tymebank`, `discovery`, `african_bank`, `investec`, `bank_zero`) |
| name | varchar(60) | no | |
| universal_branch_code | varchar(10) | no | |
| is_active | boolean | no | |

## Ledger postings

| Posting | Legs |
|---|---|
| Accrual on `PaymentSucceeded` or `SubscriptionRenewed` | held `+c`, platform `-c` (with `release_at = paid_at + hold_days`) |
| Release (scheduled) | held `-c`, available `+c` |
| Reversal on `RefundIssued` while held | held `-r`, platform `+r` |
| Reversal on `RefundIssued` after release | available `-r`, platform `+r` (available may go negative; recovered from future earnings, never charged back to the affiliate's bank) |
| Freeze on `DisputeOpened` | release postponed (scheduled release becomes stale); if already released: available `-c`, held `+c` |
| Payout lock (batch generated) | available `-p`, in_payout `+p` |
| Payout paid | in_payout `-p`, paid `+p` |
| Payout unlock (item failed or batch cancelled) | in_payout `-p`, available `+p` |
| Admin adjustment | any account `+-a`, platform `-+a`, with note and actor |

Commission amount: `c = floor(payment_amount_excl_vat_cents * commission_rate_bps / 10000)`; reversal `r` is pro rata to the refunded share of the payment, rounded down, and never exceeds the accrual for that payment (test).

## Contracts

```
public sealed record AffiliateEnrolled(Guid AffiliateId, Guid UserId, string Code, int TermsVersion, DateTimeOffset OccurredAt);
public sealed record AffiliateStatusChanged(Guid AffiliateId, Guid UserId, string FromStatus, string ToStatus, DateTimeOffset OccurredAt);
public sealed record ReferralAttributed(Guid ReferralId, Guid AffiliateId, Guid ReferredUserId, DateTimeOffset AttributedAt, DateTimeOffset AttributionExpiresAt, DateTimeOffset OccurredAt);
public sealed record CommissionReleased(Guid AffiliateId, long AmountCents, DateTimeOffset OccurredAt);
public sealed record PayoutBatchPaid(Guid BatchId, int ItemCount, long TotalCents, DateTimeOffset OccurredAt);
public sealed record PayoutDetailsChanged(Guid AffiliateId, Guid UserId, DateTimeOffset OccurredAt);

// Commands sent by Admin (BE-ADM-12), handled here
public sealed record SuspendAffiliate(Guid AffiliateId, Guid AdminUserId, string Reason);
public sealed record ReinstateAffiliate(Guid AffiliateId, Guid AdminUserId, string Note);
public sealed record ResolveFraudSignal(Guid FraudSignalId, Guid AdminUserId, string Resolution, string Note);
public sealed record ReverseCommission(Guid AffiliateId, Guid SourceEntryTransactionId, long AmountCents, Guid AdminUserId, string Note);
public sealed record GeneratePayoutBatch(Guid AdminUserId, DateTimeOffset AsOf);
public sealed record MarkPayoutBatchPaid(Guid BatchId, Guid AdminUserId, IReadOnlyList<PaidItem> Items);
public sealed record CancelPayoutBatch(Guid BatchId, Guid AdminUserId, string Reason);

public interface IAffiliateAdminQueries { /* affiliates, payout-details review queue, referrals with attribution dates, flagged referrals, batches, ledger by affiliate, totals owed */ }
```

Admin endpoints live in the Admin module's route group but call these commands; the Affiliates module also exposes them under `/affiliates/admin` (below) so the module is testable on its own. Decided (section E of DECISIONS.md): the `/affiliates/admin` endpoints are the real ones and BE-ADM-12 is the admin UI read side that links to them.

## Error codes

Stable strings in the ProblemDetails `code` extension; the web app relies on them (contract test BE-AFF-45).

| Code | HTTP | Meaning |
|---|---|---|
| `affiliates.must_be_adult` | 403 | Date of birth missing or under 18 |
| `affiliates.date_of_birth_required` | 409 | Identity has no date of birth yet; the UI asks for it |
| `affiliates.terms_outdated` | 409 | Accepted terms version is not the current one |
| `affiliates.not_affiliate` | 404 | No affiliate profile for the caller |
| `affiliates.suspended` | 403 | Affiliate suspended; read-only access |
| `affiliates.code_not_found` | 404 | Unknown or inactive code |
| `affiliates.attribution_not_eligible` | 409 | Self-referral, existing payer, too old an account, click older than the cookie window, or already attributed (reason in `reason` extension) |
| `affiliates.payout_details_required` | 409 | No current payout details |
| `affiliates.payout_details_cooling` | 409 | New details not usable until `usableFrom` |
| `affiliates.bank_not_supported` | 400 | Unknown bank code |
| `affiliates.statement_not_ready` | 409 | Tax year not closed and no interim statement possible |
| `affiliates.illegal_transition` | 409 | Status or batch transition not allowed |
| `affiliates.concurrency_conflict` | 409 | `xmin` mismatch |

## Foundation tasks

- [ ] **BE-AFF-01** Module projects, `affiliates` schema, `AffiliatesDbContext`, design-time factory, architecture test registration
- [ ] **BE-AFF-17** Permission constants from the BE-IDN-65 catalogue (decision 9b): `affiliates.use` (student and parent; handlers check an active profile and 18 or older), `affiliates.manage` (admin: profiles, suspend and reinstate, terms, flagged referrals, reversals, adjustments) and `affiliates.payouts.manage` (admin: payout-details review, payout batches, CSV export, mark paid, cancel); no `affiliate` role
- [ ] **BE-AFF-18** `terms_versions` entity and seed (version 1 with the old programme's values, decided in 3c: rate 40%, 3 monthly or 1 annual commissionable payments, hold 30 days, minimum payout R100.00, attribution 12 months)
- Data for **BE-AFF-02** (built as part of that slice task): `affiliates` and `affiliate_status_history` entities, configurations, migration (the enrol endpoint is below; no `applications` table, decision 3b)
- [ ] **BE-AFF-19** Eligibility rule: the account must be 18 or older from `IUserProfileLookup.DateOfBirth` (decision 31); missing date of birth returns `409 affiliates.date_of_birth_required`; checked at enrolment; unit tests at the 18th birthday boundary in `Africa/Johannesburg`
- Data for **BE-AFF-04** (built as part of that slice task): `referral_codes` entity and a code generator (crypto random, unambiguous alphabet, collision retry)
- [ ] **BE-AFF-06** `payment_fingerprints` and `fraud_signals` entities; signal rules run on `ReferralAttributed` and `PaymentSucceeded`: self-referral card (referred user's card hash equals any of the affiliate's own), shared card across two referrals of one affiliate, more than 5 claims from one IP prefix in 24 h, refund within 7 days, referred account deleted within 30 days
- [ ] **BE-AFF-07** `commission_entries` append-only ledger: entity, unique posting key, zero-sum constraint trigger, no-update trigger, `LedgerPoster` that writes balanced postings only
- [ ] **BE-AFF-26** Commission rules (pure): eligibility (referral `attributed` or `converted`, not `blocked` or `flagged` high, affiliate `active`, payment `paid_at` before `attribution_expires_at` (BE-AFF-80), `payments_commissioned` below the snapshot limit for the payment's interval), amount from the VAT-exclusive payment amount and the affiliate's rate snapshot; property tests
- [ ] **BE-AFF-08** `PaymentSucceeded` and `SubscriptionRenewed` handlers: find the referral for the paying user (or, for seat plans, the owner), post accrual with `release_at`, set `first_payment_at` on first payment, increment `payments_commissioned`, schedule `ReleaseCommission(transactionId, releaseAt)`
- [ ] **BE-AFF-27** `RefundIssued` handler: pro-rata reversal posting as a new transaction against the original accrual; fraud signal `rapid_refund` when within 7 days
- [ ] **BE-AFF-28** `DisputeOpened` and `DisputeResolved` handlers: freeze (postpone or move back to held), unfreeze on a won dispute, reversal on a lost one
- [ ] **BE-AFF-09** Holds with scheduled release: `ReleaseCommission` Wolverine scheduled message posts the release when the accrual is still fully held and not frozen; stale or already released messages are no-ops; publishes `CommissionReleased`
- [ ] **BE-AFF-29** `payout_details` entity with encryption through `IFieldEncryptor`, `banks` seed with universal branch codes (values verified by a human against each bank's published code before launch)
- [ ] **BE-AFF-30** `payout_batches` and `payout_items` entities with the one-open-payout-per-affiliate index
- [ ] **BE-AFF-80** Attribution cap (decision 3c): `attributed_at`, `attribution_expires_at` and the `attribution_months` snapshot columns with their index; values set at claim (BE-AFF-05) from the affiliate's snapshot; pure `AttributionWindow` helper; unit tests at the boundary: a payment one second before `attribution_expires_at` accrues, one at the instant does not; 29 February plus 12 months gives 28 February; a renewal after expiry posts nothing even when `payments_commissioned` is below the limit
- [ ] **BE-AFF-81** Commission handlers honour the cap: BE-AFF-08 skips accrual for a payment at or after `attribution_expires_at`, logs `Outcome = attribution_expired`, increments `aptiverse.affiliates.accruals.skipped` (tag `reason`); integration test replays a `SubscriptionRenewed` 12 months and 1 day after first touch and asserts no posting
- [ ] **BE-AFF-82** Daily `ExpireAttributions` scheduled message: sets referrals past `attribution_expires_at` to `expired` (display only; eligibility is evaluated from the timestamp, never from the status), idempotent, batched 1 000 rows per transaction; test that a late run never changes a commission outcome
- [ ] **BE-AFF-41** `IAffiliateAdminQueries` implementation: payout-details review queue (filter by review status), affiliates with balances per account and enrolment date, referrals with `attributedAt` and `attributionExpiresAt` (BE-AFF-83), flagged referrals, batches with items, ledger by affiliate, total owed (`held + available + in_payout`)

## Slices

Group `/affiliates`, tag `Affiliates`. "Own" means `affiliates.user_id = current user`.

### BE-AFF-31  GET /affiliates/terms

| | |
|---|---|
| Operation id | `getAffiliateTerms` |
| Permission | anonymous |
| Entitlement | none |
| Rate limit | `default` (IP partition) |
| Idempotency | safe read; cached 10 min |
| Metric | `aptiverse.affiliates.terms.served` (counter) |
| Log fields | `TermsVersion` |

Response `200 AffiliateTerms`: `version`, `effectiveAt`, `bodyMarkdown`, `commissionRatePercent` (from bps, two decimals), `commissionableMonthlyPayments`, `commissionableAnnualPayments`, `holdDays`, `minimumPayoutCents`, `attributionMonths` (12), `minimumAge` (18).

- [ ] **BE-AFF-31** `GET /affiliates/terms`
  - [ ] Endpoint (`AllowAnonymous`)
  - [ ] Records
  - [ ] Validator (empty)
  - [ ] Handler (current version by `effective_at <= now`)
  - [ ] Unit tests: version selection
  - [ ] Integration tests: anonymous OK

### BE-AFF-02  POST /affiliates/me/enrol

Decision 3b: automatic enrolment replaces the old application step. The `/refer` page calls this when an adult account accepts the terms; it is the only way a profile is created.

| | |
|---|---|
| Operation id | `enrolAsAffiliate` |
| Permission | `affiliates.use` (no verified email needed to enrol; it is required for payout details, BE-AFF-12, decision 25) |
| Entitlement | none |
| Rate limit | `affiliates-enrol` (5 per day per user) |
| Idempotency | unique `affiliates.user_id`; a repeat for an existing profile returns `200` with the existing code and does not change the terms snapshot |
| Metric | `aptiverse.affiliates.enrolments` (counter, tag `outcome`) |
| Log fields | `UserId`, `AffiliateId`, `TermsVersion` |

Request: `acceptedTermsVersion` must equal the current version.

Behaviour: checks age (BE-AFF-19), creates the `active` affiliate with rate, commissionable payment counts, hold days and attribution months snapshotted from the accepted terms, generates the code, writes the first history row, publishes `AffiliateEnrolled` (email with code and link, and a prompt to add payout details).

Response `201 ReferralCodeView` (as BE-AFF-04) for a new profile, `200` for an existing one. Failures: `400`; `403 affiliates.must_be_adult`; `409 affiliates.date_of_birth_required`; `409 affiliates.terms_outdated`; `403 affiliates.suspended` for a suspended or closed profile.

- [ ] **BE-AFF-02** `affiliates` and `affiliate_status_history` tables and `POST /affiliates/me/enrol`
  - [ ] Entities, configurations, migration
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: eligibility branches, terms snapshot including `attribution_months`
  - [ ] Integration tests: happy 201, repeat 200 with the same code, under 18 403, missing date of birth 409, outdated terms 409

### BE-AFF-32  GET /affiliates/me/application (deferred, decision 3b)

| | |
|---|---|
| Operation id | `getMyAffiliateApplication` |
| Permission | `affiliates.use` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.affiliates.application.get.duration` |
| Log fields | `UserId`, `ApplicationId`, `Status` |

Response `200 ApplicationView`: `id`, `status`, `submittedAt`, `reviewedAt`, `decisionReason` (only when rejected), `canReapplyAt` (rejected plus 30 days), `affiliateStatus` (when approved). `404 affiliates.no_application` when none.

- [ ] **BE-AFF-32** `GET /affiliates/me/application` *(deferred: decision 3b, no application step in v1)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (latest application)
  - [ ] Unit tests: reapply date
  - [ ] Integration tests: none 404, pending, rejected with reason

### BE-AFF-03  POST /affiliates/admin/applications/{id}/approve (deferred, decision 3b)

| | |
|---|---|
| Operation id | `approveAffiliateApplication` |
| Permission | `affiliates.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | approving an approved application returns `200` |
| Metric | `aptiverse.affiliates.applications.decided` (counter, tag `decision`) |
| Log fields | `AdminUserId`, `ApplicationId`, `AffiliateId`, `Decision` |

Request: `note` optional max 500. Behaviour: re-checks age, creates the affiliate with rate, commissionable payment counts and hold days snapshotted from the accepted terms, generates the code, history row, publishes `AffiliateApproved` (email with code and link).

Failures: `404`; `409 affiliates.illegal_transition`; `403 affiliates.must_be_adult`.

- [ ] **BE-AFF-03** Approve (original task, approve part) *(deferred: decision 3b, no application step in v1; enrolment is BE-AFF-02)*
  - [ ] Endpoint plus `ApproveAffiliateApplication` command handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: snapshot of terms
  - [ ] Integration tests: happy, non-admin 403, already rejected 409

### BE-AFF-20  POST /affiliates/admin/applications/{id}/reject (deferred, decision 3b)

Permission `affiliates.manage`; request `reason` 10 to 500 chars (shown to the applicant); idempotent; metric `aptiverse.affiliates.applications.decided` tag `rejected`; log fields `AdminUserId`, `ApplicationId`. Failures `404`, `409 affiliates.illegal_transition`.

- [ ] **BE-AFF-20** Reject *(deferred: decision 3b, no application step in v1)*
  - [ ] Endpoint plus command handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (email with reason)
  - [ ] Unit tests: transition guard
  - [ ] Integration tests: happy, approved cannot be rejected 409

### BE-AFF-21  POST /affiliates/admin/affiliates/{id}/suspend

Permission `affiliates.manage`; request `reason` 10 to 500; idempotent; metric `aptiverse.affiliates.status_changed` (tag `to`); log fields `AdminUserId`, `AffiliateId`, `ToStatus`. Effect: code stops attributing new referrals, accruals continue to post but releases are postponed until reinstated (open question 5), payouts excluded from batches. Publishes `AffiliateStatusChanged`.

- [ ] **BE-AFF-21** Suspend
  - [ ] Endpoint plus command handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: effects on attribution and batching
  - [ ] Integration tests: happy, suspended code refuses claims

### BE-AFF-22  POST /affiliates/admin/affiliates/{id}/reinstate

Permission `affiliates.manage`; request `note` 10 to 500; idempotent; same metric and log fields; schedules releases that came due while suspended.

- [ ] **BE-AFF-22** Reinstate
  - [ ] Endpoint plus command handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: due releases rescheduled
  - [ ] Integration tests: happy, active cannot be reinstated 409

### BE-AFF-04  GET /affiliates/me/code

| | |
|---|---|
| Operation id | `getMyReferralCode` |
| Permission | `affiliates.use` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.affiliates.code.get.duration` |
| Log fields | `UserId`, `AffiliateId` |

Response `200 ReferralCodeView`: `code`, `shareUrl` (`{AppBaseUrl}/r/{code}`), `status` (affiliate status), `payoutDetailsStatus` (`not_submitted`, `in_review`, `confirmed`, `needs_fixing`). Failures: `404 affiliates.not_affiliate` (the page then offers enrolment, BE-AFF-02).

- [ ] **BE-AFF-04** `referral_codes` and `GET /affiliates/me/code`
  - [ ] Entity, code generator, migration
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: share URL from config
  - [ ] Integration tests: affiliate, non-affiliate 404

### BE-AFF-24  GET /affiliates/codes/{code}

| | |
|---|---|
| Operation id | `checkReferralCode` |
| Permission | anonymous |
| Entitlement | none |
| Rate limit | `affiliates-code-check` (30 per minute per IP) to stop enumeration |
| Idempotency | safe read |
| Metric | `aptiverse.affiliates.code_checks` (counter, tag `valid`) |
| Log fields | `CodeValid` (never the code itself at info level) |

Response `200 { valid: true, affiliateFirstName }` or `404 affiliates.code_not_found` (also for suspended affiliates). The web sets a signed, httpOnly attribution cookie (30 days) holding the code and click time; see open question 8 for how the cookie is signed.

- [ ] **BE-AFF-24** Public code check
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (pattern)
  - [ ] Handler
  - [ ] Unit tests: case-insensitive match
  - [ ] Integration tests: valid, unknown 404, suspended 404, rate limit trips

### BE-AFF-05  POST /affiliates/attribution/claim

| | |
|---|---|
| Operation id | `claimReferralAttribution` |
| Permission | authenticated (any role); no `affiliates.use` needed |
| Entitlement | none |
| Rate limit | `affiliates-claim` (5 per hour per user) |
| Idempotency | unique `referred_user_id`; a repeat claim with the same code returns `200` with the existing referral; a different code returns `409 affiliates.attribution_not_eligible` (`reason = already_attributed`) |
| Metric | `aptiverse.affiliates.attribution.claims` (counter, tag `outcome`) |
| Log fields | `UserId`, `AffiliateId`, `ReferralId`, `Outcome`, `Reason` |

Request: `code` (pattern), `clickedAt` (from the signed cookie, must be within 30 days and not in the future), `cookieSignature`.

Rules: affiliate active; not self (affiliate user id differs); referred account created after `clickedAt` minus 1 hour and at most 7 days old; `attributed_at` and `attribution_expires_at` set from the affiliate's snapshot (BE-AFF-80); the referred user has no prior `PaymentSucceeded` (local fingerprint table knows paying users); stores IP prefix only.

Response `200 { attributed: true }` or `{ attributed: false, reason }` for non-error ineligibility so the web can clear the cookie silently. Events: `ReferralAttributed`.

- [ ] **BE-AFF-05** `POST /affiliates/attribution/claim`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: each eligibility rule
  - [ ] Integration tests: happy (expiry is 12 months after the click time), self-referral refused, old account refused, second code refused, replay idempotent

### BE-AFF-10  GET /affiliates/me/earnings

| | |
|---|---|
| Operation id | `getMyAffiliateEarnings` |
| Permission | `affiliates.use` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.affiliates.earnings.get.duration` |
| Log fields | `UserId`, `AffiliateId` |

Response `200 EarningsSummary`: `heldCents`, `availableCents`, `inPayoutCents`, `paidCents` (all sums from the ledger), `currency`, `nextReleaseAt`, `nextReleaseCents`, `minimumPayoutCents`, `eligibleForNextBatch` (bool with `reason` when false: `below_minimum`, `no_payout_details`, `details_cooling`, `suspended`), `recent[]` (last 20 postings: `occurredAt`, `kind`, `amountCents`, `referralLabel` as "Referral 7" never the referred user's name).

- [ ] **BE-AFF-10** `GET /affiliates/me/earnings`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (one grouped sum query)
  - [ ] Unit tests: eligibility reasons
  - [ ] Integration tests: balances after accrual, release, reversal; non-affiliate 404

### BE-AFF-11  GET /affiliates/me/referrals

| | |
|---|---|
| Operation id | `listMyReferrals` |
| Permission | `affiliates.use` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.affiliates.referrals.list.duration` |
| Log fields | `UserId`, `AffiliateId`, `ResultCount` |

Request: `status` optional, `page`, `pageSize` 1 to 50. Response `PagedResult<ReferralView>`: `label` ("Referral 7", sequential per affiliate), `claimedAt`, `attributedAt`, `attributionExpiresAt`, `status` (`signed_up`, `paying`, `ended`, `expired`, `under_review`), `firstPaymentAt`, `earnedCents`. Never the referred person's name, email or plan details beyond paying or not (POPIA: referred users are often minors).

- [ ] **BE-AFF-11** `GET /affiliates/me/referrals`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: status mapping hides `flagged` as `under_review`; past `attributionExpiresAt` maps to `expired`
  - [ ] Integration tests: own only, no PII in JSON

### BE-AFF-12  PUT /affiliates/me/payout-details

| | |
|---|---|
| Operation id | `setMyPayoutDetails` |
| Permission | `affiliates.use`; verified email; recent sign-in within 15 minutes (session `auth_time`) |
| Entitlement | none |
| Rate limit | `affiliates-payout-details` (5 per day per user) |
| Idempotency | identical details return `200` without a new row or cooling reset |
| Metric | `aptiverse.affiliates.payout_details.changed` (counter) |
| Log fields | `UserId`, `AffiliateId`, `BankCode` (never account number or holder) |

Request: `legalFirstName` and `legalLastName` 1 to 60 each; `idType` and `idNumber` (SA ID: 13 digits with a valid Luhn check digit; passport: 6 to 20 alphanumerics); `address` (`line1` max 120, `line2` optional, `city`, `province` from the 9 provinces, `postalCode` 4 digits); `contactPhone` optional E.164; `accountHolder` 2 to 120; `bankCode` in active `banks`; `branchCode` digits 6 (defaults to the bank's universal code); `accountNumber` digits 6 to 16; `accountType` enum; `taxNumber` optional 10 digits.

Behaviour: encrypt, insert new current row with `usable_from = now + 48 h` and `review_status = 'in_review'`, clear old flag, publish `PayoutDetailsChanged` (email "your payout details changed; if this was not you, contact support").

Response `200 MaskedPayoutDetails` (as BE-AFF-33).

Failures: `400`; `400 affiliates.bank_not_supported`; `401` re-auth required (`code = identity.reauth_required`); `404 affiliates.not_affiliate`.

- [ ] **BE-AFF-12** `PUT /affiliates/me/payout-details`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: no-op on identical details, cooling period
  - [ ] Integration tests: happy, stale session 401, logs contain no account number (log sink assertion)

### BE-AFF-33  GET /affiliates/me/payout-details

Permission `affiliates.use`; rate limit `default`; metric `aptiverse.affiliates.payout_details.read`; log fields `UserId`, `AffiliateId`. Response `200 MaskedPayoutDetails`: `reviewStatus`, `reviewNotes`, `accountHolderMasked` (first letter plus asterisks per word), `bankCode`, `bankName`, `accountNumberLast4`, `accountType`, `hasTaxNumber`, `usableFrom`, `updatedAt`; `404 affiliates.payout_details_required` when none. Never decrypts the account number.

- [ ] **BE-AFF-33** Masked payout details read
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (decrypts only the holder name to mask it)
  - [ ] Unit tests: masking rules
  - [ ] Integration tests: masked shape, none 404

### BE-AFF-47  POST /affiliates/admin/payout-details/{id}/review

Permission `affiliates.payouts.manage`; request `outcome` `confirmed|needs_fixing`, `notes` (required for `needs_fixing`, 10 to 500); idempotent per outcome; metric `aptiverse.affiliates.payout_details.reviewed` (tag `outcome`); log fields `AdminUserId`, `AffiliateId`, `Outcome`. The admin sees decrypted identity and bank fields only in this review view (BE-ADM-12 read through `IAffiliateAdminQueries`, audited per view). `needs_fixing` notifies the affiliate with the notes; a resubmission (BE-AFF-12) returns the row to `in_review`. The masked read (BE-AFF-33) shows `reviewStatus` and `reviewNotes`.

- [ ] **BE-AFF-47** Payout details review workflow (in review, confirmed, needs fixing with notes)
  - [ ] Endpoint plus command handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: state transitions
  - [ ] Integration tests: confirm, needs fixing then resubmit, unconfirmed details excluded from batches

### BE-AFF-48  GET /affiliates/me/commissions

Permission `affiliates.use`; rate limit `default`; metric `aptiverse.affiliates.commissions.list.duration`; log fields `UserId`, `AffiliateId`, `ResultCount`. Request `status` optional (`held`, `payable`, `paid`, `reversed`), `page`, `pageSize` 1 to 50. Response `PagedResult<CommissionView>`: one row per accrual with `referralLabel`, `paymentNumber`, `paymentInterval`, `amountCents`, `status` (derived from the postings: held, payable, in payout, paid, reversed, partly reversed), `occurredAt`, `releaseAt`, `paidAt`, `reversedCents`.

- [ ] **BE-AFF-48** Commission list (one row per accrual, status derived from postings)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: status derivation for every posting combination
  - [ ] Integration tests: each status, own only

### BE-AFF-49  GET /affiliates/me/tax-years

Permission `affiliates.use`; rate limit `default`; metric `aptiverse.affiliates.tax_years.list.duration`. Response `items[]` of `{ taxYear, label ("2026/2027"), periodStart, periodEnd, paidCents, isFinal }` for every SARS tax year with activity; boundaries are 1 March 00:00 to the last day of February 23:59:59 in `Africa/Johannesburg` (SAST), not UTC.

- [ ] **BE-AFF-49** Tax years list
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: SAST boundary (a payout at 23:30 UTC on the last day of February belongs to the next tax year)
  - [ ] Integration tests: two tax years

### BE-AFF-77  GET /affiliates/me/tax/{year}/statement.csv

Permission `affiliates.use`; rate limit `default`; metric `aptiverse.affiliates.statement_csv.served`. Streams the tax-year statement as CSV (date, description, referral label, earned, reversed, paid, running balance) with `Content-Disposition: attachment` and `Cache-Control: no-store`. Every text cell starting with `=`, `+`, `-`, `@`, tab or carriage return is prefixed with a single quote (formula-injection escaping); amounts are rand with two decimals from cents.

- [ ] **BE-AFF-77** Statement CSV
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (shared CSV writer with BE-AFF-38)
  - [ ] Unit tests: formula-injection escaping, SAST boundaries
  - [ ] Integration tests: own statement, another affiliate's 404

### BE-AFF-34  GET /affiliates/banks

Permission `affiliates.use`; rate limit `default`; cached 1 h; metric `aptiverse.affiliates.banks.served`. Response `200 banks[]` of `{ code, name, universalBranchCode }` active only.

- [ ] **BE-AFF-34** Supported bank list
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: inactive excluded
  - [ ] Integration tests: list

### BE-AFF-14  GET /affiliates/me/payouts

Permission `affiliates.use`; rate limit `default`; metric `aptiverse.affiliates.payouts.list.duration`; log fields `UserId`, `AffiliateId`, `ResultCount`. Request `page`, `pageSize`. Response `PagedResult<PayoutView>`: `id`, `batchReference`, `amountCents`, `status`, `createdAt`, `paidAt`, `bankAccountLast4`.

- [ ] **BE-AFF-14** `GET /affiliates/me/payouts`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: status mapping
  - [ ] Integration tests: own only

### BE-AFF-35  GET /affiliates/me/payouts/{id}

Permission `affiliates.use`; ownership by affiliate (404 otherwise); metric `aptiverse.affiliates.payouts.get.duration`. Response `200 PayoutDetail`: list fields plus `bankReference`, `failureReason`, `entries[]` (the ledger postings included: release dates and amounts, referral labels).

- [ ] **BE-AFF-35** Payout detail
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: entries sum to the payout amount
  - [ ] Integration tests: own, another affiliate's 404

### BE-AFF-15  GET /affiliates/me/tax/{year}

| | |
|---|---|
| Operation id | `getMyAffiliateTaxSummary` |
| Permission | `affiliates.use` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.affiliates.tax_summary.served` (counter) |
| Log fields | `UserId`, `AffiliateId`, `TaxYear` |

Request: `year` int is the tax year ending in February of that year (`2027` means 1 March 2026 to 28 February 2027, SARS tax year), between the programme start and the current tax year.

Response `200 TaxYearSummary`: `taxYear`, `periodStart`, `periodEnd`, `paidCents` (cash basis: payouts marked paid within the period), `earnedCents` (accruals), `reversedCents`, `monthly[]` (12 rows of paid and earned), `isFinal` (period ended), `statementAvailable`.

- [ ] **BE-AFF-15** Tax-year summary
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (year range)
  - [ ] Handler
  - [ ] Unit tests: tax year boundaries including leap years
  - [ ] Integration tests: sums match ledger for a seeded year

### BE-AFF-36  GET /affiliates/me/tax/{year}/statement

Permission `affiliates.use`; rate limit `default`; metric `aptiverse.affiliates.statement.served` (tag `generated`). Response `200 { url, expiresAt }`: presigned GET (5 min) to a PDF stored at `affiliates/statements/{affiliateId}/{year}.pdf`, rendered once when the tax year closes (final) or on demand as an interim statement marked "interim"; contains the affiliate's name, masked bank account, tax number if given, the summary figures and Aptiverse's details. Failures: `404`, `409 affiliates.statement_not_ready`.

- [ ] **BE-AFF-36** Tax statement PDF URL
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler plus renderer
  - [ ] Unit tests: final versus interim labelling
  - [ ] Integration tests: own statement, another affiliate's 404

### BE-AFF-37  GET /affiliates/me/statements

Monthly statements list: permission `affiliates.use`; response `items[]` of `{ month, openingAvailableCents, earnedCents, releasedCents, reversedCents, paidCents, closingAvailableCents }`, computed from the ledger; metric `aptiverse.affiliates.statements.list.duration`.

- [ ] **BE-AFF-37** Monthly statements
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: opening plus movements equals closing for every month
  - [ ] Integration tests: seeded ledger

### BE-AFF-25  POST /affiliates/admin/fraud-signals/{id}/resolve

Permission `affiliates.manage`; request `resolution` `cleared|blocked`, `note` 10 to 500; idempotent (a second resolution returns `409 affiliates.illegal_transition`); metric `aptiverse.affiliates.fraud_signals.resolved` (tag `resolution`); log fields `AdminUserId`, `FraudSignalId`, `ReferralId`. `blocked` sets the referral `blocked` and posts reversals for all its unpaid accruals; `cleared` returns it to `attributed` or `converted` and reschedules releases.

- [ ] **BE-AFF-25** Clear or block a flagged referral
  - [ ] Endpoint plus command handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: reversal postings on block
  - [ ] Integration tests: clear, block, non-admin 403

### BE-AFF-40  POST /affiliates/admin/ledger/reversals

Permission `affiliates.manage`; request `affiliateId`, `sourceTransactionId`, `amountCents` > 0 and at most the remaining unreversed amount of that accrual, `note` 10 to 300; required `Idempotency-Key`; metric `aptiverse.affiliates.ledger.admin_reversals` (counter); log fields `AdminUserId`, `AffiliateId`, `TransactionId`, `AmountCents`. Posts a reversal transaction; audit event.

- [ ] **BE-AFF-40** Admin commission reversal
  - [ ] Endpoint plus `ReverseCommission` handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: cap at remaining amount
  - [ ] Integration tests: happy, over-reversal 409, idempotent replay

### BE-AFF-13  POST /affiliates/admin/payout-batches

| | |
|---|---|
| Operation id | `generatePayoutBatch` |
| Permission | `affiliates.payouts.manage` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | required `Idempotency-Key`; only one `draft` or `exported` batch may exist at a time (unique partial index), so a second generate returns `409` |
| Metric | `aptiverse.affiliates.payout_batches.generated` (counter), `aptiverse.affiliates.payout_batches.total_cents` (histogram) |
| Log fields | `AdminUserId`, `BatchId`, `ItemCount`, `TotalCents` |

Behaviour: first releases every matured hold that is due (same postings as BE-AFF-09, so a missed scheduled message never short-changes a run); then for each active affiliate with net `available >= minimum` (refund reversals are netted against earnings, so a negative balance is carried forward, never invoiced), current `confirmed` payout details with `usable_from <= now`, and no open item, creates an item for the full available balance and posts the payout lock. Batch `draft`.

Response `201 PayoutBatchView`: `id`, `reference`, `status`, `itemCount`, `totalCents`, `items[]` (`affiliateId`, display name, `amountCents`, bank name, last4).

- [ ] **BE-AFF-13** Generate payout batch (original task, generate part)
  - [ ] Endpoint plus `GeneratePayoutBatch` handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (single transaction, row lock per affiliate)
  - [ ] Unit tests: eligibility filter
  - [ ] Integration tests: happy, second batch 409, cooling details excluded, ledger lock legs present

### BE-AFF-38  GET /affiliates/admin/payout-batches/{id}/export.csv

Permission `affiliates.payouts.manage`; rate limit `default`; metric `aptiverse.affiliates.payout_batches.exported`; log fields `AdminUserId`, `BatchId` (never row contents). Decrypts details server-side and streams a CSV in the bank's bulk-payment format (decision 56: manual EFT; the bank is still owed in DECISIONS.md section F, so the default layout ships first; default columns: beneficiary name, bank, branch code, account number, account type, amount in rand with two decimals, reference `AFF-<ref>-<n>`). Sets the batch `exported` and items `exported`. Response headers `Content-Disposition: attachment`, `Cache-Control: no-store`. Audit event with the admin id and row count.

- [ ] **BE-AFF-38** CSV export
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (CSV injection guard: prefix cells starting with `=`, `+`, `-`, `@` with a single quote)
  - [ ] Unit tests: CSV escaping and injection guard, amount formatting from cents
  - [ ] Integration tests: export marks exported, non-admin 403

### BE-AFF-39  POST /affiliates/admin/payout-batches/{id}/mark-paid

Permission `affiliates.payouts.manage`; request `items[]` of `{ itemId, outcome: paid|failed, bankReference (paid, max 40), failureReason (failed, max 200) }` covering every exported item; required `Idempotency-Key`; metric `aptiverse.affiliates.payouts.paid_cents` (counter); log fields `AdminUserId`, `BatchId`, `PaidCount`, `FailedCount`. Posts payout paid or unlock legs per item; batch `paid` when all items resolved; publishes `PayoutBatchPaid`; notifies each paid affiliate.

- [ ] **BE-AFF-39** Mark paid (with per-item failure)
  - [ ] Endpoint plus `MarkPayoutBatchPaid` handler
  - [ ] Records
  - [ ] Validator (every item exactly once)
  - [ ] Handler
  - [ ] Unit tests: partial failure postings
  - [ ] Integration tests: all paid, one failed returns funds to available, replay idempotent

### BE-AFF-42  POST /affiliates/admin/payout-batches/{id}/cancel

Permission `affiliates.payouts.manage`; request `reason` 10 to 300; allowed in `draft` or `exported`; posts unlock legs for every item; metric `aptiverse.affiliates.payout_batches.cancelled`; audit event.

- [ ] **BE-AFF-42** Cancel batch
  - [ ] Endpoint plus `CancelPayoutBatch` handler
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: unlock legs
  - [ ] Integration tests: cancel draft, cancel exported, paid cannot be cancelled 409

## Background work

- `ReleaseCommission` scheduled messages: see BE-AFF-09 in the foundation tasks
- [ ] **BE-AFF-43** Release safety net: daily scheduled message finds held accruals past `release_at` with no release (missed message) and posts them, alerting when it finds any
- [ ] **BE-AFF-44** Year-end statements: on 1 March, a scheduled message renders final statements for the closed tax year for every affiliate with activity and notifies them
- [ ] **BE-AFF-23** `UserRegistered` handler: nothing is attributed automatically (claim is explicit); records the account creation time locally for the 7-day rule without reading Identity tables
- [ ] **BE-AFF-16** Test: after a randomised sequence of payments, renewals, refunds, disputes, releases, batches, failures and cancellations, the ledger sums match the payouts to the cent, every transaction sums to zero, and `paid` equals the sum of paid payout items
- [ ] **BE-AFF-45** Error code contract test (every `Error` constant listed in the error code table)

Account deletion:

- [ ] **BE-AFF-46** `AccountDeletionRequested` handler: an affiliate's profile becomes `closed`, the code deactivates, unpaid available balance above the minimum is paid in the next batch (a balance below the minimum: open question 9); ledger, payout and statement rows are retained 5 years (tax records) with the payout details deleted after the final payout; a referred user's deletion keeps the referral row with `referred_user_id` replaced by a tombstone id

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Spoofing: claiming as another user | Attribution claim | Authenticated user id only; code and click time from a signed cookie | BE-AFF-05 |
| Tampering: ledger edits | `commission_entries` | Append-only triggers block update and delete; postings only through `LedgerPoster`; zero-sum constraint; unique posting key | BE-AFF-52 |
| Tampering: inflated commission | Accrual | Amount from the Billing event, never from a request; rate snapshot per affiliate; admin rate changes audited | BE-AFF-26, BE-AFF-53 |
| Tampering: self-referral and fake accounts | Claims, payments | Self check, card fingerprint, IP cluster, account age, holds before release | BE-AFF-06 |
| Tampering: payout redirection (changed bank details) | Payout details | Recent re-auth, email notice, 48 h cooling, details snapshot per item | BE-AFF-12 |
| Repudiation | Admin actions | Status history and ledger rows carry the actor; audit events for every admin action including failures | BE-AFF-57 |
| Information disclosure: bank details | Storage, export, logs | Field encryption, masked reads, CSV only to admins, `no-store`, log sink test | BE-AFF-29, BE-AFF-54 |
| Information disclosure: referred users (often minors) | Referrals list | Labels only, no names or emails | BE-AFF-11 |
| Information disclosure: code enumeration | Code check | Rate limit per IP, uniform 404 | BE-AFF-24 |
| Denial of service | Claims, code checks | Rate limits | BE-AFF-55 |
| Elevation: non-admin batch actions | Admin endpoints | `affiliates.manage` and `affiliates.payouts.manage`; matrix test | BE-AFF-50 |

- [ ] **BE-AFF-50** Threat model in the module README; authorisation matrix test per endpoint (anonymous, non-affiliate student, affiliate, suspended affiliate, another affiliate, admin)
- [ ] **BE-AFF-51** Suspended affiliates: read endpoints work, mutations except payout details return `403 affiliates.suspended`; tests
- [ ] **BE-AFF-52** Database triggers rejecting `update` and `delete` on `commission_entries`, `fraud_signals`, `fraud_signal_resolutions`, `affiliate_status_history`; migration test proves an update raises
- [ ] **BE-AFF-53** Admin rate change command (rare): new snapshot applies only to accruals after the change; audited; test

### Input limits, rate limits, idempotency, concurrency

- [ ] **BE-AFF-54** Body caps (2 KB, mark paid 64 KB), field limits as above; log sink test proves no account number, holder name or tax number is ever logged
- [ ] **BE-AFF-55** Rate-limit policies `affiliates-enrol` 5/day, `affiliates-claim` 5/hour, `affiliates-code-check` 30/min/IP, `affiliates-payout-details` 5/day; tests trip each
- [ ] **BE-AFF-56** Idempotency: unique posting key makes every event handler replay-safe (test replays each Billing event 10 times); `Idempotency-Key` on batch generate, mark paid, reversals; `xmin` on affiliates, batches and items mapped to `409 affiliates.concurrency_conflict`; parallel release and refund on the same accrual produce a consistent ledger

### Audit

- [ ] **BE-AFF-57** Audit events: affiliate enrolled, status changed, fraud signal resolved, reversal posted, rate changed, batch generated, exported (with row count), marked paid, cancelled, payout details changed (no values)

### Money correctness

- [ ] **BE-AFF-58** Property-based tests (FsCheck): every posting sums to zero; balances never depend on row order; reversals never exceed accruals per payment; `in_payout` is zero when no batch is open
- [ ] **BE-AFF-59** Reconciliation job (nightly): recompute balances per affiliate from scratch and compare with the sum query used by the API; compare total accruals in a month with `PaymentSucceeded` events received from referred users (event log count) and report drift; alert on any mismatch
- [ ] **BE-AFF-60** Payout run checklist test: a batch total equals the sum of its items equals the sum of the `payout_lock` legs, to the cent
- [ ] **BE-AFF-61** Refund test (Phase 6 exit gate): a refund of a referred payment produces a reversal row and the affiliate's balance drops by the pro-rata amount

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `payout_details.*_encrypted` | Personal information (financial); tax number | Until 90 days after the final payout following closure |
| `commission_entries`, `payout_items`, statements | Financial and tax records | 5 years after the tax year |
| `referrals.claim_ip_prefix` | Network identifier (truncated) | 12 months |
| `referrals.referred_user_id` | Personal information of a possibly minor user | Tombstoned on that user's deletion |

- [ ] **BE-AFF-62** Classification in the README and POPIA inventory; retention jobs per class; export contributor (BE-IDN-37) for the affiliate's own profile, ledger and payouts (masked bank details)

### Observability

- [ ] **BE-AFF-63** Trace spans: `affiliates.claim`, `affiliates.ledger.post` (attributes `kind`, `source_type`), `affiliates.release`, `affiliates.batch.generate`, `affiliates.batch.export`
- [ ] **BE-AFF-64** Metrics on meter `Aptiverse.Affiliates`: `aptiverse.affiliates.ledger.postings` (counter, tag `kind`), `aptiverse.affiliates.owed_cents` (observable gauge: held plus available plus in_payout), `aptiverse.affiliates.release.lag_seconds` (histogram), `aptiverse.affiliates.fraud_signals.raised` (counter, tag `kind`), `aptiverse.affiliates.reconciliation.drift` (gauge)
- [ ] **BE-AFF-65** Alerts: reconciliation drift above 0; release safety net found missed releases; more than 10 high-severity fraud signals in a day; a Billing event handler failing after retries; payout batch exported but not marked paid within 7 days

### Performance budgets

- [ ] **BE-AFF-66** Budgets: earnings p95 under 150 ms with 10 000 ledger rows per affiliate (index `(affiliate_id, account)`; add a monthly snapshot projection only if this fails); claim p95 under 100 ms; batch generation for 1 000 affiliates under 30 s; `EXPLAIN` reviewed

### Migration safety

- [ ] **BE-AFF-67** Ledger table changes are additive only (expand and contract); the no-update trigger is dropped and recreated only inside a reviewed migration; rollback plan per migration
- [ ] **BE-AFF-68** Cutover (with MIG-17): open holds, available balances and payout history imported as opening postings per affiliate (`kind = 'adjustment'`, note `migrated opening balance`), reconciled to the cent against the old system's report; no payout run in cutover week

### SLO contribution

- [ ] **BE-AFF-69** SLOs: Billing event to ledger posting within 5 minutes for 99.9%; release within 1 hour of `release_at` for 99.9%; affiliate read endpoints inside the platform p95 SLO

### Operations

- [ ] **BE-AFF-70** Runbook contribution `docs/runbooks/affiliate-payout-run.md` (HRD-06): generate, review, export, upload to bank, mark paid, handle failures
- [ ] **BE-AFF-71** Encryption key rotation job for `payout_details` (re-encrypt by `encryption_key_id`)
- [ ] **BE-AFF-72** Terms change procedure: new `terms_versions` row; existing affiliates keep their snapshot until they accept the new version (prompt in `/refer`)
- [ ] **BE-AFF-73** Terms values (rate, commissionable payment counts, hold days, minimum payout, attribution months) are config-driven seed data with the decision 3c values; a startup check refuses to boot in production if the seeded `attribution_months` is missing or above 12 without a new terms version
- [ ] **BE-AFF-74** Seed for local dev: one enrolled affiliate with confirmed payout details, three referrals (one expired by the 12-month cap), a ledger history across every posting kind
- [ ] **BE-AFF-75** k6 scenario: 1 000 Billing events per minute into the ledger with duplicates
- [ ] **BE-AFF-76** Architecture test: the module references `Aptiverse.Billing.Contracts` only, never Billing internals or tables

## Old data mapping

Source: the old app at `43f9faa` (`api/Modules/Affiliates`, `api/Controllers/AffiliatesController.cs`, `AffiliatesAdminController.cs`). Money there is `decimal` rand; every amount maps to cents with `round(amount * 100)` and a reconciliation check that totals match to the cent.

| Old (43f9faa) | New | Notes (feeds MIG-17) |
|---|---|---|
| `affiliates.affiliates` (`long Id`, `UserId`, `ReferralCode`, `Status` Active or Suspended, `PayoutOnboardingStatus` NotStarted, Submitted, Approved, Rejected, plain-text legal name, ID type and number, tax reference, address, bank fields, `ReviewedAt`, `ReviewNotes`) | `affiliates` (with `terms_version` 1, `enrolled_at` = old created time, terms snapshot from the seed), `referral_codes`, `payout_details` (encrypted), `affiliate_status_history` (one migrated row) | The old app enrolled automatically and reviewed payout onboarding, which is exactly the decision 3b model; `Approved` onboarding becomes `confirmed` payout details with `usable_from` = migration time; `Submitted` becomes `in_review` (BE-AFF-47 handles it); `Rejected` becomes `needs_fixing` with the old review notes; plain-text ID numbers and bank details are encrypted on import and the old columns are wiped in the old DB after cutover |
| `ReferralCode` (8 chars from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`) | `referral_codes.code` | Kept verbatim so shared links keep working; it fits the new pattern |
| `affiliates.referrals` (`ReferredUserId`, `CodeUsed`, `Status` Signed, Earning, Completed, Flagged, Blocked; `SignedUpAt`, `FirstPaymentAt`, `CompletedAt`, `LandingPath`, `FlagReason`, review fields) | `referrals` | Signed to `attributed`, Earning to `converted`, Completed to `converted` with `payments_commissioned` at the limit, Flagged to `flagged`, Blocked to `blocked`; `attributed_at` = `SignedUpAt` (the old app stored no click time) and `attribution_expires_at` = `SignedUpAt` plus 12 months, so referrals older than 12 months at cutover import as `expired` and earn nothing more (decision 3c, BE-AFF-84); commission already accrued before cutover is honoured; `LandingPath` dropped |
| `affiliates.commission_entries` (`EntryType` Accrual, Reversal, Adjustment; `Status` Pending, Held, Payable, Paid, Reversed; `AmountZar`, `HoldUntil`, `PayoutId`, `ReversesEntryId`, `PaymentNumber`, `SourcePaymentReference`) | `commission_entries` postings | Each old entry becomes a balanced posting chain for its current status: Held to an accrual (held leg with `release_at = HoldUntil`, release message rescheduled), Payable to accrual plus release, Paid to accrual, release, payout lock and payout paid tied to the migrated payout item, Reversed to accrual plus reversal; `PaymentNumber` sums into `payments_commissioned` |
| `affiliates.commission_entry_events` (status history) | not migrated as rows | Summarised in the posting notes; the old table is archived with the snapshot for 5 years (tax records) |
| `affiliates.affiliate_payouts` (one row per affiliate per run, `RunReference`, `TotalZar`, `Status` Draft, Paid, Cancelled, payee and bank snapshot) and `affiliate_payout_items` (per commission entry) | `payout_batches` (one per `RunReference`) and `payout_items` (one per old payout row) | Old per-entry items become the payout detail entries; Draft payouts at cutover are cancelled first (no payout run in cutover week) |
| `affiliates.payment_fingerprints` (`FingerprintHash`, card brand, last4) | `payment_fingerprints` | Old hash is not the new peppered hash; imported into a `legacy_hash` column used only for matching old cards, or dropped (decide in MIG-17) |
| `affiliates.device_fingerprints` | none | Device hashing is not carried over (POPIA minimisation); see open question 12 |
| `affiliates.referral_fraud_signals` (`SignalType`, `Severity` Block or Review) | `fraud_signals` | Block to `high`, Review to `low`; reviewed signals get a resolution row |

## Tests

- Unit: commission rules, posting builders (each sums to zero), eligibility, masking, CSV escaping, tax-year boundaries, code generator.
- Integration: every slice happy, validation, forbidden, not found; each Billing event replayed 10 times; refund reverses commission; dispute freeze; payout lifecycle including partial failure and cancel.
- Property-based: BE-AFF-16, BE-AFF-58.

## Contracts requested by other modules

- [ ] **BE-AFF-78** `IAffiliateProfileLookup` contract in `Aptiverse.Affiliates.Contracts`: given a user id, returns whether an affiliate profile exists, its status (active, suspended, blocked) and payout-details review state; consumed by Identity for `/me` and by Navigation for the `/refer` entry
- [ ] **BE-AFF-83** Attribution dates in reads: `attributedAt` and `attributionExpiresAt` in BE-AFF-11 and `IAffiliateAdminQueries` (admin referral list and affiliate detail), `attributionMonths` in BE-AFF-31; contract test that the fields are present and the referred user's identity is still absent
- [ ] **BE-AFF-84** Migration rule for the cap (feeds MIG-17): migrated referrals take `attributed_at` from the old `SignedUpAt` and expire 12 months later; a rehearsal report lists how many referrals import as `expired` and the commission they would have earned in the next 3 months, for the product owner to see before cutover; no accrued commission is reversed
- [ ] **BE-AFF-85** Terms acceptance gate: when a new `terms_versions` row takes effect, mutations except payout details return `409 affiliates.terms_outdated` until the affiliate re-accepts in `/refer` (BE-AFF-72); accruals continue on the old snapshot meanwhile; tests
- [ ] **BE-AFF-79** Adjustment ledger entry type (`adjustment`, positive or negative, admin id and reason required, append-only) used by the admin adjustment command; included in balances, statements and tax-year summaries

## Open questions

1. Decided (30): Identity captures `date_of_birth` at onboarding (BE-IDN-02), which drives the 18+ rule here.
2. Decided (E): affiliate is a profile on a student or parent account, not a role. BE-IDN-06 must not seed an `affiliate` role.
3. Decided (3c): 40% of the VAT-exclusive amount of the first 3 monthly or 1 annual payment, 30-day hold. The old code took commission on the full payment; the VAT-exclusive base is kept so commission is never paid on tax collected for SARS. If Aptiverse is not VAT-registered (DECISIONS.md section F, item 50) the two are equal. Marketing and earnings copy must use VAT-exclusive worked examples.
4. Decided (3c): R100.00 minimum payout, seeded in BE-AFF-18.
5. While suspended, do accruals keep posting (held) or stop? Assumed they post but never release until reinstated or blocked.
6. Decided (56): manual EFT from the bank's bulk CSV; the bank (and so the exact CSV layout) is owed in DECISIONS.md section F, item 56.
7. Decided (E): the `/affiliates/admin` endpoints are the real ones; BE-ADM-12 is the admin UI read side.
8. Attribution cookie signing: the web signs the cookie; the API needs the shared key or the web passes the click time unsigned. Recommend a signed token issued by `GET /affiliates/codes/{code}`.
9. On account closure, is an available balance below the minimum paid out or forfeited?
10. Affiliate tax: is Aptiverse required to issue IT3(a) certificates or withhold, and are VAT-registered affiliates paid commission plus VAT? Needs an accountant (DECISIONS.md section F, item 50).
11. Decided (3b): `Submitted` payout details carry over as `in_review` and go through BE-AFF-47, the only enrolment gate.
12. Device fingerprints existed in the old app; dropped here for minimisation. Confirm fraud coverage is acceptable without them.
13. Decided (3c): first touch, capped at 12 months from the click time (claim time when there is no click); the click cookie stays 30 days and the 7-day claim window after sign-up stays.
14. Decided (3b): automatic enrolment; see the decision section.
