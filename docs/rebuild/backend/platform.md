# Platform (solution skeleton, SharedKernel, Host, Worker, test projects)

| | |
|---|---|
| ID range | `BE-SK-01` to `BE-SK-36` (original), `BE-SK-37` to `BE-SK-69` (splits and additions), `BE-SK-70` to `BE-SK-89` (production readiness) |
| Schema | none of its own. Owns the conventions every module schema follows, the `wolverine` schema (created by `resources setup`), and the per-schema `__ef_migrations_history` and `idempotency_keys` templates |
| Projects | `Aptiverse.slnx`, `Directory.Build.props`, `Directory.Packages.props`, `src/Aptiverse.SharedKernel`, `src/Aptiverse.Host`, `src/Aptiverse.Worker`, `tests/Aptiverse.ArchitectureTests`, `tests/Aptiverse.IntegrationTests`, `tests/Aptiverse.Testing` (planned) |
| Phase | 1 (foundation), with additions pulled forward by Phase 2 |
| Consumes | nothing (SharedKernel never references a module) |
| Publishes | conventions: `Result`/`Error`, ProblemDetails, validation filter, permission and feature gates, paging, clock, persistence base, Wolverine outbox, health |
| Depends on | INF-14 (uploads bucket), INF-16 (secrets), OBS-01 to OBS-06, CI-06, CI-08, CI-12 |
| Status | Partial. 25 done, 9 partial, 55 not started (89 tasks). The API builds and its tests pass (BE-SK-37 fixed 2026-10-19) |

Verified against the working tree on 2026-10-19, including uncommitted files (`SharedKernel/Authorization/*`, `Persistence/CheckConstraints.cs`, `Results/*` changes, deletion of `Authorization/Policies.cs`).

## Responsibilities and out of scope

Responsible for:

- The solution layout and build rules (nullable, warnings as errors, analyzers, central package management, `global.json` SDK pin).
- `Aptiverse.SharedKernel`: `Entity`, `Result`/`Error`, `IClock`, paging, `ModuleDbContext`, `AuditableEntityInterceptor`, `CheckConstraints`, `WithValidation<T>()`, authorization primitives (`Permissions`, `Roles`, `AptiverseClaims`, `RequirePermission`), platform hosting (`AddPlatform`: options, OpenTelemetry, Sentry, health, Wolverine).
- `Aptiverse.Host`: HTTP pipeline order, ProblemDetails, global exception handler, rate limiting, CORS, forwarded headers, OpenAPI, the `migrate` and `seed` commands.
- `Aptiverse.Worker`: the background role (same modules, health only, Wolverine durability agents and scheduled messages).
- Architecture and integration test projects and their shared helpers.

Out of scope:

- Any business rule (lives in modules).
- Role to permission mapping (Identity owns it, BE-IDN-07); SharedKernel only holds the permission constants.
- Entitlement resolution (Billing owns it, BE-BIL-05); SharedKernel only holds the `.RequireFeature()` gate.
- Terraform, pipelines, dashboards as code (INF, CI, OBS areas).

## Data model

The platform owns no business tables. It defines conventions that every module table follows, and two templates.

### Conventions applied by `ModuleDbContext` (verified in `SharedKernel/Persistence/ModuleDbContext.cs`)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK `pk_<table>`; value generated in app (`Guid.CreateVersion7()`, `ValueGeneratedNever`) |
| created_at | timestamptz | no | set by `AuditableEntityInterceptor` from `IClock` |
| updated_at | timestamptz | no | set by interceptor on insert and every update |
| deleted_at | timestamptz | yes | soft delete; named query filter `SoftDelete` hides rows; unique indexes filtered `deleted_at IS NULL` |
| xmin | xid | no | system column mapped as row version (`Version` shadow property); conflicts raise `DbUpdateConcurrencyException` |

Rules: snake_case names (`EFCore.NamingConventions`), one schema per module, history table `<schema>.__ef_migrations_history`, explicit `IEntityTypeConfiguration` applied in `ApplyConfigurations`, string enums backed by `CheckConstraints.In(...)`, `varchar(n)` lengths from entity constants, money as `bigint` cents plus `char(3)` currency, no cross-schema FKs, every FK indexed. Append-only ledgers opt out of soft delete by convention (no `Remove` calls; a test per ledger asserts it).

### `<schema>.idempotency_keys` (template, created per module that exposes unsafe endpoints; BE-SK-45)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| user_id | uuid | yes | null for anonymous endpoints (then keyed by client IP hash) |
| key | varchar(64) | no | client supplied `Idempotency-Key` header, 8 to 64 chars `[A-Za-z0-9_-]` |
| operation_id | varchar(64) | no | endpoint operation id, for example `createAssessment` |
| request_hash | char(64) | no | SHA-256 of the canonical JSON body |
| status_code | smallint | no | stored response status |
| response_body | jsonb | yes | stored response (max 64 KB, larger responses store only the status and location) |
| location | varchar(512) | yes | `Location` header for 201 |
| expires_at | timestamptz | no | created plus 24 h; index for purge |
| unique | | | `(user_id, operation_id, key)` unique; anonymous uses `(client_hash, operation_id, key)` |

No `xmin` conflicts expected (insert-once); no soft delete; purged by a scheduled message.

### `wolverine` schema

Created by `resources setup` in the `migrate` command (verified in `Host/Infrastructure/MigrateCommand.cs`), never on boot outside tests (`Messaging:AutoBuildStorage=false` in `appsettings.json`). Holds incoming and outgoing envelopes, scheduled messages, dead letters and node or leader tables. Retention of handled envelopes is configured by BE-SK-77.

## Contracts

SharedKernel public surface other projects rely on (exists unless marked planned):

```
public abstract class Entity { Guid Id; DateTimeOffset CreatedAt; DateTimeOffset UpdatedAt; DateTimeOffset? DeletedAt; bool IsDeleted; }
public sealed record Error(string Code, string Description, ErrorType Type) { IReadOnlyDictionary<string,string[]>? ValidationErrors; }
public enum ErrorType { Failure, Validation, NotFound, Conflict, Forbidden, Unauthorized, TooManyRequests }
public class Result / Result<T>                       // implicit from Error and from T
public static ProblemHttpResult ToProblem(this Error) // 400/404/409/403/401/429/500
public interface IClock { DateTimeOffset UtcNow { get; } }
public sealed record PageRequest(int Page = 1, int PageSize = 20)   // max 100
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, long TotalCount)
public static RouteHandlerBuilder WithValidation<TRequest>(this RouteHandlerBuilder)
public static TBuilder RequirePermission<TBuilder>(this TBuilder, string permission)  // policy "permission:<code>"
public static class Permissions { Account.Manage, Notifications.Read, Audit.Read, Support.ManageFaqs; All }
public static class Roles { Student, Parent, Admin; reserved Tutor, Teacher, School; SelfRegistrable; Active }
public static class AptiverseClaims { Subject = "sub", Email = "email", Roles = "roles", SessionId = "sid" }
public static Guid? GetUserId(this ClaimsPrincipal) / GetRequiredUserId / GetSessionId
public interface IDataSeeder { Task SeedAsync(CancellationToken) }
public interface IModuleMigrator { string Module; Task MigrateAsync(CancellationToken) }
public static string CheckConstraints.In(string column, IEnumerable<string> values)

// planned
public interface ICurrentUser { Guid? UserId; Guid? SessionId; IReadOnlyList<string> Roles; bool IsAuthenticated; Guid RequiredUserId; }   // BE-SK-29
public static TBuilder RequireFeature<TBuilder>(this TBuilder, string featureKey)                                                // BE-SK-28
public interface IFeatureGate { ValueTask<bool> HasFeatureAsync(Guid userId, string featureKey, CancellationToken ct); }           // implemented by Billing
public interface IObjectStorage { PresignPut(...); PresignGet(...); HeadAsync(...); ReadPrefixAsync(...); DeleteAsync(...); }    // BE-SK-30
public static RouteHandlerBuilder WithIdempotency(this RouteHandlerBuilder)                                                        // BE-SK-45
public sealed record CursorPage<T>(IReadOnlyList<T> Items, string? NextCursor)                                                     // BE-SK-58
public interface IPersonalDataExporter { string Module; Task<PersonalDataSection> ExportAsync(Guid userId, CancellationToken ct); } // BE-SK-60
public interface IPersonalDataEraser { string Module; Task EraseAsync(Guid userId, CancellationToken ct); }                         // BE-SK-60
```

## Tasks

### Solution and hosting

- [x] **BE-SK-01** Solution file and `Directory.Build.props` (nullable, warnings-as-errors, analyzers). *(Done as `Aptiverse.slnx`, not `.sln`; `AnalysisMode=Recommended`, `EnforceCodeStyleInBuild`, `TreatWarningsAsErrors`)*
- [x] **BE-SK-02** `Directory.Packages.props` central package management. *(With `CentralPackageTransitivePinningEnabled`)*
- [x] **BE-SK-03** `Aptiverse.Host` project: `Program.cs`, composition root. *(Pipeline order: forwarded headers, exception handler, status code pages, CORS, authentication, rate limiter, authorization)*
- [x] **BE-SK-04** `Aptiverse.Worker` project: same modules, Wolverine listeners only. *(Health endpoints only; `RunJasperFxCommands`)*
- [x] **BE-SK-37** Fix the broken build: `SharedKernel/Authorization/Policies.cs` was deleted but `Support/Features/CreateFaq/CreateFaqEndpoint.cs` still calls `.RequireAuthorization(Policies.Admin)` and `Host/Infrastructure/ApiServiceCollectionExtensions.cs` still registers `AddPolicy(Policies.Admin, ...)`. Replace the endpoint call with `.RequirePermission(Permissions.Support.ManageFaqs)`, drop the Host policy, and keep the integration test `Admin_can_create_published_faq_and_it_is_listed` green (the test auth handler must emit a `roles` claim the permission handler reads). Depends on BE-SK-38. (done: CreateFaq uses `RequirePermission(Permissions.Content.Manage)` (decision 9b folded `support.faqs.manage` into `content.manage`), the Host placeholder policy and auth are gone, the test auth handler emits `roles`)
- [x] **BE-SK-53** New-module wiring guard: Dockerfile restores from a glob or lists every module csproj (today it copies only Support projects, so adding Identity breaks the image build), `Aptiverse.slnx`, Host and Worker registration, and a test that every project under `src/Modules/*/Aptiverse.*` (non Contracts) is present in `ArchitectureTests/Modules.cs` (done: the Dockerfile collects every csproj in a `projects` stage, Identity is in the slnx, Host, Worker and `migrations-bundle.sh`, and `Every_module_project_is_registered_for_these_rules` fails when a module folder is missing from `Modules.cs`)
- [ ] **BE-SK-56** Graceful shutdown: `HostOptions.ShutdownTimeout` 25 s (below the ECS stop timeout of 30 s), readiness returns 503 once `ApplicationStopping` fires, Wolverine drains in-flight local queue work, test with `IHostApplicationLifetime.StopApplication()`
- [ ] **BE-SK-66** CORS lockdown: the web app calls the API server to server through the BFF, so production `Cors:AllowedOrigins` stays empty; a startup check fails if a wildcard origin is configured; local dev keeps `http://localhost:3000`

### SharedKernel primitives

- [x] **BE-SK-05** `Entity` base, Guid v7 id. *(`Domain/Entity.cs`; `Guid.CreateVersion7()` inline, no separate helper needed)*
- [x] **BE-SK-06** `Result<T>` and `Error` types. *(`Results/*`; uncommitted change adds `TooManyRequests`)*
- [x] **BE-SK-07** `IClock` and system clock. *(`Time/IClock.cs`, `SystemClock` over `TimeProvider`)*
- [x] **BE-SK-08** Paging request and response. *(`Paging/PageRequest.cs` caps page size at 100; `PagedResult<T>`)*
- [ ] **BE-SK-58** Keyset pagination helper `CursorPage<T>` with an opaque base64url cursor over `(created_at, id)`, for feeds that grow without bound (notifications, audit, ticket messages); unit tests for cursor round trip and tamper rejection (400 `paging.cursor_invalid`)
- [ ] **BE-SK-29** `ICurrentUser` (replaces 22 copies of `CurrentUserId()`). *(partial: `ClaimsPrincipalExtensions.GetUserId`, `GetRequiredUserId`, `GetSessionId` exist; no scoped `ICurrentUser` service registered or injected)*
- [ ] **BE-SK-67** Non-production test clock: `TestClockOptions` (`Testing:Clock:Enabled`, `OffsetSeconds` or `FixedUtc`) swaps `SystemClock` for an adjustable `TestClock`; a dev and staging only endpoint `POST /dev/clock` (permission `settings.manage`, mapped only when `ASPNETCORE_ENVIRONMENT` is `Development`, `Testing` or `Staging`) sets or resets the offset for E2E deadline tests. Impossible in production: the options validator fails the boot when `Enabled` is true in `Production`, the endpoint is never mapped there, and a test asserts both. Wolverine scheduled messages still fire on wall-clock time, so E2E tests that need a reminder or auto-submit to fire call a dev-only `POST /dev/scheduled/{messageType}/run-due` that runs due handlers against the test clock
- [ ] **BE-SK-51** Johannesburg time helpers: `IClock` extensions `TodayIn(TimeZoneInfo)`, `StartOfDayUtc(DateOnly, tz)`, a `Timezones.Johannesburg` constant resolved from tzdata (present in the `-extra` chiselled image); unit tests around midnight and DST-free behaviour

### Errors, validation and HTTP behaviour

- [x] **BE-SK-09** `Result` to TypedResults and ProblemDetails mapping. *(`ResultHttpExtensions.ToProblem()` adds `code` and validation `errors`)*
- [x] **BE-SK-10** Global `IExceptionHandler`: ProblemDetails with trace id, never a raw message. *(`Host/Infrastructure/GlobalExceptionHandler.cs`; `traceId` and `instance` added in `AddProblemDetails` customisation; covered by `HealthTests.Unknown_route_is_problem_details_without_internals`)*
- [x] **BE-SK-11** FluentValidation endpoint filter. *(`WithValidation<T>()` adds `ValidationFilter<T>`; opt-in per endpoint, so BE-SK-39 adds the guard that it is applied)*
- [x] **BE-SK-12** Test: every request type has a validator. *(`ConventionTests.Every_request_type_has_a_validator`)*
- [ ] **BE-SK-39** Test: every mapped endpoint whose delegate takes a `*Request` parameter carries `ValidationFilter<T>` metadata (read from `EndpointDataSource` in an integration test)
- [ ] **BE-SK-43** Concurrency mapping: `DbUpdateConcurrencyException` becomes `409` ProblemDetails with `code = "concurrency_conflict"` and copy "This item changed while you were editing it. Reload and try again."; add `Error.Concurrency(...)` helper; optional `ETag` from `xmin` and `If-Match` support for PATCH endpoints
- [ ] **BE-SK-44** Unique violation helper: catch `PostgresException` with `SqlState 23505` in a `SaveChangesResultAsync` extension and return `Error.Conflict` with the constraint name mapped to a stable code
- [ ] **BE-SK-46** Request size limits: Kestrel `MaxRequestBodySize` 256 KB by default (uploads go straight to S3), per-endpoint `[RequestSizeLimit]` override, JSON `MaxDepth` 32, `413` returned as ProblemDetails
- [ ] **BE-SK-50** API response headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` on every authenticated response, `Server` header removed, HSTS outside Development
- [ ] **BE-SK-63** Stable problem `type` URIs: `https://api.aptiverse.co.za/problems/<code>` set from `Error.Code`; documented list generated from all `Error` statics at build time

### Configuration and health

- [ ] **BE-SK-13** Typed options with `ValidateOnStart()`; boot fails on missing secret. *(partial: `DatabaseOptions`, Host `AuthOptions`, `RateLimitingSettings`, `ForwardedHeadersSettings` validate on start; `MessagingOptions` and `TelemetryOptions` bind without validation; no test proves boot fails when `ConnectionStrings__Aptiverse` is empty)*
- [ ] **BE-SK-14** `/health/live` and `/health/ready` (DB, outbox). *(partial: both mapped anonymous with rate limiting disabled; ready checks Postgres only; no outbox backlog check)*
- [ ] **BE-SK-57** Npgsql pool and timeouts as validated options: `MaxPoolSize` per task (default 40), `Timeout` 15 s, `CommandTimeout` 15 s, `KeepAlive` 30 s; `statement_timeout` set on the app database role by infra (INF) and asserted by a readiness probe query
- [ ] **BE-SK-65** Config-only feature toggles (`FeatureToggles` options, `ValidateOnStart`) for dark launches; no database feature-flag table (the old `feature_flags` schema is dropped)

### OpenAPI

- [x] **BE-SK-15** Build-time OpenAPI, one docs UI. *(`OpenApiGenerateDocuments` writes `openapi/v1.json`; Scalar mapped in Development only)*
- [ ] **BE-SK-41** Contract conventions test: operation ids camelCase and unique, every operation tagged with its module name, every endpoint that requires auth documents `401`, `403` and `429` ProblemDetails responses, every endpoint with a validator documents `400`
- [ ] **BE-SK-62** FluentValidation rules in the OpenAPI document: a schema transformer reads each request validator's rules and emits `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, `enum` and `required` on the matching schema properties (for example `password` gets `minLength: 10`, `maxLength: 128` from `PasswordPolicy`), so Orval's generated zod schemas carry the same bounds as the server; a test compares the transformer output for every request type with its validator
- [ ] **BE-SK-64** OpenAPI document transformer: bearer security scheme with `security` requirement on protected operations, shared ProblemDetails component schema, `servers` per environment

### Persistence

- [x] **BE-SK-16** Persistence base: Npgsql, snake_case, explicit `IEntityTypeConfiguration`. *(`ModuleDbContext`, `PersistenceServiceCollectionExtensions.AddModuleDbContext`)*
- [x] **BE-SK-17** `AuditableEntityInterceptor` port (UTC timestamps, soft delete). *(Rewrites `Deleted` to `Modified` with `DeletedAt`; unit test in `CreateFaqHandlerTests`)*
- [x] **BE-SK-18** `xmin` concurrency convention. *(`Version` shadow property `IsRowVersion()`; visible as `xmin xid` in the Support migration)*
- [ ] **BE-SK-19** Enum-as-string with check constraint convention. *(partial: `CheckConstraints.In` helper exists (uncommitted) and Identity configurations use it; no shared base or test enforcing it, see BE-SK-42)*
- [ ] **BE-SK-42** Test: every string property whose CLR declaring type exposes an `All` list of allowed values (or is marked `[StringEnum]`) has a matching check constraint in the model
- [ ] **BE-SK-20** UTC date converter (the offset-less input lesson): a value converter for `DateTimeOffset` that normalises to offset zero before write (Npgsql rejects non-UTC offsets for `timestamptz`), plus a JSON converter that rejects date-time strings without an offset with a 400 field error (`must include a time zone offset`); tests for `2026-11-02T08:00:00` (rejected), `+02:00` (stored as 06:00Z)
- [x] **BE-SK-21** Per-module DbContext, schema and migrations-history table pattern. *(`ConfigureModule` sets `MigrationsHistoryTable("__ef_migrations_history", schema)`; design-time factory per module)*
- [ ] **BE-SK-54** Harden the `migrate` command: take a Postgres advisory lock (`pg_advisory_lock(hashtext('aptiverse-migrate'))`) so two tasks never race, apply modules in a fixed order, log each applied migration, exit non-zero on any failure, rerun is a no-op
- [ ] **BE-SK-55** Seed command guard: split `IDataSeeder` into reference seeders (catalogs, plans, FAQs; allowed everywhere) and `IDemoDataSeeder` (demo users; refuses to run when `ASPNETCORE_ENVIRONMENT=Production`)
- [ ] **BE-SK-59** Personal data classification: `[PersonalData(PiiCategory.Contact | Identifier | Education | Health | Behavioural | Free text | Network)]` and `[NotPersonal]` attributes on entity properties; a test fails when any mapped property in a module entity is unclassified. Feeds the data processing inventory (HRD-31)
- [ ] **BE-SK-60** Export and erasure fan-out: `IPersonalDataExporter` and `IPersonalDataEraser` interfaces in SharedKernel; each module with user data registers one of each; Identity orchestrates both (BE-IDN-37, BE-IDN-60); architecture test asserts every module whose model has a `user_id` column registers both

### Messaging

- [x] **BE-SK-22** Wolverine with Postgres persistence and transactional outbox. *(`AddMessaging` in `PlatformHostingExtensions`; `AddDbContextWithWolverineIntegration`; integration test asserts `FaqPublished` is handled after commit)*
- [ ] **BE-SK-23** Wolverine scheduled messages wired in Worker. *(partial: Worker runs Wolverine with Postgres durability in Balanced mode, which supports scheduled delivery; no scheduled message exists and no test proves one fires in the Worker)*
- [ ] **BE-SK-61** Wolverine error policies: retry with cooldown (1 s, 10 s, 60 s) on transient exceptions (`NpgsqlException`, `TimeoutException`, `HttpRequestException`), then move to dead letters; JasperFx command or admin action to replay dead letters; metric on dead-letter count (BE-SK-80)

### Resilience, caching, rate limiting

- [ ] **BE-SK-24** `Microsoft.Extensions.Http.Resilience` default pipeline (timeout, retry, breaker): package added centrally, `AddAptiverseHttpClient<TClient>(name)` helper applying `AddStandardResilienceHandler` with attempt timeout 10 s, total 30 s, 3 retries with jitter on 408, 429, 5xx honouring `Retry-After`, breaker at 20 percent failures over 30 s; options overridable per client
- [ ] **BE-SK-25** `HybridCache` (L1 only). *(partial: package referenced and used by Identity's `SessionRevocationCache`; `AddHybridCache()` is not registered anywhere, so Identity cannot resolve it)*
- [ ] **BE-SK-26** Rate limiter groups: `auth`, `ai`, `uploads`, `webhooks`, `default`; partition by user id or IP. *(partial: a global fixed-window limiter partitioned by `user:<sub>` or `ip:<addr>` exists with 429 ProblemDetails and `Retry-After`; Identity's `identity-*` policies exist but are unregistered; `ai`, `uploads`, `webhooks` named policies do not exist; the webhook partition is not isolated from user traffic)*
- [ ] **BE-SK-47** Additional rate-limit groups: `public-forms` (anonymous contact, school enquiry, unsubscribe: 5 per 10 min per IP) and `exports` (data export, calendar feed fetch: 6 per hour per user, 60 per hour per feed token)

### Authorization and entitlements

- [ ] **BE-SK-27** Permissions: constants class, policy registration, `.RequirePermission()` extension. *(partial: `Permissions` constants and `RequirePermission` exist (uncommitted); `PermissionAuthorizationHandler` lives in Identity and is unregistered; no policy is registered per permission, so `RequirePermission` currently resolves to an unknown policy)*
- [x] **BE-SK-38** Register one policy per `Permissions.All` entry (`permission:<code>`, requirement `PermissionRequirement`) and a fallback policy requiring an authenticated user so a forgotten `RequirePermission` fails closed; registration happens in `AddIdentityModule` because the handler and role map live there (done: `IdentityModule.AddIdentityModule` registers one policy per permission and a fail-closed fallback policy; anonymous requests to unknown routes now get 401, covered by `Anonymous_request_to_unknown_route_fails_closed`)
- [ ] **BE-SK-40** Test: every endpoint either has `RequirePermission`, an explicit `AllowAnonymous` that appears in a reviewed allowlist (`/health/*`, `/support/faqs` GET, `/auth/*` anonymous routes, `/.well-known/jwks.json`, public forms, webhooks, calendar feed), or fails the build
- [ ] **BE-SK-28** Entitlements: `.RequireFeature(featureKey)` endpoint filter backed by `IFeatureGate` (implemented by Billing, BE-BIL-05); until Billing ships, a config-backed fake grants nothing to Free users; denied returns `402`-style ProblemDetails with status 403, `code = "entitlement_required"` and `feature` extension so the web shows the upgrade state

### Storage

- [ ] **BE-SK-30** S3 storage abstraction (port `IAssessmentUploadStorage`): `IObjectStorage` with key builder `<module>/<userId>/<entityId>/<guid><ext>` (no user-supplied path segments, traversal guard rejects `..`, `/`, `\` and control characters in filenames), presigned PUT with exact `Content-Type` and `Content-Length` conditions (15 min), presigned GET with `response-content-disposition` (5 min), `HeadAsync`, `ReadPrefixAsync(key, 16 bytes)` for magic bytes, `DeleteAsync`; MinIO locally, S3 in AWS; uses the resilience pipeline

### Architecture tests

- [x] **BE-SK-31** `Aptiverse.ArchitectureTests`: module internals not referenced across modules. *(`ModuleBoundaryTests.Module_types_are_internal_except_registration_and_message_handlers`, `Hosts_use_only_the_module_registration_surface`)*
- [x] **BE-SK-32** Architecture test: modules reference only other modules' `Contracts`. *(`Module_references_only_shared_kernel_and_contracts`, `Contracts_reference_no_module_implementation`)*
- [x] **BE-SK-33** Architecture test: every FK has an index. *(`ConventionTests.Every_foreign_key_has_an_index`)*
- [ ] **BE-SK-34** Architecture test: no `DateTime.Now`, `DateTime.UtcNow`, `DateTimeOffset.Now` or `DateTimeOffset.UtcNow` outside `SystemClock` (IL scan with `Mono.Cecil` or a Roslyn banned-API analyzer via `BannedSymbols.txt`; the analyzer route also covers `Guid.NewGuid()` in entities)
- [ ] **BE-SK-49** Meter conventions: `AptiverseMeters.For(module)` creates meters named `Aptiverse.<Module>`; instrument names follow `aptiverse.<module>.<noun>.<verb or unit>`; a test reflects over modules for `Meter` fields and checks names

### Integration test harness

- [x] **BE-SK-35** `Aptiverse.IntegrationTests`: `WebApplicationFactory` plus Testcontainers Postgres base fixture. *(`ApiFactory` on `postgres:17-alpine`, migrates and seeds, skips when Docker is unavailable)*
- [ ] **BE-SK-36** Test auth helper (issue tokens for seeded users per role). *(partial: `TestAuthHandler` authenticates by an `X-Test-Role` header with a random `sub`; no seeded users and no real ES256 tokens, so session revocation and permission claims are not exercised)*
- [ ] **BE-SK-52** Shared test utilities project `tests/Aptiverse.Testing`: `FakeClock`, in-memory and Testcontainers DbContext factories per module, Wolverine `ExecuteAndWaitAsync` helpers, JSON contract shape assertions, a `ProblemDetailsAssert`; move `Support.UnitTests/TestDb.cs` there

### Idempotency

- [ ] **BE-SK-68** `IHardDelete` opt-out from soft delete: entities implementing the marker interface are deleted for real by `AuditableEntityInterceptor` (no `DeletedAt` rewrite) and get no `SoftDelete` query filter in `ModuleDbContext`; used by Wellbeing diary entries and check-in notes (POPIA: the user expects deletion to be final); an architecture test lists every `IHardDelete` entity so additions are reviewed; unit tests for both paths
- [ ] **BE-SK-69** `IFieldEncryptor` for field-level encryption: envelope encryption with a per-module data key generated by AWS KMS (`GenerateDataKey`, key ARN from options, `ValidateOnStart`), data keys cached encrypted in memory for 1 h, AES-256-GCM with a random 96-bit nonce, stored as `bytea` in the format `version | key id | nonce | ciphertext | tag`; an EF value converter `EncryptedString`; key rotation by re-encrypting on read with the current key version; a local deterministic key provider only for Development and Testing (boot fails if used in Production); used by Wellbeing diary content and Affiliates payout details (other backend file); unit tests for round trip, tamper detection and rotation; resilience pipeline on KMS calls with fail-closed behaviour (no plaintext fallback)
- [ ] **BE-SK-45** Idempotency for unsafe operations: `.WithIdempotency()` endpoint filter reads `Idempotency-Key`, looks up `<schema>.idempotency_keys` for `(user, operation, key)`, replays the stored status and body on a match with the same request hash, returns `409 idempotency_key_reused` for the same key with a different body, stores the response after a successful handler run in the same transaction as the outbox; `IdempotencyKeyConfiguration` helper for module contexts; scheduled purge of expired keys hourly

## Slices

### BE-SK-14  GET /health/live and GET /health/ready

| | |
|---|---|
| Operation id | none (excluded from OpenAPI) |
| Permission | anonymous (allowlisted) |
| Entitlement | none |
| Rate limit | disabled (`DisableRateLimiting()`), Cloudflare and ALB restrict reachability |
| Idempotency | safe read |
| Metric | `aptiverse.platform.health.ready.duration` (histogram, ms), `aptiverse.platform.health.ready.failures` (counter, tag `check`) |
| Log fields | `Check`, `Status`, `DurationMs` (only on failure) |

Request: none. Response: `200 Healthy` or `503 Unhealthy` plain text (live never touches dependencies; ready runs checks tagged `ready`).

Ready checks: `postgres` (exists), `outbox` (planned: oldest pending outgoing envelope younger than 2 min and fewer than 1000 pending), `shutdown` (planned, BE-SK-56).

Breakdown of BE-SK-14 (tracked once, in the Configuration and health list above):

  - [x] Endpoints mapped in `MapPlatformHealthChecks`
  - [x] Postgres check (`PostgresHealthCheck`, generic message only)
  - [ ] Outbox backlog check
  - [x] Integration tests: both return 200 (`HealthTests`)
  - [ ] Integration test: ready returns 503 when the database is stopped

### BE-SK-15  GET /openapi/v1.json and Scalar UI (Development only)

| | |
|---|---|
| Permission | anonymous, Development only |
| Rate limit | `default` |
| Metric | none |
| Log fields | none |

Tracked as BE-SK-15 in the OpenAPI list above.

## Background work

| Message | Trigger | Handler | Notes |
|---|---|---|---|
| `PurgeExpiredIdempotencyKeys` | scheduled hourly per module that uses BE-SK-45 | deletes rows with `expires_at < now` in batches of 1000 | BE-SK-45 |
| Wolverine durability agent | continuous in Host and Worker (Balanced mode, leader election) | recovers outbox and inbox, fires scheduled messages | BE-SK-22, BE-SK-23 |
| Dead-letter replay | manual command | re-enqueues selected envelopes | BE-SK-61 |

## Production readiness

### Threat model (STRIDE summary)

| Threat | Platform exposure | Control | Task |
|---|---|---|---|
| Spoofing | forged JWTs, spoofed client IP through `X-Forwarded-For` | ES256 only, issuer and audience validated (Identity); forwarded headers trusted only from `ForwardedHeaders:KnownNetworks` (exists) | BE-SK-70, BE-IDN-15 |
| Tampering | request bodies, cursor and idempotency values | validators on every request, signed or opaque cursors, request hash on idempotency keys | BE-SK-39, BE-SK-45, BE-SK-58 |
| Repudiation | no record of who did what | structured logs with trace and user id, module audit tables (Identity security events, Admin audit) | BE-SK-48 |
| Information disclosure | exception text, stack traces, PII in logs, Sentry | `GlobalExceptionHandler` (exists), `SendDefaultPii=false` (exists), log redaction | BE-SK-78 |
| Denial of service | unbounded bodies, unpaged lists, slow queries, rate-limit starvation | body limits, page caps, statement timeout, partitioned limiter, webhook isolation | BE-SK-46, BE-SK-57, BE-SK-26 |
| Elevation of privilege | endpoint without auth, missing permission | fallback policy, endpoint auth test | BE-SK-38, BE-SK-40 |

- [ ] **BE-SK-70** Write `api/docs/security/threat-model-platform.md` from the table above, reviewed each phase gate; link from `api/CLAUDE.md`

### Authorisation and ownership

- [ ] **BE-SK-71** Generated negative auth suite: for every endpoint in `EndpointDataSource`, anonymous gets 401 unless allowlisted, a principal with no roles gets 403, and the result is asserted as ProblemDetails with `traceId`

### Input limits and payload caps

- [ ] **BE-SK-72** Tests: 300 KB JSON body returns 413 ProblemDetails; depth 40 JSON returns 400; `pageSize=1000` is clamped to 100 (existing `PageRequest`) and documented in OpenAPI as `maximum: 100`

### Rate limits

- [ ] **BE-SK-73** Rate-limit matrix documented in `api/docs/rate-limits.md` (group, partition key, permit, window, queue 0) and an integration test per group proving 429 with `Retry-After` and `traceId`; webhook traffic cannot consume the `default` bucket of the same IP

### Idempotency and concurrency

- [ ] **BE-SK-74** Integration tests for BE-SK-45: replay returns the stored response and does not create a second row; same key with a different body returns 409
- [ ] **BE-SK-75** Integration test for BE-SK-43: two PATCHes with the same stale row version, the second returns 409 `concurrency_conflict`

### Resilience

- [ ] **BE-SK-76** Fault-injection test for BE-SK-24: a delegating handler returning 503 twice then 200 succeeds within budget; 10 consecutive failures open the breaker and fail fast; timeouts surface as `Error.Failure("<client>.unavailable")` mapped to 503 by the caller

### Data retention and POPIA

- [ ] **BE-SK-77** Retention settings: Wolverine `Durability.KeepAfterMessageHandling` 7 days, dead letters 30 days, idempotency keys 24 h, application logs 30 days and traces 14 days (OBS); documented in the retention policy (HRD-35)
- [ ] **BE-SK-78** Log and telemetry redaction: an `IRedactor`-based enricher drops `email`, `name`, `phone`, `token`, `password`, `authorization` and cookie values from log state and span attributes; unit test with a captured logger; Sentry `BeforeSend` strips request bodies and headers

### Audit

- [ ] **BE-SK-79** Security-relevant platform events logged at Warning with reserved `EventId` ranges (1000 to 1099 auth failures, 1100 to 1199 rate-limit rejections, 1200 to 1299 validation of signed values): `RateLimitRejected` (partition kind, policy), `ProblemReturned5xx` (operation id, error code)

### Observability

- [ ] **BE-SK-48** Log enrichment middleware: scope with `TraceId`, `SpanId`, `UserId` (sub), `SessionId`, `OperationId`, `Module`, `ClientKind` (bff or direct); no PII; `UseHttpLogging` off in production
- [ ] **BE-SK-80** Platform metrics and alerts (alert rules live in OBS, names here): `http.server.request.duration` (OTel built-in, by `http.route` and status) with alerts **5xx ratio above 2 percent for 5 min** and **p95 above 500 ms for 10 min excluding `/ai/*`**; `aptiverse.platform.outbox.pending` (gauge) and `aptiverse.platform.outbox.oldest_age` (gauge, s) with alert **oldest above 120 s for 5 min**; `aptiverse.platform.dead_letters` (gauge) with alert **above 0**; `aptiverse.platform.ratelimit.rejected` (counter, tag `policy`) with alert **auth policy rejections above 200 in 5 min**; Npgsql `db.client.connections.usage` with alert **pool above 90 percent for 5 min**; ready probe failures from ALB target health
- [ ] **BE-SK-81** Trace conventions: one span per HTTP request (built in), child spans for handlers named `<Module>.<UseCase>` via an `ActivitySource("Aptiverse.<Module>")` per module, Npgsql and HttpClient spans (built in), Wolverine spans (`AddSource("Wolverine")`, exists)

### Performance budgets

- [ ] **BE-SK-82** Budgets: p95 under 500 ms for every non-AI endpoint at 10x expected peak (HRD-50), health under 50 ms, cold start of a task under 10 s to ready; EF Core logs queries over 200 ms at Warning with the operation id; `pg_stat_statements` reviewed per phase gate (HRD-12)
- [ ] **BE-SK-83** Query plan check: an integration test helper `AssertUsesIndex(sql)` runs `EXPLAIN (FORMAT JSON)` on the main list queries of each module against a seeded dataset and fails on a `Seq Scan` over tables with more than 10 000 rows

### Migration safety

- [ ] **BE-SK-84** Expand and contract policy in `api/docs/migrations.md`: additive first (new nullable column or new table), backfill as a separate idempotent job, switch reads, then drop in a later release; no rename in one step
- [ ] **BE-SK-85** CI guard (with CI-08): a script scans new migration files for `DropTable`, `DropColumn`, `RenameColumn`, `AlterColumn` type changes and `Sql(` blocks, and fails unless the PR carries the `destructive-migration` label and the migration class has a `// Rollback:` comment describing the restore path
- [ ] **BE-SK-86** Rollback plan: every release notes whether its migrations are backward compatible with the previous image (required for auto rollback, CI-12); a test applies the latest migrations then boots the previous released image's model snapshot against them in CI where feasible

### SLO contribution

- [ ] **BE-SK-87** Platform SLIs defined in OBS: availability = non-5xx responses (excluding 429 and client cancellations) over all responses, latency = p95 per route group; error budget policy for 99.5 percent monthly (HRD-50): feature work pauses when 50 percent of the budget is spent in a week

### Load and failure drills

- [ ] **BE-SK-88** Baseline k6 run (with HRD-10): `GET /support/faqs` and `GET /health/ready` at 200 rps for 10 min to size `MaxPoolSize` and task count; results recorded in `api/docs/capacity.md`
- [ ] **BE-SK-89** Failure drill: stop Postgres for 60 s in staging; API returns 503 ProblemDetails, ready fails, Wolverine resumes outbox delivery afterwards with no lost messages (verified by a canary event count)

## Old data mapping

| Old (43f9faa) | New | Notes |
|---|---|---|
| `events.outbox_messages` | not migrated | Old outbox was drained by a polling service; in-flight rows at cutover are drained before the final snapshot (CUT) |
| `feature_flags.*` (3 tables) | dropped | Config toggles replace them (BE-SK-65) |
| `moderation.*` (4 tables) | dropped | No user-generated content in v1 |
| `Data/Abstractions/AuditableEntityInterceptor.cs` | `SharedKernel/Persistence/AuditableEntityInterceptor.cs` | Ported idea, new code (done) |
| Polling `BackgroundService` classes (9) | Wolverine scheduled messages per module | Each module file lists its replacements |

## Tests

- Architecture: boundaries (exists), FK index (exists), schema and Entity base (exists), validator per request (exists), user-reference FK (skipped placeholder exists; enable in Phase 2 with BE-IDN-09), clock ban (BE-SK-34), check constraints (BE-SK-42), meter names (BE-SK-49), module registration (BE-SK-53), PII classification (BE-SK-59), export and erasure registration (BE-SK-60).
- Integration: health (exists), unknown route ProblemDetails (exists), validation filter present (BE-SK-39), endpoint auth allowlist (BE-SK-40), contract conventions (BE-SK-41), negative auth suite (BE-SK-71), limits (BE-SK-72), rate limits (BE-SK-73), idempotency (BE-SK-74), concurrency (BE-SK-75), resilience (BE-SK-76).
- Unit: interceptor (exists via Support tests), clock helpers (BE-SK-51), cursor (BE-SK-58), UTC converter (BE-SK-20), redaction (BE-SK-78).

## Open questions

1. `.slnx` versus the `.sln` named in BE-SK-01: treated as done; the plan text should say `Aptiverse.slnx`.
2. Where does `PermissionAuthorizationHandler` live long term? Today it is in Identity (it needs the role map). Keeping it there means every module's endpoints depend on Identity being registered in the same host, which is always true; recorded in BE-SK-38.
3. Should `RequireFeature` denial be 403 with `code = entitlement_required` (proposed) or 402? 402 is semantically closer but poorly supported by clients.
4. Idempotency keys per module schema (proposed, respects no shared tables) or one `platform` schema? A shared schema would break the "each module owns its schema" rule, so per module is assumed.
5. Statement timeout ownership: role-level setting in Terraform or the Npgsql `Options=-c statement_timeout=15000` connection string parameter. Either is fine; pick one in INF.
