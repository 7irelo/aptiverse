# Subjects and courses

| | |
|---|---|
| ID | `PG-STU-UNITS` |
| Route | `/dashboard/subjects` |
| Phase | 4 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-06, BE-ACA-13, BE-ACA-14, BE-ACA-15, BE-ACA-17, BE-ACA-18, BE-IDN-28; FE-24, FE-25, UI-01 to UI-07, UI-22, UI-24, UI-25, UI-33 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/subjects/page.tsx`, `43f9faa:web/src/app/(app)/dashboard/courses/page.tsx` |
| Status | Not started. Nav entry "Subjects" exists in `web/src/components/shell/nav-config.ts`. Backend (Academics) not started. |

## Purpose

One page for everything a student studies. High-school students pick CAPS subjects from the catalog for their curriculum (NSC or IEB) and grade. University students add courses with a study level (First year to PhD) and a duration; courses are shared per institution, so the first student to add one creates it and others reuse it. Both are "study units" underneath (`academics.study_units`, `kind` = `caps_subject` or `tertiary_course`), and a student only ever sees the path that matches their stage.

## User stories

- As a Grade 11 NSC student, I add my seven subjects from the official list without typing names.
- As a first-year university student, I add a course with its code, year and duration.
- As a student, I see each unit with my progress and the next topic to work on, or "No marks yet".
- As a student, I can rename a course, or remove a unit I dropped, after confirming what happens to its data.
- As a student following an old bookmark to `/dashboard/courses`, I land on this page.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` "Subjects" (HS) or "Courses" (uni); description; primary action "Add subjects" or "Add course" (full width under the title).
2. Unit list: one `UnitCard` per unit (name, level chip, progress bar or "No marks yet", next topic, next due assessment), each card a link to `/dashboard/subjects/[id]` with an overflow menu (Edit, Remove).
3. Footer note (HS only): "Subjects come from the CAPS catalog for {curriculum} Grade {grade}."

Add and edit open a `ResponsiveDialog` (bottom sheet on mobile, dialog on desktop).

### Desktop (1440px)

`PageShell width="default"`. Header action sits right of the title. Cards in a 3-column grid (`lg:grid-cols-3`, `sm:grid-cols-2`). Sheet becomes a centred dialog 560px wide.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/subjects/page.tsx` | server | `PageShell`, `Suspense` around the list |
| Loading | `web/src/app/(app)/dashboard/subjects/loading.tsx` | server | `PageLoading cards={6}` |
| Error | `web/src/app/(app)/dashboard/subjects/error.tsx` | client | `PageError` with `retry` |
| Units loader | `web/src/features/academics/server/get-units.ts` | server | BE-ACA-15, tag `academics:units:<userId>` |
| Catalog loader | `web/src/features/academics/server/get-catalog.ts` | server | BE-ACA-06, shared cache (catalog is public per curriculum and grade), tag `academics:catalog:<curriculum>:<grade>` |
| Unit card | `web/src/features/academics/components/unit-card.tsx` | server | `Card`, `Badge`, `Progress` |
| Unit list | `web/src/features/academics/components/unit-list.tsx` | server | grid, empty state |
| Unit actions menu | `web/src/features/academics/components/unit-actions-menu.tsx` | client | `DropdownMenu`, real buttons |
| Add CAPS sheet | `web/src/features/academics/components/add-caps-subjects-sheet.tsx` | client | `ResponsiveDialog` (UI-07) |
| Catalog picker | `web/src/features/academics/components/caps-catalog-picker.tsx` | client | search input, grouped checkboxes |
| Course form sheet | `web/src/features/academics/components/course-form-sheet.tsx` | client | create and edit, `useZodForm`, `TextField`, `SelectField` |
| Remove dialog | `web/src/features/academics/components/remove-unit-dialog.tsx` | client | `ConfirmDialog` destructive variant |
| Mutation hooks | `web/src/features/academics/hooks/use-enrol-caps.ts`, `use-create-course.ts`, `use-update-unit.ts`, `use-remove-unit.ts` | client | wrap generated TanStack hooks via `/api/bff`, then `router.refresh()` |
| Label helper | `web/src/features/academics/lib/unit-labels.ts` | shared | stage nouns, level formatting ("Grade 11", "Second year") |
| Redirects | `web/next.config.ts` | config | `/dashboard/courses` and `/dashboard/courses/:id` permanent redirects |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/units` (BE-ACA-15) | GET | `items[] { id, kind, name, code or null, level { grade or null, studyLevel or null }, duration or null, progress { percent or null, evidenceCount }, nextTopic { id, name } or null, nextAssessment { id, title, dueAt } or null }` | user-scoped, tag `academics:units:<userId>` |
| `/academics/catalog?curriculum=&grade=` (BE-ACA-06) | GET | `subjects[] { code, name, group (language, compulsory, elective), isHomeLanguageEligible }` | shared, revalidate 1 day, tag `academics:catalog:<curriculum>:<grade>` |
| `/me` (BE-IDN-28) | GET | `educationLevel`, `curriculum`, `grade`, `institution` | session |

Mutations (client, through `/api/bff`, each sends an `Idempotency-Key` header):

| Endpoint (BE ID) | Method | Request | On success |
|---|---|---|---|
| `/academics/units/caps` (BE-ACA-13) | POST | `{ subjectCodes: string[] }` | toast "{n} subjects added", refresh |
| `/academics/units/courses` (BE-ACA-14) | POST | `{ institutionId, name, code?, studyLevel, duration }` | toast "Course added", refresh |
| `/academics/units/{id}` (BE-ACA-17) | PATCH | `{ name?, code?, studyLevel?, duration?, version }` | toast "Changes saved", refresh |
| `/academics/units/{id}` (BE-ACA-18) | DELETE | none | toast "{name} removed", refresh |

Every mutation revalidates `academics:units:<userId>` and `progress:dashboard:<userId>`.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | 6 skeleton cards |
| Empty (HS) | no units | title "Add your subjects"; body "Pick the subjects you take this year. You can change them later."; action "Add subjects" |
| Empty (uni) | no units | title "Add your first course"; body "Add the courses you are registered for this semester."; action "Add course" |
| Error | loader fails | `PageError` defaults |
| Catalog error | catalog read fails inside the sheet | "We could not load the subject list. Try again." button "Try again" |
| Forbidden | non-student | proxy redirect; fallback `PageForbidden` |
| No evidence | `progress.percent` null | "No marks yet" |
| Mutation pending | submit pressed | button shows spinner, label "Adding..." / "Saving..." / "Removing...", disabled |
| Mutation failed | 5xx or network | inline alert in the sheet "That did not save. Check your connection and try again." form values kept |
| Conflict | 409 on PATCH (stale `version`) | "This course changed somewhere else. We loaded the latest version." form reloads |
| Populated | units exist | grid of cards |

## Stage variants

| Item | High school | University |
|---|---|---|
| Title and noun | "Subjects", subject | "Courses", course |
| Add flow | CAPS catalog picker (multi-select) | course form (single create) |
| Level chip | "Grade 11" | "Second year" |
| Editable fields | none (remove only; name comes from the catalog) | name, code, study level, duration |
| Footer note | catalog source line | none |

A high-school student never sees the course form and a university student never sees the CAPS picker; the API enforces the same with one enrolment gate (BE-ACA-11) and returns 409 on the wrong path.

## Interactions and edge cases

- CAPS picker: search filters by name; groups "Languages", "Compulsory", "Electives"; already-enrolled subjects are checked and disabled with "Already added".
- Subject count guidance (warn, never block): Grades 10 to 12 "Most learners take 7 subjects."; Grades 8 to 9 "Most learners take 9 subjects." Shown under the picker when the selection is outside 6 to 9.
- Course form validation: name 2 to 120 characters; code optional, up to 20, letters, digits and spaces; study level from the 43f9faa list (First year to PhD, decision 19); no NQF level; duration "One semester" or "Full year (two semesters)"; lecturer optional, up to 80 characters. Duplicate name for the same student returns 409 with "You already have a course called {name}."
- Remove: dialog lists consequences from the API count fields: "This removes {name} from your list. Your {n} assessments and marks stay in your records but stop counting towards averages and predictions. You can add it back later." Confirm button "Remove {noun}". For a course, the institution's shared course stays for other students (43f9faa rule); only the student's enrolment goes.
- Study level (43f9faa list, read by the generator): First year, Second year, Third year, Fourth year, Honours, Masters, PhD. Duration (43f9faa): "One semester" or "Full year (two semesters)"; a course moves to "Past courses" on its own at start plus six months per semester, and the student's "Mark finished" or "Reopen" always overrides that.
- Courses are shared per institution in 43f9faa (the first student to add "Calculus I" at UCT creates it, others reuse it, deduplicated by a slug of the name). The course form suggests existing institution courses while typing.
- Double tap on submit sends one request (button disabled while pending plus idempotency key).
- Closing the sheet with unsaved changes asks "Discard changes?".
- Stage changed in settings after units exist: page shows units of the old kind read-only with notice "Your study level changed. Remove these to add {new noun}s." (API decides; see open questions).

## Copy

- HS header description: "The subjects you take this year."
- Uni header description: "The courses you are registered for."
- Picker title: "Add subjects"; submit "Add {n} subjects"
- Course form title: "Add course" / "Edit course"; submit "Add course" / "Save changes"
- Toasts: "{n} subjects added", "Course added", "Changes saved", "{name} removed"

## Acceptance criteria

- Given a Grade 11 NSC student with no units, when they open the picker, select 7 subjects and submit, then 7 cards appear and each shows "No marks yet".
- Given a university student, when they open `/dashboard/subjects`, then the title is "Courses" and the add action opens the course form, not the catalog.
- Given a high-school student, when they call the course create path through the BFF, then the API returns 409 and the UI shows the stage message.
- Given a course card, when the student removes it and confirms, then the card disappears, a toast shows, and the dashboard no longer lists it after refresh.
- Given an old bookmark `/dashboard/courses`, when it is opened, then the browser lands on `/dashboard/subjects` with a 308.
- Given a slow network, when the student double-taps "Add course", then exactly one course is created.

## Production readiness

- Security: BE-ACA-17 and BE-ACA-18 check ownership server-side and return 404 for another user's unit id; the UI never trusts a unit id from the query string for writes. Course names are rendered as text (React escaping), never as HTML. All writes go through the BFF so the session cookie is never sent cross-site to the API (CSRF covered by same-origin BFF plus SameSite cookie).
- Performance: list is server-rendered; only the actions menu and sheets are client. Sheets and the catalog picker are dynamically imported on open, keeping route JS under 80 KB gzip. Catalog cached for a day in the shared cache because it holds no personal data.
- Resilience: idempotency keys on create; `version` (xmin) on PATCH; failed mutations keep form values; catalog failure is contained to the sheet.
- Observability: analytics `units_add_opened { stage }`, `units_caps_enrolled { count }`, `units_course_created`, `units_removed { kind }`. Sentry tags `page:subjects`, `mutation:<name>`. Traces from the BFF to BE-ACA routes.
- Accessibility (WCAG 2.2 AA): picker checkboxes are real inputs grouped in `fieldset` with `legend`; search result count announced; the sheet traps focus and returns it to the trigger.
- Privacy and POPIA: units are low-sensitivity academic data, but analytics never include unit names or codes typed by the student.
- Rollout: ships with Phase 4 behind `academics.units` flag for internal accounts; redirect rule ships in the same release. Rollback: flag off shows the previous placeholder; redirects are harmless to keep.
- Monitoring: Grafana panel for BE-ACA-13 and BE-ACA-14 4xx and 5xx rates; alert when 409 stage-mismatch responses exceed 1% of unit writes (signals onboarding data or UI drift).

## Build tasks

- [ ] **PG-STU-UNITS-01** Server loader `get-units.ts` (BE-ACA-15) and the unit list with progress bar and next topic
- [ ] **PG-STU-UNITS-02** Stage labels in `unit-labels.ts` ("Subjects" for high school, "Courses" for university) used by title, actions and copy
- [ ] **PG-STU-UNITS-03** Add CAPS subjects sheet (opens the catalog picker, submits BE-ACA-13)
- [ ] **PG-STU-UNITS-04** Create course sheet (name, code, study level, duration) submitting BE-ACA-14
- [ ] **PG-STU-UNITS-05** Edit course (reuse the course form sheet in edit mode, PATCH with `version`)
- [ ] **PG-STU-UNITS-06** Empty state per stage guides first setup
- [ ] **PG-STU-UNITS-07** Permanent redirects from the old `/dashboard/courses` and `/dashboard/courses/[id]` to `/dashboard/subjects` and `/dashboard/subjects/[id]`
- [ ] **PG-STU-UNITS-08** E2E: high-school path (catalog enrol, card shows "No marks yet")
- [ ] **PG-STU-UNITS-09** Unit card component (name, level chip, progress or "No marks yet", next topic, next assessment)
- [ ] **PG-STU-UNITS-10** Catalog loader `get-catalog.ts` (BE-ACA-06) with shared cache and tag
- [ ] **PG-STU-UNITS-11** Catalog picker: search, grouping, already-added disabled, count guidance
- [ ] **PG-STU-UNITS-12** Remove unit dialog with consequence copy, BE-ACA-18 (split from 05)
- [ ] **PG-STU-UNITS-13** Unit actions menu (Edit for courses, Remove for both)
- [ ] **PG-STU-UNITS-14** Mutation hooks with idempotency key, pending state, `router.refresh()` and tag revalidation
- [ ] **PG-STU-UNITS-15** Course form zod schema (generated schema plus client refinements) and unit tests
- [ ] **PG-STU-UNITS-16** Conflict (409 version) and stage-mismatch (409 path) handling with copy
- [ ] **PG-STU-UNITS-17** Unsaved-changes guard on the sheets
- [ ] **PG-STU-UNITS-18** E2E: university path (create, edit, remove course)
- [ ] **PG-STU-UNITS-19** Analytics events listed above through the consent-gated tracker
- [ ] **PG-STU-UNITS-20** Flag `academics.units` and rollback note
- [ ] **PG-STU-UNITS-21** Grafana panel and alert for unit write errors and stage-mismatch rate
- [ ] **PG-STU-UNITS-22** Dynamic import of sheets and picker; route JS budget 80 KB gzip in Lighthouse CI
- [ ] **PG-STU-UNITS-23** Institution picker shown before a university student can add courses (search, grouped as Universities, Universities of Technology, Private colleges), saved through BE-IDN-32 (from 43f9faa courses page)
- [ ] **PG-STU-UNITS-24** Curriculum and grade picker shown when a high-school student has none set, before the catalog (from 43f9faa subjects page)
- [ ] **PG-STU-UNITS-25** Optional teacher (high school) or lecturer (university) per unit: field in the add and edit flows, shown on the card (43f9faa `StudentSubject.Teacher`, `StudentCourse.Lecturer`)
- [ ] **PG-STU-UNITS-26** Duplicate guard in the course form: warn when a course with the same name (case-insensitive) or the same code is already on the list
- [ ] **PG-STU-UNITS-27** Mark course finished and reopen (overflow menu, "Finished" chip), with automatic move to past at start plus six months per semester
- [ ] **PG-STU-UNITS-28** "Past courses" section, collapsed by default, below active courses
- [ ] **PG-STU-UNITS-29** Stage switch prompt ("At university or college?" or "Actually in high school?") linking to the education level setting (BE-IDN-31)
- [ ] **PG-STU-UNITS-30** Catalog grouped by CAPS category with a "Compulsory" chip on compulsory subjects
- [ ] **PG-STU-UNITS-31** Course name suggestions from the institution's shared course list while typing, to keep the emergent registry free of duplicates such as "Calc 1" and "Calculus I"
- [ ] **PG-STU-UNITS-32** Study level select with the 43f9faa values (First year to PhD) and duration select (one semester, full year); align the level chip and the course form schema (PG-STU-UNITS-15) to them

## Quality tasks

- [ ] **PG-STU-UNITS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`)
- [ ] **PG-STU-UNITS-Q02** Server loaders in `src/features/academics/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-UNITS-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending and failed states
- [ ] **PG-STU-UNITS-Q04** Empty state with one clear next action per stage
- [ ] **PG-STU-UNITS-Q05** Error state copy: page, catalog and mutation level
- [ ] **PG-STU-UNITS-Q06** Forbidden state (no upgrade state: free page)
- [ ] **PG-STU-UNITS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-UNITS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); sheet usable with the keyboard open
- [ ] **PG-STU-UNITS-Q09** Layout at 1440px (3-column grid, dialog)
- [ ] **PG-STU-UNITS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-UNITS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-UNITS-Q12** axe: zero violations in light and dark, sheet open and closed
- [ ] **PG-STU-UNITS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order, focus returns after sheet closes
- [ ] **PG-STU-UNITS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-UNITS-Q15** `generateMetadata` title "Subjects" or "Courses" by stage; nav entry active on this route and unit detail

## Tests

Unit (Vitest):
- `unit-labels.test.ts`: "high school noun is subject", "university level reads Second year"
- `course-form-schema.test.ts`: "rejects an unknown study level", "accepts Honours", "accepts empty code", "rejects 121 character name"
- `caps-catalog-picker.test.tsx`: "filters by search", "disables already added", "shows count guidance outside 6 to 9"
- `unit-card.test.tsx`: "null progress renders No marks yet and no bar"

Playwright (`web/e2e/student/subjects.spec.ts`):
- "high-school student enrols seven CAPS subjects"
- "university student creates, edits and removes a course"
- "double tap on add creates one course"
- "old courses URL redirects to subjects"
- "catalog failure is contained to the sheet"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- Decided (27): the university noun is "Courses" (matching the BE name, tertiary courses). The static nav label stays "Subjects" for everyone until BE-NAV-01 returns a stage-aware label.
- What happens to existing units when a student changes education level in settings (BE-IDN-31)? The API must define it; this page assumes the old units become read-only until removed.
- Does BE-ACA-15 return the removal consequence counts (assessments, attempts) or does the dialog need a second read?
- Decided (29): CAPS is the curriculum both NSC and IEB follow, so one CAPS seed serves both and the exam body is stored separately; IEB-only subjects are not in the v1 seed.
- Decided (DECISIONS E): tertiary courses are shared per institution (emergent; the first student creates one, others reuse it), as in 43f9faa. This page relies on the institution picker (PG-STU-UNITS-23) and a course search for suggestions.
- Decided (19): study level (First year, Second year, Third year, Fourth year, Honours, Masters, PhD) plus duration (one semester or full year), no NQF level, used by BE-ACA-10, this page and the practice level line.
- No BE task covers "finished" courses (an `is_finished` flag or end date on the enrolment) or the teacher and lecturer fields.
