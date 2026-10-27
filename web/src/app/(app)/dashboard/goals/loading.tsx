import { PageLoading } from "@/components/shell/page-states";

export default function GoalsLoading() {
  return (
    <div>
      <span className="sr-only">Loading your goals</span>
      <PageLoading cards={3} />
    </div>
  );
}
