"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { registerSchema } from "@/schemas/Register-schema";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";

export const registerUser = actionClient
  .schema(registerSchema)
  .action(
    async ({
      parsedInput: {
        forename,
        surname,
        email,
        mobile,
        password,
        confirmPassword,
        role,
      },
    }) => {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email,
            },
            {
              mobile,
            },
          ],
        },
      });

      if (existingUser) {
        return { error: "User already exists" };
      }
      const salt = bcrypt.genSaltSync(10);
      const pwHash = bcrypt.hashSync(password, salt);

      await prisma.user.create({
        data: {
          forename,
          surname,
          email,
          mobile,
          role,
          password: pwHash,
        },
      });

      return { success: "User created successfully" };
    }
  );
