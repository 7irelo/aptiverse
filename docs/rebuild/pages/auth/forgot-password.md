# Forgot password

| | |
|---|---|
| ID | `PG-AUTH-FORGOT` |
| Route | `/forgot-password` |
| Phase | 2 |
| Roles | anonymous visitor (any role's account) |
| Stages | none |
| Entitlement | free |
| Depends on | BE-IDN-25, BE-NTF-02, BE-NTF-04 (reset email template), FE-20, SHL-02, UI-01, UI-03, PG-AUTH-REG-09 (problem mapper), PG-AUTH-REG-15 (form banner) |
| Old app reference | `43f9faa:web/src/app/(auth)/forgot-password/page.tsx` (its success copy hardcoded "expires in 30 minutes"; the rebuilt API default is 60) |
| Status | Not started. No route exists. The API already models the reset token (`OneTimeTokens.cs`: single use, hashed, 60 minutes by default, link `/reset-password?token=`) and per-email limits (3 per 15 minutes) but has no endpoint yet. |

## Purpose

Let someone who cannot log in ask for a reset link, and show the same calm confirmation whether or not an account exists, so the page never reveals who is registered.

## User stories

- As a student who forgot my password, I want a reset link by email so I can get back in tonight.
- As a parent, I want to know the link expires and what to do if it does not arrive.
- As the platform, I want this page to give nothing away about which emails have accounts.

## Layout

### Mobile (360px)

1. Auth shell top bar with wordmark.
2. `h1` "Reset your password".
3. Subhead: "Enter the email you use for Aptiverse and we will send you a link to choose a new password."
4. Error banner slot (rate limit or server error only).
5. Email field.
6. Primary button "Send reset link".
7. Link "Back to log in".
8. After submit, blocks 2 to 6 are replaced by the confirmation panel (see States), keeping "Back to log in".

### Desktop (1440px)

Split auth shell (SHL-02), form column `max-w-sm`. Same order.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(auth)/forgot-password/page.tsx` | server | Static shell; signed-in visitors are not redirected (a signed-in person may still want a reset; the API treats it the same). |
| Loading | `web/src/app/(auth)/forgot-password/loading.tsx` | server | Skeleton. |
| Error boundary | `web/src/app/(auth)/forgot-password/error.tsx` | client | `PageState` error, "Try again" (`retry`), Sentry capture. |
| Forgot form | `web/src/features/auth/components/forgot-password-form.tsx` | client | `useZodForm` with the generated `ForgotPasswordBody` schema; `TextField` email with `autocomplete="email"`. |
| Confirmation panel | `web/src/features/auth/components/reset-link-sent.tsx` | client | Same panel for every non-error outcome; "Send another link" with a 60-second cooldown. |
| Form banner | `web/src/features/auth/components/form-banner.tsx` | client | Shared. |
| Action | `web/src/features/auth/server/actions.ts` (`forgotPasswordAction`) | server action | Calls BE-IDN-25; returns `sent`, `rate_limited` (with detail) or `error`. Never returns whether the account exists. |

## Data

No reads. Mutation:

| Endpoint | Method | Request | Success | Failures handled |
|---|---|---|---|---|
| BE-IDN-25 `POST /auth/forgot-password` via `forgotPasswordAction` | POST | `email` | 202 with no body, whether or not the account exists; the API publishes `PasswordResetRequested` only for real accounts | 400 invalid email shape, 429 (`identity-password-reset` policy 10 per 15 minutes per IP; per email 3 per 15 minutes, `identity.too_many_attempts`), 5xx or network |

## States

| State | When | Copy |
|---|---|---|
| Default | Load | As in Layout. |
| Submitting | In flight | "Sending...", disabled, `aria-busy`. |
| Sent (always the same) | 202 | Heading "Check your email". Body: "If an Aptiverse account uses {email}, we have sent a link to reset its password. The link works once and expires in 1 hour." Then: "Nothing in your inbox after a few minutes? Check your spam or promotions folder, or send another link." Buttons "Send another link" (cooldown text "You can send another link in {n} seconds") and "Back to log in". |
| Field error | Client zod or 400 | "Enter a valid email address, like name@example.com." |
| Rate limited | 429 | Banner: API `detail`, else "Too many reset requests for this email. Please wait 15 minutes and try again." |
| Server error | 5xx or network | Banner: "We could not send the link just now. This is on our side, not yours. Try again in a moment." |
| Paused | `authPages` switch off | `PageState` "Password reset is paused for a short while" / "Please try again later." |
| Empty, forbidden, upgrade, no evidence | Not applicable. | |

The email shown in the Sent panel is the one the person typed (already on their screen), never echoed from the server.

## Stage variants

None.

## Interactions and edge cases

- Unknown email, unverified email, Google-only account, locked account: all show the identical Sent panel (Google-only accounts get an email from the API explaining they sign in with Google; the page does not branch).
- "Send another link" resubmits the same email after the 60-second client cooldown; the API's per-email limit still applies and its 429 detail shows in the banner.
- Each new link invalidates the older ones (API behaviour); the Sent copy does not promise that older links still work.
- Expiry copy reads the configured lifetime from the API response if provided, else the documented default of 1 hour (see open questions).
- Double submit guarded by the pending state.
- Email field keeps its value after a server error.
- The email is never put in the URL (no `?email=` prefill from login); the login page links here without parameters.

- Expiry copy drift (43f9faa lesson): the old page said the link expired in 30 minutes regardless of the API setting. The rebuilt copy comes from the API response or one shared constant tied to `Auth:PasswordResetMinutes`, with a test.
- Before hydration: the form posts to the server action; the button is never gated on client `isValid`.

## Copy

- `h1`: "Reset your password"
- Button: "Send reset link"
- Sent heading: "Check your email"
- Sent body and spam hint: as in States.
- Link: "Back to log in"

## Acceptance criteria

1. Given an email with an account, when submitted, then the Sent panel shows and one reset email is queued (verified in Mailpit in the E2E stack).
2. Given an email with no account, when submitted, then the identical Sent panel shows and no email is queued.
3. Given the Sent panel, when "Send another link" is pressed within 60 seconds, then it is disabled with the countdown; after 60 seconds it resubmits.
4. Given the API returns 429, when it arrives, then the banner shows the API detail.
5. Given the API is down, when submitted, then the server error banner shows and the email stays in the field.
6. Given a double click, when both land, then one request is sent.
7. Given any outcome, when the network log is inspected, then no response distinguishes an existing account from a missing one.

## Production readiness

- Security
  - No enumeration: identical UI, identical action result type, and the API returns 202 for every well-formed email (BE-IDN-25 integration test).
  - Rate limits are API-side (per IP and per email); the client cooldown is only a courtesy.
  - CSRF via the server action Origin check. No email in URLs or analytics; Sentry scrubs `email`.
- Performance
  - Tiny client form; route JS target 60 KB gzip; LCP the `h1`.
- Resilience
  - Server error keeps the input; the action does not retry automatically (each call may send an email).
  - SES delivery is behind the outbox (BE-NTF-02), so an API restart after 202 does not lose the email.
- Observability
  - Sentry boundary with route tag `/forgot-password`.
  - Analytics (consent-gated): `password_reset_requested`, `password_reset_resent`, `password_reset_failed` {code}. No email.
  - `traceparent` forwarded so the request and the outbox email job share a trace.
- Accessibility (WCAG 2.2 AA)
  - Sent panel announced with `role="status"` and focus moved to its heading; countdown text updates politely, not every second for screen readers (announce at start and at zero only).
- Privacy and POPIA
  - Only the email is processed; nothing stored by the web app.
- SEO
  - `robots: noindex` (utility page); not in the sitemap.
- Rollout
  - `authPages` switch; staged with the other auth pages. Rollback via Vercel instant rollback.
- Monitoring
  - Grafana panel for `POST /auth/forgot-password` (rate, 429s, 5xx) and for reset email send failures in the Notifications outbox (BE-NTF-02).
  - Alert: reset emails queued but SES send failures above 5 percent in 30 minutes.

## Build tasks

- [ ] **PG-AUTH-FORGOT-01** Email form with the same confirmation whether or not the account exists
- [ ] **PG-AUTH-FORGOT-02** Route files: `page.tsx`, `loading.tsx`, `error.tsx`
- [ ] **PG-AUTH-FORGOT-03** `forgotPasswordAction` server action returning only `sent`, `rate_limited` or `error`
- [ ] **PG-AUTH-FORGOT-04** `reset-link-sent.tsx` confirmation panel with spam hint and expiry copy
- [ ] **PG-AUTH-FORGOT-05** "Send another link" with a 60-second cooldown and polite announcements
- [ ] **PG-AUTH-FORGOT-06** Rate-limit and server error banners from the API detail
- [ ] **PG-AUTH-FORGOT-07** `authPages` switch and Paused state
- [ ] **PG-AUTH-FORGOT-08** Analytics events through the consent-gated `track()` wrapper
- [ ] **PG-AUTH-FORGOT-09** Expiry copy sourced from the API (or one shared constant tied to `Auth:PasswordResetMinutes`) with a unit test, never a hardcoded figure in JSX
- [ ] **PG-AUTH-FORGOT-10** Progressive enhancement: form `action` is the server action; button never gated on client `isValid`

## Quality tasks

- [ ] **PG-AUTH-FORGOT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`); no `not-found.tsx` needed
- [ ] **PG-AUTH-FORGOT-Q02** No server loader needed (no reads); confirm the action uses the generated client and zod schema
- [ ] **PG-AUTH-FORGOT-Q03** Mutation through a server action with a pending state; no BFF route
- [ ] **PG-AUTH-FORGOT-Q04** Empty state: not applicable; default screen has one clear action
- [ ] **PG-AUTH-FORGOT-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-AUTH-FORGOT-Q06** Forbidden and upgrade: not applicable
- [ ] **PG-AUTH-FORGOT-Q07** Stage-aware wording: none present
- [ ] **PG-AUTH-FORGOT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-AUTH-FORGOT-Q09** Layout at 1440px
- [ ] **PG-AUTH-FORGOT-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AUTH-FORGOT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AUTH-FORGOT-Q12** axe: zero violations in light and dark, default and Sent states
- [ ] **PG-AUTH-FORGOT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AUTH-FORGOT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering known email, unknown email, rate limit and API down
- [ ] **PG-AUTH-FORGOT-Q15** `generateMetadata` title "Reset your password" and `noindex`
- [ ] **PG-AUTH-FORGOT-Q16** Enumeration check: E2E compares responses for known and unknown emails and asserts they are identical
- [ ] **PG-AUTH-FORGOT-Q17** Monitoring wired: Grafana panel and SES failure alert

## Tests

Unit: `forgot-password-form.test.tsx` (pending disables, 429 detail shown, value kept on error); `reset-link-sent.test.tsx` (cooldown, resend calls the action, announcements only at start and end).

Playwright (`web/e2e/auth/forgot-password.spec.ts`):
- `confirms and emails a reset link for a known address` (Mailpit check)
- `shows the same confirmation for an unknown address and sends nothing`
- `limits resends with a countdown`
- `shows the rate limit detail from the API`
- `keeps the email when the API is down`
- `has no accessibility violations in light and dark`
- `fits 360px without sideways scrolling`

## Open questions

1. Should BE-IDN-25 return the link lifetime (so the Sent copy is never out of step with `Auth:PasswordResetMinutes`), or is "1 hour" acceptable as documented copy that changes with config?
2. Google-only accounts: does the API send a "you sign in with Google" email instead of a reset link? Proposed yes, as part of BE-IDN-25.
