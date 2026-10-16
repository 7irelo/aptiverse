output "instance_identifier" {
  description = "RDS instance identifier (CloudWatch DBInstanceIdentifier dimension)."
  value       = aws_db_instance.this.identifier
}

output "instance_arn" {
  description = "RDS instance ARN."
  value       = aws_db_instance.this.arn
}

output "address" {
  description = "Hostname of the instance."
  value       = aws_db_instance.this.address
}

output "port" {
  description = "Postgres port."
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Initial database name."
  value       = aws_db_instance.this.db_name
}

output "master_user_secret_arn" {
  description = "ARN of the RDS-managed Secrets Manager secret holding the master credentials (the ARN only, never the value)."
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
}

output "security_group_id" {
  description = "Security group attached to the instance."
  value       = aws_security_group.this.id
}
