# Payments

| | |
|---|---|
| ID | `PG-AFF-PAY` |
| Route | `/refer/payments` |
| Phase | 6 |
| Roles | student, parent with an affiliate profile (automatic enrolment, decision 3b) |
| Stages | any (no academic content) |
| Entitlement | free; affiliate profile required (BE-AFF-02) |
| Depends on | BE-AFF-13, BE-AFF-14, BE-AFF-10 (balances for the summary line), FE-63, PG-AFF-EARN-04 (area layout and tabs), PG-BIL-CHECKOUT-04 (`formatZar`), PG-CMN-NOTIF-03 (date formatter) |
| Old app reference | `43f9faa:web/src/app/(app)/refer/payments/page.tsx`, `43f9faa:web/src/app/(app)/refer/_shared.tsx` (`PayoutsTab`), `43f9faa:api/Controllers/AffiliatesController.cs` (`GET me/payouts`), `43f9faa:api/Modules/Affiliates/Aptiverse.Affiliates.Domain/Models/AffiliatePayout.cs`, `AffiliatePayoutItem.cs` |
| Status | Not started (0 of 40 tasks) |

## Purpose

A clear history of every payout made to the affiliate: when, how much to the cent, to which account (masked), its status, and which commissions it covered. It answers "did you pay me, and for what?" without a support ticket.

Payout lifecycle shown (BE-AFF-13): `scheduled` (in a batch, not sent), `processing` (sent to the bank), `paid` (marked paid by admin with a bank reference), `failed` (bank returned it; amount goes back to ready to pay), `cancelled` (batch cancelled before sending; amount back to ready to pay).

How the old app (43f9faa) worked, which this page must stay true to: nothing in the system moved money. An admin generated a payout run (grouped by `runReference`, for example "the October list"), paid each line by EFT from the business banking app, then marked the line paid with the bank reference they typed. Statuses were `draft` (shown to the affiliate as "Being prepared"), `paid` and `cancelled` (entries released back to ready to pay). Each payout carried `periodStart`, `periodEnd`, `entryCount`, `totalZar`, `paymentReference`, `paidAt` and optional `notes`, plus a snapshot of the bank details used. A run skipped balances below a minimum (they rolled forward untouched), and a negative carried balance from a late refund reduced the next payout. The `processing` and `failed` states above are new in the rebuild and only apply if BE-AFF-13 adds a bank-return step; until then an admin cancelling a payout is how a bounced transfer shows (open question).

## User stories

- As an affiliate, I want a list of my payouts with dates and amounts, so that I can match them to my bank statement.
- As an affiliate, I want to see which referrals each payout covered, so that I can check it adds up.
- As an affiliate whose payout failed, I want to know why in plain words and what to do, so that I get paid next time.

## Layout

### Mobile (360px)

1. Area header and tabs from the `/refer` layout ("Payments" current).
2. Summary line card: "Paid to date R2 345.60" and "Next payout run 25 Oct 2026" (from earnings).
3. Failed payout banner when the latest payout failed: see States.
4. Payout list as cards: date paid or scheduled, amount (`R1 234.50`, `tabular-nums`), status badge, "To account ending 1234", and a "View details" button.
5. Details open in a `DetailDrawer` (bottom sheet on mobile): payout reference, bank reference (when paid), period covered, line items (referral date, plan, commission, reversals as negative lines), total that equals the payout amount.
6. "Show more" paging.

### Desktop (1440px)

Area layout, then summary as two `StatCard`s side by side, then a `DataTable` with columns Date, Amount, Status, Account, Reference, Details. The drawer opens from the right at 480px wide.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/refer/payments/page.tsx` | server | Inside the `/refer` layout |
| Loading, error | `web/src/app/(app)/refer/payments/{loading,error}.tsx` | server / client | Skeleton list; `PageState` with retry |
| Not found | `web/src/app/(app)/refer/payments/not-found.tsx` | server | Payout id in `?payout=` not found or not owned |
| Payout list | `web/src/features/affiliates/components/payouts-table.tsx` | client | `DataTable` with mobile cards and cursor paging |
| Payout drawer | `web/src/features/affiliates/components/payout-detail-drawer.tsx` | client | `DetailDrawer`; selected payout id kept in `?payout=` so it is linkable and survives refresh |
| Status badge | `web/src/features/affiliates/lib/payout-status.ts` | shared | Label and token per status |
| Failed banner | `web/src/features/affiliates/components/payout-failed-banner.tsx` | server | Links to Get paid |
| Loader | `web/src/features/affiliates/server/get-payouts.ts` | server | Per user, React `cache()` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/affiliates/me/payouts` (BE-AFF-14) | GET | `items[]` (`id`, `runReference`, `status` (draft shown as scheduled, processing, paid, failed, cancelled), `amountCents`, `currency`, `entryCount`, `notes`, `scheduledAt`, `paidAt`, `accountLast4` (from the payout's bank snapshot), `payoutReference`, `bankReference`, `failureReason` (account_closed, invalid_account, name_mismatch, bank_rejected, other), `periodStart`, `periodEnd`), `nextCursor` | per user; TanStack infinite query |
| `/affiliates/me/payouts/{id}` (proposed, part of BE-AFF-14) | GET | header fields plus `lines[]` (`commissionEntryId`, `referralSignedUpAt`, `planCode`, `kind` (commission, reversal), `amountCents`) | per user |
| `/affiliates/me/earnings` (BE-AFF-10) | GET | `paidCents`, `nextPayoutRunAt` | per user |

### Mutations

None. Payouts are created and marked paid by admin (PG-ADM affiliate pages, BE-ADM-12).

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Streaming | Skeleton summary and four row skeletons | none |
| Empty | No payouts | Title "No payouts yet". Body "Once your ready-to-pay balance reaches R100.00 and your bank details are saved, it is paid in the next payout run." | Button "Check your bank details" to `/refer/payout-details` |
| Populated | Payouts exist | As in Layout | "View details" |
| Scheduled | `scheduled` or `draft` | Badge "Being prepared", "Planned for 25 Oct 2026" (date omitted when unknown) | none |
| Paid with note | `paid` and `notes` present | Under the bank reference: "Note from Aptiverse: {notes}" | none |
| Rolled forward | ready to pay below the run minimum | Summary hint: "Your ready-to-pay balance of R48.20 is below R100.00, so it rolls forward to the next run." | none |
| Netted refund | payout line includes a carried negative balance | Drawer line "Earlier refund taken off: -R51.60" | none |
| Processing | `processing` | Badge "On its way", "Sent to your bank on 25 Oct 2026. It can take up to 3 working days to show." | none |
| Paid | `paid` | Badge "Paid", "Paid on 27 Oct 2026, bank reference APV-000123" | none |
| Failed | `failed` | Badge "Not paid". Banner: "Your payout of R1 234.50 on 25 Oct 2026 could not be paid into the account ending 1234. The money is back in your ready-to-pay balance." plus reason line: account_closed "The bank says this account is closed.", invalid_account "The account number or branch code looks wrong.", name_mismatch "The account holder name does not match.", bank_rejected or other "The bank returned the payment." | Button "Update bank details" |
| Cancelled | `cancelled` | Badge "Cancelled", "This payout was cancelled before it was sent. The money is back in your ready-to-pay balance." | none |
| Drawer not found | `?payout=` unknown or another user's | Drawer closes; toast "That payout could not be found." | none |
| Not an affiliate | no affiliate profile (`404 affiliates.not_affiliate`) | Redirect to `/refer` (join view) | none |
| Error | Loader fails | `PageState` title "We could not load your payouts", body "Your money is not affected. Check your connection and try again." | "Try again" |
| Forbidden | Admin | `PageForbidden` | Link home |

## Stage variants

None. Identical for all accounts; no academic wording.

## Interactions and edge cases

- Drawer line items always sum to the payout amount; reversal lines show as negative ("-R49.00, refund on 12 Oct 2026"). If the API's lines do not sum to the header (should never happen), the drawer shows "These lines do not add up. We have been notified." and reports to Sentry.
- A payout made to an older bank account shows that account's last four digits, not the current one.
- Failed payout retry happens in the next run automatically once details are valid; the page never offers a "retry now" button.
- Times in Africa/Johannesburg.
- Long lists: cursor paging, 20 per page; deep-linked `?payout=` loads that payout even if it is not on the first page.

## Copy

- Summary: "Paid to date", "Next payout run"
- Statuses: "Being prepared", "On its way", "Paid", "Not paid", "Cancelled"
- Row meta: "{n} entries", "Reference APV-000123" (old app wording: "{n} entries, Reference ...")
- "To account ending 1234", "View details", "Payout reference", "Bank reference", "Period covered", "Commission", "Refund reversal", "Total"
- Empty and failed copy as in States

## Acceptance criteria

- AC-01 Given payouts exist, when the page loads, then each row shows date, amount to the cent, status and masked account exactly as `GET /affiliates/me/payouts` returns.
- AC-02 Given "View details", when pressed, then the drawer opens, the URL gains `?payout=<id>`, and the lines sum exactly to the payout amount.
- AC-03 Given a failed latest payout, when the page loads, then the banner states the amount is back in ready to pay, gives the reason line, and links to Get paid.
- AC-04 Given no payouts, when the page loads, then the empty state shows the minimum payout from API config.
- AC-05 Given `?payout=` with another user's id, when loaded, then no data shows and the not found toast appears.
- AC-06 Given a refresh with the drawer open, when the page reloads, then the same drawer reopens.
- AC-07 Given a `draft` payout, when listed, then the badge reads "Being prepared" and the row shows its entry count.
- AC-08 Given a payout made before a bank change, when listed, then it shows the old account's last four digits from its snapshot.
- AC-09 Given a ready-to-pay balance below the run minimum, when the page loads, then the rolled-forward hint shows the balance and the minimum from API config.
- AC-10 Given a payout that netted off an earlier refund, when its drawer opens, then the negative line shows and the lines still sum to the payout amount.

## Production readiness

### Security
- [ ] Reads scoped to the session user; payout id in `?payout=` is an opaque Guid v7 and the API returns 404 for non-owners. (PG-AFF-PAY-Q16)
- [ ] Only the last four digits of any bank account are ever sent to the browser. (PG-AFF-PAY-Q16)

### Privacy and POPIA
- [ ] Line items show referral date and plan only, never the referred person's identity. (PG-AFF-PAY-06)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip; drawer code loaded on first open. (PG-AFF-PAY-Q17)

### Resilience
- [ ] Line sum mismatch is detected client-side, shown calmly and reported. (PG-AFF-PAY-07)

### Observability
- [ ] Events: `affiliate_payments_viewed`, `affiliate_payout_detail_opened` (status), `affiliate_payout_failed_banner_clicked`. Sentry tags `{ page: "PG-AFF-PAY" }`. (PG-AFF-PAY-Q18)

### Accessibility
- [ ] WCAG 2.2 AA: drawer is a dialog with focus trap and return; negative amounts read as "minus R49.00" via `aria-label`; status not colour alone. (PG-AFF-PAY-Q19)

### Rollout
- [ ] Behind `flags.affiliates` with the rest of `/refer`. (PG-AFF-PAY-Q20)

### Monitoring and alerts
- [ ] Alert when payouts endpoint 5xx exceeds 1% over 15 minutes and when any line-sum mismatch is reported to Sentry (should be zero). (PG-AFF-PAY-Q21)

## Build tasks

- [ ] **PG-AFF-PAY-01** Payout history
- [ ] **PG-AFF-PAY-02** Route files and `get-payouts` loader inside the `/refer` layout
- [ ] **PG-AFF-PAY-03** Payouts table with mobile cards, status badges and cursor paging
- [ ] **PG-AFF-PAY-04** Summary cards (paid to date, next payout run)
- [ ] **PG-AFF-PAY-05** Payout detail drawer with `?payout=` deep link
- [ ] **PG-AFF-PAY-06** Drawer line items with reversal lines and total
- [ ] **PG-AFF-PAY-07** Line-sum check with calm message and Sentry report
- [ ] **PG-AFF-PAY-08** Failed payout banner with reason copy and link to Get paid
- [ ] **PG-AFF-PAY-09** Status copy for scheduled, processing, paid, cancelled
- [ ] **PG-AFF-PAY-10** Redirect accounts without an affiliate profile to `/refer`
- [ ] **PG-AFF-PAY-11** Desktop table layout and right-side drawer
- [ ] **PG-AFF-PAY-12** Map old `draft` status to "Being prepared"; show `entryCount` and `runReference` per row
- [ ] **PG-AFF-PAY-13** Show payout `notes` under the bank reference when present
- [ ] **PG-AFF-PAY-14** Rolled-forward hint when ready to pay is below the run minimum
- [ ] **PG-AFF-PAY-15** Drawer line for a netted negative carried balance ("Earlier refund taken off")
- [ ] **PG-AFF-PAY-16** Account digits from the payout's bank snapshot, not the current details

## Quality tasks

- [ ] **PG-AFF-PAY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` for an unknown payout id
- [ ] **PG-AFF-PAY-Q02** Server loader in `src/features/affiliates/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-AFF-PAY-Q03** No mutations; drawer detail read through `/api/bff` with the generated hook
- [ ] **PG-AFF-PAY-Q04** Empty state with one clear next action
- [ ] **PG-AFF-PAY-Q05** Error state copy: what went wrong, money not affected, how to fix it
- [ ] **PG-AFF-PAY-Q06** Forbidden state for admin
- [ ] **PG-AFF-PAY-Q07** Stage-aware wording checked (no academic wording)
- [ ] **PG-AFF-PAY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); table collapses to cards
- [ ] **PG-AFF-PAY-Q09** Layout at 1440px
- [ ] **PG-AFF-PAY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AFF-PAY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AFF-PAY-Q12** axe: zero violations in light and dark, drawer open
- [ ] **PG-AFF-PAY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AFF-PAY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-AFF-PAY-Q15** `generateMetadata` title "Payments"; area tab active state correct
- [ ] **PG-AFF-PAY-Q16** Security review: ownership 404 on payout ids, last four digits only
- [ ] **PG-AFF-PAY-Q17** Performance: Lighthouse CI mobile budget, lazy drawer
- [ ] **PG-AFF-PAY-Q18** Observability: events and Sentry tags wired
- [ ] **PG-AFF-PAY-Q19** WCAG 2.2 AA pass
- [ ] **PG-AFF-PAY-Q20** Rollout: covered by `flags.affiliates`
- [ ] **PG-AFF-PAY-Q21** Monitoring: endpoint error and line mismatch alerts
- [ ] **PG-AFF-PAY-Q22** Cents test: drawer totals for 1, 99, 100 and mixed reversal lines match the header exactly
- [ ] **PG-AFF-PAY-Q23** Reconciliation check in staging: sum of paid payouts equals `paidCents` from earnings (links to BE-AFF-16)
- [ ] **PG-AFF-PAY-Q24** Migration parity: payout history for 20 migrated affiliates matches 43f9faa `GET api/affiliates/me/payouts` (amounts, references, dates, entry counts) to the cent

## Tests

### Unit (Vitest)
- `payout-status.test.ts`: label and copy per status and failure reason.
- `payout-detail-drawer.test.tsx`: lines sum to total; mismatch message; negative line aria label.

### Playwright (`web/tests/e2e/affiliates/payments.spec.ts`)
- payout history shows amounts to the cent
- detail drawer deep link survives refresh
- failed payout banner links to bank details
- empty state shows minimum payout
- another users payout id shows not found
- draft payout reads being prepared with entry count
- payout before bank change shows snapshot digits
- balance below minimum shows rolled forward hint
- axe clean light and dark at 360 and 1440

## Open questions

- `GET /affiliates/me/payouts/{id}` with line items is specified in `../../backend/affiliates.md`.
- Do failed payouts retry automatically in the next run, or does an admin requeue them?
- Should affiliates get a downloadable remittance advice per payout, or is the tax statement enough?
- Decided (56): payouts stay manual EFT from the bank's bulk CSV. The rebuild adds a per-item `failed` outcome when an admin marks a batch paid (BE-AFF-39), which returns that amount to available; there is no automatic bank-return step.
