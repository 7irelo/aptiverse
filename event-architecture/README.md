# Aptiverse Event Architecture Server

Event ingestion server for the Aptiverse AI-powered educational platform. Accepts events via REST API, routes them to Kafka (streaming/analytics) or RabbitMQ (commands/tasks), and exposes Prometheus metrics.

## Architecture

```
Client  ──POST /api/v1/events──▶  API Server  ──▶  Dedup Check
                                                        │
                                          ┌─────────────┴─────────────┐
                                          ▼                           ▼
                                   Kafka (streaming)          RabbitMQ (commands)
                                   ├─ student.*               ├─ notification.*
                                   ├─ assessment.*            ├─ payment.*
                                   └─ analytics.*             ├─ tutor.*
                                                              ├─ reward.*
                                                              ├─ calendar.*
                                                              └─ wellbeing.*
```

## Quick Start

### Prerequisites

- Go 1.22+
- Docker & Docker Compose
- [buf](https://buf.build/) (for protobuf generation)

### Run the full stack

```bash
# Start all services (Kafka, RabbitMQ, Prometheus, Grafana, event-server)
make docker-compose-up

# Verify
curl http://localhost:8080/healthz
curl http://localhost:8080/readyz
```

### Local development

```bash
# Generate protobuf Go code
make proto

# Build
make build

# Run tests
make test

# Run the server (requires Kafka + RabbitMQ running)
make run
```

## API

### POST /api/v1/events

Publish a single event.

```bash
curl -X POST http://localhost:8080/api/v1/events \
  -H 'Content-Type: application/json' \
  -d '{
    "event_id": "019462a0-b1c2-7def-8abc-1234567890ab",
    "event_type": "assessment.sba_created",
    "source": "student-service",
    "actor_id": "usr_123",
    "actor_role": "student",
    "tenant_id": "sch_456",
    "payload": {"sba_id": "sba_789", "subject": "Mathematics"},
    "metadata": {"ip": "10.0.0.1"}
  }'
```

Response: `202 Accepted`

### POST /api/v1/events/batch

Publish up to 100 events in a single request.

```bash
curl -X POST http://localhost:8080/api/v1/events/batch \
  -H 'Content-Type: application/json' \
  -d '{"events": [...]}'
```

### GET /healthz

Liveness probe. Returns `200 OK`.

### GET /readyz

Readiness probe. Returns `200 OK` if Kafka and RabbitMQ are connected, `503` otherwise.

### GET /metrics

Prometheus metrics endpoint.

## Response Codes

| Code | Meaning |
|------|---------|
| 202  | Event accepted and queued for publish |
| 400  | Validation failure (missing fields, unknown event_type) |
| 429  | Rate limit exceeded |
| 503  | Broker health check failing |

## Event Types

| Domain | Event Types | Broker |
|--------|------------|--------|
| assessment | sba_created, sba_goal_set, practice_generated, practice_submitted, graded | Kafka |
| student | activity_logged, strength_analysis, journey_updated, goal_created, goal_progress | Kafka |
| analytics | ai_inference, audit | Kafka |
| notification | email, push, sms | RabbitMQ |
| payment | initiated, completed, failed, subscription_changed | RabbitMQ |
| tutor | match_requested, session_booked, course_published, session_completed | RabbitMQ |
| reward | verification_requested, verified, granted | RabbitMQ |
| calendar | sync_requested, reminder_scheduled | RabbitMQ |
| wellbeing | mood_checkin, diary_entry, stress_alert, psychologist_referral | RabbitMQ |

## Configuration

All configuration is via environment variables. See [`configs/.env.example`](configs/.env.example) for the full list.

| Variable | Default | Description |
|----------|---------|-------------|
| SERVER_PORT | 8080 | HTTP listen port |
| KAFKA_BROKERS | localhost:9092 | Comma-separated Kafka brokers |
| KAFKA_ACKS | all | Kafka ack mode (all/leader) |
| RABBITMQ_URL | amqp://guest:guest@localhost:5672/ | RabbitMQ connection string |
| DEDUP_WINDOW_SIZE | 100000 | Max entries in dedup LRU cache |
| DEDUP_TTL | 10m | Dedup window duration |
| MAX_BATCH_SIZE | 100 | Max events per batch request |
| ENVIRONMENT | development | development or production |

## Observability

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin) — pre-built dashboard included
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## Project Structure

```
cmd/server/          Entry point
internal/
  api/               HTTP server, handlers, middleware, health probes
  broker/kafka/      Kafka producer with retries and DLQ
  broker/rabbitmq/   RabbitMQ publisher with confirms and DLX
  config/            Environment-based configuration
  dedup/             In-memory LRU deduplication
  metrics/           Prometheus metric definitions
  router/            Event type → broker routing
  schema/            Event type validation registry
proto/               Protobuf schema definitions
gen/proto/           Generated Go code (via buf generate)
deployments/         Docker, Compose, Grafana dashboards
configs/             Prometheus config, env example
```

## Delivery Guarantees

- **Deduplication**: In-memory LRU keyed on `event_id` (UUIDv7) with configurable TTL window
- **Kafka**: acks=all (production), idempotent producer, 3 retries with exponential backoff, DLQ topic on permanent failure
- **RabbitMQ**: Publisher confirms, persistent delivery, mandatory flag, 3 retries, dead-letter exchange on failure
- **Partition keys**: Derived per domain (actor_id for student/assessment, correlation_id for AI analytics, tenant_id for audit)
