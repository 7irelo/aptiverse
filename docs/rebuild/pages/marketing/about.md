# About

| | |
|---|---|
| ID | `PG-MKT-ABOUT` |
| Route | `/about` |
| Phase | 3 |
| Roles | public |
| Stages | high school, university (audience description only) |
| Entitlement | free (public) |
| Depends on | SHL-01, FE-30 to FE-37, UI-01, UI-04, UI-12 (Avatar, only if the team block ships), FE-11, FE-63, PG-MKT-HOME-14 and 15, PG-MKT-HOME-16 (claims ledger) |
| Old app reference | `43f9faa:web/src/app/(marketing)/about/page.tsx`; DESIGN_BRIEF section 7 "About" (intent only) |
| Status | Not started |

## Purpose

An honest startup story: why Aptiverse exists, what it believes, and who it is for, in a South African context. It builds trust by being specific and modest. No inflated milestones, no user counts, no partner logos, no press quotes.

## User stories

- As a parent, I want to know who is behind Aptiverse and where my child's data lives, so that I can trust it.
- As a student, I want to know what the product stands for, so that I know it is not another points app.
- As a journalist or school contact, I want a plain description and a contact route, so that I can reach the team.

## Layout

### Mobile (360px)

1. Public header.
2. Intro: h1, lede paragraph.
3. "Why we started" (`about-story.tsx`): three short paragraphs.
4. "What we believe" (`principles-list.tsx`): six principles, each Lucide icon, h3, one sentence.
5. "Built for South Africa" (`sa-context.tsx`): CAPS on NSC and IEB, universities and colleges, data stored in South Africa, POPIA, ZAR pricing, light on data.
6. "The team" (`team-block.tsx`): only rendered when `content/about.ts` has at least one real, consenting team member; each person has name, role, one line, optional photo (self-hosted, `next/image`) or initials Avatar.
7. "Get in touch" line linking to `/contact` and `/help`.
8. Closing CTA.
9. Footer.

### Desktop (1440px)

- Max width 1152px; text sections in a 7-column measure, left-aligned.
- Principles as a 3 by 2 grid. SA context as a 3-column grid of short items.
- Team as a 3 or 4 column grid depending on count.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(marketing)/about/page.tsx` | server | Static |
| OG image | `web/src/app/(marketing)/about/opengraph-image.tsx` | server (build) | Static |
| Content | `web/src/features/marketing/content/about.ts` | server | Story, principles, SA items, `team: TeamMember[]` (empty by default) |
| AboutStory | `web/src/features/marketing/components/about/about-story.tsx` | server | Prose |
| PrinciplesList | `web/src/features/marketing/components/about/principles-list.tsx` | server | |
| SaContext | `web/src/features/marketing/components/about/sa-context.tsx` | server | |
| TeamBlock | `web/src/features/marketing/components/about/team-block.tsx` | server | Returns null for an empty array; uses `components/ui/avatar.tsx` and `next/image` for local photos |
| MarketingSection, ClosingCta, CtaLink | shared from home | server / client leaf | |

## Data

No API reads, no mutations. Team photos, if any, live in `web/public/team/` as optimised files and are served through `next/image` (allowed by the current CSP `img-src 'self'`).

## States

| State | When | What shows |
|---|---|---|
| Populated | Default | All sections |
| No team | `team` array empty | Team section omitted entirely, no placeholder |
| Photo missing | A member has no photo | Initials Avatar |
| Loading, error, empty, forbidden, upgrade, no evidence | Not applicable (static) | Root boundaries only |

## Stage variants

Audience line names both: "high school learners from Grade 8 to 12 and university and college students". No stage-specific features are described here.

## Interactions and edge cases

- Only links: `/contact`, `/help`, `/privacy`, closing CTA to `/register`.
- Data residency claim ("stored in South Africa") is only published once production runs in AWS af-south-1 (REBUILD_PLAN hosting decision); until then the SA context line reads "We are moving our data to servers in South Africa" or is omitted. Track with a flag-free content check at release.
- Team members must give written consent for name and photo; removal is a content edit and redeploy.
- The story never claims the product notices stress or intervenes. The 43f9faa About page said Aptiverse "notices when you are running on empty, and does something about it"; nothing detects that, and the claims ledger red-lists it. It must not be carried over.
- No language-support claim: the product is in English. The 43f9faa site once claimed "all 11 official languages" (unbuilt, and South Africa has had 12 official languages since 2023).
- No unverifiable process claims such as "every feature begins with a real story from a real student" (from the 43f9faa principles) unless there is a record to back it.

## Copy

- h1: "About Aptiverse"
- Lede: "Aptiverse is a small South African team building study and wellbeing support for high school learners from Grade 8 to 12 and for university and college students."
- Why we started: "Studying in South Africa often means juggling SBA tasks or assignments, exam pressure and a lot of life, usually on a phone with limited data. Many tools are built for other curricula or turn learning into a points game." "We wanted something calm and honest: practice at the right level, progress you can trust because it comes from real marks, and a private place to check in on how you are doing." "We are early. We would rather tell you exactly what Aptiverse does today than promise what it might do."
- Principles: "Real data only: no made-up numbers. If there are no marks yet, we say so." "Progress, not points: motivation comes from clarity, not streaks or badges for their own sake." "Private by default: your diary is yours. Parents see only what you choose to share." "Mobile first: built for a phone and a small data budget." "Growth, not ranking: we never compare you with other students, only with where you were before." "Wellbeing first: if something would make a stressed student more anxious, we do not ship it."
- SA context heading: "Built for South Africa". Items: "CAPS subjects for NSC and IEB", "University and college modules you add yourself", "Prices in rand", "Personal information handled under POPIA", "Data stored in South Africa" (only once true), "Light on data".
- Team heading: "The team".
- Get in touch: "Questions, ideas or a correction? Contact us or visit Help."
- Closing: heading "See if it works for you", CTA "Start free".
- Metadata title: "About". Description: "Who builds Aptiverse and why: honest study and wellbeing support for South African students."

## Acceptance criteria

1. Given `team` is empty, when the page renders, then no team heading or placeholder appears.
2. Given the page, when searched, then it contains no user counts, percentages of users, partner names, testimonials or awards.
3. Given production is not yet in af-south-1, when the page is released, then "Data stored in South Africa" is not present.
4. Given a team member without a photo, when rendered, then an initials avatar with the member's name as accessible text appears.
5. Given the copy, when checked against the claims ledger, then every claim maps to a green or careful line.
6. Given a 360px viewport, when rendered, then there is no sideways scroll.
7. Given the content module, when the banned-claims test runs, then nothing matches, and the story contains no stress-detection or intervention claim and no language-support claim.

## Production readiness

- Security: static; no input; team photos are first-party files.
- Performance: prerendered; JS under 30 KB gzip (only `CtaLink`); photos via `next/image` with explicit sizes, AVIF or WebP, lazy below the fold; LCP is the h1.
- Resilience: no runtime dependencies.
- Observability: events `about_contact_clicked`, `about_cta_clicked`; consent-gated; Sentry tag `route:/about`.
- Accessibility (WCAG 2.2 AA): photos have alt text of the person's name and role; principles are a list; headings in order.
- Privacy and POPIA: team members' personal information published only with written consent kept on file; no tracking beyond consented analytics.
- SEO: canonical `/about`; sitemap entry; OG image; Organization JSON-LD lives on home only (not duplicated).
- Rollout: ships with the marketing set; residency line gated on the prod infrastructure (HRD-60). Rollback by Vercel instant rollback.
- Monitoring: Sentry route alert; Speed Insights; Lighthouse CI entry.

## Build tasks

- [ ] **PG-MKT-ABOUT-01** Honest startup story and mission
- [ ] **PG-MKT-ABOUT-02** South African context section (residency line only once true)
- [ ] **PG-MKT-ABOUT-03** Team (only if real, with written consent; omitted when empty)
- [ ] **PG-MKT-ABOUT-04** Principles list
- [ ] **PG-MKT-ABOUT-05** `content/about.ts` with typed `TeamMember` list
- [ ] **PG-MKT-ABOUT-06** Get in touch line linking to contact and help
- [ ] **PG-MKT-ABOUT-07** Metadata, canonical, `opengraph-image.tsx`, sitemap entry
- [ ] **PG-MKT-ABOUT-08** Analytics events through `track()`
- [ ] **PG-MKT-ABOUT-09** Add the "Growth, not ranking" and "Wellbeing first" principles (kept from 43f9faa) to the principles list
- [ ] **PG-MKT-ABOUT-10** Story guardrails: remove any detection or intervention claim, language-support claim or unverifiable process claim inherited from the 43f9faa page

## Quality tasks

- [ ] **PG-MKT-ABOUT-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-ABOUT-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-ABOUT-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-ABOUT-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-ABOUT-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-ABOUT-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-ABOUT-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-ABOUT-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-ABOUT-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-ABOUT-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-ABOUT-Q11** Release check: residency line matches production hosting; team consent on file
- [ ] **PG-MKT-ABOUT-Q12** Monitoring wired: Sentry route alert, Speed Insights, Lighthouse CI entry
- [ ] **PG-MKT-ABOUT-Q13** Banned-claims unit test over `content/about.ts` (shared list from PG-MKT-HOME-31)

## Tests

Unit:
- `team-block.test.tsx`: "renders nothing for an empty team", "falls back to initials without a photo".
- `content/about.test.ts`: "no user counts, testimonials or partner names", "no emoji or dashes", "contains no banned claim", "has six principles".

Playwright (`web/e2e/marketing-about.spec.ts`):
- "no team section when the team list is empty"
- "no sideways scroll at 360"
- "contact link goes to /contact"
- "axe clean in light and dark"

## Open questions

- Will the team be named at launch? If not, the page ships without the team block.
- Company legal name and registration details: needed for the footer or terms, not this page; confirm owner.
