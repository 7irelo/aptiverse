# ProgressRing and ProgressBar

| | |
|---|---|
| ID | `UI-24` (split: `UI-87` to `UI-89`) |
| Phase | 3 |
| Depends on | FE-31, FE-37 |
| File path | `web/src/components/common/progress-ring.tsx`, `web/src/components/ui/progress.tsx` (bar primitive), planned `web/src/components/common/progress-bar.tsx` |
| Status | 0 of 4 done, 1 partial (ring WIP, raw shadcn bar), 3 not started |

## Purpose

Show progress toward something real (mastery of a topic, goal milestones, quota used, an upload). The ring is for a single headline value in a card; the bar is for lists and inline progress. Progress is academic signal, not a game score.

## API

ProgressRing (WIP):

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | required | Clamped to 0..max. |
| `max` | `number` | `100` | |
| `label` | `string` | required | Accessible name, for example "Mathematics mastery". |
| `size` | `number` | `72` | Pixels. |
| `strokeWidth` | `number` | `8` | |
| `tone` | `"primary" \| "citron" \| "success" \| "warning" \| "achievement" \| "wellbeing"` | `"primary"` | Stroke colour tokens. Citron is allowed as a stroke surface; the centre text stays foreground ink. |
| `centerLabel` | `string` | rounded percent | |

ProgressBar (planned, UI-87) over `ui/progress.tsx`:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number \| null` | required | `null` renders the no evidence state (UI-88). |
| `max` | `number` | `100` | |
| `label` | `string` | required | Visible label above the bar. |
| `valueText` | `string` | percent | Visible and used as `aria-valuetext`, for example "3 of 5 milestones". |
| `tone` | same as ring | `"primary"` | |
| `size` | `"sm" \| "md"` | `"md"` | `h-1` and `h-2`. |

## Variants

Ring tones; bar sizes; indeterminate bar for uploads before the first progress event (UI-123).

## States

- Populated: value shown as text and as the visual.
- No evidence (UI-88): track only, with "No marks yet" text; never a 0% ring for missing data.
- Complete: same visual at 100%, no celebration animation.
- Indeterminate (bar only): `aria-valuenow` omitted.

## Accessibility

- `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` (ring already does this; the shadcn bar via Radix does too).
- Visual SVG is `aria-hidden`.
- Stroke transition already has `motion-reduce:transition-none`; the bar indicator `transition-all` needs the same (UI-87).
- Non text contrast of the indicator against the track at least 3:1 in both schemes (FE-33 check).

## Tasks

- [ ] **UI-24** ProgressRing and ProgressBar *(partial: `ProgressRing` with tones and progressbar semantics in `web/src/components/common/progress-ring.tsx`, uncommitted WIP; bar is the stock shadcn `ui/progress.tsx` without label, value text or tones)*
- [ ] **UI-87** `ProgressBar` wrapper: visible label, value text, tones, sizes, indeterminate mode, reduced motion
- [ ] **UI-88** No evidence handling for ring and bar (`value={null}` shows track plus "No marks yet")
- [ ] **UI-89** Tests: Vitest (clamping, aria values, null state, valueText) and gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

- Vitest `progress-ring.test.tsx`: value 150 with max 100 clamps to 100; `aria-valuetext` is "40%" for 40; centerLabel overrides.
- Vitest `progress-bar.test.tsx`: null renders "No marks yet" and no `aria-valuenow`; valueText used in aria.
- Playwright gallery: tones in both schemes, reduced motion emulated has no transition.

## Verification

1. Gallery: each tone readable in light and dark; the citron ring keeps graphite centre text.
2. `page.emulateMedia({ reducedMotion: "reduce" })` shows no animated stroke.

## Open questions

- Is the `achievement` (amber) tone needed on progress at all, given amber is reserved for earned achievements only?
