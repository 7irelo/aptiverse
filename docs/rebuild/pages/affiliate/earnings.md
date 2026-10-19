# Earnings

| | |
|---|---|
| ID | `PG-AFF-EARN` |
| Route | `/refer` |
| Phase | 6 |
| Roles | student, parent (any signed-in account reached from "Refer and earn"; affiliate is a profile, not a role, DECISIONS.md section E) |
| Stages | high school, university, parent (copy identical) |
| Entitlement | free; earnings blocks need an affiliate profile, created by enrolment (BE-AFF-02) |
| Depends on | BE-AFF-02, BE-AFF-04, BE-AFF-05, BE-AFF-09, BE-AFF-10, BE-AFF-11, BE-AFF-12 (payout details present flag), BE-AFF-31 (terms), BE-AFF-83 (attribution dates), FE-25, FE-63, PG-BIL-CHECKOUT-04 (`formatZar`), PG-CMN-NOTIF-03 (date formatter), PG-MKT-AFF (landing and join) |
| Old app reference | `43f9faa:web/src/app/(app)/refer/layout.tsx` (hero, onboarding banners, tabs, how it works), `43f9faa:web/src/app/(app)/refer/_shared.tsx` (`EarningsHero`, `MoneyTile`, `OnboardingAlerts`, `ReferralsTab`, `CommissionsTab`, `HowItWorks`), `43f9faa:web/src/app/(app)/refer/page.tsx` (referrals), `43f9faa:web/src/app/(app)/refer/earnings/page.tsx` (commission ledger), `43f9faa:web/src/lib/api/affiliates.ts`, `43f9faa:api/Controllers/AffiliatesController.cs` (`GET me`, `me/referrals`, `me/commissions`), `43f9faa:api/Modules/Affiliates/Aptiverse.Affiliates.Application/AffiliateProgramme.cs` (terms) |
| Status | Nav entry exists for student and parent (`nav-config.ts`, "Refer and earn"); page not started (0 of 49 tasks, 1 deferred: PG-AFF-EARN-23) |
| Decisions | 3 (in v1), 3b (automatic enrolment), 3c (old terms, attribution capped at 12 months), 31 (18 or older only) |

## Purpose

The home of the affiliate area. An affiliate copies or shares their referral link, sees what they have earned split into held, released and paid balances accurate to the cent, and follows each referral from sign-up to paid. Adult accounts that are not affiliates yet get their link here in one step (decision 3b). Sub-navigation links to Payments (`/refer/payments`), Get paid (`/refer/payout-details`) and Tax (`/refer/tax`).

Ledger rules the page reflects: commissions are append-only rows driven by Billing events (BE-AFF-07, BE-AFF-08). A new commission is held for the hold period, then released by a scheduled job (BE-AFF-09), then paid in a payout batch (BE-AFF-13). A refund adds a reversal row; the page never edits amounts.

What the old app (43f9faa) already did and this page keeps (behaviour only, no code is copied):
- A "You have earned" headline (lifetime earned, net of reversals) at display size, with the referral count under it, shown on every `/refer` page by the area layout.
- Four money states, not three: Under review (`pending`: referral flagged or affiliate suspended, nothing can be paid), On hold (`held`, counting down to `holdUntil`), Ready to pay (`payable`) and Paid to you (`paid`). A clawback after payout can leave a negative carried balance that reduces the next payout.
- Programme terms from one config (`AffiliateProgramme`): 40% of the VAT-exclusive amount a referred person actually pays, for their first 3 monthly payments or 1 annual payment, counted from their first payment; 30-day hold; lifetime attribution in the old app (a free sign-up who subscribed a year later still earned), now capped at 12 months from first touch (decision 3c); a referral can only be claimed within 7 days of account creation; first touch wins; self-referral is blocked. The page shows these figures from the API, never hardcoded.
- Every account got an active affiliate row and an 8 character code (unambiguous alphabet, case and space insensitive) minted on first read; there was no application step. Suspension was an admin switch. The rebuild keeps this model (decision 3b) with one change: the profile is created when the adult accepts the terms (BE-AFF-02), not silently on first read.
- A commission ledger list (old `/refer/earnings`): one row per accrual, reversal or adjustment with "Payment 2 of 3", "40% of {commissionable amount}" (the payment excluding VAT, from the ledger row), status and hold date, and the bank reference once paid.
- Payout details banners driven by `reviewStatus` (`not_submitted`, `in_review`, `confirmed`, `needs_fixing` with review notes; the old not started, submitted, approved, rejected map across in that order).

## User stories

- As an affiliate, I want to copy my link in one tap and share it on WhatsApp, so that referring is effortless.
- As an affiliate, I want to see held, released and paid amounts to the cent, so that I know what is coming and when.
- As an affiliate, I want to see each referral's status without seeing their personal details, so that I can follow up fairly.
- As an affiliate with no payout details saved, I want a clear prompt to add them, so that my released money can be paid.
- As an adult student or parent who is not an affiliate, I want to know how the programme works and get my link straight away.

## Layout

### Mobile (360px)

1. `PageHeader`: title "Refer and earn", description "Share your link. Earn when people you refer pay for a plan."
2. Area tabs as a horizontally scrollable link row (not ARIA tabs, they are links): "Earnings" (current), "Payments", "Get paid", "Tax". Each 44px tall.
3. Action banner (one at most): no payout details ("Add your bank details so we can pay you.") or suspended account.
4. Referral link card: read-only field showing `aptiverse.co.za/r/THANDI24`, buttons "Copy link" and "Share" (Web Share API; hidden when unsupported). Under it: "Your code: THANDI24".
5. Earnings headline (in the area layout, above the tabs on every `/refer` page): overline "You have earned", lifetime earned at display size (`formatZar(cents, { showCents: true })`), line "Nobody has used your link yet." or "{n} people have signed up on your link."
6. Balance tiles in a 2 by 2 grid: "On hold" (hint "First releases {date}" or "Clears after {holdDays} days"), "Ready to pay" (hint "In the next payout run"; "Paid once you reach R100.00." when below the minimum), "Paid to you" (hint "Already in your bank"), "Under review" (hint "We are checking these" or "Nothing held back"). Values `tabular-nums`. Line under the grid: "Next payout run: 25 Oct 2026" when known.
7. How it works (in the area layout, below the tab content on every `/refer` page): three cards built from API terms: "{rate}% of every payment" with the line "Paid on the amount excluding VAT." and no worked rand example (VAT status is still owed, DECISIONS.md F item 50), "Each referral counts for {attributionMonths} months", "Paid out after {holdDays} days".
8. Referrals list: rows "Signed up 3 Oct 2026" with status badge (Signed up, Earning, Complete, Window ended, Under review, Not eligible), secondary line "First payment 12 Oct 2026, 2 of 3 payments earned" or "Free account. You earn if they subscribe by 3 Oct 2027." (from `attributionExpiresAt`), or "Window ended 3 Oct 2027" once expired, earned amount right-aligned. "Show more" pages. Filter `Select`: All, Signed up, Earning, Complete, Window ended, Under review.
9. Commission history (anchor `#commissions`, collapsed `Accordion` on mobile): ledger rows "Payment 2 of 3" or "Refund adjustment" or "Adjustment", date, "40% of {commissionable amount}" (the payment excluding VAT, from the ledger row), reason when present, "Bank ref APV-000123" once paid; amount right-aligned (negative in the rose token with a minus sign and `aria-label` "minus R51.60"); status "Under review", "On hold until 2 Nov 2026", "Ready to pay", "Paid", "Reversed".

### Desktop (1440px)

`PageShell` `max-w-5xl`. Header with area tabs under it. Row 1: referral link card (two columns) and payout details status (one column). Row 2: three balance `StatCard`s in a row. Row 3: referrals as a `DataTable` with columns Date, Plan, Status, Commission, Releases on. How it works sits in the right column beside the link card on wide screens.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Area layout | `web/src/app/(app)/refer/layout.tsx` | server | `PageShell`, header, area tabs; resolves affiliate status once |
| Route page | `web/src/app/(app)/refer/page.tsx` | server | Earnings view or join view |
| Loading, error | `web/src/app/(app)/refer/{loading,error}.tsx` | server / client | `PageLoading cards={3}`, `PageState` with retry |
| Area tabs | `web/src/features/affiliates/components/affiliate-tabs.tsx` | client | `usePathname` for `aria-current="page"` |
| Status banner | `web/src/features/affiliates/components/affiliate-banner.tsx` | server | Missing payout details, suspended |
| Referral link card | `web/src/features/affiliates/components/referral-link-card.tsx` | client | Copy with Clipboard API fallback to select; Web Share |
| Balances | `web/src/features/affiliates/components/balance-cards.tsx` | server | Uses `StatCard`; all cents from API |
| Referrals table | `web/src/features/affiliates/components/referrals-table.tsx` | client | `DataTable`, cursor paging, status filter in URL |
| How it works | `web/src/features/affiliates/components/how-it-works.tsx` | server | Rendered by the area layout; numbers (rate, payments, hold days, attribution months) from `GET /affiliates/terms` |
| Earnings headline | `web/src/features/affiliates/components/earnings-headline.tsx` | server | Rendered by the area layout on every `/refer` page |
| Payout onboarding banner | `web/src/features/affiliates/components/payout-onboarding-banner.tsx` | server | Rendered by the area layout; one banner by `reviewStatus` |
| Commission history | `web/src/features/affiliates/components/commission-history.tsx` | client | Cursor-paged ledger list; `#commissions` anchor |
| Status labels | `web/src/features/affiliates/lib/affiliate-labels.ts` | shared | Referral, commission and onboarding status to label and token |
| Join view | `web/src/features/affiliates/components/join-view.tsx` | server | Terms summary plus the shared `EnrolForm` from PG-MKT-AFF-02; under-18 message instead of the form |
| Loaders | `web/src/features/affiliates/server/get-affiliate-me.ts`, `get-earnings.ts`, `get-referrals.ts` | server | Per user, React `cache()` only |
| Money | `web/src/lib/format/money.ts` | shared | From PG-BIL-CHECKOUT-04 |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/affiliates/me/code` (BE-AFF-04) | GET | `code`, `shareUrl`, `status` (`active`, `suspended`, `closed`; `404` means not enrolled), `payoutDetailsStatus`, `audience` | per user |
| `/affiliates/terms` (BE-AFF-31) | GET | `version`, `commissionRatePercent`, `commissionableMonthlyPayments`, `commissionableAnnualPayments`, `holdDays`, `attributionMonths`, `minimumPayoutCents` | tag `affiliates:terms` |
| `/affiliates/me/earnings` (BE-AFF-10) | GET | `lifetimeEarnedCents` (net of reversals, excluding pending), `pendingCents` (under review), `heldCents`, `releasedCents` (ready to pay), `paidCents`, `reversedCents`, `carriedBalanceCents` (negative or 0), `currency`, `nextReleaseAt`, `nextReleaseCents`, `nextPayoutRunAt`, `minimumPayoutCents`, `hasPayoutDetails`, `needsPayoutDetails`, `reviewStatus` (not_submitted, in_review, confirmed, needs_fixing), `reviewNotes`, `referralsTotal`, `referralsByStatus` | per user |
| `/affiliates/me/referrals` (BE-AFF-11) | GET | `items[]` (`id`, `signedUpAt`, `attributedAt`, `attributionExpiresAt`, `firstPaymentAt` or null, `planCode` or null, `status` (signed, earning, completed, expired, flagged, blocked), `paymentsCommissioned`, `paymentsRemaining`, `earnedCents`), `nextCursor`; query `status`, `cursor` | per user, TanStack infinite query |
| `/affiliates/me/commissions` (gap: not in 02-backend; old `GET api/affiliates/me/commissions`) | GET | `items[]` (`id`, `referralId`, `entryType` (accrual, reversal, adjustment), `status` (pending, held, payable, paid, reversed), `paymentNumber`, `sourcePaymentAmountCents`, `commissionRateBps`, `amountCents` (signed), `occurredAt`, `holdUntil`, `paidAt`, `planCode`, `reason`, `paymentReference`), `nextCursor` | per user, TanStack infinite query |

### Mutations

Enrol (`POST /affiliates/me/enrol`, BE-AFF-02) from the join view, through the shared `EnrolForm` server action (PG-MKT-AFF-02); on success the page re-renders as the earnings view. Copy and share are client-only.

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Streaming | Skeleton link card and three balance skeletons | none |
| Not an affiliate | `GET /affiliates/me/code` is `404`, adult | Title "Earn by sharing Aptiverse". Body "When someone you refer pays for a plan, you earn a share of what they pay. Agree to the terms and your link is ready straight away." Terms summary and checkbox "I agree to the affiliate terms" | Button "Get my link" |
| Under 18 | `/me` says not adult | Title "Affiliates must be 18 or older". Body "You can still share Aptiverse with friends, but we cannot pay referral commission to anyone under 18." | none |
| Suspended | `suspended` | Banner: "Your affiliate account is paused while we look into some referrals. Your earned balance is safe. We will email you." Link card disabled | Link "Contact support" |
| Enrolled, no referrals | active, zero referrals | Referrals empty: "No referrals yet. Share your link to get started." Balances show `R0.00` (real zero from the ledger, not missing data) | "Copy link" |
| No payout details | `needsPayoutDetails = true` and `reviewStatus = not_submitted` | Banner: "You have money waiting. Add your ID and bank details so it can be paid out." | Button "Add payout details" to `/refer/payout-details` |
| Payout details in review | `reviewStatus = in_review` | Banner: "Your payout details are with us for review. Earnings keep adding up in the meantime." | none |
| Payout details need fixing | `reviewStatus = needs_fixing` | Banner: "We could not verify your payout details. {reviewNotes} Please correct them. Nothing you have earned is lost." | Button "Correct payout details" |
| Under review money | `pendingCents > 0` | Tile hint "We are checking these" | none |
| No one referred yet | `referralsTotal = 0` | Headline line "Nobody has used your link yet." Referrals empty: title "Nobody has used your link yet", body "Send it to a class group, or anyone looking for help with their work." | "Copy link" |
| No commissions yet | ledger empty | "No earnings yet. You earn the month someone you referred pays for a subscription." | none |
| Headline load error | earnings call fails inside the layout | "We could not load your referral page just now. Try again." (layout-level `PageState`) | "Try again" |
| Below minimum | `releasedCents < minimumPayoutCents` | Hint on "Ready to pay": "Paid once you reach R100.00." | none |
| Populated | active with data | As in Layout | none |
| Referrals filter empty | Filter returns none | "No referrals with this status." | "Show all" |
| Copy success | Copy pressed | Toast "Link copied" | none |
| Copy failed | Clipboard denied | Field text is selected; toast "Press and hold to copy the link." | none |
| Error | Loader fails | `PageState` title "We could not load your earnings", body "Your balance is safe. Check your connection and try again." | "Try again" |
| Forbidden | Admin role | `PageForbidden` "The affiliate area is for student and parent accounts." | Link home |

## Stage variants

- Identical copy for high school students, university students and parents. No academic data appears.
- Under-18 students: cannot be affiliates, with or without parental consent (decision 31); they see the under-18 state.

## Interactions and edge cases

- Balance consistency: held + ready to pay + paid equals total earned minus reversals; the page shows the API's three figures and never sums them itself for display beyond a "Total earned" tooltip computed by the API.
- Refund after release: a reversal row reduces "Ready to pay"; if it would go negative, the API carries a negative balance and the card reads "-R49.00" with hint "A refund reversed an earlier commission. It comes off your next payout."
- Under review referrals (fraud signals, BE-AFF-06) show status "Under review" with no reason text and no commission until cleared.
- Referral identity: rows never show names, emails or schools of referred people; only date, plan and status.
- Self-referral and same-household fingerprints are handled server-side; the page simply shows "Under review".
- Share text: "I use Aptiverse to study. Try it with my link: <url>". No incentive claims beyond the programme terms.
- Code change is not offered in v1.
- Code display: 8 characters from an alphabet without O, 0, I or 1; a separate "Copy code" control copies just the code (people read it aloud or write it down). The API compares codes case and space insensitively, so the page shows it in capitals only.
- Share falls back to copy when the Web Share sheet is cancelled or throws (old app behaviour); the copy failure toast reads "Your browser would not let us copy that. Press and hold the link to copy it."
- Annual plans: a referral on an annual plan earns on 1 payment, so the row reads "1 of 1 payments earned"; the API supplies `paymentsCommissioned` and `paymentsRemaining`, the page never assumes 3.
- Rate changes apply to new payments only; ledger rows show the rate stored on each row, so two rows may show different percentages.
- Lifetime earned excludes money under review and is net of reversals (a reversed accrual and its reversal cancel out), matching the API sum.
- Blocked referrals (self-referral at claim time, or rejected on review) show "Not eligible" with no amount and no reason text.
- Attribution window (decision 3c): each referral earns only on payments made within {attributionMonths} months of the first click. Rows show the end date from `attributionExpiresAt`; after it the status is "Window ended" and earned amounts stay as they are. Payments already earned are never taken back because the window ended.
- Referral claim (binding a new account to a code) is silent and happens on first authenticated render (owned by PG-MKT-AFF-03 and the app shell); this page never shows claim errors.
- Old route `/refer/earnings` (the ledger) redirects permanently to `/refer#commissions` (PG-AFF-EARN-18).
- Times shown in Africa/Johannesburg; release dates as "Releases on 2 Nov 2026".

## Copy

- Title "Refer and earn"; description "Share your link. Earn when people you refer pay for a plan."
- Tabs "Earnings", "Payments", "Get paid", "Tax"
- "Copy link", "Share", "Your code: THANDI24", toast "Link copied"
- Headline "You have earned", "Nobody has used your link yet.", "{n} people have signed up on your link." ("1 person has signed up on your link.")
- Balances "On hold", "Ready to pay", "Paid to you", "Under review"; hints "First releases 2 Nov 2026", "Clears after 30 days", "In the next payout run", "Already in your bank", "We are checking these", "Nothing held back", "Paid once you reach R100.00."
- Referral statuses "Signed up", "Earning", "Complete", "Window ended", "Under review", "Not eligible"; secondary lines "You earn if they subscribe by {date}.", "Window ended {date}"
- Commission statuses "Under review", "On hold until {date}", "Ready to pay", "Paid", "Reversed"; row titles "Payment {n} of {max}", "Refund adjustment", "Adjustment"
- How it works (figures from API; the old programme values were 40%, 3 monthly or 1 annual payment, 30 days): "{rate}% of every payment. You earn {rate}% of what someone you referred actually pays, excluding VAT, for their first {n} payments." / "Each referral counts for {attributionMonths} months. Somebody can sign up free today and subscribe later that year. You still earn, as long as they pay within {attributionMonths} months of first clicking your link." / "Paid out after {holdDays} days. Earnings stay on hold for {holdDays} days so refunds are settled before money moves."

## Acceptance criteria

- AC-01 Given an affiliate, when the page loads, then held, ready to pay and paid show exactly the cents from `GET /affiliates/me/earnings`, formatted `R1 234.50`.
- AC-02 Given "Copy link", when pressed, then the share URL is on the clipboard and "Link copied" is announced.
- AC-03 Given a browser without Web Share, when the card renders, then the Share button is absent and copy still works.
- AC-04 Given a referral row, when inspected, then it contains no name, email or school of the referred person.
- AC-05 Given `hasPayoutDetails = false`, when the page loads, then the banner links to `/refer/payout-details`.
- AC-06 Given an adult account that is not enrolled, when it opens `/refer`, then the join view shows, no earnings endpoint is called, and pressing "Get my link" with the box ticked shows the link on the same page.
- AC-07 Given a refund reversal larger than ready to pay, when the page loads, then the negative balance shows with the reversal hint.
- AC-08 Given the status filter "Earning", when chosen, then the URL has `status=earning` and only earning rows show.
- AC-09 Given a suspended affiliate, when the page loads, then the banner shows and copy and share are disabled.
- AC-10 Given any `/refer` route, when it loads, then the "You have earned" headline and How it works render from the layout with figures from the API.
- AC-11 Given `pendingCents > 0`, when the page loads, then an "Under review" tile shows that amount and it is not included in lifetime earned.
- AC-12 Given a ledger with an accrual and its reversal, when the commission history renders, then both rows show (the reversal negative) and lifetime earned counts neither.
- AC-13 Given `reviewStatus = needs_fixing` with review notes, when the page loads, then the banner shows the notes and states that nothing earned is lost.
- AC-14 Given a referral on an annual plan with its one payment earned, when the row renders, then it reads "1 of 1 payments earned" and status "Complete".
- AC-15 Given a request to `/refer/earnings`, when served, then it responds with a permanent redirect to `/refer#commissions`.
- AC-16 Given an under-18 account, when it opens `/refer`, then the under-18 state shows and there is no enrol button.
- AC-17 Given a referral whose `attributionExpiresAt` has passed, when the row renders, then it reads "Window ended {date}" and keeps its earned amount.

## Production readiness

### Security
- [ ] All reads scoped to the session user server-side; no affiliate id in the URL; another user's data cannot be requested. (PG-AFF-EARN-Q16)
- [ ] Referral rows carry no PII of the referred person (API contract test plus UI test). (PG-AFF-EARN-Q17)
- [ ] Share URL contains only the code; no user id or email. (PG-AFF-EARN-Q17)

### Privacy and POPIA
- [ ] Minors: under-18 accounts never see the enrol form and the API refuses them anyway (BE-AFF-19); the page shows "Affiliates must be 18 or older" (decision 31). (PG-AFF-EARN-12)
- [ ] Analytics never sends amounts or codes to third parties. (PG-AFF-EARN-Q19)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip; referrals table paged 20 at a time. (PG-AFF-EARN-Q18)
- [ ] No shared cache for per-user ledger data; the layout resolves affiliate status once per request with React `cache()`. (PG-AFF-EARN-Q18)

### Resilience
- [ ] Balances card and referrals table in separate Suspense boundaries so a slow referrals query never hides balances. (PG-AFF-EARN-05)
- [ ] Clipboard failure falls back to selection with guidance. (PG-AFF-EARN-07)

### Observability
- [ ] Events: `affiliate_earnings_viewed` (status), `affiliate_link_copied`, `affiliate_link_shared`, `affiliate_referrals_filtered`, `affiliate_enrolled`. (PG-AFF-EARN-Q19)
- [ ] Sentry tags `{ page: "PG-AFF-EARN" }`; traces through to BE-AFF-10. (PG-AFF-EARN-Q19)

### Accessibility
- [ ] WCAG 2.2 AA: area tabs are links with `aria-current`; balance values have labels read with them; toast announced politely; copy button target 44px. (PG-AFF-EARN-Q20)

### Rollout
- [ ] Behind `flags.affiliates`; when off, "Refer and earn" is removed from nav and `/refer` returns not found. Rollback is the flag; ledger unaffected. (PG-AFF-EARN-Q21)

### Monitoring and alerts
- [ ] Alert when `GET /affiliates/me/earnings` 5xx exceeds 1% over 15 minutes, or when the nightly ledger check (BE-AFF-16) reports any cent of drift between ledger and payouts. (PG-AFF-EARN-Q22)

## Build tasks

- [ ] **PG-AFF-EARN-01** Referral link and copy/share
- [ ] **PG-AFF-EARN-02** Balance cards (held, released, paid), cents-accurate
- [ ] **PG-AFF-EARN-03** Referrals list
- [ ] **PG-AFF-EARN-04** `/refer` area layout with header and area tabs (links with `aria-current`)
- [ ] **PG-AFF-EARN-05** Loaders `get-affiliate-me`, `get-earnings`, `get-referrals` and per-block Suspense
- [ ] **PG-AFF-EARN-06** Join view for adult accounts that are not enrolled, reusing `EnrolForm` (PG-MKT-AFF-02); re-render as the earnings view on success
- [ ] **PG-AFF-EARN-07** Clipboard fallback and Web Share feature detection
- [ ] **PG-AFF-EARN-08** Balance hints: next release, minimum payout, next payout run
- [ ] **PG-AFF-EARN-09** Negative balance after reversal display
- [ ] **PG-AFF-EARN-10** Referrals status filter in the URL and cursor paging
- [ ] **PG-AFF-EARN-11** Banners: missing payout details, suspended (disables link card)
- [ ] **PG-AFF-EARN-12** Under-18 state instead of the join view (decision 31)
- [ ] **PG-AFF-EARN-13** How it works disclosure with rate and hold days from API
- [ ] **PG-AFF-EARN-14** Desktop layout: link card plus payout status row, StatCard row, referrals table
- [ ] **PG-AFF-EARN-15** Earnings headline in the area layout (lifetime earned, referral count line) shown on every `/refer` page
- [ ] **PG-AFF-EARN-16** Fourth balance tile "Under review" (`pendingCents`) and the old labels and hints for all four tiles
- [ ] **PG-AFF-EARN-17** Commission history list (`commission-history.tsx`): accrual, reversal and adjustment rows, rate of source amount, hold date, bank reference, signed amounts, cursor paging
- [ ] **PG-AFF-EARN-18** Permanent redirect `/refer/earnings` to `/refer#commissions` in `next.config.ts` redirects
- [ ] **PG-AFF-EARN-19** Referral rows with statuses (signed, earning, completed, expired, flagged, blocked), "{n} of {max} payments earned" and the free-account line with the attribution end date
- [ ] **PG-AFF-EARN-20** Separate "Copy code" control and share-cancel fallback to copy
- [ ] **PG-AFF-EARN-21** Payout details banner by `reviewStatus` (not submitted with money waiting, in review, needs fixing with review notes) in the area layout
- [ ] **PG-AFF-EARN-22** How it works moved into the area layout with rate, payments, annual rule, hold days, attribution months and worked example from API terms
- [ ] **PG-AFF-EARN-23** Enrolment mode switch: auto-enrolment or application mode, driven by an API field *(deferred: decision 3b, automatic enrolment only in v1; no switch needed)*
- [ ] **PG-AFF-EARN-25** Attribution window display (decision 3c): end date line from `attributionExpiresAt`, "Window ended" status and filter option, How it works card from `attributionMonths`; unit tests for a referral one day before and one day after its end date
- [ ] **PG-AFF-EARN-24** Backend gap: raise `GET /affiliates/me/commissions` and the summary fields above in the Affiliates backend spec (doc task)

## Quality tasks

- [ ] **PG-AFF-EARN-Q01** Route files: `layout.tsx` and `page.tsx` (Server Components), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`)
- [ ] **PG-AFF-EARN-Q02** Server loaders in `src/features/affiliates/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-AFF-EARN-Q03** No mutations on this page; confirm copy and share are client-only
- [ ] **PG-AFF-EARN-Q04** Empty states (not an affiliate, no referrals, filter empty) with one clear next action
- [ ] **PG-AFF-EARN-Q05** Error state copy: what went wrong, that the balance is safe, and how to fix it
- [ ] **PG-AFF-EARN-Q06** Forbidden state for admin; suspended state
- [ ] **PG-AFF-EARN-Q07** Stage-aware wording checked (no academic wording at all on this page)
- [ ] **PG-AFF-EARN-Q08** Layout at 360px first (no horizontal scroll except the tab row, 44px tap targets, 16px gutters); table collapses to cards
- [ ] **PG-AFF-EARN-Q09** Layout at 1440px
- [ ] **PG-AFF-EARN-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AFF-EARN-Q11** Copy review: no emojis, no em or en dashes, plain and specific; claims match programme terms
- [ ] **PG-AFF-EARN-Q12** axe: zero violations in light and dark
- [ ] **PG-AFF-EARN-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AFF-EARN-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-AFF-EARN-Q15** `generateMetadata` title "Refer and earn"; nav entry active state correct for student and parent
- [ ] **PG-AFF-EARN-Q16** Security review: session-scoped reads, no ids in URLs
- [ ] **PG-AFF-EARN-Q17** PII test: referral rows and share URL carry no personal data
- [ ] **PG-AFF-EARN-Q18** Performance: Lighthouse CI mobile budget and paging
- [ ] **PG-AFF-EARN-Q19** Observability: events and Sentry tags wired; no amounts to third parties
- [ ] **PG-AFF-EARN-Q20** WCAG 2.2 AA pass
- [ ] **PG-AFF-EARN-Q21** Rollout: `flags.affiliates` gate for nav and route, rollback note
- [ ] **PG-AFF-EARN-Q22** Monitoring: earnings endpoint error alert and ledger drift alert
- [ ] **PG-AFF-EARN-Q23** Cents parity with the old app: on migrated staging data, lifetime earned, the four tiles and carried balance match the 43f9faa `GET api/affiliates/me` figures for a sample of 20 affiliates
- [ ] **PG-AFF-EARN-Q24** Redirect test for `/refer/earnings` and anchor scroll to `#commissions` with focus on its heading

## Tests

### Unit (Vitest)
- `balance-cards.test.tsx`: renders cents exactly (1, 99, 100, 123450, negative); hints by state.
- `referral-link-card.test.tsx`: copy success, clipboard denied fallback, share hidden without `navigator.share`.
- `referrals-table.test.tsx`: no PII columns; status labels; filter param.

### Playwright (`web/tests/e2e/affiliates/earnings.spec.ts`)
- affiliate sees balances to the cent
- copy link puts share url on clipboard
- adult non affiliate gets a link in one step
- under 18 account sees the age message
- missing payout details banner links to get paid
- refund reversal shows negative ready to pay
- suspended account disables link
- referrals filter by earning
- headline and how it works render on every refer route
- under review tile excluded from lifetime earned
- commission history shows accrual and reversal
- needs-fixing payout details banner shows review notes
- annual referral reads one of one payments
- old earnings route redirects to commissions anchor
- expired referral shows window ended and keeps its amount
- axe clean light and dark at 360 and 1440

### Unit additions
- `affiliate-labels.test.ts`: every referral, commission and onboarding status has a label; unknown status falls back to a neutral label.
- `commission-history.test.tsx`: signed amounts, minus aria label, rate per row, hold date only when held.

## Open questions

- Decided (3): affiliates are in v1.
- Decided (E): affiliate is a profile on a student or parent account, not a role.
- Decided (3c): R100.00 minimum payout, 30-day hold and 40% rate, served by `GET /affiliates/terms`.
- Decided (31): under-18 students may not be affiliates, even with parental consent.
- Payout run schedule (monthly on a fixed date?) to show "Next payout run".
- Decided (3b): automatic enrolment; the profile is created when an adult accepts the terms. PG-AFF-EARN-23 is deferred.
- Decided (3c): the old values carry over, with attribution capped at 12 months from first touch instead of lifetime.
- `GET /affiliates/me/commissions` (the ledger) is specified in `../../backend/affiliates.md`.
