"use client";

import { useActionState } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { IDLE } from "../lib/form-state";
import { resendVerificationAction } from "../server/actions";
import { useCooldown } from "./cooldown";
import { FormBanner } from "./form-banner";
import { SubmitButton } from "./submit-button";

/**
 * "Send a new link". Signed in, the API uses the session's account and the
 * page shows only a masked address. Signed out, the visitor types an email
 * and always gets the same reply, so the form cannot find accounts.
 */
export function ResendVerification({
  maskedEmail,
}: {
  /** Set when signed in; null shows the email field. */
  maskedEmail: string | null;
}) {
  const [state, action, pending] = useActionState(
    resendVerificationAction,
    IDLE,
  );
  const sent = state.status === "success";
  const cooldown = useCooldown(60, sent ? state.at : undefined);

  const emailError = state.fieldErrors?.email?.[0];

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormBanner banner={state.banner} version={state.at} />
      {maskedEmail ? (
        <p className="text-base">
          We sent a link to {maskedEmail}. It expires 48 hours after it was
          sent.
        </p>
      ) : (
        <Field data-invalid={!!emailError || undefined}>
          <FieldLabel htmlFor="resend-email">Email</FieldLabel>
          <Input
            id="resend-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={!!emailError || undefined}
            aria-describedby={emailError ? "resend-email-error" : undefined}
            className="h-11 text-base"
          />
          <FieldError
            id="resend-email-error"
            errors={emailError ? [{ message: emailError }] : []}
          />
        </Field>
      )}
      <p role="status" className="text-base text-muted-foreground">
        {sent
          ? maskedEmail
            ? `We have sent a new link to ${maskedEmail}. Check your spam folder if it is not there in a few minutes.`
            : "If an account with that email needs confirming, a fresh link is on its way. Check your spam folder if it is not there in a few minutes."
          : ""}
      </p>
      <SubmitButton
        pending={pending || cooldown.active}
        pendingLabel={
          cooldown.active
            ? `You can send another link in ${cooldown.left} seconds`
            : "Sending..."
        }
        slowLabel={
          cooldown.active
            ? `You can send another link in ${cooldown.left} seconds`
            : undefined
        }
      >
        Send a new link
      </SubmitButton>
    </form>
  );
}
