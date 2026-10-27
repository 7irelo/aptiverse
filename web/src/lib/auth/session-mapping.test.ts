// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { MeResponse } from "@/lib/api/generated/model";
import { GetMeResponse } from "@/lib/api/generated/zod/identity/identity.zod";

import { resolveLanding, roleMayOpen } from "./landing";
import { mapMeToSessionUser, primaryRole } from "./map-me";
import { decideRoute } from "./route-guard";

function me(overrides: Partial<MeResponse> = {}): MeResponse {
  return GetMeResponse.parse({
    id: "6f1c1b3e-7a52-4c1e-9d3c-1f0e2a3b4c5d",
    name: "Thandi Mokoena",
    email: "thandi@example.test",
    emailConfirmed: false,
    pendingEmail: null,
    hasPassword: true,
    phoneNumber: null,
    dateOfBirth: null,
    adultConfirmedAt: null,
    roles: ["student"],
    primaryRole: "student",
    permissions: ["billing.manage"],
    entitlements: ["ai-tutor"],
    isMinor: null,
    onboarding: {
      required: true,
      completedAt: null,
      educationLevel: "tertiary",
      grade: null,
      curriculum: null,
      studyLevel: null,
      yearOfStudy: null,
      programme: null,
      institutionName: null,
      dateOfBirth: null,
    },
    consent: {
      termsVersion: "1",
      privacyVersion: "1",
      reconsentRequired: false,
    },
    deletionRequest: null,
    createdAt: "2026-10-01T00:00:00Z",
    ...overrides,
  });
}

describe("mapMeToSessionUser", () => {
  it("maps /me to the session user", () => {
    expect(mapMeToSessionUser(me())).toEqual({
      id: "6f1c1b3e-7a52-4c1e-9d3c-1f0e2a3b4c5d",
      name: "Thandi Mokoena",
      email: "thandi@example.test",
      emailConfirmed: false,
      role: "student",
      roles: ["student"],
      permissions: ["billing.manage"],
      entitlements: ["ai-tutor"],
      onboardingRequired: true,
      educationLevel: "tertiary",
    });
  });

  it("prefers the API primary role when the account holds it", () => {
    const user = mapMeToSessionUser(
      me({ roles: ["parent", "admin"], primaryRole: "parent" }),
    );
    expect(user?.role).toBe("parent");
    expect(user?.roles).toEqual(["parent", "admin"]);
  });

  it("falls back to the highest role held when primaryRole is missing or not held", () => {
    expect(primaryRole(["student", "admin"], null)).toBe("admin");
    expect(primaryRole(["student"], "admin")).toBe("student");
  });

  it("returns null for an account with no role the web app knows", () => {
    expect(
      mapMeToSessionUser(me({ roles: ["tutor"], primaryRole: "tutor" })),
    ).toBeNull();
  });

  it("drops an unknown education level", () => {
    const user = mapMeToSessionUser(
      me({ onboarding: { ...me().onboarding, educationLevel: "primary" } }),
    );
    expect(user?.educationLevel).toBeNull();
  });
});

describe("resolveLanding", () => {
  it("sends each role home", () => {
    expect(
      resolveLanding({
        role: "student",
        roles: ["student"],
        onboardingRequired: false,
      }),
    ).toBe("/dashboard");
    expect(
      resolveLanding({
        role: "parent",
        roles: ["parent"],
        onboardingRequired: false,
      }),
    ).toBe("/parent");
    expect(
      resolveLanding({
        role: "admin",
        roles: ["admin"],
        onboardingRequired: false,
      }),
    ).toBe("/admin");
  });

  it("sends students and parents to onboarding first, never admins", () => {
    expect(
      resolveLanding({
        role: "student",
        roles: ["student"],
        onboardingRequired: true,
        next: "/dashboard/practice",
      }),
    ).toBe("/onboarding");
    expect(
      resolveLanding({
        role: "parent",
        roles: ["parent"],
        onboardingRequired: true,
      }),
    ).toBe("/onboarding");
    expect(
      resolveLanding({
        role: "admin",
        roles: ["admin"],
        onboardingRequired: true,
      }),
    ).toBe("/admin");
  });

  it("honours a next the role may open and refuses one it may not", () => {
    expect(
      resolveLanding({
        role: "student",
        roles: ["student"],
        onboardingRequired: false,
        next: "/dashboard/practice",
      }),
    ).toBe("/dashboard/practice");
    expect(
      resolveLanding({
        role: "parent",
        roles: ["parent"],
        onboardingRequired: false,
        next: "/admin/users",
      }),
    ).toBe("/parent");
    expect(roleMayOpen(["student"], "/help")).toBe(true);
    expect(roleMayOpen(["student"], "/admin")).toBe(false);
  });
});

describe("decideRoute", () => {
  const student = {
    state: "valid" as const,
    roles: ["student"],
    onboardingRequired: false,
  };

  it("leaves public paths alone", () => {
    expect(decideRoute("/help", "", { state: "none" })).toEqual({
      action: "next",
    });
  });

  it("sends signed-out visitors to login with a safe next", () => {
    expect(
      decideRoute("/dashboard/practice", "?tab=2", { state: "none" }),
    ).toEqual({
      action: "redirect",
      to: "/login?next=%2Fdashboard%2Fpractice%3Ftab%3D2",
    });
  });

  it("says the session expired when the refresh was refused", () => {
    expect(decideRoute("/dashboard", "", { state: "ended" })).toEqual({
      action: "redirect",
      to: "/login?reason=session-expired&next=%2Fdashboard",
    });
  });

  it("sends unfinished students to onboarding, and lets them stay there", () => {
    const incomplete = { ...student, onboardingRequired: true };
    expect(decideRoute("/dashboard", "", incomplete)).toEqual({
      action: "redirect",
      to: "/onboarding",
    });
    expect(decideRoute("/onboarding", "?step=details", incomplete)).toEqual({
      action: "next",
    });
  });

  it("sends finished students away from onboarding", () => {
    expect(decideRoute("/onboarding", "", student)).toEqual({
      action: "redirect",
      to: "/dashboard",
    });
  });

  it("keeps each role in its own area", () => {
    expect(decideRoute("/admin", "", student)).toEqual({
      action: "redirect",
      to: "/dashboard",
    });
    expect(
      decideRoute("/dashboard", "", {
        state: "valid",
        roles: ["parent"],
        onboardingRequired: false,
      }),
    ).toEqual({ action: "redirect", to: "/parent" });
    expect(decideRoute("/dashboard/x", "", student)).toEqual({
      action: "next",
    });
    expect(
      decideRoute("/admin/users", "", {
        state: "valid",
        roles: ["admin"],
        onboardingRequired: true,
      }),
    ).toEqual({ action: "next" });
  });
});
