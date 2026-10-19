# Content

| | |
|---|---|
| ID | `PG-ADM-CONTENT` |
| Route | `/admin/content` (Catalog tab, default), `/admin/content/past-papers`, `/admin/content/articles`, `/admin/content/articles/new`, `/admin/content/articles/[id]`, `/admin/content/faqs` |
| Phase | 9 |
| Roles | admin |
| Stages | high school (catalog, past papers); everyone (help articles, FAQs) |
| Entitlement | none; permission `content.manage` (as in `nav-config.ts`); `support.faqs.manage` is folded into it (decision 9b) |
| Depends on | BE-ACA-02, BE-ACA-03, BE-ACA-04, BE-ACA-06 (catalog), BE-ACA-60, BE-ACA-61, BE-ACA-62 (past papers), BE-SK-30 (S3 presigned PUT and magic-byte check), BE-SUP-02, BE-SUP-03 (FAQs; `POST /support/faqs` exists in code), BE-SUP-14 (help articles read), UI-29 (`Markdown`), UI-31 (`FileUpload`), PG-ADM-DASH-04 to 13, PG-MKT-HELP (public help pages that show this content), PG-STU-PAPERS (student past papers page); needs new BE tasks for every admin write (see Data) |
| Old app reference | new (old app seeded catalog in code and had no content admin) |
| Status | Not started. In code today: `Faq` entity, `POST /support/faqs` (admin policy), `GET /support/faqs`, and the web loader `features/support/server/get-faqs.ts` with cache tag `support:faqs` |

## Purpose

Manage the content students and parents read, without a deploy: the CAPS subject catalog that onboarding and subject enrolment use, the past paper index (links to the official DBE archive with exact metadata and memo pairing; a PDF is stored in S3 only when written permission exists, decision 14), help articles, and FAQs. Every change is audited, public caches are revalidated on publish, and nothing is deleted outright: catalog entries retire, papers and articles hide or archive.

## User stories

- As a content admin, I see the CAPS catalog by curriculum (NSC, IEB) and grade, add a missing subject, rename one, or retire one so no new student can pick it.
- As a content admin, I add a past paper as an official archive link (or, only with written permission, an uploaded PDF) with its subject, grade, year, session, paper number and type, pair it with its memorandum, and publish it.
- As a content admin, I see papers that failed verification or are duplicates, and fix them.
- As a content admin, I write a help article in Markdown with a live preview, choose who it is for, save a draft, and publish it.
- As a content admin, I add, edit, reorder, publish or unpublish FAQs, and the public help centre updates within a minute.

## Layout

### Mobile (360px)

Shared:
1. `PageHeader`: h1 "Content", description "What students and parents read. Changes are logged and go live when you publish."
2. Tab links (scroll inside the tab list): Catalog, Past papers, Help articles, FAQs.

Catalog tab:
3. Curriculum segmented links "NSC" and "IEB"; Grade select (8 to 12, or "All grades").
4. Search "Subject name or code"; chip "Show retired".
5. Subject cards: name, code, grades offered ("Grades 10 to 12"), group ("Languages", "Mathematics", "Electives"), status badge (Active, Retired), enrolment count. Card menu: Edit, Retire or Reactivate.
6. Floating bottom bar button "Add subject" (above the mobile nav, 44px).

Past papers tab:
3. "Upload paper" button.
4. Filters sheet: Curriculum, Subject, Grade, Year, Session, Status (Processing, Ready, Published, Hidden, Failed).
5. Paper cards: "Mathematics P1, Nov 2024, Grade 12 (NSC)", type badge (Question paper, Memorandum, Addendum), language, status, memo paired yes or no. Menu: Edit details, Pair memo, Publish or Hide, Download.
6. Upload flow in a full-screen sheet: step 1 choose PDF (max 20 MB), step 2 details form, step 3 progress and verification, step 4 result.

Help articles tab:
3. "New article" button; filter chips Draft, Published, Archived; search title.
4. Article cards: title, audience badge, stage badge, status, updated.
5. Editor page (`/articles/[id]`): title, slug (editable until first publish), audience, stage, category, body textarea; "Write" and "Preview" toggle; sticky footer "Save draft", "Publish".

FAQs tab:
3. Category filter; "Add FAQ" button.
4. FAQ cards grouped by category: question, published badge, "Move up" and "Move down" buttons (44px), menu Edit, Publish or Unpublish.
5. Edit in a bottom sheet: question (max 300), answer (max 4 000, Markdown), category, published switch.

### Desktop (1440px)

- Catalog: filter bar inline; `DataTable` columns Name, Code, Curriculum, Grades, Group, Enrolments, Status, actions. Add and Edit open a 520px drawer.
- Past papers: `DataTable` columns Subject, Paper, Session, Year, Grade, Curriculum, Type, Language, Memo, Status, actions. Upload opens a 640px drawer with the steps vertical.
- Help articles: table; editor page is two columns, form and body on the left (7 columns), live preview on the right (5 columns) rendered with the same `Markdown` component as the public page.
- FAQs: table grouped by category with drag handle plus Move up and Move down buttons (drag is an enhancement; buttons are the accessible path).

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Content layout | `web/src/app/(app)/admin/content/layout.tsx` | server | h1, tabs, `PermissionGate content.manage` |
| Catalog page | `web/src/app/(app)/admin/content/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Catalog filters | `web/src/features/admin/content/catalog/components/catalog-filters.tsx` | client | |
| Catalog table | `web/src/features/admin/content/catalog/components/catalog-table.tsx` | server | |
| Subject form | `web/src/features/admin/content/catalog/components/subject-form.tsx` | client | Drawer; generated zod schema |
| Retire dialog | `web/src/features/admin/content/catalog/components/retire-subject-dialog.tsx` | client | Shows enrolment impact |
| Past papers page | `web/src/app/(app)/admin/content/past-papers/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Papers table | `web/src/features/admin/content/past-papers/components/papers-table.tsx` | server | |
| Upload flow | `web/src/features/admin/content/past-papers/components/upload-paper-flow.tsx` | client | Uses `FileUpload` (UI-31) for presigned PUT with progress |
| Paper details form | `web/src/features/admin/content/past-papers/components/paper-details-form.tsx` | client | Subject options from catalog |
| Pair memo dialog | `web/src/features/admin/content/past-papers/components/pair-memo-dialog.tsx` | client | Lists candidate memos with matching tuple |
| Paper title helper | `web/src/features/admin/content/past-papers/lib/paper-title.ts` | shared | "Mathematics P1, Nov 2024, Grade 12 (NSC)"; shared with PG-STU-PAPERS |
| Articles page | `web/src/app/(app)/admin/content/articles/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Article editor page | `web/src/app/(app)/admin/content/articles/[id]/page.tsx`, `articles/new/page.tsx` (+ `not-found.tsx`) | server shell | |
| Article editor | `web/src/features/admin/content/articles/components/article-editor.tsx` | client | Form, Write and Preview toggle, unsaved changes guard |
| Article preview | `web/src/features/admin/content/articles/components/article-preview.tsx` | client | `Markdown` from `components/common/markdown.tsx` |
| Slug helper | `web/src/features/admin/content/articles/lib/slugify.ts` | shared | Lowercase, hyphens, ASCII only |
| FAQs page | `web/src/app/(app)/admin/content/faqs/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| FAQ list | `web/src/features/admin/content/faqs/components/faq-admin-list.tsx` | client | Move up and down, optional drag |
| FAQ form | `web/src/features/admin/content/faqs/components/faq-form.tsx` | client | Limits from `Faq` entity (300, 4 000, 80) |
| Revalidate routes | `web/src/app/api/bff/content/revalidate/route.ts` | server | After a successful publish, calls `revalidateTag("support:faqs")`, `revalidateTag("help-articles")`, `revalidateTag("past-papers")` or `revalidateTag("catalog")` |
| Loaders | `web/src/features/admin/content/*/server/*.ts` | server | Uncached admin reads (admins must see their own change immediately) |

## Data

Reads

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/catalog/subjects?curriculum=&grade=&q=&includeRetired=` | needs new BE task (admin read over BE-ACA-02; BE-ACA-06 is the public read) | GET | `items[]` { `id`, `code`, `name`, `curriculum`, `grades[]`, `group`, `status` (`active`, `retired`), `enrolmentCount`, `source` (`seed`, `admin`), `updatedAt` } |
| `/admin/past-papers?curriculum=&subjectId=&grade=&year=&session=&status=&cursor=` | needs new BE task (admin read over BE-ACA-60) | GET | `items[]` { `id`, `subjectId`, `subjectName`, `curriculum`, `grade`, `year`, `session` (`may_june`, `november`, `supplementary`, `exemplar`), `paperNumber`, `type` (`question_paper`, `memorandum`, `addendum`, `answer_book`), `language` (`en`, `af`), `status` (`awaiting_upload`, `processing`, `ready`, `published`, `hidden`, `failed`), `failureReason`, `pairedWithId`, `sizeBytes`, `updatedAt` } |
| `/academics/past-papers/{id}/download` | BE-ACA-62 | GET | Presigned GET (admin may download hidden papers; needs the admin variant) |
| `/admin/support/articles?status=&q=&cursor=` | needs new BE task (admin read; BE-SUP-14 is public) | GET | `items[]` { `id`, `title`, `slug`, `audience` (`students`, `parents`, `everyone`), `stage` (`all`, `high_school`, `university`), `category`, `status` (`draft`, `published`, `archived`), `updatedAt`, `publishedAt` } |
| `/admin/support/articles/{id}` | needs new BE task | GET | Fields above plus `bodyMarkdown`, `version` |
| `/admin/support/faqs` | needs new BE task (admin read including unpublished; BE-SUP-03 returns published only) | GET | `items[]` { `id`, `question`, `answer`, `category`, `sortOrder`, `isPublished`, `version` } |

Mutations (BFF, `Idempotency-Key`, `content.manage`; all audited)

| Action | Endpoint | BE ID | Request | Notes |
|---|---|---|---|---|
| Add subject | `POST /admin/catalog/subjects` | needs new BE task | `code`, `name`, `curriculum`, `grades[]`, `group` | 409 duplicate code per curriculum |
| Edit subject | `PATCH /admin/catalog/subjects/{id}` | needs new BE task | `name?`, `grades?`, `group?`, `version` | Code is immutable |
| Retire or reactivate | `POST /admin/catalog/subjects/{id}/status` | needs new BE task | `status`, `reason` | Retired subjects stay on existing enrolments; hidden from new enrolment (BE-ACA-13) |
| Create paper and get upload URL | `POST /admin/past-papers` | needs new BE task (uses BE-SK-30) | metadata fields, `fileName`, `sizeBytes`, `contentType: application/pdf` | Returns `id`, `uploadUrl` (presigned PUT, 10 min), `maxBytes`; 409 duplicate tuple |
| Confirm upload | `POST /admin/past-papers/{id}/confirm` | needs new BE task (BE-SK-30 magic-byte check) | none | Moves to `processing` then `ready` or `failed` |
| Edit paper | `PATCH /admin/past-papers/{id}` | needs new BE task | metadata, `version` | |
| Pair memo | `POST /admin/past-papers/{id}/pair` | needs new BE task | `memorandumId` | Both must share subject, grade, year, session, paper number, curriculum |
| Publish or hide paper | `POST /admin/past-papers/{id}/visibility` | needs new BE task | `visible`, `reason?` | Publish only from `ready` |
| Create article | `POST /admin/support/articles` | needs new BE task | `title`, `slug`, `audience`, `stage`, `category`, `bodyMarkdown` (max 50 000) | Draft |
| Save article | `PUT /admin/support/articles/{id}` | needs new BE task | fields plus `version` | 409 stale |
| Publish, unpublish, archive | `POST /admin/support/articles/{id}/status` | needs new BE task | `status` | Slug locked after first publish |
| Create FAQ | `POST /support/faqs` | BE-SUP-02 (exists: `createFaq`) | `question`, `answer`, `category`, `sortOrder`, `isPublished` | Admin policy today; moves to `content.manage` (decision 9b) |
| Edit FAQ | `PUT /support/faqs/{id}` | needs new BE task | fields plus `version` | |
| Reorder FAQs | `POST /support/faqs/reorder` | needs new BE task | `category`, `orderedIds[]` | One request per move |
| Publish or unpublish FAQ | `POST /support/faqs/{id}/publish` | needs new BE task | `isPublished` | |

After each publish-affecting success, the client calls the BFF revalidate route with the matching tag, so public pages (`/help`, `/help/[slug]`, student past papers, onboarding catalog) update within the cache window.

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Table skeletons; editor skeleton |
| Catalog empty | No subjects for filter | "No subjects for {curriculum} Grade {n}. The catalog seed may not have run. Check System health, or add a subject." |
| Retire impact | Retire dialog | "{n} students are enrolled in {subject}. They keep it. New students will not see it." |
| Duplicate code | 409 | "A subject with code {code} already exists in {curriculum}." |
| Papers empty | No papers | "No past papers yet. Upload the first one." action "Upload paper" |
| Upload too large | Over 20 MB | "This file is {size}. The limit is 20 MB." |
| Not a PDF | Wrong type, client or server | "Only PDF files can be uploaded." Server magic-byte failure: "This file is not a real PDF, so it was rejected." |
| Uploading | PUT in progress | Progress bar with percentage; "Uploading {name}. Keep this page open." Cancel button |
| Upload interrupted | Network failure during PUT | "The upload stopped. Try again. Nothing was published." Retry reuses the same paper id until the URL expires |
| Upload URL expired | PUT 403 after 10 min | "The upload link expired. Start again." |
| Verifying | `processing` | "Checking the file." |
| Ready | `ready` | "Ready to publish." with Publish button |
| Duplicate paper | 409 on create | "This paper already exists: {title}. Edit that one instead." link |
| Missing memo | Question paper published without memo | Badge "No memo"; publish allowed with confirm "Publish without a memorandum? Students see the paper only." |
| Article draft saved | 200 | Toast "Draft saved." and "Saved 14:05" under the title |
| Unsaved changes | Navigating away | Browser confirm "You have unsaved changes. Leave anyway?" |
| Article stale | 409 | "Someone else saved this article. Copy your text, reload, and apply your changes." Editor keeps the text |
| Slug taken | 409 | "Another article uses /help/{slug}. Choose a different slug." |
| Published | 200 | Toast "Published. It shows on the help centre within a minute." |
| FAQs empty | None | "No FAQs yet. Add the first one." |
| Reorder failed | Error | Order reverts; toast "We could not save the new order. Try again." |
| Error | Load fails | "We could not load {catalog}. Try again." |
| Forbidden | No `content.manage` | "You do not have access to content. Ask another admin to grant content.manage." |

## Stage variants

- Catalog and past papers are high school only (CAPS, NSC and IEB). Copy uses Grade wording here; that is correct because these records are only shown to high school students.
- Help articles and FAQs carry an audience and stage. Preview shows a "Shown to: Students, university" line. Stage-aware wording check applies to article text: an article tagged university must not mention SBA, APS, matric or Grade (editor shows a gentle lint warning listing those words when stage is university).

## Interactions and edge cases

- Seeder versus admin edits: the catalog seeder (BE-ACA-04) upserts by code. Admin-created subjects have `source: admin`; admin renames and retirements must not be overwritten by a later seed run. BE needs a rule: seeder skips fields an admin changed (open question).
- Retire is the only removal; a subject is never deleted because enrolments reference it.
- Past paper tuple uniqueness: (curriculum, subject, grade, year, session, paper number, type, language).
- Upload is two-phase: metadata first (creates `awaiting_upload` row and presigned URL), then PUT to S3, then confirm. Abandoned rows older than 24 hours are cleaned up by a scheduled job (needs new BE task).
- Malware: v1 rows are external links, so uploads are rare (permission cases only). S3 objects are private and served only by presigned GET. Magic-byte check is required; malware scanning is an open question.
- The PDF never passes through the Next.js server (direct browser to S3 PUT), keeping Vercel function limits out of the way.
- Copyright (decisions 14 and 40): the default is "Official link" (allowlisted archive host). "Upload PDF" is enabled only when `licence_basis` records written permission, and IEB papers are never added without it. The form shows a required checkbox "We have written permission to host this paper" before an upload or any IEB entry.
- Article Markdown: rendered with the shared `Markdown` component (GFM and KaTeX); raw HTML disabled; links to external sites get `rel="noopener noreferrer"`.
- Slug change after publish is blocked in v1 to keep links stable.
- FAQ reorder sends the full ordered list for the category; optimistic move with revert on failure is acceptable here (low risk).
- Content edits while impersonating are impossible (impersonation is read-only and targets non-admins).

## Copy

- h1 "Content"; description "What students and parents read. Changes are logged and go live when you publish."
- Tabs "Catalog", "Past papers", "Help articles", "FAQs"
- Catalog: "Add subject", "Edit", "Retire", "Reactivate", chip "Show retired"; retire dialog title "Retire {subject}", confirm "Retire subject"
- Papers: "Upload paper", steps "Choose file", "Details", "Upload", "Done"; fields "Curriculum", "Subject", "Grade", "Year", "Session", "Paper", "Type", "Language"; session labels "May/June", "November", "Supplementary", "Exemplar"; type labels "Question paper", "Memorandum", "Addendum", "Answer book"
- Articles: "New article", "Write", "Preview", "Save draft", "Publish", "Unpublish", "Archive"; fields "Title", "Link (slug)", "Who is it for", "Stage", "Category", "Article"
- FAQs: "Add FAQ", "Move up", "Move down", "Publish", "Unpublish"

## Acceptance criteria

- Given NSC Grade 12, when the catalog tab loads, then subjects match `GET /admin/catalog/subjects?curriculum=NSC&grade=12` and retired subjects are hidden until "Show retired" is on.
- Given a subject with enrolments, when an admin retires it with a reason, then the dialog shows the enrolment count, the subject shows Retired, and `GET /academics/catalog` no longer returns it for new enrolment.
- Given a 5 MB PDF, when uploaded with full metadata, then the browser PUTs directly to the presigned S3 URL, confirm is called, the paper shows "Ready to publish", and after Publish the student past papers page lists it within the cache window.
- Given a renamed `.exe` as `.pdf`, when confirmed, then the server rejects it and the paper shows "This file is not a real PDF, so it was rejected."
- Given a duplicate tuple, when creating the paper, then the 409 copy links to the existing paper.
- Given a new article, when published, then `/help/{slug}` renders the same Markdown as the preview and the revalidate route was called for `help-articles`.
- Given two FAQs, when "Move up" is pressed on the second, then one reorder request is sent and the public help page shows the new order after revalidation.
- Given an admin without `content.manage`, when they open `/admin/content`, then the forbidden state shows (and the nav item is hidden).

## Production readiness

Security
- `content.manage` enforced server-side on every write and admin read; `support.faqs.manage` is folded into it (decision 9b, BE-IDN-07).
- Uploads: presigned PUT limited to `application/pdf`, 20 MB, 10 minute expiry, key generated server-side (no client-chosen paths; BE-SK-30 traversal guard); magic-byte verification before `ready`.
- Markdown rendered without raw HTML; no `dangerouslySetInnerHTML` outside the shared renderer.
- Every create, edit, publish, hide, retire and reorder audited with actor and before and after.

Performance
- Admin lists paginated (cursor) except FAQs (small set, capped at 200).
- Public caches revalidated by tag on publish, not by short TTLs.
- Article preview renders client-side with a 300ms debounce; Markdown and KaTeX loaded only on the editor route.

Resilience
- Upload retry within the URL lifetime reuses the same paper id; confirm is idempotent.
- Abandoned uploads cleaned up by a scheduled job.
- Article and FAQ edits use `version` concurrency; the editor never discards typed text on 409.
- Idempotency keys on create actions to prevent duplicate articles or papers on double submit.

Observability
- Audit events `admin.content.subject.*`, `admin.content.paper.*`, `admin.content.article.*`, `admin.content.faq.*`.
- Metrics: upload failures by reason, time from upload to ready.
- Sentry captures upload errors with paper id, never file contents.

Accessibility (WCAG 2.2 AA)
- Reorder has Move up and Move down buttons (2.5.7 dragging alternative).
- Upload progress uses `role="progressbar"` with value text; status changes announced politely.
- Editor Write and Preview toggle is a tab list; preview region labelled.

Privacy and POPIA
- No personal data in content; author names in audit only. Uploaded PDFs must not contain student work (form note: "Upload official papers only. Never upload student scripts.").

Rollout
- Under `ADMIN_CONSOLE`; writes under `ADMIN_WRITE_ACTIONS`. Past papers library can launch read-only with seeded papers (MIG) before uploads are enabled.

Monitoring
- Alert on upload failure rate over 20 percent in an hour, and on papers stuck in `processing` over 10 minutes.
- Panel: published papers count by subject and year (coverage), articles published per month.

Tasks
- [ ] **PG-ADM-CONTENT-28** Upload limits and errors (size, type, expired URL, interrupted) with retry using the same paper id
- [ ] **PG-ADM-CONTENT-29** IEB permission checkbox and "official papers only" notice
- [ ] **PG-ADM-CONTENT-30** Stage wording lint warning in the article editor for university-tagged articles
- [ ] **PG-ADM-CONTENT-31** Alerts for upload failures and stuck processing; coverage panel
- [ ] **PG-ADM-CONTENT-32** Request new BE tasks: admin catalog read and writes with seeder respect rule, past paper admin create, confirm, edit, pair, visibility and cleanup job, admin article CRUD and status, FAQ edit, reorder and publish, admin download for hidden papers (coordinator)

## Build tasks

- [ ] **PG-ADM-CONTENT-01** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-CONTENT-02** Content layout with tabs and permission gate
- [ ] **PG-ADM-CONTENT-03** Catalog route files, loader and `catalog-filters.tsx` (curriculum, grade, search, show retired)
- [ ] **PG-ADM-CONTENT-04** `catalog-table.tsx` with mobile cards and status badges
- [ ] **PG-ADM-CONTENT-05** `subject-form.tsx` add and edit drawer with duplicate code handling
- [ ] **PG-ADM-CONTENT-06** `retire-subject-dialog.tsx` with enrolment impact and reactivate
- [ ] **PG-ADM-CONTENT-07** Past papers route files, loader and filters
- [ ] **PG-ADM-CONTENT-08** `papers-table.tsx` and `paper-title.ts` helper with tests
- [ ] **PG-ADM-CONTENT-09** Upload flow step 1 and 2: file choice with client checks and `paper-details-form.tsx`
- [ ] **PG-ADM-CONTENT-10** Upload flow step 3: create, presigned PUT with progress via `FileUpload`, cancel
- [ ] **PG-ADM-CONTENT-11** Upload flow step 4: confirm, processing poll, ready or failed result
- [ ] **PG-ADM-CONTENT-12** Edit paper details and duplicate tuple handling
- [ ] **PG-ADM-CONTENT-13** `pair-memo-dialog.tsx` with matching candidates
- [ ] **PG-ADM-CONTENT-14** Publish and hide paper, missing memo confirm, admin download
- [ ] **PG-ADM-CONTENT-15** Articles list route files, loader and filters
- [ ] **PG-ADM-CONTENT-16** Article editor form fields, `slugify.ts`, slug lock after publish
- [ ] **PG-ADM-CONTENT-17** Write and Preview toggle with `article-preview.tsx` (desktop side by side)
- [ ] **PG-ADM-CONTENT-18** Save draft with `version` concurrency and unsaved changes guard
- [ ] **PG-ADM-CONTENT-19** Publish, unpublish and archive actions with slug taken handling
- [ ] **PG-ADM-CONTENT-20** FAQs route files and admin loader (including unpublished)
- [ ] **PG-ADM-CONTENT-21** `faq-admin-list.tsx` grouped by category with Move up and Move down
- [ ] **PG-ADM-CONTENT-22** `faq-form.tsx` create (existing `POST /support/faqs`) and edit
- [ ] **PG-ADM-CONTENT-23** FAQ publish and unpublish
- [ ] **PG-ADM-CONTENT-24** Optional drag reorder enhancement on desktop
- [ ] **PG-ADM-CONTENT-25** BFF revalidate route and tag calls after publish-affecting actions (`support:faqs`, `help-articles`, `past-papers`, `catalog`)
- [ ] **PG-ADM-CONTENT-26** Empty, error and forbidden states across the four tabs
- [ ] **PG-ADM-CONTENT-27** Move `POST /support/faqs` from the admin policy to `content.manage` (coordinate with BE owner; web change is the generated client only)

## Quality tasks

- [ ] **PG-ADM-CONTENT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id (article editor)
- [ ] **PG-ADM-CONTENT-Q02** Server loaders in `src/features/admin/content/*/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-CONTENT-Q03** Client mutations through `/api/bff` with generated TanStack hooks; optimistic only for FAQ reorder, pending states elsewhere
- [ ] **PG-ADM-CONTENT-Q04** Empty state with one clear next action
- [ ] **PG-ADM-CONTENT-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-CONTENT-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-CONTENT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students), including article stage tags
- [ ] **PG-ADM-CONTENT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-CONTENT-Q09** Layout at 1440px
- [ ] **PG-ADM-CONTENT-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-CONTENT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-CONTENT-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-CONTENT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-CONTENT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-CONTENT-Q15** `generateMetadata` title; nav entry active state correct (Content active on every tab and the editor)

## Tests

Unit (Vitest)
- `features/admin/content/past-papers/lib/paper-title.test.ts`: "formats NSC November paper", "formats exemplar", "includes language when Afrikaans"
- `features/admin/content/articles/lib/slugify.test.ts`: "lowercases and hyphenates", "strips diacritics", "collapses repeats"
- `features/admin/content/past-papers/components/upload-paper-flow.test.tsx`: "rejects over 20 MB before upload", "rejects non-pdf type", "retries with same paper id", "shows expired link copy on 403"
- `features/admin/content/articles/components/article-editor.test.tsx`: "keeps text on 409", "warns on Grade wording for university stage", "locks slug after publish"
- `features/admin/content/faqs/components/faq-admin-list.test.tsx`: "move up sends ordered ids", "reverts on failure"

Playwright (`web/tests/e2e/admin/content.spec.ts`, S3 mocked locally with MinIO or LocalStack)
- "catalog filter by curriculum and grade"
- "retire subject shows impact and hides from new enrolment"
- "upload publish and pair a past paper"
- "fake pdf is rejected by server"
- "duplicate paper links to existing"
- "write preview and publish help article"
- "reorder faqs updates public help page"
- "admin without content.manage is forbidden"
- "content pages have no axe violations in light and dark at 360 and 1440"

## Open questions

- Catalog source of truth: data files in git (BE-ACA-03) or the database edited here? Recommend data files remain the seed, with admin changes winning per field and recorded with `source: admin`.
- Malware scanning for uploads: enable GuardDuty Malware Protection for S3 on the papers bucket, or accept magic-byte checks only for admin-only uploads?
- Decided (40, 14): no IEB papers without written permission; v1 links out to the official archive and stores a PDF only where permission is recorded.
- Decided (9b): unify on `content.manage`; `support.faqs.manage` is retired.
- Help article search for the public site (BE-SUP-14) and global search (BE-SUP-15) should index published articles; reindex trigger on publish needs confirming.
