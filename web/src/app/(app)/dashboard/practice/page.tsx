import { ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stageWords } from "@/features/academics/lib/stage";
import { getAssessments, getUnits } from "@/features/academics/server/loaders";
import { getStudent } from "@/features/academics/server/get-student";
import { ActiveAttemptBanner } from "@/features/practice/components/active-attempt-banner";
import { PracticeGenerator } from "@/features/practice/components/practice-generator";
import {
  FORMAT_LABELS,
  testStateLabel,
} from "@/features/practice/lib/practice";
import { getPracticeHub } from "@/features/practice/server/loaders";
import { formatDate, nowMs } from "@/lib/format/date";

export const metadata: Metadata = { title: "Practice" };

const UUID = /^[0-9a-f-]{36}$/i;

export default function PracticePage({
  searchParams,
}: PageProps<"/dashboard/practice">) {
  return (
    <Suspense fallback={<PageLoading cards={4} />}>
      <Practice searchParams={searchParams} />
    </Suspense>
  );
}

function one(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function Practice({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/practice">["searchParams"];
}) {
  const query = await searchParams;
  const next = "/dashboard/practice";
  const [student, hub, units, assessments] = await Promise.all([
    getStudent(next),
    getPracticeHub(),
    getUnits(next),
    getAssessments({ PageSize: 100 }, next),
  ]);
  const words = stageWords(student.stage);
  const header = {
    title: "Practice",
    description:
      "Generate a test at your level, or pick up where you left off.",
  };

  if (!hub.ok || !units.ok || !assessments.ok) {
    return (
      <PageShell {...header}>
        <PageForbidden />
      </PageShell>
    );
  }

  if (units.data.length === 0) {
    return (
      <PageShell {...header}>
        <EmptyState
          headingLevel={2}
          className="bg-card py-12"
          title={`Add your ${words.nouns} first`}
          description={`Practice tests are built from your ${words.nouns} and topics.`}
          action={
            <Button asChild className="min-h-11 px-4">
              <Link href="/dashboard/subjects">Add {words.nouns}</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  const { tests, generation, attempt } = hub.data;
  const now = nowMs();
  const unitIdToEnrolment = new Map(
    units.data.map((u) => [u.unitId, u.enrolmentId]),
  );
  const unitNames = new Map(units.data.map((u) => [u.unitId, u.name]));
  const choices = assessments.data.items.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    enrolmentId: a.enrolmentId,
    unitName: a.unitName,
    dueAt: a.dueAt,
    upcoming:
      Date.parse(a.dueAt) >= now &&
      (a.state === "scheduled" || a.state === "in_progress"),
  }));

  const job = one(query.job);
  const unitParam = one(query.unit);
  const initialTestId =
    generation?.testId ?? (job && UUID.test(job) ? job : null);
  const prefill = {
    assessmentId: one(query.assessment),
    enrolmentId: unitParam
      ? (unitIdToEnrolment.get(unitParam) ?? unitParam)
      : undefined,
    topic: one(query.topic)?.slice(0, 80),
  };
  const openOnLoad = !!(prefill.assessmentId || prefill.enrolmentId);

  return (
    <PageShell {...header} width="wide">
      <PracticeGenerator
        stage={student.stage}
        assessments={choices}
        initialTestId={initialTestId}
        activeAttemptTestId={attempt?.testId ?? null}
        prefill={prefill}
        openOnLoad={openOnLoad && !initialTestId}
      />
      {attempt ? (
        <ActiveAttemptBanner
          testId={attempt.testId}
          testTitle={attempt.testTitle}
          deadlineAt={attempt.deadlineAt}
          serverNow={attempt.serverNow}
          remainingSeconds={attempt.remainingSeconds}
          paused={attempt.paused}
        />
      ) : null}

      <section aria-labelledby="my-tests" className="flex flex-col gap-3">
        <h2 id="my-tests" className="text-lg font-semibold">
          My tests
        </h2>
        {tests.items.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            className="bg-card py-12"
            title="No practice tests yet"
            description={`Generate one for any ${words.noun} and topic. It takes about a minute.`}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.items.map((test) => {
              const ready =
                test.status === "ready" || test.status === "archived";
              return (
                <li
                  key={test.id}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-4"
                >
                  <h3 className="font-semibold">
                    {ready ? (
                      <Link
                        href={`/dashboard/practice/${test.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {test.title}
                      </Link>
                    ) : (
                      test.title
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {unitNames.get(test.studyUnitId) ?? words.Noun},{" "}
                    {formatDate(test.createdAt)}
                  </p>
                  <p className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">
                      {FORMAT_LABELS[test.format] ?? test.format}
                    </Badge>
                    <Badge variant="outline">
                      {test.questionCount} questions
                    </Badge>
                    <Badge variant="outline">
                      {test.mode === "timed" && test.durationMinutes
                        ? `${test.durationMinutes} minutes`
                        : "Untimed"}
                    </Badge>
                  </p>
                  <p className="mt-auto text-sm font-medium">
                    {testStateLabel(test)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
