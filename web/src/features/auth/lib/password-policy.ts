import { z } from "zod";

/**
 * The API's password policy (PasswordPolicy.cs: 10 to 128 characters, no
 * composition rules). The OpenAPI spec does not emit minLength or maxLength
 * yet, so the generated zod schema has no bounds; these constants mirror the
 * API until it does (open item, PG-AUTH-REG question 6).
 */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordHint = `Use at least ${PASSWORD_MIN_LENGTH} characters. A short phrase you will remember works well.`;

/** A new password, as the API accepts it. Spaces are kept as typed. */
export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`);

export const EMAIL_MESSAGE =
  "Enter a valid email address, like name@example.com.";

export const emailSchema = z
  .string()
  .trim()
  .min(1, EMAIL_MESSAGE)
  .max(256, EMAIL_MESSAGE)
  .pipe(z.email(EMAIL_MESSAGE));
