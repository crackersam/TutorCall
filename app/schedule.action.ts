"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { sendSMS } from "@/lib/sms";
import { prisma } from "@/prisma";
import { ScheduleCallSchema } from "@/schemas/Schedule-call-schema";
import { revalidatePath } from "next/cache";

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
            studentId: student.id,
            instructorId: tutorId,
            description,
            date,
          },
        });
        await prisma.callRequest.deleteMany({
          where: {
            studentId: student.id,
            instructorId: tutorId,
          },
        });
        await sendSMS(
          student.mobile,
          "Tutacall",
          `Call scheduled with ${tutor.forename} ${tutor.surname}.`
        );
        revalidatePath("/");
        return { success: "Call scheduled successfully" };
      } catch (error) {
        console.log(error);
        return { error: "Error scheduling call" };
      }
    }
  );
