import { z } from "zod";

export const callRequestSchema = z.object({
  studentId: z.string(),
  tutorId: z.string(),
  details: z.string().nonempty(),
  date1: z.date(),
  date2: z.date(),
  date3: z.date(),
});
