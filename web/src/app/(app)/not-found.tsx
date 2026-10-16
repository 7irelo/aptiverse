"use client";

import { SignedInNotFound } from "@/components/common/NotFound";

// 404 for the signed-in area. This boundary sits inside the (app) layout, so
// it renders with the DashboardShell nav and top bar still around it: a
// student who mistypes a dashboard URL stays inside the product instead of
// being dropped onto a bare page and having to navigate back in.
//
// Reached two ways: any segment that calls notFound(), and the [...unmatched]
// catch-all under each role root, which turns an unknown authenticated URL
// into a notFound() rather than letting it escape to the root not-found.
export default function AppNotFound() {
  return <SignedInNotFound />;
}
