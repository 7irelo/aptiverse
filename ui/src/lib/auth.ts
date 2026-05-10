// NextAuth configuration — Pattern B (".NET owns users, NextAuth manages
// the session"). All sign-in paths (email/password, Google, Apple) end up
// calling the .NET API and storing the resulting Aptiverse JWT in
// NextAuth's JWT-mode session cookie.

import type { AuthOptions } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_URL =
  process.env.NEXT_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5100";

type AptiverseUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  permissions?: string[];
};

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // Email + password — calls POST /api/auth/login on the .NET API.
    CredentialsProvider({
      name: "Aptiverse",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          // Shape returned by AuthService.LoginUserAsync — TokenDto<UserDto>.
          // System.Text.Json camelCases by default → token, expires, user, message.
          const u: AptiverseUser = data.user;
          return {
            id: u.id,
            email: u.email ?? credentials.email,
            name: u.displayName ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
            // Smuggle the Aptiverse JWT into the NextAuth user object so
            // the jwt callback can copy it onto the session token.
            aptiverseToken: data.token,
            aptiverseUser: u,
          } as never;
        } catch {
          return null;
        }
      },
    }),

    // Google — NextAuth handles the OAuth dance, then the signIn callback
    // exchanges the resulting id_token for an Aptiverse JWT.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Apple — same pattern. The clientSecret here is a *signed JWT* you
    // generate offline using your Apple Developer .p8 key, valid up to 6
    // months. Drop it in APPLE_CLIENT_SECRET. See docs/apple-secret.md.
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    // After OAuth providers complete, exchange the provider's ID token for
    // an Aptiverse JWT and stash it on the user so jwt() can pick it up.
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        const idToken = account.id_token;
        if (!idToken) return false;
        try {
          const res = await fetch(`${API_URL}/api/auth/oauth-exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: account.provider, idToken }),
          });
          if (!res.ok) return false;
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).aptiverseToken = data.token;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).aptiverseUser = data.user;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        if (u.aptiverseToken) token.accessToken = u.aptiverseToken;
        if (u.aptiverseUser) token.aptiverse = u.aptiverseUser;
      }
      return token;
    },

    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken = token.accessToken;
      if (token.aptiverse) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any) = { ...session.user, ...(token.aptiverse as object) };
      }
      return session;
    },
  },
};
