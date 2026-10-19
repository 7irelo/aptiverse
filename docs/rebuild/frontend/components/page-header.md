# PageHeader

| | |
|---|---|
| ID | `UI-20` (split: `UI-70` to `UI-72`) |
| Phase | 3 |
| Depends on | FE-30, FE-34, UI-01 |
| File path | `web/src/components/shell/page-header.tsx` |
| Status | 0 of 4 done, 1 partial (component written, uncommitted WIP), 3 not started |

## Purpose

The one page title block used by every page inside `PageShell`: the page's only `h1`, an optional description, an optional eyebrow line (subject name, breadcrumb) and the primary actions. It makes every page open the same way, so students learn where to look.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | Rendered as the page's single `h1`. `text-balance`, `tracking-tight`, `text-2xl` at 360px, `text-3xl` from `sm`. |
| `description` | `ReactNode` | none | One or two sentences, `max-w-prose`, muted ink. |
| `actions` | `ReactNode` | none | Buttons or links. Stack under the title on phones, sit at the right from `sm` up. |
| `eyebrow` | `ReactNode` | none | Small line above the title, for example the subject or a breadcrumb. |
| `className` | `string` | none | Layout overrides only, never colours. |

Planned (UI-71): `back` (`{ href: string; label: string }`), a back link rendered above the eyebrow on phones where there is no sidebar.

## Variants

- Default: title plus optional description.
- With actions: one primary action, at most one secondary; more go in a `DropdownMenu` (UI-09).
- With eyebrow: subject or course name above a unit page title.
- With back link (UI-71): detail pages on mobile.

## States

PageHeader has no data of its own. When the page is loading, `PageLoading` (UI-21) draws a skeleton of the same height so the layout does not jump. Titles never contain numbers that could be missing; counts belong in `StatCard` (UI-23).

## Accessibility

- Exactly one `h1` per page (web/CLAUDE.md). The header is a `<header>` element inside `main`, not a landmark banner.
- Actions are real `button` or `a` elements, at least 44px tall (`min-h-11`).
- Description is plain text; no colour-only meaning.
- Text wraps at 360px without truncation; long subject names wrap rather than ellipsis.

## Tasks

- [ ] **UI-20** PageHeader (title, description, actions) *(partial: component written with title, description, actions and eyebrow in `web/src/components/shell/page-header.tsx`, uncommitted WIP; no tests, no gallery entry)*
- [ ] **UI-70** Commit PageHeader with a `/dev/ui` gallery entry showing all four variants (needs FE-45)
- [ ] **UI-71** Add the optional `back` link prop (Lucide `ChevronLeft`, 44px target, hidden from `lg` where the sidebar shows context)
- [ ] **UI-72** Tests: Vitest render test (one `h1`, actions slot, eyebrow order) and Playwright gallery snapshots light and dark at 360 and 1440 with axe zero violations (needs FE-46, FE-53)

## Tests

- Vitest `page-header.test.tsx`: renders one `h1` with the title; renders description only when given; actions render after the title in DOM order; eyebrow renders before the title.
- Playwright `gallery/page-header.spec.ts`: "page header fits 360px without horizontal scroll", "actions stack under title on mobile", visual snapshots light and dark at 360 and 1440, axe clean in both schemes.

## Verification

1. `npm run lint && npm run typecheck && npm test` pass.
2. Open `/dev/ui` at 360px: a 60 character title wraps on two balanced lines, actions sit below it.
3. At 1440px actions align to the right, bottom aligned with the title block.
4. axe reports no heading-order or landmark violations on a page using PageShell.

## Open questions

- Should breadcrumbs be a separate component for admin pages with deep nesting, or is the eyebrow enough for v1?
