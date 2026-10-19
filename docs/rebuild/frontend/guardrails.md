# Frontend guardrails

| | |
|---|---|
| ID range | `FE-40` to `FE-46`, `FE-127` to `FE-137`, `FE-163`, `FE-165` |
| Phase | 3 |
| Depends on | `FE-30`, `FE-50`, `FE-51`, `CI-20` |
| Code path | `web/eslint.config.mjs`, `web/eslint/aptiverse-plugin.mjs`, `web/scripts/`, `web/src/app/dev/` (new) |
| Status | 20 tasks: 2 done, 2 partial, 0 unverified, 16 not started |

## Purpose

Turn the product and code rules (tokens only, Lucide only, no emojis or long dashes, server-first rendering, generated client only, real data only) into automated checks that fail the build, so review does not depend on memory.

## Scope

- `eslint.config.mjs` (flat config: Next core web vitals, Next TypeScript, Prettier, local `aptiverse` plugin, `no-restricted-imports`).
- `eslint/aptiverse-plugin.mjs` (rules `no-hex-colors`, `no-emoji-or-long-dash`; new rules below).
- New: `scripts/check-copy.mjs`, `scripts/check-licenses.mjs`, `eslint/aptiverse-plugin.test.mjs`, `src/app/dev/ui/page.tsx`, `e2e/gallery.spec.ts`.
- Every rule runs through `npm run lint`, which `ci/web-pipeline.md` (CI-20) runs on every PR.

## Tasks

### Styling and icons

- [x] **FE-40** ESLint rule: no hex literals outside `tokens.css` (`aptiverse/no-hex-colors` in `eslint/aptiverse-plugin.mjs`, enabled as error)
- [x] **FE-41** ESLint rule: ban `@mui/*` imports (`no-restricted-imports` bans `@mui/*`, `@emotion/*` and other icon sets: `react-icons`, `@heroicons/*`, `@tabler/icons-react`, `@radix-ui/react-icons`, Phosphor)

- [ ] **FE-163** Google sign-in mark exception: the Google "G" logo is the one non-Lucide icon allowed (Google's brand rules require their mark on the sign-in button). It lives in exactly one file, `src/components/auth/google-mark.tsx`, as a single inline SVG component (`aria-hidden`, fixed brand colours kept in that file under a file-scoped `aptiverse/no-hex-colors` disable with a comment citing the brand guideline). `eslint.config.mjs` lists the exception by file path; a lint rule bans inline `<svg>` elements outside an allowlist (`google-mark.tsx`, plus data graphics such as `components/common/progress-ring.tsx` and the chart wrappers) and the existing import ban covers other icon packages. Documented in `web/CLAUDE.md` (Icons). Used only by the Google button in `pages/auth/login.md` and `pages/auth/register.md`.

### Copy

- [ ] **FE-42** String scanner: no emojis, no em dashes (lint and CI) *(partial: `aptiverse/no-emoji-or-long-dash` scans strings, JSX text and comments in JS and TS; Markdown, JSON, CSS, YAML and the OpenAPI spec are not scanned)*
- [ ] **FE-127** `scripts/check-copy.mjs`: scans `*.md`, `*.mdx`, `*.json` (excluding `package-lock.json`), `*.css`, `*.yml`, `*.html` in the repo for emoji ranges, U+2014 and U+2013; runs inside `npm run lint`. Split from FE-42.
- [ ] **FE-128** RuleTester unit tests for every rule in `eslint/aptiverse-plugin.mjs` (valid and invalid cases), run by `npm test`.

### Code shape

- [ ] **FE-43** ESLint: no `any` in `features/` (`@typescript-eslint/no-explicit-any: error` for `src/features/**` and `src/components/**`)
- [ ] **FE-44** ESLint: no hand-written fetch to the API outside `lib/api` (`no-restricted-globals` or `no-restricted-syntax` on `fetch` and on reading `API_INTERNAL_URL`, allowed only in `src/lib/api/**` and `src/app/api/bff/**`)
- [ ] **FE-129** Rule `aptiverse/no-client-pages`: `"use client"` is an error in any `page.tsx`, `layout.tsx` or `template.tsx` (web/CLAUDE.md rendering rule).
- [ ] **FE-130** Banned modules and globals: `axios`, `next-auth` (v4), `zustand`, `moment`, `@mui/*` already, and `Math.random` in `src/features/**` and `src/components/**` (real data only; tests exempt).
- [ ] **FE-131** `react/no-danger` as error with an allowlist of the two HTML sinks (`components/common/math-text.tsx`, `components/common/markdown.tsx`), each with a comment explaining the sanitising path.
- [ ] **FE-132** Browser storage rule: `localStorage` and `sessionStorage` banned outside `src/lib/analytics/consent.ts` and `src/lib/storage.ts` (no tokens or PII in browser storage; supports FE-108).
- [ ] **FE-133** Accessibility lint: `jsx-a11y` rules `no-static-element-interactions`, `click-events-have-key-events`, `anchor-is-valid` and `no-noninteractive-element-interactions` set to error (Next's preset leaves some as warnings).
- [ ] **FE-165** Caching guard (rule in FE-164): an `aptiverse/no-shared-cache-with-session` ESLint rule fails when a function or file containing a shared `"use cache"` directive also calls `cookies()`, `headers()`, `getSessionUser()`, `auth()` or imports from `src/lib/auth`; plus a Vitest test that scans `src/features/**/server/` and fails if any file marked user-scoped contains a shared `"use cache"` directive. Rule tests cover a passing public loader and a failing session loader.
- [ ] **FE-137** Dependency hygiene: `scripts/check-licenses.mjs` fails on GPL, AGPL or unknown licences in production dependencies; `.npmrc` sets `engine-strict=true`; adding a runtime dependency needs a line in the PR description (template from `phase-0/repositories.md`).

### Gallery and visual regression

- [ ] **FE-45** `/dev/ui` component gallery (non-prod only) *(partial: the gate exists in uncommitted WIP `src/lib/dev-tools.ts` (`devToolsEnabled()`, never on `VERCEL_ENV=production`); no route yet)*
- [ ] **FE-134** `src/app/dev/ui/page.tsx`: calls `notFound()` unless `devToolsEnabled()`, sends `noindex`; Playwright test that a production build without `APTIVERSE_DEV_TOOLS=1` returns 404. Split from FE-45.
- [ ] **FE-135** Gallery sections: one section per file in `frontend/components/`, showing every variant and state (default, hover via forced state, focus, disabled, loading, error, empty) plus the token table from FE-114. Split from FE-45.
- [ ] **FE-46** Playwright visual snapshots of the gallery (light and dark, 360 and 1440)
- [ ] **FE-136** Snapshot policy: baselines generated in the CI Linux container only, `maxDiffPixelRatio` 0.01, dynamic regions masked, an `update-snapshots` label workflow that commits new baselines for review. Split from FE-46.

## Verification

1. Each banned pattern in a scratch file (`#fff`, an emoji, a long dash, `import x from "@mui/material"`, `"use client"` in a page, `Math.random()` in a feature, `any` in a feature, `fetch(process.env.API_INTERNAL_URL)` in a component) makes `npm run lint` fail with the rule name.
2. `npm test` runs the RuleTester suite (FE-128).
3. `APTIVERSE_DEV_TOOLS` unset, `npm run build && npm start`: `/dev/ui` returns 404 (FE-134).
4. `npx playwright test e2e/gallery.spec.ts` produces four snapshots per section (360 and 1440, light and dark) with no diff on an unchanged tree.

## Open questions

- Google mark: does Google's current guideline allow a monochrome mark in dark mode, or must the four-colour mark sit on a white chip in both schemes (FE-163)?

- Should `check-copy.mjs` also scan commit messages, or leave that to commitlint (`phase-0/repositories.md`)?
- Storybook was the plan's alternative to `/dev/ui`; this backlog assumes `/dev/ui` only.
