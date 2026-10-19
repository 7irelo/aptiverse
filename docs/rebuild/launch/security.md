# Security verification

| | |
|---|---|
| ID range | `HRD-20` to `HRD-24`, `HRD-90` to `HRD-107` |
| Phase | 10 (threat models start in the phase that builds each flow) |
| Depends on | `phase-0/security-baseline.md`, `ci/api-pipeline.md`, `ci/web-pipeline.md`, `ci/shared-workflows.md`, `infra/alb.md`, `infra/dns.md`, `infra/service.md`, `frontend/auth-bff.md`, `launch/pci-scope.md` |
| Status | 0 done, 1 partial (security headers set in `web/next.config.ts`, not yet verified externally), 0 unverified, 22 not started |

## Purpose

Verify, with evidence, that the security baseline set in Phase 0 holds in the built product before launch: OWASP ASVS Level 2 for authentication, session management and payments, Level 1 for everything else, clean scans, a working WAF and a hardened edge.

## Scope

- Standard: OWASP ASVS 4.0.3 (or the current 5.x if adopted in `phase-0/security-baseline.md`). L2 chapters: V2 Authentication, V3 Session Management, V4 Access Control, V6 Stored Cryptography, V7 Errors and Logging, V8 Data Protection, V9 Communication, V13 API, plus payment flows. L1 for the rest.
- Evidence folder: `docs/security/` in the api repo: `asvs-checklist.md` (requirement, level, status, evidence link), `threat-models/<flow>.md`, `scan-reports/<date>/`.
- Systems: api (Identity, Billing, Affiliates, AiTutor, uploads), web BFF and `proxy.ts`, Cloudflare WAF, ALB, ECS task roles, S3, Secrets Manager.

## Tasks

### ASVS review
- [ ] **HRD-20** OWASP ASVS L1 review across the app (umbrella; tracked in `asvs-checklist.md`)
- [ ] **HRD-90** Create `asvs-checklist.md` with every L1 requirement plus the L2 requirements for V2, V3, V4, V6, V8, V9, V13, each with owner and evidence column
- [ ] **HRD-91** ASVS L2 V2 and V3 for auth: ES256 15-minute tokens, JWKS, refresh rotation with family revocation on reuse, lockout, password policy (length, breached-password check), MFA decision recorded, session listing and sign-out of other devices; evidence links to integration tests
- [ ] **HRD-92** ASVS L2 V4 access control: every endpoint has a permission policy (architecture test evidence), ownership checks in handlers, parent can only read linked students, admin impersonation audited and time-boxed
- [ ] **HRD-93** ASVS L2 for payments: Paystack webhook HMAC-SHA512 verified before parsing, inbox idempotency, amounts from server-side plan data only, refund actions audited including failures, no card data handled (see `launch/pci-scope.md`)
- [ ] **HRD-94** ASVS V7 and V8: ProblemDetails never leak exception text, logs free of PII and tokens (OBS-06 redaction rules tested), diary and payout details encrypted at rest at field level where planned

### Threat models
- [ ] **HRD-95** Threat model: sign up, login, refresh and logout (STRIDE table, mitigations mapped to tests)
- [ ] **HRD-96** Threat model: checkout, webhook and subscription changes
- [ ] **HRD-97** Threat model: file upload (presigned PUT, magic-byte check, private objects, short-lived GET)
- [ ] **HRD-98** Threat model: AI tutor (prompt injection through student content, server-built context, quota abuse, tutor blocked during an active attempt)
- [ ] **HRD-99** Threat model: parent links and minors' data (invite links, expiry, consent, shared wellbeing only)

### Scans and supply chain
- [ ] **HRD-21** Dependency and image scans clean: zero unwaived CRITICAL or HIGH in Trivy image scan, `npm audit`, `dotnet list package --vulnerable`, CodeQL and gitleaks on all three repos (CodeQL and gitleaks jobs come from REPO-04 and REPO-06)
- [ ] **HRD-100** Waiver register: every accepted finding (Trivy, CodeQL, `.trivyignore` in infra) has a reason, owner and expiry date; expired waivers fail CI
- [ ] **HRD-101** SBOM review: the CycloneDX SBOM published per image (`ci/api-pipeline.md`) and for web is reviewed for licence and abandoned-package risk; findings recorded
- [ ] **HRD-102** Signed image verification evidence: show the prod image digest has a valid signature or build provenance attestation and that deploy refuses an unsigned digest (`ci/api-pipeline.md`)
- [ ] **HRD-103** Least-privilege IAM review: api and worker task roles, execution roles, GitHub OIDC roles (note `infra-apply` uses PowerUserAccess; record a decision to narrow or accept), with IAM Access Analyzer findings exported

### Edge and transport
- [ ] **HRD-22** Rate limits tuned per group (auth, AI, uploads, webhooks, default) from HRD-11 load results; partitions by user id or IP verified with a test that two users do not share a bucket
- [ ] **HRD-23** CSP and security headers verified (securityheaders.com grade A or better, Mozilla Observatory B+ or better) on app and api hosts *(partial: CSP, HSTS with preload, frame-ancestors none, X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy are set in `web/next.config.ts`; CSP still allows `'unsafe-inline'` scripts and no external scan has been run)*
- [ ] **HRD-104** CSP nonce hardening: move script-src to nonces set in `proxy.ts` for dynamic routes, add a `report-to` endpoint, review a week of CSP reports and fix or allow each source
- [ ] **HRD-105** WAF rule verification: Cloudflare managed rules on, rate-limit rules for `/auth/*` and the webhook path, bot fight settings, rules exported as evidence; test that a blocked pattern returns 403 at the edge (rules themselves are built in `infra/dns.md`)
- [ ] **HRD-106** TLS verification: Cloudflare Full (strict) confirmed, ALB policy TLS 1.2 minimum, origin unreachable except from Cloudflare ranges (direct ALB request from a non-Cloudflare IP times out), RDS `rds.force_ssl=1`, S3 TLS-only policy confirmed
- [ ] **HRD-107** Secrets scan results clean: full-history gitleaks on `aptiverse-labs/{api,web,infra}` and the archive of `7irelo/aptiverse`, report stored in `scan-reports/`

### Pentest
- [ ] **HRD-24** External pentest (optional): scope document (api, web, BFF, upload flow, webhook, admin), rules of engagement, staging target, findings tracked to closure before go-live for HIGH and above

## Verification

- `asvs-checklist.md` has no L2 auth or payments row without evidence, and no L1 row marked failed.
- Latest scan report for the release candidate image shows zero unwaived CRITICAL or HIGH findings.
- External header scans saved as PDF or screenshot with date in `scan-reports/`.
- Origin bypass test and WAF block test results recorded.

## Open questions

- ASVS 4.0.3 or 5.0 as the reference? Pick in `phase-0/security-baseline.md`.
- MFA for admins in v1: required (recommended) or deferred?
- Budget for an external pentest, and whether a scoped one on auth and payments only is enough.
