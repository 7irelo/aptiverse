# storage

Private S3 bucket for uploads and exports.

- Block public access on all four settings, `BucketOwnerEnforced` (ACLs disabled), TLS-only bucket policy.
- Versioning on; SSE-KMS with a bucket key (AWS managed key unless `kms_key_arn` is set).
- Lifecycle: abort incomplete multipart uploads after 7 days, expire noncurrent versions after `noncurrent_version_expiry_days`, expire `exports/` after `exports_expiry_days` and `tmp/` after `tmp_expiry_days`.
- CORS allows `PUT`, `GET` and `HEAD` from `cors_allowed_origins` so the browser can upload straight to S3 with a presigned URL issued by the api. `ETag` is exposed for multipart uploads.

Key layout convention for the api: `uploads/<owner-id>/<guid>`, `exports/<job-id>/...`, `tmp/...` for uploads not yet confirmed.
