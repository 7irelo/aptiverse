output "identity_arn" {
  description = "ARN of the domain identity (resource for ses:SendEmail in task role policies)."
  value       = aws_sesv2_email_identity.this.arn
}

output "configuration_set_name" {
  description = "Configuration set name the api should send through."
  value       = aws_sesv2_configuration_set.this.configuration_set_name
}

output "configuration_set_arn" {
  description = "Configuration set ARN (also needed as a resource for ses:SendEmail)."
  value       = aws_sesv2_configuration_set.this.arn
}

output "region" {
  description = "Region the identity lives in."
  value       = data.aws_region.current.region
}

output "dns_records" {
  description = "DNS records to publish: DKIM CNAMEs plus MAIL FROM MX and SPF. Keyed by a stable label."
  value = merge(
    {
      # Easy DKIM always yields three tokens. Iterating a fixed range keeps the
      # map keys known at plan time even before the identity exists.
      for i in range(3) :
      "ses-dkim-${i}" => {
        name     = "${aws_sesv2_email_identity.this.dkim_signing_attributes[0].tokens[i]}._domainkey.${var.domain}"
        type     = "CNAME"
        content  = "${aws_sesv2_email_identity.this.dkim_signing_attributes[0].tokens[i]}.dkim.amazonses.com"
        priority = null
      }
    },
    {
      "ses-mail-from-mx" = {
        name     = local.mail_from_domain
        type     = "MX"
        content  = "feedback-smtp.${data.aws_region.current.region}.amazonses.com"
        priority = 10
      }
      "ses-mail-from-spf" = {
        name     = local.mail_from_domain
        type     = "TXT"
        content  = "\"v=spf1 include:amazonses.com ~all\""
        priority = null
      }
    },
  )
}
