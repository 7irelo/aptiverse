output "arns" {
  description = "Map of secret key to secret ARN (ARNs only, never values)."
  value       = { for k, s in aws_secretsmanager_secret.this : k => s.arn }
}

output "names" {
  description = "Map of secret key to full secret name."
  value       = { for k, s in aws_secretsmanager_secret.this : k => s.name }
}
