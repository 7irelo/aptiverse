"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
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
  ACTION_LABELS,
  STATE_LABELS,
} from "@/features/academics/lib/assessments";
import { humanize } from "@/features/academics/lib/stage";
import { ApiError } from "@/lib/api/fetcher";
import {
  deleteMyAssessment,
  recordAssessmentMark,
  transitionAssessment,
} from "@/lib/api/generated/endpoints/academics/academics";

const FORWARD = ["start", "submit", "mark"];

/** Next allowed lifecycle step and secondary actions. */
export function AssessmentActions({
  id,
  allowedActions,
}: {
  id: string;
  allowedActions: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const primary = FORWARD.find(
    (a) => a !== "mark" && allowedActions.includes(a),
  );
  const canMark = allowedActions.includes("mark");
  const backward = allowedActions.filter((a) => !FORWARD.includes(a));

  async function run(action: string) {
    if (pending) return;
    setPending(action);
    setError(null);
    try {
      const updated = await transitionAssessment(id, { action });
      toast.success(
        `Marked as ${(STATE_LABELS[updated.state] ?? humanize(updated.state)).toLowerCase()}`,
      );
      router.refresh();
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 409
          ? "This assessment changed in another tab. We loaded the latest version."
          : "That did not save. Check your connection and try again.",
      );
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {primary ? (
          <Button
            className="min-h-11 px-4"
            disabled={!!pending}
            onClick={() => void run(primary)}
          >
            {pending === primary ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : null}
            {ACTION_LABELS[primary]}
          </Button>
        ) : null}
        {canMark ? <MarkDialog id={id} primary={!primary} /> : null}
        {backward.map((action) => (
          <Button
            key={action}
            variant="ghost"
            className="min-h-11 px-4 underline underline-offset-4"
            disabled={!!pending}
            onClick={() => void run(action)}
          >
            {ACTION_LABELS[action] ?? humanize(action)}
          </Button>
        ))}
      </div>
      {error ? <FormAlert>{error}</FormAlert> : null}
    </div>
  );
}

function MarkDialog({ id, primary }: { id: string; primary: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"percent" | "marks">("percent");
  const [percent, setPercent] = useState("");
  const [obtained, setObtained] = useState("");
  const [total, setTotal] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const live =
    mode === "marks" && Number(total) > 0 && obtained !== ""
      ? Math.round((Number(obtained) / Number(total)) * 1000) / 10
      : null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setFieldError(null);
    setFormError(null);
    let body;
    if (mode === "percent") {
      const p = Number(percent);
      if (percent === "" || !Number.isInteger(p) || p < 0 || p > 100) {
        setFieldError("Enter a whole percent between 0 and 100.");
        return;
      }
      body = { percent: p, markObtained: null, markTotal: null };
    } else {
      const o = Number(obtained);
      const t = Number(total);
      if (!Number.isInteger(t) || t < 1 || t > 1000) {
        setFieldError("The total must be a whole number from 1 to 1 000.");
        return;
      }
      if (obtained === "" || !Number.isInteger(o) || o < 0 || o > t) {
        setFieldError(`Your mark must be between 0 and ${t}.`);
        return;
      }
      body = { percent: null, markObtained: o, markTotal: t };
    }
    setPending(true);
    try {
      await recordAssessmentMark(id, body);
      toast.success("Mark saved");
      setOpen(false);
      router.refresh();
    } catch {
      setFormError("That did not save. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={primary ? "default" : "outline"}
          className="min-h-11 px-4"
        >
          Log mark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Log your mark</DialogTitle>
          <DialogDescription>
            Logging a mark again replaces the one you saved before.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <fieldset className="flex gap-2">
            <legend className="sr-only">How you got your mark</legend>
            {(["percent", "marks"] as const).map((m) => (
              <label
                key={m}
                className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 has-[:checked]:border-primary has-[:checked]:bg-muted"
              >
                <input
                  type="radio"
                  name="mark-mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="accent-primary"
                />
                {m === "percent" ? "Percent" : "Marks"}
              </label>
            ))}
          </fieldset>
          {mode === "percent" ? (
            <FieldShell
              id="mark-percent"
              label="Percent"
              error={fieldError ?? undefined}
            >
              <NativeInput
                id="mark-percent"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                aria-invalid={!!fieldError || undefined}
                aria-describedby={describedBy(
                  "mark-percent",
                  false,
                  fieldError,
                )}
              />
            </FieldShell>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <FieldShell id="mark-obtained" label="Your mark">
                <NativeInput
                  id="mark-obtained"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={obtained}
                  onChange={(e) => setObtained(e.target.value)}
                  aria-invalid={!!fieldError || undefined}
                />
              </FieldShell>
              <FieldShell id="mark-total" label="Out of">
                <NativeInput
                  id="mark-total"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  aria-invalid={!!fieldError || undefined}
                />
              </FieldShell>
              <p
                className="col-span-2 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {live === null ? "" : `That is ${live}%.`}
              </p>
              {fieldError ? (
                <p className="col-span-2 text-sm text-error">{fieldError}</p>
              ) : null}
            </div>
          )}
          {formError ? <FormAlert>{formError}</FormAlert> : null}
          <DialogFooter>
            <Button type="submit" className="min-h-11 px-4" disabled={pending}>
              {pending ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : null}
              Save mark
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteAssessmentButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" className="min-h-11 px-3">
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      }
      title="Delete this assessment?"
      description="This deletes the assessment and its mark. This cannot be undone."
      confirmLabel="Delete"
      onConfirm={async () => {
        try {
          await deleteMyAssessment(id);
          toast.success("Assessment deleted");
          router.push("/dashboard/assessments");
          router.refresh();
        } catch {
          toast.error(
            "That did not save. Check your connection and try again.",
          );
        }
      }}
    />
  );
}
