"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { BillingManager } from "@/components/billing/BillingManager";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Your family subscription, payment method, and payment history."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Billing" }]}
      />
      <BillingManager track="family" />
    </>
  );
}
