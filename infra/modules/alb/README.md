# alb

Internet-facing ALB for the api, reachable only from Cloudflare.

- ACM certificate (DNS validated, ECDSA P-256) for `domain_name`. The module outputs `certificate_validation_records`; the env creates them in Cloudflare (dns module) and passes the FQDNs back in `certificate_validation_record_fqdns`. The HTTPS listener waits for validation.
- HTTP (80) redirects to HTTPS (443). HTTPS uses a TLS 1.3/1.2 policy and forwards to one `ip` target group with health check `/health/ready`.
- Security group ingress on 80 and 443 only from `cloudflare_ipv4_cidrs` (defaults to the currently published Cloudflare IPv4 ranges). Egress only to the target port inside the VPC.
- `drop_invalid_header_fields` on; deletion protection and access logs are opt-in.

This is what makes Cloudflare SSL mode "Full (strict)" possible: Cloudflare connects to the ALB with SNI `domain_name` and gets a publicly trusted ACM certificate.
