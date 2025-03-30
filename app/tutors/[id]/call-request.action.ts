"use server";

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma";
import { callRequestSchema } from "@/schemas/Call-request-schema";

export const callRequest = actionClient
  .schema(callRequestSchema)
  .action(
    async ({
      parsedInput: { studentId, tutorId, details, date1, date2, date3 },
    }) => {
      try {
        const tutor = await prisma.user.findUnique({
          where: {
            id: tutorId,
          },
        });
        if (!tutor) {
          throw new Error("Tutor not found.");
        }
        const student = await prisma.user.findUnique({
          where: {
            id: studentId,
          },
        });
        if (!student) {
          throw new Error("Student not found. Are you logged in?");
        }
        await prisma.callRequest.create({
          data: {
            userId: student.id,
            instructorId: tutorId,
            details,
            date1,
            date2,
            date3,
          },
        });
        return { success: "Call request sent successfully" };
      } catch (error) {
        console.log(error);
        return {
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        };
      }
    }
  );
