# Affiliates

| | |
|---|---|
| ID | `PG-MKT-AFF` |
| Route | `/affiliates`, `/affiliates/join` |
| Phase | 6 |
| Roles | public landing; enrolment for any signed-in student or parent aged 18 or older (decision 31) |
| Stages | not stage-specific |
| Entitlement | free |
| Depends on | BE-AFF-02 (enrol), BE-AFF-04, BE-AFF-05, BE-AFF-31 (terms), BE-AFF-80 (attribution cap), BE-IDN-28 (`/me`), FE-24, FE-25, FE-27 (`proxy.ts`), SHL-01, UI-03, PG-AUTH-REG (carries `next`), PG-MKT-LEGAL-03 |
| Old app reference | `43f9faa:web/src/app/(marketing)/affiliates/page.tsx` (landing: hero, three steps, six plain-language terms, who it is for, getting paid, FAQ, closing CTA), `43f9faa:web/src/app/(marketing)/affiliates/join/page.tsx` (affiliate-only sign-up form), `43f9faa:web/marketing/affiliate-parallel.md` (programme facts, link format, UTM scheme), old affiliate domain rules in `Modules/Affiliates` (see REBUILD_PLAN section 1). Not carried over: the "Tutors and parents" audience card (tutors are out of v1), "Students" as an earning audience without an age rule, the gradient hero, MUI. |
| Status | Not started in the rebuild: 38 tasks, 1 deferred (PG-MKT-AFF-21, affiliate-only sign-up). No routes, no Affiliates module in the rebuilt API. (The old app at 43f9faa had both public pages live; they are the behaviour reference above.) |
| Decisions | 3 (affiliates in v1), 3b (automatic enrolment, no application; payout-details review is the only gate), 3c (old terms, attribution capped at 12 months from first touch), 31 (18 or older only). |

## Purpose

Explain plainly how the referral programme works, what it pays and when, and let an adult with an Aptiverse account get their link in one step (no application, decision 3b). Capture a referral code from shared links so a later sign-up can be attributed, without tracking anyone across sites.

## User stories

- As a parent who likes Aptiverse, I want to understand how referrals pay and what the rules are before I join.
- As an adult account holder, I want my link straight away, without an application or a wait.
- As someone who clicked a friend's link, I want the friend credited if I sign up, without being tracked elsewhere.
- As the business, I want attribution only for real sign-ups, with fraud checks in the API.

## Layout

### Mobile (360px)

`/affiliates`
1. Public header (SHL-01).
2. `h1` "Refer Aptiverse and earn", subhead.
3. "How it works": three steps in a list (Get your link, Share it, Earn when someone pays). Real sequence, so numbers are fine.
4. "What one referral looks like" card (ported): the states an entry moves through, with no rand amounts: "They pay for a plan" / "You earn {commissionPercent}%"; "Held for {holdDays} days" / "Refund window"; "Becomes payable" / "Paid by EFT". Caption: "Repeats for their first {commissionablePayments} payments. Amounts depend on the plan they choose."
5. "What you earn": commission terms block rendered from config (rate, number of commissionable payments, hold period, attribution window, minimum payout, payout schedule) as plain-language rules (see Copy). Hidden if config is missing.
6. "The rules": short list (no self-referrals, no paid ads on our brand name, no spam, holds and reversals on refunds).
7. "Who it is for": parents, university and college students aged 18 or older, and any adult who reaches South African students.
8. "Getting paid": what payout needs (full legal name as on the bank account, ID or passport number and tax reference, bank, account number and branch code), and that sharing can start before these are added; earnings keep accruing and wait for the details.
9. Primary CTA "Get your link" (full width) with a secondary "I already have an account" link to `/login?next=/affiliates/join`.
10. FAQ accordion (8 questions, see Copy).
11. Closing band: "Your link lives in your account" and the CTA again.
12. Footer.

`/affiliates/join`
1. Header.
2. `h1` "Get your referral link".
3. Signed in, adult, not yet an affiliate: the terms summary (rate, payments counted, hold, 12-month window, minimum payout) from `getAffiliateTerms()`, a link to the full affiliate terms, one checkbox "I agree to the affiliate terms", and the button "Get my link". No other fields.
4. Signed out: short explainer and two buttons "Create an account" and "Log in", both carrying `next=/affiliates/join`.
5. Already an affiliate: server redirect to `/refer`. Suspended or closed: status card instead of the form.

### Desktop (1440px)

- Landing: hero text left with the "What one referral looks like" card right; "How it works" steps in a 3-column row below the hero; terms and rules side by side in two cards; "Who it is for" as three columns; "Getting paid" two columns (requirements left, "you can see all of it" ledger note right); FAQ two-column (heading left, accordion right). 1120px container.
- Join: single 560px column centred, status card same width.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Landing page | `web/src/app/(marketing)/affiliates/page.tsx` | server | Static; terms from config |
| Join page | `web/src/app/(marketing)/affiliates/join/page.tsx` | server | Dynamic (reads session) inside `<Suspense>`; `robots: noindex` |
| Join loading, error | `web/src/app/(marketing)/affiliates/join/loading.tsx`, `error.tsx` | server, client | Skeleton; retry |
| OG image | `web/src/app/(marketing)/affiliates/opengraph-image.tsx` | server | Text only, no earnings figures |
| HowItWorks | `web/src/features/affiliates/components/how-it-works.tsx` | server | |
| CommissionTerms | `web/src/features/affiliates/components/commission-terms.tsx` | server | Renders from `getAffiliateTerms()`; returns null when unset |
| AffiliateRules | `web/src/features/affiliates/components/affiliate-rules.tsx` | server | |
| AffiliateFaq | `web/src/features/affiliates/components/affiliate-faq.tsx` | server, accordion leaf client | |
| EnrolForm | `web/src/features/affiliates/components/enrol-form.tsx` | client | Terms checkbox and "Get my link"; server action calling `POST /affiliates/me/enrol` |
| AffiliateStatusCard | `web/src/features/affiliates/components/affiliate-status-card.tsx` | server | suspended, closed |
| getAffiliateTerms | `web/src/features/affiliates/server/get-affiliate-terms.ts` | server only | `GET /affiliates/terms` (BE-AFF-31); tag `affiliates:terms` |
| getMyAffiliate | `web/src/features/affiliates/server/get-my-affiliate.ts` | server only | `GET /affiliates/me/code` (BE-AFF-04); `404` means not enrolled; session token, no cache (per user) |
| Referral capture | `web/src/proxy.ts` (extend matcher to marketing paths with `ref`) or `web/src/app/r/[code]/route.ts` | server | Sets `apt_ref` cookie; see Interactions |
| Attribution claim | `web/src/features/affiliates/server/claim-attribution.ts` | server only | Called once from the `(app)` layout when `apt_ref` exists |
| Form fields, Button, Card, Accordion | `web/src/components/common/form-fields.tsx`, `web/src/components/ui/*` | mixed | |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/affiliates/terms` (BE-AFF-31) | GET | `commissionRatePercent`, `commissionableMonthlyPayments`, `commissionableAnnualPayments`, `holdDays`, `attributionMonths`, `minimumPayoutCents`, `version` | `affiliates:terms` |
| `/affiliates/me/code` (BE-AFF-04) | GET | `code`, `status`; `404` when not enrolled | none (per user) |
| `/me` (BE-IDN-28) | GET | `roles`, `isAdult` (derived from date of birth, decision 30) | per session |

Mutations

| Endpoint (BE ID) | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/affiliates/me/enrol` (BE-AFF-02) via a server action | POST | `acceptedTermsVersion` | `201` new profile, `200` already enrolled (both then redirect to `/refer`); `403` under 18 or suspended; `409` missing date of birth or outdated terms | Idempotent by user; the button disables while pending |
| `/affiliates/attribution/claim` (BE-AFF-05) | POST | `code` (from `apt_ref`) | `204` claimed, `409` already attributed, `422` invalid or self-referral | Server-to-server from the `(app)` layout, then the cookie is deleted whatever the result |

## States

| State | When | Exact copy |
|---|---|---|
| Landing populated | Always | Sections as above |
| Terms unavailable | Terms endpoint down | Terms block hidden; line "Commission details are shown in your account once you join." Join button disabled with "We cannot load the terms right now. Try again in a moment." |
| Join signed out | No session | "You need an Aptiverse account to get a link. It takes a minute." Buttons "Create an account", "Log in" |
| Join form | Signed in, adult, `GET /affiliates/me/code` is `404` | Terms summary, checkbox, "Get my link" |
| Submitting | Request in flight | Button "Getting your link...", disabled |
| Enrolled | `201` or `200`, or already an affiliate on load | Redirect to `/refer`, which shows the link and a prompt to add payout details |
| Suspended or closed | status `suspended` or `closed` | Title "Your affiliate account is paused", body "Contact us to find out more." Link "Contact us" |
| Under 18 | `/me` says not adult, or `403 affiliates.must_be_adult` | Title "Affiliates must be 18 or older", body "You can still share Aptiverse with friends, but we cannot pay referral commission to anyone under 18." |
| Date of birth missing | `409 affiliates.date_of_birth_required` | "Add your date of birth in Settings first, so we can confirm you are 18 or older." Link "Go to Settings" |
| Terms changed | `409 affiliates.terms_outdated` | "The affiliate terms were just updated. Read them again, then tick the box." The summary reloads |
| Terms not ticked | Client check | "Tick the box to agree to the affiliate terms." |
| Error | `5xx` or network | "We could not set up your link. Try again in a moment." |
| Rate limited | `429` | "Too many attempts. Please wait a few minutes and try again." |
| Forbidden, upgrade, no evidence | Not applicable | |

## Stage variants

None. Copy speaks to adults (parents and university students aged 18 or older). High school learners under 18 see the under-18 state on the join page.

## Interactions and edge cases

- Referral capture: any public URL with `?ref=<code>` (and the short link `/r/<code>`) sets cookie `apt_ref` = code; `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age` 30 days, first party only. Code must match `^[A-Z0-9]{6,12}$` (uppercased) or it is ignored. The `ref` param is then removed with a redirect to the clean URL so it does not linger in history, analytics or shared links. First valid code wins; a later code does not overwrite an unexpired cookie (first touch, decision 3c). The click time travels in the signed cookie so the API can start the 12-month window from it (BE-AFF-80).
- The code is never logged by web (proxy logs path without query) and never sent to analytics.
- Claim: on the first authenticated render of the `(app)` layout, if `apt_ref` exists, the server calls BE-AFF-05 once and deletes the cookie regardless of outcome. Self-referral and fraud checks happen in the API.
- Join requires sign-in because the affiliate profile is tied to the account that will be paid, and identity verification and payout details (BE-AFF-12) attach to that account. Signed-out visitors go to `/register?next=/affiliates/join` or `/login?next=/affiliates/join`; `next` is validated as a same-origin relative path by the auth pages.
- Enrolling adds no role (affiliate is a profile, DECISIONS.md section E); the "Refer and earn" nav item shows from the affiliate flag on `/me` (BE-AFF-78). There is no review of the person: the payout-details review in `/refer` is the only gate before money moves (decision 3b).
- Double submit: pending guard; the API is idempotent per user, so a second press returns `200` and the same link.
- No rand amounts on these pages at all (old rule, kept): commission is stated as a share and a count of payments, never as a rand figure or worked example, because plan prices change and an amount reads as a forecast of earnings. The rand figures in `affiliate-parallel.md` recruiting copy stay out of the site.
- Terms copy describes the rules the ledger really runs (BE-AFF-07 to BE-AFF-09), not a summary: commission is on payments actually received, not list price; the commissionable payments count from the referred person's first paid one; a refunded payment frees its place; an annual payment counts as one commissionable payment; the attribution lasts 12 months from the day the person first clicked the link, so an upgrade inside that window still counts and a payment after it does not; one referrer per person, first wins, a later link cannot take a referral; corrections are new ledger entries, never edits; no cap on the number of referrals; a refunded payment's commission is reversed and, if already paid, carried against the next payout rather than invoiced back; self-referral is checked at sign-up and again at payment time. Every number comes from `getAffiliateTerms()`.
- Pre-sign-up cookie versus attribution: two windows, both stated plainly. The `apt_ref` cookie (30 days) is the time between clicking a link and signing up. The attribution (12 months from that click, decision 3c) is how long payments from that person can earn commission. Copy never says "your link expires": the link itself works for as long as the affiliate is active.
- UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) on `/affiliates` links from the recruiting scheme are not stored by this page; campaign attribution is a consent-gated analytics concern (FE-63, PG-MKT-LEGAL), and the `ref` cookie never carries UTM data.
- Public header gets an "Earn" link to `/affiliates` (old top nav item), shown only when the `affiliates` switch is on.
- Affiliate-only accounts: the old `/affiliates/join` created an account holding only the affiliate role (no student or parent role, no onboarding, no plan step), skipped auto sign-in, sent the person to `/verify-email`, and landed them on `/refer` after verifying. The rebuild's self-signup allowlist is student and parent only (`Roles.SelfRegistrable`, decision 2) and affiliate is a profile, not a role (section E), so this spec keeps "sign in or create a student or parent account first". Affiliate-only sign-up (PG-MKT-AFF-21) is deferred.

## Copy

- `h1` landing: "Refer Aptiverse and earn"
- Subhead: "Share Aptiverse with families and students you know. When someone you refer pays for a plan, you earn a commission."
- Steps: "Get your link: agree to the terms and your personal link is ready straight away." "Share it: with families and students you know." "Earn when someone pays: commission is held for {holdDays} days, then paid out on a schedule."
- Terms block heading: "What you earn"; lines: "{commissionPercent}% of each payment from people you refer", "For their first {monthlyPayments} monthly payments, or their first annual payment", "Counts for {attributionMonths} months from the day they first click your link", "Held for {holdDays} days in case of refunds", "Paid out once your balance reaches {minimumPayout}", "Payouts {payoutSchedule}". Values from config; money via `formatZar`.
- Rules heading: "The rules"; items: "You cannot refer yourself or your own household's accounts." "Do not run paid ads on the Aptiverse name." "No spam or misleading claims about Aptiverse." "If a referred payment is refunded, its commission is reversed."
- CTA: "Get your link"
- Join `h1`: "Get your referral link"
- Label: "I agree to the affiliate terms" (with a separate "Read the affiliate terms" link)
- Submit: "Get my link"
- FAQ: "Who can join?" "Anyone 18 or older with an Aptiverse account. There is no application." / "How long does a referral count?" "For {attributionMonths} months from the day they first click your link. Payments they make in that time, up to their first {monthlyPayments} monthly payments or their first annual payment, earn commission." / "Do I need to be a paying customer?" "No. A free account is enough. You never need to buy anything to earn." / "When do I get paid?" "Each amount becomes payable {holdDays} days after the payment it came from cleared. Payouts then run in batches, so the first one can take a little longer than the ones after it." / "How do I get paid?" "By EFT into a South African bank account in your own name. You add your banking and tax details once, and each payout carries a reference you can match on your statement." / "Why do you need my ID and tax number?" "Because commission is income, and SARS treats it as such. We keep the records a payer must keep. Your details are stored against your payout record and used for nothing else." / "Do I pay tax on commission?" "Commission is income. You get a yearly statement from your account to help with your tax return." / "Can I refer myself or my own child?" "No. Using your own link on a second account, or referrals within your own household, do not earn commission, and we check again at payment time." / "What if someone I referred gets a refund?" "The commission on that payment is reversed. If it was already paid to you, the amount is taken off your next payout rather than billed back to you." / "What if they pay annually?" "An annual payment counts as one commissionable payment, and you earn {commissionPercent}% of it." / "Is there a limit?" "There is no limit on how many people you can refer."
- "Getting paid" list: "Your full legal name, as it appears on your bank account", "Your ID or passport number, and your tax reference", "Bank, account number and branch code"; then "You can start sharing your link before you add these. Earnings keep adding up and wait for your details before they are paid."
- Closing band: heading "Your link lives in your account", body "Once you join, your link and everything you have earned are under Refer and earn."
- Never: "passive income", earnings promises, rand amounts or worked examples, "unlimited earnings", partner or influencer counts, "lifetime" or "forever" about referrals (attribution ends after {attributionMonths} months).

## Acceptance criteria

1. Given I open `/?ref=ABC123`, then an `apt_ref` cookie with value `ABC123` is set (httpOnly, SameSite Lax, 30 days) and I am redirected to `/` without the query.
2. Given `?ref=bad code!`, then no cookie is set.
3. Given `apt_ref` exists and I sign up, when the `(app)` layout first renders, then the server calls the claim endpoint once and the cookie is deleted.
4. Given I am signed out, when I open `/affiliates/join`, then I see "Create an account" and "Log in" links carrying `next=/affiliates/join`.
5. Given I am a signed-in adult who is not an affiliate, when I tick the terms box and press "Get my link", then I land on `/refer` with my link, and pressing the button twice creates one affiliate profile.
6. Given I am already an affiliate, when I open `/affiliates/join`, then I am redirected to `/refer`; given my profile is suspended, I see the paused card.
7. Given `/me` says I am under 18, then the join page shows the under-18 state and no form.
8. Given terms config is missing, then the landing page shows no numbers in the terms block.
9. Given terms config with a 30-day hold, when the landing renders, then the referral card and FAQ say 30 days and no text on the page matches an `R` followed by digits.
10. Given I click "I already have an account", then I land on `/login?next=/affiliates/join` and after logging in I reach the join page.
11. Given terms with `attributionMonths` 12, when the landing renders, then the terms block and FAQ say 12 months and no text on the page says "lifetime" or "forever".

## Production readiness

- Security
  - Enrol and claim are enforced in the API: authenticated user, adult check, one profile per user, self-referral and household fingerprint checks (BE-AFF-06). The web only reflects status.
  - Enrol is a server action (same-origin POST, Origin check). Claim is server-to-server with the session token, never from the browser.
  - `apt_ref` is httpOnly so scripts cannot read or forge it from the page; the code is validated by pattern and again by the API.
  - No referral code, email or name in logs or analytics; `ref` stripped from URLs by redirect.
  - Join page `noindex` and `Cache-Control: private`; status is never cached across users.
- Performance
  - Landing is static (terms cached with `affiliates:terms`, `cacheLife("hours")`); LCP is the `h1`, under 2.5s on mobile; route JS under 150 KB gzip, client code only the FAQ accordion.
  - Join page streams the status after the static shell.
  - The `ref` redirect adds one hop only when `ref` is present.
- Resilience
  - Terms endpoint down: landing still renders with the terms block hidden.
  - Status endpoint down on join: error boundary with retry; form not shown when status is unknown (enrol is idempotent anyway, so a retry is safe).
  - Claim failure never blocks the app render; it is fire-and-forget with one retry, then the cookie is dropped and the failure reported.
- Observability
  - Sentry tags `route:/affiliates`, `route:/affiliates/join`; claim failures captured with the API error code, without the referral code.
  - Analytics (consent-gated `track()`): `affiliates_viewed`, `affiliates_join_clicked`, `affiliates_enrolled`, `affiliates_enrol_failed` {status}. Referral capture and claim are not analytics events (server-side counts live in the API).
  - BFF and server calls carry `traceparent`.
- Accessibility (WCAG 2.2 AA)
  - Steps as an ordered list; form labels visible; terms checkbox with a link to the terms that does not toggle the checkbox; errors announced; focus to the status card heading after submit.
- Privacy and POPIA
  - Cookie is first party, purpose-limited (attribution), 30-day expiry, disclosed in the privacy policy's cookie section. It is essential to the referral feature, but if counsel decides it needs consent, set it only after consent (open question).
  - Under-18s cannot enrol (decision 31); the referral cookie still credits an adult's link when a minor signs up, which the privacy policy must explain.
  - Enrolment collects nothing beyond terms acceptance; payout details are collected later in the `/refer` area, encrypted (BE-AFF-12).
- SEO
  - `/affiliates` indexable, canonical, sitemap entry, OG image. `/affiliates/join` `noindex, nofollow`, not in the sitemap. Any `?ref=` URL redirects to its canonical.
- Rollout
  - `affiliates` switch in `lib/flags.ts` (decision 3: on for v1 once Phase 6 passes; off is the kill switch). Off: both routes `notFound()`, footer link hidden, `ref` capture disabled.
  - Staging first with test codes; prod after BE-AFF-02 to BE-AFF-09 pass.
  - Rollback: switch off (cookies already set expire naturally) or Vercel instant rollback (HRD-03).
- Monitoring
  - Grafana panels (OBS-02) for `POST /affiliates/me/enrol` and `POST /affiliates/attribution/claim`: rate, 4xx by code, 5xx.
  - Alert when claim 5xx exceeds 5 percent over 30 minutes, or when claims drop to zero for 24 hours while sign-ups continue (possible capture breakage).
  - Sentry alert on new issues for the two routes.

## Build tasks

- [ ] **PG-MKT-AFF-01** Landing: how it works, commission terms from config, rules
- [ ] **PG-MKT-AFF-02** Enrol form (terms summary, one checkbox, "Get my link") calling `POST /affiliates/me/enrol` from a server action, then redirecting to `/refer` (decision 3b)
- [ ] **PG-MKT-AFF-03** Referral link capture (`?ref=`) into the `apt_ref` cookie for later claim
- [ ] **PG-MKT-AFF-04** `getAffiliateTerms()` loader with tag `affiliates:terms` and hidden-block fallback
- [ ] **PG-MKT-AFF-05** Join page session branch: signed-out links with `next=/affiliates/join`
- [ ] **PG-MKT-AFF-06** `getMyAffiliate()` loader; existing affiliates redirected to `/refer`; `AffiliateStatusCard` for suspended and closed
- [ ] **PG-MKT-AFF-07** Under-18 state from `/me`
- [ ] **PG-MKT-AFF-08** Enrol pending guard and handling of `403` (under 18, suspended), `409` (date of birth missing, terms outdated), `429` and network errors
- [ ] **PG-MKT-AFF-09** `ref` validation, first-valid-code rule and clean-URL redirect; `/r/[code]` short link route
- [ ] **PG-MKT-AFF-10** Attribution claim from the `(app)` layout: one call, cookie deleted, failure reported
- [ ] **PG-MKT-AFF-11** Affiliate FAQ block
- [ ] **PG-MKT-AFF-12** Metadata, OG image, canonical and sitemap for `/affiliates`; `noindex` on `/affiliates/join`
- [ ] **PG-MKT-AFF-13** Analytics events (`affiliates_viewed`, `affiliates_join_clicked`, `affiliates_enrolled`, `affiliates_enrol_failed`)
- [ ] **PG-MKT-AFF-14** `affiliates` switch in `lib/flags.ts` covering routes, footer link and `ref` capture
- [ ] **PG-MKT-AFF-15** "What one referral looks like" card from config (states only, no rand amounts)
- [ ] **PG-MKT-AFF-16** Plain-language terms block ported from the old page (received payments, first N payments, refund frees a place, annual counts once, attribution for 12 months from first click, first referrer wins, append-only, no cap on referrals), every number from `getAffiliateTerms()`
- [ ] **PG-MKT-AFF-17** "Who it is for" block (parents, students 18 or older, adults with reach); no tutor card
- [ ] **PG-MKT-AFF-18** "Getting paid" block with the payout requirements list and the share-now, add-details-later note
- [ ] **PG-MKT-AFF-19** "I already have an account" link to `/login?next=/affiliates/join` and the closing CTA band
- [ ] **PG-MKT-AFF-20** Expanded FAQ (paying customer, how and when paid, ID and tax number, self and household referral, refunds, annual, limit)
- [ ] **PG-MKT-AFF-21** Affiliate-only sign-up variant: an affiliate-role account form (no onboarding, no plan step, no auto sign-in, verify email first, home `/refer`); needs `affiliate` added to `Roles.SelfRegistrable` and a BE-IDN-20 change *(deferred: decisions 2 and 3b, affiliate is a profile on a student or parent account in v1)*
- [ ] **PG-MKT-AFF-22** "Earn" link to `/affiliates` in the public header behind the `affiliates` switch
- [ ] **PG-MKT-AFF-23** Attribution window copy (decision 3c): terms line, "How long does a referral count?" FAQ and the two-windows note, all from `attributionMonths`; unit test that `CommissionTerms` renders the months from config and a page test that "lifetime" and "forever" never appear

## Quality tasks

- [ ] **PG-MKT-AFF-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-AFF-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-AFF-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-AFF-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-AFF-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-AFF-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against the claims ledger
- [ ] **PG-MKT-AFF-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-AFF-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-AFF-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-AFF-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-AFF-Q11** Cookie attributes verified in E2E (httpOnly, Secure, SameSite Lax, 30 days) and the code absent from logs
- [ ] **PG-MKT-AFF-Q12** Commission terms copy confirmed by the business and matched to the affiliate terms document
- [ ] **PG-MKT-AFF-Q13** Grafana panels and claim alerts exist and fire in staging
- [ ] **PG-MKT-AFF-Q14** No-amount check: a test fails if `/affiliates` or `/affiliates/join` renders an `R` followed by digits
- [ ] **PG-MKT-AFF-Q15** Terms parity: every rule in the terms block and FAQ matches the implemented ledger behaviour (BE-AFF-07 to BE-AFF-09, BE-AFF-16 tests) before launch

## Tests

Unit (Vitest)
- `parseRefCode accepts six to twelve letters and digits and uppercases`
- `parseRefCode rejects other input`
- `ref capture does not overwrite an unexpired cookie`
- `CommissionTerms renders nothing when terms are missing`
- `EnrolForm disables while pending and shows the date of birth message on 409`
- `claimAttribution deletes the cookie on success and on failure`
- `CommissionTerms renders shares and counts from config and never a rand amount`
- `CommissionTerms renders the attribution window from attributionMonths`

Playwright (`web/e2e/affiliates.spec.ts`, Pixel 7, iPhone 14, desktop Chrome; mock API)
- `ref link sets the cookie and cleans the URL`
- `invalid ref sets no cookie`
- `signed out join shows account links with next`
- `signed in adult gets a link in one step and lands on refer`
- `existing affiliate is redirected from join to refer`
- `under 18 user sees the age message`
- `join page is noindex`
- `landing fits 360px and has no accessibility violations in light and dark`
- `landing shows no rand amounts`
- `already have an account link carries next to the join page`

## Open questions

1. Decided (3): affiliates are in v1.
2. Decided (3c): the old values (40%, first 3 monthly or 1 annual payment, 30-day hold, R100.00 minimum) served by `GET /affiliates/terms` (BE-AFF-31). Still open: the payout schedule wording ("monthly" or "in batches"), which follows the first real payout runs.
3. Decided (3c): first touch, first valid code within 30 days of sign-up, attribution for 12 months from the click.
4. Decided (30): Identity captures date of birth, and `/me` exposes `isAdult`.
5. Does the referral cookie need consent under POPIA and the cookie notice, or is it covered as part of the requested service?
6. `proxy.ts` currently matches only `(app)` paths; capturing `ref` on every public path means widening its matcher, or using only `/r/<code>` short links. Recommend short links plus `?ref=` on `/`, `/pricing` and `/affiliates` only.
7. Decided (3b): automatic enrolment as in the old live programme; no application, approve or reject. Payout-details review is the only gate.
8. Decided (3c): old rules kept with attribution capped at 12 months instead of lifetime; existing referrals keep their original date (BE-AFF-84).
9. Decided (31): affiliates must be 18 or older. Under-18 affiliates from the old app at cutover are a migration question (MIG-17).
10. Decided (3c): the pre-sign-up cookie stays 30 days.
