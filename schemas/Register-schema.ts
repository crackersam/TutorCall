import { z } from "zod";

export const registerSchema = z
  .object({
    forename: z
      .string()
      .min(2, "Forename must be4 at least 2 chars.")
      .max(20, "Forename must be less than 20 chars."),
    surname: z
      .string()
      .min(2, "Surname must be at least 2 chars.")
      .max(20, "Surname must be less than 20 chars."),

    email: z.string().email("Invalid email address."),
    mobile: z.string().min(10, "Mobile must be at least 10 chars."),
    password: z
      .string()
      .min(8, "Password must be at least 8 chars.")
      .max(100, "Password must be less than 100 chars."),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 chars.")
      .max(100, "Password must be less than 100 chars."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
