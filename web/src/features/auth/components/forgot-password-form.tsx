"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { TextField } from "@/components/common/form-fields";
import { Button } from "@/components/ui/button";
import { ForgotPasswordBody } from "@/lib/api/generated/zod/identity/identity.zod";

import { IDLE } from "../lib/form-state";
import { emailSchema } from "../lib/password-policy";
import { forgotPasswordAction } from "../server/actions";
import { useCooldown } from "./cooldown";
import { FormBanner } from "./form-banner";
import { SubmitButton } from "./submit-button";
import { useActionForm } from "./use-action-form";

const forgotSchema = ForgotPasswordBody.extend({ email: emailSchema });

/** Matches the API's reset link lifetime (60 minutes, ForgotPassword). */
const LINK_LIFETIME = "1 hour";

/**
 * Asks for a reset link. Every non-error outcome shows the same panel, so
 * the page never reveals whether an account exists.
 */
export function ForgotPasswordForm() {
  const { form, state, pending, formProps } = useActionForm(
    forgotSchema,
    forgotPasswordAction,
    IDLE,
    { email: "" },
  );
  const sent = state.status === "success";
  // The address the person typed, already on their screen; never echoed by the server.
  const sentTo = sent ? form.getValues("email").trim() : null;
  const cooldown = useCooldown(60, sent ? state.at : undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) headingRef.current?.focus();
  }, [sent, state.at]);

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <FormBanner banner={state.banner} version={state.at} />
      {sentTo ? (
        <section
          aria-labelledby="reset-sent-title"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground"
        >
          <MailCheck aria-hidden="true" className="size-6 text-success" />
          <h2
            id="reset-sent-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-semibold tracking-tight outline-none"
          >
            Check your email
          </h2>
          <p className="text-base">
            If an Aptiverse account uses {sentTo}, we have sent a link to reset
            its password. The link works once and expires in {LINK_LIFETIME}.
          </p>
          <p className="text-base text-muted-foreground">
            Nothing in your inbox after a few minutes? Check your spam or
            promotions folder, or send another link.
          </p>
          <input type="hidden" name="email" value={sentTo} />
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="min-h-11 w-full text-base"
            disabled={pending || cooldown.active}
            aria-busy={pending || undefined}
          >
            {cooldown.active
              ? `You can send another link in ${cooldown.left} seconds`
              : pending
                ? "Sending..."
                : "Send another link"}
          </Button>
        </section>
      ) : (
        <>
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
          <SubmitButton pending={pending} pendingLabel="Sending...">
            Send reset link
          </SubmitButton>
        </>
      )}
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center justify-center rounded-md text-base font-medium underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Back to log in
      </Link>
    </form>
  );
}
