# ResponsiveDialog

| | |
|---|---|
| ID | `UI-07`, `UI-54` to `UI-56` |
| Phase | 3 |
| Depends on | UI-01, FE-37 (motion tokens) |
| File path | `web/src/components/ui/dialog.tsx`, `web/src/components/ui/sheet.tsx` (committed); `web/src/components/common/responsive-dialog.tsx` (to add) |
| Status | Partial. shadcn Dialog (centred, `showCloseButton`) and Sheet (`side` top, right, bottom, left) are committed. No `ResponsiveDialog` that is a Dialog on desktop and a bottom Sheet on phones. 0 of 4 tasks done, 1 partial. |

## Purpose

One modal API for short tasks (add an assessment, edit a target). Desktop gets a centred dialog; phones get a bottom sheet that is reachable with the thumb. Pages never choose between Dialog and Sheet themselves.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open`, `onOpenChange` | `boolean`, `(open) => void` | uncontrolled | Controlled or uncontrolled. |
| `trigger` | `ReactNode` | none | Rendered through `asChild`. |
| `title` | `string` | required | Becomes `DialogTitle` or `SheetTitle`. |
| `description` | `string` | none | When absent, `aria-describedby` is removed explicitly. |
| `children` | `ReactNode` | | Body; scrolls inside the sheet. |
| `footer` | `ReactNode` | none | Sticky actions; stacked full width on phones, right-aligned from `sm`. |
| `breakpoint` | `"sm"`, `"md"` | `"md"` | Width at which it switches from sheet to dialog. |

## Variants

Dialog (from the breakpoint up) and bottom Sheet (below it). One size; long forms belong on a page or in the Drawer (`drawer.md`).

## States

Closed, opening (motion token), open, submitting (footer Button `loading`, close disabled), closing. Under reduced motion it appears without slide.

## Accessibility

- Radix handles focus trap, `Escape` to close, focus return to the trigger, `aria-modal`, scroll lock.
- Close button is 44px and labelled "Close".
- Initial focus goes to the first field or the title, never the close button.
- Breakpoint switch uses a CSS-driven approach or a `matchMedia` hook that renders on the server without hydration mismatch (UI-55).
- RTL not required for v1.

## Tasks

- [ ] **UI-07** Dialog (desktop) and Sheet (mobile bottom) via one `ResponsiveDialog` *(partial: `ui/dialog.tsx` and `ui/sheet.tsx` committed as stock shadcn; the wrapper is split into UI-54 to UI-56)*
- [ ] **UI-54** Restyle Dialog and Sheet to tokens: 14px radius, overlay token, 44px close button, safe-area padding on the bottom sheet (`env(safe-area-inset-bottom)`), motion tokens with reduced-motion off
- [ ] **UI-55** `useMediaQuery` hook (SSR safe, defaults to mobile) and the `ResponsiveDialog` wrapper in `components/common/responsive-dialog.tsx`
- [ ] **UI-56** Sticky footer and scrollable body for long content, initial focus rule, and gallery examples (form dialog, info dialog)

## Tests

- Vitest: renders Sheet below the breakpoint and Dialog above it (mocked `matchMedia`); title wires `aria-labelledby`; Escape calls `onOpenChange(false)`.
- Playwright `dev-ui-responsive-dialog.spec.ts`: Pixel 7 shows a bottom sheet, Desktop Chrome shows a centred dialog; focus returns to the trigger on close; axe zero violations while open, light and dark; snapshots at 360 and 1440.

## Verification

1. At 360px the sheet footer is above the iOS home indicator (iPhone 14 project).
2. No hydration warning in the console when the page first renders on a phone viewport.

## Open questions

- Should the bottom sheet support drag to dismiss (would need `vaul` or similar, a new dependency)?
