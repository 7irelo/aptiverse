// Custom Playwright + BDD fixtures shared across feature files.
//
//   api       — an authenticated API client that talks to the .NET API
//               directly. Resolves the user's role from the Playwright
//               project name (student / parent / teacher / tutor) and
//               logs that user in. Used for cleanup + ground-truth
//               assertions.
//   apiToken  — the raw Bearer token from /api/auth/login. Cached per
//               worker.

import { expect, type APIRequestContext } from "@playwright/test";
import { test as base, createBdd } from "playwright-bdd";
import { emailFor, passwordFor, type Role } from "./test-accounts";

type ApiClient = {
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body?: unknown) => Promise<T>;
  delete: (path: string) => Promise<void>;
};

type Fixtures = {
  api: ApiClient;
  apiToken: string;
};

function apiBaseUrl(): string {
  return process.env.E2E_API_BASE_URL ?? "http://localhost:5100";
}

function credentialsFor(projectName: string): { email: string; password: string } {
  const role = projectName.toLowerCase() as Role;
  return { email: emailFor(role), password: passwordFor(role) };
}

async function loginAndGetToken(
  request: APIRequestContext,
  email: string,
  pw: string,
): Promise<string> {
  const res = await request.post(`${apiBaseUrl()}/api/auth/login`, {
    data: { email, password: pw },
  });
  expect(res.ok(), `login failed for ${email}: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  const token: string | undefined = body.accessToken ?? body.token ?? body.access_token;
  if (!token) throw new Error(`No accessToken in login response: ${JSON.stringify(body)}`);
  return token;
}

function makeClient(request: APIRequestContext, token: string): ApiClient {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const url = (p: string) => `${apiBaseUrl()}${p}`;

  // Tolerant body parser — handles 204 No Content and any other empty
  // response (the .NET API returns NoContent from /me/reset, DELETE, etc.).
  async function parseOrUndefined<T>(r: Awaited<ReturnType<typeof request.get>>): Promise<T> {
    if (r.status() === 204) return undefined as T;
    const text = await r.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch (err) {
      throw new Error(`Failed to parse JSON response: ${err}. Body: ${text.slice(0, 200)}`);
    }
  }

  return {
    async get<T>(p: string) {
      const r = await request.get(url(p), { headers });
      expect(r.ok(), `GET ${p} -> ${r.status()}: ${await r.text()}`).toBeTruthy();
      return parseOrUndefined<T>(r);
    },
    async post<T>(p: string, body?: unknown) {
      const r = await request.post(url(p), { headers, data: body ?? {} });
      expect(r.ok(), `POST ${p} -> ${r.status()}: ${await r.text()}`).toBeTruthy();
      return parseOrUndefined<T>(r);
    },
    async patch<T>(p: string, body?: unknown) {
      const r = await request.patch(url(p), { headers, data: body ?? {} });
      expect(r.ok(), `PATCH ${p} -> ${r.status()}: ${await r.text()}`).toBeTruthy();
      return parseOrUndefined<T>(r);
    },
    async delete(p: string) {
      const r = await request.delete(url(p), { headers });
      expect(r.ok(), `DELETE ${p} -> ${r.status()}: ${await r.text()}`).toBeTruthy();
    },
  };
}

export const test = base.extend<Fixtures>({
  apiToken: async ({ request }, use, testInfo) => {
    const { email, password } = credentialsFor(testInfo.project.name);
    const token = await loginAndGetToken(request, email, password);
    await use(token);
  },
  api: async ({ request, apiToken }, use) => {
    await use(makeClient(request, apiToken));
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
