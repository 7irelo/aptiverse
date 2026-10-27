import { PageLoading } from "@/components/shell/page-states";

export default function DashboardLoading() {
  return (
    <div>
      <span className="sr-only">Loading your dashboard</span>
      <PageLoading cards={6} />
    </div>
  );
}
