output "zone_id" {
  description = "Cloudflare zone id."
  value       = data.cloudflare_zone.this.zone_id
}

output "fqdns" {
  description = "Map of record label to the fully qualified record name."
  value = {
    for k, r in cloudflare_dns_record.this : k => (
      endswith(r.name, var.zone_name) ? r.name : "${r.name}.${var.zone_name}"
    )
  }
}
