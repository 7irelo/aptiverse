# Toast

| | |
|---|---|
| ID | `UI-10`, `UI-62` to `UI-63` |
| Phase | 3 |
| Depends on | `sonner` (installed), FE-31, FE-37 |
| File path | `web/src/components/ui/sonner.tsx` (committed); `web/src/lib/toast.ts` (to add) |
| Status | Partial. `Toaster` wraps sonner with `theme="system"`, Lucide icons (`CircleCheck`, `Info`, `TriangleAlert`, `OctagonX`, `Loader2`) and popover tokens. It is not mounted in `web/src/app/layout.tsx`, and there is no app-level helper or copy rule. 0 of 3 tasks done, 1 partial. |

## Purpose

Brief, non-blocking confirmation of something the user just did (Saved, Assessment added, Link copied) and transient errors from client mutations. Replaces notistack from the old app. Never used for information the user must act on; that goes on the page.

## API

| Export | Signature | Notes |
|---|---|---|
| `Toaster` | sonner `ToasterProps` | Mounted once in the root layout (UI-62). Position `bottom-center` on phones above the bottom nav, `bottom-right` from `md`. |
| `notify.success(message, options?)` | `string`, `{ description?, action? }` | New (UI-63) thin wrapper over sonner. |
| `notify.error(error)` | `ApiError` or `string` | New: maps ProblemDetails `title` to plain copy, appends a short trace reference when present, never shows raw exception text. |
| `notify.promise(promise, messages)` | sonner promise | New: loading then success or error. |

## Variants

success, info, warning, error, loading. Colours from semantic tokens; icons Lucide only; no confetti or celebratory motion.

## States

Entering, visible (auto dismiss 5s, errors 8s), paused on hover or focus, dismissed, action clicked.

## Accessibility

- sonner uses an `aria-live` region (`polite`; errors `assertive`).
- Toasts with an action (Undo) stay until dismissed or timed out at 10s minimum, and the action is keyboard reachable via the toaster hotkey.
- Never the only feedback for a failed form submit; the form shows field errors (UI-46).
- Motion off under reduced motion.
- RTL not required for v1.

## Tasks

- [ ] **UI-10** Toast (replaces notistack) *(partial: `Toaster` in `web/src/components/ui/sonner.tsx` committed but not mounted; mounting and helper split into UI-62 and UI-63)*
- [ ] **UI-62** Mount `Toaster` in `web/src/app/layout.tsx`; position and offset clear of the mobile bottom nav and safe area; token colours per tone
- [ ] **UI-63** `notify` helper in `web/src/lib/toast.ts` with ProblemDetails mapping, durations and copy rules (no emojis, no em dashes, sentence case)

## Tests

- Vitest: `notify.error(new ApiError(500, { title, traceId }))` shows plain copy with the reference and no stack text.
- Playwright `dev-ui-toast.spec.ts`: toast visible above the bottom nav at 360px on Pixel 7 and iPhone 14; announced through the live region; axe zero violations; light and dark snapshots.

## Verification

1. Trigger a toast from the gallery with keyboard only and reach its action.
2. Grep the app: no direct `toast(` calls outside `lib/toast.ts` (lint rule optional, see `frontend/guardrails.md`).

## Open questions

- Should the trace reference shown in error toasts be the full `traceId` or a short form support staff can search?
