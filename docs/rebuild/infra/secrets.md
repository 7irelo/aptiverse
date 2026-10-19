# Secrets module (Secrets Manager containers)

| | |
|---|---|
| ID range | INF-16, INF-64 to INF-68 |
| Phase | 1 (rotation and keys by 10) |
| Depends on | SEC-01 to SEC-08 (rotated values), INF-02 |
| Code path | `infra/modules/secrets/`; references in `envs/*/main.tf` (`app_secrets`), output `app_secret_names` |
| Status | INF-16 done in code. Secret values, rotation schedule, key decision, per-role database secrets and container clean-up are open. |

## Purpose

Create one empty Secrets Manager secret per app credential and per environment. Values are written out of band, never by Terraform, so they never land in state, plans or outputs (`infra/CLAUDE.md` rule 3). ECS injects them into tasks by ARN at start.

## Scope

- Resources: `aws_secretsmanager_secret` per key, named `aptiverse/<env>/<key>`, `recovery_window_in_days` 7, `kms_key_id` from `kms_key_arn` (null means `aws/secretsmanager`). No `aws_secretsmanager_secret_version` anywhere in the repo.
- Default keys: `jwt-signing-key` (ES256 PEM), `auth-session` (Auth.js secret shared with the web BFF), `paystack` (JSON `secret_key`, `public_key`, `webhook_secret`), `anthropic` (`api_key`), `sentry-dsn`, `google-oauth` (`client_id`, `client_secret`), `meta-capi` (`pixel_id`, `access_token`; removed by INF-68, decision 8), `grafana-otlp` (`endpoint`, `otlp_headers`).
- RDS master secret: created and rotated by RDS (`manage_master_user_password`), ARN from `module.database.master_user_secret_arn`.
- Consumers today (`app_secrets`): `Database__Username` and `Database__Password` (master secret JSON keys), `Jwt__SigningKey`, `Sentry__Dsn`, `OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_EXPORTER_OTLP_ENDPOINT`. The execution role can read only those ARNs.
- Outputs: `arns` (map), names via `app_secret_names`.

## Tasks

- [x] **INF-16** `modules/secrets`: Secrets Manager entries, task role access by ARN. *(`infra/modules/secrets/main.tf`; execution role policy `read-injected-secrets` in `infra/modules/service/main.tf`)*
- [ ] **INF-64** Populate every referenced secret per env with `aws secretsmanager put-secret-value --secret-string file://...` (then shred the file), starting with dev; ECS will not start tasks while a referenced secret or JSON key is empty. Use test-mode Paystack keys in dev and staging only. *(unverified: AWS state)*
- [ ] **INF-65** Rotation schedule: write the cadence per secret into `infra/docs/runbooks/rotate-secret.md` (JWT signing key every 90 days with JWKS overlap, Paystack and Anthropic yearly or on staff change, OAuth yearly, RDS master via RDS rotation every 30 days with `aws_db_instance` `master_user_secret` rotation), and add a CloudWatch alarm or a scheduled reminder when a secret's `LastChangedDate` exceeds its cadence (Security Hub control `SecretsManager.4` covers this if enabled in `account-security.md`).
- [ ] **INF-66** Key decision for secrets: keep `aws/secretsmanager` or use the per-env CMK from `account-security.md` (INF-121). With a CMK, add `kms:Decrypt` on that key to each execution role, scoped with `kms:ViaService = secretsmanager.af-south-1.amazonaws.com`.
- [ ] **INF-67** Per-role database credentials: add `db-app` and `db-migrator` secrets (JSON `username`, `password`) to the defaults, switch `app_secrets` for the api and worker to `db-app` and the migration task to `db-migrator`, and remove the master secret from task injection (pairs with INF-38 in `database.md`).
- [ ] **INF-68** Container clean-up and additions: remove the `meta-capi` container from `variables.tf` defaults (decision 8: no Meta tracking in v1; re-add by ADR after launch), confirm whether `auth-session` belongs in AWS at all (the web BFF runs on Vercel and reads its secret from Vercel env, see `vercel.md`), and add containers for new integrations as their api modules land (for example SES needs none; Paystack and Anthropic already exist). Each addition needs a description and a consumer entry in the config contract (INF-49).

## Verification

- `terraform -chdir=infra/modules/secrets init -backend=false && terraform validate`.
- `grep -r aws_secretsmanager_secret_version infra/` returns nothing (CI could enforce this with a one-line check).
- `aws secretsmanager list-secrets --filters Key=name,Values=aptiverse/dev/ --query 'SecretList[].[Name,LastChangedDate]'` shows every key with a value date.
- `aws iam get-role-policy --role-name aptiverse-dev-api-execution --policy-name read-injected-secrets` lists only the referenced ARNs.
- `terraform output app_secret_names` prints names, never values.

## Open questions

- Should the web BFF's `AUTH_SECRET` live in AWS at all? If the BFF only runs on Vercel, the Vercel encrypted env var is the source of truth and the `auth-session` container is unused.
- Who holds break-glass access to read secret values in prod, and is every `GetSecretValue` by a human alarmed (CloudTrail metric filter in `account-security.md`)?
