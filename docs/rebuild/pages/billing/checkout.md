# Checkout

| | |
|---|---|
| ID | `PG-BIL-CHECKOUT` |
| Route | `/billing/checkout?plan=<planCode>&interval=<monthly or annual>` |
| Phase | 6 |
| Roles | student, parent |
| Stages | high school, university (student plans); any (parent plans) |
| Entitlement | free (the page sells entitlements; it is never gated by one) |
| Depends on | BE-BIL-08, BE-BIL-09, BE-BIL-14, BE-FAM-06 (parent seat preselection), BE-IDN-28 (`/me` entitlements), BE-IDN-38 (verified email), FE-25 (BFF), FE-63 (analytics), UI-07 (ResponsiveDialog), proposed permission `billing.manage` (already used in `nav-config.ts`, not yet in `Permissions.cs`) |
| Old app reference | `43f9faa:web/src/components/billing/BillingManager.tsx` (plan cards, checkout start, `TRACK_PLANS` per audience), `43f9faa:web/src/app/welcome/page.tsx` (checkout start after an OAuth sign-up that chose a paid plan), `43f9faa:api/Controllers/PaymentsController.cs` (`POST /api/payments/checkout`: plan and interval validation, referral code in transaction metadata, 503 when payments are not configured) |
| Status | Not started (0 of 43 tasks) |

## Purpose

Confirm exactly what the person is about to pay for (plan, billing interval, number of children for a parent plan, total in rand with the VAT included), then hand them to Paystack's hosted checkout. Our page never sees, asks for or stores card details. It is the only place a new subscription starts; changing an existing subscription happens on Billing management (`PG-BIL-MANAGE`).

## User stories

- As a student on the free plan, I want to see the price, what I get and the VAT before I pay, so that nothing on my bank statement surprises me.
- As a parent with two linked children, I want the checkout to suggest the two-child plan and let me change the number of children, so that I pay for the children I actually cover.
- As a parent, I want to see which children a plan will cover before I pay, so that I know who gets the paid features.
- As anyone, I want a clear "Pay with Paystack" step and to know I can pay by card or instant EFT there, so that I trust where my money goes.
- As someone who already has a paid plan, I want to be sent to manage my plan instead of starting a second subscription, so that I am never charged twice.

## Layout

### Mobile (360px)

Single column, `px-4`, ordered top to bottom:

1. `PageHeader`: title "Checkout", description "Check your plan, then pay securely with Paystack." In non-prod a `Badge` "Test mode" sits beside the title.
2. Plan summary card: plan name, one-line description, interval toggle (Monthly or Annual, segmented control, only if the plan offers both), up to five included features as a list with Lucide `Check` icons (`aria-hidden`).
3. Parent only: "Children covered" card. A stepper (minus, count, plus; 44px buttons) from 1 to 4, a sentence "Covers 2 children", and the list of linked children with a checkbox each, preselected up to the count. Unlinked slots read "Open slot: link a child later".
4. Totals card: line items "Plan price", "Includes VAT (15%)" and "Total today", each right aligned with `tabular-nums`. Under the total: "Then R149 every month until you cancel." For an annual plan: "Then R1 490 every year until you cancel."
5. Consent line: a checkbox "I agree to the Terms and that this renews automatically until I cancel." with links to `/terms` and `/privacy`.
6. Primary button full width "Pay R149 with Paystack" (amount mirrors the total). Under it, muted text with a Lucide `Lock` icon: "You pay on Paystack's secure page. We never see your card."
7. Secondary link "Back to plans" to `/pricing`.

Sticky footer is not used: the pay button stays in flow so it is never covered by the mobile keyboard or bottom navigation (WCAG 2.4.11).

### Desktop (1440px)

Inside `PageShell` at `max-w-5xl`: a two-column grid (`lg:grid-cols-[1fr_380px]`). Left column holds the plan summary and, for parents, the children card. Right column holds the totals card, consent and pay button, sticky at `top-24` so the total stays visible while the left column scrolls. Header spans both columns.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/billing/checkout/page.tsx` | server | Reads `searchParams`, session, loads plans and subscription, redirects when needed |
| Loading | `web/src/app/(app)/billing/checkout/loading.tsx` | server | `PageLoading cards={2}` |
| Error | `web/src/app/(app)/billing/checkout/error.tsx` | client | `PageState` with retry, Sentry report |
| Not found | `web/src/app/(app)/billing/checkout/not-found.tsx` | server | Unknown or retired plan code |
| Checkout view | `web/src/features/billing/components/checkout-view.tsx` | server | Composes the cards; passes plain props to client leaves |
| Plan summary | `web/src/features/billing/components/plan-summary-card.tsx` | server | Name, description, features |
| Interval toggle | `web/src/features/billing/components/interval-toggle.tsx` | client | Updates `interval` in the URL with `router.replace` (no history spam) |
| Children covered | `web/src/features/billing/components/seat-picker.tsx` | client | Stepper plus child checkboxes; maps count to `parent`, `parent.2`, `parent.3`, `parent.4` |
| Totals | `web/src/features/billing/components/checkout-totals.tsx` | client | Recomputes on interval or seat change from plan data (no extra request) |
| Pay form | `web/src/features/billing/components/checkout-form.tsx` | client | `useZodForm` with the generated checkout request schema; pending state; idempotency key |
| Test mode badge | `web/src/features/billing/components/test-mode-badge.tsx` | server | Shown when the API reports `paystackMode = test` |
| Money formatter | `web/src/lib/format/money.ts` | shared | `formatZar(cents, { showCents })`; created by this page (PG-BIL-CHECKOUT-04) |
| VAT helper | `web/src/features/billing/lib/vat.ts` | shared | `vatIncluded(totalCents, rateBps)` for display only; the API amount is the source of truth |
| Loaders | `web/src/features/billing/server/get-plans.ts`, `get-subscription.ts` | server | Plans use `"use cache"` with tag `billing:plans`; subscription is per user, request memoised only |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/billing/plans` (BE-BIL-08) | GET | `code`, `name`, `description`, `audience` (student or parent), `childrenCovered`, `prices[]` (`interval`, `amountCents`, `currency`, `vatRateBps`, `vatIncludedCents`), `features[]` (`key`, `label`), `isActive` | `"use cache"`, `cacheLife` 5 min, tag `billing:plans` |
| `/billing/subscription` (BE-BIL-14) | GET | `status` (trialing, active, past_due, cancelled, none), `planCode`, `currentPeriodEnd` | none shared; React `cache()` per request |
| `/family/children` (BE-FAM-06), parent only | GET | `linkId`, `studentId`, `displayName`, `stage`, `linkStatus` | none shared |
| `/me` (BE-IDN-28) | GET (session) | `role`, `emailVerified`, `entitlements`, `paystackMode` (proposed field, or a separate config read) | session |

### Mutations

| Endpoint (BE ID) | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/billing/checkout` (BE-BIL-09) via `/api/bff` | POST | `planCode`, `interval`, `coveredStudentIds[]` (parent), `idempotencyKey` (uuid made once per page view), `consentVersion` | `authorizationUrl`, `reference`, `amountCents`, `currency` | Server builds `callback_url` as `/billing/return?reference=...`; client never supplies a URL. Same idempotency key returns the same `reference` and `authorizationUrl` (no second Paystack transaction) |

Errors mapped from ProblemDetails: `409 subscription_exists`, `422 plan_unavailable`, `422 seats_exceed_plan`, `403 email_unverified`, `503 payment_provider_unavailable`, `429`.

Additions from the 43f9faa review:

- The checkout request also carries `referralCode` (optional, opaque, at most 32 characters) read server-side from the affiliate referral cookie set by PG-MKT-AFF-03. The API writes it into the Paystack transaction metadata so commission accrues even if attribution was never claimed (old `AddReferralMetadata`). (PG-BIL-CHECKOUT-17)
- `GET /billing/subscription` (BE-BIL-14) is read on load for `managedByOther` and for a superseded plan (`source`: `paystack`, `gift`, `migrated`), see Interactions. (PG-BIL-CHECKOUT-19, PG-BIL-CHECKOUT-20)

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Route streaming | Skeleton only; screen reader "Loading" | none |
| Populated | Plan valid, no paid subscription | As in Layout | Pay button |
| No plan chosen | `plan` param missing | Title "Choose a plan first". Body "Pick the plan that suits you, then come back here to pay." | Button "See plans" to `/pricing` |
| Unknown plan | `plan` not found or `isActive` false | Title "That plan is not available". Body "It may have been renamed or retired. The current plans are on the pricing page." | Button "See plans" |
| Free plan chosen | `plan=free` | Redirect to `/dashboard` (student) or `/parent` (parent); no page shown | none |
| Already subscribed | `status` is trialing, active or past_due | Redirect to the role's billing page with a toast "You already have a plan. Change it here." | none |
| Wrong audience | Student opens a parent plan or parent opens a student plan | Title "This plan is for parents" (or "for students"). Body "Plans are set up per account type. Here are the plans for your account." | Button "See your plans" |
| Email not verified | `emailVerified` false | Inline alert above the pay button: "Verify your email before you pay, so we can send your receipts." Pay disabled | Link "Resend verification email" |
| Consent missing | Pay pressed without the checkbox | Field error: "Tick the box to agree to the Terms before you pay." | Focus moves to checkbox |
| Starting payment | Mutation pending | Button reads "Opening Paystack" with spinner, disabled; whole form `aria-busy` | none |
| Provider down | `503` | Alert: "Paystack is not responding right now. Nothing was charged. Try again in a few minutes." | Button "Try again" (same idempotency key) |
| Rate limited | `429` | Alert: "Too many attempts. Wait a minute, then try again." | Retry enabled after `Retry-After` |
| Seats exceed plan | `422 seats_exceed_plan` | Alert: "You picked more children than this plan covers. Increase the number of children or untick a child." | none |
| Page error | Loader throws | `PageState` title "We could not load checkout", body "Check your connection and try again. Nothing has been charged." | "Try again" |
| Forbidden | Admin role or no `billing.manage` | `PageForbidden` title "Billing is not available on this account" | Link to home for the role |

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Replacing a gift or migrated plan | own active plan with `source` not `paystack` | "Your current {planName} plan ends when this payment goes through. Nothing else changes." | none |
| Covered by a parent | `managedByOther` true | Title "Your plan is paid for by your parent or guardian". Body "You already have {planName}. Changes to it happen on their account." | "Go to your dashboard" |

## Stage variants

- Student plans read the same for high school and university; feature labels come from the API. The page never shows Grade, APS, module or GPA wording.
- Parent plans: children list shows each child's name and a neutral stage label ("High school" or "University or college") so a mixed-stage family can see who is covered. No marks or wellbeing data appear on this page.
- A child account without a stage set shows "Stage not set yet".

## Interactions and edge cases

- Double click on pay: the button disables on first press; the idempotency key means even two requests yield one Paystack transaction.
- Back button from Paystack to checkout: the page loads fresh, generates a new idempotency key only when the plan, interval or seats changed; otherwise the stored key in `sessionStorage` (wrapped in try/catch) reuses the open transaction.
- Interval switch updates the URL with `router.replace`, so a shared link opens the same choice.
- Parent seat count above linked children: allowed; open slots are listed. Below linked children: the parent must untick children until the ticked count equals the seat count; pay stays disabled with "Untick 1 child to match the plan" until it matches.
- A child unlinks while checkout is open: the API rejects unknown `coveredStudentIds` with `422`; the page refreshes the list and shows "One of your children is no longer linked. Check who is covered."
- Plan price changes between page load and pay: the API returns the authoritative amount; if it differs from what was shown, the page shows "The price changed to R169. Check the total before you pay." and requires a second press.
- Test mode: in non-prod every Paystack call uses test keys; the badge and a line "Use a Paystack test card. No real money moves." are shown. Prod never shows the badge; a CI check asserts prod config uses live mode.
- Session expiry mid-page: the BFF returns 401; the page sends the person to `/login?next=/billing/checkout?...` keeping the plan params.
- Paystack opens in the same tab (`window.location.assign`), never a popup, so mobile browsers do not block it.
- Referral attribution is not gated on marketing consent: it is a commercial term owed to an affiliate, carries nothing about the buyer and is a short code the affiliate handed out (rule carried from 43f9faa). There is no marketing measurement on checkout in v1 (no Meta pixel or CAPI, decision 8); custom `track()` events stay consent-gated and separate. (PG-BIL-CHECKOUT-17)
- Paid plan chosen at sign-up (including Google sign-up): the register flow (PG-AUTH-REG) passes `plan` and `interval` through onboarding and lands on `/billing/checkout?plan=...` instead of starting Paystack from `/welcome`. The session is read server-side, so the old client loop that polled for a token is not needed; with no session the page redirects to `/login?returnTo=` with the same query. (PG-BIL-CHECKOUT-18)
- Existing non-Paystack plan (a gift, seeded or migrated subscription with no card): checkout is allowed and the summary says it will be replaced when payment succeeds. A parent buying a plan for themselves never ends the plans that cover their children (the old verify path had to exclude coverage subscriptions explicitly). (PG-BIL-CHECKOUT-19)
- A student covered by a parent's plan (`managedByOther`) who opens checkout sees the covered state instead of the form, so a family is not charged twice. (PG-BIL-CHECKOUT-20)

## Copy

- Title: "Checkout"
- Description: "Check your plan, then pay securely with Paystack."
- Totals labels: "Plan price", "Includes VAT (15%)", "Total today"
- Renewal: "Then R149 every month until you cancel." / "Then R1 490 every year until you cancel."
- Children: "Children covered", "Covers 1 child", "Covers 2 children", "Open slot: link a child later"
- Consent: "I agree to the Terms and that this renews automatically until I cancel."
- Pay: "Pay R149 with Paystack"; pending "Opening Paystack"
- Trust line: "You pay on Paystack's secure page. We never see your card."
- Payment methods: "Card or instant EFT on Paystack."
- Test mode: "Test mode", "Use a Paystack test card. No real money moves."

## Acceptance criteria

- AC-01 Given a free student opens `/billing/checkout?plan=student.pro&interval=monthly`, when the page loads, then it shows the plan name, the monthly price as `R149`, the VAT included amount and the total, all matching `GET /billing/plans` to the cent.
- AC-02 Given the interval toggle, when the student picks Annual, then the URL changes to `interval=annual`, totals update without a network call, and the renewal line reads "every year".
- AC-03 Given a parent with two linked children, when the page loads for `plan=parent`, then the seat picker preselects 2, the plan shown is `parent.2`, and both children are ticked.
- AC-04 Given a parent sets the count to 1 with two children ticked, when they look at the pay button, then it is disabled and reads the mismatch hint until one child is unticked.
- AC-05 Given a valid form, when pay is pressed, then exactly one `POST /billing/checkout` is sent with an idempotency key and the browser navigates to the returned `authorizationUrl`.
- AC-06 Given pay is pressed twice quickly, when requests complete, then the API receives at most two calls with the same key and Paystack has one transaction.
- AC-07 Given the person already has an active subscription, when they open checkout, then they land on their billing page with the toast "You already have a plan. Change it here."
- AC-08 Given `POST /billing/checkout` returns 503, when the alert shows, then it says nothing was charged and "Try again" reuses the same idempotency key.
- AC-09 Given an unverified email, when the page loads, then pay is disabled and the verification alert shows.
- AC-10 Given a non-prod environment, when the page loads, then the "Test mode" badge shows; given prod, then it never shows.
- AC-11 Given any state, when the DOM is inspected, then no input accepts card numbers and no request from our origin carries card data.
- AC-12 Given an admin opens the route, when it renders, then the forbidden state shows and no checkout call is possible.
- AC-13 Given a referral cookie `ref=ABC123`, when the person starts checkout without marketing consent, then the checkout request carries `referralCode` `ABC123` and no `track()` event fires.
- AC-14 Given a student covered by a parent's plan, when they open `/billing/checkout?plan=student.pro`, then the covered state shows and no pay button exists.
- AC-15 Given a new Google sign-up that chose `parent.2`, when onboarding finishes, then they land on checkout with `parent.2` preselected.

## Production readiness

### Security
- [ ] Checkout is a BFF mutation (CSRF protected by the BFF's same-site cookie and origin check); the browser never holds an API token. (PG-BIL-CHECKOUT-Q16)
- [ ] The callback URL is built server-side from config, never from client input, so the return cannot be redirected off-site. (PG-BIL-CHECKOUT-Q16)
- [ ] No card fields exist on our pages; CSP `form-action` and `connect-src` allow only our origin and the BFF. (PG-BIL-CHECKOUT-Q17)
- [ ] Plan code, amount and covered children are validated server-side; client totals are display only. (PG-BIL-CHECKOUT-08)
- [ ] No PII in URLs: only `plan` and `interval` appear in the query string; child ids travel in the POST body. (PG-BIL-CHECKOUT-Q17)

### Privacy and POPIA
- [ ] Minors: a student under 18 sees "Ask a parent or guardian before you pay." above the consent line; the consent row records the terms version (BE-IDN-04). (PG-BIL-CHECKOUT-12)
- [ ] Data minimisation: the parent seat picker shows names and a stage label only. (PG-BIL-CHECKOUT-06)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip, CLS under 0.1. (PG-BIL-CHECKOUT-Q18)
- [ ] Plans read from `"use cache"` tag `billing:plans`; admin plan sync calls `revalidateTag("billing:plans")`. (PG-BIL-CHECKOUT-Q18)

### Resilience
- [ ] Idempotency key generated once per page view and reused on retry; double-click protection on the button. (PG-BIL-CHECKOUT-09)
- [ ] Paystack outage (503) shows the provider-down state; nothing is charged; retry uses the same key. (PG-BIL-CHECKOUT-10)
- [ ] Price drift between load and pay requires a second confirm. (PG-BIL-CHECKOUT-11)

### Observability
- [ ] Funnel events: `billing_checkout_viewed` (plan code, interval, audience), `billing_checkout_started`, `billing_redirected_to_paystack`, `billing_checkout_failed` (error code). No names or amounts tied to a person are sent to third parties. (PG-BIL-CHECKOUT-Q19)
- [ ] `error.tsx` reports to Sentry with tags `{ page: "PG-BIL-CHECKOUT", role }`; the BFF forwards `traceparent` so the web span links to the API trace and the Paystack initialise call. (PG-BIL-CHECKOUT-Q19)

### Accessibility
- [ ] WCAG 2.2 AA: stepper buttons labelled "Fewer children" and "More children" with the count in an `aria-live="polite"` region; totals update announced; focus never hidden behind the bottom nav (2.4.11). (PG-BIL-CHECKOUT-Q20)

### Rollout
- [ ] Route gated by `flags.billing`; when off, `/billing/checkout` shows "Paid plans open soon." and pricing CTAs hide. Rollback is flipping the flag; no data migration. (PG-BIL-CHECKOUT-Q21)
- [ ] Staged release: test mode on staging with real webhooks forwarded, then prod for internal accounts, then everyone. (PG-BIL-CHECKOUT-Q21)

### Monitoring and alerts
- [ ] Alert when checkout start failure rate (non-2xx on `POST /billing/checkout`) exceeds 5% over 15 minutes, or when `billing_checkout_started` to `billing_redirected_to_paystack` conversion drops below 90% for an hour. (PG-BIL-CHECKOUT-Q22)

## Build tasks

- [ ] **PG-BIL-CHECKOUT-01** Plan summary, ZAR total, VAT: plan summary card, totals card with "Plan price", "Includes VAT (15%)" and "Total today", renewal sentence
- [ ] **PG-BIL-CHECKOUT-02** Parent: seat count per child: stepper 1 to 4 mapped to `parent` to `parent.4`, with child checkboxes
- [ ] **PG-BIL-CHECKOUT-03** Redirect to Paystack: navigate to `authorizationUrl` in the same tab after a successful `POST /billing/checkout`
- [ ] **PG-BIL-CHECKOUT-04** Use the shared `formatZar` from `web/src/lib/format/money.ts` (owned by FE-81) for every amount on the page, `R1 234` and `R1 234.50`; extend FE-81 rather than adding a local formatter
- [ ] **PG-BIL-CHECKOUT-05** Route files and server loaders `get-plans.ts` (cached, tag `billing:plans`) and `get-subscription.ts` (request memoised)
- [ ] **PG-BIL-CHECKOUT-06** Seat picker preselection from `GET /family/children`, mismatch hint, open-slot rows
- [ ] **PG-BIL-CHECKOUT-07** Interval toggle writing `interval` to the URL with `router.replace`
- [ ] **PG-BIL-CHECKOUT-08** Checkout form: `useZodForm` with the generated schema, consent checkbox, pending state, ProblemDetails error mapping
- [ ] **PG-BIL-CHECKOUT-09** Idempotency key per page view (kept in `sessionStorage` with try/catch fallback) and double-click guard
- [ ] **PG-BIL-CHECKOUT-10** Provider-down, rate-limited and seats-exceed alerts with retry
- [ ] **PG-BIL-CHECKOUT-11** Price drift confirm: compare response `amountCents` with the shown total and ask for a second press
- [ ] **PG-BIL-CHECKOUT-12** Under-18 guidance line and terms version sent with the request
- [ ] **PG-BIL-CHECKOUT-13** Redirect rules: free plan, existing subscription, wrong audience, missing or unknown plan
- [ ] **PG-BIL-CHECKOUT-14** Test mode badge and test card line, driven by API config
- [ ] **PG-BIL-CHECKOUT-15** Email-not-verified block with resend link (BE-IDN-24)
- [ ] **PG-BIL-CHECKOUT-16** Desktop two-column layout with sticky totals column
- [ ] **PG-BIL-CHECKOUT-17** Referral attribution: read the referral cookie server-side and send `referralCode` with the checkout request, independent of marketing consent
- [ ] **PG-BIL-CHECKOUT-18** Paid-plan hand-off from sign-up: carry `plan` and `interval` through register and onboarding to checkout; server-side session check with `returnTo` fallback (replaces the old `/welcome` start-checkout path)
- [ ] **PG-BIL-CHECKOUT-19** Replacement line when the buyer holds a gift, seeded or migrated plan; children's coverage plans untouched
- [ ] **PG-BIL-CHECKOUT-20** Covered-by-parent state from `managedByOther`, replacing the form

## Quality tasks

- [ ] **PG-BIL-CHECKOUT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` for an unknown plan code
- [ ] **PG-BIL-CHECKOUT-Q02** Server loader in `src/features/billing/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-BIL-CHECKOUT-Q03** Client mutation through `/api/bff` with the generated TanStack hook; pending state on the pay button
- [ ] **PG-BIL-CHECKOUT-Q04** Empty state ("Choose a plan first") with one clear next action
- [ ] **PG-BIL-CHECKOUT-Q05** Error state copy: what went wrong, that nothing was charged, and how to fix it
- [ ] **PG-BIL-CHECKOUT-Q06** Forbidden state for admin or missing `billing.manage`; no upgrade state (page sells plans)
- [ ] **PG-BIL-CHECKOUT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students; stage labels only on parent seats)
- [ ] **PG-BIL-CHECKOUT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-BIL-CHECKOUT-Q09** Layout at 1440px
- [ ] **PG-BIL-CHECKOUT-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-BIL-CHECKOUT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-BIL-CHECKOUT-Q12** axe: zero violations in light and dark
- [ ] **PG-BIL-CHECKOUT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-BIL-CHECKOUT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-BIL-CHECKOUT-Q15** `generateMetadata` title "Checkout"; no nav entry (reached from pricing and billing)
- [ ] **PG-BIL-CHECKOUT-Q16** Security review: BFF CSRF check, server-built callback URL, server-side validation of plan, amount and children
- [ ] **PG-BIL-CHECKOUT-Q17** CSP check (`form-action`, `connect-src`) and a test that no card input or PII query param exists
- [ ] **PG-BIL-CHECKOUT-Q18** Performance: Lighthouse CI mobile budget (LCP, JS, CLS) and plans cache tag revalidation test
- [ ] **PG-BIL-CHECKOUT-Q19** Observability: funnel events wired and asserted in a Playwright network check; Sentry tags and trace propagation verified in staging
- [ ] **PG-BIL-CHECKOUT-Q20** WCAG 2.2 AA pass: stepper labels, live totals, focus not obscured, target size
- [ ] **PG-BIL-CHECKOUT-Q21** Rollout: `flags.billing` gate, closed state copy, rollback note in the PR
- [ ] **PG-BIL-CHECKOUT-Q22** Monitoring: Grafana alerts for checkout start failure rate and funnel drop, linked from the Paystack runbook
- [ ] **PG-BIL-CHECKOUT-Q23** Cross-module check with Affiliates: a referred checkout accrues one commission from verify plus webhook, and a parent's own purchase leaves seeded children's coverage active (integration test against the API fixture)

## Tests

### Unit (Vitest)
- `web/src/lib/format/money.test.ts`: formats 0, 14900, 123456, 123450 with and without cents; rejects non-integer cents.
- `web/src/features/billing/lib/vat.test.ts`: included VAT on 14900 at 1500 bps.
- `seat-picker.test.tsx`: count maps to plan code; mismatch hint; open slots.
- `checkout-form.test.tsx`: consent required; button disabled while pending; same idempotency key on retry; 503 and 422 messages.

### Playwright (`web/tests/e2e/billing/checkout.spec.ts`)
- student pays monthly student pro and lands on Paystack test page
- annual toggle updates totals and url
- parent with two children gets parent.2 preselected
- parent seat mismatch blocks pay
- double click creates one transaction (API mock counts calls)
- existing subscriber is redirected to billing
- paystack unavailable shows nothing charged and retry
- unverified email blocks pay
- unknown plan shows not available
- test mode badge visible on staging build
- axe clean light and dark at 360 and 1440
- Unit `checkout-request.test.ts`: referral code read from the cookie, trimmed to 32 characters, omitted when absent.
- Playwright `paid plan chosen at sign-up lands on checkout`, `covered student sees covered state`, `gift plan shows replacement line`.

## Open questions

- Does annual billing exist in v1, or monthly only? The old app supported both.
- Decided (12): `student.max` is not a v1 plan. Checkout accepts only active v1 plan codes (`student.pro`, parent tiers, monthly or annual); a `plan=student.max` link redirects to pricing with no checkout started.
- Decided (51): no trial on any plan; checkout always charges the first period today.
- `paystackMode` is not in `/me`; confirm where the page learns test versus live mode.
- `billing.manage` is used in `nav-config.ts` but not defined in `Permissions.cs`.
- Can a student under 18 pay at all, or must a parent pay for them (POPIA and card ownership)?
- Should a covered student ever be able to buy their own plan (for example after turning 18), and what happens to the parent's place then?
- Decided (3c, first touch): if a cookie code and an already claimed attribution differ, the claimed attribution wins and the metadata code is only a hint for a payer with no attribution, as in the old ledger. Whether that payment earns anything is the API's call under the 12-month cap (BE-AFF-80, BE-AFF-81).
