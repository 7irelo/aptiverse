# PageStates

| | |
|---|---|
| ID | `UI-21` (split: `UI-73` to `UI-79`) |
| Phase | 3 |
| Depends on | UI-11, UI-22, UI-32, FE-31 |
| File path | `web/src/components/shell/page-states.tsx`, `web/src/components/shell/page-error.tsx`, legacy `web/src/components/shell/page-state.tsx` |
| Status | 0 of 8 done, 1 partial (WIP states plus an older committed component), 7 not started |

## Purpose

One set of page level states so the same situation always looks and reads the same: loading, empty, error with retry, not found, forbidden and upgrade. Route segment files (`loading.tsx`, `error.tsx`, `not-found.tsx`) render these directly, and pages render them for empty, forbidden and upgrade cases.

## API

| Export | Props | Notes |
|---|---|---|
| `PageLoading` | `cards?: number` (3), `className?` | `role="status"`, `aria-live="polite"`, visually hidden "Loading", skeleton header plus card grid mirroring PageShell. |
| `PageEmpty` | `title?` ("Nothing here yet"), `description?`, `action?`, `className?` | Wraps `EmptyState` (UI-22) with `headingLevel={2}`. |
| `PageError` (client) | `title?` ("We could not load this page"), `description?`, `onRetry: () => void`, `className?` | Retry button with Lucide `RotateCcw`, 44px. In `error.tsx` pass the Next 16 `retry` prop. |
| `PageForbidden` | `title?`, `description?`, `action?` (default "Back to your dashboard" link) | Lucide `ShieldAlert` in warning tone. |
| `UpgradeGate` | see [upgrade-gate.md](upgrade-gate.md) | Currently lives in this file; UI-129 moves it out. |
| `PageNotFound` (planned, UI-75) | `title?`, `description?`, `action?` | Lucide `Compass`, link back to the role home. |
| `PageState` (legacy) | `icon: "loading" \| "error" \| "empty" \| "not-found"`, `title`, `description?`, `children?` | Committed earlier, used by `dashboard/page.tsx`, the help route and `PageError`; referenced in `web/CLAUDE.md`. |

## Variants

Loading, empty, error, not found, forbidden, upgrade, plus no evidence (UI-76) for pages whose data exists but has no marks yet.

## States and copy

| State | Title | Body | Action |
|---|---|---|---|
| Loading | (sr-only) "Loading" | skeleton | none |
| Empty | "Nothing here yet" | page specific, says what will appear | one next step |
| Error | "We could not load this page" | "This is on our side, not yours. Check your connection and try again in a moment." | "Try again" |
| Not found | "We could not find that page" | "It may have moved, or the link is out of date." | "Go to your dashboard" |
| Forbidden | "You do not have access to this page" | "If you think you should, ask the person who manages your account, or contact support." | "Back to your dashboard" |
| No evidence | "No marks yet" | "Add an assessment result and this will fill in." | page specific |

## Accessibility

- Loading announces once through a polite live region; skeleton blocks are `aria-hidden`.
- Each state has one heading at the level the page outline needs (h2 inside PageShell).
- Heading ids must be unique per page (UI-74): `forbidden-title` and `upgrade-title` are hard coded today and collide if two states render together.
- Retry and back actions are 44px real buttons or links; focus moves to the state heading after a client side error boundary renders.
- Icons are `aria-hidden`; meaning is in the text. Spinners stop under `prefers-reduced-motion`.

## Tasks

- [ ] **UI-21** PageStates: loading, empty, error (retry), forbidden, upgrade *(partial: `PageLoading`, `PageEmpty`, `PageForbidden`, `UpgradeGate` in `page-states.tsx` and `PageError` in `page-error.tsx` are uncommitted WIP; the older committed `page-state.tsx` still serves dashboard and help)*
- [ ] **UI-73** Consolidate `page-state.tsx` and `page-states.tsx` into one module, migrate the dashboard, help and `PageError` call sites, and update the `PageState` reference in `web/CLAUDE.md`
- [ ] **UI-74** Replace hard coded heading ids with `useId` (or a passed id) in forbidden and upgrade states
- [ ] **UI-75** Add `PageNotFound` and use it in `app/not-found.tsx` and segment `not-found.tsx` files
- [ ] **UI-76** Add a no evidence variant ("No marks yet") distinct from empty, for pages backed by real data with nothing measured
- [ ] **UI-77** Error state shows a short reference from the ProblemDetails `traceId` when present ("Reference: ab12cd"), never the raw message
- [ ] **UI-78** Focus management: move focus to the state heading when an error boundary or forbidden state replaces content on the client
- [ ] **UI-79** Tests: Vitest per state (role, heading level, default copy, retry calls `onRetry`) and Playwright gallery snapshots of every state light and dark at 360 and 1440, axe zero violations

## Tests

- Vitest `page-states.test.tsx`: loading has `role="status"`; empty renders h2; error retry button calls the handler once; forbidden default link points at `/dashboard`; two states on one page produce unique ids.
- Playwright: existing `e2e/help.spec.ts` "shows a retry state when the API is down" keeps passing after UI-73; `gallery/page-states.spec.ts` snapshots and axe.

## Verification

1. `rg "page-state\"" web/src` returns nothing after UI-73.
2. Stop the mock API and load `/help`: the error state renders with "Try again", and retry recovers once the API is back.
3. axe clean on every state in light and dark.

## Open questions

- Should forbidden and not found share copy for resources the user cannot see (to avoid revealing existence), as the API may return 404 for both?
- Where should "Back to your dashboard" point for parents and admins (role home from the session, once FE-24 lands)?
