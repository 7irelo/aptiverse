output "provider_arn" {
  description = "GitHub OIDC provider ARN."
  value       = local.provider_arn
}

output "role_arns" {
  description = "Map of role key (api, web, infra-plan, infra-apply) to role ARN. Set these as GitHub repository or environment variables."
  value       = { for k, r in aws_iam_role.this : k => r.arn }
}
