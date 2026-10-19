# Menus: DropdownMenu, Popover, Tooltip

| | |
|---|---|
| ID | `UI-09`, `UI-59` to `UI-61` |
| Phase | 3 |
| Depends on | FE-35 (shadow and radius tokens), FE-37 (motion) |
| File path | `web/src/components/ui/dropdown-menu.tsx`, `web/src/components/ui/tooltip.tsx` (committed); `web/src/components/ui/popover.tsx` (to add) |
| Status | Partial. shadcn DropdownMenu (items `py-1`, below 44px) and Tooltip (`TooltipProvider` with `delayDuration` 0) are committed. Popover does not exist. No global `TooltipProvider` mounted. 0 of 4 tasks done, 1 partial. |

## Purpose

- DropdownMenu: a list of actions from one trigger (account menu, row actions).
- Popover: a small non-modal panel (filter options, a help explanation, a colour key).
- Tooltip: a short supplementary label on hover or focus, mainly for icon buttons on desktop.

## API

| Component | Key props | Default | Notes |
|---|---|---|---|
| `DropdownMenu` and parts (`Trigger`, `Content`, `Item`, `CheckboxItem`, `RadioItem`, `Label`, `Separator`, `Sub`) | Radix; `Item` has `variant` `default` or `destructive`, `inset` | | Existing. |
| `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` | `align`, `side`, `sideOffset` | `align="center"`, `sideOffset=4` | New (UI-60). |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `delayDuration`, `side` | `delayDuration` 0 today | Provider mounted once in the root layout (UI-61) with a non-zero delay. |

## Variants

DropdownMenu item: default, destructive (rose text), checkbox, radio. Popover: one style. Tooltip: one style (inverted surface).

## States

Closed, open, item highlighted (`focus:bg-accent`), item disabled, destructive item.

## Accessibility

- Radix provides `role="menu"`, arrow navigation, type-ahead, Escape to close and focus return.
- Menu items `min-h-11` on phones (UI-59).
- Tooltips never hold essential information and never appear on touch only; icon buttons still have an accessible name without the tooltip.
- Popover content that contains a form behaves like a dialog on phones (use `ResponsiveDialog` instead).
- Open and close animations off under reduced motion.
- RTL not required for v1.

## Tasks

- [ ] **UI-09** DropdownMenu, Popover, Tooltip *(partial: `ui/dropdown-menu.tsx` and `ui/tooltip.tsx` committed as stock shadcn; Popover missing; split into UI-59 to UI-61)*
- [ ] **UI-59** Restyle DropdownMenu to tokens: `min-h-11` items on phones, 10px radius, shadow token, destructive item uses the rose token
- [ ] **UI-60** Add `Popover` (`npx shadcn@4.22.0 add popover`) and restyle; document Popover versus ResponsiveDialog
- [ ] **UI-61** Mount one `TooltipProvider` in `web/src/app/layout.tsx` with a 300ms delay; document "tooltip is never the only label"

## Tests

- Vitest: DropdownMenu opens with Enter and closes with Escape returning focus; Tooltip appears on keyboard focus.
- Playwright gallery `dev-ui-menus.spec.ts`: menu items at least 44px tall at 360px; light and dark, 360 and 1440 snapshots; axe zero violations with the menu open.

## Verification

1. Keyboard only: open the account menu example, arrow to Sign out, Enter, focus returns.
2. No nested `TooltipProvider` instances in the app (grep).

## Open questions

- Context menus (right click) are not planned; confirm none are needed for admin tables.
