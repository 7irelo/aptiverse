# Backlog conventions

How every file in `docs/rebuild/` is written. Read this before adding or editing a file.

## Sources of truth

- `REBUILD_PLAN.md` (repo root): phases, architecture, decisions. Wins over everything else.
- `api/CLAUDE.md`, `web/CLAUDE.md`, `infra/CLAUDE.md`: the rules the code follows. A task must never contradict them.
- `api/docs/adr/`: decisions already recorded.
- Old app at commit `43f9faa` (`git show 43f9faa:<path>`, with `api/`, `web/`, `infra/` at the root): the last version of the old app, with 47 migrations and 124 tables, including consents, admission targets and affiliates. Reference for features, domain rules, table shapes and UX only. Never copy its code.
- Commit `f223ca7` is an older monorepo snapshot (36 migrations). Use it only for `DESIGN_BRIEF.md` and `web/PRODUCT.md`; where the brief disagrees with the rebuild plan (Chalk & Pine, MUI, primary-school stage, study groups), the rebuild plan wins.
- The code in `api/`, `web/`, `infra/`: what is already built. Status lines must match it.

## Product rules every task respects

- Audience: South African students, high school (CAPS on NSC or IEB, Grades 8 to 12) and university or college. No primary-school stage in v1. Parents of those students. A lean internal admin.
- A student is either high school (subjects from the CAPS catalog) or tertiary (institution-scoped courses), never both. Topics are emergent per subject or course.
- Real data only. No hardcoded or random numbers. Missing evidence shows as "no marks yet", never zero.
- De-gamified: progress is academic signal, not points as the point. No mascots, confetti or streak-shaming.
- Mobile first at 360px. Light and dark follow the OS only. Graphite & Citron tokens; citron is a surface, never text. Lucide icons only.
- No emojis. No em dashes or en dashes anywhere, including these docs.
- No bursaries, no marketplace, no course selling.
- Money is integer cents plus currency, shown as `R1 234`.

## Task IDs

- Format `<AREA>-<NN>`; page quality tasks `<PAGE-ID>-Q<NN>`. Existing IDs never change or get reused. New tasks take the next free number in their area.
- Areas: `ARC` decisions, `SEC` secrets, `FIX` live-app fixes, `REPO` repositories, `INF` Terraform, `CI` pipelines, `OBS` observability, `BE-<MOD>` backend, `FE` frontend foundation, `UI` components, `SHL` shell, `PG-<AREA>-<PAGE>` pages, `HRD` hardening, `MIG` migration, `CUT` cutover, `GRW` post-launch.
- One task is one reviewable change (roughly half a day or less). If a task needs "and" twice, split it.

## Status marks

- `- [ ]` not started
- `- [x]` done and verified in the code (say where in a short note if not obvious)
- `- [ ] ... *(partial: what exists, what is missing)*` started but not finished
- `- [ ] ... *(unverified: why)*` cannot be checked from the repo (for example AWS state or a human action)
- `- [ ] ... *(deferred: decision N, not in v1)*` ruled out of v1 by a decision in `DECISIONS.md`; the ID is kept so the work can return, and it is not counted as v1 work

Every file has a `Status` line in its header summarising the above.

## Production bar

The target is enterprise-grade and production-proof. Every page, module, infrastructure and pipeline file has a `## Production readiness` section with concrete, checkable tasks covering, as they apply:

- Security: server-side authorisation and ownership, threat model (STRIDE), input limits, CSRF through the BFF, no secrets or personal information in URLs or logs, OWASP ASVS L2 for auth and payments.
- Performance: budgets (mobile LCP under 2.5s, JS under 150 KB gzip per route, API p95 under 500 ms excluding AI), cache strategy, indexes and query plans.
- Resilience: timeouts, retries, circuit breakers, idempotent unsafe operations, double-submit protection, graceful degradation when Anthropic or Paystack is down.
- Observability: structured log fields, trace spans, named metrics, the alert that fires and the dashboard that shows it.
- Privacy and POPIA: personal information classification, minors and parental consent, special personal information (wellbeing), retention, export and deletion coverage, consent-gated analytics.
- Delivery: feature flag or staged rollout, expand-and-contract migrations, rollback plan, SLO contribution.

Generic boilerplate does not count; each item names the specific risk for that file.

## File templates

### Page (`pages/<area>/<page>.md`)

```
# <Page name>

| | |
|---|---|
| ID | `PG-...` |
| Route | `/...` |
| Phase | N |
| Roles | student / parent / admin |
| Stages | high school, university (or one of them) |
| Entitlement | feature key or "free" |
| Depends on | BE and FE task IDs |
| Old app reference | path at 43f9faa, or "new" |
| Status | ... |

## Purpose
## User stories
## Layout
### Mobile (360px)      ordered blocks, top to bottom
### Desktop (1440px)    grid and what moves where
## Components           table: component, file path, server or client, notes
## Data                 table: endpoint (BE ID), method, fields used, cache tag; then mutations
## States               loading, empty, error, forbidden, upgrade, no evidence, populated, each with exact copy
## Stage variants       high school vs university differences
## Interactions and edge cases
## Copy                 key strings, final wording
## Acceptance criteria  Given / When / Then, each testable
## Production readiness security, performance, resilience, observability, privacy, rollout, monitoring
## Build tasks          checkboxes with IDs
## Quality tasks        checkboxes with IDs
## Tests                unit and Playwright scenarios by name
## Open questions
```

### Backend module (`backend/<module>.md`)

```
# <Module> module

| | |
|---|---|
| Schema | ... |
| Projects | src/Modules/<Name>/Aptiverse.<Name>, .Contracts |
| Phase | N |
| Consumes | other modules' contracts |
| Publishes | integration events |
| Status | ... |

## Responsibilities and out of scope
## Data model          one table per entity: column, type, null, constraint or index
## Contracts           events and query interfaces, with fields
## Slices              one subsection per endpoint:
                       ### BE-XXX-NN  METHOD /route
                       permission, entitlement, rate-limit group, request fields and validation rules,
                       response shape, failures (Error type to HTTP status), events, idempotency,
                       then sub-checkboxes: endpoint, request records, validator, handler, unit tests, integration tests
## Background work      scheduled messages and handlers
## Production readiness threat model, limits, idempotency, resilience, POPIA, metrics and alerts, budgets, migration safety
## Old data mapping     old tables at 43f9faa and how they map (feeds MIG tasks)
## Tests
## Open questions
```

### Infrastructure, pipeline, foundation, component and launch files

Same header table (ID range, phase, depends, status), then: purpose, exact scope (resources, inputs, outputs, files), tasks with IDs, verification steps, and open questions.
