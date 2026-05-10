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
  school: z.string().optional(),
  grade: z.string().optional(),
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
