import { notFound } from "next/navigation";

// See dashboard/[...unmatched]: keeps unknown /admin/* URLs inside the shell.
export default function UnmatchedAdminRoute() {
  notFound();
}
