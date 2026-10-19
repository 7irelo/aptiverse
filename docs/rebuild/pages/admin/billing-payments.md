# Payments and Paystack cockpit

| | |
|---|---|
| ID | `PG-ADM-PAY` |
| Route | `/admin/billing (Payments tab)`: `/admin/billing/payments` (Transactions, Settlements, Customer lookup views), `/admin/billing/invoices` (Invoices tab), `/admin/billing/reconciliation` (Reconciliation tab); payment drawer at `?payment=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific |
| Entitlement | none; permissions `billing.admin` (read), `billing.refund` (refunds, proposed), `billing.reconcile` (resolve drift, proposed) |
| Depends on | BE-ADM-05 (`GET /admin/payments`), BE-ADM-06 (status, balance, transactions, settlements, customer lookup), BE-ADM-07 (refunds, audited including failures), BE-BIL-06 (Paystack client with resilience), BE-BIL-11 and 12 (webhook inbox), BE-BIL-18 and 21 (invoices), BE-BIL-22 (reconciliation), BE-BIL-23 (`RefundIssued`), BE-AFF-08 (commission reversal), PG-ADM-SUBS-04 (billing layout and tabs), PG-ADM-IMP-06 (step-up field), PG-ADM-DASH-04 to 13; needs new BE tasks for admin invoices and reconciliation reads (see Data) |
| Old app reference | Paystack cockpit: `43f9faa:web/src/app/(app)/admin/paystack/page.tsx` (not-connected state, balance per currency, transactions with status filter and full refund, settlements with bank, customer lookup) and `43f9faa:api/Controllers/AdminPaystackController.cs` (status, balance, transactions, settlements, customer, refund by reference audited including rejections, subscription enable or disable). Invoices and local payments: `f223ca7:web/src/app/(app)/admin/payments/page.tsx` and `f223ca7:web/src/app/(app)/admin/invoices/page.tsx` (mock data; both were removed at 43f9faa because they fabricated charges) |
| Status | Not started |

## Purpose

The Paystack cockpit. One place where an admin sees whether Paystack is up and webhooks are flowing, what balance is waiting to settle, every transaction and settlement, any customer's Paystack record, and can issue a full or partial refund safely. Invoices and nightly reconciliation drift live in sibling tabs. Every action, success or failure, is audited. When Paystack is down, the cockpit says so plainly and falls back to what Aptiverse recorded, with refunds paused.

## User stories

- As an admin, I see at a glance whether Paystack is reachable, when the last webhook arrived, and whether any webhooks failed in the last 24 hours.
- As an admin, I see the available and pending balance so I know what will settle.
- As an admin, I search transactions by reference, email or amount and date, and see whether each is matched to an Aptiverse payment.
- As an admin, I open a settlement and see the transactions and fees in it.
- As an admin, I look up a Paystack customer by email or customer code and jump to their Aptiverse user.
- As a billing admin, I refund all or part of a payment with a reason, after confirming it is me, and see the refund's progress until Paystack confirms.
- As a billing admin, I see refunds that failed or are stuck, and what to do.
- As an admin, I download or resend an invoice.
- As an admin, I see last night's reconciliation drift and mark items resolved with a note.

## Layout

### Mobile (360px)

Payments tab (`/admin/billing/payments`):
1. Billing h1 and tab bar (from PG-ADM-SUBS-04), Payments current.
2. Paystack status strip, full width card: status dot plus text "Paystack is up" or "Paystack is not responding", "Last webhook 2 min ago", "Failed webhooks (24h): 0", mode badge "Live" or "Test".
3. Balance card: "Available R12 340", "Pending settlement R3 210", "Checked 14:05".
4. View switcher as three links in a segmented row: Transactions, Settlements, Customer lookup.
5. Transactions view: search "Reference, email or amount", Filters sheet (Status, Channel, Date from and to, Matched). Cards: amount (title), status badge, customer masked email, date, reference (monospace, truncated with copy button), "Not in Aptiverse" badge when unmatched.
6. Settlements view: cards with settled date, net amount, fees, transaction count, status.
7. Customer lookup view: one input "Email or customer code (CUS_...)" and "Look up" button; result card with customer code, linked Aptiverse user link, subscriptions, last 10 transactions, saved cards as "Visa ending 4242, expires 08/27".
8. Payment drawer (full screen): Summary, Refunds timeline, Paystack details, Actions footer with "Refund".

Invoices tab (`/admin/billing/invoices`): search "Invoice number or email", filter by status (Paid, Unpaid, Void) and month; cards with invoice number, customer, total incl. VAT, status, "Download PDF" and "Resend" in a row menu.

Reconciliation tab (`/admin/billing/reconciliation`): last run card ("Ran 02:00 today. 3 open items."), "Run again" button, list of drift items as cards: type badge, reference, Aptiverse value vs Paystack value, age, "Resolve" button.

### Desktop (1440px)

- Payments tab: top row has status strip (8 columns) and balance card (4 columns). Below, view switcher as Tabs-styled links, then the filter bar inline and a `DataTable`.
- Transactions columns: Date, Reference, Customer, Amount, Fees, Status, Channel, Matched, Refunded.
- Settlements columns: Settled on, Gross, Fees, Net, Transactions, Status. Row click opens a drawer listing its transactions.
- Customer lookup: input on the left (4 columns), result on the right (8 columns) with sub-tables.
- Payment drawer 600px on the right.
- Invoices columns: Number, Customer, Issued, Subtotal, VAT, Total, Status, actions.
- Reconciliation: run summary card plus a table: Type, Reference, Aptiverse, Paystack, Difference, Detected, Status, actions.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Payments page | `web/src/app/(app)/admin/billing/payments/page.tsx` | server | Status, balance and view in separate Suspense boundaries |
| Payments loading and error | `web/src/app/(app)/admin/billing/payments/loading.tsx`, `error.tsx` | server, client | |
| Status strip | `web/src/features/admin/billing/payments/components/paystack-status-strip.tsx` | server | Never throws: renders "Unknown" if status call fails |
| Balance card | `web/src/features/admin/billing/payments/components/balance-card.tsx` | server | Per-currency rows |
| View switcher | `web/src/features/admin/billing/payments/components/payments-view-links.tsx` | server | `?view=transactions` (default), `settlements`, `customer` |
| Transactions table | `web/src/features/admin/billing/payments/components/transactions-table.tsx` | server | Live Paystack list, with fallback to local payments |
| Transaction filters | `web/src/features/admin/billing/payments/components/transaction-filters.tsx` | client | `admin-filter-bar` |
| Settlements table | `web/src/features/admin/billing/payments/components/settlements-table.tsx` | server | |
| Settlement drawer | `web/src/features/admin/billing/payments/components/settlement-drawer-body.tsx` | server | `?settlement=<id>` |
| Customer lookup form | `web/src/features/admin/billing/payments/components/customer-lookup-form.tsx` | client | Submits by navigating to `?view=customer&q=...` so the result is server-rendered |
| Customer result | `web/src/features/admin/billing/payments/components/customer-result.tsx` | server | |
| Payment drawer body | `web/src/features/admin/billing/payments/components/payment-drawer-body.tsx` | server | `?payment=<id>` |
| Refund timeline | `web/src/features/admin/billing/payments/components/refund-timeline.tsx` | server | Each refund with status steps and follow-ups |
| Refund dialog | `web/src/features/admin/billing/payments/components/refund-dialog.tsx` | client | Full or partial amount, reason, customer note, step-up, idempotency |
| Refund status poller | `web/src/features/admin/billing/payments/components/refund-status-poller.tsx` | client | Polls `GET /admin/payments/{id}` every 5s for up to 2 minutes while a refund is pending |
| Copy reference button | `web/src/features/admin/billing/shared/copy-button.tsx` | client | Copies Paystack reference |
| Invoices page | `web/src/app/(app)/admin/billing/invoices/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Invoices table | `web/src/features/admin/billing/invoices/components/invoices-table.tsx` | server | |
| Invoice actions | `web/src/features/admin/billing/invoices/components/invoice-row-actions.tsx` | client | Download PDF (presigned link via BFF), Resend |
| Reconciliation page | `web/src/app/(app)/admin/billing/reconciliation/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Run summary | `web/src/features/admin/billing/reconciliation/components/run-summary.tsx` | server | |
| Drift table | `web/src/features/admin/billing/reconciliation/components/drift-table.tsx` | server | |
| Resolve dialog | `web/src/features/admin/billing/reconciliation/components/resolve-drift-dialog.tsx` | client | Resolution type plus note |
| Run again button | `web/src/features/admin/billing/reconciliation/components/run-again-button.tsx` | client | Disabled while a run is in progress |
| Loaders | `web/src/features/admin/billing/payments/server/*.ts`, `invoices/server/*.ts`, `reconciliation/server/*.ts` | server | Status cached 30s (`admin-paystack-status`), balance 60s (`admin-paystack-balance`); lists uncached |
| Refund amount rules | `web/src/features/admin/billing/payments/lib/refundable.ts` | shared | Remaining refundable = amount minus processed minus pending refunds; display only, server is authority |

## Data

Reads

| Endpoint | BE ID | Method | Fields used | Cache |
|---|---|---|---|---|
| `/admin/paystack/status` | BE-ADM-06 | GET | `reachable`, `latencyMs`, `checkedAt`, `mode` (`live`, `test`), `webhooks` { `lastReceivedAt`, `failedLast24h`, `inboxBacklog` } | `admin-paystack-status`, 30s |
| `/admin/paystack/balance` | BE-ADM-06 | GET | `configured` (false when no Paystack key is set in this environment), `balances[]` { `currency`, `availableCents`, `pendingCents` }, `fetchedAt` | `admin-paystack-balance`, 60s |
| `/admin/paystack/transactions?q=&status=&channel=&from=&to=&matched=&page=&perPage=` | BE-ADM-06 | GET | `items[]` { `paystackId`, `reference`, `customerEmailMasked`, `amountCents`, `feesCents`, `currency`, `status` (`success`, `failed`, `abandoned`, `reversed`), `channel`, `paidAt`, `aptiversePaymentId` or null, `refundedCents` }, `page`, `pageCount`, `source` (`paystack`) | none |
| `/admin/payments?q=&status=&from=&to=&cursor=` | BE-ADM-05 | GET | Same shape from Aptiverse records, `source` (`aptiverse`), used as fallback when Paystack is down | none |
| `/admin/payments/{id}` | BE-ADM-05 | GET | `id`, `reference`, `user` { `id`, `displayName` }, `subscriptionId`, `amountCents`, `currency`, `status`, `paidAt`, `refundableCents`, `refunds[]` { `id`, `amountCents`, `status` (`pending`, `processing`, `processed`, `failed`, `unknown`), `requestedAt`, `requestedBy`, `reason`, `paystackRefundId`, `failureReason`, `followUps` { `entitlement` (`done`, `pending`, `failed`, `not_needed`), `commissionReversal` (same values), `receiptEmail` (same values) } }, `paystack` { `transactionId`, `gatewayResponse`, `authorizationMasked` } | none |
| `/admin/paystack/settlements?from=&to=&page=` | BE-ADM-06 | GET | `items[]` { `id`, `settledAt`, `grossCents`, `feesCents`, `netCents`, `transactionCount`, `status`, `bankName`, `accountLast4` } | none |
| `/admin/paystack/settlements/{id}/transactions` | BE-ADM-06 | GET | Transaction rows as above | none |
| `/admin/paystack/customers?q=` | BE-ADM-06 | GET | `customerCode`, `emailMasked`, `aptiverseUserId` or null, `subscriptions[]` { `code`, `status`, `planName` }, `transactions[]` (last 10), `authorizations[]` { `brand`, `last4`, `expMonth`, `expYear`, `reusable` } | none |
| `/admin/invoices?q=&status=&month=&cursor=` | needs new BE task (Billing admin read) | GET | `items[]` { `id`, `number`, `customerName`, `issuedAt`, `subtotalCents`, `vatCents`, `totalCents`, `status` } | none |
| `/admin/invoices/{id}/pdf` | needs new BE task (reuse BE-BIL-18 renderer) | GET | Presigned URL, 60s | none |
| `/admin/billing/reconciliation/runs/latest` | needs new BE task (read side of BE-BIL-22) | GET | `runId`, `startedAt`, `finishedAt`, `status` (`running`, `succeeded`, `failed`), `checkedCount`, `openItems` | none |
| `/admin/billing/reconciliation/items?status=open&cursor=` | needs new BE task | GET | `items[]` { `id`, `type` (`missing_in_aptiverse`, `missing_in_paystack`, `amount_mismatch`, `status_mismatch`, `refund_mismatch`), `reference`, `aptiverseValue`, `paystackValue`, `differenceCents`, `detectedAt`, `status`, `resolvedBy`, `resolution`, `note` } | none |

Mutations (all through `/api/bff`, `Idempotency-Key` header, reason required)

| Action | Endpoint | BE ID | Request | Response | Failures |
|---|---|---|---|---|---|
| Refund | `POST /admin/payments/{id}/refunds` | BE-ADM-07 | `amountCents` (1 to `refundableCents`), `reason` (10 to 500), `customerNote?` (max 200, shown on receipt), header `X-Step-Up-Token` | `refundId`, `status`, `auditEventId` | 401 step-up, 403, 409 refund already in progress for this payment, 422 amount over refundable, 503 `paystack_unavailable` (nothing sent), 504 `paystack_timeout` (outcome unknown) |
| Refund by Paystack reference | `POST /admin/paystack/refunds` | BE-ADM-07 (ported from old `POST /api/admin/paystack/refund`) | `reference`, `amountCents?` (null means full), `reason`, header `X-Step-Up-Token` | same as above | For transactions Paystack has but Aptiverse does not ("Not in Aptiverse"); 422 with Paystack's message when Paystack rejects; only `success` transactions are refundable |
| Resend invoice | `POST /admin/invoices/{id}/resend` | needs new BE task | `reason` | `auditEventId`, `sentTo` (masked) | 404, 429 |
| Resolve drift item | `POST /admin/billing/reconciliation/items/{id}/resolve` | needs new BE task | `resolution` (`fixed_in_aptiverse`, `fixed_in_paystack`, `expected`, `wont_fix`), `note` (10 to 500) | `auditEventId` | 409 already resolved |
| Run reconciliation now | `POST /admin/billing/reconciliation/runs` | needs new BE task (trigger for BE-BIL-22) | `reason` | `runId` | 409 a run is in progress, 429 more than 1 per 10 minutes |

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Status strip skeleton, balance skeleton, 8 row skeletons |
| Paystack up | `reachable` true | "Paystack is up. Last webhook {relative}." |
| Webhooks failing | `failedLast24h` greater than 0 | Strip in attention zone: "{n} webhooks failed in the last 24 hours. Check System health for the inbox backlog." |
| Webhooks quiet | No webhook in 6 hours during business hours | "No webhooks for 6 hours. If payments are happening, Paystack may not be reaching us." |
| Paystack down | `reachable` false or status call fails | `upstream-banner`: "Paystack is not responding. Showing payments recorded by Aptiverse up to {time}. Balance, settlements and customer lookup are unavailable, and refunds are paused." Transactions view switches to `/admin/payments` data with a "From Aptiverse records" badge |
| Status unknown | Status call itself errors | Strip: "Paystack status unknown. We could not check just now." |
| Not connected | `configured` false | Whole tab shows an info notice instead of failing panels: "Paystack is not connected in this environment. Ask engineering to set the Paystack secret key." |
| Refund rejected | 422 from Paystack | Inline in the dialog: "Paystack rejected the refund: {message}. Nothing was returned." The attempt is still in the audit log |
| Settlements in test mode | Empty and `mode` test | "No settlements yet. In test mode Paystack does not settle, so this stays empty until you are live." |
| Test mode | `mode` test | Badge "Test mode" and banner "These are Paystack test transactions. No real money moves." |
| No transactions | Empty with no filters | "No transactions yet. Payments show here after the first Paystack checkout." |
| No matches | Empty with filters | "No transactions match these filters." action "Clear filters" |
| Customer not found | Lookup 404 | "No Paystack customer with that email or code. Check the spelling, or search Users instead." |
| Unmatched transaction | `aptiversePaymentId` null | Badge "Not in Aptiverse" with tooltip "Paystack has this payment but Aptiverse does not. Reconciliation will flag it." |
| Refund dialog idle | Opened | Title "Refund {amount}"; "Refundable now: {refundable}". Amount defaults to full refundable |
| Refund amount invalid | Over refundable | "You can refund at most {refundable} on this payment." |
| Refund pending | Status `pending` or `processing` | Timeline step "Sent to Paystack {time}. Waiting for Paystack to confirm." Poller running |
| Refund processed | Status `processed`, all follow-ups done | "Refunded {amount} on {date}. Receipt emailed. Affiliate commission reversed." |
| Refund processed, follow-up pending | Processed, a follow-up `pending` | "Refunded {amount}. Still finishing: {follow-up list}. This updates automatically." |
| Refund processed, follow-up failed | A follow-up `failed` | Attention: "Refunded {amount}, but {follow-up} failed. The money has gone back to the customer. Reconciliation will flag this; you can also check the Audit log for ref {id}." |
| Refund failed | Status `failed` | Error zone: "Paystack refused this refund on {date}: {failureReason}. Nothing was returned to the customer." action "Try refund again" |
| Refund outcome unknown | 504 or status `unknown` | Attention: "We did not hear back from Paystack. Do not refund again. We are checking with Paystack and will update this payment." Refund button disabled until resolved |
| Refunds paused | Paystack down or `ADMIN_REFUNDS` off | Refund button disabled; tooltip "Refunds are paused while Paystack is not responding." or "Refunds are paused by an administrator." |
| Invoices empty | None | "No invoices yet." |
| Invoice PDF failed | 5xx on PDF | Toast "We could not prepare that PDF. Try again." |
| Reconciliation clean | `openItems` 0 | "No drift. Last night's check matched every Paystack transaction." |
| Reconciliation running | `status` running | "Checking Paystack now. Started {time}." Run again disabled |
| Reconciliation failed | `status` failed | "Last night's check did not finish. Run it again, or see System health." |
| Reconciliation never ran | 404 latest run | "Reconciliation has not run yet. It runs every night at 02:00." |
| Error | Any list fails | "We could not load {transactions}. Try again." |
| Forbidden | No `billing.admin` | "You do not have access to billing. Ask another admin to grant billing.admin." |
| Refund forbidden | No `billing.refund` | Refund button hidden; footer "You can view payments but not refund them." |

## Stage variants

- Not stage-specific. Customer and user names link to the users drawer, which applies stage labels.

## Interactions and edge cases

- Partial refunds: multiple partial refunds allowed until `refundableCents` is 0. Pending refunds count against the refundable amount so two admins cannot over-refund. The API serialises refunds per payment (409 while one is in progress).
- Refund idempotency: one `Idempotency-Key` per dialog open. A retry after a network error reuses the key. "Try refund again" after a definite failure opens a fresh dialog with a new key.
- Timeout (504): outcome unknown. The API keeps the refund row in `unknown` and a scheduled job queries Paystack by the refund reference; the UI never offers a second refund until that settles.
- Refund on a payment of a cancelled subscription: allowed; dialog notes "This subscription is already cancelled. Refunding does not change access."
- Refund on an active subscription: dialog asks "Also cancel the subscription?" as an unchecked checkbox that, if checked, calls the cancel action from `billing-subscriptions.md` after the refund succeeds (two audited actions, never one hidden one).
- Full refund of an affiliate-attributed payment: dialog shows "This reverses {amount} commission for affiliate {name}." from the payment detail (BE-AFF-08 does the reversal).
- Customer lookup input accepts an email or `CUS_` code; anything else shows "Enter an email address or a code starting with CUS_." without calling the API.
- Paystack pagination is page-based, not cursor-based; the transactions view uses page numbers when `source` is `paystack` and cursor when it falls back to Aptiverse records.
- Dates for filters are SAST in the UI and sent as UTC instants.
- Currency: Paystack can hold USD for some merchants; every amount carries its currency and is never summed across currencies.
- Reconciliation "Run again" is limited to once per 10 minutes; the button shows "Next run allowed at {time}" on 429.

### Carried over from the old app (43f9faa)

- The cockpit reads `configured` first, so an environment without a Paystack key shows one "not connected" notice rather than a page of failed requests.
- Balance is shown per currency, each with available and pending ("R3 210 pending" only when pending is above 0).
- Transactions show a Method column: card brand and last 4 ("Visa ending 4242") or the channel ("EFT") when there is no card. The Refund button shows only when the server marks the row `refundable` (status success) and the admin holds `billing.refund`.
- Refund by reference: the old cockpit refunded straight from a Paystack transaction row. Kept for unmatched transactions; matched ones use the payment drawer flow.
- Paystack rejections are audited as a rejected refund at warning severity (old `Paystack.RefundRejected`), and Paystack's own message is shown.
- Settlements list the receiving bank and account last 4 ("FNB ending 1234"), described as "What Paystack paid into the bank".
- Customer lookup result shows the customer's name (or email, or code when no name), email and code, then up to 8 recent transactions with status.
- A Refresh button on the transactions view (throttled to once per 10 seconds) re-reads Paystack without a full reload.
- Old permission names `payments.read` and `payments.refund` map to `billing.admin` and `billing.refund`.


## Copy

- Status: "Paystack is up", "Paystack is not responding", "Paystack status unknown", "Last webhook {relative}", "Failed webhooks (24h): {n}"
- Balance: "Available", "Pending settlement", "Checked {time}"
- View links: "Transactions", "Settlements", "Customer lookup"
- Refund dialog: title "Refund {amount}", fields "Amount to refund", "Reason (saved in the audit log)", "Note for the customer (optional, shown on their receipt)", "Confirm it is you", confirm "Refund {amount}"
- Refund toast: "Refund sent to Paystack. Audit ref {short id}."
- Resolve dialog: title "Resolve drift item", options "Fixed in Aptiverse", "Fixed in Paystack", "Expected difference", "Will not fix", note label "What did you check?"
- Invoice actions: "Download PDF", "Resend invoice"

## Acceptance criteria

- Given Paystack is reachable, when the Payments tab loads, then the status strip, balance and transactions all show data from BE-ADM-06 and each block loads independently.
- Given the status endpoint reports `reachable: false`, when the tab loads, then the outage banner shows, the transactions list shows Aptiverse records with the "From Aptiverse records" badge, and every Refund button is disabled with the paused tooltip.
- Given a R299 payment with no refunds, when a billing admin refunds R100 with a reason and step-up, then exactly one `POST /admin/payments/{id}/refunds` is sent with `amountCents: 10000` and an `Idempotency-Key`, the timeline shows "Waiting for Paystack to confirm", and the refundable amount drops to R199.
- Given a pending refund, when the webhook marks it processed, then within 10 seconds the poller shows "Refunded R100" and follow-up statuses.
- Given the refund request times out, when the dialog closes, then the payment shows "outcome unknown" copy and the Refund button stays disabled.
- Given a refund processed with commission reversal `failed`, when the drawer renders, then the follow-up failed copy shows with the audit ref.
- Given an amount over refundable, when submitted, then the client blocks it and, if forced, the API returns 422 with the same copy.
- Given an admin with only `billing.admin`, when they open a payment, then no Refund button is rendered.
- Given no Paystack key in the environment, when the Payments tab loads, then only the not connected notice shows and no Paystack request fails visibly.
- Given an unmatched successful Paystack transaction, when a billing admin refunds it by reference, then `POST /admin/paystack/refunds` is sent once and a Paystack rejection shows Paystack's message.
- Given a failed or abandoned transaction, when its row renders, then no Refund button is shown.
- Given open drift items, when an admin resolves one with a note, then it moves out of the open list and the audit log has the resolution.
- Given a 360px viewport, when the customer lookup result shows saved cards, then nothing overflows horizontally.

## Production readiness

Security
- `billing.admin` on all reads; `billing.refund` on refunds; `billing.reconcile` on resolve and run. Enforced in the API.
- Refunds require step-up (within 5 minutes) and a reason; the API validates amount against refundable server-side.
- Paystack secret key never leaves the API. The browser only sees references, masked emails and masked card data (brand, last 4, expiry).
- BFF-only mutations with `Origin` check; refund endpoint in its own rate limit partition (5 per minute per admin).
- Every refund attempt is audited: request, Paystack response, follow-ups, failures and unknown outcomes.

Performance
- Status and balance cached (30s, 60s) so the page does not hammer Paystack; BE-ADM-06 also caches upstream with HybridCache.
- Transactions page size 50 from Paystack (their max is 100); budget p95 under 1.5s for live Paystack lists, under 400ms for local lists.
- Customer lookup only runs on submit, never on keystroke.

Resilience
- Polly pipeline on the Paystack client (BE-BIL-06): 5s timeout, 2 retries on GET only, circuit breaker. Refund POST is never auto-retried by the client pipeline; idempotency is via our key and Paystack's reference.
- Circuit open means status "not responding", local fallback, refunds paused.
- Unknown outcomes resolved by a scheduled status check, not by a human retry.
- Double-click protection in `admin-action` plus server 409 per payment.

Observability
- Audit events `admin.refund.request`, `admin.refund.result`, `admin.refund.followup`, `admin.invoice.resend`, `admin.reconciliation.resolve`, `admin.reconciliation.run`, each with trace id and outcome.
- Metrics: `paystack_request_duration`, `paystack_circuit_state`, `admin_refund_total{outcome}`, `refund_unknown_open`.
- Sentry tag `upstream:paystack` on upstream failures.

Accessibility (WCAG 2.2 AA)
- Status uses text plus icon, not colour alone. Status changes are not announced on load; banner is static text.
- Refund timeline is an ordered list with step status text.
- Poller updates announce only the final result via a polite live region.

Privacy and POPIA
- Masked emails in lists; customer lookup result is access-logged like the users drawer (needs confirming in BE-ADM-06).
- No CSV export of transactions in v1. If added later, it requires `audit.export` and is audited.

Rollout
- Read views under `ADMIN_CONSOLE`; refunds under `ADMIN_REFUNDS` (separate kill switch); resolve and run under `ADMIN_WRITE_ACTIONS`. First week in prod: refunds limited to admins with `billing.refund`, which is granted to one person.
- Rollback: switch off; refunds already sent keep processing server-side.

Monitoring
- Alert: Paystack circuit open for over 5 minutes; failed webhooks over 5 in 1 hour; any refund in `unknown` for over 30 minutes; reconciliation run failed; open drift items over 10.
- Dashboard "Paystack cockpit health": latency, error rate, webhook lag, refunds by outcome. Runbook link to HRD-04.

Tasks
- [ ] **PG-ADM-PAY-30** Paystack outage fallback to local payments with banner and paused refunds
- [ ] **PG-ADM-PAY-31** Refund outcome unknown handling (disabled refund, copy, poll stop rules)
- [ ] **PG-ADM-PAY-32** Refund follow-up failed and pending states in the timeline
- [ ] **PG-ADM-PAY-33** `ADMIN_REFUNDS` kill switch states
- [ ] **PG-ADM-PAY-34** Test mode badge and banner
- [ ] **PG-ADM-PAY-35** Grafana dashboard and alerts for Paystack health, unknown refunds and reconciliation; link HRD-04
- [ ] **PG-ADM-PAY-36** Request new BE tasks: admin invoices list, PDF and resend; reconciliation runs, items, resolve and trigger; customer lookup access log (coordinator)

## Build tasks

- [ ] **PG-ADM-PAY-01** Status and balance (umbrella; delivered by 08 to 10)
- [ ] **PG-ADM-PAY-02** Transactions and settlements (umbrella; delivered by 11 to 15)
- [ ] **PG-ADM-PAY-03** Customer lookup (umbrella; delivered by 16 and 17)
- [ ] **PG-ADM-PAY-04** Refund flow with confirm (umbrella; delivered by 18 to 23)
- [ ] **PG-ADM-PAY-05** Invoices tab (replaces `/admin/invoices`) (umbrella; delivered by 24 to 26)
- [ ] **PG-ADM-PAY-06** Reconciliation drift report (umbrella; delivered by 27 to 29)
- [ ] **PG-ADM-PAY-07** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-PAY-08** Payments route files with three Suspense boundaries
- [ ] **PG-ADM-PAY-09** `paystack-status-strip.tsx` and status loader (30s cache), all status variants
- [ ] **PG-ADM-PAY-10** `balance-card.tsx` and balance loader (60s cache), per-currency rows
- [ ] **PG-ADM-PAY-11** `payments-view-links.tsx` and `?view=` parsing
- [ ] **PG-ADM-PAY-12** `transactions-table.tsx` and filters, page-based pagination for Paystack source
- [ ] **PG-ADM-PAY-13** Matched and "Not in Aptiverse" badges; copy reference button
- [ ] **PG-ADM-PAY-14** `settlements-table.tsx` and loader
- [ ] **PG-ADM-PAY-15** Settlement drawer with its transactions
- [ ] **PG-ADM-PAY-16** `customer-lookup-form.tsx` with input validation (email or `CUS_`)
- [ ] **PG-ADM-PAY-17** `customer-result.tsx` (subscriptions, transactions, masked cards, Aptiverse user link) and not-found state
- [ ] **PG-ADM-PAY-18** Payment drawer slot and `payment-drawer-body.tsx` summary and Paystack sections
- [ ] **PG-ADM-PAY-19** `refund-timeline.tsx` with statuses and follow-ups
- [ ] **PG-ADM-PAY-20** `refundable.ts` rules with unit tests
- [ ] **PG-ADM-PAY-21** `refund-dialog.tsx` form (amount, reason, customer note) with step-up field
- [ ] **PG-ADM-PAY-22** Refund submission through `admin-action`, error mapping (401, 403, 409, 422, 503, 504)
- [ ] **PG-ADM-PAY-23** `refund-status-poller.tsx` and affiliate and cancel-subscription notes in the dialog
- [ ] **PG-ADM-PAY-24** Invoices route files, loader and `invoices-table.tsx`
- [ ] **PG-ADM-PAY-25** Download PDF via presigned link
- [ ] **PG-ADM-PAY-26** Resend invoice dialog
- [ ] **PG-ADM-PAY-27** Reconciliation route files, `run-summary.tsx` with all run states
- [ ] **PG-ADM-PAY-28** `drift-table.tsx` and `resolve-drift-dialog.tsx`
- [ ] **PG-ADM-PAY-29** `run-again-button.tsx` with 409 and 429 handling
- [ ] **PG-ADM-PAY-37** Not connected state driven by `configured`
- [ ] **PG-ADM-PAY-38** Per-currency pending balance in `balance-card.tsx`
- [ ] **PG-ADM-PAY-39** Settlement bank and account last 4 column, and test mode empty copy
- [ ] **PG-ADM-PAY-40** Method column and server `refundable` flag driving the Refund button
- [ ] **PG-ADM-PAY-41** Refund by Paystack reference for unmatched transactions (dialog variant, same step-up and idempotency)
- [ ] **PG-ADM-PAY-42** Refund rejected state with Paystack's message; check the rejected attempt is audited at warning severity
- [ ] **PG-ADM-PAY-43** Customer name, email and code header and 8 recent transactions in `customer-result.tsx`
- [ ] **PG-ADM-PAY-44** Throttled Refresh button on the transactions view

## Quality tasks

- [ ] **PG-ADM-PAY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id (payment and settlement drawers have not-found states)
- [ ] **PG-ADM-PAY-Q02** Server loader in `src/features/admin/billing/{payments,invoices,reconciliation}/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-PAY-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (never optimistic for refunds)
- [ ] **PG-ADM-PAY-Q04** Empty state with one clear next action
- [ ] **PG-ADM-PAY-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-PAY-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-PAY-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-PAY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-PAY-Q09** Layout at 1440px
- [ ] **PG-ADM-PAY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-PAY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-PAY-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-PAY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-PAY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-PAY-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-ADM-PAY-Q16** Money review: every amount uses `formatMoney` with its currency; no cross-currency sums

## Tests

Unit (Vitest)
- `features/admin/billing/payments/lib/refundable.test.ts`: "full refundable when no refunds", "pending refunds reduce refundable", "failed refunds do not reduce refundable", "never negative"
- `features/admin/billing/payments/components/transactions-table.test.tsx`: "method shows card or channel", "refund button only when refundable and permitted"
- `features/admin/billing/payments/components/refund-dialog.test.tsx`: "defaults to full refundable", "blocks amount over refundable", "keeps idempotency key on retry", "new key after definite failure"
- `features/admin/billing/payments/components/refund-timeline.test.tsx`: "unknown outcome shows do not refund again copy", "follow-up failed shows audit ref"
- `features/admin/billing/payments/components/paystack-status-strip.test.tsx`: "down state", "unknown state", "webhooks failing state", "test mode badge"

Playwright (`web/tests/e2e/admin/billing-payments.spec.ts`, Paystack mocked at the API boundary)
- "payments tab shows status balance and transactions"
- "paystack outage falls back to aptiverse records and pauses refunds"
- "partial refund updates refundable and timeline"
- "refund timeout shows unknown outcome and disables refund"
- "not connected environment shows notice only"
- "refund unmatched transaction by reference"
- "paystack rejection message shown and audited"
- "refund follow-up failure is visible"
- "double click refund sends one request"
- "customer lookup by email links to user drawer"
- "settlement drawer lists its transactions"
- "invoice pdf download and resend"
- "resolve drift item with note"
- "read-only billing admin cannot refund"
- "payments tab has no axe violations in light and dark at 360 and 1440"

## Open questions

- Decided (54): refunds above R2 000 need a second admin's approval once there are two admins. Until then step-up plus the single holder of `billing.refund` applies; the two-person rule ships behind a setting so it can be switched on without a deploy (needs a BE task for the pending-approval state).
- Does Paystack's settlement API expose fees per transaction for our account type? If not, the Fees column shows "Not provided by Paystack".
- Decided (50): prices are shown VAT-inclusive. Whether invoices are VAT invoices waits on the accountant's confirmation of VAT registration (DECISIONS F); until then the VAT column and "incl. VAT" copy stay behind a setting, off.
- The original single-file backlog lists `/admin/payments`; this file keeps `/admin/billing/payments` as a tab of Billing. The old route should redirect.
