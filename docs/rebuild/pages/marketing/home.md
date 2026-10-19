# Home

| | |
|---|---|
| ID | `PG-MKT-HOME` |
| Route | `/` |
| Phase | 3 (pricing teaser switched on in Phase 6) |
| Roles | public (signed-out visitors; signed-in visitors see the same page with "Go to your dashboard" in the header) |
| Stages | high school, university |
| Entitlement | free (public) |
| Depends on | SHL-01, FE-30 to FE-37, UI-01, UI-04, UI-05, UI-20, UI-22, UI-23, UI-24, FE-11, FE-63; teaser: BE-BIL-08 and PG-MKT-PRICE-07 (`getPlans`) |
| Old app reference | `43f9faa:web/src/app/(marketing)/page.tsx`; DESIGN_BRIEF section 7 "Home / landing" (intent only) |
| Status | Placeholder Server Component exists (`web/src/app/(marketing)/page.tsx`: h1, subhead, one CTA to `/help`, three highlight cards); axe test for `/` in light and dark in `web/e2e/help.spec.ts`. Everything else not started. |

## Purpose

The first page most visitors see, usually on a phone from a link or an ad. In under ten seconds it must say what Aptiverse is (study and wellbeing support for South African high school and university students, with a connected view for parents), show the product honestly, and offer one clear next step: Start free. Every claim on it must be on the green list of the claims ledger.

## User stories

- As a Grade 11 learner on a phone, I want to understand in one screen what Aptiverse does for my subjects, so that I can decide whether to sign up.
- As a first-year university student, I want to see that it works for my modules, not only school subjects, so that I do not bounce thinking it is for school kids.
- As a parent, I want to see what I would get and what my child keeps private, so that I can trust it.
- As a cautious visitor, I want to try a small piece of the product without signing up, so that I can judge it myself.
- As a visitor comparing prices, I want a real starting price in rand, so that I know if it is affordable.

## Layout

### Mobile (360px)

Ordered top to bottom, single column, 16px gutters, every tap target at least 44px:

1. Public header (SHL-01): wordmark left, menu button right opening a sheet with Features, For students, For parents, Pricing, Help, Sign in, Start free.
2. Hero (`hero.tsx`): h1, subhead (two lines max at 360px), primary button "Start free" (full width, citron surface, graphite text), secondary link-button "See how it works" (scrolls to block 4).
3. Product preview (`product-preview.tsx`): a calm dashboard mock card stack under the hero text, with an "Example" badge top right. Max height 420px, no horizontal scroll.
4. Feature band 1, AI tutor (`mini-demos/tutor-demo.tsx`): heading, two-line description, scripted conversation card with "Play" and "Replay" buttons. Under the band, an outline link "See everything Aptiverse does" to `/features`.
5. Feature band 2, mastery and projection (`mini-demos/mastery-demo.tsx`): heading, description, small chart with a toggle between "High school" and "University" examples.
6. Feature band 3, wellbeing check-in (`mini-demos/checkin-demo.tsx`): heading, description, five Lucide face buttons and a resulting calm message. Magenta wellbeing zone surface.
7. Feature band 4, practice test integrity (`integrity-band.tsx`): heading, three short rules as a list with Lucide icons (Timer, Eye, Lock).
8. Parents band (`parents-band.tsx`): heading, two columns collapsed to two stacked lists "What you see" and "What stays private", link "For parents".
8a. South African context band (`sa-context-band.tsx`): heading and three short verified facts as cards (curriculum, past papers source, diary privacy), each with a Lucide icon.
9. Pricing teaser (`pricing-teaser.tsx`): one line with the starting price from the API and a link "See plans and prices". Hidden entirely while the flag is off.
10. Closing CTA (`closing-cta.tsx`): heading, one sentence, "Start free" button.
11. Public footer (SHL-01).
12. Consent banner (`consent-banner.tsx`), first visit only, until a choice is made: a slim non-modal bottom sheet (no more than about a fifth of a 740px viewport), above the home indicator via `env(safe-area-inset-bottom)`, never covering the hero "Start free" button (the page gets bottom padding equal to the banner height while it shows).

### Desktop (1440px)

- Content max width 1152px (`max-w-6xl`), centred.
- Hero becomes a 12-column grid: text in columns 1 to 6, product preview in columns 7 to 12, vertically centred. CTAs side by side.
- Feature bands alternate: text 5 columns, demo 7 columns; bands 1 and 3 have the demo on the right, band 2 on the left. Band 4 is a three-column row of rules.
- Parents band: two columns side by side.
- Pricing teaser and closing CTA stay centred, max width 720px.
- Header shows inline links instead of the menu button.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(marketing)/page.tsx` | server | Composes blocks; no data fetching except the teaser inside `<Suspense>` |
| OG image | `web/src/app/(marketing)/opengraph-image.tsx` | server (build) | Static 1200x630, wordmark plus headline, tokens only |
| Content | `web/src/features/marketing/content/home.ts` | server | Typed constants for every string on the page |
| MarketingSection | `web/src/features/marketing/components/marketing-section.tsx` | server | Section wrapper: `aria-labelledby`, heading level prop, spacing; shared by all marketing pages |
| Hero | `web/src/features/marketing/components/hero.tsx` | server | h1, subhead, CTAs (Button `asChild` with Link) |
| ProductPreview | `web/src/features/marketing/components/product-preview.tsx` | server | Built from `components/common/stat-card.tsx`, `progress-ring.tsx`, `components/ui/card.tsx`, `badge.tsx`; sample data from `content/home.ts`, labelled "Example" |
| TutorDemo | `web/src/features/marketing/components/mini-demos/tutor-demo.tsx` | client | Scripted messages revealed in sequence; no network, no AI call |
| MasteryDemo | `web/src/features/marketing/components/mini-demos/mastery-demo.tsx` | client | Uses `components/common/charts.tsx` LineChart; stage toggle via `components/ui/tabs.tsx`; text summary under the chart |
| CheckinDemo | `web/src/features/marketing/components/mini-demos/checkin-demo.tsx` | client | Radio group of five moods; stores nothing |
| IntegrityBand | `web/src/features/marketing/components/integrity-band.tsx` | server | Static list |
| ParentsBand | `web/src/features/marketing/components/parents-band.tsx` | server | Static two lists |
| PricingTeaser | `web/src/features/marketing/components/pricing-teaser.tsx` | server | Reads `getPlans()`; renders nothing when flag off |
| ClosingCta | `web/src/features/marketing/components/closing-cta.tsx` | server | Shared by all marketing pages: heading, body, one primary CTA |
| CtaLink | `web/src/features/marketing/components/cta-link.tsx` | client | Tiny leaf around Link that fires `track()`; the only client code in hero and closing CTA |
| JSON-LD | `web/src/features/marketing/components/json-ld.tsx` | server | Renders `<script type="application/ld+json">` from a typed object |
| Sitemap | `web/src/app/sitemap.ts` | server (build) | Lists every public marketing route that is switched on |
| Robots | `web/src/app/robots.ts` | server (build) | Allows marketing, disallows `/dashboard`, `/parent`, `/admin`, `/refer`, `/onboarding`, `/api` |
| SaContextBand | `web/src/features/marketing/components/sa-context-band.tsx` | server | Three cards from `content/home.ts`; each fact carries a ledger reference in the content file |
| ConsentBanner | `web/src/components/common/consent-banner.tsx` | client | Built and owned by PG-MKT-LEGAL-16; home only mounts it, once, in `web/src/app/(marketing)/layout.tsx` (and the auth layout); reads and writes the decision through the FE-63 consent module (`web/src/lib/analytics/consent.ts`); "Privacy choices" in the footer reopens the preferences dialog owned by PG-MKT-LEGAL |
| Banned claims list | `web/src/features/marketing/content/banned-claims.ts` | shared | Phrases the red list forbids (see Copy); every marketing content test imports it |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `GET /billing/plans` (BE-BIL-08) via `getPlans()` in `web/src/features/billing/server/get-plans.ts` | GET | `code`, `audience`, `kind`, `monthlyPriceCents`, `currency`, `isActive` (exact names from the generated client) | `"use cache"`, `cacheTag("billing:plans")`, `cacheLife("hours")`; revalidated by PG-MKT-PRICE-06 |

Everything else is static content from `content/home.ts`. No mutations. The teaser picks the lowest active paid plan with `audience = student` and shows `monthlyPriceCents` through `formatZar()` (`web/src/lib/format/money.ts`), for example "Paid plans from R89 a month" where the number comes only from the API.

## States

| State | When | What shows (exact copy) |
|---|---|---|
| Populated | Default | All blocks as in Layout |
| Loading (teaser) | Plans not yet in cache on a dynamic render | Skeleton line the height of the teaser text; no layout shift |
| Error (teaser) | `getPlans()` throws or validation fails | Teaser text "Plans start free. See what each plan includes." with link "See plans and prices"; no number; Sentry captures the error |
| Empty (teaser) | No active paid student plan returned | Same as error copy; no Sentry error, a warning breadcrumb |
| Teaser off | Flag `marketingPricingTeaser` off (Phase 3 to 5) | Block not rendered; no gap |
| Reduced motion | `prefers-reduced-motion: reduce` | No page-load sequence; demos show final state with "Replay" hidden; tutor demo shows all messages at once |
| Consent pending | No stored decision | Banner heading and body as defined in PG-MKT-LEGAL States (single source; consent scope is custom `track()` events only, since v1 has no advertising tag, decision 8), heading "Can we measure how the site is used?"; body "We would like to load analytics that help us see which pages work. Say no and nothing loads. Either way we count page views with a cookieless counter that stores nothing on your device." Link "Read our privacy policy". Buttons "Allow" and "Do not allow" (final copy owned by PG-MKT-LEGAL-16), identical style and width, side by side. |
| Consent decided | Decision stored | No banner; footer "Privacy choices" reopens preferences |
| Signed in | Session exists | Header primary button reads "Go to your dashboard" (role home); page body unchanged |
| Not found / forbidden / upgrade / no evidence | Not applicable on a public static page | None |

## Stage variants

- Hero subhead names both: high school and university or college.
- Product preview shows a high school example (Grade 11, Mathematics, Physical Sciences, an SBA task due) by default; a small tab "University example" swaps to a first-year example (MAM1000W style module names avoided; use generic "Calculus I", "Intro to Economics", an assignment due). Both are labelled "Example".
- Mastery demo: high school tab says "Projected term mark from the marks already in"; university tab says "Projected course result from the marks already in". No SBA, APS or matric wording on the university tab; no module or GPA wording on the high school tab.

## Interactions and edge cases

- "Start free" goes to `/register`. "See how it works" is an in-page anchor to `#how-it-works` with smooth scroll disabled under reduced motion.
- Tutor demo: "Play" reveals four scripted messages at 900ms intervals; buttons disabled while playing; "Replay" resets. Message area has `aria-live="polite"`. The script includes the tutor guiding rather than giving a final answer, and a footer line "The AI tutor can make mistakes. Check important answers."
- Mastery demo: tab change swaps series and the text summary; chart has an `aria-label` and the text summary carries the meaning.
- Check-in demo: picking a mood shows a fixed calm reply per mood; nothing is sent or stored; footer "This is a demo. Nothing is saved."
- Teaser: never shows a price that did not come from the API at build or revalidation time. Annual prices are not shown on home.
- Very long words in Afrikaans or isiZulu names are not present; still, all text wraps with `text-pretty` and no fixed widths.
- JavaScript disabled: page fully readable; demos show their final static state (render final state on the server, enhance on the client).
- Deep link with `#how-it-works` scrolls to band 1.
- Demo honesty: a mock makes a claim as loudly as a headline. Every demo depicts only behaviour the rebuilt product ships at the time of release: the tutor demo shows no citation or source chips (the tutor has no retrieval); the mastery demo shows current and projected values only, no confidence band or month-by-month curve unless BE-PRG-11 returns one, and a flat projection is drawn in a neutral colour, not success green; no counsellor, break timer or session-length nudge appears in any demo (lessons recorded in `43f9faa:web/src/components/marketing/FeatureDemos.tsx`).
- Parents band lines describe only what a parent can actually see when the page ships: before the Family module (Phase 8) is live, "What you see" is replaced by the privacy boundary alone plus "Parent accounts are coming. Here is what will always stay private." The 43f9faa app sold parent forecasts, wellbeing summaries and celebrations that no endpoint returned; that must not recur.
- Consent banner: Allow and Do not allow are equal in markup, variant, size and visual weight; neither is pre-focused or pre-highlighted. On appearance focus moves to the banner container (`tabIndex=-1`, `role="dialog"`, `aria-modal="false"`, `aria-labelledby` the heading) so a screen reader hears the question before the answers; focus is not trapped and Tab leaves the banner normally. No pre-ticked categories and no cookie wall: ignoring the banner and reading the site keeps optional analytics off.
- The cookieless-counter sentence is shown only while it is true (Vercel Web Analytics is cookieless); if a cookie-setting tool is added, the copy changes in the same PR.

## Copy

- h1: "Study smarter, track honestly, look after yourself"
- Subhead: "Aptiverse helps South African high school and university students practise at their level, see where they stand in every subject, and check in on how they are doing. Parents get a calm, connected view."
- Primary CTA: "Start free". Secondary: "See how it works".
- Preview badge: "Example".
- Band 1 heading: "An AI tutor that knows your level". Body: "Ask about a concept and get an explanation pitched at your grade or year of study. It guides you through graded work instead of handing over answers."
- Band 2 heading: "See where you stand, from real marks". Body: "Log your marks and practise. Aptiverse shows topic mastery and a projection from the marks already in. No marks yet means no projection, never a made-up number."
- Band 3 heading: "A private place to check in". Body: "A one-minute mood check-in and a private diary. It is never graded or ranked, and your parents never see your diary." Do not say "never shown to anyone", "encrypted on your device" or "end-to-end encrypted": staff access is governed by the privacy policy, and BE-WEL-04 encrypts at rest on the server only.
- Band 4 heading: "Practice tests you can trust". Rules: "One attempt per test", "The timer is kept on our side, not your phone", "The AI tutor is off while a test is running".
- Parents band heading: "For parents: insight, not surveillance". What you see: "Progress by subject", "Upcoming assessments", "Wellbeing trends your child chooses to share". What stays private: "Diary entries", "Individual mood notes", "Tutor conversations".
- Tutor band link: "See everything Aptiverse does".
- SA context band heading: "Built for South African students". Cards: "CAPS and university, together" / "NSC or IEB subjects at high school, or your own modules at university. The tutor pitches to whichever you are doing."; the past papers card waits on the BE-ACA-60 source decision (see open questions); "Your diary stays yours" / "Parents see what you choose to share, never what you write."
- Banned on this and every marketing page (from the 43f9faa honesty pass and the claims ledger red list), held in `banned-claims.ts`: "works offline" (there is no offline mode; say "light on data" only if measured), "all 11 official languages" (no multilingual support, and South Africa has had 12 official languages since 2023), "end-to-end encrypted" or "encrypted on your device", "talk to a counsellor", "cites your textbook", "predicts your results" (say "a projection from the marks already in"), "adaptive" practice (the student chooses the difficulty), "watch your marks climb" (no outcome promises), "trusted by" or any user count. The 43f9faa hero chip "Predicts your results" is not carried over.
- Teaser: "Start free. Paid plans from {price} a month." Link: "See plans and prices".
- Closing heading: "Start with what you are studying now". Body: "Create a free account in a minute. Add your subjects or modules and try a practice test." CTA "Start free"; secondary outline "See pricing" (only when `/pricing` is switched on). The free-tier list in the 43f9faa closing CTA ("goals, diary, practice, past papers, term predictions, career navigator") is not reused until PG-MKT-PRICE confirms what the free plan includes.
- Metadata title: "Aptiverse: study and wellbeing support for South African students" (absolute, not templated). Description: "Practise at your level, track your marks honestly and check in on your wellbeing. For high school and university students in South Africa, with a view for parents."

## Acceptance criteria

1. Given a visitor at 360px, when the page loads, then the h1, subhead and "Start free" button are visible without scrolling on a 740px tall viewport.
2. Given any viewport from 320px to 1440px, when the page renders, then `scrollWidth` does not exceed `clientWidth`.
3. Given the pricing teaser flag is on and the API returns a paid student plan of 8900 cents, when the page builds, then the teaser reads "Paid plans from R89 a month".
4. Given the plans API is down at build, when the page renders, then the teaser shows "Plans start free. See what each plan includes." and no rand amount appears anywhere on the page.
5. Given the flag is off, when the page renders, then no pricing teaser markup exists.
6. Given reduced motion is set, when the page loads, then no element animates and every demo shows its final state.
7. Given the tutor demo, when "Play" is pressed twice quickly, then the script plays once.
8. Given the university tab of the mastery demo, when it is selected, then the text contains none of "SBA", "APS", "matric", "Grade".
9. Given JavaScript is disabled, when the page loads, then all headings, copy and demo final states are readable.
10. Given no analytics consent, when the visitor clicks "Start free", then no analytics request is sent.
11. Given a crawler, when it fetches `/robots.txt` and `/sitemap.xml`, then marketing routes are listed and app routes are disallowed.
12. Given the page source, when inspected, then one JSON-LD block with `Organization` and `WebSite` exists and contains no review, rating or audience size.
13. Given a first visit, when the consent banner appears, then focus is on the banner container, Allow and Do not allow have identical computed styles and widths, and Tab moves out of the banner to the next page element.
14. Given the banner is showing, when the visitor ignores it and scrolls, then no optional analytics script or request loads.
15. Given the visitor pressed Do not allow, when they reload, then the banner does not return and optional analytics stay off; "Privacy choices" in the footer reopens the choice.
16. Given the content module, when the banned-claims test runs, then no string in `content/home.ts` matches any phrase in `banned-claims.ts`.
17. Given the Family module is not live, when the parents band renders, then it lists only what stays private and no parent capability.

## Production readiness

- Security: no user data on the page; the only API call is the public plans read on the server. No query parameters are read. JSON-LD is built from constants and serialised with `JSON.stringify` (no user input reaches it). CSP unchanged: no third-party scripts or images; demos make no network calls.
- Performance: LCP element is the h1 (text, system font until Frygia is licensed). Budget: LCP under 2.5s on Lighthouse mobile, JS for `/` under 80 KB gzip (three demos plus CTA leaves; Recharts only inside `mastery-demo` and loaded with `next/dynamic` below the fold with an SSR'd static SVG fallback). No raster images; preview is HTML and the OG image is generated at build. Page is static (prerendered), teaser cached under `billing:plans`.
- Resilience: plans failure degrades to the no-number copy; the page never fails to render because of the API. No forms, so no submits.
- Observability: Sentry captures `getPlans()` failures with tag `route:/`. Analytics events (consent-gated, via `track()`): `home_cta_clicked` {cta: "start_free" | "see_how" | "closing_start_free" | "header_start_free"}, `home_demo_played` {demo: "tutor" | "mastery" | "checkin"}, `home_demo_stage_switched` {stage: "high_school" | "university"}, `home_pricing_link_clicked`. No PII in any property.
- Accessibility (WCAG 2.2 AA): one h1, h2 per band; demos operable by keyboard; tab and radio patterns from Radix; focus not obscured by the sticky header (scroll-margin-top on anchors, SC 2.4.11); target size at least 24px and in practice 44px (SC 2.5.8); chart has a text alternative.
- Privacy and POPIA: no cookies set by the page itself; Vercel Analytics custom events only after consent; the check-in demo stores nothing and says so; no tracking pixels (none in v1, decision 8).
- SEO: canonical `https://aptiverse.co.za/`; in sitemap with priority 1.0; OG and Twitter card from `opengraph-image.tsx`; JSON-LD Organization (name, url, logo, contact email) and WebSite; `lang="en-ZA"` already on root.
- Rollout: page is live as a placeholder now; the rebuilt page replaces it behind no flag but ships in one PR after copy review. The teaser sits behind `marketingPricingTeaser` in `web/src/lib/flags.ts` until BE-BIL-08 is live in prod. Rollback: Vercel instant rollback to the previous production deployment (HRD-03).
- Monitoring: Sentry issue alert on any new error tagged `route:/`; Vercel Speed Insights p75 LCP for `/` with an alert at 2.5s; Lighthouse CI budget for `/` fails the web pipeline; Grafana API dashboard (OBS-02) panel for `GET /billing/plans` error rate.

## Build tasks

- [ ] **PG-MKT-HOME-01** Hero: h1, honest subhead, "Start free" and "See how it works" CTAs *(partial: placeholder hero with h1 and subhead exists; CTA points to `/help`, final copy and CTAs missing)*
- [ ] **PG-MKT-HOME-02** Product preview: calm dashboard mock built from kit components (StatCard, ProgressRing, Card), labelled "Example", with a university example tab
- [ ] **PG-MKT-HOME-03** Feature band: AI tutor mini-demo (client leaf, scripted conversation, play and replay, live region)
- [ ] **PG-MKT-HOME-04** Feature band: mastery and projection mini-demo with high school and university tabs and a text summary
- [ ] **PG-MKT-HOME-05** Feature band: wellbeing check-in mini-demo (five Lucide moods, nothing stored)
- [ ] **PG-MKT-HOME-06** Feature band: practice test integrity (three rules)
- [ ] **PG-MKT-HOME-07** Parents band: what you see and what stays private
- [ ] **PG-MKT-HOME-08** Pricing teaser from `getPlans()` (BE-BIL-08) with no-number fallback
- [ ] **PG-MKT-HOME-09** Closing CTA using the shared `ClosingCta`
- [ ] **PG-MKT-HOME-10** Page-load motion sequence (hero fade and rise, 200ms stagger), fully off under reduced motion
- [ ] **PG-MKT-HOME-11** Metadata: absolute title and description, canonical
- [ ] **PG-MKT-HOME-12** Copy in `content/home.ts` checked line by line against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-HOME-13** `content/home.ts` typed content module (all strings and example data)
- [ ] **PG-MKT-HOME-14** Shared `MarketingSection` component with heading level prop and `aria-labelledby`
- [ ] **PG-MKT-HOME-15** Shared `ClosingCta` and `CtaLink` (track on click) components
- [ ] **PG-MKT-HOME-16** Port the claims ledger from `43f9faa:web/marketing/claims-ledger.md` to `web/marketing/claims-ledger.md` and re-verify each green, red and careful line against the rebuilt API and routes
- [ ] **PG-MKT-HOME-17** `opengraph-image.tsx` for `/` (static, tokens only)
- [ ] **PG-MKT-HOME-18** JSON-LD Organization and WebSite via `json-ld.tsx`
- [ ] **PG-MKT-HOME-19** `app/sitemap.ts` listing switched-on marketing routes from one route registry
- [ ] **PG-MKT-HOME-20** `app/robots.ts` allowing marketing and disallowing app and API paths
- [ ] **PG-MKT-HOME-21** Analytics events wired through `track()` (names in Production readiness)
- [ ] **PG-MKT-HOME-22** `marketingPricingTeaser` flag check in the teaser, default off
- [ ] **PG-MKT-HOME-23** Server-rendered final state for each demo (works without JS), client enhancement on top
- [ ] **PG-MKT-HOME-24** Signed-in header variant hook-up ("Go to your dashboard"), read inside `<Suspense>` so the page stays static
- [ ] **PG-MKT-HOME-25** South African context band (`sa-context-band.tsx`) with three facts, each traced to a ledger line
- [ ] **PG-MKT-HOME-26** "See everything Aptiverse does" link under the tutor band, and the closing CTA's secondary "See pricing" (shown only when `/pricing` is on)
- [ ] **PG-MKT-HOME-27** Demo honesty rules applied to all three demos: no citation chips, no confidence band, flat projection neutral, no counsellor or break nudges; a source note per demo in `content/home.ts`
- [ ] **PG-MKT-HOME-28** Parents band gated on Family (Phase 8): privacy-boundary-only variant until BE-FAM-07 is live
- [ ] **PG-MKT-HOME-29** Consent banner placement on home: the banner component is built in PG-MKT-LEGAL-16 (single owner); here, verify it never covers the hero CTA at 360px and does not shift LCP, no cookie wall
- [ ] **PG-MKT-HOME-30** Mount the banner in the marketing and auth layouts, persist the decision through FE-63, and wire the footer "Privacy choices" link (PG-MKT-LEGAL-18) to the preferences dialog (PG-MKT-LEGAL-17)
- [ ] **PG-MKT-HOME-31** `banned-claims.ts` shared list of red-listed phrases (from the 43f9faa honesty pass and the claims ledger)

## Quality tasks

- [ ] **PG-MKT-HOME-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves *(partial: placeholder is a Server Component; leaves not built yet)*
- [ ] **PG-MKT-HOME-Q02** `generateMetadata` or static metadata title and description; OG image
- [ ] **PG-MKT-HOME-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-HOME-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-HOME-Q05** Light and dark both correct (OS-driven), including citron CTA and magenta wellbeing band
- [ ] **PG-MKT-HOME-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-HOME-Q07** axe: zero violations in light and dark *(partial: test exists in `web/e2e/help.spec.ts` for the placeholder)*
- [ ] **PG-MKT-HOME-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-HOME-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-HOME-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-HOME-Q11** JS budget for `/` under 80 KB gzip checked in CI (Recharts deferred)
- [ ] **PG-MKT-HOME-Q12** Reduced-motion and no-JS pass
- [ ] **PG-MKT-HOME-Q13** Consent check: no analytics request before consent (Playwright network assertion)
- [ ] **PG-MKT-HOME-Q14** Monitoring wired: Sentry alert for `route:/`, Speed Insights LCP alert, Lighthouse CI budget entry
- [ ] **PG-MKT-HOME-Q15** WCAG 2.2 checks: focus not obscured under sticky header, target size
- [ ] **PG-MKT-HOME-Q16** Consent banner fairness and accessibility: identical button styles, container focus, Tab escapes, banner never covers the hero CTA at 360px, axe clean in both schemes
- [ ] **PG-MKT-HOME-Q17** Banned-claims unit test over `content/home.ts` in CI

## Tests

Unit (Vitest):
- `pricing-teaser.test.tsx`: "shows the lowest paid student monthly price", "shows the no-number fallback when plans throw", "shows the fallback when no paid student plan exists", "renders nothing when the flag is off".
- `tutor-demo.test.tsx`: "plays the script once on double click", "shows all messages at once under reduced motion".
- `mastery-demo.test.tsx`: "university tab has no school wording", "text summary changes with the tab".
- `content/home.test.ts`: "no emoji, em dash or en dash in any string", "contains no banned claim".
- `consent-banner.test.tsx`: "focuses the container, not a button", "accept and reject render the same variant and size", "reject stores the decision and loads nothing", "does not trap focus".
- `parents-band.test.tsx`: "shows only the privacy boundary when the family flag is off".

Playwright (`web/e2e/marketing-home.spec.ts`, Pixel 7, iPhone 14, desktop Chrome):
- "hero and Start free are visible above the fold at 360px"
- "no sideways scroll at 320, 360 and 1440"
- "Start free goes to /register"
- "See how it works scrolls to the tutor band"
- "tutor demo plays and replays"
- "check-in demo says nothing is saved"
- "no analytics call before consent"
- "has no accessibility violations in light mode" and "in dark mode" (move the existing home axe tests here)
- "robots.txt disallows app routes" and "sitemap lists the home page"
- "consent banner offers accept and reject with equal weight"
- "ignoring the consent banner loads no optional analytics"
- "consent banner does not cover Start free at 360px"

## Open questions

- `web/src/lib/flags.ts` does not exist; the FE foundation needs a task for a server env flag helper.
- Brand domain for canonical and JSON-LD: `aptiverse.co.za` per REBUILD_PLAN 3.7; confirm.
- Should signed-in visitors be redirected from `/` to their dashboard, or keep seeing the marketing page with a dashboard button (assumed here)?
- Past papers: the 43f9faa app deliberately linked out to the DBE archive and did not host papers (copyright and staleness); the rebuild plans hosted papers in S3 (BE-ACA-60). The SA context card cannot be written until the source and licence are decided.
- Consent banner placement: owned here for the public and auth shells; should the app shell show it too, or does sign-up consent cover in-app analytics (HRD-33)? Decision 8 removed advertising tags, so only `track()` events are at stake.
