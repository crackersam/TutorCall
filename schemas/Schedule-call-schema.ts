import { z } from "zod";

export const ScheduleCallSchema = z.object({
  tutorId: z.string(),
  studentId: z.string(),
  description: z.string().nonempty("Description is required"),
  date: z.date({ required_error: "Date is required" }),
});
