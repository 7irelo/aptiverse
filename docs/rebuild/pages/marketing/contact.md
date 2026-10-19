# Contact

| | |
|---|---|
| ID | `PG-MKT-CONTACT` |
| Route | `/contact` |
| Phase | 9 |
| Roles | public (anyone, signed in or not) |
| Stages | high school, university (not stage-specific) |
| Entitlement | free (public page) |
| Depends on | BE-SUP-12, SHL-01, UI-01, UI-02, UI-03, UI-10, FE-25 (BFF proxy), FE-63 (consent-gated analytics) |
| Old app reference | `43f9faa:web/src/app/(marketing)/contact/page.tsx` and `contact/layout.tsx` (metadata). The old form was real: it saved the enquiry and emailed it through `ContactController`. Fields were first name, last name, email, organisation (optional), reason (General enquiry, Parent enquiry, Partnership, Press) and message; it reset on success, showed the raw error message on failure, and promised two different reply times on one page ("within one working day" and "within 24 hours"). |
| Status | Not started. No route, no contact endpoint in the rebuilt API (Support module has FAQs only). |

## Purpose

Give anyone a simple, reliable way to reach the team: a short form that lands in the support inbox, and the direct email addresses. No sales funnel, no demo booking, no phone numbers or addresses we cannot staff.

## User stories

- As a parent, I want to ask a question about billing and know my message arrived.
- As a student, I want to report a problem with my account without signing in.
- As anyone, I want to make a POPIA request (access, correction or deletion of my information) and know where it goes.
- As a journalist, I want a press contact.

## Layout

### Mobile (360px)

1. Public header (SHL-01).
2. Page header: `h1` "Contact us", one-line subhead about reply times.
3. Contact form (full width): Name, Email, Reason (select), Message (textarea, 6 rows, character counter), hidden honeypot, Send button (full width, 44px).
4. Direct contact block: email addresses as `mailto:` links, each with a one-line purpose.
5. Help nudge: "Many answers are already in Help" with link to `/help`.
6. Footer.

### Desktop (1440px)

- Two columns in a 1120px container: form left (7 of 12 columns), direct contact block and help nudge right (5 of 12), sticky at the top of the column.
- Form fields stay single column, max width 560px, for readable line length.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(marketing)/contact/page.tsx` | server | Static shell, `generateMetadata` |
| Error | `web/src/app/(marketing)/contact/error.tsx` | client | Only for render failures; submit errors are inline |
| OG image | `web/src/app/(marketing)/contact/opengraph-image.tsx` | server | Text only |
| ContactForm | `web/src/features/support/components/contact-form.tsx` | client | `useZodForm` (components/common/form-fields.tsx) with the generated zod schema for `POST /support/contact`; `TextField`, `SelectField`, textarea field |
| ContactSuccess | `web/src/features/support/components/contact-success.tsx` | client (rendered by the form) | Replaces the form after success; focus moves to its heading |
| DirectContact | `web/src/features/support/components/direct-contact.tsx` | server | `mailto:` links |
| useSubmitContact | generated TanStack mutation hook from `web/src/lib/api/generated` | client | Calls `/api/bff/support/contact` through `lib/api/fetcher.ts` |
| Textarea field | `web/src/components/common/form-fields.tsx` (add `TextareaField`) | client | Shared addition, label, hint, counter, error |
| Toast | `web/src/components/ui/sonner.tsx` (UI-10) | client | Only for network failure retry hint, success is inline |
| Button, Input, Select | `web/src/components/ui/*` | client | Kit primitives |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| None for reads | | Page is static | none |

Mutations

| Endpoint (BE ID) | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/support/contact` (BE-SUP-12) via `/api/bff/support/contact` | POST | `name` (1 to 120), `email` (valid, up to 256), `reason` (enum `general`, `account`, `billing`, `privacy`, `schools`, `press`), `message` (10 to 4 000), `website` (honeypot, must be empty), `elapsedMs` (time since form render) | `202` `{ reference }` (short human reference, for example `APT-7K2Q`) | Header `Idempotency-Key` (UUID generated once per form instance); API stores the enquiry, emails the routed inbox through the outbox, rate-limits per IP in the default group plus a stricter contact policy |

- Validation errors come back as ProblemDetails with `errors` keyed by field; the form maps them onto fields and shows `detail` for anything else.
- Honeypot filled or `elapsedMs` under 3 000: the API returns the same `202` with a reference but discards the message (no signal to bots).

## States

| State | When | Exact copy |
|---|---|---|
| Idle | First render | Form with labels and hints |
| Field error (client) | On blur or submit | Name: "Please enter your name." Email: "Please enter a valid email address, like name@example.com." Reason: "Please choose a reason." Message: "Please write at least 10 characters." or "Please keep your message under 4 000 characters." |
| Submitting | Request in flight | Button text "Sending...", button disabled, `aria-busy` on the form |
| Success | `202` | Heading "Thanks, we have your message", body "We reply by email, usually within two working days. Your reference is {reference}." Link "Send another message" |
| Validation error (server) | `400` | Field messages from the API `errors`; summary "Please fix the highlighted fields." |
| Rate limited | `429` | "You have sent several messages in a short time. Please wait a few minutes and try again, or email support@aptiverse.co.za." |
| Network or server error | `5xx`, `502` from BFF, offline | "We could not send your message. Your text is still here. Check your connection and try again." Button stays "Send message" |
| Loading, empty, forbidden, upgrade, no evidence | Not applicable | |

## Stage variants

None. Reason labels and copy are neutral for high school and university students and parents.

## Interactions and edge cases

- Reason select labels: "General question", "My account", "Billing and payments", "Privacy request (POPIA)", "Schools", "Press". Choosing "Privacy request (POPIA)" shows a hint under Message: "Tell us what you would like us to do with your information: access, correct or delete it. We may ask you to confirm your identity by email."
- Choosing "Schools" shows hint: "We do not offer school accounts yet, but we read every message."
- `?reason=privacy` (used by the privacy policy) preselects the reason; any other value is ignored.
- Signed-in visitor: name and email prefilled from the session on the server and still editable; no hidden account id is sent (the API reads the user from the token when the BFF forwards one).
- Double submit: button disabled while pending, and the idempotency key makes a replay return the same reference without a second email.
- Message preserved on any failure; nothing is cleared until success.
- Paste of very long text: counter turns to the error state, submission blocked client side, server enforces the same limit.
- Offline at submit: `navigator.onLine` false shows the network error copy immediately.
- Email addresses are `mailto:` links; no form autofill of message.
- One reply-time promise only: the subhead, the success block and the direct contact block all read from one constant (`CONTACT_REPLY_PROMISE` in `web/src/features/support/content/contact.ts`), so the page cannot contradict itself the way the old page did.
- Never show raw exception or API text that is not a ProblemDetails `detail` or field message; unknown failures use the network or server error copy.
- Old reasons map to the new enum for migrated enquiries: "General enquiry" and "Parent enquiry" to `general`, "Press" to `press`, "Partnership" to `general` (no partnership programme is offered, so the option does not return).
- Name is one field ("Your name"), not first and last name: shorter on mobile and matches the Identity `Name` field. Organisation is not asked (data minimisation; the old optional field added nothing the message cannot carry).
- After success the form is replaced by the success block (not silently reset as in the old page), so the person sees the reference and is not tempted to resend.

## Copy

- `h1`: "Contact us"
- Subhead: "Questions, problems or feedback: send us a message and a real person on the team will reply by email."
- Labels: "Your name", "Email address", "What is this about?", "Message"
- Email hint: "We only use this to reply to you."
- Button: "Send message"
- Direct contact block heading: "Email us directly"
  - "support@aptiverse.co.za: help with your account, billing or the app"
  - "privacy@aptiverse.co.za: POPIA requests about your personal information" (confirm the mailbox exists, see open questions)
- Help nudge: "Many answers are already in Help." Link "Visit Help"
- Privacy line under the form: "We keep your message only as long as we need it to help you. See our Privacy Policy." with link to `/privacy`

## Acceptance criteria

1. Given I fill all fields validly, when I press "Send message", then the form is replaced by the success block showing a reference and focus moves to its heading.
2. Given I press "Send message" twice quickly, then exactly one enquiry is stored and one email is sent (same idempotency key).
3. Given the API returns a 400 with `errors.email`, then the email field shows the API message and the other fields keep their values.
4. Given the API returns 429, then I see the rate-limit copy and my message is still in the textarea.
5. Given the BFF cannot reach the API, then I see "We could not send your message..." and can retry without retyping.
6. Given a bot fills the honeypot, then the response looks like success and no email is sent (asserted in the API integration test).
7. Given I open `/contact?reason=privacy`, then the reason is preselected and the POPIA hint shows.
8. Given a screen reader, when a submit fails validation, then focus moves to the first invalid field and the error is announced.

## Production readiness

- Security
  - Submit goes through the BFF (same-origin POST), never directly to the API; the BFF strips cookies before forwarding (`app/api/bff/[...path]/route.ts`). CSRF: same-origin plus `SameSite=Lax` session cookie plus a required `content-type: application/json`; the BFF rejects cross-origin `Origin` headers on mutations.
  - API validates every field (FluentValidation), strips control characters, stores message as plain text; the email template HTML-encodes it. No HTML rendered from user input anywhere.
  - No PII in URLs (only `reason`) or in logs: the API logs the reference and reason, never name, email or message (OBS-06).
  - Rate limits: API per-IP limit for `POST /support/contact` (proposed 5 per 10 minutes) plus Cloudflare rule on the path.
- Performance
  - Static page; only the form is client JS (react-hook-form, zod schema). Route JS under 150 KB gzip total, target under 50 KB route-specific. LCP is the `h1`, under 2.5s on mobile.
- Resilience
  - Idempotency key per form instance; retries reuse it. Fetcher retries once on network failure for this POST only because it is idempotent.
  - Timeout 15s in the fetcher; on timeout show the network error copy.
  - Text never lost on failure.
- Observability
  - Sentry captures unexpected submit errors (status 500 or network) with tag `route:/contact`, without the request body.
  - Analytics (consent-gated `track()`): `contact_form_started` (first field focus), `contact_form_submitted` {reason}, `contact_form_failed` {status}. Never name, email or message.
  - BFF forwards `traceparent`, so a failed submit links to the API trace and the outbox email job.
- Accessibility (WCAG 2.2 AA)
  - Visible labels, `autocomplete="name"` and `"email"`, `inputmode="email"`.
  - Error summary plus inline errors linked with `aria-describedby`; focus to first invalid field (3.3.1, 3.3.3).
  - Success region `role="status"`. Redundant entry avoided for signed-in users by prefill (3.3.7).
  - Counter announced politely only near the limit, not on every keystroke.
- Privacy and POPIA
  - Data minimisation: no phone, no organisation, no date of birth. Minors can write in; no age asked.
  - Purpose statement and privacy link under the form. Retention for enquiries defined in the retention policy (HRD-35).
  - Privacy requests routed to the privacy inbox and logged as such for the 30-day POPIA response window.
- SEO
  - Canonical `/contact`, sitemap entry, OG image. `?reason=` variants canonicalise to `/contact`.
  - JSON-LD `ContactPage` with `Organization` `email` only (no invented address or phone).
- Rollout
  - `contactPage` switch in `lib/flags.ts`; off returns `notFound()` and links are hidden. Ship to staging with Mailpit, confirm Zoho delivery from staging SES, then enable in prod.
  - Rollback: switch off or Vercel instant rollback (HRD-03); stored enquiries are unaffected.
- Monitoring
  - Grafana panel (OBS-02) for `POST /support/contact`: rate of 2xx, 4xx, 429, 5xx, and outbox email failures.
  - Alert when 5xx rate for the endpoint is above 5 percent over 15 minutes, or when outbox email dead letters appear.
  - Sentry alert on new issues tagged `route:/contact`.

## Build tasks

- [ ] **PG-MKT-CONTACT-01** Form fields: name, email, reason, message, using the generated zod schema for `POST /support/contact`
- [ ] **PG-MKT-CONTACT-02** Submit through the BFF with the generated mutation hook; success and error states
- [ ] **PG-MKT-CONTACT-03** Direct contact details block (`support@`, `privacy@`), `mailto:` links only
- [ ] **PG-MKT-CONTACT-04** Abuse protection in the form: honeypot field and elapsed-time field (API enforces rate limit)
- [ ] **PG-MKT-CONTACT-05** `TextareaField` added to `components/common/form-fields.tsx` with counter and error wiring
- [ ] **PG-MKT-CONTACT-06** Idempotency key per form instance and pending-state double-submit guard
- [ ] **PG-MKT-CONTACT-07** Map ProblemDetails `errors` to fields; summary and focus management
- [ ] **PG-MKT-CONTACT-08** 429 and network error copy, message preserved
- [ ] **PG-MKT-CONTACT-09** Success block with reference, focus to heading, "Send another message" resets with a new key
- [ ] **PG-MKT-CONTACT-10** Reason-specific hints (privacy, schools) and `?reason=privacy` preselect
- [ ] **PG-MKT-CONTACT-11** Signed-in prefill of name and email on the server
- [ ] **PG-MKT-CONTACT-12** BFF mutation guard: reject cross-origin `Origin` on POST (shared with all BFF mutations; coordinate with FE-25)
- [ ] **PG-MKT-CONTACT-13** Analytics events (`contact_form_started`, `contact_form_submitted`, `contact_form_failed`)
- [ ] **PG-MKT-CONTACT-14** Metadata, OG image, canonical, sitemap entry, `ContactPage` JSON-LD
- [ ] **PG-MKT-CONTACT-15** `contactPage` switch in `lib/flags.ts`, header and footer links follow it
- [ ] **PG-MKT-CONTACT-16** Single `CONTACT_REPLY_PROMISE` constant used by the subhead, success block and direct contact block
- [ ] **PG-MKT-CONTACT-17** Error display rule: only ProblemDetails `detail` or field messages are shown, never raw exception text
- [ ] **PG-MKT-CONTACT-18** Old reason values mapped to the new enum for migrated enquiries (input to the MIG mapping for `support` enquiries)

## Quality tasks

- [ ] **PG-MKT-CONTACT-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-CONTACT-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-CONTACT-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-CONTACT-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-CONTACT-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-CONTACT-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against the claims ledger
- [ ] **PG-MKT-CONTACT-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-CONTACT-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-CONTACT-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-CONTACT-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-CONTACT-Q11** Log review: no name, email or message in web or API logs for a test submit (OBS-06)
- [ ] **PG-MKT-CONTACT-Q12** End-to-end delivery check in staging: enquiry stored, email arrives in the Zoho inbox with reason routing
- [ ] **PG-MKT-CONTACT-Q13** Grafana panel and 5xx alert for `POST /support/contact` exist and fire in staging
- [ ] **PG-MKT-CONTACT-Q14** Copy consistency check: the reply-time promise appears identically wherever it is shown

## Tests

Unit (Vitest, MSW)
- `ContactForm shows field errors from the zod schema on submit`
- `ContactForm maps API validation errors onto fields`
- `ContactForm sends the same idempotency key on retry`
- `ContactForm disables the button while sending`
- `ContactForm keeps the message after a network error`
- `ContactForm preselects privacy from the query and shows the POPIA hint`
- `ContactForm shows the generic error copy for a non ProblemDetails failure`
- `contact copy uses one reply promise everywhere`

Playwright (`web/e2e/contact.spec.ts`, Pixel 7, iPhone 14, desktop Chrome; mock API)
- `sends a message and shows a reference`
- `double click sends one message`
- `shows the rate limit message on 429`
- `shows a retry message when the API is down and keeps the text`
- `fits 360px with no sideways scroll`
- `has no accessibility violations in light and dark, including the error state`

API integration (BE-SUP-12, listed for traceability)
- `honeypot submissions return 202 and send nothing`
- `replayed idempotency key returns the same reference`

## Open questions

1. Does `privacy@aptiverse.co.za` exist in Zoho? If not, route privacy requests to support@ with a subject tag.
2. Contact is Phase 9 but the marketing footer is Phase 3. Ship a `mailto:` only contact page in Phase 3 and add the form in Phase 9? Recommended.
3. Should the old "Parent enquiry" and "Partnership" reasons return? Partnership is dropped here because no partnership programme exists; old rows map as in the edge cases.
4. Reply-time promise ("usually within two working days") must be confirmed by whoever staffs support.
