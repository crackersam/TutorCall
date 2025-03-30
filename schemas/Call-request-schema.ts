import { z } from "zod";

export const callRequestSchema = z.object({
  studentId: z.string(),
  tutorId: z.string(),
  details: z.string().nonempty("Details must not be empty."),
  date1: z.date({ message: "Date 1 must be a valid date." }),
  date2: z.date({ message: "Date 2 must be a valid date." }),
  date3: z.date({ message: "Date 3 must be a valid date." }),
});
