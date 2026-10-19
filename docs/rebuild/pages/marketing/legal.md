# Privacy and Terms

| | |
|---|---|
| ID | `PG-MKT-LEGAL` |
| Route | `/privacy`, `/terms` |
| Phase | 3 (pages), 10 (final POPIA review, HRD-30) |
| Roles | public (anyone, signed in or not) |
| Stages | high school, university (one document for all) |
| Entitlement | free (public page) |
| Depends on | SHL-01, UI-07 (Dialog), UI-29 (Markdown), FE-63 (consent store), BE-WEL-04 (diary storage facts), BE-WEL-08 (helplines), BE-IDN-04 (`user_consents`), BE-IDN-20 (register sends consent versions), PG-AUTH-REG-03, HRD-30, HRD-31, HRD-32 |
| Old app reference | `43f9faa:web/src/app/(marketing)/privacy/page.tsx`, `43f9faa:web/src/app/(marketing)/terms/page.tsx` and their `layout.tsx` metadata, `43f9faa:web/src/components/marketing/LegalDoc.tsx` (numbered sections, inline action block, contact footer), `43f9faa:web/src/components/common/ConsentBanner.tsx`, `43f9faa:web/src/components/common/ConsentPreferencesDialog.tsx`, `43f9faa:web/src/lib/analytics/consent.ts` (behaviour and content reference only; rewrite for the rebuilt product and data flows; do not carry over the old tutor section, the "registered counsellors" line, the third-party font CDN line or "Family plan" wording) |
| Status | Not started. No routes. API side: `LegalOptions` (`Legal:TermsVersion`, `Legal:PrivacyVersion`) exists in `api/src/Modules/Identity/Aptiverse.Identity/Authentication/AuthOptions.cs` and `UserConsent` rows use document keys `terms` and `privacy`; no endpoint exposes the current versions yet. |

## Purpose

Publish the Privacy Policy (POPIA, plain language, written with minors in mind) and the Terms of Use as readable long-form pages. Each shows a version and effective date that exactly match the versions the API records when someone signs up, so a consent row always points at a document a person could read.

## User stories

- As a parent of a 15-year-old, I want to know what Aptiverse collects about my child, where it is stored, who sees it, and how to have it deleted.
- As a student, I want to know that my diary is private and that my parent cannot read it.
- As anyone signing up, I want the version I agree to be the one on the page.
- As a returning user, I want to see what changed since the last version.

## Layout

### Mobile (360px)

1. Public header (SHL-01).
2. `h1` ("Privacy Policy" or "Terms of Use").
3. Meta line: "Version {version}, effective {d MMMM yyyy}".
4. Summary box: 4 to 6 plain bullets ("The short version").
5. "On this page" disclosure (collapsed by default) listing `h2` sections.
6. Document body in a readable measure, `h2` per section, `h3` for subsections, numbered so users can cite clauses.
7. "What changed" section (version history list, newest first).
8. Contact for privacy questions (link to `/contact?reason=privacy`), then the document footer line "Questions about this document? Email support@aptiverse.co.za."
9. Footer, which carries a "Privacy choices" link on every marketing page (opens the consent preferences dialog).

Privacy page only: inside the "Cookies and analytics" section, an inline "Change your privacy choices" button opens the same dialog at the point where the policy describes what consent covers (ported from the old `LegalDoc` action block).

Site-wide (owned here, rendered by the marketing layout): the consent banner, a slim non-modal bottom sheet no taller than about a fifth of a 360px by 740px viewport, padded for the safe-area inset, shown until a choice is recorded.

### Desktop (1440px)

- Two columns in 1120px: sticky table of contents left (3 of 12) with the active section highlighted, body right (max 68 characters per line).
- Summary box spans the body column above the first section.
- Print stylesheet: hides header, footer and TOC; shows URL and version at the top.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Privacy page | `web/src/app/(marketing)/privacy/page.tsx` | server | Static, `generateMetadata` |
| Terms page | `web/src/app/(marketing)/terms/page.tsx` | server | Static, `generateMetadata` |
| OG images | `web/src/app/(marketing)/privacy/opengraph-image.tsx`, `terms/opengraph-image.tsx` | server | Text only |
| LegalDocument | `web/src/features/marketing/components/legal-document.tsx` | server | Title, meta line, summary, TOC, body, history |
| LongForm | `web/src/features/marketing/components/long-form.tsx` | server | Owned here (PG-MKT-LEGAL-01); typography for headings, lists, tables, anchors; reused by help articles |
| TableOfContents | `web/src/features/marketing/components/table-of-contents.tsx` | server, with a client leaf for active-section tracking and the mobile disclosure | Owned here; reused by help articles |
| Legal content | `web/src/content/legal/privacy.md`, `web/src/content/legal/terms.md` | build-time | Markdown with front matter `version`, `effectiveDate`, `summary[]`, `history[]` |
| loadLegalDocument | `web/src/features/marketing/server/load-legal-document.ts` | server only | Reads and parses the Markdown at build, validates front matter with zod, fails the build if the version does not match `LEGAL_TERMS_VERSION` or `LEGAL_PRIVACY_VERSION` |
| Markdown | `web/src/components/common/markdown.tsx` | server | Heading ids for anchors |
| ConsentBanner | `web/src/components/common/consent-banner.tsx` | client | Owned here. `role="dialog"`, `aria-modal="false"`, `aria-labelledby`; focuses its container (not a button) on mount; never traps focus; two buttons with identical variant, size and width; Lucide `Cookie` icon `aria-hidden`; rendered only when a consent-gated tool is active (see edge cases) |
| ConsentPreferencesDialog | `web/src/components/common/consent-preferences-dialog.tsx` | client | Owned here. Built on the UI-07 dialog; shows the current choice in words, then "Allow" and "Do not allow" with equal weight; no toggles, no Save button |
| PrivacyChoicesButton | `web/src/components/common/privacy-choices-button.tsx` | client | Small leaf that opens the dialog; used in the site footer (SHL-01) and inline in the privacy policy |
| Consent store | `web/src/lib/analytics/consent.ts` | client | Owned by FE-63; this page consumes `getConsentState()`, `setConsent(marketing, source)`, `subscribe()` and `CONSENT_SUMMARY` |

## Data

| Source | Method | Fields used | Cache |
|---|---|---|---|
| `web/src/content/legal/*.md` | build-time file read | `version`, `effectiveDate`, `summary`, `history[]` (`version`, `date`, `change`), body | Static at build |
| Env `LEGAL_TERMS_VERSION`, `LEGAL_PRIVACY_VERSION` (same values as the API's `Legal:TermsVersion`, `Legal:PrivacyVersion`) | build-time | version strings | Static |
| Proposed `GET /legal/versions` (new Identity slice, see open questions) | GET | `terms`, `privacy` | Would replace env vars; tag `legal:versions` |

| Browser `localStorage` key `aptiverse.consent.v1` (FE-63) | client read and write | `version`, `marketing` (boolean), `decidedAt` (ISO), `source` (`banner` or `preferences`) | per device |
| `navigator.globalPrivacyControl` | client read | boolean | per visit |

- The register page (PG-AUTH-REG-03) and these pages read the version from the same helper, so the consent sent and the page shown cannot drift.
- Mutations: none.

## States

| State | When | Exact copy |
|---|---|---|
| Populated | Always (static) | Document |
| Build failure (not a runtime state) | Front matter version differs from env version | Build error: "Legal version mismatch: privacy.md says {a}, LEGAL_PRIVACY_VERSION is {b}" |
| Banner | No consent record, no GPC signal, a consent-gated tool active | Heading "Can we measure our adverts?" (wording follows what is actually gated, see open questions); body `CONSENT_SUMMARY` plus "Say no and nothing loads." plus a "Privacy Policy" link; buttons "Allow" and "Do not allow" |
| Dialog, no choice | No record | "You have not made a choice yet, so nothing is loaded." |
| Dialog, allowed | Record with `marketing: true` | "You allowed advertising measurement on {d MMMM yyyy}." (en-ZA date) |
| Dialog, declined | Record with `marketing: false` | "You turned advertising measurement down on {d MMMM yyyy}." |
| Dialog, GPC | Browser sends Global Privacy Control | "Your browser sends a Global Privacy Control signal, so advertising measurement is off and stays off. Nothing here can override it." Both buttons disabled |
| Dialog footnote | Always | "Cookies that keep you signed in are not affected by this choice. They are needed for the service to work at all, so there is nothing to opt in or out of there." |
| Loading, empty, error, forbidden, upgrade, no evidence | Not applicable (static page, no runtime data) | |

## Stage variants

None. The privacy policy has a section written for learners under 18 and their parents, and it applies to both high school and university students. No stage-specific terms.

## Interactions and edge cases

- Anchors: every `h2` and `h3` has a stable id (`#section-4-2`) so support and the consent screen can link to a clause.
- Active section highlight in the TOC uses IntersectionObserver; with JS off the TOC still works as plain links.
- Version history: each entry says what changed in one plain sentence. A material change bumps the version, which makes the API ask signed-in users to accept again (re-consent flow is an Identity concern; noted in open questions).
- Old versions: `/privacy?version=1.0` is not supported in v1; history lists changes only. Archived copies are kept in git and the content folder (`privacy-1.0.md`) for evidence.
- Long tables (for example the data inventory) scroll inside their own container at 360px.
- Print: the version and URL print at the top.
- Consent banner never blocks reading: no overlay, no scroll lock, and it sits below the hero call to action so the page stays usable while it is open. Ignoring it and reading on keeps every consent-gated tool off.
- Reject is exactly as easy as accept: same component variant, size and width, side by side, both reachable with one thumb; nothing pre-ticked; no "manage preferences" maze.
- GPC: when `navigator.globalPrivacyControl` is true the banner is not shown, gated tools stay off, and the dialog explains why with both buttons disabled.
- Record versioning: a stored record with a different `version` is ignored and the visitor is asked again; unreadable or blocked storage is treated as no choice (banner shows, nothing loads).
- The banner appears only when there is something to consent to. Decision 8 dropped the Meta pixel, so in v1 the only consent-gated tool is custom `track()` events (FE-63, FE-160); Vercel Web Analytics page views are cookieless and run without consent but switch off on decline or GPC. The banner is rendered while `track()` events are gated; the footer link and dialog always stay so the policy can explain what runs.
- Withdrawing consent in the dialog takes effect at once: gated scripts are not loaded on the next navigation and stored marketing identifiers are cleared where the tool allows it.

## Copy

Privacy Policy required sections (plain language, final wording drafted in PG-MKT-LEGAL-02, reviewed by a POPIA-aware adviser):
1. "Who we are" (responsible party, Information Officer name and contact).
2. "What we collect" (account details, academic records you enter, practice results, wellbeing check-ins, diary entries encrypted, payment references from Paystack, device and log data).
3. "Why we collect it" (each purpose tied to a lawful basis).
4. "Learners under 18" (parent consent, what parents can and cannot see, the diary is never shared).
5. "Who we share it with" (operators: AWS af-south-1 in Cape Town for storage, Vercel for the website in the Cape Town region, Amazon SES in Ireland for email, Anthropic for the AI tutor and practice generation with what is sent, Paystack for payments, Sentry for error reports). Cross-border transfers named honestly.
6. "Where it is stored" (South Africa, with the named exceptions above).
7. "How long we keep it" (from the retention policy, HRD-35).
8. "Your rights" (access, correction, deletion, objection, complaint to the Information Regulator) and how to use them in the app (Settings, data export, delete account, with a 14-day cooling-off during which deletion can be cancelled, decision 38) or through `/contact?reason=privacy`.
9. "Cookies and analytics" (essential session cookie; analytics only with consent).
10. "Security".
11. "Changes to this policy".

Terms of Use (decision 37 fixes the name) required sections: who can use Aptiverse (age and parent consent), your account, acceptable use, AI features (can be wrong, not a substitute for teachers, academic honesty), subscriptions and cancellation (Paystack, renewals, cancel any time, refunds as per policy), affiliates (in v1, decision 3; see the affiliate terms rules below), content you add, our content, availability, liability within South African law (Consumer Protection Act), ending your account, governing law (South Africa), contact.

Content rules ported from the 43f9faa pages (each must still be true of the rebuilt system before it ships):
- Cookies and browser storage are listed as implemented, not generically: the Auth.js session cookie, its CSRF cookie and the post-login return cookie (names from FE-22), the `apt_ref` referral cookie (30 days, PG-MKT-AFF; affiliates are in v1, decision 3), and any `localStorage` keys the app writes (the consent record at least). Public pages set no cookies before consent.
- Say plainly that page views are counted with Vercel Web Analytics, which is cookieless, and that custom usage events are sent only with consent. State that Aptiverse uses no advertising tags or conversion reporting (decision 8); if that changes after launch the policy version is bumped first.
- Diary: say exactly what BE-WEL-04 implements (who can read entries, how content is encrypted and who holds the key). Never write "end-to-end encrypted" unless it is literally true; the old app had to retract that claim. State that nothing analyses diary text and that the mood trend comes from check-ins only, if still true.
- "We do not sell your personal information, and we do not use the content of your work to train models for anyone else" stays only if confirmed against the Anthropic terms in use.
- Payments happen on Paystack's own checkout pages, which set their own cookies under Paystack's policy.
- No third-party font CDN line once Frygia is self-hosted (HRD-62).
- Terms: "Wellbeing is not a medical or emergency service" stays, with South African crisis lines from BE-WEL-08; the old "can connect you to registered counsellors" line is red-listed and must not return. AI can be wrong and is a study aid. Paid plans renew until cancelled; cancel any time and keep access to the end of the paid period; clear notice before a price change. The VAT statement follows `vatInclusive` (PG-MKT-PRICE). No tutor or marketplace section.
- Material changes: the old Terms said continued use meant acceptance; the rebuild asks signed-in users to accept the new version instead (re-consent, open question 2), and the Terms say so.
- Every section heading is numbered ("4. Learners under 18") so clauses can be cited.

Metadata (from the old layouts, adjusted): `/privacy` title "Privacy Policy", description "What Aptiverse collects, how we use it, and your rights under POPIA."; `/terms` title "Terms of Use", description "The rules for using Aptiverse, in clear language."

Fixed strings:
- Meta line: "Version {version}, effective {d MMMM yyyy}"
- Summary heading: "The short version"
- TOC: "On this page"
- History heading: "What changed"
- Contact line: "Questions about your information? Send us a privacy request." (link to `/contact?reason=privacy`)
- Document footer: "Questions about this document? Email support@aptiverse.co.za."
- Footer link and dialog title: "Privacy choices"; inline policy button: "Change your privacy choices"
- Banner and dialog buttons: "Allow", "Do not allow"

## Acceptance criteria

1. Given `LEGAL_PRIVACY_VERSION` is `2.0`, when the site builds with `privacy.md` front matter `version: 1.9`, then the build fails with the mismatch message.
2. Given I open `/privacy` at 360px, then I see the `h1`, the version and effective date, the short version, and a collapsed "On this page" that expands with a keyboard.
3. Given I sign up, when the API stores my consent rows, then their versions equal the versions shown on `/terms` and `/privacy` at that moment (asserted in the register E2E).
4. Given I follow `/privacy#section-4`, then the page scrolls to "Learners under 18" with the heading visible below the sticky header.
5. Given I print `/terms`, then the header, footer and TOC are hidden and the version and URL appear at the top.
6. Given the privacy policy, then every operator in the data processing inventory (HRD-31) is named, with its country.
7. Given a first visit with no consent record, when the banner appears, then focus is on the banner container (not on either button), both buttons have identical size and styling, and Tab moves out of the banner normally.
8. Given I press "Do not allow", when I navigate the site, then no consent-gated script or request is made and the banner does not return on this device.
9. Given my browser sends Global Privacy Control, when I open "Privacy choices", then the GPC message shows and both buttons are disabled.
10. Given I allowed measurement on 3 March 2027, when I open "Privacy choices", then it reads "You allowed advertising measurement on 3 March 2027."
11. Given the cookies observed in a full E2E journey, then each one is named in the privacy policy's cookies section.

## Production readiness

- Security
  - Static content compiled at build; no runtime input. Markdown comes from the repo, still rendered through the sanitised renderer.
- Performance
  - Fully static; LCP is the `h1`, well under 2.5s. Client JS only for the TOC active tracker and disclosure (under 5 KB). Route total under 150 KB gzip.
- Resilience
  - No API dependency at runtime, so the pages stay up when the API is down (important: the register page links here).
- Observability
  - Sentry boundary from the root `error.tsx`; tag `route:/privacy`, `route:/terms`.
  - Analytics (consent-gated `track()`): `legal_viewed` {doc, version}. Consent decisions themselves are not sent as analytics events (a decline must leave no trace).
- Accessibility (WCAG 2.2 AA)
  - One `h1`, ordered `h2` and `h3`, numbered sections, TOC as `nav aria-label="On this page"`.
  - Reading level aimed at Grade 10; short sentences; defined terms explained inline.
  - Tables have header cells and captions; scrollable regions are focusable with a label.
- Privacy and POPIA
  - Content must cover minors (parent consent for under-18s, HRD-32), data residency in af-south-1, cross-border operators, retention and rights.
  - Information Officer registration with the Information Regulator confirmed before launch (open question).
  - Consent is as easy to withdraw as to give (footer link on every marketing page, inline button in the policy); GPC is honoured; the consent record stays on the device and is never sent with identifiers.
- SEO
  - Canonical `/privacy` and `/terms`, sitemap entries, OG images. Indexable.
- Rollout
  - No flag; legal pages must exist before the register page goes live. A version bump is a normal deploy; coordinate with the API config change in the same release so versions match.
  - Rollback: Vercel instant rollback (HRD-03) together with reverting the API `Legal:*` config, never one without the other.
- Monitoring
  - CI check (the build guard) is the main monitor.
  - A synthetic check in staging and prod compares the version on `/privacy` and `/terms` with the API's configured versions (via `GET /legal/versions` once it exists) and alerts on mismatch.

## Build tasks

- [ ] **PG-MKT-LEGAL-01** Long-form layout with table of contents (`long-form.tsx`, `table-of-contents.tsx`), shared with help articles
- [ ] **PG-MKT-LEGAL-02** POPIA privacy policy text (plain language, minors, data residency, operators, rights)
- [ ] **PG-MKT-LEGAL-03** Terms of Use text
- [ ] **PG-MKT-LEGAL-04** Version numbers match `Legal:TermsVersion` and `Legal:PrivacyVersion`
- [ ] **PG-MKT-LEGAL-05** Content files with front matter and zod-validated `loadLegalDocument` helper
- [ ] **PG-MKT-LEGAL-06** Build guard: fail when front matter version differs from `LEGAL_TERMS_VERSION` or `LEGAL_PRIVACY_VERSION`
- [ ] **PG-MKT-LEGAL-07** Shared `getLegalVersions()` helper used by these pages and the register page consent payload
- [ ] **PG-MKT-LEGAL-08** `LegalDocument` component: meta line, short version, history section
- [ ] **PG-MKT-LEGAL-09** TOC active-section tracker and mobile disclosure (client leaf)
- [ ] **PG-MKT-LEGAL-10** Stable heading anchors and `scroll-margin-top`
- [ ] **PG-MKT-LEGAL-11** Print stylesheet
- [ ] **PG-MKT-LEGAL-12** Data inventory table in the privacy policy from HRD-31 (operator, purpose, country)
- [ ] **PG-MKT-LEGAL-13** Metadata, OG images, canonical, sitemap entries
- [ ] **PG-MKT-LEGAL-14** `legal_viewed` analytics event
- [ ] **PG-MKT-LEGAL-15** Version parity synthetic check against `GET /legal/versions` (once the endpoint exists)
- [ ] **PG-MKT-LEGAL-16** `consent-banner.tsx`: non-modal dialog, container focus on mount, no focus trap, equal-weight Allow and Do not allow, slim bottom sheet with safe-area padding
- [ ] **PG-MKT-LEGAL-17** `consent-preferences-dialog.tsx`: current choice in plain words with an en-ZA date, equal-weight buttons, essential-cookie footnote
- [ ] **PG-MKT-LEGAL-18** `privacy-choices-button.tsx` in the site footer on every marketing page and inline in the privacy policy cookies section
- [ ] **PG-MKT-LEGAL-19** GPC handling (no banner, gated tools off, dialog buttons disabled) and consent record versioning (re-ask on version change, blocked storage treated as no choice)
- [ ] **PG-MKT-LEGAL-20** Render the banner only when a consent-gated tool is active (in v1: custom `track()` events; no advertising tag, decision 8), with a unit-tested `needsConsentBanner()`
- [ ] **PG-MKT-LEGAL-21** Privacy policy cookies and browser storage inventory written from the implemented cookies and `localStorage` keys, plus the Paystack checkout note
- [ ] **PG-MKT-LEGAL-22** Diary and AI data statements checked against BE-WEL-04 and the Anthropic terms; no "end-to-end" wording
- [ ] **PG-MKT-LEGAL-23** Terms content rules: wellbeing not a medical or emergency service with BE-WEL-08 helplines, no counsellor or tutor sections, renewal, cancellation and price-change notice, VAT line from `vatInclusive`, re-consent on material change
- [ ] **PG-MKT-LEGAL-24** Numbered section headings and the "Questions about this document?" footer in `LegalDocument`
- [ ] **PG-MKT-LEGAL-25** Affiliates section of the Terms of Use (decisions 3, 3b, 3c, 31): 18 or older only; joining is automatic on accepting these terms, and payout details are checked before any payout; 40% of the first 3 monthly payments or the first annual payment actually received (VAT basis per BE-AFF open question 3); 30-day hold; a referral counts for 12 months from the first click on the link and payments after that earn nothing; first referrer wins; the referral must be claimed within 7 days of sign-up; R100.00 minimum payout by EFT to an account in the affiliate's name; refunds and lost disputes reverse commission, carried against the next payout; self and household referrals earn nothing; suspension rules; tax is the affiliate's responsibility with a yearly statement. Every number checked against `GET /affiliates/terms` (BE-AFF-31) by the parity check in PG-MKT-AFF-Q15

## Quality tasks

- [ ] **PG-MKT-LEGAL-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves
- [ ] **PG-MKT-LEGAL-Q02** `generateMetadata` title and description; OG image
- [ ] **PG-MKT-LEGAL-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-MKT-LEGAL-Q04** Layout at 768px and 1440px
- [ ] **PG-MKT-LEGAL-Q05** Light and dark both correct (OS-driven)
- [ ] **PG-MKT-LEGAL-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against the claims ledger
- [ ] **PG-MKT-LEGAL-Q07** axe: zero violations in light and dark
- [ ] **PG-MKT-LEGAL-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order
- [ ] **PG-MKT-LEGAL-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-LEGAL-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome
- [ ] **PG-MKT-LEGAL-Q11** Legal review of both documents by a POPIA-aware adviser *(unverified: human action outside the repo)*
- [ ] **PG-MKT-LEGAL-Q12** Every operator named in the policy matches the live system (AWS af-south-1, Vercel cpt1, SES eu-west-1, Anthropic, Paystack, Sentry)
- [ ] **PG-MKT-LEGAL-Q13** Readability check (plain language, short sentences) on both documents
- [ ] **PG-MKT-LEGAL-Q14** Consent fairness check: Playwright asserts both banner buttons share size and classes and neither is focused on mount
- [ ] **PG-MKT-LEGAL-Q15** GPC and decline checks: with GPC set, or after "Do not allow", no consent-gated script or request appears in the network log
- [ ] **PG-MKT-LEGAL-Q16** Cookie inventory audit: cookies observed across sign up, log in and checkout E2E all appear in the privacy policy

## Tests

Unit (Vitest)
- `loadLegalDocument parses front matter and history`
- `legal version guard throws on mismatch`
- `getLegalVersions returns the env versions`
- `TableOfContents lists h2 sections with anchors`
- `needsConsentBanner is false with GPC, with a current record, or when nothing is gated`
- `consent record with an old version is ignored`
- `ConsentPreferencesDialog describes allowed, declined, none and GPC states`

Playwright (`web/e2e/legal.spec.ts`, Pixel 7, iPhone 14, desktop Chrome)
- `privacy shows version and effective date`
- `on this page disclosure opens with the keyboard`
- `anchor link lands below the sticky header`
- `terms prints without header and footer` (print media emulation)
- `fits 360px with no sideways scroll`
- `has no accessibility violations in light and dark`
- `consent banner focuses the container and does not trap focus`
- `do not allow keeps gated scripts off across pages`
- `privacy choices link in the footer opens the dialog`
- `global privacy control disables the choices`
- `banner does not cover the hero call to action at 360px`
- In `register.spec.ts` (PG-AUTH-REG): `consent versions sent match the legal pages`

## Open questions

1. No endpoint exposes the current legal versions. Options: add `GET /legal/versions` to Identity (public, cached, tag `legal:versions`), or keep matching env vars on web and API set from one source in infra. Recommend the endpoint, with the env vars as the interim.
2. Re-consent when a version changes: who builds the "we updated our terms" prompt for signed-in users (Identity plus an app shell banner)? Not in any page file yet.
3. Decided (32): a named Information Officer, registered with the Information Regulator (HRD-114); the name is owed in DECISIONS.md section F.
4. Anthropic and SES process data outside South Africa: confirm the transfer basis wording with the adviser.
5. Affiliates are in v1 (decision 3). Their terms are a section of the Terms of Use (PG-MKT-LEGAL-25), so one consent record covers them; `/affiliates` links to that section's anchor. BE-AFF-72 versions the affiliate terms separately for affiliates who already joined.
6. Decided (8): no Meta pixel or CAPI in v1. Consent gates custom `track()` events only; cookieless Vercel Analytics runs without consent but switches off on decline or GPC. The banner heading is "Can we measure how the site is used?".
7. Decided (37): "Terms of Use".
