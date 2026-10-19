# Performance and load testing

| | |
|---|---|
| ID range | `HRD-10` to `HRD-13`, `HRD-80` to `HRD-89` |
| Phase | 10 |
| Depends on | `infra/env-staging.md`, `infra/service.md`, `infra/database.md`, `observability/telemetry.md`, `launch/slo-and-alerts.md`, decision 60 (user counts, pending in DECISIONS.md F) |
| Status | 0 done, 0 partial, 1 unverified, 13 not started |

## Purpose

Prove the platform holds 10x expected peak on staging with headroom against the SLOs, and fix what breaks before real students meet it. Exam season (June and October to November) is the expected peak.

## Scope

- Tool: k6, scripts in `api/tests/load/` (api repo), run from a GitHub Actions workflow with `workflow_dispatch` against staging only.
- Target: `api.staging` through Cloudflare, plus a direct ALB run to separate edge from origin effects.
- Inputs: expected peak from decision 10 (active users, concurrent sessions), seeded staging data with anonymised volumes.
- Outputs: k6 summary JSON and HTML report as workflow artefacts, a written result in `api/tests/load/RESULTS.md`, tickets for each regression.
- Thresholds (k6): `http_req_failed < 0.5%`, `http_req_duration p(95) < 500ms` for non-AI routes, tutor first token p95 per `launch/slo-and-alerts.md`.

## Tasks

### Scripts
- [ ] **HRD-10** k6 scripts: login, dashboard, practice attempt, tutor message, webhook (umbrella; each script is its own task below)
- [ ] **HRD-80** Write the expected-load model: peak concurrent users, requests per user per minute per journey, read and write mix, derived from decision 10 and old app traffic; 10x target numbers recorded at the top of `RESULTS.md`
- [ ] **HRD-81** k6 shared setup: seeded test accounts per stage (high school, university), token acquisition through `/auth/login`, environment guard that refuses to run against prod
- [ ] **HRD-82** k6 script `login.js`: login plus refresh rotation, respects rate limits (expect 429 beyond the auth group limit and assert it)
- [ ] **HRD-83** k6 script `dashboard.js`: `/me`, navigation, dashboard read models, with think time
- [ ] **HRD-84** k6 script `practice.js`: start attempt, answer questions, autosave, submit, fetch results; generation is stubbed or uses a cheap model config so load tests do not burn Anthropic budget
- [ ] **HRD-85** k6 script `tutor.js`: SSE tutor message through the BFF path, measures time to first token, uses a mock Anthropic endpoint in staging config
- [ ] **HRD-86** k6 script `webhook.js`: signed Paystack test payloads, includes duplicate deliveries, asserts exactly-once effects afterwards via an admin read

### Run and fix
- [ ] **HRD-11** Load test staging at 10x expected peak (run all scripts together as a mixed scenario for 30 minutes, ramp 5 minutes) *(unverified: requires staging environment and a human run)*
- [ ] **HRD-87** Soak test: 2x peak for 4 hours, watch memory, connection pool, Wolverine outbox depth, no growth trend
- [ ] **HRD-12** Fix slow queries from `pg_stat_statements` (top 10 by total time, each fixed or justified in `RESULTS.md`)
- [ ] **HRD-88** Connection budget: compute RDS `max_connections` for the prod instance class against api and worker max task counts times Npgsql pool size; set `Maximum Pool Size` so the sum stays under 80%
- [ ] **HRD-13** Tune ECS autoscaling (CPU and memory targets, min and max counts per env, scale-out cooldown) from load test results, changes made in `infra/env-prod.md` variable defaults
- [ ] **HRD-89** Web performance under load: Lighthouse mobile on the five busiest routes while the load test runs; LCP under 2.5s and JS per route under 150 KB gzip (CI-25 budgets) hold

## Verification

- `RESULTS.md` shows each threshold, the measured value and pass or fail, with the commit sha and image tag under test.
- Grafana dashboard screenshots for the run window (latency, errors, DB CPU, connections, outbox depth) attached to the run.
- No Anthropic spend above the agreed test budget during load runs (check the spend dashboard, OBS-07).

## Open questions

- Decided (60): expected peak comes from the user counts, pending in DECISIONS.md F; until they arrive, use the old app's highest observed day times 3 as the "expected" baseline.
- Is a staging RDS instance class smaller than prod acceptable for load testing, or does the 10x run need a temporary prod-sized staging instance?
