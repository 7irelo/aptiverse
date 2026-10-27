// @vitest-environment node
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { BFF_ALLOWED_PREFIXES, resolveBffPath } from "./allowlist";

const spec = JSON.parse(
  readFileSync(
    new URL("../../../openapi/api-spec.json", import.meta.url),
    "utf8",
  ),
) as {
  paths: Record<
    string,
    Record<
      string,
      {
        responses?: Record<
          string,
          { content?: Record<string, { schema?: { $ref?: string } }> }
        >;
      }
    >
  >;
};

const paths = Object.keys(spec.paths);

describe("BFF allowlist against the pinned spec", () => {
  it("every allowed prefix exists in the API", () => {
    for (const prefix of BFF_ALLOWED_PREFIXES) {
      expect(
        paths.some((p) => p === `/${prefix}` || p.startsWith(`/${prefix}/`)),
        prefix,
      ).toBe(true);
    }
  });

  it("no reachable path returns tokens", () => {
    for (const path of paths) {
      const segments = path.slice(1).split("/");
      if (!resolveBffPath(segments, `/api/bff${path}`)) continue;
      for (const operation of Object.values(spec.paths[path]!)) {
        for (const response of Object.values(operation.responses ?? {})) {
          for (const media of Object.values(response.content ?? {})) {
            expect(media.schema?.$ref ?? "", path).not.toMatch(/AuthTokens$/);
          }
        }
      }
    }
  });

  it("refuses every /auth path in the spec", () => {
    for (const path of paths.filter((p) => p.startsWith("/auth"))) {
      expect(
        resolveBffPath(path.slice(1).split("/"), `/api/bff${path}`),
      ).toBeNull();
    }
  });
});
