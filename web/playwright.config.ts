import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against a production build (`next start`) with the API replaced by
 * e2e/mock-api.mjs. Mobile projects come first: most students use phones.
 *
 * Two app servers start:
 * - port 3100 talks to the mock API (happy path)
 * - port 3101 points at a port with nothing listening (API down)
 */
const MOCK_API_PORT = 5199;
const APP_PORT = 3100;
const APP_API_DOWN_PORT = 3101;

// Build once if no production build exists yet (CI builds in an earlier step).
const start = (port: number) =>
  existsSync(".next/BUILD_ID")
    ? `npm run start -- --port ${port}`
    : `npm run build && npm run start -- --port ${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node e2e/mock-api.mjs",
      url: `http://127.0.0.1:${MOCK_API_PORT}/health`,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: start(APP_PORT),
      url: `http://localhost:${APP_PORT}`,
      env: { API_INTERNAL_URL: `http://127.0.0.1:${MOCK_API_PORT}` },
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    {
      command: `npm run start -- --port ${APP_API_DOWN_PORT}`,
      url: `http://localhost:${APP_API_DOWN_PORT}`,
      env: { API_INTERNAL_URL: "http://127.0.0.1:5998" },
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
