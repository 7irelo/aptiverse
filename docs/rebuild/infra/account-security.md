# Account security baseline (CloudTrail, GuardDuty, Security Hub, Config, KMS)

| | |
|---|---|
| ID range | INF-111 to INF-123 |
| Phase | 1 (CloudTrail, GuardDuty, key strategy before the first env apply), 10 (Security Hub and Config findings clean) |
| Depends on | INF-01, SEC-01, security baseline policy in `phase-0/security-baseline.md` |
| Code path | New: `infra/modules/account-security/`, used by `envs/global` (account-wide, both af-south-1 and eu-west-1 providers) |
| Status | Not started. None of these account-level controls are in code; their console state is unknown. |

## Purpose

Account-wide detective and preventive controls every environment relies on: an immutable audit trail, threat detection, posture checks against AWS Foundational Security Best Practices and CIS, IAM hygiene for humans, and one documented key strategy that the database, storage and secrets modules follow.

## Scope

- Resources: `aws_cloudtrail` (multi-region, management events, log file validation, KMS), trail bucket (Object Lock, TLS only, lifecycle), `aws_cloudwatch_log_metric_filter` plus alarms (CIS 3.x set), `aws_guardduty_detector` (af-south-1 and eu-west-1) with S3 protection, RDS protection, runtime monitoring for ECS Fargate and Malware Protection for S3, `aws_securityhub_account` plus standards subscriptions, `aws_config_configuration_recorder`, delivery channel and conformance pack, `aws_accessanalyzer_analyzer`, `aws_s3_account_public_access_block`, `aws_kms_key` per env (if INF-121 chooses CMKs), EventBridge rules sending HIGH findings to the page topic.
- Inputs: regions, retention, alarm topic ARNs, standards to enable.
- Outputs: trail ARN, KMS key ARNs per env and purpose.

## Tasks

- [ ] **INF-111** CloudTrail: one multi-region trail with log file validation, KMS encryption, delivery to a dedicated bucket and to a CloudWatch log group (retention 90 days); management events read and write.
- [ ] **INF-112** Trail bucket: Object Lock in compliance mode (1 year), versioning, TLS only, public access blocked, lifecycle to Glacier after 90 days, and no read access for `infra-plan` (INF-79).
- [ ] **INF-113** CIS metric filters and alarms on the trail log group: root account use, console sign-in without MFA, IAM policy changes, CloudTrail config changes, KMS key disable or deletion, security group changes, network ACL and route table changes, and any `secretsmanager:GetSecretValue` by a human principal in prod.
- [ ] **INF-114** GuardDuty in af-south-1 and eu-west-1 with S3 protection, RDS login activity and runtime monitoring for ECS Fargate; EventBridge rule for findings with severity 7 or above to the page topic, lower to notify.
- [ ] **INF-115** GuardDuty Malware Protection for S3 on the uploads buckets, tagging infected objects so the api refuses to serve them (coordinate with the uploads slice in the api).
- [ ] **INF-116** Security Hub with AWS Foundational Security Best Practices and CIS AWS Foundations v3 standards; triage until no CRITICAL or HIGH failed controls remain before launch (feeds HRD-21), and suppress accepted findings with a reason, mirroring `infra/.trivyignore`.
- [ ] **INF-117** AWS Config recorder for all supported resources plus the "Operational Best Practices for CIS" conformance pack; retention 1 year.
- [ ] **INF-118** IAM Access Analyzer (account) for external access findings and unused access, findings to notify.
- [ ] **INF-119** Root account: MFA (hardware key), no access keys, alternate contacts (billing, operations, security) set, root email on a shared mailbox. Recorded as a checklist with dates. *(unverified: AWS console)*
- [ ] **INF-120** Human access through IAM Identity Center only: permission sets `ReadOnly`, `Developer` (no secret reads in prod), `BreakGlassAdmin` (MFA, session 1 hour, alarmed on use); no IAM users with console passwords or access keys. *(unverified: AWS console)*
- [ ] **INF-121** Key strategy: decide AWS managed keys versus customer managed keys per env and purpose (`rds`, `s3-uploads`, `secrets`, `logs`, `backup`), write the decision with cost (about $1 per key per month) and the GRW-10 cross-account reason into this module's README, and expose the key ARNs as outputs that `database.md` (INF-36), `storage.md` (INF-59), `secrets.md` (INF-66) and `backup.md` consume. Key rotation on for every CMK.
- [ ] **INF-122** Account-level S3 public access block (all four flags) so no future bucket can be made public by mistake.
- [ ] **INF-123** Encryption in transit evidence: a short checklist in the module README proving TLS on every hop (Cloudflare to ALB TLS 1.3 policy, ALB to tasks inside the VPC over HTTP on 8080 as an accepted risk or re-encrypt decision, tasks to RDS with `rds.force_ssl`, tasks to AWS APIs over HTTPS endpoints, SES `tls_policy = REQUIRE`, S3 TLS-only policies). Record the accepted risk for ALB to task plaintext inside the VPC or add end-to-end TLS.

## Verification

- `terraform -chdir=infra/modules/account-security init -backend=false && terraform validate`.
- `aws cloudtrail get-trail-status --name aptiverse` shows `IsLogging: true`; `aws cloudtrail validate-logs` passes for the last 24 hours.
- `aws guardduty list-detectors --region af-south-1` and `--region eu-west-1` each return one detector; a sample finding (`create-sample-findings`) reaches the page topic.
- `aws securityhub get-enabled-standards` lists FSBP and CIS; `get-findings` filtered to failed CRITICAL and HIGH returns zero before launch.
- `aws configservice describe-configuration-recorder-status` shows recording; `aws s3control get-public-access-block --account-id <acct>` shows four true flags.

## Open questions

- Should these live in `envs/global` (one account today) or in a future management account when AWS Organizations arrives (GRW-10)? Build the module so it can move.
- Decided (57): budget ceilings are pending (DECISIONS.md F); until they are set, follow the recommendation: CloudTrail and GuardDuty at once, Security Hub and Config before Phase 10, revisited against the ceiling once known.
