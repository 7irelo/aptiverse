import { PageLoading } from "@/components/shell/page-states";

export default function MasteryLoading() {
  return (
    <div>
      <span className="sr-only">Loading your mastery</span>
      <PageLoading cards={3} />
    </div>
  );
}
