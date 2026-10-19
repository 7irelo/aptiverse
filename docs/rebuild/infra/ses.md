# SES module (SESv2 sending identity, eu-west-1)

| | |
|---|---|
| ID range | INF-17, INF-69 to INF-73 |
| Phase | 1 (production access and reputation alarms before 2 exit) |
| Depends on | INF-19, SEC-01 (old SMTP key rotated), SEC-11 (old SES stack on remote state) |
| Code path | `infra/modules/ses/`, instantiated in `infra/envs/global/main.tf` with the `aws.eu_west_1` provider; records published by `module.ses_dns` |
| Status | INF-17 done in code; deleting the old SMTP IAM user is unverified. Import, DMARC, bounce and complaint handling, production access and reputation alarms are open. |

## Purpose

Send transactional email (verification, reset, receipts, reminders) from `noreply@aptiverse.co.za` through the SESv2 API called by the api and worker task roles. No SMTP and no IAM SMTP user. Inbound mail stays on Zoho.

## Scope

- Resources: `aws_sesv2_configuration_set` (`aptiverse`: reputation metrics on, sending on, suppression for BOUNCE and COMPLAINT, `tls_policy = REQUIRE`), `aws_sesv2_email_identity` (domain, Easy DKIM RSA 2048, default configuration set), `aws_sesv2_email_identity_mail_from_attributes` (`mail.aptiverse.co.za`, `USE_DEFAULT_VALUE` on MX failure).
- Inputs: `domain`, `mail_from_subdomain` (`mail`), `configuration_set_name`, `tags`.
- Outputs: `identity_arn`, `configuration_set_name`, `configuration_set_arn`, `region`, `dns_records` (three DKIM CNAMEs, MAIL FROM MX, MAIL FROM SPF TXT).
- Consumers: env stacks read the global outputs for `Email__SesRegion`, `Email__ConfigurationSet`, and the task policy `ses:SendEmail` on the identity and configuration set ARNs.

## Tasks

- [ ] **INF-17** `modules/ses`: SESv2 identity, DKIM, task role send permission, drop SMTP IAM user. *(unverified: module, DKIM records and task policy exist in code (`infra/modules/ses/main.tf`, `data.aws_iam_policy_document.app` in `envs/*/main.tf`); deleting the old SMTP IAM user and its keys is an AWS action)*
- [ ] **INF-69** Import the existing SES identity and its Cloudflare DNS records before the first `envs/global` apply (see `modules/ses/README.md` and `modules/dns/README.md`) so DKIM tokens are adopted, not regenerated. *(unverified: AWS and Cloudflare state)*
- [ ] **INF-70** DMARC: publish `_dmarc.aptiverse.co.za` TXT through the dns module, starting `v=DMARC1; p=none; rua=mailto:<reports address>; adkim=s; aspf=r`, then move to `p=quarantine` after two clean weeks of reports, and `p=reject` before launch. Check the existing Zoho SPF on the apex is not broken.
- [ ] **INF-71** Bounce and complaint handling: add an `aws_sesv2_configuration_set_event_destination` for BOUNCE, COMPLAINT, REJECT and DELIVERY_DELAY to an SNS topic in eu-west-1 with an SQS subscription (or an HTTPS subscription to an api webhook), so the Notifications module can mark addresses undeliverable. Grant only the worker role read on that queue.
- [ ] **INF-72** Production access: request SES production access in eu-west-1 (out of the sandbox) with the use case, expected volume and bounce handling described; keep staging and dev restricted to verified recipients or a recipient allowlist (see `env-staging.md`). *(unverified: AWS support case)*
- [ ] **INF-73** Reputation alarms: CloudWatch alarms in eu-west-1 on `Reputation.BounceRate` above 4 percent and `Reputation.ComplaintRate` above 0.08 percent (below the SES review thresholds of 5 and 0.1), routed to the alarm topic (a cross-region SNS topic or a second topic in eu-west-1 subscribed to the same targets).

## Verification

- `terraform -chdir=infra/envs/global plan` shows no identity replacement after INF-69.
- `aws sesv2 get-email-identity --email-identity aptiverse.co.za --region eu-west-1 --query '[VerifiedForSendingStatus,DkimAttributes.Status,MailFromAttributes.MailFromDomainStatus]'` returns `true`, `SUCCESS`, `SUCCESS`.
- `aws sesv2 get-account --region eu-west-1 --query ProductionAccessEnabled` returns `true` after INF-72.
- `aws iam list-users` shows no SES SMTP user; `aws iam list-access-keys` for any old user returns nothing.
- `dig TXT _dmarc.aptiverse.co.za` returns the policy; a test mail to a Gmail inbox shows `dkim=pass`, `spf=pass`, `dmarc=pass`.
- Sending to `bounce@simulator.amazonses.com` from dev produces a message on the bounce queue after INF-71.

## Open questions

- Which mailbox receives DMARC aggregate reports (a Zoho alias or a report service)?
- Should dev and staging use separate configuration sets so their reputation metrics do not mix with prod?
