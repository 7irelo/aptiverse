# Defaults in this file ARE the staging environment's settings. dev and the
# other environments carry the same variables with their own defaults.

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "staging"
}

variable "region" {
  description = "Primary AWS region (POPIA data residency)."
  type        = string
  default     = "af-south-1"
}

variable "state_bucket_name" {
  description = "Terraform state bucket (for remote state reads and CI role scoping)."
  type        = string
  default     = "aptiverse-terraform-state-483527586058"
}

variable "domain" {
  description = "Apex domain / Cloudflare zone."
  type        = string
  default     = "aptiverse.co.za"
}

variable "api_hostname" {
  description = "API host label under the domain. Two-level names such as api.dev need Cloudflare Advanced Certificate Manager for edge TLS (Universal SSL covers one level only); use api-dev instead if that is not available."
  type        = string
  default     = "api.staging"
}

variable "web_origins" {
  description = "Web origins allowed for CORS on the uploads bucket and passed to the api."
  type        = list(string)
  default     = ["https://staging.aptiverse.co.za"]
}

variable "aspnetcore_environment" {
  description = "ASPNETCORE_ENVIRONMENT for the containers."
  type        = string
  default     = "Staging"
}

# --- Network -----------------------------------------------------------------

variable "vpc_cidr" {
  description = "VPC CIDR."
  type        = string
  default     = "10.30.0.0/16"
}

variable "enable_nat_gateway" {
  description = "NAT gateway for private subnets. When off, tasks run in public subnets."
  type        = bool
  default     = false
}

variable "interface_endpoints" {
  description = "Interface VPC endpoints to create."
  type        = list(string)
  default     = ["ecr.api", "ecr.dkr", "secretsmanager", "logs"]
}

variable "alb_deletion_protection" {
  description = "Protect the ALB from deletion."
  type        = bool
  default     = false
}

# --- Database ----------------------------------------------------------------

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.small"
}

variable "db_allocated_storage" {
  description = "Initial RDS storage in GiB."
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS storage autoscaling ceiling in GiB."
  type        = number
  default     = 100
}

variable "db_multi_az" {
  description = "Multi-AZ RDS."
  type        = bool
  default     = false
}

variable "db_backup_retention_days" {
  description = "RDS backup retention (PITR window) in days."
  type        = number
  default     = 7
}

# --- Compute -----------------------------------------------------------------

variable "container_insights" {
  description = "ECS Container Insights setting (disabled, enabled or enhanced)."
  type        = string
  default     = "enabled"
}

variable "initial_image_tag" {
  description = "Image tag written to SSM on first create only. Afterwards the api pipeline owns the value."
  type        = string
  default     = "bootstrap"
}

variable "api_container_port" {
  description = "Port the api listens on inside the container."
  type        = number
  default     = 8080
}

variable "api_cpu" {
  description = "api task CPU units."
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "api task memory (MiB)."
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Initial api task count."
  type        = number
  default     = 1
}

variable "api_min_count" {
  description = "Minimum api tasks."
  type        = number
  default     = 1
}

variable "api_max_count" {
  description = "Maximum api tasks."
  type        = number
  default     = 3
}

variable "worker_cpu" {
  description = "worker task CPU units."
  type        = number
  default     = 256
}

variable "worker_memory" {
  description = "worker task memory (MiB)."
  type        = number
  default     = 512
}

variable "worker_desired_count" {
  description = "Initial and minimum worker task count."
  type        = number
  default     = 1
}

variable "worker_max_count" {
  description = "Maximum worker tasks."
  type        = number
  default     = 1
}

variable "log_retention_days" {
  description = "CloudWatch log retention for the services."
  type        = number
  default     = 30
}

# --- CI and alerting ---------------------------------------------------------

variable "allow_main_branch_deploys" {
  description = "Let api and web workflows on main assume their roles without a GitHub environment."
  type        = bool
  default     = false
}

variable "alarm_emails" {
  description = "Email addresses for CloudWatch alarm notifications."
  type        = list(string)
  default     = []
}
