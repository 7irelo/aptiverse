# Network module

| | |
|---|---|
| ID range | INF-03, INF-04, INF-30 to INF-33 |
| Phase | 1 (prod NAT per AZ in 10) |
| Depends on | INF-01 |
| Code path | `infra/modules/network/` |
| Status | INF-03 and INF-04 done in code. NAT per AZ, flow log scope, endpoint review and default security group check are new; one is done. |

## Purpose

One VPC per environment with public and private subnets across two availability zones, an optional NAT gateway, and VPC endpoints so AWS API traffic (ECR pulls, secrets, logs, S3) stays inside AWS.

## Scope

- Resources: `aws_vpc` (DNS support and hostnames on), `aws_default_security_group` (stripped of all rules), `aws_internet_gateway`, `aws_subnet.public` and `aws_subnet.private` (one `/20` each per AZ, `map_public_ip_on_launch = false`), route tables and associations, optional `aws_eip.nat`, `aws_nat_gateway.this` (single, in the first AZ) and `aws_route.private_nat`, `aws_vpc_endpoint.s3` (Gateway, both route tables), `aws_security_group.endpoints` (443 from the VPC CIDR), `aws_vpc_endpoint.interface` (private subnets, private DNS), flow logs (`aws_flow_log`, `traffic_type = REJECT`, CloudWatch log group, IAM role).
- Inputs: `name`, `cidr_block` (dev `10.20.0.0/16`, staging `10.30.0.0/16`, prod `10.40.0.0/16`), `az_count` (2), `enable_nat_gateway` (dev and staging false, prod true), `interface_endpoints` (`ecr.api`, `ecr.dkr`, `secretsmanager`, `logs` in every env), `enable_flow_logs` (true), `flow_log_retention_days` (30), `tags`.
- Outputs: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`.
- Behaviour in env stacks: without NAT, tasks run in public subnets with a public IP and a security group that only admits the ALB (`local.task_subnet_ids` in `envs/*/main.tf`). RDS always uses the private subnets.

## Tasks

- [x] **INF-03** `modules/network`: VPC, public subnets (dev), private subnets plus NAT (prod). *(`infra/modules/network/main.tf`; `enable_nat_gateway` default true only in `envs/prod/variables.tf`)*
- [x] **INF-04** `modules/network`: VPC endpoints (S3, ECR, Secrets Manager, CloudWatch Logs). *(S3 gateway plus four interface endpoints in `main.tf`)*
- [ ] **INF-30** NAT per AZ option: add `nat_gateway_per_az` (bool, default false) creating one EIP, NAT gateway and private route table per AZ, so a single AZ outage does not cut prod egress (Anthropic, Paystack, Sentry). Decide the prod value in `env-prod.md` (INF-137) against roughly $35 per month per extra NAT.
- [ ] **INF-31** Flow log scope per environment: add `flow_log_traffic_type` (default `REJECT`), set `ALL` in prod for incident forensics, and set retention from the env (`flow_log_retention_days` 30 dev, 90 prod). Note the extra CloudWatch ingest cost in the PR.
- [ ] **INF-32** Endpoint review: decide per env whether the four interface endpoints stay in dev and staging (about $8 each per AZ per month, see `infra/README.md` cost notes) and whether prod adds `sts` and `kms` endpoints. Encode the decision in each env's `interface_endpoints` default and record it in the module README.
- [x] **INF-33** Default security group carries no rules, so nothing can rely on it. *(`aws_default_security_group.this` in `main.tf`)*

## Verification

- `terraform -chdir=infra/modules/network init -backend=false && terraform validate`.
- `terraform plan` in `envs/dev`: no NAT, no EIP; in `envs/prod`: one NAT (or one per AZ after INF-30).
- `aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values=<vpc>` lists `s3`, `ecr.api`, `ecr.dkr`, `secretsmanager`, `logs`.
- `aws ec2 describe-security-groups --filters Name=group-name,Values=default Name=vpc-id,Values=<vpc>` shows empty ingress and egress.
- `aws logs describe-log-groups --log-group-name-prefix /vpc/aptiverse-` shows the expected retention.

## Open questions

- Is IPv6 (dual stack) wanted for the ALB and tasks? Today everything is IPv4, which matches the IPv4-only Cloudflare ingress list in `alb.md`.
- Decided (57): the owner signs off a second NAT against the AWS ceiling; amount pending, DECISIONS.md F. One NAT until then.
