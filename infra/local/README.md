# Local development stack

Backing services for running the api and web locally. Nothing here is used by any cloud environment.

## Start, stop, reset

```bash
docker compose -f local/compose.yml up -d      # start (detached)
docker compose -f local/compose.yml ps         # all services should be healthy
docker compose -f local/compose.yml down       # stop, keep data
docker compose -f local/compose.yml down -v    # stop and wipe volumes
```

## Services and connection values

| Service | Host port(s) | Values |
|---|---|---|
| Postgres 17 | 5433 | db `aptiverse`, user `aptiverse`, password `aptiverse` |
| Mailpit | SMTP 1025, UI 8025 | no auth needed; open http://localhost:8025 |
| MinIO | API 9000, console 9001 | access key `aptiverse`, secret `aptiverse-local`, bucket `aptiverse-uploads` |

Postgres is on host port **5433** because 5432 is often taken by an SSH tunnel or a native install. `pg_stat_statements` is preloaded to match RDS.

Connection string for the api:

```
Host=localhost;Port=5433;Database=aptiverse;Username=aptiverse;Password=aptiverse
```

S3 settings for the api (path-style addressing is required for MinIO):

```
ServiceURL=http://localhost:9000  ForcePathStyle=true  Region=af-south-1
Bucket=aptiverse-uploads  AccessKey=aptiverse  SecretKey=aptiverse-local
```

The `minio-init` container creates the bucket and exits with code 0. That is expected.

## Notes

- MinIO images come from the `pgsty` community build (pinned release tags) because upstream MinIO stopped publishing public Docker images in late 2025.
- These credentials are deliberately trivial and local only. Never reuse them anywhere else.
