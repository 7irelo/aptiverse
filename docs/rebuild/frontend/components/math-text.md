# MathText

| | |
|---|---|
| ID | `UI-28` (split: `UI-107` to `UI-111`) |
| Phase | 3 |
| Depends on | FE-30 |
| File path | `web/src/components/common/math-text.tsx`, `web/src/lib/math/ascii-math.ts` (with `ascii-math.test.ts`) |
| Status | 0 of 6 done, 2 partial (component WIP with bridge tests; MathML output set but not checked on devices), 4 not started |

## Purpose

Render a line of text that may contain maths: practice questions, options, explanations, marks breakdowns. KaTeX renders on the server to an HTML string, so there is no client JavaScript and no flash. The ASCII math bridge converts legacy content such as `(x^2 - 4)/(x - 2)` to LaTeX.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | required | Supports `$...$`, `\(...\)` inline and `$$...$$`, `\[...\]` display. |
| `asciiMath` | `boolean` | `true` | Run `normalizeAsciiMath` first; skipped when explicit delimiters exist. |
| `className` | `string` | none | |

Helpers in `lib/math/ascii-math.ts`: `normalizeAsciiMath`, `parseMathSegments`, `normalizeMathDelimiters`.

## Variants

Inline; display (block span with horizontal scroll and centring); plain text passthrough when no maths found.

## States

- Valid maths: KaTeX HTML plus MathML (`output: "htmlAndMathml"`).
- Malformed maths: `throwOnError: false` renders the source in the error colour, the rest of the question still renders.
- Empty string: renders nothing.

## Accessibility

- MathML output gives screen readers the expression; visual HTML is KaTeX's.
- Display maths scrolls horizontally inside its own box at 360px, never the page.
- Error colour must meet AA in both schemes (KaTeX default `#cc0000` is a hex outside tokens: override with `errorColor` from a token, UI-107).

## Security

Output is injected with `dangerouslySetInnerHTML`, so KaTeX options are the boundary. UI-107 sets `trust: false` (explicit), `strict: "warn"`, `maxSize` (for example 10em), `maxExpand` (for example 100) and `errorColor` from a token, and caps input length. Content comes from the AI module and from users, so treat it as untrusted.

## Tasks

- [ ] **UI-28** MathText (KaTeX port) and ASCII-math bridge *(partial: `MathText` in `web/src/components/common/math-text.tsx` is uncommitted WIP; `lib/math/ascii-math.ts` and its Vitest test exist, also uncommitted)*
- [ ] **UI-107** KaTeX hardening: `trust: false`, `strict`, `maxSize`, `maxExpand`, input length cap, token based `errorColor`
- [ ] **UI-108** Bridge corpus test: 50 real legacy question strings from the old app reference (f223ca7 practice content, read only) with expected LaTeX
- [ ] **UI-109** Screen reader check of MathML output on iOS VoiceOver and Android TalkBack, documented in the component file *(partial: `output: "htmlAndMathml"` already set; not checked on devices)*
- [ ] **UI-110** Load `katex.min.css` only on routes that render maths (move the import to a route level stylesheet or a wrapper used only there) and measure CSS weight
- [ ] **UI-111** Tests: Vitest (inline and display parsing, malformed input does not throw, XSS strings such as `\href{javascript:...}` and `\htmlClass` are rendered inert) and gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

- Vitest `math-text.test.tsx` and existing `ascii-math.test.ts`.
- Playwright gallery `math-text.spec.ts`: long display equation scrolls inside its box at 360px.

## Verification

1. `\href{javascript:alert(1)}{x}` renders as text, no anchor.
2. `\rule{9999em}{9999em}` is capped by `maxSize`.
3. Lighthouse on a page without maths loads no KaTeX CSS (after UI-110).

## Open questions

- Store questions as LaTeX only from Phase 5 and run the bridge once during migration (MIG), so the runtime bridge can be removed later?
