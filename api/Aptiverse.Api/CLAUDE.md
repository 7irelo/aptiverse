# CLAUDE.md

Instructions for AI assistants (Claude Code, Cursor, etc.) working in this repo. Read this before making changes.

## Architecture in one paragraph

Aptiverse is a **modular monolith** plus four supporting services. There is **one** .NET host: `api/Aptiverse.Api/`. It serves auth + 14 domain modules in a single process on port 5100. There is **one** solution: `Aptiverse.Api.csproj` at the repo root, listing 61 projects (the host + 60 module library projects). Per-service host projects do not exist any more; **do not recreate them**. The four services that stay separate (`ai-service`, `payment-gateway`, `event-architecture`, `notification-service`) do so for genuine technical reasons (different language, different resource profile, async-by-design). The frontend is `ui/` (Next.js 16 + React 19 + MUI v7).

## Hard rules

1. **Don't re-introduce per-service .NET hosts.** No new web SDK projects under `api/{x}-service/` other than the existing four library projects per module. New web project? It goes inside `api/Aptiverse.Api/`.
2. **Don't add new `*.slnx` files.** The repo has exactly one solution file: `Aptiverse.Api.csproj` at the root. Add new projects to it via `<Project Path="..." />` inside the appropriate `<Folder>`.
3. **Don't add new Dockerfiles for .NET code.** The single `api/Aptiverse.Api/Dockerfile` builds the whole back end.
4. **Don't move controllers back into module Application/Infrastructure libraries.** Controllers live in `api/Aptiverse.Api/Controllers/`. The Application libraries are not Web SDK projects and shouldn't reference `Microsoft.AspNetCore.Mvc.*`.
5. **Don't call per-module `AddInfrastructureServices()` from the host.** Each module's Infrastructure registers Redis + a HealthCheck named `"redis"` — calling all of them would collide. Redis is registered exactly once in `api/Aptiverse.Api/Registrations.cs` (via `AddInfrastructure`). Per-module DbContexts are wired in `api/Aptiverse.Api/Modules/ModuleRegistrations.cs`.
6. **Don't call multiple `AddApplicationServices()` extension methods via `using`.** They all share the same name; the compiler can't disambiguate. Always invoke them as static methods with the full namespace, e.g. `Aptiverse.Goals.Application.ServiceCollectionExtensions.AddApplicationServices(services)`.
7. **`IRepository<T>` lives in the global namespace inside each module's `Domain` assembly.** That means you can never write `IRepository<T>` unqualified from `Aptiverse.Api`'s host code — it'll fail with CS0433. Each module's Application code references its own Domain's `IRepository<T>`, which is fine because that resolves at *the module's* compile time. If you need to register a per-module repository from the host, do it via reflection.
8. **Permissions live in two places that must stay in sync.** `auth-provider/src/Aptiverse.Application/Auth/Services/PermissionResolver.cs` (server) and `ui/src/lib/rbac.ts` (client). When you add a permission, update both. The server returns the `permissions[]` array on `/api/auth/me` and `/api/auth/login`; the UI's `PermissionGuard` consumes it.
9. **The frontend's TypeScript types in `ui/src/lib/mockData.ts` are the contract for `/api/frontend/*` endpoints.** When you add a new field to a UI type, add it to the matching `Frontend{X}Dto` in the corresponding module's `Application/Frontend/Dtos/` and update the controller in `api/Aptiverse.Api/Controllers/Frontend/`. Field names are camelCase (`[JsonPropertyName(...)]`).
10. **Don't bump up MUI X to v9 in the UI without checking.** Frontend currently runs MUI v7 + MUI X v8. v9 has breaking chart slot/legend API changes that broke the build last time.
11. **Don't add `export const metadata` to a marketing page that uses function-style `sx` props.** Next 16 will fail prerender if a server component passes a function across the client boundary. Either keep the page server (no function `sx`) or mark it `"use client"` and drop the metadata export.

## Common tasks

### Add a new module
1. Add four projects under `api/{name}-service/src/`: `.Domain`, `.Core`, `.Application`, `.Infrastructure`. Mirror an existing one (e.g. `goals-service/`) for the structure, csproj references, namespaces.
2. Add the four projects to `Aptiverse.Api.csproj` under a new `<Folder Name="/Modules/{Name}/">`.
3. Add 4 `<ProjectReference>`s to `api/Aptiverse.Api/Aptiverse.Api.csproj`.
4. Add the module's `AddApplicationServices` call (FQN!) and `AddDbContext<ApplicationDbContext>` call to `api/Aptiverse.Api/Modules/ModuleRegistrations.cs`.
5. Add `Frontend/Dtos/FrontendDtos.cs` to the new Application project.
6. Add a `{Name}FrontendController.cs` to `api/Aptiverse.Api/Controllers/Frontend/`. Keep the namespace pattern `Aptiverse.{Name}.Controllers` so multiple `FrontendController` classes don't collide.
7. `dotnet build Aptiverse.Api.csproj` to verify.
8. Update the matching frontend hook in `ui/src/lib/api/queries.ts`.

### Add a frontend route
Frontend pages go under `ui/src/app/`:
- `(marketing)/` — public, no auth
- `(auth)/` — login/register/etc., uses the auth split layout
- `(app)/{role}/` — authenticated dashboards. `dashboard/` = student, then `parent/`, `teacher/`, `school-admin/`, `tutor/`, `admin/`. The shared `(app)/layout.tsx` wraps all of them with `DashboardShell`.

For a new admin page: gate with `<PermissionGuard require="...">` from `ui/src/components/common/`.

### Change a database schema
EF Core migrations live per-module in `api/{x}-service/src/Aptiverse.{X}.Infrastructure/Migrations/`. Add a new migration via the host project:

```bash
cd api/Aptiverse.Api
dotnet ef migrations add MyMigration \
  --context Aptiverse.Goals.Infrastructure.Data.ApplicationDbContext \
  --project ../goals-service/src/Aptiverse.Goals.Infrastructure
```

Each module owns its own migration history table. They all share one Postgres connection via `DefaultConnection`.

### Run things

```bash
# Full stack (8 containers)
docker compose -f infrastructure/docker-compose.dev.yml up

# Just infra, run API natively (faster dev)
docker compose -f infrastructure/docker-compose.dev.yml up postgres redis -d
cd api/Aptiverse.Api && dotnet run

# UI
cd ui && npm run dev
```

API on 5100, UI on 3000. Scalar UI for API explorer at `http://localhost:5100/scalar/dev`.

## Code style

### .NET
- File-scoped or block namespaces — both are present, don't fight existing files.
- Records for DTOs (`public record FrontendXDto`).
- Constructor-based DI via primary constructors where possible.
- `[JsonPropertyName(...)]` is mandatory on all `Frontend*Dto` properties — the UI contract depends on camelCase.
- Don't add `[Authorize]` blanket on `FrontendController`s if the route is anonymous (e.g. FAQs). Default to `[Authorize]`, opt into `[AllowAnonymous]` per-action when needed.
- Prefer `IList<T>` / `IEnumerable<T>` for return types on the API surface, not concrete `List<T>`.

### TypeScript / React
- Use `Grid` (MUI v7), not `Grid2`. v7 renamed `Grid2` → `Grid`.
- Pages that pass functional `sx` (e.g. `(t) => linear-gradient(...)`) must be `"use client"` and cannot export `metadata`. Move metadata to a parent server layout if you need it.
- TanStack Query is the data layer. New API call → new `useX()` hook in `ui/src/lib/api/queries.ts`. Don't `fetch()` directly from components.
- Forms use `react-hook-form` + Zod resolver. Schemas live in `ui/src/lib/schemas.ts`.
- Keep components in `ui/src/components/common/` reusable (no domain references). Domain-specific components live next to the page that uses them.

## Things that have caused real bugs

- **MUI v6 → v7 migration**: `Grid2` rename, `legend` slotProps API removed from charts. If you see a "type 'row' is not assignable to type 'Direction'" error, that's the legend API breakage.
- **Next 16 + function `sx`**: prerender error like *"Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'"*. Fix: `"use client"` on the page.
- **`@mui/utils` subpath imports**: pinning MUI to a specific minor version matters. The csproj uses fixed versions for a reason.
- **AutoMapper 15.x has a high-severity vulnerability** flagged in nuget warnings. The current code depends on it; not yet upgraded.
- **MailKit / MimeKit / Newtonsoft.Json** also have advisories in nuget warnings. Address before production.
- **Per-service Infrastructure registrations clash on Redis health-check name** if all called naively — that's why the consolidated host registers Redis once and skips per-module `AddInfrastructureServices`.

## File ownership cheatsheet

When changing X, remember to also update Y:

| Change | Also update |
|---|---|
| Add a permission | `PermissionResolver.cs` + `ui/src/lib/rbac.ts` |
| Add a `/api/frontend/X` endpoint | Matching field in `ui/src/lib/mockData.ts` (or use the API directly via TanStack hook) |
| Add a module | `Aptiverse.Api.csproj`, `Aptiverse.Api.csproj`, `ModuleRegistrations.cs`, frontend `queries.ts` |
| Add a UI role | `nav-config.ts`, `RoleProvider.tsx`, `rbac.ts`, server `PermissionResolver.cs` |
| Add a Frontend DTO | The matching TS type in `ui/src/lib/mockData.ts` if the frontend reads it directly |

## What not to bother doing

- Don't write extensive unit tests for the seeded data in `Frontend*Controller`s — they're literal seed values. Tests come later when these wire to real services.
- Don't refactor `Aptiverse.Entitlements` to use `Aptiverse.Entitlements.*` namespaces (it currently uses the legacy `Aptiverse.Api.*` namespace). It's a known wart; renaming triggers EF migration regeneration. Leave it.
- Don't add Swagger annotations everywhere. Scalar reads from minimal metadata. Add only when a route needs explicit documentation.
