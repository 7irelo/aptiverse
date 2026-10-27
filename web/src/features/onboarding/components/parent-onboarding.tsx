"use client";

import {
  CalendarCheck,
  ChartLine,
  Heart,
  Lock,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/ui/field";
import { FormBanner } from "@/features/auth/components/form-banner";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { useActionForm } from "@/features/auth/components/use-action-form";
import { IDLE } from "@/features/auth/lib/form-state";
import { CompleteOnboardingBody } from "@/lib/api/generated/zod/identity/identity.zod";

import { completeParentAction } from "../server/actions";

const SEE: { icon: LucideIcon; text: string }[] = [
  {
    icon: ChartLine,
    text: "How your child is doing in each subject or course, from the marks and practice they log",
  },
  { icon: CalendarCheck, text: "Upcoming assessments and deadlines" },
  {
    icon: Trophy,
    text: "Real milestones, like a finished practice test or a goal reached",
  },
  {
    icon: Heart,
    text: "Wellbeing trends, only if your child chooses to share them",
  },
];

const PRIVATE: { icon: LucideIcon; text: string }[] = [
  { icon: Lock, text: "Their diary. It is private and stays that way." },
  { icon: Lock, text: "Their mood notes and their chats with the AI tutor" },
  { icon: Lock, text: "Anything your child has not agreed to share" },
];

const parentSchema = CompleteOnboardingBody.pick({
  adultConfirmed: true,
}).extend({
  adultConfirmed: z.boolean().refine((value) => value, {
    message: "Please confirm you are 18 or older to continue.",
  }),
});

function List({
  title,
  items,
}: {
  title: string;
  items: { icon: LucideIcon; text: string }[];
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground">
      <h2 className="text-base font-semibold">{title}</h2>
      <ul className="flex flex-col gap-3">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 text-base">
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Parent onboarding (Phase 2): what you will see, what stays private, 18+. */
export function ParentOnboarding() {
  const { form, state, pending, formProps } = useActionForm(
    parentSchema,
    completeParentAction,
    IDLE,
    { adultConfirmed: false },
  );

  return (
    <form {...formProps} className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <List title="What you will see" items={SEE} />
        <List title="What stays private" items={PRIVATE} />
      </div>
      <p className="text-base text-muted-foreground">
        Your child chooses what to share and can change it at any time.
      </p>
      <Controller
        control={form.control}
        name="adultConfirmed"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                id="field-adultConfirmed"
                type="checkbox"
                name="adultConfirmed"
                ref={field.ref}
                checked={!!field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid || undefined}
                aria-describedby={
                  fieldState.error ? "field-adultConfirmed-error" : undefined
                }
                className="mt-1 size-5 shrink-0 accent-primary"
              />
              <label htmlFor="field-adultConfirmed" className="text-base">
                I confirm I am 18 or older.
              </label>
            </div>
            <FieldError
              id="field-adultConfirmed-error"
              errors={[fieldState.error]}
            />
          </div>
        )}
      />
      <FormBanner banner={state.banner} version={state.at} />
      <SubmitButton
        pending={pending}
        pendingLabel="Saving..."
        slowLabel="Still saving..."
      >
        Go to your dashboard
      </SubmitButton>
    </form>
  );
}
