# Phase 0 repositories

| | |
|---|---|
| ID range | `REPO-01` to `REPO-39` |
| Phase | 0 |
| Owner repo | `aptiverse-labs/api`, `aptiverse-labs/web`, `aptiverse-labs/infra` |
| Depends on | ARC-02 (three repos, done by ADR 0006) |
| Status | 6 done (Renovate x3, CLAUDE.md x3), 0 partial, 14 unverified (GitHub org settings), rest not started |

## Purpose

Finish the move to the three org repos and give each the same guardrails, so code only reaches `main` through reviewed, checked PRs.

## Scope

- Current state of this tree: one working copy with `origin` = `7irelo/aptiverse` (old monorepo). `api/`, `web/` and `infra/` each carry their own `.github/workflows`, which GitHub only runs once each folder is its own repo (GitHub reads the root `.github` only). Until the split, none of the new CI runs.
- Per repo files to add: `.github/CODEOWNERS`, `.github/pull_request_template.md`, `.github/workflows/codeql.yml` (api, web), `.github/workflows/gitleaks.yml` or a job in `ci.yml`, `commitlint.config.*` plus a CI job, `.gitleaks.toml`, pre-commit config.
- Existing: `api/renovate.json` (pins action digests), `web/renovate.json`, `infra/renovate.json` (neither pins digests); `api/CLAUDE.md`, `web/CLAUDE.md`, `infra/CLAUDE.md` (new rules).
- Change process rules (reviews, releases, freezes) are in `phase-0/change-management.md`.

## Tasks

### Move

- [ ] **REPO-01** Finish move to `aptiverse-labs/{api,web,infra}` with history for each subfolder (`git subtree split` or `git filter-repo`) *(partial: on 2026-10-19 the rebuild-era commits were replayed onto each org repo's `main` and pushed as a `rebuild` branch, trailer-free and fast-forwardable from `main`; `main` stays on the old app until cutover (FIX-25). Workflows only trigger on `main` and pull requests, so CI runs once a pull request from `rebuild` is open)*
- [ ] **REPO-11** Confirm each org repo's first CI run is green (api `ci`, web `CI`, infra `ci`) (split from REPO-01) *(unverified: GitHub Actions)*
- [ ] **REPO-12** Repoint local working copies to the org remotes and retire the combined tree (split from REPO-01) *(unverified: each machine)*

### Branch protection (REPO-02)

- [ ] **REPO-02** Branch protection on `api` `main`: PR required, required checks `Format, build, test, contract` and `Container image`, no force push, no deletion *(unverified: GitHub settings)*
- [ ] **REPO-13** Branch protection on `web` `main`: required check `Lint, typecheck, unit tests, codegen, build, e2e` *(unverified: GitHub settings)*
- [ ] **REPO-14** Branch protection on `infra` `main`: required checks `terraform fmt`, every `validate (...)` matrix entry, `tflint`, `trivy config` *(unverified: GitHub settings)*

### Renovate (REPO-03)

- [x] **REPO-03** Renovate config in `api` (done: `api/renovate.json`, groups .NET platform, Wolverine, OTel, test tooling, images; pins action digests)
- [x] **REPO-15** Renovate config in `web` (done: `web/renovate.json`, lock file maintenance, non-major grouping)
- [x] **REPO-16** Renovate config in `infra` (done: `infra/renovate.json`, providers grouped, majors need dashboard approval)
- [ ] **REPO-17** Pin GitHub Action digests in `web` and `infra` (`helpers:pinGitHubActionDigests`), matching `api`
- [ ] **REPO-18** Install the Renovate GitHub app on the three org repos and confirm the dependency dashboard issue appears *(unverified: GitHub app)*

### gitleaks (REPO-04)

- [ ] **REPO-04** gitleaks CI job in `api` (full history on push to main, diff on PR)
- [ ] **REPO-19** gitleaks CI job in `web`
- [ ] **REPO-20** gitleaks CI job in `infra`
- [ ] **REPO-21** gitleaks pre-commit hook documented in each repo's README (pre-commit or lefthook config committed)

### commitlint (REPO-05)

- [ ] **REPO-05** commitlint with conventional commits in `api` (CI job on PR titles and commits; types from `api/CLAUDE.md`)
- [ ] **REPO-22** commitlint in `web`
- [ ] **REPO-23** commitlint in `infra`

### CodeQL (REPO-06)

- [ ] **REPO-06** CodeQL workflow in `api` (csharp, build-mode autobuild or manual, weekly schedule plus PR)
- [ ] **REPO-24** CodeQL workflow in `web` (javascript-typescript)
- [ ] **REPO-25** Code scanning for `infra` via Trivy SARIF upload from the existing `trivy config` job

### CODEOWNERS (REPO-07)

- [ ] **REPO-07** CODEOWNERS in `api` (default owner; `src/Modules/Billing`, `src/Modules/Identity`, `openapi/` need the owner's review)
- [ ] **REPO-26** CODEOWNERS in `web` (`src/lib/auth`, `src/app/api/bff`, `next.config.ts` flagged)
- [ ] **REPO-27** CODEOWNERS in `infra` (`envs/prod`, `modules/github-oidc`, `modules/database` flagged)

### PR template (REPO-08)

- [ ] **REPO-08** PR template in `api` with destructive-migration checkbox, expand and contract confirmation, risk level, rollback plan, and "OpenAPI changed" checkbox
- [ ] **REPO-28** PR template in `web` (screenshots at 360 and 1440, light and dark, axe run, no hand-written API types)
- [ ] **REPO-29** PR template in `infra` (plan reviewed, data-protection settings unchanged or justified, cost impact)

### CLAUDE.md (REPO-09)

- [x] **REPO-09** New `CLAUDE.md` in `api` describing the new rules (done: `api/CLAUDE.md`)
- [x] **REPO-30** New `CLAUDE.md` in `web` (done: `web/CLAUDE.md`)
- [x] **REPO-31** New `CLAUDE.md` in `infra` (done: `infra/CLAUDE.md`)

### Shared workflows (REPO-10)

- [ ] **REPO-10** Shared reusable-workflow repo (`aptiverse-labs/.github`) or org workflow templates; pipeline details in `ci/shared-workflows.md`

### Org security settings (added)

- [ ] **REPO-32** Require at least one approving review and dismiss stale approvals on all three repos; require review from CODEOWNERS *(unverified: GitHub settings; with a single developer, decide whether an AI review plus self-approval via a second account is acceptable)*
- [ ] **REPO-33** Require linear history (squash merge only) and delete branches on merge on all three repos *(unverified: GitHub settings)*
- [ ] **REPO-34** Decision and setting: signed commits required or not; if yes, document SSH signing setup in each README *(unverified: owner decision)*
- [ ] **REPO-35** Tag protection (repository rulesets) for `v*` tags: only the release workflow or admins can create them *(unverified: GitHub settings)*
- [ ] **REPO-36** GitHub environments `dev`, `staging`, `prod` (and `global` in infra) with required reviewers on `prod` and `global`, deployment branch rule `main` and tags `v*` only *(unverified: GitHub settings)*
- [ ] **REPO-37** Enable Dependabot security alerts and the dependency graph on all three repos (Renovate does the update PRs) *(unverified: GitHub settings)*
- [ ] **REPO-38** Enable secret scanning with push protection on all three repos *(unverified: GitHub settings)*
- [ ] **REPO-39** Release notes automation per repo (release-please or GitHub generated notes from conventional commits); details in `phase-0/change-management.md`

## Verification

- `gh api repos/aptiverse-labs/<repo>/branches/main/protection` shows required checks and reviews for each repo.
- A test PR that adds a fake AWS key fails gitleaks and is blocked by push protection.
- A PR titled `update stuff` fails commitlint.
- CodeQL results appear under Security, Code scanning for api and web.
- `gh api repos/aptiverse-labs/<repo>/environments` lists `prod` with a reviewer rule.

## Open questions

- Decided (1): three org repos. Still open: is `web` meant to be public? It changes CodeQL cost, secret scanning availability and the risk of the CSP and BFF details being public.
- Decided (62): required status checks only, no required reviewer; manual approval for prod deploys.
