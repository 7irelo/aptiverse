# ALB module

| | |
|---|---|
| ID range | INF-12, INF-13, INF-54 to INF-57 |
| Phase | 1 (origin lock-down and access logs by 10) |
| Depends on | INF-03, INF-19 |
| Code path | `infra/modules/alb/` |
| Status | INF-12 and INF-13 done in code. IPv6 Cloudflare ranges, access logs, origin authentication and ALB latency alarms not started. |

## Purpose

The public origin for `api.<domain>` behind Cloudflare: TLS with an ACM certificate, ingress only from Cloudflare edge ranges, health checks on `/health/ready`, and forwarding to the api tasks.

## Scope

- Resources: `aws_acm_certificate` (DNS validation, `EC_prime256v1`, `create_before_destroy`), `aws_acm_certificate_validation`, `aws_security_group` with one ingress rule per Cloudflare IPv4 CIDR on 80 and 443 and egress to the target port inside the VPC, `aws_lb` (`internal = false`, `drop_invalid_header_fields = true`, `idle_timeout` 120, deletion protection from input, optional access logs), `aws_lb_target_group.api` (HTTP, `target_type = ip`, `deregistration_delay` 30, health check `/health/ready`, matcher 200, interval 15, timeout 5, healthy 2, unhealthy 3), `aws_lb_listener.http` (301 to HTTPS), `aws_lb_listener.https` (`ELBSecurityPolicy-TLS13-1-2-2021-06`).
- Inputs: `name`, `vpc_id`, `subnet_ids` (public), `domain_name`, `subject_alternative_names`, `certificate_validation_record_fqdns`, `target_port` (8080), `health_check_path`, `ssl_policy`, `idle_timeout`, `deletion_protection` (false dev and staging, true prod via `alb_deletion_protection`), `access_logs_bucket` (null), `cloudflare_ipv4_cidrs` (static list in `variables.tf`), `tags`.
- Outputs: `dns_name`, `arn_suffix`, `target_group_arn`, `target_group_arn_suffix`, `security_group_id`, `certificate_validation_records`.
- Accepted finding: `AVD-AWS-0053` (public ALB) in `infra/.trivyignore`.

## Tasks

- [x] **INF-12** `modules/alb`: ALB, target groups, `/health/ready` checks. *(`infra/modules/alb/main.tf`, `health_check_path` default `/health/ready`)*
- [x] **INF-13** `modules/alb`: ingress limited to Cloudflare IP ranges, ACM certificate. *(`aws_vpc_security_group_ingress_rule.cloudflare`, `aws_acm_certificate`)*
- [ ] **INF-54** Cloudflare range freshness: add the Cloudflare IPv6 list (if dual stack is adopted, see `network.md`) and a weekly CI job in the infra repo that diffs `https://www.cloudflare.com/ips-v4` (and v6) against `cloudflare_ipv4_cidrs` and opens an issue or PR on drift. Alternatively read the list with the `cloudflare_ip_ranges` data source and accept the plan diffs.
- [ ] **INF-55** Access logs: create an access log bucket per env (SSE-S3, which ALB log delivery requires, TLS only, public access blocked, lifecycle 30 days dev, 90 days prod, bucket policy for the af-south-1 ELB log delivery principal) and pass it as `access_logs_bucket`. Logs must not be readable by the `infra-plan` role (see `github-oidc.md` INF-79).
- [ ] **INF-56** Origin authentication so nobody can reach the ALB by bypassing Cloudflare from another Cloudflare account: either Cloudflare Authenticated Origin Pulls (mTLS, needs ALB mutual TLS verify mode with a trust store holding the Cloudflare origin pull CA) or a secret header set by a Cloudflare Transform Rule and checked by an ALB listener rule that returns 403 when absent. Store any header secret in Secrets Manager and the Cloudflare side in `edge-security.md`.
- [ ] **INF-57** ALB golden-signal alarms: `TargetResponseTime` p95 above 1 second for 10 minutes (excluding nothing at the ALB level; AI routes are measured separately in OBS), `HTTPCode_Target_4XX_Count` spike above a per-env threshold, and `RejectedConnectionCount` above 0. Add as monitoring inputs and wire into `monitoring.md`.

## Verification

- `terraform -chdir=infra/modules/alb init -backend=false && terraform validate`.
- `curl -sI http://<alb dns>` from a non-Cloudflare IP times out (security group), and through Cloudflare `curl -sI https://api.dev.aptiverse.co.za/health/ready` returns 200.
- `aws elbv2 describe-target-health --target-group-arn <tg>` shows all targets healthy.
- `aws elbv2 describe-listeners --load-balancer-arn <alb>` shows the 301 redirect and the TLS 1.3 policy.
- After INF-56: a request to the ALB without the origin credential returns 403 even from a Cloudflare range.

## Open questions

- AWS WAF on the ALB as well as Cloudflare WAF? Recommendation in `edge-security.md` is Cloudflare only, with origin lock-down (INF-56) so the edge cannot be bypassed.
- The two-level `api.dev` hostname needs Cloudflare Advanced Certificate Manager or `api-dev`; the decision lives in `dns.md` (INF-83).
