# Wellbeing insights

| | |
|---|---|
| ID | `PG-PAR-WELL` |
| Route | `/parent/wellbeing` (`?child={studentId}` selects a child) |
| Phase | 8 |
| Roles | parent |
| Stages | high school, university (copy is stage-neutral; guidance differs slightly, see Stage variants) |
| Entitlement | free (decision 13; 43f9faa kept the wellbeing summary in the free parent baseline). No `parent-insights` gate in v1 |
| Depends on | BE-FAM-06, BE-FAM-08, BE-WEL-06, BE-WEL-08, BE-WEL-09, UI-27 (chart wrappers), FE-24, PG-PAR-CHILD-05 (`PrivacyBoundaryCard`) |
| Old app reference | `43f9faa:web/src/app/(app)/parent/wellbeing/page.tsx` (one card per child with "Average mood: 3.8 / 5" and a "No mood check-ins yet" state, but the chart line was still generated with `Math.random`; only the average and the empty state carry over), `43f9faa:web/src/app/(app)/parent/layout.tsx` (no plan gate on the parent area) |
| Status | Not started (0 of 37 tasks, 2 deferred: PG-PAR-WELL-10, PG-PAR-WELL-14) |

## Purpose

Show each linked child's shared wellbeing trend (weekly mood and stress averages) with calm, non-clinical guidance on what the trend might mean and when to reach out. Only data the student explicitly chose to share is shown, aggregated so no single check-in can be read off the chart. No diary content, no notes, no individual check-in values, ever.

## User stories

- As a parent, I see whether my child's shared mood has been steady, lower than usual or improving over the last 8 weeks.
- As a parent, I get gentle guidance written for a non-expert adult, including when to talk and where to get help.
- As a parent of two children, I can switch between them and see who has not shared, without that feeling like a failure.
- As a parent who is worried, I can reach South African support lines immediately.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Wellbeing", description "Trends your children have chosen to share with you."
2. Child selector: segmented control of child first names (scrolls horizontally inside its own container, never the page) when there are 2 or more children; hidden for one child. Selection writes `?child=`.
3. Summary card (magenta zone surface): one sentence summary ("Thandi's mood has been steady for the last 8 weeks."), period label "Last 8 weeks", "Based on {n} check-ins" (total, never per day).
4. Trend chart: two lines (Mood, Stress), weekly points on a 1 to 5 scale with labels "Low" and "High"; gaps where the week had too few check-ins; latest point emphasised; legend with text. Height 220px.
5. Guidance card: heading "What this might mean", 2 to 3 short paragraphs chosen by `summary` code, then "Ways to help" list (3 items).
6. "When to reach out" card: plain signs to watch for and the line "If you think {firstName} is in danger, call 10111 or go to your nearest emergency room."
7. Support resources list from BE-WEL-08 (name, phone as a `tel:` link, hours).
8. `PrivacyBoundaryCard`.

### Desktop (1440px)

- Header row; child selector as tabs under the header.
- Two columns: left 8/12 holds summary and chart (chart height 320px); right 4/12 holds guidance, when to reach out and resources stacked.
- Privacy boundary card full width at the bottom.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/parent/wellbeing/page.tsx` | server | `requireRole("parent")`; entitlement check before any wellbeing call |
| Loading | `web/src/app/(app)/parent/wellbeing/loading.tsx` | server | summary and chart skeleton |
| Error | `web/src/app/(app)/parent/wellbeing/error.tsx` | client | `PageState` retry; Sentry tag `PG-PAR-WELL` |
| ParentWellbeingView | `web/src/features/family/components/parent-wellbeing-view.tsx` | server | selects child, composes cards |
| ChildSelector | `web/src/features/family/components/child-selector.tsx` | client | segmented control writing `?child=` via `router.replace`; shared with PG-PAR-ACTIVITY and PG-PAR-CELEB |
| WellbeingSummaryCard | `web/src/features/family/components/wellbeing-summary-card.tsx` | server | code to sentence |
| SharedTrendChart | `web/src/features/family/components/shared-trend-chart.tsx` | client | wraps `LineChart` from `components/common/charts.tsx`; magenta and graphite tokens; nulls drawn as gaps; text summary and visually hidden table; also used by PG-PAR-CHILD |
| GuidanceCard | `web/src/features/family/components/guidance-card.tsx` | server | copy from `wellbeing-guidance.ts` |
| ReachOutCard | `web/src/features/family/components/reach-out-card.tsx` | server | static copy plus emergency number |
| SupportResourcesList | `web/src/features/family/components/support-resources-list.tsx` | server | BE-WEL-08 |
| Guidance copy | `web/src/features/family/lib/wellbeing-guidance.ts` | shared | per summary code and stage |
| Loaders | `web/src/features/family/server/get-child-wellbeing.ts`, `web/src/features/wellbeing/server/get-support-resources.ts` | server | |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/family/children` (BE-FAM-06) | GET | `studentId`, `displayName`, `sharing.wellbeingTrend` | none shared |
| `/family/children/{id}/wellbeing?window=8w` (BE-FAM-08) | GET | `shared`, `summary` (`steady`, `lower_than_usual`, `improving`, `not_enough_data`), `points[]` (`weekStart`, `moodAvg`, `stressAvg`, both 1 to 5 or null), `totalCheckins`, `minCheckinsPerPoint` | none shared |
| `/wellbeing/support-resources` (BE-WEL-08) | GET | `items[]` (`name`, `phone`, `hours`, `url`, `audience`) | `"use cache"`, `cacheLife("days")`, tag `wellbeing:resources` |

The API (BE-WEL-09 query, BE-FAM-08 endpoint) applies the k-minimum: a week with fewer than `minCheckinsPerPoint` check-ins returns nulls. The web never receives individual check-ins.

### Mutations

None. Sharing is controlled only by the student (PG-CMN-SETTINGS privacy section, BE-FAM-11).

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | first render or child switch | "Loading wellbeing trend" | skeleton |
| No children | no links | Title "No children linked yet". Body "Once your child accepts your invite and chooses to share, their wellbeing trend shows here." | "Invite a child" |
| Not shared (selected child) | `shared` false | Title "{firstName} has not shared their wellbeing trend". Body "Sharing is always their choice. If you are worried, a calm conversation is the best place to start. The resources below can help." | resources list still shown |
| Never checked in | shared, `totalCheckins = 0` | "No mood check-ins yet." | none |
| Not enough data | `summary` `not_enough_data` | Title "Not enough check-ins yet". Body "A trend appears once {firstName} has checked in a few times a week." | none |
| Error | wellbeing call fails | Title "We could not load the wellbeing trend". Body "Check your connection and try again." | "Try again" |
| Forbidden | non-parent | proxy redirect | |
| Unknown child in `?child=` | id not in the family | falls back to the first child; no error copy | |
| Populated | shared with points | as layout | |

## Stage variants

- Copy on this page is stage-neutral (mood and stress apply to everyone).
- Guidance examples differ: high school guidance can mention exam season and SBA deadlines as common stress points; university guidance mentions test weeks, assignment clusters and living away from home. Both live in `wellbeing-guidance.ts` keyed by `stage`.
- Support resources may carry an `audience` field (for example a student-focused line); the list shows all resources to every parent.

## Interactions and edge cases

- Student turns off sharing mid-session: the next child switch or refresh shows the not-shared state.
- Student unlinks: the child disappears from the selector; a stale `?child=` falls back to the first child.
- Only one child and not shared: no selector; the not-shared state fills the page above the resources.
- Week boundaries are Monday to Sunday in Africa/Johannesburg, computed by the API.
- All nulls but `totalCheckins` above zero: treated as not enough data.
- Stress scale direction: higher means more stressed; the legend says so in words to avoid misreading.
- `tel:` links use the number as given by BE-WEL-08; no hardcoded numbers in the component except the emergency line 10111 in copy (open question: move it into BE-WEL-08 too).
- Guidance never diagnoses, never uses clinical terms (depression, anxiety disorder), never suggests reading the child's diary or phone.

## Copy

- h1 "Wellbeing"; description "Trends your children have chosen to share with you."
- Summary sentences:
  - steady: "{firstName}'s mood has been steady for the last 8 weeks."
  - lower_than_usual: "{firstName}'s mood has been lower than usual for the last 2 weeks."
  - improving: "{firstName}'s mood has been improving over the last few weeks."
- Chart legend: "Mood (higher is better)", "Stress (higher is more stressed)". Axis labels "Low", "High".
- Guidance heading "What this might mean"; "Ways to help": "Ask open questions about their week, not just their marks.", "Make time for something you enjoy together.", "Let them know they can talk to you without being judged."
- Reach out heading "When to reach out"; body "Get help if {firstName} talks about feeling hopeless, stops doing things they used to enjoy for more than two weeks, or mentions hurting themselves." Emergency: "If you think {firstName} is in danger, call 10111 or go to your nearest emergency room."
- Resources heading "Support in South Africa".

## Acceptance criteria

- AC-01 Given an entitled parent and a child who shares wellbeing, when the page opens, then a summary sentence, an 8-week two-line chart with a text alternative, guidance and resources render.
- AC-02 Given weeks below the check-in minimum, when the chart renders, then those weeks are gaps and no value for them exists in the DOM or payload.
- AC-04 Given a child who has not shared, when selected, then the not-shared copy shows, the resources list shows, and no chart renders.
- AC-05 Given two children, when the parent switches child, then `?child=` updates, the back button returns to the previous child, and only that child's data loads.
- AC-06 Given any state, when inspected, then no diary text, note, or individual check-in value is present.
- AC-07 Given the page source and bundle, when searched, then `Math.random` does not appear in any family feature file.
- AC-08 Given a `tel:` resource, when tapped on mobile, then the dialler opens with the number.

## Production readiness

### Security
- [ ] Entitlement checked server-side before calling BE-FAM-08; the API also enforces entitlement and sharing (defence in depth). PG-PAR-WELL-Q16.
- [ ] Cross-family `?child=` id returns no data (falls back to own first child); E2E asserts payload. PG-PAR-WELL-Q16.

### Privacy and POPIA
- [ ] k-minimum aggregation enforced by the API and asserted by a contract test; web never computes averages. PG-PAR-WELL-Q17.
- [ ] POPIA gives children's information and health-related information extra protection (sections 26 and 34), so wellbeing data is shown only with the student's sharing flag and the parent consent recorded (BE-FAM-14). PG-PAR-WELL-Q17.
- [ ] No wellbeing values in analytics props, logs or Sentry context. PG-PAR-WELL-Q18.

### Performance
- [ ] Chart is a client leaf loaded with `next/dynamic` and a fixed-height placeholder (no CLS); route JS under 150 KB gzip; LCP (summary card) under 2.5 s mobile. PG-PAR-WELL-Q19.

### Resilience
- [ ] Resources list loads independently (own `<Suspense>`); if BE-WEL-08 fails, a static fallback line shows "Call 10111 in an emergency." so help is never missing. PG-PAR-WELL-12.

### Observability
- [ ] Analytics: `parent_wellbeing_viewed` (props `state`: shared, not_shared, not_enough_data), `parent_wellbeing_child_switched`, `parent_support_resource_tapped` (prop `resourceName`, a public org name). PG-PAR-WELL-Q18.
- [ ] Sentry boundary tagged `PG-PAR-WELL`. PG-PAR-WELL-Q18.

### Accessibility
- [ ] WCAG 2.2 AA: chart has a text summary and a visually hidden table; lines differ by dash pattern as well as colour; selector is a radio group with arrow-key support. PG-PAR-WELL-Q20.

### Rollout
- [ ] Behind `flags.parentTrack`; copy reviewed by a counsellor or psychologist before the flag turns on in prod (human sign-off task). PG-PAR-WELL-Q21.

### Monitoring and alerts
- [ ] Alert on BE-FAM-08 5xx above 1% in 15 minutes; dashboard tile for share rate (percentage of links with wellbeing shared), aggregate only. PG-PAR-WELL-Q22.

## Build tasks

- [ ] **PG-PAR-WELL-01** Per-child mood and stress trend (real data, replaces `Math.random` chart): page composition in `parent-wellbeing-view.tsx`
- [ ] **PG-PAR-WELL-02** Gentle guidance and when to reach out (`GuidanceCard`, `ReachOutCard`)
- [ ] **PG-PAR-WELL-03** Not-shared state per child
- [ ] **PG-PAR-WELL-04** `get-child-wellbeing.ts` loader (BE-FAM-08, zod parse, nulls kept)
- [ ] **PG-PAR-WELL-05** `ChildSelector` client component writing `?child=` (shared with activity and celebrations)
- [ ] **PG-PAR-WELL-06** `WellbeingSummaryCard` with code to sentence mapping and check-in total
- [ ] **PG-PAR-WELL-07** `SharedTrendChart` on `LineChart`: two series, gaps for null, latest point emphasised, legend text, text summary, hidden table
- [ ] **PG-PAR-WELL-08** `wellbeing-guidance.ts` copy per summary code and stage
- [ ] **PG-PAR-WELL-09** `SupportResourcesList` from BE-WEL-08 with `tel:` links
- [ ] **PG-PAR-WELL-10** Upgrade state via `UpgradeGate` with entitlement check before data calls *(deferred: decision 13, parent insights are free in v1; no plan gate)*
- [ ] **PG-PAR-WELL-11** Not-enough-data and no-children states
- [ ] **PG-PAR-WELL-12** Independent `<Suspense>` for resources with static emergency fallback
- [ ] **PG-PAR-WELL-13** Desktop two-column layout
- [ ] **PG-PAR-WELL-14** Gating switch on the `parent-insights` feature key *(deferred: decision 13, parent insights are free in v1; no plan gate)*
- [ ] **PG-PAR-WELL-15** Average line in the summary card ("Average mood 3.8 out of 5 over the last 8 weeks", from an API `moodAvg8w` field) and the old "No mood check-ins yet" copy for a child who shares but has never checked in

## Quality tasks

- [ ] **PG-PAR-WELL-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-PAR-WELL-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-PAR-WELL-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (none: confirm)
- [ ] **PG-PAR-WELL-Q04** Empty state with one clear next action
- [ ] **PG-PAR-WELL-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-PAR-WELL-Q06** Forbidden state (no upgrade state: the page is free, decision 13)
- [ ] **PG-PAR-WELL-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-PAR-WELL-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-PAR-WELL-Q09** Layout at 1440px
- [ ] **PG-PAR-WELL-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-PAR-WELL-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-PAR-WELL-Q12** axe: zero violations in light and dark
- [ ] **PG-PAR-WELL-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-PAR-WELL-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-PAR-WELL-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-PAR-WELL-Q16** Security: server-side entitlement check before data; cross-family `?child=` E2E
- [ ] **PG-PAR-WELL-Q17** Privacy: k-minimum contract test; consent and sharing preconditions verified
- [ ] **PG-PAR-WELL-Q18** Observability without PII: three analytics events, Sentry tags, no values in logs
- [ ] **PG-PAR-WELL-Q19** Performance: dynamic chart import with fixed placeholder, LCP and JS budget measured
- [ ] **PG-PAR-WELL-Q20** WCAG 2.2 AA: chart alternatives, non-colour series distinction, radio-group selector
- [ ] **PG-PAR-WELL-Q21** Rollout: flag gate plus documented professional copy sign-off before prod
- [ ] **PG-PAR-WELL-Q22** Monitoring: BE-FAM-08 5xx alert and aggregate share-rate tile

## Tests

### Unit (Vitest)
- `features/family/components/shared-trend-chart.test.tsx`: nulls render as gaps; text summary present; hidden table rows match non-null points.
- `features/family/lib/wellbeing-guidance.test.ts`: every code has copy for both stages; no clinical terms (word list).
- `features/family/components/child-selector.test.tsx`: arrow keys move selection; URL updated.
- `features/family/components/support-resources-list.test.tsx`: `tel:` hrefs; fallback line on error.

### Playwright (`web/tests/e2e/parent/wellbeing.spec.ts`)
- `entitled parent sees shared trend with guidance`
- `weeks below minimum are gaps with no values in payload`
- `parent on the free plan sees the shared trend`
- `child not shared shows respectful copy and resources`
- `switching child updates url and history`
- `cross-family child param falls back to own child` (security)
- `support resources still render when trend fails`
- axe light and dark at 360 and 1440

## Open questions

- Minimum check-ins per weekly point (3 assumed) and the 8-week window need confirming with BE-FAM-08.
- Should the emergency number and the "when to reach out" copy come from BE-WEL-08 so they can be updated without a deploy?
- Decided (35): wellbeing guidance copy needs professional sign-off and the helpline numbers a phone check before prod. Who signs off is a fact still owed (DECISIONS F).
- Decided (13): free, as at 43f9faa. The switch (PG-PAR-WELL-14) stays, default off.
- The 8-week average needs a `moodAvg8w` field on BE-FAM-08 (k-minimum applies: null when too few check-ins).
