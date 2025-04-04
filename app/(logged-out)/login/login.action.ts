"use server";

import { actionClient } from "@/lib/safe-action";
import { loginSchema } from "@/schemas/Login-schema";
import { prisma } from "@/prisma";
import { signIn } from "@/auth";

export const loginUser = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { identifier, password } }) => {
    const email = identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }
    if (user.emailVerified === null) {
      return { error: "Email not verified" };
    }

    await signIn("credentials", {
      email: user.email,
      password: password,
      redirectTo: "/",
    });

    return { success: "User logged in successfully" };
  });
