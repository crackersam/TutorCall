import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string(),
  password: z
    .string()
    .min(8, "Password is at least 8 chars.")
    .max(100, "Password is less than 100 chars."),
});
