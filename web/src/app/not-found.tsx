"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { StatusPanel } from "@/components/common/StatusPanel";
import { homeRouteForRole } from "@/lib/home-route";

// Root 404. In the App Router this file is what every unmatched URL in the
// whole app falls back to, so it renders under the root layout only: no
// marketing chrome, no dashboard shell.
//
// Held to the graphic, one sentence and one button. A signed-in visitor gets
// sent to their own dashboard, everyone else to the home page, which is also
// the only brand link the page needs.
//
// It is a client component because it reads the session, which means it
// cannot export `metadata`. Next titles it from the root layout template.

export default function NotFound() {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const home = signedIn ? homeRouteForRole(session?.user?.role) : "/";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 4 },
        py: { xs: 8, md: 12 },
      }}
    >
      <StatusPanel
        code="404"
        title="We could not find that page."
        actions={
          <Button component={Link} href={home} variant="contained" size="large">
            {signedIn ? "Back to my dashboard" : "Back to home"}
          </Button>
        }
      />
    </Box>
  );
}
