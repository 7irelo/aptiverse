import { notFound } from "next/navigation";

// Catch-all so an unknown /dashboard/* URL renders the (app) not-found
// boundary, keeping the shell nav around the 404. Without it Next sends
// unmatched URLs straight to the root not-found, which has no shell.
// Static and dynamic sibling segments always win over a catch-all, so this
// only fires when nothing real matched.
export default function UnmatchedStudentRoute() {
  notFound();
}
