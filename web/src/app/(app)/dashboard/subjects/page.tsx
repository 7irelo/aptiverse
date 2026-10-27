import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AddCourseDialog } from "@/features/academics/components/add-course-dialog";
import { AddSubjectsDialog } from "@/features/academics/components/add-subjects-dialog";
import { RemoveUnitButton } from "@/features/academics/components/remove-unit-button";
import {
  levelLabel,
  percentText,
  stageWords,
} from "@/features/academics/lib/stage";
import { getUnits } from "@/features/academics/server/loaders";
import { getStudent } from "@/features/academics/server/get-student";
import { unitValue } from "@/features/dashboard/components/dashboard-cards";
import { formatDueLabel } from "@/lib/format/date";

export const metadata: Metadata = { title: "Subjects" };

export default function SubjectsPage() {
  return (
    <Suspense fallback={<PageLoading cards={6} />}>
      <Subjects />
    </Suspense>
  );
}

async function Subjects() {
  const [student, result] = await Promise.all([
    getStudent("/dashboard/subjects"),
    getUnits("/dashboard/subjects"),
  ]);
  const { stage, me } = student;
  const words = stageWords(stage);
  const hs = stage === "high_school";
  const yearLevel = me.onboarding.yearOfStudy
    ? ["first_year", "second_year", "third_year", "fourth_year"][
        me.onboarding.yearOfStudy - 1
      ]
    : null;

  const units = result.ok ? result.data : [];
  const addAction = hs ? (
    <AddSubjectsDialog
      curriculum={me.onboarding.curriculum}
      grade={me.onboarding.grade}
      enrolledNames={units.map((u) => u.name)}
    />
  ) : (
    <AddCourseDialog
      defaultLevel={me.onboarding.studyLevel ?? yearLevel ?? null}
    />
  );

  return (
    <PageShell
      title={words.Nouns}
      description={
        hs
          ? "The subjects you take this year."
          : "The courses you are registered for."
      }
      actions={result.ok ? addAction : undefined}
    >
      {!result.ok ? (
        <PageForbidden />
      ) : units.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          headingLevel={2}
          className="bg-card py-12"
          title={hs ? "Add your subjects" : "Add your first course"}
          description={
            hs
              ? "Pick the subjects you take this year. You can change them later."
              : "Add the courses you are registered for this semester."
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => {
            const value = unitValue(unit, stage);
            return (
              <li
                key={unit.enrolmentId}
                className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold">{unit.name}</h2>
                  <Badge variant="secondary">{levelLabel(unit)}</Badge>
                </div>
                {value === null ? (
                  <p className="text-sm text-muted-foreground">No marks yet</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm">
                      {hs ? "Predicted" : "Average"}{" "}
                      <span className="font-semibold tabular-nums">
                        {percentText(value)}
                      </span>
                    </p>
                    <Progress
                      value={Math.min(100, Math.max(0, value))}
                      aria-label={`${unit.name}: ${percentText(value)}`}
                    />
                  </div>
                )}
                {unit.nextDue ? (
                  <p className="text-sm text-muted-foreground">
                    Next:{" "}
                    <Link
                      href={`/dashboard/assessments/${unit.nextDue.assessmentId}`}
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      {unit.nextDue.title}
                    </Link>
                    , {formatDueLabel(unit.nextDue.dueAt)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing due yet.
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/assessments?unit=${unit.enrolmentId}`}
                    className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium underline underline-offset-4 hover:bg-muted"
                  >
                    Assessments<span className="sr-only"> for {unit.name}</span>
                  </Link>
                  <RemoveUnitButton
                    enrolmentId={unit.enrolmentId}
                    name={unit.name}
                    noun={words.noun}
                    assessmentCount={unit.weighting.assessmentCount}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {hs && me.onboarding.curriculum && me.onboarding.grade ? (
        <p className="text-sm text-muted-foreground">
          Subjects come from the CAPS catalog for{" "}
          {me.onboarding.curriculum.toUpperCase()} Grade {me.onboarding.grade}.
        </p>
      ) : null}
    </PageShell>
  );
}
