import { cn } from "@/lib/utils";

import {
  STUDENT_STEPS,
  stepNumber,
  type OnboardingStep,
} from "../lib/resolve-step";

const LABELS: Record<OnboardingStep, string> = {
  stage: "Where you study",
  details: "Your details",
};

/** "Step 1 of 2" as text, with a decorative segmented bar. */
export function OnboardingStepper({ step }: { step: OnboardingStep }) {
  const current = stepNumber(step);
  return (
    <nav aria-label="Setup progress" className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Step {current} of {STUDENT_STEPS.length}
      </p>
      <ol className="sr-only">
        {STUDENT_STEPS.map((s) => (
          <li key={s} aria-current={s === step ? "step" : undefined}>
            {LABELS[s]}
          </li>
        ))}
      </ol>
      <div aria-hidden="true" className="flex gap-1.5">
        {STUDENT_STEPS.map((s, index) => (
          <span
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index < current ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
    </nav>
  );
}
