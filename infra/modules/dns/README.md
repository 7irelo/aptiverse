# dns

Cloudflare DNS records for one zone (`aptiverse.co.za` by default) using the Cloudflare provider v5 (`cloudflare_dns_record`). Authenticate with the `CLOUDFLARE_API_TOKEN` environment variable (a token scoped to DNS edit on this zone only).

The module is generic: callers pass a `records` map. The stacks use it for:

- env stacks: the proxied `api` record (CNAME to the ALB) and the unproxied ACM validation CNAMEs.
- `envs/global`: the SES DKIM CNAMEs and MAIL FROM MX and SPF records.

Proxied records are forced to TTL 1 (automatic). Zone-wide settings such as SSL mode are not managed here yet; switch the zone to "Full (strict)" by hand once every proxied origin presents a valid certificate (the old EC2 origin does not).

Records that already exist in Cloudflare (for example the SES records created by hand from the old stack) must be imported or deleted first, otherwise the create fails:

```bash
terraform import 'module.ses_dns.cloudflare_dns_record.this["ses-dkim-0"]' '<zone_id>/<record_id>'
```
