# Lucide icon registry

| | |
|---|---|
| ID | `UI-34` (split: `UI-138` to `UI-141`) |
| Phase | 3 |
| Depends on | SHL-04, FE-41 |
| File path | `web/src/components/shell/nav-icons.ts` |
| Status | 0 of 5 done, 2 partial, 3 not started |

## Purpose

The single swap point between data and icons. Navigation items (static `nav-config.ts` today, `GET /navigation` later) and notification types name an icon with a kebab case string, so they can travel as JSON; the registry turns the string into a Lucide component. Lucide is the only icon set (FE-41).

## API

| Export | Shape | Notes |
|---|---|---|
| `navIcons` | `Record<string, LucideIcon>` (`satisfies`) | Keys today: home, dashboard, book-open, clipboard-check, library-big, chart-line, flag, sparkles, notebook-pen, heart-handshake, compass, calendar, bell, gift, credit-card, settings, help, users, party-popper, file-text, support. |
| `NavIconName` | `keyof typeof navIcons` | |
| `resolveNavIcon(name: string)` | `LucideIcon` | Unknown names (a newer server config) fall back to `Compass`; uses `Object.hasOwn` so prototype keys cannot resolve. |

Planned: `notificationIcons` and `resolveNotificationIcon` (UI-141) on the same pattern for SHL-07.

## Variants

Navigation registry; notification type registry (UI-141).

## States

Known name resolves; unknown name falls back and logs once in development.

## Accessibility

Icons rendered from the registry are always `aria-hidden` next to a visible label. Icon only buttons must carry an `aria-label`.

## Tasks

- [ ] **UI-34** Lucide icon registry (server nav keys to components) *(partial: `navIcons` and `resolveNavIcon` in `web/src/components/shell/nav-icons.ts`, uncommitted WIP)*
- [ ] **UI-138** Commit with a Vitest unit test: every key resolves, unknown and `__proto__` fall back to the default *(partial: fallback logic exists, no test)*
- [ ] **UI-139** Test that every icon name in `nav-config.ts` (and later the `GET /navigation` contract enum, if the API publishes one) exists in the registry
- [ ] **UI-140** De-gamification review of keys: replace `party-popper` (celebrations) and reconsider `gift` and `sparkles` so icons read as academic signal, not rewards; record the decision here
- [ ] **UI-141** `notificationIcons` registry per notification type for the bell sheet (SHL-07), same fallback rule

## Tests

- Vitest `nav-icons.test.ts` as in UI-138 and UI-139.

## Verification

1. `npm test` passes with the registry tests.
2. Removing an icon used by `nav-config.ts` fails the UI-139 test.

## Open questions

- Should the API publish icon names as an enum in the OpenAPI contract so drift fails at generation time?
