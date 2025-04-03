"use server";

import { prisma } from "@/prisma";

export const headerAction = async (id: string) => {
  try {
    const twentyFourHours = new Date();
    twentyFourHours.setHours(twentyFourHours.getHours() + 24);
    const calls = await prisma.call.findMany({
      where: {
        OR: [
          {
            instructorId: id,
          },
          {
            studentId: id,
          },
        ],
        date: {
          gte: new Date(),
          lte: twentyFourHours,
        },
      },
    });
    return calls.length;
  } catch (error) {
    console.error(error);
    return 0;
  }
};
