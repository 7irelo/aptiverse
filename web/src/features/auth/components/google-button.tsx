import Image from "next/image";

import { Button } from "@/components/ui/button";

import { googleSignInAction } from "../server/actions";

/**
 * "Continue with Google". A plain form posting to a server action, which
 * starts the Auth.js Google flow (state, PKCE and nonce on). The Google "G"
 * is the one non-Lucide mark, required by Google's branding rules, served as
 * a static asset from public/brand.
 */
export function GoogleButton({
  next,
  label = "Continue with Google",
}: {
  next?: string | null;
  label?: string;
}) {
  return (
    <form action={googleSignInAction}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="min-h-11 w-full gap-3 text-base"
      >
        <Image
          src="/brand/google-g.svg"
          alt=""
          width={20}
          height={20}
          unoptimized
        />
        {label}
      </Button>
    </form>
  );
}
