"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { profileSchema } from "@/schemas/Profile-schema";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";

export const updateProfile = actionClient
  .schema(profileSchema)
  .action(
    async ({
      parsedInput: {
        id,
        forename,
        surname,
        email,
        mobile,
        avatar,
        role,
        biography,
        subject,
        newPassword,
        confirmNewPassword,
        currentPassword,
      },
    }) => {
      if (newPassword && newPassword !== confirmNewPassword) {
        throw new Error("Passwords do not match.");
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          id,
        },
      });

      if (!existingUser) {
        return { error: "User not found" };
      }

      let pwHash: string | undefined;

      if (currentPassword) {
        const valid = bcrypt.compareSync(
          currentPassword,
          existingUser.password!
        );
        if (!valid) {
          return { error: "Invalid current password" };
        }
      }

      if (newPassword) {
        if (currentPassword === "" || currentPassword === undefined) {
          return {
            error: "Current password is required when updating password.",
          };
        }
        const valid = bcrypt.compareSync(
          currentPassword,
          existingUser.password!
        );
        if (!valid) {
          return { error: "Invalid current password" };
        }

        const salt = bcrypt.genSaltSync(10);
        pwHash = bcrypt.hashSync(newPassword, salt);
      }

      await prisma.user.update({
        where: {
          id,
        },
        data: {
          forename,
          surname,
          email,
          mobile,
          image: avatar,
          password: newPassword ? pwHash : existingUser.password,
        },
      });
      if (email !== existingUser.email) {
        await prisma.user.update({
          where: {
            id,
          },
          data: {
            emailVerified: null,
          },
        });
        const expires = new Date();
        expires.setHours(expires.getHours() + 6);
        const token = crypto.randomBytes(32).toString("hex");

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
        await sendEmail(
          email,
          "verification@tutacall.com",
          "Verify your email",
          `Visit ${process.env.BASE_URL}/verify-email?token=${token} to verify your email address.`,
          `<a href="${process.env.BASE_URL}/verify-email?token=${token}">Verify your email</a>`
        );
      }
      if (mobile !== existingUser.mobile) {
        await prisma.user.update({
          where: {
            id,
          },
          data: {
            mobileVerified: null,
          },
        });
        const mobileToken = (
          Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
        ).toString();
        const mobileExpires = new Date();
        mobileExpires.setHours(mobileExpires.getHours() + 6);

        await prisma.mobileToken.create({
          data: {
            token: mobileToken,
            expires: mobileExpires,
            user: {
              connect: {
                mobile,
              },
            },
          },
        });
        await sendSMS(
          mobile,
          "Tutacall",
          `Your verification code is: ${mobileToken}. Login and use it within 6 hours.`
        );
      }
      if (role !== existingUser.role) {
        await prisma.user.update({
          where: {
            id,
          },
          data: {
            role,
          },
        });
      }
      if (biography !== existingUser.biography) {
        await prisma.user.update({
          where: {
            id,
          },
          data: {
            biography,
          },
        });
      }
      if (subject !== existingUser.subject) {
        await prisma.user.update({
          where: {
            id,
          },
          data: {
            subject,
          },
        });
      }
      revalidatePath("/profile");
      console.log("profile updated");
      return { success: "Profile updated successfully" };
    }
  );
