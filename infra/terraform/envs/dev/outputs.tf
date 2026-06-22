output "ec2_public_ip" {
  value = aws_eip.api.public_ip
}

output "ec2_ssh" {
  value = "ssh -i ${path.module}/aptiverse-${var.env}.pem ec2-user@${aws_eip.api.public_ip}"
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "db_connection_string" {
  value     = "Host=${aws_db_instance.postgres.address};Port=5432;Database=aptiverse;Username=${var.db_username};Password=${var.db_password}"
  sensitive = true
}
