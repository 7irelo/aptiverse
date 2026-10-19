# Billing management

| | |
|---|---|
| ID | `PG-BIL-MANAGE` |
| Route | `/dashboard/billing` (student), `/parent/billing` (parent) |
| Phase | 6 (parent seat parts land with Phase 8) |
| Roles | student, parent |
| Stages | high school, university (student); any (parent, mixed-stage families) |
| Entitlement | free (the page manages entitlements; never gated by one) |
| Depends on | BE-BIL-08, BE-BIL-13 to BE-BIL-19, BE-BIL-20, BE-BIL-21, BE-FAM-06 (children for seats), BE-IDN-28, FE-25, FE-63, UI-07 (ResponsiveDialog), UI-25 (ConfirmDialog), UI-26 (DataTable), PG-BIL-CHECKOUT-04 (`formatZar`), PG-CMN-NOTIF-03 (date formatter) (`web/src/lib/format/date.ts`), proposed permission `billing.manage` |
| Old app reference | `43f9faa:web/src/components/billing/BillingManager.tsx` (summary, payment history, plan change dialog with allowance comparison and over-use warning, undo scheduled change, cancel, managed-by-other read-only card), `43f9faa:web/src/app/(app)/dashboard/billing/page.tsx` (student, with usage), `43f9faa:web/src/app/(app)/parent/billing/page.tsx` (family), `43f9faa:api/Controllers/PaymentsController.cs` (`subscription`, `subscription/change`, `subscription/cancel-change`, `subscription/cancel`, `transactions`, refund and dispute webhook handling) |
| Status | Not started (0 of 69 tasks) |

## Purpose

One calm page where a student or parent sees what they pay, when it renews and what they use, and can change plan, update how they pay, download invoices, manage which children a parent plan covers, and cancel without being talked out of it. Every money figure comes from the API in cents and is shown as `R1 234`; the page computes nothing that affects a charge.

Subscription rules the page reflects (state machine BE-BIL-13): `trialing`, `active`, `past_due`, `cancelled`, plus a scheduled downgrade (`pendingPlanCode`, `pendingEffectiveAt`). Upgrades apply immediately with a prorated charge. Downgrades and seat reductions apply at the end of the period. Cancel is retention-free and takes effect at the end of the paid period.

## User stories

- As a student, I want to see my plan, the next charge and the date, so that I can budget.
- As a student, I want to see how much of my practice tests and AI sessions I have used this period, so that I can pace myself.
- As a student on Student Pro, I want to upgrade and see exactly what I pay today for the rest of this period, so that the charge makes sense.
- As a parent of three, I want to drop to two children at the end of the month and choose which child keeps the paid features, so that I control who is covered.
- As anyone, I want to update my card through Paystack, so that my card details never sit on Aptiverse.
- As anyone, I want to cancel in two taps with no guilt trip, and keep access until the date I paid for.
- As someone whose payment failed, I want a calm message and a quick way to fix it, so that I do not lose access by surprise.
- As anyone, I want to download invoices with VAT shown, so that I can claim or keep records.

## Layout

### Mobile (360px)

Single column, `px-4`, blocks top to bottom:

1. `PageHeader`: title "Billing", description "Your plan, payments and invoices." Test mode `Badge` in non-prod.
2. Status banner (only when relevant): past due, scheduled downgrade, cancelling. One banner at a time, priority past due > cancelling > scheduled downgrade. No trial banner in v1 (decision 51).
3. Current plan card: plan name, status `Badge` (Active, Trial, Payment due, Cancelling, Free), price per interval, "Renews on 19 Nov 2026" or "Ends on 19 Nov 2026", children covered (parent). Buttons: "Change plan" (primary), "Cancel plan" (ghost, bottom of card).
4. Usage card: one `Progress` meter per metered feature ("Practice tests 7 of 20", "Deep AI sessions 2 of 10"), with "Resets on 19 Nov 2026". Unlimited features read "Unlimited". Free plan with no meters: hidden.
5. Parent only: Children covered card. Rows per linked child: name, stage label, "Covered" or "Not covered" badge, overflow menu ("Remove from plan" or "Add to plan"). Footer: "2 of 3 places used" and "Add a place" button.
6. Payment method card: brand and last four digits as Paystack returns them ("Visa ending 4081"), expiry "Expires 08/27", button "Update payment method". If no card on file: "No card saved" and the button reads "Add a payment method".
7. Invoices card: list of rows (date, description, amount, status badge Paid, Failed, Refunded) with a download icon button per row ("Download invoice for 19 Oct 2026"). "Show more" loads the next page. Collapses to stacked cards at 360px via `DataTable` mobile fallback.
8. Footer help line: "Questions about a charge? Contact support" linking to `/help`.

Change plan opens a `ResponsiveDialog` (bottom sheet on mobile, dialog on desktop) with plan options and a confirm step. Cancel opens a `ConfirmDialog`.

### Desktop (1440px)

`PageShell` `max-w-5xl`, grid `lg:grid-cols-3`: current plan card spans two columns with usage below it; right column stacks payment method and (parent) children covered. Invoices span all three columns as a real table (`DataTable`) with columns Date, Description, Amount, VAT, Status, Download. Banner spans the full width above the grid.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Student route | `web/src/app/(app)/dashboard/billing/page.tsx` | server | Renders `BillingView` with `role="student"` |
| Parent route | `web/src/app/(app)/parent/billing/page.tsx` | server | Renders `BillingView` with `role="parent"` |
| Loading, error, not-found | `web/src/app/(app)/{dashboard,parent}/billing/{loading,error,not-found}.tsx` | server / client | Shared implementations re-exported from `web/src/features/billing/components/billing-route-states.tsx` |
| Billing view | `web/src/features/billing/components/billing-view.tsx` | server | Suspense boundaries per card so a slow invoice list does not block the plan card |
| Status banner | `web/src/features/billing/components/subscription-banner.tsx` | server | Picks one banner by priority |
| Current plan card | `web/src/features/billing/components/current-plan-card.tsx` | server | Status badge mapping in `features/billing/lib/subscription-status.ts` |
| Usage meters | `web/src/features/billing/components/usage-meters.tsx` | server | `Progress` with text values; never colour alone |
| Change plan dialog | `web/src/features/billing/components/change-plan-dialog.tsx` | client | Plan list, proration preview, confirm |
| Proration preview | `web/src/features/billing/components/proration-preview.tsx` | client | Shows `chargeTodayCents`, `creditCents`, `newRecurringCents`, effective date from the preview endpoint |
| Cancel downgrade button | `web/src/features/billing/components/cancel-scheduled-change.tsx` | client | In the scheduled downgrade banner |
| Seats card | `web/src/features/billing/components/seats-card.tsx` | server | Parent only |
| Seat actions | `web/src/features/billing/components/seat-actions.tsx` | client | Add place, remove place, choose child to uncover |
| Payment method card | `web/src/features/billing/components/payment-method-card.tsx` | server | Brand, last four, expiry from API |
| Update payment method button | `web/src/features/billing/components/update-payment-method-button.tsx` | client | Calls the mutation, then `window.location.assign(url)` to Paystack's hosted card update page |
| Invoices table | `web/src/features/billing/components/invoices-table.tsx` | client | `DataTable` with cursor paging; PDF download link per row |
| Cancel dialog | `web/src/features/billing/components/cancel-plan-dialog.tsx` | client | `ConfirmDialog` destructive variant, retention-free |
| Loaders | `web/src/features/billing/server/get-subscription.ts`, `get-invoices.ts`, `get-plans.ts` | server | Subscription and invoices per user (React `cache()` only); plans cached with tag `billing:plans` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/billing/subscription` (BE-BIL-14) | GET | `status`, `planCode`, `planName`, `interval`, `amountCents`, `currency`, `currentPeriodStart`, `currentPeriodEnd`, `trialEndsAt`, `cancelAtPeriodEnd`, `pendingPlanCode`, `pendingEffectiveAt`, `pastDueSince`, `nextRetryAt`, `paymentMethod` (`brand`, `last4`, `expMonth`, `expYear`) , `usage[]` (`featureKey`, `label`, `used`, `limit` or null for unlimited, `resetsAt`), `seats` (`purchased`, `assigned[]` of `studentId`) | per user, React `cache()`; client islands use TanStack key `["billing","subscription"]` |
| `/billing/plans` (BE-BIL-08) | GET | `code`, `name`, `audience`, `childrenCovered`, `prices[]`, `features[]` | `"use cache"`, tag `billing:plans` |
| `/billing/invoices` (BE-BIL-18) | GET | `items[]` (`id`, `issuedAt`, `description`, `totalCents`, `vatCents`, `status`, `number`), `nextCursor` | per user; TanStack infinite query |
| `/billing/invoices/{id}/pdf` (BE-BIL-18) | GET | returns a short-lived presigned URL or streams the PDF through the BFF | none |
| `/family/children` (BE-FAM-06), parent | GET | `studentId`, `displayName`, `stage`, `linkStatus` | per user |

### Mutations

| Endpoint (BE ID) | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/billing/subscription/change` (BE-BIL-15) | POST | `planCode`, `interval`, `preview` (true for preview), `idempotencyKey` | preview: `direction` (upgrade, downgrade, same), `chargeTodayCents`, `vatIncludedCents`, `newRecurringCents`, `effectiveAt`; commit: subscription | Upgrade charges the saved card immediately; if the charge fails, the plan does not change and the response is `402 payment_failed` |
| `/billing/subscription/change` (BE-BIL-15) with `cancelPending: true` | POST | `idempotencyKey` | subscription | Removes a scheduled downgrade (proposed shape; may be a separate slice) |
| `/billing/subscription/cancel` (BE-BIL-16) | POST | `reason` (optional, free text, max 500), `idempotencyKey` | subscription with `cancelAtPeriodEnd = true` | Retention-free: no offer step |
| `/billing/subscription/resume` (proposed, not in 02-backend) | POST | `idempotencyKey` | subscription | Undo cancel before period end |
| `/billing/payment-method` (BE-BIL-17) | POST | none | `updateUrl` (Paystack hosted link), `expiresAt` | Card data never touches our servers or pages |
| `/billing/seats` (BE-BIL-19) | POST | `count` (new total), `idempotencyKey` | subscription; may imply plan change `parent.N` (immediate, prorated) | Adding a place is an upgrade |
| `/billing/seats` (BE-BIL-19) | DELETE | `studentIds[]` to uncover at period end, `idempotencyKey` | subscription with `pendingPlanCode` | Removing a place is a downgrade at period end |
| Seat assignment (proposed `PUT /billing/seats/assignments`) | PUT | `studentIds[]` | subscription | Choose which linked children are covered when places exceed or trail children |

After every mutation: invalidate `["billing","subscription"]`, call `router.refresh()`, and refresh session entitlements when the plan changed now.

Additions from the 43f9faa review:

- `/billing/subscription` adds `managedByOther` (bool), `isOwner` (bool) and `canManage` (true only while `active`, `trialing` or `past_due`), as the old summary did. Mutation buttons render only when `canManage`. (PG-BIL-MANAGE-44)
- Change preview adds `allowances[]` (`featureKey`, `label`, `currentLimit`, `newLimit`, `usedThisPeriod`; `null` limit means unlimited) and `mode` (`charged` or `checkout`). With `mode = checkout` the response also has `authorizationUrl` and the upgrade completes through `/billing/return`. (PG-BIL-MANAGE-41, PG-BIL-MANAGE-42)
- Invoice `status` adds `disputed` next to `paid`, `failed` and `refunded` (old webhook treated `refund.processed`, `charge.dispute.create` and `charge.dispute.resolve` as money-returned events). (PG-BIL-MANAGE-43)

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Streaming | Card skeletons in the final grid | none |
| Free plan | `status = none` or plan `free` | Card title "Free plan". Body "You are on the free plan. Paid plans add more practice tests and AI help." | Button "See plans" to `/pricing`; invoices card shows its empty state |
| Active | `status = active` | Badge "Active". "Renews on 19 Nov 2026 for R149." | Change, cancel |
| Trialing (not reachable in v1: no free trial, decision 51; keep the mapping so the badge never breaks) | `status = trialing` | Badge "Trial". Banner when 3 days or fewer remain: "Your trial ends on 22 Oct 2026. After that we charge R149 a month to your saved card." | "Update payment method" if no card |
| Past due | `status = past_due` | Banner (terracotta surface, not rose): "We could not take your last payment. Your plan is still on while we try again on 21 Oct 2026. Updating your card usually sorts it out." | Button "Update payment method" |
| Past due, final attempt | `nextRetryAt` null and still past due | Banner: "We could not take your payment after a few tries. Update your card by 25 Oct 2026 to keep your plan." | "Update payment method" |
| Cancelling | `cancelAtPeriodEnd = true` | Banner: "Your plan ends on 19 Nov 2026. You keep everything until then, and you will not be charged again." | Button "Keep my plan" (resume) |
| Cancelled | `status = cancelled` after period end | Card: "Your Student Pro plan ended on 19 Oct 2026. Your work is still here on the free plan." | "See plans" |
| Scheduled downgrade | `pendingPlanCode` set | Banner: "You are moving to Parent (2 children) on 19 Nov 2026. Until then, all 3 children stay covered." | Button "Keep my current plan" |
| No usage meters | Plan without metered features | Usage card hidden | none |
| Invoices empty | No invoices | "No invoices yet. Your first one appears here after your first payment." | none |
| Invoices error | Invoices loader fails | Inline in card: "We could not load your invoices. Your plan details above are up to date." | "Try again" |
| No card | `paymentMethod` null | "No card saved." | "Add a payment method" |
| Change: upgrade preview | Preview `direction = upgrade` | "You pay R50.00 today for the rest of this period (includes VAT R6.52). From 19 Nov 2026 you pay R199 a month." | "Upgrade now" |
| Change: downgrade preview | Preview `direction = downgrade` | "Your plan changes to Free on 19 Nov 2026. You keep Student Pro until then. Nothing is charged today." | "Switch on 19 Nov 2026" |
| Change: payment failed | `402 payment_failed` on upgrade | "Your card was declined, so your plan has not changed and nothing was taken. Update your card and try again." | "Update payment method" |
| Change: same plan | Selecting current plan | Option disabled with "Your current plan" | none |
| Cancel confirm | Cancel pressed | Title "Cancel your plan?" Body "Your plan stays on until 19 Nov 2026. After that you move to the free plan and keep all your work. You will not be charged again." Optional field "Anything we could do better? (optional)" | Buttons "Cancel plan" (destructive), "Keep plan" |
| Cancel done | Cancel succeeds | Toast "Your plan will end on 19 Nov 2026." | Banner switches to Cancelling |
| Payment method redirecting | Mutation pending | Button "Opening Paystack" disabled | none |
| Payment method returned | Return with `?card=updated` | Toast "Card updated. We will use it for your next payment." | none |
| Provider down | `503` on any mutation | Alert in the dialog: "Paystack is not responding right now. Nothing has changed. Try again in a few minutes." | "Try again" (same idempotency key) |
| Concurrency conflict | `409` (xmin) | "Your plan changed in another tab. We have loaded the latest details." | Dialog refreshes |
| Page error | Subscription loader fails | `PageState` title "We could not load your billing details", body "Your plan is not affected. Check your connection and try again." | "Try again" |
| Forbidden | Admin, or no `billing.manage` (for example a student whose plan a parent pays for) | "Billing is managed by your parent or guardian." for a covered student; generic `PageForbidden` otherwise | Link home |

## Stage variants

- Student copy is identical across high school and university; usage labels come from plan features ("Practice tests", "Quick AI replies", "Deep AI sessions").
- Parent seats list shows each child's stage as "High school" or "University or college" only. Mixed-stage families see one list; there are no stage-specific prices.
- A student covered by a parent plan sees "Covered by your parent's plan" on their own billing page, with no payment method or invoices (those belong to the payer).

## Interactions and edge cases

- Upgrade with proration: the dialog always fetches a preview before the confirm button enables; the confirm button shows the exact charge ("Upgrade now and pay R50.00"). The committed charge must equal the preview; if the API reports a different amount (period rolled over), the dialog shows the new preview and asks again.
- Downgrade at period end: no charge today; banner appears; the person can undo with "Keep my current plan" until `pendingEffectiveAt`.
- Change while past due: upgrades are blocked with "Update your card first, then change your plan." Downgrades and cancel stay allowed.
- Change while cancelling: choosing a plan first resumes the subscription; the preview explains "This also keeps your plan from ending."
- Seat removal: the parent picks which child to uncover in a dialog listing covered children; the chosen child keeps full paid access until the period end, then drops to the free plan (keeps all their work, loses paid features only). The child is notified by the Notifications module, not by this page. Removing a place never unlinks the child.
- Seat removal when places exceed children (an open place): the open place is removed first with no child choice.
- Seat add: if a child is linked but not covered, "Add to plan" previews the upgrade to `parent.N+1` and charges prorated today. Above `parent.4`: "Plans cover up to 4 children. Contact support for more." (open question).
- A covered child unlinks from the family: the place becomes open; the banner suggests "You have an open place. Link a child or remove the place from 19 Nov 2026."
- Payment method update: Paystack hosted link opens in the same tab; on return the API has already stored the new authorisation via webhook; if the webhook is late, the payment method card shows the old card plus "Updating" until the next refresh.
- Invoice PDF: downloads through a short-lived URL; filename `aptiverse-invoice-INV-2026-000123.pdf`; failure toast "We could not download that invoice. Try again."
- Refunded invoice shows status "Refunded" and the refund amount as a second line.
- Double submits: every mutation button disables while pending and sends an idempotency key generated when the dialog opens.
- Paystack test mode badge and a line in the change dialog: "Test mode: no real money moves."
- Downgrade over-use: if this period's usage of any feature is already above the new plan's limit, the downgrade dialog lists those features before the confirm button: the person keeps current allowances until the effective date, then the lower limit applies from the next period. (PG-BIL-MANAGE-41)
- Allowance comparison: every change dialog shows current versus new monthly allowances per feature, "Unlimited" where the limit is null. (PG-BIL-MANAGE-41)
- Upgrade with no reusable card (never paid by card, card expired, or authorisation revoked): the API answers `mode = checkout`; the button reads "Continue to Paystack" and the person returns through `/billing/return`. (PG-BIL-MANAGE-42)
- Disputed payment: the invoice row shows "Disputed" with "Your bank is looking into this payment. We will email you when it is resolved." No alarming banner; plan status follows the API. (PG-BIL-MANAGE-43)
- Covered student: still sees their own monthly usage meters under the covered card, as the old page did, without any payer data. (PG-BIL-MANAGE-44)
- Cancelled and ended, or free: plan options for the person's audience (student plans, or parent tiers `parent` to `parent.4`) link to checkout, so resubscribing never needs support. (PG-BIL-MANAGE-45)
- After cancel, the API emails "Your Aptiverse subscription is ending" with the access-until date; the toast says so. (PG-BIL-MANAGE-46)

## Copy

- Title "Billing"; description "Your plan, payments and invoices."
- Status badges: "Active", "Trial", "Payment due", "Cancelling", "Free"
- "Renews on 19 Nov 2026 for R149." / "Ends on 19 Nov 2026"
- Usage: "Practice tests 7 of 20", "Unlimited", "Resets on 19 Nov 2026"
- Past due: "We could not take your last payment. Your plan is still on while we try again on 21 Oct 2026. Updating your card usually sorts it out."
- Cancel title "Cancel your plan?"; body as in States; buttons "Cancel plan" and "Keep plan"
- Resume: "Keep my plan"; scheduled downgrade undo: "Keep my current plan"
- Seats: "Children covered", "2 of 3 places used", "Add a place", "Remove from plan", "Choose who stays covered", "Thandi keeps paid features until 19 Nov 2026, then moves to the free plan. Her work stays."
- Payment method: "Visa ending 4081", "Expires 08/27", "Update payment method", "You update your card on Paystack's secure page."
- Invoices: "Invoices", "No invoices yet. Your first one appears here after your first payment.", "Download invoice for 19 Oct 2026", "Includes VAT R19.43"

- Over-use warning: "You have already used {used} {label} this month. {newPlan} includes {newLimit}. You keep your current allowances until {date}."
- Allowance table heading: "Monthly allowances"; columns "Now" and "On {newPlan}".
- Checkout-mode upgrade button: "Continue to Paystack".
- Disputed row: "Disputed"; detail "Your bank is looking into this payment. We will email you when it is resolved."
- Cancel toast: "Your plan is cancelled. You keep access until {date}. We have emailed you a confirmation."
- Resubscribe heading: "Choose a plan".

## Acceptance criteria

- AC-01 Given an active student pro subscriber, when the page loads, then plan name, "Renews on" date in Africa/Johannesburg time and the amount match `GET /billing/subscription` to the cent.
- AC-02 Given usage of 7 of 20 practice tests, when the usage card renders, then the meter shows "Practice tests 7 of 20" as text and the progressbar has `aria-valuenow=7` and `aria-valuemax=20`.
- AC-03 Given an upgrade, when the dialog opens a target plan, then a preview request runs, the confirm button shows the exact charge, and confirming sends one commit with the dialog's idempotency key.
- AC-04 Given an upgrade whose card is declined, when the API returns 402, then the plan is unchanged and the declined copy shows.
- AC-05 Given a downgrade, when confirmed, then no charge is made, the banner shows the effective date, and "Keep my current plan" removes the scheduled change.
- AC-06 Given a parent with 3 covered children, when they remove a place and pick Thandi, then Thandi stays covered until period end, the banner names the change, and Thandi stays linked.
- AC-07 Given cancel, when confirmed, then exactly one request is sent, there is no offer or discount step, the banner reads "Your plan ends on ..." and "Keep my plan" resumes it.
- AC-08 Given `past_due`, when the page loads, then the banner uses the terracotta surface and the non-alarming copy and upgrades are blocked.
- AC-09 Given "Update payment method", when pressed, then the browser goes to the Paystack `updateUrl` and no card input exists on any of our pages.
- AC-10 Given invoices, when the download button is pressed, then the PDF downloads with VAT shown on it, and the request is authorised for the invoice owner only (another user's invoice id returns 404).
- AC-11 Given a student covered by a parent plan, when they open `/dashboard/billing`, then they see "Covered by your parent's plan" and no payment or invoice data.
- AC-12 Given a 503 from Paystack on any mutation, when the alert shows, then it states nothing has changed and retry reuses the key.
- AC-13 Given a Student Pro user who used 25 practice tests this month, when they preview a downgrade to Free with a limit of 5, then the dialog lists practice tests as already over and states the date the lower limit starts.
- AC-14 Given an account with no reusable card, when the person confirms an upgrade, then they are sent to Paystack and land on `/billing/return` afterwards.
- AC-15 Given a student covered by a parent's plan, when they open Billing, then they see the covered card and their own usage meters and no payment method, invoices or change buttons.
- AC-16 Given a cancelled plan past its end date, when the owner opens Billing, then plan options for their audience link to checkout.

## Production readiness

### Security
- [ ] All mutations go through the BFF (CSRF via same-site cookie and origin check); the API enforces `billing.manage` and that the subscription belongs to the caller. (PG-BIL-MANAGE-Q16)
- [ ] Payment method update uses Paystack's hosted page only; CSP forbids card iframes from other origins; no card digits beyond Paystack's `last4` are rendered. (PG-BIL-MANAGE-Q16)
- [ ] Invoice PDFs served by short-lived presigned URL or BFF stream, never a guessable public path; ownership checked server-side. (PG-BIL-MANAGE-24)
- [ ] Seat changes accept only children linked to the caller (no cross-family ids); the API returns 404 for others. (PG-BIL-MANAGE-Q17)
- [ ] Cancel reason text is never logged with the user's email and is stored only in the billing schema. (PG-BIL-MANAGE-Q17)

### Privacy and POPIA
- [ ] Covered students see no payer card or invoice data (data minimisation). (PG-BIL-MANAGE-33)
- [ ] Seat list shows child name and stage label only; no marks or wellbeing data. (PG-BIL-MANAGE-27)
- [ ] Invoices are retained per the retention policy (Phase 10); the page shows what exists and never deletes. (PG-BIL-MANAGE-Q17)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip (dialogs loaded with `next/dynamic` on open). (PG-BIL-MANAGE-Q18)
- [ ] Each card in its own Suspense boundary; invoices paged (20 per page). (PG-BIL-MANAGE-Q18)

### Resilience
- [ ] Idempotency key per dialog open for change, cancel, resume and seats; buttons disabled while pending. (PG-BIL-MANAGE-36)
- [ ] Paystack outage: mutations show "Nothing has changed"; reads still render from our DB. (PG-BIL-MANAGE-37)
- [ ] Webhook delay after card update or upgrade: "Updating" indicator and a refetch at 5 s and 15 s. (PG-BIL-MANAGE-38)
- [ ] `409` concurrency handled by reloading and re-previewing. (PG-BIL-MANAGE-39)

### Observability
- [ ] Events: `billing_manage_viewed` (status), `billing_change_previewed` (direction), `billing_change_confirmed`, `billing_change_failed` (code), `billing_cancel_opened`, `billing_cancel_confirmed`, `billing_resume_clicked`, `billing_payment_method_update_started`, `billing_seat_added`, `billing_seat_removed`, `billing_invoice_downloaded`. (PG-BIL-MANAGE-Q19)
- [ ] Sentry tags `{ page: "PG-BIL-MANAGE", role, status }`; traces from BFF through BE-BIL-15 to Paystack. (PG-BIL-MANAGE-Q19)

### Accessibility
- [ ] WCAG 2.2 AA: meters have text equivalents; status never by colour alone; dialogs trap and return focus; destructive button is not the default focus in the cancel dialog; target size and focus not obscured on the bottom sheet. (PG-BIL-MANAGE-Q20)

### Rollout
- [ ] Behind `flags.billing`; seats section additionally behind `flags.parentTrack`. Staged: internal accounts in Paystack test mode on staging, then prod internal, then all. Rollback: flag off hides mutation buttons and shows read-only plan details. (PG-BIL-MANAGE-Q21)

### Monitoring and alerts
- [ ] Alerts: change or cancel 5xx rate above 2% over 15 minutes; upgrade `402` rate above 20% over an hour; payment method update start-to-return below 70% for a day; reconciliation drift above zero (BE-BIL-22) links to this page's runbook section. (PG-BIL-MANAGE-Q22)

## Build tasks

- [ ] **PG-BIL-MANAGE-01** Current plan, renewal date, usage meters (split into -08 to -11)
- [ ] **PG-BIL-MANAGE-02** Change plan (upgrade now, downgrade at period end) (split into -12 to -17)
- [ ] **PG-BIL-MANAGE-03** Payment method update (split into -18 to -20)
- [ ] **PG-BIL-MANAGE-04** Invoices list and PDF download (split into -21 to -24)
- [ ] **PG-BIL-MANAGE-05** Family seats add and remove (parent) (split into -25 to -30)
- [ ] **PG-BIL-MANAGE-06** Cancel (retention-free) (split into -31 and -32)
- [ ] **PG-BIL-MANAGE-07** Past-due banner (non-alarming) with update card action and final-attempt variant
- [ ] **PG-BIL-MANAGE-08** Route files for both roles and the shared `BillingView` with per-card Suspense
- [ ] **PG-BIL-MANAGE-09** Current plan card with status badge mapping (`subscription-status.ts`) and renewal or end date
- [ ] **PG-BIL-MANAGE-10** Usage meters card from `usage[]`, unlimited handling, reset date
- [ ] **PG-BIL-MANAGE-11** Free plan card (no trial ending banner in v1, decision 51; the `trialing` badge mapping stays defensive only)
- [ ] **PG-BIL-MANAGE-12** Change plan dialog shell: plan list filtered by audience, current plan disabled
- [ ] **PG-BIL-MANAGE-13** Proration preview call and preview panel (charge today, VAT, new recurring, effective date)
- [ ] **PG-BIL-MANAGE-14** Upgrade commit with `402 payment_failed` handling
- [ ] **PG-BIL-MANAGE-15** Downgrade commit and scheduled downgrade banner
- [ ] **PG-BIL-MANAGE-16** Cancel scheduled downgrade ("Keep my current plan")
- [ ] **PG-BIL-MANAGE-17** Change rules: block upgrade while past due; change while cancelling resumes
- [ ] **PG-BIL-MANAGE-18** Payment method card (brand, last four, expiry, no card state)
- [ ] **PG-BIL-MANAGE-19** Update payment method mutation and same-tab redirect to Paystack hosted link
- [ ] **PG-BIL-MANAGE-20** Return handling `?card=updated` toast and "Updating" indicator while the webhook lands
- [ ] **PG-BIL-MANAGE-21** Invoices table with `DataTable` and mobile card fallback
- [ ] **PG-BIL-MANAGE-22** Invoice cursor paging ("Show more")
- [ ] **PG-BIL-MANAGE-23** Refunded and failed invoice row variants
- [ ] **PG-BIL-MANAGE-24** Invoice PDF download through presigned URL or BFF stream, with failure toast
- [ ] **PG-BIL-MANAGE-25** Seats card: covered and not covered children, places used
- [ ] **PG-BIL-MANAGE-26** Add a place: preview upgrade to the next parent tier and commit
- [ ] **PG-BIL-MANAGE-27** Remove a place: "Choose who stays covered" dialog and period-end commit
- [ ] **PG-BIL-MANAGE-28** Open place handling (removed first; banner suggestion after a child unlinks)
- [ ] **PG-BIL-MANAGE-29** Assign a linked uncovered child to an open place
- [ ] **PG-BIL-MANAGE-30** Four-child ceiling message
- [ ] **PG-BIL-MANAGE-31** Cancel dialog (retention-free, optional reason) and cancelling banner
- [ ] **PG-BIL-MANAGE-32** Resume ("Keep my plan") before period end
- [ ] **PG-BIL-MANAGE-33** Covered-student variant: "Covered by your parent's plan", no payer data
- [ ] **PG-BIL-MANAGE-34** Cancelled (ended) state card
- [ ] **PG-BIL-MANAGE-35** Session entitlement refresh after immediate changes
- [ ] **PG-BIL-MANAGE-36** Idempotency keys per dialog open and pending guards on every mutation
- [ ] **PG-BIL-MANAGE-37** Provider-down alert in every dialog
- [ ] **PG-BIL-MANAGE-38** Delayed-webhook refetch at 5 s and 15 s after card update or upgrade
- [ ] **PG-BIL-MANAGE-39** `409` conflict reload and re-preview
- [ ] **PG-BIL-MANAGE-40** Test mode badge and dialog line
- [ ] **PG-BIL-MANAGE-41** Allowance comparison table and over-use warning in the change dialog from preview `allowances[]`
- [ ] **PG-BIL-MANAGE-42** Checkout-mode upgrade: "Continue to Paystack" when preview `mode = checkout`, returning via `/billing/return`
- [ ] **PG-BIL-MANAGE-43** Disputed invoice row variant with neutral copy
- [ ] **PG-BIL-MANAGE-44** `managedByOther`, `isOwner` and `canManage` handling: covered student keeps own usage meters; mutation buttons only when `canManage`
- [ ] **PG-BIL-MANAGE-45** Plan options for free and ended owners, filtered by audience, linking to checkout
- [ ] **PG-BIL-MANAGE-46** Cancel confirmation toast naming the access-until date and the confirmation email

## Quality tasks

- [ ] **PG-BIL-MANAGE-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), for both `/dashboard/billing` and `/parent/billing`
- [ ] **PG-BIL-MANAGE-Q02** Server loaders in `src/features/billing/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-BIL-MANAGE-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending states on every action
- [ ] **PG-BIL-MANAGE-Q04** Empty states (free plan, no invoices, no card) each with one clear next action
- [ ] **PG-BIL-MANAGE-Q05** Error state copy: what went wrong, that the plan is unaffected, and how to fix it
- [ ] **PG-BIL-MANAGE-Q06** Forbidden state (admin, covered student without `billing.manage`)
- [ ] **PG-BIL-MANAGE-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-BIL-MANAGE-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); invoices table collapses to cards
- [ ] **PG-BIL-MANAGE-Q09** Layout at 1440px
- [ ] **PG-BIL-MANAGE-Q10** Light and dark both correct (OS-driven); past-due banner terracotta, never rose
- [ ] **PG-BIL-MANAGE-Q11** Copy review: no emojis, no em or en dashes, plain, calm and specific
- [ ] **PG-BIL-MANAGE-Q12** axe: zero violations in light and dark, with each dialog open
- [ ] **PG-BIL-MANAGE-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-BIL-MANAGE-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering active, past due, cancelling, free and error states
- [ ] **PG-BIL-MANAGE-Q15** `generateMetadata` title "Billing"; nav entry active state correct for both roles
- [ ] **PG-BIL-MANAGE-Q16** Security review: BFF CSRF, ownership checks, hosted card update only, CSP
- [ ] **PG-BIL-MANAGE-Q17** Cross-family seat test (another family's child id returns 404) and log redaction check for cancel reasons
- [ ] **PG-BIL-MANAGE-Q18** Performance: Lighthouse CI mobile budget, dynamic import of dialogs, invoice paging
- [ ] **PG-BIL-MANAGE-Q19** Observability: events and Sentry tags wired, traces verified on staging
- [ ] **PG-BIL-MANAGE-Q20** WCAG 2.2 AA pass on meters, banners and dialogs
- [ ] **PG-BIL-MANAGE-Q21** Rollout: `flags.billing` and `flags.parentTrack` gates, read-only fallback, rollback note
- [ ] **PG-BIL-MANAGE-Q22** Monitoring: alerts for mutation failures, upgrade declines, card update drop-off, reconciliation drift
- [ ] **PG-BIL-MANAGE-Q23** Webhook money-returned events (refund, dispute opened, dispute resolved) reflected on the page after replay, with no duplicate rows (E2E against Paystack test mode fixtures)

## Tests

### Unit (Vitest)
- `subscription-status.test.ts`: badge for trialing (defensive mapping, no banner), badge and banner for active, past_due, past_due final, cancelling, cancelled, scheduled downgrade; banner priority.
- `proration-preview.test.tsx`: upgrade, downgrade and same plan copy with exact rand values.
- `seat-actions.test.tsx`: open place removed first; choose child dialog; ceiling message.
- `cancel-plan-dialog.test.tsx`: no offer step; reason optional and capped at 500 characters; one request.
- `usage-meters.test.tsx`: text values, unlimited, aria values.

### Playwright (`web/tests/e2e/billing/billing-management.spec.ts`)
- active student sees renewal date and usage
- upgrade shows prorated charge and unlocks feature
- upgrade with declined card leaves plan unchanged
- downgrade schedules for period end and can be undone
- cancel is retention free and can be resumed
- past due banner is calm and offers card update
- update payment method goes to paystack hosted page
- invoice downloads as pdf with vat
- parent removes a place and chooses who stays covered
- parent adds a place for an uncovered child
- covered student sees covered by parent plan
- another family's child id is rejected
- axe clean light and dark with dialogs open at 360 and 1440
- Unit `allowance-comparison.test.tsx`: unlimited, over-use rows, no rows when nothing is over.
- Playwright `downgrade warns about allowances already used`, `upgrade without saved card goes through Paystack`, `disputed invoice row`, `covered student sees own usage`, `ended plan offers resubscribe`.

## Open questions

- Resume after cancel and cancel of a scheduled downgrade are specified in `../../backend/billing.md` (`POST /billing/subscription/resume` and cancelling a pending change).
- Seat assignment (`PUT /billing/seats/assignments`) is covered by the seat list and assignment slices in `../../backend/billing.md`.
- Ceiling above four children: contact support, or a `parent.5` plan?
- How many Paystack retry attempts before past due becomes final, and what is the grace period before downgrade to free?
- Does a covered student need `billing.manage` removed, or does the page decide from the subscription payer?
- Should invoices for a refunded payment show a separate credit note?
- Does a dispute pause paid features while it is open, or only a lost dispute? The old code only recorded the money event.
- Decided (12): annual billing is in v1, alongside monthly (shared with PG-BIL-CHECKOUT).
