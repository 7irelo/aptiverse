# Data subject requests

| | |
|---|---|
| ID range | `HRD-139` to `HRD-147` |
| Phase | 2 (settings deletion request), 9 (admin tooling), 10 (verification) |
| Depends on | `backend/identity.md` (deletion request, export), `pages/` settings and admin users pages, `launch/retention-schedule.md`, `launch/popia.md` |
| Status | 0 done, 0 partial, 0 unverified, 9 not started |

## Purpose

Handle POPIA rights (access, correction, deletion, objection, data portability as export) and PAIA access requests reliably, within time, with identity checks, and with a log that proves it.

## Scope

- Request types: access (what we hold), correction, deletion, objection to processing (including marketing), export (machine-readable JSON plus uploaded files).
- Channels: in-app (Settings: download my data, delete my account), email to the Information Officer address, PAIA form.
- SLA: acknowledge within 5 working days, complete within 30 days (PAIA section 25 reference period), extension once by up to 30 days with written reasons.
- Identity verification: signed-in requests are verified by the session plus a fresh password or email code; email requests need a reply from the account email plus one more factor; requests for a minor come from the linked parent or the student.
- Log: `admin` module table or `docs/compliance/dsr-log.md` (decide), with request id, type, received, verified, due, completed, outcome.

## Tasks

- [ ] **HRD-139** Written DSR procedure in `docs/compliance/dsr-procedure.md`: intake, verification rules above, SLA, extension, refusal grounds (for example records we must keep for tax)
- [ ] **HRD-140** Export: verify the in-app export produces JSON for every module holding the user's data (cross-check against the processing register) plus a zip of uploads, delivered by short-lived presigned link, and that the job is audited
- [ ] **HRD-141** Deletion: verify the in-app deletion request runs a grace period (for example 14 days), then deletes or anonymises per module, keeps rows the retention schedule says must stay (invoices, affiliate tax records, consent records) in minimised form, and removes uploads from S3 including noncurrent versions
- [ ] **HRD-142** Deletion propagation to operators: Paystack customer (retain transactions as required), Sentry user data, Anthropic (no stored data if zero retention), email suppression lists; checklist per operator
- [ ] **HRD-143** Correction: user-editable fields in Settings cover profile data; admin correction for the rest is audited
- [ ] **HRD-144** Objection: marketing opt-out in notification preferences and analytics consent withdrawal, both effective immediately and tested
- [ ] **HRD-145** Admin DSR view: list open requests with due dates, overdue highlight, mark completed with evidence
- [ ] **HRD-146** Backups note: deleted data persists in backups until they expire (RDS 30 days, cross-region copies per `launch/disaster-recovery.md`); document that a restore must re-apply deletions from the DSR log
- [ ] **HRD-147** Test pass: run one access, one export, one deletion and one objection request in staging end to end, record timings in the log

## Verification

- HRD-147 test results logged with all four completed inside the SLA.
- A deleted staging user has no rows in any schema except the retained minimised records, and no objects in the uploads bucket.

## Open questions

- Decided (38): deletion has a 14 day cooling-off period. Still open: can a parent delete a minor's account without the student's agreement?
- DSR log in the database (admin module) or as a private document?
