# Terraform state bootstrap

| | |
|---|---|
| ID range | INF-01, INF-26 to INF-29 |
| Phase | 1 |
| Depends on | SEC-01 (rotated AWS credentials), SEC-11 (SES stack off local state) |
| Code path | `infra/bootstrap/` (`main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`, `README.md`) |
| Status | Code done (INF-01). Adoption of the existing bucket, old lock table removal and a state recovery drill are not verified or not started. |

## Purpose

Own the one S3 bucket that holds Terraform state for every other root stack (`envs/global`, `envs/dev`, `envs/staging`, `envs/prod`). This is the only stack with local state. Locking uses S3 native lockfiles (`use_lockfile = true` in every `backend.hcl`), so the old DynamoDB lock table is retired.

## Scope

- Resources: `aws_s3_bucket.state` (`prevent_destroy`), `aws_s3_bucket_ownership_controls` (BucketOwnerEnforced), `aws_s3_bucket_versioning` (Enabled), `aws_s3_bucket_server_side_encryption_configuration` (SSE-KMS, AWS managed key, bucket key on), `aws_s3_bucket_public_access_block` (all four on), `aws_s3_bucket_lifecycle_configuration` (noncurrent versions expire after 90 days keeping the newest 20, abort multipart after 7 days), `aws_s3_bucket_policy` (deny `aws:SecureTransport = false`).
- Inputs: `region` (af-south-1), `state_bucket_name` (`aptiverse-terraform-state-483527586058`).
- Outputs: bucket name and ARN.
- State keys used by other stacks: `v2/global/terraform.tfstate`, `v2/dev/...`, `v2/staging/...`, `v2/prod/...`.
- Accepted finding: `AVD-AWS-0132` (no CMK on the state bucket) in `infra/.trivyignore`.

## Tasks

- [x] **INF-01** `bootstrap/`: state bucket with S3 native locking (drop DynamoDB table). *(`infra/bootstrap/main.tf`; every `envs/*/backend.hcl` sets `use_lockfile = true`)*
- [ ] **INF-26** Adopt the existing bucket: `terraform import aws_s3_bucket.state aptiverse-terraform-state-483527586058`, run `plan`, confirm only in-place changes, apply after review. (split from INF-01) *(unverified: AWS state)*
- [ ] **INF-27** Restrict the state bucket policy to the infra principals: add a statement that denies `s3:GetObject`, `s3:PutObject` and `s3:DeleteObject` on `v2/*` unless the principal is an `aptiverse-*-gha-infra-plan`, `aptiverse-*-gha-infra-apply` role or the break-glass SSO admin permission set. Keep the TLS-only deny.
- [ ] **INF-28** Delete the old `aptiverse-terraform-locks` DynamoDB table and the old `infra/terraform` state keys once the old EC2 stack is decommissioned (CUT-11). Record the deletion in the PR. *(unverified: AWS state; blocked by CUT-11)*
- [ ] **INF-29** State recovery drill: restore a previous version of `v2/dev/terraform.tfstate` with `aws s3api list-object-versions` and `copy-object` into a scratch key, run `terraform plan` against it with a temporary `backend.hcl`, document the steps in `infra/README.md` under "State recovery".

## Verification

- `cd infra/bootstrap && terraform init -backend=false && terraform validate` passes (CI `validate` job covers it).
- `aws s3api get-bucket-versioning --bucket aptiverse-terraform-state-483527586058` returns `Enabled`.
- `aws s3api get-bucket-encryption ...` returns `aws:kms`; `get-public-access-block` returns all four flags true.
- `aws s3api get-bucket-policy ...` contains the `DenyInsecureTransport` statement (and the principal restriction after INF-27).
- `aws dynamodb describe-table --table-name aptiverse-terraform-locks` returns `ResourceNotFoundException` after INF-28.

## Open questions

- Should the state bucket get a CMK once AWS Organizations and a separate prod account arrive (GRW-10)? Today the AWS managed key is accepted (`.trivyignore`).
- Should the bootstrap local state be kept anywhere (for example an encrypted copy in the bucket itself) or is re-import enough? The README says re-import is enough.
