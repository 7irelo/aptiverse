# Product polish

| | |
|---|---|
| ID range | `HRD-40` to `HRD-44`, `HRD-158` to `HRD-167` |
| Phase | 10 |
| Depends on | every `pages/` file, `frontend/testing.md`, `frontend/guardrails.md`, claims ledger in `web/marketing/` at `f223ca7` |
| Status | 0 done, 0 partial, 0 unverified, 15 not started |

## Purpose

A final, evidence-based pass so the product reads, looks and behaves as one thing on the phones students actually use, in both colour schemes, with honest copy.

## Scope

- Devices: one low-end Android (2 GB RAM class, Chrome), one mid Android, one iPhone (Safari), on a throttled 3G or slow 4G profile.
- Routes: every v1 route in `pages/README.md`, per role and per stage.
- Artefacts: `web/docs/polish/device-pass.md`, `a11y-audit.md`, `copy-review.md`, `claims-review.md`, each a table of route, finding, severity, fix PR.

## Tasks

### Devices
- [ ] **HRD-40** Real-device mobile pass (Android low-end, iPhone) (umbrella)
- [ ] **HRD-158** Low-end Android pass: every student route, record load time, jank, tap target misses, keyboard overlap on forms, findings logged
- [ ] **HRD-159** iPhone Safari pass: safe areas, bottom nav over the home indicator, date inputs, MathLive input behaviour, SSE tutor streaming
- [ ] **HRD-160** Slow network pass: loading states appear within 200 ms, no layout shift on data arrival, offline error copy offers retry

### Accessibility
- [ ] **HRD-41** Full a11y audit (umbrella)
- [ ] **HRD-161** Screen reader pass (TalkBack and VoiceOver) on sign up, onboarding, practice attempt, results, tutor chat; charts expose their data table
- [ ] **HRD-162** Keyboard-only pass on desktop: focus order, visible focus ring, dialogs trap and return focus, skip link works
- [ ] **HRD-163** Zoom and text size: 200% zoom and OS large text at 360px without loss of content or horizontal scroll

### Copy and claims
- [ ] **HRD-42** Empty states and error copy review: every page's States section copy matches what ships; no "0" where "no marks yet" belongs
- [ ] **HRD-43** Copy and claims against the claims ledger (port `web/marketing/` claims ledger from `f223ca7` into `web/docs/polish/claims-review.md`; each marketing claim has evidence or is removed)
- [ ] **HRD-164** Writing rules sweep: CI scan for emojis, em dashes and en dashes passes across web, api user-facing strings and email templates (FE-42)
- [ ] **HRD-165** Money and date formatting sweep: money shows as `R1 234` from integer cents, dates in `Africa/Johannesburg`, consistent relative times
- [ ] **HRD-44** Stage-wording sweep: no SBA, APS or matric wording for university students; no tertiary-only wording for high school students. Correction: the original task also said "no APS for primary", but there is no primary-school stage in v1, so that clause is dropped
- [ ] **HRD-166** De-gamification check: no confetti, mascots or streak-shaming copy anywhere; achievements use amber only for earned milestones
- [ ] **HRD-167** Colour scheme pass: every route at 360 and 1440 in light and dark, citron never used as text on light, screenshots stored

## Verification

- Each findings table has every HIGH item closed with a PR link before HRD-63.
- axe runs in Playwright are clean on every page spec (FE-53) and the manual audit adds no unresolved serious issue.

## Open questions

- Which exact low-end device model represents our users? Ask for analytics from the old app (Vercel Analytics device data).
