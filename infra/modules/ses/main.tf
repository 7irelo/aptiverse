# The calling provider decides the region. Aptiverse sends from eu-west-1
# because af-south-1 has no SES sending endpoint we use.
data "aws_region" "current" {}

locals {
  mail_from_domain = "${var.mail_from_subdomain}.${var.domain}"
}

resource "aws_sesv2_configuration_set" "this" {
  configuration_set_name = var.configuration_set_name

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    sending_enabled = true
  }

  suppression_options {
    suppressed_reasons = ["BOUNCE", "COMPLAINT"]
  }

  delivery_options {
    tls_policy = "REQUIRE"
  }

  tags = var.tags
}

# Domain identity with Easy DKIM (three CNAMEs). No IAM SMTP user: the api
# task role calls the SESv2 API directly.
resource "aws_sesv2_email_identity" "this" {
  email_identity         = var.domain
  configuration_set_name = aws_sesv2_configuration_set.this.configuration_set_name

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }

  tags = var.tags
}

resource "aws_sesv2_email_identity_mail_from_attributes" "this" {
  email_identity         = aws_sesv2_email_identity.this.email_identity
  mail_from_domain       = local.mail_from_domain
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}
