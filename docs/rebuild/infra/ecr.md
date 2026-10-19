# ECR module

| | |
|---|---|
| ID range | INF-08, INF-40 to INF-44 |
| Phase | 1 |
| Depends on | INF-02 |
| Code path | `infra/modules/ecr/`, used by `envs/*/main.tf` (`module "ecr"`) |
| Status | INF-08, INF-40 and INF-41 done in code: one shared `aptiverse/api` repository in `envs/global`. Digest pinning, enhanced scanning and signature verification not started. |

## Purpose

Hold the one api container image (used for the api, worker and migration roles) with immutable tags so what was tested is exactly what runs.

## Scope

- Resources: `aws_ecr_repository` (`image_tag_mutability = IMMUTABLE`, `force_delete = false`, `scan_on_push = true`, AES256 or KMS by `kms_key_arn`), `aws_ecr_lifecycle_policy` (expire untagged after `untagged_expiry_days` 7, keep the newest `keep_tagged_images` 30).
- Inputs: `name_prefix` (`aptiverse-<env>`), `repositories` (`["api"]`), `keep_tagged_images`, `untagged_expiry_days`, `kms_key_arn`, `tags`.
- Outputs: `repository_urls`, `repository_arns`.
- Today each env creates `aptiverse-<env>/api`. The api CI (`api/.github/workflows/ci.yml`) pushes to `${ECR_REGISTRY}/aptiverse-api`, which does not exist.

## Tasks

- [x] **INF-08** `modules/ecr`: repository, lifecycle policy, scan on push. *(`infra/modules/ecr/main.tf`)*
- [x] **INF-40** Resolve the repository name contradiction: either the api pipeline pushes to `aptiverse-<env>/api` (output `ecr_repository_url`) or infra creates the name the pipeline uses. Update `infra/README.md` "Deploying the api" and hand the agreed name to `ci/api-pipeline.md`. (done: one name, `aptiverse/api`, created in `envs/global`; the api pipeline pushes there and `infra/README.md` says so)
- [x] **INF-41** Promotion model for immutable artifacts: build once, promote the same digest dev to staging to prod. Pick one: (a) a single shared repository in `envs/global` (`aptiverse/api`) that every env pulls from, with the env deploy roles granted push only from dev and pull everywhere; or (b) per-env repositories with ECR replication or a promotion job that copies the manifest by digest (`crane copy` or `aws ecr batch-get-image` plus `put-image`). Record the choice in `phase-0/decisions.md` via its owner, implement it here, and remove the other path. (done: option (a): a shared repository in `envs/global`, envs read `api_repository_url` and `api_repository_arn` from global state, per-env repositories are released from state with a `removed` block (`destroy = false`); deploy roles still have push in every env, narrowing that to dev is INF-38)
- [ ] **INF-42** Digest pinning: the deployed image reference becomes `<repo>@sha256:<digest>` instead of `<repo>:<sha>`. Store the digest next to the sha in SSM (`/aptiverse/<env>/api/image-digest`), build `local.image` from it in `envs/*/main.tf`, and grant the api deploy role `ssm:PutParameter` on the new parameter in `github-oidc.md`.
- [ ] **INF-43** Enhanced scanning: decide between basic scan on push (today) and Amazon Inspector enhanced scanning with continuous rescans of images in use; if enabled, set `aws_ecr_registry_scanning_configuration` (rules for `aptiverse-*`) and route Inspector findings of HIGH or CRITICAL to the alarm topic.
- [ ] **INF-44** Signature verification: once the api pipeline signs images (cosign keyless or AWS Signer with Notation, see `ci/api-pipeline.md`), enforce verification before deploy (a pipeline verify step plus, if AWS Signer is chosen, a signing profile managed here). Document the trust root in the module README.

## Verification

- `aws ecr describe-repositories --query 'repositories[].[repositoryName,imageTagMutability,imageScanningConfiguration.scanOnPush]'` shows `IMMUTABLE` and `true`.
- Pushing the same tag twice fails with `ImageTagAlreadyExistsException`.
- `aws ecr get-lifecycle-policy --repository-name <name>` matches the two rules.
- After INF-41: the task definition image in staging and prod has the same digest as the one tested in dev (`aws ecs describe-task-definition ... --query 'taskDefinition.containerDefinitions[0].image'`).

## Open questions

- Shared repository (simpler promotion) versus per-env repositories (cleaner when prod moves to its own AWS account, GRW-10)?
- Is 30 retained images enough to roll back across a busy week of merges to main? Each merge produces one image.
