import { vi } from "vitest";

/**
 * Runs code as if on the server: hides `window` so the API fetcher calls
 * API_INTERNAL_URL directly instead of the /api/bff proxy. Restores it
 * before returning so the result can be rendered in jsdom.
 */
export async function onServer<T>(fn: () => Promise<T>): Promise<T> {
  vi.stubGlobal("window", undefined);
  try {
    return await fn();
  } finally {
    vi.unstubAllGlobals();
  }
}
