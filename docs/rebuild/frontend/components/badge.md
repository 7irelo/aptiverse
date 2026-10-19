# Badge and Chip

| | |
|---|---|
| ID | `UI-05`, `UI-50` to `UI-51` |
| Phase | 3 |
| Depends on | FE-31 (semantic tokens), UI-01 |
| File path | `web/src/components/ui/badge.tsx` (committed); `web/src/components/ui/chip.tsx` (to add) |
| Status | Partial. Stock shadcn Badge committed with variants default, secondary, destructive, outline, ghost, link. No semantic tones (success, warning, wellbeing, achievement) and no interactive Chip. 0 of 3 tasks done, 1 partial. |

## Purpose

Badge: a short, non-interactive status label (Graded, Overdue, Shared with parent). Chip: an interactive, toggleable or removable token used for filters and topic selection.

## API

| Component | Prop | Type | Default | Notes |
|---|---|---|---|---|
| `Badge` | `variant` | `default`, `secondary`, `outline`, `destructive`, `success`, `warning`, `wellbeing`, `achievement` | `default` | Semantic tones are new (UI-50). `ghost` and `link` are dropped from Badge (they are actions, not status). |
| `Badge` | `icon` | `LucideIcon` | none | Optional leading icon, `aria-hidden`. |
| `Badge` | `asChild` | `boolean` | `false` | Existing. |
| `Chip` | `pressed` | `boolean` | | New (UI-51): toggle chip, renders `button` with `aria-pressed`. |
| `Chip` | `onRemove` | `() => void` | none | New: removable chip with a Lucide `X` button labelled "Remove <label>". |

## Variants

| Tone | Token | Use |
|---|---|---|
| `success` | `--success` | Graded, Paid, On track |
| `warning` | `--warning` (terracotta) | Needs work, Due soon. Warm, not punitive. |
| `destructive` | `--destructive` (rose) | Overdue, Failed payment |
| `wellbeing` | `--wellbeing` (magenta) | Diary and mood labels only |
| `achievement` | `--achievement` (amber) | Earned milestones only, never for routine status |

## States

Badge: static. Chip: default, hover, focus visible, pressed, disabled.

## Accessibility

- Badge text must carry the meaning on its own; colour is a supplement.
- Badge height stays compact (20px) because it is not interactive; Chip has `min-h-11` hit area on phones.
- Chip toggle uses `aria-pressed`; remove button has an accessible name.
- Each tone meets AA for its text on its tinted background in both schemes (FE-33).
- RTL not required for v1.

## Tasks

- [ ] **UI-05** Badge / Chip *(partial: stock shadcn Badge committed in `web/src/components/ui/badge.tsx`; tones and Chip split into UI-50 and UI-51)*
- [ ] **UI-50** Badge semantic tones (`success`, `warning`, `wellbeing`, `achievement`), optional icon, remove `ghost` and `link`, restyle pill radius to the full-pill token
- [ ] **UI-51** Add `Chip` (toggle with `aria-pressed`, removable variant, 44px hit area) for filters and topic pickers

## Tests

- Vitest: Chip toggles `aria-pressed`; removable Chip calls `onRemove` and its button is named "Remove Algebra".
- Playwright gallery `dev-ui-badge.spec.ts`: every tone light and dark, 360 and 1440 snapshots; axe zero violations including colour contrast.

## Verification

1. FE-33 contrast script passes for every badge tone pair.
2. No `achievement` badge is used for non-earned status (code review checklist item).

## Open questions

- Does wellbeing need a separate tone for "shared with parent" versus "private"?
