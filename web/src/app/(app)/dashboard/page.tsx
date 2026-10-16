import type { Metadata } from "next";

import { PageContainer } from "@/components/shell/page-container";
import { PageState } from "@/components/shell/page-state";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageState
        icon="empty"
        title="Your dashboard is on its way"
        description="This area opens once sign in is ready."
      />
    </PageContainer>
  );
}
