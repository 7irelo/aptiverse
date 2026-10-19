# Decisions needed

Every product, legal, money and operations decision the backlog depended on, gathered from all files.

**Status: all decided on 2026-10-19.** The product owner accepted every recommended default. The backlog is written to these answers; tasks they ruled out of v1 carry `*(deferred: decision N, ...)*` and are not counted as v1 work. Changing an answer later means an ADR (see `phase-0/decisions.md`) and a pass over the files that cite it.

Some answers set a policy but still need a fact only a person can supply (a name, a bank, a number). Those are listed in section F; the policy stands and the fact fills it in.

## A. Product scope

| # | Question | Options | Decided | Affects |
|---|---|---|---|---|
| 1 | Repository layout | three org repos with a contract flow, or one private monorepo | Three org repos (ADR 0006). Note: no CI runs until the split happens, because GitHub only reads the root `.github` | REPO-01, all CI |
| 2 | v1 scope | Student (high school and university) + Parent + lean Admin; tutor, teacher, school later | Student (high school and university) + Parent + lean Admin; tutor, teacher and school in Phase 12 | everything |
| 3 | Affiliates in v1 | yes or later | Yes, in v1. The live app runs the programme, so balances may be owed; dropping it would strand them. If the user counts (F, item 60) show no affiliates with a balance, it can still slip to Phase 12 without changing other work | backend/affiliates.md, pages/affiliate, admin affiliates |
| 3b | Affiliate enrolment | automatic for every account (old live app) or an application step (plan) | Automatic, with payout-details review as the only gate, as the old app did | BE-AFF-02/03, PG-MKT-AFF |
| 3c | Affiliate terms | keep old terms (40 percent of first 3 monthly or 1 annual payment, 30-day hold, 7-day claim window, lifetime first-touch attribution, R50 or R100 minimum payout) or new | Keep the old terms, with attribution capped at 12 months from the first touch (lifetime was an open-ended liability). Referrals attributed before cutover keep their date and are capped from it | BE-AFF ledger |
| 6 | Goal rewards | parent pledges (built once, dropped before 43f9faa), points that buy AI and practice quota top-ups (old live behaviour), or neither | Neither in v1 (de-gamified); revisit after launch. Pledge, points and quota-grant tasks are deferred | backend/progress.md, family.md, goals pages |
| 7 | Diary NLP | none, or sentiment in the later analytics service | None | wellbeing |
| 8 | Meta pixel and Conversions API | keep (consent-gated) or drop until after launch | Drop until after launch. Pixel and Conversions API tasks are deferred; v1 ships only cookieless Vercel Analytics, so the consent banner covers that and future marketing tags | FE-63, PG-MKT-LEGAL, BE-BIL-24 |
| 11 | Visual direction for the overhaul | keep Graphite & Citron + Frygia, or a new direction | Keep Graphite & Citron; buy and self-host a Frygia licence | FE-12, FE-30..37, every page |
| 12 | Plans in v1 | which of free, student.pro, student.max, parent tiers, annual billing | free, student.pro, parent tiers, monthly and annual; student.max later | pricing, billing |
| 13 | Parent insights | is the parent wellbeing line, wellbeing page and activity a paid feature | Free (43f9faa removed the gate) | parent pages |
| 14 | Past papers | link out to the DBE archive (old app, avoids copyright and staleness) or host files in S3 (plan) | Link out in v1; host only papers we have permission for | BE-ACA-60..62, past-papers page |
| 15 | Practice anchoring | practice generated per assessment (old app) or per study unit | Per assessment, unit derived from it | BE-PRA-04, practice pages |
| 16 | Practice formats in v1 | quiz, exam paper, reading (high school), flashcards, essay | All five; essay feedback has its own quota | practice |
| 17 | Timed tests | pausable or not | Untimed pausable, timed never; 10 second network grace after the deadline | practice runner |
| 18 | APS | compute an estimate on the common NSC scale, or refuse (old app) | Estimate with a clear warning; never mark a target met or short on APS alone | BE-CAR-06, careers page |
| 19 | University levels | study level First year to PhD (old app) or year plus NQF | Study level, duration semester or full year | academics, subjects page |
| 20 | Goal types in v1 | which verifiable types; custom and streak goals | Practice count, practice score, mastery threshold, assessment mark, assessments submitted; no custom or streak goals; count from goal creation | BE-PRG-02 |
| 21 | Baseline rule scope | only point-earning goals (old) or every goal | Every goal | BE-PRG-03 |
| 22 | AI tutor safety signal | raise a wellbeing signal when a student seems distressed | Not in v1; needs POPIA and safeguarding review first | ai-tutor |
| 23 | Study sessions in the calendar | recurring weekly study sessions in v1 | Not in v1; assessments only | calendar |
| 24 | Google sign-in | creates new accounts, or existing and invited accounts only (old rule) | Existing and invited accounts only (backend/identity.md); open it up later if sign-up friction shows | BE-IDN-27 |
| 25 | Verified email gates checkout | yes or no | No (it would break paid sign-up); gate payouts and sensitive changes instead | BE-IDN-38 |
| 26 | Grade range | Grades 8 to 12 or 10 to 12 (old product) | 8 to 12. If the CAPS seed lacks Grades 8 and 9 when Phase 4 starts, ship 10 to 12 first and add 8 and 9 with the seed | onboarding, catalog |
| 27 | University noun | Modules or Courses | Courses | subjects page, nav |
| 28 | Superuser tier | a `superuser` role, or a `roles.manage` permission held by named admins | A permission (`roles.manage`), so the role list stays student, parent, admin; the rails (no self-edit, last holder cannot lose it) apply to the permission | admin users page, BE-ADM |
| 29 | Curriculum codes | `CAPS`/`IEB` (Identity code) or `nsc`/`ieb` (old app, exam body) | Store the exam body (`nsc`, `ieb`) and treat CAPS as the curriculum both follow | identity, academics, migration |
| 9b | Permission catalogue | the names proposed in pages/admin/dashboard.md and backend/identity.md | Adopt them; fold `support.faqs.manage` into `content.manage` | Permissions.cs, nav-config.ts |

## B. People, legal and compliance

| # | Question | Decided |
|---|---|---|
| 30 | Age capture | Date of birth at onboarding; drives parental consent under 18, affiliates 18+, payer age |
| 31 | Can under-18s pay or be affiliates | Pay: only with parental consent. Affiliates: no |
| 32 | Information Officer (POPIA) | A named Information Officer signs off retention periods, breach notification timings and the processing register (name: F) |
| 33 | Backups of minors' data outside af-south-1 | Keep in-region copies plus a second region only after a POPIA opinion |
| 34 | Safeguarding lead and escalation procedure | A named safeguarding lead owns escalations from support tickets and wellbeing (name: F) |
| 35 | Wellbeing copy and helpline numbers | Professional sign-off before prod; phone-check every helpline number |
| 36 | Diary encryption claim | Say "encrypted at rest and never shown to parents" until the key design is built; never claim end-to-end |
| 37 | Terms document name | "Terms of Use" |
| 38 | Deletion cooling-off | 14 days |
| 39 | Retention of parental consent evidence and affiliate tax records | Kept for the period the Information Officer and accountant set (periods: F); until then, keep and never purge |
| 40 | IEB papers | Do not host without written permission |

## C. Money

| # | Question | Decided |
|---|---|---|
| 50 | Is Aptiverse VAT-registered; are prices VAT-inclusive | Show VAT-inclusive prices; VAT registration status confirmed by an accountant (F) |
| 51 | Free trial | No trial in v1 |
| 52 | Proration on upgrade | Paystack default (charge the new plan now) |
| 53 | Children's cover when a parent cancels | Keep cover until the end of the paid period, then a 14-day grace |
| 54 | Refunds or payouts above a threshold need a second admin | Yes above R2 000 once there are two admins |
| 55 | AI spend shown in | USD as billed, with a ZAR estimate |
| 56 | Payout rail and CSV format | Manual EFT using the bank's bulk payment CSV (bank: F) |
| 57 | Budgets (decision 9) | Monthly ceilings for AWS and Anthropic drive budget alarms and the AI spend breaker (amounts: F) |
| 58 | Instant EFT | Only advertise if confirmed on your Paystack account |

## D. Operations

| # | Question | Decided |
|---|---|---|
| 60 | Existing users, subscribers and affiliates (decision 10) | Cutover ceremony scales with the counts (counts: F); plan for the full rehearsal path until they are known |
| 61 | Do teacher and tutor accounts migrate | Migrate the accounts as students or parents where possible, hide the rest until Phase 12 |
| 62 | Reviews and prod approvals with one developer | Required checks only, no required reviewer; manual approval for prod deploys |
| 63 | On-call and alerting tool | Email plus a phone push app (for example ntfy or Grafana OnCall free tier) |
| 64 | Domains | Product on the apex `aptiverse.co.za`, API on `api.aptiverse.co.za`, environments as `dev.` and `staging.` |
| 65 | Cloudflare plan | Pro, for the managed WAF rules |
| 66 | Feature flag mechanism | Typed config flags in `web/src/lib/flags.ts` and API options; no third-party service in v1 |
| 67 | Paystack test mode for the cutover smoke test | Use a live R5 transaction refunded immediately |

## E. Known conflicts already resolved in the backlog

Recorded so nobody reopens them by accident.

- Old-app reference is commit `43f9faa` (47 migrations); `f223ca7` is older.
- Affiliate is a profile on a student or parent account, not a role.
- Family owns parent sharing flags; Wellbeing reads them.
- Auth mutations are server actions, never through `/api/bff`; the redirect parameter is `next`.
- Diary entries and check-in notes are hard-deleted (POPIA exception to soft delete).
- User-scoped data is never served from a shared cache.
- Practice focus mode is its own `(focus)` route group without the shell.
- Affiliate admin commands are owned by the Affiliates module; Admin links to them.
- Tertiary courses are shared per institution (emergent, first student creates them), not private per student.
- Login lockout returns the same 429 with `Retry-After` as the rate limiters, so it does not reveal that an account exists.
- Students give a date of birth; parents confirm they are 18 or older.

## F. Facts still needed from the product owner

The decisions above are final; these are the values that fill them in. None blocks Phase 0 to 5 work. Each is needed by the phase shown.

| # | Fact | Needed by | Where it goes |
|---|---|---|---|
| 32 | Information Officer's name, registered with the Information Regulator | Phase 10 | `launch/popia.md`, privacy notice |
| 34 | Safeguarding lead's name and escalation contact | Phase 7 | `backend/wellbeing.md`, `backend/support.md`, runbooks |
| 35 | Professional who signs off wellbeing copy; helpline numbers phone-checked | Phase 7 | `pages/student/wellbeing-support.md` |
| 39 | Retention periods for parental consent evidence and affiliate tax records | Phase 10 | `launch/retention-schedule.md` |
| 50 | VAT registration status (and VAT number if registered) | Phase 6 | pricing, invoices, `backend/billing.md` |
| 56 | Bank used for affiliate payouts (sets the bulk CSV format) | Phase 6 | `backend/affiliates.md` payout export |
| 57 | Monthly ceilings for AWS and Anthropic spend, in USD | Phase 1 (AWS), Phase 5 (Anthropic) | `infra/monitoring.md`, `launch/cost-controls.md`, BE-AI-66 |
| 58 | Whether Instant EFT is enabled on the Paystack account | Phase 6 | pricing and checkout copy |
| 60 | Active accounts, paying subscribers, affiliates with a balance | Phase 11 | `launch/migration-etl.md`, `launch/cutover.md` |
| 63 | Which push app receives on-call alerts (ntfy or Grafana OnCall) | Phase 1 | `observability/alerting.md` |
