import NextAuth, { type NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { ApiError } from "@/lib/api/fetcher";
import {
  login,
  signInWithGoogle,
} from "@/lib/api/generated/endpoints/identity/identity";
import {
  LoginBody,
  LoginResponse,
  SignInWithGoogleResponse,
} from "@/lib/api/generated/zod/identity/identity.zod";
import { sessionFromTokens, type ApiSession } from "@/lib/auth/api-session";
import { upstreamContextHeaders } from "@/lib/auth/client-ip";
import {
  authSecrets,
  secureCookiesEnabled,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth/config";
import { ApiSignInError } from "@/lib/auth/sign-in-errors";
import { safeNextPath } from "@/features/auth/lib/safe-next";

/**
 * Auth.js v5. The API owns users and tokens; Auth.js only runs the sign-in
 * flows and keeps the API's access and refresh tokens in its encrypted,
 * httpOnly session cookie (JWT strategy, no database).
 *
 * - Credentials: authorize() calls POST /auth/login server side.
 * - Google: the Google ID token is exchanged at POST /auth/google; the web
 *   tier never trusts the Google token itself.
 *
 * Token refresh does not happen here. It happens in proxy.ts, the BFF and
 * server actions (src/lib/auth/session-store.ts), the only places that can
 * write the rotated tokens back to the cookie. The session callback exposes
 * no token: /api/auth/session is readable by browser JavaScript.
 */

type WithApiSession = { apiSession?: ApiSession };

const googleConfigured =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

function googleErrorPath(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) return "/login?error=OAuthNoAccount";
    if (error.status === 409) return "/login?error=GoogleEmailUnverified";
  }
  return "/login?error=GoogleFailed";
}

function authConfig() {
  return {
    // Behind Vercel or a load balancer the host comes from forwarded headers.
    trustHost: true,
    secret: authSecrets(),
    session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
    useSecureCookies: secureCookiesEnabled(),
    cookies: {
      sessionToken: {
        name: sessionCookieName(),
        options: sessionCookieOptions(),
      },
    },
    pages: { signIn: "/login", error: "/login" },
    providers: [
      Credentials({
        credentials: { email: {}, password: {} },
        async authorize(credentials, request) {
          const parsed = LoginBody.safeParse(credentials);
          if (!parsed.success) throw new ApiSignInError("invalid_credentials");
          try {
            const tokens = LoginResponse.parse(
              await login(parsed.data, {
                cache: "no-store",
                headers: upstreamContextHeaders(request.headers),
              }),
            );
            const user: { id: string } & WithApiSession = {
              id: tokens.user.id,
              apiSession: sessionFromTokens(tokens),
            };
            return user;
          } catch (error) {
            throw ApiSignInError.fromApi(error);
          }
        },
      }),
      ...(googleConfigured
        ? [
            Google({
              clientId: process.env.AUTH_GOOGLE_ID,
              clientSecret: process.env.AUTH_GOOGLE_SECRET,
              checks: ["pkce", "state", "nonce"],
            }),
          ]
        : []),
    ],
    callbacks: {
      async signIn({ account }) {
        if (account?.provider !== "google") return true;
        if (!account.id_token) return "/login?error=GoogleFailed";
        try {
          const tokens = SignInWithGoogleResponse.parse(
            await signInWithGoogle(
              { idToken: account.id_token },
              { cache: "no-store" },
            ),
          );
          // Auth.js passes this same account object to the jwt callback.
          (account as WithApiSession).apiSession = sessionFromTokens(tokens);
          return true;
        } catch (error) {
          return googleErrorPath(error);
        }
      },
      async jwt({ token, user, account }) {
        const fresh =
          (user as WithApiSession | undefined)?.apiSession ??
          (account as WithApiSession | null | undefined)?.apiSession;
        // Sign-in: replace the default token (name, email, picture) with only
        // what the session needs, which keeps the cookie small.
        if (fresh) return { ...fresh };
        return token;
      },
      async session({ session }) {
        return { expires: session.expires, user: { id: "" } } as typeof session;
      },
      async redirect({ url, baseUrl }) {
        const relative = url.startsWith(baseUrl)
          ? url.slice(baseUrl.length)
          : url;
        return `${baseUrl}${safeNextPath(relative) ?? "/login"}`;
      },
    },
    logger: {
      error(error) {
        // Failed sign-ins are expected and recorded by the API as security
        // events; logging them here would only add noise (and never PII).
        if (error instanceof CredentialsSignin) return;
        console.error(`[auth] ${error.name}: ${error.message}`);
      },
    },
  } satisfies NextAuthConfig;
}

// A function config: AUTH_SECRET is read per request, not at build time.
export const { handlers, signIn, signOut } = NextAuth(() => authConfig());
