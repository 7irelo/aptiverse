# MathInput (MathLive wrapper)

| | |
|---|---|
| ID | `UI-30` (split: `UI-116` to `UI-121`) |
| Phase | 3 (used from Phase 5) |
| Depends on | UI-03, UI-28 |
| File path | planned `web/src/components/common/math-input.tsx` |
| Status | 0 of 7 done, 0 partial, 7 not started (no `mathlive` dependency in `web/package.json`) |

## Purpose

Let students type maths answers on a phone: practice answers, tutor questions with equations, worked steps. Wraps MathLive's `math-field` web component as a controlled React input that produces LaTeX and plugs into react-hook-form.

## API (planned)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string` | required | LaTeX. |
| `onChange` | `(latex: string) => void` | required | |
| `label` | `string` | required | Visible label via the form field wrapper. |
| `id`, `name` | `string` | none | |
| `placeholder` | `string` | none | Plain text hint. |
| `disabled`, `readOnly` | `boolean` | `false` | Read only shows a submitted answer. |
| `invalid` | `boolean` | `false` | Destructive focus ring (FE-36). |
| `keyboard` | `"auto" \| "manual" \| "off"` | `"auto"` | Virtual keyboard policy; auto on touch. |
| `layout` | `"basic" \| "algebra" \| "calculus"` | `"basic"` | Which keyboard layout to show, by study unit level. |
| `maxLength` | `number` | 500 | Characters of LaTeX. |

Form binding: `MathField` in `form-fields.tsx` style (`control`, `name`, `label`, `description`).

## Variants

Inline single line; multi line steps (later); read only.

## States

Empty, focused with virtual keyboard, invalid (server or zod error), disabled during attempt submit, loading (skeleton while the module loads).

## Accessibility

- Label associated through the field wrapper; `aria-describedby` for hint and error.
- MathLive provides speech output for the expression; verify on VoiceOver and TalkBack (UI-120).
- Virtual keyboard keys at least 44px; does not cover the field at 360px.
- Plain text fallback: a "Type as text" toggle that accepts ASCII maths and converts with `normalizeAsciiMath`.
- Colours via CSS custom properties MathLive exposes, mapped to tokens, both schemes.

## Tasks

- [ ] **UI-30** MathLive input wrapper
- [ ] **UI-116** Decision note: MathLive version, licence (MIT), bundle size, CSP needs (fonts and sounds served from self, no `unsafe-eval`), recorded here before adding the dependency
- [ ] **UI-117** Client only wrapper loaded with `next/dynamic` (skeleton fallback), controlled LaTeX value, maxLength, so routes without maths input carry no MathLive code and stay under 150 KB JS gzip
- [ ] **UI-118** Virtual keyboard configuration: layouts by level, 44px keys, behaviour at 360px, theme mapped to tokens in light and dark
- [ ] **UI-119** react-hook-form binding (`MathField`) with generated zod validation and error display
- [ ] **UI-120** Accessibility: label wiring, speech check on iOS and Android, plain text fallback toggle
- [ ] **UI-121** Tests: Vitest for the binding (mocked element), Playwright gallery spec (type `x^2`, value becomes `x^{2}`), keyboard only entry, snapshots light and dark at 360 and 1440, axe zero violations

## Tests

As in UI-121; plus a practice runner E2E in Phase 5 that answers a maths question on Pixel 7.

## Verification

1. `next build` shows MathLive only in chunks for routes that use it.
2. On a real Android low end device (HRD-40) typing an answer does not lag.
3. CSP report shows no violations from MathLive fonts or sounds.

## Open questions

- Is MathLive needed in v1 at all, or does the plain text plus ASCII bridge cover Phase 5 answers?
- Sounds on keypress: disable by default?
