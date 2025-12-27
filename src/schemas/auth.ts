import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z
    .email({ error: "Invalid email" })
    .min(6, { error: "Email is required" }),
  password: z.string({ error: "Password is required" }).min(8, {
    error: "Password must be at least 8 characters",
  }),
});

export const signupSchema = z.object({
  fullName: z
    .string({ error: "Full name is required" })
    .min(3, { error: "Enter your full name" }),
  email: z
    .email({ error: "Invalid email" })
    .min(3, { error: "Email is required" }),
  password: z
    .string({ error: "Password is required" })
    .min(8, { error: "Password must be at least 8 characters" }),
});

export const otpSchema = z.object({
  code: z
    .string({ error: "Verification code is required" })
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits"),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type OtpForm = z.infer<typeof otpSchema>;
