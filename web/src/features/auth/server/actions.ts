"use server";

import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { ApiError } from "@/lib/api/fetcher";
import {
  forgotPassword,
  logout,
  register,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "@/lib/api/generated/endpoints/identity/identity";
import {
  RegisterBody,
  RegisterResponse,
} from "@/lib/api/generated/zod/identity/identity.zod";
import { sessionFromTokens } from "@/lib/auth/api-session";
import { resolveLanding } from "@/lib/auth/landing";
import { primaryRole } from "@/lib/auth/map-me";
import {
  clearSession,
  readSession,
  SessionEndedError,
  visitorHeaders,
  withAccessToken,
  writeSession,
} from "@/lib/auth/session-store";
import { ApiSignInError } from "@/lib/auth/sign-in-errors";

import {
  errorState,
  isApiStatus,
  problemDetail,
  problemFieldErrors,
  rateLimitBanner,
  tooManyMessage,
  type FormBanner,
  type FormState,
} from "../lib/form-state";
import { looksLikeOneTimeToken } from "../lib/one-time-token";
import {
  emailSchema,
  EMAIL_MESSAGE,
  newPasswordSchema,
} from "../lib/password-policy";
import { safeNextPath } from "../lib/safe-next";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** With JavaScript the client does a full page load; without, we redirect. */
function finish(formData: FormData, to: string): FormState {
  if (field(formData, "js") === "1") {
    return { status: "success", redirectTo: to, at: Date.now() };
  }
  redirect(to);
}

const RESET_LINK = { href: "/forgot-password", label: "Reset your password" };

// Log in

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = emailSchema.safeParse(field(formData, "email"));
  const password = field(formData, "password");
  const fieldErrors: Record<string, string[]> = {};
  if (!email.success) fieldErrors.email = [EMAIL_MESSAGE];
  if (!password) fieldErrors.password = ["Enter your password."];
  if (!email.success || !password) return errorState(undefined, fieldErrors);

  try {
    await signIn("credentials", {
      email: email.data,
      password,
      redirect: false,
    });
  } catch (error) {
    if (!(error instanceof ApiSignInError)) {
      return errorState({
        tone: "error",
        message:
          "We could not log you in just now. This is on our side, not yours. Try again in a moment.",
      });
    }
    switch (error.reason) {
      case "invalid_credentials":
        return {
          ...errorState({
            tone: "error",
            message:
              "That email and password do not match. Check them and try again, or reset your password.",
            link: RESET_LINK,
          }),
          resetFields: ["password"],
        };
      case "too_many_attempts":
        return errorState({
          tone: "error",
          message: tooManyMessage(
            error.detail,
            error.retryAfterSeconds,
            (wait) =>
              `Too many attempts. Try again in ${wait}, or reset your password now.`,
          ),
          link: RESET_LINK,
        });
      default:
        return errorState({
          tone: "error",
          message:
            "We could not log you in just now. This is on our side, not yours. Try again in a moment.",
        });
    }
  }

  const session = await readSession();
  const role = session ? primaryRole(session.roles) : null;
  const landing =
    session && role
      ? resolveLanding({
          role,
          roles: session.roles,
          onboardingRequired: session.onboardingRequired,
          next: safeNextPath(field(formData, "next")),
        })
      : "/dashboard";
  return finish(formData, landing);
}

// Google

export async function googleSignInAction(formData: FormData): Promise<void> {
  const next = safeNextPath(field(formData, "next")) ?? "/dashboard";
  await signIn("google", { redirectTo: next });
}

// Sign up

const SIGNUP_ROLES = new Set(["student", "parent"]);

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const fieldErrors: Record<string, string[]> = {};
  const name = field(formData, "name").trim();
  const email = emailSchema.safeParse(field(formData, "email"));
  const password = newPasswordSchema.safeParse(field(formData, "password"));
  const role = field(formData, "role");

  if (!name) fieldErrors.name = ["Enter your name."];
  else if (name.length > 120)
    fieldErrors.name = ["Use 120 characters or fewer."];
  if (!email.success) fieldErrors.email = [EMAIL_MESSAGE];
  if (!password.success) {
    fieldErrors.password = password.error.issues.map((i) => i.message);
  }
  if (field(formData, "consent") !== "on") {
    fieldErrors.consent = [
      "Please agree to the Terms and Privacy Policy to continue.",
    ];
  }
  if (!SIGNUP_ROLES.has(role)) {
    return errorState({
      tone: "error",
      message: "Choose whether you are a student or a parent.",
    });
  }
  if (Object.keys(fieldErrors).length > 0) {
    return errorState(undefined, fieldErrors);
  }

  const body = RegisterBody.safeParse({
    name,
    email: email.data,
    password: password.data,
    role,
    acceptedTermsVersion: field(formData, "termsVersion"),
    acceptedPrivacyVersion: field(formData, "privacyVersion"),
  });
  if (!body.success || !body.data.acceptedTermsVersion) {
    return errorState({
      tone: "error",
      message:
        "We could not load the current Terms and Privacy Policy. Reload the page and try again.",
    });
  }

  let tokens;
  try {
    tokens = RegisterResponse.parse(
      await register(body.data, {
        cache: "no-store",
        headers: await visitorHeaders(),
      }),
    );
  } catch (error) {
    return registerError(error);
  }

  try {
    await writeSession(sessionFromTokens(tokens));
  } catch {
    return errorState({
      tone: "info",
      message:
        "Your account is ready, but we could not sign you in automatically. Log in to continue.",
      link: { href: "/login", label: "Log in" },
    });
  }

  const session = sessionFromTokens(tokens);
  const primary = primaryRole(session.roles) ?? "student";
  return finish(
    formData,
    resolveLanding({
      role: primary,
      roles: session.roles,
      onboardingRequired: session.onboardingRequired,
      next: safeNextPath(field(formData, "next")),
    }),
  );
}

function registerError(error: unknown): FormState {
  if (error instanceof ApiError) {
    if (error.status === 409 && error.code === "identity.consent_outdated") {
      return errorState({
        tone: "error",
        message:
          "Our Terms or Privacy Policy changed while you were signing up. Reload the page to see the latest versions, then try again.",
      });
    }
    if (error.status === 409) {
      return errorState({
        tone: "error",
        message: "An account with this email already exists.",
        link: { href: "/login", label: "Log in" },
      });
    }
    if (error.status === 429) {
      return errorState(
        rateLimitBanner(
          error,
          (wait) =>
            `Too many sign-up attempts from this connection. Please wait ${wait} and try again.`,
        ),
      );
    }
    if (error.status === 400) {
      const fields = problemFieldErrors(error);
      const banner: FormBanner | undefined = problemDetail(error)
        ? { tone: "error", message: problemDetail(error)! }
        : fields
          ? undefined
          : { tone: "error", message: "Check your details and try again." };
      return errorState(banner, fields);
    }
  }
  return errorState({
    tone: "error",
    message:
      "We could not create your account. This is on our side, not yours. Your details are still filled in, so try again in a moment.",
  });
}

// Forgot password

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = emailSchema.safeParse(field(formData, "email"));
  if (!email.success) return errorState(undefined, { email: [EMAIL_MESSAGE] });
  try {
    await forgotPassword(
      { email: email.data },
      { cache: "no-store", headers: await visitorHeaders() },
    );
    // The same answer whether or not the account exists.
    return { status: "success", at: Date.now() };
  } catch (error) {
    if (isApiStatus(error, 429)) {
      return errorState(
        rateLimitBanner(
          error,
          (wait) =>
            `Too many reset requests for this email. Please wait ${wait} and try again.`,
        ),
      );
    }
    if (isApiStatus(error, 400)) {
      return errorState(undefined, { email: [EMAIL_MESSAGE] });
    }
    return errorState({
      tone: "error",
      message:
        "We could not send the link just now. This is on our side, not yours. Try again in a moment.",
    });
  }
}

// Reset password

export type ResetState = FormState & { invalidLink?: boolean; detail?: string };

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = field(formData, "token");
  if (!looksLikeOneTimeToken(token)) {
    return { status: "error", invalidLink: true, at: Date.now() };
  }
  const password = newPasswordSchema.safeParse(field(formData, "newPassword"));
  if (!password.success) {
    return errorState(undefined, {
      newPassword: password.error.issues.map((i) => i.message),
    });
  }
  try {
    await resetPassword(
      { token, newPassword: password.data },
      { cache: "no-store", headers: await visitorHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      if (error.code === "identity.token_invalid") {
        return {
          status: "error",
          invalidLink: true,
          detail: problemDetail(error),
          at: Date.now(),
        };
      }
      return errorState(
        problemFieldErrors(error)
          ? undefined
          : {
              tone: "error",
              message: problemDetail(error) ?? "Choose a different password.",
            },
        problemFieldErrors(error),
      );
    }
    if (isApiStatus(error, 429)) {
      return errorState(
        rateLimitBanner(
          error,
          (wait) => `Too many attempts. Please wait ${wait} and try again.`,
        ),
      );
    }
    return errorState({
      tone: "error",
      message:
        "We could not save your new password just now. This is on our side, not yours. Try again in a moment.",
    });
  }
  // The API ended every session for this account, this one included.
  await clearSession();
  return finish(formData, "/login?reason=password-reset");
}

// Verify email

export type VerifyState = FormState & {
  invalidLink?: boolean;
  detail?: string;
};

export async function verifyEmailAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const token = field(formData, "token");
  if (!looksLikeOneTimeToken(token)) {
    return { status: "error", invalidLink: true, at: Date.now() };
  }
  try {
    await verifyEmail(
      { token },
      { cache: "no-store", headers: await visitorHeaders() },
    );
  } catch (error) {
    if (isApiStatus(error, 400)) {
      return {
        status: "error",
        invalidLink: true,
        detail: problemDetail(error),
        at: Date.now(),
      };
    }
    if (isApiStatus(error, 429)) {
      return errorState(
        rateLimitBanner(
          error,
          (wait) => `Too many attempts. Please wait ${wait} and try again.`,
        ),
      );
    }
    return errorState({
      tone: "error",
      message:
        "We could not confirm your email just now. This is on our side, not yours. Try again in a moment.",
    });
  }
  const session = await readSession();
  if (!session) return finish(formData, "/login?reason=email-verified");
  return { status: "success", at: Date.now() };
}

export async function resendVerificationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await readSession();
  try {
    if (session) {
      await withAccessToken((init) =>
        resendVerificationEmail({}, { ...init, cache: "no-store" }),
      );
    } else {
      const email = emailSchema.safeParse(field(formData, "email"));
      if (!email.success) {
        return errorState(undefined, { email: [EMAIL_MESSAGE] });
      }
      await resendVerificationEmail(
        { email: email.data },
        { cache: "no-store", headers: await visitorHeaders() },
      );
    }
    return { status: "success", at: Date.now() };
  } catch (error) {
    if (error instanceof SessionEndedError) {
      redirect("/login?reason=session-expired&next=%2Fverify-email");
    }
    if (isApiStatus(error, 429)) {
      return errorState(
        rateLimitBanner(
          error,
          (wait) => `Too many requests. Please wait ${wait} and try again.`,
        ),
      );
    }
    return errorState({
      tone: "error",
      message:
        "We could not send a new link just now. This is on our side, not yours. Try again in a moment.",
    });
  }
}

// Sign out

export async function signOutAction(): Promise<void> {
  try {
    // Revokes the refresh token at the API; the cookie goes either way.
    await withAccessToken((init) => logout({ ...init, cache: "no-store" }));
  } catch {
    // Already signed out or API unreachable: still clear the cookie.
  }
  await clearSession();
  redirect("/login?reason=signed-out");
}
