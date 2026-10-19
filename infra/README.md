# aptiverse-labs/infra

Infrastructure for Aptiverse v2: Terraform for AWS (af-south-1, SES in eu-west-1) and Cloudflare, plus the local development stack. This repo is the single source of deploy truth: task definitions, services and compose files live here and nowhere else.

## Layout

```
bootstrap/          state bucket only (local state; adopts the existing bucket)
envs/
  global/           SES identity (eu-west-1) + its DNS, GitHub OIDC provider
  dev/              full stack, small sizes, NAT off
  staging/          same main.tf, staging sizes
  prod/             same main.tf, NAT on, Multi-AZ RDS, 30 day backups, 2+ api tasks
modules/
  network/  database/  ecr/  service/  alb/  storage/
  secrets/  ses/  github-oidc/  monitoring/  dns/
local/              docker compose for local dev (Postgres 17, Mailpit, MinIO)
docs/runbooks/      restore, rotate, roll back
.github/workflows/  ci.yml (checks, plan, apply) and apply.yml (reusable)
```

`envs/dev`, `envs/staging` and `envs/prod` share an identical `main.tf` and `outputs.tf` (CI enforces it). Environment differences are the variable defaults in each `variables.tf`; an optional git-ignored `terraform.tfvars` (see `terraform.tfvars.example`) overrides them. Every root stack uses remote state in `aptiverse-terraform-state-483527586058` under `v2/<stack>/terraform.tfstate` with S3 native locking (`use_lockfile = true`, no DynamoDB).

## Local development

See [local/README.md](local/README.md). In short: `docker compose -f local/compose.yml up -d` gives Postgres on **5433**, Mailpit on 1025/8025 and MinIO on 9000/9001 with the `aptiverse-uploads` bucket.

## Prerequisites

- Terraform 1.15.x, AWS CLI v2 with the Session Manager plugin.
- AWS credentials via SSO or an assumed role (never long-lived keys on disk).
- `CLOUDFLARE_API_TOKEN` in the environment: a token with DNS edit on the `aptiverse.co.za` zone only.

## Bootstrap (once)

The state bucket already exists from the old infra. Adopt it rather than create it:

```bash
cd bootstrap
terraform init
terraform import aws_s3_bucket.state aptiverse-terraform-state-483527586058
terraform plan     # expect in-place changes only; review before applying
```

## Apply order

Never apply without a reviewed plan. For the first rollout, run each step by hand with `terraform init -backend-config=backend.hcl`, then `plan`, review, then `apply`.

1. `bootstrap` (adopt the bucket, above).
2. `envs/global`. Import the existing SES identity and the SES DNS records first (see `modules/ses/README.md` and `modules/dns/README.md`) so DKIM tokens and Cloudflare records are adopted, not duplicated.
3. `envs/dev`. Before or straight after the first apply:
   - populate the secrets listed in the `app_secret_names` output (`aws secretsmanager put-secret-value`); ECS will not start tasks while a referenced secret is empty;
   - push a first image to the `ecr_repository_url` output and write its tag to the `image_tag_parameter` output (`aws ssm put-parameter --overwrite`), then apply again so the task definitions pick it up.
4. Copy the `github_role_arns` output into GitHub variables (see CI below). From then on, applies run from CI.
5. `envs/staging`, then `envs/prod` the same way.

## CI

`ci.yml` runs on every PR: `terraform fmt -check -recursive`, `init -backend=false` plus `validate` for every stack and module, `tflint`, and `trivy config` (accepted findings are listed with reasons in `.trivyignore`).

- **Plan**: runs on PRs only when the repository variable `AWS_PLAN_ROLE_ARN` is set (any env's `infra-plan` role; they are read-only). Needs secret `CLOUDFLARE_API_TOKEN_READ`. The plan is posted as a PR comment.
- **Apply**: on merge to main, `global`, then `dev`, `staging`, `prod`, each inside the GitHub environment of the same name using `AWS_APPLY_ROLE_ARN_<STACK>` and secret `CLOUDFLARE_API_TOKEN`. A stack whose variable is not set is skipped. Protect the `prod` and `global` environments with required reviewers.

## Deploying the api (how the pieces fit)

1. The api pipeline builds and pushes `<ecr>/aptiverse/api:<git-sha>` (immutable tags) once. Every environment deploys that same image; promotion changes the tag in SSM, never rebuilds.
2. It writes the sha to `/aptiverse/<env>/api/image-tag` in SSM, then triggers an infra apply for that env (workflow dispatch), which registers new task definitions from this repo.
3. It runs the migration task: `aws ecs run-task --task-definition <migration family>` with the `migration_network_configuration` output, waits, and fails on a non-zero exit code.
4. ECS rolls the api and worker with the deployment circuit breaker; a failed rollout rolls back automatically (see `docs/runbooks/rollback-ecs-deploy.md`).
5. The pipeline smoke-tests `/health/ready`.

The role is selected by the container command (`host/Aptiverse.Host.dll`, `worker/Aptiverse.Worker.dll`, or `host/Aptiverse.Host.dll migrate`); `APP_ROLE` is also set for information. The api must listen on 8080 in the api role and tolerate a read-only root filesystem (a writable `/tmp` is mounted).

## Configuration contract (api and worker)

Infra sets these on every api, worker and migration task (`app_environment` and `app_secrets` in each env's `main.tf`). Names are the api's configuration keys with `__` for nesting. The api validates required keys on start, so a missing one fails the deploy instead of running half configured.

| Key | Source | Consumer |
|---|---|---|
| `Database__Host`, `__Port`, `__Name` | env (RDS outputs) | `DatabaseOptions.FromParts` builds `ConnectionStrings:Aptiverse` (TLS required) |
| `Database__Username`, `__Password` | secret (RDS managed master secret, JSON keys) | same |
| `Auth__Issuer` | env (`https://<api_hostname>.<domain>`) | Identity `AuthOptions`, token `iss` |
| `Auth__WebAppUrl` | env (first entry of `web_origins`) | Identity `AuthOptions`, links in emails |
| `Auth__SigningKey` | secret `jwt-signing-key` (PEM EC P-256) | Identity `SigningKeys`; required outside Development |
| `Cors__AllowedOrigins__<n>` | env (`web_origins`) | Host `CorsSettings` |
| `ForwardedHeaders__KnownNetworks__0` | env (`vpc_cidr`) | Host `ForwardedHeadersSettings`, so rate limits see the client IP and not the ALB |
| `Storage__*`, `Email__*` | env | reserved for the Storage and Notifications modules |
| `Sentry__Dsn`, `OTEL_EXPORTER_OTLP_*` | secrets | telemetry |
| `Sentry__Environment`, `OTEL_RESOURCE_ATTRIBUTES`, `OTEL_SERVICE_NAME` | env | telemetry |

`Auth__Audience`, `Legal__TermsVersion` and `Legal__PrivacyVersion` come from the image's `appsettings.json`; override them here only if an environment needs a different value.

## Database access (SSM port forward, no SSH)

There is no bastion and no `.pem`. Use ECS Exec's SSM channel through a running api task to forward a local port to RDS:

```bash
ENV=dev
CLUSTER=aptiverse-$ENV
TASK=$(aws ecs list-tasks --cluster $CLUSTER --service-name aptiverse-$ENV-api --query 'taskArns[0]' --output text)
TASK_ID=${TASK##*/}
RUNTIME_ID=$(aws ecs describe-tasks --cluster $CLUSTER --tasks $TASK \
  --query 'tasks[0].containers[0].runtimeId' --output text)
DB_HOST=$(terraform -chdir=envs/$ENV output -raw db_address)

aws ssm start-session \
  --target ecs:${CLUSTER}_${TASK_ID}_${RUNTIME_ID} \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"$DB_HOST\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"15432\"]}"
```

Then connect to `localhost:15432` with TLS required. Fetch credentials from the RDS-managed secret (`db_master_secret_arn` output) in your own terminal only; never paste them anywhere. Local port 15432 avoids clashing with the local compose Postgres (5433) and anything on 5432. For routine work, create per-person IAM-authenticated database users instead of using the master login.

## Cost notes (from the rebuild plan; verify with the AWS calculator)

- **Dev, roughly $70 per month**: Fargate api and worker at 0.25 vCPU / 0.5 GB ARM about $20, ALB about $20, RDS db.t4g.micro about $20, S3 / CloudWatch / Secrets Manager about $10. The four interface endpoints add roughly $8 each per AZ; drop them in dev if cost matters more than private AWS traffic. Dev can be scaled to zero tasks at night, or the ALB replaced by Cloudflare Tunnel later.
- **Prod, roughly $250 to $400 per month to start**: mostly Multi-AZ RDS, the NAT gateway and two or more api tasks.
- Backup retention above 1 day needs the AWS account off the free plan.

## Known caveats

- `api.dev` and `api.staging` are two-level subdomains. Cloudflare Universal SSL only covers one level, so either enable Advanced Certificate Manager or set `api_hostname = "api-dev"` (and `api-staging`).
- Zone SSL mode is not managed here. Switch to Full (strict) once the old EC2 origin is retired.
- `pg_stat_statements` preload is applied at the next RDS reboot on an existing instance.
