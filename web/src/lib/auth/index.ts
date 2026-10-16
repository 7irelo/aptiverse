/**
 * Auth placeholder. Phase 2 adds Auth.js v5 here: the session config, an
 * encrypted httpOnly cookie holding the API access and refresh tokens, and
 * helpers such as getSession() for Server Components and the BFF proxy.
 */
export type Session = {
  userId: string;
  roles: string[];
};

export async function getSession(): Promise<Session | null> {
  return null;
}
