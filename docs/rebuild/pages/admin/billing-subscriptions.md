# Subscriptions

| | |
|---|---|
| ID | `PG-ADM-SUBS` |
| Route | `/admin/billing (Subscriptions tab)`; the tab is the default view at `/admin/billing`, drawer at `?subscription=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific (subscribers are students or parents) |
| Entitlement | none; permissions `billing.admin` (read, as in `nav-config.ts`), `billing.subscriptions.manage` (actions, proposed) |
| Depends on | BE-ADM-05, BE-ADM-07, BE-BIL-02 (plans), BE-BIL-03, BE-BIL-13 (state machine), BE-BIL-15, BE-BIL-16, BE-BIL-17, BE-BIL-19 (seats), PG-ADM-DASH-04 to 13, UI-06 (Tabs) |
| Old app reference | `43f9faa:web/src/app/(app)/admin/subscriptions/page.tsx` (real list from `GET /api/admin/subscriptions`: status filter, Live, MRR at list price, Past due and Cancelled cards, columns for last charge, next charge, card on file, renewal failures and pending plan); API `43f9faa:api/Controllers/AdminController.cs` (`GetSubscriptions`, `ToSubscriptionRow`, paid versus comped), `43f9faa:api/Controllers/AdminPaystackController.cs` (`SetSubscriptionState`: pause or resume billing at Paystack), `43f9faa:api/Controllers/PaymentsController.cs` (plan change, undo scheduled downgrade, parent coverage rule) |
| Status | Not started |

This file owns the `/admin/billing` layout and tab bar shared with `billing-payments.md` (Payments, Invoices and Reconciliation tabs).

## Purpose

Show every subscription and its state so an admin can answer "who paid" and "who is about to lapse", and take the few subscription actions support needs (cancel, undo a scheduled cancellation, change plan, send a card update link) with a reason, an audit record, and Paystack kept in step.

## User stories

- As an admin, I filter subscriptions by state (active, past due, cancelling, cancelled) and plan, and see counts per state at the top.
- As an admin, I open one subscription and see its plan, seats, period dates, state history and recent payments.
- As a billing admin, I cancel a subscription at period end or immediately on a parent's request, with a reason.
- As a billing admin, I send a card update link to a past due subscriber.
- As a billing admin, I can see that an action reached Aptiverse but failed at Paystack, and what to do next.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Billing", description "Subscriptions, payments and Paystack, from live records."
2. Tab bar as horizontally scrollable links (scroll is inside the tab list only, not the page): Subscriptions, Payments, Invoices, Reconciliation. Current tab has `aria-current="page"`.
3. State summary: 2-column grid of small count chips, each a filter link: Active, Past due, Cancelling, Cancelled (no trial state in v1, decision 51). Plus one line "Monthly recurring revenue R84 230" (from API).
4. Search "Name, email or Paystack code" and "Filters" Sheet (State, Plan, Renews between).
5. Results as cards: subscriber name, plan, state badge, "Renews 1 Nov 2026" or "Ends 1 Nov 2026", amount per period.
6. Pagination.
7. Drawer full screen with sticky Actions footer.

### Desktop (1440px)

- Tab bar under the h1.
- State summary as a single row of five `StatCard`s plus MRR card.
- Filter bar inline; `DataTable` columns: Subscriber, Plan, Seats, State, Amount, Period end, Paystack code, Started.
- Drawer 560px on the right with sections: Overview, Seats, State history, Payments (last 10, link to Payments tab filtered), Paystack.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Billing layout | `web/src/app/(app)/admin/billing/layout.tsx` | server | h1, tab links, `PermissionGate billing.admin` |
| Tab bar | `web/src/features/admin/billing/components/billing-tabs.tsx` | server | Links, not client Tabs state |
| Subscriptions page | `web/src/app/(app)/admin/billing/page.tsx` | server | Default tab |
| Loading and error | `web/src/app/(app)/admin/billing/loading.tsx`, `error.tsx` | server, client | Per tab so other tabs stay usable |
| Drawer slot | `web/src/app/(app)/admin/billing/@drawer/page.tsx`, `default.tsx` | server | Subscription drawer via `?subscription=` |
| State summary | `web/src/features/admin/billing/subscriptions/components/state-summary.tsx` | server | Count links and MRR |
| Filters | `web/src/features/admin/billing/subscriptions/components/subscription-filters.tsx` | client | `admin-filter-bar` |
| Table | `web/src/features/admin/billing/subscriptions/components/subscription-table.tsx` | server | `DataTable` |
| State badge | `web/src/features/admin/billing/shared/subscription-state-badge.tsx` | server | Shared with payments and users drawer |
| Drawer body | `web/src/features/admin/billing/subscriptions/components/subscription-drawer-body.tsx` | server | Sections |
| State history | `web/src/features/admin/billing/subscriptions/components/state-history.tsx` | server | Ordered list of transitions with actor (system, user, admin) |
| Actions menu | `web/src/features/admin/billing/subscriptions/components/subscription-actions-menu.tsx` | client | Shows only valid transitions for the current state |
| Action dialogs | `web/src/features/admin/billing/subscriptions/components/actions/*.tsx` | client | `cancel-at-period-end.tsx`, `cancel-now.tsx`, `undo-cancel.tsx`, `change-plan.tsx`, `send-card-link.tsx` |
| Loaders | `web/src/features/admin/billing/subscriptions/server/list-subscriptions.ts`, `get-subscription.ts`, `get-subscription-summary.ts` | server | Summary cached 60s with `cacheTag("admin-billing-summary")` |
| Valid actions map | `web/src/features/admin/billing/subscriptions/lib/valid-actions.ts` | shared | Mirrors BE-BIL-13 transitions for display only; server is authority |

## Data

| Endpoint | BE ID | Method | Fields used | Cache |
|---|---|---|---|---|
| `/admin/subscriptions/summary` | BE-ADM-05 (needs the summary fields added; flag) | GET | `counts` { `active`, `pastDue`, `cancelling`, `cancelled` }, `mrrCents`, `currency`, `asOf` | `admin-billing-summary`, 60s |
| `/admin/subscriptions?q=&state=&plan=&renewFrom=&renewTo=&cursor=&limit=` | BE-ADM-05 | GET | `items[]`: `id`, `subscriberId`, `subscriberName`, `emailMasked`, `planCode`, `planName`, `seats`, `state`, `amountCents`, `currency`, `interval`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `paystackSubscriptionCode`, `startedAt`; `nextCursor`, `total` | none |
| `/admin/subscriptions/{id}` | BE-ADM-05 | GET | All list fields plus `seatsList[]` { `studentId`, `studentName`, `assignedAt` }, `history[]` { `from`, `to`, `at`, `actorType`, `actorName`, `reason` }, `recentPayments[]` { `id`, `amountCents`, `status`, `paidAt` }, `paystack` { `customerCode`, `subscriptionCode`, `emailToken` present bool, `status`, `nextPaymentDate`, `lastSyncedAt` }, `allowedActions[]` | none |
| `/billing/plans` | BE-BIL-08 | GET | `code`, `name`, `amountCents`, `interval` for change plan options | public cache |

Mutations (BFF, `Idempotency-Key`, reason required, `billing.subscriptions.manage`):

| Action | Endpoint | BE ID | Request | Response |
|---|---|---|---|---|
| Cancel at period end | `POST /admin/subscriptions/{id}/cancel` | BE-ADM-07 | `mode: "period_end"`, `reason` | `auditEventId`, `subscription`, `paystackResult` (`ok`, `failed`, `skipped`) |
| Cancel now | `POST /admin/subscriptions/{id}/cancel` | BE-ADM-07 | `mode: "immediate"`, `reason` | same; refund is a separate action on the Payments tab |
| Undo scheduled cancel | `POST /admin/subscriptions/{id}/resume` | BE-ADM-07 | `reason` | same |
| Change plan | `POST /admin/subscriptions/{id}/change-plan` | BE-ADM-07 (uses BE-BIL-15 rules) | `planCode`, `timing` (`now` for upgrades, `period_end` for downgrades), `reason` | same plus `prorationCents` |
| Send card update link | `POST /admin/subscriptions/{id}/card-link` | BE-ADM-07 (uses BE-BIL-17) | `reason` | `auditEventId`, `sentTo` (masked) |
| Pause or resume billing at Paystack | `POST /admin/subscriptions/{id}/paystack-billing` | BE-ADM-07 (ported from old `SetSubscriptionState`) | `enabled` (bool), `reason` | `auditEventId`, `paystackResult`; the API fetches the Paystack email token itself, never from the client; 404 when Paystack has no active token |
| Undo scheduled downgrade | `POST /admin/subscriptions/{id}/cancel-change` | BE-ADM-07 (ported from old `subscription/cancel-change`) | `reason` | `auditEventId`, `subscription`, `paystackResult`; re-enables renewal of the current plan and clears the pending plan |

`paystackResult: "failed"` means Aptiverse recorded the change but Paystack did not confirm. The API queues a retry and the reconciliation job flags it if it stays failed.

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Summary skeleton and 8 row skeletons |
| Populated | Results | As in Layout |
| No subscriptions | `total` 0, no filters | Title "No subscriptions yet", description "Paid plans show here once someone checks out with Paystack." |
| No matches | `total` 0 with filters | Title "No subscriptions match these filters", action "Clear filters" |
| Summary unavailable | Summary call fails | Chips read "No data yet"; line "Counts are not available right now." List still loads |
| MRR null | `mrrCents` null | "Monthly recurring revenue: no data yet" |
| Drawer not found | 404 | "This subscription does not exist." action "Back to subscriptions" |
| Action pending | Submitting | Confirm shows spinner, "Saving..." |
| Action ok | 200, `paystackResult` ok | Toast "Saved. Paystack updated. Audit ref {id}." |
| Action partly done | 200, `paystackResult` failed | Drawer banner (attention zone): "Saved in Aptiverse, but Paystack did not confirm. We will retry automatically. If this is still here in an hour, check the Reconciliation tab." Toast "Saved, Paystack pending. Audit ref {id}." |
| Action refused | 409 invalid transition | "This subscription is now {state}, so that action no longer applies. The view has been refreshed." |
| Paystack down | 503 `paystack_unavailable` before any change | "Paystack is not responding, so nothing changed. Try again in a few minutes." |
| Error | List fails | "We could not load subscriptions. Try again." |
| Forbidden | No `billing.admin` | "You do not have access to billing. Ask another admin to grant billing.admin." |
| Actions forbidden | No `billing.subscriptions.manage` | Actions menu hidden; footer note "You can view subscriptions but not change them." |

## Stage variants

- Student plans show the student as subscriber. Parent per-child plans show the parent as subscriber with a Seats section listing linked students and their stage labels ("High school, Grade 10" or "University, Year 1").

## Interactions and edge cases

- Actions menu offers only `allowedActions` from the API. `valid-actions.ts` is used to label and order them, never to enable an action the API did not list.
- Cancel now on a family plan: dialog lists the seats that lose access today.
- Change plan: upgrades take effect now with proration shown before confirm (from a dry run: `POST /admin/subscriptions/{id}/change-plan?dryRun=true`, part of BE-ADM-07; flag if missing). Downgrades apply at period end.
- Past due subscription: Send card update link is the primary action; Cancel now is secondary.
- Two admins changing the same subscription: API uses `xmin` concurrency; a stale write returns 409 and the drawer refreshes.
- A subscription created moments ago may lack `paystackSubscriptionCode`; show "Waiting for Paystack" and disable Paystack-dependent actions.
- Cancelled subscriptions show no actions except "Open in Payments" for refunds.
- Amounts always via `formatMoney`; interval shown as "per month" or "per year".

### Carried over from the old app (43f9faa)

- Extra list and drawer fields from the old `AdminSubscriptionDto`: `lastChargeAt` ("Never charged" when null), next charge from `currentPeriodEnd` ("Not scheduled" when cancelled or comped), card on file (`cardBrand`, `cardLast4`: "Visa ending 4242" or "None on file"), `billingEmail` (masked in the list), `renewalFailureCount` as a chip "{n} failed renewals" when above 0, `pendingPlanCode` as a chip "Changes to {plan} on {date}", `memberCount`, and "Custom pricing" when the plan has no list price.
- Paid versus comped: a subscription with no Paystack customer or authorisation was provisioned by hand. It shows a "Comped" badge and never renews; that is not a failed renewal. Filter "Payment: Paid, Comped".
- "Live" means active or past due (the old summary also counted trialing; there is no trial in v1, decision 51).
- Pause or resume billing at Paystack: reversible, no money moves, audited with the Paystack status before and whether Paystack accepted the change.
- Undo scheduled downgrade: offered when `pendingPlanCode` is set; Paystack resumes renewing the current plan.
- Parent coverage: a parent can own a plan whose member is their child. The drawer lists the owner and the covered members separately. Cancelling or changing a parent's own plan must not cancel coverage plans for their children (the old checkout had this exact bug); the cancel dialog lists any coverage plans the owner also holds with "These are not affected."
- Refunds, disputes and chargebacks from Paystack (`refund.processed`, `charge.dispute.create`, `charge.dispute.resolve`) show in the drawer history as system entries, because they also reverse affiliate commission.


## Copy

- h1 "Billing"; description "Subscriptions, payments and Paystack, from live records."
- Tabs "Subscriptions", "Payments", "Invoices", "Reconciliation"
- State labels "Active", "Past due", "Cancelling at period end", "Cancelled", "Downgrade scheduled"
- Cancel at period end dialog: title "Cancel at the end of this period", body "{name} keeps access until {date}. They will not be charged again.", confirm "Cancel at period end"
- Cancel now dialog: title "Cancel now", body "Access ends immediately for {n} people. This does not refund anything. Use Payments to refund.", confirm "Cancel now"
- Undo dialog: title "Keep this subscription", body "The scheduled cancellation is removed. Paystack charges again on {date}.", confirm "Keep subscription"
- Change plan dialog: title "Change plan", body "Upgrade starts now and charges {proration} today." or "Downgrade starts on {date}.", confirm "Change plan"
- Card link dialog: title "Send card update link", body "We will email {masked email} a secure Paystack link to update their card.", confirm "Send link"

## Acceptance criteria

- Given subscriptions in all states, when the tab loads, then the five counts equal `GET /admin/subscriptions/summary` and each count links to the list filtered by that state.
- Given an active subscription, when an admin cancels at period end with a reason, then one request is sent with an `Idempotency-Key`, the state badge reads "Cancelling at period end", and the history shows the admin's name and reason.
- Given Paystack fails after the local change, when the response has `paystackResult: "failed"`, then the drawer shows the partly done banner and the toast says Paystack pending.
- Given a stale drawer and a 409, when the admin confirms, then the refusal copy shows and the drawer refreshes to the current state.
- Given an admin with `billing.admin` only, when they open a subscription, then no actions are offered.
- Given a subscription with no Paystack customer, when the list renders, then it shows the Comped badge and next charge reads "Not scheduled".
- Given a subscription with 2 failed renewals and a pending downgrade, when the row renders, then it shows "2 failed renewals" and "Changes to {plan} on {date}", and the drawer offers "Undo scheduled downgrade".
- Given a parent who owns their own plan and a coverage plan for a child, when the admin cancels the parent's own plan, then the coverage plan stays active.
- Given a 360px viewport, when the tab bar overflows, then only the tab list scrolls and the page has no horizontal scroll.

## Production readiness

Security
- Read endpoints need `billing.admin`; each action needs `billing.subscriptions.manage`, checked server-side.
- Cancel now and change plan use the destructive reason dialog; cancel now additionally requires typing the subscriber's first name to confirm.
- Every action and failure audited by BE-ADM-07, including Paystack failures with the Paystack error code.
- BFF only; no Paystack keys or codes beyond the public subscription code reach the browser.

Performance
- Cursor pagination, 25 rows default; list index on `(state, current_period_end)`.
- Summary cached 60s; budget p95 under 250ms.
- Drawer budget p95 under 400ms; Paystack live status in the drawer is read from `lastSyncedAt` data, not a live Paystack call.

Resilience
- Actions idempotent per key; double-click guard in `admin-action`.
- Paystack outage before change: 503 with nothing changed. After local change: `paystackResult: failed` plus automatic retry and reconciliation flag.
- `xmin` concurrency conflicts surface as 409 and refresh.

Observability
- Audit event names `admin.subscription.cancel`, `.resume`, `.change_plan`, `.card_link` with outcome and `paystackResult`.
- Metric `admin_subscription_action_total{action,outcome,paystack}`.

Accessibility (WCAG 2.2 AA)
- Tab bar is a `nav` with `aria-label="Billing sections"` and links, so it works without JS.
- State badges carry text, not colour alone.

Privacy and POPIA
- List uses masked email; drawer shows full name and masked email only; no card details ever (Paystack holds them).

Rollout
- Read tab ships under `ADMIN_CONSOLE`; actions under `ADMIN_WRITE_ACTIONS`. Rollback by switch.

Monitoring
- Alert when `paystack=failed` actions exceed 3 in 1 hour.
- Panel: subscription actions per day by outcome; past due count trend (from summary).

Tasks
- [ ] **PG-ADM-SUBS-16** Typed-name confirmation for Cancel now
- [ ] **PG-ADM-SUBS-17** Partly done banner and toast for `paystackResult: failed`
- [ ] **PG-ADM-SUBS-18** 409 conflict handling with drawer refresh
- [ ] **PG-ADM-SUBS-19** Metric and alert for Paystack-failed subscription actions; panel
- [ ] **PG-ADM-SUBS-20** Confirm summary fields, dry-run change plan and `allowedActions` with BE-ADM-05 and BE-ADM-07 owners (flag gaps as new BE tasks)

## Build tasks

- [ ] **PG-ADM-SUBS-01** List with state filter (umbrella; delivered by 04 to 08)
- [ ] **PG-ADM-SUBS-02** Subscription actions (umbrella; delivered by 09 to 15)
- [ ] **PG-ADM-SUBS-03** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-SUBS-04** `/admin/billing` layout, `billing-tabs.tsx`, permission gate, per-tab loading and error
- [ ] **PG-ADM-SUBS-05** `state-summary.tsx` and summary loader with cache tag
- [ ] **PG-ADM-SUBS-06** Filters and `list-subscriptions.ts` loader
- [ ] **PG-ADM-SUBS-07** `subscription-table.tsx` with mobile cards and `subscription-state-badge.tsx`
- [ ] **PG-ADM-SUBS-08** Empty, no matches, summary unavailable and error states
- [ ] **PG-ADM-SUBS-09** Drawer slot, `get-subscription.ts`, Overview and Seats sections
- [ ] **PG-ADM-SUBS-10** State history and recent payments sections with Payments tab link
- [ ] **PG-ADM-SUBS-11** `subscription-actions-menu.tsx` from `allowedActions`, `valid-actions.ts` labels
- [ ] **PG-ADM-SUBS-12** Cancel at period end and Undo cancel dialogs
- [ ] **PG-ADM-SUBS-13** Cancel now dialog with seat impact list
- [ ] **PG-ADM-SUBS-14** Change plan dialog with dry-run proration
- [ ] **PG-ADM-SUBS-15** Send card update link dialog
- [ ] **PG-ADM-SUBS-21** Billing state columns and drawer fields: last charge, next charge, card on file, billing email, renewal failures chip, pending plan chip, custom pricing
- [ ] **PG-ADM-SUBS-22** "Comped" badge and Paid or Comped filter
- [ ] **PG-ADM-SUBS-23** Pause and resume billing at Paystack dialog with 404 no-token handling
- [ ] **PG-ADM-SUBS-24** Undo scheduled downgrade dialog
- [ ] **PG-ADM-SUBS-25** Parent coverage display (owner and covered members) and "not affected" list in the cancel dialog
- [ ] **PG-ADM-SUBS-26** Dispute and refund system entries in state history
- [ ] **PG-ADM-SUBS-27** Request BE-ADM-05 fields (`lastChargeAt`, card, `renewalFailureCount`, `pendingPlanCode`, `paid`) and the two ported BE-ADM-07 actions (coordinator)

## Quality tasks

- [ ] **PG-ADM-SUBS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-SUBS-Q02** Server loader in `src/features/admin/billing/subscriptions/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-SUBS-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-ADM-SUBS-Q04** Empty state with one clear next action
- [ ] **PG-ADM-SUBS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-SUBS-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-SUBS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-SUBS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-SUBS-Q09** Layout at 1440px
- [ ] **PG-ADM-SUBS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-SUBS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-SUBS-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-SUBS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-SUBS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-SUBS-Q15** `generateMetadata` title; nav entry active state correct (Billing active on every tab)

## Tests

Unit (Vitest)
- `features/admin/billing/subscriptions/lib/valid-actions.test.ts`: "past due offers card link first", "cancelled offers no actions", "unknown action from API is ignored"
- `features/admin/billing/subscriptions/components/subscription-table.test.tsx`: "comped shows badge not failure", "null last charge reads Never charged", "no card reads None on file"
- `features/admin/billing/subscriptions/components/state-summary.test.tsx`: "null counts show No data yet", "each chip links to its filter"
- `features/admin/billing/subscriptions/components/actions/cancel-now.test.tsx`: "requires typed first name", "lists seats losing access"

Playwright (`web/tests/e2e/admin/billing-subscriptions.spec.ts`)
- "state chips filter the list"
- "pause billing at paystack is audited"
- "undo scheduled downgrade clears pending plan"
- "cancelling parent plan leaves child coverage active"
- "cancel at period end records history with reason"
- "paystack failure after local change shows partly done banner"
- "stale drawer action shows conflict and refreshes"
- "read-only billing admin sees no actions"
- "tab bar scrolls inside itself at 360"
- "subscriptions tab has no axe violations in light and dark"

## Open questions

- Should admins grant complimentary time (extend a period) from here? Not in BE-ADM-07; recommend later.
- MRR definition: the old app used list price of each live plan, annual plans divided by 12, no discounts or failed renewals. Keep that definition (recommended) and label it "MRR at list price".
- The original single-file backlog lists the route as `/admin/subscriptions`; this file keeps `/admin/billing` with tabs to match the nav. The old route should redirect.
