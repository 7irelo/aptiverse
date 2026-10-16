import { notFound } from "next/navigation";

// See dashboard/[...unmatched]: keeps unknown /school-admin/* URLs inside the shell.
export default function UnmatchedSchoolAdminRoute() {
  notFound();
}
