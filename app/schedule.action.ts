"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma";
import { ScheduleCallSchema } from "@/schemas/Schedule-call-schema";

export const scheduleCall = actionClient
  .schema(ScheduleCallSchema)
  .action(
    async ({ parsedInput: { tutorId, studentId, description, date } }) => {
      try {
        const tutor = await prisma.user.findUnique({
          where: {
            id: tutorId,
          },
        });
        if (!tutor) {
          return { error: "Tutor not found. Are you logged in?" };
        }
        const student = await prisma.user.findUnique({
          where: {
            id: studentId,
          },
        });
        if (!student) {
          return { error: "Student not found" };
        }
        await prisma.call.create({
          data: {
            userId: student.id,
            instructorId: tutorId,
            description,
            date,
          },
        });
        return { success: "Call scheduled successfully" };
      } catch (error) {
        console.log(error);
        return { error: "Error scheduling call" };
      }
    }
  );
