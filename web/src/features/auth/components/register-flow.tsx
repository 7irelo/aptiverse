"use client";

import { GraduationCap, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { z } from "zod";

import { TextField } from "@/components/common/form-fields";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { RegisterBody } from "@/lib/api/generated/zod/identity/identity.zod";

import { IDLE } from "../lib/form-state";
import {
  emailSchema,
  newPasswordSchema,
  passwordHint,
} from "../lib/password-policy";
import { registerAction } from "../server/actions";
import { FormBanner } from "./form-banner";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { useActionForm } from "./use-action-form";

export type SignupRole = "student" | "parent";

const ROLES: {
  value: SignupRole;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "At high school, or at university or college",
    icon: GraduationCap,
  },
  {
    value: "parent",
    label: "Parent",
    description: "Supporting my child with their studies",
    icon: Users,
  },
];

/** The generated RegisterBody fields the person types, with the API policy. */
const registerSchema = RegisterBody.pick({
  name: true,
  email: true,
  password: true,
}).extend({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(120, "Use 120 characters or fewer."),
  email: emailSchema,
  password: newPasswordSchema,
  consent: z.boolean().refine((value) => value, {
    message: "Please agree to the Terms and Privacy Policy to continue.",
  }),
});

const DRAFT_KEY = "aptiverse.signup-draft";

type Legal = {
  termsVersion: string;
  privacyVersion: string;
  termsUrl: string;
  privacyUrl: string;
};

/**
 * Sign up in two steps: who you are (student or parent), then your details.
 * Only name and email are kept as a draft in sessionStorage, never the
 * password, so a trip to the Terms page does not lose them.
 */
export function RegisterFlow({
  presetRole,
  next,
  legal,
}: {
  presetRole: SignupRole | null;
  next: string | null;
  legal: Legal;
}) {
  const [role, setRole] = useState<SignupRole | null>(presetRole);

  if (!role) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">Step 1 of 2</p>
        <RoleChoice onChoose={setRole} />
        <LoginPrompt />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Step 2 of 2</p>
      <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-2">
        <p className="text-base">
          Signing up as{" "}
          <span className="font-semibold">
            {role === "student" ? "Student" : "Parent"}
          </span>
        </p>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11"
          onClick={() => setRole(null)}
        >
          Change
        </Button>
      </div>
      <RegisterForm role={role} next={next} legal={legal} />
      <LoginPrompt />
    </div>
  );
}

function RoleChoice({ onChoose }: { onChoose: (role: SignupRole) => void }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-base font-medium">I am signing up as</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ value, label, description, icon: Icon }) => (
          <label
            key={value}
            className="flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            <input
              type="radio"
              name="role-choice"
              value={value}
              className="sr-only"
              onChange={() => onChoose(value)}
            />
            <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{label}</span>
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function LoginPrompt() {
  return (
    <p className="text-center text-base text-muted-foreground">
      Already have an account?{" "}
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center font-medium text-foreground underline underline-offset-4"
      >
        Log in
      </Link>
    </p>
  );
}

function readDraft(): { name?: string; email?: string } {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as { name?: string; email?: string }) : {};
  } catch {
    return {};
  }
}

function RegisterForm({
  role,
  next,
  legal,
}: {
  role: SignupRole;
  next: string | null;
  legal: Legal;
}) {
  const { form, state, pending, done, formProps } = useActionForm(
    registerSchema,
    registerAction,
    IDLE,
    { name: "", email: "", password: "", consent: false },
  );

  // Restore the name and email draft once, after hydration.
  useEffect(() => {
    const draft = readDraft();
    if (draft.name) form.setValue("name", draft.name);
    if (draft.email) form.setValue("email", draft.email);
  }, [form]);

  const name = useWatch({ control: form.control, name: "name" });
  const email = useWatch({ control: form.control, name: "email" });
  useEffect(() => {
    try {
      if (done) window.sessionStorage.removeItem(DRAFT_KEY);
      else
        window.sessionStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ name, email }),
        );
    } catch {
      // Storage can be unavailable (private mode); the draft is a nicety.
    }
  }, [name, email, done]);

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <FormBanner banner={state.banner} version={state.at} />
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="termsVersion" value={legal.termsVersion} />
      <input type="hidden" name="privacyVersion" value={legal.privacyVersion} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <TextField
        control={form.control}
        name="name"
        label="Your name"
        autoComplete="name"
      />
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
      />
      <PasswordField
        control={form.control}
        name="password"
        label="Password"
        hint={passwordHint}
        autoComplete="new-password"
      />
      <Controller
        control={form.control}
        name="consent"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                id="field-consent"
                type="checkbox"
                name="consent"
                ref={field.ref}
                checked={!!field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={
                  fieldState.error ? "field-consent-error" : undefined
                }
                className="mt-1 size-5 shrink-0 accent-primary"
              />
              <label htmlFor="field-consent" className="text-base">
                I agree to the{" "}
                <a
                  href={legal.termsUrl}
                  className="font-medium underline underline-offset-4"
                >
                  Terms
                </a>{" "}
                and the{" "}
                <a
                  href={legal.privacyUrl}
                  className="font-medium underline underline-offset-4"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            <FieldError id="field-consent-error" errors={[fieldState.error]} />
            <p className="text-sm text-muted-foreground">
              We will send you an email to confirm your address.
            </p>
          </div>
        )}
      />
      <SubmitButton
        pending={pending}
        done={done}
        pendingLabel="Creating your account..."
      >
        Create account
      </SubmitButton>
    </form>
  );
}
