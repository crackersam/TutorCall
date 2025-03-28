import { z } from "zod";

export const ScheduleCallSchema = z.object({
  id: z.string(),
  email: z.string().nonempty("User email is required."),
  date: z.date(),
});
