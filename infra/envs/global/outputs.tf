output "ses_identity_arn" {
  description = "SES domain identity ARN (eu-west-1)."
  value       = module.ses.identity_arn
}

output "ses_configuration_set_name" {
  description = "SES configuration set name."
  value       = module.ses.configuration_set_name
}

output "ses_configuration_set_arn" {
  description = "SES configuration set ARN."
  value       = module.ses.configuration_set_arn
}

output "ses_region" {
  description = "Region SES sends from."
  value       = module.ses.region
}

output "ses_dns_records" {
  description = "SES DNS records (public values, published to Cloudflare when enabled)."
  value       = module.ses.dns_records
}

output "github_oidc_provider_arn" {
  description = "GitHub OIDC provider ARN."
  value       = module.github_oidc.provider_arn
}

output "api_repository_url" {
  description = "ECR repository for the api image, shared by every environment."
  value       = module.ecr.repository_urls["api"]
}

output "api_repository_arn" {
  description = "ARN of the shared api image repository."
  value       = module.ecr.repository_arns["api"]
}
