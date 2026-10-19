# Assessment detail

| | |
|---|---|
| ID | `PG-STU-ASMT-DETAIL` |
| Route | `/dashboard/assessments/[id]` |
| Phase | 4 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-31, BE-ACA-34, BE-ACA-36, BE-ACA-37, BE-ACA-38, BE-ACA-39, BE-ACA-40, BE-ACA-41, BE-SK-30; UI-04, UI-05, UI-07, UI-10, UI-24, UI-25, UI-31 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/assessments/[id]/page.tsx` (lifecycle view, prediction vs actual) |
| Status | Not started. Backend (Academics, S3 storage) not started. |

## Purpose

One assessment, start to finish. The student sees where it is in its lifecycle (scheduled, in progress, submitted, marked), moves it on, logs the mark when it comes back, and keeps their work (photos, PDFs, documents) safely attached. This page is also where the old app lost uploads on redeploy; here files live in S3 and must survive any deployment.

## User stories

- As a student, I see the due date, weight, my prediction and my actual mark at a glance.
- As a student, I mark an assessment as started, then submitted, with one tap each.
- As a student, I log my mark (as a percent, or as marks out of a total) and see it compared with my prediction.
- As a student, I upload a photo of my work from my phone and download it later from any device.
- As a student, I can edit or delete the assessment.

## Layout

### Mobile (360px)

1. Back link "Assessments".
2. Header: `h1` title; unit name link; type badge; state badge; overflow menu (Edit, Delete).
3. Lifecycle stepper: 4 steps (Scheduled, In progress, Submitted, Marked) with the current one highlighted and dates under completed steps.
4. Primary action bar: the next allowed transition as the main button ("Start working on it", "Mark as submitted", "Log mark"); secondary "Move back" link only when the API allows a backward step.
5. Facts card: Due (SAST, with "Overdue by 2 days" when applicable), Weight, Your prediction, Your mark ("No mark yet").
6. Prediction vs mark (only when both exist): two bars and a sentence ("3 points above your prediction").
7. Uploads (`h2` "Your work"): upload button, list of files (name, size, uploaded date, download button), limits hint.
8. Notes (`h2`): plain text, or "No notes." with "Add notes" (to edit page).

### Desktop (1440px)

`PageShell width="default"`. Header and stepper full width (stepper horizontal). Two columns: left 7 (action bar, facts, prediction vs mark, notes), right 5 (uploads card).

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/assessments/[id]/page.tsx` | server | awaits `params`; `notFound()` on 404 |
| Loading, error, not found | `web/src/app/(app)/dashboard/assessments/[id]/loading.tsx`, `error.tsx`, `not-found.tsx` | mixed | `PageLoading`, `PageError`, `PageState` |
| Loader | `web/src/features/assessments/server/get-assessment.ts` | server | BE-ACA-34, tag `academics:assessment:<id>` |
| Header | `web/src/features/assessments/components/assessment-header.tsx` | server | badges, overflow menu island |
| Lifecycle stepper | `web/src/features/assessments/components/lifecycle-stepper.tsx` | server | ordered list, `aria-current="step"` |
| Transition bar | `web/src/features/assessments/components/transition-bar.tsx` | client | buttons from `allowedTransitions` |
| Transition hook | `web/src/features/assessments/hooks/use-transition-assessment.ts` | client | BE-ACA-36 with `version` |
| Log mark dialog | `web/src/features/assessments/components/log-mark-dialog.tsx` | client | `ResponsiveDialog`, percent or marks-out-of mode |
| Mark hook | `web/src/features/assessments/hooks/use-log-mark.ts` | client | BE-ACA-37, idempotency key |
| Facts card | `web/src/features/assessments/components/assessment-facts.tsx` | server | `sast.ts` for due label |
| Prediction compare | `web/src/features/assessments/components/prediction-compare.tsx` | server | two bars plus sentence |
| Uploads panel | `web/src/features/assessments/components/uploads-panel.tsx` | client | uses `FileUpload` (UI-31) |
| Upload hook | `web/src/features/assessments/hooks/use-assessment-upload.ts` | client | presign, PUT with progress and abort, confirm |
| Upload rules | `web/src/features/assessments/lib/upload-rules.ts` | shared | allowed types, size and count limits, client-side magic-byte sniff |
| Download button | `web/src/features/assessments/components/upload-download-button.tsx` | client | requests BE-ACA-41 then opens the presigned URL |
| Delete dialog | `web/src/features/assessments/components/delete-assessment-dialog.tsx` | client | `ConfirmDialog`, BE-ACA-38 (shared with edit) |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/assessments/{id}` (BE-ACA-34) | GET | `id, title, type, unit { id, name, kind }, weightPercent, dueAt, state, stateHistory[] { state, at }, allowedTransitions[], predictedPercent, mark { percent, obtained, total } or null, notes, uploads[] { id, fileName, sizeBytes, contentType, uploadedAt, status }, version` | user-scoped, tag `academics:assessment:<id>` |

Mutations (client, `/api/bff`):

| Endpoint (BE ID) | Method | Request | On success |
|---|---|---|---|
| `/academics/assessments/{id}/transition` (BE-ACA-36) | POST | `{ to, version }` | refresh; toast "Marked as {state}" |
| `/academics/assessments/{id}/mark` (BE-ACA-37), `Idempotency-Key` | POST | `{ percent }` or `{ obtained, total }`, `version` | state becomes graded; publishes `AssessmentGraded`; toast "Mark saved" |
| `/academics/assessments/{id}/uploads` (BE-ACA-39) | POST | `{ fileName, contentType, sizeBytes }` | `{ uploadId, putUrl, expiresAt, requiredHeaders }` |
| presigned S3 PUT | PUT | file bytes with `requiredHeaders` | progress events |
| `/academics/uploads/{id}/confirm` (BE-ACA-40) | POST | none | `{ status: verified }` or 422 when magic bytes do not match |
| `/academics/uploads/{id}` (BE-ACA-41) | GET | none | `{ getUrl, expiresAt }` (short-lived) |
| `/academics/assessments/{id}` (BE-ACA-38) | DELETE | none | redirect to `/dashboard/assessments`, toast "Assessment deleted" |

Every mutation revalidates `academics:assessment:<id>`, `academics:assessments:<userId>`; mark also revalidates `progress:dashboard:<userId>` and `academics:units:<userId>`.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | header and card skeletons |
| Not found | 404 (also another student's id) | title "We could not find that assessment"; body "It may have been deleted."; action "Back to assessments" |
| Error | loader fails | `PageError` defaults |
| No mark | `mark` null | "No mark yet" |
| No uploads | empty | "No files yet. Add photos or documents of your work so they are safe in one place." |
| Uploading | PUT in progress | row with progress bar "Uploading 45%" and "Cancel" |
| Verifying | confirm pending | "Checking file..." |
| Upload rejected (client) | wrong type or too big | "This file type is not supported. Use JPG, PNG, WebP, HEIC or PDF." / "This file is {size}. The limit is 10 MB." |
| Upload rejected (server) | 422 from confirm | "This file does not look like a {type}. It was not saved." |
| Upload failed | network | "Upload stopped. Check your connection and try again." button "Retry" |
| Upload limit | 10 files reached | upload button disabled, hint "You have reached 10 files for this assessment. Delete one to add another." (see open questions) |
| Conflict | 409 stale `version` | "This assessment changed in another tab. We loaded the latest version." |
| Overdue | due passed and not submitted | due line in terracotta "Overdue by {n} days" |
| Populated | data | as laid out |

## Stage variants

| Item | High school | University |
|---|---|---|
| Weight label | "Weight (of SBA mark)" | "Weight (of course mark)" |
| Mark entry | percent or marks out of total | same |
| Unit link text | subject name | course name |

Lifecycle states are the same for both stages.

## Interactions and edge cases

- Transitions shown come only from `allowedTransitions`; the client never decides the state machine (BE-ACA-31 owns it). Logging a mark moves the state to graded on the server.
- Mark dialog: percent mode (0 to 100, one decimal) or marks mode (obtained 0 to total, total 1 to 1 000); the dialog shows the computed percent live. Re-logging a mark replaces it (the API keeps history).
- Upload flow: client checks type by extension and first bytes, size at most 10 MB, then presigns; PUT goes straight to S3 with progress; confirm triggers the server magic-byte check (BE-SK-30). Only `verified` files can be downloaded.
- Presigned PUT URL expires (5 minutes); if the PUT fails with 403 after expiry, the hook presigns again once automatically.
- Downloads request a fresh GET URL each time (60 seconds), opened in a new tab; URLs are never stored in the page HTML or logs.
- Allowed types match 43f9faa: JPG, PNG, WebP, HEIC or HEIF (iPhone photos) and PDF, 10 MB each. Word files were not accepted in 43f9faa and are not added here. HEIC thumbnails do not render in most browsers, so HEIC files show a labelled tile instead of a thumbnail.
- Images show as square thumbnails and PDFs as labelled tiles; tapping one opens it full size in a new tab. The panel starts expanded when empty and collapsed once files exist (43f9faa behaviour). Each file has a visible delete button (not hover-only, so touch users can reach it).
- Leaving the page during an upload asks "An upload is still running. Leave anyway?"
- Delete confirm lists what goes: "This deletes the assessment, its mark and {n} files. This cannot be undone."

## Copy

- Transition buttons: "Start working on it", "Mark as submitted", "Log mark", "Move back to {state}"
- Mark dialog: title "Log your mark"; toggle "Percent" / "Marks"; submit "Save mark"
- Compare sentence: "{n} points above your prediction." / "{n} points below your prediction." / "Right on your prediction."
- Upload hint: "JPG, PNG, WebP, HEIC or PDF, up to 10 MB each."

## Acceptance criteria

- Given a scheduled assessment, when the student taps "Start working on it", then the stepper shows In progress with today's SAST date and the button becomes "Mark as submitted".
- Given a submitted assessment, when the student logs 34 out of 40, then the mark shows 85%, the state is Marked, and the dashboard reflects it after refresh.
- Given a 12 MB PDF, when selected, then the client rejects it with the size copy and no presign request is sent.
- Given a `.pdf` file whose bytes are a PNG, when confirmed, then the server returns 422, the row shows the server rejection copy and the file is not listed.
- Given a verified upload on staging, when the API and web are redeployed, then the file still downloads (PG-STU-ASMT-DETAIL-05).
- Given two tabs on the same assessment, when one transitions and the other then transitions, then the second gets the conflict copy and reloads.
- Given another student's assessment id, when requested, then not found renders and no data leaks into the HTML.

## Production readiness

- Security: ownership checked on every endpoint, including upload confirm and download (an upload id alone grants nothing). Presigned URLs are scoped to one object key generated by the server (path traversal guarded, BE-SK-30), short-lived, and never logged by the web or put in analytics. Server-side magic-byte check is authoritative; client sniffing is convenience only. Files are served with `Content-Disposition: attachment` to avoid inline script execution. CSRF covered by BFF same-origin calls; the S3 PUT carries no cookies.
- Performance: page server-rendered; transition bar, dialogs and uploads panel are islands; uploads panel lazy-loaded below the fold. Route JS under 110 KB gzip. Upload streams the file without reading it fully into memory (`fetch` with the `File` body; progress via `XMLHttpRequest` in the hook).
- Resilience: idempotent mark logging; `version` on transitions; upload retry and re-presign on expiry; confirm retried up to 3 times with backoff on 5xx; abort on cancel or unmount.
- Observability: analytics `assessment_transitioned { from, to }`, `assessment_mark_logged { mode }`, `assessment_upload_started { contentType, sizeBucket }`, `assessment_upload_completed`, `assessment_upload_rejected { reason }`. Sentry tag `page:assessment-detail`; upload errors include status and phase (presign, put, confirm), never the URL.
- Accessibility (WCAG 2.2 AA): stepper is an ordered list with `aria-current`; upload progress uses `role="progressbar"` with value; drag and drop is optional, the button always works (2.5.7 dragging alternative).
- Privacy and POPIA: uploaded work may contain names, school names and handwriting of minors; stored encrypted at rest in S3, private bucket, deleted with the assessment and with account deletion (BE-IDN-36). No file names in analytics.
- Rollout: behind `academics.assessments`; uploads additionally behind `academics.uploads` so they can be disabled alone if storage misbehaves. Rollback: flag off hides the uploads panel; files stay in S3.
- Monitoring: Grafana panels for presign, PUT (from S3 metrics) and confirm success rates; alert when confirm failures exceed 5% over 30 minutes or any upload returns 404 on download (the old data-loss symptom).

## Build tasks

- [ ] **PG-STU-ASMT-DETAIL-01** Lifecycle stepper (port the `AssessmentLifecycle` UX, not its code)
- [ ] **PG-STU-ASMT-DETAIL-02** Transition actions from `allowedTransitions` with `version` and conflict handling
- [ ] **PG-STU-ASMT-DETAIL-03** Log a mark dialog (percent or marks out of total) and hook with idempotency key
- [ ] **PG-STU-ASMT-DETAIL-04** Upload work: presign, PUT with progress and cancel, confirm (BE-ACA-39, BE-ACA-40)
- [ ] **PG-STU-ASMT-DETAIL-05** E2E on staging: upload survives an API and web redeploy
- [ ] **PG-STU-ASMT-DETAIL-06** Page, loader `get-assessment.ts`, `not-found.tsx`
- [ ] **PG-STU-ASMT-DETAIL-07** Header with badges and overflow menu
- [ ] **PG-STU-ASMT-DETAIL-08** Facts card with SAST due label and overdue state
- [ ] **PG-STU-ASMT-DETAIL-09** Prediction vs mark comparison
- [ ] **PG-STU-ASMT-DETAIL-10** Upload rules `upload-rules.ts` (types, 10 MB, count, magic-byte sniff) with unit tests
- [ ] **PG-STU-ASMT-DETAIL-11** Uploads list with status rows and empty state
- [ ] **PG-STU-ASMT-DETAIL-12** Download button with fresh presigned GET (BE-ACA-41), new tab
- [ ] **PG-STU-ASMT-DETAIL-13** Upload failure handling: client rejection, server 422, network retry, re-presign on expiry
- [ ] **PG-STU-ASMT-DETAIL-14** Delete dialog with consequence copy and redirect (shared with edit)
- [ ] **PG-STU-ASMT-DETAIL-15** Leave guard while an upload runs
- [ ] **PG-STU-ASMT-DETAIL-16** Analytics events listed above
- [ ] **PG-STU-ASMT-DETAIL-17** Flags `academics.assessments` and `academics.uploads`; rollback note
- [ ] **PG-STU-ASMT-DETAIL-18** Grafana upload funnel panels and alerts (confirm failure rate, download 404)
- [ ] **PG-STU-ASMT-DETAIL-19** Lazy-load uploads panel; route JS budget 110 KB gzip
- [ ] **PG-STU-ASMT-DETAIL-20** Lifecycle actions as in 43f9faa `AssessmentLifecycle`: scheduled offers "Start working" (primary) and "Mark as submitted"; in progress offers "Mark as submitted"; submitted offers "Log mark" and "Reopen"; marked offers "Update mark"; buttons still come from `allowedTransitions`
- [ ] **PG-STU-ASMT-DETAIL-21** Logging a mark and moving to Marked is one action, never two; "Update mark" replaces it (43f9faa rule: the prediction engine trusts the mark over the state)
- [ ] **PG-STU-ASMT-DETAIL-22** Tasks checklist panel ("Plan"): add, tick, reorder and remove tasks, saved as one replacement update; empty copy "Break it into steps, like Outline structure or Do 10 past-paper questions."
- [ ] **PG-STU-ASMT-DETAIL-23** Upload thumbnails for images, labelled tiles for PDF and HEIC, open full size in a new tab, panel collapsed once files exist
- [ ] **PG-STU-ASMT-DETAIL-24** Delete a single upload with confirm (needs a BE slice, see open questions)
- [ ] **PG-STU-ASMT-DETAIL-25** Practice block: practice tests built for this assessment with score or "Not started", and "Generate practice" (or "More practice") linking to `/dashboard/practice?assessment={id}`
- [ ] **PG-STU-ASMT-DETAIL-26** "{Unit} so far" tile with the server's weighted average for the unit, shown next to the mark but never phrased as a comparison with it (it already includes this mark)
- [ ] **PG-STU-ASMT-DETAIL-27** Upload type rules corrected to JPG, PNG, WebP, HEIC, HEIF and PDF in `upload-rules.ts`, with magic-byte checks for each

## Quality tasks

- [ ] **PG-STU-ASMT-DETAIL-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`), `not-found.tsx`
- [ ] **PG-STU-ASMT-DETAIL-Q02** Server loader in `src/features/assessments/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-ASMT-DETAIL-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending, failed and conflict states
- [ ] **PG-STU-ASMT-DETAIL-Q04** Empty states (no uploads, no notes) with one clear next action
- [ ] **PG-STU-ASMT-DETAIL-Q05** Error copy for every upload phase and transition failure
- [ ] **PG-STU-ASMT-DETAIL-Q06** Forbidden handled as not-found; no upgrade state (free page)
- [ ] **PG-STU-ASMT-DETAIL-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-ASMT-DETAIL-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); file picker opens the camera option on phones
- [ ] **PG-STU-ASMT-DETAIL-Q09** Layout at 1440px
- [ ] **PG-STU-ASMT-DETAIL-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-ASMT-DETAIL-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-ASMT-DETAIL-Q12** axe: zero violations in light and dark, dialog open
- [ ] **PG-STU-ASMT-DETAIL-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-ASMT-DETAIL-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering each lifecycle state, uploads and not-found
- [ ] **PG-STU-ASMT-DETAIL-Q15** `generateMetadata` title is the assessment title; nav "Assessments" active

## Tests

Unit (Vitest):
- `upload-rules.test.ts`: "rejects 10 MB plus one byte", "accepts PDF magic bytes", "rejects PNG bytes named .pdf", "rejects the eleventh file"
- `log-mark-dialog.test.tsx`: "34 of 40 shows 85%", "obtained above total rejected", "percent 100.5 rejected"
- `transition-bar.test.tsx`: "renders only allowed transitions", "shows conflict copy on 409"
- `use-assessment-upload.test.ts`: "re-presigns once on expired URL", "abort cancels the PUT", "confirm retried on 503"

Playwright (`web/e2e/student/assessment-detail.spec.ts`):
- "student moves an assessment through the lifecycle and logs a mark"
- "oversized file rejected without a request"
- "spoofed file rejected by the server"
- "upload then download works"
- "another student's assessment shows not found"
- "axe clean in light and dark at 360 and 1440"
- staging only: "upload survives redeploy"

## Open questions

- No backend task exists to delete a single upload. Add `DELETE /academics/uploads/{id}` or the count limit cannot be relieved without deleting the assessment.
- Upload limits (10 MB per file and JPG, PNG, WebP, HEIC, HEIF, PDF, all as in 43f9faa; the 10-file cap is new) must be enforced identically by BE-SK-30 and BE-ACA-39, including magic-byte signatures for WebP and HEIC.
- 43f9faa had `DELETE /api/academic-planning/assessments/{id}/uploads/{uploadId}`; the rebuild backlog has no matching slice yet (see above).
- 43f9faa stored a tasks checklist on the assessment (JSON column, full-replacement PATCH). The rebuild needs either a `tasks` field on BE-ACA-30 and BE-ACA-35 or a small child table.
- 43f9faa linked each assessment to the Workspace (notes, math editor). The workspace is not in this backlog; confirm it is dropped for v1.
- Should a graded assessment allow moving back (to correct a wrong mark)? This file relies on `allowedTransitions` from the API.
