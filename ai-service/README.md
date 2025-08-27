<img width="1900" height="908" alt="image" src="https://github.com/user-attachments/assets/b2ac7006-b623-42e5-8074-f3adbeedb88c" />

<img width="1913" height="908" alt="{A50559F6-2E01-4DF2-958F-1B574BFEAF3A}" src="https://github.com/user-attachments/assets/64e665e1-bacb-4699-84fa-7e3ecfc5605a" />

<img width="1900" height="906" alt="{710FC3BE-F05D-4BB0-BC8C-4A5D0AAF684C}" src="https://github.com/user-attachments/assets/1cba9650-7200-45d7-bcd9-ccce2551d00f" />

# 🧠 Aptiverse AI Models – FastAPI Microservice for AI-Powered Learning and Student Support

The **Aptiverse AI Models** service powers the intelligence layer of the Aptiverse platform. It is a **modular FastAPI application** built with cutting-edge **Python ML and NLP libraries**, serving as the reasoning engine for understanding students’ goals, emotions, behaviors, academic struggles, and strengths.

This microservice is **asynchronous, secure, and containerized**, designed to integrate with the main `.NET 8 Aptiverse API` using **RabbitMQ**, while also supporting direct RESTful access.

---

## 🧠 What It Does

The engine acts like a digital academic coach and emotional support system for students.

### 📝 Diary & Emotion Analysis

* Detects stress, anxiety, trauma, burnout, motivation, and joy.
* Uses NLP to respond empathetically to students' journaling.

### 🧮 Math Image Reasoning

* Processes images of handwritten math work.
* Analyzes steps and logic using OCR + AI.
* Identifies careless mistakes vs conceptual gaps.

### 🎯 Goal Feasibility & Career Planning

* Cross-checks learner goals against university requirements.
* Provides realistic academic plans or alternative routes.

### 📊 Academic Reports

* Generates student risk/performance profiles for teachers and guardians.
* Collaborates across models for holistic insights.

### 🧪 Practice Test Generator

* Builds custom tests using South African past papers.
* Supports targeted practice by subject and difficulty.

### 🏅 Rewards System

* Encourages learner progress through gamified incentives and rewards.

---

## 🛠️ Tech Stack

| Layer            | Technology                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------- |
| API Framework    | FastAPI (Python)                                                                          |
| ML/NLP Libraries | `transformers`, `pandas`, `scikit-learn`, `cv2`, `torch`, `spaCy`, `matplotlib`, `Pillow` |
| Storage          | PostgreSQL, CSV                                                                           |
| OCR              | OpenCV                                                                                    |
| Messaging        | RabbitMQ (via `.NET 8` Worker)                                                            |
| DevOps           | Docker, GitHub Actions, Uvicorn                                                           |

---

## 📁 Project Structure

```bash
aptiverse-ai/
├── app/
│   ├── main.py                  # FastAPI entrypoint
│   ├── api/                     # Routes (diary, goals, math, reports)
│   ├── models/                  # AI/ML models
│   ├── schemas/                 # Pydantic schemas
│   ├── data/                    # DB access + admissions logic
│   ├── services/                # Utility functions
│   └── config.py                # Env + database settings
├── ml_artifacts/               # Saved/fine-tuned model weights
├── tests/                      # Unit tests
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker container build file
├── docker-compose.yml          # Dev container + DB setup
└── README.md
```

---

## 🚀 Getting Started (Local)

### 1. Clone & Set Up Environment

```bash
git clone https://github.com/7irelo/aptiverse-ai.git
cd aptiverse-ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start Development Server

```bash
uvicorn app.main:app --reload
```

Navigate to:
👉 `http://localhost:8000/docs` — interactive Swagger UI

---

## 🐳 Running in Docker

### Build and Run Container

```bash
docker build -t aptiverse-ai .
docker run -p 8000:8000 aptiverse-ai
```

### Or use Docker Compose (includes PostgreSQL)

```yaml
# docker-compose.yml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/aptiverse
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: aptiverse
    ports:
      - "5432:5432"
```

Then run:

```bash
docker-compose up --build
```

---

## 🔌 Integration Channels

This AI microservice can be accessed via:

* ✅ **Aptiverse Worker** (.NET 8 service over RabbitMQ)
* 🔁 Optional direct REST calls (`POST`, `GET`)
* ⚙️ Internal Python calls via orchestrator module

---

## 🔍 API Highlights

| Endpoint            | Method | Purpose                              |
| ------------------- | ------ | ------------------------------------ |
| `/diary/analyze`    | POST   | Analyze emotion from student journal |
| `/math-image/solve` | POST   | Process handwritten math logic       |
| `/goals/evaluate`   | POST   | Assess goal feasibility              |
| `/report/generate`  | POST   | Generate holistic academic report    |
| `/test/generate`    | POST   | Personalized test from curriculum    |

---

## 🧠 Example Request

```json
{
  "text": "I feel overwhelmed by my math work. I try hard, but I still fail."
}
```

Response:

```json
{
  "emotions": [
    { "label": "frustrated", "score": 0.91 },
    { "label": "sad", "score": 0.76 }
  ],
  "response": "It's okay to feel this way. You're not alone. Let's break down the challenges together."
}
```

---

## 🧪 Testing

Run all unit tests:

```bash
pytest tests/
```

Or with coverage:

```bash
coverage run -m pytest
coverage report
```

---

## 🔮 Future Directions

* GPT-based student feedback generation
* Embedding search across curriculum topics
* gRPC + WebSocket support for live chat scenarios
* Voice input + mobile-first model endpoints
* Model evaluation + continuous training loop

---

## 🤝 Contributions

We welcome contributors in:

* Educational AI and NLP
* Socially conscious ML systems
* Mental health + youth support through data
* South African curriculum innovation

---

## 🛡️ License

Part of **Aptiverse Labs** — internal license. Public license coming with the open release.

---

## 🌱 Aptiverse: Grow Intelligence with Empathy

> *"We don’t just analyze students. We uplift them."*

---
