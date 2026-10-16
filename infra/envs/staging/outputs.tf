# Identifiers only. No output in this repo may expose a secret value.

output "api_url" {
  description = "Public api base URL (through Cloudflare)."
  value       = "https://${local.api_fqdn}"
}

output "alb_dns_name" {
  description = "ALB DNS name (origin behind Cloudflare)."
  value       = module.alb.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository for the api image."
  value       = module.ecr.repository_urls["api"]
}

output "image_tag_parameter" {
  description = "SSM parameter the api pipeline writes the deployed tag to."
  value       = aws_ssm_parameter.image_tag.name
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.this.name
}

output "api_service_name" {
  description = "api ECS service name."
  value       = module.api.service_name
}

output "worker_service_name" {
  description = "worker ECS service name."
  value       = module.worker.service_name
}

output "migration_task_definition_family" {
  description = "Task definition family for the one-off migration task."
  value       = module.api.migration_task_definition_family
}

output "migration_network_configuration" {
  description = "Network settings for aws ecs run-task of the migration task."
  value = {
    subnets          = local.task_subnet_ids
    security_groups  = [module.api.security_group_id]
    assign_public_ip = local.assign_public_ip
  }
}

output "db_address" {
  description = "RDS hostname (reach it through an SSM port forward)."
  value       = module.database.address
}

output "db_master_secret_arn" {
  description = "ARN of the RDS-managed master credential secret (ARN only)."
  value       = module.database.master_user_secret_arn
}

output "uploads_bucket" {
  description = "Uploads bucket name."
  value       = module.storage.bucket_name
}

output "app_secret_names" {
  description = "Secrets Manager names to populate out of band."
  value       = module.secrets.names
}

output "github_role_arns" {
  description = "Role ARNs to configure as GitHub variables in each repo."
  value       = module.github_oidc.role_arns
}

output "alarm_topic_arn" {
  description = "SNS topic for alarms."
  value       = module.monitoring.sns_topic_arn
}
