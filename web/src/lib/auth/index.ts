/**
 * Auth placeholder. Phase 2 adds Auth.js v5 here: the session config, an
 * encrypted httpOnly cookie holding the API access and refresh tokens, and
 * helpers for Server Components and the BFF proxy.
 *
 * The shell only depends on getSessionUser() and the SessionUser type, so
 * swapping in the real session does not touch any UI.
 */
export {
  DEV_SESSION_COOKIE,
  getSessionUser,
  isRole,
  type Role,
  type SessionUser,
} from "./session-user";
