/**
 * The one HTTP client for the Aptiverse API. Orval's generated functions and
 * TanStack Query hooks all call through here (see orval.config.ts).
 *
 * - On the server (Server Components, route handlers) requests go straight to
 *   the API at API_INTERNAL_URL.
 * - In the browser requests go through the Next.js BFF proxy at /api/bff, so
 *   the browser never talks to the API directly and never holds a token.
 */

export const BFF_PREFIX = "/api/bff";

/** Problem details body as returned by the ASP.NET Core API (RFC 9457). */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | undefined;
  /** Seconds to wait, from Retry-After or the problem's retryAfterSeconds. */
  readonly retryAfterSeconds: number | undefined;

  constructor(
    status: number,
    problem: ProblemDetails | undefined,
    url: string,
    retryAfterSeconds?: number,
  ) {
    super(
      problem?.title ?? `API request to ${url} failed with status ${status}`,
    );
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
    const fromProblem = problem?.retryAfterSeconds;
    this.retryAfterSeconds =
      retryAfterSeconds ??
      (typeof fromProblem === "number" && fromProblem >= 0
        ? Math.ceil(fromProblem)
        : undefined);
  }

  /** The API's machine readable code, for example "identity.token_invalid". */
  get code(): string | undefined {
    const code = this.problem?.code;
    return typeof code === "string" ? code : undefined;
  }
}

/** Parses a Retry-After header given in seconds. HTTP dates are ignored. */
export function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0
    ? Math.ceil(seconds)
    : undefined;
}

export function resolveBaseUrl(): string {
  if (typeof window === "undefined") {
    const url = process.env.API_INTERNAL_URL;
    if (!url) {
      throw new Error(
        "API_INTERNAL_URL is not set. Copy .env.example to .env.local and point it at the API.",
      );
    }
    return url.replace(/\/+$/, "");
  }
  return BFF_PREFIX;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) return JSON.parse(text) as unknown;
  return text;
}

export async function apiFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const target = `${resolveBaseUrl()}${url}`;
  const headers = new Headers(init.headers);
  if (!headers.has("accept")) headers.set("accept", "application/json");

  const response = await fetch(target, { ...init, headers });
  const body = await readBody(response);

  if (!response.ok) {
    const problem =
      body && typeof body === "object" ? (body as ProblemDetails) : undefined;
    throw new ApiError(
      response.status,
      problem,
      url,
      parseRetryAfter(response.headers.get("retry-after")),
    );
  }

  return body as T;
}

export default apiFetch;
