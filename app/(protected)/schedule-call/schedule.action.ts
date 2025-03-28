"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma";
import { ScheduleCallSchema } from "@/schemas/Schedule-call-schema";

export const scheduleCall = actionClient
  .schema(ScheduleCallSchema)
  .action(async ({ parsedInput: { id, email, date } }) => {
    try {
      const callee = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!callee) {
        return { error: "User not found" };
      }
      await prisma.call.create({
        data: {
          userId: callee.id,
          instructorId: id,
          date,
        },
      });
      return { success: "Call scheduled successfully" };
    } catch (error) {
      console.log(error);
      return { error: "Error scheduling call" };
    }
  });
