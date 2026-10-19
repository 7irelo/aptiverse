# Design tokens (Graphite & Citron)

| | |
|---|---|
| ID range | `FE-30` to `FE-37`, `FE-112` to `FE-126` |
| Phase | 3 |
| Depends on | `FE-02`, `FE-03` |
| Code path | `web/src/styles/tokens.css`, `web/src/app/globals.css`, `web/src/styles/shadcn.css` |
| Status | 23 tasks: 2 done, 4 partial, 0 unverified, 17 not started |

## Purpose

One source of truth for colour, type, radius, spacing, shadow, focus and motion, as CSS variables that switch with `prefers-color-scheme` and need zero JavaScript. Every component and page reads tokens through Tailwind utilities; raw values exist only in `tokens.css`.

## Scope

- `src/styles/tokens.css`: ramps (graphite, citron, magenta, amber, terracotta, forest, rose, neutral) and semantic tokens, light by default and dark under `@media (prefers-color-scheme: dark)`.
- `src/app/globals.css`: `@theme inline` mapping to Tailwind utilities; Tailwind's default palette is reset so only honest ramps exist.
- New: `scripts/check-contrast.mjs`, a `tokens:check` npm script, token sections in the `/dev/ui` gallery (`frontend/guardrails.md` FE-45).
- Rules: citron is a surface, never text on light; text on citron is `--on-citron`; `--citron-ink` is the only citron allowed as text. Magenta wellbeing, amber earned achievements only, terracotta warm attention, forest success, rose errors. No theme toggle, no class-based dark mode.

## Tasks

### Colour

- [x] **FE-30** `styles/tokens.css`: Graphite & Citron ramps with honest names (`graphite`, `citron`, `magenta`, `amber`, `terracotta`, `forest`, `rose`, `neutral`; Tailwind default palette reset in `globals.css`)
- [ ] **FE-31** Semantic tokens: surface, ink, border, focus, success, attention, destructive, wellbeing, achievement *(partial: shadcn-named tokens exist (background, foreground, card, primary, muted, border, input, ring, destructive) plus success, warning, error, wellbeing, achievement, citron-surface, on-citron, citron-ink, brand-surface, chart-1 to chart-5; no `focus` token, "attention" is named `warning`)*
- [ ] **FE-112** Naming decision: keep `warning` or rename to `attention` (the plan's word); add aliases if renamed so no component breaks; update `web/CLAUDE.md` colour-zone list to match. Split from FE-31.
- [ ] **FE-113** Move the light `--achievement` raw value (`#8a5e17`) into the amber ramp as a named step (for example `--amber-650`) so every semantic token points at a ramp step. Split from FE-31.
- [ ] **FE-114** Token usage reference: a table of every semantic token, its light and dark ramp step and allowed uses, rendered on `/dev/ui` from one data file so docs cannot drift from CSS. Split from FE-31.
- [x] **FE-32** Dark values under `prefers-color-scheme: dark` (no toggle, zero JS) (`tokens.css` media block; `color-scheme: light dark` on `:root`)

### Contrast

- [ ] **FE-33** Contrast check: every text-on-surface pair meets WCAG AA (4.5:1 body, 3:1 large text and UI parts) in light and dark
- [ ] **FE-115** `scripts/check-contrast.mjs`: parses `tokens.css`, resolves `var()` chains for both schemes, computes ratios for a declared pair list (foreground on background, card, muted, primary; on-citron on citron-surface; citron-ink on background and card; each status foreground on its status colour; chart colours on card at 3:1). Split from FE-33.
- [ ] **FE-116** `npm run tokens:check` wired into `npm run lint` so CI fails on a regression (`ci/web-pipeline.md` CI-20). Split from FE-33.
- [ ] **FE-117** ESLint rule `aptiverse/no-citron-text`: bans `text-citron-surface`, `text-citron-300` to `text-citron-600` and `fill-` or `stroke-` equivalents in class strings; `text-citron-ink` and `text-on-citron` stay legal. Rule lives in `eslint/aptiverse-plugin.mjs`.
- [ ] **FE-125** Forced-colors check: under `@media (forced-colors: active)` controls keep visible borders and focus outlines; Playwright run with `forcedColors: "active"` on the gallery.
- [ ] **FE-126** Chart palette check: `chart-1` to `chart-5` stay distinguishable under deuteranopia and protanopia simulation in both schemes, and every chart has a non-colour cue (labels, patterns or the data table already in `components/common/charts.tsx`).

### Type, radius, spacing, shadow

- [ ] **FE-34** Type scale, tracking, `text-wrap: balance` on headings, tabular-nums utility *(partial: `PageHeader` uses `text-balance` and `StatCard` uses `tabular-nums` (both uncommitted WIP); no type scale tokens)*
- [ ] **FE-118** Type scale tokens in `@theme`: `--text-xs` to `--text-3xl` with paired line heights and tracking, minimum body size 16px on mobile; base layer applies `text-wrap: balance` to `h1` to `h3` and `text-wrap: pretty` to paragraphs. Split from FE-34.
- [ ] **FE-119** Numeric style: a `.num` utility (`font-variant-numeric: tabular-nums`) applied by default in table cells, stat values and money (FE-81 output). Split from FE-34.
- [ ] **FE-35** Radius (10 controls, 14 cards, full pills), 8px spacing scale, shadow tokens *(partial: one `--radius: 0.5rem` with a derived `sm` to `2xl` scale; no 10px or 14px steps, no spacing or shadow tokens)*
- [ ] **FE-120** Radius tokens: `--radius-control: 10px`, `--radius-card: 14px`, `--radius-pill: 9999px` mapped to utilities (`rounded-control`, `rounded-card`, `rounded-full`); shadcn primitives restyled to them (tracked per component in `frontend/components/`). Split from FE-35.
- [ ] **FE-121** Spacing and shadow: document the allowed spacing steps on the 8px rhythm (Tailwind 4px base, even steps only for layout), and add `--shadow-sm`, `--shadow-md`, `--shadow-lg` with dark values that use borders rather than heavy shadows. Split from FE-35.

### Focus and motion

- [ ] **FE-36** Focus ring token (3px halo, destructive on invalid) *(partial: shadcn defaults use `focus-visible:ring-3 ring-ring/50` and `aria-invalid` destructive rings per component; no single token)*
- [ ] **FE-122** `--focus-ring` token (3px halo, offset 2px, `--ring` colour, `--destructive` when `aria-invalid`); global `:focus-visible` base style so custom elements inherit it; audit list of components that override it. Split from FE-36.
- [ ] **FE-37** Motion tokens; everything off under `prefers-reduced-motion`
- [ ] **FE-123** Motion tokens: `--duration-fast` (120ms), `--duration-base` (200ms), `--duration-slow` (320ms) and two easing curves, mapped to Tailwind `duration-` and `ease-` utilities. Split from FE-37.
- [ ] **FE-124** Reduced motion: a base rule under `@media (prefers-reduced-motion: reduce)` that zeroes animation and transition durations (including `tw-animate-css` and Radix enter and exit), and chart wrappers pass `isAnimationActive={false}`; Playwright check with `reducedMotion: "reduce"`. Split from FE-37.

## Verification

1. `npm run tokens:check` prints every pair with its ratio and exits non-zero on any failure (FE-115, FE-116).
2. `grep -rE "#[0-9a-fA-F]{3,8}" web/src --include=*.{ts,tsx,css} | grep -v styles/tokens.css` returns nothing (FE-40 plus FE-113).
3. `/dev/ui` renders the token table and swatches correctly in light and dark (Playwright `emulateMedia`).
4. With reduced motion emulated, no element has a computed `transition-duration` above 0.01ms (FE-124).
5. `className="text-citron-surface"` in a test file fails lint (FE-117).

## Open questions

- `warning` or `attention` as the canonical name (FE-112).
- Should the dark `--ring` stay citron (currently `--citron-400`) given citron is a surface colour? It is a focus indicator, not text, so it is likely fine; confirm in FE-122.
- Do the 10px and 14px radii replace the shadcn derived scale entirely, or sit beside it (FE-120)?
