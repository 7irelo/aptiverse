// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { BFF_MAX_BODY_BYTES, handleBff, type BffDeps } from "./handler";

const ORIGIN = "https://app.test";
const TOKEN = "eyJhbGciOiJFUzI1NiJ9.secret-access-token.sig";
const API = "http://api.internal";

type Captured = { url: string; init: RequestInit; headers: Headers };

function setup(
  overrides: Partial<BffDeps> = {},
  respond: (call: Captured) => Response = () =>
    Response.json({ ok: true }, { headers: { "set-cookie": "upstream=1" } }),
) {
  const calls: Captured[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const captured = {
        url: String(input),
        init: init ?? {},
        headers: new Headers(init?.headers),
      };
      calls.push(captured);
      return respond(captured);
    },
  );
  const deps: BffDeps = {
    apiBase: API,
    allowedOrigins: [ORIGIN],
    contextHeaders: { "x-forwarded-for": "198.51.100.7" },
    getToken: async () => ({ state: "valid", accessToken: TOKEN }),
    forceRefresh: async () => ({ state: "ended" }),
    fetch: fetchMock as unknown as typeof fetch,
    ...overrides,
  };
  return { deps, calls, fetchMock };
}

function request(path: string, init: RequestInit = {}) {
  return new Request(`${ORIGIN}/api/bff/${path}`, init);
}

function segmentsOf(path: string) {
  return path
    .split("?")[0]!
    .split("/")
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

const JSON_HEADERS = { origin: ORIGIN, "content-type": "application/json" };

describe("BFF path allowlist", () => {
  it.each([
    "me",
    "me/sessions",
    "academics/catalog",
    "practice/tests",
    "ai/conversations",
    "support/faqs",
  ])("forwards %s", async (path) => {
    const { deps, calls } = setup();
    const response = await handleBff(request(path), segmentsOf(path), deps);
    expect(response.status).toBe(200);
    expect(calls[0]!.url).toBe(`${API}/${path}`);
  });

  it.each([
    "auth/login",
    "auth/refresh",
    "AUTH/refresh",
    "%61uth/logout",
    "x/../auth/login",
    "me/..%2Fauth/login",
    "me%2F..%2Fauth%2Flogin",
    "health",
    ".well-known/jwks.json",
    "admin/users",
    "Me",
    "me/%252e%252e/auth",
    "me%5C..%5Cauth",
  ])("refuses %s with 404 before calling the API", async (path) => {
    const { deps, fetchMock } = setup();
    const response = await handleBff(request(path), segmentsOf(path), deps);
    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a decoded segment that hides a slash", async () => {
    const { deps, fetchMock } = setup();
    const response = await handleBff(
      request("me/x"),
      ["me", "../auth/login"],
      deps,
    );
    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the query string", async () => {
    const { deps, calls } = setup();
    await handleBff(
      request("practice/tests?page=2&size=10"),
      ["practice", "tests"],
      deps,
    );
    expect(calls[0]!.url).toBe(`${API}/practice/tests?page=2&size=10`);
  });
});

describe("BFF headers", () => {
  it("attaches the token server side and strips browser credentials and hop-by-hop headers", async () => {
    const { deps, calls } = setup();
    await handleBff(
      request("me", {
        headers: {
          cookie: "__Host-aptiverse.session=abc; other=1",
          authorization: "Bearer attacker-token",
          connection: "keep-alive",
          "keep-alive": "timeout=5",
          "proxy-authorization": "Basic x",
          te: "trailers",
          upgrade: "h2c",
          "x-forwarded-for": "6.6.6.6",
          "x-forwarded-host": "evil.test",
          accept: "application/json",
          traceparent: "00-abc-def-01",
          "idempotency-key": "k1",
        },
      }),
      ["me"],
      deps,
    );
    const sent = calls[0]!.headers;
    expect(sent.get("authorization")).toBe(`Bearer ${TOKEN}`);
    expect(sent.get("cookie")).toBeNull();
    for (const name of [
      "connection",
      "keep-alive",
      "proxy-authorization",
      "te",
      "upgrade",
      "x-forwarded-host",
      "host",
    ]) {
      expect(sent.get(name)).toBeNull();
    }
    expect(sent.get("x-forwarded-for")).toBe("198.51.100.7");
    expect(sent.get("accept")).toBe("application/json");
    expect(sent.get("traceparent")).toBe("00-abc-def-01");
    expect(sent.get("idempotency-key")).toBe("k1");
  });

  it("forwards anonymously when signed out (public endpoints)", async () => {
    const { deps, calls } = setup({
      getToken: async () => ({ state: "none" }),
    });
    await handleBff(request("support/faqs"), ["support", "faqs"], deps);
    expect(calls[0]!.headers.get("authorization")).toBeNull();
  });

  it("never returns the token or upstream cookies to the browser", async () => {
    const { deps } = setup();
    const response = await handleBff(request("me"), ["me"], deps);
    expect(await response.text()).not.toContain(TOKEN);
    expect(response.headers.get("set-cookie")).toBeNull();
    response.headers.forEach((value) => expect(value).not.toContain(TOKEN));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not forward redirects that would expose the internal API address", async () => {
    const { deps } = setup(
      {},
      () =>
        new Response(null, { status: 302, headers: { location: `${API}/x` } }),
    );
    const response = await handleBff(request("me"), ["me"], deps);
    expect(response.status).toBe(502);
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("BFF CSRF", () => {
  const body = JSON.stringify({ a: 1 });

  it("refuses a cross-site POST", async () => {
    const { deps, fetchMock } = setup();
    const response = await handleBff(
      request("me/consents", {
        method: "POST",
        body,
        headers: {
          origin: "https://evil.test",
          "content-type": "application/json",
        },
      }),
      ["me", "consents"],
      deps,
    );
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a POST with no Origin and no same-origin fetch metadata", async () => {
    const { deps, fetchMock } = setup();
    const response = await handleBff(
      request("me/consents", {
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
      ["me", "consents"],
      deps,
    );
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses an opaque null Origin", async () => {
    const { deps } = setup();
    const response = await handleBff(
      request("me/sessions/1", {
        method: "DELETE",
        headers: { origin: "null" },
      }),
      ["me", "sessions", "1"],
      deps,
    );
    expect(response.status).toBe(403);
  });

  it("accepts a same-origin POST and forwards the body", async () => {
    const { deps, calls } = setup();
    const response = await handleBff(
      request("me/consents", { method: "POST", body, headers: JSON_HEADERS }),
      ["me", "consents"],
      deps,
    );
    expect(response.status).toBe(200);
    expect(new TextDecoder().decode(calls[0]!.init.body as Uint8Array)).toBe(
      body,
    );
  });

  it("accepts Sec-Fetch-Site same-origin when Origin is missing", async () => {
    const { deps } = setup();
    const response = await handleBff(
      request("me/consents", {
        method: "POST",
        body,
        headers: {
          "sec-fetch-site": "same-origin",
          "content-type": "application/json",
        },
      }),
      ["me", "consents"],
      deps,
    );
    expect(response.status).toBe(200);
  });

  it("refuses a cross-site GET", async () => {
    const { deps } = setup();
    const response = await handleBff(
      request("me", { headers: { "sec-fetch-site": "cross-site" } }),
      ["me"],
      deps,
    );
    expect(response.status).toBe(403);
  });
});

describe("BFF request limits", () => {
  it("refuses a body over 1 MB by Content-Length with 413", async () => {
    const { deps, fetchMock } = setup();
    const req = request("me/consents", {
      method: "POST",
      body: "{}",
      headers: JSON_HEADERS,
    });
    req.headers.set("content-length", String(BFF_MAX_BODY_BYTES + 1));
    const response = await handleBff(req, ["me", "consents"], deps);
    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a streamed body that grows past 1 MB", async () => {
    const { deps, fetchMock } = setup();
    const response = await handleBff(
      request("me/consents", {
        method: "POST",
        body: "x".repeat(BFF_MAX_BODY_BYTES + 10),
        headers: JSON_HEADERS,
      }),
      ["me", "consents"],
      deps,
    );
    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses non-JSON bodies", async () => {
    const { deps } = setup();
    const response = await handleBff(
      request("me/consents", {
        method: "POST",
        body: "a=1",
        headers: {
          origin: ORIGIN,
          "content-type": "application/x-www-form-urlencoded",
        },
      }),
      ["me", "consents"],
      deps,
    );
    expect(response.status).toBe(415);
  });

  it("refuses unknown methods", async () => {
    const { deps } = setup();
    const response = await handleBff(
      request("me", { method: "OPTIONS", headers: { origin: ORIGIN } }),
      ["me"],
      deps,
    );
    expect(response.status).toBe(405);
  });
});

describe("BFF session handling", () => {
  it("retries once with a refreshed token after a 401", async () => {
    let count = 0;
    const { deps, calls } = setup(
      {
        forceRefresh: async () => ({
          state: "valid",
          accessToken: "new-token",
        }),
      },
      () =>
        count++ === 0
          ? new Response(null, { status: 401 })
          : Response.json({ ok: true }),
    );
    const response = await handleBff(request("me"), ["me"], deps);
    expect(response.status).toBe(200);
    expect(calls).toHaveLength(2);
    expect(calls[1]!.headers.get("authorization")).toBe("Bearer new-token");
  });

  it("answers 401 problem JSON when the refresh fails", async () => {
    const { deps } = setup({}, () => new Response(null, { status: 401 }));
    const response = await handleBff(request("me"), ["me"], deps);
    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toBe(
      "application/problem+json",
    );
    expect(await response.json()).toMatchObject({ code: "session.ended" });
  });

  it("answers 401 without calling the API when the session has ended", async () => {
    const { deps, fetchMock } = setup({
      getToken: async () => ({ state: "ended" }),
    });
    const response = await handleBff(request("me"), ["me"], deps);
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 502 when the API cannot be reached", async () => {
    const { deps } = setup({}, () => {
      throw new TypeError("fetch failed");
    });
    const response = await handleBff(request("me"), ["me"], deps);
    expect(response.status).toBe(502);
  });
});

describe("BFF streaming", () => {
  it("passes server-sent events through chunk by chunk", async () => {
    const encoder = new TextEncoder();
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        controller = c;
      },
    });
    const { deps } = setup(
      {},
      () =>
        new Response(stream, {
          headers: { "content-type": "text/event-stream" },
        }),
    );
    const response = await handleBff(
      request("ai/conversations/1/messages", {
        method: "POST",
        body: "{}",
        headers: JSON_HEADERS,
      }),
      ["ai", "conversations", "1", "messages"],
      deps,
    );
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get("cache-control")).toBe(
      "no-cache, no-transform",
    );
    expect(response.headers.get("x-accel-buffering")).toBe("no");

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    controller.enqueue(encoder.encode("data: one\n\n"));
    expect(decoder.decode((await reader.read()).value)).toBe("data: one\n\n");
    controller.enqueue(encoder.encode(": heartbeat\n\n"));
    expect(decoder.decode((await reader.read()).value)).toBe(": heartbeat\n\n");
    controller.close();
    expect((await reader.read()).done).toBe(true);
  });

  it("passes the client abort signal to the upstream request", async () => {
    const { deps, calls } = setup();
    const abort = new AbortController();
    await handleBff(request("me", { signal: abort.signal }), ["me"], deps);
    const signal = calls[0]!.init.signal!;
    expect(signal.aborted).toBe(false);
    abort.abort();
    expect(signal.aborted).toBe(true);
  });
});
