import { PageState } from "@/components/shell/page-state";
import { PageContainer } from "@/components/shell/page-container";

export default function Loading() {
  return (
    <PageContainer>
      <PageState icon="loading" title="Loading" description="Just a moment." />
    </PageContainer>
  );
}
