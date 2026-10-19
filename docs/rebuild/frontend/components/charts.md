# Chart wrappers

| | |
|---|---|
| ID | `UI-27` (split: `UI-99` to `UI-106`) |
| Phase | 3 |
| Depends on | FE-31, FE-32, FE-37, UI-22 |
| File path | `web/src/components/common/charts.tsx` (on `web/src/components/ui/chart.tsx`, Recharts) |
| Status | 0 of 9 done, 1 partial (bar, line and donut WIP), 8 not started |

## Purpose

Token coloured charts for mastery, marks over time, practice activity, AI spend and admin metrics. Every chart has a visible title, a text summary and an accessible data table, so the numbers are available without seeing the picture. Charts show measured data only.

## API

Shared types: `ChartSeries = { key: string; label: string; tone?: 1 | 2 | 3 | 4 | 5 }`, `Datum = Record<string, string | number>`.

| Component | Props | Notes |
|---|---|---|
| `BarChart` | `title`, `description?`, `data`, `xKey`, `xLabel?` (defaults to xKey), `series`, `className?` | Grid, axes, tooltip, legend when more than one series. |
| `LineChart` | same as BarChart | `type="monotone"`, no dots. |
| `DonutChart` | `title`, `description?`, `slices: { key, label, value, tone? }[]`, `className?` | Inner radius 60%, legend. |
| `AreaChart` (planned, UI-99) | same as BarChart | For cumulative series. |
| Planned shared props | `summary?: string` (UI-101), `emphasiseLatest?: boolean` (UI-100, default true on Line and Area), `valueFormat?: (n) => string`, `emptyTitle?` (UI-103) | |

Colours come from `--chart-1` to `--chart-5`, which switch with `prefers-color-scheme`. Every chart renders inside a `figure` with a `figcaption` and a visually hidden table (`DataSummary`).

## Variants

Bar, line, area, donut; single or multi series; with or without latest point emphasis.

## States

- Populated.
- Empty or no evidence (UI-103): no axes drawn; `EmptyState` with "No marks yet" or page copy. Never a flat zero line for missing data.
- Loading: skeleton of the chart height.
- Partial data: gaps stay gaps (`connectNulls={false}`), not zeros.

## Accessibility

- Visual is `aria-hidden`; the sr-only table has a caption, column and row headers (already in WIP).
- Visible text summary slot (UI-101) states the takeaway: "Your Mathematics average rose from 58% to 66% over 4 tests."
- No colour only encoding (UI-102): multi series lines get distinct dash patterns or markers and direct end labels; donut slices are labelled in the legend with values.
- Tooltips are not the only way to read values.
- Animations off under `prefers-reduced-motion` (UI-105): `isAnimationActive` false.
- Series contrast at least 3:1 against the card in both schemes (FE-33 extends to chart tokens).

## Tasks

- [ ] **UI-27** Chart wrappers (Recharts via shadcn chart): area, line, bar, donut; token colours; latest point emphasised; text summary slot *(partial: `BarChart`, `LineChart`, `DonutChart` with chart tokens, figure, legend and sr-only data table in `web/src/components/common/charts.tsx`, uncommitted WIP; no area chart, no latest point emphasis, no visible summary slot)*
- [ ] **UI-99** `AreaChart` wrapper with the same props and accessible table
- [ ] **UI-100** Latest point emphasis on line and area (larger dot and value label on the final point)
- [ ] **UI-101** Visible `summary` text slot under the figcaption, required for dashboard charts
- [ ] **UI-102** Non colour encodings: dash patterns or markers per series, direct labels, donut values in legend
- [ ] **UI-103** Empty and no evidence state inside the figure, plus null gaps not drawn as zero
- [ ] **UI-104** Load Recharts with `next/dynamic` (client only, skeleton fallback) so routes without charts carry none of it and chart routes stay under 150 KB JS gzip
- [ ] **UI-105** Disable chart animation under reduced motion
- [ ] **UI-106** Tests: Vitest (table rows equal data rows, summary rendered, empty state for `[]`) and Playwright gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

- Vitest `charts.test.tsx`: DataSummary has one row per datum; empty data renders EmptyState not an svg; summary text present.
- Playwright `gallery/charts.spec.ts`: each chart in both schemes; reduced motion; 360px fits without horizontal scroll.
- Bundle check: `next build` output shows Recharts only in chart route chunks (CI-25 budget).

## Verification

1. Gallery charts readable in light and dark; grayscale screenshot still distinguishes series.
2. Screen reader (VoiceOver on iPhone) reads the caption and table.

## Open questions

- Should the shadcn `ui/chart.tsx` tooltip be kept at all on touch devices, or replaced with tap to select?
