"use client";

import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { useAffiliateSummary } from "@/lib/api/affiliates";
import { EarningsHero, OnboardingAlerts, HowItWorks } from "./_shared";

// The section routes, in order. The affiliate sidebar links straight to these;
// this in-page tab bar is what makes them reachable for a student or parent
// too, whose sidebar carries a single "Refer and earn" entry.
const SECTIONS: { href: string; label: string }[] = [
  { href: "/refer", label: "Referrals" },
  { href: "/refer/earnings", label: "Earnings" },
  { href: "/refer/payments", label: "Payments" },
  { href: "/refer/get-paid", label: "Get paid" },
  { href: "/refer/tax", label: "Tax statement" },
];

// The affiliate area shell. What used to be five tabs on one page is now five
// routes; the earnings hero and the "how it works" note are constant, so they
// live here and wrap whichever section is open.
export default function ReferLayout({ children }: { children: React.ReactNode }) {
  const summary = useAffiliateSummary();
  const pathname = usePathname();
  // Longest matching href wins so /refer/earnings does not resolve to /refer.
  const active =
    SECTIONS.map((s) => s.href)
      .filter((h) => pathname === h || (h !== "/refer" && pathname.startsWith(h)))
      .sort((a, b) => b.length - a.length)[0] ?? "/refer";

  return (
    <>
      <PageHeader
        title="Refer and earn"
        description="Share your link. When someone you referred subscribes, you earn a share of what they pay."
        breadcrumbs={[{ label: "Refer and earn" }]}
      />

      {summary.isLoading && <Skeleton variant="rounded" height={220} />}

      {summary.isError && (
        <Alert severity="error">We could not load your referral page just now. Please refresh.</Alert>
      )}

      {summary.data && (
        <Stack spacing={3}>
          <EarningsHero data={summary.data} />
          <OnboardingAlerts data={summary.data} />
          <Card>
            <Tabs
              value={active}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: "divider" }}
            >
              {SECTIONS.map((s) => (
                <Tab
                  key={s.href}
                  value={s.href}
                  label={s.label}
                  component={Link}
                  href={s.href}
                />
              ))}
            </Tabs>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>{children}</CardContent>
          </Card>
          <HowItWorks data={summary.data} />
        </Stack>
      )}
    </>
  );
}
