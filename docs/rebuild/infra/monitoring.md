# Monitoring module (alarms, alarm topic, budgets)

| | |
|---|---|
| ID range | INF-20, INF-95 to INF-102 |
| Phase | 1 (budgets before the first dev apply), 10 (routing and SLO alarms) |
| Depends on | INF-09, INF-12, INF-05 |
| Code path | `infra/modules/monitoring/`, instantiated in `envs/*/main.tf` (`module "monitoring"`) |
| Status | INF-20 partial: KMS-encrypted SNS topic, email subscriptions and infrastructure alarms exist; AWS Budgets and Cost Anomaly Detection do not. Routing beyond email, worker liveness, log metric filters and a CloudWatch dashboard are open. |

## Purpose

Infrastructure-level alarms and the AWS spend guardrails for each environment, delivered to one alarm topic. Application golden signals, SLOs and error budgets live in Grafana and Sentry (`observability/telemetry.md`, `launch/slo-and-alerts.md`); this module covers what AWS itself can see.

## Scope

- Resources: `aws_kms_key.alarms` (rotation on, policy allows CloudWatch to publish), `aws_kms_alias`, `aws_sns_topic.alarms` (KMS encrypted), `aws_sns_topic_subscription.email` per `alarm_emails`, `aws_cloudwatch_metric_alarm.alb_5xx` (ELB plus target 5xx above 10 in 5 minutes), `unhealthy_targets` (above 0 for 3 minutes), `rds` (cpu above 80, free storage below 2 GiB, freeable memory below 100 MiB; missing data breaching), `ecs` (cpu and memory above 85 per service). Alarms send both alarm and OK actions.
- Inputs: `name`, `alarm_emails` (default empty; dev example `terraform.tfvars.example` sets one address), ALB and target group suffixes, DB identifier, cluster and service names, thresholds.
- Outputs: `alarm_topic_arn`.

## Tasks

- [ ] **INF-20** `modules/monitoring`: budget alarms (AWS spend), SNS email topic. *(partial: encrypted SNS topic with email subscriptions and infrastructure alarms in `infra/modules/monitoring/main.tf`; no `aws_budgets_budget`)*
- [ ] **INF-95** AWS Budgets per env: `aws_budgets_budget` monthly cost budget filtered by the `environment` tag (or a per-env cost allocation tag), notifications at 50 and 80 percent actual and 100 percent forecasted to the alarm topic and the finance email; amounts from decision 9 (dev about $70, prod $250 to $400 to start). Activate the cost allocation tags in Billing first. (split from INF-20) *(budget amounts depend on decision 9)*
- [ ] **INF-96** Cost Anomaly Detection: `aws_ce_anomaly_monitor` (service dimension, account wide, in the global stack or prod) plus `aws_ce_anomaly_subscription` with an absolute threshold (for example $20) and daily summaries to the alarm topic. Anthropic spend is not in AWS: its budget and alerts live in `launch/cost-controls.md`.
- [ ] **INF-97** Alarm routing beyond email: subscribe the alarm topic to the on-call channel chosen in `launch/incident-management.md` (decision 63: email plus a phone push app, ntfy or Grafana OnCall via an HTTPS subscription; no Slack in v1), split into two topics (`page` for prod user-facing alarms, `notify` for everything else), and confirm every alarm targets the right one.
- [ ] **INF-98** Worker liveness alarm: ECS `RunningTaskCount` (Container Insights) below desired for 5 minutes on the worker service, and a Wolverine dead-letter or backlog metric once the api publishes it (`Aptiverse.*` meters), so stalled background work pages before emails go missing.
- [ ] **INF-99** Log metric filters on `/ecs/aptiverse-<env>-api` and `-worker`: count of `"level":"Error"` (or the OTel severity field) and of unhandled exception events, with an alarm on a rate threshold. Backup signal if the Grafana pipeline is down.
- [ ] **INF-100** CloudWatch dashboard per env (`aws_cloudwatch_dashboard`) with ALB requests, 5xx, p95 latency, target health, ECS CPU and memory per service, RDS CPU, connections, free storage and latency. Kept small; the main dashboards are in Grafana.
- [ ] **INF-101** Confirm the SNS email subscriptions per env (AWS sends a confirmation link) and test the path with `aws cloudwatch set-alarm-state --state-value ALARM` on one alarm per env. *(unverified: AWS state and mailbox)*
- [ ] **INF-102** Alarm hygiene: every alarm description names its runbook (`infra/docs/runbooks/...` or `launch/runbooks.md`), thresholds are reviewed after the load test (HRD-11), and `treat_missing_data` is deliberate per alarm (RDS breaching, ALB not breaching as today).

## Verification

- `terraform -chdir=infra/modules/monitoring init -backend=false && terraform validate`.
- `aws cloudwatch describe-alarms --alarm-name-prefix aptiverse-<env> --query 'MetricAlarms[].AlarmName'` lists the ALB, RDS and ECS alarms (plus the new ones).
- `aws sns get-topic-attributes --topic-arn <alarm topic>` shows `KmsMasterKeyId`; `list-subscriptions-by-topic` shows confirmed endpoints.
- `aws budgets describe-budgets --account-id <acct>` lists one budget per env after INF-95; `aws ce get-anomaly-monitors` lists the monitor after INF-96.
- A forced alarm reaches the on-call channel within 2 minutes after INF-97.

## Open questions

- Decided (57, 63): budget alerts go to the owner by email and the push app; amounts pending, DECISIONS.md F.
- One alarm topic per env or a shared topic per severity across envs?
