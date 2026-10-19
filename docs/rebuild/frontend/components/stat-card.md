# StatCard

| | |
|---|---|
| ID | `UI-23` (split: `UI-82` to `UI-86`) |
| Phase | 3 |
| Depends on | FE-31, FE-34, UI-11 |
| File path | `web/src/components/common/stat-card.tsx` |
| Status | 0 of 6 done, 1 partial (uncommitted WIP without trend), 5 not started |

## Purpose

A single headline figure with its label, for dashboards and admin overviews. It must never imply a result that does not exist: when there is no data the card says so in words.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | "Average mark", "Practice tests this week". |
| `value` | `ReactNode \| null` | required | Already formatted (for example `R1 234`, `72%`). `null` or `undefined` means no data. |
| `hint` | `string` | none | Context under the value, hidden when empty. |
| `emptyHint` | `string` | "No data yet" | Shown instead of the value. UI-83 changes the default for mark based cards to "No marks yet". |
| `icon` | `LucideIcon` | none | Decorative. |
| `className` | `string` | none | Layout only. |

Planned:

| Prop | Type | Notes |
|---|---|---|
| `trend` (UI-82) | `{ direction: "up" \| "down" \| "flat"; label: string; sentiment?: "positive" \| "negative" \| "neutral" }` | Lucide `TrendingUp`, `TrendingDown`, `Minus`; the label carries the meaning ("up 4 points since last term"). Sentiment picks forest, terracotta or muted ink, never rose for a dip in marks. |
| `href` (UI-84) | `string` | Whole card becomes one link with a 44px minimum. |
| `loading` (UI-85) | `boolean` | Skeleton of the same size. |

## Variants

Plain, with icon, with trend, link card, loading skeleton, empty.

## States

- Populated: value in `text-2xl font-semibold tabular-nums`.
- Empty or no evidence: muted sentence instead of a number. Never `0` or a dash for missing data.
- Loading: skeleton (UI-85).
- Error: handled by the containing section or page, not the card.

## Accessibility

- Label then value in DOM order so screen readers read "Average mark, 72%".
- Trend is text, not only an arrow or colour; arrows are `aria-hidden`.
- Link variant: one focusable element, visible focus ring, accessible name is label plus value.
- Contrast AA in light and dark for muted label and hint.

## Tasks

- [ ] **UI-23** StatCard (value, label, trend arrow, tabular-nums) *(partial: value, label, hint, null aware empty hint, icon and tabular-nums in `web/src/components/common/stat-card.tsx`, uncommitted WIP; no trend arrow)*
- [ ] **UI-82** Trend prop with Lucide arrows, a required text label and sentiment tones (no red for academic dips)
- [ ] **UI-83** No evidence wording: mark based cards default to "No marks yet"; document that callers pass `null`, never `0`, for missing evidence
- [ ] **UI-84** Link variant (`href`) with whole card target and focus ring
- [ ] **UI-85** Loading skeleton variant matching card height
- [ ] **UI-86** Tests: Vitest (null shows empty hint, hint hidden when empty, trend label rendered, link name) and gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

- Vitest `stat-card.test.tsx`: `value={null}` renders emptyHint and no number; `value={0}` renders "0" (a real measured zero); trend renders its label text; link variant exposes one link.
- Playwright gallery: a 2 column grid of cards at 360px, snapshots, axe.

## Verification

1. Gallery shows populated, empty and trend cards; nothing overflows at 360px with `R12 345 678`.
2. Dashboard spot check (Phase 7 exit gate): every StatCard value traces to an endpoint field; missing data renders the empty hint.

## Open questions

- Should trend compare against the previous term, the previous 30 days, or be caller defined only? (Caller defined assumed.)
