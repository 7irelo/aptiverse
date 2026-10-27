"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormAlert } from "@/components/common/form-alert";
import {
  describedBy,
  FieldShell,
  NativeInput,
  NativeSelect,
  Textarea,
} from "@/components/common/native-fields";
import { Button } from "@/components/ui/button";
import { typesFor } from "@/features/academics/lib/assessments";
import {
  humanize,
  stageWords,
  type Stage,
} from "@/features/academics/lib/stage";
import { fieldErrors } from "@/lib/api/fetcher";
import { createAssessment } from "@/lib/api/generated/endpoints/academics/academics";
import { sastDateKey, sastInputToIso } from "@/lib/format/date";

type UnitOption = { enrolmentId: string; name: string };

type Values = {
  unit: string;
  title: string;
  type: string;
  weight: string;
  date: string;
  time: string;
  predicted: string;
  notes: string;
};

type Errors = Partial<Record<keyof Values, string>>;

export function validateAssessment(values: Values, noun: string): Errors {
  const errors: Errors = {};
  if (!values.unit) errors.unit = `Pick a ${noun}.`;
  const title = values.title.trim();
  if (title.length < 2 || title.length > 120) {
    errors.title = "Give the assessment a title.";
  }
  if (!values.type) errors.type = "Pick a type.";
  if (values.weight !== "") {
    const w = Number(values.weight);
    if (!Number.isFinite(w) || w < 0 || w > 100) {
      errors.weight = "Weight must be between 0 and 100.";
    }
  }
  if (!values.date) errors.date = "Pick a due date.";
  if (values.predicted !== "") {
    const p = Number(values.predicted);
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      errors.predicted = "Your prediction must be between 0 and 100.";
    }
  }
  if (values.notes.length > 2000) {
    errors.notes = "Keep notes under 2 000 characters.";
  }
  return errors;
}

const SERVER_FIELDS: Record<string, keyof Values> = {
  enrolmentId: "unit",
  title: "title",
  type: "type",
  weightPercent: "weight",
  dueAt: "date",
  predictedPercent: "predicted",
  notes: "notes",
};

/** Create form for an assessment. Due times are South African time. */
export function AssessmentForm({
  stage,
  units,
  defaultUnit,
  defaultDate,
}: {
  stage: Stage;
  units: UnitOption[];
  defaultUnit?: string;
  defaultDate?: string;
}) {
  const router = useRouter();
  const words = stageWords(stage);
  const hs = stage === "high_school";
  const [values, setValues] = useState<Values>({
    unit: defaultUnit ?? (units.length === 1 ? units[0]!.enrolmentId : ""),
    title: "",
    type: "",
    weight: "",
    date: defaultDate ?? "",
    time: "",
    predicted: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set(key: keyof Values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const pastDate = values.date !== "" && values.date < sastDateKey(new Date());

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found = validateAssessment(values, words.noun);
    setErrors(found);
    setSummary(null);
    if (Object.keys(found).length > 0) {
      setSummary("Check the highlighted fields.");
      return;
    }
    setPending(true);
    try {
      const created = await createAssessment({
        enrolmentId: values.unit,
        title: values.title.trim(),
        type: values.type,
        weightPercent: values.weight === "" ? null : Number(values.weight),
        term: null,
        dueAt: sastInputToIso(values.date, values.time),
        predictedPercent:
          values.predicted === "" ? null : Number(values.predicted),
        notes: values.notes.trim() || null,
      });
      toast.success("Assessment added");
      router.push(`/dashboard/assessments/${created.id}`);
      router.refresh();
    } catch (error) {
      const server = fieldErrors(error);
      if (Object.keys(server).length > 0) {
        const mapped: Errors = {};
        for (const [key, message] of Object.entries(server)) {
          const field = SERVER_FIELDS[key];
          if (field) mapped[field] = message;
        }
        setErrors(mapped);
        setSummary("Check the highlighted fields.");
      } else {
        setSummary(
          "That did not save. Your details are still here. Try again.",
        );
      }
      setPending(false);
    }
  }

  const field = (key: keyof Values, hint?: boolean) => ({
    id: `assessment-${key}`,
    "aria-invalid": !!errors[key] || undefined,
    "aria-describedby": describedBy(`assessment-${key}`, hint, errors[key]),
    disabled: pending,
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
    >
      {summary ? <FormAlert>{summary}</FormAlert> : null}
      <FieldShell id="assessment-unit" label={words.Noun} error={errors.unit}>
        <NativeSelect
          {...field("unit")}
          value={values.unit}
          onChange={(e) => set("unit", e.target.value)}
        >
          <option value="">Choose one</option>
          {units.map((u) => (
            <option key={u.enrolmentId} value={u.enrolmentId}>
              {u.name}
            </option>
          ))}
        </NativeSelect>
      </FieldShell>
      <FieldShell id="assessment-title" label="Title" error={errors.title}>
        <NativeInput
          {...field("title")}
          value={values.title}
          placeholder={
            hs
              ? "For example, Term 2 Investigation"
              : "For example, Assignment 2"
          }
          onChange={(e) => set("title", e.target.value)}
        />
      </FieldShell>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldShell id="assessment-type" label="Type" error={errors.type}>
          <NativeSelect
            {...field("type")}
            value={values.type}
            onChange={(e) => set("type", e.target.value)}
          >
            <option value="">Choose one</option>
            {typesFor(stage).map((t) => (
              <option key={t} value={t}>
                {humanize(t)}
              </option>
            ))}
          </NativeSelect>
        </FieldShell>
        <FieldShell
          id="assessment-weight"
          label="Weight (%)"
          hint={
            hs
              ? "Share of your SBA mark for this subject."
              : "Share of your final mark for this course."
          }
          error={errors.weight}
        >
          <NativeInput
            {...field("weight", true)}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.1}
            value={values.weight}
            onChange={(e) => set("weight", e.target.value)}
          />
        </FieldShell>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldShell
          id="assessment-date"
          label="Due date"
          hint={
            pastDate
              ? "This date has passed. You can log the mark after saving."
              : "South African time"
          }
          error={errors.date}
        >
          <NativeInput
            {...field("date", true)}
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </FieldShell>
        <FieldShell
          id="assessment-time"
          label="Due time"
          hint="Optional. South African time. Leave empty for end of day."
        >
          <NativeInput
            {...field("time", true)}
            type="time"
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
          />
        </FieldShell>
      </div>
      <FieldShell
        id="assessment-predicted"
        label="Predicted mark (%) (optional)"
        error={errors.predicted}
      >
        <NativeInput
          {...field("predicted")}
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          value={values.predicted}
          onChange={(e) => set("predicted", e.target.value)}
        />
      </FieldShell>
      <FieldShell
        id="assessment-notes"
        label="Notes (optional)"
        error={errors.notes}
      >
        <Textarea
          {...field("notes")}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </FieldShell>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" className="min-h-11 px-4">
          <Link href="/dashboard/assessments">Cancel</Link>
        </Button>
        <Button type="submit" className="min-h-11 px-4" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle aria-hidden="true" className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save assessment"
          )}
        </Button>
      </div>
    </form>
  );
}
