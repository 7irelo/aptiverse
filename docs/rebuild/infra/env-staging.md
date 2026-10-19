# Environment: staging

| | |
|---|---|
| ID range | INF-23, INF-129 to INF-134 |
| Phase | 1 (stack), 2 (SES guard), 10 (anonymised data) |
| Depends on | INF-22, INF-41 (promotion model), MIG-01 (migrator for the anonymiser) |
| Code path | `infra/envs/staging/` (same `main.tf` as dev and prod; staging defaults in `variables.tf`) |
| Status | Composition done in code; apply unverified. Anonymised prod data, email guard, test-only keys and access protection not started. |

## Purpose

A production-like environment where every merge is promoted after dev passes, holding an anonymised copy of prod data so load tests, migration rehearsals and acceptance checks run against realistic shapes without exposing real students.

## Scope

- Staging defaults: `api_hostname = api.staging`, `web_origins = [https://staging.aptiverse.co.za]`, `aspnetcore_environment = Staging`, `vpc_cidr = 10.30.0.0/16`, NAT off, `db.t4g.small`, up to 100 GiB, single AZ, 7 day backups, Container Insights enabled, api 512/1024 count 1 (max 3), worker 512/1024 count 1, log retention 30 days, `allow_main_branch_deploys = false` (deploys only through the `staging` GitHub environment).
- State: `v2/staging/terraform.tfstate`.

## Tasks

- [ ] **INF-23** Compose `staging` env and apply. *(unverified: composition is done in `infra/envs/staging/main.tf`; the apply is AWS state)*
- [ ] **INF-129** Anonymised data refresh job: a documented, scripted path (GitHub workflow in the infra repo, manual dispatch) that restores the latest prod snapshot into a temporary instance in the staging VPC, runs the anonymiser, dumps the result and loads it into staging RDS, then deletes the temporary instance. The prod snapshot must be shared or copied with a key staging can use (INF-121). Never restore raw prod data directly into staging.
- [ ] **INF-130** Anonymiser rules: replace names, emails (`user+<guid>@example.test`), phone numbers, ID numbers, IP addresses and user agents in consent rows, diary and wellbeing free text (blank or lorem), uploads keys (point at a placeholder object), Paystack customer and authorization codes, payout details; keep ids, timestamps, enrolments, marks and money amounts so shapes stay real. Owned with `launch/migration-etl.md` (shares the migrator models); a test asserts no column on a deny-list survives.
- [ ] **INF-131** Email guard: staging must never email a real person. Keep the SES identity in sandbox mode for staging or enforce an allowlist (`Email__AllowedRecipientDomains` in the config contract, INF-49) so only `example.test`, team addresses and the SES simulator receive mail.
- [ ] **INF-132** Staging uses test-mode Paystack keys, a separate Anthropic key with a low spend cap, and a staging Sentry environment; record each in `secrets.md` INF-64 per env. *(unverified: secret values)*
- [ ] **INF-133** Access protection: staging web and api are not public. Put Cloudflare Access (or Vercel deployment protection plus an api allowlist header) in front of `staging.aptiverse.co.za` and `api.staging`, with service tokens for CI smoke tests.
- [x] **INF-134** Staging sizing is closer to prod than dev (Container Insights on, 512/1024 tasks, 30 day logs). *(`infra/envs/staging/variables.tf`)*

## Verification

- `terraform -chdir=infra/envs/staging plan` clean after apply.
- `aws rds describe-db-instances --db-instance-identifier aptiverse-staging` matches the defaults.
- Run the anonymiser deny-list test against the staging database after INF-129: zero rows contain a real email domain from the prod snapshot (`select count(*) from identity.users where email not like '%@example.test'` returns only team accounts).
- An unauthenticated request to `https://staging.aptiverse.co.za` shows the Access login after INF-133.

## Open questions

- How often to refresh staging data (before each migration rehearsal, MIG-23 to MIG-25, and before HRD-11 at least)?
- Does anonymised data still count as personal information under POPIA if re-identification is possible from marks and schools? Decided (32): the Information Officer answers this (name pending, DECISIONS.md F); until then treat anonymised staging data as personal information (`launch/popia.md`).
