// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiSession } from "./api-session";
import { ensureFreshSession } from "./fresh-session";
import { refreshOnce, resetRefreshState, type RefreshOutcome } from "./refresh";

const NOW = Date.parse("2026-10-27T10:00:00Z");

function session(overrides: Partial<ApiSession> = {}): ApiSession {
  return {
    sub: "user-1",
    accessToken: "access-old",
    accessTokenExpiresAt: NOW - 1_000,
    refreshToken: "refresh-old",
    refreshTokenExpiresAt: NOW + 86_400_000,
    roles: ["student"],
    onboardingRequired: false,
    ...overrides,
  };
}

function rotated(): RefreshOutcome {
  return {
    ok: true,
    session: session({
      accessToken: "access-new",
      accessTokenExpiresAt: NOW + 900_000,
      refreshToken: "refresh-new",
    }),
  };
}

beforeEach(() => resetRefreshState());

describe("refresh lock", () => {
  it("five parallel requests with an expired token make one refresh call", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const refresh = vi.fn(async () => {
      await gate;
      return rotated();
    });

    const results = Promise.all(
      Array.from({ length: 5 }, () =>
        ensureFreshSession(session(), { refresh, now: NOW }),
      ),
    );
    release();
    const outcomes = await results;

    expect(refresh).toHaveBeenCalledTimes(1);
    for (const outcome of outcomes) {
      expect(outcome).toMatchObject({
        state: "valid",
        rotated: true,
        session: { accessToken: "access-new" },
      });
    }
  });

  it("a late request with the old cookie gets the new tokens, not a second refresh", async () => {
    const refresh = vi.fn(async () => rotated());
    await refreshOnce("refresh-old", refresh);
    const late = await refreshOnce("refresh-old", refresh);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(late).toMatchObject({ ok: true });
  });

  it("remembers a refused refresh so parallel requests all sign out", async () => {
    const refresh = vi.fn(async (): Promise<RefreshOutcome> => ({
      ok: false,
      reason: "invalid",
    }));
    const [a, b] = await Promise.all([
      ensureFreshSession(session(), { refresh, now: NOW }),
      ensureFreshSession(session(), { refresh, now: NOW }),
    ]);
    expect(a).toEqual({ state: "ended" });
    expect(b).toEqual({ state: "ended" });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does not remember a transient failure", async () => {
    const refresh = vi
      .fn<(token: string) => Promise<RefreshOutcome>>()
      .mockResolvedValueOnce({ ok: false, reason: "unavailable" })
      .mockResolvedValueOnce(rotated());
    expect(await refreshOnce("refresh-old", refresh)).toEqual({
      ok: false,
      reason: "unavailable",
    });
    expect(await refreshOnce("refresh-old", refresh)).toMatchObject({
      ok: true,
    });
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("treats a thrown refresh as unavailable", async () => {
    const outcome = await refreshOnce("refresh-x", async () => {
      throw new Error("boom");
    });
    expect(outcome).toEqual({ ok: false, reason: "unavailable" });
  });
});

describe("ensureFreshSession", () => {
  it("leaves a fresh token alone", async () => {
    const refresh = vi.fn();
    const fresh = session({ accessTokenExpiresAt: NOW + 600_000 });
    expect(await ensureFreshSession(fresh, { refresh, now: NOW })).toEqual({
      state: "valid",
      session: fresh,
      rotated: false,
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes shortly before expiry", async () => {
    const refresh = vi.fn(async () => rotated());
    const soon = session({ accessTokenExpiresAt: NOW + 30_000 });
    const result = await ensureFreshSession(soon, { refresh, now: NOW });
    expect(result).toMatchObject({ state: "valid", rotated: true });
  });

  it("ends a session whose refresh token has expired without calling the API", async () => {
    const refresh = vi.fn();
    const result = await ensureFreshSession(
      session({ refreshTokenExpiresAt: NOW - 1 }),
      { refresh, now: NOW },
    );
    expect(result).toEqual({ state: "ended" });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("an API outage with an expired token is unavailable, not a sign-out", async () => {
    const result = await ensureFreshSession(session(), {
      refresh: async () => ({ ok: false, reason: "unavailable" }),
      now: NOW,
    });
    expect(result.state).toBe("unavailable");
  });

  it("returns none without a session", async () => {
    expect(await ensureFreshSession(null)).toEqual({ state: "none" });
  });
});
