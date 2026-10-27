# Aptiverse

AI study platform for South African students: practice tests generated at the right level for the CAPS curriculum (NSC and IEB) and for university courses, marking against memos, and a tutor that teaches rather than hands out answers. Built for phones first, with security and measurable AI quality as hard requirements.

Live: [aptiverse.co.za](https://aptiverse.co.za). This repository holds the v2 rebuild, which is in progress.

## Architecture

```
Browser (Next.js 16, Vercel)
   |  BFF: the browser never holds tokens
   v
.NET 10 API (ECS Fargate, af-south-1)           Postgres 17 + pgvector (RDS)
   identity, permissions, quotas, conversations  ---- one schema per module
   |  60-second ES256 service token, private network only
   v
ai service (Python, ECS, no public ingress)
   FastAPI + Pydantic        model gateway: Anthropic and OpenAI, per-task routing, failover, cost per call
   LangGraph workflows       practice generation, grading, bounded tutor agent
   hybrid retrieval          pgvector + Postgres full-text, reciprocal rank fusion, reranking
   MCP                       curriculum server (public) and tool clients (student data via the API)
   |
   +--> SQS results queue --> .NET worker (Wolverine outbox)
```

| Part | Stack |
|---|---|
| `web/` | Next.js 16 App Router, React Server Components, Tailwind v4, shadcn/ui, TanStack Query client generated from the API's OpenAPI document |
| `api/` | .NET 10 modular monolith, minimal APIs with vertical slices, EF Core with a schema per module, Wolverine transactional outbox on Postgres, FluentValidation, RFC 9457 errors, architecture tests |
| `ai/` | Python 3.13, uv, FastAPI, Pydantic v2, LangGraph with a Postgres checkpointer, official Anthropic and OpenAI SDKs, MCP Python SDK, pgvector, SymPy, OpenTelemetry |
| `infra/` | Terraform on AWS (ECS Fargate, RDS, S3, SQS, Secrets Manager, ECS Service Connect), Cloudflare, GitHub OIDC with no long-lived keys |

Decisions are recorded as ADRs in `api/docs/adr/`.

## How the AI works

- **Workflows where the steps are known, an agent only where the model must choose tools.** Practice generation and grading are fixed LangGraph graphs. The tutor is the one agent, capped at six tool calls and 45 seconds per turn.
- **Code checks before model judges.** Generated questions pass schema, LaTeX, multiple-choice and SymPy answer checks before a level judge sees them. Failures get at most two repairs (the second on a stronger model). Anything still failing stops for human review, and the run resumes from its checkpoint.
- **Grading you can audit.** Code marks multiple choice and numeric answers. For written answers the model must quote the words that earn each mark, and quotes that are not in the answer are rejected. Answers worth six marks or more are marked independently by two model families, and disagreements escalate to a stronger model or a human.
- **The right model per job.** Code asks for a tier (fast, standard, deep), not a model. Judging and second marking prefer a different model family from the one that produced the work, to avoid self-preference. Retrieval uses OpenAI embeddings (Anthropic has none). Every routing choice is measured by the eval suite.
- **Grounded in the curriculum.** Hybrid search over CAPS documents, past papers and open textbooks, chunked by document structure, with citations. University students can add their own notes, isolated by Postgres row-level security.
- **Evals gate every change.** Offline suites run on every pull request: retrieval recall, MRR and nDCG, and the safety floor. Live suites run nightly: agreement between grading and human marks (quadratic weighted kappa), tutor tool trajectories, and safety. Results come with bootstrap confidence intervals.
- **Cost and tracing.** Every model call records tokens and cost and emits OpenTelemetry GenAI spans. A daily spend ceiling drops interactive work to the fast tier and pauses offline work.

## Security

- **Network:** the ai service has no public ingress. It accepts only short-lived ES256 service tokens, audience-bound and scoped per use, signed by the API's own keys.
- **Authorisation lives in the tools, not the prompt.** Student-data tools run through the API with the student's own delegated token, so the model cannot see more than the student can, whatever it is told.
- **Untrusted content stays untrusted.** Student messages, notes and tool results are wrapped as data, and closing tags inside them are neutralised. Once a turn has read untrusted content, write tools are removed for the rest of that turn. Write actions need the student's explicit confirmation.
- **Database:** students' notes sit behind Postgres row-level security, forced even for the table owner. Missing context returns no rows rather than all rows. Runtime database roles can change data but not the schema, and only migration tasks hold the master login.
- **Minors:** distress phrasing is answered with South African helplines without a model call or any storage. Model inputs carry grade and topics, never names or contact details. South African ID numbers, phone numbers and emails are redacted before tracing.
- **Supply chain and runtime:** dependency audit, secret scanning and image vulnerability scanning in CI. Containers run as non-root with read-only root filesystems. Secrets come only from AWS Secrets Manager.

## Running locally

Requirements: Docker, .NET 10 SDK, Node 24, Python 3.13 with [uv](https://docs.astral.sh/uv/).

```bash
docker compose -f infra/local/compose.yml up -d                  # Postgres with pgvector, Mailpit, MinIO
docker compose -f infra/local/compose.yml --profile ai up -d     # plus the ai service (fake model provider, no keys needed)

cd ai && uv sync && uv run pytest                                 # ai tests, including offline eval gates
cd api && dotnet test --solution Aptiverse.slnx                   # api tests (Testcontainers)
cd web && npm ci && npm run dev                                   # web on http://localhost:3000
```

To use real models, set `AI__GATEWAY__PROVIDERS='["anthropic","openai"]'` and the keys in `ai/.env`, which is not committed.

## Quality gates

| Area | Gate |
|---|---|
| ai | ruff, pyright (strict), pytest with Testcontainers, offline eval thresholds, pip-audit, gitleaks, Trivy, a read-only non-root container check |
| api | `dotnet format`, warnings as errors, architecture tests for module boundaries, integration tests, OpenAPI drift check |
| web | ESLint, type check, Vitest, Playwright |
| infra | `terraform fmt` and `validate`, identical environment stacks, tflint, Trivy |

## Status

The v2 rebuild is underway: the platform foundation, identity and the AI service are built, and the remaining product areas are being moved across from the live app. The AI quality numbers will be published here once they are measured on the real labelled sets; nothing is estimated.
