# Change management

| | |
|---|---|
| ID range | `REPO-40` to `REPO-55` |
| Phase | 0 (policy and repo settings), applies to every later phase |
| Owner repo | all three; policy file `docs/process/change-management.md` in infra |
| Depends on | REPO-01 (org repos), REPO-36 (GitHub environments) |
| Status | 1 partial (conventional commits stated in every CLAUDE.md, not enforced), 3 unverified, rest not started |

## Purpose

Every change to production is reviewed, traceable to a PR and a release, reversible, and made at a sensible time. This file defines the process; repo settings it relies on are in `phase-0/repositories.md`.

## Scope

- Branching: trunk based. Short-lived branches, squash merge to `main`, linear history.
- Releases:
  - api and web: semantic versions `vMAJOR.MINOR.PATCH` tagged on `main`; a tag triggers the prod deploy behind a manual approval (CI-16, CI-26).
  - infra: no version tags; every merge to `main` applies (prod behind environment approval, CI-32).
  - The api OpenAPI spec version follows the api release version, so web pins a spec by release.
- Change classes: standard (normal PR), significant (schema change, auth, billing, infra prod, IAM; needs the risk section of the PR template filled and a rollback plan), emergency (see below).
- Freeze windows: NSC and IEB final exam period (roughly late October to end November), mid-year exams (June), cutover week (CUT), and any affiliate payout run day.

## Tasks

- [ ] **REPO-40** Write `docs/process/change-management.md`: branching, change classes, approvals, freeze windows, emergency process, and links to the PR templates
- [ ] **REPO-41** Conventional commits enforced (commitlint jobs REPO-05, REPO-22, REPO-23) and PR titles checked, since squash merge uses the title *(partial: rule stated in all three CLAUDE.md files, not enforced)*
- [ ] **REPO-42** Versioning scheme: semver for api and web; breaking API changes (label from CI-06) bump MAJOR of the spec and need a coordinated web release
- [ ] **REPO-43** Release automation in api: release-please (or equivalent) opens a release PR from conventional commits, creates the tag and GitHub release with notes
- [ ] **REPO-44** Release automation in web (same tool and config shape as api)
- [ ] **REPO-45** Infra change log: the apply workflow appends the merged PR title and plan summary to the GitHub deployment record for each env
- [ ] **REPO-46** Release notes template: user-facing changes, migrations (expand or contract step), feature flags flipped, rollback instructions, linked spec version
- [ ] **REPO-47** Production approvals: `prod` GitHub environment requires a named reviewer, waits for staging success, and only accepts `v*` tags (api, web) or `main` (infra) *(unverified: GitHub settings, see REPO-36)*
- [ ] **REPO-48** Significant-change checklist in the PR templates: data migration reviewed, expand and contract step named, feature flag named (ARC-18), rollback tested in staging, on-call aware
- [ ] **REPO-49** Freeze calendar: publish the exam and cutover freeze dates for the current year; deploys to prod during a freeze need the emergency process
- [ ] **REPO-50** Emergency change process: who may approve, hotfix branch from the last release tag, minimum checks that may not be skipped (build, tests, image scan), retro within 2 working days logged as a postmortem (template in `launch/incident-management.md`)
- [ ] **REPO-51** Deploy announcement: prod deploy posts the release notes link to the ops channel or email list *(unverified: channel not chosen)*
- [ ] **REPO-52** Change record retention: GitHub releases and deployment history kept; quarterly export of deployment history to the docs bucket *(unverified: depends on REPO-43 to REPO-45)*
- [ ] **REPO-53** CODEOWNERS paths double as the significant-change list (REPO-07, REPO-26, REPO-27); keep them in sync with the change classes
- [ ] **REPO-54** Dependency update rule: Renovate patch and minor for actions automerge (infra already), everything else through a normal PR with green checks
- [ ] **REPO-55** Monthly change review: list prod deploys, rollbacks and emergency changes; track change failure rate and lead time (DORA) in the ops dashboard

## Verification

- A merged PR in each repo shows the template filled, required checks green, and a review.
- `gh release list` in api and web shows releases with generated notes after REPO-43 and REPO-44.
- A prod deploy run in GitHub Actions shows the environment approval step with the reviewer's name.
- The freeze calendar exists and the last emergency change has a linked postmortem.

## Open questions

- Decided (62): no second person; required checks only, and the owner manually approves prod deploys (self-approval allowed in the `prod` environment).
- Exam freeze dates differ between NSC and IEB; use the union?
