// Module augmentation so `session.accessToken` and the Aptiverse-shaped
// user (role, permissions) are typed across the UI.

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: DefaultSession["user"] & {
      id?: string;
      role?: string;
      permissions?: string[];
      firstName?: string;
      lastName?: string;
      // Whether the email is verified. Drives the soft verification gate.
      emailConfirmed?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    aptiverse?: {
      id?: string;
      email?: string;
      role?: string;
      permissions?: string[];
      firstName?: string;
      lastName?: string;
      displayName?: string;
      emailConfirmed?: boolean;
    };
  }
}
