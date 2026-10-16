# database

RDS Postgres 17 on gp3 with encryption, automated backups and PITR, Performance Insights, Enhanced Monitoring and a parameter group that preloads `pg_stat_statements` and forces TLS.

Protection defaults (do not weaken without a reviewed change):

- `deletion_protection = true`, `skip_final_snapshot = false`, final snapshot `<name>-final`.
- `backup_retention_period` defaults to 7 days (prod sets 30). Values above 1 need the AWS account off the free plan.
- `multi_az` off by default, on in prod.

Credentials: `manage_master_user_password = true`, so RDS creates and rotates the master password in Secrets Manager. Terraform only ever sees the secret ARN (`master_user_secret_arn`), which is passed to ECS tasks by ARN. No output exposes a password.

Access: only the security groups in `allowed_security_group_ids` can reach port 5432. Humans connect through an SSM port forward (see the repo README), never SSH.

Note: the `pg_stat_statements` preload is `pending-reboot`, so on an existing instance it takes effect after the next reboot.
