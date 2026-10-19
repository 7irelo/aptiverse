# Reset password

| | |
|---|---|
| ID | `PG-AUTH-RESET` |
| Route | `/reset-password?token=` (link built by the API in `OneTimeTokens.cs`) |
| Phase | 2 |
| Roles | anonymous visitor holding a reset link |
| Stages | none |
| Entitlement | free |
| Depends on | BE-IDN-26, BE-IDN-25, BE-IDN-14 (sessions revoked on reset), FE-20, SHL-02, UI-01, UI-03, PG-AUTH-REG-08 (password policy), PG-AUTH-REG-13 (password field), PG-AUTH-REG-09 (problem mapper), PG-AUTH-REG-15 (form banner) |
| Old app reference | `43f9faa:web/src/app/(auth)/reset-password/page.tsx` (used `?userId=&token=` and a confirm field; both dropped, see edge cases) |
| Status | Not started. No route exists. API side modelled (single-use hashed token, 60-minute lifetime, `identity.token_invalid` error "This link is invalid or has expired. Request a new one.", `PasswordChanged` event with `ViaReset`) but no endpoint yet. |

## Purpose

Let the holder of a valid reset link choose a new password under exactly the same rules as sign up, then send them to log in. Handle expired, used and malformed links without dead ends.

## User stories

- As a student who asked for a reset, I want to set a new password from the email link on my phone.
- As someone whose link expired, I want a one-tap way to get a new one.
- As an account owner, I want every other device signed out after a reset, in case someone else had my password.

## Layout

### Mobile (360px)

1. Auth shell top bar with wordmark.
2. `h1` "Choose a new password".
3. Error banner slot.
4. New password field with show or hide and the policy hint.
5. Primary button "Save new password".
6. Link "Back to log in".
7. Invalid-link state replaces 3 to 5 (see States).

### Desktop (1440px)

Split auth shell, form column `max-w-sm`. Same order.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(auth)/reset-password/page.tsx` | server | Reads `token` from `searchParams`; if missing or not the expected shape (URL-safe, length bounds of `SecureTokens.Create`), renders the invalid-link state without calling the API. Sets `Referrer-Policy: no-referrer` for this route. |
| Loading | `web/src/app/(auth)/reset-password/loading.tsx` | server | Skeleton. |
| Error boundary | `web/src/app/(auth)/reset-password/error.tsx` | client | `PageState` error with "Try again" (`retry`), Sentry capture with the URL query scrubbed. |
| Reset form | `web/src/features/auth/components/reset-password-form.tsx` | client | `useZodForm` with the generated `ResetPasswordBody` schema; `PasswordField` with `autocomplete="new-password"` and the shared hint. On mount, replaces the URL with `/reset-password` (token kept in component state only) via `history.replaceState`. |
| Invalid link panel | `web/src/features/auth/components/invalid-link.tsx` | server | Shared with `PG-AUTH-VERIFY`; title, body and one action passed in. |
| Action | `web/src/features/auth/server/actions.ts` (`resetPasswordAction`) | server action | Calls BE-IDN-26 with `token` and `newPassword`; returns `ok`, `invalid_token`, `validation` (field errors), `rate_limited` or `error`. |

## Data

No reads (the token is not pre-validated with a GET, so a link scanner opening the page cannot consume or probe it). Mutation:

| Endpoint | Method | Request | Success | Failures handled |
|---|---|---|---|---|
| BE-IDN-26 `POST /auth/reset-password` via `resetPasswordAction` | POST | `token`, `newPassword` (10 to 128 characters, no composition rules) | 204; token consumed; all refresh token families for the user revoked; `PasswordChanged` (`ViaReset`) published so a security notice email goes out | 400 `identity.token_invalid` (expired, used or unknown), 400 `identity.password_rejected` with `errors.newPassword`, 429, 5xx or network |

## States

| State | When | Copy |
|---|---|---|
| Default | Valid-looking token | `h1` "Choose a new password"; hint "Use at least 10 characters. A short phrase you will remember works well." |
| Submitting | In flight | "Saving...", disabled, `aria-busy`. |
| Password rejected | 400 with field errors | The API message(s) under the field verbatim. |
| Invalid or expired link | Missing or malformed token, or `identity.token_invalid` | Panel title "This link has expired or was already used". Body: the API detail when present ("This link is invalid or has expired. Request a new one."), else "Reset links work once and expire after 1 hour." Button "Send a new link" to `/forgot-password`. Link "Back to log in". |
| Rate limited | 429 | Banner: API `detail`. |
| Server error | 5xx or network | Banner: "We could not save your new password just now. This is on our side, not yours. Try again in a moment." The token stays usable because the API did not consume it. |
| Success | 204 | Redirect to `/login?reason=password-reset`, where the banner reads "Your password has been changed. Log in with your new password." |
| Paused | `authPages` switch off | `PageState` "Password reset is paused for a short while" / "Please try again later." |
| Empty, forbidden, upgrade, no evidence | Not applicable. | |

## Stage variants

None.

## Interactions and edge cases

- The token is removed from the address bar on mount, so it does not stay in browser history, screenshots or a shared tab. It is kept in memory and sent in the POST body only.
- Link scanners (for example email security services that open links) see only the form; nothing is consumed until a person submits.
- Opening the same link twice in two tabs: the first successful submit consumes it; the second gets the invalid-link state.
- A signed-in visitor opening a reset link: the reset still works; on success their current session is also revoked by the API and they are sent to log in.
- No "confirm password" field: the show or hide toggle replaces it (fewer fields on mobile, and 3.3.7 redundant entry). Recorded as a decision.
- Double submit guarded by the pending state.
- Password managers: `autocomplete="new-password"` prompts to save; see open question on the username hint.

- Old-format links: reset emails sent by the old app carry `?userId=&token=`. After cutover (Phase 11) those tokens do not exist in the new store; the page ignores `userId` and shows the invalid-link state with "Send a new link". The `userId` value is never sent anywhere or logged.
- The old page's hint ("At least 8 chars, one uppercase, one number") is not carried over; the shared policy hint replaces it.
- Before hydration: the form posts to the server action; the button is never gated on client `isValid`.

## Copy

- `h1`: "Choose a new password"
- Button: "Save new password"
- Invalid link title: "This link has expired or was already used"
- Invalid link action: "Send a new link"
- Success notice (on `/login`): "Your password has been changed. Log in with your new password."

## Acceptance criteria

1. Given a valid link, when a 10-character password is saved, then the browser lands on `/login?reason=password-reset` with the success notice, and logging in with the new password works.
2. Given a valid link, when a 9-character password is entered, then the shared hint's rule error shows and nothing is sent.
3. Given the API rejects the password with a message, when the response arrives, then that message shows under the field verbatim.
4. Given a used or expired token, when submitted, then the invalid-link panel shows with "Send a new link".
5. Given `/reset-password` with no token, when the page loads, then the invalid-link panel shows and no request is made.
6. Given the page has loaded, when the address bar is read, then it shows `/reset-password` without the token.
7. Given a user signed in on two devices, when they reset the password on a third, then both other sessions fail their next refresh and land on `/login?reason=session-expired`.
8. Given the API is down, when submitted, then the server error banner shows and a later retry with the same link succeeds.

## Production readiness

- Security
  - Token handling: never logged, never in analytics, scrubbed from Sentry URLs and breadcrumbs (`token` key filter), removed from the URL on mount, `Referrer-Policy: no-referrer` on this route so third-party requests cannot see it.
  - Same password policy as sign up from one module (`password-policy.ts`), enforced again by the API.
  - All sessions revoked on reset (BE-IDN-26 plus BE-IDN-14), proven by acceptance criterion 7.
  - CSRF via server action Origin check.
- Performance
  - Small client form; route JS target 70 KB gzip; no data fetch before render.
- Resilience
  - Server error does not consume the token, so retry is safe; no automatic retry.
- Observability
  - Sentry boundary, route tag `/reset-password`, query scrubbed.
  - Analytics (consent-gated): `password_reset_viewed` {token_present: boolean}, `password_reset_completed`, `password_reset_failed` {code}.
  - `traceparent` forwarded.
- Accessibility (WCAG 2.2 AA)
  - Hint linked by `aria-describedby`; errors announced; paste allowed; no confirm field (3.3.7).
- Privacy and POPIA
  - No personal data shown on the page (no email echoed).
- SEO
  - `robots: noindex, nofollow`; not in the sitemap.
- Rollout
  - `authPages` switch; staged with the other auth pages; Vercel instant rollback.
- Monitoring
  - Grafana panel for `POST /auth/reset-password`: success, `identity.token_invalid` share, 5xx. A sudden rise in invalid tokens suggests broken email links (wrong `Auth:WebAppUrl`) and alerts.
  - Sentry alert on any 5xx from `resetPasswordAction` above 3 in 10 minutes.

## Build tasks

- [ ] **PG-AUTH-RESET-01** New password form using the same policy module, hint and field as sign up
- [ ] **PG-AUTH-RESET-02** Expired, used or malformed token state with "Send a new link"
- [ ] **PG-AUTH-RESET-03** Route files: `page.tsx`, `loading.tsx`, `error.tsx`
- [ ] **PG-AUTH-RESET-04** `resetPasswordAction` server action with typed results
- [ ] **PG-AUTH-RESET-05** Token shape check on the server before rendering the form
- [ ] **PG-AUTH-RESET-06** Remove the token from the URL on mount and keep it in memory only
- [ ] **PG-AUTH-RESET-07** `Referrer-Policy: no-referrer` for the route, and the Sentry `token` scrub rule
- [ ] **PG-AUTH-RESET-08** `invalid-link.tsx` shared panel (used by verify email too)
- [ ] **PG-AUTH-RESET-09** Success redirect to `/login?reason=password-reset`
- [ ] **PG-AUTH-RESET-10** `authPages` switch and Paused state; analytics events
- [ ] **PG-AUTH-RESET-11** Old-format links (`?userId=&token=`) from before cutover land on the invalid-link state; `userId` ignored and never logged
- [ ] **PG-AUTH-RESET-12** Progressive enhancement: form `action` is the server action; button never gated on client `isValid`

## Quality tasks

- [ ] **PG-AUTH-RESET-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`); the invalid-link panel stands in for `not-found.tsx`
- [ ] **PG-AUTH-RESET-Q02** No server loader (no reads); action uses the generated client and zod schema
- [ ] **PG-AUTH-RESET-Q03** Mutation through a server action with a pending state; no BFF route
- [ ] **PG-AUTH-RESET-Q04** Empty state: the no-token case shows the invalid-link panel with one clear action
- [ ] **PG-AUTH-RESET-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-AUTH-RESET-Q06** Forbidden and upgrade: not applicable
- [ ] **PG-AUTH-RESET-Q07** Stage-aware wording: none present
- [ ] **PG-AUTH-RESET-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-AUTH-RESET-Q09** Layout at 1440px
- [ ] **PG-AUTH-RESET-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AUTH-RESET-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AUTH-RESET-Q12** axe: zero violations in light and dark, form and invalid-link states
- [ ] **PG-AUTH-RESET-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AUTH-RESET-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering success, rejected password, used token and API down
- [ ] **PG-AUTH-RESET-Q15** `generateMetadata` title "Choose a new password" and `noindex`
- [ ] **PG-AUTH-RESET-Q16** Token leak check: E2E asserts the token is absent from the URL after load and from any request other than the POST body
- [ ] **PG-AUTH-RESET-Q17** Session revocation check: E2E with two browser contexts (acceptance criterion 7)

## Tests

Unit: `reset-password-form.test.tsx` (hint from policy, API message verbatim, token sent from memory after URL cleanup); `token-shape.test.ts` (accepts generated shape, rejects empty, too long, non URL-safe).

Playwright (`web/e2e/auth/reset-password.spec.ts`):
- `sets a new password and logs in with it`
- `shows the API reason when the password is rejected`
- `shows the expired link state for a used token`
- `shows the expired link state when the token is missing`
- `removes the token from the address bar`
- `signs out other devices after a reset`
- `lets the same link work after an API outage`
- `has no accessibility violations in light and dark`
- `fits 360px without sideways scrolling`

## Open questions

1. Password managers save a new password best when they know the username. Should BE-IDN-26 accept a lookup of the masked email for the token (for a hidden `autocomplete="username"` field), or is the small loss acceptable to avoid any token-to-email lookup?
2. Should the reset also mark the email verified (the person proved they read the inbox)? Proposed yes in BE-IDN-26.
