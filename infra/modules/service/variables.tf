variable "name" {
  description = "Service name, for example aptiverse-dev-api. Also the task definition family and log group suffix."
  type        = string
}

variable "role" {
  description = "Application role: api or worker (the shared .NET image) or ai (the Python AI service). Exposed as APP_ROLE."
  type        = string

  validation {
    condition     = contains(["api", "worker", "ai"], var.role)
    error_message = "The role must be api, worker or ai."
  }
}

variable "cluster_arn" {
  description = "ECS cluster ARN."
  type        = string
}

variable "cluster_name" {
  description = "ECS cluster name (used for autoscaling resource ids)."
  type        = string
}

variable "image" {
  description = "Full image reference including tag, for example <repo-url>:<git-sha>."
  type        = string
}

variable "cpu" {
  description = "Task CPU units (256 = 0.25 vCPU)."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Task memory in MiB."
  type        = number
  default     = 512
}

variable "container_port" {
  description = "Port the container listens on. Null for services without a load balancer (worker)."
  type        = number
  default     = null
}

variable "command" {
  description = "Optional command override for the container. Null uses the default command for var.role."
  type        = list(string)
  default     = null
}

variable "environment" {
  description = "Plain (non-secret) environment variables."
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Environment variable name to Secrets Manager ARN. A JSON key can be selected with the ARN form <arn>:<json-key>::. Values are resolved by ECS at task start, never by Terraform."
  type        = map(string)
  default     = {}
}

variable "vpc_id" {
  description = "VPC id for the task security group."
  type        = string
}

variable "subnet_ids" {
  description = "Subnets the tasks run in."
  type        = list(string)
}

variable "assign_public_ip" {
  description = "Give tasks a public IP. Needed when they run in public subnets because there is no NAT (dev)."
  type        = bool
  default     = false
}

variable "ingress_security_group_id" {
  description = "Security group (the ALB) allowed to reach container_port. Ignored when container_port is null."
  type        = string
  default     = null
}

variable "ingress_security_group_ids" {
  description = "Extra security groups allowed to reach container_port directly (service to service, no load balancer)."
  type        = list(string)
  default     = []
}

variable "egress_vpc_ports" {
  description = "TCP ports these tasks may open to other tasks inside the VPC (for example the ai service port)."
  type        = list(number)
  default     = []
}

variable "service_connect" {
  description = "ECS Service Connect: the namespace to join and, for a service other tasks call, the name and port it is reachable on."
  type = object({
    namespace = string
    server = optional(object({
      port_name      = string
      discovery_name = string
    }))
  })
  default = null
}

variable "target_group_arn" {
  description = "ALB target group to register tasks with. Null for no load balancer."
  type        = string
  default     = null
}

variable "desired_count" {
  description = "Initial desired task count. Autoscaling owns the value after creation."
  type        = number
  default     = 1
}

variable "min_capacity" {
  description = "Autoscaling minimum task count."
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Autoscaling maximum task count."
  type        = number
  default     = 2
}

variable "cpu_target" {
  description = "Target average CPU utilisation percentage for scaling."
  type        = number
  default     = 60
}

variable "memory_target" {
  description = "Target average memory utilisation percentage for scaling."
  type        = number
  default     = 75
}

variable "health_check_grace_period_seconds" {
  description = "Seconds to ignore ALB health checks after a task starts."
  type        = number
  default     = 60
}

variable "log_retention_days" {
  description = "CloudWatch log retention for the service."
  type        = number
  default     = 30
}

variable "readonly_root_filesystem" {
  description = "Run the container with a read-only root filesystem (a writable /tmp is mounted)."
  type        = bool
  default     = true
}

variable "task_role_policy_json" {
  description = "Optional extra IAM policy (JSON) for the task role, for example S3 and SES access."
  type        = string
  default     = null
}

variable "create_migration_task" {
  description = "Also register a one-off migration task definition (<name>-migrate) with the same image and environment, its own secrets (migration_secrets) and its own execution and task roles. It runs with APP_ROLE=migrate."
  type        = bool
  default     = false
}

variable "migration_secrets" {
  description = "Secrets for the migration task, same format as secrets. Null reuses secrets. Set it so only the migration task can read the database master login."
  type        = map(string)
  default     = null
}

variable "migration_command" {
  description = "Optional command override for the migration task. Null runs `host/Aptiverse.Host.dll migrate`."
  type        = list(string)
  default     = null
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
