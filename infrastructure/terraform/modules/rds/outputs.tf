output "endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.this.endpoint
}

output "address" {
  description = "RDS instance address (hostname only)"
  value       = aws_db_instance.this.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Name of the default database"
  value       = aws_db_instance.this.db_name
}

output "security_group_id" {
  description = "Security group ID for the RDS instance"
  value       = aws_security_group.rds.id
}

output "connection_string" {
  description = "PostgreSQL connection string"
  value       = "Host=${aws_db_instance.this.address};Port=${aws_db_instance.this.port};Database=${aws_db_instance.this.db_name};Username=${var.db_username};Password=${var.db_password}"
  sensitive   = true
}
