// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { decodeSession, encodeSession, sessionFromTokens } from "./api-session";

// A realistic pair: an ES256 JWT access token (about 900 bytes with claims)
// and a 43 character base64url refresh token.
const accessToken = `eyJhbGciOiJFUzI1NiIsImtpZCI6ImtleS0yMDI2LTEwIiwidHlwIjoiSldUIn0.${Buffer.from(
  JSON.stringify({
    sub: "6f1c1b3e-7a52-4c1e-9d3c-1f0e2a3b4c5d",
    sid: "0d5c4b3a-2f1e-4d3c-8b7a-6f5e4d3c2b1a",
    roles: ["student", "parent"],
    perm: Array.from({ length: 12 }, (_, i) => `permission.number.${i}`),
    iss: "https://api.aptiverse.co.za",
    aud: "aptiverse-web",
    iat: 1_793_000_000,
    exp: 1_793_000_900,
  }),
).toString("base64url")}.${"s".repeat(86)}`;

const tokens = {
  accessToken,
  accessTokenExpiresAt: "2026-10-27T10:15:00Z",
  refreshToken: "test-token-not-a-secret-0000",
  refreshTokenExpiresAt: "2026-11-26T10:00:00Z",
  user: {
    id: "6f1c1b3e-7a52-4c1e-9d3c-1f0e2a3b4c5d",
    name: "Thandi Mokoena",
    email: "thandi@example.test",
    emailConfirmed: true,
    roles: ["student", "parent"],
    onboardingRequired: false,
  },
};

const original = { ...process.env };
beforeEach(() => {
  process.env.AUTH_SECRET = "test-auth-secret-not-a-real-value-0000000";
});
afterEach(() => {
  process.env = { ...original };
});

describe("session cookie", () => {
  it("keeps only what the session needs (no name or email)", () => {
    const session = sessionFromTokens(tokens);
    expect(Object.keys(session).sort()).toEqual(
      [
        "accessToken",
        "accessTokenExpiresAt",
        "onboardingRequired",
        "refreshToken",
        "refreshTokenExpiresAt",
        "roles",
        "sub",
      ].sort(),
    );
  });

  it("round trips through encryption and stays under 4 KB", async () => {
    const session = sessionFromTokens(tokens);
    const encoded = await encodeSession({
      ...session,
      refreshTokenExpiresAt: Date.now() + 86_400_000,
    });
    expect(encoded.length).toBeLessThan(4000);
    expect(encoded).not.toContain(session.accessToken);
    expect(encoded).not.toContain(session.refreshToken);
    const decoded = await decodeSession(encoded);
    expect(decoded?.accessToken).toBe(session.accessToken);
    expect(decoded?.refreshToken).toBe(session.refreshToken);
  });

  it("rejects tampered or foreign cookies", async () => {
    const encoded = await encodeSession({
      ...sessionFromTokens(tokens),
      refreshTokenExpiresAt: Date.now() + 86_400_000,
    });
    expect(await decodeSession(`${encoded.slice(0, -4)}AAAA`)).toBeNull();
    process.env.AUTH_SECRET = "a-different-secret-entirely-9876543210";
    expect(await decodeSession(encoded)).toBeNull();
    expect(await decodeSession("not-a-jwe")).toBeNull();
    expect(await decodeSession(undefined)).toBeNull();
  });

  it("decodes with an older secret during rotation", async () => {
    process.env.AUTH_SECRET = "old-secret-with-enough-entropy-012345678";
    const encoded = await encodeSession({
      ...sessionFromTokens(tokens),
      refreshTokenExpiresAt: Date.now() + 86_400_000,
    });
    process.env.AUTH_SECRET =
      "new-secret-with-enough-entropy-876543210,old-secret-with-enough-entropy-012345678";
    expect((await decodeSession(encoded))?.sub).toBe(tokens.user.id);
  });
});
