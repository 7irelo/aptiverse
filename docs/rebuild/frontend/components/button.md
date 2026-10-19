# Button

| | |
|---|---|
| ID | `UI-01`, `UI-35` to `UI-38` |
| Phase | 3 |
| Depends on | FE-03, FE-35, FE-36, FE-37 (see `frontend/tokens.md`) |
| File path | `web/src/components/ui/button.tsx` |
| Status | Partial. Stock shadcn button is committed (six variants, ten sizes). No 44px minimum, no loading state, not restyled to the Aptiverse radius and focus tokens. 0 of 5 tasks done, 1 partial. |

## Purpose

The one clickable action primitive. Every action in the app is a real `button` (or a link rendered through `asChild`), so keyboard, focus and screen reader behaviour come for free. Pages never style raw `button` elements.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, `citron` | `default` | `citron` is new (UI-36): citron surface with `text-on-citron`, for the single primary call to action on a screen. |
| `size` | `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg` (today also `xs`, `icon-xs`) | `default` | `default` and `lg` become `min-h-11` (44px). Fate of `xs` and `icon-xs` is an open question. |
| `loading` | `boolean` | `false` | New (UI-37). Shows a spinning Lucide `LoaderCircle`, sets `aria-busy="true"` and `disabled`, keeps the label width stable. |
| `asChild` | `boolean` | `false` | Renders the child (for example `next/link`) with button styling via Radix `Slot`. |
| `type` | `button`, `submit`, `reset` | `button` | Default changes from the browser `submit` to `button` so stray buttons inside forms never submit (UI-35). |
| `...props` | `ComponentProps<"button">` | | `data-slot="button"`, `data-variant`, `data-size` stay as styling hooks. |

## Variants

| Variant | Use | Do not use for |
|---|---|---|
| `default` | Primary graphite action | Destructive actions |
| `citron` | The one signature call to action on a page (Start practice, See plans) | More than one per view; inline text links |
| `secondary` | Secondary action beside a primary | |
| `outline` | Tertiary action, toolbar buttons | |
| `ghost` | Icon buttons in headers and rows | Primary actions |
| `destructive` | Delete, cancel subscription (always behind ConfirmDialog) | Error messages |
| `link` | Inline text action | Navigation between pages (use `next/link` directly) |

## States

- Default, hover (today `hover:bg-primary/80`; becomes a token step), active (`translate-y-px`, removed under reduced motion).
- Focus visible: 3px halo from the focus token (FE-36); with `aria-invalid` the ring uses the destructive tone.
- Disabled: `opacity-50`, `pointer-events-none`. Never the only signal of why; the page says why.
- Loading: spinner replaces the leading icon, label stays, `aria-busy`, clicks ignored.

## Accessibility

- Native `button`; `asChild` only with an `a` element.
- Minimum touch target 44px (`min-h-11`, `size-11` for icon buttons) on every size used on phones.
- Icon-only buttons need `aria-label` or an `sr-only` label; icons get `aria-hidden`.
- Contrast: label on every variant meets AA in light and dark (checked by the FE-33 script). Citron is never text; the `citron` variant uses `text-on-citron`.
- Spinner stops under `prefers-reduced-motion` (FE-37); `aria-busy` still announces the state.
- RTL is not required for v1.

## Tasks

- [ ] **UI-01** Button (variants, sizes, 44px min touch, loading) *(partial: stock shadcn variants and sizes committed in `web/src/components/ui/button.tsx`; restyle, 44px sizes and loading are split into UI-35 to UI-38)*
- [ ] **UI-35** Restyle to tokens: 10px control radius (FE-35), focus ring token (FE-36), default `type="button"`, hover steps from tokens instead of opacity and `color-mix`
- [ ] **UI-36** Add the `citron` variant (`bg-citron-surface text-on-citron hover:bg-citron-surface-hover`) and replace the hand-styled citron button in `UpgradeGate` (`web/src/components/shell/page-states.tsx`)
- [ ] **UI-37** `loading` prop: Lucide `LoaderCircle`, `aria-busy`, disabled while loading, stable width; reduced motion stops the spin
- [ ] **UI-38** Sizes: `default` and `lg` at `min-h-11`, icon sizes at `size-11` on phones; decide the fate of `xs`, `sm`, `icon-xs`, `icon-sm`; update call sites that override size by hand (for example `size-11` in `common/detail-drawer.tsx`)

## Tests

- Vitest `button.test.tsx`: `type="button"` by default; `loading` sets `aria-busy` and `disabled` and ignores clicks; `asChild` renders an `a` carrying the classes.
- Playwright gallery `dev-ui-button.spec.ts`: every variant and size, light and dark, 360 and 1440 snapshots (FE-46); axe zero violations; Tab reaches each button, Enter and Space activate it.

## Verification

1. `npm run lint && npm run typecheck && npm test` pass.
2. On `/dev/ui` (FE-45) every variant shows a visible focus ring with keyboard only.
3. At 360px, computed height of default and icon buttons is at least 44px.
4. With `prefers-reduced-motion: reduce` emulated, the loading spinner does not rotate.

## Open questions

- Keep `xs` and `sm` for dense admin tables on desktop only, or drop them so a sub-44px button cannot ship on phones?
- Should `destructive` be solid rose for the confirm step and tinted for the trigger?
