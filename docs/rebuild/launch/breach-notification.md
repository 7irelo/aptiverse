# Breach notification procedure

| | |
|---|---|
| ID range | `HRD-132` to `HRD-138` |
| Phase | 9 (procedure), 10 (tabletop) |
| Depends on | `launch/popia.md` (HRD-114 Information Officer), `launch/incident-management.md`, `launch/runbooks.md` (HRD-73 credential leak) |
| Status | 0 done, 0 partial, 0 unverified, 7 not started |

## Purpose

POPIA section 22 requires notifying the Information Regulator and affected data subjects "as soon as reasonably possible" after discovering that personal information was accessed or acquired by an unauthorised person. This procedure makes that fast, consistent and evidenced.

## Scope

- Internal targets (stricter than the law's wording, so the "reasonable" test is met):
  - Triage and initial assessment within 24 hours of discovery.
  - Decision to notify and Regulator notice within 72 hours of discovery, unless law enforcement asks for a delay in writing.
  - Data subject notice within 72 hours, or as soon as the affected set is known.
- Channels: Regulator breach form (online portal or the prescribed form by email), email to affected users through SES, in-app banner, parent notification for minors.
- Evidence: `docs/compliance/breach-log.md` (api repo, private): every suspected breach, even ones judged not notifiable, with reasoning.

### Decision tree

1. Was personal information involved? No: handle as a security incident only, log it. Yes: continue.
2. Was it accessed or acquired by an unauthorised person, or is that reasonably believed? No (for example encrypted laptop lost with full-disk encryption and no key exposure): log the reasoning. Yes: notifiable.
3. Identify affected data subjects and categories; flag minors, special personal information, credentials, payment metadata.
4. Notify the Regulator and data subjects with the content required by section 22(5): description of consequences, measures taken, recommendations to the subject, identity of the unauthorised person if known.

## Tasks

- [ ] **HRD-132** Write `docs/compliance/breach-procedure.md` with the targets, decision tree and roles (Information Officer decides, incident lead gathers facts, comms lead sends notices)
- [ ] **HRD-133** Regulator notice template with every section 22(5) field and a worked example
- [ ] **HRD-134** Data subject notice templates: adult student, parent of a minor, affiliate; plain language, what happened, what we did, what you should do (for example reset password), contact
- [ ] **HRD-135** `breach-log.md` structure: discovery time, reporter, systems, data categories, subjects count, decision, notification times, evidence links
- [ ] **HRD-136** Query pack to identify affected users fast: by time window and table from audit trail and access logs (CloudTrail data events for S3 uploads, ALB logs, app audit log), stored as tested SQL in `docs/compliance/breach-queries.sql`
- [ ] **HRD-137** Link SEV1 incidents involving personal data to this procedure in `launch/incident-management.md` so the clock starts at discovery automatically
- [ ] **HRD-138** Tabletop exercise: leaked admin token scenario, timed against the 24 and 72 hour targets, findings recorded *(human action)*

## Verification

- The tabletop produces a completed Regulator notice draft and data subject notice within the 72-hour target on paper.
- The query pack returns affected users for a seeded staging scenario.

## Open questions

- Who is the deputy decision maker when the Information Officer is unreachable?
- Do Paystack or other operators' contracts require us to notify them, and within what time?
