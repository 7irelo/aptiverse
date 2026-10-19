# Security baseline (policy)

| | |
|---|---|
| ID range | `SEC-30` to `SEC-52` |
| Phase | 0 (policy), verified in every later phase and at HRD-20 |
| Owner repo | all three; policy file `docs/security/baseline.md` in infra |
| Depends on | REPO tasks for scanners, `infra/` and `ci/` files for implementation |
| Status | 0 done, 5 partial (controls already present in code), 3 unverified, rest not started |

## Purpose

One written baseline that every repo, pipeline and Terraform module is measured against. This file holds the policy and the checks that prove it; the implementation tasks live in `ci/api-pipeline.md`, `ci/web-pipeline.md`, `ci/infra-pipeline.md`, `ci/shared-workflows.md` and the `infra/` module files. Launch verification is in `launch/security.md`.

## Scope

### Targets

- OWASP ASVS 4.0.3 Level 2 for authentication, session management, access control and payments (Identity module, BFF in `web/src/app/api/bff`, `web/src/lib/auth`, Billing module, Paystack webhook).
- ASVS Level 1 for everything else.
- PCI DSS scope kept out: Paystack hosted checkout or Paystack inline only, no card data touches our servers or logs (see `launch/security.md`).

### Required scanners

| Scanner | Repo | Where it runs | Gate |
|---|---|---|---|
| CodeQL | api, web | PR and weekly | high or critical blocks merge |
| gitleaks | api, web, infra | pre-commit, PR, push to main | any finding blocks |
| Trivy image | api | `Container image` job in `api/.github/workflows/ci.yml` (present, CRITICAL and HIGH, ignore unfixed) | blocks push |
| Trivy config | infra | `trivy config` job (present, HIGH and CRITICAL, `.trivyignore` with reasons) | blocks merge |
| npm audit | web | CI, `--audit-level=high --omit=dev` | blocks merge |
| dotnet vulnerable packages | api | CI, `dotnet list package --vulnerable --include-transitive` | high or critical blocks |
| Secret scanning push protection | all | GitHub | blocks push |

### Dependency policy

- Allowed licences: MIT, Apache-2.0, BSD-2/3-Clause, ISC, MPL-2.0 (file-level), 0BSD. Anything else (GPL, AGPL, SSPL, commercial such as AutoMapper 15 and MediatR 13) needs an ADR.
- Versions: exact or lock-file pinned (NuGet central package management in `api/Directory.Packages.props`, `web/package-lock.json`, Terraform lock files in root stacks, action digests).
- Renovate weekly (Monday before 6am SAST, already configured); security PRs immediately.
- Fix window from disclosure: critical 7 days, high 30 days, medium next planned update, low best effort. Exceptions recorded in `.trivyignore` or an issue with an expiry date.

### Supply chain

- SBOM: CycloneDX for the api image (Trivy or `syft`) and for web (`@cyclonedx/cyclonedx-npm`), attached to every build and release.
- Provenance: GitHub artifact attestations (`actions/attest-build-provenance`) for the api image digest, or cosign keyless signing; ECS deploys only a digest that has an attestation (check in the deploy job).

### Encryption

- At rest: RDS `storage_encrypted = true` (present), S3 SSE-KMS with bucket key (present, AWS managed key unless `kms_key_arn` set), Secrets Manager (AWS managed key by default), ECR (AES256 default, KMS optional), CloudWatch log groups (decide CMK), SNS alarms topic (CMK present).
- In transit: TLS 1.2 minimum everywhere. RDS `rds.force_ssl = 1` (present), S3 TLS-only bucket policy (present on uploads and state buckets), SES configuration set `tls_policy = REQUIRE` (present), ALB HTTPS listener with `ssl_policy` variable (pick a TLS 1.2 or 1.3 policy), Cloudflare SSL mode Full (strict) (not managed in Terraform yet), HSTS on web (present in `web/next.config.ts`).

### IAM

- One task role per service role: api, worker and migrate each get only what they use. Today api and worker share one app policy (S3 uploads read and write, SES send) through `task_role_policy_json` in `infra/envs/*/main.tf`.
- CI roles via GitHub OIDC only, scoped per repo and environment (present in `infra/modules/github-oidc`). The `infra-apply` role uses `PowerUserAccess` plus scoped IAM; record this as an accepted risk or narrow it.
- No long-lived AWS keys anywhere.

### Edge

- Cloudflare WAF managed rulesets on, OWASP core ruleset in log mode first then block.
- Cloudflare rate limiting rules on `/auth/*` (login, register, forgot password) and `/billing/paystack/webhook` (separate rule, allow Paystack IPs).
- ALB accepts Cloudflare ranges only (present for IPv4).

## Tasks

- [ ] **SEC-30** Publish `docs/security/baseline.md` with the targets, scanner table, dependency policy, encryption and IAM rules above; link it from every repo README
- [ ] **SEC-31** ASVS L2 checklist for auth and session: copy the V2, V3 and V4 requirement IDs into `docs/security/asvs-auth.md` with owner task IDs (BE-IDN, FE-20 to FE-29) per requirement
- [ ] **SEC-32** ASVS L2 checklist for payments: V4, V8, V11, V13 items relevant to Billing and the Paystack webhook, mapped to BE-BIL tasks in `backend/`
- [ ] **SEC-33** ASVS L1 checklist for the rest of the app, mapped to modules
- [ ] **SEC-34** Licence check in CI: `dotnet-project-licenses` or equivalent for api, `license-checker --onlyAllow` for web, failing on a disallowed licence (implementation in `ci/shared-workflows.md`)
- [ ] **SEC-35** Vulnerability fix window policy written down, with the exception process (issue with expiry date, linked from `.trivyignore`)
- [ ] **SEC-36** SBOM policy: format CycloneDX JSON, retained with each release for 1 year
- [ ] **SEC-37** Provenance policy: deploy job refuses an image digest without a valid attestation; document how to verify (`gh attestation verify oci://<image>@<digest> --owner aptiverse-labs`)
- [ ] **SEC-38** Encryption at rest verification checklist: one command per resource (`aws rds describe-db-instances --query StorageEncrypted`, `aws s3api get-bucket-encryption`, `aws ecr describe-repositories --query encryptionConfiguration`) run per env *(partial: RDS encryption, S3 SSE-KMS and TLS-only policies are in the modules; not yet verified against applied state)*
- [ ] **SEC-39** Decision: AWS managed keys vs customer managed KMS keys for RDS, S3 and Secrets Manager in prod (CMK allows cross-region copy control and key policies; record in an ADR)
- [ ] **SEC-40** In-transit checklist: `rds.force_ssl` shows 1 in the applied parameter group, ALB `ssl_policy` is a TLS 1.2+ policy, `openssl s_client` against the api shows no TLS 1.0 or 1.1 *(partial: `rds.force_ssl = 1` and SES `tls_policy = REQUIRE` are in code)*
- [ ] **SEC-41** Cloudflare SSL mode Full (strict) for `aptiverse.co.za` once the old EC2 origin is retired (infra README caveat) *(unverified: Cloudflare dashboard)*
- [ ] **SEC-42** Least-privilege review: one table per IAM role (task, execution, GitHub roles) listing each action and why; split api and worker task policies (implementation in `infra/service.md`) *(partial: execution role reads only referenced secret ARNs; task policy is shared by api and worker)*
- [ ] **SEC-43** Accepted-risk record for `infra-apply` using `PowerUserAccess`, or a narrower policy plan (implementation in `infra/github-oidc.md`)
- [ ] **SEC-44** IAM Access Analyzer enabled for the account, findings reviewed monthly *(unverified: AWS state)*
- [ ] **SEC-45** WAF policy: list the Cloudflare managed rulesets to enable, the rate limit rules (paths, thresholds, actions) and the log-then-block rollout (implementation in `infra/dns.md`)
- [ ] **SEC-46** ALB ingress also covers Cloudflare IPv6 ranges or the ALB stays IPv4 only by decision (record which) *(partial: IPv4 ranges only in `infra/modules/alb`)*
- [ ] **SEC-47** Web security headers policy: CSP with nonces as the target (current CSP allows `'unsafe-inline'` scripts, see `web/next.config.ts`), HSTS preload submitted, Permissions-Policy as present *(partial: headers set in `web/next.config.ts`)*
- [ ] **SEC-48** Logging policy: no PII, tokens or secrets in logs; Sentry `SendDefaultPii = false` (present in api); redaction rules owned by `observability/telemetry.md`
- [ ] **SEC-49** CloudTrail enabled in all regions with log file validation, logs to a dedicated bucket with 1-year retention *(unverified: AWS state; old account may already have a trail)*
- [ ] **SEC-50** GuardDuty enabled in af-south-1 and eu-west-1, findings to the alarms topic (implementation in `infra/monitoring.md`)
- [ ] **SEC-51** Security review gate per phase: each phase exit checks the relevant baseline sections and records the result in the phase's backlog file
- [ ] **SEC-52** Annual baseline review date set, and on any new provider (new sub-processor)

## Verification

- `docs/security/baseline.md` exists and each scanner in the table has a green job in its repo.
- Pick one control from each section and show its evidence (job log, CLI output, screenshot) in the HRD-20 review.
- A PR adding a GPL dependency fails the licence check; a PR adding a known-vulnerable package fails the audit.

## Open questions

- Customer managed KMS keys cost about USD 1 per key per month plus requests; worth it for prod RDS and S3 (SEC-39)?
- Decided (65): Cloudflare Pro, which includes the managed WAF and OWASP ruleset.
- ASVS 5.0 was published in 2025; target 4.0.3 (tooling and checklists are mature) or 5.0?
