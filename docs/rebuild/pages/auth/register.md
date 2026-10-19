# Sign up

| | |
|---|---|
| ID | `PG-AUTH-REG` |
| Route | `/register` (query: `plan`, `billing`, `role`, `next`) |
| Phase | 2 (paid-plan checkout hand-off lights up in Phase 6) |
| Roles | anonymous visitor becoming student or parent (admin is never self-registerable, `Roles.SelfRegistrable` in `api/src/Aptiverse.SharedKernel/Authorization/Roles.cs`) |
| Stages | none at sign-up (stage is asked in onboarding, `PG-ONB-STU`) |
| Entitlement | free |
| Depends on | BE-IDN-20, BE-IDN-27, BE-IDN-04, BE-IDN-24, FE-20, FE-21, FE-22, FE-24, FE-27, SHL-02, UI-01, UI-02 (Checkbox), UI-03, UI-10; Phase 6: BE-BIL-08, BE-BIL-09, PG-MKT-PRICE (`getPlans`, `formatZar`), PG-BIL-CHECKOUT, PG-BIL-RETURN; PG-MKT-LEGAL-04 and PG-MKT-LEGAL-07 (`getLegalVersions()`) |
| Old app reference | `43f9faa:web/src/app/(auth)/register/page.tsx` (plan picker, referral field, invite email hand-off, unticked consent, analytics timing); `43f9faa:web/src/app/welcome/page.tsx` (Google paid sign-up starting checkout after the OAuth round trip); `43f9faa:web/src/components/auth/OAuthButtons.tsx`, `PasswordField.tsx`; checkout-failure lesson from `legacy/local-fixes:web/src/app/(auth)/register/page.tsx` (43f9faa does not have it) |
| Status | Not started. No `/register` route exists. The API side is partly built in `api/src/Modules/Identity` (password policy, consents, rate limits, tokens) but has no endpoints yet. |

## Purpose

Create an account with the least possible friction: role, name, email, password, consent. Nothing about school or university is asked here; onboarding does that. The page must tell the truth about the password rules (they come from the API policy), show the API's real reason when something is rejected, and never strand a person whose account was created but whose payment could not start.

## User stories

- As a Grade 11 learner on my phone, I want to sign up in under a minute so I can start practising tonight.
- As a parent, I want to sign up as a parent so I can link my child later and see how they are doing.
- As a visitor who picked Student Pro on the pricing page, I want sign-up to remember that plan and take me to payment afterwards.
- As someone whose password was rejected, I want to be told exactly why, in words I understand.
- As someone whose payment failed to start after sign-up, I want to keep my account and choose to retry or carry on free.
- As a student invited by a parent, I want to accept with my Google account. (Open Google sign-up is not in v1, decision 24: Google only signs in existing accounts and completes family invites.)

## Layout

### Mobile (360px)

1. Auth shell top bar: wordmark (links to `/`), 16px gutters (SHL-02).
2. `h1` "Create your account" and a one-line subhead that changes by step.
3. Step indicator "Step 1 of 2" as text plus a two-segment bar (`aria-hidden` bar, text is the accessible label). Hidden when the role is preset by the plan.
4. Step 1 (role): two full-width radio cards, Student then Parent, each 64px tall minimum. Below: "Already have an account? Log in".
5. Step 2 (details), top to bottom:
   - "Signing up as Student" row with a "Change" text button (hidden when the plan fixed the role).
   - Plan summary card when a valid paid plan is selected: plan name, price per period from the API.
   - "Continue with Google" button (full width, 44px), shown only when the URL carries a family invite token (decision 24).
   - Divider "or use your email" (only with the Google button).
   - Form-level error banner slot (`role="alert"`).
   - Fields: Your name, Email, Password (with show or hide toggle and the policy hint).
   - Consent checkbox with links to Terms and Privacy (open in the same tab, form state kept by the browser back cache and by a `sessionStorage` draft of name and email only, never the password).
   - Primary button "Create account" or "Continue to secure payment".
   - "Already have an account? Log in".
6. Checkout-failed panel replaces step 2 when it applies (see States).
7. Footer links: Privacy, Terms, Help.

### Desktop (1440px)

Two-column split from SHL-02: left 5/12 brand panel on the graphite surface (wordmark, one honest line "Study support for South African high school and university students.", no statistics, no testimonials, no illustrations of fake dashboards); right 7/12 column centring the form at `max-w-sm`. Same block order as mobile inside the form column. Role cards sit side by side at `sm:` and up.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(auth)/register/page.tsx` | server | Reads `searchParams`, the session (redirect when signed in, see edge cases), legal versions and (Phase 6, flag on) plans; renders `RegisterFlow` inside `Suspense`. `generateMetadata` title "Create your account". `robots: noindex` is not set: the page is indexable. |
| Loading | `web/src/app/(auth)/register/loading.tsx` | server | Skeleton of heading, two role cards and a button. |
| Error boundary | `web/src/app/(auth)/register/error.tsx` | client | `PageState` error with "Try again" calling `retry`; Sentry capture. |
| Auth shell | `web/src/app/(auth)/layout.tsx` | server | Exists as a placeholder; SHL-02 replaces it with the split layout. |
| Register flow | `web/src/features/auth/components/register-flow.tsx` | client | Holds step (`role`, `details`, `checkout-failed`), selected role, pending checkout. |
| Role choice | `web/src/features/auth/components/role-choice.tsx` | client | Real `fieldset` with `legend` and two `input type="radio"` cards; Lucide `GraduationCap`, `Users`. Selecting moves to step 2. |
| Register form | `web/src/features/auth/components/register-form.tsx` | client | `useZodForm` (from `web/src/components/common/form-fields.tsx`) with the generated `RegisterBody` zod schema; `TextField` for name and email. |
| Password field | `web/src/features/auth/components/password-field.tsx` | client | Input plus show or hide `button` (`aria-pressed`, label "Show password" or "Hide password"), `autocomplete` prop, hint from `password-policy.ts`. Reused by `PG-AUTH-RESET` and `PG-AUTH-LOGIN`. |
| Consent checkbox | `web/src/features/auth/components/consent-checkbox.tsx` | client | Checkbox from UI-02, required, links to `/terms` and `/privacy`. |
| Google button | `web/src/features/auth/components/google-button.tsx` | client | Owned by `PG-AUTH-LOGIN-11`; rendered here only on the invite path, passing `intent=register`, the invite token, the role and the plan through the round trip. |
| Plan summary | `web/src/features/auth/components/plan-summary.tsx` | server | Plan name and `formatZar(priceCents)` per period from `getPlans()`; renders nothing when no valid paid plan. |
| Checkout retry panel | `web/src/features/auth/components/checkout-retry-panel.tsx` | client | Warning alert with the API reason, "Try payment again", "Continue on the free plan". |
| Form banner | `web/src/features/auth/components/form-banner.tsx` | client | `role="alert"`, rose zone for errors, neutral for info; receives focus on show. Shared by all auth pages. |
| Register action | `web/src/features/auth/server/actions.ts` (`registerAction`) | server action | Calls BE-IDN-20 with the generated client, stores tokens in the Auth.js session (FE-22), returns a typed result (never tokens) to the client. |
| Checkout action | `web/src/features/billing/server/checkout-actions.ts` (`startCheckoutAction`) | server action | Owned by `PG-BIL-CHECKOUT`; returns the Paystack `authorizationUrl` or a typed failure with the API `detail`. |
| Password policy | `web/src/features/auth/lib/password-policy.ts` | shared | `PASSWORD_MIN_LENGTH` and `PASSWORD_MAX_LENGTH` read from the generated zod schema, plus `passwordHint` text built from them. |
| Problem mapper | `web/src/features/auth/lib/problem-messages.ts` | shared | `toFormErrors(problem)` maps ProblemDetails `errors` (field to messages) onto react-hook-form fields and `detail` onto the banner; fallback copy only when the API gave none. Shared by all auth pages. |
| Plan param parser | `web/src/features/auth/lib/plan-param.ts` | shared | `parsePlanParam(plan, billing, plans)` returns a validated `{ planCode, billing, role, paid }` or null. |
| Safe next | `web/src/features/auth/lib/safe-next.ts` | shared | Owned by `PG-AUTH-LOGIN-13`; same-origin relative paths only. |

## Data

| Endpoint | Method | Fields used | Cache |
|---|---|---|---|
| BE-BIL-08 `GET /billing/plans` (Phase 6, via `getPlans()` from PG-MKT-PRICE) | GET | `code`, `name`, `audience` (student or parent), `monthlyPriceCents`, `annualPriceCents`, `currency`, `isFree` | `"use cache"`, tag `billing:plans` |
| Legal versions via `getLegalVersions()` (PG-MKT-LEGAL-07; env vars until a public `GET /legal/versions` exists) | GET or build env | `termsVersion`, `privacyVersion` | static per deploy |

Mutations:

| Endpoint | Method | Request | Success | Failures handled |
|---|---|---|---|---|
| BE-IDN-20 `POST /auth/register` via `registerAction` | POST | `name` (max 120), `email` (max 256), `password` (10 to 128 chars, no composition rules, per `PasswordPolicy.cs`), `role` (`student` or `parent`), `termsVersion`, `privacyVersion` | 201 with access and refresh tokens (kept server-side in the session), user id, role | 400 validation (`errors` per field, `code` such as `identity.password_rejected`), 409 email already registered, 429 rate limited (`identity-register` policy, 10 per 10 minutes per IP by default), 5xx or network |
| BE-IDN-27 `POST /auth/google` via Auth.js Google provider (FE-21) | POST | Google ID token, `role`, `intent=register`, invite token, consent versions | session created | 400 invalid token, 403 `OAuthNoAccount` when there is no account and no valid invite (decision 24), 5xx |
| BE-BIL-09 `POST /billing/checkout` via `startCheckoutAction` (Phase 6) | POST | `planCode`, `billing`, callback `/billing/return` | `authorizationUrl` on `checkout.paystack.com` | any ProblemDetails, network; account is kept |

## States

| State | When | Copy |
|---|---|---|
| Loading | Route streaming | Skeleton only; screen reader text "Loading sign up". |
| Step 1 | No role yet | Subhead: "First, tell us who you are." Cards: "Student" / "At high school, or at university or college"; "Parent" / "Supporting my child with their studies". |
| Step 2, free | Role chosen, no paid plan | Subhead: "A few details and you are in." Button: "Create account". |
| Step 2, paid plan | Valid paid plan in the query | Subhead: "A few details, then a secure payment." Button: "Continue to secure payment" with Lucide `Lock`. |
| Submitting | Request in flight | Button text "Creating your account..." (paid: "Starting secure payment..."), disabled, `aria-busy`. |
| Field errors | Client zod or API 400 | Inline under each field, from the API message where given. Client defaults: name "Enter your name.", email "Enter a valid email address, like name@example.com.", password "Use at least 10 characters." or "Use 128 characters or fewer.", consent "Please agree to the Terms and Privacy Policy to continue." |
| Email taken | API 409 | Banner: "An account with this email already exists." Links: "Log in" and "Reset your password". |
| Rate limited | API 429 | Banner shows the API `detail`, else "Too many sign-up attempts from this connection. Please wait a few minutes and try again." |
| Server error | 5xx or network | Banner: "We could not create your account. This is on our side, not yours. Your details are still filled in, so try again in a moment." |
| Auto sign-in failed | Account created, session could not be set | Banner (info): "Your account is ready, but we could not sign you in automatically. Log in to continue." Button "Log in". |
| Checkout failed after sign-up | Paid plan, account created and signed in, `startCheckoutAction` failed | Panel: "Your account is ready, but we could not start the payment: {API detail}. You can try again now, or continue on the free plan and upgrade later from Billing." Buttons "Try payment again" and "Continue on the free plan". |
| Checkout retrying | Retry in flight | Button "Starting secure payment...", both buttons disabled. |
| Redirecting | Success | Status text "Account created. Taking you to the next step." (paid: "Account created. Taking you to secure payment.") |
| Paused | Sign-up flag off | `PageState`: "Sign up is paused for a short while" / "Please try again later. If you already have an account, you can still log in." Button "Log in". |
| Forbidden | Not applicable (anonymous page). Signed-in visitors are redirected, see edge cases. | |
| Empty, no evidence, upgrade | Not applicable to this page. | |

## Stage variants

None on this page. Copy says "high school, or university or college" only in the Student card description. No Grade, SBA, APS, course or GPA wording.

## Interactions and edge cases

- `?plan=` is validated against the live plans list (`parsePlanParam`). Unknown, free or malformed codes are ignored silently (plain free sign-up). The plan's `audience` sets the role and skips step 1; a conflicting `?role=` is ignored. `?billing=` accepts `monthly` or `annual`, default `monthly`.
- Before Phase 6 (plans flag off) `plan` and `billing` are ignored entirely.
- `?role=student` or `?role=parent` alone preselects the role and opens step 2 with "Change" available. Any other value is ignored.
- Signed-in visitor: without a `plan` they are redirected to their landing (`/onboarding` if a student has not completed it, else `/dashboard`, `/parent` or `/admin`). With a valid paid `plan` they see the checkout panel variant: "You are signed in. Continue to payment for {plan name}." with "Continue to secure payment" and "Not now".
- Double submit: the submit button disables on first click and the action ignores a second call while one is pending (`useTransition` state). Enter key in any field submits once.
- Account created but session failed: never show the form again with the same email (it would now 409). Show the auto sign-in failed state.
- Checkout failed: the account and session are kept. "Continue on the free plan" goes to `/onboarding`. "Try payment again" calls `startCheckoutAction` again; a second failure updates the reason text in place. Refreshing the page while signed in with the plan still in the query lands on the signed-in checkout variant, so the person is never stuck.
- Paystack redirect: only follow an `authorizationUrl` whose host is `checkout.paystack.com` (allowlist in `startCheckoutAction`); otherwise treat it as a checkout failure.
- Google sign-up (invite path only, decision 24): role must be chosen first (the Google button is in step 2), the role, plan and billing travel in the Auth.js `state` (server-side), not in a readable query string. Google errors come back as `?error=` codes mapped to copy (see Copy).
- Password managers: email `autocomplete="email"`, password `autocomplete="new-password"`, name `autocomplete="name"`; `inputmode="email"` on email.
- Pasting a password with leading or trailing spaces: kept as typed (the API does not trim); the hint does not mention spaces.
- Email is trimmed and lower-cased only for comparison by the API; the field shows what was typed.
- Consent links open in the same tab; the name and email draft is restored from `sessionStorage` on return (cleared on success). The password is never stored.
- Slow network: after 8 seconds pending, the button text becomes "Still working, please keep this page open..."; the request is not retried automatically (a retried register could double-create on a timeout race; the API's unique email makes it safe, but the person decides).
- `next` param: kept through to after onboarding only if `safeNextPath` accepts it.

- Student plan step (from 43f9faa): a student who arrives without `?plan=` sees a plan step after the role step (Free plus the paid student plans from `getPlans()`, live prices, monthly or annual toggle), so a student who came in on a referral link can still choose a paid plan. Parents skip it. Behind `paidSignup`. The old blurbs are not carried over: "Everything in Pro, plus the exam simulator" is red-listed in the claims ledger, and "Annual: 2 months free" was hardcoded; any saving shown is computed from the two API prices.
- Referral code (from 43f9faa; affiliates are in v1, decision 3): optional field "Referral code (optional)" with hint "Got a code from someone? Enter it so they get credit." When the `apt_ref` cookie (PG-MKT-AFF) is present the server prefills it and shows "You were referred by someone's link." with a "Remove" button, instead of a code the person never typed sitting in a field. First touch wins: a typed code never overwrites a stored link code. The code is claimed through BE-AFF-05 after sign-up and passed to checkout metadata on the paid path.
- Family invite hand-off (from 43f9faa, improved): the old app linked new invitees to `/register?email=...`, which put an email address in the URL. The rebuild links to `/register?invite=<token>`: the server reads the invite (proposed `GET /family/invites/{token}`), presets the role to Student, prefills the invited email server-side so the accept step's email match succeeds, and after sign-up lands on the accept page instead of onboarding. An invalid or expired invite token is ignored with an info banner "This invite link has expired. You can still create an account, and ask your parent to send a new invite."
- Google paid sign-up on the invite path (from 43f9faa `welcome/page.tsx`): after the Google round trip the server reads the pending plan from Auth.js state and starts checkout. If the session is not ready yet or checkout fails, the person sees the checkout-failed panel. The old behaviour of silently dropping them into the app as a free user is not carried over.
- Before hydration: the form posts to the server action, so a tap before JavaScript loads still submits. The submit button is never gated on client `isValid` (43f9faa lesson: gating on validity left the button dead on slow phones).

## Copy

- Title and `h1`: "Create your account"
- Password hint (built from the API policy constants, never typed by hand): "Use at least 10 characters. A short phrase you will remember works well."
- Consent: "I agree to the Terms and the Privacy Policy." (both links)
- Under the consent, small print: "We will send you an email to confirm your address."
- Google error copy by code: `OAuthNoAccount` "Google sign-up is only for invited accounts for now. Sign up with your email instead."; `OAuthAccountNotLinked` "That Google email already has an Aptiverse account with a password. Log in with your password instead."; `AccessDenied` "Google did not share your email with us, so we could not create your account. Try again, or sign up with your email."; any other code "We could not sign you up with Google. Please try again, or sign up with your email."
- Divider: "or use your email"
- Footer prompt: "Already have an account? Log in"

## Acceptance criteria

1. Given a visitor on `/register`, when they choose Student, then step 2 shows "Signing up as Student" and a "Change" button that returns to step 1.
2. Given the API password policy minimum of 10, when the page renders, then the hint reads "Use at least 10 characters..." and a test fails if the hint and the generated zod `min` differ.
3. Given a 9-character password, when the field blurs, then "Use at least 10 characters." shows and submit stays blocked; given 10 characters with no digit, symbol or capital, then the form submits.
4. Given the API returns 400 with `errors.password = ["Passwords must have at least one ..."]`, when the response arrives, then that exact message shows under the password field and nothing generic replaces it.
5. Given the API returns 409, when the response arrives, then the banner says "An account with this email already exists." with working Log in and Reset your password links, and focus moves to the banner.
6. Given the consent box is unticked, when Create account is pressed, then the consent error shows and no request is sent; given it is ticked, then the request carries `termsVersion` and `privacyVersion` equal to the versions shown on `/terms` and `/privacy`.
7. Given a successful free sign-up as a student, when the session is set, then the browser lands on `/onboarding`; as a parent, on `/onboarding` (parent variant).
8. Given `/register?plan=student.pro&billing=annual` with that plan in the API list, when the page loads, then step 1 is skipped, the role is Student without a Change button, the plan summary shows the annual price from the API, and the button reads "Continue to secure payment".
9. Given a paid sign-up where checkout start fails with `detail` "Paystack is unavailable", when the account was created, then the panel shows "Your account is ready, but we could not start the payment: Paystack is unavailable. ..." and both buttons work; "Continue on the free plan" reaches `/onboarding` signed in.
10. Given an unknown `?plan=foo`, when the page loads, then it behaves as a plain free sign-up with step 1 shown.
11. Given a signed-in student who finished onboarding, when they open `/register`, then they are redirected to `/dashboard`.
12. Given a double click on Create account, when both clicks land, then exactly one `POST /auth/register` is sent.
13. Given any successful sign-up, when devtools inspect `document.cookie`, local storage and the action response, then no access or refresh token is visible.

## Production readiness

- Security
  - Role is restricted to `student` or `parent` by the API allowlist; the client cannot send `admin` (verified by an integration test in BE-IDN-20 and a page test that tampers the action payload).
  - Tokens from BE-IDN-20 stay inside the server action and the encrypted httpOnly Auth.js cookie; the action returns only `{ ok, role, next }` or a typed error.
  - CSRF: server actions enforce the Origin check; no BFF route is exposed for register.
  - No PII in URLs: email and name never go in a query string or redirect; `plan`, `billing`, `role` are the only params and are validated.
  - Sentry `beforeSend` and breadcrumb filters drop `password`, `email` and `name` from action payloads; logs carry the API `code` and trace id only.
  - Paystack redirect host allowlist (`checkout.paystack.com`).
  - CSP update for Google sign-in: `script-src` and `frame-src` `https://accounts.google.com`, `connect-src https://accounts.google.com` (FE-13 follow-up, task below).
- Performance
  - Server Component page; client JS limited to the flow, form and Google button; budget 90 KB gzip for the route (react-hook-form and zod are shared chunks), checked in Lighthouse CI.
  - LCP is the `h1`; no images. Plans are read from the cached `getPlans()` (tag `billing:plans`), so the page never waits on the Billing API at request time.
- Resilience
  - API down: the action catches network errors and shows the server error banner; form values stay.
  - Partial failure handled explicitly: account created then session failed, and account plus session created then checkout failed.
  - Double-submit guard (pending state) and no automatic retry of register.
  - Checkout retry is safe to repeat (BE-BIL-09 initialises a new transaction each time; old ones expire unpaid).
- Observability
  - Error boundary `error.tsx` reports to Sentry with route tag `/register`.
  - Analytics events (consent-gated through `web/src/lib/analytics/track.ts`): `signup_viewed` {preset_role: boolean, paid_plan: boolean}, `signup_role_chosen` {role}, `signup_started` {role, plan} (fired when the details step is first shown, not on page load, so the funnel shows drop-off at the role step), `signup_submitted` {role, method: "password"}, `signup_completed` {role, method: "password"|"google", paid_plan: boolean}, `signup_failed` {code} (API `code` only), with `signup_completed` sent before the Paystack hand-off (after it the browser is on Paystack's domain and the event would be lost), `signup_checkout_failed`, `signup_checkout_retried`, `signup_continued_free`. Never email, name or plan price.
  - Server action forwards the `traceparent` header to the API so a failed sign-up is one trace across Vercel and ECS.
- Accessibility (WCAG 2.2 AA)
  - Role choice is a `fieldset` of radios; errors linked with `aria-describedby`; banner focus on error; 44px targets; visible focus; password toggle does not move focus; no time limit on the form (2.2.1); redundant entry avoided by the draft restore (3.3.7); accessible authentication: paste allowed in all fields, no cognitive test (3.3.8).
- Privacy and POPIA
  - Data minimisation: only name, email, password, role and consent versions are collected.
  - Minors: students may be under 18; the page states nothing about age. Age is captured at onboarding (decision 30) and under-18 parent consent is handled by BE-FAM-14 and HRD-32.
  - Analytics before sign-up are consent-gated and carry no identifiers.
- SEO
  - Indexable with title "Create your account | Aptiverse" and description "Create a free Aptiverse account as a student or a parent."; canonical `/register` without query; included in the sitemap.
- Rollout
  - Behind the `authPages` switch in `web/src/lib/flags.ts` (proposed helper); off shows the Paused state. Ship order: preview, dev, staging (with SES), then production only at cutover (Phase 11), since the old app serves real users until then.
  - The paid-plan hand-off has its own `paidSignup` switch so Phase 6 can ship it later or turn it off without touching free sign-up.
  - Rollback: Vercel instant rollback to the previous deployment (HRD-03); turning `paidSignup` off falls back to free sign-up with a working plan link on Billing.
- Monitoring
  - Grafana panel (OBS-02) for `POST /auth/register`: rate, 4xx by `code`, 5xx, p95.
  - Sentry alert: more than 5 `registerAction` failures with 5xx in 10 minutes.
  - Business alert: zero `UserRegistered` events in 24 hours in production (admin metrics, BE-ADM-02).
  - Panel for checkout start failures after sign-up (count of `signup_checkout_failed`).

## Build tasks

- [ ] **PG-AUTH-REG-01** Role choice step: `role-choice.tsx` as a radio `fieldset` (Student, Parent), selecting advances to step 2, "Change" returns
- [ ] **PG-AUTH-REG-02** Details form: name and email fields with `useZodForm` and the generated `RegisterBody` schema
- [ ] **PG-AUTH-REG-03** Consent checkbox, required, with Terms and Privacy links; send `termsVersion` and `privacyVersion` from `getLegalVersions()` (PG-MKT-LEGAL-07)
- [ ] **PG-AUTH-REG-04** Continue with Google on step 2, invite path only (decision 24; reuses `google-button.tsx`), carrying the invite token, role, plan and billing through Auth.js state
- [ ] **PG-AUTH-REG-05** Plan preselect: `parsePlanParam` validates `plan` and `billing` against `getPlans()`, sets role from plan audience, skips step 1
- [ ] **PG-AUTH-REG-06** Auto sign-in after register: `registerAction` stores tokens in the session, then redirects to `/onboarding` (student or parent variant) or honours a safe `next`
- [ ] **PG-AUTH-REG-07** Error states: email taken (409) with Log in and Reset links, rate limited (429) with API detail, server error banner
- [ ] **PG-AUTH-REG-08** Password rules and hint come from the API policy (10 to 128 characters, no composition rules, `PasswordPolicy.cs`); `password-policy.ts` reads min and max from the generated zod schema; the old 8-character, uppercase and number hint is not carried over
- [ ] **PG-AUTH-REG-09** Show the API's actual validation reason: `problem-messages.ts` maps ProblemDetails `errors` to fields and `detail` to the banner; generic copy only when the API gave none
- [ ] **PG-AUTH-REG-10** Keep the account and offer retry or free plan when checkout fails after sign-up: `checkout-retry-panel.tsx` with the API reason (ported from `legacy/local-fixes`)
- [ ] **PG-AUTH-REG-11** Route files: `page.tsx`, `loading.tsx`, `error.tsx` under `web/src/app/(auth)/register/`
- [ ] **PG-AUTH-REG-12** `register-flow.tsx` step state machine (role, details, checkout-failed) with unit tests for every transition
- [ ] **PG-AUTH-REG-13** `password-field.tsx` with show or hide toggle, `autocomplete` prop and hint slot (shared with reset and login)
- [ ] **PG-AUTH-REG-14** `registerAction` server action: generated client call, typed result, never returns tokens, forwards `traceparent`
- [ ] **PG-AUTH-REG-15** `form-banner.tsx` shared alert with focus management
- [ ] **PG-AUTH-REG-16** Partial failure: account created but session failed shows the auto sign-in failed state, never the form again
- [ ] **PG-AUTH-REG-17** Signed-in visitor handling: redirect to landing, or the signed-in checkout variant when a valid paid plan is in the query
- [ ] **PG-AUTH-REG-18** Plan summary card with name and `formatZar` price for the chosen period
- [ ] **PG-AUTH-REG-19** Paid hand-off: after sign-in call `startCheckoutAction`, follow only `checkout.paystack.com` URLs
- [ ] **PG-AUTH-REG-20** Google error code to copy mapping on return (`?error=`)
- [ ] **PG-AUTH-REG-21** Name and email draft in `sessionStorage` (never password), restored on return, cleared on success
- [ ] **PG-AUTH-REG-22** Slow-network pending copy after 8 seconds; double-submit guard
- [ ] **PG-AUTH-REG-23** Paused state when the `authPages` switch is off; `paidSignup` switch gates REG-05, REG-18, REG-19
- [ ] **PG-AUTH-REG-24** Analytics events listed in Production readiness through the consent-gated `track()` wrapper
- [ ] **PG-AUTH-REG-25** Sentry scrubbing for `password`, `email`, `name` in action payloads and breadcrumbs (shared auth config)
- [ ] **PG-AUTH-REG-26** CSP additions for Google sign-in (`accounts.google.com` in `script-src`, `frame-src`, `connect-src`) in `web/next.config.ts`
- [ ] **PG-AUTH-REG-27** Student plan step after the role step when no `?plan=` is present (Free plus paid student plans from `getPlans()`, billing toggle, no red-listed or hardcoded blurbs), behind `paidSignup`
- [ ] **PG-AUTH-REG-28** Optional referral code field, server-prefilled from the `apt_ref` cookie with a "Remove" control, first touch wins, claimed via BE-AFF-05 after sign-up
- [ ] **PG-AUTH-REG-29** Family invite hand-off via `?invite=<token>`: role preset, email prefilled server-side (never `?email=` in the URL), land on the accept page after sign-up, expired-invite banner
- [ ] **PG-AUTH-REG-30** Analytics timing: `signup_started` on first view of the details step; `signup_completed` sent before the Paystack redirect
- [ ] **PG-AUTH-REG-31** Google paid sign-up (invite path): resume the pending plan after the OAuth round trip and start checkout, falling back to the checkout-failed panel (never a silent free landing)
- [ ] **PG-AUTH-REG-32** Progressive enhancement: form `action` is the server action so pre-hydration taps submit; submit never gated on client `isValid`

## Quality tasks

- [ ] **PG-AUTH-REG-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`); no `not-found.tsx` needed (no id in the route)
- [ ] **PG-AUTH-REG-Q02** Server-side reads (`getPlans()`, legal versions) go through loaders in `src/features/*/server/` using the generated client and zod parse
- [ ] **PG-AUTH-REG-Q03** Mutations go through server actions (not `/api/bff`), because the register and checkout responses carry tokens or payment links; pending states on every button
- [ ] **PG-AUTH-REG-Q04** Empty state: not applicable; confirm the step 1 screen always offers one clear next action
- [ ] **PG-AUTH-REG-Q05** Error state copy reviewed: every banner says what went wrong and how to fix it, with the API reason where given
- [ ] **PG-AUTH-REG-Q06** Forbidden and upgrade: not applicable (anonymous); signed-in redirect verified instead
- [ ] **PG-AUTH-REG-Q07** Stage-aware wording: no Grade, SBA, APS, matric, course or GPA wording anywhere on the page
- [ ] **PG-AUTH-REG-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-AUTH-REG-Q09** Layout at 1440px (split shell, form `max-w-sm`)
- [ ] **PG-AUTH-REG-Q10** Light and dark both correct (OS-driven), including the brand panel and the rose banner
- [ ] **PG-AUTH-REG-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AUTH-REG-Q12** axe: zero violations in light and dark on step 1, step 2 with errors, and the checkout-failed panel
- [ ] **PG-AUTH-REG-Q13** Keyboard pass: radios with arrow keys, toggle, checkbox, submit; visible focus; one `h1`
- [ ] **PG-AUTH-REG-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering free, paid, checkout-failed and error paths
- [ ] **PG-AUTH-REG-Q15** `generateMetadata` title and description; no app nav on this page (auth shell only)
- [ ] **PG-AUTH-REG-Q16** Contract test: hint min and max equal the generated zod schema bounds (fails on drift)
- [ ] **PG-AUTH-REG-Q17** Token exposure check: Playwright asserts no token in cookies readable by JS, storage or action responses (FE-29)
- [ ] **PG-AUTH-REG-Q18** WCAG 2.2 checks: 3.3.7 redundant entry (draft restore), 3.3.8 accessible authentication (paste allowed), 2.5.8 target size
- [ ] **PG-AUTH-REG-Q19** Lighthouse mobile 90 or higher; route JS under 150 KB gzip (target 90 KB)
- [ ] **PG-AUTH-REG-Q20** Monitoring wired: Grafana register panel, Sentry alert rule, zero-signups alert documented in the runbook
- [ ] **PG-AUTH-REG-Q21** Consent box starts unticked (a pre-ticked box is not consent); component test asserts the default
- [ ] **PG-AUTH-REG-Q22** No PII in URLs check: Playwright walks the invite and referral paths and asserts no email or name appears in any URL

## Tests

Unit (Vitest):
- `password-policy.test.ts`: hint mentions the generated min; 9 characters rejected, 10 accepted with no composition, 129 rejected.
- `problem-messages.test.ts`: field errors mapped by key; `detail` used for the banner; fallback only when both are missing; unknown keys go to the banner.
- `plan-param.test.ts`: valid paid plan, free plan ignored, unknown code ignored, bad billing defaults to monthly, role from audience overrides `?role=`.
- `register-flow.test.ts`: role to details, change back, details to checkout-failed, retry success and failure.
- `register-form.test.tsx`: consent required; button disabled while pending; API 400 message rendered verbatim.
- `checkout-retry-panel.test.tsx`: reason shown, retry updates reason, continue free navigates.

Playwright (`web/e2e/auth/register.spec.ts`, mock API):
- `signs up a student and lands on onboarding`
- `signs up a parent and lands on parent onboarding`
- `shows the API password reason verbatim`
- `blocks submit without consent and sends consent versions when ticked`
- `shows email taken with log in and reset links`
- `shows the API detail when rate limited`
- `preselects the plan from pricing and skips the role step`
- `keeps the account and offers retry or free when checkout fails`
- `ignores an unknown plan code`
- `redirects a signed-in student away`
- `sends one request on double click`
- `exposes no token to browser JavaScript`
- `has no accessibility violations in light and dark` (each step)
- `fits 360px without sideways scrolling`

Added from the 43f9faa review:
- `chooses a paid plan in the plan step after arriving from a referral link`
- `prefills and removes a referral code from a link`
- `registers from a family invite without the email in the url and lands on accept`
- `starts checkout after an invited google sign-up with a paid plan`
- `hides the google button without an invite token`
- `submits when tapped before hydration` (JavaScript disabled project)

## Open questions

1. Where do the current legal versions come from for the web: a public `GET /legal/versions` (preferred, single source with the API's `LegalOptions`) or a build-time env var? Shared with PG-MKT-LEGAL-04.
2. Decided (24): Google signs in existing accounts and completes family invites only (the old `OAuthNoAccount` rule). The Google button shows on this page only with an invite token; open Google sign-up can come later if sign-up friction shows.
3. The API error code for a duplicate email is not defined yet (proposed `identity.email_taken`, 409). Register by nature reveals that an email exists; accepted given rate limits?
4. Decided (25): a verified email does not gate checkout, so paid sign-up goes straight to payment and REG-19 stands; BE-IDN-38 gates payouts and sensitive account changes instead.
5. Decided (30, DECISIONS E): students give a date of birth at onboarding and parents confirm they are 18 or older there (PG-ONB-STU-28, PG-ONB-PAR-21). Sign-up still asks nothing about age.
6. Does the generated OpenAPI carry `minLength` and `maxLength` for the password (FluentValidation rules are not emitted by default)? If not, BE-IDN-20 needs a schema transformer so Orval's zod gets the bounds; otherwise REG-08 has no single source.
7. Family invite preview: is a public `GET /family/invites/{token}` (returning only the invited email and expiry) acceptable, or should the register action resolve the token server-side through a non-public contract? Needed for REG-29.
8. Decided (3): affiliates are in v1, so the referral field shows on every sign-up, as in the old app.
