# 🎓 Aptiverse Academic Planning & Study Service

<img width="1916" height="908" alt="Aptiverse Academic Planning" src="https://github.com/user-attachments/assets/1b8c5117-eb54-426a-bf2b-d1c0fee7c50c" />

**Aptiverse Academic Planning** is the dedicated backend service for **academic planning** in the Aptiverse ecosystem. It manages a student’s **subjects**, **topics**, **assessments (SBA/tests/exams)**, **study sessions**, and **weekly study targets**—providing the core data needed to build schedules, track workload, and plan ahead.

> This repository focuses strictly on the **Academic Planning bounded context**. Other domains (practice attempts, mastery, insights, chatbot, marketplace, payments, etc.) live in separate services.

---

## ✅ What This Service Owns

### Core Responsibilities

* Student subject enrollment & configuration (grade, active subjects)
* Subject curriculum structure (subjects → topics)
* Topic prioritization & focus (what matters most right now)
* Assessment planning (SBA / tests / exams / assignments)
* Study sessions (time spent studying per subject / per day)
* Weekly study hour targets

### Domain Concepts

* **Subject**: e.g., Mathematics, Physical Sciences
* **Topic**: e.g., Trigonometry, Organic Chemistry
* **StudentSubject**: a student’s enrolled subject + grade + status
* **StudentSubjectTopic**: priority/focus state per topic for that student
* **Assessment**: planned academic assessments + breakdowns
* **StudySession**: logged study time
* **WeeklyStudyHour**: weekly target hours per subject or overall

---

## 🏗️ Architecture & Tech Stack

| Component        | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Framework        | .NET 10, ASP.NET Core                              |
| Database         | PostgreSQL + Entity Framework Core                 |
| API Docs         | Swagger / OpenAPI                                  |
| Auth             | JWT (validated via shared auth provider / gateway) |
| Containerization | Docker (optional)                                  |

---

## 📁 Project Structure

```
src/
├── Aptiverse.AcademicPlanning/                          # HTTP API (Controllers, Program, DI)
├── Aptiverse.AcademicPlanning.Application/              # DTOs, Services, Mapping Profiles
├── Aptiverse.AcademicPlanning.Domain/                   # Domain Models, Enums, Interfaces
├── Aptiverse.AcademicPlanning.Infrastructure/           # EF Core DbContext, Migrations, Repos
└── Aptiverse.AcademicPlanning.Core/                     # Shared abstractions/utilities
```

> Naming note: your repo is **Academic Planning**, but some folders still carry legacy naming from the older monolith split. You can rename projects later once things are stable.

---

## 🚀 Features & Endpoints (Academic Planning)

### Subjects & Topics

```
GET  /api/subjects
POST /api/subjects
GET  /api/topics
POST /api/topics
```

### Student Subjects & Topic Priorities

```
GET  /api/student-subjects
POST /api/student-subjects
PUT  /api/student-subjects/{id}

GET  /api/student-subject-topics
POST /api/student-subject-topics
PUT  /api/student-subject-topics
```

### Assessments & Breakdowns

```
GET  /api/assessments
POST /api/assessments
PUT  /api/assessments/{id}

GET  /api/assessment-breakdowns
POST /api/assessment-breakdowns
```

### Study Sessions & Weekly Targets

```
GET  /api/study-sessions
POST /api/study-sessions

GET  /api/weekly-study-hours
POST /api/weekly-study-hours
PUT  /api/weekly-study-hours/{id}
```

---

## 🛠️ Development Setup

### Prerequisites

* .NET 10 SDK
* PostgreSQL 13+
* Docker (optional)

### App Settings (example)

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=aptiverse_academicplanning;Username=postgres;Password=password"
  },
  "Jwt": {
    "Issuer": "aptiverse-auth",
    "Audience": "aptiverse-academicplanning",
    "Key": "local-dev-only"
  }
}
```

### Local Development

```bash
dotnet restore
dotnet ef database update --project src/Aptiverse.AcademicPlanning.Infrastructure --startup-project src/Aptiverse.AcademicPlanning
dotnet run --project src/Aptiverse.AcademicPlanning
```

---

## 🔍 Health & Docs

### Health Checks

```
GET /health
GET /health/db
```

### API Documentation

* Scaler: `/dev`
* Redoc: `/docs`

---

## 🔐 Security Model

This service expects a validated student identity (e.g., `StudentUserId`) from:

* an API gateway, or
* an external auth provider issuing JWT tokens.

Authorization rules are applied per endpoint (student-scoped access where relevant).

---

## 📄 License

This project is part of the Aptiverse ecosystem and is proprietary software. All rights reserved.

---
