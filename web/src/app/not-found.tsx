import Link from "next/link";

import { PageContainer } from "@/components/shell/page-container";
import { PageState } from "@/components/shell/page-state";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageContainer>
          <PageState
            icon="not-found"
            title="We could not find that page"
            description="The link may be old or mistyped."
          >
            <Button asChild size="lg">
              <Link href="/">Go to the home page</Link>
            </Button>
          </PageState>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
