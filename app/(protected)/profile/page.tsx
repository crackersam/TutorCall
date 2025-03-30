import React from "react";
import ProfileForm from "./profile-form";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

const Profile = async () => {
  const session = await auth();
  const user = session
    ? await prisma.user.findFirst({
        where: {
          id: session.user.id,
        },
      })
    : null;
  if (!user) {
    return <div>User not found</div>;
  } else {
    return (
      <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
        <div className="flex justify-center">
          <h1 className="text-xl justify-center underline mb-3">Profile</h1>
        </div>
        <div className="flex gap-2 justify-evenly flex-wrap-reverse">
          <ProfileForm
            id={user.id}
            forename={user.forename}
            surname={user.surname}
            email={user.email}
            emailVerified={user.emailVerified ?? undefined}
            image={user.image ?? undefined}
            password={user.password ?? undefined}
            mobile={user.mobile}
            mobileVerified={user.mobileVerified ?? undefined}
            role={user.role}
            createdAt={user.createdAt}
            updatedAt={user.updatedAt}
          />
        </div>
      </div>
    );
  }
};

export default Profile;
