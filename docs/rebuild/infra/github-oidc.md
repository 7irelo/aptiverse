# GitHub OIDC module

| | |
|---|---|
| ID range | INF-18, INF-74 to INF-79 |
| Phase | 1 (least privilege tightening by 10) |
| Depends on | INF-02, REPO-01 (org repos exist), REPO-02 (environments and protection) |
| Code path | `infra/modules/github-oidc/`; provider in `envs/global`, roles in `envs/{dev,staging,prod}` |
| Status | INF-18 done in code. INF-74 partial: PowerUserAccess replaced by a scoped policy plus guardrails, not yet proven by a real apply. Roles lack a permissions boundary, the plan role can read data, and GitHub-side wiring is unverified. |

## Purpose

Let GitHub Actions in `aptiverse-labs/{api,web,infra}` assume short-lived AWS roles through OIDC, scoped per environment, with no long-lived keys anywhere.

## Scope

- Resources: `aws_iam_openid_connect_provider.github` (only when `create_provider`, which `envs/global` sets), per env `aws_iam_role` for `api`, `web`, `infra-plan`, `infra-apply` (`<name_prefix>-gha-<key>`, max session 1 hour), trust conditions on `aud = sts.amazonaws.com` and `sub` patterns.
- Trust: `api` and `web` from `repo:aptiverse-labs/<repo>:environment:<env>` plus `ref:refs/heads/main` when `allow_main_branch_deploys` (true in dev only; false in staging and prod); `infra-plan` from infra `pull_request` and main; `infra-apply` from the infra environment only.
- Permissions: `api` deploy policy (ECR push to env repos, `ecs:UpdateService` and `DescribeServices` on the two services, `ecs:RunTask` on the migration family in the env cluster, `DescribeTasks` and `StopTask` in the cluster, `iam:PassRole` for the api task and execution roles to ECS only, `ssm:GetParameter` and `PutParameter` on the image tag, log reads); `web` none unless `web_policy_json`; `infra-plan` `ReadOnlyAccess` plus state access plus deny `secretsmanager:GetSecretValue`; `infra-apply` `PowerUserAccess` plus IAM on `aptiverse-*` and the OIDC provider plus state access.
- Outputs: role ARNs (`github_role_arns` in env outputs), `github_oidc_provider_arn` (global).

## Tasks

- [x] **INF-18** `modules/github-oidc`: OIDC provider and per-repo, per-env deploy roles. *(`infra/modules/github-oidc/main.tf`)*
- [ ] **INF-74** Replace `PowerUserAccess` on `infra-apply` with a scoped policy covering only the services the stacks own (ec2 VPC resources, ecs, ecr, rds, elasticloadbalancing, acm, s3 on `aptiverse-*` buckets, secretsmanager on `aptiverse/*` without `GetSecretValue`, ssm on `/aptiverse/*`, logs, cloudwatch, sns, kms, application-autoscaling, backup, budgets, ce, cloudtrail, guardduty, securityhub, config). Generate the starting point from CloudTrail with IAM Access Analyzer policy generation after a full dev apply, then review. *(partial: PowerUserAccess replaced by `apply_services` (each managed service listed, scoped to `aptiverse-*` ARNs where possible) and `apply_guard` (no secret values, only af-south-1 and eu-west-1, no broad managed policies, no IAM users or keys); the api deploy role pushes images only in dev (`ecr_push`). Not yet proven: written without AWS access, so a full dev plan and apply with this role, then Access Analyzer policy generation from CloudTrail, must confirm it (`infra/README.md` "Proving the apply policy"))*
- [ ] **INF-75** Permissions boundary: create `aptiverse-boundary` and require it (`iam:PermissionsBoundary` condition) on every role `infra-apply` creates, so a compromised apply run cannot create an `aptiverse-*` role with admin rights. Attach the boundary to all task, execution and GitHub roles.
- [ ] **INF-76** Prod environment gate: confirm the GitHub `prod` and `global` environments require reviewers and restrict deployment branches to `main` (and tags for api prod), so `api` and `infra-apply` in prod can only be assumed after approval. *(unverified: GitHub settings, owned with REPO-02)*
- [ ] **INF-77** Copy `github_role_arns` into GitHub variables per repo and environment (`AWS_ROLE_ARN`, `AWS_PLAN_ROLE_ARN`, `AWS_APPLY_ROLE_ARN_<STACK>`) and record which variable each workflow reads in `infra/README.md`. *(unverified: GitHub settings)*
- [ ] **INF-78** Web role decision: the web app deploys to Vercel and needs no AWS access today. Either stop creating the `web` role (smaller attack surface) or document the future use (for example uploading source maps or Lighthouse reports to S3).
- [ ] **INF-79** Data guard on `infra-plan`: `ReadOnlyAccess` can read S3 object contents and CloudWatch log events. Add explicit denies for `s3:GetObject` on the uploads, ALB log and CloudTrail buckets, `logs:GetLogEvents` and `logs:FilterLogEvents` on `/ecs/*`, and `rds-db:connect`, keeping only metadata reads Terraform needs.

## Verification

- `terraform -chdir=infra/modules/github-oidc init -backend=false && terraform validate`.
- `aws iam get-role --role-name aptiverse-prod-gha-api --query 'Role.AssumeRolePolicyDocument'` shows only the `environment:prod` subject.
- From a PR branch workflow, assuming `aptiverse-dev-gha-infra-apply` fails with `AccessDenied`.
- `aws iam simulate-principal-policy --policy-source-arn <infra-plan arn> --action-names s3:GetObject --resource-arns arn:aws:s3:::aptiverse-prod-uploads-<acct>/x` returns `explicitDeny` after INF-79.
- `aws iam list-attached-role-policies --role-name aptiverse-dev-gha-infra-apply` no longer lists `PowerUserAccess` after INF-74.

## Open questions

- `allow_main_branch_deploys` is true in dev, so any workflow on main can deploy dev without an environment. Keep it, or require the `dev` environment too so every deploy is an explicit job in `ci/shared-workflows.md`?
- When prod moves to its own AWS account (GRW-10), the OIDC provider and roles must be created there too; keep the module account-agnostic.
