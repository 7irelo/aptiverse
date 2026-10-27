"use client";

import { AuthRouteError } from "@/features/auth/components/auth-error";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <AuthRouteError error={error} retry={retry} route="/forgot-password" />
  );
}
