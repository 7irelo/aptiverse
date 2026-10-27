"use client";

import Link from "next/link";
import { z } from "zod";

import { TextField } from "@/components/common/form-fields";
import { LoginBody } from "@/lib/api/generated/zod/identity/identity.zod";

import { IDLE } from "../lib/form-state";
import { emailSchema } from "../lib/password-policy";
import { loginAction } from "../server/actions";
import { FormBanner } from "./form-banner";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { useActionForm } from "./use-action-form";

/** The generated LoginBody, with the page's friendly messages. */
const loginSchema = LoginBody.extend({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export function LoginForm({ next }: { next: string | null }) {
  const { form, state, pending, done, formProps } = useActionForm(
    loginSchema,
    loginAction,
    IDLE,
    { email: "", password: "" },
  );

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <FormBanner banner={state.banner} version={state.at} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
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
      <div className="flex flex-col gap-1">
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="current-password"
        />
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center self-end rounded-md px-1 text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Forgot your password?
        </Link>
      </div>
      <SubmitButton
        pending={pending}
        done={done}
        pendingLabel="Logging you in..."
      >
        Log in
      </SubmitButton>
    </form>
  );
}
