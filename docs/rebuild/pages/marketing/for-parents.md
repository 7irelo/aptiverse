# For parents

| | |
|---|---|
| ID | `PG-MKT-PAR` |
| Route | `/for-parents` (and 301 from `/for-families`) |
| Phase | 3 (built), switched on publicly with the parent track in Phase 8 |
| Roles | public |
| Stages | high school, university (children of either stage) |
| Entitlement | free (public) |
| Depends on | SHL-01, FE-30 to FE-37, UI-01, UI-04, UI-05, FE-11, FE-63, PG-MKT-HOME-14 and 15, PG-MKT-HOME-16 (claims ledger), PG-MKT-STU-06 and 08 (`DaySequence`, `HonestyList`); facts depend on BE-FAM-03, BE-FAM-04, BE-FAM-11, BE-WEL-06, BE-BIL-02 |
| Old app reference | `43f9faa:web/src/app/(marketing)/for-families/page.tsx`; DESIGN_BRIEF section 7 "For parents" (intent only) |
| Status | Not started |

## Purpose

Speaks to a parent or guardian. Explains, without hype, what a parent sees and what stays private to the child, how linking works (an invite the child accepts), how wellbeing sharing is the child's choice, and that one family subscription can cover several children across high school and university. It must earn trust by being exact about the boundary.

## User stories

- As a parent of a Grade 9 learner, I want to know what I will see and what I will not, so that I can support without spying.
- As a parent of a matric learner and a first-year student, I want one subscription for both, so that I do not manage two accounts.
- As a parent worried about my child's stress, I want to understand what the wellbeing view does and does not do, so that I do not rely on it for something it cannot do.

## Layout

### Mobile (360px)

1. Public header.
2. Intro: h1, lede, "Create a parent account" button full width.
3. Boundary block (`visibility-boundary.tsx`): two stacked cards, "What you see" (Eye icon) and "What stays private" (EyeOff icon), each a list of four lines.
4. How linking works (`DaySequence` reused as a three-step ordered list): "You create an account", "You send your child an invite", "Your child accepts and chooses what to share".
5. Wellbeing trends (`wellbeing-sharing.tsx`, magenta zone): what a shared trend looks like (kit-built, "Example" badge), plus a plain note of its limits and a link to support resources.
6. Celebrations (`celebrations-note.tsx`): short copy and one example celebration card (amber achievement zone, "Example").
7. Mixed-stage family example (`family-example.tsx`): two child cards, one high school, one university, each with stage-correct labels.
8. One family subscription (`family-plan-note.tsx`): one paragraph and a link to `/pricing#parents`; no price on this page.
9. Honesty list (shared `HonestyList`): three lines.
10. Parent FAQ (shared `MarketingFaq` from PG-MKT-STU-12): h2 "Questions parents ask" and six questions.
11. Closing CTA.
12. Footer.

### Desktop (1440px)

- Max width 1152px. Boundary block as two columns side by side directly under the intro.
- Linking steps as a horizontal three-column row.
- Wellbeing and celebrations side by side (7 and 5 columns).
- Family example: two child cards side by side, family plan note under them.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(marketing)/for-parents/page.tsx` | server | Static; returns `notFound()` while `marketingParentsPage` is off |
| OG image | `web/src/app/(marketing)/for-parents/opengraph-image.tsx` | server (build) | Static |
| Redirect | `web/next.config.ts` `redirects()` | config | `/for-families` to `/for-parents`, permanent (308 in Next, see open question) |
| Content | `web/src/features/marketing/content/for-parents.ts` | server | All strings and example data |
| VisibilityBoundary | `web/src/features/marketing/components/visibility-boundary.tsx` | server | Two lists; reused by parent onboarding (PG-ONB-PAR-01) for identical wording |
| WellbeingSharing | `web/src/features/marketing/components/wellbeing-sharing.tsx` | server | Example trend as a static SVG sparkline (no Recharts), limits note |
| CelebrationsNote | `web/src/features/marketing/components/celebrations-note.tsx` | server | Example card |
| FamilyExample | `web/src/features/marketing/components/family-example.tsx` | server | Two child cards using `components/ui/card.tsx`, `badge.tsx` |
| FamilyPlanNote | `web/src/features/marketing/components/family-plan-note.tsx` | server | Link to pricing |
| DaySequence, HonestyList, MarketingFaq | shared from for-students | server (accordion is a client leaf) | |
| Parent visibility map | `web/src/features/marketing/content/parent-visibility.ts` | shared | Each "What you see" line names the Family endpoint and field that backs it (BE-FAM-06, 07, 08, 09) and the phase it ships; a line renders only when its backing endpoint is live |
| MarketingSection, ClosingCta, CtaLink | shared from home | server / client leaf | |

## Data

No API reads, no mutations. The boundary lists are static text but must match the actual privacy model (BE-FAM-11 per-child privacy settings, BE-WEL-06 sharing settings, diary never shared). Keep the strings in `content/for-parents.ts` and import the same constants into the parent onboarding page so the promise is worded once.

## States

| State | When | What shows |
|---|---|---|
| Populated | Flag on | All blocks |
| Not available | `marketingParentsPage` off (before Phase 8) | Root `not-found.tsx`; header and footer omit the link; sitemap omits the route |
| Reduced motion | OS setting | No animation |
| Loading, error, empty, forbidden, upgrade, no evidence | Not applicable (static) | Root boundaries only |

## Stage variants

- Family example child 1: "Lindiwe, Grade 11, NSC" with "Mathematics: projected term mark from marks in", "Next: Life Sciences SBA task, Friday".
- Family example child 2: "Kagiso, second year, university" with "Intro to Statistics: projected course result from marks in", "Next: assignment due Monday".
- Child 2 card contains no SBA, APS, matric or Grade wording; child 1 contains no course or semester wording.
- Both cards badged "Example".

## Interactions and edge cases

- "Create a parent account" goes to `/register?role=parent`.
- `/pricing#parents` link scrolls to the parent plans on the pricing page; if pricing is not yet live (flag off) the plan note shows text only, no link.
- The page never shows a parent seeing diary content or individual mood notes, even in examples.
- An under-18 child: copy says the child accepts the invite; parent consent for under-18 accounts (BE-FAM-14) is described in one line only once its flow is final.
- Every "What you see" line must be backed by a field the parent endpoints really return. The 43f9faa page sold parents result forecasts, wellbeing summaries, celebrations and a shared calendar while the only parent endpoint returned a name, a stage and the next five assessments. Here each line is tied to its endpoint in `parent-visibility.ts`; a line whose endpoint is not live is not shown.
- Celebrations block shows only when BE-FAM-09 returns parent-visible events; the 43f9faa celebration notifications only ever went to the student, so the old wording cannot be reused without that endpoint.
- Family example cards show only fields BE-FAM-07 returns at launch: if the overview carries no projection, the card shows stage and upcoming work only, and never an "On track" or "Needs a nudge" judgement the product does not compute.
- Example children use grades the product supports (the 43f9faa example had a Grade 8 child that onboarding could not create).
- Seat counts and prices are never typed into this page; the FAQ answer on how many children reads the seat limit from the plans data once PG-MKT-PRICE ships, and otherwise points to Pricing (the 43f9faa FAQ hardcoded per-child prices).

## Copy

- h1: "Support your child without reading their diary"
- Lede: "Aptiverse gives you a calm view of how your child is doing at school or university. They stay in control of what you see."
- What you see: "Progress by subject or course", "Upcoming assessments and deadlines", "Celebrations when they reach real goals", "Wellbeing trends, only if your child shares them".
- What stays private: "Diary entries, always", "Individual mood notes", "What they ask the AI tutor", "Anything they choose not to share".
- Linking steps: 1 "Create your parent account" "Name, email and a password." 2 "Invite your child" "Send an invite to their email or share a link." 3 "They accept and choose what to share" "Your child can change this at any time, and either of you can unlink."
- Wellbeing heading: "Wellbeing trends, shared by choice". Body: "If your child chooses, you see a weekly mood trend, not the notes behind it. Aptiverse does not diagnose anything and does not send alerts. If you are worried about your child, talk to them, and see the South African helplines on our support page."
- Celebrations heading: "Celebrate real progress". Body: "When your child completes a goal measured against real work, you can see it and say well done."
- Family example heading: "One family, different stages".
- Family plan: "One family subscription can cover several children, at school or university. See parent plans on the pricing page."
- Honesty lines: "No surveillance of private writing", "No made-up progress numbers", "No ranking your child against others".
- Private list adds: "A way to read over their shoulder".
- What you see adds (when billing is live): "Your own billing, in one place".
- FAQ heading: "Questions parents ask". Questions and answers:
  1. "How many children can I add?" / "{seat range from the plans data} children on one family subscription, each with their own private account." Before plans are live: "Several children can share one family subscription. See Pricing for the details."
  2. "How does pricing work as I add children?" / "Each parent plan covers a set number of children. See the parent plans on our pricing page for current prices in rand."
  3. "Can I read my child's diary or messages?" / "No. There is no parent screen that shows diary entries or AI tutor chats, and it is not a setting you can turn on. To be straight with you about the limits: entries are stored on our servers, and staff access is governed by our privacy policy. Nothing analyses your child's diary." (Encryption sentence only after BE-WEL-04 is verified; never "on your child's device".)
  4. "My children are at different stages. Does that work?" / "Yes, within our range: Grade 8 to 12 and university or college. Each child gets tools for their own stage. We do not support anything below Grade 8."
  5. "What does the free plan give my child?" / answer read from PG-MKT-PRICE content once live; before then "Every child can start on the free plan. See Pricing for what each plan includes."
  6. "Will my child know what I can see?" / "Yes. Your child sees exactly what a linked parent can see in their privacy settings, and can change it." Only once PG-CMN-SETTINGS shows that list (BE-FAM-11); until then: "The boundary is enforced whether they know it or not. The short version to give them: you can see what is due, and nothing they write."
- Closing: heading "Start with an invite", CTA "Create a parent account".
- Metadata title: "For parents". Description: "A calm, honest view of your child's progress at school or university, with clear privacy boundaries they control."

## Acceptance criteria

1. Given a request to `/for-families`, when served, then the response is a permanent redirect to `/for-parents`.
2. Given `marketingParentsPage` is off, when `/for-parents` is requested, then the root not-found page renders with status 404 and no nav link points to it.
3. Given the boundary lists, when compared with `content/for-parents.ts` imports in the parent onboarding page, then the strings are identical (same constants).
4. Given the wellbeing block, when read, then it states that Aptiverse does not diagnose or send alerts.
5. Given the university child card, when read, then it contains none of "SBA", "APS", "matric", "Grade".
6. Given the page, when searched for a rand amount, then none is found.
7. Given the copy, when checked against the claims ledger, then every claim maps to a green or careful line.
8. Given `parent-visibility.ts` marks BE-FAM-08 as not live, when the page renders, then no wellbeing line appears in "What you see" and the wellbeing block is hidden.
9. Given the FAQ, when rendered, then no rand amount or hardcoded seat count appears, and the FAQPage JSON-LD matches the visible questions.
10. Given the family example, when rendered, then no card shows a status judgement or a mark unless the matching overview field is live.

## Production readiness

- Security: static page; no inputs. The `role=parent` link parameter is validated by the register page.
- Performance: prerendered; sparkline is inline SVG, no chart library; route JS under 40 KB gzip; LCP is the h1.
- Resilience: no runtime dependencies.
- Observability: events `parents_cta_clicked` {cta: "intro_create" | "closing_create"}, `parents_pricing_link_clicked`; consent-gated; Sentry tag `route:/for-parents`.
- Accessibility (WCAG 2.2 AA): lists are real lists; Eye and EyeOff icons are decorative and the headings carry the meaning; sparkline has a text summary.
- Privacy and POPIA: the page is the public statement of the parent and child boundary, so it is reviewed with the privacy policy (PG-MKT-LEGAL-02) and must change in the same PR if the model changes. No forms, analytics only after consent.
- SEO: canonical `/for-parents`; sitemap entry only when the flag is on; OG image; `/for-families` permanent redirect preserves old links.
- Rollout: built in Phase 3, hidden behind `marketingParentsPage` until the parent track (Phase 8) passes its exit gate. Rollback by switching the flag off (route 404s, links hidden) or Vercel instant rollback.
- Monitoring: Sentry alert for `route:/for-parents`; Speed Insights; Lighthouse CI entry; a synthetic check that `/for-families` returns 308 or 301.

## Build tasks

- [ ] **PG-MKT-PAR-01** What you see and what you do not (diary boundary), as shared constants
- [ ] **PG-MKT-PAR-02** Wellbeing trends shared by choice, with stated limits (no diagnosis, no alerts) and helpline link
- [ ] **PG-MKT-PAR-03** Mixed-stage family example (high school and university child)
- [ ] **PG-MKT-PAR-04** Permanent redirect from `/for-families` in `next.config.ts`
- [ ] **PG-MKT-PAR-05** Celebrations note with example card
- [ ] **PG-MKT-PAR-06** One family subscription note linking to `/pricing#parents`
- [ ] **PG-MKT-PAR-07** How linking works three-step sequence (reuses `DaySequence`)
- [ ] **PG-MKT-PAR-08** `content/for-parents.ts`
- [ ] **PG-MKT-PAR-09** `marketingParentsPage` flag: notFound, nav and sitemap omission
- [ ] **PG-MKT-PAR-10** Metadata, canonical, `opengraph-image.tsx`, sitemap entry
- [ ] **PG-MKT-PAR-11** Analytics events through `track()`
- [ ] **PG-MKT-PAR-12** `parent-visibility.ts`: each "What you see" line tied to its Family endpoint and field, rendered only when live
- [ ] **PG-MKT-PAR-13** Celebrations block and family example gated on BE-FAM-09 and BE-FAM-07 fields (no invented status chips or marks)
- [ ] **PG-MKT-PAR-14** Parent FAQ with the six honest answers (seat and price facts from plans data, never hardcoded)
- [ ] **PG-MKT-PAR-15** FAQPage JSON-LD from the FAQ content array

## Quality tasks

- [ ] **PG-MKT-PAR-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-PAR-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-PAR-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-PAR-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-PAR-Q05** Light and dark both correct (OS-driven), including magenta and amber zones
- [ ] **PG-MKT-PAR-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-PAR-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-PAR-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-PAR-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-PAR-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-PAR-Q11** Privacy review of the boundary copy against BE-FAM-11, BE-WEL-06 and the privacy policy
- [ ] **PG-MKT-PAR-Q12** Monitoring wired: Sentry route alert, Speed Insights, Lighthouse CI, redirect check
- [ ] **PG-MKT-PAR-Q13** Banned-claims test plus a visibility test: every rendered "What you see" line maps to a live endpoint field
- [ ] **PG-MKT-PAR-Q14** FAQ accordion keyboard and axe pass in light and dark

## Tests

Unit:
- `content/for-parents.test.ts`: "private list includes diary entries", "university child card has no school terms", "no rand amounts", "no emoji or dashes", "contains no banned claim", "no example child below Grade 8".
- `parent-visibility.test.ts`: "hides lines whose endpoint is not live", "every line names an endpoint and field".

Playwright (`web/e2e/marketing-for-parents.spec.ts`):
- "for-families redirects permanently to for-parents"
- "returns 404 and hides links when the flag is off"
- "wellbeing block says no diagnosis and no alerts"
- "Create a parent account goes to register with the parent role"
- "axe clean in light and dark"
- "FAQ shows no hardcoded price or seat count"

## Open questions

- Next.js `permanent: true` redirects send 308, not 301. Is 308 acceptable (search engines treat both as permanent)?
- Can a parent see "what they ask the AI tutor"? Assumed never; confirm with BE-FAM-07 scoping.
- Old design brief allowed a parent to create a child profile; the rebuild only has invites (BE-FAM-03, 04). This page describes invites only.
- Will the student settings page show "what a linked parent can see" (FAQ 6)? The 43f9faa app never told the student; PG-CMN-SETTINGS should own that disclosure.
