# Aptiverse AI Services — Architecture (fine-grained)

> Python background services that read **raw student signals** from the shared
> Postgres and write **analytics** back into the (currently empty) projection
> tables. One LLM surface only — the chatbot, on OpenAI. Everything else is
> classical / statistical ML: deterministic, cheap, explainable, auditable.
>
> Companion to [`../ENTERPRISE_SWEEP.md`](../ENTERPRISE_SWEEP.md).

---

## 1. Why a separate Python repo

The .NET monolith stays the system of record. ML has a different runtime
(Python), library ecosystem (scikit-learn/transformers/pyBKT), and resource
profile (CPU-burst nightly, optional GPU). Isolating it lets us scale and
deploy it independently without touching the API. It talks to the rest of the
system through exactly two contracts:

1. **The database** — reads raw tables, upserts analytics tables (same Postgres).
2. **Events** — Redis pub/sub messages from the .NET **outbox** ("student X
   submitted a practice attempt → recompute mastery for X").

It never owns user-facing transactional data. Its writes are *projections*
(idempotent upserts keyed by student/subject/topic + `model_version`).

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Web framework | **FastAPI** + Uvicorn | Async, typed, tiny control surface (health, manual trigger, chatbot proxy). |
| On-demand jobs | **Arq** (async Redis queue) | Reuses the Redis you already run; async-native; lighter than Celery. |
| Scheduled jobs | **APScheduler** | Cron-like nightly batch (mastery, risk, embeddings). |
| DB access | **SQLAlchemy 2.0 + asyncpg** | Async, mature, typed. Read raw + upsert analytics. |
| Validation | **Pydantic v2** | Config + DTOs + event schemas. |
| Dataframes | **polars** (hot paths) + **pandas** (sklearn interop) | polars for speed on large reads. |
| Numerics | numpy | baseline. |
| Classical ML | **scikit-learn**, **LightGBM**, **XGBoost** | tabular SOTA, interpretable (SHAP). |
| Mastery | **pyBKT** (Bayesian Knowledge Tracing) + simple IRT | psychometric standard, explainable to schools. |
| Trajectory | **statsmodels** / **Prophet** | grade/mood trend forecasting. |
| NLP (diary) | **VADER** (cheap) + **sentence-transformers** (themes) | lexicon sentiment for the fast path; embeddings for theme clustering. |
| Vectors | **pgvector** | embeddings live next to the data; no separate vector DB. |
| LLM (chat only) | **OpenAI** `gpt-4o` / `gpt-4.1` via official SDK | the one generative surface. |
| Packaging | **uv** + `pyproject.toml`, Ruff, mypy, pytest | fast, modern, CI-friendly. |
| Container | Dockerfile (CPU base; CUDA variant optional) | matches `infra/` deploy story. |

---

## 3. Repo layout

```
ai/
├── pyproject.toml            # uv-managed deps, ruff/mypy/pytest config
├── README.md                 # run/dev/deploy
├── ARCHITECTURE.md           # this file
├── Dockerfile                # CPU base image; heavy-model layer optional
├── .env.example              # DB url (via SSH tunnel in dev), Redis, OpenAI key
├── app/
│   ├── main.py               # FastAPI: /health, /trigger/{service}, /chat
│   ├── core/
│   │   ├── config.py         # Pydantic settings
│   │   ├── db.py             # async engine/session
│   │   ├── redis.py          # Arq pool + pub/sub subscriber
│   │   └── logging.py
│   ├── scheduler.py          # APScheduler cron registrations
│   ├── worker.py             # Arq worker entrypoint (on-demand jobs)
│   ├── events/
│   │   └── consumer.py       # subscribes to .NET outbox channel
│   ├── data/
│   │   ├── signals.py        # read queries: assessments, practice, mood, diary…
│   │   └── sinks.py          # idempotent upserts into analytics tables
│   ├── services/             # one module per ML service (see §5)
│   │   ├── mastery.py
│   │   ├── gaps.py
│   │   ├── grade_distribution.py
│   │   ├── tips.py
│   │   ├── subject_analytics.py
│   │   ├── growth.py
│   │   ├── at_risk.py
│   │   ├── diary_nlp.py
│   │   └── chatbot.py        # OpenAI proxy (only LLM)
│   └── models/               # trained model artifacts + versioning
└── tests/
```

---

## 4. Data contract (raw → analytics)

**Reads (raw signals, already live or completed in Phase 3):**
`academic_planning.assessments` (predicted/actual marks, type, weight, status),
`practice.*` (attempts, answers, time-on-task, topic — after backend B1),
`wellbeing.mood_trackings` & `diary_entries`, `goals.goals` & `goal_milestones`,
`calendar.calendar_events`, `audit.audit_logs` (engagement trace).

**Writes (idempotent upserts; each row gets `computed_at` + `model_version`):**
`mastery.topic_masteries`, `mastery.knowledge_gaps`,
`mastery.student_subject_analytics`, `insights.grade_distributions`,
`insights.improvement_tips`, `goals.growth_trackings`, and a new
`insights.risk_scores` (At-Risk Predictor output).

**Identity:** all reads/writes key on `string UserId` (post Phase-2
unification). Until then, `data/signals.py` normalizes mixed `long`/`string`
student ids in one place.

---

## 5. The services (each: inputs → method → output table → cadence → weight)

| Service | Inputs | Method | Writes | Cadence | Weight |
|---|---|---|---|---|---|
| **Grade-Distribution Builder** | assessment marks, practice scores | histogram / bucketing | `insights.grade_distributions` | every 15 min | **light** (CPU) |
| **Diary NLP** | `diary_entries.content` | VADER sentiment (fast) + sentence-transformers embeddings → theme clusters | diary AI fields + `pgvector` | on write (event) | light→**heavy** |
| **Growth-Tracking Computer** | goal progress, assessment trend, mood trend | rolling deltas / EWMA | `goals.growth_trackings` | nightly | light |
| **Subject-Analytics Aggregator** | audit log, calendar, practice, mood | aggregation/feature engineering (polars) | `mastery.student_subject_analytics` | nightly | medium |
| **Mastery Estimator** | practice attempt correctness per topic, assessment results | **pyBKT** / IRT per (student, topic) | `mastery.topic_masteries` | nightly + on event | **heavy** |
| **Knowledge-Gap Detector** | low mastery, wrong-answer concepts | threshold + clustering on mastery + error topics | `mastery.knowledge_gaps` | nightly | medium |
| **Improvement-Tips Generator** | knowledge gaps, study patterns, goal gaps | **rules + retrieval** over a curated tip/resource bank (no LLM) | `insights.improvement_tips` | nightly | light |
| **At-Risk Predictor** | full feature vector (marks, engagement, mood, mastery) | **LightGBM** classifier; SHAP for reasons | `insights.risk_scores` | nightly | **heavy** (train weekly, infer nightly) |
| **Chatbot** | student question + context | **OpenAI** `gpt-4o`, retrieval over student's own analytics | (none — interactive) | on demand | LLM (paid) |

**Tips without an LLM:** the Improvement-Tips Generator maps each diagnosed gap
to a curated, curriculum-aligned tip + resource via rules and embedding
similarity. Deterministic, reviewable, no hallucination — the right tool for
advice shown to students. (If generative phrasing is ever wanted, it can be a
post-processing step, but the *content* stays rule-grounded.)

---

## 6. Execution model

```
APScheduler (nightly 02:00 SAST)         Redis pub/sub  ← .NET outbox
        │                                      │
        ▼                                      ▼
  enqueue batch jobs ───────► Arq worker pool ◄── enqueue per-student recompute
                                   │
              read signals (asyncpg/polars) → compute → upsert analytics
                                   │
                       structured logs + job run table (observability)
```

- **Idempotent:** every job upserts by natural key + `model_version`; safe to re-run.
- **Watermarked:** jobs track `last_processed_at` per student to do incremental work.
- **Backfill:** a one-shot command computes analytics for all existing students
  on first deploy (the tables are empty today).
- **Observability:** every run writes to an `ai.job_runs` table (job, scope,
  rows_written, duration, status) and emits structured logs.

---

## 7. Provisioning (light vs heavy)

| Tier | Jobs | Runtime | Trigger |
|---|---|---|---|
| **Light** | grade distributions, growth, tips, VADER sentiment | CPU, seconds, runs often | event + 15-min tick |
| **Medium** | subject-analytics aggregation, gap detection | CPU, minutes | nightly |
| **Heavy** | BKT mastery, LightGBM train/infer, transformer embeddings | CPU-burst (GPU optional), minutes–tens of minutes | nightly / weekly train |
| **LLM** | chatbot | OpenAI API (paid, quota-capped) | on demand |

Deploy as: one FastAPI process (control + chat), one Arq worker (scales
horizontally), one scheduler. Heavy model training is a separate weekly job so
it never blocks inference. GPU is optional — start CPU-only; transformer
inference batches fine on CPU at this scale.

---

## 8. Security & data handling

- Student data never leaves the box for analytics (all local ML). Only the
  **chatbot** sends text to OpenAI — and only the user's own question + a
  bounded, redacted context window, never raw PII dumps.
- DB access in dev goes through the **existing SSH tunnel** to RDS
  (`localhost:5432`); in prod the service runs inside the VPC with the RDS SG.
- OpenAI key and DB creds via env / secrets manager, never committed.
- All writes are to projection tables; a bug can be fixed by recomputing, never
  corrupts source-of-truth data.

---

## 9. Build order (Phase 4 in the master plan)

1. `ai-scaffolder` — repo skeleton, config, db/redis, health endpoint, CI.
2. `ml-lib-scout` — web-research current best-practice for BKT / LightGBM risk /
   pgvector / Arq patterns; pin versions.
3. Per-service builder agents (start with **light, no-dependency** services:
   Grade-Distribution, Growth, Tips) → then medium → then heavy (Mastery,
   At-Risk) → then Chatbot.
4. `ai-test-author` — unit tests + a seeded-student dry run per service.
5. `ai-dockerizer` — Dockerfile + compose wiring into `infra/`.

Each builder is paired with an adversarial verifier and a dry-run gate before
its output table is trusted.
