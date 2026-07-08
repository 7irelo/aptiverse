variable "aws_region" {
  description = "AWS region for SES. The SMTP endpoint and derived SMTP password are region-specific; keep the API's EmailSettings:Server in sync. Note: af-south-1 has NO resolvable SES SMTP endpoint (email-smtp.af-south-1.amazonaws.com does not exist), so SMTP sending must use a region that does -- eu-west-1 is the closest."
  type        = string
  default     = "eu-west-1"
}

variable "env" {
  type    = string
  default = "dev"
}

variable "ses_domain" {
  description = "Domain to verify and send from"
  type        = string
  default     = "aptiverse.co.za"
}

variable "ses_mail_from_subdomain" {
  description = "Subdomain for a custom MAIL FROM (SPF alignment + deliverability)"
  type        = string
  default     = "mail"
}

variable "ses_verify_emails" {
  description = "Individual email identities to verify (quick sandbox testing while the domain propagates). Each address gets an AWS verification email whose link must be clicked."
  type        = list(string)
  default     = []
}
