// NextAuth configuration — Pattern B (".NET owns users, NextAuth manages
// the session"). All sign-in paths (email/password, Google, Apple) end up
// calling the .NET API and storing the resulting Aptiverse JWT in
// NextAuth's JWT-mode session cookie.

import type { AuthOptions } from "next-auth";
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

// Renew this long before the access token actually lapses, so a request
// issued right after a session read cannot arrive with a token that expired
// in transit.
const REFRESH_SKEW_MS = 2 * 60_000;

/** `exp` off a JWT, in ms. Null when the token is unreadable. */
function accessTokenExpiryMs(jwt: string | undefined): number | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(
      padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="),
      "base64",
    ).toString("utf8");
    const claims = JSON.parse(json) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Refresh tokens are single use: the API revokes the one you present and
// hands back a new one. That is what makes a stolen token worth exactly one
// call — but it also means two concurrent refreshes with the SAME token would
// see the second one rejected, and a rejection ends the session. next-auth
// runs this callback per request, and a page can easily read the session from
// several places at once.
//
// So refreshes are de-duplicated by the token being spent: the first caller
// does the network round trip, everyone else awaits the same promise and gets
// the same new pair. The entry is held briefly after it resolves to cover
// requests that arrive a moment later still holding the old token.
const inFlightRefreshes = new Map<string, Promise<JWT>>();
const REFRESH_MEMO_MS = 30_000;

type JWT = Record<string, unknown>;

async function requestRefresh(token: JWT): Promise<JWT> {
  const refreshToken = token.refreshToken as string | undefined;
  // No refresh token at all (a session minted before this shipped, or one
  // already burned). Nothing to do but end it.
  if (!refreshToken) return endSession(token);

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // In the body, never the query string: this is a credential and query
      // strings end up in access logs, history and Referer headers.
      body: JSON.stringify({ refreshToken }),
    });
    // 401 means unknown, expired, or already spent. All three are terminal.
    if (!res.ok) return endSession(token);

    const data = (await res.json()) as {
      token?: string;
      refreshToken?: string;
      user?: AptiverseUser;
    };
    if (!data.token) return endSession(token);

    return {
      ...token,
      accessToken: data.token,
      refreshToken: data.refreshToken ?? refreshToken,
      accessTokenExpires: accessTokenExpiryMs(data.token),
      aptiverse: data.user ?? token.aptiverse,
      error: undefined,
    };
  } catch {
    // The API was unreachable rather than refusing us. Ending the session is
    // still the honest outcome — a half-authenticated state where the app
    // renders as signed in but every call 401s is worse than a sign-in page.
    return endSession(token);
  }
}

/**
 * Terminal state for a session that cannot be renewed. The access token is
 * dropped, so nothing downstream can keep making calls with a dead credential,
 * and `error` is set for the client to act on. Never a half-authenticated
 * session.
 */
function endSession(token: JWT): JWT {
  return {
    ...token,
    accessToken: undefined,
    refreshToken: undefined,
    accessTokenExpires: undefined,
    error: "RefreshAccessTokenError",
  };
}

function refreshAptiverseSession(token: JWT): Promise<JWT> {
  const key = token.refreshToken as string | undefined;
  if (!key) return Promise.resolve(endSession(token));

  const existing = inFlightRefreshes.get(key);
  if (existing) return existing;

  const promise = requestRefresh(token).finally(() => {
    const timer = setTimeout(
      () => inFlightRefreshes.delete(key),
      REFRESH_MEMO_MS,
    ) as unknown as { unref?: () => void };
    // Don't hold the process open for a cache eviction.
    timer.unref?.();
  });
  inFlightRefreshes.set(key, promise);
  return promise;
}

export const authOptions: AuthOptions = {
  // 30 days, deliberately the same number as Jwt:RefreshExpireDays on the API.
  // If the cookie outlived the refresh token the user would sit in a session
  // that cannot renew; if the refresh token outlived the cookie we would be
  // throwing away a credential that was still good.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  // `error` matters as much as `signIn`. Without it, next-auth falls back to
  // its own built-in /api/auth/error, which is an unstyled framework page with
  // none of the product on it. A user who left a tab open overnight met that
  // page rather than a sign-in form, which reads as the app being broken
  // rather than as a session having ended.
  //
  // Sending errors to /login means the recovery is always the thing they
  // needed anyway. The login page reads the ?error= parameter and says what
  // happened.
  //
  // This is the visible half. The underlying cause — POST /api/auth/refresh-token
  // being [Authorize], so refreshing required the very access token it was
  // replacing — is fixed: the jwt callback below now renews against
  // POST /api/auth/refresh, which is anonymous and authenticates on a refresh
  // token instead. The error page still matters, because a refresh token can
  // itself expire or be revoked, and that has to land somewhere sensible.
  pages: { signIn: "/login", error: "/login" },
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
          // Unverified accounts sign in fine — verification is a soft gate
          // enforced inside the app (see VerificationGate), not at login — so
          // there is no special 403 case to handle here.
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
            // The refresh token rides along the same way. It stays inside the
            // encrypted, httpOnly next-auth cookie and is never put on the
            // session object, so browser JavaScript never sees it.
            aptiverseRefreshToken: data.refreshToken,
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
  ],

  callbacks: {
    // After OAuth providers complete, exchange the provider's ID token for
    // an Aptiverse JWT and stash it on the user so jwt() can pick it up.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const idToken = account.id_token;
        if (!idToken) return "/login?error=OAuthFailed";
        try {
          const res = await fetch(`${API_URL}/api/auth/oauth-exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: account.provider, idToken }),
          });
          if (!res.ok) {
            // Invite-only: the API returns 404 when no Aptiverse account is
            // linked to this Google email. Redirect with a specific code so
            // the login page can explain it, versus a generic failure.
            return res.status === 404
              ? "/login?error=OAuthNoAccount"
              : "/login?error=OAuthFailed";
          }
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).aptiverseToken = data.token;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).aptiverseRefreshToken = data.refreshToken;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).aptiverseUser = data.user;
          return true;
        } catch {
          return "/login?error=OAuthFailed";
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Sign-in path — user is populated on first call after authorize().
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        if (u.aptiverseToken) {
          token.accessToken = u.aptiverseToken;
          token.accessTokenExpires = accessTokenExpiryMs(u.aptiverseToken);
        }
        if (u.aptiverseRefreshToken) token.refreshToken = u.aptiverseRefreshToken;
        if (u.aptiverseUser) token.aptiverse = u.aptiverseUser;
        token.error = undefined;
        return token;
      }
      // Refresh path — `useSession().update({ aptiverseToken, aptiverseUser })`
      // fires this with trigger === "update". Lets us swap in a freshly-issued
      // JWT (e.g. after a plan change) without making the user re-login. See
      // useRefreshSession() in lib/hooks/useRefreshSession.ts.
      if (trigger === "update") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = (session ?? {}) as any;
        if (s.aptiverseToken) {
          // A freshly-issued JWT was handed in (e.g. after a plan change).
          token.accessToken = s.aptiverseToken;
          token.accessTokenExpires = accessTokenExpiryMs(s.aptiverseToken);
          if (s.aptiverseUser) token.aptiverse = s.aptiverseUser;
          return token;
        }
        // A bare update() with no token means "pull my state again" — used
        // right after email verification so the soft gate lifts without a
        // re-login. Re-exchange the refresh token, which returns fresh user
        // data including emailConfirmed=true.
        if (token.refreshToken) {
          return (await refreshAptiverseSession(token as JWT)) as typeof token;
        }
        return token;
      }

      // Every other call: keep the access token alive on demand.
      //
      // This is the fix for "logged in too long". The old client-side poll only
      // ran while a tab was awake, and browsers throttle timers in background
      // tabs, so a session left overnight woke up with a lapsed token and no
      // way to renew it. This runs whenever the session is read — including the
      // first read after a laptop lid is opened — and renews from the refresh
      // token, which does not care that the access token has already expired.
      if (token.error) return token; // already dead; don't loop on it
      if (!token.accessToken) return token;
      // Fall back to reading `exp` off the token itself, so a session minted
      // before this shipped (no accessTokenExpires recorded) is judged on its
      // real expiry rather than treated as expired the moment it is read.
      const expiresAt =
        (token.accessTokenExpires as number | undefined) ??
        accessTokenExpiryMs(token.accessToken as string);
      if (expiresAt !== null && Date.now() < expiresAt - REFRESH_SKEW_MS) {
        return token; // still good
      }
      return (await refreshAptiverseSession(token as JWT)) as typeof token;
    },

    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken = token.accessToken;
      // Deliberately NOT the refresh token. It stays in the encrypted, httpOnly
      // cookie: putting it here would hand any XSS a 30 day credential instead
      // of a 4 hour one.
      if (token.error) {
        // The client watches for this and signs out cleanly rather than
        // hammering an API that is only going to keep saying 401.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).error = token.error;
      }
      if (token.aptiverse) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any) = { ...session.user, ...(token.aptiverse as object) };
      }
      return session;
    },
  },
};
