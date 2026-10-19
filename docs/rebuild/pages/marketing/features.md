# Features

| | |
|---|---|
| ID | `PG-MKT-FEAT` |
| Route | `/features` |
| Phase | 3 (content revised at the end of Phases 5 and 7 as features ship) |
| Roles | public |
| Stages | high school, university |
| Entitlement | free (public) |
| Depends on | SHL-01, FE-30 to FE-37, UI-01, UI-04, UI-05, UI-20, FE-11, FE-63, PG-MKT-HOME-03 to 05 (mini-demos), PG-MKT-HOME-14 and 15 (shared section and CTA), PG-MKT-HOME-16 (claims ledger) |
| Old app reference | `43f9faa:web/src/app/(marketing)/features/page.tsx`; DESIGN_BRIEF section 7 "Features" (intent only) |
| Status | Not started |

## Purpose

The complete, honest feature list for a visitor who wants detail before signing up. Grouped into four themes (Learn, Practice, Wellbeing, Plan your future), each feature gets one precise description, a Lucide icon, and a note saying which stages it covers. Only features that exist in the rebuilt product at the time of each release are listed; anything not yet shipped is left out, not marked "coming soon".

## User stories

- As a student, I want to scan what Aptiverse can do in my stage, so that I know if it covers my subjects or courses.
- As a parent, I want to know exactly what each feature does and does not do, so that I am not misled.
- As a visitor on a slow connection, I want the page to load quickly and read well without the demos, so that I can still decide.

## Layout

### Mobile (360px)

1. Public header (SHL-01).
2. Page intro: h1, one-sentence lede, then "Start free" (full width) and an outline "See pricing" (shown only when `/pricing` is on).
3. Group jump links: a horizontally wrapping row of four 44px chips (Learn, Practice, Wellbeing, Plan your future); wraps to two lines, never scrolls sideways.
4. Group "Learn" (`feature-group.tsx`): h2, then feature blocks stacked: AI tutor (with tutor mini-demo), Subjects and courses, Assessments and SBA tracking.
5. Group "Practice": Practice tests at your level, Exam papers marked against a memo, Practice test integrity, Past papers (high school only; links to the official DBE archive, decision 14).
6. Group "Wellbeing" (magenta zone surface): Mood check-in (with check-in mini-demo), Private diary, Support resources (South African helplines).
7. Group "Plan your future": Mastery and projection (with mastery mini-demo), Goals checked against real work, Admission targets you research and enter, Calendar and reminders.
8. Parents note: one short paragraph linking to `/for-parents`.
9. Closing CTA (shared `ClosingCta`).
10. Public footer.

### Desktop (1440px)

- Max width 1152px. Intro left-aligned, jump links inline under it and sticky below the header while scrolling the groups.
- Each group: h2 and group lede in a 4-column left rail, feature blocks in a 2-column grid in the remaining 8 columns. A block with a demo spans both columns.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(marketing)/features/page.tsx` | server | Static; maps `content/features.ts` into groups |
| Loading / error | inherits `web/src/app/loading.tsx`, `web/src/app/error.tsx` | server / client | Static page; no own segment files needed |
| OG image | `web/src/app/(marketing)/features/opengraph-image.tsx` | server (build) | Static |
| Content | `web/src/features/marketing/content/features.ts` | server | Groups, features, icon keys, stage coverage, demo key, `shippedIn` phase |
| FeatureGroup | `web/src/features/marketing/components/feature-group.tsx` | server | h2, lede, grid, optional zone (`wellbeing`) |
| FeatureBlock | `web/src/features/marketing/components/feature-block.tsx` | server | Lucide icon (aria-hidden), h3 title, description, stage badges (`components/ui/badge.tsx`), optional demo slot |
| StageBadges | `web/src/features/marketing/components/stage-badges.tsx` | server | "High school", "University" badges; text not colour carries meaning |
| JumpLinks | `web/src/features/marketing/components/jump-links.tsx` | server | Anchor list; sticky on desktop via CSS only |
| TutorDemo, MasteryDemo, CheckinDemo | `web/src/features/marketing/components/mini-demos/*.tsx` | client | Reused from home, loaded with `next/dynamic` below the fold |
| MarketingSection, ClosingCta, CtaLink | `web/src/features/marketing/components/*.tsx` | server / client leaf | Shared from home |
| Anchor registry | `web/src/features/marketing/content/feature-anchors.ts` | shared | Stable ids for groups and key features, imported by the public header menu (SHL-01) and the footer so deep links never break |
| Feature mocks | `web/src/features/marketing/components/mocks/goal-card-mock.tsx`, `targets-mock.tsx`, `exam-paper-mock.tsx` | server | Static mocks drawn from the rebuilt pages they depict (labelled "Example"); no client JS |

## Data

No API reads. All content is static in `content/features.ts`. Each feature has `shippedIn: 4 | 5 | 6 | 7 | 8` and the page only renders features whose phase is at or below `marketingFeaturesPhase` from `web/src/lib/flags.ts`, so the list grows with releases without listing anything unbuilt. No mutations.

## States

| State | When | What shows (exact copy) |
|---|---|---|
| Populated | Default | Groups with their shipped features |
| Empty group | No feature in a group has shipped yet | The group is not rendered and its jump link is removed |
| Demo failed to load | Dynamic import fails | The block shows its static final-state rendering; no error text |
| Reduced motion | OS setting | Demos show final state; no reveal animation |
| Loading, error, forbidden, upgrade, no evidence | Not applicable on a static page | Root boundaries only |

## Stage variants

Each feature lists coverage with badges:
- Both stages: AI tutor, practice tests, exam papers, integrity, mood check-in, diary, support resources, mastery and projection, goals, calendar, admission targets.
- High school only: Assessments described as "SBA tasks and assessments" and Past papers. Copy: "For high school".
- University only wording inside shared features: "courses", "assignments and exams". Shared feature descriptions use neutral wording ("subjects or courses") or two short lines, one per stage, each labelled.
- APS appears only inside the admission targets block, labelled "High school".

## Interactions and edge cases

- Jump links move focus to the group h2 (`tabIndex={-1}` on headings) so screen readers land correctly; scroll-margin keeps the heading clear of the sticky header.
- Demos are lazy: they mount when within 200px of the viewport (IntersectionObserver in each demo leaf), so the initial JS stays small.
- Past papers block states plainly: "Official past papers by subject, grade and year, linked from the Department of Basic Education archive. Aptiverse does not mark past papers for you."
- If a feature is withdrawn later, removing it from `content/features.ts` is enough; no other page lists the full set.
- Stable anchors: groups `#learn`, `#practice`, `#wellbeing`, `#plan`, plus `#tutor`, `#projection`, `#exam-papers`, `#goals`, `#admission-targets`, `#for-parents`. Every anchor target has `scroll-margin-top` equal to the sticky header plus jump bar height. A hidden (unshipped) feature's anchor falls back to its group.
- Mock fidelity: every mock is drawn from the rebuilt screen it depicts and re-checked at each phase release, the way the 43f9faa page drew its goals and career mocks from the running app. Nothing appears in a mock that the screen cannot do (for example milestones on a goal card while the UI cannot create one).
- Exam papers: say what it is and what it is not. Aptiverse writes the paper; it is not an official DBE or IEB paper; the student chooses the length and difficulty (it is not adaptive); it does not predict a final result. Section structure, mark ranges and timing are stated only as the rebuilt generator (BE-PRA-04, BE-AI-09) implements them.
- Practice: the student picks topic, format and difficulty before the set is generated; nothing re-reads performance mid-set. Never call it adaptive.
- Wellbeing: the page never says the platform watches for stress, detects a decline or connects anyone to a person. Helplines are named as other organisations' services ("their service, staffed by them, not ours"). No counsellor booking, break timer or session-length nudge is described.
- Goals: describe the baseline rule (BE-PRG-03) plainly; points (BE-PRG-07) are not sold as the point, per the de-gamified rule, so the 43f9faa "spend points on quota" showcase is not carried over.
- Admission targets: requirements are the ones the student researched and entered; the standing number is the biggest single gap, not an average, because an application is judged on the requirement missed (FE-60 reach engine). "Free on every plan" is said only if PG-MKT-PRICE confirms it.
- The 43f9faa page listed study groups and a tutor directory under "Also included"; both are out of v1 and must not appear.

## Copy

- h1: "Everything Aptiverse does, plainly explained"
- Lede: "Four parts that work together: learning support, honest practice, a private space for wellbeing, and planning for what comes next."
- Intro CTAs: "Start free", "See pricing".
- Practice tests: "Name a topic and choose the format and difficulty. Aptiverse writes a fresh set and marks it, and every answer feeds your topic mastery."
- Group ledes: Learn "Keep track of what you study and get help when you are stuck." Practice "Tests at your level, with rules that keep results meaningful." Wellbeing "Never graded, never ranked, private by default." Plan your future "See where you stand and what to work on next."
- AI tutor: "Ask about a concept and get an explanation pitched at your grade or year of study. It guides you on graded work rather than giving answers, and it can make mistakes, so check anything important."
- Subjects and courses: "High school students pick CAPS subjects for NSC or IEB. University and college students add their own courses with year of study."
- Exam papers: "Full papers with sections and marks per question, so you can budget your time. Written answers are marked against a memo with part marks. Aptiverse writes each paper; it is not an official DBE or IEB paper."
- Integrity: "One attempt per test, a timer kept on our side, and the AI tutor switched off while a test is running."
- Mood check-in: "A one-minute check-in with a weekly trend you read yourself. It does not diagnose anything or alert anyone. Parents see a trend only if you choose to share it. If you need help now, the support page lists South African helplines, which are their services, not ours."
- Diary: "A private journal. Parents never see diary entries, and there is no setting that changes that." Add "Entries are encrypted when stored on our servers." only after BE-WEL-04 ships and is verified; never "end-to-end" or "encrypted on your device" (the 43f9faa diary made that promise without building it).
- Mastery and projection: "Topic mastery from your practice and graded work, and a projection from the marks already in. No marks yet means no projection."
- Goals: "Goals measured against real work, such as tests completed or assessments submitted."
- Admission targets: "Track the requirements you are aiming for. You research and enter them; Aptiverse shows how your marks compare."
- Calendar: "Assessment dates and study sessions in one place, with reminders."
- Parents note (Phase 8 and later): "Parents link to a child by invite and see progress and the wellbeing trends their child chooses to share." Before Family ships: "Parent accounts are coming. Your diary, mood notes and tutor chats will always stay private."
- Closing: heading "Try it with your own subjects", CTA "Start free".
- Metadata title: "Features". Description: "AI tutor, practice tests, mastery tracking, a private diary and planning tools for South African high school and university students."

## Acceptance criteria

1. Given `marketingFeaturesPhase` is 4, when the page renders, then only features with `shippedIn` 4 or lower appear and no text mentions features from later phases.
2. Given a group has no shipped features, when the page renders, then neither the group nor its jump link appear.
3. Given the Past papers block, when rendered, then it says Aptiverse does not mark past papers and makes no worked-solution claim.
4. Given any feature with university coverage, when its description is read, then it contains none of "SBA", "APS", "matric" outside a block labelled "High school".
5. Given a keyboard user, when a jump link is activated, then focus moves to that group's h2 and the heading is not hidden under the sticky header.
6. Given a 360px viewport, when the page renders, then there is no sideways scroll and jump chips wrap.
7. Given the page HTML before hydration, when inspected, then every feature description is present (demos are enhancement only).
8. Given the copy, when compared with the claims ledger, then every claim maps to a green or careful line.
9. Given a deep link to any id in `feature-anchors.ts`, when it loads, then the target heading is visible below the sticky bars; an anchor for an unshipped feature lands on its group.
10. Given the exam papers block, when read, then it states the paper is written by Aptiverse and is not an official DBE or IEB paper, and contains no "adaptive" or result-prediction claim.
11. Given the content module, when the banned-claims test runs, then nothing in `content/features.ts` matches `banned-claims.ts`, and no study group or tutor directory entry exists.
12. Given Family is not live, when the parents note renders, then it describes only what stays private.

## Production readiness

- Security: static page, no input, no API calls, no query params read. Nothing to enforce server-side.
- Performance: prerendered; LCP is the h1. JS budget for `/features` under 90 KB gzip with demos lazy-mounted; Recharts only loads when the mastery block nears the viewport. Icons are tree-shaken Lucide imports. No raster images.
- Resilience: a failing dynamic import leaves the static final state; the page never depends on the API.
- Observability: Sentry captures demo chunk load errors with tag `route:/features`. Events: `features_jump_clicked` {group}, `features_demo_played` {demo}, `features_cta_clicked` {cta: "closing_start_free"}. Consent-gated, no PII.
- Accessibility (WCAG 2.2 AA): heading order h1, h2 per group, h3 per feature; stage shown as text badges; focus not obscured by the sticky jump bar (SC 2.4.11); demos keyboard operable.
- Privacy and POPIA: no cookies or storage; analytics only after consent; demos store nothing.
- SEO: canonical `/features`; sitemap entry; OG image; no JSON-LD (no FAQ or product markup claims).
- Rollout: `marketingFeaturesPhase` flag controls which features are listed; raise it in the release that ships each phase. Rollback by lowering the flag (instant, env change plus redeploy) or Vercel instant rollback (HRD-03).
- Monitoring: Sentry alert on new issues for `route:/features`; Speed Insights p75 LCP; Lighthouse CI budget for `/features`.

## Build tasks

- [ ] **PG-MKT-FEAT-01** Groups: Learn, Practice, Wellbeing, Plan your future, rendered from `content/features.ts`
- [ ] **PG-MKT-FEAT-02** Feature block component (icon, title, description, stage coverage badges, optional demo slot)
- [ ] **PG-MKT-FEAT-03** Reuse the three mini-demos from home, lazy-mounted near the viewport
- [ ] **PG-MKT-FEAT-04** Single closing CTA (shared `ClosingCta`)
- [ ] **PG-MKT-FEAT-05** `content/features.ts` with every string, icon key, stage coverage and `shippedIn` phase
- [ ] **PG-MKT-FEAT-06** `FeatureGroup` component with wellbeing zone variant
- [ ] **PG-MKT-FEAT-07** `StageBadges` component
- [ ] **PG-MKT-FEAT-08** Jump links with focus management and sticky desktop bar
- [ ] **PG-MKT-FEAT-09** Phase filter via `marketingFeaturesPhase` flag, hiding empty groups
- [ ] **PG-MKT-FEAT-10** Metadata, canonical and `opengraph-image.tsx`
- [ ] **PG-MKT-FEAT-11** Add `/features` to the sitemap route registry
- [ ] **PG-MKT-FEAT-12** Analytics events through `track()`
- [ ] **PG-MKT-FEAT-13** `feature-anchors.ts` stable anchor registry, scroll margins, and group fallback for unshipped features
- [ ] **PG-MKT-FEAT-14** Intro CTAs "Start free" and "See pricing" (pricing link behind its route flag)
- [ ] **PG-MKT-FEAT-15** Wellbeing and diary honesty rules applied to copy (no detection, no counsellor, helplines named as third-party, encryption wording only once BE-WEL-04 is verified)
- [ ] **PG-MKT-FEAT-16** Goal card mock drawn from the rebuilt goals page (baseline sentence, no milestones unless creatable)
- [ ] **PG-MKT-FEAT-17** Exam paper block and mock with explicit non-claims (not official, not adaptive, no result prediction)
- [ ] **PG-MKT-FEAT-18** Admission targets block and mock drawn from the reach engine (biggest single gap, student-entered requirements, deadline flag)
- [ ] **PG-MKT-FEAT-19** Parents note gated on Family (Phase 8) with the privacy-only variant before
- [ ] **PG-MKT-FEAT-20** Mock fidelity review step added to each phase release checklist (every mock compared with its live screen)

## Quality tasks

- [ ] **PG-MKT-FEAT-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-FEAT-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-FEAT-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-FEAT-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-FEAT-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-FEAT-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-FEAT-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-FEAT-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-FEAT-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-FEAT-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-FEAT-Q11** Stage-wording check: no school terms in university-covered descriptions
- [ ] **PG-MKT-FEAT-Q12** JS budget under 90 KB gzip; demos lazy
- [ ] **PG-MKT-FEAT-Q13** Monitoring wired: Sentry route alert, Speed Insights, Lighthouse CI entry
- [ ] **PG-MKT-FEAT-Q14** Banned-claims unit test over `content/features.ts` (shared list from PG-MKT-HOME-31)
- [ ] **PG-MKT-FEAT-Q15** Anchor test: every header and footer deep link to `/features#...` resolves to a rendered element

## Tests

Unit:
- `content/features.test.ts`: "every feature has an icon, stage coverage and shippedIn", "no emoji or dashes", "university descriptions have no school terms".
- `feature-filter.test.ts`: "hides features above the flag phase", "drops empty groups", "maps an unshipped feature anchor to its group".
- `content/features.test.ts` also: "contains no banned claim", "has no study group or tutor entries", "exam papers copy says it is not an official paper".

Playwright (`web/e2e/marketing-features.spec.ts`):
- "lists only shipped features for the configured phase"
- "jump link moves focus to the group heading"
- "past papers block makes no marking or worked-solution claim"
- "no sideways scroll at 360"
- "axe clean in light and dark"
- "every features deep link from the header lands on a visible heading"

## Open questions

- Which phase value ships with the first public release of this page (Phase 3 has no student features live; the page may need to wait for the internal beta after Phase 5)?
- The old app linked out to the DBE archive; the rebuild stores papers (BE-ACA-60, S3). Confirm the source and licence of hosted papers before the copy says where they come from.
- Decided (35): wellbeing copy gets professional sign-off and every helpline number is phone-checked before prod; the Support resources item is not advertised until that is done (BE-WEL-08, Phase 7).
- Partly decided (16, 12): the exam paper format is in v1, and Student Max is not (student.max comes later), so the copy never names Max. Still open: whether the 43f9faa rules (30 to 150 mark papers, roughly a minute a mark) carry over, and which v1 plan includes exam papers (BE-BIL-02).
