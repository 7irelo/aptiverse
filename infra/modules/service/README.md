# service

One ECS Fargate (ARM64) service with its task definition, log group, IAM roles, security group and target tracking autoscaling. The same module runs the shared image in both roles:

- `role = "api"`: set `container_port` and `target_group_arn` to sit behind the ALB.
- `role = "worker"`: leave both null; no ingress is opened.

The container receives `APP_ROLE=<role>` plus `environment`. Secrets are passed as `secrets = { ENV_NAME = "<secret-arn>" }` (or `<arn>:<json-key>::`) and are resolved by ECS at task start, so values never pass through Terraform. The execution role is granted `GetSecretValue` on exactly those ARNs.

Behaviour:

- Deployment circuit breaker with automatic rollback; 100/200 percent rolling deploy.
- ECS Exec enabled (`aws ecs execute-command`), which replaces SSH.
- Read-only root filesystem with a writable `/tmp` volume.
- Autoscaling on CPU and memory between `min_capacity` and `max_capacity`; `desired_count` is only the initial value.
- Egress is limited to 443 anywhere (AWS and third-party APIs) and 5432 inside the VPC.

Migrations: set `create_migration_task = true` to also register a `<name>-migrate` task definition with the same image, secrets and roles, running `host/Aptiverse.Host.dll migrate` (override with `migration_command`). The deploy pipeline runs it with `aws ecs run-task` before rolling the service.
