import { PageLoading } from "@/components/shell/page-states";

export default function AItutorLoading() {
  return (
    <div>
      <span className="sr-only">Loading this conversation</span>
      <PageLoading cards={2} />
    </div>
  );
}
