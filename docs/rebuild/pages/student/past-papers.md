# Past papers

| | |
|---|---|
| ID | `PG-STU-PAPERS` |
| Route | `/dashboard/past-papers` (`?subject=&grade=&year=&paper=&session=&curriculum=`) |
| Phase | 5 (backend is Academics, Phase 4) |
| Roles | student |
| Stages | high school only |
| Entitlement | free (see open questions) |
| Depends on | BE-ACA-60, BE-ACA-61, BE-ACA-62, BE-ACA-15, BE-IDN-28; UI-02, UI-05, UI-22, UI-26, UI-33 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/past-papers/page.tsx`, `f223ca7:DESIGN_BRIEF.md` section 9 ("Past papers and resources") |
| Status | Not started. Nav entry "Past papers" exists in `nav-config.ts` for all students (not yet stage-filtered). Backend not started. |

## Purpose

Decided (14): v1 links out to the official DBE archive, as the 43f9faa page did, to avoid copyright and staleness. Every paper row is `external` (BE-ACA-60, BE-ACA-63); a row is only `stored` in S3 once written permission exists. IEB papers are not hosted without written permission (decision 40).

Real NSC past exam papers and memos, filterable by subject, grade, year, paper and exam session, each opening the official archive copy in a new tab. Defaults to the student's own grade and subjects so the useful papers are on screen first.

## User stories

- As a Grade 12 student, I open past papers and see Mathematics and Physical Sciences papers for Grade 12 first.
- As a student, I filter to "Paper 2, November 2024" and download the question paper and the memo.
- As a student on a slow connection, I see the file size before I download when the index records it, and I always see that the file opens on the DBE site.
- As a student, I jump from a paper to a practice test on the same subject.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` "Past papers"; description "Official exam papers and memos to practise with."
2. Filter bar: subject select (default: "My subjects"), "More filters" button opening a sheet (grade, year, paper, session, language; the curriculum filter stays hidden while only NSC is listed, decision 40); active filter chips with clear buttons; result count ("24 papers").
3. Results: cards grouped by year (`h2` "2025", "2024"): subject, "Paper 1", session ("November"), grade; two buttons "Question paper" and "Memo", each with the size when known and an external-link icon (memo button absent when no memo); "Practise this subject" link.
4. "Show more" for the next page.
5. Source note: "Papers from the Department of Basic Education. Memos are official marking guidelines."

### Desktop (1440px)

`PageShell width="wide"`. Filters as a left rail (280px) with all filters visible; results in a `DataTable` (Year, Subject, Paper, Session, Grade, Downloads) with mobile card fallback, sortable by year.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/past-papers/page.tsx` | server | stage check first; reads `searchParams` |
| Loading, error | `.../past-papers/loading.tsx`, `error.tsx` | mixed | |
| Loader | `web/src/features/past-papers/server/get-past-papers.ts` | server | BE-ACA-61, shared cache keyed by filters (no personal data) |
| Default filters | `web/src/features/past-papers/lib/default-filters.ts` | shared | from `/me` grade, curriculum and enrolled subject codes |
| Filter schema | `web/src/features/past-papers/lib/paper-filters.ts` | shared | zod parse of `searchParams` |
| Filter bar | `web/src/features/past-papers/components/paper-filter-bar.tsx` | client | `Select`, chips, URL updates |
| Filter sheet | `web/src/features/past-papers/components/paper-filter-sheet.tsx` | client | mobile |
| Paper card | `web/src/features/past-papers/components/paper-card.tsx` | server | |
| Paper table | `web/src/features/past-papers/components/paper-table.tsx` | client | `DataTable` |
| Download button | `web/src/features/past-papers/components/paper-download-button.tsx` | client | link to the download route handler |
| Download route | `web/src/app/(app)/dashboard/past-papers/[id]/download/route.ts` | server | calls BE-ACA-62 with the session, 302 to the presigned URL |
| University notice | `web/src/features/past-papers/components/university-notice.tsx` | server | shown if a university student reaches the route |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/past-papers?subject=&grade=&year=&paper=&session=&curriculum=&page=` (BE-ACA-61) | GET | `items[] { id, subject, examBody (nsc), grade, year, paperNumber, session (november, june, supplementary), language, storage (external in v1), sourceAttribution, fileSizeBytes or null, memorandumId or null }`, `total`, `facets { years[], subjects[] }` | shared, revalidate 1 day, tag `academics:past-papers` |
| `/academics/past-papers/{id}/download?part=paper or memo` (BE-ACA-62) | GET (server, from the route handler) | `{ url, storage, expiresAt, attribution }`; v1 rows return the official archive URL | none |
| `/me` (BE-IDN-28) | GET | `educationLevel`, `grade`, `curriculum` | session |
| `/academics/units` (BE-ACA-15) | GET | `items[] { subjectCode }` for "My subjects" | tag `academics:units:<userId>` |

Mutations: none. Downloads go through the route handler so the target URL is resolved per click with the user's session and counted (BE-ACA-62 metric); in v1 it redirects to the official archive URL, and the same handler serves a presigned URL if a row is ever `stored`.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render or filter change | skeleton cards; previous results stay during client navigation |
| Empty (filters) | no papers match | "No papers match these filters." action "Clear filters" |
| Empty (my subjects) | none of the student's subjects have papers | "We don't have papers for your subjects yet. Try All subjects." action "Show all subjects" |
| No units | student has no subjects | defaults to "All subjects" with a hint "Add your subjects to see your papers first." link "Add subjects" |
| Error | loader fails | `PageError` defaults |
| Download failed | route handler gets 5xx | toast "That download did not start. Try again in a moment." |
| University student | stage is university | `university-notice`: "Past papers are for high-school exams. Your course resources live on each course's page." action "Go to courses" |
| Forbidden | non-student | proxy redirect; fallback `PageForbidden` |
| Populated | results | as laid out |

## Stage variants

| Item | High school | University |
|---|---|---|
| Nav entry | shown | hidden (nav filtered by stage) |
| Page | full | university notice only |
| Defaults | own grade, curriculum and subjects | n/a |

## Interactions and edge cases

- Defaults apply only when the URL has no filters; once the student changes a filter the URL is the source of truth (bookmarkable, back button works).
- Grade filter offers 10, 11 and 12 (NSC papers are set for these); Grade 8 and 9 students default to Grade 10 with a hint "Exam papers start at Grade 10. These are a good stretch."
- Sizes show with one decimal in MB when the index records them; files over 5 MB show "Large file" so students on data can decide.
- Download opens in a new tab; the route handler returns 302 to the official archive URL for `external` rows (v1, every row), and the accessible name says it opens the DBE site. A `stored` row (only with written permission) would get a 5-minute presigned URL with `Content-Disposition: attachment`.
- "Practise this subject" links to `/dashboard/practice?unit={unitId}&source=past-paper` when the subject is enrolled, otherwise it is hidden.
- Afrikaans versions: BE-ACA-60 and BE-ACA-63 carry `language`; show a language filter (English, Afrikaans) defaulting to English.

## Copy

- Buttons: "Question paper", "Memo" (with "({size})" when known), "Practise this subject"; link note "Opens on the DBE website"
- Session labels: "November", "June", "Supplementary"
- Result count: "{n} papers"

## Acceptance criteria

- Given a Grade 12 NSC student enrolled in Mathematics, when the page opens with no filters, then the first results are Grade 12 NSC Mathematics papers, newest first.
- Given filters in the URL, when the page is reloaded, then the same filters and results show.
- Given a paper without a memo, when the card renders, then only the question paper button shows.
- Given the download button on an external row, when tapped, then the browser receives a 302 from the route handler to an allowlisted official archive host and the page HTML never contained the target URL.
- Given a university student, when they open `/dashboard/past-papers`, then only the university notice renders and the nav has no "Past papers" item.

## Production readiness

- Security: the download route handler authenticates the session and calls BE-ACA-62, which checks the caller is a student; external targets must be on the BE allowlist (education.gov.za) and the route handler refuses any other host; presigned URLs (stored rows only) are short-lived, single-object, minted per request, and never logged or sent to analytics. Filter values are zod-validated and passed as query parameters, never concatenated into paths.
- Performance: the paper list contains no personal data, so it can use the shared `"use cache"` keyed by filters (revalidate daily); "My subjects" resolution happens before the cached call and is passed as a filter. Route JS under 70 KB gzip (filter bar and table only).
- Resilience: download failures show a toast and do not navigate away; loader timeout 4 s; facets failure falls back to a plain year list.
- Observability: analytics `past_papers_viewed { defaulted }`, `past_papers_filtered { filterCount }`, `past_paper_downloaded { part, year, subjectCode }` (subject code is catalog data, not personal). Sentry tag `page:past-papers`; route handler errors include status, never the URL.
- Accessibility (WCAG 2.2 AA): download buttons include the subject, paper and part in their accessible name ("Download Mathematics Paper 1 November 2024 question paper, 1.2 MB"); new-tab behaviour announced in the label.
- Privacy and POPIA: no personal data in the paper catalog; download analytics do not include the student id beyond the consented analytics identity.
- Licensing: v1 links out only (decision 14); nothing is re-hosted. IEB papers are not listed without written permission (decision 40), so the curriculum filter is hidden. The seed index records the source per paper.
- Rollout: behind `academics.past-papers`; nav entry stage-filtered at the same time. Rollback: flag off hides nav and route.
- Monitoring: Grafana panel for BE-ACA-62 errors and the link checker (BE-ACA-89) dead-link count; alert when any official archive link goes dead.

## Build tasks

- [ ] **PG-STU-PAPERS-01** Filters (subject, grade, year, paper, session, language; curriculum hidden while NSC only) synced to the URL: mobile sheet, desktop rail
- [ ] **PG-STU-PAPERS-02** Results list grouped by year with question paper and memo links to the official archive
- [ ] **PG-STU-PAPERS-03** Hidden for university stage: nav entry filtered by stage, route shows the university notice
- [ ] **PG-STU-PAPERS-04** Loader `get-past-papers.ts` with shared cache keyed by filters and tag `academics:past-papers`
- [ ] **PG-STU-PAPERS-05** Default filters from grade, curriculum and enrolled subjects (`default-filters.ts`) with unit tests
- [ ] **PG-STU-PAPERS-06** Paper card and desktop table with file sizes
- [ ] **PG-STU-PAPERS-07** Download route handler (session check, BE-ACA-62, 302 to the allowlisted archive URL) and download button opening a new tab
- [ ] **PG-STU-PAPERS-08** "Practise this subject" link for enrolled subjects
- [ ] **PG-STU-PAPERS-09** Empty, no-units and download-failed states
- [ ] **PG-STU-PAPERS-10** Paging with "Show more"
- [ ] **PG-STU-PAPERS-11** Analytics events listed above
- [ ] **PG-STU-PAPERS-12** Flag `academics.past-papers` and rollback note
- [ ] **PG-STU-PAPERS-13** Grafana panel and alert for download errors and dead archive links
- [ ] **PG-STU-PAPERS-14** Per-subject exam tips shown when a subject filter is set (port the 43f9faa tip copy, for example Mathematics "Work Paper 1 timed at 3 hours. Mark with the official memo.", Physical Sciences "Read the data sheet first and map each question to a formula.")
- [ ] **PG-STU-PAPERS-15** "How to use past papers" tips card: print or split-screen; set a timer for the full paper with no pauses; mark with the official memo; log every mistake type in your diary; redo wrong questions a week later
- [ ] **PG-STU-PAPERS-16** Official archive link to the DBE NSC past papers page with "Source: education.gov.za", always visible, and the page's fallback when the index has no row for a filter
- [ ] **PG-STU-PAPERS-17** Life Orientation note: "LO is assessed through a CAT. Past CAT papers come from your province, not the national archive."
- [ ] **PG-STU-PAPERS-18** "Practise with AI" call to action linking to `/dashboard/practice` (43f9faa also linked to tutors; that marketplace is out of scope)

## Quality tasks

- [ ] **PG-STU-PAPERS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`)
- [ ] **PG-STU-PAPERS-Q02** Server loader in `src/features/past-papers/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-PAPERS-Q03** No client mutations; download handled by a server route handler
- [ ] **PG-STU-PAPERS-Q04** Empty state with one clear next action
- [ ] **PG-STU-PAPERS-Q05** Error state copy: page and download level
- [ ] **PG-STU-PAPERS-Q06** Forbidden state and university notice (no upgrade state unless the entitlement question changes)
- [ ] **PG-STU-PAPERS-Q07** Stage-aware wording checked (university students never see this page's content)
- [ ] **PG-STU-PAPERS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); table collapses to cards
- [ ] **PG-STU-PAPERS-Q09** Layout at 1440px
- [ ] **PG-STU-PAPERS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-PAPERS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-PAPERS-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-PAPERS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-PAPERS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-PAPERS-Q15** `generateMetadata` title "Past papers"; nav entry active

## Tests

Unit (Vitest):
- `default-filters.test.ts`: "Grade 12 NSC defaults to own grade and subjects", "Grade 9 defaults to Grade 10", "no units defaults to all subjects"
- `paper-filters.test.ts`: "invalid year ignored", "unknown session ignored"
- `paper-card.test.tsx`: "memo button hidden without memo", "size shows one decimal"

Playwright (`web/e2e/student/past-papers.spec.ts`):
- "Grade 12 student sees own papers first"
- "filters persist across reload"
- "download redirects to the official archive URL in a new tab"
- "university student sees the notice and no nav item"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- Decided (14): link out to the DBE archive in v1. The list, filters and paging stay (they run over the curated index, BE-ACA-63); every button opens the official copy; S3 hosting only for papers with written permission.
- Is past papers free for everyone, or part of a paid plan? The old app showed it to all students; this file assumes free.
- Decided (40): IEB papers are not hosted without written permission. v1 shows NSC only and hides the curriculum filter.
- Resolved in the backlog: BE-ACA-60 and BE-ACA-63 now carry `language`, so the language filter ships (English and Afrikaans).
- Resolved in the backlog: the seed is BE-ACA-63 (a curated index of official archive links, no S3 uploads), with the link checker BE-ACA-89.
