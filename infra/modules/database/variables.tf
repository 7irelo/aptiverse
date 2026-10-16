variable "name" {
  description = "Identifier prefix, for example aptiverse-dev."
  type        = string
}

variable "vpc_id" {
  description = "VPC the database lives in."
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet ids for the DB subnet group (at least two AZs)."
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to connect on the Postgres port (ECS tasks)."
  type        = list(string)
  default     = []
}

variable "engine_version" {
  description = "Postgres engine version. A major version alone (17) lets RDS pick the latest minor."
  type        = string
  default     = "17"
}

variable "parameter_group_family" {
  description = "Parameter group family matching the engine major version."
  type        = string
  default     = "postgres17"
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Initial gp3 storage in GiB."
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Upper bound for storage autoscaling in GiB."
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Initial database name."
  type        = string
  default     = "aptiverse"
}

variable "master_username" {
  description = "Master username. The password is generated and rotated by RDS in Secrets Manager."
  type        = string
  default     = "aptiverse_admin"
}

variable "multi_az" {
  description = "Run a synchronous standby in a second AZ (prod)."
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Days of automated backups and point-in-time recovery. Needs an account off the free plan for values above 1."
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Daily backup window in UTC (00:00 to 01:00 UTC is 02:00 to 03:00 SAST)."
  type        = string
  default     = "00:00-01:00"
}

variable "maintenance_window" {
  description = "Weekly maintenance window in UTC."
  type        = string
  default     = "sun:01:30-sun:02:30"
}

variable "deletion_protection" {
  description = "Block deletion of the instance. Keep true; flip only in a reviewed change when decommissioning."
  type        = bool
  default     = true
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights (Database Insights standard mode)."
  type        = bool
  default     = true
}

variable "performance_insights_retention_period" {
  description = "Performance Insights retention in days (7 is free)."
  type        = number
  default     = 7
}

variable "monitoring_interval" {
  description = "Enhanced Monitoring interval in seconds (0 disables it)."
  type        = number
  default     = 60
}

variable "apply_immediately" {
  description = "Apply modifications immediately instead of in the maintenance window."
  type        = bool
  default     = false
}

variable "kms_key_id" {
  description = "Optional KMS key ARN for storage encryption. Null uses the AWS managed RDS key."
  type        = string
  default     = null
}

variable "log_min_duration_ms" {
  description = "Log statements slower than this many milliseconds (-1 disables)."
  type        = number
  default     = 500
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
