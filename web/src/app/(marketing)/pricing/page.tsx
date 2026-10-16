import { Suspense } from "react";
import { type PlanDto } from "@/lib/api/queries";
import PricingClient from "./PricingClient";

// The plan catalog is the single source of truth (seeded from
// EntitlementsCatalogSeeder.cs, served by the anonymous /api/entitlements/plans
// endpoint). We fetch it here at build time and revalidate hourly (ISR), so the
// pricing page is statically served with the catalog baked in, with no client-side
// request, no runtime dependency on the API being reachable per visit. A price
// or quota change in the catalog shows up on the next revalidation.
export const revalidate = 3600; // 1 hour

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

async function getPlans(): Promise<PlanDto[]> {
  try {
    const res = await fetch(`${API_URL}/api/entitlements/plans`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    return (await res.json()) as PlanDto[];
  } catch {
    // Catalog unreachable at (re)generation time. Render the empty-state
    // fallback rather than failing the build; ISR retries on the next window.
    return [];
  }
}

export default async function PricingPage() {
  const plans = await getPlans();
  // PricingClient reads the `?for=` query param via useSearchParams, which must
  // sit under a Suspense boundary during static generation.
  return (
    <Suspense fallback={null}>
      <PricingClient plans={plans} />
    </Suspense>
  );
}
