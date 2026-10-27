import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { signOutAction } from "../server/actions";

/**
 * Signs out: the server action revokes the session at the API, clears the
 * cookie and lands on /login?reason=signed-out with a full navigation.
 */
export function SignOutButton({
  label = "Log out",
  variant = "outline",
}: {
  label?: string;
  variant?: "outline" | "ghost";
}) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant={variant} className="min-h-11 w-full">
        <LogOut aria-hidden="true" />
        {label}
      </Button>
    </form>
  );
}
