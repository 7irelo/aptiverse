output "app_security_group_id" {
  description = "Security group ID for application workloads"
  value       = aws_security_group.app.id
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions IAM role"
  value       = aws_iam_role.github_actions.arn
}

output "github_actions_oidc_provider_arn" {
  description = "ARN of the GitHub Actions OIDC provider"
  value       = data.aws_iam_openid_connect_provider.github_actions.arn
}
