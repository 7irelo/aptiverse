# ses

SESv2 domain identity with Easy DKIM (RSA 2048), a custom MAIL FROM domain (`mail.<domain>` by default) and a configuration set with reputation metrics, account-level bounce and complaint suppression and required TLS.

- Call it with a provider aliased to **eu-west-1**; af-south-1 is not used for SES.
- There is no IAM SMTP user. The api task role gets `ses:SendEmail` on `identity_arn` and `configuration_set_arn` and sends with the SESv2 API.
- `dns_records` is a map of DKIM CNAMEs plus the MAIL FROM MX and SPF records, ready to feed the dns module. Root-domain records (Zoho MX, root SPF, DMARC) are not touched.

Adopting the existing identity: `aptiverse.co.za` is already verified in eu-west-1 from the old stack. Import it instead of recreating, so DKIM tokens stay the same:

```bash
terraform import 'module.ses.aws_sesv2_email_identity.this' aptiverse.co.za
terraform import 'module.ses.aws_sesv2_email_identity_mail_from_attributes.this' aptiverse.co.za
```
