# Get paid

| | |
|---|---|
| ID | `PG-AFF-DETAILS` |
| Route | `/refer/payout-details` (old route `/refer/get-paid` redirects here, PG-AFF-DETAILS-19) |
| Phase | 6 |
| Roles | student, parent with an affiliate profile (automatic enrolment, decision 3b) |
| Stages | any (no academic content) |
| Entitlement | free; affiliate profile required (BE-AFF-02). This page is the only enrolment gate: payouts wait until an admin confirms these details (decision 3b) |
| Depends on | BE-AFF-12, BE-IDN-38 (verified email for sensitive actions), BE-IDN-35 or step-up re-auth (proposed), FE-25, FE-63, UI-03 (form fields), PG-AFF-EARN-04 (area layout) |
| Old app reference | `43f9faa:web/src/app/(app)/refer/get-paid/page.tsx`, `43f9faa:web/src/app/(app)/refer/PayoutDetailsForm.tsx`, `43f9faa:web/src/app/(app)/refer/_shared.tsx` (`OnboardingAlerts`), `43f9faa:api/Controllers/AffiliatesController.cs` (`PUT me/payout-details`), `43f9faa:api/Modules/Affiliates/Aptiverse.Affiliates.Domain/Models/Affiliate.cs` (`PayoutOnboardingStatus`), `43f9faa:api/Modules/Affiliates/Aptiverse.Affiliates.Domain/Models/AffiliatePayout.cs` (bank snapshot) |
| Status | Not started (0 of 49 tasks) |

## Purpose

Where an affiliate saves the South African bank account we pay into. Details are encrypted at rest by the API. Once saved they are only ever shown masked (bank name, account type, last four digits of the account number, holder name initial and surname). Changing them means entering every field again; the form is never prefilled with stored values, so a stolen session cannot read the account number.

The old app (43f9faa, `/refer/get-paid`) collected more than bank details, because a payout is money leaving the business to a named person and the record must stand up years later. This page keeps that scope:
- Who you are: legal first name, legal surname, identity document (South African ID or passport), ID or passport number, tax reference number (optional).
- Where you live: street address, suburb or complex (optional), city or town, province (the 9 provinces), postal code, country (South Africa).
- Where the money goes: bank, account holder name, account number, branch code, account type (cheque, savings, transmission).
- How to reach you about a payment: email and mobile (both optional).
- A review step: `reviewStatus` moves from `not_submitted` to `in_review` on save; an admin confirms (`confirmed`) or sends them back with notes (`needs_fixing`); resubmitting goes back to `in_review`. Earnings keep accruing in every state; only affiliates with `confirmed` details are included in payout runs.
- Details are asked for when there is money to claim, never at sign-up.
- Each payout snapshots the bank details at generation, so a later change never rewrites where an earlier payout went.

The old app stored these fields as plain columns; the rebuild encrypts them (BE-AFF-12) and masks them on read.

## User stories

- As an affiliate, I want to add my bank details once, so that my earnings are paid automatically.
- As an affiliate, I want to see which account I will be paid into without the full number on screen, so that I can check it safely.
- As an affiliate, I want to change my account and be told when it takes effect, so that a payout does not go to my old account.
- As an affiliate, I want to be warned by email when my details change, so that I notice if someone else did it.
- As an affiliate, I want to know whether my details are in review, confirmed or need fixing, and what was wrong, so that my money is not stuck.
- As an affiliate without a SARS tax reference yet, I want to leave it blank and still be paid.

## Layout

### Mobile (360px)

1. Area header and tabs ("Get paid" current).
2. Explainer card: "We pay into South African bank accounts only. Your details are encrypted and only shown masked."
3. Review status card (when details exist): "In review", "Confirmed" or "Needs fixing" with the review notes quoted (copy in States).
3a. When saved: masked identity lines ("Legal name T. Mokoena", "SA ID ending 089", "Pretoria, Gauteng", "Tax reference provided" or "No tax reference") above the saved account card: bank name, account type, "Account ending 1234", "Account holder T. Mokoena", "Saved on 12 Oct 2026", button "Change bank details". If a change is pending verification or within the cooling period, a line "New details take effect from the next payout run after 26 Oct 2026."
4. When not saved, or after "Change bank details": form, one field per row:
   - Section "Who you are": Legal first name, Legal surname, Identity document (`Select`: South African ID, Passport), ID number or Passport number (label follows the select), Tax reference number (optional, hint "Leave it blank if you do not have one yet.")
   - Section "Where you live": Street address, Suburb or complex (optional), City or town, Province (`Select` of the 9 provinces), Postal code (4 digits); country shown read-only as "South Africa"
   - Section "Where the money goes":
   - Account holder name (`autocomplete="name"`)
   - Bank (`Select` of South African banks from API, with universal branch code filled automatically; "Other bank" reveals a branch code field)
   - Account type (`Select`: Cheque or current, Savings, Transmission)
   - Account number (`inputmode="numeric"`, `autocomplete="off"`, digits only, 6 to 16 digits)
   - Confirm account number (must match; paste allowed per WCAG 3.3.8 and 3.3.7 is satisfied because this is a security re-entry)
   - Section "How to reach you about a payment": Email (optional, hint shows the account email), Mobile (optional, South African format)
   - Confirm with your password (step-up, `autocomplete="current-password"`)
   - Checkbox "This account is in my name."
   - Buttons "Save bank details" (primary, full width) and "Cancel" (when changing).
5. Help line: "Your tax statements are on the Tax tab."

### Desktop (1440px)

Area layout; two columns `lg:grid-cols-[1fr_320px]`: form or saved card on the left, explainer and "What happens next" steps on the right. Form fields stay single column at max 480px wide for readability.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/refer/payout-details/page.tsx` | server | Reads masked details |
| Loading, error | `web/src/app/(app)/refer/payout-details/{loading,error}.tsx` | server / client | Skeleton card; `PageState` with retry |
| Saved account card | `web/src/features/affiliates/components/saved-account-card.tsx` | server | Masked fields only |
| Bank details form | `web/src/features/affiliates/components/bank-details-form.tsx` | client | `useZodForm` with the generated request schema plus a local refinement for the confirm field; never receives stored values |
| Bank select | `web/src/features/affiliates/components/bank-select.tsx` | client | Options from API, universal branch codes |
| Loader | `web/src/features/affiliates/server/get-payout-details.ts` | server | Per user, React `cache()`, returns masked shape only |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/affiliates/me/payout-details` (BE-AFF-12, read side proposed) | GET | `hasDetails`, `reviewStatus` (not_submitted, in_review, confirmed, needs_fixing), `reviewNotes`, `submittedAt`, `legalNameDisplay`, `idType` (sa_id, passport), `idLast3`, `taxReferenceProvided`, `city`, `province`, `bankName`, `accountType`, `accountLast4`, `holderDisplay` (initial and surname), `savedAt`, `effectiveFrom`, `status` (active, pending_effective) | per user, never cached shared |
| `/affiliates/banks` (proposed) | GET | `items[]` (`code`, `name`, `universalBranchCode` or null) | `"use cache"`, tag `affiliates:banks`, 1 day |

### Mutations

| Endpoint (BE ID) | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/affiliates/me/payout-details` (BE-AFF-12) via `/api/bff` | PUT | `legalFirstName`, `legalLastName`, `idType`, `idNumber`, `taxReferenceNumber` (optional), `addressLine1`, `addressLine2` (optional), `city`, `province`, `postalCode`, `country` (`ZA`), `holderName`, `bankCode`, `branchCode`, `accountType`, `accountNumber`, `contactEmail` (optional), `contactPhone` (optional), `currentPassword`, `confirmOwnAccount` (true), `idempotencyKey` | masked shape as in GET | API encrypts before storage, re-auths the password, writes a security event, emails the account owner, and sets `effectiveFrom` (open question on cooling period). Errors: `400` validation, `401 reauth_failed`, `403 email_unverified`, `423 affiliate_suspended`, `429` |

The response never echoes the account number, ID number or tax reference. Every save sets `reviewStatus` to `in_review` (old behaviour; see PG-AFF-DETAILS-20 for changes to confirmed details). The form state is cleared on success and on unmount.

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Streaming | Skeleton card | none |
| Not saved | `hasDetails = false` | Title "Add your bank details". Body "Add a South African bank account so we can pay your earnings." Form shown | "Save bank details" |
| Saved | `hasDetails = true` | Saved account card | "Change bank details" |
| In review | `reviewStatus = in_review` | "Your payout details are with us for review. Earnings keep adding up in the meantime." | none |
| Confirmed | `confirmed` | "Your payout details are confirmed. Anything that clears its hold goes out in the next payout run." | "Change payout details" |
| Needs fixing | `needs_fixing` | "We could not verify your payout details. {reviewNotes} Please correct them. Nothing you have earned is lost." | "Correct payout details" (empty form) |
| Identity and address validation | Field errors | "Enter your legal first name.", "Enter your legal surname.", "Enter a 13 digit South African ID number.", "This ID number is not valid. Check the digits.", "Enter your passport number.", "A tax reference number has 10 digits.", "Enter your street address.", "Enter your city or town.", "Choose your province.", "Enter a 4 digit postal code.", "Enter a valid mobile number, for example 082 123 4567." | Focus first invalid field |
| Pending effective | `status = pending_effective` | "New details take effect from the next payout run after 26 Oct 2026. Until then we pay into the account ending 5678." | none |
| Saving | Mutation pending | Button "Saving" disabled; form `aria-busy` | none |
| Saved success | 200 | Toast "Bank details saved. We have emailed you to confirm the change." Saved card replaces the form | none |
| Validation | Field errors | "Enter the account holder's name.", "Choose your bank.", "Choose an account type.", "Enter an account number of 6 to 16 digits.", "The account numbers do not match.", "Enter a branch code of 6 digits.", "Confirm the account is in your name." | Focus first invalid field; error summary at top listing links |
| Wrong password | `401 reauth_failed` | Field error on password: "That password is not right. Try again." | none |
| Email unverified | `403` | Alert: "Verify your email before you add bank details." | Link "Resend verification email" |
| Suspended | `423` | Alert: "Your affiliate account is paused, so bank details cannot be changed right now." | Link "Contact support" |
| Rate limited | `429` | Alert: "Too many attempts. Wait a few minutes, then try again." | none |
| Not an affiliate | no affiliate profile (`404 affiliates.not_affiliate`) | Redirect to `/refer` (join view) | none |
| Error | Loader fails | `PageState` title "We could not load your bank details", body "Check your connection and try again." | "Try again" |
| Forbidden | Admin | `PageForbidden` | Link home |

## Stage variants

None. Identical for all accounts.

## Interactions and edge cases

- SA ID validation in the client mirrors the API (13 digits, valid date-of-birth digits, Luhn check digit); passports accept 6 to 12 letters and digits. The API stays the authority.
- Changing confirmed details sends them for review again (old behaviour: every save set `submitted`, now `in_review`). Before saving, a line says "Changing your details sends them for review again. Payouts wait until we confirm them." (PG-AFF-DETAILS-20).
- Migrated affiliates with details on file (plain columns in 43f9faa) arrive encrypted and keep their review status; they never see an empty form unless they choose to change.
- Never prefilled: "Change bank details" opens an empty form; Cancel returns to the saved card and clears all fields.
- Account number and password fields are excluded from autofill heuristics where possible and never stored in client storage, URL, analytics, logs or Sentry breadcrumbs (Sentry `beforeSend` scrubs `accountNumber` and `currentPassword` keys).
- Paste is allowed in both account number fields (accessibility); the confirm field still must match.
- Selecting a bank with a universal branch code fills and locks the branch code with the hint "Universal branch code for Capitec: 470010".
- Change during a scheduled payout run: if a batch is already `processing`, the new details apply to the next run; the pending line says which account the current run uses.
- Account holder not the affiliate: the checkbox is required; third-party accounts are not supported (open question for parents paying into a child's account and vice versa).
- Session timeout while typing: on 401 from the BFF, the page sends the person to log in and the form is lost on purpose (no draft saving of bank data).

## Copy

- "Add your bank details", "Add a South African bank account so we can pay your earnings."
- Labels: "Account holder name", "Bank", "Account type", "Account number", "Confirm account number", "Branch code", "Confirm with your password", "This account is in my name."
- Account types: "Cheque or current", "Savings", "Transmission"
- Saved: "Account ending 1234", "Account holder T. Mokoena", "Saved on 12 Oct 2026", "Change bank details"
- Explainer: "We pay into South African bank accounts only. Your details are encrypted and only shown masked."
- Success toast: "Bank details saved. We have emailed you to confirm the change."

## Acceptance criteria

- AC-01 Given saved details, when the page loads, then only bank name, account type, last four digits, holder display and saved date render, and the page HTML and RSC payload contain no full account number.
- AC-02 Given "Change bank details", when the form opens, then every field is empty.
- AC-03 Given mismatched account numbers, when submitted, then "The account numbers do not match." shows and no request is sent.
- AC-04 Given a valid form, when saved, then one PUT is sent through the BFF with an idempotency key, the success toast shows, and the form state is cleared.
- AC-05 Given a wrong password, when saved, then the password field error shows and the other fields keep their values.
- AC-06 Given a bank with a universal branch code, when chosen, then the branch code fills and is read-only.
- AC-07 Given any error or success, when Sentry and analytics payloads are inspected, then they contain no account number or password.
- AC-08 Given a suspended affiliate, when saving, then the suspended alert shows.

## Production readiness

### Security
- [ ] Encrypted at rest by the API (BE-AFF-12); GET returns a masked shape only; contract test asserts the GET schema has no `accountNumber` field. (PG-AFF-DETAILS-Q16)
- [ ] Step-up re-auth with the current password on every change, verified email required, security event written, owner emailed. (PG-AFF-DETAILS-07)
- [ ] BFF mutation only (CSRF via same-site cookie and origin check); `Cache-Control: no-store` on the page and BFF response. (PG-AFF-DETAILS-Q16)
- [ ] No PII in URLs, client storage, logs, analytics or Sentry; `beforeSend` scrubber test. (PG-AFF-DETAILS-Q17)
- [ ] Rate limit group `auth` applies to the PUT (password check). (PG-AFF-DETAILS-Q16)

### Privacy and POPIA
- [ ] Data minimisation: only the fields a defensible payout record needs (identity, address, bank, optional contact and tax reference, as in 43f9faa) and nothing more; ID number and tax reference are masked on read like the account number. (PG-AFF-DETAILS-18)
- [ ] Minors: bank details accepted only if the affiliate consent rule allows (open question). (PG-AFF-DETAILS-11)

### Performance
- [ ] LCP under 2.5 s on Lighthouse mobile, route JS under 150 KB gzip; bank list cached with tag `affiliates:banks`. (PG-AFF-DETAILS-Q18)

### Resilience
- [ ] Idempotency key per form open; double-submit guard. (PG-AFF-DETAILS-08)
- [ ] Concurrent payout run: pending-effective state explains which account the current run uses. (PG-AFF-DETAILS-09)

### Observability
- [ ] Events: `affiliate_payout_details_viewed` (has details), `affiliate_payout_details_change_started`, `affiliate_payout_details_saved`, `affiliate_payout_details_failed` (error code only). Sentry tags `{ page: "PG-AFF-DETAILS" }`. (PG-AFF-DETAILS-Q19)

### Accessibility
- [ ] WCAG 2.2 AA: error summary with links, `aria-describedby` hints, paste allowed (3.3.8), password manager friendly, 44px targets. (PG-AFF-DETAILS-Q20)

### Rollout
- [ ] Behind `flags.affiliates`; before launch, migrated encrypted details from the old app are verified to decrypt and mask correctly on staging. (PG-AFF-DETAILS-Q21)

### Monitoring and alerts
- [ ] Alert on PUT 5xx above 1% over 15 minutes, on more than 5 `reauth_failed` for one account in an hour (possible takeover), and on payout failures with reason `invalid_account` rising week on week. (PG-AFF-DETAILS-Q22)

## Build tasks

- [ ] **PG-AFF-DETAILS-01** Bank details form (masked on read)
- [ ] **PG-AFF-DETAILS-02** Route files and `get-payout-details` loader (masked shape only), `no-store`
- [ ] **PG-AFF-DETAILS-03** Saved account card with masked fields
- [ ] **PG-AFF-DETAILS-04** Form fields and zod refinement for the confirm account number
- [ ] **PG-AFF-DETAILS-05** Bank select from API with universal branch code fill and "Other bank" branch field
- [ ] **PG-AFF-DETAILS-06** Never-prefilled change flow with Cancel that clears state
- [ ] **PG-AFF-DETAILS-07** Step-up password field and `401 reauth_failed`, `403 email_unverified` handling
- [ ] **PG-AFF-DETAILS-08** Idempotency key, pending state and double-submit guard
- [ ] **PG-AFF-DETAILS-09** Pending-effective state copy
- [ ] **PG-AFF-DETAILS-10** Error summary and focus management on validation failure
- [ ] **PG-AFF-DETAILS-11** Minor and suspended (`423`) handling
- [ ] **PG-AFF-DETAILS-12** Sentry `beforeSend` scrubbing for `accountNumber` and `currentPassword` keys (shared helper in `web/src/lib/observability/scrub.ts`)
- [ ] **PG-AFF-DETAILS-13** Desktop two-column layout with "What happens next" steps
- [ ] **PG-AFF-DETAILS-14** "Who you are" section: legal names, ID type select, ID or passport number with SA ID checksum validation, optional 10 digit tax reference
- [ ] **PG-AFF-DETAILS-15** "Where you live" section: street, suburb, city, province select (9 provinces), 4 digit postal code, country fixed to South Africa
- [ ] **PG-AFF-DETAILS-16** "How to reach you about a payment" section: optional email and South African mobile
- [ ] **PG-AFF-DETAILS-17** Review status card: in review, confirmed, needs fixing with review notes
- [ ] **PG-AFF-DETAILS-18** Masked identity lines on the saved card (legal name initial and surname, ID last 3 digits, city and province, tax reference provided)
- [ ] **PG-AFF-DETAILS-19** Permanent redirect `/refer/get-paid` to `/refer/payout-details` in `next.config.ts`; area tab label stays "Get paid"
- [ ] **PG-AFF-DETAILS-20** Re-review notice before saving changes to confirmed details
- [ ] **PG-AFF-DETAILS-21** Backend gap: extend BE-AFF-12 with the identity, address and contact fields, review statuses and the masked read (doc task)

## Quality tasks

- [ ] **PG-AFF-DETAILS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`)
- [ ] **PG-AFF-DETAILS-Q02** Server loader in `src/features/affiliates/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-AFF-DETAILS-Q03** Client mutation through `/api/bff` with the generated TanStack hook; pending state
- [ ] **PG-AFF-DETAILS-Q04** Empty state ("Add your bank details") with one clear next action
- [ ] **PG-AFF-DETAILS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-AFF-DETAILS-Q06** Forbidden state for admin; suspended state
- [ ] **PG-AFF-DETAILS-Q07** Stage-aware wording checked (no academic wording)
- [ ] **PG-AFF-DETAILS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-AFF-DETAILS-Q09** Layout at 1440px
- [ ] **PG-AFF-DETAILS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-AFF-DETAILS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-AFF-DETAILS-Q12** axe: zero violations in light and dark, with validation errors showing
- [ ] **PG-AFF-DETAILS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-AFF-DETAILS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering saved, not saved, validation and error states
- [ ] **PG-AFF-DETAILS-Q15** `generateMetadata` title "Get paid"; area tab active state correct
- [ ] **PG-AFF-DETAILS-Q16** Security review: masked GET contract test, step-up, `no-store`, CSRF, rate limit
- [ ] **PG-AFF-DETAILS-Q17** Leak test: account number and password absent from HTML, RSC payload, storage, analytics and Sentry
- [ ] **PG-AFF-DETAILS-Q18** Performance: Lighthouse CI mobile budget, bank list cache tag
- [ ] **PG-AFF-DETAILS-Q19** Observability: events and Sentry tags wired with error codes only
- [ ] **PG-AFF-DETAILS-Q20** WCAG 2.2 AA pass including 3.3.7 and 3.3.8
- [ ] **PG-AFF-DETAILS-Q21** Rollout: `flags.affiliates`; migrated details decrypt and mask on staging
- [ ] **PG-AFF-DETAILS-Q22** Monitoring: PUT error, repeated reauth failure and invalid account alerts
- [ ] **PG-AFF-DETAILS-Q23** Cleared state test: form values gone after success, cancel and unmount
- [ ] **PG-AFF-DETAILS-Q24** Email notification on change verified in Mailpit locally (BE-NTF template exists)
- [ ] **PG-AFF-DETAILS-Q25** Integration check with admin payout CSV: masked details here match the account used in BE-AFF-13 export (last four digits)
- [ ] **PG-AFF-DETAILS-Q26** Scrubber also removes `idNumber` and `taxReferenceNumber`; leak test extended to them
- [ ] **PG-AFF-DETAILS-Q27** Migration check on staging: old plain-column details arrive encrypted, mask correctly and keep their review status
- [ ] **PG-AFF-DETAILS-Q28** Redirect test for `/refer/get-paid`, and every banner link points at `/refer/payout-details`

## Tests

### Unit (Vitest)
- `bank-details-form.test.tsx`: confirm mismatch; 6 to 16 digits; universal branch code lock; checkbox required; never prefilled; cleared on success.
- `scrub.test.ts`: removes `accountNumber` and `currentPassword` from nested payloads and breadcrumbs.

### Playwright (`web/tests/e2e/affiliates/payout-details.spec.ts`)
- add bank details then see masked card
- change opens an empty form
- mismatched account numbers block submit
- wrong password keeps other fields
- page source has no full account number
- suspended affiliate cannot change details
- needs-fixing details show review notes and resubmitting goes to in review
- invalid sa id number blocks submit
- old get paid route redirects
- axe clean light and dark at 360 and 1440

## Open questions

- A read endpoint `GET /affiliates/me/payout-details` and a bank list endpoint are specified in `../../backend/affiliates.md`.
- Cooling period: should new details wait (for example 48 hours) before a payout uses them, as fraud protection?
- Step-up for Google-only accounts with no password: re-auth via Google, or an emailed code?
- Can a parent affiliate be paid into a joint account, or a student into a parent's account? The checkbox currently requires own account.
- Should account verification (Paystack resolve account or AVS) run before saving?
- The old app stored ID and bank details in plain columns (43f9faa `Affiliate.cs`, and snapshots on `AffiliatePayout`). Migration must encrypt both, and the plaintext source must be destroyed after cutover.
- Should every change to confirmed details trigger a fresh review (old behaviour), or only bank changes?
