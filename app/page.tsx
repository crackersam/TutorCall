import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import Image from "next/image";
import Link from "next/link";

const Dashboard = async () => {
  const session = await auth();
  const tutors = await prisma.user.findMany({
    where: {
      role: "INSTRUCTOR",
    },
  });

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">
          Welcome to Tutor Call
        </h1>
      </div>
      <div className="flex gap-4 justify-center">
        {tutors.map((tutor) => (
          <Link href={`/tutors/${tutor.id}`} key={tutor.id}>
            <div
              key={tutor.id}
              className="flex items-center flex-col gap-2 bg-amber-200 dark:bg-black dark:border-white border border-gray-200 rounded-lg p-4"
            >
              {tutor.image && (
                <Image
                  src={tutor.image!}
                  width={100}
                  height={100}
                  alt={tutor.forename}
                  className="rounded-full border border-black dark:border-white"
                  priority
                />
              )}

              <div className="">
                {tutor.forename[0].toUpperCase() + tutor.forename.slice(1)}{" "}
                {tutor.surname[0].toUpperCase() + tutor.surname.slice(1)}
              </div>
              <div className="">Math</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
