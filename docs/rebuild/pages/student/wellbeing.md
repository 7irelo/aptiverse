# Wellbeing

| | |
|---|---|
| ID | `PG-STU-WELL` |
| Route | `/dashboard/wellbeing` (optional `?break=1` opens the break sheet) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free (wellbeing is never paywalled) |
| Depends on | BE-WEL-02, BE-WEL-03, BE-WEL-06, BE-WEL-07, BE-WEL-08, BE-FAM-11, BE-NTF-09, UI-01, UI-04, UI-07, UI-10, UI-22, UI-27, UI-33, FE-25, FE-63, OBS-04, OBS-06, PG-CMN-SETTINGS (privacy and notification sections), PG-STU-SUPPORT |
| Old app reference | `web/src/app/(app)/dashboard/wellbeing/page.tsx` at 43f9faa (check-in dialog with optional sleep hours and note, stress signal bands, 14-day trend, box-breathing dialog, first check-in hero); `api/Controllers/WellbeingController.cs` (`mood`, `mood-trend`, `summary`), `MoodTracking.cs` (mood score, energy, stress, sleep quality, sleep hours, notes) and `Reminders/WellbeingCheckinReminderService.cs` at 43f9faa |
| Status | Not started (backend not started; no route, loader or components exist) |

`PG-STU-WELL-06` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

A calm, private space to check in on how the student is doing in under a minute, see the shape of their week, and get to a break or to support in one tap. It uses the magenta wellbeing zone so it never looks like academic progress, and nothing here is graded, scored or ranked. Notes are private. Linked parents see only the aggregate trend the student chose to share, never notes.

## User stories

- As a student, I want to log how I feel in a few taps, so checking in is not a chore.
- As a student, I want to add a private note if I feel like it.
- As a student, I want to see how my week has felt, without it being turned into a score.
- As a student having a hard week, I want a gentle suggestion and a quick way to take a break or find help.
- As a student, I want to know exactly what my parent can see, and change it easily.
- As a student, I want reminders only if I ask for them.

## Layout

### Mobile (360px)

Single column, `px-4`, `gap-6`, the page background stays neutral; wellbeing cards use `bg-wellbeing/10` surfaces and `text-wellbeing-foreground` accents.

1. `PageHeader`: h1 "Wellbeing", description "A private place to check in with yourself. Nothing here is graded."
2. `CheckInCard`:
   - Title "How are you feeling?"
   - Five mood buttons in a row (each 56px square minimum, icon above a visible label): Really tough (`Frown`), Down (`Annoyed`), Okay (`Meh`), Good (`Smile`), Great (`Laugh`). Real `radio` semantics in a `radiogroup`.
   - "Stress right now (optional)": three chips Low, Medium, High.
   - "Add a note (optional)" disclosure opening a `Textarea` (max 280 characters, counter), helper "Only you can see this."
   - "Check in" button (full width, disabled until a mood is picked).
   - After submit, the card shows "Checked in. Thanks for taking a minute." and "Check in again" (text button).
   - If already checked in today: header line "You checked in today at {time}: {mood}." and the form collapsed behind "Check in again".
3. `SupportPrompt` (only right after a "Really tough" check-in, or when the nudge rule fires): magenta card, "This week sounds heavy. You don't have to handle it alone." Buttons "Take a two-minute break" and "See support options". A tap-to-call line "SADAG, free, 24 hours: 0800 567 567".
4. `WeekTrendCard`: title "Your week", text summary first, then a 7-day area chart in the wellbeing colour (height 160px), y axis labelled with mood words, days without a check-in as gaps.
5. `QuickRoutes`: two large link buttons side by side: "Take a break" (`Coffee`, opens `BreakSheet`), "Support" (`LifeBuoy`, to `/dashboard/wellbeing/support`). Then a text link "Write in your diary" to `/dashboard/diary`.
6. `SharingCard`: title "Who can see this", status line, link "Change what you share".
7. `RemindersRow`: "Gentle check-in reminders: {Off or Weekdays at 18:00}" with link "Change" to notification settings.

### Desktop (1440px)

`PageShell`, 12 columns:

- Row 1: header full width.
- Row 2: `CheckInCard` (5 of 12) and `WeekTrendCard` (7 of 12; summary above the chart, chart height 220px).
- Row 3: `SupportPrompt` full width when shown.
- Row 4: `QuickRoutes` (5 of 12) and `SharingCard` plus `RemindersRow` stacked (7 of 12).

`BreakSheet` (`ResponsiveDialog`): bottom sheet on mobile, centred dialog on desktop. A two-minute box-breathing guide: a square outline whose sides highlight in turn with text "Breathe in, 4", "Hold, 4", "Breathe out, 4", "Hold, 4", a remaining-time counter, "Stop" button. Under `prefers-reduced-motion`, no movement: only the changing text and counter. Nothing is recorded.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/wellbeing/page.tsx` | server | Dynamic, no `"use cache"`; `generateMetadata` title "Wellbeing" |
| Loading | `web/src/app/(app)/dashboard/wellbeing/loading.tsx` | server | Check-in and trend skeletons |
| Error | `web/src/app/(app)/dashboard/wellbeing/error.tsx` | client | `PageError` with retry, plus the static support line so help is reachable even when data fails |
| CheckInCard | `web/src/features/wellbeing/components/check-in-card.tsx` | client | `useZodForm` with the generated check-in schema; mutation through the BFF |
| MoodPicker | `web/src/features/wellbeing/components/mood-picker.tsx` | client | Radix radio group styled as icon buttons; labels always visible |
| StressChips | `web/src/features/wellbeing/components/stress-chips.tsx` | client | Radio group, deselectable |
| Mood scale | `web/src/features/wellbeing/lib/mood-scale.ts` | shared | Values 1 to 5 to label and Lucide icon; shared with diary and parent views |
| Nudge rule | `web/src/features/wellbeing/lib/nudge.ts` | shared | `shouldNudge(checkins)`; pure, unit tested |
| Trend summary | `web/src/features/wellbeing/lib/trend-summary.ts` | shared | Words only, no scores |
| SupportPrompt | `web/src/features/wellbeing/components/support-prompt.tsx` | server | Static copy and `tel:` link |
| WeekTrendCard | `web/src/features/wellbeing/components/week-trend-card.tsx` | server | Summary plus lazy `WeekTrendChart` |
| WeekTrendChart | `web/src/features/wellbeing/components/week-trend-chart.tsx` | client | UI-27 `AreaChart` with a `wellbeing` tone (token `--color-wellbeing`), not the `--chart-*` academic palette |
| QuickRoutes | `web/src/features/wellbeing/components/quick-routes.tsx` | server | Links; break button is a client leaf |
| BreakSheet | `web/src/features/wellbeing/components/break-sheet.tsx` | client | `ResponsiveDialog`; timer in a hook, stops on close |
| SharingCard | `web/src/features/wellbeing/components/sharing-card.tsx` | server | Reads BE-WEL-06 |
| RemindersRow | `web/src/features/wellbeing/components/reminders-row.tsx` | server | Reads BE-NTF-09 |
| Loaders | `web/src/features/wellbeing/server/get-checkins.ts`, `get-sharing.ts` | server | `cache: "no-store"`; zod-validated |
| Helplines | `web/src/features/wellbeing/lib/helplines.ts` | shared | Static fallback list shared with PG-STU-SUPPORT |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/wellbeing/checkins?days=7` (BE-WEL-03) | GET | `items[]`: `id`, `mood` (1 to 5), `stress` (`low`, `medium`, `high` or null), `hasNote` (boolean, note text not returned in the list), `createdAt`; `days[]`: `date`, `mood` (the day's latest, or null), `stress` (or null); `today` (latest check-in today or null) | none (`no-store`) |
| `/wellbeing/sharing` (BE-WEL-06) | GET | `parents[]`: `linkId`, `displayName`, `shares` (`mood_trend`, `stress_trend`, `checkin_count` flags) | none |
| `/notifications/preferences` (BE-NTF-09) | GET | `wellbeing_reminder`: `enabled`, `schedule` | `notifications:prefs:<userId>` |

Mutations:

| Endpoint (BE ID) | Method | Request | Responses | After success |
|---|---|---|---|---|
| `/wellbeing/checkins` (BE-WEL-03) | POST via `/api/bff` | `mood` (1 to 5, required), `stress` (optional), `note` (optional, max 280); header `Idempotency-Key` (UUID per form instance) | 201 `{ id, createdAt }`; 400 validation; 429 (more than 20 check-ins in a day) | `router.refresh()` for the trend; confirmation state; `SupportPrompt` if mood is 1 |

Rules:

- The trend uses each day's latest check-in. Days without one are null and render as gaps, never as the lowest mood.
- Note text is never returned by the list endpoint and never shown on this page after submit; the student sees their notes only in their own check-in history (not in v1) or the diary.
- No academic data is mixed into this page, and no wellbeing data goes to the dashboard beyond the nudge flag the student sees themselves.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | Skeletons; "Loading" for screen readers |
| No check-ins yet | `items` empty | Trend card: "No check-ins yet. Your week fills in as you check in." No chart. Check-in card is the call to action |
| One day | One day with a value | Chart hidden; "You've checked in on 1 day this week." |
| Already checked in today | `today` present | "You checked in today at {time}: {mood}." Link "Check in again" |
| Submitting | POST pending | "Check in" shows "Saving", disabled |
| Submitted | 201 | "Checked in. Thanks for taking a minute." |
| Submit failed | 5xx or network | "That didn't save. Your answers are still here, so try again." |
| Too many | 429 | "You've checked in a lot today. Come back tomorrow, or write in your diary instead." Link "Open diary" |
| Nudge | `shouldNudge` true | `SupportPrompt` as above |
| Not sharing | `parents` empty or all flags false | "Only you can see your check-ins." |
| Sharing | Any flag true | "{name} can see your weekly mood trend. Never your notes or diary." (one line per parent, listing only shared items) |
| Error | Loader failed | "We couldn't load your check-ins. You can still check in, or get support below." Check-in form stays usable; support line always visible |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |

## Stage variants

| Element | High school | University |
|---|---|---|
| Support prompt extra line | "You can also talk to a teacher or your school counsellor." | "Your campus counselling centre can help too." |
| Copy otherwise | Same | Same |
| Forbidden words | course, GPA | SBA, APS, matric, Grade |

## Interactions and edge cases

- Nudge rule (`nudge.ts`): true when, within the last 7 days, at least 3 of the latest 5 check-ins have `mood` 1 or 2, or at least 3 of the latest 5 have `stress` high. Never shown with fewer than 3 check-ins. No percentages or scores are ever shown.
- "Really tough" always shows the support prompt after submit, regardless of the rule.
- There is no text analysis of notes (decision 7). The page never claims to "notice" anything from what the student wrote.
- Colour: the mood scale uses the magenta ramp in increasing strength for the chart line only; mood buttons are neutral with a magenta ring when selected. No red or green anywhere on the page.
- Trend summary words: "This week you checked in on {n} days. Most days felt {mode label}." If tied: "Your days were mixed." Never "better", "worse", "improved" or "declined".
- Times shown in the student's time zone.
- `?break=1` opens the break sheet; closing removes it.
- Break timer pauses when the tab is hidden and stops on close.
- Offline: the check-in button shows "You're offline. Check in when you're back online." and keeps the selection.

## Copy

- h1: "Wellbeing"
- Description: "A private place to check in with yourself. Nothing here is graded."
- Check-in title: "How are you feeling?"
- Mood labels: "Really tough", "Down", "Okay", "Good", "Great"
- Stress label: "Stress right now (optional)"; chips "Low", "Medium", "High"
- Note: "Add a note (optional)"; helper "Only you can see this."
- Button: "Check in"; confirmation "Checked in. Thanks for taking a minute."
- Support prompt: "This week sounds heavy. You don't have to handle it alone."
- Quick routes: "Take a break", "Support", "Write in your diary"
- Sharing title: "Who can see this"; link "Change what you share"
- Break sheet title: "Two-minute break"; steps "Breathe in, 4", "Hold, 4", "Breathe out, 4", "Hold, 4"; button "Stop"

## Acceptance criteria

1. Given no mood is selected, when the student looks at "Check in", then it is disabled; when they pick "Okay", then it enables.
2. Given the student checks in with "Okay" and a note, when the POST succeeds, then the confirmation shows, the trend updates and the note text appears nowhere on the page.
3. Given the student checks in with "Really tough", when it saves, then the support prompt with the SADAG number appears.
4. Given 3 of the last 5 check-ins this week had high stress, when the page loads, then the support prompt shows; given only 2, then it does not.
5. Given 4 check-in days this week, when the trend renders, then 3 days are gaps (not the lowest value) and the text summary names 4 days.
6. Given the student shares only the mood trend with Sipho, when the sharing card renders, then it reads "Sipho can see your weekly mood trend. Never your notes or diary."
7. Given the check-ins endpoint fails, when the page loads, then the check-in form is still usable and the support line is visible.
8. Given a double tap on "Check in", when requests complete, then one check-in exists.
9. Given `prefers-reduced-motion`, when the break sheet runs, then nothing moves and the step text and counter update.
10. Given any page view, when network calls are inspected, then no analytics request contains the path `/dashboard/wellbeing` or any mood, stress or note value.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | BE-WEL-03 scopes to the caller; there is no endpoint that returns another student's check-ins except the Family shared-trend contract (BE-WEL-09), which returns aggregates only; POST through the BFF with the `Origin` check | PG-STU-WELL-Q16 |
| Security | Wellbeing responses are never stored in the Next data cache (`no-store`, dynamic route) and carry `Cache-Control: private, no-store` from the API | PG-STU-WELL-Q17 |
| Privacy and POPIA | Mood, stress and notes are special personal information (health) of minors: notes encrypted at rest with the diary key scheme, stored in af-south-1, excluded from logs (OBS-06 redaction on `/wellbeing/*` bodies), Sentry `beforeSend` drops request bodies and breadcrumbs for these routes, Session Replay disabled on wellbeing routes | PG-STU-WELL-Q18 |
| Privacy and POPIA | Analytics: Vercel Analytics `beforeSend` drops page views whose path starts with `/dashboard/wellbeing` or `/dashboard/diary`; no custom analytics events on this page at all; the data processing inventory (HRD-31) lists wellbeing as special information with the legal basis | PG-STU-WELL-Q19 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; chart and break sheet lazy; check-in card interactive without the chart chunk | PG-STU-WELL-Q20 |
| Resilience | Check-in works when the trend fails; idempotent POST; double-tap safe; offline message; support line rendered from the static `helplines.ts` even when every API call fails | PG-STU-WELL-Q21 |
| Observability | Sentry boundary with route tag and no PII; technical events only (`wellbeing_checkin_failed` as a Sentry breadcrumb without values); trace propagation through the BFF | PG-STU-WELL-Q22 |
| Accessibility | WCAG 2.2 AA; mood picker is a labelled radio group with visible text labels; chart has a text summary and a data table with words not numbers; `tel:` link has a full accessible name; break guide works without motion | PG-STU-WELL-Q23 |
| Rollout | Flag `wellbeing`; rollback by flag; the support page is outside the flag so help is never switched off | PG-STU-WELL-Q24 |
| Monitoring | Grafana "BE-WEL-03 POST success rate and p95"; alert when POST 5xx is over 1% for 10 minutes (lower threshold: a failed check-in on a bad day matters); Sentry alert on any error on this route in production | PG-STU-WELL-Q25 |

## Build tasks

- [ ] **PG-STU-WELL-01** 60-second check-in (Lucide face icons, optional note): `CheckInCard`, `MoodPicker`, note disclosure
- [ ] **PG-STU-WELL-02** Week trend chart (wellbeing zone colours): `WeekTrendChart` with the wellbeing tone, gaps for empty days, lazy-loaded
- [ ] **PG-STU-WELL-03** Supportive nudge when stress trends up: `nudge.ts` rule and `SupportPrompt`
- [ ] **PG-STU-WELL-04** One-tap routes: take a break, support page (`QuickRoutes`)
- [ ] **PG-STU-WELL-05** Parent sharing controls link: `SharingCard` with status lines from BE-WEL-06
- [ ] **PG-STU-WELL-07** `mood-scale.ts` shared scale (labels and icons) used by wellbeing, diary and parent pages
- [ ] **PG-STU-WELL-08** `StressChips` and the stress field in the check-in schema
- [ ] **PG-STU-WELL-09** Check-in mutation through the BFF with `Idempotency-Key`, pending, success, 429 and failure states
- [ ] **PG-STU-WELL-10** Already-checked-in-today state and "Check in again"
- [ ] **PG-STU-WELL-11** `trend-summary.ts` words-only summary and one-day and empty states
- [ ] **PG-STU-WELL-12** `BreakSheet` box-breathing guide with reduced-motion variant and `?break=1`
- [ ] **PG-STU-WELL-13** `RemindersRow` reading notification preferences with a link to change them
- [ ] **PG-STU-WELL-14** Loaders with `no-store` and the error state that keeps the form and support line usable
- [ ] **PG-STU-WELL-15** Stage variant line in the support prompt
- [ ] **PG-STU-WELL-16** Offline detection on the check-in button
- [ ] **PG-STU-WELL-17** Optional "Hours slept last night" field (0 to 24, half hours) on the check-in, and an "Average sleep this week: {n} h" line only when at least 3 check-ins carry it (the old summary averaged only check-ins that supplied it)
- [ ] **PG-STU-WELL-18** Stress band card from the latest check-in (old stress signal): "No signal yet" (Check in to start), "Low", "Medium" (Worth slowing down), "High" (Take a break today, with the break button); words only, magenta zone
- [ ] **PG-STU-WELL-19** Trend range toggle: 7 days (default) and 14 days (old default), as link chips
- [ ] **PG-STU-WELL-20** First check-in hero when there are no check-ins: a preview of the five-point scale with "Your first check-in takes under a minute" instead of an empty chart
- [ ] **PG-STU-WELL-21** Reminder copy and timing match the old service: one in-app nudge after 18:00 SAST, only for opted-in students with no check-in today, at most once a day (BE-WEL-07); the row reads "Evenings, if you haven't checked in"

## Quality tasks

- [ ] **PG-STU-WELL-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-WELL-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-WELL-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-WELL-Q04** Empty state with one clear next action
- [ ] **PG-STU-WELL-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-WELL-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-WELL-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-WELL-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-WELL-Q09** Layout at 1440px
- [ ] **PG-STU-WELL-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-WELL-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-WELL-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-WELL-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-WELL-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-WELL-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-WELL-Q16** Integration tests: check-ins of another student are unreachable; parent token gets 403 on `/wellbeing/checkins`
- [ ] **PG-STU-WELL-Q17** Verify `no-store` on loaders and `Cache-Control: private, no-store` on API responses
- [ ] **PG-STU-WELL-Q18** Sentry and log scrubbing for wellbeing routes, Replay disabled; test that a thrown error on this page carries no note text
- [ ] **PG-STU-WELL-Q19** Vercel Analytics `beforeSend` path filter for wellbeing and diary; Playwright network assertion; HRD-31 inventory entry
- [ ] **PG-STU-WELL-Q20** Lighthouse CI mobile budget; chart and break sheet chunks lazy
- [ ] **PG-STU-WELL-Q21** Failure tests: trend 500 keeps the form; double tap creates one check-in; offline message
- [ ] **PG-STU-WELL-Q22** Sentry route tag and breadcrumb review (no values)
- [ ] **PG-STU-WELL-Q23** Screen reader pass on mood picker, chart summary and break guide
- [ ] **PG-STU-WELL-Q24** `wellbeing` flag wired; support page confirmed outside it
- [ ] **PG-STU-WELL-Q25** Grafana panel and alerts for BE-WEL-03; Sentry production alert on the route

## Tests

Unit (Vitest):

- `nudge.test.ts`: "fewer than 3 check-ins never nudges", "3 of the last 5 low moods nudges", "3 of the last 5 high stress nudges", "check-ins older than 7 days are ignored".
- `trend-summary.test.ts`: "names the most common mood", "tie reads mixed", "never contains better, worse, improved or declined", "counts only days with a check-in".
- `mood-scale.test.ts`: "every value has a label and a Lucide icon".
- `check-in-card.test.tsx`: "button disabled until a mood is picked", "Really tough shows the support prompt after save".
- `break-sheet.test.tsx`: "reduced motion renders no animated element".

Playwright (`web/e2e/student/wellbeing.spec.ts`):

- "wellbeing: check in with a mood and see the confirmation"
- "wellbeing: really tough shows support with the helpline"
- "wellbeing: week trend shows gaps and a text summary"
- "wellbeing: sharing card lists only what is shared"
- "wellbeing: trend failure keeps the check-in usable"
- "wellbeing: no analytics request carries the path or values"
- "wellbeing: axe clean light and dark at 360 and 1440"

## Open questions

- BE-WEL-02 stores mood and a private note only; this page (and PG-PAR-WELL-01) needs a `stress` field. Add it to BE-WEL-02.
- Should check-in notes use the same encryption as diary entries (BE-WEL-04)? This spec assumes yes.
- Should the nudge rule live in the API so the dashboard card and any parent guidance use the same logic? It is a pure web function here for v1.
- Partly decided (35): the SADAG number is phone-checked before prod (PG-STU-SUPPORT). Still open: whether tap-to-call is acceptable for under-18 users.
- The old trend averaged all check-ins per day; this spec plots each day's latest. Pick one and state it in BE-WEL-03.
- The old model also stored energy level, sleep quality, triggers and coping strategies. This spec keeps mood, stress, sleep hours and a note so the check-in stays under a minute; confirm the rest are dropped.
- Decided (20 and the de-gamified rule): no streaks; the check-in streak is dropped.
