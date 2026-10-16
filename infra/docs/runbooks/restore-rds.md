# Runbook: restore RDS from a snapshot or point in time

Use when data is lost or corrupted, or to rehearse recovery. Restores always create a **new** instance; the original is left untouched until you decide to switch.

## 1. Decide the restore point

- **Point in time (PITR)**: any second within the retention window (7 days dev, 30 prod). Check the window with `aws rds describe-db-instances --db-instance-identifier aptiverse-<env> --query 'DBInstances[0].LatestRestorableTime'`.
- **Snapshot**: an automated or manual snapshot, or `aptiverse-<env>-final` after a deletion. `aws rds describe-db-snapshots --db-instance-identifier aptiverse-<env>`.

## 2. Restore to a new instance

```bash
# point in time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier aptiverse-<env> \
  --target-db-instance-identifier aptiverse-<env>-restore \
  --restore-time 2026-01-01T10:00:00Z \
  --db-subnet-group-name aptiverse-<env> \
  --vpc-security-group-ids <rds security group id> \
  --db-parameter-group-name <current parameter group> \
  --no-publicly-accessible --manage-master-user-password

# or from a snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-snapshot-identifier <snapshot id> \
  --db-instance-identifier aptiverse-<env>-restore \
  --db-subnet-group-name aptiverse-<env> \
  --vpc-security-group-ids <rds security group id> \
  --no-publicly-accessible --manage-master-user-password
```

## 3. Verify

Connect through the SSM port forward (README) to the restored endpoint and check row counts and the most recent records for the affected tables.

## 4. Recover

- **Partial loss**: copy the affected rows from the restored instance into the live one (`pg_dump -t ... | psql`), then delete the restored instance.
- **Full replacement**: stop writes (scale api and worker to 0), rename the old instance to `aptiverse-<env>-old` and the restored one to `aptiverse-<env>`, then bring Terraform state in line in a reviewed PR (`terraform state rm` the old address and `terraform import` the new instance). Scale back up and keep the old instance until confident, then delete it (it keeps deletion protection until you remove it).

## 5. Afterwards

Record the incident, the restore point used and the time taken. Rehearse this at least once per quarter against a non-prod environment.
