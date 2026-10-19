# Frontend skeleton

| | |
|---|---|
| ID range | `FE-01` to `FE-14`, `FE-65` to `FE-87`, `FE-161`, `FE-164`, `FE-166` |
| Phase | 1 (FE-65 to FE-87 spread over 1, 2 and 10 as noted) |
| Depends on | `ARC-07` (frontend stack ADR), `ARC-08` (contract ADR), `CI-20`, `CI-21`, `INF-25` (Vercel) |
| Code path | `web/` (`package.json`, `next.config.ts`, `orval.config.ts`, `scripts/`, `src/app`, `src/lib`, `src/instrumentation*.ts`) |
| Status | 40 tasks: 9 done, 4 partial, 1 unverified, 26 not started |

## Purpose

The Next.js 16 application frame every page sits in: framework, styling pipeline, generated API client, the one HTTP client, telemetry, fonts, security headers and environment configuration. Nothing here renders product features; it makes every later page cheap and safe to build.

## Scope

- Files: `web/package.json`, `web/tsconfig.json`, `web/next.config.ts`, `web/vercel.json`, `web/.env.example`, `web/orval.config.ts`, `web/scripts/api-sync.mjs`, `web/scripts/api-check.mjs`, `web/openapi/api-spec.json`, `web/src/lib/api/fetcher.ts`, `web/src/lib/api/generated/**` (generated, never edited), `web/src/components/providers/query-provider.tsx`, `web/src/instrumentation.ts`, `web/src/instrumentation-client.ts`, `web/src/app/layout.tsx`, `web/src/app/error.tsx`, `web/src/app/global-error.tsx`, `web/src/proxy.ts`.
- New files this backlog adds: `web/openapi/spec-version.json`, `web/src/lib/api/server-fetch.ts`, `web/src/lib/api/query-keys.ts`, `web/src/lib/env.ts`, `web/src/lib/format/money.ts`, `web/src/lib/format/date.ts`, `web/src/lib/flags.ts`, `web/src/fonts/`, `web/src/app/robots.ts`, `web/src/app/sitemap.ts`, `web/src/app/api/revalidate/route.ts`.
- Inputs: the API's `openapi/v1.json` published by `ci/api-pipeline.md` (CI-07), Vercel environment variables (`infra/vercel.md`), Sentry project and DSN.
- Outputs: a production build on Vercel `cpt1` with security headers on every response, a generated client in sync with a pinned spec, and Sentry plus Speed Insights telemetry.
- Out of scope: auth and the BFF session (`frontend/auth-bff.md`), tokens (`frontend/tokens.md`), components (`frontend/components/`), CI wiring (`ci/web-pipeline.md`).

## Tasks

### Framework and layout

- [x] **FE-01** Fresh Next 16 + React 19 app, TypeScript strict (`next` 16.4.2, `react` 19.3.0, `"strict": true` in `tsconfig.json`)
- [x] **FE-02** Tailwind v4 setup (`@tailwindcss/turbopack` rule in `next.config.ts`, `@theme inline` in `src/app/globals.css`)
- [x] **FE-03** shadcn/ui init, components owned in `components/ui/` (`components.json`; base CSS vendored in `src/styles/shadcn.css` to avoid the CLI dependency)
- [x] **FE-04** Folder layout: `app/(marketing)`, `app/(auth)`, `app/(app)`, `features/`, `components/{ui,shell}`, `lib/` (all present; `features/support` is the first domain; `components/common` added for composites)

### Generated client

- [x] **FE-05** Orval config: TanStack Query hooks plus zod schemas into `lib/api/generated/` (`orval.config.ts`, `tags-split`, `react-query` and `zod` targets, plain header without emoji)
- [ ] **FE-06** `npm run api:sync` pulls the pinned spec version and regenerates *(partial: `scripts/api-sync.mjs` copies from `API_SPEC_URL` or the sibling `../api/openapi/v1.json`; no pinned version is recorded, so "pinned" is not enforced; see FE-65)*
- [ ] **FE-65** Pinned spec record: `api:sync` writes `openapi/spec-version.json` (`version`, `apiCommitSha`, `sourceUrl`, `sha256`); `api:check` fails when the committed spec hash differs from the record. Split from FE-06.
- [ ] **FE-07** One HTTP client (fetch) used by generated hooks; server variant with session token *(partial: `src/lib/api/fetcher.ts` is the only client, server calls go to `API_INTERNAL_URL` and browser calls to `/api/bff`; the server path attaches no token yet)*
- [ ] **FE-66** `src/lib/api/server-fetch.ts` (`import "server-only"`): reads the session (FE-24) and adds `Authorization: Bearer`, forwards `traceparent`, never logs bodies; used by `features/*/server/` loaders. Split from FE-07. Depends on FE-22.
- [ ] **FE-67** `ApiError` carries `traceId` from ProblemDetails and the HTTP status; responses are parsed with the generated zod schema in server loaders; unit tests for 400 (validation errors map), 401, 403, 404, 409, 429, 5xx and non-JSON bodies. Split from FE-07.
- [ ] **FE-08** `queryKeys` factory port (`src/lib/api/query-keys.ts`, one namespace per API tag, keys aligned with Orval's generated keys so invalidation hits both)
- [ ] **FE-68** QueryClient defaults: no retry on 4xx, one retry on network and 5xx with backoff, `staleTime` per data class documented; unit test for the retry predicate (`src/components/providers/query-provider.tsx`)

### Request proxy and telemetry

- [x] **FE-09** `proxy.ts` placeholder (`src/proxy.ts`, matcher for `(app)` prefixes, no logic yet)
- [x] **FE-10** Sentry (server, edge, client) (`src/instrumentation.ts`, `src/instrumentation-client.ts`, `withSentryConfig` in `next.config.ts`; off without DSN)
- [x] **FE-11** Vercel Analytics and Speed Insights (`<Analytics />` and `<SpeedInsights />` in `src/app/layout.tsx`)
- [ ] **FE-79** Sentry privacy: `sendDefaultPii: false`, `beforeSend` and `beforeSendTransaction` scrub emails, cookies, `Authorization`, query strings named `token`, `code`, `email`; Session Replay stays off (minors). Unit test feeds a sample event through the scrubber. Phase 1.
- [ ] **FE-80** Sentry release and environment: release = git sha (`VERCEL_GIT_COMMIT_SHA`), environment from `NEXT_PUBLIC_APP_ENV`, `tracesSampleRate` per environment (1.0 dev, 0.2 staging, 0.1 prod) from config, not hard-coded. Phase 1.
- [ ] **FE-87** Route error boundaries: every `error.tsx` and `global-error.tsx` reports through one `reportError(error, context)` helper that tags route and role (never user email), so FE-79 scrubbing applies everywhere. Phase 3.

### Fonts

- [ ] **FE-12** Frygia via self-hosted, licensed font files; fallback stack `[risk: licence]` *(partial: `src/app/layout.tsx` documents the system UI stack in `tokens.css` as the fallback; no font files; the backlog said Roboto fallback, the code uses the system stack)*
- [ ] **FE-69** Record the fallback decision (system UI stack or Roboto) in the frontend ADR (ARC-07) and update FE-12 wording to match. Split from FE-12.
- [ ] **FE-70** Licensed Frygia `.woff2` files in `src/fonts/`, loaded with `next/font/local` (`display: "swap"`, preload of the regular weight only, `adjustFontFallback`), wired to `--font-family-sans`. Split from FE-12. Depends on HRD-62 (licence bought).

### Security headers

- [x] **FE-13** Security headers: CSP, HSTS, frame-ancestors, referrer policy (`next.config.ts`: CSP with `frame-ancestors 'none'`, `object-src 'none'`, HSTS two years with preload, `X-Frame-Options: DENY`, `nosniff`, `strict-origin-when-cross-origin`, Permissions-Policy; `script-src` still allows `'unsafe-inline'`)
- [ ] **FE-71** Nonce-based CSP: `src/proxy.ts` generates a per-request nonce for dynamic routes, sets `Content-Security-Policy` with `'nonce-...' 'strict-dynamic'` and drops `'unsafe-inline'` from `script-src`; static marketing routes keep the header from `next.config.ts`. Phase 10. Split from FE-13.
- [ ] **FE-72** CSP reporting: `Reporting-Endpoints` plus `report-to` (and `report-uri` fallback) pointing at the Sentry security endpoint; roll out FE-71 first as `Content-Security-Policy-Report-Only` in staging for one week with zero unexpected reports. Phase 10.
- [ ] **FE-73** Trusted Types decision recorded in ARC-07: adopt `require-trusted-types-for 'script'` in report-only mode, or reject with reason (KaTeX and react-markdown are the only HTML sinks). Note in the same record: SRI is not needed because every script is first-party from the deployment origin or `va.vercel-scripts.com`. Phase 10.
- [ ] **FE-74** Header regression test: Playwright request checks every header above on `/`, `/help`, `/dashboard`, `/login` and one `/api/bff/...` response, in CI (`e2e/security.spec.ts`, see `frontend/testing.md` FE-148).
- [ ] **FE-75** Cross-origin isolation headers: `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin` added in `next.config.ts`, verified not to break Google sign-in popups or redirects.
- [ ] **FE-86** Indexing control: `src/app/robots.ts` and `src/app/sitemap.ts` list marketing routes only; `(app)`, `(auth)`, `/dev/*` and every non-production deployment send `X-Robots-Tag: noindex` (header keyed on `VERCEL_ENV`).

### Environment and configuration

- [ ] **FE-14** `.env.example` documenting every variable *(partial: documents `API_INTERNAL_URL`, `API_SPEC_URL`, `NEXT_PUBLIC_APP_ENV` and Sentry vars; missing `APTIVERSE_DEV_TOOLS` and the Phase 2 Auth.js and Google variables)*
- [ ] **FE-76** `src/lib/env.ts`: zod schema for server and public env, parsed once at startup; a missing required value fails `next build` and boot with a clear message. Split from FE-14.
- [ ] **FE-77** `scripts/check-env-example.mjs`: every `process.env.X` referenced in `src/` appears in `.env.example` with a comment; runs in `npm run lint`. Split from FE-14.
- [ ] **FE-78** Per-environment variable matrix (local, preview, dev, staging, prod) for every key, kept in `infra/vercel.md`; Vercel values match it. Split from FE-14. *(unverified: Vercel project settings are not in the repo)*

### Formatting, locale and flags

- [ ] **FE-81** `src/lib/format/money.ts`: `formatMoney({ amountCents, currency })` renders `R1 234` (and `R1 234,50` only where cents matter), via `Intl.NumberFormat("en-ZA")` with the narrow no-break space normalised to the plain space the copy rules use; unit tests for 0, negatives, millions and non-ZAR codes. The foundation owns this helper: page tasks (for example PG-BIL-CHECKOUT-04) consume it and must not create their own copy.
- [ ] **FE-82** `src/lib/format/date.ts`: every date and time renders in `Africa/Johannesburg` unless the session carries a user time zone; relative ("in 3 days") and absolute formats; no `new Date().toLocaleString()` elsewhere (lint rule in `frontend/guardrails.md`); unit tests across midnight UTC boundaries. The foundation owns this helper: page tasks (for example PG-CMN-NOTIF-03) consume it and must not create their own copy. It also absorbs `src/lib/dates/sast.ts`, which page task PG-STU-ASMT-LIST-07 currently creates: SAST helpers (start and end of day in Africa/Johannesburg, due-date bucketing such as "today", "this week", "overdue") live in `src/lib/format/date.ts`, and that page task consumes them.
- [ ] **FE-83** Locale decision recorded in ARC-07: v1 is English (`lang="en-ZA"`) only, copy lives next to its feature, no i18n framework; numbers, money and dates always go through FE-81 and FE-82 so a later translation pass touches strings only.
- [ ] **FE-84** `src/lib/flags.ts`: flags are evaluated on the server only (`isEnabled(key)` in Server Components, route handlers and server actions); client leaves receive the resolved boolean as a prop, never the flag set. Keys are a typed union with a safe default per key (off for new features, on for kill switches), read from the session (`/me`) with a server-config fallback, and a failed lookup returns the default. Risky releases (new billing flows, tutor model changes) ship behind a flag. Unit tests for defaults, unknown keys and lookup failure. Depends on the `/me` slice in the backend Identity docs. Initial keys already used by page specs: `progress-pages`, `goals`, `careers`, `wellbeing` (`goal-pledges` is not declared in v1: pledges are deferred, decision 6) (pages in other areas add more; each new key is added here with its default, never declared inside a page task). The wellbeing support page (crisis and help contacts) is never behind a flag, including when `wellbeing` is off; a unit test asserts its route ignores flags.
- [ ] **FE-161** `src/app/api/revalidate/route.ts`: signed on-demand revalidation. POST only, body `{ tags: string[] }` with an HMAC-SHA256 signature header over the raw body and a timestamp (reject if older than 5 minutes), secret `REVALIDATE_SECRET` from env (FE-76); only tags from a typed allowlist (for example `plans`, `faqs`) are accepted and passed to `revalidateTag`; 401 on bad signature, 400 on unknown tag; unit tests for each case. Callers: the API or an admin action after plan or FAQ changes (PG-MKT-PRICE-13 relies on this).
- [ ] **FE-164** Caching safety rule, written into `web/CLAUDE.md` (Rendering): shared `"use cache"` (with `cacheLife` and `cacheTag`) is allowed only for public data that is identical for every visitor (CAPS catalog, plans and pricing, FAQs, marketing content). Any loader that reads the session, cookies, headers or a user id is either uncached (per request) or uses the private cache variant (`"use cache: private"`) if the Next 16.4 docs in `web/node_modules/next/dist/docs` confirm its semantics (per user, never shared across requests from different users); record what the docs say in the task PR. User-scoped loaders live under `src/features/<domain>/server/` with a `user-` filename prefix or a `// cache: user` marker so the guard in FE-165 can find them. Phase 2.
- [ ] **FE-166** Verify caching safety end to end: a Playwright spec signs in as two different students in two browser contexts, loads the dashboard and one user-scoped list in an interleaved order, and asserts each sees only their own name and data; plus a production build check that no user-scoped route is reported as statically prerendered in the `next build` output. Phase 2, re-run in Phase 10 (HRD security pass).

### Performance budgets

- [ ] **FE-85** Web vitals budgets recorded and enforced: LCP under 2.5 s, INP under 200 ms, CLS under 0.1 on mobile; JS under 150 KB gzip per route. `npm run analyze` (bundle analyzer) script; budget enforcement lives in CI-25 (`ci/web-pipeline.md`); Speed Insights field data reviewed per release.

## Verification

1. `npm ci && npm run lint && npm run typecheck && npm test && npm run build` pass from a clean clone.
2. `npm run api:sync && npm run api:gen && git status` shows no change when the pinned spec is current; editing one byte of `openapi/api-spec.json` makes `npm run api:check` fail (FE-65).
3. `curl -sI https://<preview>/` shows CSP, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy, COOP, CORP and `X-Robots-Tag: noindex` on a preview (FE-13, FE-75, FE-86).
4. A thrown error in a test page appears in Sentry with release sha, environment and no email or cookie fields (FE-79, FE-80).
5. Removing `API_INTERNAL_URL` from the environment fails `next build` with the FE-76 message.
6. `formatMoney({ amountCents: 123400, currency: "ZAR" })` returns `R1 234` (FE-81).

## Open questions

- Fallback font: the original backlog said Roboto, the code uses the system UI stack (FE-69).
- Should `spec-version.json` pin a GitHub release tag or a commit sha artifact URL (depends on how CI-07 publishes)?
- Trusted Types: is the cost worth it with only KaTeX and Markdown as HTML sinks (FE-73)?
- Decided (66): typed config flags in `web/src/lib/flags.ts` and API options; no third-party flag service in v1 (FE-84).
