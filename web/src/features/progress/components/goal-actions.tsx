"use client";

import { LoaderCircle, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { FormAlert } from "@/components/common/form-alert";
import {
  describedBy,
  FieldShell,
  NativeInput,
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
import {
  baselineRefusal,
  isCountCriteria,
} from "@/features/progress/lib/goals";
import { ApiError, errorCode, problemNumber } from "@/lib/api/fetcher";
import {
  abandonGoal,
  addGoalMilestone,
  updateGoal,
} from "@/lib/api/generated/endpoints/progress/progress";
import type { GoalView } from "@/lib/api/generated/model";
import { sastDateKey, sastInputToIso } from "@/lib/format/date";

/** Edit (title, target, deadline) and archive, both guarded by If-Match. */
export function GoalActions({
  goal,
  etag,
  where,
}: {
  goal: GoalView;
  etag: string | null;
  where: string;
}) {
  const router = useRouter();
  const open =
    goal.status === "active" ||
    goal.status === "at_risk" ||
    goal.status === "expired";
  return (
    <div className="flex flex-wrap gap-2">
      {goal.status !== "abandoned" ? (
        <EditGoalDialog goal={goal} etag={etag} where={where} />
      ) : null}
      {open ? (
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="min-h-11 px-4">
              Archive goal
            </Button>
          }
          title="Archive this goal?"
          description="It stops tracking new work and stays in your history."
          confirmLabel="Archive goal"
          cancelLabel="Keep it"
          onConfirm={async () => {
            try {
              await abandonGoal(goal.id, {
                headers: etag ? { "If-Match": etag } : undefined,
              });
              toast.success("Goal archived");
              router.refresh();
            } catch (error) {
              toast.error(
                error instanceof ApiError && error.status === 412
                  ? "This goal changed somewhere else. We've loaded the latest version."
                  : "That did not save. Check your connection and try again.",
              );
              router.refresh();
            }
          }}
        />
      ) : null}
    </div>
  );
}

function EditGoalDialog({
  goal,
  etag,
  where,
}: {
  goal: GoalView;
  etag: string | null;
  where: string;
}) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [target, setTarget] = useState(String(goal.targetValue));
  const [due, setDue] = useState(sastDateKey(goal.dueAt));
  const [errors, setErrors] = useState<{
    target?: string;
    due?: string;
    title?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const locked = goal.locked || goal.status === "achieved";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found: typeof errors = {};
    if (!title.trim() || title.length > 80)
      found.title = "Give the goal a title of up to 80 characters.";
    const t = Number(target);
    if (!locked && (!Number.isFinite(t) || t < 1 || t > 100))
      found.target = "Pick a target between 1 and 100.";
    if (!locked && due <= sastDateKey(new Date()))
      found.due = "Pick tomorrow or a later date.";
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setPending(true);
    try {
      await updateGoal(
        goal.id,
        {
          title: title.trim(),
          description: null,
          targetValue: locked || t === goal.targetValue ? null : t,
          dueAt:
            locked || due === sastDateKey(goal.dueAt)
              ? null
              : sastInputToIso(due, "23:59"),
          sortOrder: null,
        },
        { headers: etag ? { "If-Match": etag } : undefined },
      );
      toast.success("Goal updated");
      setOpen(false);
      router.refresh();
    } catch (error) {
      const code = errorCode(error);
      if (
        error instanceof ApiError &&
        (error.status === 412 || error.status === 428)
      ) {
        setFormError(
          "This goal changed somewhere else. We've loaded the latest version; check it and save again.",
        );
        router.refresh();
      } else if (code === "goal.locked") {
        setErrors({
          target: "The target is fixed because you have completed this goal.",
        });
      } else if (code === "goal.target_not_above_baseline") {
        setErrors({
          target: baselineRefusal(problemNumber(error, "baseline") ?? 0, where),
        });
      } else {
        setFormError("That did not save. Check your connection and try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-11 px-4">
          <Pencil aria-hidden="true" />
          Edit goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit goal</DialogTitle>
          <DialogDescription>
            {locked
              ? "The target is fixed because you have completed this goal."
              : "Change what you need; the rest stays."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FieldShell id="edit-title" label="Title" error={errors.title}>
            <NativeInput
              id="edit-title"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={!!errors.title || undefined}
              aria-describedby={describedBy("edit-title", false, errors.title)}
            />
          </FieldShell>
          <FieldShell
            id="edit-target"
            label={isCountCriteria(goal.criteriaType) ? "Target" : "Target (%)"}
            error={errors.target}
          >
            <NativeInput
              id="edit-target"
              inputMode="numeric"
              disabled={locked}
              value={target}
              onChange={(e) =>
                setTarget(e.target.value.replace(/[^0-9.]/g, ""))
              }
              aria-invalid={!!errors.target || undefined}
              aria-describedby={describedBy(
                "edit-target",
                false,
                errors.target,
              )}
            />
          </FieldShell>
          <FieldShell id="edit-due" label="Deadline" error={errors.due}>
            <NativeInput
              id="edit-due"
              type="date"
              disabled={locked}
              value={due}
              onChange={(e) => setDue(e.target.value)}
              aria-invalid={!!errors.due || undefined}
              aria-describedby={describedBy("edit-due", false, errors.due)}
            />
          </FieldShell>
          {formError ? <FormAlert>{formError}</FormAlert> : null}
          <DialogFooter>
            <Button type="submit" className="min-h-11 px-4" disabled={pending}>
              {pending ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : null}
              {pending ? "Saving" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Adds a milestone (at most 5, increasing, below the target). */
export function AddMilestoneForm({ goal }: { goal: GoalView }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const threshold = Number(value);
    if (
      !Number.isFinite(threshold) ||
      threshold <= 0 ||
      threshold >= goal.targetValue
    ) {
      setError(`Pick a step between 0 and ${goal.targetValue}.`);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await addGoalMilestone(goal.id, {
        title: null,
        thresholdValue: threshold,
        position: null,
      });
      setValue("");
      router.refresh();
    } catch (e) {
      const code = errorCode(e);
      setError(
        code === "goal.milestone_limit"
          ? "A goal can have at most 5 milestones."
          : code === "goal.invalid_milestones"
            ? "Milestones must go up step by step and stay below the target."
            : "That did not save. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <FieldShell
        id="milestone-value"
        label="Add a milestone"
        error={error ?? undefined}
        className="flex-1"
      >
        <NativeInput
          id="milestone-value"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy("milestone-value", false, error)}
        />
      </FieldShell>
      <Button
        type="submit"
        variant="outline"
        className="min-h-11 px-4"
        disabled={pending}
      >
        <Plus aria-hidden="true" />
        Add milestone
      </Button>
    </form>
  );
}
