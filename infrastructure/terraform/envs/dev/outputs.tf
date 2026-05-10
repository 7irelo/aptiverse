output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.endpoint
}

output "route53_name_servers" {
  description = "Name servers for the hosted zone (update at GoDaddy)"
  value       = module.route53.name_servers
}

output "lb_controller_role_arn" {
  description = "IAM role ARN for the AWS Load Balancer Controller"
  value       = module.eks.lb_controller_role_arn
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions deploy role"
  value       = module.security.github_actions_role_arn
}
