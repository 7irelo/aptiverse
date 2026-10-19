# For students

| | |
|---|---|
| ID | `PG-MKT-STU` |
| Route | `/for-students` |
| Phase | 3 (content revised as Phases 5 and 7 ship) |
| Roles | public |
| Stages | high school, university |
| Entitlement | free (public) |
| Depends on | SHL-01, FE-30 to FE-37, UI-01, UI-04, UI-05, UI-23, UI-24, FE-11, FE-63, PG-MKT-HOME-14 and 15 (shared section and CTA), PG-MKT-HOME-16 (claims ledger) |
| Old app reference | `43f9faa:web/src/app/(marketing)/for-students/page.tsx`; DESIGN_BRIEF section 7 "For students" (intent only) |
| Status | Not started |

## Purpose

Speaks directly to a learner. Walks through a realistic day on Aptiverse in five short steps (dashboard, practice drill, mood check-in, AI tutor, projection from marks), then shows one concrete high school example and one university example so each student sees their own situation. Ends with one CTA.

## User stories

- As a Grade 12 learner, I want to picture how Aptiverse fits into a school day, so that I know it is worth the time.
- As a second-year university student, I want an example with modules, assignments and exams, so that I know it is not only for school.
- As a student who is stressed near exams, I want to see that it is calm and not another points game, so that I feel safe trying it.

## Layout

### Mobile (360px)

1. Public header.
2. Intro: h1, lede, "Start free" button full width.
3. "A day on Aptiverse" (`day-sequence.tsx`): an ordered list of five steps, each a card with time label (for example "07:10"), Lucide icon, h3, two lines of copy, and a small kit-built illustration (StatCard, ProgressRing or a two-message chat bubble) labelled "Example".
4. Stage examples (`stage-example.tsx` x2): stacked cards, "If you are in high school" first, "If you are at university or college" second. Each lists three things with Lucide check icons and a short sample block.
5. "What Aptiverse will not do" (`honesty-list.tsx`): three short lines (no points as the point, no made-up numbers, no sharing your diary).
6. "Good to know" FAQ (`student-faq.tsx`): h2 and five questions in an accordion, each trigger at least 48px tall.
7. Closing CTA (shared).
8. Footer.

### Desktop (1440px)

- Max width 1152px. Intro in 7 columns with the CTA inline.
- Day sequence becomes a vertical timeline: time label in a 2-column rail, card content in 6 columns, illustration in 4 columns.
- Stage examples side by side in two equal columns.
- Honesty list as a three-column row.
- FAQ centred at max width 800px.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(marketing)/for-students/page.tsx` | server | Static |
| OG image | `web/src/app/(marketing)/for-students/opengraph-image.tsx` | server (build) | Static |
| Content | `web/src/features/marketing/content/for-students.ts` | server | Steps, stage examples, honesty lines |
| DaySequence | `web/src/features/marketing/components/day-sequence.tsx` | server | `<ol>` with step cards; reused by for-parents for its own sequence |
| DayStepIllustration | `web/src/features/marketing/components/day-step-illustration.tsx` | server | Kit composites: `components/common/stat-card.tsx`, `progress-ring.tsx`, `components/ui/card.tsx`, `badge.tsx` ("Example") |
| StageExample | `web/src/features/marketing/components/stage-example.tsx` | server | Title, three points, sample block; stage passed as prop |
| HonestyList | `web/src/features/marketing/components/honesty-list.tsx` | server | Static list, reused by for-parents |
| MarketingFaq | `web/src/features/marketing/components/marketing-faq.tsx` | server, with the `components/ui/accordion.tsx` client leaf | Question and answer list from content; also emits FAQPage JSON-LD through `json-ld.tsx`; reused by for-parents |
| MarketingSection, ClosingCta, CtaLink | shared from home | server / client leaf | |

## Data

No API reads, no mutations. All sample values live in `content/for-students.ts`, each shown inside a block badged "Example". No real user data, no counts of users.

## States

| State | When | What shows |
|---|---|---|
| Populated | Default | All blocks |
| Reduced motion | OS setting | Timeline items do not animate in |
| No JS | Scripts blocked | Identical page; only analytics on CTAs is lost |
| Loading, error, empty, forbidden, upgrade, no evidence | Not applicable (static) | Root boundaries only |

## Stage variants

- Day sequence uses a high school learner by default (Grade 11, Physical Sciences drill, an SBA task logged) with a single line under each step giving the university equivalent where it differs, labelled "At university:".
- High school example: "Grade 10 to 12 on CAPS, NSC or IEB", points: "Pick your CAPS subjects", "Log SBA tasks and marks", "See a projected term mark from the marks already in".
- University example: "Any year at a university or college", points: "Add your courses at your level of study", "Track assignments, tests and exams", "See a projected course result from the marks already in".
- University block contains none of SBA, APS, matric, Grade, CAPS. High school block contains none of module, GPA, semester.
- Grades 8 and 9 are covered by "high school" but the example names Grade 10 to 12; copy says "Grade 8 to 12" in the intro. The grade range in copy comes from one constant shared with the onboarding grade options (PG-ONB-STU), so the page never promises a grade the product cannot set up (the 43f9faa site said "primary school through university" while onboarding offered Grade 10 to 12 only).
- Past papers in the high school example: say only what the BE-ACA-60 source covers (the 43f9faa archive link-out was NSC only, so it could not promise IEB papers or memos). University example never mentions past papers.
- University example mentions file uploads only once BE-ACA-39 to 41 ship.

## Interactions and edge cases

- Only links: "Start free" (to `/register?role=student`), and inline links to `/features` and `/help`.
- Steps that depend on features not yet shipped (the tutor in Phase 5, projection in Phase 7) are filtered by `marketingFeaturesPhase`, like the features page; if fewer than three steps remain the sequence block is hidden and the page shows stage examples only.
- Time labels are illustrative and use 24-hour format.
- FAQ answers are honest about limits, including the ones that do not flatter us (diary storage, no offline mode), following the 43f9faa honesty pass. Answers that depend on plan contents read their facts from PG-MKT-PRICE once it ships; until then the free-plan answer names only what every account gets.
- Never promise an outcome ("watch your marks climb") or an intervention ("a nudge to rest before you burn out"); nothing detects burnout.

## Copy

- h1: "Built for the way you actually study"
- Lede: "Short sessions between classes, late-night revision, the week before a test. Aptiverse helps you practise at your level and see where you stand, for Grade 8 to 12 and for university or college."
- Steps:
  1. "07:10 Check your dashboard": "See what is due this week and which topic needs work next."
  2. "13:30 A 20-minute practice drill": "Questions pitched at your grade or year. Get marked with explanations when you finish."
  3. "16:00 A one-minute check-in": "Log how you are feeling. It stays private and is never graded."
  4. "19:45 Ask the AI tutor": "Stuck on a concept? Get it explained another way. It guides you rather than doing the work, and it can be wrong, so check what matters."
  5. "21:00 See where you stand": "When marks are in, see a projection from them. No marks yet means no projection."
- "At university:" lines: step 2 "Practise for your courses at your level of study." step 5 "See a projected course result from your assignment and test marks."
- Honesty heading: "What Aptiverse will not do". Lines: "Turn your studies into a points game", "Show you a number it cannot back up", "Show your diary to anyone, including your parents".
- FAQ heading: "Good to know". Questions and answers:
  1. "Is the free plan really useful?" / "Yes. Every free account can add subjects or modules, log assessments and marks, practise, check in and keep a diary. Paid plans raise limits and add more AI help; see Pricing for exactly what each includes."
  2. "I am at university, not school. Does it fit?" / "Yes. Choose university or college when you set up, add your courses (or pick ones others at your institution already added) with your level of study, and you see coursework and a projection per course instead of school subjects."
  3. "Does the AI tutor just give me the answers?" / "No, on purpose. It explains the idea, then sets you a question to try. On graded work it guides rather than writing it for you. It can also make mistakes, so check anything important."
  4. "Can my parents read my diary?" / "No. There is no parent screen that shows diary entries and no setting that turns one on. To be straight with you: entries are stored on our servers, and staff access is governed by our privacy policy." (Add the encryption sentence only after BE-WEL-04 is verified, and never "on your device".)
  5. "Will it work on a cheap phone with little data?" / "It is built for phones first and kept light. It does need a connection: there is no offline mode."
- Closing: heading "Set up your subjects or modules in a few minutes", body "No card needed for the free plan.", CTA "Start free".
- Metadata title: "For students". Description: "How Aptiverse fits into a school or university day: practice at your level, honest progress and a private space to check in."

## Acceptance criteria

1. Given the page, when rendered at 360px, then the five steps appear in order as an ordered list with no sideways scroll.
2. Given the university example, when read, then it contains none of "SBA", "APS", "matric", "Grade", "CAPS".
3. Given the high school example, when read, then it contains none of "module", "GPA", "semester".
4. Given any sample number on the page, when inspected, then it sits inside an element badged "Example".
5. Given `marketingFeaturesPhase` below 5, when rendered, then the AI tutor step is absent.
6. Given "Start free", when clicked, then the visitor lands on `/register?role=student`.
7. Given the copy, when checked against the claims ledger, then every claim maps to a green or careful line.
8. Given the FAQ, when a trigger is activated by keyboard, then it expands with `aria-expanded="true"` and the answer is readable; the page source contains one FAQPage JSON-LD block matching the visible questions exactly.
9. Given the grade range shown in the intro, when compared with the onboarding grade options constant, then they match.
10. Given the content module, when the banned-claims test runs, then nothing matches (no "offline", "end-to-end", "adaptive", "burn out" nudge or outcome promise).

## Production readiness

- Security: static, no input, no API. The `role` query parameter it links with is a hint only; the register page validates it against the self-signup allowlist.
- Performance: prerendered, zero page-level client JS except `CtaLink`; budget under 40 KB gzip for the route. LCP is the h1. Illustrations are HTML and SVG, no raster images.
- Resilience: no runtime dependencies; nothing can fail at request time.
- Observability: events `students_cta_clicked` {cta: "intro_start_free" | "closing_start_free"}, `students_link_clicked` {target: "features" | "help"}; consent-gated; Sentry via root boundaries with tag `route:/for-students`.
- Accessibility (WCAG 2.2 AA): sequence is a real `<ol>`; time labels in `<time>`; icons aria-hidden; "Example" badge text is read with the block.
- Privacy and POPIA: audience includes minors; no forms, no cookies, analytics only after consent, no ad pixels (none in v1, decision 8; any later tag needs a minors review, HRD-33).
- SEO: canonical `/for-students`; sitemap entry; OG image; FAQPage JSON-LD generated from the same content array as the visible FAQ (never markup for questions not on the page).
- Rollout: ships with the marketing set; steps follow `marketingFeaturesPhase`. Rollback with Vercel instant rollback (HRD-03).
- Monitoring: Sentry alert for `route:/for-students`; Speed Insights p75 LCP; Lighthouse CI budget entry.

## Build tasks

- [ ] **PG-MKT-STU-01** "A day on Aptiverse" sequence (dashboard, drill, mood, tutor, projection from marks)
- [ ] **PG-MKT-STU-02** High school example block
- [ ] **PG-MKT-STU-03** University example block
- [ ] **PG-MKT-STU-04** CTA (intro and shared closing CTA, both to `/register?role=student`)
- [ ] **PG-MKT-STU-05** `content/for-students.ts` with steps, stage lines and examples
- [ ] **PG-MKT-STU-06** `DaySequence` and `DayStepIllustration` components (kit-built, "Example" badge)
- [ ] **PG-MKT-STU-07** `StageExample` component
- [ ] **PG-MKT-STU-08** `HonestyList` component
- [ ] **PG-MKT-STU-09** Phase filter on steps via `marketingFeaturesPhase`
- [ ] **PG-MKT-STU-10** Metadata, canonical, `opengraph-image.tsx`, sitemap entry
- [ ] **PG-MKT-STU-11** Analytics events through `track()`
- [ ] **PG-MKT-STU-12** "Good to know" FAQ with the five honest answers, using the shared `MarketingFaq`
- [ ] **PG-MKT-STU-13** FAQPage JSON-LD from the FAQ content array
- [ ] **PG-MKT-STU-14** Grade range copy read from the constant shared with onboarding grade options
- [ ] **PG-MKT-STU-15** Stage example guardrails: past papers wording tied to the BE-ACA-60 source, uploads only after BE-ACA-39 to 41

## Quality tasks

- [ ] **PG-MKT-STU-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-STU-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-STU-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-STU-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-STU-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-STU-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-STU-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-STU-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-STU-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-STU-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-STU-Q11** Stage-wording check on both example blocks
- [ ] **PG-MKT-STU-Q12** Monitoring wired: Sentry route alert, Speed Insights, Lighthouse CI entry
- [ ] **PG-MKT-STU-Q13** Banned-claims unit test over `content/for-students.ts`
- [ ] **PG-MKT-STU-Q14** FAQ accordion keyboard and axe pass in light and dark, with Rich Results test of the JSON-LD

## Tests

Unit:
- `content/for-students.test.ts`: "university block has no school terms", "high school block has no university terms", "no emoji or dashes".
- `day-sequence.test.tsx`: "renders an ordered list", "hides the tutor step below phase 5", "hides the block when fewer than three steps remain".
- `marketing-faq.test.tsx`: "JSON-LD questions match the visible questions", "answers render as text, not HTML".
- `content/for-students.test.ts` also: "contains no banned claim", "grade range matches onboarding options".

Playwright (`web/e2e/marketing-for-students.spec.ts`):
- "five steps in order at 360 without sideways scroll"
- "every sample number is inside an Example block"
- "Start free goes to register with the student role"
- "axe clean in light and dark"
- "FAQ expands by keyboard and the diary answer is visible"

## Open questions

- Should the day sequence default to a university student for traffic from university-targeted campaigns (for example `?stage=university`)? That would make the page dynamic; assumed no for v1.
- Grade range: the 43f9faa product supported Grade 10 to 12 only; the rebuild says Grade 8 to 12. Confirm the CAPS catalog seed (BE-ACA-03) covers Grades 8 and 9 before the intro says "Grade 8 to 12".
