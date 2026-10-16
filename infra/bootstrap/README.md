# bootstrap

Owns the Terraform state bucket `aptiverse-terraform-state-483527586058` (af-south-1): versioning, SSE-KMS, public access block, TLS-only policy, old-version expiry. Nothing else.

- Local state (the only stack without remote state). Keep the local `terraform.tfstate` out of git; it holds nothing sensitive, but it is not needed once the bucket is adopted.
- Locking is S3 native (`use_lockfile = true`); there is no DynamoDB table.
- The bucket already exists, so adopt it with `terraform import` (see the header of `main.tf`) and apply only after reviewing the plan.
