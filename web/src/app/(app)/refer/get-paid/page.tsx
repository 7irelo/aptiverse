"use client";

import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { useAffiliateSummary } from "@/lib/api/affiliates";
import { PayoutDetailsForm } from "../PayoutDetailsForm";

// Where the money should go: the identity, tax and bank details a payout run
// needs. The form takes the summary, so this thin page fetches it (the query is
// already cached by the layout) and hands it down.
export default function GetPaidPage() {
  const summary = useAffiliateSummary();

  if (summary.isLoading) return <Skeleton variant="rounded" height={320} />;
  if (summary.isError || !summary.data)
    return <Alert severity="error">We could not load your payout details. Please refresh.</Alert>;

  return <PayoutDetailsForm summary={summary.data} />;
}
