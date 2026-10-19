# Edge security (Cloudflare WAF, rate limiting, bot rules)

| | |
|---|---|
| ID range | INF-87 to INF-94 |
| Phase | 1 (log mode), 10 (enforce) |
| Depends on | INF-19, INF-56 (origin lock-down), INF-86 (token scopes) |
| Code path | New: `infra/modules/edge-security/` (Cloudflare `cloudflare_ruleset` resources), used by `envs/global` or each env stack |
| Status | Not started. No WAF or edge rate-limit rules are managed in code today; the ALB relies on Cloudflare-only ingress. |

## Purpose

Stop abusive and malicious traffic at the edge before it reaches the ALB or Vercel: managed WAF rules, rate limits on authentication, payment and AI routes, and bot challenges, all as Terraform so changes are reviewed and reversible. The app keeps its own per-user and per-IP rate limits (ASP.NET rate limiter); the edge is the first layer.

## Scope

- Resources (Cloudflare provider 5.x): `cloudflare_ruleset` for phase `http_request_firewall_managed` (Cloudflare Managed Ruleset and OWASP Core Ruleset), `http_request_firewall_custom` (custom rules), `http_ratelimit` (rate limiting rules), optional `http_request_late_transform` (origin auth header for INF-56).
- Inputs: zone, per-env hostnames, thresholds per route group, an action mode (`log` or `block`), Paystack webhook source ranges.
- Outputs: ruleset ids.
- Route groups (match the api rate-limit groups): `auth` (`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot-password`), `webhooks` (`/billing/paystack/webhook`), `ai` (`/ai/*`, tutor SSE), `uploads` (presign endpoints), default.
- Decision recorded here: no AWS WAF on the ALB, because the ALB only accepts Cloudflare and INF-56 closes the bypass. Revisit if Cloudflare is ever removed.

## Tasks

- [ ] **INF-87** Module skeleton `modules/edge-security` with `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`, README, and the managed WAF ruleset deployed in log mode on the api and web hostnames for one week.
- [ ] **INF-88** OWASP Core Ruleset with paranoia level 1 and anomaly threshold "medium", log mode first; review false positives (rich text from the tutor and Markdown answers, LaTeX payloads) and add skip rules scoped to exact paths before enforcing.
- [ ] **INF-89** Rate limiting rules for `auth`: for example 10 requests per minute per IP on login and forgot-password, 5 per minute on register, with a managed challenge then block; numbers to be confirmed against HRD-22 and the api limits.
- [ ] **INF-90** Webhook protection: allow `POST` to the Paystack webhook path only from Paystack's published IPs, skip bot and rate rules for those IPs, and block everything else on that path. The api still verifies the HMAC signature.
- [ ] **INF-91** AI and upload abuse rules: per-IP rate limits on `/ai/*` and upload presign paths sized well above normal student use; long-lived SSE responses must be excluded from timeouts and buffering (check Cloudflare proxy read timeout of 100 seconds against the tutor stream design).
- [ ] **INF-92** Custom rules: block requests to `/health/*` and `/scalar*` from the internet (health is for the ALB only; Scalar is Development only), block known bad user agents, and challenge countries only if abuse data supports it (no default geo-block: students travel).
- [ ] **INF-93** Bot management: enable Super Bot Fight Mode (Cloudflare Pro, decision 65) on the web hostnames, with verified bots allowed and the api excluded so server-to-server calls from Vercel are never challenged. *(unverified: Cloudflare dashboard settings)*
- [ ] **INF-94** Enforcement switch and runbook: flip `mode` from `log` to `block` per ruleset in a reviewed PR after the log-mode review, and document in `infra/README.md` how to disable one rule fast during an incident (reverting the PR or a targeted `terraform apply -target`).

## Verification

- `terraform -chdir=infra/modules/edge-security init -backend=false && terraform validate`.
- `curl` a classic SQL injection probe (`/?id=1%27%20or%201=1`) against `api.dev`: Cloudflare firewall events show a match (log mode) or a 403 (block mode).
- A loop of 20 login POSTs in one minute from one IP gets challenged or 429 at the edge after INF-89.
- A POST to the webhook path from a non-Paystack IP returns 403 at the edge after INF-90.
- `curl https://api.<env>/health/ready` from the internet returns 403 while the ALB target health stays healthy after INF-92.

## Open questions

- Decided (65): the zone runs on Cloudflare Pro for the managed WAF rules; rate-limit rule counts are planned to the Pro allowance.
- Does the Vercel side need its own firewall rules (Vercel Firewall) or is Cloudflare in front of Vercel (double proxy) acceptable? See `vercel.md`.
