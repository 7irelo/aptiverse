# Disaster recovery

| | |
|---|---|
| ID range | `HRD-196` to `HRD-210` |
| Phase | 9 (plan and first drill), 10 (cross-region copies live in prod), quarterly after launch |
| Depends on | `infra/database.md`, `infra/storage.md`, `infra/bootstrap.md`, `infra/env-prod.md`, `launch/runbooks.md` (HRD-01, HRD-07, HRD-75), `launch/incident-management.md` |
| Status | 0 done, 1 partial (PITR, deletion protection, final snapshot and S3 versioning are in Terraform; no cross-region copies), 0 unverified, 14 not started |

## Purpose

Set explicit recovery targets for every component, build the backups that meet them, and prove it with timed drills. A backup that has never been restored does not count.

## Scope

### Recovery targets (prod)

| Component | Failure | RPO | RTO | Mechanism |
|---|---|---|---|---|
| RDS Postgres | corruption, bad migration, accidental delete | 5 minutes | 1 hour | PITR (30-day retention), restore to new instance (`restore-rds.md`) |
| RDS Postgres | AZ failure | 0 | 2 minutes | Multi-AZ failover (prod) |
| RDS Postgres | region failure | 24 hours (daily cross-region snapshot copy) or 15 minutes with cross-region automated backup replication | 4 hours | restore in DR region from copied backup |
| S3 uploads | accidental delete or overwrite | 0 | 1 hour | versioning, restore previous version |
| S3 uploads | region failure | 15 minutes | 4 hours | Cross-Region Replication with Replication Time Control to the DR bucket |
| ECS api and worker | bad deploy | 0 | 15 minutes | circuit breaker rollback, SSM image tag rollback |
| ECS api and worker | region failure | n/a (stateless) | 4 hours | apply `envs/prod` variant in DR region, images replicated by ECR replication |
| Secrets | region failure | 0 | 4 hours | Secrets Manager multi-region replica secrets |
| Terraform state | bucket corruption or delete | 0 | 1 hour | versioning, `prevent_destroy`, replication to DR region |
| Web (Vercel) | bad deploy | 0 | 5 minutes | Vercel instant rollback |
| DNS (Cloudflare) | bad record change | 0 | 15 minutes | Terraform history, re-apply |

DR copies (decision 33): in af-south-1 only until a POPIA opinion allows a second region; eu-west-1 (where SES already runs) is the candidate once that opinion is recorded.

## Tasks

### Decide
- [ ] **HRD-196** Approve the RPO and RTO table and the DR region with the owner; record the POPIA note that DR copies outside South Africa are a cross-border transfer (add to `launch/popia.md` operators and transfers)
- [ ] **HRD-197** Decide RDS cross-region approach: daily snapshot copy (cheap, RPO 24h) or automated backup replication (RPO minutes); record cost estimate

### Build (Terraform tasks are owned by the infra files; these tasks confirm and evidence)
- [ ] **HRD-198** RDS backups as designed: PITR 30 days in prod, deletion protection, final snapshot, encryption *(partial: present in `infra/modules/database` with prod defaults of 30 days and Multi-AZ; not applied)*
- [ ] **HRD-199** Cross-region RDS backup copy or replication in place, encrypted with a KMS key in the DR region (built in `infra/database.md`)
- [ ] **HRD-200** S3 Cross-Region Replication for the uploads bucket including delete markers policy decision, with replication metrics and a failed-replication alarm (built in `infra/storage.md`)
- [ ] **HRD-201** ECR replication of the api repository to the DR region, and Secrets Manager replica secrets for app secrets
- [ ] **HRD-202** Terraform state bucket replication or a daily copy to the DR region (built in `infra/bootstrap.md`)
- [ ] **HRD-203** Backup integrity check: a weekly automated job restores the latest snapshot into a throwaway instance in staging account space, runs a row-count and checksum query on key tables, then deletes it; result posted to the alerts channel

### Procedure
- [ ] **HRD-204** Regional failover procedure written in `infra/docs/runbooks/region-outage.md` (HRD-75): declare, restore DB from the copy, apply infra in the DR region with prepared variables, point Cloudflare `api` record at the DR ALB, update Vercel `API_INTERNAL_URL`, fail back
- [ ] **HRD-205** Pre-stage a `envs/dr` variable set (or documented overrides) so the DR apply needs no code changes during an incident
- [ ] **HRD-206** Terraform state recovery procedure: restore a previous state version from bucket versioning, and how to re-import if state is lost

### Drills
- [ ] **HRD-207** Quarterly restore drill (PITR into a new instance in staging, timed against the 1-hour RTO), evidence in `infra/docs/runbooks/drills/YYYY-QN.md` with start, end, row checks and issues (first instance is HRD-07)
- [ ] **HRD-208** Yearly cross-region restore drill: restore the copied snapshot and replicated uploads in the DR region, run smoke tests against it, tear down
- [ ] **HRD-209** S3 restore drill: delete and overwrite a staging object, restore the previous version within RTO
- [ ] **HRD-210** DR test calendar kept in `infra/docs/runbooks/drills/README.md`: Q1 restore, Q2 restore plus S3, Q3 restore, Q4 cross-region; each entry links its evidence

## Verification

- The RPO and RTO table is signed off and each row has a mechanism that exists in Terraform and an evidence link from a drill.
- The latest quarterly drill finished inside the RTO.
- Replication metrics show the DR bucket and DB copies are current.

## Open questions

- Decided (33): in-region copies (a second af-south-1 account gives the isolation boundary); eu-west-1 only after a POPIA opinion.
- Prod in a separate AWS account (GRW-10) would change where DR copies land; do it before or after launch?
