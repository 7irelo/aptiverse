# Card

| | |
|---|---|
| ID | `UI-04`, `UI-48` to `UI-49` |
| Phase | 3 |
| Depends on | FE-35 (radius, spacing, shadow tokens) |
| File path | `web/src/components/ui/card.tsx` |
| Status | Partial. Stock shadcn Card family committed (`Card` with `size` default or sm, plus Header, Title, Description, Action, Content, Footer). Uses `rounded-xl` and `ring-foreground/10`, not the 14px card radius and border token. 0 of 3 tasks done, 1 partial. |

## Purpose

The container for a block of related content: a stat, a list, a form section. Composites such as StatCard and EmptyState sit on it.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `default` or `sm` | `default` | Spacing 16px or 12px via `--card-spacing` (exists). |
| `interactive` | `boolean` | `false` | New (UI-49): the whole card is a link target with hover and focus styles, using one inner `a` stretched with `after:absolute after:inset-0`. |
| `tone` | `default`, `brand`, `citron` | `default` | New (UI-49): `brand` uses `bg-brand-surface text-on-brand-surface`; `citron` uses `bg-citron-surface text-on-citron` for one highlight card. |
| `CardTitle` `as` | `h2`, `h3`, `h4`, `div` | `div` today | New (UI-48): pages pick the heading level. |
| Subcomponents | `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | | Existing. |

## Variants

Default, small, interactive, brand, citron. No heavy shadows; elevation uses the shadow token only on popovers.

## States

Default; hover and focus visible on interactive cards (border step and focus ring around the card).

## Accessibility

- `CardTitle` must be a real heading in page context; today it is a `div` (UI-48).
- Interactive cards contain exactly one link; other controls inside sit above the stretched link with `relative z-10`.
- `text-muted-foreground` on `bg-card` meets AA in both schemes (FE-33).
- RTL not required for v1.

## Tasks

- [ ] **UI-04** Card *(partial: stock shadcn Card committed in `web/src/components/ui/card.tsx`; restyle and variants split into UI-48 and UI-49)*
- [ ] **UI-48** Restyle to tokens: 14px card radius, border token instead of `ring-foreground/10`, spacing on the 8px scale; `CardTitle` accepts `as`
- [ ] **UI-49** Add `interactive` and `tone` (`brand`, `citron`) variants with documented do and do not usage

## Tests

- Vitest: `CardTitle as="h3"` renders an `h3`; an interactive card exposes one link named by the card title.
- Playwright gallery `dev-ui-card.spec.ts`: each variant light and dark, 360 and 1440 snapshots; axe zero violations; Tab focuses an interactive card once.

## Verification

1. The gallery shows default, sm, interactive, brand and citron cards in both schemes.
2. Computed card radius equals the card token (14px).

## Open questions

- Is a `citron` card allowed on the student dashboard, or is citron reserved for buttons and the active nav item?
