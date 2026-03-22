# Aptiverse

An AI-powered student success platform built for South African high school learners. Twenty microservices handle academic planning, goal tracking, mastery analytics, practice generation, AI-driven insights, tutor marketplace, booking, payments, authentication, notifications, event routing, content moderation, wellbeing, calendars, feature flags, support, and audit logging — wired together with Kafka, RabbitMQ, Redis, and PostgreSQL.

The platform is purpose-built for Grades 11 and 12, targeting SBA preparation, university readiness, bursary access, and mental wellbeing. Everything is framed around growth, mastery, and empowerment — never toxic comparison or ranking.

## Architecture

### Services

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| `ui` | 3000 | Next.js 15, React 19, TypeScript | Web client (marketing + dashboard) |
| `auth-provider` | 5000 | .NET 10, ASP.NET Core | Authentication, JWT tokens, OAuth (Google, Microsoft) |
| `academic-planning-service` | 5001 | .NET 10, ASP.NET Core | Course and subject planning, SBA scheduling |
| `audit-service` | 5002 | .NET 10, ASP.NET Core | Audit logging and compliance tracking |
| `booking-service` | 5003 | .NET 10, ASP.NET Core | Tutor session booking and availability |
| `calendar-service` | 5004 | .NET 10, ASP.NET Core | Calendar integration (Google, Outlook) |
| `entitlements-service` | 5005 | .NET 10, ASP.NET Core | Subscription access control, feature gating |
| `feature-flags-service` | 5006 | .NET 10, ASP.NET Core | Feature flag management and rollout |
| `goals-service` | 5007 | .NET 10, ASP.NET Core | Student goal tracking, verification, rewards |
| `insights-service` | 5008 | .NET 10, ASP.NET Core | Predictive analytics, pattern analysis |
| `marketplace-service` | 5009 | .NET 10, ASP.NET Core | Tutor marketplace, course listings |
| `mastery-service` | 5010 | .NET 10, ASP.NET Core | Strength tracking, term-over-term progress |
| `moderation-service` | 5011 | .NET 10, ASP.NET Core | Content moderation and review |
| `practice-service` | 5012 | .NET 10, ASP.NET Core | Practice test generation and rubric-based assessment |
| `support-service` | 5013 | .NET 10, ASP.NET Core | Help desk and support ticketing |
| `wellbeing-service` | 5014 | .NET 10, ASP.NET Core | Mental wellbeing check-ins and resources |
| `ai-service` | 8000 | Python 3.11, FastAPI | ML models for analysis, generation, OCR |
| `event-architecture` | 8080 | Go 1.22 | Event ingestion, routing, deduplication (Kafka + RabbitMQ) |
| `notification-service` | 8081 | Go 1.21 | Event-driven email delivery via RabbitMQ |
| `payment-gateway` | 3001 | Rails 8, Ruby 3.4 | Stripe payment processing, webhooks |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL 16 (RDS in AWS) |
| Cache | Redis 7 (ElastiCache in AWS) |
| Message Broker | Apache Kafka (Confluent 7.6.0) |
| Message Queue | RabbitMQ 3.13 |
| Container Registry | Docker Hub (`7irelo/aptiverse-*`) |
| DNS | Route 53 (domain registered at GoDaddy) |
| Compute | EC2 (dev), EKS (staging/prod) |
| IaC | Terraform |
| CI/CD | GitHub Actions |

### Tech Stack

**Backend:** .NET 10, ASP.NET Core, Entity Framework Core, C#, Clean Architecture (Controllers → Application → Domain → Infrastructure)

**Frontend:** Next.js 15 (Turbopack), React 19, TypeScript 5, Tailwind CSS 4, Radix UI, React Hook Form, Zod 4, TanStack Query 5, NextAuth.js

**AI/ML:** Python 3.11, FastAPI, PyTorch (CPU), HuggingFace Transformers, scikit-learn, FAISS (vector search), OpenCV, Tesseract OCR, pandas, NumPy

**Payments:** Ruby on Rails 8, Stripe (checkout sessions, webhooks, refunds)

**Events:** Go 1.22, Apache Kafka, RabbitMQ, Protocol Buffers, gRPC, Prometheus metrics, zap structured logging

**Notifications:** Go 1.21, RabbitMQ consumer, SMTP (Gmail), exponential backoff retry

**Infrastructure:** Terraform (AWS — VPC, EKS, EC2, RDS PostgreSQL, ElastiCache Redis, ALB, Route 53), Docker, GitHub Actions, Docker Hub

## What the Platform Does

### SBA-Aligned Academic Planning

Students input their upcoming SBA assessments — the tasks teachers assign yearly to track progress. The AI analyses historical performance and helps them set healthy, realistic goals grounded in what they typically achieve per subject. Planning spans subjects, topics, assessments, and study sessions aligned to the school calendar.

### AI-Powered Practice Tests

The AI generates practice tests aligned to upcoming SBA tasks:

- **"Focus on Your Weakest" mode** — targets identified knowledge gaps
- **Past Paper Integration** — sources questions from IEB and NSC past papers aligned to upcoming assessments
- **Rubric-based assessment** — when an SBA has a rubric, the AI assesses using that rubric
- **Pattern analysis** — analyses student response patterns across tests to identify deeper learning trends

### Strength Tracking & Predictive Insights

Strengths are tracked across each term to build a predictive model. The system determines how likely a student is to perform well in specific areas — trigonometry, essay writing, data handling — in the next term, so preparation starts in advance.

### Goal Setting & Verified Rewards

Students set goals calibrated by AI. A verification system checks with the school whether the student achieved their goal. Rewards include free courses, tutor hours, paid feature access, profile badges ("Resilient Learner," "Curious Mind"), tutor booking priority, and masterclass unlocks.

### AI Chatbot

A conversational AI assistant where students ask questions, get explanations, work through problems, and receive encouragement — available around the clock.

### Tutor Marketplace & Courses

Students connect with verified tutors for one-on-one sessions. Tutors sell specialised courses tailored to specific subjects, topics, or SBA preparation. Booking system handles scheduling, availability, and session tracking.

### Homework & Assessment Tools

Teachers assign assessments and homework in advance. AI-powered help tools guide the student's work without replacing it.

### Calendar Integration

Google Calendar and Microsoft Outlook integration pushes schedules, study sessions, assessment deadlines, and reminders directly to students.

### Diary & Mental Wellbeing

- Wellbeing check-ins with stress detection
- Psychologist access through the platform
- "Take a Break" button (mindfulness exercises, puzzles)
- Stories of successful South Africans who struggled in school

### University & Career Readiness

- Dream course planner — input your target and current position, get long-term strategies
- University and bursary navigator with real-world career explanations
- NSFAS and bursary application guide with deadline reminders
- Career and subject choice guidance based on performance and interests
- Financial literacy modules (loans, budgeting, cost of living)

### Peer-to-Peer Learning

- Virtual study groups with shared notes and scheduled sessions
- "Explain It To Me" — students record concept explanations to solidify understanding and help peers

### Multi-Role Views

| Role | Capabilities |
|------|-------------|
| **Student** | Practice tests, goals, diary, chatbot, tutor booking, career planning, study groups, learning journey map |
| **Teacher** | Assign assessments, class-wide gap analysis, differentiated assignment creation, goal verification |
| **Parent/Guardian** | "How Can I Help?" dashboard, actionable support suggestions, celebration alerts, progress analytics |
| **School Admin** | Whole-school analytics, university readiness reporting, teacher and class oversight |
| **Tutor** | Course creation, session scheduling, earnings analytics |

### South African Context

- **Data-light and offline functionality** — downloaded practice tests, local diary, pre-loaded goal-setting modules
- **Catch-up core skills modules** — "Essential Algebra for Grade 11 Physics," "Grammar for Essay Writing"
- **Multi-language support** — isiZulu, Afrikaans, isiXhosa

### Pricing

| Plan | Target |
|------|--------|
| Freemium | Basic goal setting, limited practice tests, diary, core wellbeing tools |
| Student | Full AI features, unlimited practice, chatbot, career tools |
| Family | Multi-child support, parent dashboard, celebration alerts |
| School | Whole-school deployment, teacher tools, admin analytics, university readiness reporting |

Bursary partnerships planned to surface student progress and university readiness data to funders.

## Quick Start

### Docker Compose (all services — dev environment)

```bash
cd infrastructure
cp .env.example .env    # fill in secrets
docker compose -f docker-compose.dev.yml up
```

This starts all 20 services plus PostgreSQL and Redis on a single machine.

### Individual Services

**Frontend:**
```bash
cd ui
cp .env.example .env.local
npm install && npm run dev    # http://localhost:3000
```

**Auth Provider:**
```bash
cd auth-provider
dotnet run --project src/Aptiverse.Auth/Aptiverse.Auth.csproj    # http://localhost:5000
```

**API Microservice (example: booking-service):**
```bash
cd api/booking-service
dotnet run --project src/Aptiverse.Booking/Aptiverse.Booking.csproj
```

**Payment Gateway:**
```bash
cd payment-gateway
bundle install && bin/rails db:prepare && bin/rails server    # http://localhost:3001
```

**AI Service:**
```bash
cd ai-service
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn app.main:app --port 8000    # http://localhost:8000
```

**Event Architecture:**
```bash
cd event-architecture/deployments
docker compose up    # Kafka, RabbitMQ, Zookeeper, Prometheus, Grafana
```

## API Reference

### Authentication

```bash
# Register
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"SecurePass123!","firstName":"Thabo","lastName":"Mokoena"}'

# Login
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"SecurePass123!"}'

export TOKEN="<accessToken from response>"
```

### Payments (Stripe)

```bash
curl -s -X POST http://localhost:3001/payments/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "amount_cents": 9900,
    "currency": "ZAR",
    "success_url": "https://aptiverse.co.za/payment/success",
    "cancel_url": "https://aptiverse.co.za/payment/cancel",
    "metadata": {"plan": "student_monthly"}
  }'
```

### Event Publishing

```bash
curl -s -X POST http://localhost:8080/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt-001",
    "event_type": "goal.completed",
    "source": "goals-service",
    "actor_id": "student-42",
    "actor_role": "student",
    "tenant_id": "school-101",
    "payload": {"goal_id": "g-123", "subject": "Mathematics"}
  }'
```

Each .NET service exposes OpenAPI docs at `http://localhost:<port>/swagger` (Scalar UI).

### Auth Endpoints

| Method | Endpoint | Auth Required |
|--------|----------|---------------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/refresh-token` | Yes |
| POST | `/api/auth/validate-token` | No |
| POST | `/api/auth/logout` | Yes |
| POST | `/api/auth/change-password` | Yes |
| POST | `/api/auth/forgot-password` | No |
| POST | `/api/auth/reset-password` | No |
| GET | `/api/auth/me` | Yes |
| POST | `/api/auth/confirm-email` | No |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/checkout_sessions` | Create Stripe checkout session |
| POST | `/webhooks/stripe` | Stripe webhook receiver |
| GET | `/up` | Health check |

### Stripe Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Mark payment as paid, store payment_intent_id |
| `payment_intent.payment_failed` | Mark payment as failed |
| `charge.refunded` | Mark payment as refunded |

## Deployment

### Environments

| Environment | Infrastructure | Deploy Method |
|-------------|---------------|---------------|
| Dev | Single EC2 (t3.2xlarge) + Docker Compose | Manual / workflow_dispatch |
| Staging | EKS (spot instances) + RDS + ElastiCache + ALB | workflow_dispatch |
| Production | EKS (on-demand) + RDS (multi-AZ) + ElastiCache + ALB | workflow_dispatch with canary (Argo Rollouts) |

### AWS Infrastructure (Terraform)

```
infrastructure/terraform/
  bootstrap/              # S3 state bucket + DynamoDB lock table
  modules/
    vpc/                  # VPC, subnets, NAT gateway, internet gateway
    ec2/                  # EC2 instance with Docker + Compose (dev)
    eks/                  # EKS cluster, managed node groups, OIDC
    rds/                  # PostgreSQL RDS
    elasticache/          # Redis ElastiCache
    route53/              # DNS hosted zone and records
    alb/                  # Application Load Balancer
    security/             # Security groups, IAM roles
  envs/
    dev/                  # Single EC2 + Docker Compose
    staging/              # EKS (spot) + managed services
    prod/                 # EKS (on-demand, canary) + managed services
```

```bash
# Bootstrap (one-time)
cd infrastructure/terraform/bootstrap
terraform init && terraform apply

# Deploy an environment
cd infrastructure/terraform/envs/dev
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

### CI/CD Pipeline

**CI** (runs on push/PR to `main`, path-filtered per service):
- Builds Docker image
- Pushes to Docker Hub (`7irelo/aptiverse-*:latest` + `:<commit-sha>`) on main branch pushes
- PRs only build (no push)

**CD** (manual trigger via `workflow_dispatch`):
- Pulls image from Docker Hub (selectable tag, defaults to `latest`)
- Deploys to EC2 via SSH (dev) or EKS via kubectl (staging/prod)

GitHub Actions authenticates to AWS via OIDC (no stored credentials).

### Docker Hub Images

| Service | Image |
|---------|-------|
| 14 .NET API services | `7irelo/aptiverse-{name}-service` |
| Auth Provider | `7irelo/aptiverse-auth-provider` |
| AI Service | `7irelo/aptiverse-ai-service` |
| Event Architecture | `7irelo/aptiverse-event-server` |
| Notification Service | `7irelo/aptiverse-notification-service` |
| Payment Gateway | `7irelo/aptiverse-payment-gateway` |
| Frontend | `7irelo/aptiverse-frontend` |

## Testing

### Payment Gateway

```bash
cd payment-gateway
bin/brakeman --no-pager       # security scan
bin/importmap audit            # JS dependency audit
bin/rubocop -f github          # linting
bin/rails db:migrate test      # unit + integration tests
bin/rails test:system          # system tests (requires Chrome)
```

### Event Architecture

```bash
cd event-architecture
buf lint && buf generate
go vet ./...
staticcheck ./...
go test -race -cover ./...
```

### Frontend

```bash
cd ui
npm run lint
npm run build
```

### .NET Microservices

```bash
cd api/booking-service
dotnet build && dotnet test
```

## Design Decisions

**Event Envelope with Deduplication** — All domain events flow through the event-architecture service using a standardised envelope (event_id, event_type, source, actor, correlation_id, payload). A deduplication layer (window: 100,000 events, TTL: 10 minutes) prevents duplicate processing. Events route to Kafka for ordered delivery and RabbitMQ for guaranteed consumption.

**Clean Architecture per Service** — Every .NET microservice follows Controllers → Application (DTOs, Services, Mapping) → Domain (business logic) → Infrastructure (persistence, external integrations). This keeps business logic independent of frameworks and data access.

**CPU-Only PyTorch** — The AI service uses CPU-only PyTorch to keep the Docker image under 1GB (vs ~9GB with CUDA). GPU acceleration is not needed for the inference workloads (text generation, OCR, classification).

**Stripe Webhook Verification** — Payment webhooks validate the `Stripe-Signature` header against a stored secret before processing. Payment records track the full lifecycle: created → paid/failed → refunded.

**JWT Gateway Pattern** — The auth-provider issues JWTs (configurable expiry, issuer: `aptiverse-api`, audience: `aptiverse-users`). Downstream services validate tokens and trust forwarded identity headers. OAuth2 flows support Google and Microsoft accounts.

**Shared PostgreSQL with Service Isolation** — Services share a PostgreSQL instance (RDS in production) but maintain logical separation through Entity Framework Core migrations per service.

**Multi-Protocol Event Routing** — Kafka handles high-throughput ordered event streams. RabbitMQ handles guaranteed delivery patterns (email notifications, webhook retries). The event-architecture service bridges both with rate limiting and health-checked broker availability.

**Canary Deployments (Production)** — Argo Rollouts gradually shifts traffic (10% → 30% → 60% → 100%) to new versions in production, with automatic rollback on error rate spikes.

**OIDC for GitHub Actions** — GitHub Actions authenticates to AWS via OpenID Connect federation, eliminating long-lived AWS access keys in CI/CD secrets.

## Repository Structure

```
aptiverse/
├── ui/                              # Next.js 15 frontend
├── api/
│   ├── academic-planning-service/   # SBA and subject planning
│   ├── audit-service/               # Audit logging
│   ├── booking-service/             # Tutor session booking
│   ├── calendar-service/            # Calendar integration
│   ├── entitlements-service/        # Subscription and feature access
│   ├── feature-flags-service/       # Feature flag management
│   ├── goals-service/               # Goal tracking and rewards
│   ├── insights-service/            # Predictive analytics
│   ├── marketplace-service/         # Tutor marketplace
│   ├── mastery-service/             # Strength and progress tracking
│   ├── moderation-service/          # Content moderation
│   ├── practice-service/            # Practice test generation
│   ├── support-service/             # Help desk and support
│   └── wellbeing-service/           # Mental wellbeing
├── ai-service/                      # FastAPI AI engine (ML, OCR, generation)
├── auth-provider/                   # .NET auth (JWT, OAuth2)
├── payment-gateway/                 # Rails + Stripe payments
├── notification-service/            # Go email service (RabbitMQ consumer)
├── event-architecture/              # Go event bus (Kafka + RabbitMQ)
├── infrastructure/
│   ├── terraform/                   # AWS infrastructure (VPC, EKS, RDS, etc.)
│   ├── docker-compose.dev.yml       # All services for local/dev
│   └── .env.example                 # Environment variable template
└── .github/workflows/               # CI/CD pipelines (40 workflows)
```

## Status

Active development. Twenty independently deployable microservices across academic planning, AI assessment, marketplace, payments, and wellbeing domains. Infrastructure migrating from single EC2 to EKS with canary deployments.

## Licence

All rights reserved.
