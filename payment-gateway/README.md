# Aptiverse Payment Gateway

Rails service for Aptiverse Stripe payment flows.

## What It Implements

- `POST /payments/checkout_sessions`
  - Creates a Stripe Checkout Session (`mode=payment`)
  - Stores a local `Payment` record with status `created`
  - Returns JSON: `{ id, url }`
- `POST /webhooks/stripe`
  - Verifies Stripe signatures with `STRIPE_WEBHOOK_SECRET`
  - Handles:
    - `checkout.session.completed` -> `paid`
    - `payment_intent.payment_failed` -> `failed`
    - `charge.refunded` -> `refunded`

## Database (Shared with Existing API)

This service is configured to use the same Postgres defaults used by the API in this repo:

- host: `localhost`
- database: `aptiverse`
- user: `postgres`
- password: `postgres`

Configure via environment variables:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=aptiverse
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

`config/database.yml` reads these values directly.

## Required Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

See `.env.example` for a template.

## Setup

```bash
cd payment-gateway
bundle install
bin/rails db:migrate
bin/rails test
bin/rubocop
```

## Run Locally

```bash
cd payment-gateway
bin/rails server
```

Service default URL: `http://localhost:3000`.

## Stripe Webhook Local Testing

1. Start Rails server.
2. Start Stripe CLI forwarding:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

3. Copy the webhook secret output by Stripe CLI and set `STRIPE_WEBHOOK_SECRET`.
4. Trigger test events, for example:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

## Sample API Calls

### Create Checkout Session

```bash
curl -X POST http://localhost:3000/payments/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "11111111-1111-4111-8111-111111111111",
    "amount_cents": 2500,
    "currency": "usd",
    "success_url": "http://localhost:3000/success",
    "cancel_url": "http://localhost:3000/cancel",
    "metadata": { "plan": "student" }
  }'
```

### Stripe Webhook Endpoint (manual test payload)

Use Stripe CLI in practice. If needed for manual tests:

```bash
curl -X POST http://localhost:3000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=123,v1=fake" \
  -d '{"id":"evt_test","type":"checkout.session.completed","data":{"object":{"id":"cs_test"}}}'
```
