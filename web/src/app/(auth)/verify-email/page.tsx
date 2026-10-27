import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthHeading,
} from "@/features/auth/components/auth-page";
import { ConfirmEmail } from "@/features/auth/components/confirm-email";
import { InvalidLink } from "@/features/auth/components/invalid-link";
import { ResendVerification } from "@/features/auth/components/resend-verification";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { maskEmail } from "@/features/auth/lib/mask-email";
import { looksLikeOneTimeToken } from "@/features/auth/lib/one-time-token";
import { signedInLanding } from "@/features/auth/server/signed-in";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  return (
    <>
      <AuthHeading title="Confirm your email" />
      <Suspense fallback={<AuthFormSkeleton fields={0} />}>
        <VerifyContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function VerifyContent({
  searchParams,
}: {
  searchParams: PageProps<"/verify-email">["searchParams"];
}) {
  const params = await searchParams;
  const landing = await signedInLanding();

  if (params.token !== undefined) {
    if (!looksLikeOneTimeToken(params.token)) {
      return (
        <InvalidLink
          body="Confirmation links work once and expire after 48 hours."
          action={
            landing
              ? { href: "/verify-email", label: "Send a new link" }
              : {
                  href: "/login?next=%2Fverify-email",
                  label: "Log in to send a new link",
                }
          }
        />
      );
    }
    return (
      <ConfirmEmail
        token={params.token}
        signedIn={!!landing}
        continueHref={landing ?? "/login"}
      />
    );
  }

  const user = landing ? await getSessionUser() : null;
  if (user?.emailConfirmed) {
    return (
      <p className="text-base">
        Your email is already confirmed.{" "}
        <Link
          href={landing ?? "/dashboard"}
          className="font-medium underline underline-offset-4"
        >
          Continue
        </Link>
      </p>
    );
  }
  if (user) {
    // Signed in but unverified: offer sign-out, never "Log in" (no loop).
    return (
      <div className="flex flex-col gap-5">
        <ResendVerification maskedEmail={maskEmail(user.email)} />
        <SignOutButton variant="ghost" label="Log out to use another account" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <p className="text-base">
        Enter your email and we will send a new confirmation link.
      </p>
      <ResendVerification maskedEmail={null} />
    </div>
  );
}
