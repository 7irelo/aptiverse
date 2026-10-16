import { z } from "zod";

const password = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Needs at least one uppercase letter")
  .regex(/[0-9]/, "Needs at least one number");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerStep2Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password,
  // Acceptance of the Terms and the Privacy Policy. Starts false and the
  // user has to tick it themselves: a pre-ticked box is not consent. This
  // validation is for a clear inline error only. The API rejects a
  // registration without acceptance regardless of what the form does.
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: "Please accept the Terms and Privacy Policy to continue",
  }),
});
export type RegisterValues = z.infer<typeof registerStep2Schema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password,
    confirm: z.string(),
    // userId + token come from the reset-link query string, populated
    // by the page before validation runs. Required by the API's
    // ResetPasswordDto(UserId, ResetToken, NewPassword) shape.
    userId: z.string().min(1, "Missing reset token — request a new link"),
    token: z.string().min(1, "Missing reset token — request a new link"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  organisation: z.string().optional(),
  reason: z.string().min(1),
  message: z.string().min(10, "Tell us a little more (10+ chars)"),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const schoolEnquirySchema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  contactName: z.string().min(2, "Your full name is required"),
  contactRole: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  curricula: z.array(z.string()).optional(),
  learnerCount: z.string().optional(),
  stage: z.string().optional(),
  notes: z.string().optional(),
});
export type SchoolEnquiryValues = z.infer<typeof schoolEnquirySchema>;
