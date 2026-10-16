# CLAUDE.md (aptiverse-labs/infra)

Terraform and local dev stack for Aptiverse v2. Read `README.md` for layout, apply order and access. These rules are hard requirements.

## Rules

1. **Never apply without a reviewed plan.** No `terraform apply` (or `destroy`, `import` against real resources, `state rm`) unless the human has reviewed the plan output for that exact change. Applies normally run from CI after merge. Locally, `terraform init -backend=false && terraform validate` is always safe.
2. **No SSH anywhere.** No key pairs, bastions, port 22 rules or `.pem` files. Shell access is ECS Exec; DB access is an SSM port forward (README).
3. **No secrets in Terraform.** Never create `aws_secretsmanager_secret_version`, never pass a secret as a variable, never output a secret value (ARNs and names only). RDS manages its master password (`manage_master_user_password`). App secrets are set out of band and injected into tasks by ARN.
4. **Remote state everywhere.** Every root stack except `bootstrap` uses the S3 backend in `aptiverse-terraform-state-483527586058` with `use_lockfile = true` and a key under `v2/`. No DynamoDB lock tables, no local state in git.
5. **Deploy definitions live only here.** Task definitions, services, compose files and IAM for deploys are defined in this repo. The api and web repos never carry their own copy; the api pipeline only pushes an image, records its tag in SSM and asks infra to roll out.
6. **Env stacks share one `main.tf`.** `envs/dev`, `envs/staging` and `envs/prod` must keep identical `main.tf` and `outputs.tf`; put differences in `variables.tf` defaults. CI fails otherwise.
7. **Protect data.** Keep RDS `deletion_protection = true`, final snapshots, encryption and backup retention (7 dev, 30 prod). Keep S3 public access blocked. Weakening any of these needs an explicit human decision in the PR.
8. **ALB accepts Cloudflare only.** Do not open the ALB security group to `0.0.0.0/0`.
9. **SES is eu-west-1**, via the provider alias in `envs/global`. No IAM SMTP users.
10. **Never read or print** `.env`, `*.pem`, `*.tfstate` or secret values, including in debugging.

## Conventions

- Conventional commits: `type(scope): subject`, for example `feat(infra): add queue module`; the body explains why.
- Run `terraform fmt -recursive` before committing; CI runs fmt, validate, tflint and trivy.
- Providers: `hashicorp/aws ~> 6.x`, `cloudflare/cloudflare ~> 5.x`, pinned in root stacks with committed lock files; modules declare ranges only.
- Every module has `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf` and a short `README.md`. Every variable and output has a description.
- Writing style: no emojis, no em or en dashes.

## Local dev stack

`local/compose.yml`: Postgres 17 on host port 5433 (db, user and password all `aptiverse`), Mailpit (SMTP 1025, UI 8025), MinIO (9000 API, 9001 console, bucket `aptiverse-uploads`). Other repos depend on these exact values; change them only together with the api and web repos.
