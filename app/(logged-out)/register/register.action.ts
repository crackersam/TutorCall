"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { registerSchema } from "@/schemas/Register-schema";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { mailer } from "@/lib/mailer";

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
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      const token = crypto.randomBytes(32).toString("hex");

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

      await prisma.emailToken.create({
        data: {
          token,
          expires,
          user: {
            connect: {
              email,
            },
          },
        },
      });

      mailer.sendMail({
        to: email,
        from: "test@resend.dev",
        subject: "Verify your email",
        html: `<a href="${process.env.BASE_URL}/verify-email?token=${token}">Verify your email</a>`,
      });

      return { success: "Verification Email and SMS sent!" };
    }
  );
