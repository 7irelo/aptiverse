import { PageLoading } from "@/components/shell/page-states";

export default function AssessmentsLoading() {
  return (
    <div>
      <span className="sr-only">Loading your assessments</span>
      <PageLoading cards={4} />
    </div>
  );
}
