import Link from "next/link";

import { PageContainer } from "@/components/shell/page-container";
import { PageState } from "@/components/shell/page-state";
import { Button } from "@/components/ui/button";

export default function HelpNotFound() {
  return (
    <PageContainer>
      <PageState
        icon="not-found"
        title="That help page does not exist"
        description="Try the full list of questions instead."
      >
        <Button asChild size="lg">
          <Link href="/help">See all questions</Link>
        </Button>
      </PageState>
    </PageContainer>
  );
}
