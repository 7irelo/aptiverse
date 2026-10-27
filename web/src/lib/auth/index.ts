/**
 * Auth for Server Components, server actions and route handlers.
 *
 * Pattern B with a backend for frontend: the API owns users and tokens, the
 * tokens live only in the encrypted httpOnly session cookie (src/auth.ts and
 * ./api-session.ts), Server Components call the API server to server and
 * client components go through /api/bff. The browser never holds a token.
 *
 * The shell only depends on getSessionUser() and the SessionUser type.
 */
export { can, requirePermission, requireRole, requireUser } from "./guards";
export { resolveLanding, roleMayOpen, ROLE_HOME } from "./landing";
export {
  DEV_SESSION_COOKIE,
  getCurrentMe,
  getSessionUser,
  isRole,
  mapMeToSessionUser,
  type Role,
  type SessionUser,
} from "./session-user";
