# Support and counselling

| | |
|---|---|
| ID | `PG-STU-SUPPORT` |
| Route | `/dashboard/wellbeing/support` (anchors `#crisis`, `#self-help`, `#counsellor`) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free (never gated, never behind a feature flag) |
| Depends on | BE-WEL-08, UI-04, UI-09, UI-20, UI-29, UI-33, OBS-04, PG-STU-WELL (shared `helplines.ts`, analytics path filter) |
| Old app reference | `web/src/app/(app)/dashboard/psychologist/page.tsx` at 43f9faa (SADAG line kept; counsellor list dropped: `GET /api/wellbeing/counsellors` in `WellbeingController.cs` at 43f9faa returned an empty array, so the page always showed "We're verifying counsellors in your area") |
| Status | Not started (backend not started; no route, loader or components exist) |

`PG-STU-SUPPORT-05` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

When a student needs help, this page gives it to them first and fast: South African crisis lines at the very top, each one tap to call, then short self-help guides for common hard moments, then plain steps for reaching a counsellor at school or on campus. It is calm, never clinical, never alarmist. It must work even when the rest of the app is down, so the crisis list is bundled with the page and does not depend on the API.

## User stories

- As a student in crisis, I want a free, 24-hour number I can tap to call straight away.
- As a student under 18, I want to know about Childline.
- As a university student, I want the student helpline for my sector.
- As a student who is not in crisis, I want short, practical guides for exam stress, sleep and feeling overwhelmed.
- As a student, I want to know how to actually reach a counsellor at my school or campus.
- As a student, I want to know this page is private.

## Layout

### Mobile (360px)

Single column, `px-4`, `gap-6`:

1. `PageHeader`: h1 "Support", description "You don't have to handle things alone. Help is free and confidential."
2. `CrisisCard` (`#crisis`, visible without scrolling on a 360 by 640 screen): magenta-tinted card, `LifeBuoy` icon, h2 "Need help right now?". Then call rows, each a full-width `tel:` link at least 56px tall with the name, what it is for, hours and the number in large `tabular-nums`:
   1. "Emergency" (life in danger): 112 from any phone, also 10111 police and 10177 ambulance on a secondary line.
   2. "SADAG Suicide Crisis Line": 0800 567 567, free, 24 hours.
   3. HS: "Childline" (under 18): 116, free, 24 hours. Uni: "Higher Health 24-hour line" (students at public universities and TVET colleges): 0800 36 36 36, free.
   4. "Lifeline": 0861 322 322, 24 hours.
   Below the rows: "More lines" disclosure listing the SADAG WhatsApp line, the GBV Command Centre and the substance abuse line.
3. `SelfHelpList` (`#self-help`): h2 "When things feel heavy". Cards: "Exam stress", "Can't sleep", "Feeling overwhelmed", "A one-minute grounding exercise", "Talking to someone you trust". Each card expands in place (`Accordion`) to a short guide (under 250 words) rendered with `Markdown`.
4. Quick link card: "Take a two-minute break" to `/dashboard/wellbeing?break=1`.
5. `CounsellorCard` (`#counsellor`): h2 "Talk to a counsellor". Stage-specific steps (see Stage variants).
6. `PrivacyFooter`: "Visiting this page isn't shared with parents and isn't tracked."

### Desktop (1440px)

`PageShell`, 12 columns:

- Row 1: header full width.
- Row 2: `CrisisCard` full width, call rows as a 2 by 2 grid (each row still a full `tel:` link; on desktop the number is also selectable text for people calling from another phone).
- Row 3: `SelfHelpList` (8 of 12) and a right column (4 of 12) with the break link and `CounsellorCard`.
- Row 4: `PrivacyFooter`.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/wellbeing/support/page.tsx` | server | `generateMetadata` title "Support"; not behind the `wellbeing` flag |
| Loading | `web/src/app/(app)/dashboard/wellbeing/support/loading.tsx` | server | Renders the static `CrisisCard` immediately (not a skeleton) and skeletons only for self-help |
| Error | `web/src/app/(app)/dashboard/wellbeing/support/error.tsx` | client | Renders `CrisisCard` from the bundled list above the retry message |
| CrisisCard | `web/src/features/wellbeing/components/crisis-card.tsx` | server | Pure server markup, zero client JS; data from `helplines.ts` merged with BE-WEL-08 when available |
| HelplineRow | `web/src/features/wellbeing/components/helpline-row.tsx` | server | `<a href="tel:...">` with an accessible name "Call {name} on {number}" |
| SelfHelpList | `web/src/features/wellbeing/components/self-help-list.tsx` | client leaf for the accordion | `Accordion` (`web/src/components/ui/accordion.tsx`), `Markdown` (`web/src/components/common/markdown.tsx`) |
| CounsellorCard | `web/src/features/wellbeing/components/counsellor-card.tsx` | server | Stage-specific copy |
| PrivacyFooter | `web/src/features/wellbeing/components/support-privacy-footer.tsx` | server | Static |
| Helplines | `web/src/features/wellbeing/lib/helplines.ts` | shared | Typed constant list with `name`, `purpose`, `number`, `tel`, `hours`, `audience` (`all`, `under_18`, `tertiary`), `verifiedOn` date; unit tested |
| Loader | `web/src/features/wellbeing/server/get-support-resources.ts` | server | `"use cache"` (not personal), `cacheLife("days")`, tag `wellbeing:support-resources`; falls back to `helplines.ts` and bundled guides on any failure |
| Redirect | `web/next.config.ts` `redirects()` | config | `/dashboard/psychologist` to `/dashboard/wellbeing/support` (308) |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/wellbeing/support-resources` (BE-WEL-08) | GET | `helplines[]`: `id`, `name`, `purpose`, `number`, `hours`, `audience`, `verifiedOn`, `order`; `guides[]`: `slug`, `title`, `bodyMarkdown`, `order`; `counsellor`: `highSchool[]`, `tertiary[]` (step strings) | `wellbeing:support-resources` (global, not per user) |

Rules:

- The endpoint returns static content only; it takes no user input and reads no user data. The page passes no student data to it.
- Bundled fallback in `helplines.ts` is the source of truth for the crisis card if the API is slow (over 1.5s) or fails. The API list may add lines or reorder, but a bundled crisis line is never removed by API data (merge by `id`, bundled entries win on number and hours).
- Every number has a `verifiedOn` date. A CI check fails if any `verifiedOn` is older than 6 months.

Mutations: none.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Self-help pending | Crisis card fully rendered; self-help skeletons; "Loading guides" for screen readers |
| Fallback | Loader failed or timed out | Crisis card from the bundle; self-help shows the bundled guides; no error banner (help must not look broken) |
| Error (route error boundary) | Unexpected render error | Crisis card first, then "Part of this page didn't load. The numbers above always work." Button "Try again" |
| Empty | Not possible: the bundle always has content | n/a |
| Forbidden | Not a student | Parents see the same crisis card (help is never withheld), then "The rest of this page is for students. Parents can find guidance on the parent wellbeing page." Link "Go to parent wellbeing" |
| Populated | Data present | As laid out |

## Stage variants

| Element | High school | University |
|---|---|---|
| Third crisis row | Childline 116 (under 18, free, 24 hours) | Higher Health 24-hour line 0800 36 36 36 |
| Counsellor steps | "Talk to your school counsellor or Life Orientation teacher. You can ask a teacher you trust to help you set it up." / "If your school doesn't have a counsellor, SADAG can refer you to free help near you: call 0800 567 567." / "If you'd rather not talk at school, Childline counsellors can talk to you about anything: call 116." | "Most universities and colleges have a free student counselling centre. Search your institution's website for student counselling or student wellness." / "Higher Health runs a free 24-hour line for students: 0800 36 36 36." / "If you can't reach campus services, SADAG can refer you: 0800 567 567." |
| Guide examples | Exam guide mentions tests and exams | Exam guide mentions tests, exams and assignment deadlines |
| Forbidden words | course, GPA | SBA, APS, matric, Grade |

## Interactions and edge cases

- Every number is a `tel:` link with the number formatted for reading ("0800 567 567") and dialled without spaces (`tel:0800567567`).
- Short codes (112, 116, 10111, 10177) are dialled as given.
- Desktop users without a phone handler can select the number text; the row shows the number large enough to read across a room.
- The page has no forms, no tracking, no chat and no booking in v1.
- Nothing on the page depends on JavaScript except the accordion; with JS off, guides render expanded.
- Anchors `#crisis`, `#self-help`, `#counsellor` are linked from wellbeing, the diary and the help centre.
- Load order: the crisis card is in the first HTML chunk, before any Suspense boundary.
- Links out (institution sites) are not hardcoded; the copy tells the student what to search for, to avoid dead links.

## Copy

- h1: "Support"
- Description: "You don't have to handle things alone. Help is free and confidential."
- Crisis heading: "Need help right now?"
- Emergency row: "Emergency. If someone's life is in danger, call 112 from any phone."
- SADAG row: "SADAG Suicide Crisis Line. Free, 24 hours. 0800 567 567"
- Childline row: "Childline. For anyone under 18. Free, 24 hours. 116"
- Higher Health row: "Higher Health. For students at public universities and TVET colleges. Free, 24 hours. 0800 36 36 36"
- Lifeline row: "Lifeline. 24 hours. 0861 322 322"
- More lines: "SADAG WhatsApp: 076 882 2775 (8am to 5pm)", "GBV Command Centre: 0800 428 428 (24 hours)", "SADAG Substance Abuse Line: 0800 12 13 14 (24 hours)"
- Self-help heading: "When things feel heavy"
- Counsellor heading: "Talk to a counsellor"
- Privacy footer: "Visiting this page isn't shared with parents and isn't tracked."

## Acceptance criteria

1. Given a 360 by 640 viewport, when the page loads, then the SADAG row and the emergency row are fully visible without scrolling.
2. Given BE-WEL-08 returns 500, when the page loads, then the crisis card and bundled guides render with no error banner.
3. Given BE-WEL-08 takes 3 seconds, when the page loads, then the crisis card renders from the bundle within the first HTML response.
4. Given a high-school student, when the crisis card renders, then the third row is Childline 116; given a university student, then it is Higher Health 0800 36 36 36.
5. Given any helpline row, when it is activated, then it is a `tel:` link with the digits and no spaces, and its accessible name is "Call {name} on {number}".
6. Given a request to `/dashboard/psychologist`, when it resolves, then it is a 308 to `/dashboard/wellbeing/support`.
7. Given the `wellbeing` flag is off, when the student opens this page, then it still renders.
8. Given a parent session, when they open this page, then the crisis card renders above the forbidden message.
9. Given a `verifiedOn` older than 6 months in `helplines.ts`, when CI runs, then the check fails.
10. Given any visit, when network traffic is inspected, then no analytics request carries the path.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | No user data read or written; endpoint is static; no third-party embeds, so the CSP needs nothing extra | PG-STU-SUPPORT-Q16 |
| Privacy and POPIA | Visiting support is health-related information: path excluded from Vercel Analytics (shared filter), no custom events, Sentry captures errors without the URL query and with Replay off, never shown in parent activity or the journey | PG-STU-SUPPORT-Q17 |
| Performance | LCP under 1.5s on mobile (stricter than the 2.5s budget, because this is a crisis page); crisis card ships zero client JS; total route JS under 60 KB gzip | PG-STU-SUPPORT-Q18 |
| Resilience | Bundled helplines and guides; 1.5s timeout on the loader; error boundary still renders the crisis card; works with JS disabled | PG-STU-SUPPORT-Q19 |
| Observability | Sentry route tag; a synthetic check (below) rather than analytics proves the page works | PG-STU-SUPPORT-Q20 |
| Accessibility | WCAG 2.2 AA; call rows are links with full accessible names; numbers readable at 200% zoom without horizontal scroll; headings in order; magenta tint passes contrast in both schemes | PG-STU-SUPPORT-Q21 |
| Content accuracy | Every number verified by a person calling it, dated in `verifiedOn`, re-verified every 6 months (CI check), reviewed before launch by someone with a counselling background | PG-STU-SUPPORT-Q22 |
| Rollout | Never flagged; ships with the first wellbeing release and stays on; rollback is a normal deploy revert, and the crisis card is covered by a smoke test in the deploy pipeline | PG-STU-SUPPORT-Q23 |
| Monitoring | Synthetic check every 5 minutes against production (signed-in test student) asserting the SADAG number is present; alert to the on-call channel on 2 consecutive failures | PG-STU-SUPPORT-Q24 |

## Build tasks

- [ ] **PG-STU-SUPPORT-01** Crisis resources (SA helplines) above the fold: `CrisisCard` and `HelplineRow` from the bundled list
- [ ] **PG-STU-SUPPORT-02** Self-help content: `SelfHelpList` accordion rendering guides with `Markdown`
- [ ] **PG-STU-SUPPORT-03** How to reach a counsellor: `CounsellorCard` with stage-specific steps
- [ ] **PG-STU-SUPPORT-04** Redirect `/dashboard/psychologist` to `/dashboard/wellbeing/support` (308)
- [ ] **PG-STU-SUPPORT-06** `helplines.ts` typed list with audience and `verifiedOn`, plus unit tests
- [ ] **PG-STU-SUPPORT-07** Loader with global cache, 1.5s timeout and merge rules (bundled entries win)
- [ ] **PG-STU-SUPPORT-08** Bundled fallback guides (five guides, under 250 words each) written and reviewed
- [ ] **PG-STU-SUPPORT-09** Stage variant for the third crisis row (Childline or Higher Health)
- [ ] **PG-STU-SUPPORT-10** "More lines" disclosure
- [ ] **PG-STU-SUPPORT-11** `loading.tsx` and `error.tsx` that both render the crisis card
- [ ] **PG-STU-SUPPORT-12** Parent view: crisis card plus the forbidden message and link
- [ ] **PG-STU-SUPPORT-13** Break link and `PrivacyFooter`
- [ ] **PG-STU-SUPPORT-14** Desktop grid layout
- [ ] **PG-STU-SUPPORT-15** Box-breathing guide reachable from this page as well as wellbeing (old wellbeing dialog: four 4-second phases, "Aim for four or five rounds", cycle counter, still ring under reduced motion), reusing `BreakSheet`

## Quality tasks

- [ ] **PG-STU-SUPPORT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-SUPPORT-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-SUPPORT-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-SUPPORT-Q04** Empty state with one clear next action
- [ ] **PG-STU-SUPPORT-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-SUPPORT-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-SUPPORT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-SUPPORT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-SUPPORT-Q09** Layout at 1440px
- [ ] **PG-STU-SUPPORT-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-SUPPORT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-SUPPORT-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-SUPPORT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-SUPPORT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-SUPPORT-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-SUPPORT-Q16** Security review: no user data in the request or response; CSP unchanged
- [ ] **PG-STU-SUPPORT-Q17** Analytics path filter, Sentry query scrubbing and Replay off verified for this route; not listed in journey or parent activity
- [ ] **PG-STU-SUPPORT-Q18** Lighthouse CI with the stricter budget (LCP under 1.5s, JS under 60 KB gzip)
- [ ] **PG-STU-SUPPORT-Q19** Playwright: API 500, API slow (3s) and JS disabled all show the crisis card
- [ ] **PG-STU-SUPPORT-Q20** Sentry route tag on the error boundary
- [ ] **PG-STU-SUPPORT-Q21** Screen reader pass on call rows; 200% zoom check
- [ ] **PG-STU-SUPPORT-Q22** Verify every number by phone, record `verifiedOn`, and add the 6-month CI staleness check; content review by a counselling professional *(unverified until a person does it)*
- [ ] **PG-STU-SUPPORT-Q23** Deploy smoke test asserting the crisis card on this route
- [ ] **PG-STU-SUPPORT-Q24** Production synthetic check every 5 minutes with alerting

## Tests

Unit (Vitest):

- `helplines.test.ts`: "every helpline has a tel value with digits only", "under 18 list includes Childline 116", "tertiary list includes Higher Health", "every entry has verifiedOn".
- `get-support-resources.test.ts`: "falls back to the bundle on error", "falls back after 1.5 seconds", "bundled numbers win on merge".
- `crisis-card.test.tsx`: "renders without client JavaScript", "row accessible name is Call name on number".

Playwright (`web/e2e/student/wellbeing-support.spec.ts`):

- "support: crisis lines visible without scrolling at 360 by 640"
- "support: high school shows Childline and university shows Higher Health"
- "support: API failure still shows crisis lines and guides"
- "support: JavaScript disabled shows crisis lines and expanded guides"
- "support: psychologist redirects here"
- "support: renders with the wellbeing flag off"
- "support: parent sees crisis lines above the forbidden message"
- "support: axe clean light and dark at 360 and 1440"

## Open questions

- Decided (35): every number above is phone-checked and the copy gets professional sign-off before prod (PG-STU-SUPPORT-Q22). In particular check the SADAG WhatsApp hours, the substance abuse line and the Higher Health number.
- Should a public, signed-out version of the crisis card exist (for example on the help centre), so a student who cannot sign in still sees it? Recommended.
- Should the bundled guides be written by us or licensed from SADAG or Higher Health? Either way they need professional review.
- Any future counsellor booking (the old placeholder) needs its own decision; it is out of v1.
- Should the old "Talk to someone" title stay as the nav and h1 wording instead of "Support"? Students may search for it.
