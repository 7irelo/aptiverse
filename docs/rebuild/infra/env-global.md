# Environment: global (account-wide stack)

| | |
|---|---|
| ID range | INF-147 to INF-151 |
| Phase | 1 (before dev) |
| Depends on | INF-01, INF-26, INF-69 (SES import) |
| Code path | `infra/envs/global/` (`main.tf`, `providers.tf` with the `aws.eu_west_1` alias, `backend.hcl`, `variables.tf`, `outputs.tf`) |
| Status | Composition done in code (SES identity in eu-west-1, its Cloudflare records, the GitHub OIDC provider). Apply, environment protection and the home for account-security resources are open. |

## Purpose

Resources that exist once per AWS account and are shared by every env stack through `terraform_remote_state`: the SES sending identity (eu-west-1) and its DNS records, and the GitHub Actions OIDC provider. The account security baseline (`account-security.md`) and the cost anomaly monitor (`monitoring.md` INF-96) also belong here.

## Scope

- Modules: `ses` (provider `aws.eu_west_1`), `ses_dns` (count by `publish_ses_dns_records`, default true), `github_oidc` (`create_provider = true`, `create_roles = false`).
- Inputs: `region` (af-south-1), `ses_region` (eu-west-1), `domain`, `ses_mail_from_subdomain` (`mail`), `publish_ses_dns_records`.
- Outputs: `ses_identity_arn`, `ses_configuration_set_name`, `ses_configuration_set_arn`, `ses_region`, `ses_dns_records`, `github_oidc_provider_arn`.
- State: `v2/global/terraform.tfstate`; env stacks read it through `data.terraform_remote_state.global`.

## Tasks

- [ ] **INF-147** First `envs/global` apply from a reviewed plan after importing the SES identity and records (INF-69); expect no DKIM token changes. *(unverified: AWS and Cloudflare state)*
- [x] **INF-148** GitHub OIDC provider created once, account wide. *(`module "github_oidc"` with `create_provider = true` in `infra/envs/global/main.tf`)*
- [x] **INF-149** SES region, identity and configuration set exported for env stacks. *(`infra/envs/global/outputs.tf`, consumed as `local.global` in `envs/*/main.tf`)*
- [ ] **INF-150** Protect the `global` GitHub environment with required reviewers, since a bad global apply affects every env (CI `apply-global` runs first). *(unverified: GitHub settings)*
- [ ] **INF-151** Add `account-security` and the cost anomaly monitor to this stack (with both region providers), and an `infra-plan` and `infra-apply` role pair for global if the env roles should not be reused (today `AWS_APPLY_ROLE_ARN_GLOBAL` must point at some env's apply role: decide and document).

## Verification

- `terraform -chdir=infra/envs/global init -backend=false && terraform validate`.
- `terraform -chdir=infra/envs/global plan` clean after INF-147.
- `aws iam list-open-id-connect-providers` shows exactly one `token.actions.githubusercontent.com` provider.
- `terraform -chdir=infra/envs/dev console` evaluates `data.terraform_remote_state.global.outputs.ses_region` to `eu-west-1`.

## Open questions

- Which role applies `global` in CI? Using the dev apply role couples global to dev's trust policy; a dedicated global role trusted only from the `global` environment is cleaner.
