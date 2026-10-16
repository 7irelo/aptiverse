"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOutAptiverse } from "@/lib/auth-client";
import { StatusPanel } from "./StatusPanel";
import { homeRouteForRole } from "@/lib/home-route";

const AREA_LABEL: Record<string, string> = {
  student: "students",
  parent: "parents",
  teacher: "teachers",
  tutor: "tutors",
  school_admin: "school admins",
  admin: "Aptiverse staff",
  super_admin: "Aptiverse staff",
};

function labelFor(roles: readonly string[]): string {
  const labels = roles.map((r) => AREA_LABEL[r] ?? r.replace(/_/g, " "));
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

export type SignedInForbiddenProps = {
  /** Roles the area belongs to. Used to say plainly whose area this is. */
  allow?: readonly string[];
};

/**
 * 403 for an authenticated user standing in an area their role does not own.
 *
 * Deliberately not a 404. These areas are named in the marketing site and the
 * whole nav config ships to every client, so hiding them protects nothing and
 * only reads as the app being broken. Two things earn their place next to the
 * graphic: who you are currently signed in as, and a way to switch account.
 * Family devices are shared in this market, and a parent tapping a link their
 * child sent needs to see that it is the account that is wrong.
 *
 * Plan and entitlement gates are a different question and keep their upgrade
 * wall. Not being able to afford a feature is not the same as it not being
 * yours.
 */
export function SignedInForbidden({ allow }: SignedInForbiddenProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;
  const home = homeRouteForRole(role);
  const who = user?.name || user?.email;

  const title = allow?.length
    ? `This area is for ${labelFor(allow)}.`
    : "You do not have access to this area.";

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <StatusPanel
        code="403"
        title={title}
        note={who ? `Signed in as ${who}.` : undefined}
        actions={
          <>
            <Button component={Link} href={home} variant="contained" size="large">
              Go to my dashboard
            </Button>
            <Button variant="text" size="large" onClick={() => void signOutAptiverse("/login")}>
              Switch account
            </Button>
          </>
        }
      />
    </Box>
  );
}
