import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthHeading,
} from "@/features/auth/components/auth-page";
import { FormBanner } from "@/features/auth/components/form-banner";
import { GoogleButton } from "@/features/auth/components/google-button";
import { LoginForm } from "@/features/auth/components/login-form";
import { loginReasonCopy } from "@/features/auth/lib/login-reasons";
import { oauthErrorCopy } from "@/features/auth/lib/oauth-errors";
import { safeNextPath } from "@/features/auth/lib/safe-next";
import { signedInLanding } from "@/features/auth/server/signed-in";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Aptiverse account.",
  alternates: { canonical: "/login" },
};

const googleEnabled =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <>
      <AuthHeading title="Log in to Aptiverse" />
      <Suspense fallback={<AuthFormSkeleton label="Loading log in" />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const landing = await signedInLanding(next);
  if (landing) redirect(landing);

  const reason = loginReasonCopy(params.reason);
  const oauthError = oauthErrorCopy(params.error);
  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : "/register";

  return (
    <div className="flex flex-col gap-5">
      {reason ? (
        <FormBanner
          banner={{ tone: "info", message: reason }}
          focusOnShow={false}
        />
      ) : null}
      {oauthError ? (
        <FormBanner banner={{ tone: "error", ...oauthError }} />
      ) : null}
      {googleEnabled ? (
        <>
          <GoogleButton next={next} />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            or use your email
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}
      <LoginForm next={next} />
      <p className="text-center text-base text-muted-foreground">
        New to Aptiverse?{" "}
        <Link
          href={registerHref}
          className="inline-flex min-h-11 items-center font-medium text-foreground underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
