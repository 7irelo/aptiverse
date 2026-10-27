import "server-only";

import { redirect } from "next/navigation";

import { toStage, type Stage } from "@/features/academics/lib/stage";
import type { MeResponse } from "@/lib/api/generated/model";
import { getCurrentMe } from "@/lib/auth";

export type StudentContext = {
  me: MeResponse;
  firstName: string;
  stage: Stage;
  isStudent: boolean;
};

/** The signed-in student's profile for stage wording. Reads cookies. */
export async function getStudent(next = "/dashboard"): Promise<StudentContext> {
  const me = await getCurrentMe();
  if (!me) redirect(`/login?next=${encodeURIComponent(next)}`);
  const firstName = me.name.split(" ")[0] || me.name;
  return {
    me,
    firstName,
    stage: toStage(me.onboarding.educationLevel),
    isStudent: me.roles.some((r) => r.toLowerCase() === "student"),
  };
}
