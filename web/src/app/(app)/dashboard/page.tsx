import type { Metadata } from "next";

import { PageContainer } from "@/components/shell/page-container";
import { PageState } from "@/components/shell/page-state";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageState
        icon="empty"
        title="Your dashboard is on its way"
        description="Your subjects, marks and practice will show up here."
      >
        <SignOutButton />
      </PageState>
    </PageContainer>
  );
}
