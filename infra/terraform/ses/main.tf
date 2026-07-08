# -----------------------------------------------------------------------------
# Amazon SES — sending identity for aptiverse.co.za + SMTP credentials for the
# API's EmailDispatcher (MailKit -> SES SMTP).
#
# Standalone stack: its own state, no coupling to the RDS/EC2 env, so a
# `terraform apply` here can only create/modify SES + a scoped IAM user.
#
# Everything here is declarative and idempotent. Two steps SES exposes no API
# for remain manual:
#   1. Add the `ses_dns_records` output to your DNS host (Cloudflare) so AWS can
#      verify the domain + DKIM + MAIL FROM. Verification then completes on its
#      own; no second apply needed.
#   2. Request production access to leave the SES sandbox (Console -> SES ->
#      Account dashboard -> Request production access). In the sandbox you can
#      only send to verified addresses (see `ses_verify_emails`).
# -----------------------------------------------------------------------------

# --- Domain identity + DKIM (Easy DKIM, 3 CNAMEs) ----------------------------
resource "aws_ses_domain_identity" "primary" {
  domain = var.ses_domain
}

resource "aws_ses_domain_dkim" "primary" {
  domain = aws_ses_domain_identity.primary.domain
}

# Custom MAIL FROM (bounce) domain — aligns SPF and lifts deliverability.
resource "aws_ses_domain_mail_from" "primary" {
  domain           = aws_ses_domain_identity.primary.domain
  mail_from_domain = "${var.ses_mail_from_subdomain}.${var.ses_domain}"
}

# Optional single-address identities for sandbox testing. Terraform creates
# them; the owner must click the verification link AWS emails.
resource "aws_ses_email_identity" "test" {
  for_each = toset(var.ses_verify_emails)
  email    = each.value
}

# --- SMTP credential ---------------------------------------------------------
# SES SMTP auth is an IAM user access key: the key id is the SMTP username and
# `ses_smtp_password_v4` is the key secret run through AWS's region-specific
# derivation. Least-privilege: send only via this domain identity.
resource "aws_iam_user" "ses_smtp" {
  name = "aptiverse-${var.env}-ses-smtp"
  path = "/service/"
}

data "aws_iam_policy_document" "ses_send" {
  statement {
    sid     = "AllowSesSend"
    actions = ["ses:SendRawEmail", "ses:SendEmail"]
    # Must be "*", NOT the identity ARN. The SMTP endpoint authorizes
    # ses:SendRawEmail at AUTH time, before any From address is known, so a
    # resource-scoped policy has nothing to match and denies with a 535
    # "authentication error" (even though API sends, which carry the From, work
    # fine). Sending is still constrained to verified identities by SES itself.
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "ses_send" {
  name   = "ses-send"
  user   = aws_iam_user.ses_smtp.name
  policy = data.aws_iam_policy_document.ses_send.json
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}
