"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { StatusPanel } from "./StatusPanel";
import { homeRouteForRole } from "@/lib/home-route";

/**
 * The signed-in 404, rendered inside the DashboardShell.
 *
 * Reached by the (app) not-found boundary and by the [...unmatched] catch-all
 * under each role root. Ownership checks that hide someone else's record
 * should land here too: confirming that a record exists but is not yours
 * leaks enough to enumerate, so "not found" is the honest answer there.
 */
export function SignedInNotFound() {
  const { data: session } = useSession();
  const home = homeRouteForRole(session?.user?.role);

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <StatusPanel
        code="404"
        title="We could not find that page."
        actions={
          <Button component={Link} href={home} variant="contained" size="large">
            Back to my dashboard
          </Button>
        }
      />
    </Box>
  );
}
