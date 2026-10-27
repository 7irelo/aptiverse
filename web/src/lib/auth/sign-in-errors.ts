import { CredentialsSignin } from "next-auth";

import { ApiError } from "@/lib/api/fetcher";

/**
 * Why a credentials sign-in failed, carried from the Auth.js authorize()
 * callback back to the login server action. `code` is the only part Auth.js
 * would ever put in a URL, so it never says whether an account exists.
 */
export class ApiSignInError extends CredentialsSignin {
  readonly reason: "invalid_credentials" | "too_many_attempts" | "unavailable";
  readonly retryAfterSeconds: number | undefined;
  readonly detail: string | undefined;

  constructor(
    reason: ApiSignInError["reason"],
    extra: { retryAfterSeconds?: number; detail?: string } = {},
  ) {
    super(reason);
    this.code = reason;
    this.reason = reason;
    this.retryAfterSeconds = extra.retryAfterSeconds;
    this.detail = extra.detail;
  }

  static fromApi(error: unknown): ApiSignInError {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 400) {
        return new ApiSignInError("invalid_credentials");
      }
      if (error.status === 429) {
        const detail = error.problem?.detail;
        return new ApiSignInError("too_many_attempts", {
          retryAfterSeconds: error.retryAfterSeconds,
          detail: typeof detail === "string" ? detail : undefined,
        });
      }
    }
    return new ApiSignInError("unavailable");
  }
}
