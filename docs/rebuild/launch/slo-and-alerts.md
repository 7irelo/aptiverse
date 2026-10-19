# SLOs, error budgets and alerting

| | |
|---|---|
| ID range | `HRD-50` to `HRD-52`, `HRD-168` to `HRD-182` |
| Phase | 10 (alerts on infra signals exist from Phase 1) |
| Depends on | `observability/telemetry.md`, `infra/monitoring.md`, `launch/incident-management.md`, `launch/cost-controls.md`, decision 57 (budgets, pending in DECISIONS.md F) |
| Status | 0 done, 2 partial (CloudWatch alarms to an SNS email topic and log group retention exist in `infra/modules`), 0 unverified, 16 not started |

## Purpose

Define what "working" means in numbers, measure it continuously, alert on burn before users notice, and use the error budget to decide when to stop shipping features and fix reliability.

## Scope

### SLOs (prod, 28-day rolling window)

| SLO | SLI (source) | Target | Error budget |
|---|---|---|---|
| API availability | share of non-5xx responses at the ALB, excluding `/health/*` (ALB metrics and OTel) | 99.5% | 3h 21m per 28 days |
| API latency | p95 server duration for non-AI routes (OTel `http.server.request.duration`) | under 500 ms | 5% of requests may exceed |
| Tutor first token | time from request to first SSE token (custom metric `aptiverse.ai.first_token_ms`) | p95 under 4 s | 5% may exceed |
| Practice generation | jobs completed within 120 s (custom metric) | 95% | 5% |
| Webhook processing | Paystack events processed successfully within 5 minutes of receipt (inbox table) | 99.9% | 0.1% |
| Web availability | Vercel and synthetic check on `/` and `/login` | 99.5% | as API |
| Email delivery | SES delivery rate (configuration set metrics) | 98% | 2% |

### Alert routing

| Severity (see `launch/incident-management.md`) | Example | Route |
|---|---|---|
| SEV1 page | fast burn on availability, webhook processing stopped, DB down | phone push (Grafana OnCall or equivalent) plus email |
| SEV2 page in hours | slow burn, latency SLO burning, SES reputation warning | push in working hours, email always |
| Ticket | budget alarms, purge job missed, certificate expiry under 30 days | email digest |

### Log retention

| Env | CloudWatch | Grafana Cloud logs | Sentry |
|---|---|---|---|
| dev | 14 days | plan default | 30 days |
| staging | 30 days | plan default | 30 days |
| prod | 90 days | 30 days hot | 90 days |

## Tasks

### SLOs and budgets
- [ ] **HRD-50** SLOs: availability 99.5%, p95 under 500 ms excluding AI (umbrella; defined in the table above)
- [ ] **HRD-168** Write the SLO document `docs/slo.md` in the api repo with the table, SLI queries and owners
- [ ] **HRD-169** Emit the custom SLI metrics that do not exist yet: tutor first token, generation job duration, webhook processing lag (instrumented in the modules; meter names under `Aptiverse.*`, which the OTel config already exports)
- [ ] **HRD-170** Grafana SLO dashboards: one per SLO with remaining budget, burn rate and 28-day trend
- [ ] **HRD-171** Error budget policy: when a budget is exhausted, feature work stops for that service until it recovers, except security fixes; written in `docs/slo.md` and agreed
- [ ] **HRD-172** Golden signal dashboards per service (api, worker, web BFF): latency, traffic, errors, saturation (CPU, memory, DB connections, outbox depth)

### Alerts
- [ ] **HRD-51** Alerts to email and the on-call push app (umbrella, decision 63) *(partial: CloudWatch alarms for ALB 5xx, unhealthy targets, RDS CPU, storage and memory, and ECS CPU and memory publish to an encrypted SNS topic with email subscriptions in `infra/modules/monitoring`; no SLO alerts or chat routing)*
- [ ] **HRD-173** Multi-window burn-rate alerts for availability and latency (fast: 14.4x over 1h and 5m; slow: 6x over 6h and 30m)
- [ ] **HRD-174** Alert for webhook processing lag over 5 minutes and for any Paystack event failed after retries
- [ ] **HRD-175** Synthetic checks: Grafana synthetic monitoring (or equivalent) hitting `https://api.aptiverse.co.za/health/ready` and the web `/` and `/login` from Johannesburg every minute
- [ ] **HRD-176** Confirm the RDS DatabaseConnections alarm (over 80% of `max_connections`) is added in `infra/monitoring.md`; today `infra/modules/monitoring` alarms on CPU, free storage and free memory only
- [ ] **HRD-177** Certificate and domain expiry alerts (ACM is auto-renewed; Cloudflare edge cert and domain registration expiry checks)
- [ ] **HRD-178** Alert routing set up: on-call tool, escalation after 15 minutes to the backup, quiet hours rule for SEV2 and below
- [ ] **HRD-179** Every alert links to its runbook (alarm description carries the runbook URL) and has been fired once in staging to prove delivery
- [ ] **HRD-52** Anthropic and AWS budget alarms at agreed ceilings (built in `launch/cost-controls.md`; this task is the check that they route like other alerts)

### Logs
- [ ] **HRD-180** Log retention per env applied as in the table (CloudWatch values already default to 14, 30, 90 days in `envs/*/variables.tf`; Grafana and Sentry settings to match) *(partial: CloudWatch retention defaults exist in Terraform; Grafana and Sentry retention not set)*
- [ ] **HRD-181** Structured logging check: every log line has trace id, service, environment; no PII (OBS-06)
- [ ] **HRD-182** Alert noise review after two weeks in staging: each alert that fired without needing action is tuned or removed

## Verification

- SLO dashboards show real data from staging under the HRD-11 load test.
- A forced failure in staging (stop the api service) pages the on-call phone within 5 minutes.
- Every alert rule has an owner, a runbook link and a recorded test fire.

## Open questions

- Decided (63): paging is email plus a phone push app (ntfy or Grafana OnCall free tier); which app is pending, DECISIONS.md F.
- Decided (63): email is the team channel; no Slack in v1.
