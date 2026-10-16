# network

VPC with public and private subnets across 2 (or 3) AZs, an internet gateway, an optional single NAT gateway, and VPC endpoints.

- `enable_nat_gateway` defaults to `false`. With NAT off (dev), ECS tasks run in the public subnets with a public IP, behind security groups that only accept traffic from the ALB. RDS always sits in the private subnets.
- Endpoints: S3 (gateway, free) plus interface endpoints from `interface_endpoints` (default `ecr.api`, `ecr.dkr`, `secretsmanager`, `logs`). Each interface endpoint costs roughly $8 per AZ per month; trim the list in dev if cost matters more than keeping AWS traffic off the internet.
- The default security group is emptied so nothing can rely on it.
- VPC flow logs capture rejected traffic only.

Outputs: `vpc_id`, `vpc_cidr_block`, `public_subnet_ids`, `private_subnet_ids`, `nat_enabled`, `endpoint_security_group_id`.
