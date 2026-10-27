"use client";

import { Building2, School, type LucideIcon } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/ui/field";
import { FormBanner } from "@/features/auth/components/form-banner";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useActionForm } from "@/features/auth/components/use-action-form";
import { IDLE } from "@/features/auth/lib/form-state";
import { SetEducationLevelBody } from "@/lib/api/generated/zod/identity/identity.zod";

import type { EducationLevel } from "../lib/resolve-step";
import { saveStageAction } from "../server/actions";

const STAGES: {
  value: EducationLevel;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "high_school",
    label: "High school",
    description: "Grade 8 to 12, NSC or IEB",
    icon: School,
  },
  {
    value: "tertiary",
    label: "University or college",
    description: "Any year of study",
    icon: Building2,
  },
];

const stageSchema = SetEducationLevelBody.extend({
  educationLevel: z.enum(["high_school", "tertiary"], {
    message: "Choose where you are studying.",
  }),
});

export function StageStep({
  saved,
  hasDetails,
}: {
  saved: EducationLevel | null;
  /** Details exist for the saved stage, so switching would clear them. */
  hasDetails: boolean;
}) {
  const { form, state, pending, formProps } = useActionForm(
    stageSchema,
    saveStageAction,
    IDLE,
    saved ? { educationLevel: saved } : undefined,
  );
  const chosen = useWatch({ control: form.control, name: "educationLevel" });
  const switching = !!saved && hasDetails && chosen && chosen !== saved;
  const savedLabel = STAGES.find((s) => s.value === saved)?.label;

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <Controller
        control={form.control}
        name="educationLevel"
        render={({ field, fieldState }) => (
          <fieldset
            aria-describedby={
              fieldState.error ? "field-educationLevel-error" : undefined
            }
            className="flex flex-col gap-3"
          >
            <legend className="sr-only">Where are you studying?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {STAGES.map(({ value, label, description, icon: Icon }) => (
                <label
                  key={value}
                  className="flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground hover:bg-muted has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={value}
                    checked={field.value === value}
                    onChange={() => field.onChange(value)}
                    onBlur={field.onBlur}
                    ref={value === STAGES[0]!.value ? field.ref : undefined}
                    className="mt-1 size-5 shrink-0 accent-primary"
                  />
                  <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
                  <span className="flex flex-col gap-1">
                    <span className="font-semibold">{label}</span>
                    <span className="text-sm text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError
              id="field-educationLevel-error"
              errors={[fieldState.error]}
            />
          </fieldset>
        )}
      />
      {switching ? (
        <p role="status" className="text-base">
          Switching clears the details you entered for {savedLabel}.
        </p>
      ) : null}
      <FormBanner banner={state.banner} version={state.at} />
      <SubmitButton
        pending={pending}
        pendingLabel="Saving..."
        slowLabel="Still saving..."
      >
        {switching ? "Switch" : "Continue"}
      </SubmitButton>
    </form>
  );
}
