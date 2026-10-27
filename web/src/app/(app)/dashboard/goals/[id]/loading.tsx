import { PageLoading } from "@/components/shell/page-states";

export default function GoalLoading() {
  return (
    <div>
      <span className="sr-only">Loading this goal</span>
      <PageLoading cards={2} />
    </div>
  );
}
