# API pipeline

| | |
|---|---|
| ID range | `CI-01` to `CI-19`, `CI-50` to `CI-69` |
| Phase | 1 (deploy and promotion tasks finish before Phase 2 exit) |
| Depends on | `infra/ecr.md`, `infra/service.md`, `infra/github-oidc.md`, `ci/infra-pipeline.md` (single env dispatch), `ci/shared-workflows.md`, REPO-02, REPO-10 |
| Code path | `api/.github/workflows/ci.yml`, `api/Dockerfile`, `api/.dockerignore`, `api/scripts/migrations-bundle.sh`, `api/src/Aptiverse.Host/Infrastructure/MigrateCommand.cs` |
| Status | Build half done: 39 tasks: 5 done, 6 partial, 0 unverified, 28 not started. No deploy, migration run, smoke test, rollback proof or promotion exists yet. |

## Purpose

Turn every merge to `main` in `aptiverse-labs/api` into one immutable, scanned, signed image that is deployed to dev, then promoted by digest to staging and prod without rebuilding. The pipeline also owns the API contract (OpenAPI) that the web repo consumes, and the migration step that runs before every rollout.

## Scope

Workflow `api/.github/workflows/ci.yml` (today one file, two jobs: `build-test` and `image`). Target shape:

| Job | Trigger | Does | Outputs |
|---|---|---|---|
| `build-test` | PR and push to main | locked restore, format, build, tests, coverage, OpenAPI drift and breaking-change check, pending model check, vulnerable package gate | coverage report, `openapi-<sha>` artifact |
| `codeql` | PR, push, weekly | CodeQL C# analysis (reusable workflow from `ci/shared-workflows.md`) | code scanning alerts |
| `image` | PR (build only), push to main | buildx `linux/arm64`, Trivy, SBOM, push by sha, provenance attestation | image digest |
| `publish-spec` | push to main | versioned spec release asset | `openapi-v1.<run>.json` release asset |
| `deploy-dev` | after `image` on main | OIDC role, SSM tag, infra apply for dev, migration task, wait stable, smoke, deploy marker | deploy record |
| `deploy-staging` | after `deploy-dev` passes | same digest, environment `staging` | deploy record |
| `deploy-prod` | tag `v*` | same digest, environment `prod` with required reviewers | deploy record, release notes |

Inputs: repository variables `AWS_REGION`, `ECR_REGISTRY`, per environment variables `AWS_DEPLOY_ROLE_ARN` (from the `github_role_arns` output, `infra/github-oidc.md`), `API_BASE_URL`; secrets for the smoke test user per environment. Never long-lived AWS keys.

Image naming contract: ECR repositories are `aptiverse-<env>/api` (`infra/modules/ecr`, called with `name_prefix = aptiverse-<env>`). The current workflow builds `<registry>/aptiverse-api`, which matches no repository. CI-53 fixes this and CI-63 settles how one digest reaches three per-env repositories.

## Tasks

### Build and test

- [ ] **CI-01** Restore with locked NuGet cache *(partial: `actions/cache` keyed on `Directory.Packages.props`, csproj and `global.json`; no `packages.lock.json`, so restore is not locked)*
- [ ] **CI-17** Enable `RestorePackagesWithLockFile` in `Directory.Build.props`, commit `packages.lock.json` for every project, and restore with `--locked-mode` in CI and the Dockerfile (split from CI-01)
- [x] **CI-02** `dotnet format --verify-no-changes` (step `Format` in `ci.yml`)
- [x] **CI-03** Build with analyzers and warnings-as-errors (`TreatWarningsAsErrors` and `EnableNETAnalyzers` in `Directory.Build.props`, Release build in `ci.yml`)
- [x] **CI-04** Unit and architecture tests (`dotnet test --solution Aptiverse.slnx` runs `Aptiverse.ArchitectureTests` and `Aptiverse.Support.UnitTests`)
- [ ] **CI-05** Integration tests with Testcontainers Postgres, coverage report *(partial: `Aptiverse.IntegrationTests` runs with Testcontainers in the same test step; no coverage is collected)*
- [ ] **CI-18** Collect coverage with `coverlet.collector` (Cobertura), publish a summary to the job summary and as a PR comment, and fail below an agreed floor (start at the current figure, ratchet up; never fail on a drop under 0.5 points) (split from CI-05)
- [ ] **CI-69** Dependency vulnerability gate: `dotnet list package --vulnerable --include-transitive` fails the build on high or critical advisories unless listed with a reason and expiry date in `.vulnerability-allowlist` (policy in `phase-0/security-baseline.md`)
- [ ] **CI-68** CodeQL C# job using the shared reusable workflow (`ci/shared-workflows.md`), `security-extended` queries, on PR, push and a weekly schedule; high findings block merge (policy in `phase-0/repositories.md`)

### Contract

- [ ] **CI-06** Generate OpenAPI, diff against main, breaking-change label gate *(partial: build regenerates `openapi/v1.json` and the job fails when it differs from the committed file; no diff against main and no label gate)*
- [ ] **CI-19** Run `oasdiff breaking` between `main`'s `openapi/v1.json` and the PR's copy; post the result as a PR comment; fail unless the PR carries the `api-breaking` label and a linked web PR (split from CI-06)
- [ ] **CI-07** Publish spec as a versioned artifact *(partial: `openapi-<sha>` uploaded as a workflow artifact, which expires and is not addressable by version)*
- [ ] **CI-50** On push to main, publish `openapi/v1.json` as a GitHub release asset with a monotonic version (`spec-v1.<run_number>` plus the git sha in the release body) and dispatch `repository_dispatch` to web so CI-22 can open the bot PR (split from CI-07)

### Migrations

- [ ] **CI-08** `dotnet ef migrations bundle` per module, pending-model-changes check *(partial: both run for `Support` only; `Identity` and `Notifications` modules exist with their own DbContexts but are missing from the loop in `ci.yml` and `MODULES` in `scripts/migrations-bundle.sh`)*
- [ ] **CI-51** Derive the module list from one source (a `modules.txt` or a glob over `src/Modules/*/Aptiverse.*/*DbContext.cs`) used by both the pending-model check and the bundle script, so a new module cannot be skipped; add an architecture or script test that fails when a DbContext is not listed (split from CI-08)
- [ ] **CI-52** Decide bundles versus the image's `migrate` command (`MigrateCommand.cs`, already wired as the infra migration task command). Recommendation: keep the `migrate` command as the deploy path (one artifact, signed with the image) and keep bundle generation only as a build check, or delete it. Record the choice in `api/README.md` and the script header (split from CI-08)
- [ ] **CI-65** Expand and contract gate: a script scans new migration files for destructive operations (`DropColumn`, `DropTable`, `RenameColumn`, `RenameTable`, `AlterColumn` narrowing type or adding `NOT NULL` without default) and fails unless the PR has the `destructive-migration` label and the PR template checkbox (REPO-08) is ticked; the label also requires that the previous release no longer reads the dropped object

### Image

- [x] **CI-09** Multi-stage Dockerfile (chiselled base, non-root, `.dockerignore`) (`api/Dockerfile` uses `aspnet:10.0-noble-chiseled-extra`, `USER $APP_UID`; `api/.dockerignore` excludes `.env`, tests, docs)
- [x] **CI-10** Trivy image scan (`aquasecurity/trivy-action@0.28.0`, CRITICAL and HIGH, `ignore-unfixed`, exit code 1)
- [ ] **CI-11** Push to ECR tagged with git sha (never `:latest`) *(partial: pushes `${IMAGE}:${GITHUB_SHA}` on main when `AWS_ROLE_ARN` and `ECR_REGISTRY` are set; image name `aptiverse-api` does not match the ECR repository `aptiverse-<env>/api`)*
- [ ] **CI-53** Change the image name to the dev repository `${ECR_REGISTRY}/aptiverse-dev/api`, use the per-env `AWS_DEPLOY_ROLE_ARN` (the role in `infra/github-oidc.md` that has `EcrPush` on that repository), and capture the pushed digest as a job output (split from CI-11)
- [ ] **CI-59** Generate a CycloneDX SBOM for the image (`syft` or `anchore/sbom-action`, pinned by digest), upload it as an artifact, attach it to the GitHub release on tags, and attest it to the image (`actions/attest-sbom`)
- [ ] **CI-60** Attest build provenance for the pushed digest (`actions/attest-build-provenance`, SLSA v1 predicate) and, if ECR consumers need it, sign with `cosign sign` keyless via GitHub OIDC
- [ ] **CI-61** Verify before every deploy: `gh attestation verify oci://<image>@<digest> --owner aptiverse-labs` (or `cosign verify` with the expected workflow identity) in each deploy job; a failed verification stops the deploy
- [ ] **CI-62** Deploy by digest: the deploy jobs pass `sha` plus digest, check with `aws ecr describe-images` that the tag still resolves to the expected digest (tags are immutable, but this guards a repo recreated by hand), and the SSM parameter records the sha used by `envs/<env>` (see `infra/service.md` for whether the task definition should reference `@sha256:` directly)

### Deploy to dev

- [ ] **CI-12** Run migration bundle as one-off ECS task (with CI-52 this is the `migrate` task definition `aptiverse-<env>-api-migrate`): `aws ecs run-task` with the `migration_network_configuration` output, `aws ecs wait tasks-stopped`, then fail the job if the container exit code is not 0, printing the last 200 lines of the `migrate` log stream
- [ ] **CI-13** ECS rolling deploy (api and worker) (umbrella; done when CI-54 to CI-57 are done)
- [ ] **CI-54** Deploy job assumes the per-env deploy role through OIDC inside the GitHub environment `dev` (`permissions: id-token: write`, `contents: read` only) (split from CI-13)
- [ ] **CI-55** Write the sha to `/aptiverse/<env>/api/image-tag` with `aws ssm put-parameter --overwrite` and keep the previous value as a job output for rollback (split from CI-13)
- [ ] **CI-56** Dispatch the infra apply for that one environment (`workflow_dispatch` with a `stack` input, see `ci/infra-pipeline.md`) and wait for the run to finish with `gh run watch --exit-status`; needs a fine-grained token or GitHub App with `actions: write` on `aptiverse-labs/infra` only (split from CI-13)
- [ ] **CI-57** After the apply, run migrations (CI-12), then `aws ecs wait services-stable` for api and worker with a 15 minute ceiling; fail if `rolloutState` is `FAILED` (circuit breaker rolled back) and print `rolloutStateReason` (split from CI-13)
- [ ] **CI-67** Concurrency and timeouts: one deploy per environment at a time (`concurrency: deploy-<env>`, `cancel-in-progress: false`), `timeout-minutes` on every job (build 30, image 30, deploy 40), and a run that is superseded on main skips its deploy instead of queuing behind it

### Verify and record

- [ ] **CI-14** Smoke test `/health/ready` and one authenticated call: `curl --fail` on `https://<api host>/health/ready` with retries for 2 minutes, then log in as the per-env synthetic smoke user (secret in the environment) and call one authenticated read; failure triggers CI-15's rollback path
- [ ] **CI-58** Record a deploy marker: Sentry release `aptiverse-api@<sha>` with `sentry-cli releases new`, `set-commits --auto`, `deploys new -e <env>`, plus a Grafana annotation (tag `deploy`, env, sha) for the dashboards in `observability/dashboards.md`
- [ ] **CI-15** Prove rollback by shipping a deliberately broken build: a branch that fails `/health/ready` is deployed to dev, the circuit breaker rolls back, CI-57 fails red, the SSM tag is reset to the previous sha (CI-55 output), and the run is linked from `infra/docs/runbooks/rollback-ecs-deploy.md`
- [ ] **CI-66** Deploy freeze: a repository variable `DEPLOY_FREEZE_<ENV>` (or a `freeze` file in infra) makes the deploy job exit early with a clear message; overriding needs the `freeze-override` environment reviewer; used for the cutover week (`launch/cutover.md`)

### Promotion

- [ ] **CI-16** Staging promotion after dev passes; prod on tag with manual approval (umbrella; done when CI-63 and CI-64 are done)
- [ ] **CI-63** Promote the same digest, never rebuild: after `deploy-dev` succeeds, copy the image by digest from `aptiverse-dev/api` to `aptiverse-staging/api` (`crane copy` or `aws ecr batch-get-image` plus `put-image` with the same manifest), verify the digest is identical and the attestation still verifies, then deploy staging with CI-54 to CI-58. Alternative recorded in `infra/ecr.md`: one shared repository read by all envs (split from CI-16)
- [ ] **CI-64** Prod deploys only from a `v*` tag whose commit already passed staging; the job runs in the GitHub environment `prod` with required reviewers and a wait timer, uses the digest recorded by the staging run (look it up, do not rebuild), and is blocked when staging's smoke test for that sha failed (split from CI-16)

### Release

- Release notes for tags come from conventional commits through the shared release workflow (`ci/shared-workflows.md`); the prod deploy job links the release.

## Verification

- A PR that edits a response record without regenerating `openapi/v1.json` fails `build-test`.
- A PR that removes a response property fails CI-19 until labelled `api-breaking`.
- A PR adding a `DropColumn` migration fails CI-65 until labelled.
- A merge to main produces exactly one image in `aptiverse-dev/api` tagged with the sha, a provenance attestation, an SBOM artifact, and a spec release asset.
- `gh attestation verify` passes for the digest running in each environment (`aws ecs describe-tasks` shows the image).
- The digest in staging and prod equals the digest built on main (compare `imageDigest` from `describe-tasks` across envs).
- The CI-15 broken build ends with the previous task definition serving traffic and a red run.
- No workflow file contains `aws-access-key-id`; all AWS access is OIDC.

## Open questions

- Per-env ECR repositories (current Terraform) make promotion a copy step; would one shared repository with per-env pull permissions be simpler? Decide with `infra/ecr.md`.
- Keep migration bundles at all once the `migrate` command is the deploy path (CI-52)?
- Who owns the cross-repo token that lets api dispatch infra applies (GitHub App preferred)?
- Coverage floor value and whether integration tests count toward it.
- The infra README says the deploy runs bundles as tasks; `MigrateCommand.cs` says the image migrates. The docs need one story after CI-52.
