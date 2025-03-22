import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials: any) => {
        const prisma = new PrismaClient().$extends(withAccelerate());
        let user = null;

        // logic to salt and hash password
        const salt = bcrypt.genSaltSync(10);

        const pwHash = bcrypt.hashSync(credentials.password, salt);

        // logic to verify if the user exists
        user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            password: pwHash,
          },
        });

        if (!user) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.");
        }

        // return user object with their profile data
        return user;
      },
    }),
  ],
});
