# StageGate (useStage and getStage)

| | |
|---|---|
| ID | `UI-33` (split: `UI-133` to `UI-137`, `UI-142`) |
| Phase | 3 (filled from onboarding data in Phase 2 and 4) |
| Depends on | FE-24, onboarding endpoints in the Identity module (see `docs/rebuild/backend/`) |
| File path | planned `web/src/lib/auth/stage.ts`, `web/src/components/shell/stage-gate.tsx` |
| Status | 0 of 7 done, 0 partial, 7 not started |

## Correction to the original task

The source task listed three stages: primary, high school and university. Primary school is out of scope for v1 (CONVENTIONS product rules, REBUILD_PLAN section 3.4). The ID and meaning are kept; the stages are only:

- `high_school`: CAPS on NSC or IEB, Grades 8 to 12, subjects from the CAPS catalog.
- `university`: university or college, institution scoped courses with year of study.

A student is one or the other, never both. Parents and admins have no stage of their own; a parent's view uses the linked student's stage.

## Purpose

One way to ask "which stage is this student?" on the server and the client, so pages switch wording and blocks correctly: SBA, APS and matric appear for high school only; courses, credits and study level for university only.

## API (planned)

| Export | Shape | Notes |
|---|---|---|
| `type Stage` | `"high_school" \| "university"`, exactly these two values | From the generated client if `/me` exposes it. No primary value exists. |
| `getStage()` | `async () => Stage \| null` (server, `cache`d) | Reads the session user; null when onboarding is incomplete. |
| `useStage()` | `() => Stage \| null` (client) | From a context provider set by the app layout, no extra request. |
| `<StageGate stage="high_school">` | `{ stage: Stage \| Stage[]; children; fallback?: ReactNode }` | Server or client; renders children only for matching stages. |
| `stageCopy` | `Record<Stage, { unit: string; units: string; level: string; ... }>` | Dictionary: "subject" or "course" (decision 27), "Grade" or the study level (decision 19). |

## Variants

Server gate, client gate, copy dictionary lookup.

## States

Stage known; stage null (onboarding incomplete: `proxy.ts` redirects to onboarding per FE-27, gates render nothing); parent viewing a child (stage from the selected student).

## Accessibility

Not visual by itself. Gated content must not leave empty headings or landmarks behind when hidden.

## Tasks

- [ ] **UI-33** StageGate helper (`useStage` / server `getStage`): high school and university only (primary removed, see correction above)
- [ ] **UI-133** `getStage` server helper reading the session and onboarding state, cached per request
- [ ] **UI-134** `StageProvider` in the `(app)` layout and `useStage` client hook
- [ ] **UI-135** `StageGate` component with single or multiple stages and fallback
- [ ] **UI-136** `stageCopy` dictionary (unit names, level names, assessment wording) feeding the stage wording sweep HRD-44
- [ ] **UI-137** Tests: Vitest (each stage renders the right branch, null renders nothing, parent uses child stage) and a Playwright spec that a university student never sees "SBA", "APS" or "matric" on the dashboard
- [ ] **UI-142** Guard test that the `Stage` type and any runtime list of stages contain exactly `high_school` and `university` (a type level assertion plus a Vitest check that no `primary` value exists in `stage.ts`, `stageCopy` or the generated enum)

## Tests

As in UI-137 and UI-142.

## Verification

1. Switch the dev session between a high school and a university mock student: dashboard wording changes accordingly.
2. `rg -i "primary school|grade [1-7]\\b" web/src` finds nothing stage related.

## Open questions

- Does `/me` return the stage directly, or does the web derive it from education level (Identity onboarding contract)?
- How does a parent with two linked students, one in each stage, pick which stage a shared page uses?
