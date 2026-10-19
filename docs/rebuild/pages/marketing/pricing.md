# Pricing

| | |
|---|---|
| ID | `PG-MKT-PRICE` |
| Route | `/pricing` |
| Phase | 6 |
| Roles | public (anyone, signed in or not) |
| Stages | high school, university (plans are not stage-specific) |
| Entitlement | free (public page) |
| Depends on | BE-BIL-02, BE-BIL-08, BE-BIL-07 (plan sync trigger for revalidation), SHL-01, UI-01, UI-04, UI-05, UI-06, FE-63 (consent-gated analytics), PG-AUTH-REG-05 (plan preselect) |
| Old app reference | `43f9faa:web/src/app/(marketing)/pricing/page.tsx` (plans fetched at build with hourly ISR, empty list on failure), `43f9faa:web/src/app/(marketing)/pricing/PricingClient.tsx` (audience tabs with `?for=`, monthly or annual toggle, quota tokens filled from the live plan, trust chips, FAQ), `pricing/layout.tsx` (metadata). Structure and rules only: its plan copy promised features the claims ledger red-lists, it hardcoded a "Save 17%" chip, and its tutor tab and tutor plans are dropped in the rebuild. |
| Status | Not started. No route, no billing feature folder, no plans endpoint in the API yet. |

## Purpose

Show honest ZAR prices for the plans that exist (Free, Student Pro, Parent per-child tiers), what each plan really includes, and send the visitor to sign up with the chosen plan already selected. Every number on the page comes from `GET /billing/plans`; the page holds only prose.

## User stories

- As a student, I want to see what is free and what Student Pro adds, so I can decide whether to pay.
- As a parent with two children, I want to see the per-child tiers and the total in rand, so I know the monthly cost before I sign up.
- As a visitor comparing monthly and annual, I want the annual price and the real saving computed from the two prices, so I am not misled.
- As a careful buyer, I want to know whether prices include VAT and that I can cancel any time.

## Layout

### Mobile (360px)

1. Public header (SHL-01).
2. Page header: `h1` "Pricing", one-line subhead.
3. Billing period toggle (Monthly, Annual), full width, segmented, 44px tall.
4. Audience tabs: "Students" and "Parents" (UI-06), full width.
5. Plan cards stacked, one per plan in the selected audience, in API order. Each card: plan name, price line, period line, annual saving line (annual only, computed), up to 6 included features, primary CTA.
6. VAT and cancellation note (one short paragraph).
7. Comparison: stacked per-plan feature lists (no table on mobile), each feature shown as included (Check icon plus text) or not included (Minus icon plus "Not included" text, never colour alone).
8. Pricing FAQ (accordion, 5 to 7 questions).
9. Closing CTA: "Start free" button.
10. Footer.

### Desktop (1440px)

- Content max width 1120px, centred.
- Header row: `h1` and subhead left, billing toggle right.
- Audience tabs under the header row.
- Plan cards in a grid: 3 columns for Students (Free, Student Pro, plus any further student plan the API returns), up to 4 columns for Parents. Cards share equal height; CTA pinned to the card bottom.
- Comparison becomes a real `table` (UI-26 not needed; a semantic table with `scope` headers), plans as columns, features as rows, sticky header row inside its own scroll container if wider than the viewport.
- FAQ in a two-column layout: heading left (sticky), accordion right.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(marketing)/pricing/page.tsx` | server | Reads plans via `getPlans()` inside `<Suspense>`, `generateMetadata` |
| Loading | `web/src/app/(marketing)/pricing/loading.tsx` | server | Skeleton matching 3 plan cards |
| Error | `web/src/app/(marketing)/pricing/error.tsx` | client | `PageState` error with retry, Sentry capture |
| OG image | `web/src/app/(marketing)/pricing/opengraph-image.tsx` | server | Static text image, no prices (prices change) |
| PricingView | `web/src/features/billing/components/pricing-view.tsx` | client (leaf) | Holds billing period and audience state; renders cards and comparison from props |
| BillingPeriodToggle | `web/src/features/billing/components/billing-period-toggle.tsx` | client | Radix toggle group, `aria-pressed`, keyboard arrows |
| PlanCard | `web/src/features/billing/components/plan-card.tsx` | server-compatible (rendered by PricingView) | Uses `Card` (UI-04), `Badge` (UI-05) for "Most chosen" only if the API flags `highlight` |
| PlanComparison | `web/src/features/billing/components/plan-comparison.tsx` | server-compatible | Table at `lg`, stacked lists below |
| PricingFaq | `web/src/features/billing/components/pricing-faq.tsx` | server, accordion leaf client | Reuses `components/ui/accordion.tsx` |
| getPlans | `web/src/features/billing/server/get-plans.ts` | server only | `"use cache"`, `cacheTag("billing:plans")`, `cacheLife("hours")`, zod parse |
| formatZar | `web/src/lib/format/money.ts` | shared | `formatZar(cents: number): string`, owned by this page |
| planFeatureCopy | `web/src/features/billing/lib/plan-feature-copy.ts` | shared | Maps feature keys to display strings; keys absent from the map are not rendered |
| Revalidate route | `web/src/app/api/revalidate/route.ts` | server | POST, shared-secret header, `revalidateTag(tag)` for an allowlist of tags |
| Tabs, Button, Card, Badge, Accordion | `web/src/components/ui/*` | mixed | Kit primitives |
| PageState | `web/src/components/shell/page-state.tsx` | server | Error and empty states |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/billing/plans` (BE-BIL-08) | GET | `code`, `name`, `audience` (student or parent), `childSeats`, `monthlyPriceCents`, `annualPriceCents` (nullable), `currency` ("ZAR"), `vatInclusive`, `highlight`, `sortOrder`, `features[]` (`key`, `included`, `quota` nullable, `isLive`) | `billing:plans`, `cacheLife("hours")` |

- Read at request time inside the cache (not at `next build`), so the build never needs the API; the cached result is served to every visitor until revalidated.
- Revalidation: after an admin plan sync (BE-BIL-07, BE-ADM-13), the API worker (or the admin action) calls `POST /api/revalidate` with header `x-revalidate-secret` and body `{ "tag": "billing:plans" }`.
- Feature bullets render only when `isLive` is true and the key exists in `plan-feature-copy.ts`. This blocks the old failure where plan descriptions promised features that did not exist.
- Quota numbers inside bullets (for example AI sessions per month) come from `quota`; copy uses tokens such as "{quota} AI tutor messages a month".
- Mutations: none. The CTA is a link.

## States

| State | When | Exact copy |
|---|---|---|
| Loading | Streaming before plans arrive | Skeleton cards, screen reader text "Loading plans" |
| Populated | Plans returned | Cards, comparison, FAQ |
| Empty audience | Parents tab has no plans | Title "Parent plans are not available yet", body "You can start on the free student plan today and add parent access later." Action "Start free" |
| Empty (no plans at all) | API returns `[]` | Title "Pricing is being updated", body "Our plans are being refreshed. Please check again in a few minutes, or start free now." Action "Start free" |
| Error | API down or schema parse fails | Title "We could not load our prices", body "This is on our side, not yours. Check your connection and try again in a moment." Button "Try again" |
| Annual not offered | `annualPriceCents` null for a plan while Annual selected | Price shows monthly, period line "Monthly only" |
| Forbidden, upgrade, no evidence | Not applicable (public, no personal data) | |

## Stage variants

None in pricing. Plan copy uses "subjects or courses" (never "courses" alone, never "SBA" or "matric") so it reads correctly for both high school and university students.

## Interactions and edge cases

- Toggle period: prices and period lines swap with no layout shift (reserve height). The selected period persists in the URL as `?billing=annual` (shareable, no PII) and is passed through to the CTA.
- Audience tab persists as `?for=parents`.
- Annual line: "R{annual} a year, R{annual/12 rounded down to rand} a month" and saving line "Save R{monthly*12 minus annual} a year" computed in cents; hidden when the saving is zero or negative.
- Free plan CTA goes to `/register` with no plan param.
- Paid plan CTA: `/register?plan=<code>&billing=<monthly|annual>`. Parent plans also imply role parent; the register page validates the code against the same plans list (PG-AUTH-REG-05).
- Signed-in visitor: CTA text becomes "Change plan" and links to `/dashboard/billing` or `/parent/billing` by role. Reading the session makes the page dynamic, so this is done in a small client leaf that reads a non-sensitive `signed_in` hint from `/api/session-hint` (or omitted for v1, see open questions); the cached plan data stays static.
- Unknown feature key from the API: not rendered, reported once to Sentry as a warning with the key (no user data).
- Prices with odd cents (for example 9 950 cents) render as "R99.50"; whole rand render without decimals.
- Very long plan name: wraps, never truncates price.
- `?for=families` is an alias for `parents` (old marketing links used it); `?for=tutors` and any other value fall back to `students`. Tutor plans are never rendered even if an old plan code still exists in the API.
- A plan renders only when it exists in the API and has an audience and copy entry in web; anything else is skipped and reported once to Sentry as a warning (old rule: only plans present in both the catalogue and the copy map render).
- Quota tokens in feature copy (for example "{quota} AI tutor messages a month"): a negative or unlimited quota renders "Unlimited"; a missing quota drops that bullet entirely rather than printing a blank number (the old page printed an empty gap).
- No hardcoded saving: the annual toggle never carries a fixed "Save 17%" badge; any saving shown is computed per plan by PRICE-10, and the toggle itself carries no number.
- Free plan CTA never carries `billing`; paid CTAs always carry the selected period (old behaviour kept).
- Trust strip under the cards, each item only if true at launch and listed on the claims ledger green list: "Card payments through Paystack" (add "and instant EFT" only once it is confirmed enabled on the Paystack account, decision 58), "Your data is stored in South Africa", "AI help powered by Anthropic". Never "POPIA compliant" as a badge; say what is done instead.
- Paid checkout not open yet (the `paidSignup` switch from PG-AUTH-REG-23 is off): paid cards show their prices but the CTA reads "Start free for now" to `/register`, and a note under the cards reads "Paid plans open soon. The free plan is available now." (old pre-launch behaviour, kept honest).

## Copy

- `h1`: "Pricing"
- Subhead: "Start free. Upgrade when it helps. Cancel any time."
- Toggle: "Monthly", "Annual"
- Tabs: "Students", "Parents"
- Free price: "R0", period "Free for ever"
- Paid period: "a month" or "a year"
- Parent seat line: "For {n} child" or "For {n} children"
- CTAs: "Start free", "Choose {plan name}", signed in "Change plan"
- VAT note when `vatInclusive` true: "All prices are in rand and include VAT. You can cancel any time from Billing, and you keep access until the end of the period you paid for." When false: "All prices are in rand and exclude VAT, which is added at checkout. You can cancel any time from Billing, and you keep access until the end of the period you paid for."
- Comparison not included: "Not included"
- FAQ (final wording, each answer must match real billing behaviour from BE-BIL-13 to BE-BIL-16):
  - "Can I cancel any time?" "Yes. Cancel from Billing in two taps. You keep access until the end of the period you paid for, and we do not charge you again."
  - "What happens when I downgrade?" "Your plan changes at the end of the current period. Your subjects, marks and history stay."
  - "How do parent plans work?" "A parent plan covers a set number of children. Each linked child gets Student Pro features. You see their progress, never their private diary."
  - "How do I pay?" "By card through Paystack, a South African payment provider. We never see or store your card number."
  - "Is there a free trial?" "There is no trial, but the free plan never expires, so you can use Aptiverse for as long as you like before choosing a paid plan." (decision 51: no trial in v1)
  - "Do you offer school plans?" Not asked. No school plan exists; the question is omitted.
  - "Why is there a limit on AI help?" "Every AI answer has a real cost to us. A monthly limit keeps plans affordable and means you never get a surprise bill." (ported from the old FAQ; the limit numbers come from the plan quotas.)
  - "Does Aptiverse work for university as well as school?" "Yes. High school learners see their CAPS or IEB subjects and assessments. University and college students see the courses they add and their coursework." (no past papers claim, per the old code comment.)
  - "Is my data safe?" Answer drafted from the privacy policy facts only (data stored in South Africa, never sold, who can and cannot read the diary, how diary content is protected per BE-WEL-04). Never "end-to-end encrypted" unless literally true; the old answer had to be corrected for exactly this.
  - Removed old questions: "Do you take a cut of what tutors earn?" (tutors dropped) and "When do the paid plans launch?" (replaced by the paid-checkout-not-open note).
- Metadata (old description mentioned tutors; replaced): title "Pricing", description "Honest pricing in rand for students and parents. Start free and upgrade when it helps."

## Acceptance criteria

1. Given the API returns Free and Student Pro, when I open `/pricing` at 360px, then I see two stacked cards with prices formatted like "R0" and "R1 234" from the API cents, and no horizontal scroll.
2. Given Annual is selected, when a plan has both prices, then the annual total, per-month equivalent and "Save R..." line are computed from the API values and the saving line is hidden if it is not positive.
3. Given a plan feature has `isLive` false, when the page renders, then that feature does not appear anywhere on the page.
4. Given I click "Choose Student Pro" with Annual selected, then I land on `/register?plan=<code>&billing=annual`.
5. Given the API is down, when I open `/pricing`, then I see "We could not load our prices" with a working "Try again" button and the error is reported to Sentry.
6. Given an admin syncs plans, when the revalidate route is called with the right secret, then the next request shows the new prices; with a wrong secret it returns 401 and nothing changes.
7. Given `vatInclusive` is false, then the VAT note says VAT is added at checkout.
8. Given a screen reader user, when they move through the comparison on desktop, then each cell announces plan and feature with a text "Included" or "Not included".

## Production readiness

- Security
  - No personal data on the page; the plans endpoint is public and read server-side only. The browser never calls the API directly.
  - `POST /api/revalidate` checks `x-revalidate-secret` with a constant-time compare against a server env var, accepts only tags on an allowlist (`billing:plans`, `support:faqs`, `support:articles`), and returns 401 otherwise. Secret never logged.
  - Query params `plan`, `billing`, `for` are parsed against enums or the plans list; unknown values fall back to defaults, never echoed into HTML unescaped.
- Performance
  - LCP under 2.5s on a mid-range phone on 4G; LCP element is the `h1` or first price, text only, no hero image.
  - JS for the route under 150 KB gzip; only `PricingView`, the toggle and the accordion ship client code. Target under 40 KB route-specific.
  - Data cached with `cacheTag("billing:plans")`, `cacheLife("hours")`, so a visitor never waits on the API after the first fill.
- Resilience
  - API down on a cold cache: error boundary with retry; on a warm cache the stale plans keep serving (stale-while-revalidate behaviour of `cacheLife`).
  - Schema mismatch (zod parse fails): treated as error, not rendered half-broken.
  - CTA is a plain link, so double clicks are harmless.
- Observability
  - `error.tsx` captures to Sentry with tag `route:/pricing`.
  - Analytics events (consent-gated via `track()`): `pricing_viewed`, `pricing_period_toggled` {billing}, `pricing_audience_changed` {audience}, `pricing_plan_selected` {plan, billing}. No identifiers.
  - Server fetch to `/billing/plans` carries the `traceparent` header from the shared fetcher so a slow render links to the API trace.
- Accessibility (WCAG 2.2 AA)
  - Toggle is a Radix toggle group with visible label "Billing period"; current state announced.
  - Prices use `tabular-nums`; "R" and amount read correctly ("R1 234" not split into separate nodes).
  - Included or not included is conveyed by icon plus text, never colour alone (1.4.1). Target size at least 24px, our standard 44px (2.5.8).
  - Focus not obscured by the sticky header (2.4.11).
- Privacy and POPIA
  - No cookies set by the page beyond consent-approved analytics. No tracking of minors before consent; analytics off by default until consent.
- SEO
  - Canonical `https://aptiverse.co.za/pricing`; `?billing` and `?for` variants canonicalise to the bare URL.
  - Added to `app/sitemap.ts`.
  - JSON-LD `Product` with `Offer` per plan is generated only from API data (price, `priceCurrency` "ZAR"); omitted when the API errors.
  - OG image via `opengraph-image.tsx`, text only.
- Rollout
  - Page sits behind `pricingPage` switch in `web/src/lib/flags.ts`; off returns `notFound()` and header and footer links are omitted. Enabled in staging first, then prod after BE-BIL-08 is live and plans are synced.
  - Rollback: Vercel instant rollback to the previous deployment (HRD-03), or flip the switch off.
- Monitoring
  - Sentry issue alert on any new error tagged `route:/pricing`.
  - Grafana API dashboard (OBS-02) panel for `GET /billing/plans` error rate and p95.
  - Vercel Speed Insights LCP for `/pricing`; Lighthouse CI budget fails the PR if mobile score drops under 90.

## Build tasks

- [ ] **PG-MKT-PRICE-01** Plan cards from plans (Free, Student Pro, Parent per-child tiers), prices shown as `R1 234` from API cents
- [ ] **PG-MKT-PRICE-02** Monthly or annual toggle (client leaf), period kept in `?billing`
- [ ] **PG-MKT-PRICE-03** Comparison: semantic table at `lg`, stacked per-plan lists on mobile
- [ ] **PG-MKT-PRICE-04** VAT note driven by `vatInclusive`, and the pricing FAQ block with final answers
- [ ] **PG-MKT-PRICE-05** CTA routes to `/register?plan=<code>&billing=<period>`; free plan to `/register`
- [ ] **PG-MKT-PRICE-06** On-demand revalidation of `billing:plans` after plan change (wire the call from the plan sync)
- [ ] **PG-MKT-PRICE-07** `getPlans()` loader in `features/billing/server/get-plans.ts` with `"use cache"`, tag, lifetime and zod parse
- [ ] **PG-MKT-PRICE-08** `formatZar(cents)` in `lib/format/money.ts` with unit tests (R0, R99, R99.50, R1 234, R12 345); record space character decision
- [ ] **PG-MKT-PRICE-09** `plan-feature-copy.ts` key map; render only `isLive` features with a known key; Sentry warning on unknown keys
- [ ] **PG-MKT-PRICE-10** Annual maths helper (per-month equivalent, saving in cents, hide when not positive) with unit tests
- [ ] **PG-MKT-PRICE-11** Audience tabs (Students, Parents) with `?for` and the empty-audience state
- [ ] **PG-MKT-PRICE-12** `loading.tsx` skeleton and `error.tsx` retry state
- [ ] **PG-MKT-PRICE-13** `POST /api/revalidate` route: secret check, tag allowlist, 401 path, unit tests
- [ ] **PG-MKT-PRICE-14** Signed-in CTA variant ("Change plan" to the role's billing page) without making the plan data dynamic
- [ ] **PG-MKT-PRICE-15** JSON-LD `Product` and `Offer` from API data; canonical URL; sitemap entry
- [ ] **PG-MKT-PRICE-16** Analytics events (`pricing_viewed`, `pricing_period_toggled`, `pricing_audience_changed`, `pricing_plan_selected`) through `track()`
- [ ] **PG-MKT-PRICE-17** `pricingPage` switch in `lib/flags.ts`, header and footer links hidden when off
- [ ] **PG-MKT-PRICE-18** `?for=` parsing: `families` alias to parents, unknown values (including `tutors`) to students, unit tested
- [ ] **PG-MKT-PRICE-19** Quota token fill: "Unlimited" for negative quotas, bullet dropped when the quota is missing, unit tested
- [ ] **PG-MKT-PRICE-20** Render only plans with an audience and copy entry; skip and warn once for unknown or tutor plan codes
- [ ] **PG-MKT-PRICE-21** Trust strip with claims-ledger-checked items (Paystack payments, South African data storage, Anthropic), no compliance badge
- [ ] **PG-MKT-PRICE-22** Paid-checkout-not-open variant driven by the `paidSignup` switch ("Start free for now" CTAs and the note)
- [ ] **PG-MKT-PRICE-23** FAQ additions (AI limit, university, data safety) with the diary answer matched to the privacy policy wording

## Quality tasks

- [ ] **PG-MKT-PRICE-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-PRICE-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-PRICE-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-PRICE-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-PRICE-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-PRICE-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against the claims ledger
- [ ] **PG-MKT-PRICE-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-PRICE-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-PRICE-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-PRICE-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-PRICE-Q11** Route JS budget checked (under 150 KB gzip total, under 40 KB route-specific) in the build report
- [ ] **PG-MKT-PRICE-Q12** FAQ answers checked against the implemented subscription state machine (BE-BIL-13 to BE-BIL-16) before launch
- [ ] **PG-MKT-PRICE-Q13** Sentry alert for `route:/pricing` and Grafana panel for `GET /billing/plans` exist and fire in staging
- [ ] **PG-MKT-PRICE-Q14** No hardcoded numbers check: a test fails if the rendered page contains a price, percentage or quota that is not derived from the mocked plans response

## Tests

Unit (Vitest)
- `formatZar formats whole rand with a space group separator`
- `formatZar shows cents only when not whole rand`
- `annualSaving returns null when annual is not cheaper`
- `visibleFeatures drops features that are not live or have no copy`
- `revalidate route rejects a wrong secret and an unlisted tag`
- `PlanCard renders Monthly only when annual price is missing`
- `parseAudience maps families to parents and tutors to students`
- `fillQuota renders Unlimited for negative and drops the bullet when missing`
- `visiblePlans skips plans without copy`

Playwright (`web/e2e/pricing.spec.ts`, Pixel 7, iPhone 14, desktop Chrome; mock API)
- `shows plans from the API with rand prices`
- `annual toggle swaps prices and keeps the choice in the URL`
- `hides features the API marks as not live`
- `plan CTA carries plan and billing to register`
- `parents tab shows per-child tiers`
- `shows a retry state when the API is down` (API-down server)
- `fits 360px with no sideways scroll`
- `has no accessibility violations in light and dark`
- `for families link opens the parents tab`
- `paid cards say start free for now when paid checkout is off`

## Open questions

1. Decided (50): prices are shown VAT-inclusive, so `vatInclusive` is true at launch and the VAT note uses the inclusive wording. VAT registration itself is still to be confirmed by an accountant (DECISIONS F); if Aptiverse is not registered, the note drops the VAT clause and says only that prices are in rand.
2. Does the plans response expose `isLive` per feature, or do we keep an allowlist only in web? Recommend both: API flag plus web copy map.
3. Decided (51): no trial in v1. The FAQ answers "There is no trial" and points to the free plan.
4. Signed-in CTA variant: worth a client session hint in v1, or leave CTAs unchanged for everyone?
5. Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84 in `../../frontend/skeleton.md`), no third-party flag service.
6. Space in `R1 234`: plain space or narrow no-break space (U+202F)? Recommend a no-break space so the amount never wraps.
7. Decided (58): mention instant EFT only once it is confirmed on the Paystack account (a fact still owed, DECISIONS F); until then the trust strip says card payments only.
