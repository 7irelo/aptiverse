# Database module (RDS Postgres)

| | |
|---|---|
| ID range | INF-05 to INF-07, INF-34 to INF-39 |
| Phase | 1 (alarms, roles and DR hardening by 10) |
| Depends on | INF-03, INF-36 decision on keys (from `account-security.md` INF-121) |
| Code path | `infra/modules/database/`, alarms in `infra/modules/monitoring/` |
| Status | INF-05 and INF-06 done in code. INF-07 partial (no connections alarm). Extra alarms, TLS client config, least-privilege database roles, upgrade policy and CMK decision not started. Cross-region copies live in `backup.md`. |

## Purpose

The single Postgres 17 instance per environment that holds every module schema plus the `wolverine` schema. It must never lose data: backups with PITR, deletion protection, a final snapshot, encryption at rest and TLS in transit.

## Scope

- Resources: `aws_db_subnet_group` (private subnets), `aws_security_group` plus one `aws_vpc_security_group_ingress_rule` per allowed task security group on 5432, `aws_db_parameter_group` (`shared_preload_libraries = pg_stat_statements` pending reboot, `pg_stat_statements.track = all`, `rds.force_ssl = 1`, `log_min_duration_statement` from `log_min_duration_ms` default 500, `log_connections`, `log_disconnections`), optional enhanced monitoring role, `aws_db_instance` (gp3, `storage_encrypted = true`, `kms_key_id` null, `manage_master_user_password = true`, `iam_database_authentication_enabled = true`, `publicly_accessible = false`, `copy_tags_to_snapshot`, `delete_automated_backups = false`, `skip_final_snapshot = false`, final snapshot `<name>-final`, `enabled_cloudwatch_logs_exports = [postgresql, upgrade]`, `allow_major_version_upgrade = false`, `auto_minor_version_upgrade = true`).
- Inputs and env values: `engine_version` 17, `instance_class` (dev `db.t4g.micro`, staging `db.t4g.small`, prod `db.t4g.medium`), `allocated_storage` (20 dev and staging, 50 prod), `max_allocated_storage` (50 dev, 100 staging, 200 prod), `multi_az` (prod only), `backup_retention_period` (7 dev and staging, 30 prod), windows `00:00-01:00` backup and `sun:01:30-sun:02:30` maintenance (UTC), `performance_insights_enabled` true (7 days), `monitoring_interval` 60, `deletion_protection` true.
- Outputs: `address`, `port`, `db_name`, `instance_identifier`, `master_user_secret_arn` (ARN only, never the value).
- Alarms (monitoring module): CPU above 80 percent, free storage below 2 GiB, freeable memory below 100 MiB.

## Tasks

- [x] **INF-05** `modules/database`: RDS Postgres 17, parameter group (`pg_stat_statements`), encryption. *(`infra/modules/database/main.tf`)*
- [x] **INF-06** `modules/database`: backups 7 days dev / 30 prod, PITR, deletion protection, final snapshot. *(`db_backup_retention_days` defaults in `envs/*/variables.tf`; `deletion_protection` default true)*
- [ ] **INF-07** `modules/database`: Performance Insights, Multi-AZ flag for prod, CloudWatch alarms (CPU, storage, connections). *(partial: Performance Insights, Multi-AZ flag and CPU, storage and memory alarms exist; no `DatabaseConnections` alarm)*
- [ ] **INF-34** Connections alarm: add `DatabaseConnections` above 80 percent of `max_connections` for the instance class (threshold as a monitoring input per env). (split from INF-07)
- [ ] **INF-35** Latency and IO alarms: `ReadLatency` and `WriteLatency` p99 above 20 ms for 10 minutes, `DiskQueueDepth` above 10, and `CPUCreditBalance` below 20 on burstable classes. Thresholds per env in monitoring inputs. (split from INF-07)
- [ ] **INF-36** Encryption key decision for RDS: AWS managed `aws/rds` key or a per-env CMK (needed for cross-account snapshot sharing when prod moves to its own account, GRW-10). Record in the module README and set `kms_key_id` from the decision in `account-security.md` (INF-121). Changing the key on an existing instance means snapshot, copy with new key, restore: plan it before prod exists.
- [ ] **INF-37** TLS in transit end to end: document the required client settings (`SSL Mode=VerifyFull` with the RDS af-south-1 CA bundle baked into the image or `Root Certificate` path) in the config contract (INF-49 in `service.md`), and add a verification query (`select ssl, version from pg_stat_ssl where pid = pg_backend_pid()`) to the dev smoke check. `rds.force_ssl = 1` already rejects plaintext.
- [ ] **INF-38** Least-privilege database roles: the runtime api and worker connect as an `aptiverse_app` role with DML on module schemas only; the migration task connects as an `aptiverse_migrator` role that owns the schemas; humans use IAM-authenticated per-person roles (read only by default). Create the roles in an idempotent SQL step run by the migration task (coordinate with the api `MigrateCommand`), store each runtime credential as its own Secrets Manager secret, and stop injecting the master secret into the api and worker (today `app_secrets` uses `db_master_secret_arn` for both).
- [ ] **INF-39** Upgrade and maintenance policy: confirm `auto_minor_version_upgrade` stays true in dev and staging and is set false in prod with minor upgrades applied after staging soaks one week; document the major upgrade path (blue/green deployment for RDS, test on a staging snapshot first).

## Verification

- `terraform -chdir=infra/modules/database init -backend=false && terraform validate`.
- `aws rds describe-db-instances --db-instance-identifier aptiverse-<env> --query 'DBInstances[0].[EngineVersion,StorageEncrypted,DeletionProtection,BackupRetentionPeriod,MultiAZ,PerformanceInsightsEnabled]'` matches the table above.
- `aws rds describe-db-parameters --db-parameter-group-name <pg> --query "Parameters[?ParameterName=='rds.force_ssl']"` returns `1`.
- From an SSM port forward: `psql "sslmode=disable ..."` is rejected; `select * from pg_stat_statements limit 1` works after the reboot noted in `infra/README.md`.
- `aws cloudwatch describe-alarms --alarm-name-prefix aptiverse-<env>-rds-` lists cpu, free-storage, free-memory, and connections and latency after INF-34 and INF-35.
- After INF-38: `select current_user` from a running api task returns `aptiverse_app`, and `create table x()` in a module schema fails for that role.

## Open questions

- Restore testing and cross-region copies of snapshots are covered in `backup.md`. Decided (33): DR copies stay in af-south-1 until a POPIA opinion allows a second region (see `launch/disaster-recovery.md`).
- Is `db.t4g.medium` single instance Multi-AZ enough for launch, or should prod start on a non-burstable class (`db.m7g.large`) to avoid CPU credit exhaustion under load tests (HRD-11)?
- `log_connections` and `log_disconnections` can be noisy in CloudWatch with connection pooling off. Keep in prod?
