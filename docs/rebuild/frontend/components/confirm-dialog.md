# ConfirmDialog

| | |
|---|---|
| ID | `UI-25` (split: `UI-90` to `UI-93`) |
| Phase | 3 |
| Depends on | UI-01, UI-07, UI-10 |
| File path | `web/src/components/common/confirm-dialog.tsx` |
| Status | 0 of 5 done, 1 partial (uncommitted WIP), 4 not started |

## Purpose

Ask before an action runs, especially destructive or irreversible ones (delete an assessment, cancel a subscription, revoke a parent link, refund in admin). It stays open and busy until the action settles so a double tap cannot fire twice.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `ReactNode` | required | Usually a Button; wrapped with `DialogTrigger asChild`. |
| `title` | `string` | required | Question form: "Delete this assessment?" |
| `description` | `string` | required | Consequence in plain words. |
| `confirmLabel` | `string` | "Confirm" | Use the verb: "Delete", "Cancel plan". |
| `cancelLabel` | `string` | "Cancel" | |
| `destructive` | `boolean` | `false` | Rose destructive button variant. |
| `onConfirm` | `() => void \| Promise<void>` | required | Dialog stays open with a spinner until it settles. |

Planned:

| Prop | Type | Notes |
|---|---|---|
| `open`, `onOpenChange` (UI-92) | controlled mode | For confirmations opened from menus. |
| `confirmText` (UI-91) | `string` | Type to confirm, for example the word "delete" for account deletion. |
| `errorMessage` (UI-90) | `string` | Fallback copy when `onConfirm` rejects. |

## Variants

Default, destructive, type to confirm (UI-91), controlled (UI-92). On phones this should render as a bottom sheet through `ResponsiveDialog` (UI-07) once that exists.

## States

- Idle; pending (both buttons disabled, spinner, dialog cannot be dismissed); success (closes, caller shows a toast); error (UI-90: stays open, inline error with `role="alert"`, buttons re-enabled).

## Accessibility

- Radix Dialog: focus trap, `Escape` closes when not pending, focus returns to the trigger.
- Initial focus on Cancel for destructive dialogs, so `Enter` does not destroy by accident.
- Title and description wired to `aria-labelledby` and `aria-describedby` by Radix.
- Buttons `min-h-11`; spinner `aria-hidden` and stops under reduced motion (already in WIP).
- Destructive meaning stated in text, not only by rose colour.

## Tasks

- [ ] **UI-25** ConfirmDialog (destructive variant) *(partial: trigger, title, description, labels, destructive and async pending state in `web/src/components/common/confirm-dialog.tsx`, uncommitted WIP; a rejected `onConfirm` leaves the dialog open with no message)*
- [ ] **UI-90** Error handling: catch rejection, show inline `role="alert"` message (ProblemDetails title if safe, else fallback), keep dialog open
- [ ] **UI-91** Type to confirm option for irreversible actions (account deletion, payout cancel)
- [ ] **UI-92** Controlled mode and initial focus on Cancel for destructive dialogs; switch to `ResponsiveDialog` when UI-07 lands
- [ ] **UI-93** Tests: Vitest (pending blocks close and double submit, rejection shows alert, type to confirm gates the button) and Playwright keyboard spec plus gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

- Vitest `confirm-dialog.test.tsx`: clicking confirm twice calls `onConfirm` once; Escape ignored while pending; rejected promise renders alert; confirm disabled until typed text matches.
- Playwright `gallery/confirm-dialog.spec.ts`: "opens with keyboard, focus on Cancel, Escape returns focus to trigger".

## Verification

1. In the gallery, a slow `onConfirm` (2 s) shows a spinner and blocks dismissal.
2. A rejecting `onConfirm` keeps the dialog open with a readable error.

## Open questions

- Should destructive confirmations in admin require a reason field that feeds the audit trail, or is that page specific?
