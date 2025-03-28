import React from "react";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import Image from "next/image";

const AddEvent = async ({ params }: { params: { id: string } }) => {
  const session = await auth();
  const tutor = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
  });
  if (!tutor) {
    return <div>Tutor not found</div>;
  }

  return (
    <div className="container bg-white dark:bg-black dark:border-white border border-black mx-auto rounded-lg p-4">
      <div className="flex justify-center">
        <h1 className="text-xl justify-center underline mb-3">Tutor details</h1>
      </div>
      <div className="flex gap-2 justify-center">
        {tutor && (
          <Image
            src={tutor.image!}
            width={50}
            height={50}
            alt={tutor.forename}
            className="rounded-full border border-black dark:border-white"
            priority
          />
        )}
        <div className="">
          Name: {tutor.forename} {tutor.surname}
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
