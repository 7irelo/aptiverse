"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CubeSpinner } from "@/components/common/CubeSpinner";
import Stack from "@mui/material/Stack";

// A test is taken and reviewed in the workspace now, so this old deep-link
// route just forwards there. Kept so bookmarks and any external links to
// /dashboard/practice/<id> still resolve to the right place.
export default function PracticeAttemptRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/workspace?test=${id}`);
  }, [id, router]);

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "60vh" }}>
      <CubeSpinner color="secondary" sx={{ fontSize: 44 }} />
    </Stack>
  );
}
