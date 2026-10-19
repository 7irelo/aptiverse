# Aptiverse Rebuild Plan

Status: draft for review, 2026-10-16 (revised against the current tree)
Scope: rebuild web, api and infra from scratch on a foundation that can scale, then migrate existing users and data across.

This plan is based on a survey of the code that is actually in the current tree (`api/`, `web/`, `infra/`), not the older working copy the first draft was written from. Every concrete claim in section 1 was re-checked against that code, with file paths given so it can be verified. It also builds on decisions already made in earlier rebuild work (Graphite & Citron theme, OS-only colour scheme, onboarding split from signup, study-unit model, practice-test integrity rules, no bursaries, no marketplace).

The Python `ai/` service, the root `fonts/` folder, the root `.github` workflows, `DESIGN_BRIEF.md` and `ENTERPRISE_SWEEP.md` have been deleted on purpose. Nothing in this plan treats them as existing code. Python analytics remains a future-phase idea only (Phase 12).

---

## 1. Where we are today (honest summary)

The product idea is good, and the domain is now well mapped: 47 migrations describe 124 tables across 23 schemas. Several features have matured since the first draft (an affiliate programme with a commission ledger, career and admission targets with a gap engine, an admin Paystack cockpit, an audit trail, versioned POPIA consent records). Some earlier security findings have also been fixed. The problems that remain are structural, not about the choice of language or framework. That is why this plan keeps C# and TypeScript and changes how they are used.

### What went wrong, and what replaces it

| Area | Current state (verified) | Why it hurts | Rebuild answer |
|---|---|---|---|
| API structure | One project (`api/Aptiverse.Api.csproj`). 23 module folders under `api/Modules/` (600 `.cs` files) laid out as if they were Domain, Core, Application and Infrastructure projects, but none of them is a project. Boilerplate is copied per module: 41 `*Repository*.cs` files, 26 `*RedisCacheService*.cs` files, and a private `CurrentUserId()` helper in 22 files. `FeatureFlags` and `Moderation` module folders are still present although their controllers were removed, and `/health` in `Program.cs` still lists them. `api/CLAUDE.md` describes 61 projects and four side services that do not exist. EF Core and Identity are on 9.x under a .NET 10 host, and AutoMapper is wired across 79 files. | You get the cost of layers without the benefit, and the docs mislead every new contributor (human or AI). | Real modules, each its own project, with compiler-enforced boundaries and architecture tests. |
| Business logic | 25 of 32 controllers inject `ApplicationDbContext` directly. The largest are `PaymentsController` (1,319 lines), `AcademicPlanningController` (1,128), `StudyGroupsController` (813), `AdminController` (810), `GoalsController` (798) and `AffiliatesAdminController` (669). Practice logic moved out of its controller into `PracticeService.cs` (826) and `PracticeTestGenerator.cs` (988), which is better but still large. | Untestable. Rules are duplicated, and one change ripples everywhere. | Vertical slices: one request, one validator, one handler per use case. Endpoints stay thin. |
| Validation and errors | Zero DataAnnotations attributes outside migrations. `Middleware/ValidationFilter.cs` only reads ModelState, so nothing is validated unless a controller hand-codes it (for example the length constants in `AdmissionTargetsController`). `Middleware/ExceptionHandlingFilter.cs` returns `ex.Message` to the client. Controllers return ad hoc `{ message, type }` objects. | Bad input reaches the DB, clients get inconsistent errors, and exception text leaks. | FluentValidation on every request. A global `IExceptionHandler` returns RFC 9457 ProblemDetails. |
| Auth | Partly fixed since the first draft: an anonymous `POST /api/auth/refresh` now exists, refresh tokens rotate and are stored SHA-256 hashed in Redis (`RedisTokenStorageService.cs`), and logout revokes the refresh token the client presents. Still broken: access tokens are HS256 with a 4-hour lifetime, and logout does not stop them because JwtBearer never checks the revocation store. Reused refresh tokens are rejected but trigger no family revocation. Lockout is configured (`Data/InfrastructureRegistrations.cs`) but bypassed, because `AuthService.LoginUserAsync` calls `CheckPasswordAsync`. Permissions are computed by `PermissionResolver` but enforced only through role strings (23 `[Authorize(Roles = ...)]` uses), and `[RequiresFeature]` is used by one controller. The web app uses next-auth v4, and its session callback hands the access token to browser JS (`web/src/lib/auth.ts`, `web/src/lib/api/token.ts`). | Real security holes: a stolen token works for hours after logout, and passwords can be brute-forced. | Short-lived access tokens, rotating hashed refresh tokens with reuse detection, policy-based permissions enforced in the API, and a BFF so the browser never holds tokens. |
| Security bugs | Insights SSE: now restricted to `Teacher,SchoolAdmin,Admin,Superuser`, but any teacher or school admin still streams the platform-wide audit trail with no school scoping, and each connection polls the DB every 5 seconds (`Controllers/InsightsController.cs`). The global rate limiter partitions by tier name, not by user, so all anonymous traffic (login, register, the Paystack webhook) shares one 100 requests/minute bucket and all signed-in users share another; no endpoint opts into a stricter policy (`Registrations.cs`). Forwarded headers are trusted from anyone (`Program.cs` clears `KnownNetworks` and `KnownProxies`), and the origin is reachable on port 80. `appsettings.json` carries a committed default `Jwt:Key` that is used whenever the environment variable is missing. No `.dockerignore` in `api/`, and the Dockerfile does `COPY . .`. Fixed since the first draft: sensitive data logging is now development-only. | Data leaks, spoofable client IPs, and an easy denial of service against login and payments. | A security checklist per phase, CodeQL, gitleaks, per-user rate limits, and secrets kept only in Secrets Manager. |
| Data model | One `ApplicationDbContext` holds 124 tables in 23 schemas, discovered by reflection (`assembly.GetTypes()` in `Data/ApplicationDbContext.cs`). `StudentId` is a `string` in 51 places and a `long` in 3 (`StudentParent`, `StudentTeacher`, `StudentAdmin`). Only 78 real FK constraints exist; about 50 user-id columns are plain strings with no constraint. | Broken joins, orphan rows, and modules that can never be pulled apart. | Guid v7 ids everywhere, one DbContext and schema per module, explicit configuration, and an FK-index test. |
| Background work | 9 polling BackgroundServices (email, calendar reminders, study-group reminders, assessment-due reminders, wellbeing check-ins, subscription schedule, practice generation, affiliate maintenance, outbox dispatcher). The email queue is an in-memory bounded `Channel` with `DropOldest` (`Data/Email/EmailQueue.cs`), so mail is lost on restart or overflow. An outbox exists (`Modules/Events`) and is drained, but nothing outside that module calls `IEventPublisher`. Refresh tokens live in Redis on the same box, so losing Redis signs everyone out. One good pattern: practice generation now runs from a DB-backed job table with claim semantics (`PracticeGenerationWorker.cs`). | Lost emails and lost events, plus wasted DB polling. | A durable message bus on Postgres (Wolverine): transactional outbox, scheduled messages, retries. |
| AI | Claude is called from .NET through a hand-rolled HTTP client (`Modules/AI/Aptiverse.AI.Infrastructure/AnthropicClient.cs`). `claude-opus-4-8` is hard-coded in 6 places in the Practice module, and the chat default is hard-coded too. Quota is pre-charged with no refund on failure (stated in comments in `Controllers/AiController.cs`). The tutor system prompt is built from a `StudentContext` the client sends. The separate Python service has been deleted. | Unmeasurable quality, cost surprises, and prompt input the user controls. | One AI module in .NET (Anthropic only): prompts as versioned files, config-driven models, structured output, quota with refund, server-built context, and an eval set. Python returns later for classical ML analytics only, once there is data. |
| Frontend rendering | 108 of 115 `page.tsx` files are `"use client"`. The other 7 are six catch-all 404 pages and `pricing`. 243 files in `web/src` are client components. MUI and Emotion force this. There are 3,320 inline `sx` props, and `@mui/icons-material` is still imported in 74 files alongside Lucide. `PracticeRunner.tsx` is 1,620 lines. | Slow on mobile (most of our users), hard to restyle, and the Lucide-only rule is not met. | Server Components by default. Tailwind v4 with shadcn/ui and Radix, design tokens as CSS variables, and Lucide only. |
| Frontend data | `web/src/lib/api/queries.ts` is 2,919 lines of hand-typed DTOs and hooks, plus `affiliates.ts` (422) and `targets.ts` (223). There are two HTTP clients (`fetcher.ts` and the axios `client.ts`). `mockData.ts` no longer holds fake rows but is a 572-line type file imported by 43 files and still acts as the "contract". `rbac.ts` is hand-synced with the server. | Types drift from the API without anyone noticing. | Types and TanStack Query hooks generated from the API's OpenAPI document. A CI check fails on drift. |
| Fake data | Improved: the admin system and users pages no longer invent data, and the contact form now saves the enquiry and emails it (`Controllers/ContactController.cs`). Still fake: `Math.random` drives charts or numbers in `parent/wellbeing`, `school-admin/students`, `teacher/students` and `teacher/live`. | Breaks trust, and breaks the "real data only" rule in `web/PRODUCT.md`. | Rule: a page ships only when it is backed by a real endpoint. Otherwise it does not ship. |
| Route protection | `web/src/middleware.ts` only matches `/login`. The `(app)` layout is a client component, and roles come from a persisted zustand store (`providers/RoleProvider.tsx`) that defaults to `student`. | Anyone can load any page shell. | Next 16 `proxy.ts` checks the session server-side. Roles and permissions come from the session only. |
| Tests | No unit or integration tests in `api/`. `web/tests/e2e` has a Playwright BDD suite (14 feature files, per-role setup, 33 files in all), but it runs desktop Chrome only, needs an SSH tunnel to the dev RDS, and no CI runs it. | Every change is a gamble. | A test pyramid: unit, integration (Testcontainers Postgres), contract, and E2E against an ephemeral stack. |
| Infra | One t3.micro EC2 runs the API and Redis via compose. RDS is Postgres 16 on db.t3.micro. Fixed since the first draft: backups are on with 1-day retention (the free-plan ceiling), plus deletion protection and a final snapshot (`infra/terraform/envs/dev/main.tf`). Still open: the SSH and HTTP security-group variables default to `0.0.0.0/0`, Cloudflare runs in Flexible mode (plain HTTP to origin, per the comment in `Program.cs`), the Terraform state lock still uses a DynamoDB table, the dev stack writes `aptiverse-dev.pem` to disk, and there is no staging. | One bad day still risks data, and one day of PITR is a small window. | ECS Fargate behind an ALB, RDS with longer PITR and deletion protection, GitHub OIDC (no SSH), and dev/staging/prod environments. |
| Deploy and CI | Only `api/.github/workflows/deploy.yml` exists. It builds, pushes `:latest` plus a short sha to GHCR, then deploys over SSH. The old GHCR-login failure is fixed, scripts use `set -euo pipefail`, and a `/health` check now gates success. Still open: no tests, lint or migration step (nothing in the code runs migrations, so they are applied by hand), the box always runs `:latest`, and the workflow writes its own inline compose file that has drifted from `infra/compose.prod.yml`. That inline file has no `assessment_uploads` volume and no `AssessmentUploads__RootPath`, so student SBA uploads, stored on local disk by `LocalDiskAssessmentUploadStorage`, are destroyed on every deploy. `web/` and `infra/` have no CI at all. | Broken code reaches main, and coursework is silently lost. | Gated pipelines with immutable image tags, a migration bundle job, automatic rollback, S3 uploads, and Renovate. |
| Secrets | The current tree is clean: only `.env.example` files are committed, and `.gitignore` covers `.env` and `*.pem`. Remaining risks: production secrets are copied from GitHub secrets into `/opt/aptiverse/.env` on the box on every deploy; the SES Terraform stack has no remote backend, so its local state holds the IAM SMTP secret; the committed default `Jwt:Key`; and plaintext keys that existed in older working copies (AWS access key CSV, `api/.env`, `ai/.env`, the SES tfstate, the EC2 `.pem`). | Leak risk. Any of these could be live credentials. | Rotate everything in Phase 0. Use AWS Secrets Manager, and the app fails to boot if a secret is missing. |
| Repos | The code is moving from the personal monorepo `7irelo/aptiverse` (still the `origin` of this tree) to three org repos: `aptiverse-labs/api`, `aptiverse-labs/web` and `aptiverse-labs/infra`. Some config is already duplicated across them (the compose drift above). | Contract and config changes need coordinated PRs in several repos. | A clear contract-publishing flow between repos (section 2, decision 1), with a monorepo kept as an option. |

### What we keep (ideas or code worth porting)

- **Domain knowledge:** the 47 migrations, the CAPS curriculum catalog (`CurriculumCatalogSeeder.cs`), the SBA programmes and exemplars data (`web/src/lib/data/`), the education-level taxonomy, and the study-unit model.
- **API patterns:**
  - `AuditableEntityInterceptor` (UTC timestamps, soft-delete), enums stored as strings, `xmin` concurrency, and the `UtcDateTimeConverter` lesson (date inputs arriving without an offset).
  - snake_case naming with one schema per module.
  - The Paystack HMAC-SHA512 webhook verification, idempotency on the Paystack reference, and the plan syncer idea (moved off boot).
  - The entitlements model (Plan, PlanFeature, PlanQuota, FeatureUsage, UsageMeter) and the `RequiresFeature` idea.
  - The `IAssessmentUploadStorage` abstraction and its traversal guard (with an S3 implementation this time).
  - `PermissionResolver`'s role-to-permission map, as the seed for real policies, and the self-signup role allowlist in `AuthService`.
  - `IAuditTrail` (`Services/Audit/AuditTrail.cs`), including auditing failed attempts on sensitive admin actions such as refunds.
  - Versioned legal consent rows (`identity.user_consents` with `Legal:TermsVersion` and `Legal:PrivacyVersion`).
  - The DB-backed practice generation job table with claim semantics.
  - The affiliate domain rules: referral attribution, commission entries with an event history, holds and releases, payout batches with items, payment fingerprints and fraud signals, and tax-year statements (`Modules/Affiliates`).
  - Projection-based `AsNoTracking` reads with ownership checks.
- **Web:**
  - The Graphite & Citron token values and the Frygia font (subject to a licence, see risks).
  - The `queryKeys` factory pattern, and the fetch-based SSE reader.
  - KaTeX `MathText` plus the ASCII-math bridge, and the MathLive editor.
  - The logic inside `PracticeRunner` (integrity rules), the `features.ts` keys, the server-driven navigation idea, and the BDD per-role E2E structure.
  - The career gap engine `web/src/lib/targets/reach.ts` (pure, evidence-only arithmetic) and its surfaces (`components/career/`), `AssessmentLifecycle`, `MasteryCharts` and the admin `UserDetailDrawer` as UX references.
  - Consent-gated analytics (`lib/analytics/consent.ts`) (the Meta pixel and Conversions API pairing is deferred until after launch, decision 8).
  - The marketing briefs in `web/marketing/` (launch brief, campaign strategy, claims ledger, affiliate notes) as input to copy and claims review. They are documents, not app code.
- **Product rules:** practice-test integrity, the onboarding split, OS-only colour scheme, mobile-first, real data only, de-gamified progress, no emojis, no em dashes, Lucide icons.

### What we drop

- The marketplace module (courses, lessons, resources, downloads, 13 tables), course selling, and bookings-with-fee (`Modules/Marketplace`, `Modules/Booking`).
- Bursaries (permanently).
- The `ads/scenes` and `ads/units` pages from the production app. Ad creative moves to a separate tool.
- The leftover `FeatureFlags` and `Moderation` module folders, which no controller uses any more.
- OpenAI, and the deleted Python `ai/` service.
- AutoMapper (v15 is commercially licensed, and hand-written mapping in handlers is clearer).
- The zustand role store.
- `mockData.ts` as a type source.
- All placeholder or random data.
- The DynamoDB lock table (S3 native locking replaces it).
- Redis as the store of record for refresh tokens.

---

## 2. Decisions to lock in Phase 0

These are the choices that are expensive to change later. Each gets a short ADR (Architecture Decision Record) in `docs/adr/` in the api repo (or a shared docs location). My recommendation is listed first.

1. **Repository layout.**
   - **Current state:** the code is moving to three private org repos, `aptiverse-labs/api`, `aptiverse-labs/web` and `aptiverse-labs/infra`, replacing the personal `7irelo/aptiverse` monorepo. This plan assumes those three repos unless you choose otherwise.
   - **Recommend: keep the three org repos, with an explicit contract flow.**
     - api CI generates `openapi.json` on every merge and publishes it as a versioned artifact (a GitHub release asset or a package).
     - web has a `npm run api:sync` script that pulls a pinned spec version and regenerates the client. A bot PR opens in web whenever api publishes a new spec, and web CI fails if the committed client does not match the pinned spec.
     - infra owns every deploy definition (task definitions, compose for local dev). api and web never carry their own copy, which removes the drift that currently loses uploads.
     - Analytics, when it arrives, becomes a fourth repo (`aptiverse-labs/analytics`).
   - **Option: one private monorepo** (`aptiverse-labs/platform`) with `apps/web`, `apps/api`, `infra` and `docs`. One PR could change the API, the regenerated client and the UI together, and contract drift is checked in one place. This is still the lower-friction choice for a small team. If you pick it, do it in Phase 0, before any rebuild code exists, so you do not move history twice.
2. **Product scope for v1.**
   - Recommend: Student (high school and university) plus Parent plus lean Admin. `web/PRODUCT.md` names students as the primary user.
   - Decide explicitly where the affiliate programme sits. It is live code with a ledger and payouts, so if it has real affiliates it belongs in v1 (Phase 6); otherwise it moves to Phase 12.
   - Tutor (the jobs board with connects), Teacher and School are later phases, built on the same foundations. The current teacher and school-admin pages still show random data and should be hidden in the live app now.
3. **Backend: stay on .NET 10.**
   - A modular monolith with real module projects, on EF Core 10 and Identity 10 (the current code is on 9.x).
   - Minimal APIs grouped per module, using TypedResults so the OpenAPI document is accurate.
   - Wolverine for in-process handlers, the durable outbox and scheduled jobs. Alternatives are plain services plus Hangfire. MediatR is now commercially licensed, so avoid it.
4. **Frontend: stay on Next.js 16 and React 19, and move UI to Tailwind v4 + shadcn/ui (Radix) + Lucide.**
   - Main reason: Emotion and MUI push every page into client components, which hurts mobile performance.
   - Tokens as CSS variables also make the OS-following dark mode work with zero JS.
   - Alternative: stay on MUI v7 with a strict client/server split. Cheaper short-term, worse long-term.
5. **API contract: generated, never hand-written.**
   - ASP.NET Core build-time OpenAPI generation (`Microsoft.AspNetCore.OpenApi`, already referenced) produces the spec. Drop the duplicate Swashbuckle ReDoc and keep one docs UI.
   - Orval turns it into TanStack Query hooks and zod schemas in the web app.
   - CI regenerates and fails if the result differs from what is committed (across repos, via the pinned spec in decision 1).
6. **Auth model: hardened "Pattern B" plus a BFF.**
   - .NET owns users (ASP.NET Core Identity), issues 15-minute ES256 access tokens and publishes a JWKS endpoint.
   - Refresh tokens rotate, are stored hashed in Postgres, and use family revocation on reuse.
   - Next.js (Auth.js v5, replacing next-auth v4) keeps both tokens in an encrypted httpOnly session cookie. Server Components call the API server-to-server.
   - Client-side mutations go through a thin Next route-handler proxy, so the browser never sees a token.
7. **IDs:** Guid v7 (`Guid.CreateVersion7()`) for every entity, including users. They sort by time, are safe to expose, and need no int/string confusion.
8. **Hosting:**
   - Web stays on Vercel, pinned to the Cape Town region (`cpt1`).
   - API, worker and DB go on AWS af-south-1, for POPIA data residency and latency.
   - Email goes through SES eu-west-1 using the SESv2 API rather than SMTP (the current code sends over SMTP with MailKit).
   - Inbound mail stays on Zoho.
   - Cloudflare handles DNS, WAF and TLS, in Full (strict) mode rather than today's Flexible mode.
9. **Compute:** ECS Fargate (ARM64/Graviton) behind an ALB. One container image, run in two roles: `api` and `worker`.
   - Avoid NAT Gateway cost in dev by using public subnets with security groups locked to the ALB and VPC endpoints.
   - Use private subnets plus NAT in prod.
10. **AI:** Anthropic only, called from the .NET AI module through the official Anthropic SDK.
    - Model ids come from config.
    - Never send `temperature` to newer models.
    - Python analytics (BKT mastery, gap clustering, at-risk) returns in a late phase, consuming events from a durable queue (SQS) and never answering user requests directly.
11. **Observability:**
    - OpenTelemetry (traces, metrics, logs) from the API and worker, exported to Grafana Cloud (free tier is enough to start).
    - Sentry for errors in both web and API.
    - Vercel Analytics (already installed) plus Speed Insights for real-user mobile vitals.
12. **Data migration strategy:**
    - A clean new schema plus an ETL that maps old ids and types to the new model.
    - Rehearsed repeatedly against a restored snapshot.
    - Then a single planned cutover (Phase 11).
    - No dual-writing, which is not worth it at our size.

---

## 3. Target architecture

### 3.1 System overview

```
                 Cloudflare (DNS, WAF, TLS Full strict, rate limits)
                   |                         |
        app.aptiverse.co.za          api.aptiverse.co.za
                   |                         |
           Vercel (Next.js 16)        AWS ALB (af-south-1, Cloudflare IPs only)
           RSC + BFF proxy                   |
                   |  server-to-server  ECS Fargate
                   +-------------------> [api]  x2+      [worker] x1+
                                            |   \           |
                                            |    \__ Wolverine outbox / jobs (Postgres)
                                            |
                          RDS Postgres 17 (PITR, Multi-AZ in prod)
                          S3 (uploads, exports)    Secrets Manager
                          SES eu-west-1 (email)    Anthropic API
                          Paystack                 Meta CAPI (after launch)
                          SQS -> analytics worker (Python, later phase)
```

### 3.2 Backend layout (.NET 10)

```
aptiverse-labs/api (repo root)
  Aptiverse.sln
  Directory.Build.props          # nullable, warnings-as-errors, analyzers, central package mgmt
  Directory.Packages.props
  src/
    Aptiverse.Host/              # Program.cs, composition, auth, OpenAPI, OTel, health
    Aptiverse.Worker/            # same modules, runs Wolverine listeners + scheduled jobs
    Aptiverse.SharedKernel/      # Entity base, Result/Error, IClock, Guid v7, paging, ProblemDetails mapping
    Modules/
      Identity/                  # users, sessions, refresh tokens, roles, permissions, onboarding, consents
        Aptiverse.Identity/            # internal implementation
        Aptiverse.Identity.Contracts/  # public: integration events, query interfaces
      Academics/                 # curricula, CAPS catalog, subjects + courses (study units), enrolment, assessments, calendar, admission targets
      Practice/                  # tests, questions, attempts, grading, integrity, generation jobs
      AiTutor/                   # Anthropic client, prompts, conversations, quotas, evals
      Billing/                   # plans, Paystack, subscriptions, webhook inbox, entitlements, reconciliation
      Affiliates/                # referrals, attribution, commission ledger, holds, payouts, fraud signals, tax statements
      Progress/                  # goals, milestones, points, mastery projections
      Wellbeing/                 # diary, mood
      Family/                    # parent-student links, invites, overviews
      Notifications/             # in-app + email (SES), preferences, templates
      Support/                   # tickets, FAQs, contact enquiries, school enquiries
      Admin/                     # admin read models, audit, impersonation, Paystack cockpit
  tests/
    Aptiverse.ArchitectureTests/ # module boundaries, no cross-module internals, FK index rule
    Aptiverse.{Module}.UnitTests/
    Aptiverse.IntegrationTests/  # WebApplicationFactory + Testcontainers Postgres
```

**Module rules (enforced by tests, not by convention):**

- Everything in a module is `internal` except its `Contracts` project and its endpoint registration extension.
- A module can only reference another module's `Contracts`. It never touches another module's DbContext or tables.
- Each module has its own `DbContext`, Postgres schema and migrations history table. Cross-module data moves by id references plus integration events, or a query interface in `Contracts`.
  - This is what makes it possible later to pull a module out into its own service without a rewrite.
  - Example: Affiliates never reads billing tables. It reacts to `PaymentSucceeded`, `SubscriptionRenewed` and `RefundIssued` events from Billing and keeps its own ledger.
- Inside a module, organise by feature (vertical slice):

```
Practice/Features/GenerateTest/
  GenerateTestEndpoint.cs     # maps POST /practice/tests/generate, auth policy, feature gate
  GenerateTestRequest.cs      # request + response records
  GenerateTestValidator.cs    # FluentValidation
  GenerateTestHandler.cs      # the actual use case
```

**Cross-cutting building blocks:**

- **Errors:**
  - Handlers return `Result<T>` for expected failures, such as not found, forbidden, conflict or validation.
  - One `IExceptionHandler` maps unexpected exceptions to ProblemDetails with a trace id and never a raw message.
- **Validation:** an endpoint filter runs the FluentValidation validator for every request type. CI fails if a request type has no validator.
- **AuthZ:**
  - Permissions are constants such as `Permissions.Practice.Generate`.
  - Policies are registered from them, and endpoints call `.RequirePermission(...)` and `.RequireFeature(...)`.
  - Ownership and scoping checks live in the handler (for example, a teacher only sees activity for their own school).
  - The web app gets the permission list from the session (`/me`), so there is no hand-synced `rbac.ts`.
- **Persistence:**
  - EF Core 10 with Npgsql and explicit `IEntityTypeConfiguration` per entity (no reflection discovery).
  - Soft-delete, `xmin` concurrency and the audit interceptor.
  - `IClock` instead of `DateTime.Now`.
  - An architecture test asserts every FK has an index and every user reference is a real FK within its module.
- **Messaging:**
  - Wolverine with its Postgres persistence.
  - Commands and integration events go through a transactional outbox, so a DB write and its event commit together.
  - Scheduled jobs (reminders, subscription renewals, affiliate hold releases, digest emails) are scheduled messages, not polling loops.
- **Resilience:** `Microsoft.Extensions.Http.Resilience` (Polly v8) on Paystack, Anthropic and SES clients, with timeouts, retries and a circuit breaker.
- **Caching:** `HybridCache` (in-memory L1). Add Valkey/Redis as L2 only when more than one API instance needs a shared cache.
- **Rate limiting:**
  - Cloudflare rules at the edge.
  - ASP.NET rate limiter per endpoint group (auth, AI, uploads, webhooks), with partitions keyed by user id or client IP, never by a shared tier name. The Paystack webhook gets its own partition so user traffic can never starve it.
- **Config:** strongly typed options with `ValidateOnStart()`. Missing secrets fail the boot, with no committed defaults.
- **Health:** `/health/live` (process) and `/health/ready` (DB, outbox), used by the ALB and ECS.
- **Uploads:**
  - S3 presigned PUT straight from the browser, with a size limit and content-type allowlist.
  - The server verifies magic bytes after upload.
  - Objects are private, and downloads use short-lived presigned GET.

### 3.3 Frontend layout (Next.js 16)

```
aptiverse-labs/web (repo root)
  src/
    app/
      (marketing)/          # static / SSG, zero client JS where possible (incl. affiliates landing)
      (auth)/               # login, register, verify, reset
      (app)/                # authenticated; layout is a Server Component
        onboarding/
        dashboard/ ...      # student (incl. career targets)
        parent/ ...
        refer/ ...          # affiliate area: earnings, payouts, payout details, tax
        admin/ ...
      api/bff/[...path]/    # thin authenticated proxy for client mutations
      proxy.ts              # Next 16 request proxy: session check + role routing
    features/               # one folder per domain, mirrors API modules
      practice/
        components/         # PracticeRunner split into views: Instructions, Question, Review, Results, Completed
        hooks/              # timer, focus monitor, autosave
        server/             # server-side data loaders for RSC
      career/               # reach engine (ported from lib/targets/reach.ts), target dialog, what-if
      affiliates/ goals/ academics/ billing/ ...
    components/ui/          # shadcn/ui primitives (owned code)
    components/shell/       # app shell, server-driven nav, page states, upgrade gate
    lib/api/generated/      # Orval output: types, zod schemas, query hooks (never edited by hand)
    lib/auth/               # Auth.js config, session helpers
    lib/analytics/          # consent-gated analytics (Vercel; Meta after launch)
    styles/tokens.css       # Graphite & Citron as CSS variables, light + dark via prefers-color-scheme
```

**Rules:**

- **Rendering:**
  - Server Components by default.
  - `"use client"` only on interactive leaves, such as the runner, editors, charts and forms.
  - Each route segment gets `loading.tsx`, `error.tsx` and `not-found.tsx`.
- **Data:**
  - Server Components read data on the server with the session token.
  - Client components use generated TanStack Query hooks against the BFF proxy. One HTTP client only.
- **Forms:** react-hook-form with the zod schemas generated from OpenAPI, so client and server validation match.
- **Styling:** tokens only, with no hex literals outside `tokens.css` (lint rule). Citron is a surface accent and never low-contrast text.
- **Icons:** Lucide only (lint rule bans `@mui/icons-material`).
- **Copy:** no emojis, no em dashes. A lint rule scans strings.
- **Security headers:** a CSP, HSTS and frame-ancestors set in `next.config.ts` or `proxy.ts` (none are set today).
- **Mobile-first:**
  - Design and build at 360px first.
  - Playwright runs mobile projects (Pixel 7, iPhone 14) as the primary target.
  - Lighthouse CI budgets on the mobile profile: LCP under 2.5s, JS per route under 150 KB gzip.
- **Accessibility:**
  - Radix primitives give keyboard and ARIA behaviour by default.
  - `@axe-core/playwright` runs in E2E.
  - Every clickable element is a real button or link.
- **Libraries:**
  - Math: KaTeX (`MathText` ported), MathLive for input.
  - Charts: Recharts via the shadcn chart wrapper, with mode-aware token colours.
  - Dates: date-fns plus react-day-picker.

### 3.4 Data model principles

- **Ids and money:**
  - Guid v7 primary keys, and `user_id uuid` everywhere.
  - Money as integer minor units (cents) plus a currency code. This matters most for billing and the affiliate ledger.
- **Time:** `timestamptz` only, stored in UTC, displayed in `Africa/Johannesburg` unless the user setting differs.
- **Structure:**
  - Each module owns a schema: `identity`, `academics`, `practice`, `ai`, `billing`, `affiliates`, `progress`, `wellbeing`, `family`, `notifications`, `support`, `admin`.
  - No cross-schema FKs. Within a module, FKs are real constraints with indexes.
  - Enums are stored as strings with a check constraint. Arrays and JSON use `jsonb` only where the shape is truly free-form, such as AI generation payloads.
- **Rows:**
  - Every table gets `created_at`, `updated_at`, `deleted_at` (soft delete where it makes sense) and `xmin` concurrency.
  - Ledgers (commissions, points, usage) are append-only: corrections are new reversing rows, never edits.
- **Study units:**
  - `academics.study_units` is one table with `kind` = `caps_subject` | `tertiary_course`.
  - Enrolment gates check one path, which fixes the "tertiary students rejected" class of bug at the model level.
  - Each study unit stores its academic level (grade or year of study), and AI generation reads it. This fixes the "uni student got high-school questions" problem.
- **Admission targets:** `academics.admission_targets` and their requirement rows store only what the student entered. Standing is computed from measured marks, and "no evidence" stays null rather than zero.
- **Billing:** a `billing.paystack_events` inbox table with a unique Paystack event id, so every webhook is processed exactly once (today idempotency rests on the transaction reference only).
- **Consent:** `identity.user_consents` keeps the document version, timestamp, source, IP and user agent, as today.
- **Jobs:** `wolverine.*` tables for the outbox and scheduled messages.

### 3.5 AI design

- **Placement:** one `AiTutor` module behind interfaces: `IQuestionGenerator`, `ITutorChat` and `IGrader` (the current code already marks exams with Claude).
- **Prompts:**
  - Prompts are versioned files (`Prompts/practice-generate.v3.md`) loaded at startup.
  - Each generation stores its prompt version and model id.
- **Output:**
  - Structured output via tool use with a JSON schema, validated before saving.
  - LaTeX is used for math. Invalid output is retried once and then fails cleanly.
- **Difficulty:** scales to the study unit's level, and the curriculum and topic registry feed the prompt.
- **Tutor chat:**
  - Streams over SSE through the BFF.
  - Bounded history: last N turns plus a running summary, with character limits.
  - The student context is built server-side and never accepted from the client (today it is).
  - Standard and deep modes stay, as separate quota keys, with models from config.
- **Quotas:**
  - Reserve, then confirm or refund, through `UsageMeter`, inside a transaction.
  - Quota state is in Postgres, so it fails closed.
- **Practice-test integrity:** the tutor is disabled server-side for the duration of an active attempt, not just hidden in the UI.
- **Generation jobs:** keep the job-table approach, moved onto Wolverine messages with retries.
- **Prompt caching:** used on the large stable system prompts and curriculum blocks to cut cost.
- **Evals:**
  - A golden set of about 50 inputs per level (Grade 8, Grade 12, first-year uni, and so on), with assertions on schema, level-appropriateness and math rendering.
  - Runs in CI on prompt changes, plus a nightly run against the real model.

### 3.6 Infrastructure (Terraform)

```
aptiverse-labs/infra (repo root)
  modules/
    network/        # VPC, subnets, VPC endpoints (S3, ECR, Secrets Manager, logs)
    database/       # RDS Postgres 17, parameter group, backups, alarms
    service/        # ECS service + task def + autoscaling + log group (used for api and worker)
    alb/            # ALB, target groups, Cloudflare-only ingress, ACM cert
    storage/        # S3 buckets (uploads, exports), lifecycle rules, CORS for presigned PUT
    ecr/  secrets/  ses/  github-oidc/  monitoring/  dns/ (Cloudflare provider)
  envs/
    dev/  staging/  prod/      # each: backend.hcl (S3 native locking), terraform.tfvars, main.tf composing modules
  bootstrap/                   # state bucket only (drop the DynamoDB table)
  local/                       # compose for local dev only (Postgres, Mailpit, MinIO)
```

**Rules:**

- **Database protection:** RDS has `backup_retention_period` 7 days in dev and 30 in prod, PITR, `deletion_protection = true`, a final snapshot, encryption, Performance Insights, and Multi-AZ in prod. This needs the account off the free plan, which currently caps retention at 1 day.
- **Access:**
  - No SSH anywhere. If shell access is ever needed, use ECS Exec or SSM Session Manager.
  - DB access for humans goes through an SSM port-forward, which retires the bastion and the `.pem`.
- **Network:** the ALB only accepts Cloudflare IP ranges, and Cloudflare uses TLS "Full (strict)" with an ACM cert on the ALB.
- **Secrets and CI access:**
  - All secrets live in Secrets Manager and are injected into tasks by ARN. No `.env` file on any host.
  - Terraform never outputs a secret value, and every stack (including SES) uses remote state.
  - GitHub Actions in each repo assumes an IAM role through OIDC, scoped per environment, with no long-lived keys.
- **Single source of deploy truth:** task definitions live here only. The api repo's pipeline only builds and pushes an image and asks infra to roll it out.
- **SES:** the stack moves into S3 remote state and drops the IAM SMTP user; the task role calls SESv2 directly.
- **Later:** AWS Organizations with separate accounts for prod and non-prod. Prepare for it now by keeping everything parameterised per environment.

**Rough cost guide (af-south-1, verify with the AWS calculator before committing):**

- **Dev:**
  - Fargate api and worker (0.25 vCPU / 0.5 GB each, ARM): about $20.
  - ALB: about $20.
  - RDS db.t4g.micro: about $20.
  - S3, CloudWatch and secrets: about $10.
  - Total: roughly $70/month. You can shut it down at night, or skip the ALB in dev by using Cloudflare Tunnel.
- **Prod:** roughly $250 to $400/month to start, mostly Multi-AZ RDS, NAT and two or more API tasks.

### 3.7 Environments and delivery

| Env | Web | API | DB | Deploys |
|---|---|---|---|---|
| local | `next dev` | `dotnet run` or `docker compose` | compose: Postgres 17, Mailpit (email), MinIO or LocalStack (S3) | n/a |
| preview | Vercel preview per PR | dev API | dev RDS | every web PR |
| dev | dev.aptiverse.co.za | ECS dev | RDS dev | every merge to main |
| staging | staging.aptiverse.co.za | ECS staging | RDS staging (anonymised prod copy) | every merge to main, after dev passes |
| prod | aptiverse.co.za | ECS prod | RDS prod | git tag + manual approval |

**API pipeline (GitHub Actions in `aptiverse-labs/api`):**

1. Restore with a locked NuGet cache.
2. `dotnet format --verify-no-changes`, then build with analyzers and warnings-as-errors.
3. Run unit, architecture and integration tests (Testcontainers Postgres), and collect coverage.
4. Generate the OpenAPI document and diff it against main. Breaking changes need a label. Publish the spec as a versioned artifact for the web repo.
5. Run `dotnet ef migrations bundle` per module, and check for pending model changes.
6. Build the image (multi-stage, chiselled or distroless base, non-root user, `.dockerignore`). Scan with Trivy and push to ECR tagged with the git sha (never `:latest`).
7. Deploy:
   - Run the migration bundle as a one-off ECS task.
   - Then do an ECS rolling deploy with the deployment circuit breaker and automatic rollback.
   - Then smoke-test `/health/ready` and one authenticated call (the current `/health` gate is a good start to keep).

**Web pipeline (`aptiverse-labs/web`):**

- Lint (the ESLint flat config exists but nothing runs it in CI), typecheck, Vitest, and Orval regenerate-and-diff against the pinned API spec.
- Playwright E2E against an ephemeral compose stack (API image plus seeded Postgres), with mobile projects first and axe checks. No SSH tunnel.
- Lighthouse CI on mobile, then the Vercel deploy.

**Infra pipeline (`aptiverse-labs/infra`):** `terraform fmt -check`, `validate`, `tflint` and `trivy config` on every PR. `plan` is posted as a PR comment. `apply` runs on merge, with an approval gate for prod.

**Every repo:**

- Renovate for dependency updates.
- gitleaks pre-commit and in CI, plus CodeQL.
- Conventional commits enforced with commitlint.
- Branch protection on main.
- A shared reusable-workflow repo (or org-level workflow templates) so the three pipelines do not drift.

---

## 4. Phased plan

Estimates assume one developer working with Claude Code, full time. Treat them as rough and re-estimate at the end of each phase. Every phase ends with an exit gate. Do not start the next phase until the gate passes.

### Phase 0: Decide, secure, prepare (1 week)

**Goal:** stop the bleeding, lock decisions, and define v1 precisely.

**Secrets:**

1. Rotate every credential that has existed on disk or on the box:
   - AWS access keys (the access-key CSV from older working copies) and the SES SMTP IAM key.
   - The Paystack secret, Anthropic key, Google OAuth secret (and the Meta CAPI token if one exists; it is unused until after launch).
   - The OpenAI key, which you can simply revoke.
   - The JWT signing key, the RDS master password and the EC2 key pair.
2. Delete the plaintext copies, remove the committed default `Jwt:Key` from `appsettings.json`, and move the SES stack to remote state.

**Stabilise the live app (small fixes, not rebuild work):**

3. Fix the upload loss: make `deploy.yml` stop writing its own compose file and use `infra/compose.prod.yml` (with the `assessment_uploads` volume), or at least add the volume and `AssessmentUploads__RootPath` to the inline copy. Check whether any uploads survived.
4. Pass `lockoutOnFailure` (use `SignInManager.CheckPasswordSignInAsync`) in `AuthService.LoginUserAsync`.
5. Re-key the global rate limiter by user id or client IP, give the Paystack webhook its own partition, and add a strict policy on login and register.
6. Scope the Insights live-activity endpoints to admins until there is real school scoping, and stop returning `ex.Message` from `ExceptionHandlingFilter`.
7. Lock the EC2 security group to Cloudflare ranges (HTTP) and your IP (SSH), restrict forwarded headers to Cloudflare, and hide the teacher and school-admin pages that show random data.
8. Backups are already on at 1 day. Move the AWS account off the free plan and raise retention to 7 days, take a manual snapshot, and do one test restore.

**Decisions:**

9. Write the ADRs for section 2 and resolve the open decisions in section 7.

**Specs and inventories:**

10. Write a one-page spec per v1 feature: user story, acceptance criteria, mobile wireframe, endpoints, and permissions plus entitlements.
11. Produce an entity inventory from the 47 migrations (124 tables): old table to new module and schema, with id type changes noted. This becomes the ETL mapping in Phase 11.
12. Write a Paystack, affiliate and Anthropic inventory: plans, codes, webhooks used, live subscriptions, open commission holds and unpaid payouts, prompts in use.

**Repo:**

13. Finish the move to `aptiverse-labs/{api,web,infra}` (or create the monorepo if you choose it), with branch protection, Renovate, gitleaks, commitlint, CODEOWNERS and the PR template on each.
14. Write a fresh `CLAUDE.md` per repo that describes the **new** rules. The current `api/CLAUDE.md` is stale (61 projects, four services) and must not be copied.

**Exit gate:** decisions signed off, secrets rotated, live-app fixes deployed, a restore tested, v1 feature list frozen.

### Phase 1: Platform foundation, "walking skeleton" (2 to 3 weeks)

**Goal:** a trivial feature flows end to end through every layer and environment before any real feature is built.

**Infra:**

- Terraform modules plus the `dev` environment: network, RDS (with backups), ECR, ECS api and worker, ALB, S3, Secrets Manager, GitHub OIDC for all three repos, CloudWatch alarms, Cloudflare DNS.

**API skeleton:**

- Host, Worker and SharedKernel.
- One sample module (`Support` FAQs is a good candidate: simple, public read).
- ProblemDetails, validation filter, OpenTelemetry and Sentry, health checks, typed options with `ValidateOnStart`.
- Wolverine with the Postgres outbox, and the architecture test project.

**Web skeleton:**

- Next 16, Tailwind v4, shadcn/ui and the Graphite & Citron tokens (light and dark via OS).
- Orval wired to the published API spec, Sentry, Vercel project pinned to `cpt1`, and the `proxy.ts` placeholder.

**Local dev:**

- `docker compose up` gives Postgres, Mailpit and MinIO, plus seed data.
- One `make dev` or `just dev` command per repo. Document onboarding in `docs/dev-setup.md`.

**CI/CD:** the full pipelines from section 3.7, including spec publishing, the migration bundle task and auto rollback, proven by deliberately shipping a broken build and watching it roll back.

**Exit gate:**

- The FAQ page on dev.aptiverse.co.za is served by a Server Component.
- Its data comes from ECS, through the generated client, from RDS, with a migration applied by the pipeline.
- An API spec change opens a regenerate PR in the web repo automatically.
- The request shows up as a trace in Grafana and a test error shows in Sentry.
- A teammate could clone and run everything in under 15 minutes.

### Phase 2: Identity, accounts and notifications core (2 to 3 weeks)

**Goal:** secure accounts that everything else builds on.

**API:**

- Identity module:
  - Register, which asks only name, email, password and role (from a self-signup allowlist), records versioned consent, then auto-logs in.
  - Verify email, login with lockout, and requiring a verified email for sensitive actions.
  - Forgot and reset password, and Google OAuth (invite rules as today).
- Tokens:
  - Access tokens are ES256 with 15-minute expiry, and the API publishes JWKS.
  - Refresh tokens rotate, are hashed in `identity.refresh_tokens`, and support family revocation.
  - Logout really revokes.
  - Sessions list, so a user can sign out other devices.
- Roles and permissions:
  - Roles are `student`, `parent`, `affiliate` and `admin`, with tutor, teacher and school reserved.
  - Permission constants and policies.
  - `/me` returns the profile, roles, permissions and entitlements.
- Onboarding and settings:
  - Onboarding endpoints: education level (high school vs tertiary), grade or year, curriculum, school or institution.
  - Settings covers profile, password, notification preferences, and account deletion requests (POPIA).
- Notifications module (core): an SES email sender behind the outbox, templates (Scriban or MJML compiled), verification and reset emails, and an in-app notification table with read state.
- Audit log of security events (login, failed login, password change, impersonation later), ported from `IAuditTrail`. It is admin-readable only.

**Web:**

- Auth.js v5 BFF with the encrypted httpOnly session. `proxy.ts` protects `(app)` and routes by role.
- Auth pages, the onboarding flow and the settings pages, all mobile-first.

**Tests:** integration tests for every auth path, including refresh reuse detection, lockout, expired tokens, rate limits and cross-user access attempts.

**Exit gate:**

- An OWASP ASVS Level 1 checklist for auth passes.
- No token is reachable from browser JS (verified in devtools).
- Emails arrive via SES in staging.

### Phase 3: Design system and app shell (2 weeks, can overlap Phase 2)

**Goal:** every later page is assembled from a small, consistent kit.

**Tokens and components:**

- Port Graphite & Citron into `tokens.css`. Rename ramps to honest names: `graphite`, `citron`, `magenta` and so on.
- Components:
  - Building blocks: PageShell, PageHeader, PageStates (loading, empty, error, forbidden, upgrade), StatCard, ProgressRing, EmptyState, ConfirmDialog, Drawer (the `UserDetailDrawer` pattern).
  - Data display: DataTable (mobile card fallback), chart wrappers, and `MathText` plus `Markdown` with KaTeX.
  - Forms: form field wrappers bound to zod.

**App shell:**

- Mobile bottom navigation plus desktop sidebar.
- Server-driven navigation from `GET /navigation`, filtered by permissions and entitlements, with a Lucide icon registry.

**Guardrails:**

- Lint rules: no hex outside tokens, no MUI icons, no emoji or em dash in strings, no `any` in features.
- A component gallery page (Storybook, or a simple `/dev/ui` route that only exists in non-prod) with visual regression snapshots in Playwright.

**Exit gate:** shell and kit pass axe, render correctly at 360px and 1440px in both colour schemes, and Lighthouse mobile scores 90 or higher on the shell.

### Phase 4: Academic core (3 weeks)

**Goal:** a student can set up what they study.

**API (Academics module):**

- The CAPS catalog seeded from data files, with an idempotent seeder that runs as a pipeline step, not on every boot (today it runs on boot in `Program.cs`).
- Study units:
  - Unified study units: high-school students pick CAPS subjects, and tertiary students create courses with their year of study, level and duration.
  - Enrolment, with one gate that serves both paths.
  - The emergent per-subject topic registry.
- Assessments:
  - Assessments CRUD with a lifecycle (scheduled, in progress, submitted, graded), SBA programme data and due dates.
  - Uploads via S3 presigned URLs, with magic-byte verification.
- Calendar: real events from assessments and study sessions, plus reminders as Wolverine scheduled messages.

**Web:** subjects and courses, unit detail, assessments (with the lifecycle view), calendar.

**Exit gate:** a high-school student and a university student can each onboard, add units and assessments, and upload a file that survives a redeploy. E2E covers both paths on mobile.

### Phase 5: Practice and AI (3 to 4 weeks)

**Goal:** the core value of the product, done properly.

**API (AiTutor module):**

- The Anthropic client through the SDK, with resilience, config-driven models, prompt files, structured output and prompt caching.
- Quota reserve, confirm or refund through entitlements.

**API (Practice module):**

- Generation:
  - Generate tests at the right level from the unit, topics and level, as queued jobs.
  - Store questions, validate the LaTeX, and keep the ASCII-math bridge for any legacy content.
- Attempts:
  - Attempts use server-authoritative timing, one attempt only, `focus_loss_count`, auto-submit, and grading with explanations (including exam marks).
  - Fetching the latest attempt returns the results view.
- Tutor chat:
  - Streams over SSE.
  - The context is built server-side.
  - It is blocked server-side during an active attempt.

**Web:**

- `PracticeRunner` rebuilt as small views and hooks: instructions gate, countdown, focus monitor, pause, review, results, completed.
- The printable branded paper, past papers, and the tutor chat page.

**Evals:** the golden set plus a CI job on prompt changes and a nightly real-model run. Track cost per generated test.

**Exit gate:**

- Eval pass rate meets the target you set in Phase 0 (for example 95% schema-valid, 90% level-appropriate on human review of a sample).
- Integrity rules are covered by E2E.
- Generation p95 latency is known and acceptable.

### Phase 6: Billing, entitlements and affiliates (3 weeks)

**Goal:** revenue that is correct and auditable, including what we owe affiliates.

**API (Billing module):**

- Plans and plan features as seed data, and a plan sync to Paystack as a pipeline or admin action, not on boot.
- Checkout, verify on return, and a webhook endpoint with HMAC verification feeding the `paystack_events` inbox, so each event is processed once.
- A subscription state machine (trialing, active, past_due, cancelled, scheduled downgrade) with explicit transitions and tests.
- Entitlements enforced with `.RequireFeature()` on endpoints, and usage metering.
- A nightly reconciliation job against the Paystack API.
- Invoices and receipts emailed.
- Server-side conversion reporting to Meta is deferred until after launch (decision 8).

**API (Affiliates module), if in v1:**

- Affiliate applications with approve, reject, suspend and reinstate.
- Referral attribution from a code or link, claimed at first authenticated render, with payment fingerprints and fraud signals.
- A commission ledger driven by Billing events (payment, renewal, refund), with holds that release on a schedule and reversals as new rows.
- Payout batches with items, CSV export, mark-paid and cancel. Payout details stored encrypted.
- Statements and tax-year summaries.

**Web:** pricing (static), billing page, upgrade gates wired to real entitlements, the affiliate landing and join pages, and the `/refer` area (earnings, payments, get paid, tax).

**Dev:** use the Postman webhook forwarding or the Paystack CLI to deliver real webhooks to localhost, so the "verify on /welcome because webhooks cannot reach localhost" workaround goes away.

**Exit gate:** every subscription transition has a test. Replaying a webhook ten times charges, changes or commissions nothing extra. A refund reverses its commission. Reconciliation reports zero drift in staging, and the affiliate ledger sums match payouts to the cent.

### Phase 7: Progress, mastery, careers and wellbeing (3 to 4 weeks)

**Goal:** a student sees honest progress built from real activity, and knows how far they are from where they want to go.

**API:**

- Goals and milestones are made verifiable from real work, such as completing N practice tests, reaching a mastery threshold or submitting assessments, with the baseline rule (a rewarded target at or below the baseline is refused).
- Points and achievements come from integration events published by Practice and Academics through the outbox. Keep them in service of clarity, per the de-gamified principle in `PRODUCT.md`.
- Mastery projections:
  - Start with simple, explainable aggregates in .NET: per-topic accuracy, recency-weighted.
  - The schema is designed so that the Python BKT model can write into it later.
- Career and admission targets: targets and requirements as entered by the student, a careers reference list, and per-unit standing from measured marks. Free for everyone, as today.
- Wellbeing: diary and mood (private by default, with explicit sharing to parents), and gentle reminders.

**Web:** the student dashboard (real data only), goals, mastery (charts), career targets with the reach engine and what-if panel, analytics, journey, wellbeing, diary.

**Exit gate:** every number on the student dashboard and the career pages traces back to a query that has a test. Nothing is random or hardcoded, and missing evidence shows as "no marks yet", never zero.

### Phase 8: Parent track (2 weeks)

**API (Family module):** invites with links and expiry, consent from the student side, a parent overview of the child's progress, and wellbeing only where the student has shared it. Parent-funded allowances and goal rewards are not in v1 (decision 6).

**Web:** the parent dashboard, student detail, celebrations (real events), wellbeing (real shared data only, replacing the current random chart), and billing for parent-paid plans.

**Exit gate:** authorisation tests prove a parent can only read linked students, and only the data the student consented to share.

### Phase 9: Admin, support and operations (2 to 3 weeks)

**API:**

- Admin read models: users (with a detail drawer view), schools and institutions, school enquiries, subscriptions, payments, AI spend.
- Paystack cockpit: status, balance, transactions, settlements, customer lookup, refunds and subscription actions, every action audited including failures.
- Affiliate admin (if in v1): applications, flagged referrals (clear or block), payout batch generation and export, commission reversal.
- Audit log viewer.
- Impersonation that is time-boxed, audited and shows a visible banner.
- Support tickets and FAQs, and the contact form (already real today) moved into Support.
- Feature flags only if a real need appears (the old feature-flag controller was removed; config or a small table is enough).
- Moderation, only if v1 has user-generated content.

**Web:** admin pages, every one backed by real endpoints.

**Ops:** runbooks in `docs/runbooks/` (restore from backup, rotate a secret, roll back a deploy, Paystack incident, Anthropic outage, affiliate payout run). Practise the restore once.

**Exit gate:** a restore drill succeeds in under an hour. An admin can answer "who paid, who is stuck, what is AI costing, what do we owe affiliates" without touching SQL.

### Phase 10: Hardening and pre-launch (2 weeks)

- **Load test:** k6 against staging at 10x expected peak. Fix the slow queries (`pg_stat_statements`) and set autoscaling.
- **Security:**
  - OWASP ASVS L1 review across the app, plus dependency and image scans clean.
  - Rate limits tuned, CSP and security headers verified.
  - Optionally an external pentest.
- **POPIA:**
  - Privacy policy updated, data processing inventory, and consent records for minors (parent consent for under-18s).
  - Analytics consent reviewed for minors (Vercel Analytics is cookieless; the Meta pixel and CAPI are deferred, decision 8).
  - Data export and deletion flows, and a retention policy (including affiliate tax records).
- **Product polish:**
  - A full mobile pass on real devices, a11y audit, empty states and error copy.
  - Copy and claims checked against the claims ledger in `web/marketing/`.
- **Observability:**
  - SLOs (for example API availability 99.5%, p95 under 500ms excluding AI) with alerts to email or Slack.
- **Prod infra:** apply prod Terraform, then do a dress rehearsal deploy.

**Exit gate:** a go/no-go checklist is all green.

### Phase 11: Data migration and cutover (1 to 2 weeks)

1. Build the ETL from the Phase 0 entity inventory. Run it as a .NET console app in `tools/Migrator` in the api repo, so it can reuse the new EF models. It maps old string and long ids to new Guid v7 values, keeps a lookup table, and normalises the study units.
2. Rehearse against a restored snapshot of the old prod DB at least three times. Write automated reconciliation checks: counts per entity, sums for money (payments, commissions, payouts), spot-checks per user.
3. Plan password handling. ASP.NET Identity hashes port directly if you stay on Identity, so users keep their passwords. Otherwise use a forced reset email.
4. Plan subscription and affiliate continuity. Map existing Paystack subscription codes onto the new Billing records, with no re-charging. Carry over open commission holds, unpaid balances and payout history exactly. Carry over consent rows unchanged.
5. Recover uploads from the EC2 host volume (whatever survived) into S3.
6. Cutover:
   - Announce a maintenance window, put the old app in read-only mode and take a final snapshot.
   - Run the ETL, run reconciliation, switch DNS in Cloudflare, then smoke-test.
7. Keep the old stack (stopped, snapshot retained) for 30 days as a rollback, then decommission it. Archive `7irelo/aptiverse` once the org repos are the only source, and make sure nothing secret was ever pushed to it.

**Exit gate:** reconciliation is 100%, no payment or commission anomalies for 7 days, and the old infra is torn down.

### Phase 12: Scale and grow (ongoing, after launch)

Pick these up when a metric says so, not before.

- **Analytics service (Python, new repo `aptiverse-labs/analytics`):**
  - FastAPI is not needed. Use a plain worker with uv, a lockfile, ruff, mypy and pytest.
  - It consumes integration events from SQS (published by the outbox), runs BKT mastery, gap clustering and at-risk scoring, and writes back to projection tables it owns in an `analytics` schema.
  - It is started only once there is enough real data to train on. The deleted `ai/` service is not the starting point.
- **Scaling, triggered by metrics:**
  - Valkey/Redis as the L2 cache and distributed rate limiter, once there are more than 2 API tasks.
  - An RDS read replica for analytics and admin queries.
  - Extracting a module into its own service. It is already isolated by schema and contracts, so this means moving the project, not rewriting it. Likely candidates: AiTutor (different scaling profile) and Notifications.
- **New tracks:** tutor discovery (the jobs-board model with connects, no money between parties, no marketplace), then teacher and school, including school-scoped live activity and gap analysis.
- **Product:**
  - PWA install and offline practice papers.
  - Study groups (sessions, tasks, capacity), if usage justifies it.
  - A native app via Expo/React Native on the same API, if mobile usage justifies it.
- **Org and data:**
  - AWS Organizations: separate prod account.
  - A data warehouse and product analytics (PostHog, self-hosted or EU cloud, POPIA-reviewed).

---

## 5. Definition of Done (every feature, every phase)

- [ ] Spec acceptance criteria met, and demoed on a real phone.
- [ ] Endpoint has: validator, permission policy, entitlement gate (if paid), ownership or scoping check, rate-limit group, ProblemDetails errors.
- [ ] Unit tests for the handler logic, plus an integration test for the endpoint (happy path, validation failure, forbidden, not found).
- [ ] OpenAPI updated, spec published and client regenerated, with no hand-written DTOs.
- [ ] Page has loading, empty, error and forbidden states, and works at 360px in light and dark.
- [ ] axe passes, keyboard navigable.
- [ ] No hardcoded or random data, no emojis, no em dashes, Lucide icons only.
- [ ] Logs and traces are meaningful, with no PII or secrets in logs.
- [ ] Money changes are ledger rows with tests that sum to the cent.
- [ ] Migration reviewed. Any destructive change is flagged in the PR description.
- [ ] Docs updated (module README or ADR if a decision changed).

---

## 6. Timeline at a glance

| Phase | Weeks | Cumulative |
|---|---|---|
| 0 Decide, secure, prepare | 1 | 1 |
| 1 Walking skeleton | 2-3 | 4 |
| 2 Identity + notifications core | 2-3 | 7 |
| 3 Design system + shell (overlaps 2) | 2 | 8 |
| 4 Academic core | 3 | 11 |
| 5 Practice + AI | 3-4 | 15 |
| 6 Billing + entitlements + affiliates | 3 | 18 |
| 7 Progress, mastery, careers, wellbeing | 3-4 | 22 |
| 8 Parent track | 2 | 24 |
| 9 Admin, support, ops | 2-3 | 27 |
| 10 Hardening, pre-launch | 2 | 29 |
| 11 Migration + cutover | 1-2 | 31 |

Roughly 7 months to a full v1 cutover, about 3 weeks more than the first draft because affiliates, career targets and the admin Paystack cockpit are now real features that must be carried over. If affiliates move out of v1, take a week off Phase 6 and Phase 9. To show value sooner, an internal beta after Phase 5 (accounts plus academics plus practice) on staging with a handful of real students is a good checkpoint. The existing app keeps running in the meantime, with the Phase 0 fixes applied.

---

## 7. Decisions (closed 2026-10-19)

All open decisions were closed by accepting the recommended defaults. The full list, including legal, money and operations answers and the facts still owed, is in `docs/rebuild/DECISIONS.md`.

1. **Repo layout:** three org repos with the contract flow in section 2.
2. **v1 scope:** Student (high school and university) plus Parent plus lean Admin; Tutor, Teacher and School after launch.
3. **Affiliates:** in v1 (Phase 6), old terms kept, attribution capped at 12 months from first touch.
4. **UI library:** Tailwind + shadcn, Graphite & Citron tokens.
5. **Messaging:** Wolverine on Postgres.
6. **Parent-funded allowances and goal rewards:** neither in v1; revisit after launch.
7. **Diary NLP / wellbeing analysis:** none.
8. **Paid acquisition tracking:** Meta pixel and Conversions API dropped until after launch.
9. **Budget:** monthly ceilings for AWS and Anthropic, amounts still to be supplied (DECISIONS.md section F).
10. **Existing users:** counts still to be supplied; cutover plans for the full rehearsal path until then.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Rebuild drags on and the old app rots | Internal beta after Phase 5, strict exit gates, and re-estimate per phase. Old app gets backups and the Phase 0 security fixes only. |
| Data loss during migration | Repeated ETL rehearsals on snapshots, automated reconciliation, and a 30-day rollback window. |
| Coursework already lost on deploys | Fix the deploy compose in Phase 0, check what survived on the host volume, and move uploads to S3 in the rebuild. |
| Affiliate money owed is wrong after cutover | Append-only ledger, per-cent reconciliation in rehearsals, and no payout run during the cutover week. |
| Over-engineering for scale we do not have | Monolith first. Redis, replicas, extra services and Python analytics are only added when a metric triggers them (Phase 12). |
| Three repos drift apart (config, contracts, CI) | Infra owns all deploy definitions, api publishes a versioned spec that web pins, shared reusable workflows. Revisit the monorepo option if this costs real time. |
| AI cost spikes | Fail-closed quotas per plan with refunds, prompt caching, spend dashboard, and a budget alarm. |
| Paystack edge cases (double webhooks, renewals, refunds) | Inbox table, state machine tests, nightly reconciliation, commission reversal on refund. |
| Minors' data (POPIA) | af-south-1 residency, parent consent flow, versioned consent records, consent-gated marketing analytics, minimal PII in logs, data export and delete flows, and a retention policy. |
| Frygia font licence | It is loaded from Euphoria's site today (see the note in `web/src/app/layout.tsx`). Buy a licence and self-host before launch, or pick a licensed fallback. |
| Single person knows everything | ADRs, runbooks, module READMEs, CLAUDE.md per repo, and a reproducible local setup. |
