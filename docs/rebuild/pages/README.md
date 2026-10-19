# Pages

One file per page. Every file follows the page template in `../CONVENTIONS.md`: purpose, user stories, layout at 360px and 1440px, components with file paths, data contract, every state with exact copy, stage variants, edge cases, acceptance criteria, production readiness, build tasks, quality tasks and tests.

Routes follow `web/src/components/shell/nav-config.ts`. Old-app references point at commit `43f9faa`.

**69 pages, 2863 tasks (7 done, 13 partial, 16 deferred by decisions).**

## Marketing (public)

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-MKT-ABOUT` | [About](marketing/about.md) | `/about` | 3 | 23 | 0 | 0 | 0 |
| `PG-MKT-AFF` | [Affiliates](marketing/affiliates.md) | `/affiliates`, `/affiliates/join` | 6 | 38 | 0 | 0 | 1 |
| `PG-MKT-CONTACT` | [Contact](marketing/contact.md) | `/contact` | 9 | 32 | 0 | 0 | 0 |
| `PG-MKT-FEAT` | [Features](marketing/features.md) | `/features` | 3 (content revised at the end of Phases 5 and 7 as features ship) | 35 | 0 | 0 | 0 |
| `PG-MKT-PAR` | [For parents](marketing/for-parents.md) | `/for-parents` (and 301 from `/for-families`) | 3 (built), switched on publicly with the parent track in Phase 8 | 29 | 0 | 0 | 0 |
| `PG-MKT-STU` | [For students](marketing/for-students.md) | `/for-students` | 3 (content revised as Phases 5 and 7 ship) | 29 | 0 | 0 | 0 |
| `PG-MKT-HELP` | [Help centre](marketing/help-centre.md) | `/help`, `/help/[slug]` | 1 (FAQ list), 9 (articles and search) | 36 | 5 | 6 | 0 |
| `PG-MKT-HOME` | [Home](marketing/home.md) | `/` | 3 (pricing teaser switched on in Phase 6) | 48 | 0 | 3 | 0 |
| `PG-MKT-LEGAL` | [Privacy and Terms](marketing/legal.md) | `/privacy`, `/terms` | 3 (pages), 10 (final POPIA review, HRD-30) | 41 | 0 | 0 | 0 |
| `PG-MKT-PRICE` | [Pricing](marketing/pricing.md) | `/pricing` | 6 | 37 | 0 | 0 | 0 |
| `PG-MKT-CAREERS` | [Universities and careers](marketing/universities-and-careers.md) | `/universities-and-careers` | 3 (built), planner section switched on with career targets in Phase 7 | 26 | 0 | 0 | 0 |

## Auth

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-AUTH-FORGOT` | [Forgot password](auth/forgot-password.md) | `/forgot-password` | 2 | 27 | 0 | 0 | 0 |
| `PG-AUTH-LOGIN` | [Log in](auth/login.md) | `/login` (query: `next`, `error`, `reason`) | 2 | 44 | 0 | 1 | 0 |
| `PG-AUTH-REG` | [Sign up](auth/register.md) | `/register` (query: `plan`, `billing`, `role`, `next`) | 2 (paid-plan checkout hand-off lights up in Phase 6) | 54 | 0 | 0 | 0 |
| `PG-AUTH-RESET` | [Reset password](auth/reset-password.md) | `/reset-password?token=` (link built by the API in `OneTimeTokens.cs`) | 2 | 29 | 0 | 0 | 0 |
| `PG-AUTH-VERIFY` | [Verify email](auth/verify-email.md) | `/verify-email?token=` (link built by the API in `OneTimeTokens.cs`, valid 48 hours by default) and `/verify-email` without a token (resend view) | 2 | 30 | 0 | 0 | 0 |

## Onboarding

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-ONB-PAR` | [Parent onboarding](onboarding/parent.md) | `/onboarding` (parent variant, same route as `PG-ONB-STU`, chosen by role) | 2 (explainer and exit), invite steps light up in Phase 8 behind `flags.parentInvites` | 41 | 0 | 0 | 0 |
| `PG-ONB-STU` | [Student onboarding](onboarding/student.md) | `/onboarding` (student variant), steps via `?step=stage`, `details`, `subjects`, `goal` | 2 (subjects step lights up in Phase 4, goal step in Phase 7, both behind flags) | 50 | 0 | 0 | 0 |

## Student app

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-STU-TUTOR` | [AI tutor](student/ai-tutor.md) | `/dashboard/tutor` (new conversation, `?unit=&topic=` sets context), `/dashboard/tutor/[conversationId]` | 5 | 52 | 0 | 0 | 1 |
| `PG-STU-ASMT-DETAIL` | [Assessment detail](student/assessment-detail.md) | `/dashboard/assessments/[id]` | 4 | 42 | 0 | 0 | 0 |
| `PG-STU-ASMT-EDIT` | [Edit assessment](student/assessment-edit.md) | `/dashboard/assessments/[id]/edit` | 4 | 26 | 0 | 0 | 0 |
| `PG-STU-ASMT-NEW` | [New assessment](student/assessment-new.md) | `/dashboard/assessments/new` (optional `?unit={id}`, `?date=YYYY-MM-DD`) | 4 | 31 | 0 | 0 | 0 |
| `PG-STU-ASMT-LIST` | [Assessments](student/assessments.md) | `/dashboard/assessments` | 4 | 40 | 0 | 0 | 0 |
| `PG-STU-CAL` | [Calendar and planner](student/calendar.md) | `/dashboard/calendar` (`?view=week or month or agenda&date=YYYY-MM-DD`) | 4 | 37 | 0 | 0 | 4 |
| `PG-STU-CAREER` | [Career and university planner](student/careers.md) | `/dashboard/careers` (optional `?target=<id>` opens one plan; `?new=1` opens the add dialog) | 7 | 58 | 0 | 0 | 0 |
| `PG-STU-DASH` | [Dashboard](student/dashboard.md) | `/dashboard` | 7 (interim Phase 4 version behind a flag, see PG-STU-DASH-13) | 42 | 0 | 2 | 0 |
| `PG-STU-DIARY` | [Diary](student/diary.md) | `/dashboard/diary` (optional `?entry=<id>` opens one entry; `?new=1` opens the composer) | 7 | 44 | 0 | 0 | 0 |
| `PG-STU-GOALS-DETAIL` | [Goal detail](student/goal-detail.md) | `/dashboard/goals/[id]` (optional `?edit=1` opens the edit sheet) | 7 | 42 | 0 | 0 | 1 |
| `PG-STU-GOALS-LIST` | [Goals](student/goals.md) | `/dashboard/goals` (optional `?new=1` opens the create sheet, with optional prefill `type`, `unit`, `topic`, `target`; `?view=completed` shows completed and archived) | 7 | 48 | 0 | 0 | 1 |
| `PG-STU-PAPERS` | [Past papers](student/past-papers.md) | `/dashboard/past-papers` (`?subject=&grade=&year=&paper=&session=&curriculum=`) | 5 (backend is Academics, Phase 4) | 33 | 0 | 0 | 0 |
| `PG-STU-RUNNER` | [Practice runner](student/practice-runner.md) | `/dashboard/practice/[id]` (runner and results), `/dashboard/practice/[id]/print?variant=blank or marked` (printable paper) | 5 | 79 | 0 | 0 | 0 |
| `PG-STU-PRACTICE` | [Practice hub](student/practice.md) | `/dashboard/practice` (`?unit=&topic=&source=` opens the generate sheet prefilled; `?job=` resumes a generation) | 5 | 47 | 0 | 0 | 0 |
| `PG-STU-REWARDS` | [Achievements](student/progress-achievements.md) | `/dashboard/progress/achievements` | 7 | 36 | 0 | 0 | 1 |
| `PG-STU-JOURNEY` | [Journey](student/progress-journey.md) | `/dashboard/progress/journey` (optional `?type=<eventType>` filter, `?cursor=<opaque>` for older items) | 7 | 36 | 0 | 0 | 0 |
| `PG-STU-MASTERY` | [Mastery](student/progress-mastery.md) | `/dashboard/progress/mastery` (optional `?unit=<unitId>` opens one unit) | 7 | 41 | 0 | 0 | 0 |
| `PG-STU-ANALYTICS` | [Analytics](student/progress.md) | `/dashboard/progress` (also the Progress hub: tabs for Overview, Mastery, Journey, Achievements) | 7 | 47 | 0 | 1 | 0 |
| `PG-STU-UNIT` | [Unit detail](student/subject-detail.md) | `/dashboard/subjects/[id]` | 4 (mastery blocks light up in Phase 7) | 38 | 0 | 0 | 0 |
| `PG-STU-UNITS` | [Subjects and modules](student/subjects.md) | `/dashboard/subjects` | 4 | 47 | 0 | 0 | 0 |
| `PG-STU-SUPPORT` | [Support and counselling](student/wellbeing-support.md) | `/dashboard/wellbeing/support` (anchors `#crisis`, `#self-help`, `#counsellor`) | 7 | 38 | 0 | 0 | 0 |
| `PG-STU-WELL` | [Wellbeing](student/wellbeing.md) | `/dashboard/wellbeing` (optional `?break=1` opens the break sheet) | 7 | 45 | 0 | 0 | 0 |

## Parent app

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-PAR-ACTIVITY` | [Live activity](parent/activity.md) | `/parent/activity` (`?child={studentId}` filters) | 8 | 33 | 0 | 0 | 0 |
| `PG-PAR-CELEB` | [Celebrations](parent/celebrations.md) | `/parent/celebrations` (`?child={studentId}` filters to one child) | 8 | 32 | 0 | 0 | 0 |
| `PG-PAR-DASH` | [Parent dashboard](parent/dashboard.md) | `/parent` | 8 | 42 | 0 | 0 | 1 |
| `PG-PAR-CHILD` | [Child detail](parent/student-detail.md) | `/parent/students/[id]` with tabs `?tab=academics` (default), `?tab=wellbeing`, `?tab=celebrations`, `?tab=goals` | 8 | 42 | 0 | 0 | 1 |
| `PG-PAR-CHILDREN` | [Children](parent/students.md) | `/parent/students` (`?invite=1` opens the invite sheet) | 8 | 45 | 0 | 0 | 0 |
| `PG-PAR-WELL` | [Wellbeing insights](parent/wellbeing.md) | `/parent/wellbeing` (`?child={studentId}` selects a child) | 8 | 37 | 0 | 0 | 2 |

## Affiliate area

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-AFF-EARN` | [Earnings](affiliate/earnings.md) | `/refer` | 6 | 49 | 0 | 0 | 1 |
| `PG-AFF-PAY` | [Payments](affiliate/payments.md) | `/refer/payments` | 6 | 40 | 0 | 0 | 0 |
| `PG-AFF-DETAILS` | [Get paid](affiliate/payout-details.md) | `/refer/payout-details` (old route `/refer/get-paid` redirects here, PG-AFF-DETAILS-19) | 6 | 49 | 0 | 0 | 0 |
| `PG-AFF-TAX` | [Tax](affiliate/tax.md) | `/refer/tax?year=<startYear>` (for example `year=2026` is the tax year 1 Mar 2026 to 28 Feb 2027) | 6 | 40 | 0 | 0 | 0 |

## Billing

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-BIL-MANAGE` | [Billing management](billing/billing-management.md) | `/dashboard/billing` (student), `/parent/billing` (parent) | 6 (parent seat parts land with Phase 8) | 69 | 0 | 0 | 0 |
| `PG-BIL-RETURN` | [Checkout return](billing/checkout-return.md) | `/billing/return?reference=<paystackReference>` (also accepts Paystack's `trxref`); `/welcome` redirects here | 6 | 39 | 0 | 0 | 0 |
| `PG-BIL-CHECKOUT` | [Checkout](billing/checkout.md) | `/billing/checkout?plan=<planCode>&interval=<monthly or annual>` | 6 | 43 | 0 | 0 | 0 |

## Shared app pages

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-CMN-HELP` | [In-app help](shared/in-app-help.md) | `/help` (public page from PG-MKT-HELP, with signed-in extras: help bot, contact options, your tickets); `/help/tickets`, `/help/tickets/new`, `/help/tickets/[id]` (signed in, app shell) | 9 (help bot behind `flags.helpBot`) | 49 | 0 | 0 | 0 |
| `PG-CMN-NOTIF` | [Notifications](shared/notifications.md) | `/dashboard/notifications` (student), `/parent/notifications` (parent), `/admin/notifications` (admin); the bell sheet in the top bar everywhere (SHL-07) | 2 | 43 | 0 | 0 | 0 |
| `PG-CMN-SETTINGS` | [Settings](shared/settings.md) | `/dashboard/settings`, `/parent/settings`, `/admin/settings`, each with sections at `/<area>/settings/[section]` where section is `profile`, `appearance`, `language`, `notifications`, `privacy`, `security`, `data` | 2 (privacy controls land with Phase 8, subscription-aware deletion with Phase 6) | 72 | 0 | 0 | 0 |

## Admin

| ID | Page | Route | Phase | Tasks | Done | Partial | Deferred |
|---|---|---|---|---|---|---|---|
| `PG-ADM-AFF` | [Affiliates admin](admin/affiliates.md) | `/admin/affiliates` with tabs `?tab=overview` (default), `applications`, `flagged`, `payouts`, `ledger`; drawers `?affiliate=<id>`, `?batch=<id>` | 9 | 54 | 0 | 0 | 2 |
| `PG-ADM-AI` | [AI spend](admin/ai-spend.md) | `/admin/ai-spend` | 9 | 29 | 0 | 0 | 0 |
| `PG-ADM-AUDIT` | [Audit log](admin/audit.md) | `/admin/audit`, event drawer at `?event=<id>` | 9 | 36 | 0 | 0 | 0 |
| `PG-ADM-PAY` | [Payments and Paystack cockpit](admin/billing-payments.md) | `/admin/billing (Payments tab)`: `/admin/billing/payments` (Transactions, Settlements, Customer lookup views), `/admin/billing/invoices` (Invoices tab), `/admin/billing/reconciliation` (Reconciliation tab); payment drawer at `?payment=<id>` | 9 | 60 | 0 | 0 | 0 |
| `PG-ADM-SUBS` | [Subscriptions](admin/billing-subscriptions.md) | `/admin/billing (Subscriptions tab)`; the tab is the default view at `/admin/billing`, drawer at `?subscription=<id>` | 9 | 42 | 0 | 0 | 0 |
| `PG-ADM-CONTENT` | [Content](admin/content.md) | `/admin/content` (Catalog tab, default), `/admin/content/past-papers`, `/admin/content/articles`, `/admin/content/articles/new`, `/admin/content/articles/[id]`, `/admin/content/faqs` | 9 | 47 | 0 | 0 | 0 |
| `PG-ADM-DASH` | [Admin dashboard](admin/dashboard.md) | `/admin` | 9 | 47 | 1 | 0 | 0 |
| `PG-ADM-IMP` | [Impersonation (from user drawer)](admin/impersonation.md) | `/admin/users (drawer action)`; banner on every `(app)` route while active | 9 | 42 | 1 | 0 | 0 |
| `PG-ADM-SCHOOLS` | [Schools and enquiries](admin/schools.md) | `/admin/schools` (Schools and institutions tab, default), `/admin/schools/enquiries` (School enquiries tab); drawers `?school=<id>`, `?enquiry=<id>` | 9 | 34 | 0 | 0 | 0 |
| `PG-ADM-SETTINGS` | [Admin settings](admin/settings.md) | `/admin/settings` with sections `#contacts`, `#legal`, `#budgets`, `#pauses`, `#team`, `#account` | 9 | 31 | 0 | 0 | 0 |
| `PG-ADM-SUPPORT` | [Support queue](admin/support.md) | `/admin/support` (Tickets tab, default), `/admin/support/[ticketId]`, `/admin/support/contact` (Contact enquiries tab) | 9 | 36 | 0 | 0 | 0 |
| `PG-ADM-SYSTEM` | [System health](admin/system.md) | `/admin/system`, dead letter drawer at `?message=<id>` | 9 | 36 | 0 | 0 | 0 |
| `PG-ADM-USERS` | [Users](admin/users.md) | `/admin/users`, drawer at `/admin/users?user=<id>` | 9 | 47 | 0 | 0 | 0 |

## What happens to each route of the old app

The old app's route list, kept for reference. New sections now live in the files above.

| Current route | Fate | New section |
|
