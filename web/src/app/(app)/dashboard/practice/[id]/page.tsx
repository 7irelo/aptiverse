import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { PageState } from "@/components/shell/page-state";
import { Button } from "@/components/ui/button";
import { getUnits } from "@/features/academics/server/loaders";
import { GradingWaiter } from "@/features/practice/components/grading-waiter";
import { ResultsView } from "@/features/practice/components/results-view";
import { PracticeRunner } from "@/features/practice/components/runner/practice-runner";
import { getResults, getTest } from "@/features/practice/server/loaders";

export const metadata: Metadata = { title: "Practice test" };

export default function PracticeTestPage({
  params,
  searchParams,
}: PageProps<"/dashboard/practice/[id]">) {
  return (
    <Suspense fallback={<PageLoading cards={2} className="max-w-3xl" />}>
      <PracticeTest params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const ACTIVE = new Set(["in_progress", "paused"]);

async function PracticeTest({
  params,
  searchParams,
}: {
  params: PageProps<"/dashboard/practice/[id]">["params"];
  searchParams: PageProps<"/dashboard/practice/[id]">["searchParams"];
}) {
  const { id } = await params;
  const { submitted } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const next = `/dashboard/practice/${id}`;
  const [result, units] = await Promise.all([getTest(id), getUnits(next)]);
  if (!result.ok && result.reason === "not-found") notFound();
  if (!result.ok) {
    return (
      <PageShell title="Practice test">
        <PageForbidden />
      </PageShell>
    );
  }
  const test = result.data;
  const unitName =
    (units.ok
      ? units.data.find((u) => u.unitId === test.studyUnitId)?.name
      : null) ?? null;

  if (test.status === "generating") {
    return (
      <PageShell title={test.title} width="narrow">
        <PageState
          icon="loading"
          title="This test is still being written."
          description="It usually takes under a minute. The progress continues on the practice page."
        >
          <Button asChild variant="outline" className="min-h-11 px-4">
            <Link href={`/dashboard/practice?job=${test.id}`}>
              Back to practice
            </Link>
          </Button>
        </PageState>
      </PageShell>
    );
  }
  if (test.status === "failed") {
    return (
      <PageShell title={test.title} width="narrow">
        <PageState
          icon="error"
          title="This test could not be generated. Your quota was not used."
        >
          <Button asChild className="min-h-11 px-4">
            <Link href="/dashboard/practice">Generate a new test</Link>
          </Button>
        </PageState>
      </PageShell>
    );
  }

  const done = test.attempt && !ACTIVE.has(test.attempt.status);
  if (done && test.attempt) {
    const results = await getResults(test.attempt.attemptId, next);
    if (!results.ok) {
      if (results.reason === "conflict") return <GradingWaiter />;
      if (results.reason === "not-found") notFound();
      return (
        <PageShell title="Your results">
          <PageForbidden />
        </PageShell>
      );
    }
    if (results.data.status === "grading") return <GradingWaiter />;
    return (
      <ResultsView
        results={results.data}
        unitName={unitName}
        revisit={submitted !== "1"}
      />
    );
  }

  return <PracticeRunner test={test} unitName={unitName} />;
}
