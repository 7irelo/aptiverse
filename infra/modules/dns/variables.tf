variable "zone_name" {
  description = "Cloudflare zone name."
  type        = string
  default     = "aptiverse.co.za"
}

variable "records" {
  description = "DNS records keyed by a stable label. name may be a full FQDN or relative to the zone. ttl 1 means automatic (required for proxied records)."
  type = map(object({
    name     = string
    type     = string
    content  = string
    proxied  = optional(bool, false)
    ttl      = optional(number, 1)
    priority = optional(number)
    comment  = optional(string)
  }))
  default = {}
}
