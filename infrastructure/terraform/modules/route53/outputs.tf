output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.this.zone_id
}

output "name_servers" {
  description = "Name servers for the hosted zone (update at GoDaddy)"
  value       = aws_route53_zone.this.name_servers
}

output "domain_name" {
  description = "Domain name of the hosted zone"
  value       = aws_route53_zone.this.name
}
