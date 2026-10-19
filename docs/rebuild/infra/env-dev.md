# Environment: dev

| | |
|---|---|
| ID range | INF-02, INF-21, INF-22, INF-124 to INF-128 |
| Phase | 1 |
| Depends on | INF-01, INF-26, `env-global.md` applied (INF-147), all module files in this folder |
| Code path | `infra/envs/dev/` (`main.tf` identical to staging and prod, `variables.tf` defaults are the dev settings, `backend.hcl`, `providers.tf`, `versions.tf`, `outputs.tf`, `terraform.tfvars.example`) |
| Status | INF-02 and INF-21 done in code and docs. The first apply, first image, secret values and smoke test are unverified. |

## Purpose

The first full environment: every module composed at small sizes, NAT off (tasks in public subnets admitted only from the ALB), fed by every merge to main. It proves the walking skeleton (Phase 1 exit gate: FAQ page served from ECS through the generated client from RDS, migration applied by the pipeline).

## Scope

- Stack: network, ecr, secrets, storage, database, alb, acm_dns, api_dns, ECS cluster, image tag SSM parameter, api and worker services (plus migration task), github_oidc roles, monitoring.
- Dev defaults: `environment = dev`, `api_hostname = api.dev`, `web_origins = [https://dev.aptiverse.co.za, http://localhost:3000]`, `aspnetcore_environment = Dev`, `vpc_cidr = 10.20.0.0/16`, NAT off, ALB deletion protection off, `db.t4g.micro`, 20 to 50 GiB, single AZ, 7 day backups, Container Insights disabled, api 256/512 count 1 (max 2), worker 256/512 count 1, log retention 14 days, `allow_main_branch_deploys = true`, `alarm_emails` empty unless set in `terraform.tfvars`.
- State: `v2/dev/terraform.tfstate`, S3 native lock.
- Outputs: `api_url`, `alb_dns_name`, `ecr_repository_url`, `image_tag_parameter`, `ecs_cluster_name`, `api_service_name`, `worker_service_name`, `migration_task_definition_family`, `migration_network_configuration`, `db_address`, `db_master_secret_arn`, `uploads_bucket`, `app_secret_names`, `github_role_arns`, `alarm_topic_arn`.

## Tasks

- [x] **INF-02** `envs/{dev,staging,prod}` skeleton with `backend.hcl` and `terraform.tfvars`. *(each env has `backend.hcl` and `terraform.tfvars.example`; the real `terraform.tfvars` is git-ignored by design; CI `fmt` job enforces identical `main.tf` and `outputs.tf`)*
- [x] **INF-21** SSM port-forward runbook for human DB access (retires the bastion). *(`infra/README.md` "Database access (SSM port forward, no SSH)", local port 15432 through an api task's ECS Exec channel)*
- [ ] **INF-22** Compose `dev` env from modules and apply. *(unverified: composition is done in `infra/envs/dev/main.tf`; the apply is AWS state)*
- [ ] **INF-124** First image and tag: push a first api image to the dev repository (after INF-40 fixes the name), write its sha to `/aptiverse/dev/api/image-tag`, and apply again so the task definitions reference it. *(unverified: AWS state)*
- [ ] **INF-125** Dev secret values populated per `secrets.md` (INF-64), with test-mode third-party keys only. *(unverified: AWS state)*
- [ ] **INF-126** Dev smoke check script `infra/scripts/smoke.sh <env>`: `/health/ready` through Cloudflare returns 200, the migration task's last run exited 0, the api task's database session uses TLS (INF-37), and one SES send to the Mailpit-equivalent verified test address succeeds. Used by CI-14 in `ci/api-pipeline.md`.
- [x] **INF-127** Dev log retention is 14 days for the api and worker log groups. *(`log_retention_days` default 14 in `infra/envs/dev/variables.tf`)*
- [ ] **INF-128** Reconcile the SSM port-forward path with ECS Exec policy changes (INF-48): dev keeps it through an api task; document the prod alternative once Exec is off there.

## Verification

- `terraform -chdir=infra/envs/dev init -backend=false && terraform validate` (CI `validate` matrix).
- `terraform -chdir=infra/envs/dev init -backend-config=backend.hcl && terraform plan` shows no changes after the first apply.
- `cmp infra/envs/dev/main.tf infra/envs/prod/main.tf` returns nothing.
- `aws ecs describe-services --cluster aptiverse-dev --services aptiverse-dev-api aptiverse-dev-worker --query 'services[].[serviceName,runningCount,desiredCount]'` shows 1 of 1 each.
- `curl -s https://api.dev.aptiverse.co.za/health/ready` returns 200; the FAQ page on `dev.aptiverse.co.za` lists FAQs from RDS.

## Open questions

- `api.dev` versus `api-dev` (INF-83) must be settled before the first apply, or the ACM and DNS records will be recreated.
- Should dev scale to zero overnight from day one (INF-52) or only once the walking skeleton is proven?
