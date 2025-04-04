import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import authConfig from "@/auth.config";

type ExtendedSession = DefaultSession["user"] & {
  id: string;
  forename: string;
  surname: string;
  email: string;
  mobile: string;
  mobileVerified: Date | null;
  role: string;
  todaysAppointments: number;
};
declare module "next-auth" {
  interface Session {
    user: ExtendedSession;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (!token.sub) return token;
      const user = await prisma.user.findUnique({
        where: {
          id: token.sub,
        },
      });
      const twentyFourHours = new Date();
      twentyFourHours.setHours(twentyFourHours.getHours() + 24);
      const calls = await prisma.call.findMany({
        where: {
          OR: [
            {
              instructorId: token.sub,
            },
            {
              studentId: token.sub,
            },
          ],
          date: {
            gte: new Date(),
            lte: twentyFourHours,
          },
        },
      });
      if (!user) return token;
      token.todaysAppointments = calls.length;
      token.sub = user.id;
      token.forename = user.forename;
      token.surname = user.surname;
      token.email = user.email;
      token.mobile = user.mobile;
      token.mobileVerified = user.mobileVerified;
      token.image = user.image;
      token.role = user.role;
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.user.todaysAppointments = token.todaysAppointments as number;
      session.user.id = token.sub as string;
      session.user.forename = token.forename as string;
      session.user.surname = token.surname as string;
      session.user.email = token.email as string;
      session.user.mobile = token.mobile as string;
      session.user.mobileVerified = token.mobileVerified as Date | null;
      session.user.image = token.image as string;
      session.user.role = token.role as string;

      return session;
    },
  },
  ...authConfig,
});
