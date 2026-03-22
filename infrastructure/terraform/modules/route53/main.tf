resource "aws_route53_zone" "this" {
  name = var.domain_name

  tags = merge(var.tags, {
    Name = var.domain_name
  })
}

resource "aws_route53_record" "records" {
  count = length(var.records)

  zone_id = aws_route53_zone.this.zone_id
  name    = var.records[count.index].name
  type    = var.records[count.index].type

  # Simple records with TTL
  ttl     = var.records[count.index].alias == null ? var.records[count.index].ttl : null
  records = var.records[count.index].alias == null ? var.records[count.index].records : null

  # Alias records
  dynamic "alias" {
    for_each = var.records[count.index].alias != null ? [var.records[count.index].alias] : []
    content {
      name                   = alias.value.name
      zone_id                = alias.value.zone_id
      evaluate_target_health = alias.value.evaluate_target_health
    }
  }
}
