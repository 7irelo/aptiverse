# Aptiverse

An AI-powered student success platform for South African Grade 11 & 12 learners. Aptiverse turns matric prep from anxiety into momentum — AI-aligned SBA practice, predictive mastery, integrated wellbeing, bursary navigation, and verified rewards, all framed around growth instead of toxic comparison.

This repository is a monorepo. The .NET back end is a **modular monolith**: one host process (`Aptiverse.Api`) running auth + 14 bounded-context modules. A small number of supporting services (Python AI, Rails payments, Go events) stay separate for genuine technical reasons.

## Why this shape

Microservices are a coordination cost paid by teams. With one developer (or a small team) and no users yet, that cost is pure overhead — extra processes, deploys, contracts, and ways to drift. Every Aptiverse domain still ships its own Application + Domain + Infrastructure libraries with its own DbContext and bounded context, but they share a single process. When a module legitimately needs to scale or deploy independently, splitting it out is a day's work because the seams are already in the project structure.

## Architecture

```
                                         ┌──────────────────────────┐
                                         │  Next.js UI (port 3000)  │
                                         └────────────┬─────────────┘
                                                      │ /api/*
                                                      ▼
                          ┌──────────────────────────────────────────────────┐
                          │  Aptiverse.Api  (single .NET 10 host, port 5100) │
                          │                                                  │
                          │  Auth + 14 modules in one process:               │
                          │  ─────────────────────────────────────────       │
                          │  · Identity + JWT       · academic-planning      │
                          │  · audit                · booking                │
                          │  · calendar             · entitlements           │
                          │  · feature-flags        · goals                  │
                          │  · insights             · marketplace            │
                          │  · mastery              · moderation             │
                          │  · practice             · support                │
                          │  · wellbeing                                     │
                          └──────────────────┬───────────────────────────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        │                                    │                                    │
        ▼                                    ▼                                    ▼
┌───────────────┐                 ┌───────────────────┐               ┌─────────────────────┐
│  ai-service   │                 │  payment-gateway  │               │  event-architecture │
│  Python 3.11  │                 │  Rails 8 / Stripe │               │  Go / Kafka+RabbitMQ│
│  FastAPI      │                 │                   │               │                     │
└───────────────┘                 └───────────────────┘               └──────────┬──────────┘
                                                                                 │
                                                                                 ▼
                                                                     ┌─────────────────────┐
                                                                     │ notification-service│
                                                                     │  Go / SMTP consumer │
                                                                     └─────────────────────┘

                                  Shared infrastructure
                          ┌────────────────┬────────────────┐
                          │  PostgreSQL 16 │   Redis 7      │
                          │  (one DB,      │   (sessions,   │
                          │   per-module   │    cache,      │
                          │   migrations)  │    ratelimit)  │
                          └────────────────┴────────────────┘
```

### Why these specific things stay separate

| Service | Reason |
|---|---|
| **ai-service** | Different language (Python), different resource profile (model weights, GPU-eligible, separate restart cycle from the API) |
| **payment-gateway** | Rails because Stripe's official server SDK + webhook signature flow is the cleanest there; payments deserve a small isolated audit boundary |
| **event-architecture** | Async event ingestion + routing through Kafka + RabbitMQ; not a request/response API, doesn't belong in the host |
| **notification-service** | A RabbitMQ consumer; legitimately not a web service |
| **ui** | Next.js, separate runtime |

Everything else collapses into `Aptiverse.Api`.

## Modules

Each module under `api/{name}-service/src/` is a bounded context with four projects:

- `Aptiverse.{X}.Domain/` — entities, value objects, repository interfaces
- `Aptiverse.{X}.Core/` — cross-cutting types (DTOs, exceptions, services)
- `Aptiverse.{X}.Application/` — use cases, mappers, application services
- `Aptiverse.{X}.Infrastructure/` — EF Core `ApplicationDbContext`, Repository<T>, Redis adapters

The host (`api/Aptiverse.Api/`) references **only** Application + Infrastructure of each module. Controllers live in the host. There is no per-module web project.

| Module | Owns | Key UI routes consumed |
|---|---|---|
| **auth** (auth-provider) | Users, roles, permissions, JWT, OAuth | `/api/auth/*`, `/api/users/*` |
| **academic-planning** | Subjects, topics, assessments, study sessions | `/api/frontend/subjects`, `/assessments`, `/classes` |
| **audit** | Immutable audit log of admin actions | `/api/frontend/audit-logs` |
| **booking** | Tutor session booking + availability | `/api/frontend/bookings`, `/tutors/{id}/availability` |
| **calendar** | Calendar events, reminders, Google/Outlook sync | `/api/frontend/events`, `/reminders` |
| **entitlements** | Subscriptions, plans, feature gating, parent-child links | `/api/frontend/subscriptions`, `/features`, `/children` |
| **feature-flags** | Runtime feature toggles + rollout % | `/api/frontend/flags` |
| **goals** | Student goals, milestones, rewards, points, verifications | `/api/frontend/goals`, `/rewards`, `/verifications` |
| **insights** | Live activity stream, predictive analytics, gap analysis | `/api/frontend/live-activity` (incl. SSE) |
| **marketplace** | Tutor profiles, courses, enrolments, reviews | `/api/frontend/tutors`, `/courses` |
| **mastery** | Topic-level mastery, term-over-term predictions | `/api/frontend/topic-mastery`, `/predictions` |
| **moderation** | Flag queue, content review, AI auto-flags | `/api/frontend/moderation-queue` |
| **practice** | AI practice tests, attempts, past papers (NSC + IEB) | `/api/frontend/practice-tests`, `/past-papers` |
| **support** | Tickets, FAQs | `/api/frontend/tickets`, `/faqs` |
| **wellbeing** | Diary, mood check-ins, counsellor directory | `/api/frontend/diary`, `/mood-trend`, `/counsellors` |

## RBAC

Seven roles, normalised lowercase snake_case in API responses. Permissions are computed from roles and returned on every login + `/api/auth/me`. The same permission strings are used by the UI's `PermissionGuard` component.

| Role | Identity name | Used for |
|---|---|---|
| `super_admin` | `Superuser` | Platform owner — everything plus impersonation |
| `admin` | `Admin` | Platform operator — users, schools, billing, moderation |
| `school_admin` | `SchoolAdmin` | School leadership — class + student management |
| `teacher` | `Teacher` | Class educator — assignments, gap analysis |
| `tutor` | `Tutor` | Marketplace tutor — courses, sessions, earnings |
| `parent` | `Parent` | Parent / guardian — read-only on linked children |
| `student` | `Student` | Grade 11 / 12 learner — the primary persona |

Permission strings: `users.*`, `schools.*`, `classes.*`, `students.*`, `tutors.*`, `courses.*`, `bursaries.*`, `subscriptions.*`, `payments.*`, `billing.*`, `content.*`, `audit.*`, `flags.*`, `system.*`. Source of truth: `auth-provider/src/Aptiverse.Application/Auth/Services/PermissionResolver.cs`. UI mirror: `ui/src/lib/rbac.ts`.

## Tech stack

**Back end:** .NET 10, ASP.NET Core, EF Core, Identity, JWT, AutoMapper, FluentValidation, Scalar (OpenAPI UI), ReDoc, StackExchange.Redis, Npgsql

**AI:** Python 3.11, FastAPI, PyTorch CPU, HuggingFace Transformers, scikit-learn, FAISS (vector search), OpenCV, Tesseract OCR

**Payments:** Ruby on Rails 8, Stripe (checkout sessions + webhooks)

**Events:** Go 1.22, Apache Kafka, RabbitMQ, Protocol Buffers, gRPC, Prometheus, zap

**Notifications:** Go 1.21, RabbitMQ consumer, SMTP

**Front end:** Next.js 16 (Turbopack), React 19, MUI v7, MUI X (Charts, DataGrid, Date Pickers), Emotion, NextAuth, TanStack Query, react-hook-form, Zod, Zustand, dayjs, framer-motion, Roboto

**Infrastructure:** PostgreSQL 16, Redis 7, Kafka, RabbitMQ, Docker, Terraform (VPC, EKS, EC2, RDS, ElastiCache, ALB, Route 53), GitHub Actions (OIDC to AWS)

## Repo layout

```
aptiverse/
├── Aptiverse.Api.csproj           # Single .NET project — host + 15 modules folded in
├── README.md                     # This file
├── CLAUDE.md                     # AI assistant instructions
│
├── api/
│   ├── Aptiverse.Api/            # ★ The single .NET host (port 5100)
│   │   ├── Aptiverse.Api.csproj  # References auth + all 14 modules
│   │   ├── Program.cs            # Single Program.cs
│   │   ├── Modules/
│   │   │   └── ModuleRegistrations.cs   # Per-module DI wiring
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   └── Frontend/
│   │   │       ├── AcademicPlanningFrontendController.cs
│   │   │       ├── ... (14 frontend controllers)
│   │   │       └── WellbeingFrontendController.cs
│   │   ├── Middleware/           # Filters (validation, exception, logging)
│   │   ├── Utilities/            # OpenAPI bearer scheme transformer
│   │   ├── Registrations.cs      # AddInfrastructure / AddIdentity / CORS
│   │   ├── Dockerfile            # Multi-stage build (only Dockerfile in api/)
│   │   ├── appsettings*.json
│   │   └── Properties/launchSettings.json
│   │
│   ├── academic-planning-service/src/    # 4 module library projects
│   │   ├── Aptiverse.Api.Application/
│   │   ├── Aptiverse.Api.Core/
│   │   ├── Aptiverse.Api.Domain/
│   │   └── Aptiverse.Api.Infrastructure/
│   ├── audit-service/src/                # Same 4-project shape
│   ├── booking-service/src/
│   ├── calendar-service/src/
│   ├── entitlements-service/src/
│   ├── feature-flags-service/src/
│   ├── goals-service/src/
│   ├── insights-service/src/
│   ├── marketplace-service/src/
│   ├── mastery-service/src/
│   ├── moderation-service/src/
│   ├── practice-service/src/
│   ├── support-service/src/
│   └── wellbeing-service/src/
│
├── auth-provider/src/            # Auth module library projects
│   ├── Aptiverse.Application/
│   ├── Aptiverse.Core/
│   ├── Aptiverse.Domain/
│   └── Aptiverse.Infrastructure/
│
├── ui/                           # Next.js 16 front end
│   ├── src/
│   │   ├── app/                  # App router — marketing, auth, dashboards
│   │   ├── components/
│   │   ├── lib/                  # rbac, api client, mock data, format
│   │   ├── providers/            # ColorMode, Auth, Query, Snackbar, Role
│   │   └── theme/                # Light + dark, Roboto, MUI tokens
│   ├── package.json
│   └── Dockerfile
│
├── ai-service/                   # Python FastAPI (kept separate)
├── payment-gateway/              # Rails 8 + Stripe (kept separate)
├── event-architecture/           # Go / Kafka + RabbitMQ (kept separate)
├── notification-service/         # Go / RabbitMQ consumer (kept separate)
│
└── infrastructure/
    ├── docker-compose.dev.yml    # Single-source compose
    ├── .env.example
    └── terraform/                # AWS IaC (VPC, EKS, RDS, ElastiCache, ALB, Route 53)
```

## What the platform does (product surface)

### SBA-aligned academic planning
Students input upcoming SBAs once. AI analyses historical performance, sets healthy goals from what they typically achieve per subject, and lays out a practice schedule across subjects, topics, and study sessions aligned to the school calendar.

### AI practice tests
- Generated against the student's weakest topics
- Past paper integration (NSC + IEB)
- Rubric-based marking when an SBA has a rubric
- Pattern analysis identifies deeper learning gaps across attempts

### Predictive mastery
Term-over-term strength tracking. Forecasts how likely a student is to perform well in trigonometry, essay writing, data handling — *next* term — so prep starts in advance.

### AI tutor (chatbot)
Patient, exam-aware conversational AI. Stuck at 11pm? Ask. Streamed replies. Never the substitute for human teaching, always the substitute for "I'll figure it out alone."

### Verified rewards
Goals get verified by the school via a one-click email. Rewards are *experiential*, not toxic: free tutor hours, masterclass unlocks, profile badges (`Resilient Learner`, `Curious Mind`, `Helpful Peer`), priority booking.

### Wellbeing first
- Daily mood check-ins (1–5)
- Stress-signal detection from behaviour patterns
- "Take a Break" library (5-min breathing, focus playlist, mindfulness)
- Verified in-app psychologists for talk-therapy bookings
- Stories of South African role models who failed before they soared

### Tutors & courses marketplace
Verified tutors, public ratings, instant booking. Tutors sell on-demand courses (curriculum-aligned). Stripe-powered weekly payouts.

### Multi-language
Key explanations and AI-tutor replies in isiZulu, Afrikaans, isiXhosa rolling out alongside English.

### University & career
- Dream-course planner
- Live APS calculator
- Bursary navigator (NSFAS + private) with deadline reminders + document checklists
- Career match based on performance + interests
- Financial literacy basics (loans, budgeting, cost of living)

### Roles & dashboards

| Role | Sees |
|---|---|
| **Student** | Workspace (notes, essays, scratchpad, files), practice tests, goals, mastery, AI tutor, tutors, courses, diary, wellbeing, career, rewards, study groups, calendar |
| **Parent** | "How can I help" dashboard, realtime activity (with consent), celebrations, wellbeing summary, billing |
| **Teacher** | Class-wide gap analysis, differentiated assignments, one-click goal verification, realtime class engagement |
| **School Admin** | Whole-school analytics, university readiness reports, teacher + class management, bursary partnership pipeline |
| **Tutor** | Course catalog, bookings, sessions, students, earnings, reviews |
| **Admin / Super Admin** | Users, schools, tutors, courses, bursaries, moderation, subscriptions, payments, refunds, invoices, feature flags, audit log, system health, impersonate, settings |

## Quick start

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- Docker Desktop
- PostgreSQL 16 + Redis 7 (or just use the compose file)

### Run everything

```bash
cd infrastructure
cp .env.example .env             # fill in JWT_KEY, DB password, Stripe keys, etc.
docker compose -f docker-compose.dev.yml up
```

That brings up: postgres, redis, **aptiverse-api** (port 5100), ai-service (8000), event-architecture (8080), notification-service (8081), payment-gateway (3001), ui (3000). 8 containers total.

### Run the API natively (much faster dev loop)

Keep infrastructure in Docker, run the API on the host:

```bash
docker compose -f infrastructure/docker-compose.dev.yml up postgres redis -d
cd api/Aptiverse.Api
dotnet run                       # http://localhost:5100
```

Open `http://localhost:5100/scalar/dev` for the interactive API explorer.

### Run the UI

```bash
cd ui
cp .env.example .env.local       # NEXT_PUBLIC_API_URL=http://localhost:5100
npm install
npm run dev                      # http://localhost:3000
```

### Build the entire .NET solution

```bash
dotnet build      # 61 projects
```

### Run tests

```bash
dotnet test       # all module test projects (when added)
cd ui && npm run lint && npm run build
```

## API surface

All API routes live under one host on port 5100.

### Auth
| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | – |
| POST | `/api/auth/login` | – |
| POST | `/api/auth/refresh-token` | bearer |
| POST | `/api/auth/validate-token` | – |
| POST | `/api/auth/logout` | bearer |
| POST | `/api/auth/change-password` | bearer |
| POST | `/api/auth/forgot-password` | – |
| POST | `/api/auth/reset-password` | – |
| GET | `/api/auth/me` | bearer |
| GET | `/api/auth/permissions` | bearer |
| POST | `/api/auth/confirm-email` | – |

### Frontend reads (per module)

All under `/api/frontend/*` and shaped to match the UI's TypeScript types in `ui/src/lib/mockData.ts`. Examples:

- `GET /api/frontend/subjects`, `/subjects/{id}`
- `GET /api/frontend/assessments`, `/assessments/{id}`
- `GET /api/frontend/goals`, `/rewards`, `/verifications`
- `GET /api/frontend/practice-tests`, `/practice-tests/{id}/questions`, `/past-papers`
- `GET /api/frontend/tutors`, `/courses`, `/tutors/{id}/reviews`
- `GET /api/frontend/diary`, `/mood-trend`, `/counsellors`, `/summary`
- `GET /api/frontend/topic-mastery`, `/predictions`
- `GET /api/frontend/live-activity` (snapshot)
- `GET /api/frontend/live-activity/stream` (Server-Sent Events for realtime panels)
- `GET /api/frontend/flags` (admin), `PATCH /flags/{key}`
- `GET /api/frontend/audit-logs` (admin)
- `GET /api/frontend/moderation-queue` (admin)
- `GET /api/frontend/subscriptions`, `/features`, `/children`
- `GET /api/frontend/events`, `/reminders`
- `GET /api/frontend/bookings`, `/tutors/{id}/availability`
- `GET /api/frontend/tickets`, `/faqs`

Full interactive explorer: `http://localhost:5100/scalar/dev`. ReDoc: `/docs`. Raw OpenAPI: `/openapi/v1.json`.

## Deployment

### Environments

| Env | Compute | Strategy |
|---|---|---|
| Dev | Single EC2 (t3.2xlarge) + Docker Compose | Manual / `workflow_dispatch` |
| Staging | EKS (spot instances) + RDS + ElastiCache + ALB | `workflow_dispatch` |
| Production | EKS (on-demand, multi-AZ RDS) + canary via Argo Rollouts | `workflow_dispatch` |

### CI/CD
- **CI**: pushes / PRs to `main` build Docker images, push to Docker Hub (`7irelo/aptiverse-*`) on main pushes
- **CD**: manual `workflow_dispatch` pulls a tag (default `latest`), deploys to EC2 (dev) or EKS (staging/prod) via OIDC

### Terraform layout

```
infrastructure/terraform/
├── bootstrap/        # S3 backend + DynamoDB lock
├── modules/
│   ├── vpc/
│   ├── ec2/         # Dev: single EC2 + Docker Compose
│   ├── eks/         # Staging + prod
│   ├── rds/
│   ├── elasticache/
│   ├── alb/
│   ├── route53/
│   └── security/
└── envs/
    ├── dev/
    ├── staging/
    └── prod/
```

## Splitting a module out later

You won't need to until a module hits a *specific* signal: needs different scale, different deploy cadence, different team, different runtime. Until then it's pure overhead. When you do:

1. Copy the module's 4 library projects into a new repo (or new top-level folder)
2. Create a small new host project that references those 4 projects
3. Drop the matching `ProjectReference`s from `api/Aptiverse.Api/Aptiverse.Api.csproj`
4. Drop the matching DbContext + AddApplicationServices calls from `Modules/ModuleRegistrations.cs`
5. Move the `{X}FrontendController.cs` from `Aptiverse.Api/Controllers/Frontend/` to the new host
6. Route the matching `/api/frontend/{module}/*` path at your edge gateway

Day's work, not a quarter's. The Clean Architecture per module is exactly what makes this cheap.

## Status

Active development. One backend host. One frontend. One solution. One README. The way it should be.

## Licence

All rights reserved.
