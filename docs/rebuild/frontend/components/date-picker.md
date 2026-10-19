# Date picker

| | |
|---|---|
| ID | `UI-13`, `UI-66` to `UI-69` |
| Phase | 3 |
| Depends on | UI-02, UI-03, UI-07 (ResponsiveDialog), UI-09 (Popover) |
| File path | `web/src/components/ui/calendar.tsx`, `web/src/components/common/date-picker.tsx`, `web/src/lib/dates.ts` (all to add) |
| Status | Not started. `react-day-picker` and `date-fns` are not in `web/package.json`; no calendar or date picker component exists. 0 of 5 tasks done. |

## Purpose

Lets students pick due dates (assessments), exam dates and calendar events, and admins pick report ranges. Dates are stored in UTC by the API (`timestamptz`) and shown in `Africa/Johannesburg` with `en-ZA` formatting unless a user setting differs.

## API

| Export | Prop | Type | Default | Notes |
|---|---|---|---|---|
| `Calendar` | react-day-picker props | | `weekStartsOn: 1` (Monday), locale `en-ZA` | shadcn calendar, restyled. |
| `DatePicker` | `value`, `onChange` | `Date or null` | | Trigger shows the formatted date; opens a Popover on desktop, the bottom sheet (ResponsiveDialog) on phones. |
| `DatePicker` | `min`, `max`, `disabled` | `Date`, `Date`, `(date) => boolean` | none | For example no due dates in the past for new assessments. |
| `DateRangePicker` | `value: { from, to }`, `onChange` | | | Admin and analytics ranges. |
| `DateField` | `control`, `name`, `label`, `description?` | | | Form field binding (UI-03 pattern). |
| `formatDate`, `formatDateTime`, `toZonedDate` | in `lib/dates.ts` | | | `date-fns` plus `@date-fns/tz` (or `date-fns-tz`), zone `Africa/Johannesburg`. |

## Variants

Single date, date range, date with time (time as a separate select in 15 minute steps). Optional native `input type="date"` on phones (decision UI-69).

## States

Empty ("Pick a date"), selected, invalid (out of range, with field error), disabled days, today marker, focus visible on day cells.

## Accessibility

- react-day-picker grid has `role="grid"`, arrow keys move days, Page Up and Down change month, Home and End go to week start and end.
- Day cells are at least 44px on phones.
- Trigger announces the selected date in full (for example "Due date, Friday 14 November 2026").
- Selected day uses graphite surface with on-primary text; today uses an outline, not citron text.
- Month transition off under reduced motion.
- RTL not required for v1.

## Tasks

- [ ] **UI-13** Date picker (react-day-picker plus date-fns)
- [ ] **UI-66** Add `react-day-picker`, `date-fns` and a timezone helper dependency (Renovate grouping, licence check MIT) and `npx shadcn@4.22.0 add calendar`; restyle Calendar to tokens with 44px day cells
- [ ] **UI-67** `web/src/lib/dates.ts`: `Africa/Johannesburg` formatting helpers (`en-ZA`, `d MMM yyyy`), UTC round trip for API `date-time` strings, unit tests across the SAST boundary at midnight
- [ ] **UI-68** `DatePicker`, `DateRangePicker` and `DateField` (Popover on desktop, ResponsiveDialog sheet on phones), min and max rules
- [ ] **UI-69** Decide and implement the phone strategy: native `input type="date"` versus the custom sheet, documented with the reasoning and tested on Pixel 7 and iPhone 14

## Tests

- Vitest `dates.test.ts`: `2026-11-13T22:30:00Z` formats as 14 Nov 2026 in Johannesburg; picking 14 Nov sends the agreed UTC value (date-only fields as `yyyy-MM-dd`, open question).
- Vitest: `DatePicker` with `min` disables earlier days; keyboard arrows move selection.
- Playwright `dev-ui-date-picker.spec.ts`: pick a date by keyboard only; sheet on Pixel 7, popover on Desktop Chrome; axe zero violations while open, light and dark, 360 and 1440 snapshots.

## Verification

1. A due date picked late in the evening is shown as the same day after reload (no off-by-one from UTC).
2. `npm audit` stays clean after adding the dependencies.

## Open questions

- Date-only fields (assessment due date without time): does the API model them as `DateOnly` (`yyyy-MM-dd`) or as `timestamptz` at local midnight? Needs agreement with the Academics module spec.
- Native date input on phones is faster and accessible but cannot be styled; is that acceptable for the brand?
