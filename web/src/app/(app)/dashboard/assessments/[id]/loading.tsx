import { PageLoading } from "@/components/shell/page-states";

export default function AssessmentLoading() {
  return (
    <div>
      <span className="sr-only">Loading this assessment</span>
      <PageLoading cards={2} />
    </div>
  );
}
