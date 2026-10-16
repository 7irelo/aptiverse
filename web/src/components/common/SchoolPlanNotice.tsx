"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import { School } from "lucide-react";
import { EmptyState } from "./EmptyState";

// Staff areas sit behind a school subscription, which is bought by the school,
// not by the member of staff looking at the screen. The default FeatureGuard
// wall sent teachers and school admins to the student billing page to buy a
// personal plan that would not have unlocked anything, so these two layouts
// pass this instead: the same fact, stated honestly, with the only action that
// can actually resolve it.
export function SchoolPlanNotice() {
  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <EmptyState
        icon={<School size={26} />}
        title="Your school does not have an Aptiverse subscription yet"
        description="Staff tools are part of the School plan. Schools are set up with us directly, so there is nothing for you to buy here. Talk to your school admin, or start the conversation with us."
        action={
          <Button component={Link} href="/contact" variant="contained">
            Contact Aptiverse
          </Button>
        }
      />
    </Box>
  );
}
