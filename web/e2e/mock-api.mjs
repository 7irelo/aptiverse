// Minimal stand-in for the Aptiverse API used by Playwright. Pages fetch on
// the server, so browser route interception cannot see those requests;
// instead Next.js is started with API_INTERNAL_URL pointing here.
//
// Auth accounts (password for all: "correct horse battery"):
// - student@example.test: student, onboarding done
// - new@example.test: student, onboarding not done
// - parent@example.test: parent, onboarding done
// - locked@example.test: always answers 429 with Retry-After: 900

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.MOCK_API_PORT ?? 5199);
const faqs = readFileSync(
  new URL("../tests/fixtures/faqs.json", import.meta.url),
  "utf8",
);

const PASSWORD = "correct horse battery";
const ACCOUNTS = {
  "student@example.test": {
    roles: ["student"],
    onboarded: true,
    name: "Thandi Mokoena",
  },
  "new@example.test": {
    roles: ["student"],
    onboarded: false,
    name: "Lwazi Dube",
  },
  "parent@example.test": {
    roles: ["parent"],
    onboarded: true,
    name: "Sipho Mokoena",
  },
};

// access token -> email; refresh token -> email (one use each)
const accessTokens = new Map();
const refreshTokens = new Map();
const onboarding = new Map();

function issue(email) {
  // "eyJ" prefix like a real JWT, so the exposure checks have something to find.
  const accessToken = `eyJmock.${randomUUID()}.access`;
  const refreshToken = `refresh-${randomUUID()}`;
  accessTokens.set(accessToken, email);
  refreshTokens.set(refreshToken, email);
  const account = ACCOUNTS[email];
  return {
    accessToken,
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    refreshToken,
    refreshTokenExpiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    user: {
      id: randomUUID(),
      name: account.name,
      email,
      emailConfirmed: true,
      roles: account.roles,
      onboardingRequired: !(onboarding.get(email) ?? account.onboarded),
    },
  };
}

function me(email) {
  const account = ACCOUNTS[email];
  const done = onboarding.get(email) ?? account.onboarded;
  return {
    id: "6f1c1b3e-7a52-4c1e-9d3c-1f0e2a3b4c5d",
    name: account.name,
    email,
    emailConfirmed: true,
    pendingEmail: null,
    hasPassword: true,
    phoneNumber: null,
    dateOfBirth: null,
    adultConfirmedAt: null,
    roles: account.roles,
    primaryRole: account.roles[0],
    permissions: [],
    entitlements: [],
    isMinor: null,
    onboarding: {
      required: !done,
      completedAt: done ? "2026-10-01T00:00:00Z" : null,
      educationLevel: done ? "high_school" : null,
      grade: null,
      curriculum: null,
      studyLevel: null,
      yearOfStudy: null,
      programme: null,
      institutionName: null,
      dateOfBirth: null,
    },
    consent: {
      termsVersion: "2026-10",
      privacyVersion: "2026-10",
      reconsentRequired: false,
    },
    deletionRequest: null,
    createdAt: "2026-10-01T00:00:00Z",
  };
}

function send(res, status, body, headers = {}) {
  const isProblem = status >= 400;
  res
    .writeHead(status, {
      "content-type": isProblem
        ? "application/problem+json"
        : "application/json",
      ...headers,
    })
    .end(body === undefined ? undefined : JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function caller(req) {
  const auth = req.headers.authorization ?? "";
  return accessTokens.get(auth.replace(/^Bearer /, ""));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const route = `${req.method} ${url.pathname}`;

  switch (route) {
    case "GET /health":
      res.writeHead(200, { "content-type": "text/plain" }).end("ok");
      return;
    case "GET /support/faqs":
      res.writeHead(200, { "content-type": "application/json" }).end(faqs);
      return;
    case "GET /legal/versions":
      send(res, 200, {
        termsVersion: "2026-10",
        privacyVersion: "2026-10",
        termsUrl: "https://aptiverse.test/terms",
        privacyUrl: "https://aptiverse.test/privacy",
        effectiveFrom: "2026-10-01",
      });
      return;
    case "POST /auth/login": {
      const { email, password } = await readJson(req);
      if (email === "locked@example.test") {
        send(
          res,
          429,
          {
            title: "Too many attempts",
            status: 429,
            code: "identity.too_many_attempts",
            retryAfterSeconds: 900,
          },
          { "retry-after": "900" },
        );
        return;
      }
      if (!ACCOUNTS[email] || password !== PASSWORD) {
        send(res, 401, {
          title: "Unauthorized",
          status: 401,
          code: "identity.invalid_credentials",
        });
        return;
      }
      send(res, 200, issue(email));
      return;
    }
    case "POST /auth/forgot-password":
      await readJson(req);
      res.writeHead(202).end();
      return;
    case "POST /auth/refresh": {
      const { refreshToken } = await readJson(req);
      const email = refreshTokens.get(refreshToken);
      if (!email) {
        send(res, 401, { status: 401, code: "identity.refresh_token_invalid" });
        return;
      }
      refreshTokens.delete(refreshToken);
      send(res, 200, issue(email));
      return;
    }
    case "POST /auth/logout": {
      const email = caller(req);
      if (!email) {
        send(res, 401, { status: 401 });
        return;
      }
      res.writeHead(204).end();
      return;
    }
    case "GET /me": {
      const email = caller(req);
      if (!email) {
        send(res, 401, { status: 401 });
        return;
      }
      send(res, 200, me(email));
      return;
    }
    case "POST /me/onboarding/complete": {
      const email = caller(req);
      if (!email) {
        send(res, 401, { status: 401 });
        return;
      }
      onboarding.set(email, true);
      const state = me(email).onboarding;
      send(res, 200, { ...state, missing: [] });
      return;
    }
    case "POST /me/consents": {
      const email = caller(req);
      if (!email) send(res, 401, { status: 401 });
      else res.writeHead(204).end();
      return;
    }
    default:
      send(res, 404, { title: "Not Found", status: 404 });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`mock API listening on http://127.0.0.1:${port}`);
});
