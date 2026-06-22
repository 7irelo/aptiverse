# Aptiverse design system

One-page reference for the visual + motion language. The full rubric lives
in the four skills under `web/.claude/skills/`; this file is the short
lookup for "where does X live and what value do I use".

## Token sources

| What | Where | Notes |
|---|---|---|
| Brand colours | `palette.ts` → `brand` | Teal (academic), lavender (wellbeing), amber (achievements only), terracotta (warm attention), forest (success), rose (destructive admin only). |
| Semantic palette | `palette.ts` → `lightPalette` / `darkPalette` | What components reach for at runtime via `theme.palette.X`. |
| Type ramp | `typography.ts` | `h1..h6`, `subtitle1/2`, `body1/2`, `caption`, `overline`. Three sizes per page max — don't reach for a fourth. |
| Component overrides | `components.ts` | Cards = border-only at 12px. Buttons = 8px, no elevation. Inputs = 8px, 52px min-height. |
| Motion presets | `lib/motion.ts` | `enter`, `enterStagger(i)`, `slideUp`, `press`. Don't redefine springs inline. |

## The spacing scale

Base unit is 8px (set via `spacing: 8` in `theme/index.ts`). Allowed values
in `theme.spacing(n)`:

| Token | Pixels | Use for |
|---|---|---|
| `0.5` | 4px  | Inline gap between an icon and its label. |
| `1`   | 8px  | Tight stacks (form field group, button-row). |
| `1.5` | 12px | Card-content vertical rhythm. |
| `2`   | 16px | Default card padding side, button-to-button gap on row. |
| `2.5` | 20px | Card padding (`p: 2.5` is the standard). |
| `3`   | 24px | Grid container `spacing={3}`, page-section gap. |
| `4`   | 32px | Big visual breaks — page-header to first content row. |
| `6`   | 48px | Top-of-page hero spacing only. |

If you find yourself reaching for `2.25` or `13` — that's the signal to
align to the scale, not invent a new value.

## The shadow ladder

Cards: **no shadow**, use border. Reach for shadow only when an element
genuinely floats (a dropdown menu, a toast, a hovering action sheet).

When you do need one:

```ts
const layered = (theme: Theme) =>
  theme.palette.mode === "dark"
    ? `0 1px 1px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3), 0 16px 24px rgba(0,0,0,0.25)`
    : `0 1px 1px rgba(17,17,17,0.04), 0 4px 8px rgba(17,17,17,0.04), 0 16px 24px rgba(17,17,17,0.04)`;
```

Three stacked layers at decreasing opacity — never a single fluffy halo.

## Border-radius hierarchy

| Element | Radius |
|---|---|
| Chips, inline pills | 6px |
| Buttons, inputs, icon buttons | 8px |
| Cards, panels | 12px |
| Modals, drawers, large sheets | 16–20px |
| Avatars, status dots | full circle |

Never use `rounded-full` on rectangular surfaces — it screams "designed in
2019".

## The accent rule

**One accent colour visible per page surface at a time.** That's the brand
teal (`primary`) for the academic majority. Wellbeing pages may switch to
lavender (`palette.wellbeing`). Achievement surfaces — and only those —
may use amber. Everything else is foreground / muted / divider.

Anti-patterns we've already burned ourselves on:

- A purple-gradient hero card on the wellbeing page → replaced with a calm
  composition. See `dashboard/wellbeing/page.tsx` for the pattern.
- "Stat card with a coloured icon swatch" used 4-up — too noisy at scale.
  The wellbeing page's `Stat` component (label + value + hint, no icon)
  is the replacement pattern for dense rows.

## Motion presets

Import from `@/lib/motion`:

```tsx
import { enter, enterStagger, press } from "@/lib/motion";

<motion.div {...enter}>Hero</motion.div>

{items.map((t, i) => (
  <motion.div key={t.id} {...enterStagger(i)}>...</motion.div>
))}

<motion.button {...press}>Click</motion.button>
```

`prefers-reduced-motion: reduce` is honoured globally via a `MuiCssBaseline`
rule — every transition collapses to ~0ms. Don't add your own override.

## Focus + keyboard

Every focusable element gets a 2px primary-colour ring with 2px offset, via
the global `*:focus-visible` rule. Don't strip it with `outline: none`. If
you need to *replace* it (rare), match the visual weight.

## Dark mode

Built in. Every page must look intentional in both modes — toggle via the
top-bar control. Never hardcode hex values; use semantic tokens:

```tsx
// ✗ wrong
sx={{ color: "#161616", bgcolor: "#fff" }}

// ✓ right
sx={{ color: "text.primary", bgcolor: "background.paper" }}

// ✓ when you need mode-conditional treatment
sx={{
  bgcolor: (t) => t.palette.mode === "dark"
    ? "rgba(255,255,255,0.02)"
    : "rgba(0,0,0,0.02)",
}}
```

## When to add to this file

When you make a decision that should bind future pages — a new spacing
value, a new motion preset, a new semantic colour. Add the entry here +
update the matching skill file in `.claude/skills/` so the rubric stays
in sync. If you've added a one-off value that *shouldn't* propagate,
leave it in the page and don't document it.
