"use client";

import Link from "next/link";
import { z } from "zod";

import { SelectField, TextField } from "@/components/common/form-fields";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/features/auth/components/form-banner";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useActionForm } from "@/features/auth/components/use-action-form";
import { IDLE } from "@/features/auth/lib/form-state";
import { CompleteOnboardingBody } from "@/lib/api/generated/zod/identity/identity.zod";

import {
  CURRICULUM_OPTIONS,
  GRADE_OPTIONS,
  INSTITUTION_MAX_LENGTH,
  STUDY_LEVEL_OPTIONS,
} from "../lib/options";
import type { EducationLevel } from "../lib/resolve-step";
import { completeStudentAction } from "../server/actions";

const DOB_HINT =
  "We use this to follow the law on learners under 18. It is never shown to anyone.";

const dob = z
  .string()
  .min(1, "Enter your date of birth")
  .pipe(z.iso.date("Check your date of birth"));

const institution = z
  .string()
  .trim()
  .max(INSTITUTION_MAX_LENGTH, "Keep this under 200 characters");

function schemaFor(level: EducationLevel, dobRequired: boolean) {
  const base = CompleteOnboardingBody.pick({
    institutionName: true,
    dateOfBirth: true,
  });
  const dateOfBirth = dobRequired ? dob : z.string().optional();
  return level === "high_school"
    ? base.extend({
        grade: z.enum(["8", "9", "10", "11", "12"], {
          message: "Choose your grade",
        }),
        curriculum: z.enum(["nsc", "ieb"], {
          message: "Choose your curriculum",
        }),
        institutionName: institution.optional(),
        dateOfBirth,
      })
    : base.extend({
        studyLevel: z.enum(
          STUDY_LEVEL_OPTIONS.map((o) => o.value) as [string, ...string[]],
          { message: "Choose your level of study" },
        ),
        institutionName: institution.min(1, "Enter your university or college"),
        dateOfBirth,
      });
}

export type DetailsPrefill = {
  grade: number | null;
  curriculum: string | null;
  studyLevel: string | null;
  institutionName: string | null;
  dateOfBirth: string | null;
};

/**
 * The details step. High school asks grade, exam body, school (optional)
 * and date of birth; university asks institution, level of study and date
 * of birth. Neither shows the other stage's words. Finish completes
 * onboarding (the subjects and goal steps arrive behind flags later).
 */
export function DetailsStep({
  level,
  prefill,
}: {
  level: EducationLevel;
  prefill: DetailsPrefill;
}) {
  // The API sets the date of birth once; when it is saved, do not ask again.
  const dobRequired = !prefill.dateOfBirth;
  const { form, state, pending, formProps } = useActionForm(
    schemaFor(level, dobRequired),
    completeStudentAction,
    IDLE,
    {
      grade: prefill.grade ? String(prefill.grade) : undefined,
      curriculum: prefill.curriculum ?? undefined,
      studyLevel: prefill.studyLevel ?? undefined,
      institutionName: prefill.institutionName ?? "",
      dateOfBirth: "",
    } as never,
  );
  const control = form.control as never;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <input type="hidden" name="educationLevel" value={level} />
      <input type="hidden" name="dobRequired" value={dobRequired ? "1" : "0"} />
      {level === "high_school" ? (
        <>
          <SelectField
            control={control}
            name="grade"
            label="Grade"
            options={GRADE_OPTIONS}
          />
          <SelectField
            control={control}
            name="curriculum"
            label="Curriculum"
            description="Not sure? Most public schools write the NSC."
            options={CURRICULUM_OPTIONS}
          />
          <TextField
            control={control}
            name="institutionName"
            label="School (optional)"
            description="Only shown on your profile."
            autoComplete="organization"
            maxLength={INSTITUTION_MAX_LENGTH}
          />
        </>
      ) : (
        <>
          <TextField
            control={control}
            name="institutionName"
            label="University or college"
            autoComplete="organization"
            maxLength={INSTITUTION_MAX_LENGTH}
          />
          <SelectField
            control={control}
            name="studyLevel"
            label="Level of study"
            options={STUDY_LEVEL_OPTIONS}
          />
        </>
      )}
      {dobRequired ? (
        <TextField
          control={control}
          name="dateOfBirth"
          label="Date of birth"
          description={DOB_HINT}
          type="date"
          max={today}
          autoComplete="bday"
        />
      ) : null}
      <FormBanner banner={state.banner} version={state.at} />
      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
        <SubmitButton
          pending={pending}
          pendingLabel="Saving..."
          slowLabel="Still saving..."
          className="sm:w-auto sm:px-8"
        >
          Finish
        </SubmitButton>
        <Button
          asChild
          variant="ghost"
          size="lg"
          className="min-h-11 text-base"
        >
          <Link href="/onboarding?step=stage">Back</Link>
        </Button>
      </div>
    </form>
  );
}
