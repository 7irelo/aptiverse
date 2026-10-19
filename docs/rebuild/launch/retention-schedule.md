# Retention schedule

| | |
|---|---|
| ID range | `HRD-148` to `HRD-157` |
| Phase | 10 (purge jobs built with each module, verified here) |
| Depends on | `launch/popia.md` (HRD-35), `backend/` modules (scheduled messages), `infra/database.md`, `infra/storage.md`, `observability/telemetry.md` |
| Status | 0 done, 2 partial (S3 lifecycle rules and CloudWatch log retention exist in `infra/modules`), 0 unverified, 8 not started |

## Purpose

Keep personal information no longer than needed (POPIA section 14), keep financial and tax records as long as the law requires, and make every purge automatic and observable.

## Scope

### Schedule (proposed, to be approved by the Information Officer)

| Data category | Where | Retention | Action at end | Mechanism |
|---|---|---|---|---|
| Active account and profile | `identity` | while active | n/a | n/a |
| Closed or deleted account | all modules | 14-day grace, then delete | delete or anonymise | Wolverine scheduled message per deletion request |
| Inactive account (no sign in) | `identity` | 3 years | warn by email at 30 days, then delete | nightly scheduled job |
| Consent records | `identity.user_consents` | life of account plus 5 years | delete | nightly job |
| Payments, invoices, refunds | `billing` | 5 years from transaction (Tax Administration Act) | anonymise customer link | yearly job |
| Affiliate ledger, payouts, tax statements | `affiliates` | 5 years from tax year end | anonymise | yearly job |
| Paystack event inbox | `billing.paystack_events` | 18 months | delete payload, keep id | monthly job |
| AI tutor conversations | `ai` | 12 months, or until user deletes | delete | nightly job |
| AI usage rows (spend) | `ai` | 5 years (cost records), no content | keep, no personal content | n/a |
| Wellbeing diary and mood | `wellbeing` | until user deletes, or account deletion | delete | with account deletion |
| Practice attempts and results | `practice` | life of account | delete with account | with account deletion |
| Uploads (assessments) | S3 uploads bucket | life of account | delete current and noncurrent versions | job plus S3 lifecycle |
| Exports | S3 `exports/` | 7 days | expire | S3 lifecycle (exists) |
| Temp objects | S3 `tmp/` | per `tmp_expiry_days` | expire | S3 lifecycle (exists) |
| Audit trail (security events) | `admin` | 2 years | delete | monthly job |
| Support tickets and enquiries | `support` | 2 years after close | delete | monthly job |
| Application logs | CloudWatch, Grafana | dev 14 days, staging 30, prod 90 (CloudWatch); Grafana per plan | expire | log group retention (exists in `infra/modules/service`) |
| Sentry events | Sentry | 90 days | expire | Sentry setting |
| RDS automated backups | RDS | dev 7, prod 30 days | expire | RDS setting (exists) |
| Cross-region backup copies | DR region | 30 days | expire | see `launch/disaster-recovery.md` |
| Email suppression list | SES | indefinite (needed to honour opt-out) | n/a | SES |

## Tasks

- [ ] **HRD-148** Approve the schedule above with the Information Officer and publish it in `docs/compliance/retention-schedule.md` and in summary in the privacy notice
- [ ] **HRD-149** Purge job pattern in SharedKernel or per module: a Wolverine scheduled message that re-schedules itself, deletes in batches of at most 1000 rows, emits a metric `aptiverse.retention.purged{category}` and logs counts without personal data
- [ ] **HRD-150** Implement purge jobs for `identity` (inactive accounts with warning email, consent records)
- [ ] **HRD-151** Implement purge jobs for `ai` conversations and `billing.paystack_events` payloads
- [ ] **HRD-152** Implement anonymisation jobs for `billing` and `affiliates` at 5 years (keep amounts, drop personal links)
- [ ] **HRD-153** Implement purge jobs for `admin` audit trail and `support` tickets
- [ ] **HRD-154** Uploads purge: deleting a user removes all object versions; a monthly orphan sweep deletes objects with no DB row *(partial: S3 lifecycle already expires `exports/` and `tmp/` and noncurrent versions after `noncurrent_version_expiry_days`)*
- [ ] **HRD-155** Log retention values per env confirmed in Terraform (`log_retention_days` 14 dev, 30 staging, 90 prod in `envs/*/variables.tf`) and Grafana and Sentry retention set to match *(partial: Terraform defaults already match; Grafana and Sentry retention not set)*
- [ ] **HRD-156** Integration tests for each purge job: seeded rows older than the limit are removed, newer rows stay, retained categories are anonymised not deleted
- [ ] **HRD-157** Dashboard panel and alert: purge jobs that did not run in 48 hours alert (`launch/slo-and-alerts.md`)

## Verification

- Each job has an integration test and a metric visible in Grafana in staging.
- A quarterly check query shows no rows older than their limit in each category.

## Open questions

- Inactive account limit: 3 years proposed; is that right for a student who leaves after matric and may return for university?
- Decided (39): tax retention for invoices and affiliate payouts is set by the Information Officer and an accountant (periods pending, DECISIONS.md F); until then keep and never purge.
