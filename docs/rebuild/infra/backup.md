# Backup module (AWS Backup and cross-region copies)

| | |
|---|---|
| ID range | INF-103 to INF-110 |
| Phase | 1 (dev plan), 10 (prod plan, vault lock, restore testing) |
| Depends on | INF-05, INF-14, INF-121 (key strategy), RPO and RTO targets in `launch/disaster-recovery.md` |
| Code path | New: `infra/modules/backup/`, used by `envs/*/main.tf` |
| Status | Not started. Today recovery relies on RDS automated backups (PITR within the retention window), the final snapshot and S3 versioning, all in af-south-1 only. |

## Purpose

Meet the recovery point and recovery time objectives in `launch/disaster-recovery.md` with backups that are independent of the primary resources: an AWS Backup vault per env with immutable retention, a copy outside the primary failure domain, and automated restore testing. RDS PITR and S3 versioning protect against mistakes; this module protects against region loss, account compromise and deletion.

## Scope

- Resources: `aws_backup_vault` (KMS CMK), `aws_backup_vault_lock_configuration` (compliance mode in prod after a grace period), `aws_backup_plan` (rules: daily RDS snapshot retained 35 days, monthly retained 12 months in prod; S3 continuous backup with PITR for the uploads bucket), `aws_backup_selection` (tag-based: `backup = true`), copy actions to a vault in the DR region, `aws_backup_restore_testing_plan` and selection, IAM role for AWS Backup, `aws_backup_vault_notifications` to the alarm topic.
- Inputs: env name, retention per rule, DR region, vault lock flag, KMS keys for primary and DR vaults.
- Outputs: vault ARNs, plan id.

## Tasks

- [ ] **INF-103** Module skeleton with a KMS-encrypted vault, the AWS Backup service role, and tag-based selection; tag the RDS instance and uploads bucket with `backup = true` in their modules.
- [ ] **INF-104** RDS backup rules: daily at 23:00 SAST (outside the RDS automated backup window `00:00-01:00` UTC), retained 35 days, plus monthly retained 12 months in prod only. RPO from AWS Backup is 24 hours; PITR (5 minutes) remains the primary path inside the 7 or 30 day window.
- [ ] **INF-105** S3 backup for the uploads bucket: AWS Backup continuous backup (PITR up to 35 days) or S3 Replication to a backup bucket in the DR location with versioning and Object Lock. Pick one in the module README; replication gives the lower RPO for files.
- [ ] **INF-106** Cross-region copy: copy action from the af-south-1 vault to a vault in the DR region, retention 35 days. Decision 33: copies stay in af-south-1 until a POPIA opinion allows a second region; the copy action to eu-west-1 is built but applied only in dev with synthetic data until that opinion is recorded in `launch/popia.md` and the processing register.
- [ ] **INF-107** Vault lock: compliance-mode lock on the prod vault (min retention 7 days, max 366, changeable grace period 3 days) so backups cannot be deleted even by an admin or a compromised apply role. Governance mode in dev and staging.
- [ ] **INF-108** Restore testing: `aws_backup_restore_testing_plan` running monthly in staging (restore the latest RDS recovery point into a throwaway instance, validate with a script that counts rows in key tables, then delete), with results to the alarm topic. Feeds the quarterly drill in `launch/disaster-recovery.md`.
- [ ] **INF-109** Backup job alarms: vault notifications for `BACKUP_JOB_FAILED`, `COPY_JOB_FAILED` and `RESTORE_JOB_COMPLETED` to the notify topic, plus a CloudWatch alarm when no successful RDS backup job completed in 26 hours.
- [ ] **INF-110** Document the RPO and RTO each mechanism achieves in the module README (PITR 5 minutes RPO and about 30 to 60 minutes RTO for a restore to a new instance; cross-region copy 24 hours RPO and several hours RTO because the env stack must be re-created in the DR region) and link it from `launch/disaster-recovery.md`.

## Verification

- `terraform -chdir=infra/modules/backup init -backend=false && terraform validate`.
- `aws backup list-recovery-points-by-backup-vault --backup-vault-name aptiverse-<env>` shows a daily RDS point and S3 points.
- `aws backup describe-backup-vault --backup-vault-name aptiverse-prod --query Locked` returns `true` after INF-107; `delete-recovery-point` fails.
- In the DR region: `aws backup list-recovery-points-by-backup-vault --region <dr>` shows copied points after INF-106.
- `aws backup list-restore-jobs --by-restore-testing-plan-arn <arn>` shows a completed monthly restore with validation status `SUCCESSFUL`.

## Open questions

- Decided (33): no copy outside af-south-1 until a POPIA opinion allows it; meanwhile copies stay in-region, with a second af-south-1 account (GRW-10) as the isolation boundary.
- Decided (57): AWS Backup cost is checked against the AWS ceiling; amount pending, DECISIONS.md F.
