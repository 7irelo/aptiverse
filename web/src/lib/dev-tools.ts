/**
 * Gate for developer-only surfaces: the /dev/ui component gallery, the mock
 * session switcher at /dev/session and the placeholder session user.
 *
 * On by default in `next dev`. A production build only enables them when
 * APTIVERSE_DEV_TOOLS=1 is set at build and start time, which is how the
 * Playwright and Lighthouse runs see the gallery and the signed-in shell.
 * Never on a Vercel production deployment, whatever the flag says.
 */
export function devToolsEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.APTIVERSE_DEV_TOOLS === "1";
}
