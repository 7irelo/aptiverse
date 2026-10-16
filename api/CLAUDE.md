# CLAUDE.md

Guidance for working in the Aptiverse API repo (`aptiverse-labs/api`). This is the rebuild; nothing from the old API's structure applies. Decisions are recorded in `docs/adr/`.

## Shape

- .NET 10 modular monolith. `Aptiverse.Host` (HTTP) and `Aptiverse.Worker` (background) load the same modules.
- `Aptiverse.SharedKernel` is the only shared code: `Entity`, `Result`/`Error`, `IClock`, paging, `ModuleDbContext`, `AuditableEntityInterceptor`, `WithValidation<T>()`, platform hosting. It never references a module.
- Modules live in `src/Modules/<Name>/Aptiverse.<Name>` with a public `Aptiverse.<Name>.Contracts` project beside it.

## Module boundaries (enforced by tests/Aptiverse.ArchitectureTests)

- Everything in a module is `internal` except its `<Name>Module` registration class and Wolverine message handlers (which Wolverine requires to be public; their Handle method must take a Contracts message).
- A module may reference `Aptiverse.SharedKernel` and other modules' `.Contracts` projects only. Never another module's implementation, DbContext or tables.
- Each module exposes exactly `Add<Name>Module(IServiceCollection, IConfiguration)` and `Map<Name>Endpoints(IEndpointRouteBuilder)`. Host and Worker call these and nothing else from the module.
- Each module has its own DbContext deriving from `ModuleDbContext`, its own Postgres schema, and its own `__ef_migrations_history` table in that schema. No cross-schema foreign keys. Every FK has an index.
- Cross-module data moves by id plus integration events (records in `.Contracts`, published through the Wolverine outbox) or a query interface in `.Contracts`.
- Register a new module in `tests/Aptiverse.ArchitectureTests/Modules.cs` so the rules cover it.

## Vertical slices

One folder per use case under `Features/<UseCase>/`:

```
Features/CreateFaq/
  CreateFaqEndpoint.cs    # Map(RouteGroupBuilder): route, WithName (camelCase operation id), auth, WithValidation<T>()
  CreateFaqRequest.cs     # request and response records
  CreateFaqValidator.cs   # FluentValidation, required for every *Request type
  CreateFaqHandler.cs     # the use case
```

- Minimal APIs with `TypedResults` and explicit return types so the OpenAPI document is exact.
- Operation ids are camelCase (`listFaqs`); tags are the module name.
- Response records are the public contract. Changing one changes `openapi/v1.json`, which the web app consumes.

## Errors and the Result pattern

- Handlers return `Result` or `Result<T>` for expected failures: `Error.NotFound`, `Validation`, `Conflict`, `Forbidden`, `Unauthorized`. Endpoints map failures with `.ToProblem()`.
- Exceptions are for bugs. `GlobalExceptionHandler` turns them into RFC 9457 ProblemDetails with a `traceId` and never the exception message.
- Every ProblemDetails response carries `traceId`.

## Validation

- Every request type has a FluentValidation validator, and the endpoint calls `.WithValidation<TRequest>()`. An architecture test fails the build if a validator is missing.

## Persistence

- Entities derive from `Entity`: Guid v7 `Id` (`Guid.CreateVersion7()`), `CreatedAt`, `UpdatedAt`, `DeletedAt`. Never set timestamps by hand; the interceptor does it in UTC.
- Deleting an entity is a soft delete. A named `SoftDelete` query filter hides deleted rows. `xmin` is the concurrency token.
- Explicit `IEntityTypeConfiguration` per entity, applied by hand in `ApplyConfigurations` (no assembly scanning). snake_case names come from the base context.
- `timestamptz` only, via `DateTimeOffset`. Use `IClock`, never `DateTime.Now` or `DateTimeOffset.UtcNow`.
- Money is integer minor units plus a currency code.

## Migrations

- The API and worker never migrate at startup. Local: `scripts/migrate.sh`. Deployed: per-module bundles from `scripts/migrations-bundle.sh`, run as a one-off task.
- Add migrations with `dotnet ef migrations add` using the module project as both project and startup project (see README). Keep generated migration classes `internal`.
- Seed data goes in an idempotent `IDataSeeder` and runs only via `dotnet run --project src/Aptiverse.Host -- seed`.

## Messaging

- Wolverine with Postgres persistence (schema `wolverine`) and the EF Core transactional outbox. Publish integration events through `IDbContextOutbox<TContext>` so the row and the event commit together.
- Wolverine handler discovery is explicit: register each handler with `opts.Discovery.IncludeType(...)` in the module's `Add<Name>Module`.
- Scheduled work is scheduled messages, never polling loops. MediatR is not used.

## Configuration and secrets

- Strongly typed options with `ValidateOnStart()`. A missing required value fails the boot.
- No secrets in the repo. `appsettings.Development.json` may only hold local-only values that point at the local compose stack. Everything else comes from environment variables or Secrets Manager.
- Rate limiting partitions by user id or client IP, never by a shared tier name. Forwarded headers are trusted only from configured proxies.

## Quality gates

- `dotnet format Aptiverse.slnx --verify-no-changes`, `dotnet build` (warnings are errors), `dotnet test --solution Aptiverse.slnx`.
- After changing an endpoint or response record: `dotnet build src/Aptiverse.Host --no-incremental` and commit `openapi/v1.json`. CI fails on drift.

## Writing and commits

- Conventional commits: `type(scope): subject` (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `ci`, `build`, `perf`). The body says why.
- No emojis, no em dashes or en dashes, anywhere: code, comments, docs, commit messages.
- Comments are sparse and explain why, not what.
