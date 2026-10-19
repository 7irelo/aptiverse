# UpgradeGate

| | |
|---|---|
| ID | `UI-32` (split: `UI-128` to `UI-132`) |
| Phase | 3 (wired to real entitlements in Phase 6) |
| Depends on | FE-24, FE-64, UI-21 |
| File path | today inside `web/src/components/shell/page-states.tsx`; planned `web/src/components/shell/upgrade-gate.tsx` and `web/src/lib/auth/entitlements.ts` |
| Status | 0 of 6 done, 1 partial (placeholder UI only), 5 not started |

## Purpose

Shown in place of a feature the user's plan does not include. It explains and links to plans; it never nags, counts down or hides what the student already has. Entitlements come from the session (`/me`), never from a hand synced list.

## API

Current placeholder:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `feature` | `string` | required | Human name, "AI tutor". |
| `description` | `string` | generated | Default: "Upgrade your plan to unlock {feature}. Everything you have done so far stays where it is." |
| `upgradeHref` | `string` | `/dashboard/billing` | |
| `className` | `string` | none | |

Planned (UI-128, UI-129):

| Export | Shape | Notes |
|---|---|---|
| `hasEntitlement(user, key)` | server helper | Reads `SessionUser.entitlements`. |
| `<RequireEntitlement feature={key} fallback?>` | Server Component | Renders children when entitled, otherwise UpgradeGate. |
| `UpgradeGate` props | adds `featureKey: FeatureKey`, `variant?: "page" \| "inline"`, `payer?: "self" \| "parent"` | `FeatureKey` from the generated enum (FE-64). |

## Variants

- Page (current): full section with lock icon on a citron surface and a citron "See plans" button (graphite text on citron).
- Inline (UI-130): inside a card, one line plus a link.
- Parent pays (UI-131): for a student whose plan is parent managed, copy says "Ask your parent to upgrade" and links to sharing the plans page, no checkout link.

## States

Entitled (children render), not entitled (gate), entitlement unknown because the session failed (treated as not entitled server side, and the page shows its error state instead of the gate).

## Accessibility

- Section labelled by its heading; heading id unique per instance (UI-74).
- Button is a real link, 44px, accessible name "See plans".
- Lock and sparkle icons `aria-hidden`.
- Citron only as a surface; text on it is `text-on-citron`.

## Tasks

- [ ] **UI-32** UpgradeGate (reads entitlements from session) *(partial: placeholder `UpgradeGate` UI in `web/src/components/shell/page-states.tsx`, uncommitted WIP; does not read entitlements, `SessionUser.entitlements` exists only as a mock in `web/src/lib/auth/session-user.ts`)*
- [ ] **UI-128** `hasEntitlement` server helper and `RequireEntitlement` Server Component reading the session (FE-24)
- [ ] **UI-129** Move UpgradeGate into its own file and type `featureKey` with the generated feature enum (FE-64)
- [ ] **UI-130** Inline variant for card level gates
- [ ] **UI-131** Copy review and parent pays variant (no nagging, no countdowns, no fake scarcity), checked against the claims ledger during HRD-43
- [ ] **UI-132** Tests: Vitest (entitled renders children, not entitled renders gate, unknown key fails closed) and gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

As in UI-132, plus a Playwright per role spec in Phase 6: a free student opening the tutor sees the gate; a paid student does not.

## Verification

1. With the dev session switcher, a mock user without `ai-tutor` sees the gate on the tutor page.
2. The API independently returns 403 with an entitlement problem type for the same action (the gate is UX, the API enforces).

## Open questions

- Should the gate show which plan includes the feature and its price (`R1 234` format), or just link to pricing?
