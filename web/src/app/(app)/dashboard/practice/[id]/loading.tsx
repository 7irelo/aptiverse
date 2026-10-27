import { PageLoading } from "@/components/shell/page-states";

export default function PracticetestLoading() {
  return (
    <div>
      <span className="sr-only">Loading this test</span>
      <PageLoading cards={2} />
    </div>
  );
}
