# 🎯 Aptiverse Goals & Growth Service

## Scaler

<img width="1900" height="909" alt="image" src="https://github.com/user-attachments/assets/1c89e6fb-e792-4da5-85dc-99f586e8f848" />

## ReDoc

<img width="1904" height="910" alt="image" src="https://github.com/user-attachments/assets/1dffa413-c2d9-4f72-b557-77694194fdce" />

**Aptiverse Goals & Growth Service** is the dedicated microservice responsible for **student goals, motivation systems, growth tracking, and rewards** within the Aptiverse ecosystem.

> This service owns **goal setting, milestones, student growth metrics, points, and rewards**.
> It does **NOT** manage subjects, assessments, practice tests, tutors, or payments — those belong to other services.

---

## 🌟 Service Overview

The Goals & Growth Service focuses on **long-term student development**, helping learners turn academic effort into structured progress and motivation.

It enables:

* 🎯 Academic & personal goal setting
* 📈 Growth tracking over time
* 🪙 Gamification through points and rewards
* 🧩 Goal milestones and achievement stages
* 🏆 Recognition of progress, not just performance

This service powers the **motivation engine** of the Aptiverse platform.

---

## 🏗️ Architecture & Technology Stack

| Component        | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | .NET 10, ASP.NET Core                               |
| Database         | PostgreSQL + Entity Framework Core                  |
| Authentication   | JWT (validated via shared Auth service / gateway)   |
| API Docs         | Scaler / OpenAPI / ReDoc                           |
| Containerization | Docker                                              |
| Communication    | Async events (via platform message bus, if enabled) |

---

## 📁 Project Structure

```
src/
├── Aptiverse.Goals/                  # Controllers & API layer
├── Aptiverse.Goals.Application/      # DTOs, Services, Business Logic
├── Aptiverse.Goals.Domain/           # Domain Models & Rules
├── Aptiverse.Goals.Infrastructure/   # EF Core, Repositories, DbContext
└── Aptiverse.Goals.Core/             # Shared abstractions/utilities
```

---

## 🧠 What This Service Owns

### Domain Entities

| Entity                | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| **Goal**              | A student’s academic or personal objective       |
| **GoalMilestone**     | Smaller checkpoints within a goal                |
| **GrowthTracking**    | Records measurable student improvement over time |
| **Reward**            | Incentives students can earn                     |
| **StudentReward**     | Rewards assigned to students                     |
| **StudentPoints**     | Current gamification point balance               |
| **PointsTransaction** | History of points earned/spent                   |
| **RewardFeature**     | Feature unlocks tied to rewards                  |

---

## 🚀 Core Features

### 🎯 Goal Management

* Create academic or personal goals
* Track goal status (Active, Completed, Abandoned)
* Break goals into milestones

### 📈 Growth Tracking

* Track performance improvements over time
* Store historical growth metrics
* Provide longitudinal progress data

### 🪙 Points & Gamification

* Award points for achievements
* Deduct points for reward redemption
* Maintain full transaction history

### 🏆 Rewards System

* Define platform rewards
* Assign rewards to students
* Link rewards to feature unlocks

---

## 🔧 API Endpoints

### Goals

```
GET  /api/goals
POST /api/goals
PUT  /api/goals/{id}
DELETE /api/goals/{id}
```

### Goal Milestones

```
GET  /api/goals/{goalId}/milestones
POST /api/goals/{goalId}/milestones
PUT  /api/milestones/{id}
```

### Growth Tracking

```
GET  /api/growth-tracking
POST /api/growth-tracking
```

### Points & Rewards

```
GET  /api/points
GET  /api/points/transactions
POST /api/rewards
GET  /api/student-rewards
```

---

## 🛠️ Development Setup

### Prerequisites

* .NET 10 SDK
* PostgreSQL 13+
* Docker (optional)

### Example Configuration

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=aptiverse_db;Username=postgres;Password=password"
  },
  "Jwt": {
    "Issuer": "aptiverse-auth",
    "Audience": "aptiverse-goalsgrowth",
    "Key": "local-dev-only"
  }
}
```

### Run Locally

```bash
dotnet restore
dotnet ef database update --project src/Aptiverse.Goals.Infrastructure --startup-project src/Aptiverse.Goals
dotnet run --project src/Aptiverse.Goals
```

---

## 🔐 Security Model

* JWT tokens validated via platform auth provider
* Student-scoped data access
* Role-based policies supported (Student, Admin, etc.)

---

## 📊 Health & Monitoring

```
GET /health
GET /health/db
```

* Scaler: `/dev`
* ReDoc: `/docs`

---

## 📄 License

This project is part of the Aptiverse ecosystem and is proprietary software. All rights reserved.

---

## 🎓 Mission of This Service

> The Goals & Growth Service exists to ensure students are motivated by **progress, improvement, and consistency**, not just exam results — turning education into a journey of growth rather than pressure.
