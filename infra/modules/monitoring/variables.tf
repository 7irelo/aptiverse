variable "name" {
  description = "Name prefix, for example aptiverse-dev."
  type        = string
}

variable "alarm_emails" {
  description = "Email addresses subscribed to the alarm topic (each must confirm the subscription)."
  type        = list(string)
  default     = []
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix. Null skips ALB alarms."
  type        = string
  default     = null
}

variable "target_group_arn_suffix" {
  description = "API target group ARN suffix. Null skips the unhealthy target alarm."
  type        = string
  default     = null
}

variable "alb_5xx_threshold" {
  description = "5xx responses per 5 minutes (ELB plus target) that raise an alarm."
  type        = number
  default     = 10
}

variable "db_instance_identifier" {
  description = "RDS instance identifier. Null skips RDS alarms."
  type        = string
  default     = null
}

variable "db_cpu_threshold" {
  description = "RDS CPU percentage that raises an alarm."
  type        = number
  default     = 80
}

variable "db_free_storage_threshold_bytes" {
  description = "Free storage below this many bytes raises an alarm."
  type        = number
  default     = 2147483648
}

variable "db_free_memory_threshold_bytes" {
  description = "Freeable memory below this many bytes raises an alarm."
  type        = number
  default     = 104857600
}

variable "ecs_cluster_name" {
  description = "ECS cluster name for service alarms."
  type        = string
  default     = null
}

variable "ecs_service_names" {
  description = "ECS service names to alarm on CPU and memory."
  type        = list(string)
  default     = []
}

variable "ecs_cpu_threshold" {
  description = "ECS service CPU percentage that raises an alarm."
  type        = number
  default     = 85
}

variable "ecs_memory_threshold" {
  description = "ECS service memory percentage that raises an alarm."
  type        = number
  default     = 85
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
