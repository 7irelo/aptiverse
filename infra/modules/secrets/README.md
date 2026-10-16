# secrets

Creates empty Secrets Manager secrets named `<name_prefix>/<key>` for application credentials (JWT signing key, Auth.js session secret, Paystack, Anthropic, Sentry DSN, Google OAuth, Meta CAPI, Grafana OTLP by default).

There is deliberately no secret version resource: values are set out of band so they never enter Terraform state or plans.

```bash
aws secretsmanager put-secret-value \
  --secret-id aptiverse/dev/anthropic \
  --secret-string file://anthropic.json   # then delete the local file
```

ECS refuses to start a task whose referenced secret has no value, so populate every secret the service references before the first deploy.

The RDS master password is not here: RDS manages it (see the database module).

Outputs: `arns`, `names` (maps keyed by secret key).
