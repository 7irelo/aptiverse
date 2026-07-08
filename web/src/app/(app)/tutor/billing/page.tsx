"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { BillingManager } from "@/components/billing/BillingManager";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Your tutor subscription, payment method, and payment history."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Billing" }]}
      />
      <BillingManager track="tutor" />
    </>
  );
}
