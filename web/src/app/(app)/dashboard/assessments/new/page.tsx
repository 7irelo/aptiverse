"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { useCreateAssessment } from "@/lib/api/queries";
import {
  AssessmentForm,
  parseMark,
  type AssessmentFormValues,
} from "../AssessmentForm";

export default function NewAssessmentPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const createAssessment = useCreateAssessment();

  const submit = async (v: AssessmentFormValues) => {
    try {
      const created = await createAssessment.mutateAsync({
        subjectId: v.subjectId,
        title: v.title,
        type: v.type,
        weight: v.weight,
        status: v.status,
        dueDate: new Date(`${v.dueDate}T00:00:00Z`).toISOString(),
        predictedMark: parseMark(v.predictedMark),
        actualMark: parseMark(v.actualMark),
        notes: v.notes.trim() || undefined,
      });
      enqueueSnackbar("Assessment added.", { variant: "success" });
      router.push(`/dashboard/assessments/${created.id}`);
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <>
      <PageHeader
        title="New assessment"
        description="Log an SBA, test, project, or exam. Fill in marks as the term progresses."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/dashboard/assessments" },
          { label: "New" },
        ]}
      />
      <AssessmentForm
        mode="create"
        submitting={createAssessment.isPending}
        cancelHref="/dashboard/assessments"
        onSubmit={submit}
      />
    </>
  );
}
