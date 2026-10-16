# Account-wide resources shared by every environment:
#   - SES sending identity in eu-west-1 (with its DNS records in Cloudflare)
#   - the GitHub Actions OIDC provider
# Env stacks read this stack's outputs through terraform_remote_state.

module "ses" {
  source = "../../modules/ses"

  providers = {
    aws = aws.eu_west_1
  }

  domain              = var.domain
  mail_from_subdomain = var.ses_mail_from_subdomain
}

module "ses_dns" {
  source = "../../modules/dns"
  count  = var.publish_ses_dns_records ? 1 : 0

  zone_name = var.domain
  records   = module.ses.dns_records
}

module "github_oidc" {
  source = "../../modules/github-oidc"

  create_provider = true
  create_roles    = false
}
