output "dns_name" {
  description = "ALB DNS name (target of the proxied Cloudflare record)."
  value       = aws_lb.this.dns_name
}

output "arn" {
  description = "ALB ARN."
  value       = aws_lb.this.arn
}

output "arn_suffix" {
  description = "ALB ARN suffix (CloudWatch LoadBalancer dimension)."
  value       = aws_lb.this.arn_suffix
}

output "security_group_id" {
  description = "ALB security group id."
  value       = aws_security_group.this.id
}

output "target_group_arn" {
  description = "API target group ARN."
  value       = aws_lb_target_group.api.arn
}

output "target_group_arn_suffix" {
  description = "API target group ARN suffix (CloudWatch TargetGroup dimension)."
  value       = aws_lb_target_group.api.arn_suffix
}

output "certificate_arn" {
  description = "ACM certificate ARN."
  value       = aws_acm_certificate.this.arn
}

output "certificate_validation_records" {
  description = "DNS records to create for ACM validation, keyed by domain."
  value = {
    for o in aws_acm_certificate.this.domain_validation_options : o.domain_name => {
      name    = trimsuffix(o.resource_record_name, ".")
      type    = o.resource_record_type
      content = trimsuffix(o.resource_record_value, ".")
    }
  }
}
