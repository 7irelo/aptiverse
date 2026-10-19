# Parent dashboard

| | |
|---|---|
| ID | `PG-PAR-DASH` |
| Route | `/parent` |
| Phase | 8 |
| Roles | parent |
| Stages | high school, university (per child; one family can hold both) |
| Entitlement | free, including the wellbeing line (decision 13; 43f9faa made the whole baseline parent area free: overview, wellbeing summary, links, settings, billing). No `parent-insights` gate in v1 |
| Depends on | BE-FAM-06, BE-FAM-07, BE-FAM-08 (wellbeing line), BE-FAM-14 (consent flag), BE-BIL-14 (seat flag), BE-IDN-28 (`/me`), SHL-03, SHL-05, UI-20, UI-21, UI-22, UI-23, UI-33, FE-24, FE-63, PG-CMN-NOTIF-03 (`lib/format/date.ts`) |
| Old app reference | `43f9faa:web/src/app/(app)/parent/page.tsx` (linked and pending counts only; no real insight), `43f9faa:web/src/app/(app)/parent/layout.tsx` (role-gated only; the earlier whole-area plan gate was removed so a parent can always reach the dashboard and Billing), `43f9faa:web/src/app/(app)/parent/[...unmatched]/page.tsx` (unknown parent URLs stay inside the shell) |
| Status | Not started (0 of 42 tasks, 1 deferred: PG-PAR-DASH-19) |

## Purpose

Give a parent a calm, honest read on every linked child in one glance: is each child on track academically, how are they doing in the wellbeing trend they chose to share, and is there one thing that needs the parent's attention. Insight, not surveillance: nothing here reveals diary content, individual check-in notes, chat messages or raw practice answers.

## User stories

- As a parent with one child, I open the app and see in under five seconds whether my child is on track, without reading charts.
- As a parent with a Grade 9 child and a second-year university child, I see each child described in the words of their own stage (subjects and Grade for one, courses and year of study for the other).
- As a parent, I see a short, specific "needs attention" line (for example an assessment due tomorrow with no submission) and one link to the detail.
- As a parent whose child has not shared their wellbeing trend, I see that plainly and respectfully, with no pressure on the child.
- As a new parent with no linked children, I get one clear action: invite my child.
- As a parent whose invite is still pending, I see that it is waiting and can resend it from the children page.

## Layout

### Mobile (360px)

Single column, 16px gutters, cards full width, ordered top to bottom:

1. `PageHeader`: h1 "Hello, {firstName}", description "Here is how your children are doing this week."
2. Consent banner (only when any child under 18 still needs parent consent, BE-FAM-14): one line plus "Give consent" link to `/parent/students#consent`.
3. Child cards, one per active link, ordered by display name. Each card, top to bottom:
   - Avatar (initials), display name, stage line ("Grade 11, NSC" or "2nd year, University of Pretoria").
   - Academic standing chip: On track (forest), Keep an eye on (terracotta), Needs attention (terracotta, stronger), No marks yet (neutral). Chip text always present; colour never carries meaning alone.
   - Standing reason, one sentence from the overview (for example "Average across 6 subjects is steady at 68%.").
   - Wellbeing line (magenta zone) when shared: "Wellbeing: steady this week" or "Wellbeing: not shared". Free for every parent (decision 13); no upsell line.
   - Needs attention list: at most 2 items, each a link row with a Lucide icon and 44px height.
   - Plan badge when the child is not covered by the parent's plan seat: "Not on your plan" linking to billing.
   - Footer link "View {firstName}" to `/parent/students/{studentId}`.
4. Pending invites summary card (only when invites are pending): "{n} invite waiting" plus "Manage invites" link to `/parent/students`.
5. Quick links row (wrap): Celebrations, Wellbeing, Activity. Each a 44px link.

### Desktop (1440px)

- `PageShell` max width, sidebar from the shell on the left.
- Header row: h1 and description left, "Invite a child" secondary button right.
- Consent banner full width under the header.
- Child cards in a 2 column grid (3 columns when the family has 3 or more children and width allows); cards equal height, needs-attention list shows up to 3 items.
- Right rail (320px) at `xl`: pending invites card, then a "This week" card with the 3 most recent celebrations across children (from BE-FAM-09, linking to `/parent/celebrations`).
- Quick links row hidden at `lg` and up (the sidebar covers it).

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/parent/page.tsx` | server | `requireRole("parent")`, renders header and `<Suspense>` around the card grid |
| Loading | `web/src/app/(app)/parent/loading.tsx` | server | `PageLoading cards={2}` shaped like child cards |
| Error | `web/src/app/(app)/parent/error.tsx` | client | `PageState` error with retry; reports to Sentry with `page: PG-PAR-DASH` |
| ParentDashboardView | `web/src/features/family/components/parent-dashboard-view.tsx` | server | composes banner, grid, rail |
| ChildSummaryCard | `web/src/features/family/components/child-summary-card.tsx` | server | pure presentation from a typed view model; reused by PG-PAR-CHILDREN |
| StandingChip | `web/src/features/family/components/standing-chip.tsx` | server | maps standing code to label, icon, token colour |
| StageLine | `web/src/features/family/components/stage-line.tsx` | server | high school vs university wording; single source for all parent pages |
| NeedsAttentionList | `web/src/features/family/components/needs-attention-list.tsx` | server | code to copy mapping, max items prop |
| WellbeingLine | `web/src/features/family/components/wellbeing-line.tsx` | server | shared, not shared, not enough data, no entitlement |
| ConsentBanner | `web/src/features/family/components/consent-banner.tsx` | server | renders only when a child flags `parentConsentRequired` |
| PendingInvitesCard | `web/src/features/family/components/pending-invites-card.tsx` | server | count only, links to children page |
| RecentCelebrationsCard | `web/src/features/family/components/recent-celebrations-card.tsx` | server | desktop rail, 3 items |
| Loader: children | `web/src/features/family/server/get-children.ts` | server | BE-FAM-06, zod parsed, React `cache()` |
| Loader: overview | `web/src/features/family/server/get-child-overview.ts` | server | BE-FAM-07 per child, run in parallel with `Promise.all`, per-child failure isolated |
| Loader: dashboard model | `web/src/features/family/server/get-parent-dashboard.ts` | server | joins children, overviews, wellbeing summaries into view models |
| View-model mapper | `web/src/features/family/lib/to-child-summary.ts` | shared | pure, unit tested; no React |
| Standing copy map | `web/src/features/family/lib/standing-copy.ts` | shared | code to label and sentence, stage-aware |
| Empty state | `EmptyState` from `web/src/components/common/empty-state.tsx` | server | no children |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/family/children` (BE-FAM-06) | GET | `items[].linkId`, `studentId`, `displayName`, `stage` (`high_school` or `tertiary`), `grade`, `curriculum` (`nsc` or `ieb`), `yearOfStudy`, `institutionName`, `linkStatus`, `sharing.academics`, `sharing.wellbeingTrend`, `sharing.celebrations`, `sharing.activity`, `seat.covered`, `seat.endsAt`, `parentConsentRequired`; `pendingInviteCount` | none shared; per request, React `cache()` |
| `/family/children/{id}/overview` (BE-FAM-07) | GET | `standing` (`on_track`, `watch`, `needs_attention`, `no_evidence`), `standingReason` (code plus params), `unitCount`, `averagePct` (nullable), `needsAttention[]` (`code`, `unitName`, `assessmentId`, `dueAt`), `lastActiveOn` (date only) | none shared |
| `/family/children/{id}/wellbeing?window=7d` (BE-FAM-08) | GET | `shared`, `summary` (`steady`, `lower_than_usual`, `improving`, `not_enough_data`) only | none shared; skipped when `sharing.wellbeingTrend` is false |
| `/family/children/{id}/celebrations?limit=3` (BE-FAM-09) | GET | `items[].kind`, `occurredAt`, `params` | none shared; desktop rail only, loaded in its own `<Suspense>` |
| `/me` (BE-IDN-28) | GET | `firstName` | session |

The dashboard needs one call per child for overview. With 4 children that is 1 + 4 + up to 4 wellbeing calls, all parallel. If BE-FAM-07 grows a batch form (`GET /family/overview`), switch to it (open question).

### Mutations

None on this page. Invites, unlinking and consent happen on PG-PAR-CHILDREN.

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | first render | Screen reader: "Loading your children" | skeleton cards |
| Empty: no children, no invites | `items` empty and `pendingInviteCount` 0 | Title "Link your first child". Body "Invite your child to Aptiverse. Once they accept, you will see how they are doing here." | Button "Invite a child" to `/parent/students?invite=1` |
| Empty: only pending invites | `items` empty, `pendingInviteCount` above 0 | Title "Waiting for your child". Body "Your invite has been sent. When your child accepts it, their progress shows up here." | Link "Manage invites" |
| Error (whole page) | children call fails | Title "We could not load your children". Body "Check your connection and try again. If it keeps happening, contact support from the Help page." | Button "Try again" |
| Error (one child) | that child's overview fails | On the card: "We could not load {firstName}'s progress right now." | Inline link "Try again" (refreshes) |
| Forbidden | non-parent role reaches `/parent` | proxy redirects by role; if rendered: Title "This page is for parents". Body "You are signed in as a student. Your dashboard is here." | Link to the role home |
| No evidence | `standing` is `no_evidence` | Chip "No marks yet". Reason "{firstName} has not logged any marks yet. Standing appears once they do." | none |
| Academics not shared | `sharing.academics` false | Chip hidden. Line "{firstName} has chosen not to share academic progress." | none (never nudge the parent to pressure) |
| Wellbeing not shared | `sharing.wellbeingTrend` false | "Wellbeing: not shared" | none |
| Wellbeing not enough data | `summary` `not_enough_data` | "Wellbeing: not enough check-ins this week" | none |
| Consent needed | `parentConsentRequired` | Banner "{firstName} is under 18 and needs your consent to keep using Aptiverse." | Link "Give consent" |
| Seat not covered | `seat.covered` false | Badge "Not on your plan" | link to `/parent/billing` |
| Seat ending | `seat.endsAt` set | Badge "Plan ends {date}" | link to `/parent/billing` |
| Populated | at least one active link | as layout | |

## Stage variants

- High school child: stage line "Grade {grade}, {NSC or IEB}". Standing reason uses "subjects" and "average". Needs-attention items may mention SBA tasks ("SBA task due tomorrow: Life Sciences practical"). APS is not shown on the dashboard (it lives on child detail, Grades 10 to 12 only).
- University child: stage line "{ordinal} year, {institutionName}". Standing reason uses "courses" and "average". No Grade, SBA, APS, NSC or matric words anywhere on that card.
- Mixed families: each card uses its own child's vocabulary; page level copy stays stage-neutral ("your children", "progress", "marks").
- The mapper `to-child-summary.ts` takes `stage` and is the only place wording is chosen; a unit test asserts no high-school words appear in a tertiary card model and the reverse.

## Interactions and edge cases

- Child unlinked by the student while the parent has the page open: next render drops the card; any stale link to that child lands on PG-PAR-CHILD not-linked state.
- Student revokes academic or wellbeing sharing: the next request returns `sharing.* = false`; the card shows the not-shared line. No cached copy of earlier data is shown (no shared cache exists for this data).
- Child account deleted (POPIA deletion): link disappears from BE-FAM-06; no tombstone card.
- Child switches stage (finishes Grade 12 and starts university): stage line and vocabulary follow the new `stage`; past data is the student's business and not summarised across stages here.
- Seat removed by the parent: card stays (link is independent of billing); badge shows "Plan ends {date}" until period end, then "Not on your plan".
- Payment past due on the parent's plan: the shell banner from PG-BIL-MANAGE covers it; this page adds nothing alarming.
- More than 4 children (allowed by links even if the largest plan covers 4): grid simply grows; seat badges explain coverage.
- Display names: show the student's chosen display name; never the email.
- `lastActiveOn` is a date, never a time, so the parent cannot track minute-level activity.
- Time zone: Africa/Johannesburg for "due tomorrow" calculations, done server-side.
- No plan gate on the parent area (43f9faa rule): a parent without any plan must still reach this dashboard and Billing. Parent insights carry no gate in v1 (decision 13); a future paid extra would gate itself in place with `UpgradeGate`, never in `(app)/parent/layout.tsx`.
- Unknown `/parent/*` URLs render the not-found state inside the app shell (old `[...unmatched]` route), not the bare root 404.

## Copy

- h1: "Hello, {firstName}"
- Description: "Here is how your children are doing this week."
- Standing chips: "On track", "Keep an eye on", "Needs attention", "No marks yet".
- Standing reasons (examples, final wording lives in `standing-copy.ts`):
  - on_track: "Average across {n} subjects is steady at {pct}%." / university: "Average across {n} courses is steady at {pct}%."
  - watch: "{unitName} marks dropped since last month."
  - needs_attention: "{count} assessments are overdue."
  - no_evidence: "{firstName} has not logged any marks yet. Standing appears once they do."
- Needs-attention rows: "Due tomorrow: {title}", "Overdue: {title}", "No activity in 2 weeks".
- Wellbeing line: "Wellbeing: steady this week", "Wellbeing: lower than usual this week", "Wellbeing: improving this week", "Wellbeing: not enough check-ins this week", "Wellbeing: not shared".
- Card link: "View {firstName}".
- Consent banner: "{firstName} is under 18 and needs your consent to keep using Aptiverse." Link "Give consent".

## Acceptance criteria

- AC-01 Given a parent with two linked children, when they open `/parent`, then two cards render in display-name order, each with a stage line and a standing chip with text.
- AC-02 Given a child at high school and a child at university, when the dashboard renders, then the high-school card says "subjects" and "Grade" and the university card says "courses" and "year" and neither contains the other's words.
- AC-03 Given a child with no marks, when the card renders, then the chip reads "No marks yet" and no percentage or zero appears.
- AC-04 Given a child who has not shared wellbeing, when the card renders, then it reads "Wellbeing: not shared" and the wellbeing endpoint is not called.
- AC-06 Given a parent with no links and no invites, when they open `/parent`, then the empty state shows with one "Invite a child" button.
- AC-07 Given one child's overview call fails, when the page renders, then the other cards render normally and the failed card shows its inline retry.
- AC-08 Given a student signed in, when they request `/parent`, then they are redirected to `/dashboard` and no family endpoint is called.
- AC-09 Given a child under 18 without parent consent, when the dashboard renders, then the consent banner shows with a working link.
- AC-10 Given a child not covered by a plan seat, when the card renders, then the "Not on your plan" badge links to `/parent/billing`.
- AC-11 Given the student turns off academic sharing, when the parent reloads, then no standing chip, percentage or unit name for that child appears.
- AC-12 Given any card, when inspected, then no diary text, check-in note, chat text or exact timestamp of activity appears.

## Production readiness

### Security
- [ ] Role check in `page.tsx` (`requireRole("parent")`) and in `proxy.ts`; the API independently enforces link and consent scope (BE-FAM-13). Delivered by PG-PAR-DASH-Q16.
- [ ] No child data from one family can render for another: loader passes only the session token, never a parent id from the URL or client. PG-PAR-DASH-Q16.
- [ ] No PII in URLs (child ids are opaque Guid v7; no names or emails in query strings) and none in logs or Sentry breadcrumbs (names scrubbed by `beforeSend`). PG-PAR-DASH-Q17.

### Privacy and POPIA
- [ ] Data minimisation: the dashboard requests only `summary` from wellbeing, never points or notes; overview returns codes, not raw marks lists. PG-PAR-DASH-Q18.
- [ ] Minors: consent banner is driven by BE-FAM-14; until consent is given, the API returns only the link and the banner, no academic data. PG-PAR-DASH-14.

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile with 4 children; overview calls run in parallel; the rail streams in its own `<Suspense>`. PG-PAR-DASH-Q19.
- [ ] Route JS under 150 KB gzip: all cards are Server Components; no chart library on this page. PG-PAR-DASH-Q19.

### Resilience
- [ ] Per-child failure isolation (one failed overview never blanks the page). PG-PAR-DASH-11.
- [ ] API timeout of 5 s per overview call through `fetcher.ts`; on timeout the card shows its inline error. PG-PAR-DASH-11.

### Observability
- [ ] Sentry boundary in `error.tsx` tagged `page: PG-PAR-DASH`, `role: parent`; traceparent forwarded to the API. PG-PAR-DASH-Q20.
- [ ] Analytics: `parent_dashboard_viewed` (props: `childCount`, `mixedStage` boolean), `parent_child_card_opened` (props: `stage`), `parent_needs_attention_clicked` (props: `code`). No ids or names. PG-PAR-DASH-Q20.

### Accessibility
- [ ] WCAG 2.2 AA: chips carry text, not colour alone; card headings are h2; each card is a `section` with `aria-labelledby`; focus never hidden under the mobile bottom nav (2.4.11). PG-PAR-DASH-Q13, PG-PAR-DASH-Q21.

### Rollout
- [ ] Parent area behind `flags.parentTrack` (server-checked in `(app)/parent/layout.tsx`); off means parents see a holding page and nav hides parent items. Rollback is flipping the flag. PG-PAR-DASH-Q22.

### Monitoring and alerts
- [ ] Sentry alert when `PG-PAR-DASH` errors exceed 1% of views in 15 minutes; API alert on BE-FAM-07 p95 above 800 ms. PG-PAR-DASH-Q23.

## Build tasks

- [ ] **PG-PAR-DASH-01** Child cards: on-track status, wellbeing read (if shared), needs-attention (composition in `parent-dashboard-view.tsx`; parts below)
- [ ] **PG-PAR-DASH-02** Mixed-stage handling (labels per child's stage) via `stage-line.tsx` and stage-aware `standing-copy.ts`
- [ ] **PG-PAR-DASH-03** No children empty state (invite CTA), plus the pending-only variant
- [ ] **PG-PAR-DASH-04** `get-children.ts` loader: BE-FAM-06 through the generated client, zod parse, React `cache()`
- [ ] **PG-PAR-DASH-05** `get-child-overview.ts` loader: BE-FAM-07, 5 s timeout, returns a typed error result per child instead of throwing
- [ ] **PG-PAR-DASH-06** `get-parent-dashboard.ts`: parallel overview and wellbeing-summary calls, skip wellbeing when not shared or not entitled
- [ ] **PG-PAR-DASH-07** `to-child-summary.ts` pure mapper from API shapes to the card view model
- [ ] **PG-PAR-DASH-08** `ChildSummaryCard` presentation (avatar, name, stage line, chip, reason, footer link)
- [ ] **PG-PAR-DASH-09** `StandingChip` with code to label, Lucide icon and token colour (forest, terracotta, neutral)
- [ ] **PG-PAR-DASH-10** `NeedsAttentionList` with code to copy mapping and max-items prop (2 mobile, 3 desktop)
- [ ] **PG-PAR-DASH-11** Per-child inline error and retry inside the card
- [ ] **PG-PAR-DASH-12** `WellbeingLine` (shared summary, not shared, not enough data)
- [ ] **PG-PAR-DASH-13** Seat badges: "Not on your plan" and "Plan ends {date}"
- [ ] **PG-PAR-DASH-14** `ConsentBanner` for under-18 children needing consent (BE-FAM-14)
- [ ] **PG-PAR-DASH-15** `PendingInvitesCard` (count and link)
- [ ] **PG-PAR-DASH-16** Desktop grid (2 or 3 columns) and right rail with `RecentCelebrationsCard` in its own `<Suspense>`
- [ ] **PG-PAR-DASH-17** Academics-not-shared card variant (no chip, respectful line)
- [ ] **PG-PAR-DASH-18** Catch-all `web/src/app/(app)/parent/[...unmatched]/page.tsx` calling `notFound()` so unknown parent URLs stay inside the shell, with a parent `not-found.tsx` linking to `/parent`
- [ ] **PG-PAR-DASH-19** Wellbeing line gating driven by the `parent-insights` feature key in `/me` *(deferred: decision 13, parent insights are free in v1; no plan gate)*

## Quality tasks

- [ ] **PG-PAR-DASH-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-PAR-DASH-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-PAR-DASH-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (none on this page: confirm and note)
- [ ] **PG-PAR-DASH-Q04** Empty state with one clear next action
- [ ] **PG-PAR-DASH-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-PAR-DASH-Q06** Forbidden state (no upgrade state: the page is free, decision 13)
- [ ] **PG-PAR-DASH-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-PAR-DASH-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-PAR-DASH-Q09** Layout at 1440px
- [ ] **PG-PAR-DASH-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-PAR-DASH-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-PAR-DASH-Q12** axe: zero violations in light and dark
- [ ] **PG-PAR-DASH-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-PAR-DASH-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-PAR-DASH-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-PAR-DASH-Q16** Security: role check in page and proxy; Playwright proves a second parent's session never sees the first family's children (seeded two-family fixture)
- [ ] **PG-PAR-DASH-Q17** PII scrub: Sentry `beforeSend` drops child names; assert no names or emails in URLs, logs or breadcrumbs
- [ ] **PG-PAR-DASH-Q18** Data minimisation check: network log in Playwright shows only the summary fields requested; no wellbeing call when not shared
- [ ] **PG-PAR-DASH-Q19** Performance: Lighthouse mobile LCP under 2.5 s with 4 seeded children; route JS under 150 KB gzip in the build report
- [ ] **PG-PAR-DASH-Q20** Observability: Sentry tags and the three analytics events wired with no PII props
- [ ] **PG-PAR-DASH-Q21** WCAG 2.2 AA pass: focus not obscured by the bottom nav, colour not sole carrier, card landmarks
- [ ] **PG-PAR-DASH-Q22** Rollout: `flags.parentTrack` gate in `(app)/parent/layout.tsx` with off-state holding page; rollback documented in the PR
- [ ] **PG-PAR-DASH-Q23** Monitoring: Sentry error-rate alert and BE-FAM-07 latency alert defined in OBS config

## Tests

### Unit (Vitest)
- `features/family/lib/to-child-summary.test.ts`: maps each standing code; nulls stay null; tertiary model contains no high-school words; high-school model contains no course or GPA words.
- `features/family/lib/standing-copy.test.ts`: every code has copy for both stages.
- `features/family/components/child-summary-card.test.tsx`: renders not-shared, no-evidence, seat badges, inline error.
- `features/family/components/wellbeing-line.test.tsx`: three variants, and no upsell for a parent on any plan.
- `features/family/server/get-parent-dashboard.test.ts`: one overview rejects, others resolve; wellbeing skipped when not shared.

### Playwright (`web/tests/e2e/parent/dashboard.spec.ts`)
- `parent dashboard shows mixed-stage family with correct vocabulary`
- `parent dashboard empty state offers invite`
- `parent dashboard pending-only state`
- `parent dashboard isolates one failed child card`
- `parent dashboard hides wellbeing when not shared`
- `parent on the free plan sees the shared wellbeing line`
- `student is redirected away from parent dashboard`
- `second parent cannot see first family` (security)
- `consent banner for under-18 child`
- `parent without a plan reaches dashboard and billing`
- `unknown parent url shows not found inside the shell`
- axe light and dark at 360 and 1440

## Open questions

- Decided (13): the wellbeing line is free, as at 43f9faa. No gate and no switch in v1 (PG-PAR-DASH-19 deferred).
- Should BE-FAM-07 have a batch form so the dashboard makes one call instead of one per child?
- Standing thresholds (`on_track`, `watch`, `needs_attention`) are computed in the API; the rule needs to be written in the Family backend spec.
- Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84), no third-party flag service.
- Proposed permission `family.read` for parent reads is not in `Permissions.cs` yet.
