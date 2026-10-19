# Shared workflows, promotion and deployment safety

| | |
|---|---|
| ID range | `CI-40` to `CI-49`, `CI-90` to `CI-97` |
| Phase | 0 (decision REPO-10) and 1 (implementation) |
| Depends on | REPO-10 (shared workflow repo or org templates), REPO-02, REPO-04, REPO-05, REPO-06, REPO-08, `phase-0/decisions.md` (feature flags, environments), `infra/github-oidc.md` |
| Code path | none yet; target `aptiverse-labs/.github` (org templates and reusable workflows). Today each repo has its own workflows: `api/.github/workflows/ci.yml`, `web/.github/workflows/ci.yml`, `infra/.github/workflows/{ci,apply}.yml` |
| Status | 18 tasks: 0 done, 1 partial, 1 unverified, 16 not started. Note: this working tree is still the monorepo `7irelo/aptiverse`; GitHub only runs workflows from the root `.github`, so none of the per-repo workflows run until the split into org repos (REPO-01) happens. |

## Purpose

Keep the three pipelines from drifting by putting the cross-cutting parts in one place: secret scanning, code scanning, SBOM and provenance, action pinning, workflow permissions, the OIDC pattern, the environment and promotion model, the deployment safety contract, release notes and artifact retention.

## Scope

Reusable workflows (`on: workflow_call`) and composite actions in `aptiverse-labs/.github`:

| Name | Kind | Inputs | Used by |
|---|---|---|---|
| `gitleaks.yml` | reusable | `full-history` | api, web, infra |
| `codeql.yml` | reusable | `language`, `build-mode` | api (csharp), web (javascript-typescript), infra (actions) |
| `sbom-attest.yml` | reusable | `subject-name`, `subject-digest`, `sbom-path` | api image, web release |
| `commitlint.yml` | reusable | none | all |
| `release.yml` | reusable | `component` | all |
| `workflow-lint.yml` | reusable | none | all |
| `actions/aws-oidc` | composite | `role-arn`, `region` | api, infra |
| `actions/ecs-wait-stable` | composite | `cluster`, `services`, `timeout` | api |
| `actions/smoke` | composite | `base-url`, `user-secret` | api, web |

Environment model (GitHub environments, mirrored in AWS by per-env roles):

| Env | Source | Gate | Data |
|---|---|---|---|
| preview (web only) | every PR | checks green | dev API |
| dev | every merge to main | checks green | dev RDS, synthetic seed |
| staging | the same artifact after dev smoke passes | automatic, restricted to main | anonymised copy of prod, refreshed on a schedule |
| prod | tag `v*` on a commit that passed staging | manual approval by the owner (decision 62) plus wait timer | real data |

## Tasks

### Repository and pinning

- [ ] **CI-40** Create `aptiverse-labs/.github` with the reusable workflows and composite actions above, a `README.md` describing inputs, and semver tags (`v1`); callers pin by commit sha, Renovate bumps them (implements REPO-10)
- [ ] **CI-44** Pin every third-party action to a full commit sha with the version as a comment, across all repos; add `helpers:pinGitHubActionDigests` to `web/renovate.json` and `infra/renovate.json` *(partial: present in `api/renovate.json` only; no workflow is pinned by sha yet)*
- [ ] **CI-45** Workflow lint: `actionlint` and `zizmor` on every PR touching `.github/`; rules: top-level `permissions: contents: read`, job-level elevation only where needed, no `pull_request_target` with checkout of PR code, no `${{ github.event.* }}` interpolated into `run:`

### Security jobs

- [ ] **CI-41** Reusable gitleaks job: diff scan on PRs, full history scan on main weekly, SARIF uploaded to code scanning, allowlist file reviewed by CODEOWNERS (policy REPO-04)
- [ ] **CI-42** Reusable CodeQL workflow with `language` input and `security-extended` queries, scheduled weekly, required on PRs for api and web (policy REPO-06); infra scans GitHub Actions workflows
- [ ] **CI-43** Reusable SBOM and attestation job: CycloneDX SBOM, `actions/attest-build-provenance` and `actions/attest-sbom` for a given subject digest, with `attestations: write` and `id-token: write` only in that job
- [ ] **CI-97** Runner hardening: `step-security/harden-runner` in audit mode on every job for two weeks, then `egress-policy: block` with an allowlist for deploy jobs (AWS, ECR, GitHub, Sentry, Vercel)

### OIDC and environments

- [ ] **CI-46** OIDC pattern: composite `aws-oidc` wraps `aws-actions/configure-aws-credentials` with `role-session-name` set to `<repo>-<run_id>`; a check fails any workflow or repo secret named `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY`; trust policies stay on `environment:<env>` subjects (`infra/github-oidc.md`)
- [ ] **CI-47** Create GitHub environments `dev`, `staging`, `prod` (plus `global` in infra) in each repo with deployment branch and tag rules (dev and staging: `main`; prod: tags `v*`), required reviewers on prod, and environment-scoped variables for role ARNs *(unverified: GitHub settings, not in the repo)*
- [ ] **CI-94** Staging data refresh workflow: monthly (and on demand) restore the latest prod snapshot into a scratch instance, run the anonymiser (masking names, emails, phone numbers, diary and wellbeing text, payout details; owned by `launch/migration-etl.md` tooling or a dedicated script), dump and restore into staging, delete the scratch instance, and record row counts; never copies raw prod data into staging

### Deployment safety

- [ ] **CI-48** Deployment safety contract, written in the shared README and enforced by the composite actions: immutable artifact built once and promoted by digest; health gate (`/health/ready` plus smoke) before success; ECS circuit breaker rollback is the automatic path and the job fails red on rollback; manual rollback follows `infra/docs/runbooks/rollback-ecs-deploy.md`
- [ ] **CI-49** Migration expand and contract policy: a release may only add (columns nullable or with defaults, new tables, new indexes concurrently); removals ship in a later release after no deployed version reads the object; the destructive-migration check (CI-65) and the PR template checkbox (REPO-08) enforce it
- [ ] **CI-90** Risky release check: a PR labelled `risky` must name a feature flag key in its description (flag mechanism decided in `phase-0/decisions.md`) and the default value off for prod; the check fails otherwise
- [ ] **CI-96** Deploy notifications: every deploy and promotion (api, web, infra) posts env, sha, digest, actor, result and run link to the deploy channel; failures also go to the alert route (`observability/alerting.md`)

### Change management and release

- [ ] **CI-93** Reusable commitlint job validating PR titles (squash merges) and commit messages against conventional commits (policy REPO-05)
- [ ] **CI-91** Release notes: `release-please` (or `git-cliff`) per repo generates the changelog and draft release from conventional commits on main; tagging the release triggers the prod promotion jobs (CI-64, CI-75); release notes list migrations, flags flipped and breaking API changes
- [ ] **CI-95** Required status checks: one table of check names per repo (api, web, infra) maintained here and applied by REPO-02; renaming a job requires updating the table in the same PR
- [ ] **CI-92** Artifact retention policy: test and Playwright reports 14 days, coverage 30 days, migration bundles 14 days (or none after CI-52), SBOMs and attestations kept with releases indefinitely, spec release assets indefinitely; set `retention-days` explicitly on every `upload-artifact`

## Verification

- `grep -rE 'uses: [^@]+@v[0-9]' .github` returns nothing in any repo (all pinned by sha).
- A test PR that commits a fake AWS key is blocked by gitleaks.
- A workflow with `permissions: write-all` fails `workflow-lint`.
- The `prod` environment in each repo shows required reviewers and a `v*` tag rule (screenshot or `gh api repos/:owner/:repo/environments/prod`).
- `gh attestation verify` passes for the latest api image and web release.
- Staging row counts after a refresh are within 1 percent of prod, and a sampled user's email is masked.
- A deploy failure appears in the deploy channel within one minute.

## Open questions

- Org-level `.github` repo with reusable workflows, or org rulesets plus required workflows (GitHub Enterprise feature)? Depends on the GitHub plan (REPO-10).
- Who builds and owns the anonymiser used by CI-94: the Migrator tool or a separate script?
- Release cadence: tag per repo independently, or a coordinated release train that tags api and web together?
- Decided (63): deploy notices go to email (no Slack in v1); failures that page also reach the on-call push app.
