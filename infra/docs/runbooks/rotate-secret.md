# Runbook: rotate a secret

Applies to the app secrets under `aptiverse/<env>/...` in Secrets Manager. Values are never stored in Terraform or git.

## RDS master password

RDS manages it. Rotate on demand with:

```bash
aws secretsmanager rotate-secret --secret-id <db_master_secret_arn output>
```

Running tasks keep their existing connections; force a new deployment (below) so new tasks read the new value.

## App secrets (JWT key, Paystack, Anthropic, Sentry, OTLP, OAuth)

1. Issue the new credential at the provider (or generate a new ES256 key for `jwt-signing-key`). Keep the old one valid for now.
2. Write it without leaving a copy on disk or in shell history:
   ```bash
   aws secretsmanager put-secret-value --secret-id aptiverse/<env>/<name> --secret-string file://new.json
   shred -u new.json   # or delete securely
   ```
   For JSON secrets, keep every key the task definitions reference (for example `secret_key` and `webhook_secret` for Paystack); a missing key stops tasks from starting.
3. Roll the services so tasks pick up the new value (ECS reads secrets only at task start):
   ```bash
   aws ecs update-service --cluster aptiverse-<env> --service aptiverse-<env>-api --force-new-deployment
   aws ecs update-service --cluster aptiverse-<env> --service aptiverse-<env>-worker --force-new-deployment
   ```
4. Confirm `/health/ready` and one authenticated call, then revoke the old credential at the provider.

## JWT signing key specifics

Publish the new public key in the JWKS alongside the old one before switching signing, and keep the old key in the JWKS for at least the access token lifetime (15 minutes) plus refresh grace. Only then drop it.

## If a secret leaked

Revoke first at the provider, then follow the steps above, then review CloudTrail for use of the leaked value.
