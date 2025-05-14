# 📊 Aptiverse Insights & Study Plan Service

<p align="center">
  <img src="https://github.com/user-attachments/assets/1c0c38ed-79ee-448a-8298-dabc469ed5ca" width="380"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/7dc437d9-db73-40d4-843f-96f75e16597f" width="300"/>
  <img src="https://github.com/user-attachments/assets/adb9569a-4547-4fcf-b079-187ebb5b8cc9" width="300"/>
</p>

**Aptiverse Insights & Study Plan Service** is the microservice responsible for **learning analytics, AI-driven insights, and personalized study plan generation**.

> This service owns **recommendations, learning insights, future planning signals, and adaptive study schedules**.
> It does **NOT** manage mastery calculations, assessments, goals, rewards, tutors, or payments.

---

## 🌟 Service Overview

The Insights Service answers:

> *“What should the student do next to improve?”*

It sits **above Mastery + Practice services**, transforming learning data into **actionable plans**.

This service enables:

* 📅 Personalized study plans
* 📊 Learning trend analysis
* 🎯 Priority topic recommendations
* 📈 Performance forecasting
* 🧠 Adaptive learning guidance

This is the **decision engine** of the Aptiverse platform.

---

## 🏗️ Architecture & Technology Stack

| Component        | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Framework        | .NET 10, ASP.NET Core                             |
| Database         | PostgreSQL + EF Core                              |
| Authentication   | JWT (validated via shared Auth service / gateway) |
| API Docs         | Scaler / OpenAPI / ReDoc                          |
| Containerization | Docker                                            |
| Communication    | Consumes Mastery + Practice events                |

---

## 📁 Project Structure

```
src/
├── Aptiverse.Insights/                 # Controllers & API layer
├── Aptiverse.Insights.Application/     # DTOs, Services, Logic
├── Aptiverse.Insights.Domain/          # Insight Models
├── Aptiverse.Insights.Infrastructure/  # EF Core, Repositories
└── Aptiverse.Insights.Core/            # Shared abstractions
```

---

## 🧠 What This Service Owns

### Domain Entities

| Entity               | Purpose                                |
| -------------------- | -------------------------------------- |
| **StudyPlan**        | Generated study schedule for a student |
| **StudyPlanItem**    | Individual study tasks                 |
| **LearningInsight**  | AI-generated insight about performance |
| **PriorityTopic**    | Topics needing urgent focus            |
| **PerformanceTrend** | Performance trajectory analysis        |
| **ForecastMetric**   | Predicted future performance signals   |

---

## 🚀 Core Features

### 📅 Study Plan Generation

* Generate weekly/daily study plans
* Balance weak vs strong topics
* Optimize revision cycles

### 📊 Learning Insights

* Detect performance trends
* Highlight improvement or decline
* Identify burnout or overload patterns

### 🎯 Recommendations

* Suggest next topics
* Recommend revision intensity
* Suggest practice type (tests, revision, etc.)

### 📈 Forecasting

* Predict exam readiness
* Forecast subject improvement potential
* Estimate confidence levels

---

## 🔧 API Endpoints

### Study Plans

```
GET  /api/study-plan
POST /api/study-plan/generate
```

### Insights

```
GET /api/insights
GET /api/insights/trends
```

### Recommendations

```
GET /api/recommendations/topics
GET /api/recommendations/practice
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
    "PostgreSQL": "Host=localhost;Database=aptiverse_insights;Username=postgres;Password=password"
  },
  "Jwt": {
    "Issuer": "aptiverse-auth",
    "Audience": "aptiverse-insights",
    "Key": "local-dev-only"
  }
}
```

### Run Locally

```bash
dotnet restore
dotnet ef database update --project src/Aptiverse.Insights.Infrastructure --startup-project src/Aptiverse.Insights
dotnet run --project src/Aptiverse.Insights
```

---

## 🔐 Security Model

* JWT authentication required
* Student-scoped plans and insights
* Educators can view aggregated analytics

---

## 📊 Health & Monitoring

```
GET /health
GET /health/db
```

* Scaler UI: `/dev`
* ReDoc: `/docs`

---

## 🎓 Mission of This Service

> The Insights Service exists to turn data into direction — helping students focus on **what matters most next**, not just what they did before.
