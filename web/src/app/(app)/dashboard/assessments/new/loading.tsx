import { PageLoading } from "@/components/shell/page-states";

export default function AddassessmentLoading() {
  return (
    <div>
      <span className="sr-only">Loading the form</span>
      <PageLoading cards={1} />
    </div>
  );
}
