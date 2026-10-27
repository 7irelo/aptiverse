import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy without nonces. Nonces need every page rendered
 * per request, and Next.js says nonce CSP is incompatible with Partial
 * Prerendering (cacheComponents), whose static shells cannot carry a
 * per-request nonce. Next.js injects small inline scripts, so script-src
 * keeps 'unsafe-inline' until that changes; every other directive is strict.
 * The browser never holds an API token (BFF), which limits what an injected
 * script could steal.
 *
 * form-action allows accounts.google.com because "Continue with Google"
 * posts to Auth.js, which redirects there, and browsers apply form-action to
 * that redirect.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.ingest.sentry.io",
    "https://*.ingest.us.sentry.io",
    "https://*.ingest.de.sentry.io",
    "https://vitals.vercel-insights.com",
    isDev ? "ws: wss:" : "",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** Pages that carry one-time tokens in the URL never leak them as a Referer. */
const tokenPageHeaders = [{ key: "Referrer-Policy", value: "no-referrer" }];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/reset-password", headers: tokenPageHeaders },
      { source: "/verify-email", headers: tokenPageHeaders },
    ];
  },
};

// Source maps upload only when SENTRY_AUTH_TOKEN is present (CI on Vercel).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
