import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Button } from "@/components/ui/button";
import { AssessmentForm } from "@/features/academics/components/assessment-form";
import { stageWords } from "@/features/academics/lib/stage";
import { getUnits } from "@/features/academics/server/loaders";
import { getStudent } from "@/features/academics/server/get-student";

export const metadata: Metadata = { title: "Add assessment" };

export default function NewAssessmentPage({
  searchParams,
}: PageProps<"/dashboard/assessments/new">) {
  return (
    <Suspense fallback={<PageLoading cards={1} className="max-w-3xl" />}>
      <NewAssessment searchParams={searchParams} />
    </Suspense>
  );
}

async function NewAssessment({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/assessments/new">["searchParams"];
}) {
  const { unit, date } = await searchParams;
  const next = "/dashboard/assessments/new";
  const [student, units] = await Promise.all([
    getStudent(next),
    getUnits(next),
  ]);
  const words = stageWords(student.stage);
  const hs = student.stage === "high_school";
  const options = units.ok
    ? units.data.map((u) => ({ enrolmentId: u.enrolmentId, name: u.name }))
    : [];
  // ?unit only preselects one of the student's own units.
  const defaultUnit = options.find((o) => o.enrolmentId === unit)?.enrolmentId;
  const defaultDate =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : undefined;

  return (
    <PageShell
      width="narrow"
      title={hs ? "Add SBA" : "Add assessment"}
      description="You can change any of this later."
      eyebrow={
        <Link
          href="/dashboard/assessments"
          className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Assessments
        </Link>
      }
    >
      {!units.ok ? (
        <PageForbidden />
      ) : options.length === 0 ? (
        <EmptyState
          headingLevel={2}
          className="bg-card py-12"
          title={`Add your ${words.nouns} first`}
          description={`Assessments belong to a ${words.noun}.`}
          action={
            <Button asChild className="min-h-11 px-4">
              <Link href="/dashboard/subjects">Add {words.nouns}</Link>
            </Button>
          }
        />
      ) : (
        <AssessmentForm
          stage={student.stage}
          units={options}
          defaultUnit={defaultUnit}
          defaultDate={defaultDate}
        />
      )}
    </PageShell>
  );
}
