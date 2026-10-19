# Environment: prod

| | |
|---|---|
| ID range | INF-135 to INF-146 |
| Phase | 10 (compose and apply under HRD-60), 11 (cutover) |
| Depends on | INF-23, INF-30, INF-45, INF-47, INF-48, INF-74, INF-75, `backup.md`, `account-security.md`, `edge-security.md`; HRD-60 and HRD-61 in `launch/prod-readiness.md` |
| Code path | `infra/envs/prod/` (same `main.tf`; prod defaults in `variables.tf`) |
| Status | Prod defaults are in code (NAT, Multi-AZ, 30 day backups, 2 api tasks, deletion protection, 90 day logs). The apply, GitHub gate, DR, hardening prerequisites and launch checks are not started or unverified. |

## Purpose

The production stack for `aptiverse.co.za`: private subnets behind NAT, Multi-AZ RDS with 30 days of PITR, at least two api tasks across AZs, deletion protection on the ALB and RDS, applied only from CI after a reviewer approves the `prod` environment. HRD-60 (owned in `launch/prod-readiness.md`) is the umbrella; these are its Terraform-level tasks.

## Scope

- Prod defaults: `api_hostname = api`, `web_origins = [https://aptiverse.co.za, https://www.aptiverse.co.za]` (decision 64: product on the apex, no `app.`), `aspnetcore_environment = Production`, `vpc_cidr = 10.40.0.0/16`, NAT on, ALB deletion protection on, `db.t4g.medium`, 50 to 200 GiB, Multi-AZ, 30 day backups, Container Insights enabled, api 512/1024 count 2 (min 2, max 6), worker 512/1024 count 2, log retention 90 days, `allow_main_branch_deploys = false`.
- State: `v2/prod/terraform.tfstate`.

## Tasks

- [x] **INF-135** Prod variable defaults encode NAT, private task subnets, Multi-AZ, 30 day backups, two api tasks, ALB deletion protection and 90 day logs. *(`infra/envs/prod/variables.tf`; private subnets follow from `enable_nat_gateway` in `envs/*/main.tf`)*
- [ ] **INF-136** First prod apply from CI through the `prod` environment after the reviewed plan, as the Terraform step of HRD-60. *(unverified: AWS state)*
- [ ] **INF-137** NAT per AZ decision for prod (module option in INF-30): one NAT is a single point of failure for egress to Paystack and Anthropic. Record the decision and cost; set `nat_gateway_per_az` accordingly.
- [ ] **INF-138** Verify every data protection flag in the prod plan before apply: RDS `deletion_protection`, `skip_final_snapshot = false`, `storage_encrypted`, `backup_retention_period = 30`, `multi_az`; ALB `enable_deletion_protection`; S3 public access block and versioning. A CI check (conftest or a `terraform show -json` jq script) fails the prod plan if any is weakened (`infra/CLAUDE.md` rule 7).
- [ ] **INF-139** GitHub `prod` environment: manual approval by the owner (decision 62: no required second reviewer while there is one developer; add one when a second maintainer joins), deployment branches limited to `main` and release tags, wait timer optional. *(unverified: GitHub settings; shared with INF-76 and REPO-02)*
- [ ] **INF-140** Prod web origins: confirm which hostnames serve the app (apex, `www`, `app`) per the decision in `dns.md`, and trim `web_origins` (CORS and S3 CORS) to exactly those.
- [ ] **INF-141** Prod hardening prerequisites applied: ECS Exec off (INF-48), split task roles (INF-45), deployment alarms (INF-47), scoped apply role and permissions boundary (INF-74, INF-75), least-privilege DB roles (INF-38).
- [ ] **INF-142** Spread and capacity: confirm the api service spreads across both AZs (Fargate spreads by default across the given subnets), min 2 api and 2 worker tasks, and autoscaling limits reviewed after the load test (HRD-13).
- [ ] **INF-143** DR enabled in prod: backup plan, vault lock and (if allowed) cross-region copy from `backup.md`; RDS and S3 tagged `backup = true`.
- [ ] **INF-144** Cost commitments: after one month of steady prod usage, decide on an RDS reserved instance and a Compute Savings Plan for Fargate, with the numbers in the PR. *(depends on decision 57; ceilings pending, DECISIONS.md F)*
- [ ] **INF-145** Production readiness checklist for infra (feeds HRD-63): plan clean, all alarms green and routed, budgets live, GuardDuty and Security Hub clean of HIGH, restore drill passed, edge rules enforced, Full (strict) on the zone.
- [ ] **INF-146** Separate prod account readiness (GRW-10): confirm nothing in the prod stack hard-codes the account id or shared resources beyond `envs/global` outputs, so moving prod to its own account is a new state and an apply, not a rewrite.

## Verification

- `terraform -chdir=infra/envs/prod init -backend=false && terraform validate`.
- Prod plan JSON check from INF-138 passes in CI.
- `aws rds describe-db-instances --db-instance-identifier aptiverse-prod --query 'DBInstances[0].[MultiAZ,BackupRetentionPeriod,DeletionProtection]'` returns `true, 30, true`.
- `aws ecs describe-services --cluster aptiverse-prod --services aptiverse-prod-api --query 'services[0].networkConfiguration.awsvpcConfiguration.assignPublicIp'` returns `DISABLED`.
- Assuming `aptiverse-prod-gha-infra-apply` without an approved `prod` environment run fails.

## Open questions

- Start prod on `db.t4g.medium` or a non-burstable class (see `database.md`)?
- Decided (62): no second reviewer; the owner manually approves prod applies in the `prod` environment. A second reviewer is added when a second maintainer joins.
