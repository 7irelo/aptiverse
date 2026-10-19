# Markdown

| | |
|---|---|
| ID | `UI-29` (split: `UI-112` to `UI-115`) |
| Phase | 3 |
| Depends on | UI-28 |
| File path | `web/src/components/common/markdown.tsx` |
| Status | 0 of 5 done, 2 partial, 3 not started |

## Purpose

Render Markdown from the AI tutor, explanations, FAQs and help articles with GitHub tables and lists and KaTeX maths, styled with tokens (no typography plugin). Works in Server Components.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `children` | `string` | required | Markdown source. |
| `asciiMath` | `boolean` | `false` | Legacy ASCII maths conversion; off for prose. |
| `className` | `string` | none | |
| `id` | `string` | none | For `aria-describedby` links. |

Plugins: `remark-gfm`, `remark-math`, `rehype-katex` (`throwOnError: false`). Headings map down one or two levels (h1 and h2 become h3) because Markdown always sits inside a page that owns h1 and h2. External links open in a new tab with `rel="noopener noreferrer"`.

## Variants

Default; compact (chat bubbles, `text-sm`); streaming (UI-115).

## States

Populated; empty string renders nothing; malformed maths renders inline in the error colour.

## Accessibility

- Heading levels never start above h3.
- Links underlined (not colour only); external links get a visually hidden "(opens in a new tab)" (UI-113).
- Tables scroll inside a wrapper at 360px with a caption where the source provides one.
- Code blocks scroll horizontally, keyboard focusable when they overflow.

## Security

- Raw HTML is not rendered (react-markdown default without `rehype-raw`), so model or user content cannot inject markup.
- react-markdown's default `urlTransform` strips `javascript:` and other unsafe protocols; keep it and add a test.
- Images: decide allowlist or disable (UI-112); remote images would leak the viewer's IP to arbitrary hosts and break CSP `img-src 'self'`.
- KaTeX options from UI-107 apply to `rehype-katex` too (`trust: false`, `maxSize`, `maxExpand`).

## Tasks

- [ ] **UI-29** Markdown renderer with KaTeX, GFM *(partial: `Markdown` with GFM, remark-math, rehype-katex, heading remap and safe external links in `web/src/components/common/markdown.tsx`, uncommitted WIP)*
- [ ] **UI-112** Security pass: pass KaTeX limits to rehype-katex, disable or allowlist images, assert `urlTransform` default, document the untrusted content contract *(partial: raw HTML already ignored by default)*
- [ ] **UI-113** Element polish: table scroll wrapper, focusable overflowing code blocks, new tab hint on external links, compact variant
- [ ] **UI-114** Tests: Vitest XSS corpus (`<script>`, `<img onerror>`, `[x](javascript:...)`, `\href{javascript:...}`) renders inert; heading remap; GFM table; gallery snapshots light and dark at 360 and 1440, axe zero violations
- [ ] **UI-115** Streaming safe rendering for tutor chat: render partial Markdown chunks without layout thrash (close open code fences and math delimiters before render), used by the SSE reader from FE-62

## Tests

- Vitest `markdown.test.tsx` as in UI-114.
- Playwright gallery `markdown.spec.ts`: long table and code block scroll inside their boxes at 360px.

## Verification

1. XSS corpus renders as text in the gallery.
2. CSP violations panel stays empty when rendering tutor answers.

## Open questions

- Should help articles (admin authored) allow images from the uploads bucket via presigned GET, while tutor output allows none?
- Should Markdown move to a client island for streaming, keeping the server version for static content?
