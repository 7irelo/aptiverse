# Drawer (DetailDrawer)

| | |
|---|---|
| ID | `UI-08`, `UI-57` to `UI-58` |
| Phase | 3 |
| Depends on | UI-07 (Sheet restyle in UI-54), UI-01 |
| File path | `web/src/components/common/detail-drawer.tsx` (uncommitted WIP) |
| Status | Partial. WIP `DetailDrawer` on Sheet: right side, full width on phones, `sm:max-w-md` from `sm` up, sticky header with a 44px close button, scrolling body, optional footer. Uncommitted, untested, no URL state. 0 of 3 tasks done, 1 partial. |

## Purpose

Shows the details of one record (a user, a payout, an assessment) beside the list it came from, so the list keeps its scroll position. Ports the UX of the old admin `UserDetailDrawer` (reference only, at `f223ca7`), not its code.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `ReactNode` | none | Omit when controlling `open`. |
| `title` | `string` | required | `SheetTitle`, `text-lg font-semibold`. |
| `description` | `string` | none | When absent, `aria-describedby` is unset. |
| `children` | `ReactNode` | required | Body, `overflow-y-auto p-4`. |
| `footer` | `ReactNode` | none | Sticky actions, stacked on phones, right-aligned from `sm`. |
| `open`, `onOpenChange` | `boolean`, `(open) => void` | uncontrolled | |
| `size` | `md`, `lg` | `md` | New (UI-58): `lg` for admin detail with tables. |
| `paramKey` | `string` | none | New (UI-58): sync open record id to a search param (for example `?user=<id>`) so the drawer is linkable and Back closes it. |

## Variants

Medium (`max-w-md`) and large (`max-w-2xl`, admin). Always from the right; bottom sheets are `ResponsiveDialog`.

## States

Closed, open, loading body (Skeleton inside, header title known), error body (retry via PageError pattern), submitting footer.

## Accessibility

- Radix Sheet gives focus trap, Escape to close and focus return.
- Close button is a 44px ghost icon button with `sr-only` "Close" and an `aria-hidden` Lucide `X` (done in WIP).
- When `paramKey` is used, browser Back closes the drawer and restores focus to the row that opened it.
- RTL not required for v1.

## Tasks

- [ ] **UI-08** Drawer (port `UserDetailDrawer` pattern) *(partial: uncommitted WIP in `web/src/components/common/detail-drawer.tsx`)*
- [ ] **UI-57** Review and commit `detail-drawer.tsx` with unit tests and loading and error body slots
- [ ] **UI-58** `size` and `paramKey` (search param sync, Back closes, focus return to the originating row)

## Tests

- Vitest: renders title and footer; close button has name "Close"; with `paramKey`, opening pushes `?user=<id>` (mocked router).
- Playwright `dev-ui-drawer.spec.ts`: full width at 360px, side panel at 1440; Back closes it; axe zero violations while open, light and dark; snapshots at both widths.

## Verification

1. At 360px the drawer covers the full width with no horizontal scroll.
2. Opening from a long list and closing returns focus and scroll position to the row.

## Open questions

- Should drawer content be a parallel or intercepting route instead of client state, so it renders on the server? Decide before admin pages (Phase 9).
