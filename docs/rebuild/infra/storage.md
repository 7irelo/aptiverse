# Storage module (S3 uploads and exports)

| | |
|---|---|
| ID range | INF-14, INF-15, INF-58 to INF-63 |
| Phase | 1 (DR and purge hooks by 10) |
| Depends on | INF-02 |
| Code path | `infra/modules/storage/`; task access in `envs/*/main.tf` (`data.aws_iam_policy_document.app`) |
| Status | INF-15 done in code. INF-14 partial (one bucket with prefixes, not separate uploads and exports buckets). Key decision, CORS for previews, object-level audit, POPIA purge support and DR copies are open. |

## Purpose

Private storage for student uploads (assessment files, SBA evidence) and short-lived exports (data export requests, CSVs), written by presigned PUT from the browser and read by short-lived presigned GET. Replaces local-disk uploads that the old deploy destroyed.

## Scope

- Resources: `aws_s3_bucket` (`<name>-uploads-<account id>`, `force_destroy` false), ownership controls (BucketOwnerEnforced), public access block (all four), versioning (Enabled), SSE-KMS (`kms_master_key_id` from `kms_key_arn`, null means `aws/s3`, bucket key on), lifecycle (abort multipart 7 days, noncurrent versions expire after 30 days plus expired delete markers, `exports/` expire after 7 days, `tmp/` after 2 days), CORS (`PUT`, `GET`, `HEAD` from `cors_allowed_origins`, limited headers, `ETag` exposed, max age 3000), bucket policy denying non-TLS access.
- Inputs: `bucket_name`, `cors_allowed_origins` (= `web_origins`: dev `https://dev.aptiverse.co.za` and `http://localhost:3000`, staging `https://staging.aptiverse.co.za`, prod apex, `www` and `app`), `noncurrent_version_expiry_days`, `exports_expiry_days`, `tmp_expiry_days`, `kms_key_arn`, `force_destroy`, `tags`.
- Outputs: `bucket_name`, `bucket_arn`.
- Key layout expected by the api: `uploads/...`, `exports/...`, `tmp/...` (to be confirmed in the config contract, INF-49).

## Tasks

- [ ] **INF-14** `modules/storage`: uploads bucket (private, versioned), exports bucket, lifecycle rules. *(partial: one private versioned bucket with an `exports/` prefix lifecycle; no separate exports bucket)*
- [x] **INF-15** `modules/storage`: CORS for presigned PUT from the web origins. *(`aws_s3_bucket_cors_configuration.this`)*
- [ ] **INF-58** Decide one bucket with prefixes versus a separate exports bucket (separate lifecycle, separate IAM, no versioning needed for exports) and either close INF-14 by recording "prefix is the design" in the module README or add the second bucket. (split from INF-14)
- [ ] **INF-59** Key decision for S3: keep `aws/s3` or use a per-env CMK from `account-security.md` (INF-121). A CMK lets the key policy, not only IAM, limit who can decrypt student files, and is required for cross-account replication later.
- [ ] **INF-60** Preview deployments and CORS: Vercel preview URLs change per PR. Decide whether previews upload at all (recommended: previews talk to the dev API and use the stable `dev` origin through a proxy path, or uploads are disabled in previews). Never allow a wildcard origin. Record in `vercel.md`.
- [ ] **INF-61** Object-level audit: enable CloudTrail data events (`PutObject`, `GetObject`, `DeleteObject`) for the uploads bucket in prod only, delivered to the trail in `account-security.md`, so access to a student's files can be answered for a POPIA request.
- [ ] **INF-62** POPIA erasure support: deletes must remove all versions, not only add a delete marker. Grant the worker role `s3:DeleteObjectVersion` on `uploads/*` (with INF-45) and document that account deletion purges every version; noncurrent expiry (30 days) is the backstop. Coordinate the retention schedule with `launch/popia.md`.
- [ ] **INF-63** Upload abuse limits at the bucket: deny `PutObject` without `x-amz-server-side-encryption` matching the bucket key and deny objects outside the `uploads/`, `exports/` and `tmp/` prefixes; content type and size limits stay in the presign conditions in the api. Cross-region copies are in `backup.md`.

## Verification

- `terraform -chdir=infra/modules/storage init -backend=false && terraform validate`.
- `aws s3api get-public-access-block --bucket <bucket>` returns four true flags; `get-bucket-versioning` returns `Enabled`; `get-bucket-encryption` returns `aws:kms`.
- `aws s3api get-bucket-lifecycle-configuration --bucket <bucket>` lists the four rules.
- A browser `fetch` PUT to a presigned URL from `https://dev.aptiverse.co.za` succeeds; the same from another origin fails the CORS preflight.
- `curl http://<bucket>.s3.af-south-1.amazonaws.com/x` (plain HTTP) is denied by the TLS-only policy.

## Open questions

- Should uploads move to Glacier Instant Retrieval after a year to save cost, or is the volume too small to matter?
- Who owns the malware scan of uploads (GuardDuty Malware Protection for S3 in `account-security.md`, or magic-byte checks only in the api)?
