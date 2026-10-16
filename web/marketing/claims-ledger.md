# Claims ledger

The single reference for what paid marketing is allowed to say. Every
line here was checked against the code, not against older copy. If a
claim is not on the green list, it does not go in an ad.

Checked on 2026-07-22 against `api/Controllers/`, the entitlements
catalogue seeder, and the `web/src/app` routes.

## How to read this

An entitlement flag is not a feature. The plan catalogue
(`EntitlementsCatalogSeeder.cs`) seeds flags such as `sba.coach`,
`exam.simulator`, `audio.explanations`, `study_plan.ai`,
`ai_debrief.weekly`, `past_papers.solved` and `career_navigator`. Each
of those strings appears exactly once in the codebase, in the seeder,
with no controller, service or route behind it. They are placeholders
for a roadmap, and several of them leak into the plan descriptions the
pricing API returns. Do not treat a flag as evidence a feature exists.

## Green list: real, verified, advertisable

| Claim | Evidence |
|---|---|
| CAPS subject catalogue for high school, self-created courses for tertiary | `AcademicPlanningController` `GET curricula`, `GET curricula/{id}/subjects`, `POST subjects/custom`, `GET/POST courses`, `GET institutions` |
| Tertiary students enrol in their own institution's courses, not a fixed curriculum | `POST /api/academic/courses`, `Course` entity keyed `institutionId:slug` |
| AI practice tests generated against a real logged assessment | `POST /api/practice/tests/generate`, refuses without a valid `assessmentId` owned by the student |
| Practice difficulty pitched at the student's actual level, including tertiary year of study | `GenerateTest` sets `levelHint` from the student's `Course` study level; `isTertiary` branch |
| Monthly practice generation quota, metered | `IUsageMeter.TryConsumeAsync(userId, "practice.generate")`, returns 402 with used/limit |
| One attempt per practice test, timed, with integrity handling | `POST tests/{id}/attempts`, `GET attempts/latest`, `PATCH attempts/{id}` |
| A full exam paper: sections, marks per question, long-form written answers, marked against a memo with part marks | Added 2026-07-22. `PracticeTestGenerator` `case "exam"`; `FrontendQuestionDto.Marks` and `.Section`, served before submit so the student can budget the time; `PracticeService.MarkWrittenAnswersAsync` injects `Marking memo: {q.MarkingMemo ?? q.ExpectedAnswer}` and instructs the marker to work "strictly against the memo and award part marks the way a real marker does"; `FrontendScoreSummaryDto.MarksAwarded`/`MarksTotal` and `FrontendMarkedAnswerDto.MarksAwarded`/`MarksAvailable`; selectable as "Exam paper" on `/dashboard/practice`. Say what it does, not that a plan tier unlocks it: see the red-list note on `exam.simulator`. |
| Topic mastery computed from real practice results and graded work | `MasteryController.ComputeTopicMasteryAsync`, returns empty when there is no evidence |
| Term or period mark prediction from graded assessments weighted with practice mastery | `MasteryController` term prediction, requires `ActualMark != null` rows |
| Assessments and SBA tasks logged, weighted, graded, with file uploads | `AcademicPlanningController` assessments block plus `uploads` endpoints |
| Workspace drafts with autosave | `WorkspaceController` `GET/PUT drafts/{assessmentId}` |
| AI tutor with saved conversation history | `POST /api/ai/tutor`, `AiConversationsController` transcripts, capped at 20 per student |
| The AI tutor adapts its vocabulary to student type | `AiController` system prompt branches high school versus tertiary and is told not to say SBA, CAPS, NSC or matric to a tertiary user |
| Goals re-measured against real evidence on every read | `GoalsController`, "Every read re-measures against the evidence first" |
| Wellbeing diary and mood check-ins with a trend | `WellbeingController` `diary`, `mood`, `mood-trend`, `summary` |
| Study groups with members, roles, shared tasks and sessions | `StudyGroupsController`, full CRUD |
| Tutor marketplace with public profiles and real student reviews | `MarketplaceController` `tutors`, `tutors/{id}/reviews`, `POST reviews` |
| Tutoring jobs board: post a listing, tutors propose, poster accepts | `TutoringController` listings, proposals, accept, close |
| Connects economy for tutors | `TutoringController`: proposal costs 2 connects, monthly grant of 20, refreshed on read |
| Aptiverse takes no commission and never handles the tutoring payment | `TutoringController` header comment: "Aptiverse never touches money between them; the tutoring itself is arranged off-platform" |
| Student and tutor form a working connection, tutor sees academic context only after accepting | `BookingController` `connections`, `connections/{id}/student-context` |
| Parent linking by consented invite, read-only overview | `ParentLinksController` invites, accept, decline, `students/{id}/overview` |
| Admission and progression targets the student researches and enters | `AdmissionTargetsController`, free for every tier |
| Past papers as a subject-aware link-out to the official DBE archive | `web/src/app/(app)/dashboard/past-papers/page.tsx`, links education.gov.za, states Aptiverse does not host them |
| Self-serve subscription billing and plan changes | `PaymentsController`, `EntitlementsController` |

## Red list: cut, with the reason

Each of these appeared in `ad-copy.md`, the caption scripts, or the
plan descriptions the API returns. None may be used.

| Cut claim | Where it appeared | Why |
|---|---|---|
| "SBA Coach", rubric-aware feedback on a draft before submission | ad-copy variant 4, 30s and 60s and 90s captions | No such feature. `sba.coach` exists only as a seeder string. There is no rubric model, no draft analysis endpoint, no feedback generator. What is real: logging an SBA, uploading the file, saving a draft in the workspace, asking the AI tutor about it. That is a different, smaller promise. |
| "A real human counsellor", counsellor booking, psychologist sessions | captions 30s/60s/90s, ad-copy variant 3 | `WellbeingController.GetCounsellors` returns `Array.Empty` permanently. There is no counsellor roster, no booking, no session. Advertising a human on the other end when there is none is the single most dangerous claim in the set, because the person who clicks it may be in crisis. |
| "Cites your textbook", "cites Mind Action Series", citation chips | ad-copy variants 1 and 2, captions | Zero occurrences of citation logic anywhere in the API. The tutor returns prose. |
| "Marks past papers the way an examiner does", worked-solution walk-throughs | ad-copy variant 2, captions | `past_papers.solved` is a seeder flag only. Past papers are a link-out to the DBE archive. Aptiverse does not host, parse or mark them. |
| "Forecasts your child's matric mark with the confidence interval" | ad-copy variant 1, 90s captions | Mastery and term prediction are real, but they are a weighted projection from graded work and practice, computed only when evidence exists, with no confidence interval and no matric-final model. Say "a projection from the marks already in", never "a forecast of the matric result". |
| Mastery confidence bands | audit finding, visual assets | Not computed. `ComputeTopicMasteryAsync` returns a level, not a band. |
| "Auto parent reports via WhatsApp", "contextual WhatsApp tutor" | ad-copy variant 5, `student.max` plan description from the API | There is no WhatsApp integration: no transport, no webhook, no template approval. `EntitlementsController` says so explicitly and the meter was removed. |
| SARS-ready income export | ad-copy variant 5 | `tutor.sars_export` is a seeder flag with no implementation. |
| AI lesson plans, AI worksheets, auto parent reports, per-client mastery for tutors | ad-copy variant 5, 90s captions | `tutor.lesson_plans_ai`, `tutor.worksheets_ai`, `tutor.parent_reports_auto`, `tutor.mastery_per_client`, `tutor.sba_marker_ai` are all seeder-only strings. |
| "0% commission tier", implying other tiers take a cut | ad-copy variant 5 description | Misleading in the other direction. Every tier is zero commission, including free. `commissionPercent` is null on every plan. The correct line is that Aptiverse never takes a cut, on any plan. |
| Careers matching with salaries | `CareersController` | Returns `Array.Empty`. The DTO has an `averageSalary` field that is never populated. |
| Tutor session booking, availability slots, calendar | `BookingController`, `CalendarController` | `bookings`, `availability`, `calendar/events`, `calendar/reminders` all return `Array.Empty`. Connections are real, scheduling is not. |
| Teacher classes, assignments, verifications, live view, gap analysis | `AcademicPlanningController.GetClasses`, `GoalsController.GetVerifications` | Both return `Array.Empty`. The teacher surface is a shell. |
| School admin analytics, readiness reports, SSO, success manager | `school` plan flags | No implementation. This is the independent reason the schools motion is not ready, separate from the commercial sequencing decision. |
| Admin moderation queue | `ModerationController` | Returns `Array.Empty`. |
| Audit log feed | `AuditController` | Returns `Array.Empty`. |
| Audio explanations, study-plan AI, weekly AI debrief | `student.max` plan description returned by the pricing API | Seeder flags only. This is a live problem: the pricing page renders a plan description that promises features that do not exist. See blockers. |
| `exam.simulator` as a paid entitlement | `student.max` plan description | The FLAG is still seeder-only: nothing gates on it, so no plan copy may say a tier unlocks an exam simulator. The BEHAVIOUR, however, now ships to everyone who can generate a test, and is on the green list above. Describe the paper; never sell the flag. |
| Cambridge curriculum support | ad-copy variants 1, 2 and 4, captions | Not in the curriculum catalogue. Do not list Cambridge. |
| Offline support | audit finding | Nothing implements it. Connectivity is a real user problem, but the honest framing is "light on data", not "works offline". |
| Bursaries, anything bursary-adjacent | removed from the platform | Never reintroduce, in any material, even as an aside. |

## Careful list: real but easy to overstate

- **Mark projection.** Real, but only once graded work exists, and it is
  arithmetic, not machine learning. Never present it as a prediction of a
  final national result and never attach a guarantee.
- **Admission targets.** The student researches and enters the
  requirements. Aptiverse does not hold a database of what any university
  wants. Copy must say "track the requirements you are aiming at", not
  "we know what UCT requires".
- **Tutor discoverability.** A profile is listed and searchable. Nothing
  guarantees enquiries. Never imply a client volume.
- **The AI tutor.** Strong and curriculum aware, but it can be wrong, and
  it has no citations. Do not frame it as authoritative.
- **Study groups.** Tasks and sessions are real. There is no group chat
  and no live video. Do not imply either.
- **Wellbeing.** A private diary, mood check-ins and a trend. It does not
  detect crisis, does not intervene, and does not alert anyone. Do not
  imply monitoring or rescue.

## Facts about the SA context to verify before flight

These are used as framing, not as claims about the product, but a
competitor or a platform reviewer can still challenge them. Confirm each
against a current source before any ad goes live, and drop any that
cannot be sourced rather than softening it.

- The school-based assessment share of the final NSC mark in most
  subjects, and the exceptions.
- The current NSC and IEB examination timetable windows.
- The standard semester and examination structure at the universities we
  name, including supplementary and deferred windows.

No invented statistics anywhere. If a number cannot be sourced, the ad
does not use a number.
