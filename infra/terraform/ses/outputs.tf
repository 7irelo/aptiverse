output "ses_smtp_host" {
  description = "EmailSettings__Server"
  value       = "email-smtp.${var.aws_region}.amazonaws.com"
}

output "ses_smtp_port" {
  description = "EmailSettings__Port (STARTTLS)"
  value       = 587
}

output "ses_smtp_username" {
  description = "EmailSettings__Username"
  value       = aws_iam_access_key.ses_smtp.id
}

output "ses_smtp_password" {
  description = "EmailSettings__Password — read with: terraform output -raw ses_smtp_password"
  value       = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  sensitive   = true
}

# Add these records at your DNS host (Cloudflare). Cloudflare appends the zone
# automatically, so enter the name without the trailing ".aptiverse.co.za".
output "ses_dns_records" {
  description = "DNS records to add for domain verification + DKIM + MAIL FROM + DMARC"
  value = concat(
    [{
      type  = "TXT"
      name  = "_amazonses.${var.ses_domain}"
      value = aws_ses_domain_identity.primary.verification_token
      note  = "Domain verification"
    }],
    [for t in aws_ses_domain_dkim.primary.dkim_tokens : {
      type  = "CNAME"
      name  = "${t}._domainkey.${var.ses_domain}"
      value = "${t}.dkim.amazonses.com"
      note  = "DKIM"
    }],
    [
      {
        type  = "MX"
        name  = aws_ses_domain_mail_from.primary.mail_from_domain
        value = "10 feedback-smtp.${var.aws_region}.amazonses.com"
        note  = "MAIL FROM bounce (priority 10)"
      },
      {
        type  = "TXT"
        name  = aws_ses_domain_mail_from.primary.mail_from_domain
        value = "v=spf1 include:amazonses.com ~all"
        note  = "MAIL FROM SPF"
      },
      {
        type  = "TXT"
        name  = "_dmarc.${var.ses_domain}"
        value = "v=DMARC1; p=none; rua=mailto:dmarc@${var.ses_domain}"
        note  = "DMARC (recommended; start at p=none)"
      },
    ],
  )
}
