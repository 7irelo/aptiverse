import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthHeading,
} from "@/features/auth/components/auth-page";
import { InvalidLink } from "@/features/auth/components/invalid-link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { looksLikeOneTimeToken } from "@/features/auth/lib/one-time-token";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  return (
    <>
      <AuthHeading title="Choose a new password" />
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <ResetContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/**
 * The token is not checked with the API on load (a link scanner opening the
 * page must not consume or probe it); only its shape is checked here.
 * Old-format links (?userId=&token=) get the same treatment; userId is
 * ignored and never sent anywhere.
 */
async function ResetContent({
  searchParams,
}: {
  searchParams: PageProps<"/reset-password">["searchParams"];
}) {
  const { token } = await searchParams;
  if (!looksLikeOneTimeToken(token)) {
    return (
      <InvalidLink
        body="Reset links work once and expire after 1 hour."
        action={{ href: "/forgot-password", label: "Send a new link" }}
      />
    );
  }
  return <ResetPasswordForm token={token} />;
}
