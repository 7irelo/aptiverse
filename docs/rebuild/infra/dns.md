# DNS module (Cloudflare records and zone settings)

| | |
|---|---|
| ID range | INF-19, INF-80 to INF-86 |
| Phase | 1 (zone hardening by 10, Full strict after CUT-11) |
| Depends on | INF-12 (ALB DNS name), INF-17 (SES records) |
| Code path | `infra/modules/dns/`; used by `envs/global` (`ses_dns`) and env stacks (`acm_dns`, `api_dns`) |
| Status | INF-19 partial: records for the api, ACM validation and SES exist; web hostnames, zone SSL mode and zone hardening are not managed. |

## Purpose

Manage Cloudflare DNS for `aptiverse.co.za` as code: the proxied api origin record per env, ACM validation records, SES DKIM and MAIL FROM records, and (to add) the web hostnames that point at Vercel plus the zone security settings.

## Scope

- Resources: `data.cloudflare_zone` (by `zone_name`), `cloudflare_dns_record` per entry in `records` (name, type, content, proxied, ttl 1 when proxied, priority, comment defaulting to "managed by terraform (aptiverse-labs/infra)").
- Inputs: `zone_name` (default `aptiverse.co.za`), `records` map.
- Records today: `api.dev`, `api.staging`, `api` CNAME to the env ALB (proxied); ACM validation CNAMEs (not proxied); SES DKIM CNAMEs, MAIL FROM MX and SPF TXT (global).
- Not managed: zone SSL mode (still Flexible for the old EC2 origin per `infra/README.md` known caveats), Always Use HTTPS, minimum TLS, HSTS, CAA, DNSSEC, the apex, `www`, `app`, `dev`, `staging` records for Vercel, Zoho MX and SPF.
- Credentials: `CLOUDFLARE_API_TOKEN` (DNS edit on the zone only) for apply, `CLOUDFLARE_API_TOKEN_READ` for plan.

## Tasks

- [ ] **INF-19** `modules/dns`: Cloudflare provider, records for app/api/dev/staging, Full (strict). *(partial: module plus api, ACM and SES records exist; app, dev and staging web records and Full (strict) are not managed)*
- [ ] **INF-80** Zone SSL mode Full (strict) as code: manage `ssl = strict` with `cloudflare_zone_setting` once the old EC2 origin (Flexible) is retired at CUT-11; until then document the per-hostname override (Configuration Rule setting SSL strict on `api.*` v2 hostnames) so the new stack never uses Flexible. (split from INF-19)
- [ ] **INF-81** Zone TLS hardening as code: `always_use_https = on`, `min_tls_version = 1.2`, `tls_1_3 = on`, `automatic_https_rewrites = on`, HSTS (`max-age` 2 years, include subdomains, preload only after every subdomain is HTTPS) consistent with the web `Strict-Transport-Security` header in `web/next.config.ts`.
- [ ] **INF-82** Web hostnames to Vercel: apex, `www`, `app`, `dev`, `staging` records pointing at Vercel (`cname.vercel-dns.com` or the apex A record Vercel gives), DNS only (not proxied) unless the double-proxy decision in `vercel.md` says otherwise. Import any existing records first. (split from INF-19)
- [ ] **INF-83** Two-level api hostnames: decide between Cloudflare Advanced Certificate Manager (covers `api.dev` and `api.staging`) or `api-dev` and `api-staging` (`api_hostname` variable). Update `web_origins`, the web `API_INTERNAL_URL` per env and the config contract to match.
- [ ] **INF-84** CAA records allowing only the CAs in use (Amazon for ACM on the ALB, the Cloudflare edge CAs, and Vercel's CA for web hostnames), with `iodef` to the security mailbox.
- [ ] **INF-85** DNSSEC: enable on the Cloudflare zone (`cloudflare_zone_dnssec`) and add the DS record at the `.co.za` registrar. *(unverified: registrar action)*
- [ ] **INF-86** Import and manage the remaining hand-made records (Zoho MX, Zoho SPF and DKIM, any verification TXT) so the zone is fully described in code and drift shows in plan; record the Cloudflare API token scopes (DNS edit, Zone Settings edit, WAF edit for `edge-security.md`) and their owner.

## Verification

- `terraform -chdir=infra/modules/dns init -backend=false && terraform validate`.
- `dig +short api.dev.aptiverse.co.za` returns Cloudflare addresses (proxied); `dig CNAME _<token>.api.dev.aptiverse.co.za` returns the ACM validation target.
- `curl -sI https://api.dev.aptiverse.co.za/health/ready` returns 200 with a valid certificate chain; `curl -sI http://...` returns 301 after INF-81.
- `dig CAA aptiverse.co.za` lists the allowed CAs after INF-84; `dig +dnssec aptiverse.co.za` shows `ad` from a validating resolver after INF-85.
- `terraform plan` in every stack shows no record drift after INF-86.

## Open questions

- Decided (64): the product (marketing and app) is on the apex `aptiverse.co.za`, the API on `api.aptiverse.co.za`, environments on `dev.` and `staging.`. Prod `web_origins` is the apex plus `www` (redirecting to the apex); `app.` is not used.
- Should the old app stay reachable on a different hostname during the 30-day rollback window after cutover (CUT-10)?
