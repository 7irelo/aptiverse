---
name: taste
description: Catch tasteless choices before they ship — visual noise, copy that sounds like a database, lazy stock-photo and emoji-as-icon, fake metrics. Invoke whenever you're about to push a UI change or write user-facing copy.
---

# Taste

Taste is the negative space of design — what you choose *not* to do.
This skill is a list of the failures that show up most often in fresh
output and the corrections that fix them. Run it as a sanity sweep.

## What "tasteful" means in this codebase

- The product is **calm**. A teenager opens it on a phone after a long
  school day. Loud UI feels like more homework.
- The product is **honest**. Numbers are real, names are anonymised
  appropriately, "AI" is named only where it adds clarity (per the privacy
  rule).
- The product is **specifically South African**. NSC, IEB, SBA, FET, NSFAS,
  bursaries by name. Not "Tier 1 universities" — we name UCT, Wits, Stellies.
- The product is **for students, parents, teachers, schools**. Not for
  investors. No "synergy", no "AI-powered everything", no "platform".

## Anti-patterns to catch

### Visual

| Tasteless | Tasteful |
|---|---|
| Purple-to-pink gradient on a card | Solid neutral with a single accent border |
| Three different shadow elevations on one screen | One shadow style, applied sparingly |
| `border-radius: 24px` on small buttons | 6–8px buttons, 12px cards, 16–20px sheets |
| Stock photo of "diverse students smiling at a laptop" | A real screenshot of the product, or no image |
| Decorative SVG blobs in the corner | Empty space |
| Emoji 🎉 standing in for a celebration icon | Lucide `PartyPopper` (or no icon — the colour does it) |
| Glow + gradient + shadow + tilt on a hero card | Pick one — usually none |
| Pure-black text on pure-white | `#161616` on `#FAFAFA` |
| 5 different accent colours on one page | One accent, supporting neutrals |
| Animation on page load (every card fades in sequentially) | Static; animate only on interaction |

### Copy

| Tasteless | Tasteful |
|---|---|
| "Welcome to your dashboard!" | "Hey [Name] — here's where you left off." |
| "Unlock your full potential with AI-powered tutoring" | "An AI tutor that knows the NSC syllabus by heart." |
| "Empower learners and parents with insights" | "See where your child needs help — before the term ends." |
| "Get started" (CTA on landing) | "See it on your matric subjects" |
| "Error 500: Something went wrong" | "Couldn't save. Check your connection and try again." |
| "0 results found" | "No goals yet — set your first one to start tracking." |
| "Loading..." | A skeleton that matches the real layout |
| "Click here" / "Learn more" link text | "See pricing" / "Read the SBA guide" |
| `"3.8/5"` raw | "3.8 out of 5 — steady this week" |
| ALL-CAPS HEADLINE for emphasis | Sentence case + weight |

### Data / numbers

- **Never fabricate metrics on a real-user page.** "12-day streak" must
  come from a check-in count, not a hard-coded string. If the data isn't
  there yet, show the empty state.
- **Round honestly.** "7h 12m" is fine. "7.2 hours of perfect rest"
  is dishonest if the source is a self-reported nap log.
- **Compare against meaningful baselines.** "−3% vs last week" only
  matters if last week is shown next to it.

### Iconography

- One icon set per project. We use **MUI `*Outlined` icons** consistently.
  Don't sprinkle Lucide or FontAwesome on top.
- Outlined > filled — softer feel.
- No icon-emoji confusion: emoji are for content (the user's own data),
  icons are for UI affordances.

### Interactions

- **Don't toast what the user already saw.** The button changed state →
  no "Saved!" toast required.
- **Confirmation dialogs only for destructive actions.** Don't ask "Are
  you sure you want to add a goal?" — it's reversible.
- **Don't trap the user with onboarding tours** they can't dismiss.

### Marketing

- **No "trusted by" logo wall** if you don't have logos to put there.
- **No countdown timers** for fake urgency.
- **No "join 10,000 students"** if there aren't 10,000 yet. "Built for
  Grade 10–12" is honest framing without lying.
- **No testimonials** from "Sarah, parent" with a stock photo. Either
  real users with consent, or no testimonials.

## The taste pass

Before any UI change ships, sweep:

1. **Do a 5-second squint test.** Step back, half-close your eyes — does
   one thing draw attention? Is it the right thing?
2. **Read the copy aloud.** Does it sound like a person talking to a
   teenager, or like a CRUD form?
3. **Diff against the anti-patterns above.** Anything matching the left
   column? Fix it.
4. **Run it past the privacy rule.** Are we revealing tech stack
   (Claude, Anthropic, Paystack, etc.) on a user-visible surface? Strip it.
5. **Check the data is real.** If a number is on the screen, can you
   point to the API that produced it? If not, replace with an empty
   state or skeleton.

## Use this skill when

- Reviewing your own UI change before commit.
- Writing copy for any user-facing surface (button labels, headlines,
  emails, error messages).
- Picking colour, spacing, or component variants — the anti-patterns
  table is the cheat sheet.
- Deciding whether to add a thing. Default answer: no. The bar for new
  visual elements is high.
