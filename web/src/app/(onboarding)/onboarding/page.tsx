import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-page";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { DetailsStep } from "@/features/onboarding/components/details-step";
import { OnboardingStepper } from "@/features/onboarding/components/onboarding-stepper";
import { ParentOnboarding } from "@/features/onboarding/components/parent-onboarding";
import { StageStep } from "@/features/onboarding/components/stage-step";
import {
  isEducationLevel,
  resolveStep,
} from "@/features/onboarding/lib/resolve-step";
import { getCurrentMe, mapMeToSessionUser, resolveLanding } from "@/lib/auth";

export default function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  return (
    <Suspense fallback={<AuthFormSkeleton label="Loading your setup" />}>
      <OnboardingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function OnboardingContent({
  searchParams,
}: {
  searchParams: PageProps<"/onboarding">["searchParams"];
}) {
  const me = await getCurrentMe();
  const user = me ? mapMeToSessionUser(me) : null;
  if (!me || !user) redirect("/login?next=%2Fonboarding");
  if (user.role === "admin") redirect("/admin");
  if (!user.onboardingRequired) {
    redirect(
      resolveLanding({
        role: user.role,
        roles: user.roles,
        onboardingRequired: false,
      }),
    );
  }

  const firstName = user.name.split(" ")[0] || user.name;

  if (user.role === "parent") {
    return (
      <div className="flex flex-col gap-6">
        <Heading
          title={`Welcome, ${firstName}`}
          description="Here is how Aptiverse works for parents."
        />
        <ParentOnboarding />
        <SignOutButton variant="ghost" />
      </div>
    );
  }

  const { step: requested } = await searchParams;
  const onboarding = me.onboarding;
  const level = isEducationLevel(onboarding.educationLevel)
    ? onboarding.educationLevel
    : null;
  const step = resolveStep(level, requested);

  return (
    <div className="flex flex-col gap-6">
      <OnboardingStepper step={step} />
      {step === "stage" || !level ? (
        <>
          <Heading
            title="Where are you studying?"
            description="This sets up your subjects and the words we use. You can change it later in Settings."
          />
          <StageStep
            saved={level}
            hasDetails={
              onboarding.grade !== null || onboarding.studyLevel !== null
            }
          />
        </>
      ) : (
        <>
          {level === "high_school" ? (
            <Heading
              title="Your school details"
              description="So practice matches your grade."
            />
          ) : (
            <Heading
              title="Your studies"
              description="So your courses and practice match your year."
            />
          )}
          <DetailsStep
            level={level}
            prefill={{
              grade: onboarding.grade,
              curriculum: onboarding.curriculum,
              studyLevel: onboarding.studyLevel,
              institutionName: onboarding.institutionName,
              dateOfBirth: onboarding.dateOfBirth ?? me.dateOfBirth,
            }}
          />
        </>
      )}
      <p className="text-sm text-muted-foreground">
        You can change this later in Settings.
      </p>
      <SignOutButton variant="ghost" />
    </div>
  );
}

function Heading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-base text-muted-foreground">{description}</p>
    </div>
  );
}
