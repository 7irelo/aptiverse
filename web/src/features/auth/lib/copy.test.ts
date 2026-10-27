import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/fetcher";

import { problemFieldErrors, tooManyMessage, waitCopy } from "./form-state";
import { loginReasonCopy } from "./login-reasons";
import { maskEmail } from "./mask-email";
import { oauthErrorCopy } from "./oauth-errors";
import { looksLikeOneTimeToken } from "./one-time-token";
import {
  newPasswordSchema,
  PASSWORD_MIN_LENGTH,
  passwordHint,
} from "./password-policy";

describe("too many attempts copy", () => {
  const fallback = (wait: string) => `Too many attempts. Try again in ${wait}.`;

  it("uses Retry-After for the wait, never a hardcoded number", () => {
    expect(tooManyMessage(undefined, 900, fallback)).toBe(
      "Too many attempts. Try again in 15 minutes.",
    );
    expect(tooManyMessage(undefined, 30, fallback)).toBe(
      "Too many attempts. Try again in 1 minute.",
    );
  });

  it("shows the API detail verbatim, plus the wait", () => {
    expect(tooManyMessage("Slow down.", 120, fallback)).toBe(
      "Slow down. You can try again in 2 minutes.",
    );
    expect(tooManyMessage("Slow down.", undefined, fallback)).toBe(
      "Slow down.",
    );
  });

  it("falls back to a few minutes without Retry-After", () => {
    expect(waitCopy(undefined)).toBe("a few minutes");
  });

  it("reads retryAfterSeconds from the problem when the header is missing", () => {
    const error = new ApiError(
      429,
      { code: "identity.too_many_attempts", retryAfterSeconds: 61 },
      "/auth/login",
    );
    expect(error.retryAfterSeconds).toBe(61);
    expect(error.code).toBe("identity.too_many_attempts");
  });
});

describe("problem field errors", () => {
  it("maps API field names to form fields", () => {
    const error = new ApiError(
      400,
      { errors: { Password: ["Too short."], institutionName: ["Too long."] } },
      "/x",
    );
    expect(problemFieldErrors(error)).toEqual({
      password: ["Too short."],
      institutionName: ["Too long."],
    });
  });
});

describe("auth copy", () => {
  it("maps allowlisted reasons and ignores others", () => {
    expect(loginReasonCopy("session-expired")).toBe(
      "Your session ended, so please log in again.",
    );
    expect(loginReasonCopy("<script>")).toBeNull();
    expect(loginReasonCopy("toString")).toBeNull();
  });

  it("maps oauth error codes with a safe fallback", () => {
    expect(oauthErrorCopy("OAuthNoAccount")?.link?.href).toBe("/register");
    expect(oauthErrorCopy("GoogleFailed")?.message).toMatch(/Google/);
    expect(oauthErrorCopy("anything-else")?.message).toBe(
      "Your session ended. Log in again to continue.",
    );
    expect(oauthErrorCopy("constructor")?.message).toBe(
      "Your session ended. Log in again to continue.",
    );
    expect(oauthErrorCopy(undefined)).toBeNull();
  });

  it("masks an email", () => {
    expect(maskEmail("thandi@gmail.com")).toBe("t***@gmail.com");
    expect(maskEmail("nope")).toBe("***");
  });

  it("checks one-time token shape", () => {
    expect(looksLikeOneTimeToken("test-token-not-a-secret-0000")).toBe(true);
    expect(looksLikeOneTimeToken("short")).toBe(false);
    expect(looksLikeOneTimeToken("has spaces in it and more")).toBe(false);
    expect(looksLikeOneTimeToken(["array"])).toBe(false);
  });
});

describe("password policy", () => {
  it("matches the API: 10 to 128 characters, no composition rules", () => {
    expect(passwordHint).toContain(`${PASSWORD_MIN_LENGTH} characters`);
    expect(newPasswordSchema.safeParse("a".repeat(9)).success).toBe(false);
    expect(newPasswordSchema.safeParse("aaaaaaaaaa").success).toBe(true);
    expect(newPasswordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });
});
