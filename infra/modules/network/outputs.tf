output "vpc_id" {
  description = "VPC id."
  value       = aws_vpc.this.id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block."
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet ids, one per AZ."
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet ids, one per AZ."
  value       = aws_subnet.private[*].id
}

output "nat_enabled" {
  description = "Whether private subnets have outbound internet through NAT."
  value       = var.enable_nat_gateway
}

output "endpoint_security_group_id" {
  description = "Security group attached to the interface endpoints."
  value       = aws_security_group.endpoints.id
}
