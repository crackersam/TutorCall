import { prisma } from "@/prisma";
import React from "react";

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  let success;
  let error;

  const { token } = await searchParams;
  try {
    const verificationToken = await prisma.emailToken.findFirst({
      where: {
        token,
      },
    });
    if (!verificationToken || verificationToken.expires < new Date()) {
      error = "Invalid token";
    } else {
      await prisma.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerified: new Date(),
        },
      });
      await prisma.emailToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });
      success = "Email verified";
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Verify Email</h1>
      </div>
      <div className="flex flex-wrap">
        {success && (
          <div className="flex flex-col justify-center mx-auto">
            <span className="text-green-500 mx-auto">{success}.</span> You can
            now login.
          </div>
        )}
        {error && <div className="text-red-500 mx-auto">{error}.</div>}
      </div>
    </div>
  );
};

export default VerifyEmail;
