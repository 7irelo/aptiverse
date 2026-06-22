"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAutoRefreshSession } from "@/lib/hooks/useAutoRefreshSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Quietly re-issues the JWT before it expires so a tab left open
  // overnight doesn't kick the user to /login on the next click.
  useAutoRefreshSession();

  // The floating AIHelpBot button was dropped — a persistent global
  // help affordance that overlapped page content failed the taste
  // rubric (fake affordance / chrome-on-content). Help lives in
  // /dashboard/help and contextually inside features (the AI tutor
  // in the workspace right rail).
  return <DashboardShell>{children}</DashboardShell>;
}
