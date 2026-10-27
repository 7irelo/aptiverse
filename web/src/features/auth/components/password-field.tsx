"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/**
 * Password input with a show or hide toggle (no confirm field), a Caps Lock
 * notice and an optional hint. Paste is always allowed. Shared by log in,
 * sign up and reset password.
 */
export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  autoComplete,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const id = `field-${name}`;
        const hintId = hint ? `${id}-description` : undefined;
        const capsId = `${id}-caps`;
        const errorId = fieldState.error ? `${id}-error` : undefined;
        return (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div className="relative">
              <Input
                {...field}
                value={field.value ?? ""}
                onBlur={() => {
                  setCapsLock(false);
                  field.onBlur();
                }}
                onKeyDown={trackCapsLock}
                onKeyUp={trackCapsLock}
                id={id}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={
                  [hintId, capsLock ? capsId : undefined, errorId]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                className="h-11 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-pressed={visible}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-controls={id}
                className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {visible ? (
                  <EyeOff aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </button>
            </div>
            <p
              id={capsId}
              aria-live="polite"
              className={capsLock ? "text-sm text-foreground" : "sr-only"}
            >
              {capsLock ? "Caps Lock is on" : ""}
            </p>
            {hint ? (
              <FieldDescription id={hintId}>{hint}</FieldDescription>
            ) : null}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
