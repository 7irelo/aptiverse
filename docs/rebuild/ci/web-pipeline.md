# Web pipeline

| | |
|---|---|
| ID range | `CI-20` to `CI-29`, `CI-70` to `CI-79` |
| Phase | 1 (CI-22, CI-28 and CI-75 finish by Phase 2 exit; CI-25 by Phase 3 exit) |
| Depends on | CI-50 (versioned spec), `infra/vercel.md`, `infra/local-compose.md`, FE-51, FE-53, `ci/shared-workflows.md`, REPO-02 |
| Code path | `web/.github/workflows/ci.yml`, `web/playwright.config.ts`, `web/e2e/`, `web/scripts/api-sync.mjs`, `web/scripts/api-check.mjs`, `web/vercel.json`, `web/next.config.ts` |
| Status | 20 tasks: 1 done, 3 partial, 1 unverified, 15 not started. One job runs lint, format, typecheck, Vitest, client drift, build and Playwright against a mock API. |

## Purpose

Every web PR and merge proves the app builds, matches the pinned API contract, passes unit, E2E and accessibility checks on mobile first, stays inside performance budgets, and then reaches Vercel: a preview per PR, dev on main, and prod by promoting the exact deployment that passed, never a rebuild.

## Scope

Workflow `web/.github/workflows/ci.yml` (today one job `verify`, 30 minute timeout). Target jobs:

| Job (required check name) | Trigger | Does |
|---|---|---|
| `web / static` | PR, push | `npm ci`, lint, format check, typecheck, `npm audit` gate |
| `web / unit` | PR, push | Vitest with coverage |
| `web / contract` | PR, push | `api:check` against the pinned spec version |
| `web / build` | PR, push | `next build`, bundle size report |
| `web / e2e` | PR, push | Playwright against the ephemeral compose stack, axe in every spec |
| `web / lighthouse` | PR | Lighthouse CI mobile budgets against the build |
| `web / codeql` | PR, push, weekly | CodeQL JavaScript and TypeScript (shared workflow) |
| `web / preview-smoke` | Vercel `deployment_status` success on preview | smoke specs against the preview URL |
| `web / release` | tag `v*` | Sentry release, promote the tested Vercel deployment to prod, release notes |

Inputs: `API_SPEC_URL` resolved from `openapi/spec-version` (CI-27), Vercel project and team ids, `VERCEL_TOKEN` scoped to the project, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. Outputs: Playwright report (14 days), Lighthouse report, SBOM, bundle report.

## Tasks

### Static checks and tests

- [x] **CI-20** Lint, typecheck, Vitest (`ci.yml` steps `Lint`, `Format check`, `Typecheck`, `Unit tests`)
- [ ] **CI-78** Split the single `verify` job into the parallel jobs above with stable names, each with `timeout-minutes` and `npm` cache, so branch protection (REPO-02) can require them individually
- [ ] **CI-77** Publish the list of required check names in `phase-0/repositories.md` input and keep it in sync: renaming a job is a breaking change for branch protection
- [ ] **CI-70** `npm audit --omit=dev --audit-level=high` gate plus a full `npm audit` report as a job summary; exceptions only through an allowlist with reason and expiry (policy in `phase-0/security-baseline.md`)
- [ ] **CI-71** Generate a CycloneDX SBOM (`npx @cyclonedx/cyclonedx-npm --omit dev`) on main and tags, attach it to the GitHub release on tags
- [ ] **CI-72** CodeQL JavaScript and TypeScript through the shared reusable workflow, `security-extended`, weekly schedule plus PR

### Contract

- [ ] **CI-21** `api:sync` against pinned spec, fail on client drift *(partial: `api:check` regenerates from the committed `openapi/api-spec.json` and fails on a diff; nothing pins which API spec version that file came from)*
- [ ] **CI-27** Add `openapi/spec-version` (for example `spec-v1.142`); `api:sync` downloads that release asset from `aptiverse-labs/api` (CI-50) and `api:check` verifies the committed spec's hash matches the asset before regenerating (split from CI-21)
- [ ] **CI-22** Bot PR in web when api publishes a new spec: a workflow on `repository_dispatch` (sent by CI-50) bumps `openapi/spec-version`, runs `api:sync` and `api:gen`, and opens or updates one PR `chore(api): sync spec spec-v1.N` with the oasdiff summary in the body

### End to end and accessibility

- [ ] **CI-23** Playwright against ephemeral compose stack (API image plus seeded Postgres), mobile projects first *(partial: Pixel 7, iPhone 14 and Desktop Chrome projects exist in `playwright.config.ts`; the API is `e2e/mock-api.mjs`, not the real image)*
- [ ] **CI-28** E2E stack job: check out `aptiverse-labs/infra` `local/compose.yml` at a pinned ref, add the api image at the sha named by the pinned spec release, run `migrate` then `seed` (ARC-32 seed data), start the web build against it, run the Playwright suite; keep the mock API project only for the API-down scenario (split from CI-23)
- [ ] **CI-24** axe checks inside E2E *(partial: `e2e/help.spec.ts` runs `AxeBuilder` with WCAG tags in light and dark; there is no shared fixture yet)*
- [ ] **CI-29** Every spec uses the shared axe fixture from FE-53, and a lint or grep check fails the job when a spec file under `e2e/` does not call it; zero violations allowed (split from CI-24)
- [ ] **CI-79** Flake policy: retries stay at 2 in CI, a test that passes only on retry is reported in the job summary, and a `@quarantine` tag runs in a separate non-blocking job with an issue link and a 14 day expiry

### Performance

- [ ] **CI-25** Lighthouse CI mobile budgets (LCP under 2.5s, JS under 150 KB gzip per route): `lighthouserc.json` with the mobile preset, run against `next start` on the PR build for the routes in the gallery and shell (FE-55), assertions as errors
- [ ] **CI-73** Bundle size report: parse `next build` output (or `@next/bundle-analyzer` stats) into a per-route gzip table posted as a PR comment with the delta against main; warn at plus 10 KB, fail over the 150 KB budget

### Deploy

- [ ] **CI-26** Vercel deploy (preview per PR, dev on main, prod on tag) *(unverified: Vercel git integration lives in the Vercel project settings, not the repo; `vercel.json` only pins `cpt1`)*
- [ ] **CI-74** Preview smoke: on Vercel `deployment_status` success for a PR preview, run a tagged smoke subset (`@smoke`: home, help, login page, 360px no horizontal scroll) against the preview URL using the protection bypass header for automation; failure marks the PR check red
- [ ] **CI-75** Prod promotion: the tag workflow finds the Vercel deployment built from the tagged commit that passed `preview-smoke` and dev checks, and runs `vercel promote <deployment-url>` (no rebuild); automatic production builds from git are disabled in the Vercel project (`infra/vercel.md`); the job runs in the GitHub environment `prod` with required reviewers
- [ ] **CI-76** Sentry release step: `sentry-cli releases new aptiverse-web@<sha>`, `set-commits --auto`, confirm source maps were uploaded by the Vercel build (`releases files list` is non-empty), then `deploys new -e <env>` on promotion; deploy marker also goes to Grafana (`observability/dashboards.md`)

## Verification

- A PR that changes `openapi/api-spec.json` by hand fails `web / contract` (hash does not match the pinned release asset).
- A PR adding an axe violation fails `web / e2e` in both light and dark projects.
- A PR adding 200 KB to a route fails `web / build` and `web / lighthouse`.
- `npm audit` with a known high advisory fails `web / static`.
- The prod deployment id on Vercel equals the preview deployment id that passed checks (`vercel inspect`), confirming promotion not rebuild.
- Each prod release has a Sentry release with non-empty artifacts and a deploy entry.

## Open questions

- Run the compose E2E stack on every PR (slower, real API) or only on main and nightly, keeping the mock API for PRs?
- Vercel preview protection: bypass token for automation stored as a GitHub secret, or Vercel OIDC trusted source?
- Should web tags be independent of api tags, or does a release always pair an api tag with a web tag?
- `CI-77` overlaps the branch protection task REPO-02; the list of names lives here and REPO-02 consumes it.
