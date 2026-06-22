---
name: emil-kowalski
description: Design rubric inspired by Emil Kowalski's work (sonner, vaul, animations.dev). Restrained, layered, motion-aware UI. Use when designing or refactoring any visible component, page, or transition.
---

# Emil Kowalski design rubric

A specific aesthetic that values restraint over decoration. Two-line summary
of the look: *every visual element earns its place; every motion has intent.*
You are not designing a dashboard, you are designing a calm surface someone
opens at 9pm on a phone.

## What this rubric is for

Apply whenever you're writing or refactoring user-visible UI. Read it before
you reach for a new gradient, shadow, icon, or animation. If the change
doesn't survive contact with the rules below, don't ship it.

## Hard rules

1. **No decorative gradients.** Linear backgrounds are reserved for hero-tier
   moments — at most one per page. The default surface is a single solid colour
   or a 1-2% noise overlay, never a soft pink-to-purple wash.
2. **Layered, low-elevation shadows only.** No `box-shadow: 0 2px 4px rgba(0,0,0,0.1)` defaults.
   Use multiple stacked shadows with different blur radii and almost-black-but-not-black
   colours at very low opacity:
   ```css
   box-shadow:
     0 1px 1px rgba(17, 17, 17, 0.04),
     0 4px 8px rgba(17, 17, 17, 0.04),
     0 16px 24px rgba(17, 17, 17, 0.04);
   ```
   The shadow has to feel like the card is *sitting* on the page, not
   floating above it.
3. **Animations have purpose or don't exist.** Every transition either reveals
   information (a sheet sliding in, a tooltip appearing), confirms an action
   (a press, a copy), or eases a state change. Decorative ambient motion
   (parallax scrolling chrome, looping shader backgrounds) is banned.
4. **Spring motion, never linear.** Use `framer-motion`'s spring presets
   (`stiffness: 300, damping: 30`) or CSS `transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1)`.
   Linear and ease-in-out feel mechanical.
5. **One accent colour per surface.** Pick the colour that earns attention
   (a CTA, an active state, the current step in a flow) and stick to it. The
   rest is foreground / muted-foreground / border.
6. **Type-scale discipline.** Three sizes per page max: heading, body, caption.
   Same `font-weight` ladder (regular, medium, semibold — never all three on
   one screen). Tight line-height on headings (1.1–1.2), generous on body
   (1.5–1.6).
7. **Border radius hierarchy.** Buttons and inputs: `6–8px`. Cards: `12px`.
   Dialogs / sheets / floating surfaces: `16–20px`. Never use rounded-full
   except on avatars and pill-shape buttons.

## The look it produces

- **Backgrounds**: pure neutrals. White → off-white (`#FAFAFA`) in light;
  near-black (`#0A0A0A`) → slightly-lighter (`#161616`) in dark. Never pure
  black, never pure white as the page background.
- **Foreground text**: high-contrast but not jet-black. `#161616` on light,
  `#EDEDED` on dark.
- **Muted text**: ~60% of foreground. Used for labels, helper text, metadata.
- **Borders**: subtle, single source — one border colour, used everywhere.
  Light: `rgba(17, 17, 17, 0.08)`. Dark: `rgba(255, 255, 255, 0.08)`.
- **Cards**: solid `bg`, `border` not `box-shadow`, optional internal divider
  rendered as `1px` border-top.

## Motion patterns

- **Entry**: `opacity 0 → 1` plus `y: 8px → 0`, spring. ~250–350ms total.
- **Exit**: same in reverse, ~200ms — exits are faster than entries.
- **Press**: scale `1 → 0.97` plus a slight `opacity 1 → 0.9` on the button.
- **Toast / notification**: enter from the bottom edge with a stagger.
  Sonner is the reference implementation — match its feel.
- **Sheets / drawers**: from-bottom or from-right slide with a spring.
  Vaul is the reference.
- **List reorder / data update**: use `layout` prop in framer-motion so rows
  spring to their new position rather than snapping.

## What to avoid (taste anti-patterns)

- Colour-on-colour-on-colour buttons (e.g. teal text on a purple gradient
  with a glowing shadow). One colour, one job.
- Emoji used as icons (🎉, 📋, 🚀). Always use a real icon set
  (lucide, tabler, or MUI's `*Outlined` variants).
- Decorative SVG blobs / circles / "abstract shapes" in the background.
- Card upon card upon card. Use plain backgrounds + dividers for grouped
  content; only elevate the *one* thing the user is currently acting on.
- "Glassmorphism" / frosted blurs. Has aged poorly and adds rendering cost.
- Auto-playing video or animated illustration on a content page.
- Toast notifications for things the user already saw happen (e.g. "Item
  saved" after a save button click — the change of state is the feedback).

## Checklist before you ship a screen

- [ ] Three or fewer distinct surfaces (page bg, card, elevated/active state).
- [ ] One accent colour visible on the screen at a time.
- [ ] Every motion can be explained ("this slides in *because* it's a new
      panel of content").
- [ ] No box-shadow with a default browser-feeling halo.
- [ ] No emoji standing in for an icon.
- [ ] Empty / loading / error / success states each visited and intentionally
      designed (not left as "spinner + nothing").
- [ ] The page looks composed and quiet at first glance — content reads
      first, chrome second.

## References

- [animations.dev](https://animations.dev) — Emil's tutorial site; the
  examples are the spec.
- [sonner.emilkowal.ski](https://sonner.emilkowal.ski) — toast component
  reference for motion + sound design.
- [vaul.emilkowal.ski](https://vaul.emilkowal.ski) — drawer/sheet reference.

When in doubt: remove something. Restraint is the brief.
