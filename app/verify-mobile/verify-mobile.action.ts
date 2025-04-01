"use server";

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma";
import { MobileVerificationSchema } from "@/schemas/Mobile-verification-schema";
import { z } from "zod";

export const verifyMobile = actionClient
  .schema(MobileVerificationSchema)
  .action(async ({ parsedInput: { pin } }) => {
    try {
      const verificationToken = await prisma.mobileToken.findFirst({
        where: {
          token: pin,
        },
      });
      if (!verificationToken || verificationToken.expires < new Date()) {
        throw new Error("Invalid token");
      } else {
        await prisma.user.update({
          where: {
            id: verificationToken.userId,
          },
          data: {
            mobileVerified: new Date(),
          },
        });
        await prisma.mobileToken.delete({
          where: {
            identifier_token: {
              identifier: verificationToken.identifier,
              token: verificationToken.token,
            },
          },
        });
        return { success: "Mobile verified" };
      }
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  });
