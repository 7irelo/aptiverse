# Aptiverse

An AI-powered student success platform built for South African Grade 11 & 12 learners. SBA-aligned practice, predictive mastery, integrated wellbeing, bursary navigation, and verified rewards — framed around growth, not toxic comparison.

This is a **polyglot monorepo**. Each component below has its own README with build, run, and architecture details — start there.

## Components

| Path | Tech | What it does |
|---|---|---|
| [`api/Aptiverse.Api/`](api/Aptiverse.Api/) | .NET 10, ASP.NET Core | Modular monolith — auth (Identity + JWT) plus 14 domain modules (academic-planning, audit, booking, calendar, entitlements, feature-flags, goals, insights, marketplace, mastery, moderation, practice, support, wellbeing) running in one process on port 5100. |
| [`ui/`](ui/) | Next.js 16, React 19, MUI v7 | Web client — marketing site, auth flow, role-aware dashboards (student, parent, teacher, school admin, tutor, admin). Port 3000. |
| [`ai-service/`](ai-service/) | Python 3.11, FastAPI, PyTorch | ML inference: practice generation, rubric grading, OCR, pattern analysis. Port 8000. |
| [`payment-gateway/`](payment-gateway/) | Rails 8, Stripe | Checkout sessions and webhook handling. Port 3001. |
| [`infrastructure/`](infrastructure/) | Terraform, Docker Compose | AWS IaC (VPC, EKS, RDS, ElastiCache, ALB, Route 53) and local dev stack. |

## Why this shape

The .NET API is a modular monolith — one process, 15 bounded contexts (1 auth + 14 domain modules). The other components stay separate for genuine technical reasons (different language, different resource profile, async-by-design). Microservice coordination cost isn't worth paying without a team big enough to amortise it. See [`api/Aptiverse.Api/README.md`](api/Aptiverse.Api/README.md) for the full rationale and module map.

## Run the stack

Local dev — Postgres + Redis in Docker, everything else native (faster iteration):

```bash
# Start infra
cd infrastructure
cp .env.example .env                                # fill in values
docker compose -f docker-compose.dev.yml up -d postgres redis

# .NET API
cd ../api/Aptiverse.Api
dotnet ef database update                           # apply migrations
dotnet run                                          # http://localhost:5100

# Frontend
cd ../../ui
npm install
npm run dev                                         # http://localhost:3000

# Optional sidecar services (run only what you need)
cd ../ai-service && uvicorn app.main:app --port 8000
cd ../payment-gateway && bin/rails server -p 3001
```

Email is sent in-process from the .NET API via AWS SES SMTP — no separate worker. Set `EmailSettings:Server`, `Username`, `Password` in `appsettings.json` (SMTP credentials, not AWS access keys).

Full stack in Docker:

```bash
docker compose -f infrastructure/docker-compose.dev.yml \
               -f infrastructure/docker-compose.override.yml up
```

## Documentation

| Doc | Scope |
|---|---|
| [`README.md`](README.md) | This file — repo overview |
| [`CLAUDE.md`](CLAUDE.md) | Repo-wide guidance for AI assistants |
| [`api/Aptiverse.Api/README.md`](api/Aptiverse.Api/README.md) | .NET API: architecture, modules, RBAC, EF, deployment |
| [`api/Aptiverse.Api/CLAUDE.md`](api/Aptiverse.Api/CLAUDE.md) | .NET API: code conventions, common tasks, gotchas |

## Status

Active development. One backend host (.NET), one web client (Next.js), three sidecar services for legitimate cross-tech reasons.

## Licence

All rights reserved.
