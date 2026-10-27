import { PageLoading } from "@/components/shell/page-states";

export default function PracticeLoading() {
  return (
    <div>
      <span className="sr-only">Loading your practice</span>
      <PageLoading cards={4} />
    </div>
  );
}
