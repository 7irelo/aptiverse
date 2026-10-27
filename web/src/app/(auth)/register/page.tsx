import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  AuthFormSkeleton,
  AuthHeading,
} from "@/features/auth/components/auth-page";
import {
  RegisterFlow,
  type SignupRole,
} from "@/features/auth/components/register-flow";
import { safeNextPath } from "@/features/auth/lib/safe-next";
import { getLegalVersions } from "@/features/auth/server/get-legal-versions";
import { signedInLanding } from "@/features/auth/server/signed-in";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free Aptiverse account as a student or a parent.",
  alternates: { canonical: "/register" },
};

function presetRole(value: unknown): SignupRole | null {
  return value === "student" || value === "parent" ? value : null;
}

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <>
      <AuthHeading
        title="Create your account"
        description="A few details and you are in."
      />
      <Suspense fallback={<AuthFormSkeleton label="Loading sign up" />}>
        <RegisterContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function RegisterContent({
  searchParams,
}: {
  searchParams: PageProps<"/register">["searchParams"];
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const landing = await signedInLanding(next);
  if (landing) redirect(landing);

  const legal = await getLegalVersions();
  return (
    <RegisterFlow
      presetRole={presetRole(params.role)}
      next={next}
      legal={{
        termsVersion: legal.termsVersion,
        privacyVersion: legal.privacyVersion,
        termsUrl: legal.termsUrl,
        privacyUrl: legal.privacyUrl,
      }}
    />
  );
}
