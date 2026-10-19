# POPIA compliance

| | |
|---|---|
| ID range | `HRD-30` to `HRD-35`, `HRD-114` to `HRD-131` |
| Phase | 10 (register and agreements start in Phase 0 and 2) |
| Depends on | `pages/marketing/legal.md` (PG-MKT-LEGAL-02), `backend/identity.md` (consents, deletion requests), `backend/family.md` (parent consent), `launch/breach-notification.md`, `launch/data-subject-requests.md`, `launch/retention-schedule.md`; decisions 7, 8, 30, 31, 32 (DECISIONS.md) |
| Status | 0 done, 0 partial, 0 unverified, 24 not started |

## Purpose

Aptiverse processes personal information of South African learners, most of them minors, plus their parents. POPIA applies in full, including the special rules for children's personal information (section 34 to 35) and cross-border transfers (section 72). This file turns those duties into checkable work.

## Scope

- Artefacts (api repo `docs/compliance/` unless noted):
  - `processing-register.md`: record of processing activities.
  - `operators.md`: operator (processor) list with agreement status and transfer basis.
  - `dpia-ai-tutor.md`, `dpia-wellbeing.md`: data protection impact assessments.
  - `paia-manual.md`: PAIA section 51 manual (also published on the marketing site).
  - Privacy notice and terms (web, PG-MKT-LEGAL), versioned, version keys in `Legal:PrivacyVersion` and `Legal:TermsVersion`.
- Systems: `identity.user_consents`, Family module consent, analytics consent (`lib/analytics/consent.ts` port, FE-63), deletion and export flows.

## Tasks

### Governance
- [ ] **HRD-114** Appoint the Information Officer (and a deputy) and register them on the Information Regulator portal (decision 32; the name is owed in DECISIONS.md section F) *(human action; record the registration reference in `processing-register.md`)*
- [ ] **HRD-115** Publish the PAIA manual (section 51) on the marketing site footer and in `docs/compliance/paia-manual.md`
- [ ] **HRD-116** Compliance calendar: annual review of the register, operators and DPIAs; Information Officer annual report items

### Processing register
- [ ] **HRD-31** Data processing inventory (umbrella, delivered by the next three tasks)
- [ ] **HRD-117** `processing-register.md` per module: data categories, purpose, lawful basis (consent, contract, legitimate interest, legal obligation), data subjects (student minor, student adult, parent, affiliate, admin), retention reference, operators involved
- [ ] **HRD-118** Special personal information review: wellbeing diary and mood (health adjacent), any disability or learning-support fields; record the section 27 authorisation basis (explicit consent) or remove the field
- [ ] **HRD-119** Map every register row to its tables in the new schemas (cross-check with the ARC-22 entity inventory) so no table holds personal data that is not in the register

### Operators and cross-border transfers
- [ ] **HRD-120** `operators.md`: AWS (af-south-1 and SES eu-west-1), Vercel (cpt1 functions, global edge), Anthropic (US), Paystack, Sentry, Grafana Cloud, Zoho (inbound mail), Cloudflare (Meta is not an operator in v1: no pixel or CAPI, decision 8); for each: data shared, region, agreement (DPA) link, date signed
- [ ] **HRD-121** Cross-border transfer assessment (section 72) for SES eu-west-1, Anthropic US, Sentry and Grafana regions, Cloudflare edge: basis (adequate law, binding agreement, or consent) and minimisation applied (for example, no student names in Anthropic prompts beyond what tutoring needs)
- [ ] **HRD-122** Sentry and Grafana region choice: EU or US ingest recorded; Sentry `SendDefaultPii=false` in api (done in code) and the equivalent in web verified
- [ ] **HRD-123** Sign or accept the DPA for each operator *(human action; status column in `operators.md`)*

### Children and consent
- [ ] **HRD-32** Parent consent for under-18s verified end to end (umbrella)
- [ ] **HRD-124** Define the age rule: date of birth captured at onboarding (decision 30; parents confirm they are 18 or older); under 18 requires a competent person's consent before processing beyond account creation; document exactly what is allowed in the pending state
- [ ] **HRD-125** E2E test: a 15-year-old registers, the parent receives the consent request, the student cannot use AI tutor or wellbeing until consent is recorded, consent row has version, timestamp, source, IP and user agent
- [ ] **HRD-126** Consent withdrawal: parent or adult student withdraws, processing stops, and the effect is tested
- [ ] **HRD-127** Privacy notice versions linked to consent rows: changing `Legal:PrivacyVersion` triggers re-consent on next sign in, tested
- [ ] **HRD-33** Analytics reviewed for minors: Vercel Analytics and Speed Insights are cookieless and identifier-free (record that, with FE-158); custom `track()` events fire only after analytics consent (FE-63, FE-160); no advertising tag, pixel or conversion API is present in v1 (decision 8, guarded by FE-167); Playwright proves no third-party marketing request with the banner accepted or declined, signed out and as an under-18 student

### DPIAs
- [ ] **HRD-128** DPIA for the AI tutor: data sent to Anthropic, retention at Anthropic (zero data retention option), prompt content rules, student context built server-side, human review of eval samples
- [ ] **HRD-129** DPIA for the wellbeing diary and mood: private by default, sharing to parents explicit and revocable, encryption at rest, admin access audited, no NLP in v1 (decision 7)

### Rights, retention, breaches
- [ ] **HRD-30** Privacy policy updated (PG-MKT-LEGAL-02) to match the register, operators and transfers above, reviewed by a person with legal training
- [ ] **HRD-34** Data export and deletion flows verified (detailed in `launch/data-subject-requests.md`)
- [ ] **HRD-35** Retention policy (including affiliate tax records) and scheduled purge jobs (detailed in `launch/retention-schedule.md`)
- [ ] **HRD-130** Breach notification procedure adopted (detailed in `launch/breach-notification.md`)
- [ ] **HRD-131** Staff and contractor confidentiality: signed confidentiality terms for anyone with prod access; access list reviewed quarterly

## Verification

- Every table with personal data maps to a register row (HRD-119 check run against the final schema).
- Every operator row has a signed DPA date before go-live.
- The minor consent E2E test (HRD-125) and the analytics consent test (HRD-33) run in CI.
- Information Regulator registration reference is recorded.

## Open questions

- Is the parent consent model "consent before any processing" or "account exists, features gated until consent"? Affects onboarding (`pages/onboarding/student.md`).
- Anthropic zero data retention: available on our plan?
- Does Aptiverse need a formal prior authorisation from the Regulator for any processing (section 57), for example if wellbeing data counts as special personal information processed for profiling?
