# Service module (ECS Fargate api, worker and migration task)

| | |
|---|---|
| ID range | INF-09 to INF-11, INF-45 to INF-53 |
| Phase | 1 (least privilege and deployment alarms by 10) |
| Depends on | INF-03, INF-08, INF-12, INF-16 |
| Code path | `infra/modules/service/`; cluster, image tag parameter and task role policy in `envs/*/main.tf` |
| Status | INF-09 to INF-11 and INF-49 done in code. Shared task role, deployment alarms, prod ECS Exec policy, worker health, graceful shutdown and dev scale-down are open. |

## Purpose

Run the single api image in three roles from one module: `api` (behind the ALB), `worker` (Wolverine listeners and scheduled messages) and a one-off `migrate` task definition the api pipeline runs before rolling the services.

## Scope

- Resources: `aws_cloudwatch_log_group` (`/ecs/<name>`, `log_retention_days`), execution role (`AmazonECSTaskExecutionRolePolicy` plus `secretsmanager:GetSecretValue` on the referenced secret ARNs only), task role (ECS Exec `ssmmessages:*` plus optional `task_role_policy_json`), task security group (ingress on the container port from the ALB security group only, egress 443 anywhere and 5432 to the VPC CIDR), `aws_ecs_task_definition.this` (Fargate, `awsvpc`, ARM64, `readonlyRootFilesystem`, `/tmp` volume, `initProcessEnabled`, awslogs), optional `aws_ecs_task_definition.migration` (`<name>-migrate`, command `host/Aptiverse.Host.dll migrate`, log prefix `migrate`), `aws_ecs_service` (`deployment_minimum_healthy_percent = 100`, `deployment_maximum_percent = 200`, circuit breaker with rollback, `enable_execute_command = true`, `health_check_grace_period_seconds` 60 when behind the ALB, `ignore_changes = [desired_count]`), `aws_appautoscaling_target` plus CPU (target 60) and memory (target 75) target tracking.
- Env stack wiring (`envs/*/main.tf`): `aws_ecs_cluster` with `containerInsights` (disabled dev, enabled staging and prod), `aws_ssm_parameter.image_tag` (`/aptiverse/<env>/api/image-tag`, `ignore_changes`), `data.aws_iam_policy_document.app` (S3 uploads read, write, delete, list; `ses:SendEmail` on the identity and configuration set) attached to both api and worker, `app_environment` and `app_secrets`.
- Sizes: api 256 CPU / 512 MiB dev, 512 / 1024 staging and prod; api count 1 dev and staging, 2 prod (max 2, 3, 6); worker 1 dev and staging, 2 prod.
- Default commands: `host/Aptiverse.Host.dll`, `worker/Aptiverse.Worker.dll`, `host/Aptiverse.Host.dll migrate` (`api/src/Aptiverse.Host/Infrastructure/MigrateCommand.cs` exists and runs module migrators plus Wolverine `SetupResources`).

## Tasks

- [x] **INF-09** `modules/service`: ECS cluster, task definition, service, log group, autoscaling. *(module in `infra/modules/service/main.tf`, cluster in `envs/*/main.tf`)*
- [x] **INF-10** `modules/service`: deployment circuit breaker with rollback. *(`deployment_circuit_breaker { enable = true, rollback = true }`)*
- [x] **INF-11** `modules/service`: ECS Exec enabled (replaces SSH). *(`enable_execute_command = true` plus the `ecs-exec` task role policy)*
- [ ] **INF-45** Least-privilege task roles per role: split `data.aws_iam_policy_document.app` into `api` (S3 `PutObject` and `GetObject` under `uploads/` and `exports/` only via presign, `ses:SendEmail`), `worker` (S3 read and delete for purge jobs, `ses:SendEmail`) and `migrate` (no S3, no SES). Give the migration task definition its own task role instead of reusing the api role. Prove with IAM Access Analyzer policy validation in CI (`aws accessanalyzer validate-policy`).
- [ ] **INF-46** Deploy role pass-role scope: add the worker and migration task and execution role ARNs to `passable_role_arns` in `envs/*/main.tf` (today only the api roles are passable), so the api pipeline can run the migration task with its own role after INF-45.
- [ ] **INF-47** Deployment alarms as a second rollback trigger: set `alarms { alarm_names = [...], enable = true, rollback = true }` on `aws_ecs_service` using the ALB 5xx and unhealthy-target alarms from `monitoring.md`, so a release that starts but serves errors rolls back automatically, not only one that fails to start.
- [ ] **INF-48** ECS Exec policy for prod: add `enable_execute_command` as a module input (default true), set false in prod, and when enabled log sessions to a KMS-encrypted CloudWatch log group via the cluster `execute_command_configuration` (`logging = OVERRIDE`). Document the break-glass path (temporary apply with true, reviewed PR, revert) in `infra/README.md`.
- [x] **INF-49** Align the configuration contract between infra and the api. Today infra injects `Database__Host`, `Database__Port`, `Database__Name`, `Database__Username`, `Database__Password`, `Jwt__SigningKey`, `App__WebOrigins`, `App__ApiBaseUrl`, `Storage__*`, `Email__*`, while the api reads `ConnectionStrings:Aptiverse` (`DatabaseOptions`), `Auth:Issuer` and `Auth:Audience`, `Cors:AllowedOrigins` and `ForwardedHeaders:KnownNetworks`. Agree one set of keys with the api owner, change `app_environment` and `app_secrets` accordingly (including `ForwardedHeaders__KnownNetworks` set to the VPC CIDR), and add a table of every key, its source (env var or secret ARN) and its consumer to `infra/README.md`. A missing required key must fail the boot (`ValidateOnStart`). (done: env names now match the api keys (`Auth__*`, `Cors__AllowedOrigins__<n>`, `ForwardedHeaders__KnownNetworks__0` = VPC CIDR); the api composes its connection string from `Database__*` because ECS cannot build one from secret JSON keys; key table in `infra/README.md`; verified by booting the api in Production with those variables)
- [ ] **INF-50** Worker health: the worker has no load balancer health check. Add a container `healthCheck` that works in the chiselled image (no shell: run `dotnet worker/Aptiverse.Worker.dll healthcheck` or expose `/health/live` on a local port and use a tiny probe binary), and alarm when `RunningTaskCount` is below desired for 5 minutes (alarm in `monitoring.md`).
- [ ] **INF-51** Graceful shutdown: set `stopTimeout` (for example 60 seconds) in the container definition so in-flight requests and Wolverine envelopes drain on SIGTERM, align ALB `deregistration_delay` (30 today) with it, and document the expectation for the api in the config contract.
- [ ] **INF-52** Dev cost control: scheduled scaling actions (`aws_appautoscaling_scheduled_action`) that set dev api and worker to 0 from 20:00 to 06:00 SAST on weekdays and all weekend, behind a variable default false in staging and prod. Note the RDS cost remains.
- [ ] **INF-53** Tag and propagate: confirm `propagate_tags = "SERVICE"` and managed tags are on (done) and add `cost_center`, `environment` and `service` tags through the provider `default_tags` in `envs/*/providers.tf` so Cost Explorer can split spend by role.

## Verification

- `terraform -chdir=infra/modules/service init -backend=false && terraform validate`.
- `aws ecs describe-services --cluster aptiverse-<env> --services aptiverse-<env>-api --query 'services[0].deploymentConfiguration'` shows the circuit breaker (and alarms after INF-47).
- `aws ecs describe-task-definition --task-definition aptiverse-<env>-api --query 'taskDefinition.[runtimePlatform,containerDefinitions[0].readonlyRootFilesystem]'` shows `ARM64` and `true`.
- `aws ecs run-task --task-definition aptiverse-<env>-api-migrate ...` exits 0 and its log stream under the `migrate` prefix shows "Migrating" lines.
- Deliberately ship an image whose `/health/ready` returns 503 to dev: the deployment shows `rolloutState = FAILED` and the previous task definition keeps serving (CI-15).
- After INF-45: `aws iam simulate-principal-policy` for the worker role denies `s3:PutObject`; for the migrate role denies `ses:SendEmail`.

## Open questions

- Does the worker need any inbound port at all, or is a command-based health check enough?
- Should prod keep ECS Exec available behind a variable flip, or rely only on logs and traces plus the SSM port forward to RDS (which itself goes through an api task's ECS Exec channel today, see `env-dev.md` INF-21)? Disabling Exec in prod also removes the DB port-forward path: a dedicated SSM-managed jump task may be needed.
