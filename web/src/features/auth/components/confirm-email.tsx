"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import { verifyEmailAction, type VerifyState } from "../server/actions";
import { FormBanner } from "./form-banner";
import { InvalidLink } from "./invalid-link";
import { SubmitButton } from "./submit-button";
import { useStripTokenFromUrl } from "./use-token-from-url";

const INITIAL: VerifyState = { status: "idle" };

const subscribeNothing = () => () => {};

/**
 * Confirms an email address only on a deliberate tap: mail scanners open
 * links, and confirming on load would spend the single-use token.
 */
export function ConfirmEmail({
  token,
  signedIn,
  continueHref,
}: {
  token: string;
  signedIn: boolean;
  continueHref: string;
}) {
  useStripTokenFromUrl("/verify-email");
  const [state, action, pending] = useActionState(verifyEmailAction, INITIAL);

  // After hydration the action answers with a target for a full page load.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  if (state.invalidLink) {
    return (
      <InvalidLink
        body={
          state.detail ??
          "Confirmation links work once and expire after 48 hours."
        }
        action={
          signedIn
            ? { href: "/verify-email", label: "Send a new link" }
            : {
                href: "/login?next=%2Fverify-email",
                label: "Log in to send a new link",
              }
        }
      />
    );
  }

  if (state.status === "success" && !state.redirectTo) {
    return (
      <section
        role="status"
        aria-labelledby="confirmed-title"
        className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground"
      >
        <CircleCheck aria-hidden="true" className="size-6 text-success" />
        <h2
          id="confirmed-title"
          className="text-lg font-semibold tracking-tight"
        >
          Your email is confirmed
        </h2>
        <p className="text-base text-muted-foreground">
          Thanks. You can carry on where you left off.
        </p>
        <Button asChild size="lg" className="min-h-11 w-full text-base">
          <Link href={continueHref}>Continue</Link>
        </Button>
      </section>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {hydrated ? <input type="hidden" name="js" value="1" /> : null}
      <FormBanner banner={state.banner} version={state.at} />
      <p className="text-base">
        Tap the button to confirm this is your email address.
      </p>
      <input type="hidden" name="token" value={token} />
      <SubmitButton
        pending={pending}
        done={!!state.redirectTo}
        pendingLabel="Confirming..."
      >
        Confirm my email
      </SubmitButton>
    </form>
  );
}
