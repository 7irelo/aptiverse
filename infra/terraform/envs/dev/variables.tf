variable "aws_region" {
  type    = string
  default = "af-south-1"
}

variable "env" {
  type    = string
  default = "dev"
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "ssh_allowed_cidrs" {
  description = "CIDRs allowed to SSH (port 22). Lock to your IP via tfvars."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "http_allowed_cidrs" {
  description = "CIDRs allowed on port 80. For Cloudflare-proxied traffic, lock to Cloudflare IPs (https://www.cloudflare.com/ips-v4)."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
