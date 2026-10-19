# Verify email

| | |
|---|---|
| ID | `PG-AUTH-VERIFY` |
| Route | `/verify-email?token=` (link built by the API in `OneTimeTokens.cs`, valid 48 hours by default) and `/verify-email` without a token (resend view) |
| Phase | 2 |
| Roles | anyone holding a verification link; signed-in student, parent or admin for resend |
| Stages | none |
| Entitlement | free |
| Depends on | BE-IDN-24, BE-IDN-28, BE-IDN-38, BE-NTF-02, BE-NTF-04 (verify template), FE-20, FE-24, SHL-02, UI-01, PG-AUTH-RESET-08 (invalid link panel), PG-AUTH-REG-15 (form banner) |
| Old app reference | `43f9faa:web/src/app/(auth)/verify-email/page.tsx` (two flows on one page, soft-gate dead-loop fix, signed-out resend by email; it verified on page load, which the rebuild deliberately does not) |
| Status | Not started. No route exists. API side modelled (`EmailVerificationRequested` event, single-use hashed token, `Verification` rate limit 5 per 15 minutes per IP) but no endpoint yet. |

## Purpose

Confirm that the person owns their email address, with one deliberate tap so automated link scanners cannot use up the token, and let a signed-in person resend the link with a sensible cooldown.

## User stories

- As a new student, I want to confirm my email from the link on my phone and carry on.
- As someone whose link expired, I want to resend it without contacting support.
- As the platform, I want only real people to confirm, not an email scanner that opens every link.

## Layout

### Mobile (360px)

With a token:
1. Auth shell top bar with wordmark.
2. `h1` "Confirm your email".
3. Body: "Tap the button to confirm this is your email address."
4. Primary button "Confirm my email".
5. Result replaces 3 and 4: success panel, or invalid-link panel.

Without a token (resend view, also linked from the in-app verify banner):
1. Top bar.
2. `h1` "Confirm your email".
3. Signed in: "We sent a link to {masked email from /me, for example t***@gmail.com}. It expires 48 hours after it was sent." Button "Send a new link" with cooldown. Link "Use a different email" to settings (PG-CMN-SETTINGS).
4. Signed out: "Log in to send a new confirmation link." Button "Log in" (`next=/verify-email`).

### Desktop (1440px)

Split auth shell, content column `max-w-sm`. Same order.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(auth)/verify-email/page.tsx` | server | Branches on token presence; reads the session for the resend view. `Referrer-Policy: no-referrer`. |
| Loading | `web/src/app/(auth)/verify-email/loading.tsx` | server | Skeleton. |
| Error boundary | `web/src/app/(auth)/verify-email/error.tsx` | client | `PageState` error with "Try again" (`retry`), Sentry capture with query scrubbed. |
| Confirm button | `web/src/features/auth/components/confirm-email.tsx` | client | Removes the token from the URL on mount (kept in memory), calls `verifyEmailAction` on tap, shows result. |
| Resend panel | `web/src/features/auth/components/resend-verification.tsx` | client | Shows masked email, "Send a new link", 60-second cooldown, then the API's own limit. |
| Invalid link panel | `web/src/features/auth/components/invalid-link.tsx` | server | From PG-AUTH-RESET-08. |
| Masked email helper | `web/src/features/auth/lib/mask-email.ts` | shared | `t***@gmail.com`; pure, unit tested. |
| Actions | `web/src/features/auth/server/actions.ts` (`verifyEmailAction`, `resendVerificationAction`) | server action | BE-IDN-24 calls; resend requires the session; after verify, refreshes the session claims so `emailVerified` updates. |

## Data

| Endpoint | Method | Fields used | Cache |
|---|---|---|---|
| BE-IDN-28 `GET /me` (resend view, signed in) | GET | `email` (masked before render), `emailConfirmed` | none (per user, dynamic) |

Mutations:

| Endpoint | Method | Request | Success | Failures handled |
|---|---|---|---|---|
| BE-IDN-24 `POST /auth/verify-email` via `verifyEmailAction` | POST | `token` | 204; token consumed; user `EmailConfirmed` true | 400 `identity.token_invalid`, 429, 5xx or network |
| BE-IDN-24 `POST /auth/verify-email/resend` via `resendVerificationAction` | POST | none (user from the session) | 202; older verification tokens invalidated | 409 or 204 already verified (code to confirm), 429 (`identity-verification` policy), 401 (session ended), 5xx |

## States

| State | When | Copy |
|---|---|---|
| Ready | Token present | "Tap the button to confirm this is your email address." Button "Confirm my email". |
| Confirming | In flight | "Confirming...", disabled, `aria-busy`. |
| Confirmed, signed in | 204 and a session exists | Panel "Your email is confirmed" / "Thanks. You can carry on where you left off." Button "Continue" to the role landing (onboarding first for a new student). |
| Confirmed, signed out | 204 and no session | Redirect to `/login?reason=email-verified`. |
| Invalid or expired link | `identity.token_invalid` or malformed token | Invalid-link panel: title "This link has expired or was already used", body from the API detail, button "Send a new link" (signed in) or "Log in to send a new link" (signed out). |
| Already confirmed | Resend view and `emailConfirmed` true | "Your email is already confirmed." Button "Continue". |
| Resend view | Signed in, not confirmed | As in Layout. |
| Resent | 202 | Status text "We have sent a new link to {masked email}. Check your spam folder if it is not there in a few minutes." Cooldown "You can send another link in {n} seconds". |
| Rate limited | 429 | Banner: API `detail`. |
| Server error | 5xx or network | Banner: "We could not confirm your email just now. This is on our side, not yours. Try again in a moment." (resend: "We could not send a new link just now...") |
| Signed out resend | No session, no token | "Log in to send a new confirmation link." Button "Log in". |
| Paused | `authPages` switch off | `PageState` "Email confirmation is paused for a short while" / "Please try again later." |
| Empty, forbidden, upgrade, no evidence | Not applicable. | |

## Stage variants

None.

## Interactions and edge cases

- The confirm step is a deliberate tap (POST), never automatic on page load, because security scanners in school and work email often open links and would consume a single-use token.
- Token removed from the address bar on mount; kept in memory only.
- A link opened on a different device from the one signed in: confirming works without a session and then sends the person to log in.
- A link for account A opened while signed in as account B: the API confirms account A (token decides); the page shows "Your email is confirmed" without naming the address, and B's session is untouched. Session claims refresh only when the confirmed user id matches the session.
- Resend cooldown is client-side courtesy; the API limit is the real guard.
- Server error on confirm does not consume the token; retry is safe.
- Double tap guarded by the pending state.

- Soft gate dead loop (43f9faa lesson): a signed-in but unverified person parked here by a verified-email gate (BE-IDN-38) must not be offered "Log in": login would send them home and the gate would send them back. Offer "Log out" (to switch accounts) instead. Only a signed-out visitor sees "Log in".
- Signed-out resend (43f9faa had it): someone who verified on another device, or was never signed in automatically, can enter an email to resend; the reply is always "If an account with that email exists, a fresh link is on its way." Needs an anonymous resend in BE-IDN-24, rate-limited per IP and per email (open question 4).
- Old-format links (`?userId=&token=`) from before cutover show the invalid-link state with a resend route; `userId` is ignored and never logged.
- 43f9faa verified automatically on page load; the rebuild keeps the deliberate tap because school and work mail scanners open links.

## Copy

- `h1`: "Confirm your email"
- Button: "Confirm my email"
- Success: "Your email is confirmed" / "Thanks. You can carry on where you left off."
- Resend button: "Send a new link"
- Resent: as in States.

## Acceptance criteria

1. Given a valid link, when the page loads, then nothing is sent to the API until "Confirm my email" is tapped.
2. Given a valid link and a signed-in session for the same user, when confirmed, then the success panel shows and the in-app verify banner is gone on the next page.
3. Given a valid link and no session, when confirmed, then the browser lands on `/login?reason=email-verified`.
4. Given a used token, when confirmed, then the invalid-link panel shows with a resend route.
5. Given a signed-in unconfirmed user on `/verify-email`, when they tap "Send a new link", then a new email is queued (Mailpit) and the button shows a 60-second countdown.
6. Given the API returns 429 on resend, when it arrives, then the API detail is shown.
7. Given the page has loaded with a token, when the address bar is read, then it shows `/verify-email` without the token.
8. Given the resend view, when it renders, then the email is masked (`t***@gmail.com`) and never shown in full.

## Production readiness

- Security
  - Token: removed from the URL, never logged, scrubbed from Sentry, `no-referrer` on the route; consumed only by POST.
  - Resend needs a session and uses the session user, so nobody can trigger mail to an arbitrary address.
  - Cross-account case does not leak which email was confirmed.
  - CSRF via server action Origin check.
- Performance
  - Server page with one small client leaf; route JS target 50 KB gzip.
- Resilience
  - Confirm and resend failures keep the token or session usable; no automatic retries; outbox-backed email (BE-NTF-02).
- Observability
  - Sentry boundary, route tag `/verify-email`.
  - Analytics (consent-gated): `email_verify_viewed` {token_present: boolean}, `email_verified`, `email_verify_failed` {code}, `email_verify_resent`.
  - `traceparent` forwarded.
- Accessibility (WCAG 2.2 AA)
  - Result panels announced via `role="status"` with focus moved to their heading; countdown announced at start and zero only.
- Privacy and POPIA
  - Email masked on screen; nothing else personal shown.
- SEO
  - `robots: noindex, nofollow`; not in the sitemap.
- Rollout
  - `authPages` switch; staged with the other auth pages; Vercel instant rollback.
- Monitoring
  - Grafana panel for verify and resend endpoints; share of `identity.token_invalid` above 30 percent for an hour alerts (likely a broken link base URL or scanner consumption).
  - Notifications outbox send failure alert shared with forgot password.

## Build tasks

- [ ] **PG-AUTH-VERIFY-01** Token confirm state behind a deliberate "Confirm my email" tap (POST, never on load)
- [ ] **PG-AUTH-VERIFY-02** Resend with a 60-second cooldown and the API limit message
- [ ] **PG-AUTH-VERIFY-03** Route files: `page.tsx`, `loading.tsx`, `error.tsx`
- [ ] **PG-AUTH-VERIFY-04** `verifyEmailAction` and `resendVerificationAction` server actions with typed results
- [ ] **PG-AUTH-VERIFY-05** Remove the token from the URL on mount; `no-referrer`; Sentry scrub (shared rule)
- [ ] **PG-AUTH-VERIFY-06** Success branches: signed in (Continue to landing, session claims refreshed) and signed out (redirect to login with reason)
- [ ] **PG-AUTH-VERIFY-07** Resend view: masked email from `/me`, already-confirmed state, signed-out state
- [ ] **PG-AUTH-VERIFY-08** `mask-email.ts` helper with unit tests
- [ ] **PG-AUTH-VERIFY-09** Cross-account link handling (no address shown, session untouched)
- [ ] **PG-AUTH-VERIFY-10** `authPages` switch and Paused state; analytics events
- [ ] **PG-AUTH-VERIFY-11** Signed-in unverified visitor sees "Log out" (switch account), never "Log in", to avoid the gate loop
- [ ] **PG-AUTH-VERIFY-12** Signed-out resend by email with the non-enumerating reply, once BE-IDN-24 supports anonymous resend
- [ ] **PG-AUTH-VERIFY-13** Old-format links from before cutover land on the invalid-link state; `userId` ignored and never logged

## Quality tasks

- [ ] **PG-AUTH-VERIFY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`); invalid-link panel stands in for `not-found.tsx`
- [ ] **PG-AUTH-VERIFY-Q02** Resend view reads `/me` through the session helper and generated client with zod parse
- [ ] **PG-AUTH-VERIFY-Q03** Mutations through server actions with pending states; no BFF route
- [ ] **PG-AUTH-VERIFY-Q04** Empty state: signed-out resend view offers one clear action (Log in)
- [ ] **PG-AUTH-VERIFY-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-AUTH-VERIFY-Q06** Forbidden and upgrade: not applicable
- [ ] **PG-AUTH-VERIFY-Q07** Stage-aware wording: none present
- [ ] **PG-AUTH-VERIFY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-AUTH-VERIFY-Q09** Layout at 1440px
- [ ] **PG-AUTH-VERIFY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AUTH-VERIFY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AUTH-VERIFY-Q12** axe: zero violations in light and dark, every state
- [ ] **PG-AUTH-VERIFY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AUTH-VERIFY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering confirm, used token, resend and API down
- [ ] **PG-AUTH-VERIFY-Q15** `generateMetadata` title "Confirm your email" and `noindex`
- [ ] **PG-AUTH-VERIFY-Q16** Scanner safety check: E2E loads the link with a plain GET (no click) and asserts the token is still valid afterwards
- [ ] **PG-AUTH-VERIFY-Q17** Gate loop test: a signed-in unverified user on `/verify-email` can log out and never loops between login and verify

## Tests

Unit: `mask-email.test.ts` (short local parts, plus addressing, subdomains); `confirm-email.test.tsx` (no call on mount, one call on tap, result panels); `resend-verification.test.tsx` (cooldown, 429 detail).

Playwright (`web/e2e/auth/verify-email.spec.ts`):
- `does not use the token until the button is tapped`
- `confirms the email when signed in and continues`
- `confirms the email when signed out and asks to log in`
- `shows the expired link state for a used token`
- `resends a link with a countdown` (Mailpit check)
- `shows the rate limit detail on resend`
- `masks the email in the resend view`
- `removes the token from the address bar`
- `has no accessibility violations in light and dark`
- `fits 360px without sideways scrolling`

## Open questions

1. What does resend return for an already confirmed account (204 no-op or 409)? The page shows "Your email is already confirmed." either way.
2. Partly decided (25): a verified email does not gate checkout; BE-IDN-38 gates affiliate payouts and sensitive account changes, so the in-app banner names those. Still open: confirm the API sends the first verification email on register automatically (assumed yes, from the `EmailVerificationRequested` event).
3. "Use a different email" depends on an email-change flow that is not in BE-IDN-34 (`PATCH /me/profile`); is email change in v1?
4. Should BE-IDN-24 offer an anonymous resend by email (non-enumerating, rate-limited per IP and per email) as the old app did? Needed for VERIFY-12.
