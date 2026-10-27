"use client";

import Link from "next/link";

import { ResetPasswordBody } from "@/lib/api/generated/zod/identity/identity.zod";

import { newPasswordSchema, passwordHint } from "../lib/password-policy";
import { resetPasswordAction, type ResetState } from "../server/actions";
import { FormBanner } from "./form-banner";
import { InvalidLink } from "./invalid-link";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { useActionForm } from "./use-action-form";
import { useStripTokenFromUrl } from "./use-token-from-url";

const resetSchema = ResetPasswordBody.pick({ newPassword: true }).extend({
  newPassword: newPasswordSchema,
});

const INITIAL: ResetState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  useStripTokenFromUrl("/reset-password");
  const { form, state, pending, done, formProps } = useActionForm(
    resetSchema,
    resetPasswordAction,
    INITIAL,
    { newPassword: "" },
  );

  if (state.invalidLink) {
    return (
      <InvalidLink
        body={state.detail ?? "Reset links work once and expire after 1 hour."}
        action={{ href: "/forgot-password", label: "Send a new link" }}
      />
    );
  }

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <FormBanner banner={state.banner} version={state.at} />
      <input type="hidden" name="token" value={token} />
      <PasswordField
        control={form.control}
        name="newPassword"
        label="New password"
        hint={passwordHint}
        autoComplete="new-password"
      />
      <SubmitButton pending={pending} done={done} pendingLabel="Saving...">
        Save new password
      </SubmitButton>
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center justify-center rounded-md text-base font-medium underline-offset-4 hover:underline"
      >
        Back to log in
      </Link>
    </form>
  );
}
