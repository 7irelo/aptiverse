# Log in

| | |
|---|---|
| ID | `PG-AUTH-LOGIN` |
| Route | `/login` (query: `next`, `error`, `reason`) |
| Phase | 2 |
| Roles | anonymous visitor; lands as student, parent or admin |
| Stages | none |
| Entitlement | free |
| Depends on | BE-IDN-21, BE-IDN-27, BE-IDN-28, BE-IDN-23, FE-20, FE-21, FE-22, FE-23, FE-24, FE-27, SHL-02, UI-01, UI-03, PG-AUTH-REG-13 (password field), PG-AUTH-REG-09 (problem mapper), PG-AUTH-REG-15 (form banner) |
| Old app reference | `43f9faa:web/src/app/(auth)/login/page.tsx` (error code copy, stale-token redirect loop fix, invitee hand-off, hard navigation, token cache reset); `43f9faa:web/src/components/auth/OAuthButtons.tsx`, `PasswordField.tsx` |
| Status | Placeholder only: `web/src/app/(auth)/login/page.tsx` renders a `PageState` "Sign in is coming soon" with static metadata title "Sign in". No form, no `loading.tsx` or `error.tsx`, no auth backend wired (`web/src/lib/auth` returns a dev mock user only). `proxy.ts` matches the app routes but does not redirect yet. |

## Purpose

Get a returning person into the right home quickly and safely: email and password, or Google, plus a way out when they forget. Explain lockout and rate limits honestly without revealing whether an email has an account.

## User stories

- As a student, I want to log in on my phone with my password manager filling the form.
- As a parent, I want to land on my parent dashboard, not the student one.
- As someone who followed a link to a page that needs login, I want to return to that page after logging in.
- As someone who has typed the wrong password a few times, I want to know I am locked out and for how long, and how to reset.
- As someone who signed up with Google, I want to continue with Google here too.

## Layout

### Mobile (360px)

1. Auth shell top bar with wordmark (SHL-02).
2. `h1` "Log in to Aptiverse".
3. Reason banner slot (info): shown for `reason=session-expired`, `reason=signed-out`, `reason=password-reset`, `reason=email-verified`.
4. Error banner slot (`role="alert"`).
5. "Continue with Google" full-width button.
6. Divider "or use your email".
7. Email field, Password field (with show or hide), "Forgot your password?" link right-aligned under the password field (44px tall hit area).
8. Primary button "Log in".
9. "New to Aptiverse? Create an account" link to `/register` (keeps `next`).
10. Footer links: Privacy, Terms, Help.

### Desktop (1440px)

Same split shell as sign up: brand panel left (5/12), form column right (7/12) with the form at `max-w-sm`, vertically centred. Block order unchanged.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(auth)/login/page.tsx` | server | Replaces the placeholder. Reads `searchParams` and the session; a signed-in visitor is redirected to their landing. Renders `LoginForm` in `Suspense`. |
| Loading | `web/src/app/(auth)/login/loading.tsx` | server | Skeleton of heading, Google button, two fields, button. |
| Error boundary | `web/src/app/(auth)/login/error.tsx` | client | `PageState` error with "Try again" (`retry`), Sentry capture. |
| Login form | `web/src/features/auth/components/login-form.tsx` | client | `useZodForm` with the generated `LoginBody` schema; `TextField` for email; `PasswordField` with `autocomplete="current-password"`. |
| Password field | `web/src/features/auth/components/password-field.tsx` | client | From PG-AUTH-REG-13; no hint on login. |
| Google button | `web/src/features/auth/components/google-button.tsx` | client | Owned here. Calls Auth.js `signIn("google")` with `intent=login` and the safe `next`; Lucide has no Google logo, so the official Google "G" mark is an inline SVG asset per Google's branding rules (the one allowed non-Lucide mark, documented). |
| Reason banner | `web/src/features/auth/components/login-reason-banner.tsx` | server | Maps an allowlisted `reason` to copy; unknown values render nothing. |
| Form banner | `web/src/features/auth/components/form-banner.tsx` | client | From PG-AUTH-REG-15. |
| Login action | `web/src/features/auth/server/actions.ts` (`loginAction`) | server action | Auth.js credentials `signIn` (FE-20) which calls BE-IDN-21; maps ProblemDetails to a typed result; then resolves the landing. |
| Landing resolver | `web/src/features/auth/server/resolve-landing.ts` | server | From the `/me` payload (BE-IDN-28): admin to `/admin`, parent to `/parent`, student without onboarding to `/onboarding`, else `/dashboard`; a safe `next` wins when the role may open it. |
| Safe next | `web/src/features/auth/lib/safe-next.ts` | shared | `safeNextPath(raw)`: accepts only paths starting with a single `/`, no `//`, no backslash, no scheme, no `/api/`, max 512 chars; else null. Used by register, login, proxy. |
| OAuth error copy | `web/src/features/auth/lib/oauth-errors.ts` | shared | Maps Auth.js `?error=` codes to copy (shared with register). |

## Data

No reads beyond the session. Mutations:

| Endpoint | Method | Request | Success | Failures handled |
|---|---|---|---|---|
| BE-IDN-21 `POST /auth/login` via `loginAction` | POST | `email`, `password` | tokens kept in the Auth.js session; `/me` read for roles and onboarding state | 401 wrong credentials (same response whether or not the email exists), 429 with `Retry-After` for both lockout and rate limits (one indistinguishable response, DECISIONS E; limits per email 10 per 15 minutes, per IP 30 per 5 minutes, lockout after 5 failures for 15 minutes by default), 5xx or network |
| BE-IDN-27 `POST /auth/google` via Auth.js Google provider | POST | Google ID token, `intent=login` | session | no linked account, invalid token, 5xx; returned as `?error=` codes |
| BE-IDN-28 `GET /me` | GET | none | `roles`, `permissions`, `entitlements`, `onboardingCompletedAt` | failure after a successful login signs out and shows the server error banner |

## States

| State | When | Copy |
|---|---|---|
| Default | First load | `h1` "Log in to Aptiverse"; button "Log in". |
| Submitting | In flight | "Logging you in...", disabled, `aria-busy`. |
| Wrong credentials | 401 | Banner: "That email and password do not match. Check them and try again, or reset your password." with a "reset your password" link. |
| Locked out or rate limited | 429 with `Retry-After` (lockout and rate limits share this response, DECISIONS E) | Banner: the API `detail`, else "Too many attempts. Try again in {minutes} minutes, or reset your password now." Link "Reset your password". The minutes come from `Retry-After`, never hardcoded in the UI. |
| Server error | 5xx or network | Banner: "We could not log you in just now. This is on our side, not yours. Try again in a moment." |
| Field errors | Client zod | Email: "Enter a valid email address, like name@example.com."; password: "Enter your password." |
| Session expired | `reason=session-expired` (set by FE-23 when refresh fails) | Info banner: "Your session ended, so please log in again." |
| Signed out | `reason=signed-out` | Info banner: "You have logged out." |
| After reset | `reason=password-reset` | Info banner: "Your password has been changed. Log in with your new password." |
| After verify | `reason=email-verified` | Info banner: "Your email is confirmed. Log in to continue." |
| Google no account | `error=OAuthNoAccount` | Banner: "There is no Aptiverse account for that Google email yet. Create an account first." with link to `/register`. |
| Google failed | other `error=` codes | Banner: "We could not log you in with Google. Please try again, or use your email and password." |
| Paused | `authPages` switch off | Keeps today's placeholder copy: "Sign in is coming soon" / "We are rebuilding accounts. You will be able to sign in here shortly." |
| Empty, forbidden, upgrade, no evidence | Not applicable. | |

## Stage variants

None. The landing differs by role and onboarding state only.

## Interactions and edge cases

- `next` is passed by `proxy.ts` (FE-27) when a signed-out visitor hits an app route (the placeholder proxy comment already names `next`). It is sanitised by `safeNextPath`. A `next` the role cannot open (for example a parent with `next=/admin/users`) is dropped in favour of the role landing.
- Open redirect attempts (`next=//evil.example`, `next=https://...`, `next=/\evil`) fall back to the landing; a unit test covers each.
- The form never says whether the email exists: wrong password and unknown email produce the same banner and roughly the same timing (the API handles timing; the page adds no branch).
- The page cannot tell lockout from rate limiting (one 429, DECISIONS E), so one message covers both.
- After a successful login the password field is cleared from memory (form reset) before navigation.
- Double submit: disabled while pending; Enter submits once.
- Browser back after login: the login page redirects the signed-in visitor forward, so it never shows a filled form.
- Session refresh failure anywhere in the app lands here with `reason=session-expired` and the original `next`.
- Unverified email: login is allowed (verification is required only for sensitive actions, BE-IDN-38); the app shows its own verify banner.
- Caps Lock: when the password field has focus and Caps Lock is on, show "Caps Lock is on" under the field (`aria-live="polite"`).
- Slow network: after 8 seconds the button reads "Still working, please keep this page open...".

- Stale session (43f9faa lesson): a visitor whose session cookie exists but whose tokens can no longer be refreshed must see the form, not be bounced to the dashboard. Bouncing created a loop (dashboard 401, back to login, forward again). The page and `proxy.ts` treat "signed in" as "session refreshable" (FE-23), not "cookie present".
- Every Auth.js `?error=` code gets a sentence, not only the Google ones: `SessionRequired` "Your session ended. Log in again to pick up where you left off."; `Verification` "That link has expired. Request a new one and try again."; any unknown code "Your session ended. Log in again to continue." A bare form after a redirect reads as the app having broken.
- Invitees: the "Create an account" link carries the same safe `next` (and an `invite` token when present) so a new invitee returns to where the invite was taking them.
- After a successful sign-in the button stays disabled until the page unmounts, and navigation is a full page load, so the next request carries the new session cookie (a soft navigation could race the cookie write).
- Account switch: all client caches (TanStack Query) are cleared on login and logout, so a previous account's data can never flash or be sent with the new session.
- Before hydration: the form posts to the server action; the button is never gated on client `isValid`.

## Copy

- Title: "Log in" (metadata), `h1` "Log in to Aptiverse"
- Divider: "or use your email"
- Link: "Forgot your password?"
- Prompt: "New to Aptiverse? Create an account"
- Wrong credentials, lockout, rate limit, server error: as in States.

## Acceptance criteria

1. Given a student with completed onboarding, when they log in with the right password, then they land on `/dashboard`.
2. Given a student who has not completed onboarding, when they log in, then they land on `/onboarding`.
3. Given a parent, when they log in, then they land on `/parent`; given an admin, on `/admin`.
4. Given `/login?next=/dashboard/practice`, when a student logs in, then they land on `/dashboard/practice`.
5. Given `/login?next=//evil.example`, when anyone logs in, then they land on their role landing.
6. Given a wrong password or an unknown email, when they submit, then the same "That email and password do not match..." banner shows and focus moves to it.
7. Given the API returns 429 with `Retry-After: 900`, when it arrives, then the banner shows the API detail (or the fallback with 15 minutes) and a working "Reset your password" link.
8. Given the API returns 429, when it arrives, then the API detail is shown verbatim.
9. Given `reason=session-expired`, when the page loads, then the info banner reads "Your session ended, so please log in again."
10. Given a signed-in visitor, when they open `/login`, then they are redirected to their landing.
11. Given a successful login, when devtools inspect cookies readable by JS and storage, then no token is present.
12. Given a double click on Log in, when both land, then one `POST /auth/login` is sent.

## Production readiness

- Security
  - Credentials go only through the server action; tokens stay in the encrypted httpOnly cookie (FE-22). CSRF covered by the server action Origin check.
  - No account enumeration in copy or behaviour; lockout and rate limits enforced by the API (BE-IDN-21, BE-IDN-51, BE-IDN-53), the page only displays them.
  - Open redirect closed by `safeNextPath` plus a role check.
  - Sentry and logs never carry the password or email; failed logins are recorded server-side as security events (BE-IDN-39), not in web logs.
  - CSP allows Google sign-in origins (PG-AUTH-REG-26).
- Performance
  - Server page with one small client form; route JS target 80 KB gzip; LCP is the `h1`; no images except the inline Google mark SVG.
- Resilience
  - API down: server error banner; email and password stay in the form so a retry is one tap; the password is cleared only on success or on a wrong-credentials response.
  - `/me` failing after a successful token exchange signs out cleanly and shows the server error banner rather than a half-signed-in state.
  - No automatic retries of login (would burn lockout attempts).
- Observability
  - `error.tsx` reports to Sentry with route tag `/login`.
  - Analytics (consent-gated `track()`): `login_viewed` {has_next: boolean, reason}, `login_submitted` {method: "password"}, `login_succeeded` {method, role}, `login_failed` {code} (API code only), `login_google_clicked`.
  - `traceparent` forwarded from the action to the API.
- Accessibility (WCAG 2.2 AA)
  - Labels visible, errors linked, banner focus, 44px targets, paste allowed (3.3.8 accessible authentication), password manager friendly autocomplete, Caps Lock notice is polite live text.
- Privacy and POPIA
  - Nothing collected beyond credentials; analytics carry no identifiers; `reason` and `error` params are allowlisted enums, never free text.
- SEO
  - Indexable with title "Log in | Aptiverse" and description "Log in to your Aptiverse account."; canonical `/login` without query; in the sitemap.
- Rollout
  - `authPages` switch in `web/src/lib/flags.ts`: off keeps the placeholder state. Staged: preview, dev, staging, then production at cutover.
  - Rollback: Vercel instant rollback (HRD-03); switch off restores the placeholder.
- Monitoring
  - Grafana panel for `POST /auth/login`: rate, 401 share, lockouts, 429s, 5xx, p95.
  - Sentry alert: more than 5 `loginAction` 5xx in 10 minutes.
  - Security alert: spike in failed logins across many emails from few IPs (credential stuffing) from security events (BE-IDN-39), documented in the runbook.

## Build tasks

- [ ] **PG-AUTH-LOGIN-01** Email and password form, Google button and "Forgot your password?" link, replacing the placeholder page
- [ ] **PG-AUTH-LOGIN-02** Lockout and rate-limit messages from the API response (no hardcoded minutes)
- [ ] **PG-AUTH-LOGIN-03** `next` handling (the proxy's parameter name) and role-based landing
- [ ] **PG-AUTH-LOGIN-04** Route files: `loading.tsx` and `error.tsx` next to the page
- [ ] **PG-AUTH-LOGIN-05** `login-form.tsx` with `useZodForm` and the generated `LoginBody` schema
- [ ] **PG-AUTH-LOGIN-06** `loginAction` server action: Auth.js credentials sign-in, ProblemDetails to typed result, `traceparent` forwarded
- [ ] **PG-AUTH-LOGIN-07** `resolve-landing.ts` from `/me` (admin, parent, student with or without onboarding) with unit tests
- [ ] **PG-AUTH-LOGIN-08** Wrong-credentials banner identical for unknown email and wrong password
- [ ] **PG-AUTH-LOGIN-09** `login-reason-banner.tsx` with the allowlisted reasons (session-expired, signed-out, password-reset, email-verified)
- [ ] **PG-AUTH-LOGIN-10** `oauth-errors.ts` code to copy mapping, shared with register
- [ ] **PG-AUTH-LOGIN-11** `google-button.tsx` with the official Google mark asset and `intent` plus `next` carried in Auth.js state
- [ ] **PG-AUTH-LOGIN-12** Signed-in visitor redirect away from `/login`
- [ ] **PG-AUTH-LOGIN-13** `safe-next.ts` with open-redirect unit tests and a role check against the target area
- [ ] **PG-AUTH-LOGIN-14** Caps Lock notice on the password field
- [ ] **PG-AUTH-LOGIN-15** Double-submit guard and slow-network pending copy
- [ ] **PG-AUTH-LOGIN-16** `/me` failure after token exchange signs out and shows the server error banner
- [ ] **PG-AUTH-LOGIN-17** `authPages` switch: off keeps the current placeholder copy
- [ ] **PG-AUTH-LOGIN-18** Analytics events through the consent-gated `track()` wrapper
- [ ] **PG-AUTH-LOGIN-19** Stale-session handling: no redirect for a session that cannot be refreshed (prevents the dashboard and login loop), shared check with `proxy.ts`
- [ ] **PG-AUTH-LOGIN-20** Copy for every Auth.js error code (`SessionRequired`, `Verification`, unknown fallback) in `oauth-errors.ts`
- [ ] **PG-AUTH-LOGIN-21** Carry the safe `next` and any `invite` token onto the "Create an account" link
- [ ] **PG-AUTH-LOGIN-22** Keep the button disabled after success and use a full page load for the post-login navigation
- [ ] **PG-AUTH-LOGIN-23** Clear client query caches on login and logout (account switch safety)
- [ ] **PG-AUTH-LOGIN-24** Progressive enhancement: form `action` is the server action; button never gated on client `isValid`

## Quality tasks

- [ ] **PG-AUTH-LOGIN-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`); no `not-found.tsx` needed *(partial: `page.tsx` exists as a Server Component placeholder; `loading.tsx` and `error.tsx` missing)*
- [ ] **PG-AUTH-LOGIN-Q02** No page data loader needed beyond the session helper (FE-24); confirm `/me` is read and zod-parsed through the generated client in `resolve-landing.ts`
- [ ] **PG-AUTH-LOGIN-Q03** Mutations through a server action (not `/api/bff`), since the response carries tokens; pending state on the button
- [ ] **PG-AUTH-LOGIN-Q04** Empty state: not applicable; confirm the default screen offers both log-in routes and sign up
- [ ] **PG-AUTH-LOGIN-Q05** Error state copy reviewed: what went wrong and how to fix it, no enumeration
- [ ] **PG-AUTH-LOGIN-Q06** Forbidden and upgrade: not applicable; role check on `next` verified instead
- [ ] **PG-AUTH-LOGIN-Q07** Stage-aware wording: none present on the page
- [ ] **PG-AUTH-LOGIN-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-AUTH-LOGIN-Q09** Layout at 1440px (split shell)
- [ ] **PG-AUTH-LOGIN-Q10** Light and dark both correct (OS-driven), including the Google button in both schemes
- [ ] **PG-AUTH-LOGIN-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AUTH-LOGIN-Q12** axe: zero violations in light and dark, default and error states
- [ ] **PG-AUTH-LOGIN-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AUTH-LOGIN-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering success per role, wrong password, lockout, rate limit and API down
- [ ] **PG-AUTH-LOGIN-Q15** `generateMetadata` title "Log in"; no app nav on the page
- [ ] **PG-AUTH-LOGIN-Q16** Token exposure check after login (FE-29)
- [ ] **PG-AUTH-LOGIN-Q17** Lighthouse mobile 90 or higher; route JS under 150 KB gzip (target 80 KB)
- [ ] **PG-AUTH-LOGIN-Q18** Monitoring wired: Grafana login panel, Sentry alert, credential-stuffing alert in the runbook
- [ ] **PG-AUTH-LOGIN-Q19** Account switch test: log in as A, log out, log in as B, assert no A data appears and no request carries A's session
- [ ] **PG-AUTH-LOGIN-Q20** Redirect loop test: an expired, unrefreshable session on `/login` shows the form and does not loop

## Tests

Unit (Vitest):
- `safe-next.test.ts`: accepts `/dashboard/practice`; rejects `//x`, `https://x`, `/\x`, `/api/bff/x`, empty, over 512 chars.
- `resolve-landing.test.ts`: each role, student with and without onboarding, `next` allowed and refused by role.
- `oauth-errors.test.ts`: known codes, unknown code fallback.
- `login-form.test.tsx`: renders the API detail for 429, same banner for 401 regardless of email, button disabled while pending.

Playwright (`web/e2e/auth/login.spec.ts`, mock API):
- `logs a student in to the dashboard`
- `sends a student without onboarding to onboarding`
- `logs a parent in to the parent home`
- `returns to the next page after login`
- `ignores an external next url`
- `shows the same message for a wrong password and an unknown email`
- `shows the lockout message from the API with a reset link`
- `shows the rate limit detail from the API`
- `shows a retry message when the API is down`
- `shows the session expired notice`
- `redirects a signed-in visitor`
- `exposes no token to browser JavaScript`
- `has no accessibility violations in light and dark`
- `fits 360px without sideways scrolling`

## Open questions

1. Decided (DECISIONS E): a locked account gets the same 429 with `Retry-After` as the rate limiters. The banner reads the API detail and the minutes from `Retry-After`.
2. Decided (DECISIONS E): no. Because lockout and rate limiting share one 429 response, the lock never reveals that an account exists.
3. Decided (DECISIONS E): the redirect parameter is `next` (the old app used `callbackUrl`); FE-27 matches.
4. Google mark: Lucide-only is the rule; the Google "G" is a third-party brand mark required by Google's sign-in guidelines. Confirm this single exception is acceptable (the ESLint icon rule may need an allow entry for the asset).
