"use client";

import { LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormAlert } from "@/components/common/form-alert";
import {
  describedBy,
  FieldShell,
  NativeInput,
  NativeSelect,
} from "@/components/common/native-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { stageWords, type Stage } from "@/features/academics/lib/stage";
import {
  baselineRefusal,
  defaultGoalTitle,
  isCountCriteria,
} from "@/features/progress/lib/goals";
import {
  errorCode,
  fieldErrors,
  newIdempotencyKey,
  problemNumber,
} from "@/lib/api/fetcher";
import { useListUnitTopics } from "@/lib/api/generated/endpoints/academics/academics";
import {
  createGoal,
  useGetGoalBaseline,
} from "@/lib/api/generated/endpoints/progress/progress";
import { sastDateKey, sastInputToIso } from "@/lib/format/date";

export type GoalUnitOption = {
  unitId: string;
  enrolmentId: string;
  name: string;
};

const TYPES = [
  { value: "practice_tests_completed", label: "Finish practice tests" },
  { value: "mastery_threshold", label: "Reach a mastery level" },
  { value: "assessments_submitted", label: "Submit assessments" },
] as const;

type Errors = Partial<Record<"unit" | "target" | "due" | "title", string>>;

function tomorrowKey(): string {
  return sastDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

function yearAheadKey(): string {
  return sastDateKey(new Date(Date.now() + 364 * 24 * 60 * 60 * 1000));
}

/** Validates the goal form; the API checks the same rules again. */
export function validateGoal(
  input: {
    type: string;
    unit: string;
    target: string;
    due: string;
    title: string;
  },
  noun: string,
  today: string = sastDateKey(new Date()),
): Errors {
  const errors: Errors = {};
  if (!input.unit) errors.unit = `Pick a ${noun}.`;
  const target = Number(input.target.replace("%", ""));
  if (
    !Number.isInteger(target) ||
    target < 1 ||
    target > (isCountCriteria(input.type) ? 50 : 100)
  ) {
    errors.target = isCountCriteria(input.type)
      ? "Pick a target between 1 and 50."
      : "Pick a target between 1 and 100.";
  }
  if (!input.due) errors.due = "Pick a deadline.";
  else if (input.due <= today) errors.due = "Pick tomorrow or a later date.";
  const title = input.title.trim();
  if (title.length < 1 || title.length > 80) {
    errors.title = "Give the goal a title of up to 80 characters.";
  }
  return errors;
}

export function CreateGoalDialog({
  stage,
  units,
  openOnLoad,
}: {
  stage: Stage;
  units: GoalUnitOption[];
  openOnLoad: boolean;
}) {
  const router = useRouter();
  const words = stageWords(stage);
  const [open, setOpen] = useState(openOnLoad);
  const [type, setType] = useState<string>(TYPES[0].value);
  const [unit, setUnit] = useState(units.length === 1 ? units[0]!.unitId : "");
  const [topic, setTopic] = useState("");
  const [target, setTarget] = useState("");
  const [due, setDue] = useState("");
  const [title, setTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const keyRef = useRef(newIdempotencyKey());

  const selected = units.find((u) => u.unitId === unit);
  const mastery = type === "mastery_threshold";
  const topics = useListUnitTopics(selected?.enrolmentId ?? "", undefined, {
    query: { enabled: open && mastery && !!selected },
  });
  const baseline = useGetGoalBaseline(
    {
      CriteriaType: type,
      StudyUnitId: unit,
      Topic: mastery && topic ? topic : undefined,
    },
    { query: { enabled: open && mastery && !!unit } },
  );

  const shownTitle = titleEdited
    ? title
    : defaultGoalTitle({
        type,
        target: target ? Number(target.replace("%", "")) : null,
        unitName: selected?.name,
        topic: mastery ? topic : undefined,
      });

  function close(next: boolean) {
    setOpen(next);
    if (!next && window.location.search.includes("new=1")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState(null, "", url.toString());
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found = validateGoal(
      { type, unit, target, due, title: shownTitle },
      words.noun,
    );
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setPending(true);
    try {
      const goal = await createGoal(
        {
          title: shownTitle.trim(),
          description: null,
          criteriaType: type,
          studyUnitId: unit,
          topic: mastery && topic ? topic : null,
          assessmentId: null,
          targetValue: Number(target.replace("%", "")),
          dueAt: sastInputToIso(due, "23:59"),
          milestones: null,
        },
        { headers: { "Idempotency-Key": keyRef.current } },
      );
      keyRef.current = newIdempotencyKey();
      toast.success("Goal created");
      close(false);
      router.push(`/dashboard/goals/${goal.id}`);
    } catch (error) {
      const code = errorCode(error);
      if (code === "goal.target_not_above_baseline") {
        const value = problemNumber(error, "baseline") ?? 0;
        setErrors({
          target: baselineRefusal(
            value,
            (mastery && topic) || selected?.name || words.noun,
          ),
        });
      } else if (code === "goal.duplicate_active") {
        setFormError("You already have this goal running.");
      } else if (code === "goal.active_limit") {
        setFormError(
          "You have reached the limit of active goals. Finish or archive one first.",
        );
      } else {
        const server = fieldErrors(error);
        if (Object.keys(server).length > 0) {
          setErrors({
            target: server.targetValue,
            due: server.dueAt,
            title: server.title,
            unit: server.studyUnitId,
          });
        } else {
          setFormError(
            "We couldn't save your goal. Your choices are still here, so try again.",
          );
        }
      }
    } finally {
      setPending(false);
    }
  }

  const baselineValue = baseline.data?.baselineValue;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button className="min-h-11 w-full px-4 sm:w-auto">
          <Plus aria-hidden="true" />
          New goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
          <DialogDescription>
            Goals the app can check from your real work.
          </DialogDescription>
        </DialogHeader>
        {units.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p>
              Add a {words.noun} first so your goal has something to measure.
            </p>
            <div>
              <Button asChild className="min-h-11 px-4">
                <Link href="/dashboard/subjects">Add {words.nouns}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2" disabled={pending}>
              <legend className="mb-1 text-sm font-medium">
                What will you do?
              </legend>
              {TYPES.map((t) => (
                <label
                  key={t.value}
                  className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 has-[:checked]:border-primary has-[:checked]:bg-muted"
                >
                  <input
                    type="radio"
                    name="goal-type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => {
                      setType(t.value);
                      setTarget("");
                      setTopic("");
                    }}
                    className="size-5 accent-primary"
                  />
                  {t.label}
                </label>
              ))}
            </fieldset>
            <FieldShell
              id="goal-unit"
              label={`Which ${words.noun}?`}
              error={errors.unit}
            >
              <NativeSelect
                id="goal-unit"
                value={unit}
                disabled={pending}
                aria-invalid={!!errors.unit || undefined}
                aria-describedby={describedBy("goal-unit", false, errors.unit)}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setTopic("");
                }}
              >
                <option value="">Choose one</option>
                {units.map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.name}
                  </option>
                ))}
              </NativeSelect>
            </FieldShell>
            {mastery ? (
              <FieldShell id="goal-topic" label="Which topic?">
                <NativeSelect
                  id="goal-topic"
                  value={topic}
                  disabled={pending || !selected}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="">Whole {words.noun}</option>
                  {(topics.data ?? []).map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </NativeSelect>
              </FieldShell>
            ) : null}
            <FieldShell
              id="goal-target"
              label={mastery ? "Target (%)" : "Target"}
              hint={
                mastery && unit
                  ? baselineValue == null
                    ? "No evidence yet, so any target works."
                    : `You're at ${Math.round(baselineValue)}% now.`
                  : isCountCriteria(type)
                    ? "Counts from today, 1 to 50."
                    : undefined
              }
              error={errors.target}
            >
              <NativeInput
                id="goal-target"
                inputMode="numeric"
                value={target}
                disabled={pending}
                aria-invalid={!!errors.target || undefined}
                aria-describedby={describedBy(
                  "goal-target",
                  true,
                  errors.target,
                )}
                onChange={(e) =>
                  setTarget(e.target.value.replace(/[^0-9]/g, ""))
                }
              />
            </FieldShell>
            <FieldShell id="goal-due" label="Deadline" error={errors.due}>
              <NativeInput
                id="goal-due"
                type="date"
                min={tomorrowKey()}
                max={yearAheadKey()}
                value={due}
                disabled={pending}
                aria-invalid={!!errors.due || undefined}
                aria-describedby={describedBy("goal-due", false, errors.due)}
                onChange={(e) => setDue(e.target.value)}
              />
            </FieldShell>
            <FieldShell id="goal-title" label="Title" error={errors.title}>
              <NativeInput
                id="goal-title"
                maxLength={80}
                value={shownTitle}
                disabled={pending}
                aria-invalid={!!errors.title || undefined}
                aria-describedby={describedBy(
                  "goal-title",
                  false,
                  errors.title,
                )}
                onChange={(e) => {
                  setTitleEdited(true);
                  setTitle(e.target.value);
                }}
              />
            </FieldShell>
            {formError ? <FormAlert>{formError}</FormAlert> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 px-4"
                onClick={() => close(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-h-11 px-4"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="animate-spin" />
                    Creating
                  </>
                ) : (
                  "Create goal"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
