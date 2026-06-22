# Aptiverse Enterprise Sweep — Architecture & Execution Plan

> **Status:** Blueprint (awaiting approval to execute Phase 1+).
> **Author:** Architecture pass, 2026-06-22.
> **Scope:** Backend data layer, backend feature completion, a new Python AI
> services repo, frontend craft, and the fine-grained agent fleet that does
> the work. The companion document for the ML side is [`ai/ARCHITECTURE.md`](./ai/ARCHITECTURE.md).

This is the single source of truth for turning Aptiverse from "well-structured
but incomplete" into an enterprise-grade product. It is grounded in an actual
audit of the codebase (not aspiration). Every workstream below names real files
and real defects.

---

## 0. Ground truth (from the audit)

| Area | Reality today |
|---|---|
| Backend | .NET 10 modular monolith, one host `api/Aptiverse.Api.csproj`, ~19 modules, EF Core, single Postgres on RDS. Solid DDD structure. |
| Supporting services | **None of the four exist on disk.** `ai-service`/`payment-gateway`/`event-architecture`/`notification-service` are README fiction. |
| AI today | A thin Anthropic Claude HTTP wrapper in `api/Modules/AI/` used for the help-bot and diary sentiment. No local ML, no batch jobs, no scheduler. |
| Analytics tables | Exist but **empty**: `mastery.topic_masteries`, `mastery.knowledge_gaps`, `mastery.student_subject_analytics`, `insights.grade_distributions`, `insights.improvement_tips`, `goals.growth_trackings`. |
| Stubbed features | Practice (entities are just `Id`), Wellbeing persistence, Support tickets, Insights live stream, Marketplace, Calendar, Moderation, Booking, Notifications (defined but **not DI-registered**), Contact form, Payments. |
| Data defects | `CourseEnrollment.UserId` is `long` but FKs a `string` user; **no FK indexes** on ~15 hot tables; `StudentId` is `string` in some modules and `long` in others; no soft-delete; no concurrency tokens; enums stored as free-text strings; delimited strings instead of arrays. |
| Frontend | Mature theme/design system. "Slop" = off-grid spacing magic numbers, **fake metrics shown as real** (`admin/page.tsx`, `LiveActivityFeed.tsx`), emoji/gamification (`rewards/page.tsx`), `"GPT-class"` label, some duplicated card rows. |

---

## 1. Target architecture

```
                         ┌────────────────────────────┐
                         │  web/  (Next.js 16, MUI v7) │
                         └──────────────┬─────────────┘
                                        │ HTTPS / REST
                         ┌──────────────▼─────────────┐
                         │  api/  .NET modular monolith│  ← system of record
                         │  • domain modules           │
                         │  • outbox table (events)    │
                         └───┬───────────────┬─────────┘
                             │ Postgres       │ Redis (cache + queue + pub/sub)
              ┌──────────────▼──┐         ┌───▼─────────────────────────────┐
              │  PostgreSQL (RDS)│◄────────│  ai/  Python FastAPI + workers   │
              │  + pgvector      │  reads  │  • scheduled ML batch jobs       │
              │  analytics tables│  writes │  • on-demand recompute (Arq)     │
              └──────────────────┘         │  • chatbot proxy → OpenAI        │
                                           └──────────────────────────────────┘
```

**Principles**
1. **The .NET monolith stays the system of record.** We are *not* exploding it
   into microservices. The only genuinely separate process we add is the Python
   `ai/` repo, because ML has a different runtime, library ecosystem, and
   resource profile. This matches `api/CLAUDE.md` hard-rule #1.
2. **AI services read raw signals and write analytics tables in the same
   Postgres.** No duplicate database. The contract between .NET and Python is
   the *schema* of the analytics tables plus an **outbox/event** trigger for
   freshness.
3. **Classical ML for analytics; an LLM only for the chatbot.** Per the owner's
   directive, the conversational chatbot uses **OpenAI (ChatGPT)**; every other
   service uses deterministic/statistical ML (scikit-learn, BKT, statsmodels,
   transformers for NLP). This is cheaper, explainable, and auditable — the
   right call for student-facing analytics. See `ai/ARCHITECTURE.md` §Models.
   - *Architect's note:* the existing diary sentiment path uses Claude in .NET.
     We will migrate diary NLP to the Python service's local models so the only
     paid LLM dependency is the chatbot.
4. **Light vs heavy provisioning.** Cheap, frequent jobs (distributions,
   streaks, lexicon sentiment) run on CPU every few minutes. Heavy jobs
   (BKT/IRT mastery, gradient-boosted risk models, transformer embeddings) run
   nightly and are independently scalable. Detailed in `ai/ARCHITECTURE.md`.

---

## 2. Workstream A — Backend data layer (enterprise foundation)

This is the highest-leverage, highest-risk workstream. It runs **first** because
the AI services and feature completion both depend on a sane data layer.

### A1. Cross-cutting base entity + EF interceptors
Introduce a shared base in `api/Data/` (or a `Aptiverse.SharedKernel`):
- `EntityBase<TId>` with `Id`, `CreatedAt`, `UpdatedAt`.
- `ISoftDelete` (`IsDeleted`, `DeletedAt`) + EF **global query filter** so soft-deleted rows vanish from normal queries.
- **Optimistic concurrency** via Postgres `xmin`: `modelBuilder.Entity<T>().UseXminAsConcurrencyToken()` — the industry-standard approach for Npgsql; **no extra column needed**.
- A `SaveChangesInterceptor` that stamps `CreatedAt`/`UpdatedAt` and converts deletes to soft-deletes for `ISoftDelete` types.

### A2. Identity unification (the big one)
Standardize the cross-module student/user reference on **`string UserId`** (the
ASP.NET Identity key), which most modules already use.
- Fix the `CourseEnrollment.UserId` `long`→`string` mismatch (`api/Modules/Marketplace/.../CourseEnrollment.cs:9`).
- Audit every `long StudentId` (Wellbeing, Support, Goals' `StudentPoints`, etc.) and reconcile to `string UserId`, OR introduce an explicit `Student` dimension with a stable `long` surrogate **and** the `string UserId`, referenced consistently.
- **Decision:** keep `auth.students.Id (long)` as the internal surrogate, but every cross-module column references `string UserId`. Modules never invent their own student type. Document in `CLAUDE.md`.
- ⚠️ This migrates live data on RDS → see §7 (gated, backed up, reversible).

### A3. Indexes
Add indexes (via a single migration per module) on every FK and hot filter column flagged in the audit:
- `goals.goals(StudentId)`, `goals.student_points(StudentId)`, `academic_planning.assessments(StudentId, Status)`, `wellbeing.diary_entries(StudentId, EntryDate)`, `wellbeing.mood_trackings(StudentId, TrackedAt)`, `support.support_tickets(StudentId, Status)`, `support.support_messages(TicketId)`, `marketplace.*`, `entitlements.subscription_members(SubscriptionId, UserId)`, `audit.audit_logs(UserId, EntityType, CreatedAt)`, and every `student_subject_id`/`topic_id` on mastery & insights tables.
- Status/enum filter columns get indexes where filtered (`Status`, `Kind`).

### A4. Strong enums
Replace free-text status/type strings with C# `enum`s + `.HasConversion<string>()` value converters (keeps DB readable, gains compile-time safety). Targets: `Assessment.Type/Status`, `Goal.Status/Category`, `Subscription.Status`, `Notification.Kind`, severities, etc.

### A5. Arrays & JSON, not delimited strings
Convert comma-joined columns to Postgres `text[]` (or `jsonb` where structured): `ModuleLesson.ResourceUrls`, `SupportMessage.AttachmentUrls`, `DiaryEntry.Tags/KeyThemes`, `MoodTracking.Triggers/CopingStrategies`.

### A6. Repository standardization
Promote the **Goals-style generic repository** (`GetByIdAsync<TId>`, includes, `AsNoTracking`, server-side paging, `CancellationToken`) to a shared base and retire the basic Auth `Repository<T>` that assumes `long` PKs. Fix the no-op `include: query => query` calls (e.g. `CourseService`) and the `PaginatedResult` double-enumeration (`data.Count()`).

### A7. Analytics tables = read-optimized projections
The mastery/insights tables are **outputs written by the AI services**. Keep them denormalized for read speed, but add: a `ComputedAt` timestamp, a `ModelVersion` string, and proper composite indexes. `StudentSubjectAnalytics`'s 35 columns are acceptable as a projection (not a transactional table) once these are added.

---

## 3. Workstream B — Backend feature completion

Ordered by dependency (Practice first, because it produces the raw signal ML needs):

| # | Feature | Files | Notes |
|---|---|---|---|
| B1 | **Practice engine** | `api/Modules/Practice/*`, `PracticeController.cs` | Flesh out `PracticeTest/Attempt/Item/AnswerSubmission/ScoreSummary`. Real persistence, scoring, topic tagging. This is the #1 ML input. |
| B2 | **Wellbeing persistence** | `WellbeingController.cs`, `Wellbeing.*` | Wire diary + mood to DB (entities exist). Stop the in-memory echo. |
| B3 | **Support tickets** | `SupportController.cs` | Persist tickets/messages (entities exist). |
| B4 | **Notifications wiring** | `Notifications.*`, `ModuleRegistrations.cs` | Module is defined but **not DI-registered** — register it, finish Core/Infrastructure. |
| B5 | **Insights event stream** | `InsightsController.cs` (SSE) | Feed the live stream from the outbox/audit log + activity, replacing the heartbeat-only stub. |
| B6 | **Contact form backend** | `web/src/lib/api/client.ts:109`, new controller | Currently a no-op. |
| B7 | **Payments (Paystack)** | `Entitlements.*` | Subscriptions already carry Paystack codes. Add init + **webhook signature verification** + subscription lifecycle. (Payments = Paystack, not the chatbot's OpenAI.) |
| B8 | **Outbox + event bus** | new `api/Data/Outbox` | Transactional outbox table; a background dispatcher publishes to Redis pub/sub. This is how the AI repo learns "recompute student X". Replaces the missing `event-architecture` service with an in-monolith outbox (right-sized, not a new Go service). |
| B9 | **Background scheduler** | new hosted service | For .NET-side periodic work (reminders). Heavy ML scheduling lives in the Python repo. |

---

## 4. Workstream C — The `ai/` repo (Python FastAPI + ML workers)

Full detail in [`ai/ARCHITECTURE.md`](./ai/ARCHITECTURE.md). Summary:
- **Stack:** Python 3.12, FastAPI (thin control/health/trigger API), **Arq** (async Redis queue, reuses existing Redis) for on-demand jobs, **APScheduler** for nightly cron jobs, SQLAlchemy 2.0 + asyncpg for Postgres, Pydantic v2.
- **ML libs:** polars + pandas, numpy, scikit-learn, LightGBM/XGBoost (at-risk prediction), pyBKT (Bayesian Knowledge Tracing for mastery), statsmodels/Prophet (trajectory), sentence-transformers + pgvector (diary theme clustering), VADER (cheap sentiment) with an optional transformer upgrade.
- **Services (each maps raw signals → an analytics table):** Mastery Estimator, Knowledge-Gap Detector, Grade-Distribution Builder, Improvement-Tips Generator, Subject-Analytics Aggregator, Growth-Tracking Computer, At-Risk Predictor, Diary NLP. Plus the **Chatbot** (OpenAI proxy — the *only* LLM service).
- **Provisioning:** light jobs CPU/frequent; heavy jobs nightly/GPU-optional; one paid LLM dependency (chatbot).

---

## 5. Workstream D — Frontend craft (kill the "slop")

The system is good; fix execution. Guided by the installed `web/.claude/skills` (`emil-kowalski`, `taste`, `impeccable`, `ui-ux-pro-max`).

| # | Fix | Files |
|---|---|---|
| D1 | **Remove fake-as-real metrics** — wire to real APIs or label demo. | `web/src/app/(app)/admin/page.tsx:42-92`, `web/src/components/dashboard/LiveActivityFeed.tsx:15-56` |
| D2 | **De-gamify** — drop amber gradient + emoji trophies; respect the "amber = earned only" rule. | `dashboard/rewards/page.tsx`, `dashboard/goals/page.tsx` |
| D3 | **Spacing normalization** to the 8px grid (no 0.75/1.25/6px/10px). | dashboard/assessments/subjects/goals/billing pages |
| D4 | **Copy rewrite** away from motivational wallpaper toward the `WelcomeBanner` voice. | `dashboard/page.tsx`, `rewards`, chatbot `"GPT-class"` label |
| D5 | **Extract duplicated card-rows** into `components/common/CardRow.tsx`. | goals/subjects/assessments |
| D6 | **Deprecate `mockData.ts`** once admin/chatbot read real data. | `web/src/lib/mockData.ts` |
| D7 | **Password reveal** (already shipped) + audit other forms for parity. | `components/auth/PasswordField.tsx` |

---

## 6. The agent fleet (fine-grained, skill-equipped)

Work is executed by **specialized subagents**, fanned out via the `Workflow`
tool. Agents are equipped to **pull best-practice references from the web**
(EF Core indexing, BKT, Paystack webhooks, pgvector) via WebSearch/WebFetch, and
frontend agents invoke the installed design skills.

**Every change-making agent is paired with an adversarial verifier** (does it
build? does it preserve behavior? is the migration reversible?) before the
finding is accepted — this is the quality bar, not optional.

### Roster (by workstream)

**Data layer (run with `isolation: worktree` — they mutate shared files):**
- `base-entity-author` — introduces `EntityBase`, `ISoftDelete`, interceptors.
- `id-unifier` — the `string UserId` standardization (one agent, careful, reviewed).
- `index-adder` ×(per module) — adds FK/filter indexes + migration.
- `enum-converter` ×(per module) — string→enum + value converters.
- `array-migrator` — delimited strings → `text[]`/`jsonb`.
- `repo-standardizer` ×(per module) — adopt generic repo, fix N+1/no-op includes.
- `migration-author` + `migration-verifier` — generate, then dry-run/validate each EF migration.

**Backend features:**
- `practice-engine-builder`, `wellbeing-persistence`, `support-tickets`,
  `notifications-wiring`, `insights-eventstream`, `contact-backend`,
  `paystack-integrator`, `outbox-builder`, `scheduler-builder`.

**AI repo:**
- `ml-lib-scout` (web research), `ai-scaffolder`, and one builder per service
  (`mastery-estimator`, `gap-detector`, `grade-distribution`, `tips-generator`,
  `subject-analytics`, `growth-tracker`, `at-risk-predictor`, `diary-nlp`,
  `chatbot-proxy`), plus `ai-dockerizer` and `ai-test-author`.

**Frontend:**
- `fake-data-remover`, `degamifier`, `spacing-normalizer` ×(per page),
  `copy-editor` (taste skill), `component-extractor`, `a11y-checker`.

**Cross-cutting (always-on):**
- `build-verifier` (dotnet build / next build / tsc / ruff+pytest),
  `adversarial-reviewer` (per change), `migration-safety-auditor`.

### How it runs
Each phase is a `Workflow` script: a `pipeline()` that fans work items out to
builder agents, each followed by a verifier stage, with a final synthesis +
build gate. Phases are launched one at a time so you stay in the loop and we
gate on a green build before the next. Token usage is not the constraint;
correctness gates are.

---

## 7. Phased execution & safety gates

| Phase | What | Reversible? | Gate before proceeding |
|---|---|---|---|
| **0** | Scaffolding only: this doc + `ai/` repo skeleton + agent workflow scripts. **Non-destructive.** | n/a | Owner reviews blueprints. |
| **1** | Data layer **additive** changes: base entity, indexes, enums, repo standardization. No data moves. | Yes (new migrations, forward-only but safe) | `dotnet build` green + migration dry-run on a throwaway DB. |
| **2** | Identity unification + array migrations. **Touches live data.** | Yes, with backup | **RDS snapshot first**; migration tested on a restored copy; rollback script ready. |
| **3** | Backend feature completion (Practice → Wellbeing → Support → Notifications → Insights → Contact → Paystack → Outbox). | Yes | Each feature: build + smoke test green. |
| **4** | `ai/` services built + wired to read signals / write analytics. | Yes (writes are upserts to projection tables) | Each service: unit test + a dry-run against a seeded student. |
| **5** | Frontend craft sweep. | Yes | `next build` + visual check + `/taste`. |

**Hard rule:** Phase 2 does **not** start without a fresh RDS snapshot and a
tested rollback. We already restored your `.pem` and confirmed RDS access, so
snapshots are one command away.

---

## 8. Industry standards applied (the "why")

- **Postgres `xmin` concurrency** — Npgsql-native optimistic locking, no schema bloat.
- **Soft-delete + global query filter** — audit/compliance, recoverable deletes.
- **Transactional outbox** — reliable event publishing without a distributed transaction (the canonical pattern for monolith→worker eventing).
- **BKT/IRT for mastery** — the established psychometric approach (used by Khan Academy, ASSISTments), explainable to schools, unlike an opaque LLM score.
- **Gradient boosting (LightGBM) for at-risk** — tabular SOTA, fast, interpretable via SHAP.
- **pgvector for diary themes** — keep embeddings next to the data; no separate vector DB to operate.
- **Classical ML over LLM for analytics** — deterministic, cheap, auditable; LLM reserved for the one genuinely generative surface (chat).

---

## 9. Open decisions for the owner

1. **Identity unification (Phase 2)** is the riskiest change. Approve the live-data migration, or defer it and have AI services adapt to mixed ID types? (Recommend: approve, with snapshot.)
2. **Diary NLP**: migrate off Claude to local transformer/VADER (one less paid dependency), or keep Claude for diary and OpenAI only for chat? (Recommend: migrate to local.)
3. **Chatbot model**: OpenAI `gpt-4o`/`gpt-4.1` confirmed for chat. Any budget ceiling to encode as a hard quota?
4. **Scope of first execution**: start with Phase 1 (safe, additive) now, or scaffold-only (Phase 0) and review first?
```
