# Dashboards

| | |
|---|---|
| ID range | `OBS-30` to `OBS-39` (detail for umbrellas OBS-02 and OBS-07) |
| Phase | 1 (OBS-30, OBS-31, OBS-34), 2 to 7 as modules land, 10 (OBS-36 SLO dashboard is a launch gate) |
| Depends on | OBS-09, OBS-14, OBS-15, OBS-16, CI-58, CI-76, `infra/monitoring.md`, `launch/slo-and-alerts.md` |
| Code path | none yet; target `infra/observability/dashboards/*.json` provisioned by Terraform (`grafana/grafana` provider) |
| Status | 10 tasks: 0 done, 0 partial, 0 unverified, 10 not started. |

## Purpose

One golden-signal view per service (latency, traffic, errors, saturation) plus SLO, cost and business views, defined as code so every environment gets the same dashboards and changes are reviewed.

## Scope

- Grafana Cloud stack with data sources: Mimir (OTel metrics), Tempo, Loki, CloudWatch (ALB, RDS, ECS via a read-only IAM role), Sentry plugin optional.
- Dashboards as JSON in the infra repo, provisioned per environment with an `env` variable; no hand-built dashboards in the UI except drafts.
- Annotations: deploy markers from CI-58 (api) and CI-76 (web).

## Tasks

- [ ] **OBS-30** Dashboards as code: add the `grafana/grafana` provider to `envs/global` (or a new `envs/observability` stack), a CloudWatch data source using a read-only IAM role assumed by Grafana (role defined in `infra/monitoring.md`), and a folder per env; dashboards loaded from `infra/observability/dashboards/`
- [ ] **OBS-31** api golden signals: request rate, error rate (5xx and ProblemDetails 4xx split), p50, p95, p99 latency per route template, in-flight requests, CPU and memory per task, task count, GC and thread pool; AI routes shown separately because the p95 SLO excludes them
- [ ] **OBS-32** worker dashboard: messages handled per type, failures, retries, dead letters, outbox pending, scheduled lag (OBS-15), CPU and memory, task count
- [ ] **OBS-33** RDS dashboard: CPU, freeable memory, free storage, connections, read and write IOPS and latency, replica lag (when added), top 10 statements by total time from Performance Insights or `pg_stat_statements` export
- [ ] **OBS-34** ALB and edge dashboard: requests, ELB 5xx versus target 5xx, target response time, healthy and unhealthy hosts, rejected connections; Cloudflare analytics linked (WAF blocks, cache)
- [ ] **OBS-35** web dashboard: Speed Insights p75 LCP, INP, CLS on mobile per route, Vercel function errors and duration, BFF route latency and upstream status codes, Sentry error rate per release
- [ ] **OBS-36** SLO dashboard: availability and latency SLIs, error budget remaining for the 28 day window, fast and slow burn rates, using the SLO definitions in `launch/slo-and-alerts.md`
- [ ] **OBS-37** AI spend dashboard: tokens and cost per day by model and feature (OBS-16), cost per generated test, top users by spend (ids only), comparison line against the stored usage rows (OBS-07) and the monthly Anthropic budget (`launch/cost-controls.md`)
- [ ] **OBS-38** Business health dashboard: sign-ups, active students per stage, practice attempts, payments succeeded and failed, Paystack webhook processing lag, emails bounced; numbers come from metrics, not ad hoc SQL
- [ ] **OBS-39** Deploy annotations on every dashboard from CI-58 and CI-76, plus a "what changed" panel listing the last 10 deploys per env with sha and actor

## Verification

- `terraform plan` for the observability stack shows every dashboard file; deleting a JSON file removes the dashboard.
- Each dashboard renders for `env=dev` with no "no data" panels except those whose module has not landed (marked in the panel description).
- A deploy to dev shows an annotation on the api dashboard within one minute.
- The AI spend dashboard total for a day matches the sum of usage rows for that day within 1 percent.

## Open questions

- Separate `envs/observability` Terraform stack, or put Grafana resources in `envs/global`?
- Grafana Cloud plan: does the free tier allow the CloudWatch data source and enough series for per-route latency?
- Who reviews dashboards for usefulness after launch (monthly review in `launch/post-launch.md`)?
