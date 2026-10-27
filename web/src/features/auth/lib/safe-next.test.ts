import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it.each([
    ["/dashboard/practice", "/dashboard/practice"],
    ["/dashboard?tab=marks#top", "/dashboard?tab=marks#top"],
    ["/onboarding?step=details", "/onboarding?step=details"],
  ])("accepts %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "dashboard",
    "//evil.example",
    "///evil.example",
    "https://evil.example",
    "http:/evil.example",
    "javascript:alert(1)",
    "/\\evil.example",
    "\\\\evil.example",
    "/%2F%2Fevil.example",
    "/%5Cevil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "/api/bff/me",
    "/api",
    "/" + "a".repeat(512),
    "/%E0%A4%A",
  ])("rejects %j", (input) => {
    expect(safeNextPath(input)).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(safeNextPath(undefined)).toBeNull();
    expect(safeNextPath(["/a"])).toBeNull();
    expect(safeNextPath(42)).toBeNull();
  });
});
