# aptiverse-labs/ai

Python background services that turn **raw student signals** (assessments,
practice, mood, diary, goals) into **analytics** written back to the shared
Postgres. One LLM surface only — the **chatbot**, on OpenAI. Every other service
is classical/statistical ML (scikit-learn, pyBKT, LightGBM, statsmodels, local
NLP), chosen to be cheap, explainable, and auditable.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full design and the
[`../ENTERPRISE_SWEEP.md`](../ENTERPRISE_SWEEP.md) master plan.

## Processes

| Process | Command | Role |
|---|---|---|
| API | `uvicorn app.main:app --reload` | health, manual `/trigger/{service}` (ops/backfill), `/chat` |
| Worker | `arq app.worker.WorkerSettings` | runs services on-demand (events / triggers) |
| Scheduler | `python -m app.scheduler` | nightly + 15-min batch |
| Events | `python -m app.events.consumer` | consumes the .NET outbox, enqueues recomputes |

## Local dev

```bash
cd ai
python -m venv .venv && . .venv/Scripts/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -e ".[dev]"
cp .env.example .env          # fill DB password + OpenAI key
# DB is reached via the SSH tunnel to RDS opened by ../api/start-dev.ps1
pytest                        # skeleton smoke tests pass without a DB
uvicorn app.main:app --reload
```

## Status

Phase-0 skeleton: structure, config, db/redis, registry, scheduler, worker,
event consumer, and one stub per service (each `compute()` returns 0 and logs
`not_implemented`). Phase-4 builder agents implement the `.compute()` bodies and
the chatbot retrieval, each gated by an adversarial verifier + a seeded-student
dry run. The analytics target tables are created by .NET EF migrations (they
already exist in the schema but are empty).
