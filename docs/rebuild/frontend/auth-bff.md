# Auth and BFF (web side)

| | |
|---|---|
| ID range | `FE-20` to `FE-29`, `FE-88` to `FE-111`, `FE-162` |
| Phase | 2 |
| Depends on | `ARC-09` (auth ADR), the Identity backend slices (login, Google, refresh, logout, sessions, `/me`, JWKS) in the backend Identity docs, `FE-07`, `FE-66`, `INF-16` (`auth-session` secret), `infra/vercel.md` |
| Code path | `web/src/auth.ts` (new), `web/src/lib/auth/`, `web/src/app/api/bff/[...path]/route.ts`, `web/src/proxy.ts`, `web/src/app/(auth)/` |
| Status | 35 tasks: 0 done, 3 partial, 0 unverified, 32 not started |

## Purpose

Pattern B with a backend for frontend: the .NET API owns users and tokens, Next.js (Auth.js v5) keeps the access and refresh tokens in an encrypted httpOnly cookie, Server Components call the API server to server, and client mutations go through `/api/bff`. The browser never holds a token. This file is the web half; the API half lives in the backend Identity docs.

## Scope

- Files: `src/auth.ts` (Auth.js config), `src/lib/auth/index.ts`, `src/lib/auth/session-user.ts` (keeps its `getSessionUser()` signature), `src/lib/auth/guards.ts` (new), `src/app/api/auth/[...nextauth]/route.ts` (new), `src/app/api/bff/[...path]/route.ts`, `src/proxy.ts`, `src/app/(auth)/login/`.
- Inputs: API endpoints `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`, `/auth/sessions`, `/me` (not in `openapi/v1.json` yet; only `/support/faqs` exists); `AUTH_SECRET` (Secrets Manager `aptiverse/<env>/auth-session`, mirrored into Vercel env), Google client id and secret.
- Outputs: a `__Host-` session cookie, `getSessionUser()`, `requireRole()`, `requirePermission()`, `can()`, an authenticated BFF and SSE passthrough, role routing in `proxy.ts`.
- Token-carrying auth calls (login, register, Google, refresh, logout) are made only from server actions and the Auth.js server callbacks, never through `/api/bff`, because their responses contain tokens that must not reach the browser. The BFF refuses `/auth/*` (FE-162).
- The post-sign-in redirect parameter is `next` everywhere (`/login?next=/dashboard/practice`), as `src/proxy.ts` already documents; no `callbackUrl`, `redirect` or `returnTo` aliases.
- Security target: OWASP ASVS L2 for session management (V3) and access control (V4) on the web side; verified in `launch/security.md`.

## Tasks

### Credentials and Google sign-in

- [ ] **FE-20** Auth.js v5 credentials provider calling `/auth/login`
- [ ] **FE-88** Install Auth.js v5, add `src/auth.ts` with the JWT session strategy (encrypted, not a DB session), `src/app/api/auth/[...nextauth]/route.ts`, and typed `Session` and `JWT` augmentations holding access token, refresh token, expiry and session id. Split from FE-20.
- [ ] **FE-89** Login server action (not a BFF call, see FE-162): calls the generated login client, maps ProblemDetails to form errors (401 wrong credentials, 423 locked out, 429 rate limited, 403 unverified email) with the copy from `pages/auth/login.md`; never reveals whether the email exists. Split from FE-20.
- [ ] **FE-21** Google provider calling `/auth/google`
- [ ] **FE-90** Google flow hardening: `state` and PKCE on, the Google id token is exchanged at the API (never trusted in the web tier), invite-rule and role-allowlist failures shown with clear copy; tests for the error mapping. Split from FE-21.

### Session cookie

- [ ] **FE-22** Encrypted httpOnly session cookie holding access and refresh tokens
- [ ] **FE-91** Cookie flags: name `__Host-aptiverse.session`, `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, no `Domain`; total size under 4 KB (assert in a unit test with a realistic token pair); local dev uses the non-prefixed name over http. Split from FE-22.
- [ ] **FE-92** `AUTH_SECRET` handling: read from Vercel env synced from Secrets Manager `auth-session`; rotation supports an array of secrets (new first, old second) for one session lifetime; procedure added to `infra/docs/runbooks/rotate-secret.md` scope in `launch/runbooks.md`. Split from FE-22.

### Refresh and lifetime

- [ ] **FE-23** Server-side refresh before expiry; sign out on refresh failure
- [ ] **FE-93** Single-flight refresh: concurrent server requests for one session share one in-flight refresh, so the API's reuse detection never revokes the family by accident; unit test fires five parallel requests with an expired token and asserts one refresh call. Split from FE-23.
- [ ] **FE-94** Session lifetime policy: idle timeout and absolute lifetime per role (proposal: student and parent 30 days absolute and 7 days idle, admin 12 hours absolute and 30 minutes idle), enforced in the Auth.js `jwt` callback; session re-issued (rotated) on role change, impersonation start and impersonation end.
- [ ] **FE-109** Sign out: server action calls `/auth/logout` (revokes the refresh token), clears the cookie and redirects to `/login`; "Sign out of all devices" calls the API's revoke-all sessions slice. Integration test with the mock API.

### Session helpers

- [ ] **FE-24** `lib/auth` session helpers (`getSessionUser`, `requireRole`, `can(permission)`) *(partial: uncommitted WIP in `src/lib/auth/session-user.ts`: `getSessionUser()` returns a mock user only when `devToolsEnabled()` and a dev cookie are set; `SessionUser` carries role, permissions and entitlements; no `requireRole` or `can`)*
- [ ] **FE-95** `src/lib/auth/guards.ts`: `requireRole(role)`, `requirePermission(code)` (redirect or `forbidden()`), `can(user, code)` pure function; unit tests per role; `getSessionUser()` body swapped to the Auth.js session plus `/me` without changing its signature. Split from FE-24.
- [ ] **FE-96** Dev-only mock users stay out of production: the mock map moves behind `devToolsEnabled()` in a dynamic import, `/dev/session` switcher returns 404 unless dev tools are on; unit test that `VERCEL_ENV=production` always yields `null` from the mock path; build output grep in CI finds no mock email.

### BFF proxy

- [ ] **FE-25** `app/api/bff/[...path]/route.ts` authenticated proxy for client mutations *(partial: forwards anonymously to `API_INTERNAL_URL`, drops hop-by-hop headers, `cookie` and `set-cookie`, returns 502 and 503 as problem JSON; no session or token)*
- [ ] **FE-97** BFF attaches `Authorization: Bearer` from the session, discards any `Authorization` header sent by the browser, retries once after a refresh on 401, and returns 401 problem JSON when refresh fails. Split from FE-25.
- [ ] **FE-98** BFF path allowlist: only path prefixes present in the pinned spec are forwarded (list generated at `api:gen` time into `src/lib/api/generated/bff-allowlist.ts`); `..`, encoded slashes and `/health` are rejected with 404; unit tests for traversal attempts.
- [ ] **FE-162** BFF auth-path guard: any request whose path starts with `auth/` (after normalising case, encoded slashes and dot segments) gets 404 problem JSON without reaching the API; register, login, Google exchange, refresh and logout are server actions or Auth.js callbacks only. Unit tests for `auth/login`, `AUTH/refresh`, `%61uth/logout` and `x/../auth/login`.
- [ ] **FE-99** BFF request limits: JSON bodies over 1 MB rejected with 413 problem JSON before reading the full stream; content types limited to JSON and `multipart/form-data` only where an endpoint needs it (file bytes go straight to S3 by presigned PUT, see `frontend/components/file-upload.md`).
- [ ] **FE-100** CSRF defence: for every non-GET BFF request, require `Origin` (or `Sec-Fetch-Site: same-origin`) to match the deployment origin, else 403; relies on `SameSite=Lax` as the second layer; tests for cross-site POST, missing Origin and same-origin.
- [ ] **FE-101** Client identity and rate limiting decision recorded in ARC-09: the API rate-limits per user id and per client IP; decide how the real client IP reaches the API behind Vercel (signed `X-Aptiverse-Client-IP` header with a shared secret the API trusts, or user id only for authenticated calls). No separate BFF rate limiter in v1 unless the decision says so.
- [ ] **FE-102** BFF observability: forwards `traceparent` and `x-request-id`, logs method, path template, status and duration only (no bodies, no headers with tokens), and tags Sentry with the request id.
- [ ] **FE-26** BFF streaming passthrough for SSE (tutor chat)
- [ ] **FE-103** SSE details: no response buffering, upstream aborted when the client disconnects, `maxDuration` set in route config to cover the longest tutor answer, heartbeat comments pass through; Playwright test streams a mock response chunk by chunk. Split from FE-26.

### Route protection

- [ ] **FE-27** `proxy.ts`: protect `(app)` and redirect signed-out visitors to `/login?next=<path>` *(partial: `src/proxy.ts` has the matcher for `/dashboard`, `/onboarding`, `/parent`, `/refer`, `/admin`; no session check)*
- [ ] **FE-104** Role routing in `proxy.ts`: student home `/dashboard`, parent `/parent`, admin `/admin`; a signed-in user hitting another role's area is redirected to their own home. Split from FE-27.
- [ ] **FE-105** Onboarding redirect: a student or parent with `onboardingComplete: false` in the session is sent to `/onboarding` from any `(app)` route except `/onboarding` and sign-out. Split from FE-27.
- [ ] **FE-106** Open-redirect guard: the one redirect parameter is `next`; it accepts only same-origin relative paths (starts with `/`, not `//`, no scheme, no backslash); unit tests for the bypass list.

### Impersonation and verification

- [ ] **FE-28** Impersonation banner support from `/me`
- [ ] **FE-107** Impersonation session details: banner slot in the shell (`frontend/shell.md` SHL-24) shows who is being viewed and an "End impersonation" action; the session marks `impersonatedBy`; Sentry and logs carry the admin id; destructive actions are blocked while impersonating unless the API allows them. Split from FE-28.
- [ ] **FE-29** Verify no token reachable from browser JS (devtools check, Playwright assertion)
- [ ] **FE-108** Playwright assertion suite: `document.cookie` has no session cookie, `localStorage` and `sessionStorage` hold no `eyJ` strings, no `eyJ` substring in RSC payloads, HTML or BFF responses captured during a full sign-in, dashboard and mutation run. Split from FE-29.
- [ ] **FE-110** Auth telemetry without PII: sign-in failures counted by reason (Sentry breadcrumb or metric) with no email or IP; lockout and rate-limit copy reviewed against `pages/auth/login.md`.
- [ ] **FE-111** ASVS L2 mapping for the web tier: a table of V3 (session) and V4 (access control) requirements against FE tasks and tests, kept in this file's Verification section, reviewed in `launch/security.md`.

## Verification

1. Sign in as each seeded role (ARC-32): cookie in devtools is `__Host-aptiverse.session`, `HttpOnly`, `Secure`, `SameSite=Lax` (FE-91).
2. `e2e/security.spec.ts` passes: no token in JS-reachable storage or payloads (FE-108), cross-site POST to `/api/bff/...` returns 403 (FE-100), `/login?next=//evil.example` lands on the role home (FE-106).
3. Expire the access token (mock API clock): five parallel requests trigger exactly one refresh (FE-93).
4. Revoke the refresh token at the API: next request signs the user out to `/login` (FE-23).
5. A student visiting `/admin` is redirected to `/dashboard`; an incomplete student is redirected to `/onboarding` (FE-104, FE-105).
6. Tutor chat streams token by token through `/api/bff` and stops upstream when the tab closes (FE-103).

ASVS L2 mapping table (filled by FE-111):

| ASVS | Requirement (short) | Task | Test |
|---|---|---|---|
| V3.2 | Session token generated on auth, rotated on privilege change | FE-88, FE-94 | unit |
| V3.3 | Idle and absolute timeouts, logout invalidates | FE-94, FE-109 | e2e |
| V3.4 | Cookie attributes (`Secure`, `HttpOnly`, `SameSite`, `__Host-`) | FE-91 | e2e |
| V4.1 | Access control enforced server side | FE-95, FE-104 | unit, e2e |
| V4.2 | CSRF protection on state-changing requests | FE-100 | e2e |

## Open questions

- Session lifetimes per role (FE-94): agree numbers with the API refresh-token lifetime.
- How the API learns the real client IP behind Vercel (FE-101).
- Does the BFF allowlist come from the spec (FE-98) or from a hand-kept list of client-callable tags?
- Impersonation: are any writes allowed while impersonating (FE-107)?
