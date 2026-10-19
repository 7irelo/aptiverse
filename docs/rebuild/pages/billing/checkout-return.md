# Checkout return

| | |
|---|---|
| ID | `PG-BIL-RETURN` |
| Route | `/billing/return?reference=<paystackReference>` (also accepts Paystack's `trxref`); `/welcome` redirects here |
| Phase | 6 |
| Roles | student, parent |
| Stages | high school, university (student); any (parent) |
| Entitlement | free |
| Depends on | BE-BIL-10, BE-BIL-11, BE-BIL-12, BE-BIL-13, BE-BIL-14, BE-IDN-28 (`/me` entitlements), FE-23 (server-side session refresh), FE-25 (BFF), FE-63 (analytics), PG-BIL-CHECKOUT-04 (`formatZar`) |
| Old app reference | `43f9faa:web/src/app/welcome/page.tsx` (verify, then refresh the session, webhook as backstop, auto-forward after 3.5 s), `43f9faa:api/Controllers/PaymentsController.cs` (`POST /api/payments/verify`: returns `unknown`, `pending` or `success`, owner check, supersedes the buyer's other own plans, sends the branded receipt, accrues affiliate commission idempotently on the reference) |
| Status | Not started (0 of 39 tasks) |

## Purpose

Paystack sends the payer back here after hosted checkout. The page asks our API to verify the transaction (`POST /billing/checkout/verify`), waits calmly while the result settles, refreshes the session so paid features appear straight away, and then sends the person on. It must never charge again, never show a false failure because a webhook is slow, and never leave someone unsure whether they paid.

How verification works: the webhook (`BE-BIL-11`) writes each Paystack event to the `billing.paystack_events` inbox with a unique event id, and the inbox processor (`BE-BIL-12`) applies it exactly once. Verify on return (`BE-BIL-10`) asks Paystack directly for the transaction by reference and applies the same idempotent transition, so whichever arrives first wins and the second is a no-op. The page only reads results; it starts no payment.

## User stories

- As someone who just paid, I want to see clearly that it worked and what I now have, so that I can get back to studying.
- As someone whose card was declined, I want to know nothing was taken and how to try again, so that I am not worried.
- As someone whose bank is slow to confirm, I want the page to tell me it is still confirming and that I can leave safely, so that I do not pay twice.
- As a parent, I want to land on my dashboard with my children covered, so that I can see the result of what I bought.

## Layout

### Mobile (360px)

Centred single column, `px-4`, `min-h-[60dvh]`, no app chrome changes (inside the normal app shell):

1. Status icon in a 56px circle: Lucide `Loader2` (spinning, still under reduced motion it becomes a static `Clock`), `CircleCheck` on a forest surface, `CircleAlert` on a terracotta surface, `Clock` on a neutral surface. Icons are `aria-hidden`; the heading carries the meaning.
2. `h1` status heading (see States).
3. One or two lines of body copy.
4. Summary card (success only): plan name, amount paid with `formatZar`, "Includes VAT R19.43", next renewal date, and for parents "Covers 2 children".
5. Primary button full width.
6. Secondary link.
7. Muted reference line: "Reference: T1234567890" with a copy button (useful when contacting support).

A single `aria-live="polite"` region wraps heading and body so status changes are announced once each.

### Desktop (1440px)

Same content in a centred card `max-w-md` within `PageShell`; summary card and buttons sit side by side only for the two buttons (`sm:flex-row`). Nothing else moves.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/billing/return/page.tsx` | server | Reads `reference` or `trxref`; validates format; renders the status view with the reference |
| Loading | `web/src/app/(app)/billing/return/loading.tsx` | server | Renders the verifying state (same markup as the client initial state, no layout shift) |
| Error | `web/src/app/(app)/billing/return/error.tsx` | client | `PageState` with retry; copy says nothing was charged twice |
| Not found | `web/src/app/(app)/billing/return/not-found.tsx` | server | Missing or malformed reference |
| Welcome redirect | `web/src/app/(app)/welcome/page.tsx` | server | Permanent redirect to `/billing/return` keeping `reference` and `trxref`; without a reference, redirect to the role home |
| Return status view | `web/src/features/billing/components/return-status.tsx` | client | State machine: verifying, succeeded, pending_webhook, failed, abandoned, error |
| Verify poller | `web/src/features/billing/hooks/use-verify-payment.ts` | client | Calls the generated verify mutation through the BFF with backoff (1 s, 2 s, 4 s, 8 s, 15 s), stops at 30 s total, then switches to `pending_webhook` and polls `GET /billing/subscription` every 15 s for 5 more minutes |
| Session refresher | `web/src/features/billing/server/refresh-entitlements.ts` | server action | Forces Auth.js session update from `/me` so entitlements in the cookie match the new plan |
| Purchase summary | `web/src/features/billing/components/purchase-summary.tsx` | client | Plan, amount, VAT, renewal, children covered |
| Reference copy | `web/src/features/billing/components/reference-copy.tsx` | client | Copy to clipboard with toast "Reference copied" |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/billing/subscription` (BE-BIL-14) | GET (client, through BFF) | `status`, `planCode`, `planName`, `currentPeriodEnd`, `childrenCovered`, `lastPayment` (`reference`, `status`, `amountCents`, `vatIncludedCents`) | none; TanStack `refetchInterval` only in `pending_webhook` |
| `/me` (BE-IDN-28) | GET (server action) | `entitlements`, `permissions` | session |

### Mutations

| Endpoint (BE ID) | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/billing/checkout/verify` (BE-BIL-10) via `/api/bff` | POST | `reference` | `outcome` (succeeded, failed, abandoned, pending), `failureReason` (declined, insufficient_funds, expired_card, bank_error, unknown), `planCode`, `amountCents`, `vatIncludedCents`, `currentPeriodEnd`, `childrenCovered` | Idempotent by reference: calling it ten times changes nothing extra. Only reads Paystack and applies the same transition as the inbox; never initialises or charges. 404 when the reference does not belong to the signed-in user |

Additions from the 43f9faa review:

- Verify can also report that Paystack has no record of the reference (old `status: unknown`). The page maps it to `outcome = abandoned` copy when the reference is older than 1 hour, otherwise keeps verifying (the transaction may not be indexed yet). (PG-BIL-RETURN-14)
- Verify response adds `supersededPlanName` (nullable) and `receiptEmailMasked` (the billing email Paystack holds, which can differ from the sign-in email). (PG-BIL-RETURN-15, PG-BIL-RETURN-16)

## States

| State | Trigger | Heading | Body | Primary | Secondary |
|---|---|---|---|---|---|
| Verifying | First 30 s while verify returns `pending` or is in flight | "Confirming your payment" | "This usually takes a few seconds. Please keep this page open." | none | none |
| Succeeded | `outcome = succeeded` | "You are all set" | "Your Student Pro plan is active. A receipt is on its way to your email." Parent: "Your Parent plan is active for 2 children. A receipt is on its way to your email." | "Go to your dashboard" (student `/dashboard`, parent `/parent`) | "View billing" |
| Still confirming | 30 s passed, still `pending` | "Still confirming with your bank" | "Your payment is being processed. You can leave this page; we will email you and switch your plan on as soon as it is confirmed. Please do not pay again." | "Go to your dashboard" | "Check again" (one more verify call) |
| Declined | `outcome = failed`, reason declined, insufficient_funds or expired_card | "Your payment did not go through" | "Your bank declined it, so no money was taken. You can try again with the same card or a different one." (insufficient funds: "There were not enough funds, so no money was taken.") (expired card: "The card has expired, so no money was taken.") | "Try again" (back to checkout with the same plan and interval) | "Choose a different plan" |
| Bank error | `failed`, reason bank_error or unknown | "We could not complete your payment" | "No money was taken. This is usually a short problem with the bank. Try again in a few minutes." | "Try again" | "Contact support" |
| Abandoned | `outcome = abandoned` (closed Paystack page) | "Payment not finished" | "You left before paying, so nothing was charged. Pick up where you left off whenever you are ready." | "Back to checkout" | "Not now" (role home) |
| Already processed | Verify returns succeeded for a reference already applied (refresh, back button) | Same as Succeeded | Same as Succeeded | Same | Same |
| Wrong owner | 404 from verify | "We could not find this payment" | "It may belong to another account. If you were charged, contact support with the reference below." | "Contact support" | "Go to your dashboard" |
| Missing reference | No `reference` or `trxref` | `not-found.tsx`: "Nothing to confirm" | "This page is for returning from Paystack. Your billing page shows your plan and payments." | "View billing" | none |
| Network error | Verify throws after retries within the 30 s window | "We could not check your payment" | "Check your connection. If you paid, your plan will switch on by itself and we will email you. Please do not pay again." | "Check again" | "Go to your dashboard" |

## Stage variants

- Copy is the same for high school and university students; the plan name comes from the API.
- Parent success names the number of children covered and links to `/parent`; it never lists marks or wellbeing data.

## Interactions and edge cases

- Webhook delay: verify answers from Paystack directly, so most returns succeed within seconds even if the webhook is late. If Paystack itself still reports pending, the page moves to "Still confirming" at 30 s and keeps polling the subscription quietly for 5 minutes; when it flips to active, the heading changes to "You are all set" and the session refreshes.
- Webhook first: if the inbox processor already activated the subscription, verify returns `succeeded` with no second transition.
- Refresh or back button: verify is idempotent by reference; the page shows the same final state; no charge, no second subscription, no duplicate receipt.
- Two tabs on the same return URL: both show success; the API applies one transition.
- Reference tampering: a reference from another user returns 404 and the wrong-owner state; no data about that payment is shown.
- Retry after decline: "Try again" opens `/billing/checkout` with the original plan, interval and children; checkout creates a new transaction (a declined Paystack reference cannot be reused), and the old reference stays failed.
- Session refresh fails: success state still shows; a toast "Your new features will appear in a moment" and a background retry of the server action; entitlements also refresh at the next token refresh (FE-23).
- Paystack test mode: test cards that simulate decline, insufficient funds and pending drive each state on staging.
- Reduced motion: the spinner is replaced by a static clock icon.
- The page never auto-redirects away from a failure or pending state. On success it does not auto-redirect either; the person chooses (no timers that steal focus).
- No auto-forward: the old page redirected to the dashboard after 3.5 s whether or not anything was confirmed. The rebuilt page waits for a final state and the person chooses where to go. (PG-BIL-RETURN-14)
- Supersede: when the payment replaces an older plan the buyer held for themselves (gift, seeded or the plan being upgraded), the success copy says so; plans the buyer pays for on behalf of children are never superseded. (PG-BIL-RETURN-15)
- Receipt: the API sends a branded receipt from both verify and webhook paths, once per reference (BE-BIL-21). The page names the masked address it went to. (PG-BIL-RETURN-16)
- Verify and webhook may both accrue affiliate commission for the same reference; BE-AFF-08 is idempotent on the reference, so the page can call verify as often as its backoff needs.

## Copy

- "Confirming your payment" / "This usually takes a few seconds. Please keep this page open."
- "You are all set" / "Your Student Pro plan is active. A receipt is on its way to your email."
- "Still confirming with your bank" / "You can leave this page; we will email you and switch your plan on as soon as it is confirmed. Please do not pay again."
- "Your payment did not go through" / "Your bank declined it, so no money was taken."
- "Payment not finished" / "You left before paying, so nothing was charged."
- "We could not find this payment"
- "Reference: T1234567890", "Copy reference", toast "Reference copied"
- Summary labels: "Plan", "Paid today", "Includes VAT", "Renews on", "Children covered"

- Superseded line: "Your previous {planName} plan has ended and will not renew."
- Receipt line: "We sent your receipt to {receiptEmailMasked}."
- Unknown reference (young): keeps "Confirming your payment"; (older than 1 hour): uses the "Payment not finished" copy.

## Acceptance criteria

- AC-01 Given a successful Paystack payment, when the payer returns with `reference`, then one verify call returns `succeeded`, the success state shows plan, amount and VAT from the response, and the session entitlements include the new plan's features before the person leaves the page.
- AC-02 Given Paystack reports pending for 40 s, when 30 s pass, then the page shows "Still confirming with your bank", keeps polling the subscription, and switches to success when the status becomes active.
- AC-03 Given the webhook already activated the subscription, when the payer returns, then verify returns `succeeded` and the API records no second transition (asserted by the integration test BE-BIL-25 and a Playwright API mock).
- AC-04 Given the payer refreshes the success page five times, when the API is inspected, then there is one payment, one subscription change and one receipt email.
- AC-05 Given a declined card, when verify returns `failed` with reason `declined`, then the declined copy shows, it states no money was taken, and "Try again" opens checkout with the same plan and interval.
- AC-06 Given a reference from another account, when verify returns 404, then the wrong-owner state shows and no payment details render.
- AC-07 Given `/welcome?reference=X`, when it loads, then it redirects to `/billing/return?reference=X`.
- AC-08 Given no reference, when the route loads, then the not-found state "Nothing to confirm" shows.
- AC-09 Given a screen reader, when the state changes from verifying to success, then the new heading is announced once.
- AC-10 Given verify returns that Paystack has no record of a reference created 2 hours ago, when the page settles, then the "Payment not finished" state shows with "Back to checkout".
- AC-11 Given a payment that replaced a gift plan, when success shows, then the line "Your previous {planName} plan has ended and will not renew." is present.
- AC-12 Given any final state, when 10 s pass without interaction, then the page has not navigated away.

## Production readiness

### Security
- [ ] Verify runs through the BFF; the API checks the reference belongs to the session user and returns 404 otherwise (no enumeration of other people's payments). (PG-BIL-RETURN-Q16)
- [ ] The reference is validated against Paystack's format server-side before any call; the page never trusts query params for amount or plan. (PG-BIL-RETURN-04)
- [ ] The reference appears in the URL by Paystack's design; it is not PII, is never logged with the user's email, and is redacted from analytics URLs. (PG-BIL-RETURN-Q16)

### Privacy and POPIA
- [ ] Success summary shows plan and amount only; parent view shows a count of children, not names, to keep the page minimal on shared screens. (PG-BIL-RETURN-07)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip, CLS under 0.1 (loading and client initial state share markup). (PG-BIL-RETURN-Q17)
- [ ] No cached data: every read is fresh and per user. (PG-BIL-RETURN-Q17)

### Resilience
- [ ] Backoff schedule 1, 2, 4, 8, 15 s; cap 30 s; then the still-confirming state with 15 s subscription polling for 5 minutes; then stop polling and leave the copy in place. (PG-BIL-RETURN-05, PG-BIL-RETURN-06)
- [ ] Idempotent verify by reference; no action on this page can start a charge. (PG-BIL-RETURN-Q18)
- [ ] Paystack outage during verify: the network-error state tells the payer not to pay again; the webhook and nightly reconciliation (BE-BIL-22) settle it later. (PG-BIL-RETURN-08)

### Observability
- [ ] Events: `billing_return_verifying`, `billing_return_succeeded` (plan code, seconds to settle), `billing_return_failed` (reason), `billing_return_pending_webhook`, `billing_return_abandoned`, `billing_return_retry_clicked`. (PG-BIL-RETURN-Q19)
- [ ] Sentry captures verify failures with tag `{ page: "PG-BIL-RETURN" }` and the reference as a non-PII tag; traces propagate from BFF to API to the Paystack verify call. (PG-BIL-RETURN-Q19)

### Accessibility
- [ ] WCAG 2.2 AA: one live region, no auto-redirect timers, focus moves to the heading on final state, spinner replaced under reduced motion. (PG-BIL-RETURN-Q20)

### Rollout
- [ ] Behind `flags.billing` with checkout; `/welcome` redirect ships in the same release so old Paystack callback URLs keep working; rollback restores the flag and keeps the redirect. (PG-BIL-RETURN-Q21)

### Monitoring and alerts
- [ ] Alert when verify failures (5xx or network) exceed 2% over 15 minutes, when more than 10% of returns reach `pending_webhook`, or when median seconds to settle exceeds 20 s for an hour; reconciliation drift is alerted by BE-BIL-22. (PG-BIL-RETURN-Q22)

## Build tasks

- [ ] **PG-BIL-RETURN-01** Verifying state, success, failure with retry (see -05 to -10 for the split)
- [ ] **PG-BIL-RETURN-02** Session entitlements refreshed: server action re-reads `/me` and updates the Auth.js session
- [ ] **PG-BIL-RETURN-03** Redirect from `/welcome` keeping `reference` and `trxref`
- [ ] **PG-BIL-RETURN-04** Route files, reference parsing (`reference` or `trxref`) and server-side format validation
- [ ] **PG-BIL-RETURN-05** `use-verify-payment` hook: verify through the BFF with the backoff schedule and a 30 s cap
- [ ] **PG-BIL-RETURN-06** Still-confirming state and subscription polling for 5 minutes, flipping to success when active
- [ ] **PG-BIL-RETURN-07** Success state with purchase summary (plan, paid, VAT, renews on, children covered)
- [ ] **PG-BIL-RETURN-08** Failure states: declined, insufficient funds, expired card, bank error, network error
- [ ] **PG-BIL-RETURN-09** Abandoned and wrong-owner states
- [ ] **PG-BIL-RETURN-10** "Try again" builds the checkout URL from the original plan, interval and children
- [ ] **PG-BIL-RETURN-11** Reference line with copy to clipboard
- [ ] **PG-BIL-RETURN-12** Live region, focus to heading on final state, reduced-motion icon swap
- [ ] **PG-BIL-RETURN-13** Background retry of the entitlement refresh with the "features will appear in a moment" toast
- [ ] **PG-BIL-RETURN-14** Map verify `unknown` by reference age (keep verifying, or abandoned after 1 hour); remove any timed auto-forward
- [ ] **PG-BIL-RETURN-15** Superseded-plan line on success from `supersededPlanName`
- [ ] **PG-BIL-RETURN-16** Receipt line with the masked billing email from `receiptEmailMasked`

## Quality tasks

- [ ] **PG-BIL-RETURN-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (verifying markup), `error.tsx` (retry via `PageState`), `not-found.tsx` for a missing reference
- [ ] **PG-BIL-RETURN-Q02** Server reads (session refresh) in `src/features/billing/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-BIL-RETURN-Q03** Verify mutation through `/api/bff` with the generated TanStack hook; pending state is the verifying state
- [ ] **PG-BIL-RETURN-Q04** Empty state ("Nothing to confirm") with one clear next action
- [ ] **PG-BIL-RETURN-Q05** Error state copy: what went wrong, that no money was taken twice, and how to fix it
- [ ] **PG-BIL-RETURN-Q06** Forbidden state for admin; no upgrade state
- [ ] **PG-BIL-RETURN-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-BIL-RETURN-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-BIL-RETURN-Q09** Layout at 1440px
- [ ] **PG-BIL-RETURN-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-BIL-RETURN-Q11** Copy review: no emojis, no em or en dashes, plain, calm and specific
- [ ] **PG-BIL-RETURN-Q12** axe: zero violations in light and dark
- [ ] **PG-BIL-RETURN-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-BIL-RETURN-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering success, still confirming, declined and error states
- [ ] **PG-BIL-RETURN-Q15** `generateMetadata` title "Confirming payment"; no nav entry
- [ ] **PG-BIL-RETURN-Q16** Security review: ownership 404, no enumeration, reference redacted from analytics and logs
- [ ] **PG-BIL-RETURN-Q17** Performance: Lighthouse CI mobile budget; zero CLS between loading and client state
- [ ] **PG-BIL-RETURN-Q18** Idempotency test: ten verify calls and a webhook in any order produce one transition (Playwright with API mock plus link to BE-BIL-25)
- [ ] **PG-BIL-RETURN-Q19** Observability: return events and Sentry tags wired; trace from return page to Paystack verify visible in Grafana on staging
- [ ] **PG-BIL-RETURN-Q20** WCAG 2.2 AA pass: live region announcements, no timed redirects, reduced motion
- [ ] **PG-BIL-RETURN-Q21** Rollout: shipped with `flags.billing`, `/welcome` redirect verified against the old callback URL
- [ ] **PG-BIL-RETURN-Q22** Monitoring: alerts for verify failure rate, pending share and time to settle
- [ ] **PG-BIL-RETURN-Q23** Exactly-once check across paths: verify called 10 times plus the webhook activates once, sends one receipt and accrues one commission (contract test with BE-BIL-25 and BE-AFF-16 fixtures)

## Tests

### Unit (Vitest)
- `use-verify-payment.test.ts`: backoff timings with fake timers; stops at 30 s; switches to subscription polling; stops polling after 5 minutes; stops on unmount.
- `return-status.test.tsx`: each outcome and reason renders its copy; failure copy always states no money was taken.
- `try-again-url.test.ts`: rebuilds checkout URL from plan, interval and children.

### Playwright (`web/tests/e2e/billing/checkout-return.spec.ts`)
- successful payment shows you are all set and unlocks tutor nav item
- slow confirmation shows still confirming then succeeds
- webhook arrived first shows success with one transition
- refresh five times keeps one payment
- declined card shows no money taken and try again keeps plan
- abandoned checkout shows payment not finished
- reference from another account shows not found copy
- welcome redirect keeps reference
- missing reference shows nothing to confirm
- axe clean light and dark at 360 and 1440
- Unit `map-verify-outcome.test.ts`: `unknown` young keeps verifying, `unknown` old maps to abandoned.
- Playwright `success names superseded plan`, `receipt address is masked`, `page never redirects on a timer`.

## Open questions

- Does Paystack ever return `abandoned` on the callback, or does the payer simply not come back? If the latter, the abandoned state is reached only from verify on a stale reference.
- How long should the still-confirming polling run? 5 minutes is proposed; EFT may settle much later, which the email then covers.
- Should success auto-redirect after a delay as the old `/welcome` did? Proposed no, for accessibility.
- Is 1 hour the right age after which an unknown reference counts as abandoned?
