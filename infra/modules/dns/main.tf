data "cloudflare_zone" "this" {
  filter = {
    name = var.zone_name
  }
}

resource "cloudflare_dns_record" "this" {
  for_each = var.records

  zone_id  = data.cloudflare_zone.this.zone_id
  name     = each.value.name
  type     = each.value.type
  content  = each.value.content
  proxied  = each.value.proxied
  ttl      = each.value.proxied ? 1 : each.value.ttl
  priority = each.value.priority
  comment  = coalesce(each.value.comment, "managed by terraform (aptiverse-labs/infra)")
}
