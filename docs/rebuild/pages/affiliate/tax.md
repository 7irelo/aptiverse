# Tax

| | |
|---|---|
| ID | `PG-AFF-TAX` |
| Route | `/refer/tax?year=<startYear>` (for example `year=2026` is the tax year 1 Mar 2026 to 28 Feb 2027) |
| Phase | 6 |
| Roles | student, parent with an affiliate profile (including closed profiles with past earnings) |
| Stages | any (no academic content) |
| Entitlement | free; affiliate profile (any status with earnings history) required |
| Depends on | BE-AFF-15, BE-AFF-14 (payouts in the year), FE-63, PG-AFF-EARN-04 (area layout), PG-BIL-CHECKOUT-04 (`formatZar`), PG-CMN-NOTIF-03 (date formatter) |
| Old app reference | `43f9faa:web/src/app/(app)/refer/tax/page.tsx`, `43f9faa:web/src/app/(app)/refer/_shared.tsx` (`TaxStatementTab`), `43f9faa:web/src/lib/api/affiliates.ts` (`downloadCsv`), `43f9faa:api/Controllers/AffiliatesController.cs` (`GET me/tax-years`, `GET me/statement?taxYear=`), `43f9faa:api/Modules/Affiliates/Aptiverse.Affiliates.Application/AffiliateProgramme.cs` (tax year helpers) |
| Status | Not started (0 of 40 tasks) |

## Purpose

Give affiliates what they need to declare their earnings to SARS: a summary per South African tax year (1 March to the end of February) of commissions earned, reversals and amounts paid, and a downloadable PDF statement. The page states plainly that Aptiverse does not withhold tax and that this is not tax advice.

What the old app (43f9faa) did and this page keeps:
- A list of tax years with activity, always including the current year even when empty, each with `paidZar`, `accruedZar` and `payoutCount`; the year is named for the year it starts in (the 2026 tax year runs 1 March 2026 to 28 February 2027).
- A CSV statement per year with two sections on purpose: Section 1 "Commission paid to you in this tax year" (date paid, payment reference, period start and end, entries, amount, total) and Section 2 "Commission earned in this tax year" (date earned, type, payment number, source payment reference, source amount, rate, commission, status, reason, total). Paid and earned differ whenever a hold straddles the end of February. The header carries the referral code, legal name, tax reference (from payout details) and generation time; the footer says it is a record of commission, not tax advice, in rand.
- The old app computed year bounds in UTC. The rebuild uses Africa/Johannesburg, so a commission between 22:00 and 24:00 UTC on the last day of February moves to the earlier year; migrated statements are re-checked (PG-AFF-TAX-Q24).
- The tax reference number is captured on Get paid (PG-AFF-DETAILS-14), not on this page.

## User stories

- As an affiliate, I want to pick a tax year and see what I was paid in it, so that I can complete my return.
- As an affiliate, I want a PDF statement for the year, so that I can keep it or hand it to whoever does my tax.
- As a former affiliate, I want to reach past statements even after I stop referring, so that my records stay complete.

## Layout

### Mobile (360px)

1. Area header and tabs ("Tax" current).
2. Tax year `Select`: options like "2026/27 (1 Mar 2026 to 28 Feb 2027)", newest first, only years with activity plus the current year. Current year marked "(so far)".
3. Summary card for the chosen year, label and value rows with `tabular-nums`:
   - "Commission earned" (sum of commission rows dated in the year)
   - "Refund reversals" (negative)
   - "Net earned"
   - "Paid to you" (payouts with `paidAt` in the year; this is the figure usually declared, see open questions)
   - "Earned but not yet paid at year end"
4. Download button "Download statement (PDF)" full width. Current year: "Download statement so far (PDF)".
5. Monthly breakdown disclosure (`Accordion`): rows March to February with earned and paid per month.
6. Notice card (muted): "Aptiverse does not deduct tax from your earnings. You may need to declare them to SARS. This statement is not tax advice."

### Desktop (1440px)

Area layout; grid `lg:grid-cols-[1fr_320px]`: summary card and monthly breakdown (as a `DataTable`, always expanded) on the left; year select, download button and notice in the right column, sticky.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/refer/tax/page.tsx` | server | Reads `year` param; defaults to current SA tax year |
| Loading, error | `web/src/app/(app)/refer/tax/{loading,error}.tsx` | server / client | Skeleton summary; `PageState` with retry |
| Not found | `web/src/app/(app)/refer/tax/not-found.tsx` | server | Year outside allowed range |
| Tax year select | `web/src/features/affiliates/components/tax-year-select.tsx` | client | Writes `year` with `router.replace` |
| Tax year helper | `web/src/features/affiliates/lib/tax-year.ts` | shared | `currentTaxYear(now)`, `taxYearRange(startYear)` in Africa/Johannesburg; leap year end on 29 Feb |
| Summary card | `web/src/features/affiliates/components/tax-summary-card.tsx` | server | All figures from API |
| Monthly breakdown | `web/src/features/affiliates/components/tax-monthly-table.tsx` | server | `DataTable` with mobile cards |
| Download button | `web/src/features/affiliates/components/tax-statement-download.tsx` | client | Requests a short-lived URL, then downloads; pending and failure states |
| Loader | `web/src/features/affiliates/server/get-tax-year.ts` | server | Per user, React `cache()` |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/affiliates/me/tax/{year}` (BE-AFF-15) | GET | `taxYearStart` (2026), `periodStart`, `periodEnd`, `isComplete`, `commissionCents`, `reversalCents`, `netEarnedCents`, `paidCents`, `unpaidAtYearEndCents`, `months[]` (`month`, `earnedCents`, `paidCents`), `availableYears[]`, `currency` | per user; past complete years may be cached per user in TanStack for the session only |
| `/affiliates/me/tax/{year}/statement` (proposed, part of BE-AFF-15) | GET | returns `url` (presigned, 5 minutes) and `fileName`; query `format=pdf` or `format=csv` | none |
| `/affiliates/me/tax-years` (gap; old `GET api/affiliates/me/tax-years`) | GET | `items[]` (`taxYear`, `label`, `startsOn`, `endsOn`, `paidCents`, `accruedCents`, `payoutCount`); always includes the current year | per user |
| `/affiliates/me/payout-details` (BE-AFF-12 read) | GET | `taxReferenceProvided`, `legalNameDisplay` (for the header preview and the missing tax reference hint) | per user |

### Mutations

None. Statement generation is a read (the API may render on demand or serve a stored PDF).

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Streaming | Skeleton summary | none |
| Populated (complete year) | `isComplete = true` | As in Layout | Download |
| Populated (current year) | `isComplete = false` | Heading suffix "(so far)". Hint: "This year ends on 28 Feb 2027. Figures update as you earn." | "Download statement so far (PDF)" |
| Empty year | Year with no activity | "No affiliate earnings in 2025/26." | Select another year |
| No history | `availableYears` empty | Title "No tax statements yet". Body "Once you earn your first commission, your statement for that tax year appears here." | Button "Go to earnings" |
| Invalid year | `year` not a number or outside `availableYears` plus current | `not-found.tsx`: "We do not have a statement for that year." | Link "Go to the current tax year" |
| Downloading | Statement request pending | Button "Preparing PDF" disabled | none |
| No tax reference | `taxReferenceProvided = false` | Hint under the download: "Your statement will not show a tax reference number. Add one on Get paid if you have it." | Link "Add tax reference" to `/refer/payout-details` |
| Current year, empty | current year with no activity | "Nothing earned or paid yet in 2026/27. You can still download an empty statement." | Download stays enabled |
| Download failed | Statement request fails | Toast "We could not prepare your statement. Try again in a minute." | Retry on button |
| Not an affiliate | No affiliate profile | Redirect to `/refer` | none |
| Error | Loader fails | `PageState` title "We could not load your tax summary", body "Check your connection and try again." | "Try again" |
| Forbidden | Admin | `PageForbidden` | Link home |

## Stage variants

None. Identical for all accounts. Copy addresses adults and older students plainly; no academic wording.

## Interactions and edge cases

- Tax year boundaries use Africa/Johannesburg dates: a commission at 23:30 on 28 February belongs to the year ending that day, a payout at 00:10 on 1 March belongs to the next year. The API is the source; the web helper only builds labels.
- Leap years: the 2027/28 tax year ends on 29 Feb 2028; labels come from `periodEnd`.
- Reversal of a commission earned in a previous tax year appears in the year the reversal happened (shown as a negative in that year's "Refund reversals"), never edits the earlier statement.
- Paid versus earned: both are shown so affiliates and their tax practitioners can choose the right basis; the page does not advise which.
- Suspended or former affiliates keep access to statements.
- Year select changes the URL, so a link to a specific year can be bookmarked.
- PDF statement includes affiliate name, tax number if supplied (open question), period, totals, monthly table and the same notice text; generated in the API.

## Copy

- Year option: "2026/27 (1 Mar 2026 to 28 Feb 2027)", current year adds "(so far)"
- Labels: "Commission earned", "Refund reversals", "Net earned", "Paid to you", "Earned but not yet paid at year end"
- "Download statement (PDF)", "Download statement so far (PDF)", "Preparing PDF", "Download as spreadsheet (CSV)"
- Summary tiles from the year list: "Paid to you" with hint "{n} payments", "Earned" with hint "Commission recorded in the year"
- Intro: "The South African tax year runs from 1 March to the end of February. Download a statement of what you earned and what was paid to you, so you can declare it."
- Notice: "Aptiverse does not deduct tax from your earnings. You may need to declare them to SARS. This statement is not tax advice."
- Empty: "No tax statements yet", "Once you earn your first commission, your statement for that tax year appears here."

## Acceptance criteria

- AC-01 Given an affiliate with earnings in 2025/26 and 2026/27, when the page loads on 19 Oct 2026, then the default year is 2026/27 marked "(so far)" and both years are in the select.
- AC-02 Given the summary, when compared with `GET /affiliates/me/tax/2026`, then every figure matches to the cent and net earned equals commission minus reversals.
- AC-03 Given a payout at 00:10 on 1 March 2027 SAST, when viewing 2026/27, then it is not in "Paid to you" for 2026/27 (fixture test against the API).
- AC-04 Given "Download statement (PDF)", when pressed, then a PDF downloads via a short-lived URL and the button shows "Preparing PDF" meanwhile.
- AC-05 Given `year=1999`, when loaded, then the not-found state shows.
- AC-06 Given a former affiliate, when they open the page, then past statements remain available.
- AC-07 Given any year, when the page renders, then the not-tax-advice notice is visible.

## Production readiness

### Security
- [ ] Session-scoped reads; statement URLs are presigned for 5 minutes, single object, owner checked before signing. (PG-AFF-TAX-Q16)
- [ ] Only the year appears in the URL; no ids or names. (PG-AFF-TAX-Q16)

### Privacy and POPIA
- [ ] Statement PDF contains only what a tax return needs; retention follows the affiliate tax records rule from Phase 10. (PG-AFF-TAX-10)
- [ ] PDF not cached by the browser (`Cache-Control: private, no-store` on the presigned response). (PG-AFF-TAX-Q16)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip; PDF generated server-side, never in the browser. (PG-AFF-TAX-Q17)

### Resilience
- [ ] Download retries safely (idempotent GET); failure toast; double-click guard while preparing. (PG-AFF-TAX-07)

### Observability
- [ ] Events: `affiliate_tax_viewed` (year), `affiliate_tax_year_changed`, `affiliate_tax_statement_downloaded`, `affiliate_tax_statement_failed`. Sentry tags `{ page: "PG-AFF-TAX" }`. (PG-AFF-TAX-Q18)

### Accessibility
- [ ] WCAG 2.2 AA: select labelled "Tax year"; negative values read as "minus"; table headers scoped; download button states announced. (PG-AFF-TAX-Q19)

### Rollout
- [ ] Behind `flags.affiliates`; before launch, migrated statements for past tax years are spot-checked to the cent against the old app (MIG reconciliation). (PG-AFF-TAX-Q20)

### Monitoring and alerts
- [ ] Alert on statement generation failures above 2% over a day and around 1 March to 31 May (filing season) at a tighter 1% over an hour. (PG-AFF-TAX-Q21)

## Build tasks

- [ ] **PG-AFF-TAX-01** Tax-year selector and statement download (split into -02 to -07)
- [ ] **PG-AFF-TAX-02** `tax-year.ts` helper: current SA tax year and labels in Africa/Johannesburg, leap-year end, unit tested
- [ ] **PG-AFF-TAX-03** Route files, `year` param parsing and `get-tax-year` loader
- [ ] **PG-AFF-TAX-04** Tax year select from `availableYears` writing `year` to the URL
- [ ] **PG-AFF-TAX-05** Summary card (earned, reversals, net, paid, unpaid at year end)
- [ ] **PG-AFF-TAX-06** Monthly breakdown (accordion on mobile, table on desktop)
- [ ] **PG-AFF-TAX-07** Statement download via presigned URL with pending, failure and double-click guard
- [ ] **PG-AFF-TAX-08** Current-year "(so far)" variant and empty, no history and invalid year states
- [ ] **PG-AFF-TAX-09** Not-tax-advice notice on page and in the PDF spec handed to BE-AFF-15
- [ ] **PG-AFF-TAX-10** Former and suspended affiliate access to past statements
- [ ] **PG-AFF-TAX-11** CSV download ("Download as spreadsheet (CSV)") alongside the PDF, using the old two-section layout (paid, then earned)
- [ ] **PG-AFF-TAX-12** Year select fed by `GET /affiliates/me/tax-years`, always including the current year (empty current year still downloadable)
- [ ] **PG-AFF-TAX-13** Payout count hint on "Paid to you" ("{n} payments") and the 1 March intro line
- [ ] **PG-AFF-TAX-14** Missing tax reference hint linking to Get paid
- [ ] **PG-AFF-TAX-15** Statement content spec for BE-AFF-15: header (code, legal name, tax reference, generated time), two sections with totals, footer notice (doc task handed to backend)

## Quality tasks

- [ ] **PG-AFF-TAX-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` for an invalid year
- [ ] **PG-AFF-TAX-Q02** Server loader in `src/features/affiliates/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-AFF-TAX-Q03** No mutations; statement URL fetched through `/api/bff` with the generated hook
- [ ] **PG-AFF-TAX-Q04** Empty state with one clear next action
- [ ] **PG-AFF-TAX-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-AFF-TAX-Q06** Forbidden state for admin
- [ ] **PG-AFF-TAX-Q07** Stage-aware wording checked (no academic wording)
- [ ] **PG-AFF-TAX-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); table collapses to cards
- [ ] **PG-AFF-TAX-Q09** Layout at 1440px
- [ ] **PG-AFF-TAX-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AFF-TAX-Q11** Copy review: no emojis, no em or en dashes, plain and specific; notice wording checked against the claims ledger
- [ ] **PG-AFF-TAX-Q12** axe: zero violations in light and dark
- [ ] **PG-AFF-TAX-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AFF-TAX-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-AFF-TAX-Q15** `generateMetadata` title "Tax"; area tab active state correct
- [ ] **PG-AFF-TAX-Q16** Security review: presigned URL scope and expiry, owner check, no-store
- [ ] **PG-AFF-TAX-Q17** Performance: Lighthouse CI mobile budget
- [ ] **PG-AFF-TAX-Q18** Observability: events and Sentry tags wired
- [ ] **PG-AFF-TAX-Q19** WCAG 2.2 AA pass
- [ ] **PG-AFF-TAX-Q20** Rollout: `flags.affiliates`; migrated past statements spot-checked to the cent
- [ ] **PG-AFF-TAX-Q21** Monitoring: statement failure alerts with filing-season threshold
- [ ] **PG-AFF-TAX-Q22** Boundary fixtures: 28 Feb 23:30 SAST and 1 Mar 00:10 SAST land in the right years; leap year 29 Feb
- [ ] **PG-AFF-TAX-Q23** Cents test: monthly rows sum exactly to the yearly earned and paid totals
- [ ] **PG-AFF-TAX-Q24** Migration parity: yearly paid and earned totals for 20 migrated affiliates match 43f9faa statements, with any difference explained only by the UTC to SAST boundary change
- [ ] **PG-AFF-TAX-Q25** CSV safety: cells starting with `=`, `+`, `-` or `@` are escaped (formula injection) and the file opens correctly in Excel and Google Sheets

## Tests

### Unit (Vitest)
- `tax-year.test.ts`: current year on 28 Feb and 1 Mar SAST; labels; leap year; UTC midnight edge.
- `tax-summary-card.test.tsx`: figures to the cent; negative reversal label; "(so far)" variant.
- `tax-statement-download.test.tsx`: pending, success, failure, double-click guard.

### Playwright (`web/tests/e2e/affiliates/tax.spec.ts`)
- current tax year shows so far and download
- switching year updates url and figures
- invalid year shows not found
- no history shows empty state
- pdf download uses short lived url
- former affiliate still sees statements
- csv download has paid and earned sections
- empty current year is still offered
- missing tax reference hint links to get paid
- axe clean light and dark at 360 and 1440

## Open questions

- Which basis should be highlighted for SARS, paid or earned? The page shows both and advises neither.
- Tax reference: the old app captured it (optional) on Get paid; this spec keeps it there (PG-AFF-DETAILS-14). BE-AFF-12 needs the field.
- PDF, CSV or both? The old app offered CSV only; this spec offers both.
- `GET /affiliates/me/tax-years` is specified in `../../backend/affiliates.md`.
- Does the statement endpoint (`/affiliates/me/tax/{year}/statement`) exist separately from BE-AFF-15's summary?
- Does Aptiverse need to issue IRP5 or IT3 style certificates for affiliates? That would change this page substantially. Needs an accountant (DECISIONS.md section F, item 50; retention of tax records is item 39).
