# Aptiverse

Aptiverse is an AI-powered student success platform built for South African high school learners (especially Grades 11 and 12). It combines academic planning, personalized practice, mastery analytics, wellbeing support, and tutor access in one system.

## Project Summary

The platform is designed around a growth-first mindset: helping students improve consistently instead of chasing unhealthy comparison.

Core capabilities include:

- SBA-aligned planning for subjects, topics, assessments, and study sessions
- AI-assisted goal setting, progress tracking, and motivation systems
- Practice, mastery, and insight services for targeted improvement
- Diary and wellbeing signals to support healthy study habits
- Tutor marketplace, booking, courses, and payment flows
- Multi-role support for students, teachers, parents, tutors, and school admins

## Repository Structure

This repository is a multi-service workspace:

- `ui/` - Next.js frontend (marketing + dashboard experience)
- `api/` - .NET microservices (planning, goals, mastery, insights, marketplace, booking, entitlements, and core API)
- `ai-service/` - FastAPI AI service for analysis and generation workflows
- `auth-provider/` - .NET authentication/authorization service
- `payment-gateway/` - Rails payment and subscription service
- `notification-service/` - Go email/notification service
- `event-architecture/` - Go event ingestion/routing layer (Kafka + RabbitMQ)
- `infrastructure/` - Terraform infrastructure configuration

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- APIs: .NET 10, ASP.NET Core, EF Core, PostgreSQL
- AI: Python, FastAPI
- Messaging/Eventing: RabbitMQ, Kafka
- Other services: Go, Ruby on Rails
- Infra: Terraform, Docker

## Getting Started

Each service is independently documented and can be run on its own.

1. Pick the service directory you want to run.
2. Open that service's `README.md`.
3. Configure environment variables.
4. Start with Docker or the local runtime instructions in that service.

## Status

Active development. The architecture is modular and evolving as features are split into focused services.
