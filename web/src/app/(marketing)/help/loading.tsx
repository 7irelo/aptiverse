import { PageContainer } from "@/components/shell/page-container";
import { FaqListSkeleton } from "@/features/support/components/faq-list-skeleton";

export default function HelpLoading() {
  return (
    <PageContainer className="flex flex-col gap-8">
      <div className="flex flex-col gap-2" aria-hidden="true">
        <div className="h-9 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-72 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <FaqListSkeleton />
    </PageContainer>
  );
}
