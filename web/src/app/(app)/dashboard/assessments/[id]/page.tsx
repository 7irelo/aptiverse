import { Check, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AssessmentActions,
  DeleteAssessmentButton,
} from "@/features/academics/components/assessment-actions";
import {
  compareSentence,
  isOverdue,
  overdueDays,
  STATE_LABELS,
} from "@/features/academics/lib/assessments";
import { humanize, percentText } from "@/features/academics/lib/stage";
import { getAssessment } from "@/features/academics/server/loaders";
import { getStudent } from "@/features/academics/server/get-student";
import { formatDate, formatTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Assessment" };

const STEPS = [
  { state: "scheduled", label: "Scheduled", at: null },
  { state: "in_progress", label: "In progress", at: "startedAt" },
  { state: "submitted", label: "Submitted", at: "submittedAt" },
  { state: "graded", label: "Marked", at: "gradedAt" },
] as const;

export default function AssessmentPage({
  params,
}: PageProps<"/dashboard/assessments/[id]">) {
  return (
    <Suspense fallback={<PageLoading cards={2} />}>
      <AssessmentDetail params={params} />
    </Suspense>
  );
}

async function AssessmentDetail({
  params,
}: {
  params: PageProps<"/dashboard/assessments/[id]">["params"];
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [student, result] = await Promise.all([
    getStudent(`/dashboard/assessments/${id}`),
    getAssessment(id),
  ]);
  if (!result.ok && result.reason === "not-found") notFound();
  const back = (
    <Link
      href="/dashboard/assessments"
      className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      Assessments
    </Link>
  );
  if (!result.ok) {
    return (
      <PageShell title="Assessment" eyebrow={back}>
        <PageForbidden />
      </PageShell>
    );
  }
  const a = result.data;
  const hs = student.stage === "high_school";
  const currentIndex = STEPS.findIndex((s) => s.state === a.state);
  const overdue = isOverdue(a.dueAt, a.state);

  return (
    <PageShell
      title={a.title}
      eyebrow={back}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <span>{a.unitName}</span>
          <Badge variant="outline">{humanize(a.type)}</Badge>
          <Badge variant="secondary">
            {STATE_LABELS[a.state] ?? humanize(a.state)}
          </Badge>
        </span>
      }
      actions={<DeleteAssessmentButton id={a.id} />}
    >
      <ol
        aria-label="Progress of this assessment"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          const at = step.at ? a[step.at] : null;
          return (
            <li
              key={step.state}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex flex-col gap-0.5 rounded-lg border p-3",
                current && "border-primary bg-muted",
              )}
            >
              <span className="flex items-center gap-1 text-sm font-medium">
                {done ? <Check aria-hidden="true" className="size-4" /> : null}
                {step.label}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
              {at ? (
                <span className="text-xs text-muted-foreground">
                  {formatDate(at)}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <AssessmentActions id={a.id} allowedActions={a.allowedActions} />
      <div>
        <Button asChild variant="outline" className="min-h-11 px-4">
          <Link href={`/dashboard/practice?assessment=${a.id}`}>
            Practise for this
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section
          aria-labelledby="facts-title"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:col-span-7"
        >
          <h2 id="facts-title" className="text-base font-semibold">
            Details
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Due</dt>
              <dd className={cn(overdue && "text-warning")}>
                {formatDate(a.dueAt)}, {formatTime(a.dueAt)}
                {overdue
                  ? ` (Overdue by ${overdueDays(a.dueAt)} ${overdueDays(a.dueAt) === 1 ? "day" : "days"})`
                  : null}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                {hs ? "Weight (of SBA mark)" : "Weight (of course mark)"}
              </dt>
              <dd>
                {a.weightPercent == null ? "Not set" : `${a.weightPercent}%`}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Your prediction</dt>
              <dd>{percentText(a.predictedPercent) ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Your mark</dt>
              <dd
                className={cn(
                  a.percent == null ? "text-muted-foreground" : "font-semibold",
                )}
              >
                {a.percent == null
                  ? "No mark yet"
                  : a.markObtained != null && a.markTotal != null
                    ? `${a.markObtained} of ${a.markTotal} (${percentText(a.percent)})`
                    : percentText(a.percent)}
              </dd>
            </div>
          </dl>
          {a.percent != null && a.predictedPercent != null ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm">Prediction</p>
              <Progress
                value={a.predictedPercent}
                aria-label={`Prediction ${percentText(a.predictedPercent)}`}
              />
              <p className="text-sm">Mark</p>
              <Progress
                value={a.percent}
                aria-label={`Mark ${percentText(a.percent)}`}
              />
              <p className="text-base">
                {compareSentence(a.percent, a.predictedPercent)}
              </p>
            </div>
          ) : null}
          {a.unitWeighting.warnings.length > 0 ? (
            <ul className="text-sm text-muted-foreground">
              {a.unitWeighting.warnings.map((w) => (
                <li key={w}>{humanize(w)}</li>
              ))}
            </ul>
          ) : null}
        </section>
        <section
          aria-labelledby="notes-title"
          className="flex flex-col gap-2 rounded-lg border bg-card p-4 lg:col-span-5"
        >
          <h2 id="notes-title" className="text-base font-semibold">
            Notes
          </h2>
          <p className="text-base whitespace-pre-wrap">
            {a.notes ? (
              a.notes
            ) : (
              <span className="text-muted-foreground">No notes.</span>
            )}
          </p>
        </section>
      </div>
    </PageShell>
  );
}
