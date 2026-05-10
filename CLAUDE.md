# CLAUDE.md

Repo-wide guidance for AI assistants working in this codebase. **Stack-specific rules live with the stack** — read the matching component's `CLAUDE.md` before changing files there.

## Repo layout

This is a polyglot monorepo. Each top-level folder is independently buildable with its own toolchain:

| Path | Toolchain | Has its own CLAUDE.md |
|---|---|---|
| `api/Aptiverse.Api/` | .NET 10 / `dotnet` | ✅ [`api/Aptiverse.Api/CLAUDE.md`](api/Aptiverse.Api/CLAUDE.md) |
| `ui/` | Node / `npm` | (not yet) |
| `ai-service/` | Python / `pip` | (not yet) |
| `payment-gateway/` | Ruby / `bundle` | (not yet) |
| `event-architecture/` | Go / `go` | (not yet) |
| `notification-service/` | Go / `go` | (not yet) |
| `infrastructure/` | Terraform + Docker Compose | (not yet) |

When you're working in a folder that has a `CLAUDE.md`, read it first. The root file is for cross-cutting decisions only.

## Cross-cutting rules

These apply regardless of which component you're touching.

1. **Don't add a new top-level component folder** without explicit user direction. We collapsed 20 microservices into 7 components for a reason — adding more reverses that work.
2. **Don't add a new .NET host project.** There is exactly **one**: `api/Aptiverse.Api/Aptiverse.Api.csproj`. New domain code becomes a folder under `api/Aptiverse.Api/Modules/`, not a new project. The .NET-specific CLAUDE.md has the detail.
3. **Don't move `.slnx` / `.csproj` / `package.json` / `go.mod` / `Gemfile` / `requirements.txt` to the repo root.** Those are toolchain-specific and live with their toolchain. The root has only repo-wide files (`README.md`, `CLAUDE.md`, `.gitignore`).
4. **Each component's contracts should match the UI's expectations.** When the .NET API exposes `/api/frontend/*` shapes, those shapes line up with the TypeScript types in `ui/src/lib/mockData.ts`. Cross-component changes touch both sides.
5. **Permissions are duplicated by design — keep them in sync.** Server source of truth: `api/Aptiverse.Api/Modules/Auth/Aptiverse.Application/Auth/Services/PermissionResolver.cs`. Client mirror: `ui/src/lib/rbac.ts`. Adding a permission means editing both.
6. **Don't write new docs at the root** unless they apply to every component. README scope creep is how repo roots become unreadable. If something's only relevant to the .NET API, it goes in `api/Aptiverse.Api/`.

## Where things live

| Concern | File / folder |
|---|---|
| Repo overview | [`README.md`](README.md) |
| Repo-wide AI guidance | This file |
| .NET API architecture, RBAC, modules | [`api/Aptiverse.Api/README.md`](api/Aptiverse.Api/README.md) |
| .NET API code conventions, gotchas | [`api/Aptiverse.Api/CLAUDE.md`](api/Aptiverse.Api/CLAUDE.md) |
| Local-dev compose stack | `infrastructure/docker-compose.dev.yml` + `docker-compose.override.yml` |
| AWS infra (Terraform) | `infrastructure/terraform/` |
| Env var template | `infrastructure/.env.example` |

## Local stack

For native dev: Postgres + Redis in Docker, .NET API + UI run on the host. See `README.md` for commands. The override file (`infrastructure/docker-compose.override.yml`) re-exposes Postgres/Redis to localhost since the base compose file strips host ports for production safety.

## Don't pretend

- If a refactor is bigger than expected, **say so up front** rather than producing a broken build that takes longer to fix than the original work.
- If a tool-call result looks suspicious (powershell reflection returning fewer types than expected, etc.), **investigate**, don't just claim success.
- If something is irreversible (nuking EF migration history, dropping a database, force-pushing) **confirm the user is OK with it before doing it**, not after.

## Style across components

| Component | Style |
|---|---|
| .NET | Records for DTOs, primary constructors, `[JsonPropertyName]` on Frontend DTOs (camelCase contract). Nullable enabled. ImplicitUsings on. |
| TypeScript | MUI `Grid` (v7), TanStack Query for data, react-hook-form + Zod for forms, Roboto font. Match Euphoria.v4 typographic conventions. |
| Python | FastAPI, Pydantic, type hints. CPU-only PyTorch. |
| Ruby | Rails 8 conventions, Stripe official SDK, webhook signature verification mandatory. |
| Go | Standard project layout, structured logging via zap, Prometheus metrics. |

## Things that have actually broken in this repo

Documented because they tend to recur:

- **Per-service .NET hosts** — every time someone adds one, it reintroduces the 60-csproj problem we worked hard to remove.
- **Reintroducing kebab-case folder names** under `Modules/` after PascalCase was set.
- **Stale build artifacts** — when bin/obj from old structures linger, builds report success but produce stale assemblies. `find . -name 'bin' -o -name 'obj' -delete` if anything seems wrong.
- **MUI v6 `Grid2` references** after the v7 rename to `Grid`.
- **EF migrations from before the unification** — those module-specific migrations are gone. Don't try to roll back to them; regenerate forward.
