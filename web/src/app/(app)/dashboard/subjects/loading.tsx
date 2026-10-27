import { PageLoading } from "@/components/shell/page-states";

export default function SubjectsLoading() {
  return (
    <div>
      <span className="sr-only">Loading your subjects</span>
      <PageLoading cards={6} />
    </div>
  );
}
