# Avatar

| | |
|---|---|
| ID | `UI-12`, `UI-65` |
| Phase | 3 |
| Depends on | FE-31 |
| File path | `web/src/components/ui/avatar.tsx` |
| Status | Done for the primitive (shadcn `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`; sizes sm 24px, default 32px, lg 40px). Initials helper and image policy not started. 1 of 2 tasks done. |

## Purpose

Shows who a person is in the account menu, parent overview (linked students) and admin user lists. Real photos only when the user uploaded one; otherwise initials. No mascots or generated characters.

## API

| Export | Prop | Type | Default | Notes |
|---|---|---|---|---|
| `Avatar` | `size` | `sm`, `default`, `lg` | `default` | Existing. |
| `AvatarImage` | `src`, `alt` | | | Existing. `alt` is empty when the name is shown next to it. |
| `AvatarFallback` | children | | | Existing. |
| `UserAvatar` | `name`, `imageUrl?`, `size?` | | | New (UI-65): derives initials (first letter of first and last name, Unicode safe) and a neutral fallback surface. |
| `AvatarGroup`, `AvatarGroupCount` | | | | Existing; used for a parent with several linked students. |

## Variants

sm, default, lg; with or without `AvatarBadge` (status dot, for example unread). No coloured per-user backgrounds generated from hashes (keeps the palette honest).

## States

Image loading (fallback shown), image loaded, image failed (fallback).

## Accessibility

- If the avatar is the only identifier, it has an accessible name (`alt` or `aria-label` with the person's name); if the name is visible beside it, the avatar is `aria-hidden`.
- Badge status is also conveyed in text (for example "3 unread").
- Fallback text contrast meets AA on `bg-muted` in both schemes.
- RTL not required for v1.

## Tasks

- [x] **UI-12** Avatar (shadcn primitive committed in `web/src/components/ui/avatar.tsx`)
- [ ] **UI-65** `UserAvatar` with initials derivation, alt-text rule, presigned image URL support (short-lived GET from S3), and gallery entry

## Tests

- Vitest: `UserAvatar name="Thandi Mokoena"` renders "TM"; single name renders one letter; broken image falls back to initials.
- Playwright gallery `dev-ui-avatar.spec.ts`: sizes and group light and dark, 360 and 1440 snapshots; axe zero violations.

## Verification

1. Account menu example announces the user's name once, not twice.

## Open questions

- Do v1 users upload profile photos at all, or initials only until after launch? (Affects POPIA processing register: photos are personal information.)
