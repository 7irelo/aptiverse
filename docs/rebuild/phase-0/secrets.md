# Phase 0 secrets

| | |
|---|---|
| ID range | `SEC-01` to `SEC-29` |
| Phase | 0 (rotation), then ongoing |
| Owner repo | infra (Secrets Manager containers in `infra/modules/secrets`), people with provider access |
| Depends on | access to AWS, Paystack, Anthropic, Google Cloud, Meta and OpenAI consoles |
| Status | 0 done, 0 partial, 25 unverified (provider consoles, old working copies, AWS state), 4 not started |

## Purpose

Rotate every credential that has existed on disk, in an old working copy or on the EC2 box, remove plaintext copies, and put a standing inventory and rotation policy in place so this never has to be a big-bang exercise again.

## Scope

- Credentials: AWS access keys and SES SMTP IAM key, Paystack secret, Anthropic key, Google OAuth secret, Meta CAPI token (revoked at cutover, decision 8), OpenAI key, JWT signing key, RDS master password, EC2 key pair.
- Plaintext copies: `api/.env`, `ai/.env`, access-key CSV, SES tfstate, `aptiverse-dev.pem`, and the current local `api/.env` and `web/.env.local` (both gitignored; never read or print them).
- New home for every app secret: `aptiverse/<env>/<name>` in Secrets Manager (containers defined in `infra/modules/secrets/variables.tf`: `jwt-signing-key`, `auth-session`, `paystack`, `anthropic`, `sentry-dsn`, `google-oauth`, `grafana-otlp`; `meta-capi` is removed by INF-68 because v1 has no Meta tracking, decision 8). Values are written out of band; Terraform never holds them.
- Runbook already present: `infra/docs/runbooks/rotate-secret.md`.

## Tasks

### Rotation of exposed credentials

- [ ] **SEC-01** Rotate AWS access keys from the old CSV *(unverified: AWS IAM console)*
- [ ] **SEC-13** Delete the SES SMTP IAM user and its key once the old app no longer sends over SMTP (split from SEC-01) *(unverified: AWS IAM; old app still uses MailKit SMTP until cutover, so rotate now and delete at CUT-11)*
- [ ] **SEC-02** Rotate Paystack secret key and update the old app's env on the box *(unverified: Paystack dashboard)*
- [ ] **SEC-14** Rotate the Paystack webhook secret and confirm the old webhook still verifies with a test event (split from SEC-02) *(unverified: Paystack dashboard)*
- [ ] **SEC-03** Rotate Anthropic API key *(unverified: Anthropic console)*
- [ ] **SEC-04** Rotate Google OAuth client secret *(unverified: Google Cloud console)*
- [ ] **SEC-05** Rotate the Meta CAPI token now (the live app may still send events), then revoke it at cutover: the rebuild does not use Meta in v1 (decision 8), so no new home is created for it *(unverified: Meta Business settings)*
- [ ] **SEC-06** Revoke the OpenAI key *(unverified: OpenAI console)*
- [ ] **SEC-07** Rotate JWT signing key in the live app *(unverified: live app env)*
- [ ] **SEC-15** Remove the committed default `Jwt:Key` from `api/appsettings.json` in the old code and make boot fail when it is missing (split from SEC-07; old file at `git show f223ca7:api/appsettings.json`) *(unverified: old code deploy)*
- [ ] **SEC-08** Rotate RDS master password of the old instance *(unverified: AWS RDS)*
- [ ] **SEC-09** Replace the EC2 key pair, delete every copy of `aptiverse-dev.pem` *(unverified: EC2 and every laptop)*

### Plaintext cleanup

- [ ] **SEC-10** Delete plaintext copies (`api/.env`, `ai/.env`, access-key CSV, SES tfstate) from every working copy, including the current `api/.env` and `web/.env.local` once their values live in a password manager or Secrets Manager *(unverified: every machine and backup)*
- [ ] **SEC-16** Check cloud backups and sync folders (OneDrive, Google Drive, Downloads) for the same files (split from SEC-10) *(unverified: human check)*
- [ ] **SEC-11** Move the old SES Terraform stack (`infra/terraform/ses` at `f223ca7`) to S3 remote state, or retire it once `infra/envs/global` adopts the identity *(unverified: AWS state)*
- [ ] **SEC-12** gitleaks scan of `7irelo/aptiverse` full history *(unverified: run against the remote)*
- [ ] **SEC-17** Decide private or delete for `7irelo/aptiverse`, record the decision and the date (split from SEC-12) *(unverified: owner decision)*

### Standing controls (added)

- [ ] **SEC-18** Secret inventory `docs/security/secrets-inventory.md`: name, environment, owner, provider, where injected (task env var), rotation cadence, last rotated date. No values
- [ ] **SEC-19** Rotation policy: provider API keys every 90 days, JWT signing key every 180 days with JWKS overlap, RDS master password via RDS managed rotation (enable rotation schedule on the managed secret), immediate rotation on any suspected leak *(unverified: RDS rotation schedule is AWS state)*
- [ ] **SEC-20** Calendar reminder or scheduled GitHub issue for each rotation due date from SEC-18 *(unverified: human setup)*
- [ ] **SEC-21** Populate dev Secrets Manager values for every container in `infra/modules/secrets` *(unverified: AWS state)*
- [ ] **SEC-22** Populate staging values (separate provider keys from prod; Paystack test mode) *(unverified: AWS state)*
- [ ] **SEC-23** Populate prod values (live keys, held by the owner only) *(unverified: AWS state)*
- [ ] **SEC-24** Break-glass procedure `docs/security/break-glass.md`: who can read prod secrets, how access is granted for an incident (time-boxed IAM role), how it is logged and revoked
- [ ] **SEC-25** CloudTrail alert on `secretsmanager:GetSecretValue` for prod secrets by any principal other than the ECS execution roles (EventBridge rule to the alarms SNS topic; implementation lives in `infra/monitoring.md`) *(unverified: AWS state)*
- [ ] **SEC-26** Quarterly review of Secrets Manager access logs and IAM principals with secret access, recorded in the inventory
- [ ] **SEC-27** gitleaks full-history scan of `aptiverse-labs/api`, `web` and `infra` after the move, result attached to REPO-01 *(unverified: org repos)*
- [ ] **SEC-28** Confirm the `infra-plan` role's explicit deny on `secretsmanager:GetSecretValue` works (assume it and attempt a read, expect AccessDenied) *(unverified: AWS state)*
- [ ] **SEC-29** Password manager vault for human-held credentials (Cloudflare token, Paystack dashboard, Vercel, Sentry), with two named owners

## Verification

- Every old credential shows a rotation or revocation date in the inventory, and the old value fails at the provider.
- `gitleaks detect --source . --log-opts="--all"` on each repo reports zero findings.
- `aws secretsmanager list-secrets --filters Key=name,Values=aptiverse/prod` lists every expected name and `describe-secret` shows a `LastChangedDate` after rotation day.
- ECS tasks start in each env (a missing value stops task start, so a healthy service proves values exist).

## Open questions

- Does the old app still need SMTP until cutover? If yes, SEC-13 waits for CUT-11.
- Who is the second owner for break-glass access?
