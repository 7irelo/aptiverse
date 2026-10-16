"use client";

// Where a practice test is actually sat.
//
// This deliberately is not the workspace. The workspace exists to help you
// produce work: notes, a draft, autosave, a tutor a click away. A test is the
// opposite posture, timed, tutor off, one attempt, nothing to lean on. Running
// one inside a page built to assist you is a mode conflict, and it showed: a
// test opened on a stripped "Workspace" shell with no sign of what it was even
// preparing you for.
//
// So a test gets its own page. What it borrows from the workspace is the part
// that matters: the assessment is the protagonist. You can see what you are
// revising for, when it is due and what it is worth, while you sit it.
//
// This route previously forwarded to /dashboard/workspace?test=<id>. It is the
// destination again.

import { use } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { EmptyState } from "@/components/common/EmptyState";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { usePracticeTest, useAssessments, useAcademicUnits } from "@/lib/api/queries";
import { ASSESSMENT_TYPE_LABELS } from "@/lib/mockData";
import { prettifyUnitId } from "@/lib/format";

export default function PracticeTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const testQuery = usePracticeTest(id);
  const assessmentsQuery = useAssessments();
  const academic = useAcademicUnits();

  const test = testQuery.data;

  // The assessment this test was built for. Practice generated before tests
  // were tied to an assessment has none, and that is fine: the test still runs,
  // it just has no assessment to stand under.
  const assessment = test?.assessmentId
    ? (assessmentsQuery.data ?? []).find((a) => a.id === test.assessmentId)
    : undefined;

  // Resolved through useAcademicUnits so it covers both paths: a high-school
  // Subject and a university Course key on the same slug. The prettifier is the
  // last line of defence, a student never sees a raw "uct:calculus-i".
  const unitSlug = assessment?.subjectId ?? test?.subjectId;
  const unitName = unitSlug ? (academic.nameFor(unitSlug) ?? prettifyUnitId(unitSlug)) : undefined;

  const daysOut = assessment ? dayjs(assessment.dueDate).diff(dayjs(), "day") : null;
  const dueChip =
    daysOut == null
      ? null
      : daysOut < 0
        ? { label: "Overdue", color: "error" as const }
        : daysOut === 0
          ? { label: "Due today", color: "warning" as const }
          : daysOut <= 3
            ? { label: `Due in ${daysOut} days`, color: "warning" as const }
            : { label: `Due in ${daysOut} days`, color: "default" as const };

  if (testQuery.isLoading || academic.isLoading) {
    return (
      <AtmosphericBackdrop>
        <Skeleton variant="text" width={220} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={560} />
      </AtmosphericBackdrop>
    );
  }

  if (!test) {
    return (
      <AtmosphericBackdrop>
        <EmptyState
          title="That test isn't here"
          description="It may have been deleted, or it belongs to another account."
          action={
            <Button component={Link} href="/dashboard/practice" variant="contained">
              Back to practice tests
            </Button>
          }
        />
      </AtmosphericBackdrop>
    );
  }

  return (
    <AtmosphericBackdrop>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5, fontSize: "0.8125rem" }}>
        <Link href="/dashboard" style={{ color: "inherit", opacity: 0.7 }}>
          Dashboard
        </Link>
        <Link href="/dashboard/practice" style={{ color: "inherit", opacity: 0.7 }}>
          Practice
        </Link>
        <Typography variant="body2" color="text.primary" noWrap sx={{ maxWidth: { xs: 160, sm: 360 } }}>
          {assessment ? assessment.title : test.title}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, pb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="overline" color="text.secondary">
          {assessment
            ? `Practising for this ${academic.isTertiary ? "assessment" : "SBA"}`
            : "Practice"}
        </Typography>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 600, mt: 0.5, wordBreak: "break-word" }}>
          {assessment ? assessment.title : test.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {assessment ? `${unitName} · ${ASSESSMENT_TYPE_LABELS[assessment.type]}` : unitName}
        </Typography>
        {(dueChip || assessment) && (
          <Stack direction="row" spacing={0.75} sx={{ mt: 1.75 }} flexWrap="wrap" useFlexGap>
            {dueChip && <Chip label={dueChip.label} size="small" color={dueChip.color} variant="outlined" />}
            {assessment && <Chip label={`Weight ${assessment.weight}%`} size="small" variant="outlined" />}
          </Stack>
        )}
      </Box>

      <Stack spacing={2}>
        <Button
          component={Link}
          href="/dashboard/practice"
          startIcon={<ChevronLeft size={16} />}
          color="inherit"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          Back to tests
        </Button>
        <PracticeRunner testId={id} onExit={() => router.push("/dashboard/practice")} />
      </Stack>
    </AtmosphericBackdrop>
  );
}
