variable "name" {
  description = "Name prefix for all resources, for example aptiverse-dev."
  type        = string
}

variable "cidr_block" {
  description = "VPC CIDR block."
  type        = string
  default     = "10.20.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to spread subnets across."
  type        = number
  default     = 2

  validation {
    condition     = var.az_count >= 2 && var.az_count <= 3
    error_message = "The az_count must be 2 or 3."
  }
}

variable "enable_nat_gateway" {
  description = "Create a single NAT gateway so private subnets have outbound internet. Off in dev to save cost; tasks then run in public subnets locked down by security groups."
  type        = bool
  default     = false
}

variable "interface_endpoints" {
  description = "AWS services to expose through interface VPC endpoints (short names such as ecr.api)."
  type        = list(string)
  default     = ["ecr.api", "ecr.dkr", "secretsmanager", "logs"]
}

variable "enable_flow_logs" {
  description = "Send VPC flow logs (rejected traffic only) to CloudWatch Logs."
  type        = bool
  default     = true
}

variable "flow_log_retention_days" {
  description = "Retention for the VPC flow log group."
  type        = number
  default     = 30
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
