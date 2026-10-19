# Universities and careers

| | |
|---|---|
| ID | `PG-MKT-CAREERS` |
| Route | `/universities-and-careers` |
| Phase | 3 (built), planner section switched on with career targets in Phase 7 |
| Roles | public |
| Stages | high school, university |
| Entitlement | free (public); career targets are free for everyone in the product too |
| Depends on | SHL-01, FE-30 to FE-37, UI-01, UI-04, UI-05, UI-26 (table with card fallback), FE-11, FE-63, PG-MKT-HOME-14 and 15, PG-MKT-HOME-16 (claims ledger); planner facts depend on BE-CAR-02 to BE-CAR-06 and FE-60 |
| Old app reference | new (no old public page; product reference `43f9faa:web/src/lib/targets/reach.ts`, `43f9faa:web/src/components/career/`, and the `CareerTargetsDemo` mock and its notes in `43f9faa:web/src/components/marketing/FeatureDemos.tsx`) |
| Status | Not started |

## Purpose

An informational page that explains, plainly and correctly, how the Admission Point Score (APS) works in South Africa, what "university ready" means beyond a number, how to think about career pathways, and how the Aptiverse planner helps a student track the requirements they research themselves. It is useful on its own (good for search), and it never pretends Aptiverse knows what any specific university requires.

## User stories

- As a Grade 10 learner, I want to understand how APS is worked out, so that I can see which subjects and marks matter.
- As a parent, I want a plain explanation of admission requirements, so that I can help my child plan.
- As a first-year student, I want to know how the planner can help with progression or postgraduate targets, so that the page is not only for matrics.

## Layout

### Mobile (360px)

1. Public header.
2. Intro: h1, lede.
3. In-page contents (`page-contents.tsx`): four anchor links.
4. Section "How APS works" (`aps-explainer.tsx`): short paragraphs; the NSC 7-point scale as a table that becomes a stacked card list at 360px (DataTable card fallback); a worked example (`aps-worked-example.tsx`) of six subjects with marks, points per subject and the total, computed by `computeApsExample`; a callout "Each university sets its own rules".
5. Section "More than a number" (`readiness-section.tsx`): subject requirements, minimum marks per subject, National Benchmark Tests where applicable, application dates; each a short paragraph with a Lucide icon.
6. Section "Career pathways" (`pathways-section.tsx`): three short paragraphs on working back from a career to subjects and qualifications, with links to official sources listed as plain text names, no deep links that may rot unless verified.
7. Section "How the Aptiverse planner helps" (`planner-section.tsx`): three steps and a kit-built example of a target with per-subject standing ("Example" badge). Hidden until the planner ships.
8. Closing CTA.
9. Footer.

### Desktop (1440px)

- Max width 1152px. Contents become a sticky left rail (3 columns); article body 7 columns with a 65 character measure.
- APS scale table renders as a real table; worked example sits beside the explanation in two columns.
- Planner example card floats right of the steps.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(marketing)/universities-and-careers/page.tsx` | server | Static |
| OG image | `web/src/app/(marketing)/universities-and-careers/opengraph-image.tsx` | server (build) | Static |
| Content | `web/src/features/marketing/content/universities-and-careers.ts` | server | Prose, scale rows, example subjects and marks |
| APS example logic | `web/src/features/marketing/lib/aps-example.ts` | server (pure) | `computeApsExample(subjects)`: maps percentage to NSC level (80 to 100 is 7, 70 to 79 is 6, 60 to 69 is 5, 50 to 59 is 4, 40 to 49 is 3, 30 to 39 is 2, 0 to 29 is 1), excludes Life Orientation, sums the best six |
| PageContents | `web/src/features/marketing/components/page-contents.tsx` | server | Anchor list, sticky rail on desktop; reused by legal pages |
| ApsExplainer | `web/src/features/marketing/components/careers/aps-explainer.tsx` | server | Prose plus scale |
| ApsScaleTable | `web/src/features/marketing/components/careers/aps-scale-table.tsx` | server | Uses `components/ui/table.tsx`, card list under `sm` |
| ApsWorkedExample | `web/src/features/marketing/components/careers/aps-worked-example.tsx` | server | Renders the output of `computeApsExample`, tabular-nums |
| ReadinessSection | `web/src/features/marketing/components/careers/readiness-section.tsx` | server | |
| PathwaysSection | `web/src/features/marketing/components/careers/pathways-section.tsx` | server | |
| PlannerSection | `web/src/features/marketing/components/careers/planner-section.tsx` | server | Flag-gated |
| MarketingSection, ClosingCta, CtaLink | shared from home | server / client leaf | |

## Data

No API reads, no mutations. The worked example is computed at build time from constants by `computeApsExample`, so the arithmetic is tested, not typed by hand. It must stay consistent with the product APS function (BE-CAR-06); both use the same scale and a shared fixture in their tests (see open questions).

## States

| State | When | What shows |
|---|---|---|
| Populated | Default | All sections |
| Planner hidden | `marketingCareersPlanner` off (before Phase 7) | Planner section and its contents link removed; CTA copy switches to the generic closing CTA |
| Reduced motion | OS setting | No smooth scrolling for anchors |
| Loading, error, empty, forbidden, upgrade, no evidence | Not applicable (static) | Root boundaries only |

## Stage variants

- APS, NSC and matric wording appears only in sections addressed to high school learners, introduced with "If you are in high school".
- A short paragraph for university and college students in the planner section: "Already at university? Use targets for progression requirements, a major, honours or another postgraduate programme." It uses course and year-of-study wording and no APS.
- IEB: one line saying IEB results use the same 7-point achievement levels for APS purposes, and to check each university's rules.

## Interactions and edge cases

- Contents links move focus to the section heading.
- Worked example: subjects Home Language 68, First Additional Language 74, Mathematics 61, Physical Sciences 57, Life Sciences 72, Geography 80, Life Orientation 85 (shown but excluded). Levels 5, 6, 5, 4, 6, 7; APS 33. The total is rendered from the function output.
- The callout must say some universities count Life Orientation at a reduced value, some exclude it, some use their own scoring, and some faculties weight Mathematics differently, so the student must check the specific prospectus.
- No university names, logos or requirement figures are presented as Aptiverse data. If an institution is named as an example of "its own rules", it is phrased generally without numbers.
- No salary information anywhere (claims ledger red list).
- Planner explanation follows the reach engine (FE-60, ported from `43f9faa:web/src/lib/targets/reach.ts`): targets are listed closest first; the number shown for a target is its biggest single gap, not an average, because an application is judged on the requirement missed; each requirement shows its own status; application deadlines are flagged as they approach (warning inside 30 days, stronger inside 14, as in the 43f9faa career page).
- Never call the planner "career matching" or imply it recommends programmes: it measures the targets the student entered.
- "Free on every plan" is stated only if PG-MKT-PRICE confirms the planner is free in the rebuilt plans (it was free in 43f9faa).
- The planner mock (`planner-mock.tsx`, "Example") is drawn from the rebuilt career page and contains no real institution requirement figures.

## Copy

- h1: "Universities, APS and careers, explained"
- Lede: "How admission points work in South Africa, what else universities look at, and how to plan backwards from where you want to go."
- APS intro: "Most South African universities work out an Admission Point Score from your Grade 12 results. Each subject percentage maps to a level from 1 to 7, and the levels of your best six subjects are added up."
- Scale table caption: "NSC achievement levels used for APS".
- Worked example caption: "Example: one learner's results".
- Callout: "Each university sets its own rules. Some count Life Orientation at a lower value or not at all, some use their own scoring, and many programmes also need minimum marks in specific subjects. Always check the prospectus for the programme you want."
- Readiness heading: "More than a number". Items: "Subject requirements: many programmes need specific subjects, such as Mathematics rather than Mathematical Literacy." "Minimum marks: a programme can ask for a minimum level in one subject even if your APS is high enough." "National Benchmark Tests: some programmes ask for them." "Application dates: many universities close applications in the year before you start."
- Pathways heading: "Plan backwards from a career". Body: "Pick a career you are curious about, find the qualification it usually needs, then check which school subjects that qualification asks for. Talk to your school's Life Orientation teacher or a university's student advisors."
- Planner heading: "How the Aptiverse planner helps". Steps: "Add a target you have researched, such as a programme at a university." "Enter the requirements from its prospectus." "See how your measured marks compare, subject by subject. No marks yet means no standing, not a fail."
- Planner honesty line: "Aptiverse does not hold a database of university requirements. You enter what you find, and you stay in charge of checking it."
- Planner reach lines: "Your targets are listed closest first." "The number on each target is your biggest single gap, because an application is judged on the requirement you miss, not the average of the ones you meet." "Application dates are flagged as they get close."
- Closing: heading "Track the requirements you are aiming for", CTA "Start free".
- Metadata title: "Universities and careers". Description: "How APS works in South Africa, what universities look at beyond points, and how to plan backwards from a career."

## Acceptance criteria

1. Given the worked example constants, when `computeApsExample` runs, then it returns levels 5, 6, 5, 4, 6, 7 and a total of 33, with Life Orientation excluded.
2. Given a mark of exactly 80, 70, 60, 50, 40, 30 or 29, when mapped, then the levels are 7, 6, 5, 4, 3, 2 and 1.
3. Given the page at 360px, when rendered, then the scale shows as stacked cards and nothing scrolls sideways.
4. Given the callout, when read, then it says each university sets its own rules and mentions Life Orientation handling varies.
5. Given the planner flag is off, when rendered, then neither the planner section nor its contents link appears.
6. Given the page, when searched, then no salary figure, university requirement figure or university logo appears.
7. Given the university paragraph, when read, then it contains no "APS" or "matric".
8. Given the planner section is on, when read, then it explains closest-first ordering and the biggest-single-gap rule, and contains no "matching" or recommendation claim.
9. Given the planner mock, when inspected, then it is badged "Example" and shows no real university's requirement figures.

## Production readiness

- Security: static, no input, no external embeds. Outbound links (if any) use `rel="noopener"` and are listed in the content file for review.
- Performance: prerendered, no client JS beyond `CtaLink`; route under 40 KB gzip; long-form text with system font; LCP is the h1.
- Resilience: no runtime dependencies.
- Observability: events `careers_contents_clicked` {section}, `careers_cta_clicked`; consent-gated; Sentry tag `route:/universities-and-careers`.
- Accessibility (WCAG 2.2 AA): table has a caption and header cells; card fallback keeps label and value pairs; numbers use tabular-nums; contents rail does not obscure focused headings.
- Privacy and POPIA: no data collected.
- SEO: the most search-worthy marketing page; canonical; sitemap entry; OG image; `Article` JSON-LD is not used (no author or date claims); headings phrased as the questions people search ("How APS works").
- Rollout: page ships in Phase 3 without the planner section; `marketingCareersPlanner` turns it on in Phase 7. Rollback by flag or Vercel instant rollback.
- Monitoring: Sentry route alert; Speed Insights; Lighthouse CI entry; a yearly content review reminder before the application season (calendar task owned by the content owner).

## Build tasks

- [ ] **PG-MKT-CAREERS-01** APS explainer prose and NSC scale table with card fallback
- [ ] **PG-MKT-CAREERS-02** University readiness ("More than a number") and career pathways sections
- [ ] **PG-MKT-CAREERS-03** How the planner works section (flag-gated, with honesty line)
- [ ] **PG-MKT-CAREERS-04** `computeApsExample` pure function in `features/marketing/lib/aps-example.ts`
- [ ] **PG-MKT-CAREERS-05** Worked example component rendering the function output
- [ ] **PG-MKT-CAREERS-06** "Each university sets its own rules" callout including Life Orientation variation
- [ ] **PG-MKT-CAREERS-07** `PageContents` anchor component with focus management (shared with legal)
- [ ] **PG-MKT-CAREERS-08** `content/universities-and-careers.ts`
- [ ] **PG-MKT-CAREERS-09** `marketingCareersPlanner` flag handling
- [ ] **PG-MKT-CAREERS-10** Metadata, canonical, `opengraph-image.tsx`, sitemap entry
- [ ] **PG-MKT-CAREERS-11** Analytics events through `track()`
- [ ] **PG-MKT-CAREERS-12** Planner reach rules copy (closest first, biggest single gap, deadline flags) checked against the FE-60 port
- [ ] **PG-MKT-CAREERS-13** `planner-mock.tsx` static mock drawn from the rebuilt career page, badged "Example"

## Quality tasks

- [ ] **PG-MKT-CAREERS-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-CAREERS-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-CAREERS-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-CAREERS-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-CAREERS-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-CAREERS-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against `web/marketing/claims-ledger.md`
- [ ] **PG-MKT-CAREERS-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-CAREERS-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-CAREERS-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-CAREERS-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-CAREERS-Q11** Factual review of the APS explanation against a current official source, recorded in the content file with the date checked
- [ ] **PG-MKT-CAREERS-Q12** Monitoring wired: Sentry route alert, Speed Insights, Lighthouse CI entry
- [ ] **PG-MKT-CAREERS-Q13** Banned-claims unit test over the content module, including "matching" and salary phrases

## Tests

Unit (`aps-example.test.ts`):
- "maps boundary marks to the right NSC level"
- "excludes Life Orientation"
- "sums the best six of seven or more subjects"
- "worked example totals 33"
- "rejects marks outside 0 to 100"

Playwright (`web/e2e/marketing-careers.spec.ts`):
- "scale shows as cards at 360 and a table at 1440"
- "contents link focuses the section heading"
- "planner section hidden when the flag is off"
- "no salary or requirement figures"
- "axe clean in light and dark"
- "planner section explains the biggest single gap and shows an Example mock"

## Open questions

- Should `computeApsExample` and the product APS function (BE-CAR-06) share one fixture file across the api and web repos, or is a duplicated fixture with a cross-check note enough?
- Who signs off the factual APS content each year (Q11)?
