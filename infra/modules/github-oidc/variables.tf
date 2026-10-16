variable "create_provider" {
  description = "Create the account-wide GitHub OIDC provider. Only one stack (envs/global) sets this; the others look it up."
  type        = bool
  default     = false
}

variable "create_roles" {
  description = "Create the per-repo roles for var.environment."
  type        = bool
  default     = true
}

variable "github_org" {
  description = "GitHub organisation that owns the repos."
  type        = string
  default     = "aptiverse-labs"
}

variable "environment" {
  description = "Environment name (dev, staging, prod). Used in role names and GitHub environment subjects."
  type        = string
  default     = null
}

variable "name_prefix" {
  description = "Role name prefix, for example aptiverse-dev."
  type        = string
  default     = null
}

variable "allow_main_branch_deploys" {
  description = "Also trust workflows on refs/heads/main without a GitHub environment (convenient in dev; keep false for prod)."
  type        = bool
  default     = false
}

variable "state_bucket_name" {
  description = "Terraform state bucket the infra roles read and lock."
  type        = string
  default     = null
}

variable "ecr_repository_arns" {
  description = "ECR repositories the api role may push to."
  type        = list(string)
  default     = []
}

variable "ecs_cluster_arn" {
  description = "ECS cluster ARN the api role deploys to."
  type        = string
  default     = null
}

variable "ecs_service_arns" {
  description = "ECS services the api role may update."
  type        = list(string)
  default     = []
}

variable "migration_task_definition_family" {
  description = "Task definition family the api role may run as a one-off migration task."
  type        = string
  default     = null
}

variable "passable_role_arns" {
  description = "Task and execution role ARNs the api role may pass to ECS when running tasks."
  type        = list(string)
  default     = []
}

variable "image_tag_parameter_arn" {
  description = "SSM parameter holding the deployed image tag, writable by the api role."
  type        = string
  default     = null
}

variable "log_group_arns" {
  description = "Log groups the api role may read (to surface migration output)."
  type        = list(string)
  default     = []
}

variable "web_policy_json" {
  description = "Optional inline policy for the web role. The web app is on Vercel, so the role has no permissions by default."
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
