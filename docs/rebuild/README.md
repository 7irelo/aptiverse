# Aptiverse rebuild backlog

The complete, granular plan for rebuilding Aptiverse (web, API and infrastructure) to an enterprise, production-proof standard, broken down so that every page, module, component, Terraform unit, pipeline and launch concern has its own file and every task is about half a day of work or less.

It expands `REBUILD_PLAN.md` (repo root). The plan wins on direction; this backlog says exactly what to build, in what order, how to verify it, and what is already done in the code.

## Start here

1. **[DECISIONS.md](DECISIONS.md)**: every product, legal, money and operations decision, all accepted at the recommended defaults on 2026-10-19. Section F lists the facts still owed (names, bank, VAT status, budgets, user counts) and the phase that needs each.
2. **[CONVENTIONS.md](CONVENTIONS.md)**: task IDs, status marks, file templates and the production bar every file meets.
3. Work phase by phase (phase numbers are in every file's header). Do not start a phase until the previous phase's exit gate in `REBUILD_PLAN.md` passes.

## Progress

Counted from the task lists. Done and partial were checked against the code on 2026-10-19; unverified means it cannot be checked from the repo (AWS state, Vercel settings, secret rotation, human actions); deferred means a decision ruled it out of v1 (the ID is kept so the work can return).

| Folder | What it covers | Files | Tasks | Done | Partial | Unverified | Deferred |
|---|---|---|---|---|---|---|---|
| [`phase-0/`](phase-0/) | Phase 0: decisions, secrets, live-app fixes, repositories, security baseline, change management | 8 | 195 | 11 | 12 | 81 | 0 |
| [`infra/`](infra/) | Terraform: one file per module and environment, plus edge security, backups and account security | 21 | 166 | 29 | 9 | 26 | 0 |
| [`ci/`](ci/) | Pipelines for api, web and infra, and shared workflows | 4 | 93 | 9 | 11 | 4 | 0 |
| [`observability/`](observability/) | Telemetry, logging, dashboards and alerting | 4 | 50 | 4 | 4 | 5 | 0 |
| [`backend/`](backend/) | One file per API module | 15 | 1014 | 27 | 32 | 2 | 24 |
| [`frontend/`](frontend/) | Web foundation: skeleton, auth and BFF, tokens, guardrails, testing, ports, shell | 7 | 181 | 15 | 20 | 1 | 1 |
| [`frontend/components/`](frontend/components/) | One file per UI component | 28 | 136 | 2 | 25 | 0 | 0 |
| [`pages/`](pages/) | One file per page (see pages/README.md) | 69 | 2863 | 7 | 13 | 3 | 16 |
| [`launch/`](launch/) | Hardening, POPIA, disaster recovery, incidents, migration ETL, cutover, post-launch | 17 | 343 | 3 | 7 | 4 | 0 |
| **Total** | | **173** | **5041** | **107** | **133** | **126** | **41** |

## Blockers found in the code

Fixed on 2026-10-19: the API build (BE-SK-37, BE-SK-38), Identity wiring (BE-IDN-08, partial: no `/auth` or `/me` slices yet), the Dockerfile and module guard (BE-SK-53), the infra to api configuration contract (INF-49) and the image repository name and promotion model (INF-40, INF-41). The API builds, its tests pass (36 passed, 1 skipped by design), and it boots in Production mode with the variables infra injects.

Still open:

- **CI has not run yet.** The rebuild is pushed to a `rebuild` branch in each org repo (REPO-01), but the workflows trigger only on `main` and pull requests; a draft pull request from `rebuild` runs them. Local `main` is ahead of GitHub `main`, which still deploys the old app: never push the rebuild over it before cutover (FIX-25).
- **The new infra access model is unproven against AWS.** PowerUserAccess is gone, the app has its own database role, and task roles are split (INF-38, INF-45, INF-46, INF-74 on 2026-10-19), but this was written without an AWS account. A dev plan and apply with the new apply role must confirm it, and each environment moves onto the runtime database role once, in the order in `infra/README.md`.

## Every file

- **phase-0/**: [change-management](phase-0/change-management.md), [decisions](phase-0/decisions.md), [live-app-fixes](phase-0/live-app-fixes.md), [local-dev](phase-0/local-dev.md), [repositories](phase-0/repositories.md), [secrets](phase-0/secrets.md), [security-baseline](phase-0/security-baseline.md), [specs-and-inventories](phase-0/specs-and-inventories.md)
- **infra/**: [account-security](infra/account-security.md), [alb](infra/alb.md), [backup](infra/backup.md), [bootstrap](infra/bootstrap.md), [database](infra/database.md), [dns](infra/dns.md), [ecr](infra/ecr.md), [edge-security](infra/edge-security.md), [env-dev](infra/env-dev.md), [env-global](infra/env-global.md), [env-prod](infra/env-prod.md), [env-staging](infra/env-staging.md), [github-oidc](infra/github-oidc.md), [local-compose](infra/local-compose.md), [monitoring](infra/monitoring.md), [network](infra/network.md), [secrets](infra/secrets.md), [service](infra/service.md), [ses](infra/ses.md), [storage](infra/storage.md), [vercel](infra/vercel.md)
- **ci/**: [api-pipeline](ci/api-pipeline.md), [infra-pipeline](ci/infra-pipeline.md), [shared-workflows](ci/shared-workflows.md), [web-pipeline](ci/web-pipeline.md)
- **observability/**: [alerting](observability/alerting.md), [dashboards](observability/dashboards.md), [logging](observability/logging.md), [telemetry](observability/telemetry.md)
- **backend/**: [academics](backend/academics.md), [admin](backend/admin.md), [affiliates](backend/affiliates.md), [ai-tutor](backend/ai-tutor.md), [billing](backend/billing.md), [careers](backend/careers.md), [family](backend/family.md), [identity](backend/identity.md), [navigation](backend/navigation.md), [notifications](backend/notifications.md), [platform](backend/platform.md), [practice](backend/practice.md), [progress](backend/progress.md), [support](backend/support.md), [wellbeing](backend/wellbeing.md)
- **frontend/**: [auth-bff](frontend/auth-bff.md), [guardrails](frontend/guardrails.md), [ports](frontend/ports.md), [shell](frontend/shell.md), [skeleton](frontend/skeleton.md), [testing](frontend/testing.md), [tokens](frontend/tokens.md)
- **frontend/components/**: [avatar](frontend/components/avatar.md), [badge](frontend/components/badge.md), [button](frontend/components/button.md), [card](frontend/components/card.md), [charts](frontend/components/charts.md), [confirm-dialog](frontend/components/confirm-dialog.md), [data-table](frontend/components/data-table.md), [date-picker](frontend/components/date-picker.md), [drawer](frontend/components/drawer.md), [empty-state](frontend/components/empty-state.md), [file-upload](frontend/components/file-upload.md), [form-field](frontend/components/form-field.md), [form-inputs](frontend/components/form-inputs.md), [icon-registry](frontend/components/icon-registry.md), [markdown](frontend/components/markdown.md), [math-input](frontend/components/math-input.md), [math-text](frontend/components/math-text.md), [menus](frontend/components/menus.md), [page-header](frontend/components/page-header.md), [page-states](frontend/components/page-states.md), [progress](frontend/components/progress.md), [responsive-dialog](frontend/components/responsive-dialog.md), [skeleton](frontend/components/skeleton.md), [stage-gate](frontend/components/stage-gate.md), [stat-card](frontend/components/stat-card.md), [tabs](frontend/components/tabs.md), [toast](frontend/components/toast.md), [upgrade-gate](frontend/components/upgrade-gate.md)
- **launch/**: [breach-notification](launch/breach-notification.md), [cost-controls](launch/cost-controls.md), [cutover](launch/cutover.md), [data-subject-requests](launch/data-subject-requests.md), [disaster-recovery](launch/disaster-recovery.md), [incident-management](launch/incident-management.md), [migration-etl](launch/migration-etl.md), [pci-scope](launch/pci-scope.md), [performance](launch/performance.md), [polish](launch/polish.md), [popia](launch/popia.md), [post-launch](launch/post-launch.md), [prod-readiness](launch/prod-readiness.md), [retention-schedule](launch/retention-schedule.md), [runbooks](launch/runbooks.md), [security](launch/security.md), [slo-and-alerts](launch/slo-and-alerts.md)
- **pages/**: see [pages/README.md](pages/README.md) for all pages by area with routes, phases and counts.

## Sources

- `REBUILD_PLAN.md`: phases, architecture, decisions.
- `api/CLAUDE.md`, `web/CLAUDE.md`, `infra/CLAUDE.md`, `api/docs/adr/`: the rules the code follows.
- Old app at commit `43f9faa` (`git show 43f9faa:<path>`): features, domain rules and table shapes to carry over. `f223ca7` holds `DESIGN_BRIEF.md` and `web/PRODUCT.md`.
