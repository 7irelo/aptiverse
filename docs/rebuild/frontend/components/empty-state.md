# EmptyState

| | |
|---|---|
| ID | `UI-22` (split: `UI-80` to `UI-81`) |
| Phase | 3 |
| Depends on | FE-31, UI-34 |
| File path | `web/src/components/common/empty-state.tsx` |
| Status | 0 of 3 done, 1 partial (uncommitted WIP), 2 not started |

## Purpose

Inline "nothing here yet" block for cards, sections and lists. It explains what will appear and offers one next step. It never shows a fake number, a zero standing in for missing data, or placeholder rows.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | Short, plain: "No assessments yet". |
| `description` | `string` | none | What will appear here and how. |
| `icon` | `LucideIcon` | `Inbox` | Lucide only; decorative. |
| `action` | `ReactNode` | none | One button or link. |
| `headingLevel` | `2 \| 3 \| 4` | `3` | Fit the page outline. |
| `className` | `string` | none | Layout only. |

Planned (UI-80): `tone?: "empty" \| "no-evidence"`; no evidence uses the `ChartNoAxesColumn` icon and default copy "No marks yet".

## Variants

- Empty (dashed border, muted icon circle).
- No evidence (UI-80): for data driven surfaces (mastery, standing, stats) where the entity exists but nothing has been measured.
- Compact: inside a card with `py-4` via `className`.

## States

Itself a state. Used by `DataTable` when `rows` is empty, by `PageEmpty`, and by charts with no data (UI-103).

## Accessibility

- Heading at the given level; description as a paragraph.
- Icon is `aria-hidden`.
- Action is a 44px button or link.
- Muted text on card and background meets AA in both schemes (checked by FE-33).

## Tasks

- [ ] **UI-22** EmptyState (Lucide icon, message, one action) *(partial: implemented in `web/src/components/common/empty-state.tsx` as uncommitted WIP; no tests or gallery entry)*
- [ ] **UI-80** Add the no evidence tone with default copy "No marks yet" and document when to use it versus empty
- [ ] **UI-81** Tests: Vitest (heading level, optional parts, action rendered once) and gallery snapshots light and dark at 360 and 1440 with axe zero violations

## Tests

- Vitest `empty-state.test.tsx`: renders `h3` by default and `h2` when asked; omits description when absent; no evidence tone renders "No marks yet".
- Playwright gallery: snapshots and axe for both tones.

## Verification

1. Gallery shows empty and no evidence side by side at 360px without overflow.
2. A grep of page files finds no literal `0` rendered for missing marks; pages use the no evidence tone instead (spot check during HRD-42).

## Open questions

- Should the action be required for page level empty states so a user is never stuck?
