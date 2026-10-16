# Email: how Aptiverse sends and receives mail

This is the plain-language map of our email setup: which servers do what, which
DNS records make it work, and what every acronym means. If mail stops arriving
or lands in spam, start here.

## The one-paragraph version

Two separate systems handle mail for `aptiverse.co.za`. **Amazon SES** sends the
app's automated mail (verification links, billing, password resets) from
`noreply@`. **Zoho Mail** hosts the real human mailbox, `eric@`, plus the
`support@` and `schools@` aliases, and is where inbound mail lands. **Cloudflare**
holds the DNS records that point the world at both. Three DNS records (SPF, DKIM,
DMARC) prove that mail claiming to be from us really is, which is what keeps us
out of the spam folder.

## Who does what

| System | Role | Talks to |
|---|---|---|
| **Amazon SES** (eu-west-1) | Outbound only. The API queues mail and sends it over SES's SMTP server. From address is `noreply@aptiverse.co.za`. | `email-smtp.eu-west-1.amazonaws.com` |
| **Zoho Mail** (Mail Lite, US region) | Inbound mailbox for humans. `eric@` is the real box; `support@` and `schools@` are aliases into it. Also sends when Eric replies. | `mx.zoho.com`, `smtp.zoho.com` |
| **Cloudflare** | DNS host for the domain. Every record below lives here. Used to do inbound forwarding (Email Routing), now disabled in favour of Zoho. | n/a (DNS only) |

Inbound and outbound are deliberately split. SES is cheap and reliable for
high-volume automated mail but is not a mailbox (you cannot log in and read it).
Zoho is a proper mailbox but is not where you want the app blasting thousands of
verification emails from. Each does the job it is good at.

## The DNS records and what they do

All on Cloudflare, for `aptiverse.co.za`.

| Record | Name | Points at | Purpose |
|---|---|---|---|
| MX (10/20/50) | `@` (root) | `mx.zoho.com`, `mx2`, `mx3` | Where inbound mail is delivered. Priority order: 10 first, then 20, then 50. |
| MX (10) | `mail.` | `feedback-smtp.eu-west-1.amazonses.com` | SES's bounce (MAIL FROM) subdomain. Do not touch. |
| TXT (SPF) | `@` (root) | `v=spf1 include:zoho.com include:amazonses.com ~all` | Lists who may send mail as this domain: Zoho and SES. |
| TXT (SPF) | `mail.` | `v=spf1 include:amazonses.com ~all` | SPF for SES's bounce subdomain. Do not touch. |
| TXT (DKIM) | `zoho._domainkey` | `v=DKIM1; k=rsa; p=...` | Zoho's public key for signing outbound mail. |
| CNAME x3 | `<token>._domainkey` | `<token>.dkim.amazonses.com` | SES's DKIM keys (Easy DKIM). Do not touch. |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@aptiverse.co.za` | Policy for what to do when SPF/DKIM fail, and where to send reports. |
| CNAME | `zb65889555` | `zmverify.zoho.com` | Proves to Zoho we own the domain. Leave it. |
| TXT | `_amazonses` | (verification token) | Proves to AWS we own the domain. Leave it. |

## The acronyms, in order of how much they matter

- **DNS** (Domain Name System): the internet's address book. Turns names like
  `aptiverse.co.za` into the servers that handle web and mail. Cloudflare is our
  DNS host.
- **MX** (Mail eXchanger): a DNS record that says "deliver mail for this domain
  to this server." Ours point at Zoho. Lower priority number = tried first.
- **SMTP** (Simple Mail Transfer Protocol): the language servers speak to hand
  mail to each other. The API sends over SES's SMTP server; Eric's mail client
  sends over Zoho's.
- **SES** (Simple Email Service): Amazon's bulk-sending service. Our outbound
  workhorse. Not a mailbox.
- **TXT record**: a free-text DNS record. SPF, DKIM, and DMARC are all published
  as TXT records.
- **CNAME record**: a DNS alias that points one name at another. SES's DKIM keys
  and the Zoho ownership check use CNAMEs.
- **SPF** (Sender Policy Framework): a TXT record listing the servers allowed to
  send mail as your domain. A receiver checks the sending server against it. Ours
  authorises both Zoho and SES. `~all` means "anything else is suspicious but do
  not hard-fail."
- **DKIM** (DomainKeys Identified Mail): the sender signs each message with a
  private key; the matching public key is published in DNS. The receiver verifies
  the signature, which proves the message was not tampered with in transit and
  really came from an authorised sender. SES and Zoho each have their own DKIM
  keys and selectors.
- **selector**: the label that picks which DKIM key to use (e.g. `zoho` in
  `zoho._domainkey`). Lets a domain run several DKIM keys at once, which is why
  SES's keys and Zoho's key coexist without clashing.
- **DMARC** (Domain-based Message Authentication, Reporting and Conformance):
  ties SPF and DKIM together. It tells receivers what to do when a message fails
  both (`p=none` = do nothing yet, just watch; `p=quarantine` = spam folder;
  `p=reject` = bounce it) and where to email aggregate reports (`rua=`). We are at
  `p=none` while we confirm nothing legitimate is failing.
- **alignment**: DMARC passes only if the domain that passed SPF or DKIM matches
  the visible `From:` domain. SES sends `From: noreply@aptiverse.co.za` and signs
  DKIM as `aptiverse.co.za`, so it aligns.
- **MAIL FROM** (a.k.a. envelope-from / bounce address): the behind-the-scenes
  return address used for bounces, separate from the visible `From:`. SES uses
  `mail.aptiverse.co.za` for this, which is why that subdomain has its own MX and
  SPF.
- **alias**: an extra address that drops into an existing mailbox. `support@` and
  `schools@` are aliases into `eric@`; you can also send *as* them.
- **catch-all**: an optional Zoho setting that sends any address not otherwise
  defined into one mailbox. Currently OFF: only `eric@`, `support@`, `schools@`
  resolve; anything else bounces.
- **Reply-To**: a header that overrides where replies go. Our SES mail is `From:
  noreply@` but sets `Reply-To: support@`, so a user hitting reply reaches a human.
- **BIMI** (Brand Indicators for Message Identification): the standard that puts a
  brand logo next to your emails in the inbox. Needs enforced DMARC
  (`p=quarantine`/`reject`) plus, for Gmail, a paid **VMC**. Not set up; parked
  until it is worth the cost.
- **VMC** (Verified Mark Certificate): a paid certificate (~USD 1,000+/yr) proving
  you own the trademark on your logo. Gmail requires it before it will show a BIMI
  logo.

## How a message actually flows

**Outbound (app → user):** the API drops the message on an in-process queue; a
background `EmailDispatcher` sends it over SES SMTP as `noreply@` with
`Reply-To: support@`. SES signs it with DKIM and sends the bounce path via
`mail.aptiverse.co.za`. The receiver checks SPF + DKIM + DMARC and (all passing)
delivers to the inbox.

**Inbound (someone → us):** the sender looks up our MX, sees Zoho, and delivers
there. Mail to `support@`/`schools@` lands in the `eric@` box. Eric reads and
replies from Zoho webmail or a mail client.

**Human outbound (Eric → someone):** sent through Zoho's SMTP, signed with Zoho's
DKIM, authorised by the `include:zoho.com` in our SPF.

## Config in the codebase

- `EmailSettings` (SMTP host, port, credentials, sender, `ReplyToEmail`) is bound
  from `EmailSettings__*` environment variables. In production those come from
  GitHub Actions secrets, injected by the deploy workflow.
- `EmailDispatcher` builds and sends each message and is the place to change From,
  Reply-To, or signing behaviour.
- Sending region must stay `eu-west-1`: `af-south-1` has no SES SMTP endpoint.

## Deploys

The API redeploys automatically on push to the `aptiverse-labs/api` main branch:
GitHub Actions builds the Docker image, pushes it to GHCR, SSHes to the EC2 host,
runs `docker compose pull && up -d`, and only reports success once the API answers
`/health`. Changing an `EmailSettings` env var means updating the GitHub secret,
not editing code.

## Open items

- **DMARC is at `p=none`.** After a couple of weeks of clean aggregate reports,
  tighten to `p=quarantine`, then `p=reject`. This is what makes DMARC actually
  protect the domain (and unlocks BIMI).
- **BIMI/logo:** blocked on the DMARC tightening above plus a VMC. Parked.
- **Catch-all is off:** add new aliases in Zoho as new addresses are needed, or
  turn on catch-all if bounces on typo'd addresses become a problem.
