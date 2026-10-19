# Schools and enquiries

| | |
|---|---|
| ID | `PG-ADM-SCHOOLS` |
| Route | `/admin/schools` (Schools and institutions tab, default), `/admin/schools/enquiries` (School enquiries tab); drawers `?school=<id>`, `?enquiry=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | high school (schools) and university or college (institutions) |
| Entitlement | none; permission `schools.read` (proposed), `schools.enquiries.manage` for enquiry status (proposed) |
| Depends on | BE-ADM-11, BE-IDN-02 (school or institution on users), BE-SUP-13 (school enquiries), PG-ADM-DASH-04 to 13; needs new BE task for enquiry status updates (BE-ADM-11 is read only) |
| Old app reference | Enquiries: `43f9faa:web/src/app/(app)/admin/school-enquiries/page.tsx` (real leads from the for-schools contact sales form: Fresh, Contacted and All tabs with counts, buying stage, curricula, FET learner count, reversible contacted toggle; API `/api/sales/school-enquiries` and `PUT /api/sales/school-enquiries/{id}/contacted`). Schools list: `f223ca7:web/src/app/(app)/admin/schools/page.tsx` only (mock list; no schools page exists at 43f9faa) |
| Status | Not started |

## Purpose

Show which schools and institutions our students come from, how many active students each has, and the enquiries schools send through the public site. This is read mostly: it informs outreach and a future school track (Phase 12). The only write is moving an enquiry through New, Contacted and Closed.

## User stories

- As an admin, I see schools and institutions with student counts, filtered by type, province and curriculum.
- As an admin, I open a school and see student counts by grade or year and how many are paying, never a list of minors' names.
- As an admin, I see school enquiries, newest first, and mark them contacted or closed with a note.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Schools", description "Where our students study, and enquiries from schools."
2. Tabs: "Schools and institutions", "School enquiries" (new count badge).
3. Schools tab: search "School or institution name"; Filters sheet (Type: High school, University, College; Province; Curriculum: NSC, IEB). Cards: name, type badge, province, "84 students".
4. School drawer: name, type, province, curriculum, students by grade (Grade 8 to 12) or by year of study, paying count, first and latest signup dates.
5. Enquiries tab: chips New, Contacted, Closed, All, each with a live count. Cards: school name, contact person, role, buying stage badge, received, status badge.
6. Enquiry drawer: full message, contact details, learner count estimate, status history, actions.

### Desktop (1440px)

- Schools table columns: Name, Type, Province, Curriculum, Students, Paying, Latest signup.
- Enquiries table columns: School, Contact, Role, Learners, Received, Status.
- Drawers 520px.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Layout | `web/src/app/(app)/admin/schools/layout.tsx` | server | h1, tabs, `PermissionGate schools.read` |
| Schools page | `web/src/app/(app)/admin/schools/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Enquiries page | `web/src/app/(app)/admin/schools/enquiries/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Drawer slots | `web/src/app/(app)/admin/schools/@drawer/*`, `enquiries/@drawer/*` | server | |
| Schools table | `web/src/features/admin/schools/components/schools-table.tsx` | server | |
| School filters | `web/src/features/admin/schools/components/school-filters.tsx` | client | |
| School drawer | `web/src/features/admin/schools/components/school-drawer-body.tsx` | server | Counts only |
| Enquiries table | `web/src/features/admin/schools/components/enquiries-table.tsx` | server | |
| Enquiry drawer | `web/src/features/admin/schools/components/enquiry-drawer-body.tsx` | server | |
| Enquiry status action | `web/src/features/admin/schools/components/enquiry-status-action.tsx` | client | `action-reason-dialog` with note |
| Loaders | `web/src/features/admin/schools/server/*.ts` | server | Schools list cached 300s `cacheTag("admin-schools")`; enquiries uncached |

## Data

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/schools?q=&type=&province=&curriculum=&cursor=` | BE-ADM-11 | GET | `items[]` { `id`, `name`, `type` (`high_school`, `university`, `college`), `province`, `curriculum` or null, `studentCount`, `payingCount`, `latestSignupAt` }, `nextCursor`, `total` |
| `/admin/schools/{id}` | BE-ADM-11 | GET | Fields above plus `byLevel[]` { `level` (grade 8 to 12 or year 1 to 7), `count` }, `firstSignupAt` |
| `/admin/school-enquiries?status=&stage=&cursor=` | BE-ADM-11 | GET | `items[]` { `id`, `schoolName`, `contactName`, `contactRole`, `learnerEstimate` (FET learners, Grades 10 to 12), `buyingStage` (`exploring`, `demo`, `pilot`, `ready`), `curricula[]`, `receivedAt`, `status` (`new`, `contacted`, `closed`) }, `counts` { `new`, `contacted`, `closed`, `all` } |
| `/admin/school-enquiries/{id}` | BE-ADM-11 | GET | Fields above plus `email`, `phone`, `message` (notes from the form), `location` (town and province), `contactedAt`, `history[]` { `status`, `at`, `by`, `note` } |

Mutations

| Action | Endpoint | BE ID | Request |
|---|---|---|---|
| Change enquiry status | `POST /admin/school-enquiries/{id}/status` | needs new BE task | `status` (`contacted`, `closed`), `note` (10 to 500), `Idempotency-Key` |

Counts below 5 are returned as `"<5"` by the API to avoid identifying individual minors at small schools (needs confirming in BE-ADM-11).

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Row skeletons |
| Schools empty | No schools | "No schools yet. Schools appear as students add theirs during onboarding." |
| No matches | Filters | "No schools match these filters." action "Clear filters" |
| Small count | `"<5"` | Shown as "Fewer than 5" |
| School not found | 404 | "This school is not in our records." |
| Enquiries empty | None | "No school enquiries yet. They arrive from the For schools form on the website." |
| Status saved | 200 | Toast "Enquiry marked {status}." |
| Error | Load fails | "We could not load schools. Try again." |
| Forbidden | No `schools.read` | "You do not have access to schools. Ask another admin to grant schools.read." |

## Stage variants

- High schools: drawer shows "By grade" (Grade 8 to Grade 12) and curriculum (NSC or IEB).
- Universities and colleges: drawer shows "By year of study"; no curriculum or grade wording.

## Interactions and edge cases

- School names are free text from onboarding (BE-IDN-02) unless normalised; duplicates ("Pretoria Boys High" vs "Pretoria Boys' High School") may appear. Merging is out of scope in v1 (open question).
- No student names or links from the school drawer. To find a student, use Users with a school filter (not provided in v1).
- Enquiry status can move New to Contacted to Closed, or New to Closed; Closed can reopen to Contacted; Contacted can move back to New.

### Carried over from the old app (43f9faa)

- Buying stage from the form, as a badge and a filter: "Exploring", "Wants demo", "Ready for pilot", "Ready to commit".
- Drawer fields: Contact, Email, Phone, Location, FET learner count, Curricula (chips, for example "NSC", "IEB"), Notes, and "Marked contacted {date}" when contacted.
- Contacted is reversible ("Move back to New"). In the old app it was once one-way, and a mis-click buried a live lead with no way back.
- Status chips show live counts so switching filters shows how many are waiting.
- A status change refreshes the dashboard's "School enquiries not yet contacted" count (revalidates `admin-metrics`).
- The old enquiries lived in a Sales module (`/api/sales/school-enquiries`); in the rebuild they belong to Support (BE-SUP-13) with the admin read in BE-ADM-11.

## Copy

- h1 "Schools"; description "Where our students study, and enquiries from schools."
- Tabs "Schools and institutions", "School enquiries"
- Type labels "High school", "University", "College"
- Status labels "New", "Contacted", "Closed"
- Status dialog: title "Mark enquiry {status}", note label "What happened? (saved in the audit log)", confirm "Save"

## Acceptance criteria

- Given schools from onboarding data, when the tab loads, then student counts equal the API and counts under 5 read "Fewer than 5".
- Given a university, when its drawer opens, then levels read "Year 1", "Year 2" and no Grade or curriculum text appears.
- Given a new enquiry, when an admin marks it contacted with a note, then the status updates, the history lists the note and the audit log has the event.
- Given an enquiry marked contacted by mistake, when the admin chooses "Move back to New", then it returns to New, the New count goes up by one and the dashboard count updates.
- Given enquiries at different buying stages, when the admin filters "Ready for pilot", then only those show.
- Given a 360px viewport, when the enquiries tab renders, then rows are cards with no horizontal scroll.

## Production readiness

Security
- `schools.read` on reads, `schools.enquiries.manage` on status changes, enforced server-side. Audited with note.

Performance
- School list from an aggregate read model (counts grouped by school), cached 300s; keyset pagination; budget p95 under 400ms.

Resilience
- Status change idempotent per key; 409 when the status already changed, with a refresh.

Observability
- Audit event `admin.school_enquiry.status`; Sentry tag `page:schools`.

Accessibility (WCAG 2.2 AA)
- "Fewer than 5" is text, not a symbol.

Privacy and POPIA
- Aggregate counts only, with small-number suppression under 5. Enquiry contact details are business contacts, still access-logged in the drawer.

Rollout
- Under `ADMIN_CONSOLE`; status writes under `ADMIN_WRITE_ACTIONS`.

Monitoring
- Alert when a New enquiry is older than 3 business days.

Tasks
- [ ] **PG-ADM-SCHOOLS-12** Small-number suppression rendering and confirm the rule with the BE-ADM-11 owner
- [ ] **PG-ADM-SCHOOLS-13** Alert for stale new enquiries
- [ ] **PG-ADM-SCHOOLS-14** Request new BE task for enquiry status changes (coordinator)

## Build tasks

- [ ] **PG-ADM-SCHOOLS-01** Schools and institutions list (umbrella; delivered by 05 to 07)
- [ ] **PG-ADM-SCHOOLS-02** School enquiries tab (umbrella; delivered by 08 to 11)
- [ ] **PG-ADM-SCHOOLS-03** Add Schools to the admin nav (Operations section, icon `school`, permission `schools.read`; add the icon key to `nav-icons.ts` if missing)
- [ ] **PG-ADM-SCHOOLS-04** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-SCHOOLS-05** Layout with tabs, schools route files and loader
- [ ] **PG-ADM-SCHOOLS-06** `schools-table.tsx` and `school-filters.tsx`
- [ ] **PG-ADM-SCHOOLS-07** `school-drawer-body.tsx` with stage-aware levels
- [ ] **PG-ADM-SCHOOLS-08** Enquiries route files, loader and `enquiries-table.tsx` with status chips
- [ ] **PG-ADM-SCHOOLS-09** `enquiry-drawer-body.tsx` with history
- [ ] **PG-ADM-SCHOOLS-10** `enquiry-status-action.tsx` with allowed transitions
- [ ] **PG-ADM-SCHOOLS-11** Empty, not found, error and forbidden states
- [ ] **PG-ADM-SCHOOLS-15** Buying stage badge and filter
- [ ] **PG-ADM-SCHOOLS-16** Drawer fields: curricula chips, FET learner count, location, notes, marked contacted date
- [ ] **PG-ADM-SCHOOLS-17** Status chips with live counts (New, Contacted, Closed, All)
- [ ] **PG-ADM-SCHOOLS-18** "Move back to New" action and revalidation of `admin-metrics` after any status change
- [ ] **PG-ADM-SCHOOLS-19** Request BE fields (`buyingStage`, `curricula`, `counts`, `contactedAt`) for BE-ADM-11 and BE-SUP-13 (coordinator)

## Quality tasks

- [ ] **PG-ADM-SCHOOLS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-SCHOOLS-Q02** Server loader in `src/features/admin/schools/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-SCHOOLS-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-ADM-SCHOOLS-Q04** Empty state with one clear next action
- [ ] **PG-ADM-SCHOOLS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-SCHOOLS-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-SCHOOLS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-SCHOOLS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-SCHOOLS-Q09** Layout at 1440px
- [ ] **PG-ADM-SCHOOLS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-SCHOOLS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-SCHOOLS-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-SCHOOLS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-SCHOOLS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-SCHOOLS-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/schools/components/school-drawer-body.test.tsx`: "high school shows grades and curriculum", "university shows years only", "small counts read Fewer than 5"
- `features/admin/schools/components/enquiry-status-action.test.tsx`: "closed can reopen to contacted", "requires note", "contacted can move back to new"

Playwright (`web/tests/e2e/admin/schools.spec.ts`)
- "schools list filters by province"
- "university drawer has no grade wording"
- "mark enquiry contacted records history"
- "move enquiry back to new updates counts"
- "filter enquiries by buying stage"
- "schools pages have no axe violations in light and dark"

## Open questions

- Is there a canonical schools list (for example the DBE EMIS master list) to normalise names, or do we keep free text? Affects duplicates.
- Small-number suppression threshold: 5 is proposed.
- `nav-icons.ts` may not have a `school` key; add it or reuse `library-big`.
