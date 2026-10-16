variable "region" {
  description = "Primary region (IAM resources and state live here)."
  type        = string
  default     = "af-south-1"
}

variable "ses_region" {
  description = "SES region. af-south-1 is not used for SES."
  type        = string
  default     = "eu-west-1"
}

variable "domain" {
  description = "Apex domain (Cloudflare zone and SES identity)."
  type        = string
  default     = "aptiverse.co.za"
}

variable "ses_mail_from_subdomain" {
  description = "Subdomain for the SES custom MAIL FROM domain."
  type        = string
  default     = "mail"
}

variable "publish_ses_dns_records" {
  description = "Manage the SES DKIM and MAIL FROM records in Cloudflare. Import the existing hand-made records before the first apply (see modules/dns/README.md)."
  type        = bool
  default     = true
}
