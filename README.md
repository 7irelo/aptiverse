# Aptiverse

An AI-powered student success platform built for South African high school learners. Twelve services handle academic planning, goal tracking, mastery analytics, practice generation, AI-driven insights, tutor marketplace, booking, payments, authentication, notifications, and event routing — all wired together with Kafka, RabbitMQ, Redis, and PostgreSQL.

The platform is purpose-built for Grades 11 and 12, targeting SBA preparation, university readiness, bursary access, and mental wellbeing. Everything is framed around growth, mastery, and empowerment — never toxic comparison or ranking.

## Architecture

### Services

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| `ui` | 3000 | Next.js 15, React 19, TypeScript | Web client (marketing + dashboard) |
| `auth-provider` | 5006 | .NET 10, ASP.NET Core | Authentication, JWT tokens, OAuth (Google, Microsoft) |
| `academic-planning-service` | 5196 | .NET 10, ASP.NET Core | Course and subject planning, SBA scheduling |
| `goals-service` | 5196 | .NET 10, ASP.NET Core | Student goal tracking, verification, rewards |
| `mastery-service` | 5196 | .NET 10, ASP.NET Core | Strength tracking, term-over-term progress |
| `practice-service` | 5196 | .NET 10, ASP.NET Core | Practice test generation and rubric-based assessment |
| `insights-service` | 5196 | .NET 10, ASP.NET Core | Predictive analytics, pattern analysis |
| `marketplace-service` | 5196 | .NET 10, ASP.NET Core | Tutor marketplace, course listings |
| `booking-service` | 5196 | .NET 10, ASP.NET Core | Tutor session booking and availability |
| `entitlements-service` | 5196 | .NET 10, ASP.NET Core | Subscription access control, feature gating |
| `ai-service` | 8000 | Python 3.11, FastAPI | ML models for analysis, generation, OCR |
| `payment-gateway` | 80 | Rails 8, Ruby 3.4 | Stripe payment processing, webhooks |
| `notification-service` | 8080 | Go 1.21 | Event-driven email delivery via RabbitMQ |
| `event-architecture` | 8080 | Go 1.22 | Event ingestion, routing, deduplication (Kafka + RabbitMQ) |

### Infrastructure

| Component | Technology | Port |
|-----------|------------|------|
| Database | PostgreSQL (Azure Flexible Server) | 5432 |
| Cache | Redis (Azure Cache / redis-stack) | 6379 |
| Message Broker | Apache Kafka (Confluent 7.6.0) | 9092 |
| Message Queue | RabbitMQ 3.13 | 5672, 15672 (management) |
| Coordination | Zookeeper (Confluent 7.6.0) | 2181 |
| Metrics | Prometheus v2.50.0 | 9090 |
| Dashboards | Grafana 10.3.1 | 3000 |

### Tech Stack

**Backend:** .NET 10, ASP.NET Core, Entity Framework Core, C#, Clean Architecture (Controllers → Application → Domain → Infrastructure)

**Frontend:** Next.js 15 (Turbopack), React 19, TypeScript 5, Tailwind CSS 4, Radix UI, React Hook Form, Zod 4, TanStack Query 5, NextAuth.js

**AI/ML:** Python 3.11, FastAPI, PyTorch, HuggingFace Transformers, scikit-learn, FAISS (vector search), OpenCV, Tesseract OCR, pandas, NumPy

**Payments:** Ruby on Rails 8, Stripe (checkout sessions, webhooks, refunds)

**Events:** Go 1.22, Apache Kafka, RabbitMQ, Protocol Buffers, gRPC, Prometheus metrics, zap structured logging

**Notifications:** Go 1.21, RabbitMQ consumer, SMTP (Gmail), exponential backoff retry

**Infrastructure:** Terraform (Azure — AKS, PostgreSQL Flexible Server, Redis Cache, Container Registry, Key Vault, Front Door, API Management, Log Analytics), Docker, GitHub Actions

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

### Docker Compose (event infrastructure)

```bash
cd event-architecture/deployments
docker compose up    # starts Kafka, RabbitMQ, Zookeeper, Prometheus, Grafana
```

| Endpoint | URL |
|----------|-----|
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |
| Event Server | http://localhost:8080 |

### AI Service

```bash
cd ai-service
docker compose up --build    # FastAPI at http://localhost:8000
```

### Frontend

```bash
cd ui
cp .env.example .env.local    # configure API URLs
npm install
npm run dev                   # http://localhost:3000 (Turbopack)
```

### Auth Provider

```bash
cd auth-provider
cp .env.example .env          # configure DB, Redis, JWT, OAuth credentials
dotnet run --project src/Aptiverse.Auth/Aptiverse.Auth.csproj    # http://localhost:5006
```

### API Microservices (example: booking-service)

```bash
cd api/booking-service
dotnet run --project src/Aptiverse.Booking/Aptiverse.Booking.csproj    # http://localhost:5196
```

### Payment Gateway

```bash
cd payment-gateway
cp .env.example .env          # configure Stripe keys and DB
bundle install
bin/rails db:prepare
bin/rails server              # http://localhost:3000
```

### Notification Service

```bash
cd notification-service
cp .env.example .env          # configure RabbitMQ and SMTP
go build -o bin/email-service ./cmd/email-service
./bin/email-service           # http://localhost:8080
```

## API Reference

### Authentication

```bash
# Register
curl -s -X POST http://localhost:5006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"SecurePass123!","firstName":"Thabo","lastName":"Mokoena"}'

# Login
curl -s -X POST http://localhost:5006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"SecurePass123!"}'

export TOKEN="<accessToken from response>"

# Get current user
curl -s http://localhost:5006/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Validate token
curl -s -X POST http://localhost:5006/api/auth/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token":"'$TOKEN'"}'
```

### Payments (Stripe)

```bash
# Create checkout session
curl -s -X POST http://localhost:3000/payments/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "amount_cents": 9900,
    "currency": "ZAR",
    "success_url": "https://aptiverse.co.za/payment/success",
    "cancel_url": "https://aptiverse.co.za/payment/cancel",
    "metadata": {"plan": "student_monthly"}
  }'
# Returns: { "id": "cs_...", "url": "https://checkout.stripe.com/..." }
```

### Event Publishing

```bash
# Publish single event
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

# Publish batch (max 100)
curl -s -X POST http://localhost:8080/api/v1/events/batch \
  -H "Content-Type: application/json" \
  -d '{"events": [...]}'
```

### Booking

```bash
# Create tutor availability
curl -s -X POST http://localhost:5196/api/tutor-availabilities \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tutorId": 1, "dayOfWeek": "Monday", "startTime": "14:00", "endTime": "16:00", "isAvailable": true}'

# List tutor-student relationships
curl -s "http://localhost:5196/api/tutor-students?tutorId=1&isActive=true&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

Each .NET service exposes OpenAPI docs at `http://localhost:<port>/swagger` (Scalar UI) and `http://localhost:<port>/redoc` (ReDoc).

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

| Environment | Infrastructure | Trigger |
|-------------|---------------|---------|
| Local | Docker Compose (Kafka, RabbitMQ, Redis, PostgreSQL) | `docker compose up` |
| Dev | Azure AKS + in-cluster infra via Terraform | Push to `main` |
| Production | Azure AKS + managed services (PostgreSQL Flexible Server, Redis Cache, ACR) | Manual workflow |

### Azure Infrastructure (Terraform)

```
infrastructure/terraform/
  modules/
    aks/          # Azure Kubernetes Service (SystemAssigned identity, Azure CNI)
    postgres/     # PostgreSQL Flexible Server (v14, 7-day backup retention)
    redis/        # Azure Cache for Redis
    acr/          # Azure Container Registry
    keyvault/     # Key Vault for secrets
    storage/      # Storage account
    network/      # VNet, AKS subnet, private endpoints subnet
    monitor/      # Log Analytics workspace
    apim/         # API Management
    frontdoor/    # Azure Front Door
    naming/       # Resource naming convention
  envs/
    dev/          # Dev environment configuration
    staging/      # Staging configuration
    prod/         # Production configuration
```

```bash
cd infrastructure/terraform/envs/dev
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform plan
```

### CI/CD Pipeline

**CI** runs on every PR and push to `main`:

| Workflow | Trigger | Steps |
|----------|---------|-------|
| Auth Provider Build | Push/PR to `main` | Docker build, artifact storage (1-day retention) |
| Auth Provider Deploy | Manual dispatch | SSH deploy to EC2, Redis stack, aptiverse-net network |
| Payment Gateway CI | PR/push (payment-gateway/**) | Brakeman security scan, importmap audit, RuboCop lint, Rails test suite |
| Event Architecture Build | PR/push (event-architecture/**) | `go vet`, staticcheck, `go test -race -cover`, buf lint/generate, Docker build, push to GHCR |
| UI Deploy | Push to `main`, manual | `npm run build`, Docker build, deploy to EC2 |
| Terraform Plan | PR (infrastructure/**) | `terraform fmt -check`, `terraform plan`, PR comment |
| Terraform Apply | Push to `main` (infrastructure/**) | `terraform apply -auto-approve` |
| API Service Builds | Push to `main`, manual | .NET build, Docker image, artifact storage |

## Testing

### Payment Gateway

```bash
cd payment-gateway
bundle install
bin/brakeman --no-pager              # security scan
bin/importmap audit                  # JS dependency audit
bin/rubocop -f github                # linting
bin/rails db:test:prepare test       # unit + integration tests
bin/rails test:system                # system tests (requires Chrome)
```

### Event Architecture

```bash
cd event-architecture
buf lint                             # protobuf linting
buf generate                         # code generation
go vet ./...                         # vet
staticcheck ./...                    # static analysis
go test -race -cover ./...           # tests with race detection
```

### Frontend

```bash
cd ui
npm run lint                         # ESLint
npm run build                        # type-check + build
```

### .NET Microservices

```bash
cd api/booking-service
dotnet build
dotnet test
```

## Design Decisions

**Event Envelope with Deduplication** — All domain events flow through the event-architecture service using a standardised envelope (event_id, event_type, source, actor, correlation_id, payload). A deduplication layer (window: 100,000 events, TTL: 10 minutes) prevents duplicate processing. Events route to Kafka for ordered delivery and RabbitMQ for guaranteed consumption.

**Clean Architecture per Service** — Every .NET microservice follows Controllers → Application (DTOs, Services, Mapping) → Domain (business logic) → Infrastructure (persistence, external integrations) → Core (shared entities). This keeps business logic independent of frameworks and data access.

**Stripe Webhook Verification** — Payment webhooks validate the `Stripe-Signature` header against a stored secret before processing. Payment records track the full lifecycle: created → paid/failed → refunded. The checkout session ID and payment intent ID are both stored for traceability.

**JWT Gateway Pattern** — The auth-provider issues JWTs (configurable expiry, issuer: `aptiverse-api`, audience: `aptiverse-users`). Downstream services validate tokens and trust forwarded identity headers. OAuth2 flows support Google and Microsoft accounts.

**Shared PostgreSQL with Service Isolation** — Services share a PostgreSQL instance (Azure Flexible Server in production) but maintain logical separation through Entity Framework Core migrations per service.

**Multi-Protocol Event Routing** — Kafka handles high-throughput ordered event streams (assessment submissions, analytics). RabbitMQ handles guaranteed delivery patterns (email notifications, webhook retries). The event-architecture service bridges both with rate limiting (1,000 events/source) and health-checked broker availability.

**Protocol Buffers for Event Schema** — Events are defined in `.proto` files and generated with `buf`, ensuring schema consistency across Go, .NET, and Python consumers.

**Offline-First for South African Context** — The frontend is built data-light. Practice tests, diary entries, and goal-setting modules are designed to work offline, acknowledging that a large portion of the target market has limited or expensive data.

## Roles

| Role | Access |
|------|--------|
| Student | Own profile, goals, practice tests, diary, chatbot, tutor booking, career tools |
| Teacher | Assigned students, assessments, class analytics, gap analysis, goal verification |
| Parent/Guardian | Child's progress, actionable support dashboard, celebration alerts |
| School Admin | Whole-school analytics, university readiness reporting, teacher oversight |
| Tutor | Course management, session scheduling, student relationships, earnings |
| Admin/Superuser | Full platform access, user management |

## Repository Structure

```
aptiverse/
├── ui/                              # Next.js 15 frontend
├── api/
│   ├── academic-planning-service/   # SBA and subject planning
│   ├── booking-service/             # Tutor session booking
│   ├── entitlements-service/        # Subscription and feature access
│   ├── goals-service/               # Goal tracking and rewards
│   ├── insights-service/            # Predictive analytics
│   ├── marketplace-service/         # Tutor marketplace
│   ├── mastery-service/             # Strength and progress tracking
│   └── practice-service/            # Practice test generation
├── ai-service/                      # FastAPI AI engine (ML, OCR, generation)
├── auth-provider/                   # .NET auth (JWT, OAuth2)
├── payment-gateway/                 # Rails + Stripe payments
├── notification-service/            # Go email service (RabbitMQ consumer)
├── event-architecture/              # Go event bus (Kafka + RabbitMQ)
├── infrastructure/                  # Terraform (Azure AKS, PostgreSQL, Redis)
└── .github/workflows/               # CI/CD pipelines
```

## Status

Active development. Services are independently deployable and evolving across academic planning, AI assessment, marketplace, and wellbeing domains.

## Licence

All rights reserved.
