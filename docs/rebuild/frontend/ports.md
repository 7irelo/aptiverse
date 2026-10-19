# Ports from the old app (logic, not markup)

| | |
|---|---|
| ID range | `FE-60` to `FE-64`, `FE-151` to `FE-160`, `FE-167` |
| Phase | 5 to 7 (FE-63 in Phase 10; FE-157 deferred until after launch, decision 8) |
| Depends on | Practice, Academics and Billing backend slices; `FE-07`, `FE-24`, `FE-50` |
| Code path | `web/src/features/career/`, `web/src/features/practice/hooks/`, `web/src/lib/sse/`, `web/src/lib/analytics/`, `web/src/lib/entitlements.ts` |
| Status | 16 tasks: 0 done, 0 partial, 0 unverified, 1 deferred (FE-157), 15 not started |

## Purpose

Carry over the parts of the old web app that encode real domain rules, as pure, tested TypeScript, without copying old markup or MUI code. References are at commit `f223ca7` (`git show f223ca7:<path>`), except the career reach engine and its UI (`web/src/lib/targets/reach.ts`, `web/src/components/career/TargetDialog.tsx`, `WhatIfPanel.tsx`, `ReachChip.tsx`, `web/src/app/(app)/dashboard/career/targets/[id]/page.tsx`), which exist only at commit `43f9faa` (`git show 43f9faa:<path>`), the last tree of the old app before the org repo layout replaced it. Never paste code from either.

## Scope

| Old source (commit) | New home | Notes |
|---|---|---|
| `web/src/lib/targets/reach.ts` at `43f9faa` (UX references: `components/career/TargetDialog.tsx`, `WhatIfPanel.tsx`, target detail page, same commit) | `src/features/career/lib/reach.ts` | Evidence-only arithmetic; no evidence stays `null`, never zero |
| `PracticeRunner.tsx` (logic only) at `f223ca7` | `src/features/practice/hooks/` | Server-authoritative timing; the client only displays |
| fetch-based SSE reader at `f223ca7` | `src/lib/sse/read-sse.ts` | Used by tutor chat through the BFF (FE-26) |
| `lib/analytics/consent.ts` at `f223ca7` | `src/lib/analytics/consent.ts` | POPIA consent gate; no Meta in v1 (decision 8) |
| `features.ts` keys at `f223ca7` | `src/lib/entitlements.ts` | Replaced by a generated enum once the API exposes one |

The ASCII-math bridge is already ported as uncommitted WIP in `src/lib/math/ascii-math.ts` with a test; it is tracked under UI-28 (`frontend/components/math-text.md`).

## Tasks

### Career gap engine

- [ ] **FE-60** `lib/targets/reach.ts` career gap engine (source at `43f9faa`, not `f223ca7`) into `features/career`, typed from the generated client (standing per requirement, overall reach, what-if inputs)
- [ ] **FE-151** Unit tests for the reach engine: no marks gives `null` standing and "no marks yet" copy, partial evidence, exact threshold, above threshold, mixed high school (APS style) and university requirement shapes; tests written from the old behaviour, not copied. Split from FE-60.

### Practice integrity hooks

- [ ] **FE-61** Timer hook `useAttemptTimer`: renders remaining time from the server's `endsAt`, resyncs on visibility return, triggers auto-submit at zero, never trusts the device clock for the deadline
- [ ] **FE-152** Focus monitor hook `useFocusMonitor`: counts `visibilitychange` and window blur events, reports each to the attempt API (`focus_loss_count`), debounced, and shows the agreed warning copy. Split from FE-61.
- [ ] **FE-153** Autosave hook `useAttemptAutosave`: debounced saves of answers with an idempotency key per change, retry with backoff, a visible "saved" or "not saved yet" state, and a flush before submit. Split from FE-61.
- [ ] **FE-154** Tests for the three hooks with fake timers and MSW: deadline passes while the tab is hidden, network drop during autosave, double submit prevented.

### Streaming

- [ ] **FE-62** Fetch-based SSE reader (`src/lib/sse/read-sse.ts`): parses `event`, `data`, `id` and comment lines from a `ReadableStream`, yields typed events
- [ ] **FE-155** SSE reader resilience: `AbortSignal` support, partial-chunk handling across UTF-8 boundaries, error event mapping to ProblemDetails, unit tests with chunked fixtures. Split from FE-62.

### Consent-gated analytics

- [ ] **FE-63** Consent-gated analytics (`lib/analytics/consent.ts`): the single gate any future marketing tag must pass; in v1 it gates custom `track()` events only, and no Meta pixel or CAPI ships (decision 8)
- [ ] **FE-156** Consent store: first-party cookie recording consent version, categories (necessary, analytics, marketing) and timestamp; the server reads it so nothing marketing-related renders before consent; mirrors the API's consent record when signed in. Split from FE-63.
- [ ] **FE-157** Meta pixel loader only after marketing consent, never for users under 18 (age from the session); CSP `script-src` and `connect-src` updated in the same change. Split from FE-63. *(deferred: decision 8, not in v1)*
- [ ] **FE-158** Vercel Analytics review: confirm it is cookieless and PII-free so it may run without consent, or move it behind the analytics category; record the answer in `launch/popia.md` scope.
- [ ] **FE-167** CSP and dependency guard for decision 8: `script-src`, `connect-src`, `img-src` and `frame-src` allow no Meta or Facebook domains (`connect.facebook.net`, `*.facebook.com`, `*.fbcdn.net`); a unit test on the CSP builder and a lint rule (or `package.json` check) fail the build if a Meta SDK or pixel snippet is added before decision 8 is reopened by ADR.

- [ ] **FE-160** `src/lib/analytics/track.ts`: one `track(event, props)` helper with a typed event-name union (no free-form strings), props limited to ids and enums (no names, emails, free text or marks), dropped silently without analytics consent (FE-156), server-side variant for conversion events; unit tests for consent off, unknown event (type error) and PII-shaped props rejected by the schema. Pages call only this helper.

### Entitlements

- [ ] **FE-64** `features.ts` entitlement keys (`src/lib/entitlements.ts`: a typed union of feature keys used by `UpgradeGate` and navigation)
- [ ] **FE-159** Switch FE-64 to the generated enum when the API publishes entitlement keys in the spec; delete the hand-kept union. Split from FE-64.

## Verification

1. `npm test -- features/career lib/sse features/practice` passes with the cases listed above.
2. A Playwright practice spec hides the page past the deadline and sees the attempt auto-submitted with the server's time (FE-61, FE-154).
3. With consent accepted and declined, and with an adult and an under-18 session, the network log shows no request to Meta or Facebook domains, and the CSP header lists none (FE-167).
4. `grep -rn "f223ca7" web/src` finds nothing (no pasted old code markers).

## Open questions

- Decided (8): no Meta pixel or CAPI in v1; FE-157 is deferred and FE-167 guards against it slipping in.
- Does Vercel Analytics count as necessary under the POPIA reading we adopt (FE-158)?
- Who owns warning copy for focus loss: practice page spec or the integrity rules ADR?
