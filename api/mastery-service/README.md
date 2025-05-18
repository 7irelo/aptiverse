# 🧠 Aptiverse Mastery Tracking Service

## Scaler

<img width="1899" height="991" alt="{E856A9DF-F75A-4AB7-ADF9-25BD5F2EECFC}" src="https://github.com/user-attachments/assets/9457b370-25b1-45bc-97d4-acf5834342fc" />

## ReDoc

<img width="1892" height="989" alt="{1C1337BC-D6A7-49DD-A2CA-982A89AEA074}" src="https://github.com/user-attachments/assets/cb5fc220-c5a5-4471-bf82-11d14227116a" />

**Aptiverse Mastery Tracking Service** is the microservice responsible for **student knowledge mastery modeling, topic proficiency tracking, and learning strength analysis** across subjects.

> This service owns **mastery levels, knowledge gaps, strengths, and skill progression**.
> It does **NOT** manage assessments, attempts, goals, rewards, tutors, or payments.

---

## 🌟 Service Overview

The Mastery Tracking Service is the **intelligence layer** that answers:

> *“Does the student truly understand this topic?”*

It transforms raw performance data (from Practice/Attempts service) into **long-term knowledge signals**.

This service enables:

* 📚 Topic mastery scoring
* 🧩 Knowledge gap detection
* 💪 Strength identification
* 📈 Skill progression tracking
* 🎯 Readiness modeling for future topics

This service powers **adaptive learning decisions** in the platform.

---

## 🏗️ Architecture & Technology Stack

| Component        | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Framework        | .NET 10, ASP.NET Core                             |
| Database         | PostgreSQL + Entity Framework Core                |
| Authentication   | JWT (validated via shared Auth service / gateway) |
| API Docs         | Scaler / OpenAPI / ReDoc                          |
| Containerization | Docker                                            |
| Communication    | Consumes events from Practice Service             |

---

## 📁 Project Structure

```
src/
├── Aptiverse.Mastery/                  # Controllers & API layer
├── Aptiverse.Mastery.Application/      # DTOs, Services, Logic
├── Aptiverse.Mastery.Domain/           # Domain Models
├── Aptiverse.Mastery.Infrastructure/   # EF Core, Repositories, DbContext
└── Aptiverse.Mastery.Core/             # Shared abstractions/utilities
```

---

## 🧠 What This Service Owns

### Domain Entities

| Entity                      | Purpose                                 |
| --------------------------- | --------------------------------------- |
| **StudentSubjectAnalytics** | Aggregated academic performance signals |
| **PrerequisiteMastery**     | Mastery of prerequisite topic chains    |
| **KnowledgeGap**            | Identified areas of weak understanding  |
| **ImprovementTip**          | Targeted guidance for weak areas        |
| **TopicMastery** *(new)*    | Mastery score per student per topic     |
| **SubjectMastery** *(new)*  | Overall subject-level proficiency       |

---

## 🚀 Core Features

### 📊 Mastery Modeling

* Calculate topic mastery scores
* Update mastery after each new attempt
* Track long-term learning progression

### 🧩 Knowledge Gap Detection

* Detect weak topics
* Identify prerequisite gaps
* Surface areas needing revision

### 💪 Strength Identification

* Identify high-proficiency topics
* Determine strongest subjects
* Detect rapid improvement patterns

### 📈 Skill Progression

* Track mastery over time
* Maintain historical mastery states
* Power readiness predictions for next topics

---

## 🔧 API Endpoints

### Topic Mastery

```
GET /api/mastery/topics
GET /api/mastery/topics/{topicId}
```

### Subject Mastery

```
GET /api/mastery/subjects
```

### Knowledge Gaps

```
GET /api/mastery/gaps
```

### Improvement Tips

```
GET /api/mastery/improvement-tips
```

---

## 🛠️ Development Setup

### Prerequisites

* .NET 10 SDK
* PostgreSQL
* Docker (optional)

### Example Configuration

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Database=aptiverse_mastery;Username=postgres;Password=password"
  },
  "Jwt": {
    "Issuer": "aptiverse-auth",
    "Audience": "aptiverse-mastery",
    "Key": "local-dev-only"
  }
}
```

### Run Locally

```bash
dotnet restore
dotnet ef database update --project src/Aptiverse.Mastery.Infrastructure --startup-project src/Aptiverse.Mastery
dotnet run --project src/Aptiverse.Mastery
```

---

## 🔐 Security Model

* JWT authentication required
* Students can only access their own mastery data
* Educators/Admins can view aggregated class-level mastery

---

## 📊 Health & Monitoring

```
GET /health
GET /health/db
```

* Scaler UI: `/dev`
* ReDoc: `/docs`

---

## 📄 License

This project is part of the Aptiverse ecosystem and is proprietary software. All rights reserved.

---

## 🎓 Mission of This Service

> The Mastery Tracking Service exists to measure **true understanding**, not just scores — ensuring students progress based on knowledge, not memorization.
