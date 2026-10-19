# Form field

| | |
|---|---|
| ID | `UI-03`, `UI-44` to `UI-47` |
| Phase | 3 |
| Depends on | UI-02, FE-05 (generated zod schemas), `react-hook-form` and `@hookform/resolvers` (installed) |
| File path | `web/src/components/ui/field.tsx` (committed); `web/src/components/common/form-fields.tsx` (uncommitted WIP) |
| Status | Partial. `ui/field.tsx` (shadcn Field family) is committed. `common/form-fields.tsx` has `useZodForm`, `TextField` and `SelectField` but is uncommitted and untested. 0 of 5 tasks done, 1 partial. |

## Purpose

Binds a control to react-hook-form with the zod schema Orval generates from the OpenAPI document, so client validation matches the API. One wrapper supplies label, hint and error text, ids and `aria-describedby`, so no page wires accessibility by hand.

## API

| Export | Props | Default | Notes |
|---|---|---|---|
| `useZodForm(schema, options?)` | zod schema, `UseFormProps` without `resolver` | `mode: "onTouched"` | Typed `useForm` with `zodResolver`. Exists in WIP. |
| `TextField` | `control`, `name`, `label`, `description?`, Input props except `name`, `value`, `defaultValue` | class `h-11 text-base` | Exists in WIP. |
| `SelectField` | `control`, `name`, `label`, `description?`, `options: { value, label }[]`, `placeholder?` | `"Choose one"` | Exists in WIP. |
| `TextareaField` | as `TextField` with Textarea props | | New (UI-45). |
| `CheckboxField`, `RadioGroupField`, `SwitchField` | `control`, `name`, `label`, `description?`, `options` for radio | | New (UI-45). |
| `FormRootError` | `form` | | New (UI-46): shows ProblemDetails `detail` for errors not tied to a field. |
| `applyProblemDetails(form, error)` | react-hook-form instance, `ApiError` | | New (UI-46): maps a 400 response's `errors` keys onto fields. |

## Variants

- Vertical (default, mobile) and horizontal from `@md` (already supported by `FieldGroup` container queries in `ui/field.tsx`).
- Optional fields say "(optional)" after the label; required fields carry no asterisk.

## States

Pristine, touched and valid, invalid (error shown after blur, `aria-invalid` on the control), submitting (fields disabled, submit Button `loading`), server error (root error plus field errors from ProblemDetails).

## Accessibility

- Label `htmlFor` matches the control id; description and error ids are joined in `aria-describedby` (done in WIP).
- Only the root error uses `role="alert"`; field errors are read through `aria-describedby` on focus.
- On a failed submit, focus moves to the first invalid field.
- Ids must be valid for nested names (`profile.grade`); the WIP uses `field-${name}` with no sanitising and no `useId` prefix, so two instances of a form on one page would collide.
- RTL not required for v1.

## Tasks

- [ ] **UI-03** Form field wrapper bound to react-hook-form plus generated zod (label, hint, error) *(partial: uncommitted WIP in `web/src/components/common/form-fields.tsx` with `useZodForm`, `TextField`, `SelectField` on `ui/field.tsx`)*
- [ ] **UI-44** Review and commit `form-fields.tsx`: id sanitising for nested names, `useId` prefix, unit tests
- [ ] **UI-45** Add `TextareaField`, `CheckboxField`, `RadioGroupField`, `SwitchField` on the controls from `form-inputs.md`
- [ ] **UI-46** `FormRootError` and `applyProblemDetails` mapping `ApiError` (from `web/src/lib/api/fetcher.ts`) validation errors to fields
- [ ] **UI-47** Focus the first invalid field on submit, submitting state (fields disabled, submit Button `loading`), and a documented example form in the gallery built on a generated zod schema

## Tests

- Vitest `form-fields.test.tsx`: clicking the label focuses the control; error appears after blur with `aria-invalid` and `aria-describedby`; `applyProblemDetails` maps `{ errors: { Email: ["..."] } }` to `email`; nested name `profile.grade` yields a valid, unique id.
- Playwright `dev-ui-form.spec.ts`: submitting an empty form moves focus to the first invalid field; axe zero violations in the error state; light and dark, 360 and 1440 snapshots.

## Verification

1. The gallery example form validates with a generated zod schema, and the same rule fails server-side with a matching message.
2. Screen reader check (VoiceOver or NVDA) reads label, hint and error for a focused invalid field.

## Open questions

- ASP.NET ProblemDetails `errors` keys are PascalCase property paths. Agree a case rule with the API so mapping is mechanical.
- Should error copy come from the generated zod messages or from a shared plain-English message map?
