import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // server-only throws outside the react-server condition; tests run it as plain code.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/empty.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    env: { API_INTERNAL_URL: "http://api.test" },
    css: false,
  },
});
