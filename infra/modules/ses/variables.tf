variable "domain" {
  description = "Sending domain."
  type        = string
  default     = "aptiverse.co.za"
}

variable "mail_from_subdomain" {
  description = "Subdomain for the custom MAIL FROM (bounce) domain."
  type        = string
  default     = "mail"
}

variable "configuration_set_name" {
  description = "Name of the SES configuration set the api sends through."
  type        = string
  default     = "aptiverse"
}

variable "tags" {
  description = "Extra tags applied to every resource."
  type        = map(string)
  default     = {}
}
