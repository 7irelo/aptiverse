# New assessment

| | |
|---|---|
| ID | `PG-STU-ASMT-NEW` |
| Route | `/dashboard/assessments/new` (optional `?unit={id}`, `?date=YYYY-MM-DD`) |
| Phase | 4 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-05, BE-ACA-15, BE-ACA-32; PG-STU-ASMT-LIST-07 (`sast.ts`); UI-01, UI-02, UI-03, UI-13, UI-33 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/assessments/new/page.tsx`, `43f9faa:web/src/app/(app)/dashboard/assessments/AssessmentForm.tsx` |
| Status | Not started. Backend (Academics) not started. |

## Purpose

Log an assessment in under a minute. High-school students can start from their subject's SBA programme (task name, type and weight prefilled); university students enter their own. The form is shared with the edit page.

## User stories

- As a Grade 12 student, I pick "Mathematics" and choose "Term 2 Investigation" from the SBA programme so the weight is filled in for me.
- As a university student, I add "Assignment 2" for a course with its weight and due date and time.
- As a student coming from a unit page or a calendar day, the unit or date is already chosen.
- As a student on a bad connection, my half-filled form is not lost if the save fails.

## Layout

### Mobile (360px)

1. Back link "Assessments".
2. `PageHeader`: `h1` "Add assessment"; description "You can change any of this later."
3. Form, single column:
   1. Unit select ("Subject" or "Course"), required.
   2. HS only: "Start from the SBA programme" select (optional), listing tasks for the chosen subject and grade; choosing one fills title, type and weight.
   3. Title, required.
   4. Type select, required (stage-specific list).
   5. Weight (%) number input, optional, with hint.
   6. Due date (date picker) and Due time (time input, optional; default 23:59), shown in SAST with hint "South African time".
   7. Predicted mark (%) optional.
   8. Notes textarea optional.
4. Sticky bottom bar: "Save assessment" (primary), "Cancel" (link back).

### Desktop (1440px)

`PageShell width="narrow"`. Form in a `Card`, two-column rows for Type plus Weight and Date plus Time. Actions right-aligned at the card foot, not sticky.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/assessments/new/page.tsx` | server | loads units and (HS) programme, reads `searchParams` |
| Loading | `web/src/app/(app)/dashboard/assessments/new/loading.tsx` | server | form skeleton |
| Error | `web/src/app/(app)/dashboard/assessments/new/error.tsx` | client | `PageError` |
| Units loader | `web/src/features/academics/server/get-units.ts` | server | shared with PG-STU-UNITS |
| Programme loader | `web/src/features/assessments/server/get-sba-programme.ts` | server | BE-ACA-05 data via the catalog endpoint (see open questions) |
| Assessment form | `web/src/features/assessments/components/assessment-form.tsx` | client | shared with edit; `useZodForm`, `TextField`, `SelectField` |
| Programme picker | `web/src/features/assessments/components/sba-programme-select.tsx` | client | HS only |
| Due date field | `web/src/features/assessments/components/due-date-field.tsx` | client | date picker (UI-13) plus time input; converts with `sastDateTimeToUtc` |
| Form schema | `web/src/features/assessments/lib/assessment-form-schema.ts` | shared | extends the generated zod schema with client refinements |
| Problem mapper | `web/src/lib/api/problem-to-form-errors.ts` | shared | ProblemDetails `errors` to react-hook-form field errors |
| Create hook | `web/src/features/assessments/hooks/use-create-assessment.ts` | client | generated mutation via `/api/bff`, idempotency key per form session |
| Draft hook | `web/src/features/assessments/hooks/use-form-draft.ts` | client | sessionStorage draft, cleared on success |
| Leave guard | `web/src/features/assessments/hooks/use-unsaved-changes-guard.ts` | client | `beforeunload` plus in-app link interception |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/units` (BE-ACA-15) | GET | `items[] { id, name, kind, level { grade, curriculum } }` | tag `academics:units:<userId>` |
| SBA programme (BE-ACA-05 data, endpoint to confirm) | GET | `tasks[] { id, name, type, weightPercent, term }` per subject code and grade | shared, revalidate 1 day |

Mutation:

| Endpoint (BE ID) | Method | Request | Response | On success |
|---|---|---|---|---|
| `/academics/assessments` (BE-ACA-32) | POST, `Idempotency-Key` header | `{ unitId, title, type, weightPercent?, dueAt (UTC ISO), predictedPercent?, notes?, programmeTaskId? }` | `{ id }` | revalidate `academics:assessments:<userId>`, `academics:calendar:<userId>`, `progress:dashboard:<userId>`; redirect to `/dashboard/assessments/{id}`; toast "Assessment added" |

Validation (client and server match): title 2 to 120 characters; type from the stage list; weight 0 to 100 with up to one decimal; predicted 0 to 100; notes up to 2 000 characters; due date between 1 January of last year and 31 December of next year.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | form skeleton |
| No units | student has no units | title "Add your {nouns} first"; body "Assessments belong to a {noun}."; action "Add {nouns}" |
| Field error | invalid input on blur or submit | "Give the assessment a title.", "Weight must be between 0 and 100.", "Pick a due date.", "Pick a {noun}." |
| Submitting | pressed save | button "Saving...", disabled, form read-only |
| Server validation | 400 with `errors` | messages placed on the matching fields; summary at the top "Check the highlighted fields." |
| Failed | network or 5xx | alert "That did not save. Your details are still here. Try again." button stays enabled |
| Draft restored | draft found on load | inline note "We restored what you were typing." button "Start over" |
| Programme unavailable | programme read fails | select hidden, hint "The SBA programme is not available right now. You can still add the details yourself." |
| Error (page) | units read fails | `PageError` defaults |

## Stage variants

| Item | High school | University |
|---|---|---|
| Unit label | "Subject" | "Course" |
| Programme picker | shown when the subject and grade have programme data | never shown |
| Types (43f9faa lists) | Test, Essay, Investigation, Practical, Exam, Project, Oral | Assignment, Class test, Test, Tutorial, Lab report, Practical, Midterm, Exam, Essay, Project, Presentation |
| Page title | "Add SBA" | "Add assessment" |
| Weight hint | "Share of your SBA mark for this subject." | "Share of your final mark for this course." |

## Interactions and edge cases

- `?unit=` preselects the unit only if it belongs to the student's list; otherwise it is ignored. `?date=` sets the due date (calendar day tap).
- Due time is optional; when left empty the saved value is 23:59 SAST on that date. The stored value is UTC; the conversion uses Africa/Johannesburg regardless of the browser zone.
- Choosing a programme task fills empty fields only; fields the student already typed are kept, and the student can still edit everything.
- A due date in the past is allowed (logging a finished task) with a hint "This date has passed. You can log the mark after saving."
- Weight totals over 100% for a unit are allowed but warned on the detail page, not blocked here.
- Double submit: button disabled while pending and one idempotency key per form session, so a retry after a timeout cannot create a duplicate.
- Draft: values saved to sessionStorage (never localStorage, so a shared device does not keep them after the tab closes) every 2 seconds while dirty.

## Copy

- Title placeholder HS: "For example, Term 2 Investigation"; uni: "For example, Assignment 2"
- Due time hint: "Optional. South African time. Leave empty for end of day."
- Save: "Save assessment"; cancel: "Cancel"
- Discard prompt: "Leave without saving? What you typed will be lost."

## Acceptance criteria

- Given a Grade 12 NSC student, when they pick Mathematics and a programme task, then title, type and weight fill in and remain editable.
- Given a due date of 24 October with no time, when saved from a browser in UTC, then the API receives `2026-10-24T21:59:00Z` (23:59 SAST).
- Given an empty title, when the student taps save, then the title field shows "Give the assessment a title." and no request is sent.
- Given the network drops on save, when the student retries after reconnecting, then exactly one assessment exists.
- Given a university student, when the form renders, then there is no programme picker and the type list has no "SBA task".
- Given `?unit=` set to another student's unit id, when the form renders, then no unit is preselected.

## Production readiness

- Security: BE-ACA-32 verifies the `unitId` belongs to the caller (404 otherwise); the web never trusts the query parameter for ownership. Notes are stored and rendered as plain text. Writes go through the BFF (same-origin, SameSite cookie) so no CSRF token is exposed to the browser.
- Performance: form is the only client island; the date picker is lazy-loaded on focus. Route JS under 100 KB gzip. Units and programme reads in parallel.
- Resilience: idempotent create; draft recovery; failed saves keep values; programme failure degrades to manual entry.
- Observability: analytics `assessment_create_started { stage, source: list or unit or calendar }`, `assessment_created { usedProgramme, hasTime }`, `assessment_create_failed { status }`. Sentry tag `page:assessment-new`; form values never attached to Sentry events.
- Accessibility (WCAG 2.2 AA): every input has a visible label; errors linked with `aria-describedby`; error summary focused on failed submit; date picker keyboard operable (UI-13).
- Privacy and POPIA: notes may contain personal information; excluded from analytics, logs and Sentry breadcrumbs. Draft in sessionStorage only.
- Rollout: behind `academics.assessments`. Rollback: flag off.
- Monitoring: Grafana panel for BE-ACA-32 400 and 5xx rates; alert when 400s exceed 5% of creates (client and server validation drift).

## Build tasks

- [ ] **PG-STU-ASMT-NEW-01** Form fields (unit, type, title, weight, due date and time, predicted mark, notes) in the shared `assessment-form.tsx`
- [ ] **PG-STU-ASMT-NEW-02** SBA programme prefill for high school (select task, fill empty fields)
- [ ] **PG-STU-ASMT-NEW-03** Page and loaders (units, programme) with `?unit=` and `?date=` preselection
- [ ] **PG-STU-ASMT-NEW-04** Form schema `assessment-form-schema.ts` extending the generated zod schema, with unit tests
- [ ] **PG-STU-ASMT-NEW-05** Due date field: date picker plus optional time, SAST conversion, 23:59 default
- [ ] **PG-STU-ASMT-NEW-06** Stage-specific type list and labels
- [ ] **PG-STU-ASMT-NEW-07** Create hook with idempotency key, pending state, redirect and tag revalidation
- [ ] **PG-STU-ASMT-NEW-08** `problem-to-form-errors.ts` mapping server validation to fields (shared helper)
- [ ] **PG-STU-ASMT-NEW-09** Draft save and restore in sessionStorage
- [ ] **PG-STU-ASMT-NEW-10** Unsaved-changes guard
- [ ] **PG-STU-ASMT-NEW-11** No-units state
- [ ] **PG-STU-ASMT-NEW-12** Analytics events listed above, without form contents
- [ ] **PG-STU-ASMT-NEW-13** Grafana panel and validation-drift alert for BE-ACA-32
- [ ] **PG-STU-ASMT-NEW-14** Due reminder hint under the due date: "We'll remind you 3 days before." when the student's assessment reminder preference is on, otherwise "Turn on reminders in Settings" link (43f9faa sends one reminder 3 days ahead, in-app, plus email when opted in)
- [ ] **PG-STU-ASMT-NEW-15** Optional "Already marked?" disclosure for logging a past assessment with its mark in one step (43f9faa allowed status and actual mark on create); on save the API stores it as graded
- [ ] **PG-STU-ASMT-NEW-16** Stage-specific page title ("Add SBA" or "Add assessment") and the 43f9faa type lists

## Quality tasks

- [ ] **PG-STU-ASMT-NEW-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`)
- [ ] **PG-STU-ASMT-NEW-Q02** Server loaders in `src/features/academics/server/` and `src/features/assessments/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-ASMT-NEW-Q03** Client mutation through `/api/bff` with the generated TanStack hook; pending and failed states
- [ ] **PG-STU-ASMT-NEW-Q04** Empty state (no units) with one clear next action
- [ ] **PG-STU-ASMT-NEW-Q05** Error copy: field, server validation and network failure
- [ ] **PG-STU-ASMT-NEW-Q06** Forbidden state (no upgrade state: free page)
- [ ] **PG-STU-ASMT-NEW-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-ASMT-NEW-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); sticky bar does not cover the focused field with the keyboard open
- [ ] **PG-STU-ASMT-NEW-Q09** Layout at 1440px
- [ ] **PG-STU-ASMT-NEW-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-ASMT-NEW-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-ASMT-NEW-Q12** axe: zero violations in light and dark, with errors showing
- [ ] **PG-STU-ASMT-NEW-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, error summary focus
- [ ] **PG-STU-ASMT-NEW-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering success, validation, network failure and no-units states
- [ ] **PG-STU-ASMT-NEW-Q15** `generateMetadata` title "Add assessment"; nav "Assessments" active

## Tests

Unit (Vitest):
- `assessment-form-schema.test.ts`: "title required", "weight 100.1 rejected", "weight 12.5 accepted", "notes 2001 characters rejected", "due date range enforced"
- `due-date-field.test.tsx`: "empty time saves 23:59 SAST", "14:00 SAST from a UTC browser saves 12:00Z"
- `problem-to-form-errors.test.ts`: "maps camelCase keys", "unknown keys go to the summary"
- `sba-programme-select.test.tsx`: "fills only empty fields"

Playwright (`web/e2e/student/assessment-new.spec.ts`):
- "high-school student adds an assessment from the SBA programme"
- "university student adds an assignment with a due time"
- "offline save keeps values and retry creates one assessment"
- "draft is restored after reload"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- There is no read endpoint for SBA programme data (BE-ACA-05 is data only). Either extend BE-ACA-06 to return programme tasks per subject and grade, or add `GET /academics/catalog/{subjectCode}/programme`.
- 43f9faa allowed an initial status and an actual mark on create. PG-STU-ASMT-NEW-15 keeps that as an optional disclosure; BE-ACA-32 must accept an optional mark and set the state to graded server-side.
- Reminder lead time (3 days in 43f9faa) and the per-student preference need a BE-ACA-53 and BE-NTF-06 decision.
- Confirm the 23:59 SAST default with the backend so calendar and reminders agree.
