# aptiverse-labs/infra

Infrastructure for Aptiverse — local-dev compose stack and AWS Terraform for the dev environment (free-tier EC2 + RDS).

## Layout

```
infra/
├── docker-compose.dev.yml      # local: postgres + redis (.NET API runs on host)
├── docker-compose.override.yml # re-exposes pg/redis to localhost
├── compose.prod.yml            # EC2: aptiverse-api + redis (postgres = RDS)
├── .env.example                # copy to .env, fill in
└── terraform/
    ├── bootstrap/              # S3 + DynamoDB for tf state (already deployed)
    └── envs/dev/               # EC2 + RDS in default VPC
```

The frontend (Next.js) lives at `aptiverse-labs/web` and is hosted on Vercel — not in this stack.

## Local dev

```bash
cp .env.example .env             # fill in POSTGRES_USER / PASSWORD
docker compose up -d             # postgres + redis on localhost:5432 / 6379
```

Then run the API natively in the api repo: `dotnet run`.

## Deploying the dev environment to AWS

**Prereqs:**
- AWS CLI configured (`aws configure`) with creds for account `483527586058`
- Terraform ≥ 1.5
- The bootstrap stack (`terraform/bootstrap/`) is already applied — S3 bucket + DynamoDB lock table exist in `af-south-1`.

**Steps (run from this repo root):**

```bash
# 1. Init terraform with the S3 backend
cd terraform/envs/dev
terraform init -backend-config=backend.hcl

# 2. Set DB credentials (don't commit these)
export TF_VAR_db_username='aptiverse_admin'
export TF_VAR_db_password='<a-strong-password>'

# 3. Plan + apply
terraform plan
terraform apply -auto-approve

# 4. Capture outputs
terraform output ec2_public_ip
terraform output -raw db_connection_string > /tmp/dbconn.txt   # paste into .env later
EC2_IP=$(terraform output -raw ec2_public_ip)
```

This creates:
- `aws_security_group` × 2 (api, rds)
- `aws_key_pair` + local `aptiverse-dev.pem` (SSH key, gitignored)
- `aws_db_instance` (Postgres 16, db.t3.micro, 20GB, **free tier**)
- `aws_instance` (Amazon Linux 2023, t3.micro, **free tier**) with docker pre-installed via user_data
- `aws_eip` (static IP for the EC2 — point Cloudflare at this)

**Free-tier ceilings (12 months from account creation):**
- EC2: 750 hrs/month of t3.micro
- RDS: 750 hrs/month of db.t3.micro + 20 GB storage
- EBS: 30 GB
- Data transfer out: 100 GB/month

## Deploying the API onto the EC2

The compose file pulls `ghcr.io/aptiverse-labs/api:latest` — set up a CI workflow in the api repo to publish on push to main, then on the EC2:

```bash
# From your laptop, copy compose + env to the box
cd ../../..
scp -i terraform/envs/dev/aptiverse-dev.pem \
    compose.prod.yml .env \
    ec2-user@$EC2_IP:/opt/aptiverse/

# SSH in and start
ssh -i terraform/envs/dev/aptiverse-dev.pem ec2-user@$EC2_IP
cd /opt/aptiverse
echo $GHCR_PAT | docker login ghcr.io -u 7irelo --password-stdin
docker compose -f compose.prod.yml pull
docker compose -f compose.prod.yml up -d
```

`GHCR_PAT` is a GitHub Personal Access Token with `read:packages` scope (only needed if the package is private).

## Cloudflare DNS

In Cloudflare → aptiverse.co.za → DNS → Add record:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `api` | `<ec2_public_ip>` | **Proxied (orange)** |

Cloudflare terminates TLS at the edge and proxies HTTP to the EC2 origin. Set SSL/TLS mode to **Flexible** in Cloudflare (origin is HTTP-only).

After DNS propagates, the API is reachable at `https://api.aptiverse.co.za`.

## Tearing down

```bash
cd terraform/envs/dev
terraform destroy
```

The bootstrap stack stays — it's near-free and shared.
