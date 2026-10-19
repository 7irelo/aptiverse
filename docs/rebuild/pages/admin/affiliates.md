# Affiliates admin

| | |
|---|---|
| ID | `PG-ADM-AFF` |
| Route | `/admin/affiliates` with tabs `?tab=overview` (default), `payout-details`, `flagged`, `payouts`, `ledger`; drawers `?affiliate=<id>`, `?batch=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific |
| Entitlement | none; permissions `affiliates.manage` (read, profiles, suspend and reinstate, terms, flagged referrals, adjustments and reversals) and `affiliates.payouts.manage` (payout-details review, generate, export, mark paid, cancel), from the permission catalogue (decision 9b) |
| Depends on | BE-ADM-12, BE-AFF-02, BE-AFF-06, BE-AFF-21, BE-AFF-22, BE-AFF-47, BE-AFF-80, BE-AFF-83, BE-AFF-07, BE-AFF-08, BE-AFF-09, BE-AFF-13, BE-AFF-16, PG-ADM-DASH-04 to 13, PG-ADM-IMP-06 (step-up for mark paid) |
| Old app reference | `43f9faa:web/src/app/(app)/admin/affiliates/page.tsx` ("Referral programme": summary cards, Payouts, Payout details to review, Flagged referrals, All affiliates tabs); API `43f9faa:api/Controllers/AffiliatesAdminController.cs` (summary, payout details review, suspend and reinstate, flagged clear and block, payout run generate, export, mark paid, cancel, payout entries, commission list and reverse) and `43f9faa:api/Modules/Affiliates` (`AffiliateProgramme.cs` terms, `AffiliateLedger.cs`, `Affiliate`, `Referral`, `ReferralFraudSignal`, `CommissionEntry`, `CommissionEntryEvent`, `AffiliatePayout`, `AffiliatePayoutItem`) |
| Status | Not started: 54 tasks, 2 deferred (PG-ADM-AFF-01, PG-ADM-AFF-09: no application queue, decision 3b) |
| Decisions | 3 (in v1), 3b (automatic enrolment; payout-details review is the only gate), 3c (old terms, attribution capped at 12 months), 54 (second admin above R2 000 once there are two admins), 56 (manual EFT bulk CSV) |

## Purpose

Answer "what do we owe affiliates" to the cent, and run the programme: review payout details (the only gate before an affiliate is paid, decision 3b), clear or block suspicious referrals, generate a payout batch from released commission, export it for the bank, mark it paid, and reverse a commission when needed. The ledger is append-only; every correction is a new row, and every action is audited.

## User stories

- As an admin, I see totals: owed now (released, unpaid), on hold, paid this tax year, and reversed this month.
- As an admin, I confirm payout details or send them back with notes, and suspend or reinstate an affiliate, with a reason.
- As an admin, I see when each referral was first attributed and when its 12-month window ends, so I can answer an affiliate's question about a missing commission.
- As an admin, I review referrals flagged by fraud signals (same payment fingerprint, self-referral, refund pattern) and clear or block them.
- As a payouts admin, I generate a payout batch for a cut-off date, review the items, export a bank CSV, and mark it paid once the bank run is done.
- As an admin, I reverse a commission entry with a reason, and see the reversal row in the ledger.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Affiliates", description "Payout details, referrals, commission and payouts. All amounts from the ledger."
2. Tab links (scroll inside the tab list): Overview, Payout details (count badge), Flagged (count badge), Payouts, Ledger.
3. Overview: four cards stacked: Owed now, On hold, Paid this tax year (1 March to end February), Reversed this month. Then "Next hold release: {date}, {amount}". Then link "Generate payout batch".
4. Payout details: cards with affiliate name, masked email, submitted date, review status (In review, Needs fixing), "Review" button opening the affiliate drawer at its payout details section.
5. Flagged: cards with referral id, affiliate name, referred account (masked), signals as badges ("Same card as affiliate", "Refund within 7 days"), commission at stake, "Clear" and "Block" buttons.
6. Payouts: "Generate payout batch" button, then batch cards: batch number, cut-off, items count, total, status (Draft, Exported, Paid, Cancelled).
7. Ledger: filters sheet (Affiliate, Entry type, Date range), entries as cards: type, amount (negative for reversals), affiliate, related payment reference, created.

### Desktop (1440px)

- Tabs under the h1.
- Overview: four `StatCard`s across, then a table "Top affiliates by owed amount" (10 rows).
- Payout details, Flagged, Payouts and Ledger as `DataTable`s with inline filter bars.
- Affiliate drawer (560px): profile, status, enrolled date and terms version, referral code, earnings summary, referrals with attributed and window-end dates, payout details present (yes or no, never the numbers), recent ledger entries, actions.
- Batch drawer (640px): summary, items table (affiliate, amount, payout details status), actions Export CSV, Mark paid, Cancel batch.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/affiliates/page.tsx` | server | Tab from search params; `PermissionGate affiliates.manage` |
| Loading and error | `web/src/app/(app)/admin/affiliates/loading.tsx`, `error.tsx` | server, client | |
| Drawer slot | `web/src/app/(app)/admin/affiliates/@drawer/page.tsx`, `default.tsx` | server | Affiliate or batch drawer |
| Tabs | `web/src/features/admin/affiliates/components/affiliate-tabs.tsx` | server | Links with count badges |
| Overview | `web/src/features/admin/affiliates/components/overview.tsx` | server | |
| Payout details queue | `web/src/features/admin/affiliates/components/payout-details-queue.tsx` | server | In review first, then needs fixing |
| Affiliate drawer body | `web/src/features/admin/affiliates/components/affiliate-drawer-body.tsx` | server | |
| Status actions | `web/src/features/admin/affiliates/components/actions/status-actions.tsx` | client | Suspend, Reinstate via `action-reason-dialog` |
| Flagged table | `web/src/features/admin/affiliates/components/flagged-table.tsx` | server | |
| Flag actions | `web/src/features/admin/affiliates/components/actions/flag-actions.tsx` | client | Clear, Block |
| Payouts table | `web/src/features/admin/affiliates/components/payout-batches-table.tsx` | server | |
| Generate batch dialog | `web/src/features/admin/affiliates/components/actions/generate-batch-dialog.tsx` | client | Cut-off date, dry-run preview, confirm |
| Batch drawer body | `web/src/features/admin/affiliates/components/batch-drawer-body.tsx` | server | |
| Batch actions | `web/src/features/admin/affiliates/components/actions/batch-actions.tsx` | client | Export CSV, Mark paid (step-up), Cancel |
| Ledger table | `web/src/features/admin/affiliates/components/ledger-table.tsx` | server | |
| Reverse dialog | `web/src/features/admin/affiliates/components/actions/reverse-commission-dialog.tsx` | client | From a ledger row |
| Loaders | `web/src/features/admin/affiliates/server/*.ts` | server | Overview cached 60s `cacheTag("admin-affiliates-overview")`, revalidated by tag after any mutation |
| Tax year helper | `web/src/features/admin/affiliates/lib/tax-year.ts` | shared | SA tax year 1 March to end February |

## Data

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/affiliates/overview` | BE-ADM-12 | GET | `owedCents`, `heldCents`, `paidTaxYearCents`, `reversedMonthCents`, `currency`, `nextRelease` { `date`, `amountCents` }, `topOwed[]` { `affiliateId`, `name`, `owedCents` }, `payoutDetailsAwaitingReview`, `openFlags`, `asOf` |
| `/admin/affiliates/payout-details?status=in_review&cursor=` | BE-ADM-12 (BE-AFF-41 review queue) | GET | `items[]` { `affiliateId`, `userId`, `name`, `emailMasked`, `submittedAt`, `reviewStatus` } |
| `/admin/affiliates/{id}` | BE-ADM-12 | GET | `id`, `userId`, `name`, `status` (`active`, `suspended`, `closed`), `enrolledAt`, `termsVersion`, `code`, `earnings` { `owedCents`, `heldCents`, `paidCents` }, `hasPayoutDetails`, `referrals[]` { `label`, `status`, `attributedAt`, `attributionExpiresAt`, `paymentsCommissioned` } (BE-AFF-83), `recentEntries[]`, `history[]` { `status`, `at`, `by`, `reason` }, `allowedActions[]` |
| `/admin/affiliates/flags?status=open&cursor=` | BE-ADM-12 (BE-AFF-06 signals) | GET | `items[]` { `flagId`, `referralId`, `affiliateId`, `affiliateName`, `referredUserMasked`, `signals[]`, `commissionAtStakeCents`, `createdAt` } |
| `/admin/affiliates/payout-batches?cursor=` | BE-ADM-12 (BE-AFF-13) | GET | `items[]` { `batchId`, `number`, `cutOff`, `itemCount`, `totalCents`, `status`, `createdBy`, `exportedAt`, `paidAt` } |
| `/admin/affiliates/payout-batches/{id}` | BE-ADM-12 | GET | Summary plus `items[]` { `affiliateId`, `name`, `amountCents`, `payoutDetailsStatus` (`ok`, `missing`, `unverified`) } |
| `/admin/affiliates/ledger?affiliateId=&type=&from=&to=&cursor=` | BE-ADM-12 (BE-AFF-07) | GET | `items[]` { `entryId`, `type` (`commission`, `hold_release`, `reversal`, `payout`, `adjustment`), `amountCents`, `affiliateId`, `affiliateName`, `paymentReference`, `reversesEntryId`, `createdAt`, `createdBy` } |

Mutations (BFF, `Idempotency-Key`, reason required)

| Action | Endpoint | BE ID | Request | Notes |
|---|---|---|---|---|
| Suspend, reinstate | `POST /admin/affiliates/{id}/status` | BE-AFF-21, BE-AFF-22 via BE-ADM-12 | `action`, `reason` | 409 on invalid transition |
| Clear or block flag | `POST /admin/affiliates/flags/{id}/resolve` | BE-ADM-12 | `resolution` (`clear`, `block`), `reason` | Block reverses the related commission (new reversal row) |
| Generate batch (dry run) | `POST /admin/affiliates/payout-batches?dryRun=true` | BE-ADM-12 | `cutOff` | Returns items and total, writes nothing |
| Generate batch | `POST /admin/affiliates/payout-batches` | BE-ADM-12 | `cutOff`, `reason` | 409 if a draft or exported batch is open |
| Export CSV | `POST /admin/affiliates/payout-batches/{id}/export` | BE-ADM-12 | `reason` | Returns presigned GET (60s); sets status Exported; audited |
| Mark paid | `POST /admin/affiliates/payout-batches/{id}/mark-paid` | BE-ADM-12 | `paidOn`, `bankReference`, `reason`, header `X-Step-Up-Token` | Writes payout ledger rows |
| Cancel batch | `POST /admin/affiliates/payout-batches/{id}/cancel` | BE-ADM-12 | `reason` | Only Draft or Exported |
| Reverse commission | `POST /admin/affiliates/ledger/{entryId}/reverse` | BE-ADM-12 | `reason`, `amountCents?` (partial, up to remaining) | 409 if already fully reversed or paid out (then an adjustment is needed) |
| Confirm payout details or send back | `POST /admin/affiliates/{id}/payout-details/review` | BE-ADM-12 (ported from old approve and reject) | `decision` (`confirm`, `needs_fixing`), `notes` (required for `needs_fixing`); sets `reviewStatus` to `confirmed` or `needs_fixing` | 400 on confirm when details are incomplete; needs fixing keeps earnings and only stops payment until details are fixed |
| Reveal payout details | `GET /admin/affiliates/{id}/payout-details` | needs new BE task | header `X-Step-Up-Token` | Returns legal name, ID type and number, tax reference, address, bank, account holder, account number, branch code, account type, contact email and phone; every reveal access-logged |
| Mark one payout line paid | `POST /admin/affiliates/payouts/{lineId}/mark-paid` | BE-ADM-12 (ported) | `paymentReference` (required: the reference typed into the banking app), `paidAt?`, `notes?` | 404 when not a draft line |
| Cancel one payout line | `POST /admin/affiliates/payouts/{lineId}/cancel` | BE-ADM-12 (ported) | `notes` | Entries return to payable |
| Payout line entries | `GET /admin/affiliates/payouts/{lineId}/entries` | BE-ADM-12 (ported) | none | The commission entries a payout settles, read before paying and years later |

## States

| State | When | Copy |
|---|---|---|
| Switched off | `ADMIN_AFFILIATES` off (kill switch; decision 3 puts the page in v1) | Page and nav entry absent; route 404 |
| Loading | Suspense | Card and row skeletons |
| Overview empty | No ledger rows | "No commission yet. Totals appear when a referred account pays." |
| Payout details empty | None waiting | "No payout details waiting for review." |
| Flagged empty | None open | "No flagged referrals. Fraud signals will show here." |
| Payouts empty | No batches | "No payout batches yet. Generate one when commission has been released." action "Generate payout batch" |
| Nothing to pay | Dry run total 0 | "Nothing has been released for payout up to {date}." |
| Missing payout details | Items with `missing` or `unverified` | Batch drawer warning: "{n} affiliates have no confirmed payout details. They are left out of this batch and stay owed." |
| Batch open | 409 on generate | "Batch {number} is still open. Mark it paid or cancel it first." |
| Export ready | Export ok | Browser download starts; toast "Exported. The file link works for 60 seconds. Audit ref {id}." |
| Mark paid ok | 200 | Toast "Batch {number} marked paid. {n} payout entries written." |
| Reverse refused | 409 paid out | "This commission was already paid out. Add an adjustment instead so the next payout is reduced." |
| Error | Load fails | "We could not load affiliates. Try again." |
| Forbidden | No `affiliates.manage` | "You do not have access to affiliates. Ask an admin who holds roles.manage to grant affiliates.manage." |
| Payout actions forbidden | No `affiliates.payouts.manage` | Payout buttons hidden; note "You can view payouts but not run them." |

## Stage variants

- Not stage-specific.

## Interactions and edge cases

- Totals must reconcile: Owed now equals the sum of released, unpaid commission minus reversals, from the ledger (BE-AFF-16 test). The UI never adds numbers itself.
- Holds: commission is held until the hold period passes (BE-AFF-09); held amounts never enter a batch.
- Refund after payout: BE-AFF-08 writes a reversal; if already paid, the reversal creates a negative balance carried into the next batch. Overview shows "Negative balances: {n} affiliates, {amount}" when present.
- Cut-off date is in SAST and cannot be in the future.
- Generate is two-step (dry run then confirm) so an admin sees the exact total before writing.
- CSV is generated server-side from encrypted payout details (BE-AFF-12) with the columns listed under "Carried over from the old app". List and drawer JSON never carry payout details; the only other way to see them is the step-up "Reveal details" call, which is access-logged.
- Mark paid requires the bank reference; it is idempotent per batch (second call returns the first result).
- Blocking a flagged referral also blocks future commission from that referred account; dialog says so.
- Suspended affiliate: commission stops accruing; owed amount still payable unless reversed.
- Attribution window (decision 3c): a referral earns only on payments made before its `attributionExpiresAt` (12 months from first touch). The drawer shows both dates per referral and "Window ended" after it, so "why did this renewal earn nothing" is answerable from the console. Migrated referrals show the old sign-up date as first touch (BE-AFF-84).
- Enrolment (decision 3b): there is no application queue. Every adult account that accepts the terms is an active affiliate; the payout-details review is where an admin first looks at a person.

### Carried over from the old app (43f9faa)

- Two separate states per affiliate, as in the old model: programme status (`active`, `suspended`) and payout details `reviewStatus` (`not_submitted`, `in_review`, `confirmed`, `needs_fixing`; the old `not_started`, `submitted`, `approved`, `rejected` map across in that order). The old app had no application gate: every account had a referral code minted on first read. The review that mattered was payout details, and the rebuild keeps that model (decision 3b). A "Payout details to review" tab (onboarding `submitted`, newest first) is added; resubmitting after a rejection puts the affiliate back in that queue.
- Payout details review: details are masked by default (account "ending 1234", ID "ending 089") with "Reveal details", which needs step-up and is access-logged. Confirm is refused when details are incomplete. Reject copy: "Earnings are kept. They will not be paid until the details are fixed."
- Summary figures from the old `GetSummary`: affiliates, active referrers, referrals, paying referrals, awaiting review, flagged, Pending (parked by a flag), On hold ("Inside the 30-day window"), Ready to pay, Blocked on details (payable but payout details not confirmed), Paid to date, and draft payouts (count and total).
- Commission statuses in the ledger: Pending, Held, Payable, Paid, Reversed, with each entry's status history (`CommissionEntryEvent`: from, to, reason, actor, time).
- Programme terms panel (read-only, from the API): 40 percent of each payment received excluding VAT, for the first 3 monthly payments or 1 annual payment, counted from the first paid payment; 30-day hold; a referral can be claimed within 7 days of account creation; attribution lasts 12 months from first touch (decision 3c; the old app's lifetime attribution is not carried over); minimum payout R100.00. Changing terms is a new terms version (BE-AFF-72), not a console action.
- Flagged referrals list shows both flagged and blocked, the flag reason, each fraud signal with severity, detail and time, and the commission parked against it. Clear: "Cleared. The 30-day hold restarts from the original payment date, not today." Block: reverses every accrual for that referral's payments with the review note as the reason ("Blocked and reversed.").
- Payout runs: generating first releases any holds that matured but were not yet released by the scheduled job. Inputs are period end and a minimum payout (defaults to the terms minimum, R100.00 under decision 3c; "Balances below this roll to next month"). A run creates one draft payout line per affiliate with a run reference and a suggested bank reference `APTV{code}-{id}`. Each line is marked paid individually with the reference actually used in the banking app; the run shows Paid when every line is paid or cancelled. "Nothing to pay this run." when nothing qualifies.
- Export CSV columns (generated server-side): payout id, run, affiliate code, payee name, bank, account holder, account number, branch code, account type, amount, entries, period start, period end, suggested reference, status, payment reference, paid at.
- Manual reversal reverses everything accrued from one source payment reference (for a refund that came back through a channel the webhook did not cover). Reason required: "A correction with no stated reason is worth very little later."
- Automatic clawback: Paystack `refund.processed`, `charge.dispute.create` and `charge.dispute.resolve` reverse the commission; if it was already paid out it becomes a negative balance against the next payout.
- All affiliates tab: search by referral code; each row shows payable, on hold, pending, paid and referral count.


## Copy

- h1 "Affiliates"; description "Payout details, referrals, commission and payouts. All amounts from the ledger."
- Tabs "Overview", "Payout details", "Flagged", "Payouts", "Ledger"
- Referral dates in the drawer: "First touch {date}", "Counts until {date}", "Window ended {date}"
- Cards "Owed now", "On hold", "Paid this tax year", "Reversed this month"
- Signal badges "Same card as affiliate", "Same device", "Self-referral", "Refund within 7 days", "Many signups, one IP"
- Generate dialog: title "Generate payout batch", field "Pay commission released up to", preview "{n} affiliates, {total}", confirm "Create batch"
- Mark paid dialog: title "Mark batch {number} paid", fields "Paid on", "Bank reference", "Reason", "Confirm it is you", confirm "Mark paid"
- Reverse dialog: title "Reverse commission", body "A reversal row of {amount} is added. The original entry stays.", confirm "Reverse"

## Acceptance criteria

- Given ledger rows, when Overview loads, then Owed now equals `owedCents` from the API and the sum of the next batch dry run (for today's cut-off) equals Owed now minus affiliates with missing payout details.
- Given an active affiliate, when an admin suspends with a reason, then the status becomes Suspended and the history shows the admin and reason.
- Given a referral attributed 13 months ago, when the affiliate drawer opens, then the referral shows "Window ended" with its end date and no new accruals after that date.
- Given an open flag, when an admin blocks it, then the flag closes and a reversal row appears in the ledger for the related commission.
- Given released commission, when an admin generates a batch for today, then a dry run shows first, and confirm creates a Draft batch with the same total.
- Given a Draft batch, when exported, then the status becomes Exported and the download link expires after 60 seconds.
- Given an Exported batch, when marked paid with a bank reference and step-up, then payout rows appear in the ledger and Owed now decreases by the batch total.
- Given a paid-out commission, when an admin tries to reverse it, then the 409 copy explains to add an adjustment.
- Given `ADMIN_AFFILIATES` is off, when `/admin/affiliates` is requested, then it returns 404 and the nav has no entry.
- Given an affiliate with incomplete payout details, when an admin confirms them, then the API refuses and the dialog explains what is missing.
- Given a run with three lines, when two are marked paid with references and one is cancelled, then the run shows Paid and the cancelled line's entries are payable again.
- Given a flagged referral with parked commission from a payment 20 days ago, when cleared, then the entries move to Held with a hold ending 10 days from today.
- Given balances of R30 and R80 and a minimum of R50, when a run is generated, then only the R80 affiliate gets a line and the R30 stays payable.

## Production readiness

Security
- `affiliates.manage` and `affiliates.payouts.manage` enforced server-side per endpoint; payout-details review and reveal need `affiliates.payouts.manage`. Mark paid needs step-up.
- Payout details never in list or drawer JSON; shown only through the step-up reveal (access-logged) and the server-built CSV (presigned link 60s, export audited with actor and row count).
- All actions audited including failures; ledger is append-only (no edit or delete endpoints exist).

Performance
- Ledger and lists keyset-paginated; ledger index on `(affiliate_id, created_at)`.
- Overview from a ledger balance projection (BE-AFF-07), cached 60s, invalidated by tag after mutations.

Resilience
- Generate, export, mark paid and cancel idempotent per key and per batch state; double-click guard.
- Only one open batch at a time (server rule) prevents double payment.

Observability
- Audit events `admin.affiliate.status`, `admin.affiliate.payout_details.review`, `admin.affiliate.flag.resolve`, `admin.payout.generate`, `.export`, `.mark_paid`, `.cancel`, `admin.commission.reverse`.
- Metric `affiliate_owed_cents` gauge from the overview projection.

Accessibility (WCAG 2.2 AA)
- Negative amounts read as "minus R50", not just a minus sign.
- Signal badges are text.

Privacy and POPIA
- Referred accounts masked; affiliate payout details encrypted at rest (BE-AFF-12), exported only in the CSV; CSV not stored in the browser beyond the download.
- Tax records retained per HRD-35.

Rollout
- Entire page behind the `ADMIN_AFFILIATES` switch (decision 3: on in v1; off is the kill switch). Payout writes additionally behind `ADMIN_WRITE_ACTIONS`. No payout run in cutover week (plan risk table).

Monitoring
- Alert if ledger sum check (BE-AFF-16 nightly assertion) fails.
- Alert if a batch stays Exported for more than 7 days without Mark paid.
- Runbook HRD-06 linked from the Payouts tab.

Tasks
- [ ] **PG-ADM-AFF-24** `ADMIN_AFFILIATES` switch gating for route and nav (kill switch)
- [ ] **PG-ADM-AFF-25** Negative balance line on Overview and adjustment guidance copy
- [ ] **PG-ADM-AFF-26** Grafana gauge for owed amount; alerts for ledger check failure and stale exported batch
- [ ] **PG-ADM-AFF-27** Link HRD-06 runbook from Payouts tab; check export audit includes row count

## Build tasks

- [ ] **PG-ADM-AFF-01** Applications queue (umbrella; delivered by 09 to 11) *(deferred: decision 3b, no application step in v1; the review queue is PG-ADM-AFF-28)*
- [ ] **PG-ADM-AFF-02** Flagged referrals (clear or block) (umbrella; delivered by 12 and 13)
- [ ] **PG-ADM-AFF-03** Payout batch generate, export CSV, mark paid (umbrella; delivered by 14 to 19)
- [ ] **PG-ADM-AFF-04** Commission reversal (umbrella; delivered by 20 to 22)
- [ ] **PG-ADM-AFF-05** Add Affiliates to the admin nav (Operations section, icon `gift`, permission `affiliates.manage`, behind `ADMIN_AFFILIATES`)
- [ ] **PG-ADM-AFF-06** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-AFF-07** Route files, tabs with counts, drawer slot
- [ ] **PG-ADM-AFF-08** Overview cards, top owed table, next release line
- [ ] **PG-ADM-AFF-09** Applications table and loader *(deferred: decision 3b, no application step in v1)*
- [ ] **PG-ADM-AFF-10** Affiliate drawer body (profile, enrolled date and terms version, earnings, history, payout details present flag)
- [ ] **PG-ADM-AFF-11** Status actions (suspend, reinstate) with 409 handling
- [ ] **PG-ADM-AFF-12** Flagged table with signal badges
- [ ] **PG-ADM-AFF-13** Clear and Block dialogs
- [ ] **PG-ADM-AFF-14** Payout batches table
- [ ] **PG-ADM-AFF-15** Generate batch dialog with dry run preview and missing details warning
- [ ] **PG-ADM-AFF-16** Batch drawer body with items
- [ ] **PG-ADM-AFF-17** Export CSV action with presigned download
- [ ] **PG-ADM-AFF-18** Mark paid dialog with bank reference and step-up
- [ ] **PG-ADM-AFF-19** Cancel batch dialog
- [ ] **PG-ADM-AFF-20** Ledger table with filters and reversal links
- [ ] **PG-ADM-AFF-21** Reverse commission dialog (full and partial)
- [ ] **PG-ADM-AFF-22** Paid-out reversal refusal copy
- [ ] **PG-ADM-AFF-23** `tax-year.ts` helper with tests (1 March boundary)
- [ ] **PG-ADM-AFF-28** "Payout details" review tab, the only enrolment gate (decision 3b): confirm (refused when incomplete) and send back with notes (earnings kept), count badge from `payoutDetailsAwaitingReview`
- [ ] **PG-ADM-AFF-29** Masked payout details with step-up "Reveal details", access-logged
- [ ] **PG-ADM-AFF-30** Summary extra figures: pending, blocked on details, paying referrals, active referrers, draft payouts
- [ ] **PG-ADM-AFF-31** Programme terms panel (read-only)
- [ ] **PG-ADM-AFF-32** Flagged list includes blocked, flag reason, signal severity, detail and time, parked amount; clear and block copy
- [ ] **PG-ADM-AFF-33** Generate dialog: minimum payout (default R50, rolls over) and matured hold release note
- [ ] **PG-ADM-AFF-34** Per-line payouts: suggested reference with copy button, mark paid with payment reference and date, cancel line, run status rollup
- [ ] **PG-ADM-AFF-35** Payout line entries drill-down
- [ ] **PG-ADM-AFF-36** All affiliates tab with code search and per-affiliate balances
- [ ] **PG-ADM-AFF-37** Ledger entry status history from commission entry events
- [ ] **PG-ADM-AFF-39** Referral attribution dates in the affiliate drawer (decision 3c): first touch, counts-until and "Window ended" from BE-AFF-83; terms panel line for the 12-month window; unit test for a referral one day either side of its end date
- [ ] **PG-ADM-AFF-38** Request BE-ADM-12 changes: payout details review and reveal, per-line mark paid and cancel, entries, summary fields, terms read (coordinator)

## Quality tasks

- [ ] **PG-ADM-AFF-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-AFF-Q02** Server loader in `src/features/admin/affiliates/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-AFF-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (never optimistic for money)
- [ ] **PG-ADM-AFF-Q04** Empty state with one clear next action
- [ ] **PG-ADM-AFF-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-AFF-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-AFF-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-AFF-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-AFF-Q09** Layout at 1440px
- [ ] **PG-ADM-AFF-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-AFF-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-AFF-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-AFF-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-AFF-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-AFF-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/affiliates/lib/tax-year.test.ts`: "28 Feb belongs to previous tax year", "1 March starts new tax year", "leap year 29 Feb"
- `features/admin/affiliates/components/payout-details-review.test.tsx`: "details masked until reveal", "reveal requires step-up", "confirm blocked when incomplete"
- `features/admin/affiliates/components/actions/generate-batch-dialog.test.tsx`: "requires dry run before confirm", "blocks future cut-off", "shows missing details warning"
- `features/admin/affiliates/components/ledger-table.test.tsx`: "reversal reads as minus amount", "links reversal to original entry"

Playwright (`web/tests/e2e/admin/affiliates.spec.ts`)
- "overview owed matches dry run total"
- "payout details review confirm and needs fixing"
- "per-line mark paid uses typed bank reference"
- "clear flagged referral restarts hold from payment date"
- "minimum payout rolls small balances over"
- "suspend affiliate records history"
- "expired referral shows window ended in the drawer"
- "block flagged referral writes reversal"
- "generate export and mark paid batch reduces owed"
- "second open batch is refused"
- "reverse paid out commission shows adjustment guidance"
- "affiliates route 404 when the switch is off"
- "affiliates page has no axe violations in light and dark"

## Open questions

- Decided (3): the programme is in v1.
- "Add adjustment" is referenced for paid-out reversals; BE-AFF-79 now defines the adjustment entry type. Confirm BE-ADM-12 exposes the command.
- Decided (56): manual EFT from the bank's bulk CSV. The bank (FNB, Standard Bank, Absa, Nedbank, Capitec Business) is owed in DECISIONS.md section F, item 56; the default layout ships until then.
- Decided (54): a second admin must approve Mark paid for batches above R2 000 once there are two admins; until then one admin with step-up.
- Decided (3b): no application step; payout-details review is the only gate.
- Batch-level mark paid (original spec) versus per-line mark paid (old app): this file now supports per-line with a run rollup. Confirm with the BE-ADM-12 owner.
