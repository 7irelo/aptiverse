# Infra pipeline

| | |
|---|---|
| ID range | `CI-30` to `CI-39`, `CI-80` to `CI-89` |
| Phase | 1 |
| Depends on | `infra/github-oidc.md` (plan and apply roles), `infra/env-global.md`, `infra/env-dev.md`, `infra/env-staging.md`, `infra/env-prod.md`, REPO-02 |
| Code path | `infra/.github/workflows/ci.yml`, `infra/.github/workflows/apply.yml`, `infra/.tflint.hcl`, `infra/.trivyignore`, `infra/renovate.json` |
| Status | 16 tasks: 3 done, 0 partial, 2 unverified, 11 not started. Checks, PR plan comments and ordered applies exist in code; repository variables and environment protection cannot be seen from the repo. |

## Purpose

Every Terraform change is formatted, validated, linted, scanned and planned on the PR, reviewed, then applied in a fixed order (global, dev, staging, prod) by CI only, with prod and global behind human approval. The same pipeline gives the api repo a way to roll out one environment, and catches drift between code and AWS.

## Scope

`ci.yml` jobs today: `fmt` (plus the identical `main.tf` and `outputs.tf` check), `validate` (matrix over 16 stacks and modules), `tflint` (v0.64.0, aws ruleset 0.49.0), `trivy` (pinned `aquasec/trivy:0.75.0`, HIGH and CRITICAL, `.trivyignore`), `plan` (PR only, gated on `vars.AWS_PLAN_ROLE_ARN`, matrix global, dev, staging, prod, comment per stack), `apply-global`, `apply-dev`, `apply-staging`, `apply-prod` (push to main or `workflow_dispatch`, each gated on its `AWS_APPLY_ROLE_ARN_<STACK>` variable, calling `apply.yml`).

`apply.yml` (reusable): runs in the GitHub environment of the same name, assumes the apply role through OIDC, then `terraform plan -out=tfplan` and `terraform apply tfplan` in the same job, `concurrency: apply-<stack>`.

Variables and secrets: `AWS_PLAN_ROLE_ARN`, `AWS_APPLY_ROLE_ARN_{GLOBAL,DEV,STAGING,PROD}`, `CLOUDFLARE_API_TOKEN_READ` (plan), `CLOUDFLARE_API_TOKEN` (apply, per environment).

## Tasks

### Checks

- [x] **CI-30** `terraform fmt -check`, `validate`, `tflint`, `trivy config` (jobs `fmt`, `validate`, `tflint`, `trivy` in `infra/.github/workflows/ci.yml`; `fmt` also `cmp`s env `main.tf` and `outputs.tf`)
- [ ] **CI-39** Policy as code: `checkov` (pinned image) or `conftest` with Rego for Aptiverse rules that trivy does not express: RDS `deletion_protection` true and `backup_retention_period` at least 7 (30 in prod), `storage_encrypted` true, no security group ingress from `0.0.0.0/0`, ALB ingress only from the Cloudflare list, S3 public access block on every bucket, no `aws_secretsmanager_secret_version`, no `aws_key_pair`, no port 22. Runs on every PR; a failing rule needs a written exception in the file
- [ ] **CI-82** `terraform test` for modules with pure logic (network CIDR maths, service container definition, ses DNS records) using `mock_provider`, run in the `validate` matrix
- [ ] **CI-85** Provider lock check: `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64 -platform=windows_amd64` produces no diff in each root stack, so Renovate provider bumps and laptops on any OS agree

### Plan

- [x] **CI-31** `plan` posted as PR comment (job `plan` with `actions/github-script`, trimmed to 60 KB, one comment per stack)
- [ ] **CI-33** Configure `AWS_PLAN_ROLE_ARN` (an env `infra-plan` role, read only with `NoSecretValues` deny) and `CLOUDFLARE_API_TOKEN_READ` in the infra repository so the plan job stops being skipped *(unverified: GitHub repository settings)*
- [ ] **CI-36** Update the plan comment in place (find the previous comment by a hidden marker `<!-- tf-plan:<stack> -->` and edit it) and add a one-line summary per stack (`n to add, n to change, n to destroy`) at the top
- [ ] **CI-81** Destroy guard: parse `terraform show -json tfplan`; fail the PR when the plan deletes or replaces `aws_db_instance`, `aws_s3_bucket`, `aws_ecr_repository`, `aws_kms_key` or `aws_secretsmanager_secret` unless the PR has the `infra-destroy-approved` label
- [ ] **CI-83** Path-aware plan matrix: a PR that only touches `envs/global` plans global only, one that touches `modules/` or env stacks plans every env, and docs-only PRs skip plan; the decision step prints why each stack ran
- [ ] **CI-38** Cost estimate: Infracost on PRs for dev, staging and prod with the diff in the same comment; flag a monthly increase above an agreed threshold (input from `launch/cost-controls.md`)

### Apply

- [x] **CI-32** `apply` on merge, approval gate for prod (`apply-global` to `apply-prod` chained with `needs`, each in its GitHub environment through `apply.yml`; never runs after a failure)
- [ ] **CI-34** Protect the `prod` and `global` GitHub environments with required reviewers, restrict deployments to `main`, and add a wait timer for prod; `dev` and `staging` restricted to `main` *(unverified: GitHub environment settings)*
- [ ] **CI-35** Apply what was reviewed: save the PR plan per stack as an artifact keyed by the merge commit tree, and in `apply.yml` re-plan and compare the resource change set (`terraform show -json`, ignoring attribute noise) with the reviewed plan; a mismatch stops the apply and asks for a fresh PR review. Applying a stale binary plan directly is not possible after merge, so the comparison is the gate
- [ ] **CI-80** Single-stack dispatch: `workflow_dispatch` input `stack` (choice: global, dev, staging, prod; default none) and a reason field, so the api deploy (CI-56) and runbooks can apply one environment; today a dispatch runs every configured stack in order
- [ ] **CI-84** Post-apply checks and notification: after each apply, run `terraform output` sanity checks (ALB DNS resolves, `/health/ready` through `api.<env>` returns 200 when a service exists) and post success or failure with the run link to the alert channel (`observability/alerting.md`)

### Drift

- [ ] **CI-37** Nightly drift detection: a scheduled workflow runs `terraform plan -detailed-exitcode -lock=false` for every stack with the plan role; exit code 2 opens or updates one GitHub issue per stack labelled `drift` with the plan summary, and closes it when clean

## Verification

- A PR that sets `deletion_protection = false` in `envs/prod/variables.tf` fails CI-39.
- A PR whose plan replaces the RDS instance fails CI-81 without the label.
- A plan comment on a PR is edited, not duplicated, when a new commit is pushed.
- Merging a change to `modules/alb` applies global, dev, staging, then waits for a reviewer on prod.
- `gh workflow run ci.yml -f stack=dev -f reason=test` applies dev only.
- Changing a security group by hand in the console produces a `drift` issue the next morning.
- No workflow in the repo uses long-lived AWS keys; `grep -r aws-access-key-id .github` is empty.

## Open questions

- Should the api deploy dispatch the infra workflow (cross-repo token) or should infra expose a narrower `rollout.yml` that only updates the image tag and task definitions?
- Checkov or conftest: checkov is less work, conftest keeps rules readable in Rego. Decide once.
- Is Infracost's free tier acceptable for a private org repo, or is the AWS calculator check in `launch/cost-controls.md` enough?
- The apply role uses `PowerUserAccess` plus scoped IAM (`infra/github-oidc.md`); tightening it is an infra task, but the pipeline must keep working after it.
