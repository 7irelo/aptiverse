# Telemetry: traces, metrics, errors

| | |
|---|---|
| ID range | `OBS-01` to `OBS-19` |
| Phase | 1 (OBS-01 to OBS-08 are the Phase 1 exit), later tasks land with the modules they measure |
| Depends on | `infra/secrets.md` (`grafana-otlp`, `sentry-dsn`), `infra/service.md` (OTEL env vars), FE-10, FE-11, CI-58, CI-76 |
| Code path | `api/src/Aptiverse.SharedKernel/Hosting/PlatformHostingExtensions.cs`, `api/src/Aptiverse.SharedKernel/Hosting/TelemetryOptions.cs`, `web/src/instrumentation.ts`, `web/src/instrumentation-client.ts`, `web/next.config.ts`, `web/src/app/layout.tsx`, `infra/envs/*/main.tf` (`app_environment`, `app_secrets`) |
| Status | 19 tasks: 4 done, 1 partial, 3 unverified, 11 not started. Instrumentation exists in api and web; nothing proves data reaches Grafana or Sentry from a deployed environment yet. |

Related files: `observability/logging.md` (OBS-06 detail, OBS-20 to OBS-29), `observability/dashboards.md` (OBS-07 detail, OBS-30 to OBS-39), `observability/alerting.md` (OBS-40 to OBS-50). SLO targets and error budget policy live in `launch/slo-and-alerts.md`.

## Purpose

Every request through web, api and worker can be followed end to end as one trace, every unexpected error lands in Sentry with a release and environment, and the metrics the SLOs and cost controls need are emitted by the code rather than reconstructed later.

## Scope

- api and worker: OpenTelemetry SDK (`OpenTelemetry.Extensions.Hosting` 1.20.0) with tracing (ASP.NET Core minus `/health`, HttpClient, Npgsql, `Wolverine` source), metrics (ASP.NET Core, HttpClient, runtime, `Wolverine` meter, `Aptiverse.*` meters), logging, and the OTLP exporter when `OTEL_EXPORTER_OTLP_ENDPOINT` is set. Sentry (`Sentry.AspNetCore` 6.12.1) when `Sentry:Dsn` is set, `SendDefaultPii = false`.
- infra: `OTEL_SERVICE_NAME` (`aptiverse-api`, `aptiverse-worker`), `OTEL_RESOURCE_ATTRIBUTES=deployment.environment=<env>`, `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` from the `grafana-otlp` secret, `Sentry__Dsn` from `sentry-dsn`, `Sentry__Environment`.
- web: `@sentry/nextjs` 11.8 for server, edge and client (`tracesSampleRate: 0.1`), source map upload through `withSentryConfig` when `SENTRY_AUTH_TOKEN` is set, `@vercel/analytics` and `@vercel/speed-insights` in the root layout.
- Backends: Grafana Cloud (traces in Tempo, metrics in Mimir, logs in Loki), Sentry, Vercel.

## Tasks

### Baseline (Phase 1)

- [x] **OBS-01** OpenTelemetry traces, metrics, logs from api and worker (`AddTelemetry` in `PlatformHostingExtensions.cs`, used by Host and Worker)
- [ ] **OBS-02** Grafana Cloud exporter and a starter dashboard (requests, latency, errors, DB) *(partial: OTLP exporter switches on from `OTEL_EXPORTER_OTLP_ENDPOINT`, and infra injects the `grafana-otlp` secret keys; no dashboard exists, see `observability/dashboards.md`)*
- [ ] **OBS-09** Prove export from dev: populate `aptiverse/dev/grafana-otlp`, deploy, and find `aptiverse-api` and `aptiverse-worker` in Tempo and Mimir with `deployment.environment=dev` (split from OBS-02) *(unverified: needs AWS secret values and a Grafana Cloud stack)*
- [x] **OBS-03** Sentry in api (`AddSentry` in `PlatformHostingExtensions.cs`, DSN optional, `SendDefaultPii = false`)
- [x] **OBS-04** Sentry in web (server and client), source maps uploaded (`instrumentation.ts`, `instrumentation-client.ts`, `withSentryConfig` in `next.config.ts`; upload proof is OBS-12)
- [ ] **OBS-12** Confirm source maps on a Vercel build: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` set in Vercel for preview and production, a thrown test error shows a de-minified stack in Sentry, and maps are not served publicly (`productionBrowserSourceMaps` stays off) (split from OBS-04) *(unverified: Vercel settings)*
- [x] **OBS-05** Vercel Speed Insights (`<SpeedInsights />` and `<Analytics />` in `web/src/app/layout.tsx`)
- [ ] **OBS-06** Log redaction rules (no PII, no tokens, no secrets) (umbrella; broken down as OBS-20 to OBS-29 in `observability/logging.md`)
- [ ] **OBS-07** Anthropic spend dashboard (from stored usage rows) (umbrella; metrics in OBS-16, dashboard OBS-37 in `observability/dashboards.md`)
- [ ] **OBS-08** Phase 1 exit check: one request visible as a trace, one test error in Sentry *(unverified: needs a deployed dev stack with secrets; record the trace id and Sentry issue link in the Phase 1 exit notes)*

### Consistency

- [ ] **OBS-13** One release and environment vocabulary: api and worker set Sentry `Release` and OTel `service.version` to the git sha (passed as a build arg into the image, exposed as `APP_VERSION`), web uses `aptiverse-web@<sha>`; environment names are exactly `local`, `preview`, `dev`, `staging`, `prod` in OTel, Sentry and Vercel (today api uses `ASPNETCORE_ENVIRONMENT` names such as `Production` for the OTel attribute `deployment.environment.name` while infra sets `deployment.environment=<env>`; pick one key and one value set)
- [ ] **OBS-19** Verify the worker exports its own service name and that Wolverine message handling appears as spans linked to the originating HTTP request through the outbox (one integration test or a manual trace recorded in dev)

### Propagation and sampling

- [ ] **OBS-10** Sampling policy: parent based ratio sampler in api and worker configurable through `Telemetry:SampleRatio` (dev 1.0, staging 1.0, prod 0.2 to start), errors always kept (Sentry captures them regardless), health and static paths never traced; web Sentry `tracesSampleRate` driven by env (prod 0.1, else 1.0) instead of the hard-coded 0.1
- [ ] **OBS-11** End to end trace context: the web server fetcher (`web/src/lib/api/fetcher.ts`) and the BFF route forward `traceparent` and `baggage` to the API, and web server spans export through `@vercel/otel` or Sentry tracing so one trace spans Vercel, api and RDS; verify one trace id across all three in dev
- [ ] **OBS-18** Correlation for users and support: ProblemDetails already carry `traceId`; the web error states (`page-error.tsx`, `error.tsx`) show "Reference: <traceId>" in small text with a copy button, and the support ticket form attaches it

### Application metrics (land with their modules)

- [ ] **OBS-14** Business and security meters under `Aptiverse.<Module>`: sign-ups, logins succeeded and failed (no user ids as labels), lockouts, refresh token reuse detections, emails sent and failed, uploads accepted and rejected; counters only, low cardinality labels, documented in the module README
- [ ] **OBS-15** Messaging meters: outbox pending count, durable inbox depth, dead letter count, scheduled message lag (now minus due time of the oldest due message), handler duration and failures per message type, exposed as observable gauges read from the `wolverine` schema at a 60 second interval by the worker only
- [ ] **OBS-16** AI meters in `Aptiverse.AiTutor`: input, output, cache read and cache write tokens and cost in cents per model and feature (`practice-generate`, `tutor-chat`, `grade`), request latency and failures, quota refunds; cost computed from config prices so the dashboard and the stored usage rows agree
- [ ] **OBS-17** Health check observability: `/health/ready` reports DB and outbox checks with durations; a health check publisher emits `aptiverse_health_status{check}` so a degraded dependency is visible before the ALB marks targets unhealthy

## Verification

- In dev, a request to `/support/faqs` from the web help page produces one trace containing a Vercel span, the api span and the Npgsql span.
- A forced exception in api (dev only test endpoint or a failing seed) appears in Sentry with release `<sha>` and environment `dev`, and the response body shows only the trace id.
- Grafana query `sum by (service_name) (rate(http_server_request_duration_seconds_count[5m]))` returns both api and web data for dev.
- `aptiverse_wolverine_dead_letter_count` exists and is 0 in a healthy env.
- Sentry events contain no email, cookie or Authorization header (spot check 20 events, see `observability/logging.md`).

## Open questions

- Grafana Cloud free tier limits (traces and logs volume) against prod traffic; at what point does sampling or a paid tier apply?
- Use `@vercel/otel` for web server traces, or rely on Sentry performance traces only?
- `OTEL_RESOURCE_ATTRIBUTES` in infra sets `deployment.environment` while the api code sets `deployment.environment.name` from the ASP.NET environment; both reach the backend today. Which wins (OBS-13)?
- Does Sentry's data residency (US or EU) need a POPIA review, since stack traces can carry request context? Input to `launch/popia.md`.
