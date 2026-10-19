# Logging, redaction and retention

| | |
|---|---|
| ID range | `OBS-20` to `OBS-29` (detail for umbrella OBS-06) |
| Phase | 1 (schema, redaction, retention), 2 (auth specific rules) |
| Depends on | OBS-01, `infra/service.md` (`log_retention_days`), `infra/network.md` (flow logs), `launch/popia.md` (retention schedule), `phase-0/security-baseline.md` |
| Code path | `api/src/Aptiverse.SharedKernel/Hosting/PlatformHostingExtensions.cs` (`WithLogging`, Sentry options), `api/src/Aptiverse.Host/Infrastructure/GlobalExceptionHandler.cs`, `web/src/instrumentation.ts`, `web/src/instrumentation-client.ts`, `infra/modules/service/main.tf` (`aws_cloudwatch_log_group`) |
| Status | 10 tasks: 0 done, 2 partial, 1 unverified, 7 not started. Sentry PII is off in api and exception messages never reach clients, but no redaction or log schema exists yet. |

## Purpose

Logs are useful for debugging and incidents but never become a second copy of students' personal information. Most users are minors, so POPIA applies with extra care: no names, emails, phone numbers, diary or wellbeing text, tokens, passwords, payout details or raw request bodies in any log, trace attribute or error event.

## Scope

- Sinks: container stdout to CloudWatch Logs (`/ecs/aptiverse-<env>-api`, `-worker`; retention dev 14, staging 30, prod 90 days from `log_retention_days`), OTLP logs to Grafana Loki, Sentry events, VPC flow logs (`/vpc/<name>/flow-logs`, rejects only, 30 days), RDS `postgresql` log export (`log_min_duration_statement`, connections).
- Data classes: `Personal` (name, email, phone, date of birth, school), `Sensitive` (diary, mood, wellbeing, payout bank details), `Secret` (passwords, tokens, keys, cookies, OTP codes), `Internal` (ids, routes, durations).

## Tasks

- [ ] **OBS-20** Structured log schema: every api and worker log line is JSON with `timestamp`, `level`, `message` template, `traceId`, `spanId`, `service`, `env`, `module`, and ids only (`userId` as Guid, never email); document the schema in `api/docs/` and use message templates, never string interpolation
- [ ] **OBS-21** Redaction with `Microsoft.Extensions.Compliance.Redaction`: data classification attributes for the classes above on request records and entities, `Personal` hashed with a keyed HMAC, `Sensitive` and `Secret` erased; enable `EnableRedaction()` on logging and add an architecture test that request records with properties named like `Email`, `Password`, `Token`, `Phone` carry a classification
- [ ] **OBS-22** Never log request or response bodies and sensitive headers: HTTP logging middleware stays off in deployed envs; if enabled in dev, `Authorization`, `Cookie`, `Set-Cookie` and `X-Paystack-Signature` are excluded; the Paystack webhook logs event id and type only
- [ ] **OBS-23** Sentry scrubbing: api `SetBeforeSend` removes request cookies, headers other than an allowlist, query strings with `token`, `code` or `email`, and form data; web `beforeSend` and `beforeSendTransaction` do the same for server, edge and client, with `sendDefaultPii: false` set explicitly and Session Replay off (minors) *(partial: api sets `SendDefaultPii = false`; web relies on defaults and has no `beforeSend`)*
- [ ] **OBS-24** Exceptions: `GlobalExceptionHandler` logs the exception with trace id and never returns the message (already true per `api/CLAUDE.md`); add a test that an exception message containing an email is redacted in the log output, not just hidden from the client *(partial: client side guarantee exists; log side redaction does not)*
- [ ] **OBS-25** Log levels per env through configuration: `Information` default, `Warning` for `Microsoft.AspNetCore` and EF Core in prod, `Debug` only locally; EF Core sensitive data logging and detailed errors are development only, enforced by a startup check that fails if enabled outside `Development`
- [ ] **OBS-26** Retention schedule: CloudWatch app logs dev 14, staging 30, prod 90 days; Loki retention matched or shorter; Sentry event retention per plan; flow logs 30 days; documented in `launch/popia.md` retention schedule and checked by CI-39 policy *(unverified: Grafana and Sentry retention are account settings)*
- [ ] **OBS-27** Redaction test suite: unit tests log a sample user, a login request and a Paystack payload through the configured pipeline and assert the captured output contains no email, password, token or bank number (in-memory logger provider)
- [ ] **OBS-28** Security events separate from debug logs: login, failed login, lockout, password change, token reuse, impersonation and admin money actions go to the audit trail table (backend Identity and Admin modules) and are also emitted as structured `security` category logs kept 1 year in prod (dedicated log group or Loki stream with longer retention)
- [ ] **OBS-29** Log volume budget: estimate GB per day per env, alert at 2x baseline (route in `observability/alerting.md`), and sample or drop known noisy categories (health checks are already excluded from traces)

## Verification

- `grep -iE '@|password|bearer|eyJ' ` over one hour of prod-like staging CloudWatch logs returns no personal data or tokens.
- 20 random Sentry events from staging show no cookies, Authorization headers or emails.
- `aws logs describe-log-groups --log-group-name-prefix /ecs/aptiverse-prod` shows `retentionInDays: 90`.
- OBS-27 tests pass in CI.
- Starting the api with `ASPNETCORE_ENVIRONMENT=Production` and sensitive data logging enabled fails the boot.

## Open questions

- HMAC hashing of `Personal` values in logs allows correlation without exposure; who holds the key and is correlation needed at all, or should those values be erased?
- Does the 1 year security log retention match the POPIA retention schedule in `launch/popia.md`?
- Loki retention on the Grafana Cloud free tier is fixed; is that acceptable for prod incident review (90 days target)?
