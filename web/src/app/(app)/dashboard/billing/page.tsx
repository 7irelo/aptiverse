"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { BillingManager } from "@/components/billing/BillingManager";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Your plan, monthly allowance, payment method and payment history."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Billing" }]}
      />
      <BillingManager track="student" showUsage />
    </>
  );
}
