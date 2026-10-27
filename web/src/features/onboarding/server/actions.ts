"use server";

import { redirect } from "next/navigation";

import {
  errorState,
  problemDetail,
  problemFieldErrors,
  rateLimitBanner,
  type FormState,
} from "@/features/auth/lib/form-state";
import { ApiError } from "@/lib/api/fetcher";
import {
  completeOnboarding,
  setEducationLevel,
} from "@/lib/api/generated/endpoints/identity/identity";
import {
  CompleteOnboardingBody,
  CompleteOnboardingResponse,
} from "@/lib/api/generated/zod/identity/identity.zod";
import { resolveLanding } from "@/lib/auth/landing";
import { primaryRole } from "@/lib/auth/map-me";
import {
  patchSession,
  readSession,
  SessionEndedError,
  withAccessToken,
} from "@/lib/auth/session-store";

import {
  CURRICULUM_OPTIONS,
  GRADE_OPTIONS,
  INSTITUTION_MAX_LENGTH,
  STUDY_LEVEL_OPTIONS,
} from "../lib/options";
import { isEducationLevel } from "../lib/resolve-step";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

const SAVE_ERROR =
  "We could not save that. Check your connection and try again.";

function sessionEnded(step: string): never {
  redirect(
    `/login?reason=session-expired&next=${encodeURIComponent(`/onboarding?step=${step}`)}`,
  );
}

function saveError(error: unknown, step: string): FormState {
  if (error instanceof SessionEndedError) sessionEnded(step);
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return errorState(
        rateLimitBanner(
          error,
          (wait) => `Too many attempts. Wait ${wait} and try again.`,
        ),
      );
    }
    if (error.status === 409 && error.code === "concurrency_conflict") {
      return errorState({
        tone: "error",
        message:
          "Your details changed in another tab. Reload to see the latest.",
      });
    }
    if (error.status === 400 || error.status === 409) {
      const fields = problemFieldErrors(error);
      const detail = problemDetail(error);
      return errorState(
        detail || !fields
          ? { tone: "error", message: detail ?? SAVE_ERROR }
          : undefined,
        fields,
      );
    }
  }
  return errorState({ tone: "error", message: SAVE_ERROR });
}

/** Saves high school or university (PUT /me/onboarding/level). */
export async function saveStageAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const level = field(formData, "educationLevel");
  if (!isEducationLevel(level)) {
    return errorState(undefined, {
      educationLevel: ["Choose where you are studying."],
    });
  }
  try {
    await withAccessToken((init) =>
      setEducationLevel(
        { educationLevel: level },
        { ...init, cache: "no-store" },
      ),
    );
  } catch (error) {
    return saveError(error, "stage");
  }
  redirect("/onboarding?step=details");
}

/** Finishes student onboarding with the details step (POST complete). */
export async function completeStudentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const level = field(formData, "educationLevel");
  if (!isEducationLevel(level)) redirect("/onboarding?step=stage");

  const fieldErrors: Record<string, string[]> = {};
  const institutionName = field(formData, "institutionName");
  const dateOfBirth = field(formData, "dateOfBirth");
  const needsDob = field(formData, "dobRequired") === "1";

  if (institutionName.length > INSTITUTION_MAX_LENGTH) {
    fieldErrors.institutionName = ["Keep this under 200 characters"];
  }
  if (needsDob && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    fieldErrors.dateOfBirth = ["Enter your date of birth"];
  }

  let body: Record<string, unknown>;
  if (level === "high_school") {
    const grade = field(formData, "grade");
    const curriculum = field(formData, "curriculum");
    if (!GRADE_OPTIONS.some((o) => o.value === grade)) {
      fieldErrors.grade = ["Choose your grade"];
    }
    if (!CURRICULUM_OPTIONS.some((o) => o.value === curriculum)) {
      fieldErrors.curriculum = ["Choose your curriculum"];
    }
    body = {
      educationLevel: level,
      grade: Number(grade),
      curriculum,
      institutionName: institutionName || null,
    };
  } else {
    const studyLevel = field(formData, "studyLevel");
    if (!institutionName) {
      fieldErrors.institutionName = ["Enter your university or college"];
    }
    if (!STUDY_LEVEL_OPTIONS.some((o) => o.value === studyLevel)) {
      fieldErrors.studyLevel = ["Choose your level of study"];
    }
    body = { educationLevel: level, studyLevel, institutionName };
  }
  if (needsDob) body.dateOfBirth = dateOfBirth;
  if (Object.keys(fieldErrors).length > 0) {
    return errorState(undefined, fieldErrors);
  }

  const parsed = CompleteOnboardingBody.safeParse(body);
  if (!parsed.success) {
    return errorState(undefined, { dateOfBirth: ["Check your date of birth"] });
  }

  try {
    CompleteOnboardingResponse.parse(
      await withAccessToken((init) =>
        completeOnboarding(parsed.data, { ...init, cache: "no-store" }),
      ),
    );
  } catch (error) {
    return saveError(error, "details");
  }
  return finishOnboarding();
}

/** Finishes parent onboarding with the 18 or older confirmation. */
export async function completeParentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (formData.get("adultConfirmed") !== "on") {
    return errorState(undefined, {
      adultConfirmed: ["Please confirm you are 18 or older to continue."],
    });
  }
  try {
    await withAccessToken((init) =>
      completeOnboarding(
        { adultConfirmed: true },
        { ...init, cache: "no-store" },
      ),
    );
  } catch (error) {
    return saveError(error, "details");
  }
  return finishOnboarding();
}

/** Marks the session as onboarded, so proxy.ts stops redirecting, and leaves. */
async function finishOnboarding(): Promise<never> {
  await patchSession({ onboardingRequired: false });
  const session = await readSession();
  const role = session ? primaryRole(session.roles) : null;
  redirect(
    session && role
      ? resolveLanding({
          role,
          roles: session.roles,
          onboardingRequired: false,
        })
      : "/dashboard",
  );
}
