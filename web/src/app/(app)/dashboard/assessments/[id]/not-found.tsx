import Link from "next/link";

import { PageState } from "@/components/shell/page-state";
import { Button } from "@/components/ui/button";

export default function AssessmentNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Assessment
      </h1>
      <PageState
        icon="not-found"
        title="We could not find that assessment"
        description="It may have been deleted."
      >
        <Button asChild variant="outline" className="min-h-11 px-4">
          <Link href="/dashboard/assessments">Back to assessments</Link>
        </Button>
      </PageState>
    </div>
  );
}
