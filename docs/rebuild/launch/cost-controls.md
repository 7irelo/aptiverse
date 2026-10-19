# Cost controls

| | |
|---|---|
| ID range | `HRD-183` to `HRD-195` |
| Phase | 1 (AWS budgets with the first env), 5 (Anthropic), 10 (review) |
| Depends on | `infra/monitoring.md`, `infra/env-dev.md`, `observability/telemetry.md` (OBS-07 spend dashboard), `backend/ai-tutor.md` (quotas), decision 57 (ceilings, pending in DECISIONS.md F) |
| Status | 0 done, 0 partial, 0 unverified, 13 not started |

## Purpose

No surprise bills. Every paid service has a ceiling, an alert before the ceiling, an owner who reviews it monthly, and a design that fails closed when a quota runs out.

## Scope

- AWS: AWS Budgets (monthly cost, per env via the `env` tag), Cost Anomaly Detection monitor with a daily alert subscription, cost allocation tags activated.
- Anthropic: monthly spend ceiling in the Anthropic console, per-plan quotas enforced in the AiTutor module (reserve, confirm or refund), spend dashboard from stored usage rows.
- Vercel: spend management limit on the team, alert at 50%, 80%, 100%.
- Grafana Cloud and Sentry: usage alerts at plan limits, sampling and drop rules before overage.
- Paystack: fee reconciliation in the nightly job (not a ceiling, a check).
- Tagging policy: every AWS resource carries `project=aptiverse`, `env=<dev|staging|prod|global>`, `component=<network|database|service|alb|storage|...>`, `managed_by=terraform`.

## Tasks

### AWS
- [ ] **HRD-183** Tagging policy applied through provider `default_tags` in every root stack (bootstrap already sets `project`, `managed_by`, `component`; env stacks to add `env`), and the tags activated as cost allocation tags in Billing *(human action for activation)*
- [ ] **HRD-184** AWS Budgets per env: monthly cost budget with alerts at 50%, 80% and 100% actual and 100% forecast to the alarm SNS topic and email; amounts from decision 57 (pending; until set, dev about $70 and prod $250 to $400 as the starting point); built in `infra/monitoring.md`
- [ ] **HRD-185** Cost Anomaly Detection: service-level monitor, daily summary, alert threshold in absolute dollars agreed with the owner; built in `infra/monitoring.md`
- [ ] **HRD-186** Dev scale-to-zero at night: scheduled scaling (App Auto Scaling scheduled actions) sets dev api and worker to 0 from 20:00 to 06:00 SAST and on weekends unless overridden; document the override
- [ ] **HRD-187** Review interface endpoint cost in dev (four endpoints, roughly $8 each per AZ per month) and decide keep or drop; record in `infra/env-dev.md`

### Third parties
- [ ] **HRD-188** Anthropic monthly spend limit set in the console at the decision 57 ceiling, alert email at 75% *(human action)*
- [ ] **HRD-189** Anthropic in-app guard: a global daily spend circuit breaker in the AiTutor module that stops non-essential generation (for example background practice generation) when the day's spend passes a configured value, alerting the owner
- [ ] **HRD-190** Per-plan AI quotas reviewed against plan pricing: cost per generated test and per tutor message (from usage rows) times quota stays under the plan margin target
- [ ] **HRD-191** Vercel spend management limit and alerts set *(human action)*
- [ ] **HRD-192** Grafana Cloud usage alerts (logs, metrics series, traces) and Sentry quota alerts set, with sampling rates documented (web Sentry `tracesSampleRate` 0.1 today)

### Review
- [ ] **HRD-193** Spend dashboard: AWS cost by env and component (Cost Explorer saved report), Anthropic by feature and model (OBS-07), Vercel, Grafana and Sentry usage, on one page linked from the admin AI spend page
- [ ] **HRD-194** Monthly cost review: first working Monday, owner compares actual to budget per service, records actions in `docs/cost-review.md`
- [ ] **HRD-195** Fail-closed test: exhaust a test plan's AI quota in staging and confirm requests are refused with the upgrade state, not charged

## Verification

- Budgets and the anomaly monitor exist in AWS for every env and one test alert was received *(unverified until applied)*.
- Anthropic and Vercel limits visible in their consoles, screenshots in the cost review doc.
- HRD-195 passes in staging.

## Open questions

- Decided (57): monthly ceilings for AWS and Anthropic drive the budgets; amounts pending, DECISIONS.md F. Budgets use the plan's rough cost guide until then.
- Is dev scale-to-zero acceptable for overnight E2E or migration rehearsals, or should those run in staging only?
