# Skeleton

| | |
|---|---|
| ID | `UI-11`, `UI-64` |
| Phase | 3 |
| Depends on | FE-37 (motion tokens) |
| File path | `web/src/components/ui/skeleton.tsx` |
| Status | Done for the primitive (`animate-pulse rounded-md bg-muted`, `data-slot="skeleton"`). Follow-up for reduced motion and shape presets is not started. 1 of 2 tasks done. |

## Purpose

Placeholder shapes while a Server Component streams inside `Suspense` or a client query loads. Skeletons mirror the final layout so nothing jumps when data arrives. Used by `loading.tsx` files and `PageLoading` (see `frontend/components/page-states.md`).

## API

| Export | Props | Notes |
|---|---|---|
| `Skeleton` | `ComponentProps<"div">` | Existing. Size and shape come from `className`. |
| `SkeletonText` | `lines?: number` (default 3) | New (UI-64): text block with a shorter last line. |
| `SkeletonCard`, `SkeletonRow` | none | New (UI-64): presets matching Card and DataTable row heights. |

## Variants

Rectangle (default), circle (`rounded-full`, avatars), text block, card, row.

## States

Pulsing; static under `prefers-reduced-motion`.

## Accessibility

- Skeletons are decorative: `aria-hidden="true"` on the shapes; the surrounding region carries `aria-busy="true"` and an `sr-only` "Loading" label (owned by `PageLoading`).
- Pulse animation off under reduced motion (Tailwind `motion-safe:animate-pulse`).
- `bg-muted` must be distinguishable from `bg-card` in dark mode.
- RTL not required for v1.

## Tasks

- [x] **UI-11** Skeleton (shadcn primitive committed in `web/src/components/ui/skeleton.tsx`)
- [ ] **UI-64** Reduced-motion pulse (`motion-safe:`), `aria-hidden` by default, and `SkeletonText`, `SkeletonCard`, `SkeletonRow` presets

## Tests

- Vitest: `Skeleton` renders `aria-hidden`; `SkeletonText lines={4}` renders four bars.
- Playwright gallery `dev-ui-skeleton.spec.ts`: presets light and dark, 360 and 1440 snapshots with animations disabled; axe zero violations.

## Verification

1. With reduced motion emulated, no element has a running animation (`document.getAnimations()` is empty on the gallery section).
2. A page's `loading.tsx` and its loaded state have the same block heights (visual diff of layout shift, CLS near 0).

## Open questions

- None.
