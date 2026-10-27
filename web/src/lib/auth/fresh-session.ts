import { isRefreshExpired, needsRefresh, type ApiSession } from "./api-session";
import { refreshOnce, type RefreshFn } from "./refresh";

export type FreshSession =
  | { state: "none" }
  /** Refresh refused or refresh token expired: sign the user out. */
  | { state: "ended" }
  /** The access token expired and the API could not be reached to refresh it. */
  | { state: "unavailable"; session: ApiSession }
  | { state: "valid"; session: ApiSession; rotated: boolean };

/**
 * Returns a session whose access token is good for at least the refresh
 * skew, rotating it when needed. `force` refreshes even a fresh-looking token
 * (used after the API answered 401). When the API is unreachable the current
 * session is kept while its access token still works; an outage never signs
 * anyone out.
 */
export async function ensureFreshSession(
  session: ApiSession | null,
  options: { force?: boolean; refresh?: RefreshFn; now?: number } = {},
): Promise<FreshSession> {
  if (!session) return { state: "none" };
  const now = options.now ?? Date.now();
  if (isRefreshExpired(session, now)) return { state: "ended" };
  if (!options.force && !needsRefresh(session, now)) {
    return { state: "valid", session, rotated: false };
  }

  const outcome = await refreshOnce(session.refreshToken, options.refresh);
  if (outcome.ok) {
    return { state: "valid", session: outcome.session, rotated: true };
  }
  if (outcome.reason === "invalid") return { state: "ended" };
  return session.accessTokenExpiresAt > now && !options.force
    ? { state: "valid", session, rotated: false }
    : { state: "unavailable", session };
}
