import { z } from "zod";

export const profileSchema = z
  .object({
    id: z.string(),
    forename: z
      .string()
      .min(2, "Forename must be at least 2 chars.")
      .max(20, "Forename must be less than 20 chars."),
    surname: z
      .string()
      .min(2, "Surname must be at least 2 chars.")
      .max(20, "Surname must be less than 20 chars."),

    email: z.string().email("Invalid email address."),
    mobile: z.string().min(10, "Mobile must be at least 10 chars."),
    avatar: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 chars.")
      .max(100, "Password must be less than 100 chars.")
      .optional()
      .or(z.literal("")),
    confirmNewPassword: z
      .string()
      .min(8, "Password must be at least 8 chars.")
      .max(100, "Password must be less than 100 chars.")
      .optional()
      .or(z.literal("")),
    currentPassword: z
      .string()
      .min(8, "Password must is at least 8 chars.")
      .max(100, "Password is less than 100 chars.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match.",
  })
  .superRefine((data, ctx) => {
    if (
      data.newPassword &&
      (!data.currentPassword || data.currentPassword === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current password is required when updating password.",
        path: ["currentPassword"],
      });
    }
  });
