variable "name" {
  description = "Name prefix, for example aptiverse-dev. ALB names are limited to 32 characters."
  type        = string
}

variable "vpc_id" {
  description = "VPC id."
  type        = string
}

variable "subnet_ids" {
  description = "Public subnets for the ALB (at least two AZs)."
  type        = list(string)
}

variable "domain_name" {
  description = "Hostname the ALB certificate is issued for, for example api.dev.aptiverse.co.za."
  type        = string
}

variable "subject_alternative_names" {
  description = "Extra hostnames on the certificate."
  type        = list(string)
  default     = []
}

variable "certificate_validation_record_fqdns" {
  description = "FQDNs of the DNS validation records created in Cloudflare. The HTTPS listener waits for validation."
  type        = list(string)
}

variable "target_port" {
  description = "Container port the target group forwards to."
  type        = number
  default     = 8080
}

variable "health_check_path" {
  description = "Target group health check path."
  type        = string
  default     = "/health/ready"
}

variable "ssl_policy" {
  description = "TLS policy for the HTTPS listener."
  type        = string
  default     = "ELBSecurityPolicy-TLS13-1-2-2021-06"
}

variable "idle_timeout" {
  description = "ALB idle timeout in seconds (AI responses can stream for a while)."
  type        = number
  default     = 120
}

variable "deletion_protection" {
  description = "Protect the ALB from deletion."
  type        = bool
  default     = false
}

variable "access_logs_bucket" {
  description = "Optional S3 bucket for ALB access logs. Null disables access logs."
  type        = string
  default     = null
}

# Published at https://www.cloudflare.com/ips-v4 (checked 2026-10). The ALB is
# IPv4 only, so the IPv6 list is not needed. Keep in sync, or feed the
# cloudflare_ip_ranges data source from the env.
variable "cloudflare_ipv4_cidrs" {
  description = "Cloudflare edge IPv4 ranges allowed to reach the ALB."
  type        = list(string)
  default = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ]
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
