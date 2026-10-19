# Edit assessment

| | |
|---|---|
| ID | `PG-STU-ASMT-EDIT` |
| Route | `/dashboard/assessments/[id]/edit` |
| Phase | 4 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-34, BE-ACA-35, BE-ACA-38; PG-STU-ASMT-NEW (shared form, schema, hooks); PG-STU-ASMT-DETAIL-14 (delete dialog); UI-03, UI-13, UI-25 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/assessments/[id]/edit/page.tsx`, `43f9faa:web/src/app/(app)/dashboard/assessments/AssessmentForm.tsx` |
| Status | Not started. Backend (Academics) not started. |

## Purpose

Change the details of an assessment (title, type, weight, due date, prediction, notes) or delete it. State changes and marks are not edited here; they belong to the lifecycle on the detail page, so the state machine stays in one place.

## User stories

- As a student, I fix a wrong due date after my teacher or lecturer moves the test.
- As a student, I update my predicted mark before the test.
- As a student, I delete an assessment I added by mistake, after confirming.
- As a student editing in two tabs, I am told if my copy is out of date instead of silently overwriting.

## Layout

### Mobile (360px)

1. Back link "Back to assessment" (to `/dashboard/assessments/[id]`).
2. `PageHeader`: `h1` "Edit assessment"; description "Changes save to this assessment straight away."
3. Shared form prefilled (same field order as PG-STU-ASMT-NEW, without the programme picker). Unit is read-only text with hint "To move this to another {noun}, delete it and add it again." (see open questions)
4. Sticky bottom bar: "Save changes" (primary, disabled until something changes), "Cancel".
5. Danger zone card at the end: `h2` "Delete assessment", one sentence, "Delete assessment" destructive button.

### Desktop (1440px)

`PageShell width="narrow"`. Form card as on the new page; danger zone as a separate card below with a destructive outline button.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/assessments/[id]/edit/page.tsx` | server | awaits `params`, `notFound()` on 404 |
| Loading, error, not found | `.../[id]/edit/loading.tsx`, `error.tsx`, `not-found.tsx` | mixed | not found may be inherited from `[id]` |
| Loader | `web/src/features/assessments/server/get-assessment.ts` | server | shared with detail |
| Form | `web/src/features/assessments/components/assessment-form.tsx` | client | `mode="edit"`, prefilled, unit locked |
| Diff helper | `web/src/features/assessments/lib/diff-assessment.ts` | shared | builds a PATCH body with changed fields only |
| Update hook | `web/src/features/assessments/hooks/use-update-assessment.ts` | client | BE-ACA-35 with `version` |
| Delete dialog | `web/src/features/assessments/components/delete-assessment-dialog.tsx` | client | shared with detail |
| Leave guard | `web/src/features/assessments/hooks/use-unsaved-changes-guard.ts` | client | shared |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/assessments/{id}` (BE-ACA-34) | GET | `id, title, type, unit { id, name, kind }, weightPercent, dueAt, predictedPercent, notes, state, version, uploads.length` | tag `academics:assessment:<id>` |

Mutations:

| Endpoint (BE ID) | Method | Request | On success |
|---|---|---|---|
| `/academics/assessments/{id}` (BE-ACA-35) | PATCH | changed fields only plus `version` | revalidate assessment, list, calendar and dashboard tags; redirect to detail; toast "Changes saved" |
| `/academics/assessments/{id}` (BE-ACA-38) | DELETE | none | revalidate list, calendar, dashboard; redirect to `/dashboard/assessments`; toast "Assessment deleted" |

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | form skeleton |
| Not found | 404 or not owner | "We could not find that assessment" / "It may have been deleted." / "Back to assessments" |
| Error | loader fails | `PageError` defaults |
| Unchanged | no edits yet | save disabled, no message |
| Saving | PATCH pending | "Saving...", form read-only |
| Field and server errors | as PG-STU-ASMT-NEW | same copy |
| Conflict | 409 stale `version` | dialog "This assessment changed somewhere else" body "Load the latest version? Your changes here will be replaced." buttons "Load latest" / "Keep editing" |
| Deleting | DELETE pending | dialog button "Deleting...", disabled |
| Delete failed | network or 5xx | "That did not delete. Try again." inside the dialog |
| Failed save | network or 5xx | "That did not save. Your changes are still here. Try again." |

## Stage variants

Same as PG-STU-ASMT-NEW (unit label, type list, weight hint). No programme picker on edit for either stage.

## Interactions and edge cases

- PATCH sends only changed fields so concurrent edits to other fields are not overwritten; `version` still guards the whole row.
- Changing the due date of an assessment with a reminder: the server reschedules the reminder (BE-ACA-53); the page shows hint "Your reminder moves with the new date."
- Editing a graded assessment: title, notes and weight remain editable; due date shows a hint that the mark is kept.
- Delete copy counts files: "This deletes the assessment, its mark and {n} files. This cannot be undone."
- After delete, the browser back button to the edit URL shows not found (not a stale form).
- Clearing the time field resets it to 23:59 SAST, same as create.

## Copy

- Header description: "Changes save to this assessment straight away."
- Danger zone: "Delete this assessment and everything attached to it."
- Delete dialog title: "Delete {title}?" confirm "Delete assessment" cancel "Keep it"

## Acceptance criteria

- Given an assessment, when the page opens, then every field shows the saved value and "Save changes" is disabled.
- Given the student changes only the weight, when saving, then the PATCH body contains `weightPercent` and `version` only.
- Given another tab saved first, when this tab saves, then the conflict dialog appears and "Load latest" shows the other tab's values.
- Given the student confirms delete, when it succeeds, then they land on the list with toast "Assessment deleted" and the item is gone.
- Given another student's assessment id, when the edit URL is opened, then not found renders.

## Production readiness

- Security: BE-ACA-35 and BE-ACA-38 enforce ownership; `unitId` is not patchable from this page; notes rendered as text. All writes through the BFF.
- Performance: one read; form island shared with the new page so the chunk is cached between the two routes. Route JS under 100 KB gzip.
- Resilience: changed-fields PATCH plus `version`; delete is idempotent on the server (second delete returns 404, treated as success with the same redirect).
- Observability: analytics `assessment_edited { fieldsChanged: count }`, `assessment_deleted { hadUploads }`, `assessment_edit_conflict`. Sentry tag `page:assessment-edit`; no form values in events.
- Accessibility (WCAG 2.2 AA): conflict dialog focuses its heading; delete dialog's destructive button is not the default focus.
- Privacy and POPIA: deletion removes files from S3 via the backend; the page copy says so honestly.
- Rollout: behind `academics.assessments`. Rollback: flag off.
- Monitoring: Grafana panel for BE-ACA-35 409 rate (a spike suggests a bug in `version` handling) and BE-ACA-38 errors.

## Build tasks

- [ ] **PG-STU-ASMT-EDIT-01** Reuse the shared form in edit mode, prefilled, unit locked
- [ ] **PG-STU-ASMT-EDIT-02** Delete with confirm from the danger zone (reuses the detail page dialog), redirect to the list (split from 01)
- [ ] **PG-STU-ASMT-EDIT-03** Page, loader and not-found handling
- [ ] **PG-STU-ASMT-EDIT-04** `diff-assessment.ts` changed-fields PATCH builder with unit tests
- [ ] **PG-STU-ASMT-EDIT-05** Update hook with `version`, redirect and tag revalidation
- [ ] **PG-STU-ASMT-EDIT-06** Conflict dialog ("Load latest" or "Keep editing")
- [ ] **PG-STU-ASMT-EDIT-07** Save disabled until dirty; unsaved-changes guard
- [ ] **PG-STU-ASMT-EDIT-08** Hints for reminders moving and graded assessments
- [ ] **PG-STU-ASMT-EDIT-09** Analytics events listed above
- [ ] **PG-STU-ASMT-EDIT-10** Grafana panel for edit conflicts and delete errors
- [ ] **PG-STU-ASMT-EDIT-11** Edit-mode note under the form: "To change the status or log a mark, use the steps on the assessment page." with a link (replaces the 43f9faa status dropdown that students could not find)

## Quality tasks

- [ ] **PG-STU-ASMT-EDIT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`), `not-found.tsx` (own or inherited)
- [ ] **PG-STU-ASMT-EDIT-Q02** Server loader shared from `src/features/assessments/server/`, validated with the generated zod schema
- [ ] **PG-STU-ASMT-EDIT-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending, failed and conflict states
- [ ] **PG-STU-ASMT-EDIT-Q04** No empty state (route always has a record); not-found covers missing records
- [ ] **PG-STU-ASMT-EDIT-Q05** Error copy for save, delete and conflict
- [ ] **PG-STU-ASMT-EDIT-Q06** Forbidden handled as not-found; no upgrade state (free page)
- [ ] **PG-STU-ASMT-EDIT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-ASMT-EDIT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-STU-ASMT-EDIT-Q09** Layout at 1440px
- [ ] **PG-STU-ASMT-EDIT-Q10** Light and dark both correct (OS-driven); destructive styles use rose tokens
- [ ] **PG-STU-ASMT-EDIT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-ASMT-EDIT-Q12** axe: zero violations in light and dark, dialogs open
- [ ] **PG-STU-ASMT-EDIT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-ASMT-EDIT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering save, conflict, delete and not-found
- [ ] **PG-STU-ASMT-EDIT-Q15** `generateMetadata` title "Edit {title}"; nav "Assessments" active

## Tests

Unit (Vitest):
- `diff-assessment.test.ts`: "only weight changed", "clearing notes sends null", "no changes returns empty body", "due time cleared becomes 23:59 SAST"
- `assessment-form.test.tsx` (edit mode): "save disabled until dirty", "unit is read-only"

Playwright (`web/e2e/student/assessment-edit.spec.ts`):
- "student changes the due date and sees it on the detail page"
- "two tabs produce a conflict dialog"
- "student deletes an assessment"
- "another student's edit URL shows not found"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- Should the unit be changeable on edit? BE-ACA-35 would need to re-check ownership of the new unit and move topics; this file locks it.
- The 43f9faa edit form also edited status and actual mark directly. This rebuild moves both to the lifecycle on the detail page (PG-STU-ASMT-DETAIL-20 and 21) so state and mark cannot drift; confirm.
- 43f9faa re-armed the due reminder whenever the due date changed (a moved assessment is reminded again). BE-ACA-53 must do the same; PG-STU-ASMT-EDIT-08 already shows the hint.
- Delete is a soft delete in BE-ACA-18 for units; confirm whether BE-ACA-38 is soft or hard for assessments, and when S3 files are purged.
