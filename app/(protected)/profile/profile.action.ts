"use server"; // don't forget to add this!

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { profileSchema } from "@/schemas/Profile-schema";
import { revalidatePath } from "next/cache";

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
        newPassword,
        confirmNewPassword,
        currentPassword,
      },
    }) => {
      if (newPassword && newPassword !== confirmNewPassword) {
        throw new Error("Passwords do not match.");
      }

      const existingUser: any = await prisma.user.findFirst({
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
          existingUser.password
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
          existingUser.password
        );
        if (!valid) {
          return { error: "Invalid current password" };
        }

        const salt = bcrypt.genSaltSync(10);
        pwHash = bcrypt.hashSync(newPassword, salt);
      }
      console.log(currentPassword);
      const user = await prisma.user.update({
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
      revalidatePath("/profile");

      return { success: "Profile updated successfully" };
    }
  );
