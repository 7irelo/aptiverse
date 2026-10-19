# Calendar and planner

| | |
|---|---|
| ID | `PG-STU-CAL` |
| Route | `/dashboard/calendar` (`?view=week or month or agenda&date=YYYY-MM-DD`) |
| Phase | 4 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-ACA-15, BE-ACA-50, BE-ACA-51, BE-ACA-52, BE-ACA-53, BE-ACA-54, BE-NTF-09; PG-STU-ASMT-LIST-07 (`sast.ts`); UI-06, UI-07, UI-13, UI-25 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/calendar/page.tsx`, `f223ca7:DESIGN_BRIEF.md` section 9 ("Study planner and calendar") |
| Status | Not started. Nav entry "Calendar" exists in `nav-config.ts` (Account section). Backend (Academics calendar) not started. Study sessions and custom events deferred (decision 23): PG-STU-CAL-03, 04, 12 and 13. |

## Purpose

A clear view of what is due: assessment due dates (derived automatically from the student's assessments), with school terms marked, all in South African time. Reminders arrive as notifications, and the calendar can be subscribed to from Google Calendar or Apple Calendar.

Decided (23): v1 shows assessments only, as the 43f9faa calendar did. Study sessions (one-off or recurring) and custom events are not in v1; their tasks are kept and marked deferred so the design can return after launch.

## User stories

- As a student, I see this week's deadlines on my phone without zooming.
- As a student, I get a reminder before an assessment is due.
- As a student, I subscribe from my phone's calendar app so everything shows there too.
- As a high-school student, I see where the school terms start and end.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` "Calendar"; action "Add assessment" (links to `/dashboard/assessments/new`); overflow menu "Subscribe in your calendar app".
2. Toolbar: `Tabs` "Agenda" (default on mobile), "Week", "Month"; date navigator ("Previous", label "13 to 19 October", "Next", "Today").
3. Term or semester banner when today falls in a marked period ("Term 4, week 2") or a holiday.
4. Agenda view: days as `h2` sections ("Monday 13 October"), each with event rows (time, title, type icon and label, unit). Empty days collapsed into "Nothing due on Tuesday and Wednesday".
5. Week view: 7 day columns are too narrow at 360px, so mobile week view is a horizontal day strip (7 day buttons) plus the selected day's timeline (06:00 to 22:00, 30-minute rows).
6. Month view: month grid with dots; selected day's events listed under the grid.

Event tap opens a `ResponsiveDialog` with details and "Open assessment" (events are read-only here; edits happen on the assessment).

### Desktop (1440px)

`PageShell width="wide"`. Default view "Week": 7 day columns, time grid 06:00 to 22:00, all-day row on top for assessment due dates without a time. Right rail (320px): mini month, legend, upcoming 5 items, "Subscribe" card. The grid is read-only in v1 (no slot selection).

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Page | `web/src/app/(app)/dashboard/calendar/page.tsx` | server | parses `view` and `date`, computes SAST range |
| Loading, error | `.../calendar/loading.tsx`, `error.tsx` | mixed | grid skeleton, `PageError` |
| Loader | `web/src/features/calendar/server/get-calendar.ts` | server | BE-ACA-51 for the visible range |
| Range helper | `web/src/features/calendar/lib/visible-range.ts` | shared | SAST start and end for agenda (14 days), week (Mon to Sun), month (grid weeks) |
| Layout helper | `web/src/features/calendar/lib/layout-events.ts` | shared | overlap columns for the time grid |
| Toolbar | `web/src/features/calendar/components/calendar-toolbar.tsx` | client | tabs and navigator, URL updates |
| Agenda view | `web/src/features/calendar/components/agenda-view.tsx` | server | grouped by SAST day |
| Week view | `web/src/features/calendar/components/week-view.tsx` | client | desktop grid and mobile day strip |
| Month grid | `web/src/features/calendar/components/month-grid.tsx` | client | shared with the assessments month view |
| Event chip | `web/src/features/calendar/components/event-chip.tsx` | client | icon plus text per type |
| Event dialog | `web/src/features/calendar/components/event-details-dialog.tsx` | client | details and actions |
| Session form | `web/src/features/calendar/components/study-session-form.tsx` | client | deferred (decision 23) |
| Term banner | `web/src/features/calendar/components/term-banner.tsx` | server | from term data |
| Term data | `web/src/features/calendar/lib/sa-terms.ts` | shared | school terms per year (see open questions) |
| Subscribe sheet | `web/src/features/calendar/components/subscribe-sheet.tsx` | client | ICS link, copy, instructions |
| Hooks | `web/src/features/calendar/hooks/use-ics-link.ts` (v1); `use-create-event.ts`, `use-update-event.ts`, `use-delete-event.ts` deferred (decision 23) | client | generated hooks via `/api/bff` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/academics/calendar?from=&to=` (BE-ACA-51) | GET | `items[] { id, kind (assessment in v1), title, unitId or null, unitName or null, startsAt, endsAt or null, allDay, assessmentId or null, reminderMinutes or null, version }` | user-scoped, tag `academics:calendar:<userId>` |
| `/academics/calendar.ics` link (BE-ACA-54) | GET via BFF helper | `{ url }` signed per user | not cached in the page |

Mutations: none in v1. Deferred with study sessions (decision 23):

| Endpoint (BE ID) | Method | Request | On success |
|---|---|---|---|
| `/academics/calendar/events` (BE-ACA-52), `Idempotency-Key` | POST | `{ kind: study_session or custom, title, unitId?, startsAt, endsAt, reminderMinutes? }` | refresh range; toast "Session planned" |
| `/academics/calendar/events/{id}` (BE-ACA-52) | PATCH | changed fields plus `version` | toast "Session updated" |
| `/academics/calendar/events/{id}` (BE-ACA-52) | DELETE | none | toast "Session deleted" |

Assessment reminders are scheduled server-side (BE-ACA-53) and delivered as notifications according to preferences (BE-NTF-09); the page sets nothing.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render or range change | grid or agenda skeleton; previous range stays visible during client navigation |
| Empty range | no events in the visible range | "Nothing due this week." |
| Empty (first time) | no assessments | "Add an assessment and its due date shows here automatically." action "Add assessment" |
| Error | loader fails | `PageError` defaults |
| Read-only event | assessment-derived | dialog shows "This comes from your assessment. Change it there." with "Open assessment" |
| Populated | events | views as laid out |

## Stage variants

| Item | High school | University |
|---|---|---|
| Period markers | school terms (Term 1 to Term 4) and holidays | semester markers only when the student set semester dates (see open questions); otherwise none |
| Unit label in event dialog | "Subject" | "Course" |
| Assessment labels | SBA task, test, exam | assignment, test, exam |

## Interactions and edge cases

- Time zone: every range, day boundary and time label uses Africa/Johannesburg (UTC+2, no daylight saving). A student whose device is set to another zone still sees SAST, with a footnote "Times shown in South African time." until a user zone setting exists.
- Study sessions, custom events, slot selection and drag are deferred (decision 23); the session form rules are kept in PG-STU-CAL-12 for when they return.
- ICS link: the subscribe sheet fetches the signed URL on open, shows "Copy link" and per-platform steps (Google Calendar, Apple Calendar, Outlook). The URL is a secret: copy only, never rendered as a clickable link in shared views, never logged, never sent to analytics.
- Range parameters out of bounds (more than 2 years from today) are clamped.
- Offline: the page shows the last loaded range with "You are offline. Showing what was last loaded."

## Copy

- Navigator labels: "13 to 19 October", "October 2026", "Today"
- Type labels: "Assessment due"
- Subscribe sheet: title "Add to your calendar app"; body "Anyone with this link can see your calendar, so keep it to yourself."; button "Copy link"; toast "Link copied"
- Term banner: "Term 4, week 2" / "School holidays until 13 January"

## Acceptance criteria

- Given an assessment due 19 October at 18:00 SAST, when viewed from a device set to Europe/London, then it shows at 18:00 on Monday 19 October.
- Given an assessment due 24 October with no time, when the week view renders, then it shows in the all-day row on Friday, read-only.
- Given two assessments due at overlapping times, when the week view renders, then both are visible side by side, not stacked on top of each other.
- Given any event, when its dialog opens, then it offers "Open assessment" and no edit or delete.
- Given the subscribe sheet, when "Copy link" is pressed, then the clipboard holds an `https` ICS URL and analytics records `calendar_ics_copied` without the URL.
- Given a high-school student in term time, when the page loads, then the term banner shows the correct term and week for SAST today.

## Production readiness

- Security: BE-ACA-51 scopes to the caller; v1 has no calendar writes (BE-ACA-52 is unused by this page). The ICS URL carries a signed, revocable token (BE-ACA-54) and is treated as a secret: excluded from logs, Sentry and analytics, and the sheet warns the student.
- Performance: only the visible range is fetched (agenda 14 days, week 7 days, month up to 42 days). Agenda view is server-rendered; week and month grids are client islands, dynamically imported per view. Route JS under 120 KB gzip.
- Resilience: read-only page; range navigation keeps the old view while loading; offline shows the last loaded range.
- Observability: analytics `calendar_viewed { view }`, `calendar_ics_copied`. Sentry tag `page:calendar`. Trace propagation to BE-ACA-51.
- Accessibility (WCAG 2.2 AA): time grid exposes events as a list per day for screen readers; event colours always paired with an icon and a text type label.
- Privacy and POPIA: assessment titles are free text and may contain personal information; never sent to analytics; ICS feed only includes the student's own events.
- Rollout: behind `academics.calendar`; ICS subscription behind `academics.calendar-ics` so it can be switched off alone if a token issue appears. Rollback: flags off.
- Monitoring: Grafana panel for BE-ACA-51 p95 per range size and BE-ACA-53 reminder delivery lag; alert when reminder lag p95 exceeds 5 minutes or ICS feed 5xx exceed 1%.

## Build tasks

- [ ] **PG-STU-CAL-01** Week view: desktop 7-column time grid; mobile day strip plus single-day timeline (month view split out to PG-STU-CAL-07)
- [ ] **PG-STU-CAL-02** Agenda list (mobile default view)
- [ ] **PG-STU-CAL-03** Create study session (tap or drag a slot, or the header action) with the session form *(deferred: decision 23, not in v1)*
- [ ] **PG-STU-CAL-04** Edit and delete study sessions and custom events from the event dialog *(deferred: decision 23, not in v1)*
- [ ] **PG-STU-CAL-05** Subscribe-to-calendar (ICS link) sheet with copy and per-platform steps
- [ ] **PG-STU-CAL-06** SA term markers for high school (banner and grid shading)
- [ ] **PG-STU-CAL-07** Month view using `month-grid.tsx` (shared with assessments)
- [ ] **PG-STU-CAL-08** Loader `get-calendar.ts` and `visible-range.ts` (SAST ranges per view) with unit tests
- [ ] **PG-STU-CAL-09** Toolbar: view tabs, date navigator, URL state
- [ ] **PG-STU-CAL-10** Event chip and event details dialog (read-only assessment events link to the assessment)
- [ ] **PG-STU-CAL-11** Overlap layout helper `layout-events.ts` with unit tests
- [ ] **PG-STU-CAL-12** Session form schema (duration, reminder options, 15-minute steps) and validation copy *(deferred: decision 23, not in v1)*
- [ ] **PG-STU-CAL-13** Mutation hooks with idempotency key, `version` and range refresh *(deferred: decision 23, not in v1)*
- [ ] **PG-STU-CAL-14** Term data source `sa-terms.ts` for the current and next school year
- [ ] **PG-STU-CAL-15** Empty and offline states
- [ ] **PG-STU-CAL-16** Desktop right rail (mini month, legend, upcoming, subscribe card)
- [ ] **PG-STU-CAL-17** Analytics events listed above; ICS URL excluded everywhere
- [ ] **PG-STU-CAL-18** Flags `academics.calendar` and `academics.calendar-ics`; rollback note
- [ ] **PG-STU-CAL-19** Grafana panels and alerts for calendar latency, reminder lag and ICS errors
- [ ] **PG-STU-CAL-20** Dynamic import per view; route JS budget 120 KB gzip
- [ ] **PG-STU-CAL-21** Month and day-strip dots only for days with an ungraded assessment; a marked assessment is listed but not dotted; the dot is a shape under the date with a text label for screen readers (43f9faa rule)
- [ ] **PG-STU-CAL-22** No dead controls: the subscribe entry renders only when its flag and endpoint are live, and no "Plan a session" or "New event" control exists in v1 (43f9faa removed sync and "New event" buttons that did nothing)

## Quality tasks

- [ ] **PG-STU-CAL-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`)
- [ ] **PG-STU-CAL-Q02** Server loader in `src/features/calendar/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-CAL-Q03** No client mutations in v1 (read-only page); the ICS link fetch goes through `/api/bff`
- [ ] **PG-STU-CAL-Q04** Empty state with one clear next action
- [ ] **PG-STU-CAL-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-CAL-Q06** Forbidden state (no upgrade state: free page)
- [ ] **PG-STU-CAL-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students); no term markers for university
- [ ] **PG-STU-CAL-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-STU-CAL-Q09** Layout at 1440px
- [ ] **PG-STU-CAL-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-CAL-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-CAL-Q12** axe: zero violations in light and dark, every view
- [ ] **PG-STU-CAL-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order, grid navigable with arrow keys
- [ ] **PG-STU-CAL-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-CAL-Q15** `generateMetadata` title "Calendar"; nav entry active

## Tests

Unit (Vitest):
- `visible-range.test.ts`: "week is Monday 00:00 to Sunday 23:59 SAST", "month grid covers leading and trailing weeks", "agenda is 14 days"
- `layout-events.test.ts`: "two overlapping get two columns", "three with one gap get two columns", "cross-midnight splits across days"
- `sa-terms.test.ts`: "returns term and week for a date", "returns holiday until date"

Playwright (`web/e2e/student/calendar.spec.ts`):
- "event dialog offers open assessment and no edit"
- "assessment due date shows read-only and links to the assessment"
- "times stay in SAST with a London browser time zone" (Playwright `timezoneId: "Europe/London"`)
- "subscribe sheet copies the link"
- "university student sees no term banner"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- No backend task holds SA school term dates; this file proposes a versioned data file in the web (`sa-terms.ts`) updated yearly from the DBE calendar. IEB schools mostly follow the same terms, but private school dates differ. Confirm, or add a catalog endpoint.
- University semesters differ per institution; should students enter their own semester dates (new BE field), or should university markers be dropped from v1?
- BE-ACA-54 needs a "regenerate link" endpoint so a student who shared the ICS link can revoke it.
- Decided (23): no study sessions in v1, one-off or recurring; the calendar shows assessments only, as the 43f9faa page did.
- A user time-zone setting is mentioned in REBUILD_PLAN 3.4 ("unless the user setting differs") but no BE-IDN task stores it; this file assumes SAST for everyone in v1.
