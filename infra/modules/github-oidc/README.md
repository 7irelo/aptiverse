# github-oidc

GitHub Actions to AWS federation with no long-lived keys.

- `create_provider = true` creates the account-wide `token.actions.githubusercontent.com` provider. Only `envs/global` does this; env stacks look it up.
- `create_roles = true` creates four roles per environment, named `<name_prefix>-gha-<key>`:

| Role | Trusted subject(s) | Permissions |
|---|---|---|
| `api` | `repo:aptiverse-labs/api:environment:<env>` (plus `ref:refs/heads/main` when `allow_main_branch_deploys`) | ECR push to the env repo, `ecs:RunTask` on the migration family in the env cluster only, `ecs:UpdateService` on the env services, `iam:PassRole` for the task roles to ECS only, write the image tag SSM parameter, read deploy logs |
| `web` | `repo:aptiverse-labs/web:environment:<env>` (same main-branch option) | none by default (`web_policy_json` to add) |
| `infra-plan` | `repo:aptiverse-labs/infra:pull_request` and `ref:refs/heads/main` | `ReadOnlyAccess`, state bucket read/write under `v2/` (for the lockfile), explicit deny on `secretsmanager:GetSecretValue` |
| `infra-apply` | `repo:aptiverse-labs/infra:environment:<env>` | `PowerUserAccess` plus IAM limited to `aptiverse-*` roles and policies and the OIDC provider, state bucket access |

Protect the `prod` GitHub environment with required reviewers so `infra-apply` and `api` in prod can only be assumed after approval.
