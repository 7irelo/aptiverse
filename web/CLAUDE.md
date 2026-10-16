# Aptiverse web: rules for every change

This repo is the rebuilt Aptiverse web app (Next.js 16, React 19, Tailwind v4,
shadcn/ui). The previous MUI app is reference only; do not copy its code or
its old CLAUDE.md. Next.js 16 differs from older versions: read the guide in
`node_modules/next/dist/docs/` before using an API you are unsure of (see
`AGENTS.md`).

## Rendering

- Server Components by default. Add `"use client"` only to interactive
  leaves (accordions, forms, editors, charts, the practice runner), never to
  pages or layouts.
- Data for a page is read on the server, inside a `<Suspense>` boundary.
  Shared loaders live in `src/features/<domain>/server/` and use
  `"use cache"` with `cacheLife` and `cacheTag`.
- Every route segment has `loading.tsx`, `error.tsx` and `not-found.tsx`
  (or inherits a fitting one). Error states always offer a retry. Use
  `PageState` from `src/components/shell/page-state.tsx`.
- `error.tsx` receives `{ error, retry }` in Next 16 (not `reset`).

## API access

- Only the generated client: types, zod schemas and hooks from
  `src/lib/api/generated`. Never hand-write API types or edit generated
  files. Change the spec with `npm run api:sync`, then `npm run api:gen`.
- One HTTP client: `src/lib/api/fetcher.ts`. Server code calls the API
  directly; client components call through `/api/bff`.
- Validate server responses with the generated zod schema.

## Styling

- Tokens only. Colours come from `src/styles/tokens.css` through Tailwind
  utilities (`bg-primary`, `text-muted-foreground`, `bg-citron-surface`).
  No hex values anywhere else; ESLint enforces it.
- Citron is a surface accent, never low-contrast text. Text on citron is
  graphite (`text-on-citron`). For citron-coloured text use `text-citron-ink`.
- Colour zones: magenta for wellbeing, amber for earned achievements only,
  terracotta for warm "needs work", forest for success, rose for errors.
- Light and dark follow the OS via `prefers-color-scheme`. No theme toggle,
  no class-based dark mode.
- Icons: `lucide-react` only. MUI, Emotion and other icon sets are banned by
  ESLint.

## Mobile first

- Design and build at 360px wide first, then add `sm:` and up.
- Tap targets at least 44px tall (`min-h-11`), 16px side gutters (`px-4`).
- Playwright runs Pixel 7 and iPhone 14 before desktop Chrome, with axe
  checks in light and dark mode. Zero violations.

## Accessibility

- Real `button` and `a` elements for anything clickable.
- Radix primitives (via shadcn/ui) for disclosure, dialogs and menus.
- One `h1` per page, headings in order, icons `aria-hidden` unless they carry
  meaning.

## Writing

- No emojis. No em dashes or en dashes, anywhere: code, comments, copy,
  docs, commit messages. ESLint scans strings, JSX text and comments.
- Copy is plain and friendly to students, from Grade 10 to university.

## Before you commit

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run e2e
```

If you touched the spec or Orval config, run `npm run api:check` too.

## Commits

Conventional commits: `type(scope): subject`, for example
`feat(help): group faqs by category` or `fix(api): retry on 503`. The body
explains why. Never push generated code without the spec change that caused it.
