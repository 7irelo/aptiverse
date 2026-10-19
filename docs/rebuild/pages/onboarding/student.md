# Student onboarding

| | |
|---|---|
| ID | `PG-ONB-STU` |
| Route | `/onboarding` (student variant), steps via `?step=stage`, `details`, `subjects`, `goal` |
| Phase | 2 (subjects step lights up in Phase 4, goal step in Phase 7, both behind flags) |
| Roles | student (parent sees `PG-ONB-PAR`, admin is redirected to `/admin`) |
| Stages | high school, university (chosen on this page) |
| Entitlement | free |
| Depends on | BE-IDN-28, BE-IDN-31, BE-IDN-32, BE-IDN-33, BE-ACA-06, BE-ACA-13, BE-ACA-14, BE-PRG-04, FE-20, FE-24, FE-27, FE-63, SHL-02, UI-01, UI-02, UI-03, UI-04, UI-05, UI-10, UI-21 |
| Old app reference | `43f9faa:web/src/app/onboarding/page.tsx` (single client page: level toggle "High school" or "University / college", curriculum, grade, institution search backed by the old `GET institutions` list, `onboarding_completed` event, then dashboard; signed-out visitors sent to login, completed profiles sent straight in) |
| Status | Not started. No route exists under `web/src/app/(app)/onboarding/`. `web/src/proxy.ts` already lists `/onboarding/:path*` in its matcher but does nothing yet. The Identity domain model (`User.CompleteOnboarding`, `EducationLevel`, `Grade`, `YearOfStudy`, `Curriculum`, `InstitutionName`, `OnboardingCompletedAt`) exists in `api/src/Modules/Identity`; no endpoints exist yet. |

## Purpose

Collect the few academic facts that make everything after sign-up correct: whether the student is in high school or at university or college, their grade and curriculum or their year and institution, and (once Phase 4 lands) their first subjects or courses. Sign-up stays short because this lives here. The page must be quick (under a minute), resumable, editable later in Settings, and must never show high school words to a university student or the reverse.

## User stories

- As a new student, I want to say whether I am in high school or at university so the app uses the right words and content for me.
- As a high school learner, I want to give my grade and whether I write NSC or IEB so practice is pitched at my level.
- As a university or college student, I want to give my institution and year of study so my courses and practice fit my level.
- As a student, I want to pick my first subjects (or add my first course) so my dashboard is not empty on day one.
- As a student, I want to skip the optional steps and finish later without losing what I already entered.
- As a student who closed the tab halfway, I want to come back to the step I left.
- As a student on a slow connection, I want a clear message and a retry when a save fails, never a lost form.

## Layout

The page sits in the auth shell (SHL-02): wordmark at the top, one centred column, no app navigation (the student has no usable app yet).

### Mobile (360px)

Top to bottom, 16px gutters, one column:

1. Wordmark (links to nothing during onboarding, so a stray tap cannot leave the flow).
2. Stepper: text "Step 1 of 2" (count adjusts to flags), a segmented bar under it, `nav aria-label="Setup progress"`.
3. `h1` for the step, then a one-line description.
4. Step body:
   - `stage`: two large option cards (full width, at least 64px tall, radio semantics).
   - `details` (high school): Grade select, Curriculum select with hint, School text field (optional), Date of birth (day, month, year selects).
   - `details` (university): Institution text field, Level of study select (First year to PhD, decision 19), Programme text field (optional, only once the API supports it), Date of birth (day, month, year selects).
   - `subjects` (high school): checkbox list of CAPS subjects grouped (Languages, Mathematics, Other subjects), selected count line, search field when the list is longer than 12.
   - `subjects` (university, rendered by `courses-step.tsx`): inline "Add a course" form (name, code optional), list of courses added so far.
   - `goal`: one optional goal form.
5. Inline error area (`role="alert"`) directly above the actions when a save fails.
6. Actions, stacked full width: main button ("Continue", or "Finish" on the last step) then secondary "Back" (hidden on step 1). "Skip for now" as a text button under them on optional steps only.
7. Footnote: "You can change this later in Settings."

### Desktop (1440px)

- Same single column, max width 480px (`max-w-md`), centred, top padding 64px. Forms never stretch wide.
- Actions sit in one row: "Back" left, main button right.
- Stage cards sit side by side (two columns) from `sm:` up.
- Subjects list becomes two columns from `md:` up; the selected count stays above the list.
- No side panel or illustration: the auth shell's split layout (SHL-02) is used only on sign-up and log in, onboarding stays focused.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/onboarding/page.tsx` | server | Reads `getSessionUser()` (`web/src/lib/auth`), redirects admin to `/admin`, renders student or parent variant by role, validates `?step=` |
| Loading | `web/src/app/(app)/onboarding/loading.tsx` | server | Stepper skeleton plus two field skeletons (`components/ui/skeleton.tsx`) |
| Error boundary | `web/src/app/(app)/onboarding/error.tsx` | client | `PageError` from `components/shell/page-error.tsx`, Sentry capture, retry |
| Layout | `web/src/app/(app)/onboarding/layout.tsx` | server | Uses the auth shell from SHL-02 instead of the app shell; `robots: noindex` metadata |
| Onboarding state loader | `web/src/features/onboarding/server/get-onboarding-state.ts` | server | Calls BE-IDN-28 `GET /me` with the session token, parses with the generated zod schema, returns profile plus resolved step |
| Step resolver | `web/src/features/onboarding/lib/resolve-step.ts` | shared (pure) | `resolveStep(profile, flags, requested)` returns the step to render and the step list; unit tested |
| Server actions | `web/src/features/onboarding/server/actions.ts` | server | `saveStageAction`, `saveDetailsAction`, `completeOnboardingAction`; token attached server-side, refreshes the session after completion |
| Stepper | `web/src/features/onboarding/components/onboarding-stepper.tsx` | server | "Step 2 of 4", `ol` with `aria-current="step"`, segmented bar purely decorative (`aria-hidden`) |
| Stage step | `web/src/features/onboarding/components/stage-step.tsx` | client | Two option cards as a Radix radio group (`components/ui` radio from UI-02), submits `saveStageAction` |
| High school step | `web/src/features/onboarding/components/high-school-step.tsx` | client | `useZodForm` plus `SelectField` and `TextField` from `components/common/form-fields.tsx` |
| University step | `web/src/features/onboarding/components/university-step.tsx` | client | Same helpers; programme field rendered only when `flags.onboardingProgramme` is on |
| Subjects step | `web/src/features/onboarding/components/subjects-step.tsx` | client | Catalog list with checkboxes, generated TanStack hooks via `/api/bff` |
| Courses step | `web/src/features/onboarding/components/courses-step.tsx` | client | Inline add-course form, generated TanStack mutation via `/api/bff` |
| Goal step | `web/src/features/onboarding/components/goal-step.tsx` | client | One goal form, generated mutation via `/api/bff` |
| Step actions | `web/src/features/onboarding/components/step-actions.tsx` | client | Back, Continue or Finish, Skip; disables while pending, shows a spinner inside the button (UI-01 loading) |
| Inline alert | `web/src/components/shell/page-state.tsx` (`icon="error"`) or a small `role="alert"` block | server | Used for save failures inside the form |
| Button, Card, Badge, Select, Input, Checkbox | `web/src/components/ui/*` | mixed | Kit primitives only |
| Toast | `web/src/components/ui/sonner.tsx` | client | "You are all set" on arrival at `/dashboard` |

## Data

All reads are per user and request-time. Nothing on this page uses `"use cache"` except the public CAPS catalog.

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/me` (BE-IDN-28) | GET | `roles`, `educationLevel` (`high_school` or `tertiary`), `grade`, `studyLevel`, `yearOfStudy`, `curriculum` (`nsc` or `ieb`, decision 29), `isMinor`, `institutionName`, `onboardingCompletedAt`, `name` (greeting only) | none (no-store, wrapped in React `cache()` for the request) |
| `/academics/catalog?curriculum=&grade=` (BE-ACA-06) | GET | `subjects[]`: `id`, `name`, `group`, `isLanguage` | `"use cache"`, `cacheLife("days")`, tag `academics:catalog:<curriculum>:<grade>` (public data, safe to share) |

Mutations:

| Endpoint (BE ID) | Method | Request fields | Called from | Notes |
|---|---|---|---|---|
| `/me/onboarding/level` (BE-IDN-31) | PUT | `educationLevel` | `saveStageAction` | Idempotent PUT. Changing level clears the other stage's fields on the API side |
| `/me/onboarding/details` (BE-IDN-32) | PUT | high school: `grade` (8 to 12), `curriculum` (`nsc` or `ieb`, decision 29), `institutionName?`, `dateOfBirth`; university: `studyLevel`, `institutionName`, `programme?` (pending BE), `dateOfBirth` (decision 30) | `saveDetailsAction` | Idempotent PUT |
| `/me/onboarding/complete` (BE-IDN-33) | POST | none | `completeOnboardingAction` | Safe to repeat (`OnboardingCompletedAt ??= now` in the domain model) |
| `/academics/units/caps` (BE-ACA-13) | POST | `subjectIds[]` | subjects step via `/api/bff` | Needs `Idempotency-Key` header or a set semantics (enrolling twice in the same subject is a no-op) |
| `/academics/units/courses` (BE-ACA-14) | POST | `name`, `code?`, `studyLevel` (from profile), `duration` | courses step via `/api/bff` | `Idempotency-Key` per form submit |
| `/progress/goals` (BE-PRG-04) | POST | goal type and target per BE-PRG-02 | goal step via `/api/bff` | `Idempotency-Key` per submit |

Error mapping: the API returns RFC 9457 ProblemDetails with `detail`, `code` and `errors` (field to messages). `errors` keys map to form fields; `detail` shows in the inline alert. Never replace them with a generic message.

## States

| State | When | Exact copy |
|---|---|---|
| Loading | Session and `/me` loading | Skeleton only; screen reader text "Loading your setup" |
| Populated, stage step | No `educationLevel` saved | h1 "Where are you studying?"; description "This sets up your subjects and the words we use. You can change it later in Settings."; option 1 "High school" / "Grade 8 to 12, NSC or IEB"; option 2 "University or college" / "Any year of study" |
| Populated, high school details | Level is `high_school` | h1 "Your school details"; description "So practice matches your grade."; fields "Grade", "Curriculum" (hint "Not sure? Most public schools write the NSC."), "School (optional)" (hint "Only shown on your profile."), "Date of birth" (hint "We use this to follow the law on learners under 18. It is never shown to anyone.") |
| Populated, university details | Level is `tertiary` | h1 "Your studies"; description "So your courses and practice match your year."; fields "University or college", "Level of study", "Programme (optional)", "Date of birth" (same hint as high school) |
| Populated, subjects (high school) | Flag on, details saved | h1 "Pick your subjects"; description "Choose the subjects you take this year. You can add more later."; count line "{n} selected" |
| Populated, courses (university) | Flag on, details saved | h1 "Add your first course"; description "Start with one. You can add the rest from Subjects."; fields "Course name", "Course code (optional)"; button "Add course" |
| Populated, goal | Flag on | h1 "Set a first goal"; description "Optional. Something small you can check off this term." |
| Empty catalog | Catalog returns zero subjects | Title "We do not have subjects for this grade yet"; text "Skip for now and add them from Subjects later."; action "Skip for now" |
| Catalog error | Catalog request fails | Title "We could not load the subject list"; text "Check your connection and try again, or skip and add subjects later."; actions "Try again", "Skip for now" |
| Save error (network or 5xx) | Server action or BFF call fails | "We could not save that. Check your connection and try again." Form values kept |
| Validation error (400) | API rejects a field | The API's `errors[field]` text under the field, the API's `detail` in the alert |
| Rate limited (429) | Too many saves | The API's `detail`; fallback "Too many attempts. Wait a minute and try again." |
| Page error | `/me` fails (error.tsx) | Title "We could not load your setup"; text "This is on our side, not yours. Try again in a moment."; button "Try again" |
| Forbidden | Not a student or parent | Admin: redirect to `/admin`, no copy. Signed out: proxy redirect to `/login?next=/onboarding` |
| Already complete | `onboardingCompletedAt` set | Redirect to `/dashboard`, no copy |
| Upgrade | Not applicable (free) | none |
| No evidence | Not applicable | none |
| Completion | Finish succeeds | Redirect to `/dashboard`, toast "You are all set. Your dashboard will fill in as you log marks and practise." |

## Stage variants

| | High school | University or college |
|---|---|---|
| Details fields | Grade (8 to 12), Curriculum (NSC (CAPS) or IEB), School (optional), Date of birth | University or college (required), Level of study (First year, Second year, Third year, Fourth year, Honours, Masters, PhD), Programme (optional, pending BE), Date of birth |
| API values | `educationLevel=high_school`, `grade`, `curriculum`, `institutionName?` | `educationLevel=tertiary`, `yearOfStudy`, `institutionName` |
| Step 3 | CAPS subject picker from the catalog (BE-ACA-06, BE-ACA-13) | Create a course (BE-ACA-14) |
| Words used | Grade, NSC, IEB, subjects, school | Year of study, institution, courses |
| Words never used | courses, year of study, GPA | Grade, matric, NSC, IEB, SBA, APS, subjects |

Institution is required for university students because tertiary courses are institution-scoped; it is optional for high school learners (data minimisation: the school name is not needed for any feature in v1).

## Interactions and edge cases

- Step routing: `?step=` is validated server-side by `resolveStep`. Requesting a step whose prerequisites are missing (for example `details` with no level) renders the furthest allowed step instead, without an error.
- Resume: arriving at `/onboarding` with no `step` opens the first incomplete step. Saved values prefill every field.
- Back: goes to the previous step with saved values intact. Back on the first step is not shown.
- Changing stage after saving details: selecting the other option shows a confirm line under the cards, "Switching clears the details you entered for {High school | University or college}." and saving proceeds only on "Switch". The API clears the other stage's fields.
- Skip: only on `subjects` and `goal`. Skipping records `onboarding_skipped` and moves on. Details are never skippable because practice depends on them.
- Finish: the last visible step's main button is "Finish". It calls `completeOnboardingAction`, which also refreshes the session so `proxy.ts` (FE-27) stops redirecting. If the refresh fails, the action still redirects to `/dashboard`; proxy then re-reads `/me` once before redirecting back (no loop).
- Flags off (Phase 2 default): steps are `stage`, `details`; the stepper reads "Step 1 of 2" and "Step 2 of 2"; "Finish" sits on `details`.
- Double submit: the main button disables on first press and shows a spinner; the server action ignores a second identical call (idempotent PUT); BFF mutations carry an `Idempotency-Key`.
- Slow network: after 8 seconds pending, the button label reads "Still saving..." (no ellipsis character, three full stops are allowed as plain text) and stays disabled; on timeout the save error shows and values stay.
- Browser back button: steps are URL-addressed, so browser back moves between steps; no unsaved data is lost because each step saves on Continue.
- Two tabs: the later save wins; the API's `xmin` concurrency rejects a stale write with 409, shown as "Your details changed in another tab. Reload to see the latest." with a "Reload" button.
- Grade 8 and 9 learners: the catalog returns Senior Phase subjects; no FET-only subjects shown. Grade 10 to 12 see FET subjects.
- IEB learners: the catalog is queried with `curriculum=ieb` and returns the same CAPS list as NSC (decision 29: CAPS is the curriculum both exam bodies follow).
- Institution text: trimmed, max 200 characters (API `InstitutionMaxLength`), rendered as text only, never as HTML.
- Signed-out mid-flow: a server action returning 401 redirects to `/login?next=/onboarding?step=<current>` after a session refresh fails.
- Name: not asked again (it was given at sign-up; WCAG 2.2 redundant entry).

- Institution search (from 43f9faa): the old page offered a searchable institution list (`GET /api/academic/institutions`) rather than free text, which matters because tertiary courses are institution-scoped. The rebuild shows a combobox of known institutions with a free-text fallback ("My institution is not listed"), once a public institutions endpoint exists (open question 8); until then it stays a plain text field.
- The old page's "Couldn't save that. Please try again." is replaced by the specific error copy in States; its toggle label "University / college" is replaced by "University or college" (no slashes in copy).

## Copy

- Stepper: "Step {n} of {total}"
- Stage: "Where are you studying?", "This sets up your subjects and the words we use. You can change it later in Settings.", "High school", "Grade 8 to 12, NSC or IEB", "University or college", "Any year of study"
- Switch warning: "Switching clears the details you entered for {stage}." Buttons "Switch", "Keep {stage}"
- High school: "Your school details", "So practice matches your grade.", "Grade", "Grade 8" to "Grade 12", "Curriculum", "NSC (CAPS)", "IEB", "Not sure? Most public schools write the NSC.", "School (optional)", "Only shown on your profile."
- University: "Your studies", "So your courses and practice match your year.", "University or college", "Level of study", "First year", "Second year", "Third year", "Fourth year", "Honours", "Masters", "PhD", "Programme (optional)", "Date of birth", "We use this to follow the law on learners under 18. It is never shown to anyone.", "For example BCom Accounting"
- Subjects: "Pick your subjects", "Choose the subjects you take this year. You can add more later.", "{n} selected", "Search subjects"
- Courses: "Add your first course", "Start with one. You can add the rest from Subjects.", "Course name", "Course code (optional)", "Add course", "Added"
- Goal: "Set a first goal", "Optional. Something small you can check off this term."
- Actions: "Continue", "Back", "Skip for now", "Finish", "Still saving..."
- Footnote: "You can change this later in Settings."
- Errors: as in States. Field validation fallbacks (used only when the API returns no message): "Choose your grade", "Choose your curriculum", "Enter your university or college", "Choose your level of study", "Enter your date of birth", "Check your date of birth", "Keep this under 200 characters"
- Completion toast: "You are all set. Your dashboard will fill in as you log marks and practise."
- Metadata title: "Set up your account"

## Acceptance criteria

1. Given a signed-in student with no `educationLevel`, when they open any `(app)` route, then they are redirected to `/onboarding` and see "Where are you studying?".
2. Given the stage step, when the student picks "High school" and presses Continue, then `PUT /me/onboarding/level` is sent with `high_school` and the high school details step shows with Grade, Curriculum and School fields.
3. Given the high school details step, when the student submits without a grade, then the field shows "Choose your grade" and no request is sent.
4. Given valid high school details and flags off, when the student presses Finish, then details and complete calls succeed, the student lands on `/dashboard` and the toast shows.
5. Given a university student, when the details step renders, then no text on the page contains "Grade", "NSC", "IEB", "matric", "SBA" or "APS".
6. Given a high school learner, when any step renders, then no text contains "course", "year of study" or "GPA".
7. Given the API returns 400 with `errors.institutionName = ["..."]`, when the student submits, then that exact message shows under the institution field and the API `detail` shows in the alert.
8. Given the network drops during a save, when the student presses Continue, then the save error copy shows, the entered values remain and pressing Continue again retries.
9. Given a student who saved their stage and closed the tab, when they return to `/onboarding`, then the details step opens with their stage applied.
10. Given a student with `onboardingCompletedAt` set, when they open `/onboarding`, then they are redirected to `/dashboard`.
11. Given an admin, when they open `/onboarding`, then they are redirected to `/admin`.
12. Given the subjects flag on and an empty catalog, when the subjects step loads, then "We do not have subjects for this grade yet" shows with "Skip for now".
13. Given the student double-taps Continue, when the first request is pending, then only one request reaches the API.
14. Given flags off, when the stepper renders, then it reads "Step 1 of 2" on the stage step.
15. Given `?step=goal` with no level saved, when the page loads, then the stage step renders.

## Production readiness

Security
- Every onboarding write goes to `/me/...`, so the API derives the user from the token; the page never sends a user id. The server action attaches the access token server-side; the browser never sees it (FE-29).
- CSRF: profile saves are Next server actions (built-in origin check); BFF mutations (subjects, courses, goal) inherit the BFF's same-origin and session checks (FE-25).
- `?step=` is parsed against an allowlist; unknown values fall back to the resolved step. No profile data ever goes in the URL.
- Free text (institution, programme, course name) is trimmed and length-limited client-side by the generated zod schema and server-side by the API validator; it is rendered as text, never `dangerouslySetInnerHTML`.
- Logs and Sentry: no names, institution names, grades or emails in breadcrumbs or tags (OBS-06 redaction). Tags carry only `route=/onboarding`, `step`, `stage`.

Performance
- JS for `/onboarding` under 150 KB gzip: only the active step's client component loads (each step is its own client leaf; the stepper is server-rendered).
- LCP under 2.5s on a throttled mobile profile: the h1 and stepper render on the server; `/me` is a single fast call.
- The catalog is cached by curriculum and grade (tag `academics:catalog:<curriculum>:<grade>`); prefetched on the server when the details step saves so the subjects step renders without a client fetch.
- No images on this page.

Resilience
- API down on load: `error.tsx` with retry. API down on save: inline error, values kept, retry by pressing Continue again.
- Partial failure: if details save but `complete` fails, the next visit resumes at the last step and Finish retries `complete` only (it is idempotent).
- Subjects or courses failure never blocks completion: the student can skip and add them from Subjects.
- Enforcement kill switch: `flags.onboardingEnforced` (default on). Turning it off makes `proxy.ts` stop redirecting incomplete students, so a broken onboarding never locks students out of the app.

Observability
- `error.tsx` reports to Sentry with `route` and `step` tags. Server actions wrap API calls so failures are captured with the trace id from the ProblemDetails response.
- Trace propagation: the server fetcher forwards `traceparent` to the API so a failed save links to its API trace in Grafana (OBS-01).
- Analytics (consent-gated `track()`, FE-63): `onboarding_step_completed` {step, stage}, `onboarding_skipped` {step}, `onboarding_completed` {stage, subject_count}. No names, emails, school names or free text.

Accessibility (WCAG 2.2 AA)
- Stage cards are a radio group with arrow-key navigation and visible focus; each card's label includes its description.
- Errors are announced (`role="alert"`), linked to fields with `aria-describedby`, and focus moves to the first invalid field on submit.
- Target size at least 44px for all controls; focus is never hidden behind sticky elements (2.4.11); no information is asked twice (3.3.7); no drag interactions.
- The stepper exposes progress as text, not colour alone.

Privacy and POPIA
- Many students are minors. Collect only what features need: grade, curriculum, institution. School name is optional and explained.
- Analytics run only after consent (FE-63), and for under-18 users follow HRD-33. No profile values go to analytics or Sentry.

SEO
- Authenticated route: `robots: { index: false, follow: false }` in the layout metadata; excluded from the sitemap.

Rollout
- Phase 2 ships with `flags.onboardingSubjects` and `flags.onboardingGoal` off. Turn each on per environment (dev, then staging, then prod) when Phase 4 and Phase 7 endpoints are live.
- Release onboarding to staging first with the two test personas (high school, university), then prod. Rollback by Vercel instant rollback to the previous deployment (HRD-03), or turn off `flags.onboardingEnforced` if only the redirect misbehaves.

Monitoring
- Sentry issue alert: more than 5 errors in 10 minutes tagged `route=/onboarding`.
- Grafana (OBS-02) panels for `PUT /me/onboarding/level`, `PUT /me/onboarding/details`, `POST /me/onboarding/complete`: rate, p95 latency, 4xx and 5xx ratio. Alert when 5xx exceeds 2% over 15 minutes.
- Vercel Analytics funnel: `onboarding_step_completed` (stage) to `onboarding_completed`. Alert (daily check, HRD-51) when completions drop to zero in 24 hours while sign-ups are non-zero.

## Build tasks

- [ ] **PG-ONB-STU-01** Stage step: High school or University or college, two option cards as a radio group, saves via `saveStageAction` (BE-IDN-31)
- [ ] **PG-ONB-STU-02** High school details step: Grade 8 to 12, NSC (CAPS) or IEB with hint, school optional (BE-IDN-32)
- [ ] **PG-ONB-STU-03** University details step: institution (required), level of study First year to PhD (decision 19) (BE-IDN-32)
- [ ] **PG-ONB-STU-04** Withdrawn: stage removed from v1 scope (REBUILD_PLAN product rules). ID kept so it is never reused.
- [ ] **PG-ONB-STU-05** Subjects step (high school): CAPS picker from `GET /academics/catalog`, grouped checkboxes, enrol via `POST /academics/units/caps` (BE-ACA-06, BE-ACA-13)
- [ ] **PG-ONB-STU-06** Goal step (optional): one goal via `POST /progress/goals` (BE-PRG-04), behind `flags.onboardingGoal`
- [ ] **PG-ONB-STU-07** Stepper component: "Step n of total", `ol` with `aria-current`, count driven by the resolved step list
- [ ] **PG-ONB-STU-08** Courses step (university): inline add-course form via `POST /academics/units/courses` (BE-ACA-14), list of added courses
- [ ] **PG-ONB-STU-09** Back navigation between steps with saved values prefilled
- [ ] **PG-ONB-STU-10** Skip for now on optional steps, recording `onboarding_skipped`
- [ ] **PG-ONB-STU-11** Resume: no `step` param opens the first incomplete step
- [ ] **PG-ONB-STU-12** Route files: `page.tsx` with role switch (student, parent variant, admin redirect), `layout.tsx` on the auth shell with noindex
- [ ] **PG-ONB-STU-13** `get-onboarding-state.ts` loader: `GET /me` with the session token, generated zod parse, request-scoped `cache()`
- [ ] **PG-ONB-STU-14** `resolve-step.ts` pure step resolver (profile, flags, requested step) with the allowlist
- [ ] **PG-ONB-STU-15** Server actions `saveStageAction` and `saveDetailsAction` with ProblemDetails to field error mapping
- [ ] **PG-ONB-STU-16** `completeOnboardingAction`: call BE-IDN-33, refresh the session so proxy stops redirecting, redirect to `/dashboard`
- [ ] **PG-ONB-STU-17** Page-side guard: completed student on `/onboarding` redirects to `/dashboard` (complements FE-27)
- [ ] **PG-ONB-STU-18** Stage switch confirm line and clearing of the other stage's fields
- [ ] **PG-ONB-STU-19** Completion toast on `/dashboard` after Finish
- [ ] **PG-ONB-STU-20** Programme field (optional) behind `flags.onboardingProgramme`, blocked on a BE task adding `programme` to BE-IDN-02 and BE-IDN-32
- [ ] **PG-ONB-STU-21** Flags wiring: `onboardingSubjects`, `onboardingGoal`, `onboardingProgramme`, `onboardingEnforced` read through `web/src/lib/flags.ts`
- [ ] **PG-ONB-STU-22** Empty catalog and catalog error states in the subjects step, each with Skip for now
- [ ] **PG-ONB-STU-23** Pending and slow states: disabled main button with spinner, "Still saving..." after 8 seconds, `Idempotency-Key` on BFF mutations
- [ ] **PG-ONB-STU-24** 409 concurrency message with Reload
- [ ] **PG-ONB-STU-25** Analytics events `onboarding_step_completed`, `onboarding_skipped`, `onboarding_completed` through the consent-gated `track()`
- [ ] **PG-ONB-STU-26** Catalog server prefetch after the details save (cache tag `academics:catalog:<curriculum>:<grade>`)
- [ ] **PG-ONB-STU-27** Institution combobox with known institutions and a "My institution is not listed" free-text fallback, behind a flag until a public institutions endpoint exists
- [ ] **PG-ONB-STU-28** Date of birth field on both details steps (decision 30): day, month and year selects, client bounds matching BE-IDN-33 (age 10 to 80 on the Johannesburg date), never sent to analytics or Sentry; the API derives `isMinor`
- [ ] **PG-ONB-STU-29** Migrated students with no date of birth (BE-IDN-62) are sent back to the details step on first sign-in with only the missing field shown

## Quality tasks

- [ ] **PG-ONB-STU-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (stepper skeleton), `error.tsx` (retry via `PageError`); no `not-found.tsx` needed (no id in the route)
- [ ] **PG-ONB-STU-Q02** Server loader in `src/features/onboarding/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ONB-STU-Q03** Mutations: profile steps through server actions, subject, course and goal mutations through `/api/bff` with generated TanStack hooks; pending states on every button
- [ ] **PG-ONB-STU-Q04** Empty state (empty catalog) with one clear next action ("Skip for now")
- [ ] **PG-ONB-STU-Q05** Error state copy: what went wrong and how to fix it, API `detail` and field errors shown verbatim
- [ ] **PG-ONB-STU-Q06** Forbidden handling: admin redirect, signed-out redirect with `next`; no upgrade state (free)
- [ ] **PG-ONB-STU-Q07** Stage-aware wording checked (no Grade, NSC, IEB, SBA, APS or matric wording for university students; no course, year of study or GPA wording for high school learners)
- [ ] **PG-ONB-STU-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-ONB-STU-Q09** Layout at 1440px (centred 480px column, actions in one row)
- [ ] **PG-ONB-STU-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ONB-STU-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ONB-STU-Q12** axe: zero violations in light and dark on every step
- [ ] **PG-ONB-STU-Q13** Keyboard pass: radio group arrows, visible focus, real buttons and links, one `h1` per step, headings in order
- [ ] **PG-ONB-STU-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering both stages, save error and resume
- [ ] **PG-ONB-STU-Q15** `generateMetadata` title "Set up your account"; no nav entry (auth shell)
- [ ] **PG-ONB-STU-Q16** WCAG 2.2 checks: focus not obscured, redundant entry (name not asked again), focus moves to the first invalid field
- [ ] **PG-ONB-STU-Q17** Bundle check: `/onboarding` JS under 150 KB gzip; Lighthouse mobile LCP under 2.5s
- [ ] **PG-ONB-STU-Q18** Slow 3G and offline Playwright run: values kept, retry works, no duplicate writes
- [ ] **PG-ONB-STU-Q19** Log and Sentry redaction check: no names, institutions or emails in breadcrumbs, tags or server logs
- [ ] **PG-ONB-STU-Q20** Analytics check: no events before consent, no PII in event props
- [ ] **PG-ONB-STU-Q21** Monitoring set up: Sentry alert, Grafana panels and alert for the three onboarding endpoints, funnel check documented in the runbook

## Tests

Unit (Vitest)
- `resolve-step.test.ts`: "starts at stage when no level is saved", "opens details after stage", "skips subjects and goal when flags are off", "falls back to the furthest allowed step for an unknown or premature step param", "returns step totals of 2, 3 and 4 by flags".
- `actions.test.ts`: "maps ProblemDetails errors to fields", "keeps the API detail as the alert text", "treats 409 as a concurrency message", "refreshes the session after complete".
- `high-school-step.test.tsx`: "requires grade and curriculum", "defaults curriculum to nsc (shown as NSC, CAPS curriculum)", "shows the NSC hint".
- `university-step.test.tsx`: "requires institution and year", "renders no high school words", "hides programme when the flag is off".
- `stage-step.test.tsx`: "shows the switch warning when changing a saved stage".
- `onboarding-stepper.test.tsx`: "announces the current step as text".

Playwright (`web/e2e/onboarding-student.spec.ts`, mobile projects first)
- "high school learner completes onboarding and lands on the dashboard"
- "university student completes onboarding and never sees high school words"
- "incomplete student is redirected to onboarding from the dashboard"
- "completed student is redirected away from onboarding"
- "admin is redirected to the admin area"
- "save failure keeps the form values and retry succeeds"
- "API validation message is shown under the field"
- "resume opens the details step after a reload"
- "double tap on Continue sends one request"
- "subjects step shows skip when the catalog is empty" (flag on)
- "onboarding has no accessibility violations in light and dark"
- "onboarding fits 360px without sideways scrolling"

## Open questions

1. The domain model completes onboarding in one call (`User.CompleteOnboarding`), while the backlog splits BE-IDN-31, 32 and 33. Either keep three endpoints (each step saves) or collapse into one `PUT /me/onboarding` plus complete. This page assumes three; resume depends on per-step saves.
2. No `programme` field exists on `User`. DESIGN_BRIEF asks university students for it. Recommend optional and add it to BE-IDN-02 and BE-IDN-32; until then PG-ONB-STU-20 stays behind a flag.
3. Decided (19): university students give a study level (First year, Second year, Third year, Fourth year, Honours, Masters, PhD) stored as `studyLevel`; undergraduate levels also set `yearOfStudy`, postgraduate levels leave it null (BE-IDN-33). No "Postgraduate" catch-all and no NQF level.
4. Decided (29): the stored value is the exam body (`nsc` or `ieb`) and CAPS is the curriculum both follow, so BE-ACA-06 returns the CAPS list for both; IEB-only subjects are not in the v1 seed.
5. Should switching stage after Phase 4 also unenrol units of the old stage, or keep them hidden? Affects the switch warning copy.
6. Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84), no third-party flag service.
7. `proxy.ts` needs to know onboarding completion without calling `/me` on every request: put an `onboardingComplete` claim in the session (FE-22, FE-27) and refresh it in `completeOnboardingAction`.
8. Decided (DECISIONS E): tertiary courses are shared per institution, so courses must be scoped to a real institution id. A public `GET /academics/institutions` search is needed in Academics (request to the backend owner; the institution combobox is PG-ONB-STU-27).
