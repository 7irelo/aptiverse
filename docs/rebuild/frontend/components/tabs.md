# Tabs

| | |
|---|---|
| ID | `UI-06`, `UI-52` to `UI-53` |
| Phase | 3 |
| Depends on | FE-35, FE-36 |
| File path | `web/src/components/ui/tabs.tsx` |
| Status | Partial. shadcn Tabs committed (Radix) with `tabsListVariants` (`default`, `line`) and vertical orientation. TabsList is `h-8`, triggers below 44px, no overflow handling at 360px, no URL-synced variant. 0 of 3 tasks done, 1 partial. |

## Purpose

Switches between sibling views of the same object without leaving the page (unit detail: Overview, Assessments, Topics). Not for primary navigation between routes.

## API

| Component | Prop | Type | Default | Notes |
|---|---|---|---|---|
| `Tabs` | `value`, `defaultValue`, `onValueChange`, `orientation` | Radix | `horizontal` | Existing. |
| `TabsList` | `variant` | `default`, `line` | `default` | Existing. |
| `TabsTrigger` | `value`, `disabled` | Radix | | Existing. |
| `TabsContent` | `value`, `forceMount` | Radix | | Existing. |
| `LinkTabs` | `items: { href, label }[]` | | | New (UI-53): route-backed tabs built from `next/link` with `aria-current="page"`, for tabbed sub-routes that must be shareable and server rendered. |

## Variants

`default` (segmented surface) and `line` (underline). Horizontal scrolling list on phones when triggers overflow.

## States

Default, hover, focus visible, active (`data-active`), disabled.

## Accessibility

- Radix provides `role="tablist"`, `tab`, `tabpanel`, roving tabindex and arrow key navigation; Home and End move to first and last.
- Triggers `min-h-11` on phones (UI-52).
- Overflowing lists scroll horizontally with visible fade cues and keep the active tab scrolled into view.
- `LinkTabs` are links in a `nav`, not ARIA tabs, because they change the URL.
- Underline animation off under reduced motion.
- RTL not required for v1.

## Tasks

- [ ] **UI-06** Tabs *(partial: shadcn Tabs committed in `web/src/components/ui/tabs.tsx`; restyle and route-backed variant split into UI-52 and UI-53)*
- [ ] **UI-52** Restyle to tokens: `min-h-11` triggers, 10px radius, focus ring token; horizontal scroll with the active tab kept in view at 360px
- [ ] **UI-53** `LinkTabs` for route-backed tabs (Server Component, `aria-current="page"`), with guidance on when to use each

## Tests

- Vitest: arrow keys move focus between triggers; `LinkTabs` marks the current href with `aria-current`.
- Playwright gallery `dev-ui-tabs.spec.ts`: five tabs at 360px scroll without page overflow; light and dark, 360 and 1440 snapshots; axe zero violations.

## Verification

1. At 360px no horizontal page scroll with six tabs; the list itself scrolls.
2. Keyboard only: Tab into the list, arrows switch, Tab moves into the panel.

## Open questions

- Should panels be lazy (only active panel fetched) by default for data-heavy pages?
