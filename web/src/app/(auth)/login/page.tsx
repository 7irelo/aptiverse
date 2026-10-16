import type { Metadata } from "next";

import { PageState } from "@/components/shell/page-state";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <PageState
      icon="empty"
      title="Sign in is coming soon"
      description="We are rebuilding accounts. You will be able to sign in here shortly."
    />
  );
}
