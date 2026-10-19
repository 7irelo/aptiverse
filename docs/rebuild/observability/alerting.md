# Alerting and on-call

| | |
|---|---|
| ID range | `OBS-40` to `OBS-50` |
| Phase | 1 (OBS-40, OBS-43, OBS-44), 10 (burn-rate alerts, rota and drills before go-live) |
| Depends on | OBS-36, `infra/monitoring.md` (SNS topic and CloudWatch alarms), `launch/slo-and-alerts.md` (targets), `launch/incident-management.md` (severity levels), `launch/runbooks.md`, `launch/cost-controls.md` |
| Code path | `infra/modules/monitoring/main.tf` (SNS topic `aptiverse-<env>-alarms` with a KMS key, email subscriptions, alarms for ALB 5xx, unhealthy targets, RDS CPU, free storage, free memory, ECS CPU and memory) |
| Status | 11 tasks: 0 done, 1 partial, 1 unverified, 9 not started. CloudWatch alarms email an SNS topic; there is no routing, paging, burn-rate alerting or synthetic check. |

## Purpose

The right person hears about a real problem fast, nobody is paged for noise, and every alert says what to do. Alerts are symptom based (users affected) first, cause based second.

## Scope

- Sources: Grafana alert rules (OTel metrics, SLO burn rates), CloudWatch alarms through SNS, Sentry issue alerts, Grafana Synthetic Monitoring, AWS Budgets and Cost Anomaly Detection (`infra/monitoring.md`), deploy failures (CI-96).
- Routing by severity (definitions in `launch/incident-management.md`): SEV1 pages on-call immediately, SEV2 notifies the alert channel and pages in business hours, SEV3 creates a ticket. Cost alerts go to the owner and the finance contact.

## Tasks

- [ ] **OBS-40** Set up the alerting tool from decision 63: email plus a phone push app (ntfy or Grafana OnCall free tier; choice pending, DECISIONS.md F); record the choice in `phase-0/decisions.md` with cost and the phone notification requirement for SEV1
- [ ] **OBS-41** Routing tree: labels `severity`, `service`, `env`; prod SEV1 and SEV2 to on-call, staging and dev to the alert channel only, never paging; quiet hours rule for SEV3
- [ ] **OBS-42** SLO burn-rate alerts from `launch/slo-and-alerts.md`: multi-window, multi-burn-rate (page at 14.4x over 1 hour and 5 minutes, ticket at 6x over 6 hours and 30 minutes, ticket at 1x over 3 days) for api availability and api p95 latency excluding AI
- [ ] **OBS-43** Synthetic checks: Grafana Synthetic Monitoring HTTP checks every minute from the nearest probe to `https://aptiverse.co.za`, `https://api.aptiverse.co.za/health/ready` and the login page for prod, every 5 minutes for staging; a multi-step check signs in as the synthetic user and loads the dashboard every 10 minutes
- [ ] **OBS-44** Connect the SNS alarm topic to the routing tool (HTTPS subscription or Grafana CloudWatch alerting) and map each CloudWatch alarm to a severity *(partial: alarms and the email subscription exist in `infra/modules/monitoring`; no severity mapping, no RDS connections alarm)*
- [ ] **OBS-45** Sentry alert rules per project: new issue in prod, regression, error spike above 3x baseline, and a release health rule (crash free sessions under 99.5 percent for web); routed through OBS-41
- [ ] **OBS-46** Worker and data alerts: dead letters above 0 for 5 minutes (SEV2), scheduled message lag above 5 minutes (SEV2), outbox pending growing for 15 minutes (SEV2), Paystack webhook processing lag above 10 minutes (SEV1 in prod)
- [ ] **OBS-47** Cost alerts routing: AWS Budgets (50, 80, 100 percent of forecast), Cost Anomaly Detection, and the Anthropic daily spend rule from OBS-16 above the daily ceiling go to the owner and finance contact; thresholds come from `launch/cost-controls.md` (decision 9)
- [ ] **OBS-48** Every alert has a `runbook_url` annotation pointing at a file in `launch/runbooks.md` or `infra/docs/runbooks/`, a summary that names the user impact, and a dashboard link; a CI check over the alert rule files fails when an annotation is missing
- [ ] **OBS-49** On-call rota and escalation: primary and secondary (or owner plus a named backup), escalation after 15 minutes unacknowledged, contact details outside the tooling, handover notes weekly *(unverified: people and tool configuration)*
- [ ] **OBS-50** Alert drills: each quarter fire every SEV1 and SEV2 alert in staging (stop the api service, break the DB security group in a scratch env, push a dead letter) and record time to notify and time to acknowledge; delete or fix any alert that did not fire or fired without action

## Verification

- Stopping the staging api service triggers the synthetic check and a channel notification within 3 minutes, and no page.
- Injecting 5 percent 5xx in staging for 10 minutes fires the fast burn alert with a runbook link.
- `aws sns list-subscriptions-by-topic` for the prod alarm topic shows the routing endpoint, not only personal email.
- The quarterly drill log in `launch/incident-management.md` has an entry for each SEV1 and SEV2 alert.

## Open questions

- Is a single developer on call realistic for v1, and what is the agreed response time outside working hours (input to the SLO policy)?
- Decided (63): email only (plus the push app for pages); no Slack in v1.
- Synthetic probe location: Grafana has no Cape Town probe in some plans; is Johannesburg or a European probe acceptable?
