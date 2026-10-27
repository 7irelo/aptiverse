export type OnboardingStep = "stage" | "details";
export type EducationLevel = "high_school" | "tertiary";

export const STUDENT_STEPS: readonly OnboardingStep[] = ["stage", "details"];

export function isEducationLevel(value: unknown): value is EducationLevel {
  return value === "high_school" || value === "tertiary";
}

/**
 * The step to render. With no level saved only the stage step is allowed;
 * otherwise the requested step wins, defaulting to the first incomplete one
 * (details). The subjects and goal steps join this list behind their flags
 * in later phases.
 */
export function resolveStep(
  level: string | null | undefined,
  requested: unknown,
): OnboardingStep {
  if (!isEducationLevel(level)) return "stage";
  if (requested === "stage") return "stage";
  return "details";
}

export function stepNumber(step: OnboardingStep): number {
  return STUDENT_STEPS.indexOf(step) + 1;
}
