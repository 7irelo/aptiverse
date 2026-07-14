"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";
import dayjs from "dayjs";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useAssessment, useUpdateAssessment } from "@/lib/api/queries";
import type { Assessment } from "@/lib/mockData";
import {
  AssessmentForm,
  parseMark,
  type AssessmentFormValues,
} from "../../AssessmentForm";

export default function EditAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const assessmentQuery = useAssessment(id);
  const updateAssessment = useUpdateAssessment();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const detailHref = `/dashboard/assessments/${id}`;

  const submit = async (v: AssessmentFormValues) => {
    try {
      await updateAssessment.mutateAsync({
        id,
        subjectId: v.subjectId,
        title: v.title,
        type: v.type,
        weight: v.weight,
        status: v.status,
        dueDate: new Date(`${v.dueDate}T00:00:00Z`).toISOString(),
        predictedMark: parseMark(v.predictedMark),
        actualMark: parseMark(v.actualMark),
        notes: v.notes.trim(),
      });
      enqueueSnackbar("Changes saved.", { variant: "success" });
      router.push(detailHref);
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
        title="Edit assessment"
        description={assessmentQuery.data?.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/dashboard/assessments" },
          { label: assessmentQuery.data?.title ?? "Assessment", href: detailHref },
          { label: "Edit" },
        ]}
      />

      <QueryStates
        query={assessmentQuery}
        isEmpty={() => false}
        empty={{
          icon: <AssignmentIcon />,
          title: "Assessment not found",
          description: "This SBA doesn't exist or has been removed.",
          action: (
            <Button component={Link} href="/dashboard/assessments" variant="outlined">
              All assessments
            </Button>
          ),
        }}
      >
        {(a: Assessment) => (
          <AssessmentForm
            mode="edit"
            submitting={updateAssessment.isPending}
            cancelHref={detailHref}
            initial={{
              subjectId: a.subjectId,
              title: a.title,
              type: a.type,
              weight: a.weight,
              dueDate: dayjs(a.dueDate).format("YYYY-MM-DD"),
              status: a.status,
              predictedMark: a.predictedMark != null ? String(a.predictedMark) : "",
              actualMark: a.actualMark != null ? String(a.actualMark) : "",
              notes: a.notes ?? "",
            }}
            onSubmit={submit}
          />
        )}
      </QueryStates>
    </>
  );
}
