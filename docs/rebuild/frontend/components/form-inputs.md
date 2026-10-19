# Form inputs

| | |
|---|---|
| ID | `UI-02`, `UI-39` to `UI-43` |
| Phase | 3 |
| Depends on | FE-03, FE-35, FE-36 (see `frontend/tokens.md`), UI-01 |
| File path | `web/src/components/ui/input.tsx`, `ui/select.tsx`, `ui/label.tsx` (exist); `ui/textarea.tsx`, `ui/checkbox.tsx`, `ui/radio-group.tsx`, `ui/switch.tsx` (to add) |
| Status | Partial. Input, Select and Label are committed as stock shadcn (Input is `h-8`). Textarea, Checkbox, RadioGroup and Switch do not exist. 0 of 6 tasks done, 1 partial. |

## Purpose

The raw form controls. Pages never use them bare: they sit inside the form field wrapper (`form-field.md`, UI-03), which supplies label, hint and error wiring. This file covers the controls themselves.

## API

| Component | Key props | Default | Notes |
|---|---|---|---|
| `Input` | `ComponentProps<"input">` | | `text-base md:text-sm` already avoids iOS zoom. |
| `Textarea` | `ComponentProps<"textarea">`, `autoResize?: boolean` | `false` | New. `field-sizing: content` when `autoResize`, capped by a max height. |
| `Select` (Radix) | `value`, `onValueChange`, `name`, `disabled`; parts `SelectTrigger`, `SelectContent`, `SelectItem` | | Existing. |
| `Checkbox` | `checked: boolean or "indeterminate"`, `onCheckedChange`, `disabled`, `name`, `value` | | New, Radix Checkbox with Lucide `Check` and `Minus`. |
| `RadioGroup`, `RadioGroupItem` | `value`, `onValueChange`, `orientation` | `vertical` | New, Radix RadioGroup. |
| `Switch` | `checked`, `onCheckedChange`, `disabled` | | New, Radix Switch. Only for settings that apply immediately (notification preferences), never inside a submit form. |
| `Label` | `htmlFor` | | Existing. |

## Variants

- One visual style and one size per control: 44px tall on phones (`min-h-11`). No small variant in v1.
- Choice cards: RadioGroup items rendered as bordered cards (the nested `FieldLabel` pattern already styled in `ui/field.tsx`) for onboarding choices such as education level (high school or university).

## States

Default, hover (border step), focus visible (focus ring token), disabled (`opacity-50`, `cursor-not-allowed`), invalid (`aria-invalid` gives the destructive border and ring), read only (muted surface), checked and indeterminate (Checkbox), on and off (Switch).

## Accessibility

- Every control has a programmatic label (UI-03 or `aria-label`); a placeholder is never the label.
- Keyboard: Space toggles Checkbox and Switch; arrow keys move within RadioGroup; Select opens with Enter, Space or arrows and supports type-ahead.
- Hit area: Checkbox, Radio and Switch visuals may be 20px but the clickable label row is at least 44px tall.
- Invalid state is conveyed by the error text, not colour alone.
- Borders use `--input`, which must meet 3:1 non-text contrast in both schemes (FE-33).
- Switch thumb transition is off under `prefers-reduced-motion`.
- RTL not required for v1.

## Tasks

- [ ] **UI-02** Input, Textarea, Select, Checkbox, Radio, Switch *(partial: `input.tsx`, `select.tsx`, `label.tsx` committed as stock shadcn; remaining controls and restyle split into UI-39 to UI-43)*
- [ ] **UI-39** Restyle Input and SelectTrigger to tokens: `min-h-11`, 10px control radius, focus ring token; SelectItem `min-h-11` in the primitive (today only `form-fields.tsx` adds it)
- [ ] **UI-40** Add `Textarea` (`npx shadcn@4.22.0 add textarea`), restyle, optional `autoResize` with a max height
- [ ] **UI-41** Add `Checkbox` with indeterminate support and a 44px label row; Lucide icons only
- [ ] **UI-42** Add `RadioGroup` plus the choice card pattern for onboarding questions
- [ ] **UI-43** Add `Switch` with reduced-motion handling; document "applies immediately" usage

## Tests

- Vitest: Checkbox toggles and reports `indeterminate`; RadioGroup arrow keys change value; Switch has `role="switch"` and `aria-checked`; Textarea `autoResize` stops at the max height.
- Playwright gallery `dev-ui-form-inputs.spec.ts`: each control in default, focus, disabled and invalid; light and dark, 360 and 1440 snapshots; axe zero violations; keyboard-only operation of each control.

## Verification

1. Every control is at least 44px tall, or has a 44px label row, at 360px.
2. On the iPhone 14 project, focusing an Input does not zoom the page.
3. axe passes on the gallery in both colour schemes.

## Open questions

- Native `select` on phones for long lists (schools, institutions), or a searchable Combobox? A Combobox would need its own UI task.
- Should a plain date input live here, or only the date picker (`date-picker.md`)?
