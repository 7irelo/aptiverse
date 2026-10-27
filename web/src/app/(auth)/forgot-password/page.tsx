import type { Metadata } from "next";

import { AuthHeading } from "@/features/auth/components/auth-page";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Get a link to choose a new Aptiverse password.",
};

/** Signed-in visitors are not redirected: they may still want a reset. */
export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        title="Reset your password"
        description="Enter the email you use for Aptiverse and we will send you a link to choose a new password."
      />
      <ForgotPasswordForm />
    </>
  );
}
